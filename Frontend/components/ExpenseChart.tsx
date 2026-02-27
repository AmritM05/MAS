"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function ExpenseChart({ data }: any) {
  return (
    <div className="p-6 border rounded shadow">

      <h2 className="text-xl font-bold mb-4">
        Expenses by Category
      </h2>

      <BarChart
        width={500}
        height={300}
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="amount" fill="#3b82f6" />
      </BarChart>

    </div>
  );
}