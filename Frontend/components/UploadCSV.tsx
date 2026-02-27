"use client";

import { useState, useRef, DragEvent } from "react";
import { uploadCSV, getMetrics } from "../services/api";

export default function UploadCSV({ onData }: { onData: (d: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => setFile(f);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadCSV(file);
      const metrics = await getMetrics();
      onData(metrics);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Upload failed. Check that the file is a valid CSV.";
      alert(msg);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="futuristic-card p-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-xl">📁</span> Upload Financial Data
      </h2>

      {/* Drop zone */}
      <div
        className={`drop-zone p-8 text-center mb-4 ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx,.tsv,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {file ? (
          <div>
            <p className="text-cyan-400 font-medium">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB &middot; Click or drop to replace
            </p>
          </div>
        ) : (
          <div>
            <p className="text-slate-400">
              Drag &amp; drop your file here, or <span className="text-cyan-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">CSV, XLS, XLSX, TSV, TXT</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="neon-btn w-full text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
      >
        {uploading ? "Analyzing..." : "Upload & Analyze"}
      </button>
    </div>
  );
}