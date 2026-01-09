"use client";

import { useState } from "react";

export default function ImportsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setCsvText("");
    setError(null);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setCsvText(result);
      } else {
        setError("Failed to read file as text.");
      }
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-[#F8FAFC] p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Imports</h1>
        <p className="text-[#94A3B8]">
          Upload CSV files to import products, inventory, or sales data
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Upload CSV</h2>

        <label
          htmlFor="csv-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#334155] rounded-lg cursor-pointer hover:border-[#06B6D4] transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-[#94A3B8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-[#94A3B8]">
              <span className="font-semibold text-[#06B6D4]">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-[#64748B]">CSV files only</p>
          </div>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Selected file display */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-[#334155]/50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-[#F8FAFC]">{selectedFile.name}</span>
            <span className="text-xs text-[#94A3B8]">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
