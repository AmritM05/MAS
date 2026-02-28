"use client";

import { useData } from "../../context/DataContext";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
} from "recharts";

export default function ForecastPage() {
  const { metrics } = useData();

  if (!metrics) {
    return (
      <div className="futuristic-card p-12 text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3 opacity-30">📈</p>
        <p className="text-slate-400 mb-4">Upload data first to see your forecast.</p>
        <Link href="/" className="neon-btn px-6 py-2 rounded-lg text-sm text-white">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const cash = metrics.cash ?? 0;
  const burn = metrics.burn ?? 1;
  const runway = metrics.runway ?? 0;

  // Generate 24-month forecast data
  const months = 24;
  const forecastData = Array.from({ length: months + 1 }, (_, i) => {
    const remaining = cash - burn * i;
    return {
      month: i,
      label: `M${i}`,
      cash: Math.max(remaining, 0),
      raw: remaining,
    };
  });

  // Scenario analysis: what if burn changes
  const scenarios = [
    { name: "Current Burn", burn: burn, color: "#7c3aed" },
    { name: "10% Reduction", burn: burn * 0.9, color: "#34d399" },
    { name: "20% Reduction", burn: burn * 0.8, color: "#06b6d4" },
    { name: "10% Increase", burn: burn * 1.1, color: "#f97316" },
  ];

  const scenarioData = Array.from({ length: months + 1 }, (_, i) => {
    const row: Record<string, number | string> = { month: i, label: `M${i}` };
    scenarios.forEach((s) => {
      row[s.name] = Math.max(cash - s.burn * i, 0);
    });
    return row;
  });

  // Monthly depletion table (first 18 months)
  const tableMonths = Math.min(18, months);
  const depletionRows = Array.from({ length: tableMonths + 1 }, (_, i) => {
    const remaining = cash - burn * i;
    const pctLeft = (remaining / cash) * 100;
    return {
      month: i,
      remaining: Math.max(remaining, 0),
      spent: Math.min(burn * i, cash),
      pctLeft: Math.max(pctLeft, 0),
      status: remaining <= 0 ? "depleted" : pctLeft < 15 ? "critical" : pctLeft < 35 ? "warning" : "safe",
    };
  });

  const dailyBurn = burn / 30;
  const weeklyBurn = burn / 4.33;

  return (
    <div className="space-y-6">
      {/* Hero stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="futuristic-card p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cash Balance</p>
          <p className="stat-value text-2xl text-emerald-400">${cash.toLocaleString()}</p>
        </div>
        <div className="futuristic-card p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Monthly Burn</p>
          <p className="stat-value text-2xl text-rose-400">${burn.toLocaleString()}/mo</p>
        </div>
        <div className="futuristic-card p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Daily Burn</p>
          <p className="stat-value text-2xl text-orange-400">${Math.round(dailyBurn).toLocaleString()}/day</p>
        </div>
        <div className="futuristic-card p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Weekly Burn</p>
          <p className="stat-value text-2xl text-cyan-400">${Math.round(weeklyBurn).toLocaleString()}/wk</p>
        </div>
      </div>

      {/* Main forecast chart */}
      <div className="futuristic-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">24-Month Cash Forecast</h2>
        <div className="chart-3d" style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "rgba(218, 220, 226, 0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, color: "#000000", fontSize: 12 }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Cash"]}
                labelFormatter={(l: any) => `Month ${String(l).replace("M", "")}`}
              />
              <ReferenceLine y={0} stroke="rgba(239,68,68,0.4)" strokeDasharray="6 4" />
              {runway <= months && (
                <ReferenceLine x={`M${Math.round(runway)}`} stroke="rgba(239,68,68,0.6)" strokeDasharray="4 4" label={{ value: `Runway End`, fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
              )}
              <Area type="monotone" dataKey="cash" stroke="#7c3aed" fill="url(#cashGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario analysis */}
      <div className="futuristic-card p-6">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Scenario Analysis</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          {scenarios.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-3 h-0.5 rounded" style={{ background: s.color }} />
              {s.name} — ${Math.round(s.burn).toLocaleString()}/mo — Runway: {(cash / s.burn).toFixed(1)} mo
            </div>
          ))}
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "rgba(218, 220, 226, 0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, color: "#000000", fontSize: 12 }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`]}
                labelFormatter={(l: any) => `Month ${String(l).replace("M", "")}`}
              />
              {scenarios.map((s) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Depletion table */}
      <div className="futuristic-card p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Monthly Cash Depletion Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="py-2 text-left">Month</th>
                <th className="py-2 text-right">Remaining Cash</th>
                <th className="py-2 text-right">Cumulative Spent</th>
                <th className="py-2 text-right">% Remaining</th>
                <th className="py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {depletionRows.map((r) => (
                <tr key={r.month} className="border-b border-white/[0.03]">
                  <td className="py-2 text-slate-300">Month {r.month}</td>
                  <td className="py-2 text-right font-mono text-slate-300">${r.remaining.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-slate-400">${r.spent.toLocaleString()}</td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${r.pctLeft}%`,
                            background:
                              r.status === "depleted"
                                ? "#6b7280"
                                : r.status === "critical"
                                ? "#ef4444"
                                : r.status === "warning"
                                ? "#f59e0b"
                                : "#34d399",
                          }}
                        />
                      </div>
                      <span className="text-slate-400 w-12 text-right">{r.pctLeft.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                        r.status === "safe"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : r.status === "warning"
                          ? "bg-amber-500/10 text-amber-400"
                          : r.status === "critical"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
