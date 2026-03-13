"use client";

import { useMemo, useRef } from "react";
import { useSheetStore } from "@/store/sheetStore";
import { FileUploader } from "@/components/upload/FileUploader";
import { HealthReportPanel } from "@/components/health-report/HealthReport";
import { RuleConfigurator } from "@/components/rules/RuleConfigurator";
import { PreviewGrid } from "@/components/grid/PreviewGrid";
import { ExportPanel } from "@/components/ui/ExportPanel";
import { StatsBar } from "@/components/ui/StatsBar";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  ScanSearch,
  Settings2,
  Eye,
  Download,
} from "lucide-react";

const STAGES = [
  { id: "idle", label: "Upload", icon: FileUp },
  { id: "health-check", label: "Health", icon: ScanSearch },
  { id: "configuring", label: "Rules", icon: Settings2 },
  { id: "previewing", label: "Preview", icon: Eye },
  { id: "exporting", label: "Export", icon: Download },
] as const;

function StageIndicator({ currentStage }: { currentStage: string }) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage.id} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-8 h-px ${
                  isComplete ? "bg-teal-400" : "bg-gray-200"
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                ${isComplete ? "bg-teal-100 text-teal-700" : ""}
                ${isCurrent ? "bg-teal-600 text-white" : ""}
                ${!isComplete && !isCurrent ? "bg-gray-100 text-gray-400" : ""}
              `}
            >
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CleanPage() {
  const {
    stage,
    parsedSheet,
    healthReport,
    cleanedRows,
    allChanges,
    allQuarantined,
    engineResult,
    setStage,
    runCleaning,
    resetAll,
  } = useSheetStore();

  const exportRef = useRef<HTMLDivElement>(null);

  const shortcutHandlers = useMemo(
    () => ({
      onUndo: () => {
        if (stage === "previewing" || stage === "exporting") {
          setStage("configuring");
        }
      },
      onExport: () => {
        if (stage === "previewing" || stage === "exporting") {
          exportRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      },
      onBack: () => {
        if (stage === "configuring") setStage("health-check");
        else if (stage === "previewing" || stage === "exporting") setStage("configuring");
      },
    }),
    [stage, setStage]
  );

  useKeyboardShortcuts(shortcutHandlers);

  const mappedStage =
    stage === "parsing"
      ? "idle"
      : stage === "cleaning"
      ? "configuring"
      : stage;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-bold text-teal-600">
              TidySheet
            </a>
            {stage !== "idle" && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                New file
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <StageIndicator currentStage={mappedStage} />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <a
                href="/sign-in"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign in
              </a>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* STAGE: Upload */}
        {(stage === "idle" || stage === "parsing") && (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Clean your spreadsheet
              </h1>
              <p className="text-gray-500 mt-2">
                Upload a CSV or Excel file. Everything runs in your browser.
              </p>
            </div>
            <FileUploader />
          </div>
        )}

        {/* STAGE: Health Check */}
        {stage === "health-check" && parsedSheet && healthReport && (
          <div className="max-w-2xl mx-auto space-y-6">
            <StatsBar sheet={parsedSheet} />
            <HealthReportPanel
              report={healthReport}
              onContinue={() => setStage("configuring")}
            />
          </div>
        )}

        {/* STAGE: Configure Rules */}
        {stage === "configuring" && parsedSheet && (
          <div className="max-w-2xl mx-auto space-y-6">
            <StatsBar sheet={parsedSheet} />
            <RuleConfigurator onRunCleaning={runCleaning} />
          </div>
        )}

        {/* STAGE: Cleaning (brief spinner) */}
        {stage === "cleaning" && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Applying rules...</p>
          </div>
        )}

        {/* STAGE: Preview */}
        {(stage === "previewing" || stage === "exporting") &&
          parsedSheet &&
          engineResult && (
            <div className="space-y-6">
              <StatsBar sheet={parsedSheet} />

              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Cells changed"
                  value={allChanges.filter((c) => c.changeType === "changed").length}
                  color="text-green-600"
                />
                <StatCard
                  label="Rows removed"
                  value={
                    parsedSheet.rowCount - cleanedRows.length
                  }
                  color="text-red-600"
                />
                <StatCard
                  label="Rows flagged"
                  value={allQuarantined.length}
                  color="text-amber-600"
                />
                <StatCard
                  label="Rules applied"
                  value={engineResult.stats.rulesApplied}
                  color="text-teal-600"
                />
              </div>

              <PreviewGrid
                originalRows={parsedSheet.rows}
                cleanedRows={cleanedRows}
                headers={
                  cleanedRows.length > 0
                    ? Object.keys(cleanedRows[0])
                    : parsedSheet.headers
                }
                changes={allChanges}
              />

              <div ref={exportRef}>
                <ExportPanel />
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => setStage("configuring")}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  ← Back to Rules
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className={`text-2xl font-bold ${color} font-mono`}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
