"use client";

import { useState } from "react";
import { getOptimization } from "../services/api";

export default function OptimizationPanel({ setPlan }: { setPlan: (p: any) => void }) {
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const plan = await getOptimization();
      setPlan(plan);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Optimization failed";
      alert(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="futuristic-card p-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-xl">🚀</span> AI Optimizer
      </h2>

      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          Let AI analyse your expenses and generate a tailored optimization plan.
        </p>

        <button
          onClick={runOptimization}
          disabled={loading}
          className="neon-btn w-full text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
        >
          {loading ? "🤖 Analyzing..." : "Generate Optimization Plan"}
        </button>
      </div>
    </div>
  );
}