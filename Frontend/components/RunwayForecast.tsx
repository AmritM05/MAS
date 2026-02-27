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
    <div className="p-6 border rounded shadow">

      <h2 className="text-xl font-bold mb-4">
        Cash Runway Forecast
      </h2>

      <LineChart
        width={500}
        height={300}
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="cash"
          stroke="#ef4444"
          strokeWidth={3}
        />
      </LineChart>

    </div>
  );
}