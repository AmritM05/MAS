"use client";

import { useState, useRef, DragEvent } from "react";
import { uploadCSV, getMetrics } from "../services/api";
import { useData } from "../context/DataContext";

interface Props {
  onData: (d: any) => void;
  compact?: boolean;
}

export default function UploadCSV({ onData, compact = false }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { cashBalance } = useData();

  const handleFile = (f: File) => {
    setFile(f);
    // Auto-upload in compact mode
    if (compact) {
      doUpload(f);
    }
  };

  const doUpload = async (uploadFile: File) => {
    setUploading(true);
    try {
      await uploadCSV(uploadFile);
      const metrics = await getMetrics(cashBalance);
      onData(metrics);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        "Upload failed. Check that the file is a valid CSV.";
      alert(msg);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    doUpload(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  // ── Compact mode: small button only ───────────────────
  if (compact) {
    return (
      <>
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
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {uploading ? "Re-uploading..." : "↻ Upload new file"}
        </button>
      </>
    );
  }

  // ── Full mode: drop zone + button ─────────────────────
  return (
    <div className="futuristic-card p-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-xl">📁</span> Upload Financial Data
      </h2>

      <div
        className={`drop-zone p-8 text-center mb-4 ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
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
              {(file.size / 1024).toFixed(1)} KB &middot; Click or drop to
              replace
            </p>
          </div>
        ) : (
          <div>
            <p className="text-slate-400">
              Drag &amp; drop your file here, or{" "}
              <span className="text-cyan-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              CSV, XLS, XLSX, TSV, TXT
            </p>
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