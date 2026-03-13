"use client";

import { Download, FileText, FileSpreadsheet, AlertTriangle } from "lucide-react";
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

  if (!parsedSheet || !engineResult) return null;

  const cleanedHeaders =
    cleanedRows.length > 0 ? Object.keys(cleanedRows[0]) : parsedSheet.headers;
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const baseName = `${parsedSheet.fileName.replace(/\.[^.]+$/, "")}_${cleanedRows.length}rows_${timestamp}`;
  const hasWatermark = !isPro;
  const appliedRules = ruleConfigs
    .filter((rc) => rc.enabled)
    .map((rc) => rc.ruleId);

  const handleExportCSV = () => {
    const csv = exportToCSV(cleanedRows, cleanedHeaders, {
      watermark: hasWatermark,
    });
    downloadBlob(csv, `${baseName}_cleaned.csv`, "text/csv;charset=utf-8");
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
    <section aria-labelledby="export-heading" className="space-y-4">
      <div>
        <h3 id="export-heading" className="text-lg font-semibold text-gray-900">Export</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          All exports are generated 100% in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Export options">
        <button
          onClick={handleExportCSV}
          aria-label={`Download cleaned CSV with ${cleanedRows.length} rows`}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Download className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <div>
            <p className="font-medium text-gray-900 text-sm">Cleaned CSV</p>
            <p className="text-xs text-gray-500">
              {cleanedRows.length.toLocaleString()} rows
            </p>
          </div>
        </button>

        <button
          onClick={handleExportXLSX}
          disabled={!isPro}
          aria-label={isPro ? `Download Excel file with ${cleanedRows.length} rows` : "Excel export requires Pro plan"}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <FileSpreadsheet className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              Excel (.xlsx){" "}
              {!isPro && (
                <span className="text-xs text-gray-400">Pro</span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {cleanedRows.length.toLocaleString()} rows
            </p>
          </div>
        </button>

        <button
          onClick={handleExportChangeLog}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900 text-sm">Change Log</p>
            <p className="text-xs text-gray-500">
              {allChanges.length.toLocaleString()} changes
            </p>
          </div>
        </button>

        {allQuarantined.length > 0 && (
          <button
            onClick={handleExportQuarantined}
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-gray-900 text-sm">
                Quarantined Rows
              </p>
              <p className="text-xs text-gray-500">
                {allQuarantined.length.toLocaleString()} rows
              </p>
            </div>
          </button>
        )}

        <button
          onClick={handleExportSummary}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <FileText className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              Summary Report
            </p>
            <p className="text-xs text-gray-500">Plain text overview</p>
          </div>
        </button>
      </div>

      {hasWatermark && (
        <p className="text-xs text-gray-400 text-center">
          Free exports include a TidySheet watermark.{" "}
          <a href="/pricing" className="text-teal-600 underline">
            Upgrade to Pro
          </a>{" "}
          to remove it.
        </p>
      )}
    </section>
  );
}
