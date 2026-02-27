"""
ai_layer.py – AI reasoning and report-generation layer.

Turns structured financial JSON (from financial_engine / optimizer)
into executive-level insights and board-ready reports via IBM Granite.

This module NEVER computes metrics, re-calculates runway, guesses
missing data, or parses CSV.  It only:
  1. Accepts structured JSON.
  2. Sends it to IBM Granite.
  3. Returns formatted text.
"""

import json
import os
from typing import Any

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv is optional

# ── IBM watsonx.ai configuration ─────────────────────────────────────
WATSONX_URL = os.getenv(
    "WATSONX_URL",
    "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29",
)
WATSONX_API_KEY = os.getenv("WATSONX_API_KEY", "")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
GRANITE_MODEL_ID = os.getenv("GRANITE_MODEL_ID", "ibm/granite-3-8b-instruct")

# ── Token cache (simple) ─────────────────────────────────────────────
_cached_token: str | None = None


def _get_iam_token() -> str:
    """Exchange an IBM Cloud API key for a short-lived IAM bearer token."""
    global _cached_token
    if _cached_token:
        return _cached_token

    resp = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": WATSONX_API_KEY,
        },
        timeout=30,
    )
    resp.raise_for_status()
    _cached_token = resp.json()["access_token"]
    return _cached_token


def _call_granite(prompt: str, max_tokens: int = 1500) -> str:
    """
    Send a prompt to IBM Granite via watsonx.ai and return the generated text.

    Raises
    ------
    RuntimeError  if the API call fails or returns an unexpected shape.
    """
    token = _get_iam_token()

    payload = {
        "model_id": GRANITE_MODEL_ID,
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": max_tokens,
            "temperature": 0.2,
            "repetition_penalty": 1.05,
        },
        "project_id": WATSONX_PROJECT_ID,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    resp = requests.post(WATSONX_URL, headers=headers, json=payload, timeout=60)

    # If token expired, refresh once and retry
    if resp.status_code == 401:
        global _cached_token
        _cached_token = None
        token = _get_iam_token()
        headers["Authorization"] = f"Bearer {token}"
        resp = requests.post(WATSONX_URL, headers=headers, json=payload, timeout=60)

    resp.raise_for_status()

    body = resp.json()
    try:
        return body["results"][0]["generated_text"].strip()
    except (KeyError, IndexError) as exc:
        raise RuntimeError(f"Unexpected Granite response: {body}") from exc


# ── Public helpers ────────────────────────────────────────────────────

def _fmt_currency(val: float) -> str:
    """Format a number as $X,XXX."""
    return f"${val:,.0f}"


def _top_expense(expenses: list[dict]) -> str:
    """Return the name of the highest-spend category."""
    if not expenses:
        return "N/A"
    top = max(expenses, key=lambda e: e.get("amount", 0))
    return top.get("category", "Unknown")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  generate_insights
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_insights(metrics: dict[str, Any]) -> str:
    """
    Turn computed financial metrics into a short CFO-style summary.

    Parameters
    ----------
    metrics : dict
        Structured JSON from ``financial_engine.compute_metrics``.
        Expected keys: cash_balance, monthly_burn, runway_months,
        expenses, top_cost_drivers.

    Returns
    -------
    str  – A concise bullet-point summary referencing exact numbers.
    """
    prompt = f"""You are a seasoned Chief Financial Officer.
Given the following financial metrics (JSON), produce a SHORT bullet-point
summary (4-6 bullets). Reference the EXACT numbers provided — do NOT
invent or recalculate any figures. Be concise and professional.

Metrics:
{json.dumps(metrics, indent=2)}

Guidelines:
- Start each bullet with "- "
- Mention the burn rate, runway, and top expense categories by name and amount.
- If runway is null, state that the company is cash-flow positive.
- End with a single-sentence takeaway.

Summary:"""

    return _call_granite(prompt, max_tokens=600)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  generate_board_report
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_board_report(
    metrics: dict[str, Any],
    optimization: dict[str, Any],
) -> str:
    """
    Generate a full executive board memo from financial metrics and an
    optimization plan.

    Parameters
    ----------
    metrics : dict
        Output of ``financial_engine.compute_metrics``.
    optimization : dict
        Output of ``optimizer.optimize``.

    Returns
    -------
    str  – A structured, multi-section executive report.
    """
    prompt = f"""You are a seasoned Chief Financial Officer preparing a board report.
Using ONLY the data below, write a structured executive memo. Do NOT
invent, estimate, or recalculate any numbers — use the exact figures
provided.

=== FINANCIAL METRICS ===
{json.dumps(metrics, indent=2)}

=== OPTIMIZATION PLAN ===
{json.dumps(optimization, indent=2)}

Format the report with these EXACT section headers (use markdown ##):

## Executive Summary
A 2-3 sentence high-level overview of financial position and recommended
action.

## Current Financial Position
- Cash on hand, monthly burn rate, current runway.
- Top expense categories with amounts and percentages.

## Optimization Plan
- Summarise every action from the plan array with its estimated monthly
  savings.
- State the new projected burn rate and extended runway.

## Risks & Tradeoffs
- Identify 2-3 realistic risks of the proposed cuts (e.g., talent
  retention, service degradation).
- Keep it grounded — do not fabricate scenarios.

## Final Recommendation
A concise 2-3 sentence recommendation for the board.

Rules:
- Professional, CFO-level tone.
- Reference exact dollar amounts and percentages from the data.
- Do NOT hallucinate numbers.
- Keep total length under 500 words.

Report:"""

    return _call_granite(prompt, max_tokens=1500)
