"use client";

import { useData } from "../../context/DataContext";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const COLORS = ["#7c3aed", "#06b6d4", "#f472b6", "#facc15", "#34d399", "#f97316", "#a78bfa", "#fb923c"];

export default function ExpensesPage() {
  const { metrics } = useData();

  if (!metrics) {
    return (
      <div className="futuristic-card p-12 text-center max-w-lg mx-auto">
        <p className="text-4xl mb-3 opacity-30">💸</p>
        <p className="text-slate-400 mb-4">Upload data first to see expense details.</p>
        <Link href="/" className="neon-btn px-6 py-2 rounded-lg text-sm text-white">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const expenses: { category: string; amount: number }[] = metrics.expenses || [];
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  // Add percentage to each
  const enriched = expenses.map((e) => ({
    ...e,
    pct: totalExpense > 0 ? ((e.amount / totalExpense) * 100).toFixed(1) : "0",
  }));

  // Pie data
  const pieData = enriched.map((e, i) => ({
    name: e.category,
    value: e.amount,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Total expense hero */}
      <div className="futuristic-card p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Total Expenses</p>
        <p className="stat-value text-5xl text-rose-400">${totalExpense.toLocaleString()}</p>
        <p className="text-slate-500 text-sm mt-1">across {expenses.length} categories</p>
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="futuristic-card p-6">
          <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">By Category (Bar)</h2>
          <div className="chart-3d" style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enriched} barCategoryGap="20%">
                <defs>
                  {COLORS.map((c, i) => (
                    <linearGradient key={i} id={`ebar-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={false}
                  contentStyle={{ background: "rgba(218, 220, 226, 0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, color: "#000000", fontSize: 12 }}
                  formatter={(value: number | undefined) => [`$${Number(value ?? 0).toLocaleString()}`, "Amount"]}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} activeBar={false}>
                  {enriched.map((_, i) => (
                    <Cell key={i} fill={`url(#ebar-${i % COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="futuristic-card p-6">
          <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-4">Distribution (Pie)</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgba(218, 220, 226, 0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, color: "#000000", fontSize: 12 }}
                  formatter={(value: number | undefined) => [`$${Number(value ?? 0).toLocaleString()}`, "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed table */}
      <div className="futuristic-card p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Expense Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
              <th className="py-2 text-left">Category</th>
              <th className="py-2 text-right">Amount</th>
              <th className="py-2 text-right">% of Total</th>
              <th className="py-2 text-right">Monthly Avg</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((e, i) => (
              <tr key={i} className="border-b border-white/[0.03]">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-200">{e.category}</span>
                  </div>
                </td>
                <td className="py-3 text-right font-mono text-slate-300">${e.amount.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${e.pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <span className="text-slate-400 w-12 text-right">{e.pct}%</span>
                  </div>
                </td>
                <td className="py-3 text-right font-mono text-slate-400">
                  ${Math.round(e.amount / 6).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="py-3 text-slate-200 font-semibold">Total</td>
              <td className="py-3 text-right font-mono text-slate-200 font-semibold">
                ${totalExpense.toLocaleString()}
              </td>
              <td className="py-3 text-right text-slate-400">100%</td>
              <td className="py-3 text-right font-mono text-slate-400">
                ${Math.round(totalExpense / 6).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
