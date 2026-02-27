"""
financial_engine.py – Burn rate, runway, and expense breakdown calculations.
"""

from typing import Any

import pandas as pd


def compute_metrics(df: pd.DataFrame, cash_balance: float) -> dict[str, Any]:
    """
    Compute financial metrics from the normalised DataFrame.

    Parameters
    ----------
    df : pd.DataFrame   (must contain: amount, category, month)
    cash_balance : float (current cash on hand)

    Returns
    -------
    dict matching the /metrics response schema.
    """
    # ── Monthly aggregation ───────────────────────────────────────────
    months_observed: list[str] = sorted(df["month"].unique().tolist())

    monthly = df.groupby("month")["amount"].apply(
        lambda s: pd.Series(
            {
                "expense": s[s < 0].abs().sum(),
                "revenue": s[s > 0].sum(),
            }
        )
    ).unstack()

    monthly["net_burn"] = monthly["expense"] - monthly["revenue"]

    monthly_burn: float = float(monthly["net_burn"].mean())

    # ── Runway ────────────────────────────────────────────────────────
    if monthly_burn <= 0:
        runway_months = None  # infinite / uncapped
    else:
        runway_months = round(cash_balance / monthly_burn, 2)

    # ── Expense breakdown ─────────────────────────────────────────────
    expenses_df = df[df["amount"] < 0].copy()
    expenses_df["abs_amount"] = expenses_df["amount"].abs()

    cat_totals = (
        expenses_df.groupby("category")["abs_amount"]
        .sum()
        .sort_values(ascending=False)
    )
    total_expense = float(cat_totals.sum())

    expense_list: list[dict] = []
    for cat, amt in cat_totals.items():
        expense_list.append(
            {
                "category": str(cat),
                "amount": round(float(amt), 2),
                "pct": round(float(amt) / total_expense * 100, 2) if total_expense else 0.0,
            }
        )

    top_cost_drivers = expense_list[:3]

    return {
        "cash_balance": cash_balance,
        "monthly_burn": round(monthly_burn, 2),
        "runway_months": runway_months,
        "expenses": expense_list,
        "top_cost_drivers": top_cost_drivers,
        "months_observed": months_observed,
    }
