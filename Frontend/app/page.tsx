"use client";

import { useState } from "react";
import UploadCSV from "../components/UploadCSV";
import Dashboard from "../components/Dashboard";
import OptimizationPanel from "../components/OptimizationPanel";
import RecommendedPlan from "../components/RecommendedPlan";

export default function Home() {

  const [data, setData] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);

  return (
    <main className="p-10 min-h-screen text-center flex flex-col items-center justify-center">

      <header className="mb-6">
        <h1 className="text-4xl font-extrabold mb-2 neon-text muted-glow">AI CFO Runway Optimizer</h1>
        <p className="text-sm text-slate-300">Actionable runway guidance with a futuristic UI</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <section className="lg:col-span-1">
          <UploadCSV onData={setData} />
          {data && <OptimizationPanel setPlan={setPlan} />}
        </section>

        <section className="lg:col-span-2">
          {data && <Dashboard data={data} />}

          {plan && <RecommendedPlan plan={plan} />}
        </section>

      </div>

    </main>
  );
}