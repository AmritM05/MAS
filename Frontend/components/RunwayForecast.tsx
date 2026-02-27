"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function RunwayForecast({ cash, burn }: any) {

  const data = [];

  let currentCash = cash;

  for (let i = 0; i <= 12; i++) {
    data.push({
      month: `Month ${i}`,
      cash: currentCash
    });

    currentCash = currentCash - burn;
  }

  return (
    <div className="p-6 futuristic-card">

      <h2 className="text-lg font-semibold text-slate-200 mb-4">Cash Runway Forecast</h2>

      <LineChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" />
        <YAxis stroke="rgba(255,255,255,0.4)" />
        <Tooltip />
        <Line type="monotone" dataKey="cash" stroke="#7c3aed" strokeWidth={3} />
      </LineChart>

    </div>
  );
}