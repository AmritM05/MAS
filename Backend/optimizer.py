"""
optimizer.py – Greedy runway-extension heuristic.
"""

from typing import Any

import pandas as pd

from financial_engine import compute_metrics


def _compute_burn(df: pd.DataFrame) -> float:
    """Return average monthly net burn from a DataFrame."""
    months = df["month"].unique()
    n_months = len(months)
    if n_months == 0:
        return 0.0
    total_expense = float(df[df["amount"] < 0]["amount"].abs().sum())
    total_revenue = float(df[df["amount"] > 0]["amount"].sum())
    return (total_expense - total_revenue) / n_months


def _runway(cash: float, burn: float) -> float | None:
    if burn <= 0:
        return None  # infinite
    return round(cash / burn, 2)


def optimize(
    df: pd.DataFrame,
    cash_balance: float,
    extend_by_months: float,
) -> dict[str, Any]:
    """
    Build a greedy cost-cutting plan to extend runway by *extend_by_months*.

    Returns the optimisation response dict.
    """
    burn_before = _compute_burn(df)
    current_runway = _runway(cash_balance, burn_before)

    # ── Edge: already infinite runway ─────────────────────────────────
    if current_runway is None:
        return {
            "current_runway": None,
            "target_runway": None,
            "new_runway": None,
            "monthly_burn_before": round(burn_before, 2),
            "monthly_burn_after": round(burn_before, 2),
            "plan": [],
            "note": "Net burn is already <= 0; runway is effectively infinite.",
        }

    target_runway = round(current_runway + extend_by_months, 2)

    # Work on a copy so original df is untouched
    work_df = df.copy()
    work_df["amount"] = work_df["amount"].astype(float)
    n_months = len(work_df["month"].unique())

    # ── Rank categories by total spend (desc) ─────────────────────────
    expenses = work_df[work_df["amount"] < 0]
    cat_spend = (
        expenses.groupby("category")["amount"]
        .apply(lambda s: s.abs().sum())
        .sort_values(ascending=False)
    )

    plan: list[dict[str, Any]] = []
    CUT_LEVELS = [0.10, 0.20, 0.30]

    for category in cat_spend.index:
        for cut_pct in CUT_LEVELS:
            # Apply the cut to this category
            mask = (work_df["category"] == category) & (work_df["amount"] < 0)
            avg_monthly_expense = float(
                work_df.loc[mask, "amount"].abs().sum()
            ) / max(n_months, 1)
            monthly_savings_est = round(avg_monthly_expense * cut_pct, 2)

            work_df.loc[mask, "amount"] = work_df.loc[mask, "amount"] * (1 - cut_pct)

            new_burn = _compute_burn(work_df)
            new_rwy = _runway(cash_balance, new_burn)

            plan.append(
                {
                    "action": f"Cut {category} by {int(cut_pct*100)}%",
                    "category": category,
                    "cut_pct": cut_pct,
                    "monthly_savings_est": monthly_savings_est,
                }
            )

            # Check stop conditions
            if new_rwy is None:
                # burn went to zero or negative → infinite runway
                return {
                    "current_runway": current_runway,
                    "target_runway": target_runway,
                    "new_runway": None,
                    "monthly_burn_before": round(burn_before, 2),
                    "monthly_burn_after": round(new_burn, 2),
                    "plan": plan,
                    "note": "Runway is now effectively infinite.",
                }

            if new_rwy >= target_runway:
                return {
                    "current_runway": current_runway,
                    "target_runway": target_runway,
                    "new_runway": new_rwy,
                    "monthly_burn_before": round(burn_before, 2),
                    "monthly_burn_after": round(new_burn, 2),
                    "plan": plan,
                }

            # Otherwise, move on (try next cut level for same category,
            # then next category)

    # ── Special demo-friendly fallback actions ────────────────────────
    special_actions = [
        {
            "action": "Delay 1 hire",
            "category": None,
            "cut_pct": None,
            "monthly_savings_est": 8000,
        },
        {
            "action": "Renegotiate cloud contract",
            "category": None,
            "cut_pct": None,
            "monthly_savings_est": 1500,
        },
    ]

    new_burn = _compute_burn(work_df)
    for sa in special_actions:
        new_burn -= sa["monthly_savings_est"]
        plan.append(sa)
        new_rwy = _runway(cash_balance, new_burn)

        if new_rwy is None or new_rwy >= target_runway:
            return {
                "current_runway": current_runway,
                "target_runway": target_runway,
                "new_runway": new_rwy,
                "monthly_burn_before": round(burn_before, 2),
                "monthly_burn_after": round(new_burn, 2),
                "plan": plan,
            }

    # Best effort – couldn't fully reach target
    new_rwy = _runway(cash_balance, new_burn)
    return {
        "current_runway": current_runway,
        "target_runway": target_runway,
        "new_runway": new_rwy,
        "monthly_burn_before": round(burn_before, 2),
        "monthly_burn_after": round(new_burn, 2),
        "plan": plan,
        "note": "Could not fully reach target runway. This is the best-effort plan.",
    }
