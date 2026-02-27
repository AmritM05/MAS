"""
anomaly_detector.py – Detects unusual spending spikes using z-score analysis.
"""

from typing import Any
import pandas as pd
import numpy as np


def detect_anomalies(df: pd.DataFrame, threshold: float = 1.5) -> dict[str, Any]:
    """
    Detect anomalous spending by category using z-score on monthly totals.

    Returns a dict with alerts and per-category analysis.
    """
    expenses = df[df["amount"] < 0].copy()
    expenses["abs_amount"] = expenses["amount"].abs()

    alerts: list[dict] = []
    category_analysis: list[dict] = []

    for cat in expenses["category"].unique():
        cat_data = expenses[expenses["category"] == cat]
        monthly = cat_data.groupby("month")["abs_amount"].sum().sort_index()

        if len(monthly) < 2:
            continue

        mean_val = float(monthly.mean())
        std_val = float(monthly.std())
        latest_month = monthly.index[-1]
        latest_val = float(monthly.iloc[-1])

        # z-score for the latest month
        z = (latest_val - mean_val) / std_val if std_val > 0 else 0

        cat_info = {
            "category": str(cat),
            "monthly_avg": round(mean_val, 2),
            "latest_month": str(latest_month),
            "latest_amount": round(latest_val, 2),
            "std_dev": round(std_val, 2),
            "z_score": round(z, 2),
            "is_anomaly": abs(z) > threshold,
        }
        category_analysis.append(cat_info)

        if abs(z) > threshold:
            pct_change = ((latest_val - mean_val) / mean_val * 100) if mean_val > 0 else 0
            direction = "increase" if z > 0 else "decrease"
            alerts.append({
                "category": str(cat),
                "severity": "high" if abs(z) > 2.5 else "medium",
                "message": f"{cat} spending {direction} detected: ${latest_val:,.0f} vs avg ${mean_val:,.0f} ({pct_change:+.0f}%)",
                "normal_avg": round(mean_val, 2),
                "current": round(latest_val, 2),
                "pct_change": round(pct_change, 1),
                "z_score": round(z, 2),
            })

    # Sort alerts by severity (high first) then z-score
    alerts.sort(key=lambda a: (0 if a["severity"] == "high" else 1, -abs(a["z_score"])))

    return {
        "alerts": alerts,
        "categories_analyzed": len(category_analysis),
        "anomalies_found": len(alerts),
        "category_analysis": category_analysis,
    }
