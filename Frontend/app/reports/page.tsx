"use client";

import { useState } from "react";
import { useData } from "../../context/DataContext";
import Link from "next/link";
import { getReport, getInsights } from "../../services/api";

export default function ReportPage() {
  const { metrics, cashBalance } = useData();
  const [report, setReport] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string>("3");

  if (!metrics) {
    return (
      <div className="futuristic-card p-12 text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3 opacity-30">📋</p>
        <p className="text-slate-400 mb-4">Upload data first to generate reports.</p>
        <Link href="/" className="neon-btn px-6 py-2 rounded-lg text-sm text-white">Go to Dashboard</Link>
      </div>
    );
  }

  const generateReport = async () => {
    setLoadingReport(true);
    setError(null);
    try {
      const res = await getReport(Number(months) || 1, cashBalance);
      setReport(res.report);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to generate report.");
    } finally {
      setLoadingReport(false);
    }
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    setError(null);
    try {
      const res = await getInsights(cashBalance);
      setInsights(res.insights);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to generate insights.");
    } finally {
      setLoadingInsights(false);
    }
  };

  // Simple markdown-to-JSX renderer
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-lg font-bold text-cyan-400 mt-6 mb-2">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("# ")) {
        return <h1 key={i} className="text-xl font-bold text-slate-100 mt-4 mb-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <li key={i} className="text-slate-300 ml-4 text-sm mb-1 list-disc">{line.replace(/^[-•]\s*/, "")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-sm text-slate-300 mb-1">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insights card */}
        <div className="futuristic-card p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <span className="text-xl">💡</span> AI Financial Insights
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Get a concise CFO-level summary of your current financial position.
          </p>
          <button onClick={generateInsights} disabled={loadingInsights}
            className="neon-btn text-white px-6 py-2.5 rounded-lg text-sm font-semibold w-full">
            {loadingInsights ? "⚙️ Analyzing..." : "Generate Insights"}
          </button>
        </div>

        {/* Report card */}
        <div className="futuristic-card p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <span className="text-xl">📋</span> Board Report Generator
          </h2>
          <p className="text-sm text-slate-400 mb-3">
            Generate a full executive board memo with optimization analysis.
          </p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">Optimization months</label>
              <input type="number" min={1} max={24} value={months} onChange={(e) => setMonths(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none" />
            </div>
            <button onClick={generateReport} disabled={loadingReport}
              className="neon-btn text-white px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
              {loadingReport ? "⚙️ Writing..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="futuristic-card p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Insights output */}
      {insights && (
        <div className="futuristic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <span>💡</span> Financial Insights
            </h3>
            <button
              onClick={() => { navigator.clipboard.writeText(insights); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors bg-white/5 px-3 py-1 rounded-lg"
            >
              Copy
            </button>
          </div>
          <div className="prose prose-invert max-w-none">{renderMarkdown(insights)}</div>
        </div>
      )}

      {/* Report output */}
      {report && (
        <div className="futuristic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <span>📋</span> Executive Board Report
            </h3>
            <button
              onClick={() => { navigator.clipboard.writeText(report); }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors bg-white/5 px-3 py-1 rounded-lg"
            >
              Copy
            </button>
          </div>
          <div className="prose prose-invert max-w-none border-l-2 border-cyan-500/30 pl-4">
            {renderMarkdown(report)}
          </div>
        </div>
      )}

      {/* Quick metrics reference */}
      <div className="futuristic-card p-6">
        <h3 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Current Data Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Cash</p>
            <p className="stat-value text-lg text-emerald-400">${metrics.cash?.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Burn Rate</p>
            <p className="stat-value text-lg text-rose-400">${metrics.burn?.toLocaleString()}/mo</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Runway</p>
            <p className="stat-value text-lg text-cyan-400">{metrics.runway?.toFixed(1) ?? "∞"} mo</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Categories</p>
            <p className="stat-value text-lg text-violet-400">{metrics.expenses?.length ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
