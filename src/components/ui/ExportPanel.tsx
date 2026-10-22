"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, AlertTriangle, Sparkles, ArrowRight, CheckCircle, Clock, Lock, Copy, Check, FileUp, Loader2 } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";
import { exportToCSV, exportChangeLog, exportQuarantined } from "@/lib/engine/exporters/csvExporter";
import { exportToXLSX } from "@/lib/engine/exporters/xlsxExporter";
import { exportSummary } from "@/lib/engine/exporters/summaryExporter";
import { trackExport } from "@/lib/analytics";
import { reconcile } from "@/lib/engine/reconcile";
import { PRO_PRICE_MONTHLY } from "@/config/plans";

function downloadBlob(content: string | Uint8Array, filename: string, mime: string) {
  const blob = content instanceof Uint8Array
    ? new Blob([content.buffer as ArrayBuffer], { type: mime })
    : // UTF-8 BOM so Excel shows accented characters correctly when opening the CSV
      new Blob([mime.startsWith("text/csv") ? "\ufeff" + content : content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const {
    parsedSheet,
    cleanedRows,
    allChanges,
    allQuarantined,
    healthReport,
    ruleConfigs,
    isPro,
    engineResult,
    cleaningTimeMs,
    resetAll,
  } = useSheetStore();
  const [showPostExport, setShowPostExport] = useState(false);
  const [exported, setExported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exportsRemaining, setExportsRemaining] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    if (isPro) return;
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${h}h ${m}m`);
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, [isPro]);

  if (!parsedSheet || !engineResult) return null;

  const cleanedHeaders =
    cleanedRows.length > 0 ? Object.keys(cleanedRows[0]) : parsedSheet.headers;
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const baseName = `${parsedSheet.fileName.replace(/\.[^.]+$/, "")}_${cleanedRows.length}rows_${timestamp}`;
  const hasWatermark = !isPro;
  const appliedRules = ruleConfigs
    .filter((rc) => rc.enabled)
    .map((rc) => rc.ruleId);

  const recordExport = async () => {
    try {
      const res = await fetch("/api/entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only what plan limits need; the file name stays in the browser (see the privacy policy)
        body: JSON.stringify({
          rowCount: cleanedRows.length,
          rulesApplied: appliedRules,
        }),
      });
      const data = await res.json();
      if (res.status === 403 && data.code === "EXPORT_LIMIT_REACHED") {
        setLimitReached(true);
        return false;
      }
      if (data.exportsRemaining !== undefined) {
        setExportsRemaining(data.exportsRemaining);
      }
      return true;
    } catch {
      return true; // Don't block export on network errors
    }
  };

  const handleExportCSV = async () => {
    setDownloading("csv");
    try {
      const allowed = await recordExport();
      if (!allowed) return;
      const csv = exportToCSV(cleanedRows, cleanedHeaders, {
        watermark: hasWatermark,
      });
      downloadBlob(csv, `${baseName}_cleaned.csv`, "text/csv;charset=utf-8");
      setExported(true);
      trackExport({ format: "csv", row_count: cleanedRows.length, is_pro: isPro });
      if (hasWatermark) setShowPostExport(true);
    } finally {
      setDownloading(null);
    }
  };

  const handleExportXLSX = async () => {
    if (!isPro) return;
    setDownloading("xlsx");
    try {
      const xlsx = await exportToXLSX(cleanedRows, cleanedHeaders);
      downloadBlob(
        xlsx,
        `${baseName}_cleaned.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      setExported(true);
      trackExport({ format: "xlsx", row_count: cleanedRows.length, is_pro: isPro });
    } finally {
      setDownloading(null);
    }
  };

  const handleExportChangeLog = () => {
    if (!isPro) return;
    const csv = exportChangeLog(allChanges, hasWatermark);
    downloadBlob(csv, `${baseName}_changelog.csv`, "text/csv;charset=utf-8");
  };

  const handleExportQuarantined = () => {
    const csv = exportQuarantined(allQuarantined, cleanedHeaders);
    downloadBlob(csv, `${baseName}_quarantined.csv`, "text/csv;charset=utf-8");
  };

  const handleExportSummary = () => {
    if (!isPro) return;
    const summary = exportSummary({
      fileName: parsedSheet.fileName,
      originalRowCount: parsedSheet.rowCount,
      cleanedRowCount: cleanedRows.length,
      changes: allChanges,
      quarantined: allQuarantined,
      healthReport,
      rulesApplied: appliedRules,
      reconciliation: engineResult
        ? reconcile(parsedSheet.rows, engineResult.cleanedRows, engineResult.snapshots, parsedSheet.headers)
        : null,
    });
    downloadBlob(summary, `${baseName}_summary.txt`, "text/plain;charset=utf-8");
  };

  return (
    <section aria-labelledby="export-heading" className="space-y-6">
      <div className="flex items-end justify-between px-2">
        <div>
          <h3 id="export-heading" className="text-2xl font-semibold text-ink tracking-tight">Export</h3>
          <p className="text-sm font-medium text-ink-muted mt-1">
            All exports are generated 100% in your browser.
          </p>
        </div>
      </div>

      {limitReached && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-base font-semibold text-rose-700">
            Daily export limit reached
          </p>
          <p className="text-sm font-medium text-rose-700 mt-1">
            Free plan allows 5 exports per day. Exports reset at midnight.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-strong transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade for unlimited exports
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Watermark Pre-export Upsell Banner */}
      {hasWatermark && !limitReached && !showPostExport && (
        <div className="p-6 border bg-accent-tint border-rule rounded-lg relative overflow-hidden group">
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-2.5 bg-accent-tint border border-rule rounded-lg text-accent flex-shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-accent">
                Remove SpreadsheetFix watermarks
              </h4>
              <p className="text-sm font-medium text-accent mt-1.5 mb-4 leading-relaxed">
                Free exports include a small &quot;Cleaned by SpreadsheetFix&quot; watermark row at the end of your data. Upgrade to Pro to remove it and unlock direct Excel (.xlsx) exports.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-strong transition-all"
              >
                <Lock className="w-4 h-4" />
                Upgrade to Pro — {PRO_PRICE_MONTHLY}/mo
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Daily Export Limit UX */}
      {!isPro && exportsRemaining !== null && !limitReached && (
        <div className="border border-rule rounded-lg p-5 bg-surface">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink-body">Daily Export Limit</span>
            <div className="flex items-center gap-1.5 text-xs text-accent font-semibold bg-accent-tint border border-rule px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              Resets in {timeUntilReset}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden border border-rule">
              <div
                className={`h-full rounded-full transition-all duration-700 ${exportsRemaining <= 1 ? "bg-accent text-accent" : "bg-accent text-accent"}`}
                style={{ width: `${((5 - exportsRemaining) / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-ink w-24 text-right">
              {exportsRemaining} / 5 left
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-label="Export options">
        <button
          onClick={handleExportCSV}
          disabled={limitReached || downloading === "csv"}
          aria-label={`Download cleaned CSV with ${cleanedRows.length} rows`}
          className="flex items-center gap-4 p-5 border bg-accent-tint border-rule-strong rounded-lg transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden animate-pulse hover:animate-none"
        >
          <div className="p-3 bg-surface border border-rule rounded-lg group-hover:bg-accent-tint transition-colors relative z-10">
            {downloading === "csv" ? (
              <Loader2 className="w-6 h-6 text-accent animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-6 h-6 text-accent" aria-hidden="true" />
            )}
          </div>
          <div className="relative z-10">
            <p className="font-semibold text-ink text-base group-hover:text-accent transition-colors tracking-tight">
              {downloading === "csv" ? "Exporting…" : "Cleaned CSV"}
            </p>
            <p className="text-sm font-medium mt-1 text-accent">
              {cleanedRows.length.toLocaleString()} rows
            </p>
          </div>
        </button>

        <button
          onClick={handleExportXLSX}
          disabled={!isPro || downloading === "xlsx"}
          aria-label={isPro ? `Download Excel file with ${cleanedRows.length} rows` : "Excel export requires Pro plan"}
          className="flex items-center gap-4 p-5 bg-paper border border-rule rounded-lg hover:border-rule-strong hover:bg-surface transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 group relative overflow-hidden"
        >
          <div className="p-3 bg-surface border border-rule rounded-lg group-hover:border-rule-strong group-hover:bg-accent-tint transition-colors relative z-10">
            {downloading === "xlsx" ? (
              <Loader2 className="w-6 h-6 text-accent animate-spin" aria-hidden="true" />
            ) : (
              <FileSpreadsheet className={`w-6 h-6 ${isPro ? "text-accent" : "text-ink-muted"}`} aria-hidden="true" />
            )}
          </div>
          <div className="relative z-10">
            <p className="font-semibold text-ink text-base group-hover:text-accent transition-colors tracking-tight">
              {downloading === "xlsx" ? "Exporting…" : "Excel (.xlsx)"}{" "}
              {!isPro && (
                <span className="text-xs bg-accent-tint text-accent border border-rule px-1.5 py-0.5 rounded ml-1 font-semibold uppercase tracking-wider">Pro</span>
              )}
            </p>
            <p className="text-sm text-ink-muted font-medium mt-1">
              {cleanedRows.length.toLocaleString()} rows
            </p>
          </div>
        </button>

        <button
          onClick={handleExportChangeLog}
          disabled={!isPro}
          aria-label={isPro ? `Download change log with ${allChanges.length} changes` : "Change log export requires a paid plan"}
          className="flex items-center gap-4 p-5 bg-paper border border-rule rounded-lg hover:border-rule-strong hover:bg-surface transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="p-3 bg-surface border border-rule rounded-lg group-hover:border-rule-strong group-hover:bg-accent-tint transition-colors">
            <FileText className={`w-6 h-6 ${isPro ? "text-accent" : "text-ink-muted"}`} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-ink text-base group-hover:text-accent transition-colors tracking-tight">
              Change Log{" "}
              {!isPro && (
                <span className="text-xs bg-accent-tint text-accent border border-rule px-1.5 py-0.5 rounded ml-1 font-semibold uppercase tracking-wider">Pro</span>
              )}
            </p>
            <p className="text-sm text-ink-muted font-medium mt-1">
              {allChanges.length.toLocaleString()} changes
            </p>
          </div>
        </button>

        {allQuarantined.length > 0 && (
          <button
            onClick={handleExportQuarantined}
            className="flex items-center gap-4 p-5 bg-paper border border-rule rounded-lg hover:border-rule-strong hover:bg-surface transition-all duration-300 text-left group"
          >
            <div className="p-3 bg-surface border border-rule rounded-lg group-hover:border-rule-strong group-hover:bg-accent-tint transition-colors">
              <AlertTriangle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-ink text-base group-hover:text-accent transition-colors tracking-tight">
                Quarantined Rows
              </p>
              <p className="text-sm text-ink-muted font-medium mt-1">
                {allQuarantined.length.toLocaleString()} rows
              </p>
            </div>
          </button>
        )}

        <button
          onClick={handleExportSummary}
          disabled={!isPro}
          aria-label={isPro ? "Download summary report" : "Summary report requires a paid plan"}
          className="flex items-center gap-4 p-5 bg-paper border border-rule rounded-lg hover:border-rule-strong hover:bg-surface transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="p-3 bg-surface border border-rule rounded-lg group-hover:border-rule-strong group-hover:bg-accent-tint transition-colors">
            <FileText className={`w-6 h-6 ${isPro ? "text-accent" : "text-ink-muted"}`} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-ink text-base group-hover:text-accent transition-colors tracking-tight">
              Summary Report{" "}
              {!isPro && (
                <span className="text-xs bg-accent-tint text-accent border border-rule px-1.5 py-0.5 rounded ml-1 font-semibold uppercase tracking-wider">Pro</span>
              )}
            </p>
            <p className="text-sm text-ink-muted font-medium mt-1">Plain text overview</p>
          </div>
        </button>
      </div>

      {showPostExport && (
        <div className="p-5 border bg-emerald-50 border-emerald-200 rounded-lg animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex-shrink-0 mt-0.5">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-700 text-lg tracking-tight">
                File exported with watermark
              </p>
              <p className="text-sm font-medium text-emerald-700 mt-1">
                Upgrade to Pro to remove watermarks, unlock Excel export, and access all 17 cleaning rules.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-ink text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Remove limits — {PRO_PRICE_MONTHLY}/mo
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowPostExport(false)}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-export: shareable badge + clean another file */}
      {exported && (() => {
        const changedCount = allChanges.filter((c) => c.changeType === "changed").length;
        const timeStr = cleaningTimeMs < 1000
          ? `${cleaningTimeMs}ms`
          : `${(cleaningTimeMs / 1000).toFixed(1)}s`;
        const shareText = `Cleaned ${changedCount.toLocaleString()} cells in ${timeStr} with SpreadsheetFix`;

        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Shareable badge */}
            <div className="bg-paper border border-rule rounded-lg p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <p className="text-sm font-semibold text-ink-body truncate">{shareText}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-accent bg-surface hover:bg-rule border border-rule hover:border-rule-strong rounded-lg transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clean another file */}
            <button
              onClick={resetAll}
              className="w-full flex items-center justify-center gap-2 p-4 bg-paper border border-rule hover:border-rule-strong rounded-lg text-ink-body hover:text-accent font-semibold transition-all hover:bg-accent-tint group"
            >
              <FileUp className="w-5 h-5 transition-transform" />
              Clean another file
            </button>
          </div>
        );
      })()}
    </section>
  );
}
