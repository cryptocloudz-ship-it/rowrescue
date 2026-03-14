"use client";

import { useState, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, AlertTriangle, Sparkles, ArrowRight, CheckCircle, Clock, Lock } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";
import { exportToCSV, exportChangeLog, exportQuarantined } from "@/lib/engine/exporters/csvExporter";
import { exportToXLSX } from "@/lib/engine/exporters/xlsxExporter";
import { exportSummary } from "@/lib/engine/exporters/summaryExporter";

function downloadBlob(content: string | Uint8Array, filename: string, mime: string) {
  const blob = content instanceof Uint8Array
    ? new Blob([content.buffer as ArrayBuffer], { type: mime })
    : new Blob([content], { type: mime });
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
  } = useSheetStore();
  const [showPostExport, setShowPostExport] = useState(false);
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
        body: JSON.stringify({
          fileName: parsedSheet.fileName,
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
    const allowed = await recordExport();
    if (!allowed) return;
    const csv = exportToCSV(cleanedRows, cleanedHeaders, {
      watermark: hasWatermark,
    });
    downloadBlob(csv, `${baseName}_cleaned.csv`, "text/csv;charset=utf-8");
    if (hasWatermark) setShowPostExport(true);
  };

  const handleExportXLSX = async () => {
    if (!isPro) return;
    const xlsx = await exportToXLSX(cleanedRows, cleanedHeaders);
    downloadBlob(
      xlsx,
      `${baseName}_cleaned.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  };

  const handleExportChangeLog = () => {
    const csv = exportChangeLog(allChanges, hasWatermark);
    downloadBlob(csv, `${baseName}_changelog.csv`, "text/csv;charset=utf-8");
  };

  const handleExportQuarantined = () => {
    const csv = exportQuarantined(allQuarantined, cleanedHeaders);
    downloadBlob(csv, `${baseName}_quarantined.csv`, "text/csv;charset=utf-8");
  };

  const handleExportSummary = () => {
    const summary = exportSummary({
      fileName: parsedSheet.fileName,
      originalRowCount: parsedSheet.rowCount,
      cleanedRowCount: cleanedRows.length,
      changes: allChanges,
      quarantined: allQuarantined,
      healthReport,
      rulesApplied: appliedRules,
    });
    downloadBlob(summary, `${baseName}_summary.txt`, "text/plain;charset=utf-8");
  };

  return (
    <section aria-labelledby="export-heading" className="space-y-6">
      <div className="flex items-end justify-between px-2">
        <div>
          <h3 id="export-heading" className="text-2xl font-extrabold text-slate-100 tracking-tight">Export</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">
            All exports are generated 100% in your browser.
          </p>
        </div>
      </div>

      {limitReached && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]">
          <p className="text-base font-bold text-rose-400">
            Daily export limit reached
          </p>
          <p className="text-sm font-medium text-rose-300 mt-1">
            Free plan allows 5 exports per day. Exports reset at midnight.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500 text-slate-900 text-sm font-extrabold rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade for unlimited exports
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Watermark Pre-export Upsell Banner */}
      {hasWatermark && !limitReached && !showPostExport && (
        <div className="p-6 glass-panel bg-amber-500/5 border border-amber-500/20 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-500" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 flex-shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6 drop-shadow" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-amber-100">
                Remove RowRescue watermarks
              </h4>
              <p className="text-sm font-medium text-amber-200/70 mt-1.5 mb-4 leading-relaxed">
                Free exports include a small &quot;Cleaned by RowRescue&quot; watermark row at the end of your data. Upgrade to Pro to remove it and unlock direct Excel (.xlsx) exports.
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-900 text-sm font-extrabold rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              >
                <Lock className="w-4 h-4" />
                Upgrade to Pro — €12/mo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Daily Export Limit UX */}
      {!isPro && exportsRemaining !== null && !limitReached && (
        <div className="glass-panel border-slate-700/50 rounded-2xl p-5 bg-slate-800/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-300">Daily Export Limit</span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              Resets in {timeUntilReset}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-700 shadow-[0_0_10px_currentColor] ${exportsRemaining <= 1 ? "bg-amber-500 text-amber-500" : "bg-primary text-primary"}`}
                style={{ width: `${((5 - exportsRemaining) / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-extrabold text-slate-200 w-24 text-right">
              {exportsRemaining} / 5 left
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-label="Export options">
        <button
          onClick={handleExportCSV}
          disabled={limitReached}
          aria-label={`Download cleaned CSV with ${cleanedRows.length} rows`}
          className="flex items-center gap-4 p-5 glass-panel bg-primary/10 border border-primary/30 rounded-2xl hover:shadow-[0_0_30px_rgba(13,242,223,0.15)] shadow-[inset_0_0_20px_rgba(13,242,223,0.05)] hover:-translate-y-1 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden animate-pulse hover:animate-none"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-500" />
          <div className="p-3 bg-slate-900/50 border border-primary/20 rounded-xl group-hover:bg-primary/20 transition-colors shadow-[0_0_15px_rgba(13,242,223,0.1)] relative z-10">
            <Download className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(13,242,223,0.8)]" aria-hidden="true" />
          </div>
          <div className="relative z-10">
            <p className="font-extrabold text-slate-100 text-base group-hover:text-primary transition-colors tracking-tight">Cleaned CSV</p>
            <p className="text-sm font-medium mt-1 text-primary/80">
              {cleanedRows.length.toLocaleString()} rows
            </p>
          </div>
        </button>

        <button
          onClick={handleExportXLSX}
          disabled={!isPro}
          aria-label={isPro ? `Download Excel file with ${cleanedRows.length} rows` : "Excel export requires Pro plan"}
          className="flex items-center gap-4 p-5 glass-panel border border-primary/10 rounded-2xl hover:border-primary/30 hover:bg-white/5 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group relative overflow-hidden"
        >
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors relative z-10">
            <FileSpreadsheet className={`w-6 h-6 ${isPro ? "text-primary drop-shadow-[0_0_8px_rgba(13,242,223,0.5)]" : "text-slate-500"}`} aria-hidden="true" />
          </div>
          <div className="relative z-10">
            <p className="font-bold text-slate-200 text-base group-hover:text-primary transition-colors tracking-tight">
              Excel (.xlsx){" "}
              {!isPro && (
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded ml-1 font-bold uppercase tracking-wider">Pro</span>
              )}
            </p>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {cleanedRows.length.toLocaleString()} rows
            </p>
          </div>
        </button>

        <button
          onClick={handleExportChangeLog}
          className="flex items-center gap-4 p-5 glass-panel border border-slate-700/50 rounded-2xl hover:border-blue-400/30 hover:bg-white/5 transition-all duration-300 text-left hover:-translate-y-1 group"
        >
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl group-hover:border-blue-400/30 group-hover:bg-blue-500/10 transition-colors">
            <FileText className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          </div>
          <div>
            <p className="font-bold text-slate-200 text-base group-hover:text-blue-400 transition-colors tracking-tight">Change Log</p>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {allChanges.length.toLocaleString()} changes
            </p>
          </div>
        </button>

        {allQuarantined.length > 0 && (
          <button
            onClick={handleExportQuarantined}
            className="flex items-center gap-4 p-5 glass-panel border border-slate-700/50 rounded-2xl hover:border-amber-400/30 hover:bg-white/5 transition-all duration-300 text-left hover:-translate-y-1 group"
          >
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl group-hover:border-amber-400/30 group-hover:bg-amber-500/10 transition-colors">
              <AlertTriangle className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-base group-hover:text-amber-400 transition-colors tracking-tight">
                Quarantined Rows
              </p>
              <p className="text-sm text-slate-400 font-medium mt-1">
                {allQuarantined.length.toLocaleString()} rows
              </p>
            </div>
          </button>
        )}

        <button
          onClick={handleExportSummary}
          className="flex items-center gap-4 p-5 glass-panel border border-slate-700/50 rounded-2xl hover:border-slate-500 hover:bg-white/5 transition-all duration-300 text-left hover:-translate-y-1 group"
        >
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl group-hover:border-slate-500 transition-colors">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-200 text-base group-hover:text-white transition-colors tracking-tight">
              Summary Report
            </p>
            <p className="text-sm text-slate-400 font-medium mt-1">Plain text overview</p>
          </div>
        </button>
      </div>

      {showPostExport && (
        <div className="p-5 glass-panel bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(52,211,153,0.05)]">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex-shrink-0 mt-0.5">
              <CheckCircle className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-emerald-100 text-lg tracking-tight">
                File exported with watermark
              </p>
              <p className="text-sm font-medium text-emerald-200/60 mt-1">
                Upgrade to Pro to remove watermarks, unlock Excel export, and access all 17 cleaning rules.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-900 text-sm font-extrabold rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Remove limits — €12/mo
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowPostExport(false)}
                  className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
