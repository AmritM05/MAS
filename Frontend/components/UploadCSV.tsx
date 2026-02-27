"use client";

import { useState } from "react";
import { uploadCSV } from "../services/api";

export default function UploadCSV({ onData }: any) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a CSV file");
      return;
    }

    try {
      await uploadCSV(file);
      // after upload we need the server to compute metrics
      const metrics = await getMetrics();
      onData(metrics);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div className="futuristic-card p-4 mt-4">

      <h2 className="text-lg font-semibold text-slate-200 mb-2">Upload Financial CSV</h2>

      <div className="flex items-center">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />

        <button onClick={handleUpload} className="neon-btn text-white px-4 py-2 rounded ml-3">Upload</button>
      </div>

    </div>
  );
}