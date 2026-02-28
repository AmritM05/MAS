"use client";

import { useState } from "react";
import { useData } from "../../context/DataContext";
import Link from "next/link";
import { getOptimization } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function OptimizePage() {
  const { metrics, plan, setPlan, cashBalance } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!metrics) {
    return (
      <div className="futuristic-card p-12 text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3 opacity-30">🚀</p>
        <p className="text-slate-400 mb-4">Upload data first to run optimization.</p>
        <Link href="/" className="neon-btn px-6 py-2 rounded-lg text-sm text-white">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Current metrics from uploaded data
  const metricsBurn = metrics.burn || 0;
  const metricsRunway = metrics.runway;
  const metricsCash = cashBalance;

  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOptimization(cashBalance);
      setPlan(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Optimization failed. Try uploading data again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actions: any[] = plan?.plan || [];
  const currentRunway = plan?.current_runway;
  const newRunway = plan?.new_runway;
  const burnBefore = plan?.monthly_burn_before;
  const burnAfter = plan?.monthly_burn_after;
  const note = plan?.note;
  const aiGenerated: boolean = plan?.ai_generated || false;
  const strategySummary: string | null = plan?.strategy_summary || null;
  const riskAssessment: string | null = plan?.risk_assessment || null;
  const implementationPhases: string[] = plan?.implementation_phases || [];

  // Savings per action chart
  const savingsData = actions.map((a: any, i: number) => ({
    name: a.action?.length > 25 ? a.action.slice(0, 25) + "…" : a.action,
    savings: a.monthly_savings_est || 0,
    index: i,
  }));

  const totalSavings = actions.reduce((s: number, a: any) => s + (a.monthly_savings_est || 0), 0);

  return (
    <div className="space-y-6">
      {/* Current snapshot + Generate button */}
      <div className="futuristic-card p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <span className="text-xl">🚀</span> AI Spending Optimizer
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Our AI CFO will analyse your entire expense breakdown and craft a tailored optimization
          plan — with realistic strategies, risk assessment, and a phased implementation roadmap.
        </p>

        {/* Current financial snapshot */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white/[0.03] rounded-xl p-4 text-center border border-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cash on Hand</p>
            <p className="stat-value text-xl text-cyan-400">${metricsCash.toLocaleString()}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4 text-center border border-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Monthly Burn</p>
            <p className="stat-value text-xl text-rose-400">${metricsBurn.toLocaleString()}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4 text-center border border-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Current Runway</p>
            <p className="stat-value text-xl text-slate-300">
              {metricsRunway != null ? `${metricsRunway.toFixed(1)} mo` : "∞"}
            </p>
          </div>
        </div>

        <button
          onClick={runOptimization}
          disabled={loading}
          className="neon-btn text-white px-8 py-3 rounded-lg text-sm font-semibold w-full"
        >
          {loading ? "🤖 AI is analyzing your finances..." : "Generate Optimization Plan"}
        </button>
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {plan && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Burn Before</p>
              <p className="stat-value text-2xl text-rose-400">${burnBefore?.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">${((burnBefore || 0) * 12).toLocaleString()}/yr</p>
            </div>
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Burn After</p>
              <p className="stat-value text-2xl text-emerald-400">${burnAfter?.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">${((burnAfter || 0) * 12).toLocaleString()}/yr</p>
            </div>
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Current Runway</p>
              <p className="stat-value text-2xl text-slate-300">
                {currentRunway != null ? `${currentRunway.toFixed(1)}` : "∞"}
                <span className="text-xs font-normal text-slate-500 ml-1">mo</span>
              </p>
            </div>
            <div className="futuristic-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">New Runway</p>
              <p className="stat-value text-2xl text-cyan-400">
                {newRunway != null ? `${newRunway.toFixed(1)}` : "∞"}
                <span className="text-xs font-normal text-slate-500 ml-1">mo</span>
              </p>
              {currentRunway != null && newRunway != null && (
                <p className="text-xs text-emerald-400 mt-1">+{(newRunway - currentRunway).toFixed(1)} mo gained</p>
              )}
            </div>
          </div>

          {/* Savings chart */}
          {savingsData.length > 0 && (
            <div className="futuristic-card p-6">
              <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Savings per Action</h2>
              <div className="chart-3d" style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsData} layout="vertical" margin={{ left: 10 }}>
                    <defs>
                      <linearGradient id="savingsGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} width={160} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{ background: "rgba(218, 220, 226, 0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, color: "#000000", fontSize: 12 }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}/mo`, "Savings"]}
                    />
                    <Bar dataKey="savings" fill="url(#savingsGrad)" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-emerald-400 mt-3">
                Total monthly savings: <span className="font-bold">${totalSavings.toLocaleString()}/mo</span>
              </p>
            </div>
          )}

          {/* Action items - detailed */}
          <div className="futuristic-card p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              {aiGenerated && <span className="text-xl">🤖</span>}
              Recommended Actions
              {aiGenerated && (
                <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-normal">
                  AI-Generated
                </span>
              )}
            </h2>
            {strategySummary && (
              <p className="text-sm text-slate-400 mb-4 bg-white/[0.02] rounded-lg p-3 border border-white/5">
                {strategySummary}
              </p>
            )}
            <div className="space-y-3">
              {actions.map((a, i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <span className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 text-sm flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm text-slate-200 font-medium">{a.action}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Category: {a.category || "General"}
                          {a.cut_pct ? ` • ${(a.cut_pct * 100).toFixed(0)}% reduction` : ""}
                        </p>
                        {a.reasoning && (
                          <p className="text-xs text-cyan-400/70 mt-2 leading-relaxed">
                            💡 {a.reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-mono text-emerald-400 font-semibold">
                        -${a.monthly_savings_est?.toLocaleString()}/mo
                      </p>
                      <p className="text-xs text-slate-500">
                        -${((a.monthly_savings_est || 0) * 12).toLocaleString()}/yr
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Before vs After comparison */}
          <div className="futuristic-card p-6">
            <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Before vs After</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] rounded-xl p-5 border border-rose-500/10">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Before Optimization</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Burn</span>
                    <span className="font-mono text-rose-400">${burnBefore?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Runway</span>
                    <span className="font-mono text-rose-400">{currentRunway?.toFixed(1)} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual Burn</span>
                    <span className="font-mono text-rose-400">${((burnBefore || 0) * 12).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-5 border border-emerald-500/10">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">After Optimization</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Burn</span>
                    <span className="font-mono text-emerald-400">${burnAfter?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Runway</span>
                    <span className="font-mono text-emerald-400">{newRunway?.toFixed(1)} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual Burn</span>
                    <span className="font-mono text-emerald-400">${((burnAfter || 0) * 12).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {note && (
            <div className="futuristic-card p-4 text-sm text-slate-500 italic border-l-2 border-cyan-500/30">
              {note}
            </div>
          )}

          {/* AI Risk Assessment & Implementation Phases */}
          {(riskAssessment || implementationPhases.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskAssessment && (
                <div className="futuristic-card p-6">
                  <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <span>⚠️</span> Risk Assessment
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{riskAssessment}</p>
                </div>
              )}
              {implementationPhases.length > 0 && (
                <div className="futuristic-card p-6">
                  <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <span>📋</span> Implementation Roadmap
                  </h2>
                  <div className="space-y-3">
                    {implementationPhases.map((phase, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-300">{phase}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!aiGenerated && (
            <div className="futuristic-card p-4 text-sm text-slate-500 italic border-l-2 border-yellow-500/30">
              ⚡ AI optimization unavailable — showing algorithmic plan as fallback.
            </div>
          )}
        </>
      )}
    </div>
  );
}
