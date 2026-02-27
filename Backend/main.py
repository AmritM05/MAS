"""
main.py – FastAPI app + endpoints.  Logic lives in other modules.
"""

from typing import Optional

import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
from pydantic import BaseModel, Field

from financial_engine import compute_metrics
from optimizer import optimize
from utils import parse_and_validate_csv
from ai_layer import generate_insights, generate_board_report, ask_cfo_question
from anomaly_detector import detect_anomalies

# ── App + CORS ────────────────────────────────────────────────────────
app = FastAPI(title="AI CFO Runway Optimizer", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory state ──────────────────────────────────────────────────
GLOBAL_DF: Optional[pd.DataFrame] = None

DEFAULT_CASH_BALANCE: float = 400_000.0


# ── Request / response models ────────────────────────────────────────
class OptimizeRequest(BaseModel):
    months: float = Field(..., gt=0, description="Extend runway by this many months")
    cash_balance: Optional[float] = Field(
        None, gt=0, description="Override cash balance"
    )


class ScenarioRequest(BaseModel):
    new_hires: int = Field(0, ge=0, description="Number of new hires")
    avg_salary: float = Field(15000, ge=0, description="Average monthly salary per hire")
    marketing_change_pct: float = Field(0, description="Marketing spend change %")
    revenue_growth_pct: float = Field(0, description="Revenue growth %")
    additional_monthly_cost: float = Field(0, ge=0, description="Any extra monthly cost")
    additional_monthly_revenue: float = Field(0, ge=0, description="Any extra monthly revenue")
    cash_balance: Optional[float] = Field(None, gt=0)


class AskCFORequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    cash_balance: Optional[float] = Field(None, gt=0)


# ── Endpoints ─────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"ok": True}


@app.get("/")
def root():
    return RedirectResponse(url="http://localhost:3000")


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global GLOBAL_DF

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    raw = await file.read()

    try:
        df, summary = parse_and_validate_csv(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    GLOBAL_DF = df
    return summary


@app.get("/metrics")
def metrics(cash_balance: Optional[float] = Query(None)):
    if GLOBAL_DF is None:
        raise HTTPException(status_code=400, detail="POST /upload first")

    bal = cash_balance if cash_balance is not None else DEFAULT_CASH_BALANCE
    return compute_metrics(GLOBAL_DF, bal)


@app.post("/optimize")
def run_optimize(body: OptimizeRequest):
    if GLOBAL_DF is None:
        raise HTTPException(status_code=400, detail="POST /upload first")

    bal = body.cash_balance if body.cash_balance is not None else DEFAULT_CASH_BALANCE
    return optimize(GLOBAL_DF, bal, body.months)


@app.get("/insights")
def insights(cash_balance: Optional[float] = Query(None)):
    """Return a short CFO-style bullet summary of the current metrics."""
    if GLOBAL_DF is None:
        raise HTTPException(status_code=400, detail="POST /upload first")

    bal = cash_balance if cash_balance is not None else DEFAULT_CASH_BALANCE
    metrics_data = compute_metrics(GLOBAL_DF, bal)

    try:
        text = generate_insights(metrics_data)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    return {"insights": text}


@app.post("/report")
def report(body: OptimizeRequest):
    """Generate a full executive board memo with optimization plan."""
    if GLOBAL_DF is None:
        raise HTTPException(status_code=400, detail="POST /upload first")

    bal = body.cash_balance if body.cash_balance is not None else DEFAULT_CASH_BALANCE
    metrics_data = compute_metrics(GLOBAL_DF, bal)
    optimization_data = optimize(GLOBAL_DF, bal, body.months)

    try:
        text = generate_board_report(metrics_data, optimization_data)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    return {"report": text}


# ── Scenario Simulation ──────────────────────────────────────────────
@app.post("/scenario")
def run_scenario(body: ScenarioRequest):
    """Simulate a what-if scenario and return the impact on burn/runway."""
    if GLOBAL_DF is None:
        raise HTTPException(status_code=400, detail="POST /upload first")

    bal = body.cash_balance if body.cash_balance is not None else DEFAULT_CASH_BALANCE
    current = compute_metrics(GLOBAL_DF, bal)
    current_burn = current["burn"]
    current_runway = current["runway"]

    # Calculate adjustments
    hire_cost = body.new_hires * body.avg_salary

    # Marketing adjustment
    expenses = current.get("expenses", [])
    marketing_spend = 0
    for e in expenses:
        if e["category"].lower() in ("marketing", "ads"):
            marketing_spend += e["amount"]
    # monthly marketing
    months_observed = max(len(GLOBAL_DF["month"].unique()), 1)
    monthly_marketing = marketing_spend / months_observed
    marketing_delta = monthly_marketing * (body.marketing_change_pct / 100)

    # Revenue adjustment
    monthly_revenue = float(GLOBAL_DF[GLOBAL_DF["amount"] > 0]["amount"].sum()) / months_observed
    revenue_delta = monthly_revenue * (body.revenue_growth_pct / 100)

    # New burn = old burn + new hiring + marketing change - revenue growth + extra costs - extra revenue
    new_burn = current_burn + hire_cost + marketing_delta - revenue_delta + body.additional_monthly_cost - body.additional_monthly_revenue
    new_runway = round(bal / new_burn, 2) if new_burn > 0 else None

    return {
        "current_burn": round(current_burn, 2),
        "new_burn": round(new_burn, 2),
        "current_runway": current_runway,
        "new_runway": new_runway,
        "burn_change": round(new_burn - current_burn, 2),
        "runway_change": round((new_runway or 0) - (current_runway or 0), 2) if new_runway and current_runway else None,
        "breakdown": {
            "hiring_cost": round(hire_cost, 2),
            "marketing_delta": round(marketing_delta, 2),
            "revenue_delta": round(revenue_delta, 2),
            "additional_cost": round(body.additional_monthly_cost, 2),
            "additional_revenue": round(body.additional_monthly_revenue, 2),
        },
    }


# ── Anomaly Detection ────────────────────────────────────────────────
@app.get("/anomalies")
def anomalies():
    """Detect unusual spending spikes in the uploaded data."""
    if GLOBAL_DF is None:
        raise HTTPException(status_code=400, detail="POST /upload first")
    return detect_anomalies(GLOBAL_DF)


# ── Ask the CFO ──────────────────────────────────────────────────────
@app.post("/ask")
def ask_cfo(body: AskCFORequest):
    """Ask the AI CFO a question about your finances."""
    if GLOBAL_DF is None:
        raise HTTPException(status_code=400, detail="POST /upload first")

    bal = body.cash_balance if body.cash_balance is not None else DEFAULT_CASH_BALANCE
    metrics_data = compute_metrics(GLOBAL_DF, bal)

    try:
        answer = ask_cfo_question(body.question, metrics_data)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    return {"question": body.question, "answer": answer}
