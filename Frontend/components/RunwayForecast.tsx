"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function RunwayForecast({ cash, burn }: any) {

  const cashVal = Number(cash);
  const burnVal = Number(burn);
  if (isNaN(cashVal) || isNaN(burnVal)) {
    // metrics not ready yet
    return <p className="text-sm text-slate-300">Runway data unavailable</p>;
  }

  const data: Array<{ month: string; cash: number }> = [];

  let currentCash = cashVal;

  for (let i = 0; i <= 12; i++) {
    data.push({
      month: `Month ${i}`,
      cash: currentCash,
    });

    currentCash = currentCash - burnVal;
  }

  return (
    <div className="p-6 futuristic-card">

      <h2 className="text-lg font-semibold text-slate-200 mb-4">Cash Runway Forecast</h2>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip />
            <Line type="monotone" dataKey="cash" stroke="#00ffff" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}