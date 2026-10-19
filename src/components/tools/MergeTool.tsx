"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, X, Download, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { parseFile } from "@/lib/engine/parsers";
import { exportToCSV } from "@/lib/engine/exporters/csvExporter";
import { mergeSheets, type MergeResult } from "@/lib/engine/merge";
import { useSheetStore, FREE_ROW_LIMIT } from "@/store/sheetStore";
import { EntitlementsSync } from "@/components/billing/EntitlementsSync";
import type { ParsedSheet } from "@/types/sheet";

const ACCEPT = ".csv,.tsv,.txt,.xlsx,.xls";

export function MergeTool() {
  const router = useRouter();
  const isPro = useSheetStore((s) => s.isPro);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [dedupe, setDedupe] = useState(true);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const parsed = await Promise.all(Array.from(files).map((f) => parseFile(f)));
      setSheets((prev) => [...prev, ...parsed]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read one of the files.");
    } finally {
      setBusy(false);
    }
  }, []);

  const merge = () => {
    setResult(mergeSheets(sheets, { dedupe, maxRows: isPro ? undefined : FREE_ROW_LIMIT }));
  };

  const download = () => {
    if (!result) return;
    const csv = exportToCSV(result.rows, result.headers, { watermark: !isPro });
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cleanMerged = async () => {
    if (!result) return;
    const csv = exportToCSV(result.rows, result.headers);
    const store = useSheetStore.getState();
    store.resetAll();
    await store.importFile(new File([csv], "merged.csv", { type: "text/csv" }));
    router.push("/clean");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <EntitlementsSync />
      <div
        role="button"
        tabIndex={0}
        aria-label="Add CSV or Excel files to merge. Drag and drop or click to browse."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`bg-paper border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
          dragging ? "border-accent bg-accent-tint" : "border-rule hover:border-rule-strong"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          aria-label="Select files to merge"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Upload className="w-10 h-10 mx-auto text-ink-muted mb-4" aria-hidden="true" />
        <p className="text-lg font-semibold text-ink">Drop two or more files to merge</p>
        <p className="text-sm text-ink-muted mt-2">CSV, TSV or XLSX — processed in your browser, never uploaded</p>
      </div>

      {busy && (
        <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-muted">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Reading files…
        </p>
      )}

      {error && (
        <div role="alert" className="mt-4 flex items-center gap-3 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {sheets.length > 0 && (
        <div className="mt-6 bg-paper border rounded-lg border-rule p-5">
          <ul className="divide-y divide-rule">
            {sheets.map((s, i) => (
              <li key={`${s.fileName}-${i}`} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2 text-ink min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{s.fileName}</span>
                  <span className="text-ink-muted flex-shrink-0">
                    {s.rowCount.toLocaleString()} rows · {s.columnCount} cols
                  </span>
                </span>
                <button
                  onClick={() => {
                    setSheets((prev) => prev.filter((_, j) => j !== i));
                    setResult(null);
                  }}
                  className="p-1 text-ink-muted hover:text-rose-700"
                  aria-label={`Remove ${s.fileName}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          <label className="mt-4 flex items-center gap-2 text-sm text-ink-body">
            <input
              type="checkbox"
              checked={dedupe}
              onChange={(e) => {
                setDedupe(e.target.checked);
                setResult(null);
              }}
              className="accent-[#1f3d99]"
            />
            Remove duplicate rows across files
          </label>

          <button
            onClick={merge}
            disabled={sheets.length < 2}
            className="mt-4 w-full py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-strong transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sheets.length < 2 ? "Add at least two files" : `Merge ${sheets.length} files`}
          </button>
        </div>
      )}

      {result && (
        <div role="status" className="mt-6 bg-paper border rounded-lg border-rule-strong p-5">
          <p className="text-ink font-semibold">
            Merged {result.rows.length.toLocaleString()} rows into {result.headers.length} columns
          </p>
          <p className="text-sm text-ink-muted mt-1">
            {result.duplicatesRemoved > 0 && `${result.duplicatesRemoved.toLocaleString()} duplicate rows removed. `}
            Columns: {result.headers.join(", ")}
          </p>
          {result.truncatedFrom && (
            <p className="text-sm text-amber-700 mt-3">
              The merged file has {result.truncatedFrom.toLocaleString()} rows; the free plan keeps the first{" "}
              {FREE_ROW_LIMIT.toLocaleString()}.{" "}
              <Link href="/pricing" className="underline font-semibold">
                Upgrade to Pro
              </Link>{" "}
              to merge up to 500,000 rows.
            </p>
          )}
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button
              onClick={download}
              className="inline-flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-strong"
            >
              <Download className="w-4 h-4" aria-hidden="true" /> Download merged CSV
            </button>
            <button
              onClick={cleanMerged}
              className="inline-flex items-center justify-center gap-2 py-3 bg-paper border border-rule-strong text-ink rounded-lg font-semibold hover:bg-accent-tint"
            >
              <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" /> Clean the merged file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
