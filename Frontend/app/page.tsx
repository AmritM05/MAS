"use client";

import { useState, useCallback } from "react";
import UploadCSV from "../components/UploadCSV";
import Dashboard from "../components/Dashboard";
import { useData } from "../context/DataContext";
import { getMetrics } from "../services/api";

export default function Home() {
  const { metrics, setMetrics, cashBalance, setCashBalance } = useData();
  const [cashInput, setCashInput] = useState<string>(cashBalance.toString());

  const handleCashChange = (val: string) => {
    setCashInput(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setCashBalance(num);
    }
  };

  const refreshMetrics = useCallback(async () => {
    if (!metrics) return;
    const num = Number(cashInput);
    if (isNaN(num) || num <= 0) return;
    try {
      const updated = await getMetrics(num);
      setMetrics(updated);
    } catch (err) {
      console.error(err);
    }
  }, [cashInput, metrics, setMetrics]);

  return (
    <div>
      {!metrics ? (
        <div className="max-w-md mx-auto mt-8 space-y-4">
          {/* Cash balance input before upload */}
          <div className="futuristic-card p-6">
            <label className="text-xs uppercase tracking-widest text-slate-500 block mb-2">
              Cash on Hand ($)
            </label>
            <input
              type="number"
              min={1}
              value={cashInput}
              onChange={(e) => handleCashChange(e.target.value)}
              placeholder="Enter your cash balance"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Set your current cash balance before uploading data.</p>
          </div>
          <UploadCSV onData={setMetrics} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Compact re-upload + cash balance editor */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-widest text-slate-500">Cash on Hand:</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min={1}
                  value={cashInput}
                  onChange={(e) => handleCashChange(e.target.value)}
                  onBlur={refreshMetrics}
                  onKeyDown={(e) => { if (e.key === "Enter") refreshMetrics(); }}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors w-40"
                />
                <button
                  onClick={refreshMetrics}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
            <UploadCSV onData={setMetrics} compact />
          </div>
          <Dashboard data={metrics} />
        </div>
      )}
    </div>
  );
}