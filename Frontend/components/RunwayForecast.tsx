"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function RunwayForecast({ cash, burn }: { cash: number; burn: number }) {
  if (isNaN(cash) || isNaN(burn) || burn <= 0) {
    return (
      <div className="futuristic-card p-6 flex items-center justify-center h-full">
        <p className="text-sm text-slate-500">Runway data unavailable</p>
      </div>
    );
  }

  const data: { month: string; cash: number }[] = [];
  let cur = cash;
  for (let i = 0; i <= 12; i++) {
    data.push({ month: `M${i}`, cash: Math.max(cur, 0) });
    cur -= burn;
  }

  // Find 0-crossing month
  const zeroMonth = Math.ceil(cash / burn);

  return (
    <div className="futuristic-card p-6">
      <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">
        12-Month Cash Forecast
      </h2>

      <div className="chart-3d" style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.95)",
                border: "1px solid rgba(6,182,212,0.3)",
                borderRadius: 10,
                color: "#e2e8f0",
                fontSize: 12,
              }}
              formatter={(value: number | undefined) => {
                const v = value ?? 0;
                return [`$${v.toLocaleString()}`, "Cash"];
              }}
            />
            {zeroMonth <= 12 && (
              <ReferenceLine
                x={`M${zeroMonth}`}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "Cash-out", fill: "#ef4444", fontSize: 10, position: "top" }}
              />
            )}
            <Area
              type="monotone"
              dataKey="cash"
              stroke="#06b6d4"
              strokeWidth={3}
              fill="url(#cashGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}