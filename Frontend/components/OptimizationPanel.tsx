"use client";

import { useState } from "react";
import { getOptimization } from "../services/api";

export default function OptimizationPanel({ setPlan }: { setPlan: (p: any) => void }) {
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const plan = await getOptimization(months);
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
        <span className="text-xl">🚀</span> Extend Runway
      </h2>

      <div className="space-y-3">
        <div>
          <label className="text-xs uppercase tracking-widest text-slate-500 block mb-1">
            Target months to add
          </label>
          <input
            type="number"
            min={1}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          onClick={runOptimization}
          disabled={loading || months <= 0}
          className="neon-btn w-full text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
        >
          {loading ? "Optimizing..." : "Generate Plan"}
        </button>
      </div>
    </div>
  );
}