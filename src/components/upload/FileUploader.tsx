"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";

const ACCEPTED_TYPES = [
  "text/csv",
  "text/tab-separated-values",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ACCEPTED_EXTENSIONS = [".csv", ".tsv", ".xlsx", ".xls"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploader() {
  const { importFile, loadDemoData, error } = useSheetStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        useSheetStore.getState().setError("Unsupported file type. Please upload CSV, TSV, or XLSX.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        useSheetStore.getState().setError("File too large. Maximum size is 50MB.");
        return;
      }
      importFile(file);
    },
    [importFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a CSV, TSV, or XLSX file. Drag and drop or click to browse."
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
          ${isDragging
            ? "border-teal-500 bg-teal-50"
            : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={onFileSelect}
          className="hidden"
          aria-label="Select file to upload"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragging ? "bg-teal-100" : "bg-gray-100"}`}>
            <Upload className={`w-8 h-8 ${isDragging ? "text-teal-600" : "text-gray-400"}`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragging ? "Drop your file here" : "Drag & drop your file"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse — CSV, TSV, XLSX up to 50MB
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileSpreadsheet className="w-4 h-4" />
            <span>100% client-side. Your data never leaves your browser.</span>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            loadDemoData();
          }}
          className="text-sm text-teal-600 hover:text-teal-700 underline underline-offset-2"
        >
          Try with a demo file instead
        </button>
      </div>
    </div>
  );
}
