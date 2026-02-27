"use client";

import { useData } from "../../context/DataContext";
import Link from "next/link";

export default function RunwayPage() {
  const { metrics } = useData();

  if (!metrics) {
    return (
      <div className="futuristic-card p-12 text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3 opacity-30">🛫</p>
        <p className="text-slate-400 mb-4">Upload data first to see runway details.</p>
        <Link href="/" className="neon-btn px-6 py-2 rounded-lg text-sm text-white">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const runway = metrics.runway;
  const cash = Number(metrics.cash) || 0;
  const burn = Number(metrics.burn) || 0;
  const isInfinite = runway === null;
  const runwayVal = isInfinite ? Infinity : Number(runway);

  // Generate monthly depletion table
  const months: { month: number; remaining: number; status: string }[] = [];
  let cur = cash;
  for (let i = 0; i <= 18; i++) {
    let status = "safe";
    if (cur <= 0) status = "depleted";
    else if (cur < cash * 0.2) status = "critical";
    else if (cur < cash * 0.4) status = "warning";
    months.push({ month: i, remaining: Math.max(cur, 0), status });
    cur -= burn;
  }

  return (
    <div className="space-y-6">
      {/* Hero stat */}
      <div className="futuristic-card p-8 text-center pulse-card">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Current Runway
        </p>
        <p className={`stat-value text-6xl ${runwayVal < 6 ? "text-rose-400" : "text-cyan-400"}`}>
          {isInfinite ? "∞" : runway}
        </p>
        <p className="text-slate-500 text-sm mt-1">months until cash reaches $0</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="futuristic-card p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cash on Hand</p>
          <p className="stat-value text-2xl text-emerald-400">${cash.toLocaleString()}</p>
        </div>
        <div className="futuristic-card p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Monthly Burn</p>
          <p className="stat-value text-2xl text-rose-400">${burn.toLocaleString()}</p>
        </div>
        <div className="futuristic-card p-5 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Daily Burn</p>
          <p className="stat-value text-2xl text-amber-400">${Math.round(burn / 30).toLocaleString()}</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="futuristic-card p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">How Runway is Calculated</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>
            <span className="text-cyan-400 font-mono">runway = cash_on_hand / monthly_net_burn</span>
          </p>
          <p>
            Monthly net burn is the average of <span className="text-rose-400">total expenses</span> minus{" "}
            <span className="text-emerald-400">total revenue</span> across all months in the uploaded data.
          </p>
          <p>
            With <span className="text-emerald-400 font-semibold">${cash.toLocaleString()}</span> cash
            and <span className="text-rose-400 font-semibold">${burn.toLocaleString()}/mo</span> net burn,
            your runway is{" "}
            <span className="text-cyan-400 font-semibold">
              {isInfinite ? "infinite (you're cash-flow positive)" : `${runway} months`}
            </span>.
          </p>
        </div>
      </div>

      {/* Monthly depletion table */}
      <div className="futuristic-card p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Monthly Cash Depletion</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="py-2 text-left">Month</th>
                <th className="py-2 text-right">Cash Remaining</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-b border-white/[0.03]">
                  <td className="py-2 text-slate-300">Month {m.month}</td>
                  <td className="py-2 text-right font-mono text-slate-300">
                    ${m.remaining.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        m.status === "safe"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : m.status === "warning"
                          ? "bg-amber-500/10 text-amber-400"
                          : m.status === "critical"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {m.status}
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
