"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ExpenseChart({ data }: any) {
  return (
    <div className="p-6 futuristic-card">

      <h2 className="text-lg font-semibold text-slate-200 mb-4">Expenses by Category</h2>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="category" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip />
            <Bar dataKey="amount" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}