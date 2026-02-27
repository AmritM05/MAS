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
    <div className="p-6 border rounded shadow mt-6">

      <h2 className="text-xl font-bold mb-3">
        Extend Runway
      </h2>

      <label className="mr-2">
        Target Months:
      </label>

      <input
        type="number"
        value={months}
        onChange={(e) =>
          setMonths(Number(e.target.value))
        }
        className="border p-1 w-20"
      />

      <button
        onClick={runOptimization}
        className="bg-green-500 text-white px-4 py-2 ml-4 rounded"
      >
        Optimize
      </button>

    </div>
  );
}