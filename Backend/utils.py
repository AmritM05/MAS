"""
utils.py – CSV parsing, validation, and normalization helpers.
"""

from io import StringIO
from typing import Tuple

import pandas as pd

# ── Category alias map ────────────────────────────────────────────────
CATEGORY_MAP: dict[str, str] = {
    "payroll": "Payroll",
    "salary": "Payroll",
    "salaries": "Payroll",
    "saas": "SaaS",
    "software": "SaaS",
    "cloud": "Cloud",
    "hosting": "Cloud",
    "ads": "Marketing",
    "marketing": "Marketing",
    "rent": "Rent",
    "office": "Rent",
}

REQUIRED_COLUMNS = {"date", "amount", "category"}


def _normalize_category(raw: str | None) -> str:
    """Map a raw category string to its canonical form."""
    if not raw or str(raw).strip() == "":
        return "Other"
    cleaned = str(raw).strip().lower()
    return CATEGORY_MAP.get(cleaned, str(raw).strip().title())


def parse_and_validate_csv(raw_bytes: bytes) -> Tuple[pd.DataFrame, dict]:
    """
    Parse uploaded CSV bytes into a normalised DataFrame.

    Returns
    -------
    df : pd.DataFrame
        Normalised data with columns: date, amount, category, month
    summary : dict
        {"rows": int, "months_detected": int, "categories_detected": int}

    Raises
    ------
    ValueError  with a human-readable message on bad input.
    """
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise ValueError("File is not valid UTF-8 text.")

    try:
        df = pd.read_csv(StringIO(text))
    except Exception as exc:
        raise ValueError(f"Could not parse CSV: {exc}")

    # ─── Lowercase headers for case-insensitive matching ──────────────
    df.columns = [c.strip().lower() for c in df.columns]

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")

    # ─── Date parsing ─────────────────────────────────────────────────
    try:
        df["date"] = pd.to_datetime(df["date"])
    except Exception:
        raise ValueError("Column 'date' contains unparseable values.")

    # ─── Amount parsing ───────────────────────────────────────────────
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    if df["amount"].isna().any():
        raise ValueError("Column 'amount' contains non-numeric values.")

    # ─── Category normalisation ───────────────────────────────────────
    df["category"] = df["category"].apply(_normalize_category)

    # ─── Derived: month column (YYYY-MM) ──────────────────────────────
    df["month"] = df["date"].dt.to_period("M").astype(str)

    summary = {
        "rows": len(df),
        "months_detected": df["month"].nunique(),
        "categories_detected": df["category"].nunique(),
    }

    return df, summary
