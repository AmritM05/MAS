"use client";

import { useState } from "react";
import UploadCSV from "../components/UploadCSV";
import Dashboard from "../components/Dashboard";
import OptimizationPanel from "../components/OptimizationPanel";
import RecommendedPlan from "../components/RecommendedPlan";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 lg:px-16 max-w-7xl mx-auto">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="text-center mb-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold neon-text muted-glow tracking-tight">
          AI CFO Runway Optimizer
        </h1>
        <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
          Upload your financials. Get actionable runway guidance in seconds.
        </p>
      </header>

      {/* ── Upload + Optimize sidebar  /  Dashboard ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left panel */}
        <aside className="lg:col-span-4 space-y-6">
          <UploadCSV onData={setData} />
          {data && <OptimizationPanel setPlan={setPlan} />}
        </aside>

        {/* Right panel */}
        <section className="lg:col-span-8 space-y-6">
          {!data && (
            <div className="futuristic-card p-12 text-center">
              <div className="text-6xl mb-4 opacity-30">📊</div>
              <p className="text-slate-400 text-lg">
                Upload a CSV to see your financial dashboard
              </p>
            </div>
          )}

          {data && <Dashboard data={data} />}
          {plan && <RecommendedPlan plan={plan} />}
        </section>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="mt-16 text-center text-xs text-slate-600">
        Built for hackathon demo &middot; AI CFO Runway Optimizer
      </footer>
    </main>
  );
}