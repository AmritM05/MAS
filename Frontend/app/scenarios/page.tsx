"use client";

import { useState } from "react";
import { useData } from "../../context/DataContext";
import Link from "next/link";
import { runScenario } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface ScenarioResult {
  current_burn: number;
  new_burn: number;
  current_runway: number | null;
  new_runway: number | null;
  burn_change: number;
  runway_change: number | null;
  breakdown: {
    hiring_cost: number;
    marketing_delta: number;
    revenue_delta: number;
    additional_cost: number;
    additional_revenue: number;
  };
}

export default function ScenarioPage() {
  const { metrics } = useData();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newHires, setNewHires] = useState(0);
  const [avgSalary, setAvgSalary] = useState(15000);
  const [marketingPct, setMarketingPct] = useState(0);
  const [revGrowthPct, setRevGrowthPct] = useState(0);
  const [extraCost, setExtraCost] = useState(0);
  const [extraRevenue, setExtraRevenue] = useState(0);

  if (!metrics) {
    return (
      <div className="futuristic-card p-12 text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3 opacity-30">🔮</p>
        <p className="text-slate-400 mb-4">Upload data first to run scenarios.</p>
        <Link href="/" className="neon-btn px-6 py-2 rounded-lg text-sm text-white">Go to Dashboard</Link>
      </div>
    );
  }

  const simulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runScenario({
        new_hires: newHires,
        avg_salary: avgSalary,
        marketing_change_pct: marketingPct,
        revenue_growth_pct: revGrowthPct,
        additional_monthly_cost: extraCost,
        additional_monthly_revenue: extraRevenue,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Scenario simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const comparisonData = result
    ? [
        { label: "Current", burn: result.current_burn, runway: result.current_runway ?? 0 },
        { label: "Scenario", burn: result.new_burn, runway: result.new_runway ?? 0 },
      ]
    : [];

  const breakdownData = result
    ? [
        { name: "Hiring", value: result.breakdown.hiring_cost, color: "#f472b6" },
        { name: "Marketing Δ", value: result.breakdown.marketing_delta, color: "#facc15" },
        { name: "Revenue Δ", value: -result.breakdown.revenue_delta, color: "#34d399" },
        { name: "Extra Cost", value: result.breakdown.additional_cost, color: "#f97316" },
        { name: "Extra Revenue", value: -result.breakdown.additional_revenue, color: "#06b6d4" },
      ].filter((d) => d.value !== 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="futuristic-card p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <span className="text-xl">🔮</span> Scenario Simulator
        </h2>
        <p className="text-sm text-slate-400 mb-5">
          Model &quot;what-if&quot; scenarios to see how changes impact your burn rate and runway.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">New hires</label>
            <input type="number" min={0} value={newHires} onChange={(e) => setNewHires(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">Avg salary / month</label>
            <input type="number" min={0} value={avgSalary} onChange={(e) => setAvgSalary(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">Marketing change %</label>
            <input type="number" value={marketingPct} onChange={(e) => setMarketingPct(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">Revenue growth %</label>
            <input type="number" value={revGrowthPct} onChange={(e) => setRevGrowthPct(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">Extra monthly cost</label>
            <input type="number" min={0} value={extraCost} onChange={(e) => setExtraCost(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">Extra monthly revenue</label>
            <input type="number" min={0} value={extraRevenue} onChange={(e) => setExtraRevenue(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none" />
          </div>
        </div>

        <button onClick={simulate} disabled={loading}
          className="neon-btn text-white px-6 py-2.5 rounded-lg text-sm font-semibold mt-5">
          {loading ? "⚙️ Simulating..." : "Run Scenario"}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Current Burn</p>
              <p className="stat-value text-2xl text-slate-300">${result.current_burn.toLocaleString()}/mo</p>
            </div>
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">New Burn</p>
              <p className={`stat-value text-2xl ${result.new_burn > result.current_burn ? "text-rose-400" : "text-emerald-400"}`}>
                ${result.new_burn.toLocaleString()}/mo
              </p>
            </div>
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Current Runway</p>
              <p className="stat-value text-2xl text-slate-300">
                {result.current_runway ? `${result.current_runway.toFixed(1)} mo` : "∞"}
              </p>
            </div>
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">New Runway</p>
              <p className={`stat-value text-2xl ${
                result.new_runway && result.current_runway && result.new_runway < result.current_runway
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}>
                {result.new_runway ? `${result.new_runway.toFixed(1)} mo` : "∞"}
              </p>
            </div>
          </div>

          {/* Impact summary */}
          <div className="futuristic-card p-6">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Impact Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Burn comparison chart */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Burn Rate Comparison</p>
                <div className="chart-3d" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }} />
                      <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
                        tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, color: "#e2e8f0", fontSize: 12 }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}/mo`, "Burn"]} />
                      <Bar dataKey="burn" radius={[6, 6, 0, 0]}>
                        <Cell fill="#7c3aed" />
                        <Cell fill={result.new_burn > result.current_burn ? "#ef4444" : "#34d399"} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown table */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Change Breakdown</p>
                <div className="space-y-2">
                  {breakdownData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-4 py-3 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                        <span className="text-sm text-slate-200">{d.name}</span>
                      </div>
                      <span className={`text-sm font-mono ${d.value > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {d.value > 0 ? "+" : ""}{d.value < 0 ? "-" : ""}${Math.abs(d.value).toLocaleString()}/mo
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-white/[0.06] rounded-lg px-4 py-3 border border-white/10 mt-2">
                    <span className="text-sm text-slate-200 font-semibold">Net Impact</span>
                    <span className={`text-sm font-mono font-bold ${result.burn_change > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {result.burn_change > 0 ? "+" : ""}${result.burn_change.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Runway comparison visual */}
          <div className="futuristic-card p-6">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Runway Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] rounded-xl p-5 border border-slate-500/10">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Before</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Monthly Burn</span><span className="font-mono text-slate-300">${result.current_burn.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Runway</span><span className="font-mono text-slate-300">{result.current_runway?.toFixed(1) ?? "∞"} months</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Annual Burn</span><span className="font-mono text-slate-300">${(result.current_burn * 12).toLocaleString()}</span></div>
                </div>
              </div>
              <div className={`bg-white/[0.03] rounded-xl p-5 border ${result.new_burn > result.current_burn ? "border-rose-500/10" : "border-emerald-500/10"}`}>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">After Scenario</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Monthly Burn</span><span className={`font-mono ${result.new_burn > result.current_burn ? "text-rose-400" : "text-emerald-400"}`}>${result.new_burn.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Runway</span><span className={`font-mono ${result.new_runway && result.current_runway && result.new_runway < result.current_runway ? "text-rose-400" : "text-emerald-400"}`}>{result.new_runway?.toFixed(1) ?? "∞"} months</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Annual Burn</span><span className={`font-mono ${result.new_burn > result.current_burn ? "text-rose-400" : "text-emerald-400"}`}>${(result.new_burn * 12).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
