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
- Mention the burn rate ("burn"), runway, and top expense categories by name and amount.
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
- Top expense categories with amounts.

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


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ask_cfo_question
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def ask_cfo_question(question: str, metrics: dict[str, Any]) -> str:
    """
    Answer a user's financial question as if you were their CFO.

    Parameters
    ----------
    question : str
        The user's question (e.g. "Can we hire two engineers next month?")
    metrics : dict
        Structured JSON from ``financial_engine.compute_metrics``.

    Returns
    -------
    str  – A concise, professional CFO-style answer.
    """
    prompt = f"""You are an experienced Chief Financial Officer advising a startup.
The user has asked you a question. Use ONLY the financial data provided below
to answer. Be concise, specific, and reference exact numbers. If the question
involves hypothetical changes (hiring, spending, etc.), calculate the impact
on burn rate and runway.

=== CURRENT FINANCIAL DATA ===
{json.dumps(metrics, indent=2)}

=== USER QUESTION ===
{question}

Guidelines:
- Be direct and professional
- Reference exact numbers from the data
- If it's a scenario question, show before/after numbers
- Include a clear recommendation
- Keep the response under 200 words
- Use bullet points where helpful

Answer:"""

    return _call_granite(prompt, max_tokens=800)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  generate_ai_optimization  (Full AI-driven optimizer)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_ai_optimization(
    metrics: dict[str, Any],
    cash_balance: float,
) -> dict[str, Any]:
    """
    Have IBM Granite generate a full, creative optimization plan based
    on the current financial data. No target months required — the AI
    analyses the full picture and recommends the best optimizations.

    Returns a structured dict with plan actions, reasoning, and projected
    numbers — or raises RuntimeError if the AI call fails.
    """
    current_burn = metrics.get("burn", 0)
    current_runway = metrics.get("runway")
    total_expenses = sum(e.get("amount", 0) for e in metrics.get("expenses", []))

    prompt = f"""You are an expert Chief Financial Officer optimizing a startup's finances.

=== CURRENT FINANCIAL DATA ===
Cash on hand: ${cash_balance:,.0f}
Monthly burn rate: ${current_burn:,.0f}
Current runway: {f"{current_runway:.1f} months" if current_runway else "cash-flow positive (no net burn)"}
Total expenses: ${total_expenses:,.0f}

=== EXPENSE BREAKDOWN ===
{json.dumps(metrics.get("expenses", []), indent=2)}

=== YOUR TASK ===
Analyse ALL expenses and create the best optimization plan to reduce costs and
extend runway as much as possible. Focus on the highest-impact, lowest-risk
changes first.

Do NOT just say "cut X by 20%" — instead suggest realistic strategies like:
- Renegotiate vendor contracts for better rates
- Switch to cheaper alternatives (name specific types)
- Consolidate redundant tools/services
- Defer non-critical hires or use contractors
- Shift to usage-based pricing models
- Reduce office space / go hybrid
- Optimize marketing spend by reallocating to higher-ROI channels
- Cross-train staff instead of new hires
- Automate manual processes to reduce labor costs

You MUST respond in EXACTLY this JSON format and nothing else:
{{
  "plan": [
    {{
      "action": "Brief description of the action",
      "category": "Which expense category this targets",
      "monthly_savings_est": 1234,
      "reasoning": "1-2 sentences explaining why this works and the tradeoff"
    }}
  ],
  "strategy_summary": "2-3 sentence overall strategy description",
  "risk_assessment": "2-3 sentences about key risks and how to mitigate them",
  "implementation_phases": [
    "Phase 1 (Week 1): ...",
    "Phase 2 (Month 1): ...",
    "Phase 3 (Quarter 1): ..."
  ]
}}

Rules:
- Propose 4-7 specific actions.
- monthly_savings_est for each action must be realistic and proportional to the actual category spend.
- Total savings should aim for 15-30% of current burn — aggressive but achievable.
- Reference the ACTUAL expense categories and amounts from the data above.
- Be creative but realistic. A real CFO would approve these.
- Output ONLY valid JSON — no markdown, no explanation before/after.

JSON:"""

    raw = _call_granite(prompt, max_tokens=1500)

    # Parse the AI response as JSON
    # Strip any markdown code fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        ai_plan = json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find JSON object in the response
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start >= 0 and end > start:
            ai_plan = json.loads(cleaned[start:end])
        else:
            raise RuntimeError(f"AI returned non-JSON response: {raw[:200]}")

    # Build the structured response matching the frontend's expected format
    actions = ai_plan.get("plan", [])
    total_savings = sum(a.get("monthly_savings_est", 0) for a in actions)
    new_burn = current_burn - total_savings
    new_runway = round(cash_balance / new_burn, 2) if new_burn > 0 else None

    return {
        "current_runway": current_runway,
        "new_runway": new_runway,
        "monthly_burn_before": round(current_burn, 2),
        "monthly_burn_after": round(max(new_burn, 0), 2),
        "plan": actions,
        "strategy_summary": ai_plan.get("strategy_summary", ""),
        "risk_assessment": ai_plan.get("risk_assessment", ""),
        "implementation_phases": ai_plan.get("implementation_phases", []),
        "ai_generated": True,
    }
