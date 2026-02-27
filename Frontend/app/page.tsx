"use client";

import { useState } from "react";
import UploadCSV from "../components/UploadCSV";
import Dashboard from "../components/Dashboard";
import OptimizationPanel from "../components/OptimizationPanel";

export default function Home() {

  const [data, setData] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        AI CFO Runway Optimizer
      </h1>

      <UploadCSV onData={setData} />

      {data && <Dashboard data={data} />}

      {data && (
        <OptimizationPanel setPlan={setPlan} />
      )}

      {plan && (
        <div className="mt-6 p-4 border rounded shadow">

          <h2 className="font-bold mb-2">
            Recommended Plan
          </h2>

          <pre className="bg-gray-100 p-3 rounded">
            {JSON.stringify(plan, null, 2)}
          </pre>

        </div>
      )}

    </main>
  );
}