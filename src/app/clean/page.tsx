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
import { useBeforeUnload } from "@/lib/hooks/useBeforeUnload";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowLeft, Lock, ShieldAlert, Zap, Check } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/marketing/SiteHeader";
import { proOnlyIssueCount } from "@/lib/engine/issueRules";
import { reconcile } from "@/lib/engine/reconcile";
import { TotalsCheck } from "@/components/ui/TotalsCheck";
import { WelcomeModal } from "@/components/ui/WelcomeModal";
import { OnboardingHint } from "@/components/ui/OnboardingHint";
import { HelpButton } from "@/components/ui/HelpButton";

const STAGES = [
  { id: "idle", label: "File" },
  { id: "health-check", label: "Issues" },
  { id: "configuring", label: "Rules" },
  { id: "previewing", label: "Preview" },
  { id: "exporting", label: "Export" },
] as const;

function StageIndicator({ currentStage }: { currentStage: string }) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <ol className="flex items-center gap-1 overflow-x-auto text-sm" aria-label="Progress">
      {STAGES.map((stage, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li
            key={stage.id}
            aria-current={isCurrent ? "step" : undefined}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              isCurrent ? "bg-accent-tint text-accent font-medium" : isComplete ? "text-ink-body" : "text-ink-muted"
            }`}
          >
            {isComplete ? (
              <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            ) : (
              <span className="font-data text-xs" aria-hidden="true">{i + 1}</span>
            )}
            {stage.label}
          </li>
        );
      })}
    </ol>
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
    rowLimitHit,
    totalRowCount,
    cleaningTimeMs,
    isPro,
    setStage,
    runCleaning,
    resetAll,
  } = useSheetStore();

  const exportRef = useRef<HTMLDivElement>(null);

  // Warn before closing tab if data is loaded
  useBeforeUnload(stage !== "idle");

  // Totals check: recomputed only when a cleaning run produces a new result
  const reconciliation = useMemo(
    () =>
      parsedSheet && engineResult
        ? reconcile(parsedSheet.rows, engineResult.cleanedRows, engineResult.snapshots, parsedSheet.headers)
        : null,
    [parsedSheet, engineResult]
  );

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
      onRun: () => {
        if (stage === "configuring") runCleaning();
      },
    }),
    [stage, setStage, runCleaning]
  );

  useKeyboardShortcuts(shortcutHandlers);

  const mappedStage =
    stage === "parsing"
      ? "idle"
      : stage === "cleaning"
      ? "configuring"
      : stage;

  return (
    <div className="min-h-screen bg-paper text-ink font-ui relative overflow-x-hidden">

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-accent focus:text-white focus:rounded font-semibold">
        Skip to main content
      </a>
      
      <header className="bg-paper border-b border-rule sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 min-h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-[17px]" aria-label="SpreadsheetFix home">
              <BrandMark />
              <span className="hidden sm:inline">SpreadsheetFix</span>
            </Link>
            {stage !== "idle" && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 min-h-9 px-3 text-sm font-medium text-ink-body rounded-md border border-rule-strong hover:border-ink-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                New file
              </button>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <StageIndicator currentStage={mappedStage} />
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-ink-body hover:text-accent transition-colors"
              >
                Sign in
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      <div className="md:hidden px-4 py-3 border-b border-rule bg-paper">
         <StageIndicator currentStage={mappedStage} />
      </div>

      <main id="main-content" className="max-w-[1200px] mx-auto px-6 py-8">
        <WelcomeModal />
        
        {/* STAGE: Upload */}
        {(stage === "idle" || stage === "parsing") && (
          <div className="max-w-2xl mx-auto mt-8">
            <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em]">Clean a spreadsheet</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-body">
              CSV or Excel. The file is read in your browser and never uploaded.
            </p>
            <div className="mt-8">
              <FileUploader />
            </div>
            {stage === "parsing" && (
              <p role="status" className="mt-4 text-sm text-ink-muted">Reading your file…</p>
            )}
          </div>
        )}

        {/* STAGE: Health Check */}
        {stage === "health-check" && parsedSheet && healthReport && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsBar sheet={parsedSheet} />
            <OnboardingHint id="health-check">
              We scanned your file and found potential issues. Review them below, then click <strong className="text-accent">Continue</strong> to choose which rules to apply.
            </OnboardingHint>
            <HealthReportPanel
              report={healthReport}
              onContinue={() => setStage("configuring")}
            />
          </div>
        )}

        {/* STAGE: Configure Rules */}
        {stage === "configuring" && parsedSheet && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsBar sheet={parsedSheet} />
            <OnboardingHint id="configuring">
              We auto-enabled rules that match your file&apos;s issues. Toggle others on/off, then hit <strong className="text-accent">Apply & Preview</strong> to see every change before exporting.
            </OnboardingHint>
            {rowLimitHit && (
              <div className="p-5 bg-paper border border-rule rounded-lg relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2.5 bg-accent-tint border border-rule rounded-lg text-accent flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-accent">
                      Row Limit Reached: Cleaning first {parsedSheet.rowCount.toLocaleString()} rows
                    </h4>
                    <p className="text-sm text-accent mt-2 mb-4 leading-relaxed font-medium">
                      Your file has {totalRowCount.toLocaleString()} rows, but the Free plan only processes up to 5,000 rows per file. Upgrade to Pro to clean the entire dataset at once (up to 500,000 rows).
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-strong transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Unlock Full Processing — €12/mo
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <RuleConfigurator onRunCleaning={runCleaning} />
          </div>
        )}

        {/* STAGE: Cleaning (Skeleton Loader) */}
        {stage === "cleaning" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500" role="status" aria-live="polite">
            <div className="h-28 bg-paper border border-rule rounded-lg animate-pulse relative overflow-hidden">
            </div>
            <div className="h-96 bg-paper border border-rule rounded-lg animate-pulse relative overflow-hidden">
            </div>
            <div className="flex justify-center pt-6">
              <div className="flex items-center gap-3 text-accent font-semibold bg-paper border border-rule-strong px-8 py-4 rounded-lg">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Applying intelligent cleaning rules...
              </div>
            </div>
          </div>
        )}

        {/* STAGE: Preview */}
        {(stage === "previewing" || stage === "exporting") &&
          parsedSheet &&
          engineResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto">
              <StatsBar sheet={parsedSheet} />

              <OnboardingHint id="previewing">
                Green cells were changed, red rows were removed. Scroll down to <strong className="text-accent">export</strong> your cleaned file, or go back to adjust rules.
              </OnboardingHint>

              {/* Success celebration */}
              {(() => {
                const changedCount = allChanges.filter((c) => c.changeType === "changed").length;
                const removedCount = parsedSheet.rowCount - cleanedRows.length;
                const totalFixes = changedCount + removedCount + allQuarantined.length;
                if (totalFixes === 0) return null;
                const timeStr = cleaningTimeMs < 1000
                  ? `${cleaningTimeMs}ms`
                  : `${(cleaningTimeMs / 1000).toFixed(1)}s`;
                return (
                  <div className="text-center py-3 bg-paper border border-rule rounded-lg animate-in fade-in zoom-in-95 duration-500">
                    <p className="text-base font-semibold text-ink">
                      <span className="text-accent">
                        {totalFixes.toLocaleString()} fixes
                      </span>
                      {" "}applied in {timeStr}
                    </p>
                  </div>
                );
              })()}

              {/* Summary stats */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 border border-rule rounded-lg divide-x divide-rule">
                <SummaryStat label="Cells changed" value={allChanges.filter((c) => c.changeType === "changed").length} />
                <SummaryStat label="Rows removed" value={parsedSheet.rowCount - cleanedRows.length} />
                <SummaryStat label="Rows flagged" value={allQuarantined.length} />
                <SummaryStat label="Rules applied" value={engineResult.stats.rulesApplied} />
              </dl>

              {reconciliation && <TotalsCheck reconciliation={reconciliation} />}

              <div className="bg-paper border border-rule rounded-lg overflow-hidden shadow-frame">
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
              </div>

              <div ref={exportRef} className="pt-4">
                <ExportPanel />
              </div>

              <div className={`flex justify-center gap-4 pt-8 border-t border-rule mt-8 ${!isPro && healthReport ? "pb-24" : "pb-12"}`}>
                <button
                  onClick={() => setStage("configuring")}
                  className="px-6 py-3 text-sm font-semibold bg-paper border rounded-lg text-ink-body hover:text-accent hover:border-rule-strong transition-colors border-rule"
                >
                  ← Back to Rules
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-3 text-sm font-semibold bg-surface text-ink-body rounded-lg hover:bg-rule transition-colors border border-rule"
                >
                  Start Over
                </button>
              </div>

              {/* Sticky upgrade banner for free users */}
              {!isPro && healthReport && (() => {
                const proFixCount = proOnlyIssueCount(healthReport);
                if (proFixCount === 0) return null;
                return (
                  <div className="fixed bottom-0 left-0 right-0 z-40 bg-paper border border-t border-rule animate-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-ink-body">
                        You cleaned{" "}
                        <span className="text-accent">{allChanges.filter((c) => c.changeType === "changed").length.toLocaleString()} cells</span>
                        {" — Pro would have caught "}
                        <span className="text-accent">{proFixCount.toLocaleString()} more</span>
                      </p>
                      <Link
                        href="/pricing"
                        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        Upgrade — €12/mo
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
      </main>

      <HelpButton stage={stage} />
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-5 py-4">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</dd>
    </div>
  );
}
