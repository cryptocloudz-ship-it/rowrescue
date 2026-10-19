"use client";

import { useCallback, useRef, useState } from "react";
import { useSheetStore } from "@/store/sheetStore";
import { ACCEPTED_TYPES, validateFile } from "./fileValidation";

export function FileUploader() {
  const { importFile, loadDemoData, error } = useSheetStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const problem = validateFile(file);
      if (problem) {
        useSheetStore.getState().setError(problem);
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
    <div className="w-full max-w-2xl mx-auto font-ui">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a CSV, TSV, or XLSX file. Drag and drop or click to browse."
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
        className={`flex flex-col items-start gap-3 p-8 rounded-lg border border-dashed cursor-pointer transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-accent ${
          isDragging ? "border-accent bg-accent-tint" : "border-[#b8c0cc] bg-surface hover:border-ink-muted"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={onFileSelect}
          className="hidden"
          aria-label="Select file to upload"
        />
        <span className="inline-flex items-center min-h-12 px-[22px] rounded-md bg-accent text-white text-base font-semibold hover:bg-accent-strong transition-colors">
          Choose a file
        </span>
        <span className="text-sm text-ink-muted">
          {isDragging ? "Drop to open it" : "or drop a CSV, TSV or Excel file here, up to 50 MB"}
        </span>
        <span className="text-[13px] text-ink-muted">Processed in your browser. Nothing is uploaded.</span>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <p className="mt-5 text-sm text-ink-muted">
        No file to hand?{" "}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            loadDemoData();
          }}
          className="text-accent hover:text-accent-strong underline underline-offset-2 font-medium"
        >
          Try it with sample data
        </button>
      </p>
    </div>
  );
}
