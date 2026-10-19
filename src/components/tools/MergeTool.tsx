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
        className={`glass-panel border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
          dragging ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary/50"
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
        <Upload className="w-10 h-10 mx-auto text-slate-400 mb-4" aria-hidden="true" />
        <p className="text-lg font-bold text-slate-200">Drop two or more files to merge</p>
        <p className="text-sm text-slate-400 mt-2">CSV, TSV or XLSX — processed in your browser, never uploaded</p>
      </div>

      {busy && (
        <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Reading files…
        </p>
      )}

      {error && (
        <div role="alert" className="mt-4 flex items-center gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-sm font-bold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {sheets.length > 0 && (
        <div className="mt-6 glass-panel rounded-2xl border border-primary/10 p-5">
          <ul className="divide-y divide-primary/10">
            {sheets.map((s, i) => (
              <li key={`${s.fileName}-${i}`} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2 text-slate-200 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{s.fileName}</span>
                  <span className="text-slate-500 flex-shrink-0">
                    {s.rowCount.toLocaleString()} rows · {s.columnCount} cols
                  </span>
                </span>
                <button
                  onClick={() => {
                    setSheets((prev) => prev.filter((_, j) => j !== i));
                    setResult(null);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400"
                  aria-label={`Remove ${s.fileName}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={dedupe}
              onChange={(e) => {
                setDedupe(e.target.checked);
                setResult(null);
              }}
              className="accent-[#0df2df]"
            />
            Remove duplicate rows across files
          </label>

          <button
            onClick={merge}
            disabled={sheets.length < 2}
            className="mt-4 w-full py-3 bg-primary text-background-dark rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sheets.length < 2 ? "Add at least two files" : `Merge ${sheets.length} files`}
          </button>
        </div>
      )}

      {result && (
        <div role="status" className="mt-6 glass-panel rounded-2xl border border-primary/30 p-5">
          <p className="text-slate-200 font-bold">
            Merged {result.rows.length.toLocaleString()} rows into {result.headers.length} columns
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {result.duplicatesRemoved > 0 && `${result.duplicatesRemoved.toLocaleString()} duplicate rows removed. `}
            Columns: {result.headers.join(", ")}
          </p>
          {result.truncatedFrom && (
            <p className="text-sm text-amber-400 mt-3">
              The merged file has {result.truncatedFrom.toLocaleString()} rows; the free plan keeps the first{" "}
              {FREE_ROW_LIMIT.toLocaleString()}.{" "}
              <Link href="/pricing" className="underline font-bold">
                Upgrade to Pro
              </Link>{" "}
              to merge up to 500,000 rows.
            </p>
          )}
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button
              onClick={download}
              className="inline-flex items-center justify-center gap-2 py-3 bg-primary text-background-dark rounded-xl font-bold hover:brightness-110"
            >
              <Download className="w-4 h-4" aria-hidden="true" /> Download merged CSV
            </button>
            <button
              onClick={cleanMerged}
              className="inline-flex items-center justify-center gap-2 py-3 glass-panel border border-primary/30 text-slate-200 rounded-xl font-bold hover:bg-primary/10"
            >
              <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" /> Clean the merged file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
