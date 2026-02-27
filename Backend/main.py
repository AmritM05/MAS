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
from ai_layer import generate_insights, generate_board_report

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
