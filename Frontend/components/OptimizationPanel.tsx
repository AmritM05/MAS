"use client";

import { useState } from "react";
import { getOptimization } from "../services/api";

export default function OptimizationPanel({ setPlan }: any) {

  const [months, setMonths] = useState(3);

  const runOptimization = async () => {
    try {
      const plan = await getOptimization(months);
      setPlan(plan);
    } catch (error) {
      console.error(error);
      alert("Optimization failed");
    }
  };

  return (
    <div className="futuristic-card p-6 mt-6">

      <h2 className="text-xl font-bold mb-3 accent-text">
        Extend Runway
      </h2>

      <div className="flex items-center">
        <label className="mr-3 text-sm text-slate-300">Target Months</label>

        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="border bg-transparent px-2 py-1 w-24 text-white rounded"
        />

        <button
          onClick={runOptimization}
          className="neon-btn text-white px-4 py-2 ml-4 rounded"
        >
          Optimize
        </button>
      </div>

    </div>
  );
}