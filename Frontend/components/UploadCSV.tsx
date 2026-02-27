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
      const data = await uploadCSV(file);
      onData(data);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div className="p-4 border rounded shadow mt-4">

      <h2 className="text-lg font-bold mb-2">
        Upload Financial CSV
      </h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) =>
          setFile(e.target.files ? e.target.files[0] : null)
        }
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded ml-3"
      >
        Upload
      </button>

    </div>
  );
}