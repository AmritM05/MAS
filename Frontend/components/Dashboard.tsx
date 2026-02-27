"use client";

import { useState, useEffect } from "react";
import RunwayCard from "./RunwayCard";
import ExpenseChart from "./ExpenseChart";
import RunwayForecast from "./RunwayForecast";
import { getAnomalies } from "../services/api";

function getHealthStatus(runway: number | null, burn: number) {
  if (runway === null || runway === undefined) return { label: "Cash-Flow Positive", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "✅" };
  if (runway >= 12) return { label: "Healthy", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "✅" };
  if (runway >= 6) return { label: "Stable", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: "📊" };
  if (runway >= 3) return { label: "At Risk", color: "text-amber-400", bg: "bg-amber-500/10", icon: "⚠️" };
  return { label: "Critical", color: "text-red-400", bg: "bg-red-500/10", icon: "🚨" };
}

export default function Dashboard({ data }: { data: any }) {
  const burn = Number(data.burn) || 0;
  const cash = Number(data.cash) || 0;
  const runway = data.runway;
  const expenses: any[] = data.expenses || [];
  const totalExpense = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const topCategory = expenses.length > 0 ? expenses[0] : null;
  const health = getHealthStatus(runway, burn);
  const dailyBurn = burn / 30;

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    getAnomalies().then((res) => setAlerts(res.alerts || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Financial Health Banner */}
      <div className="futuristic-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`${health.bg} rounded-xl px-4 py-2 flex items-center gap-2`}>
            <span className="text-lg">{health.icon}</span>
            <span className={`text-sm font-bold uppercase tracking-wider ${health.color}`}>{health.label}</span>
          </div>
          <p className="text-sm text-slate-400 flex-1">
            <span className="text-slate-200 font-medium">Runway: {runway ? `${runway.toFixed(1)} months` : "∞"}</span>
            {" · "}Burn rate: ${burn.toLocaleString()}/mo
            {" · "}Top expense: {topCategory ? `${topCategory.category} ($${topCategory.amount.toLocaleString()})` : "N/A"}
          </p>
        </div>
      </div>

      {/* Anomaly Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`futuristic-card p-4 flex items-center gap-3 border-l-2 ${
              a.severity === "high" ? "border-red-500" : "border-amber-500"
            }`}>
              <span className="text-lg">{a.severity === "high" ? "🚨" : "⚠️"}</span>
              <div className="flex-1">
                <p className="text-sm text-slate-200">{a.message}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Normal avg: ${a.normal_avg?.toLocaleString()} · Current: ${a.current?.toLocaleString()} · Z-score: {a.z_score}
                </p>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                a.severity === "high" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
              }`}>{a.severity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <RunwayCard runway={runway} />

        <div className="futuristic-card p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cash on Hand</p>
          <p className="stat-value text-3xl text-emerald-400">
            ${cash.toLocaleString()}
          </p>
        </div>

        <div className="futuristic-card p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Monthly Burn</p>
          <p className="stat-value text-3xl text-rose-400">
            ${burn.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">${Math.round(dailyBurn).toLocaleString()}/day</p>
        </div>

        <div className="futuristic-card p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Total Expenses</p>
          <p className="stat-value text-3xl text-violet-400">
            ${totalExpense.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">{expenses.length} categories</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpenseChart data={expenses} />
        <RunwayForecast cash={cash} burn={burn} />
      </div>
    </div>
  );
}