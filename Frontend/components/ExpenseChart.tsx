"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#7c3aed", "#06b6d4", "#f472b6", "#facc15", "#34d399", "#f97316"];

export default function ExpenseChart({ data }: { data: any[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="futuristic-card p-6 flex items-center justify-center h-full">
        <p className="text-sm text-slate-500">No expense data</p>
      </div>
    );
  }

  return (
    <div className="futuristic-card p-6">
      <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">
        Expenses by Category
      </h2>

      <div className="chart-3d" style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <defs>
              {COLORS.map((c, i) => (
                <linearGradient key={i} id={`bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.4} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="category"
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
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 10,
                color: "#e2e8f0",
                fontSize: 12,
              }}
              formatter={(value: number | undefined) => {
                const v = value ?? 0;
                return [`$${v.toLocaleString()}`, "Amount"];
              }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#bar-${i % COLORS.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}