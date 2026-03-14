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
        className={`glass-panel border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer relative overflow-hidden group
          transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark
          ${isDragging
            ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(13,242,223,0.15)]"
            : "border-primary/20 hover:border-primary/50 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(13,242,223,0.05)]"
          }
        `}
      >
        {isDragging && (
           <div className="absolute inset-0 bg-primary/10 w-full h-full animate-pulse blur-3xl pointer-events-none" />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={onFileSelect}
          className="hidden"
          aria-label="Select file to upload"
        />

        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className={`p-5 rounded-2xl transition-colors duration-300 ${isDragging ? "bg-primary/20 shadow-[0_0_20px_rgba(13,242,223,0.3)]" : "bg-slate-800/80 border border-slate-700/50 group-hover:border-primary/30"}`}>
            <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragging ? "text-primary drop-shadow-[0_0_8px_rgba(13,242,223,0.8)]" : "text-slate-400 group-hover:text-primary"}`} />
          </div>

          <div>
            <p className={`text-xl font-bold transition-colors ${isDragging ? "text-primary neon-text-glow" : "text-slate-200"}`}>
              {isDragging ? "Drop your file here" : "Drag & drop your file"}
            </p>
            <p className="text-sm font-medium text-slate-400 mt-2">
              or click to browse — CSV, TSV, XLSX up to 50MB
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-2 group-hover:text-slate-400 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            <span>100% client-side. Your data never leaves your browser.</span>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 flex items-center gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-sm font-bold shadow-[0_0_20px_rgba(244,63,94,0.1)] animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Don&apos;t have a file ready?</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            loadDemoData();
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 glass-panel text-slate-300 font-bold rounded-xl hover:border-primary hover:text-primary transition-all duration-300 border border-slate-700 hover:shadow-[0_0_20px_rgba(13,242,223,0.1)] group"
        >
          <FileSpreadsheet className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          Try with Demo Data
        </button>
      </div>
    </div>
  );
}
