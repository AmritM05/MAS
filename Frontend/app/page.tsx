"use client";

import UploadCSV from "../components/UploadCSV";
import Dashboard from "../components/Dashboard";
import { useData } from "../context/DataContext";

export default function Home() {
  const { metrics, setMetrics } = useData();

  return (
    <div>
      {!metrics ? (
        <div className="max-w-md mx-auto mt-8">
          <UploadCSV onData={setMetrics} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Compact re-upload */}
          <div className="flex justify-end">
            <UploadCSV onData={setMetrics} compact />
          </div>
          <Dashboard data={metrics} />
        </div>
      )}
    </div>
  );
}