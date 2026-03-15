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
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  ScanSearch,
  Settings2,
  Eye,
  Download,
  Lock,
  ShieldAlert,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { WelcomeModal } from "@/components/ui/WelcomeModal";
import { OnboardingHint } from "@/components/ui/OnboardingHint";
import { HelpButton } from "@/components/ui/HelpButton";

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
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
      {STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage.id} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-8 h-[2px] rounded-full transition-colors duration-500 ${
                  isComplete ? "bg-primary shadow-[0_0_8px_rgba(13,242,223,0.5)]" : "bg-slate-800"
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300
                ${isComplete ? "bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_10px_rgba(13,242,223,0.1)]" : ""}
                ${isCurrent ? "bg-primary text-background-dark neon-glow scale-105" : ""}
                ${!isComplete && !isCurrent ? "bg-slate-800/50 text-slate-400 border border-slate-700/50" : ""}
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
    <div className="min-h-screen bg-background-dark text-slate-100 font-display relative overflow-x-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-primary focus:text-background-dark focus:rounded font-bold">
        Skip to main content
      </a>
      
      <header className="glass-header sticky top-0 z-50 border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group" aria-label="RowRescue home">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center neon-glow group-hover:scale-105 transition-transform">
                <Activity className="size-5 text-background-dark font-bold" />
              </div>
              <span className="text-xl font-bold text-primary tracking-tight neon-text-glow">
                RowRescue
              </span>
            </Link>
            {stage !== "idle" && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-primary bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-primary/30"
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
               <div className="relative z-10 p-0.5 rounded-full border border-primary/30">
                  <UserButton />
               </div>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-bold text-slate-300 hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      <div className="md:hidden px-4 py-3 border-b border-primary/10 bg-background-dark/50">
         <StageIndicator currentStage={mappedStage} />
      </div>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <WelcomeModal />
        
        {/* STAGE: Upload */}
        {(stage === "idle" || stage === "parsing") && (
          <div className="flex flex-col items-center gap-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
                Clean your spreadsheet
              </h1>
              <p className="text-lg text-slate-400 mt-4 font-medium">
                Upload a CSV or Excel file. Everything securely parses in your browser.
              </p>
            </div>
            <div className="w-full max-w-3xl">
              <FileUploader />
            </div>

            {/* How it works */}
            <div className="w-full max-w-2xl mt-8 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              {[
                { step: "1", icon: FileUp, title: "Upload", desc: "Drop your messy CSV or Excel file" },
                { step: "2", icon: Settings2, title: "Clean", desc: "Toggle smart rules — preview every change" },
                { step: "3", icon: Download, title: "Export", desc: "Download your pristine data instantly" },
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className="mx-auto w-12 h-12 rounded-2xl glass-panel border border-primary/10 flex items-center justify-center mb-3 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                    <item.icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-slate-300">{item.title}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE: Health Check */}
        {stage === "health-check" && parsedSheet && healthReport && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatsBar sheet={parsedSheet} />
            <OnboardingHint id="health-check">
              We scanned your file and found potential issues. Review them below, then click <strong className="text-primary">Continue</strong> to choose which rules to apply.
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
              We auto-enabled rules that match your file&apos;s issues. Toggle others on/off, then hit <strong className="text-primary">Apply & Preview</strong> to see every change before exporting.
            </OnboardingHint>
            {rowLimitHit && (
              <div className="p-5 glass-panel border border-amber-500/30 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-amber-100">
                      Row Limit Reached: Cleaning first {parsedSheet.rowCount.toLocaleString()} rows
                    </h4>
                    <p className="text-sm text-amber-200/70 mt-2 mb-4 leading-relaxed font-medium">
                      Your file has {totalRowCount.toLocaleString()} rows, but the Free plan only processes up to 5,000 rows per file. Upgrade to Pro to clean the entire dataset at once (up to Unlimited rows).
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-900 text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
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
            <div className="h-28 glass-panel border border-primary/10 rounded-2xl animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
            </div>
            <div className="h-96 glass-panel border border-primary/10 rounded-2xl animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
            </div>
            <div className="flex justify-center pt-6">
              <div className="flex items-center gap-3 text-primary font-bold glass-panel border border-primary/30 px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(13,242,223,0.1)]">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                Green cells were changed, red rows were removed. Scroll down to <strong className="text-primary">export</strong> your cleaned file, or go back to adjust rules.
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
                  <div className="text-center py-3 glass-panel border border-primary/20 rounded-xl animate-in fade-in zoom-in-95 duration-500">
                    <p className="text-base font-bold text-slate-200">
                      <span className="text-primary neon-text-glow">
                        {totalFixes.toLocaleString()} fixes
                      </span>
                      {" "}applied in {timeStr}
                    </p>
                  </div>
                );
              })()}

              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  label="Cells changed"
                  value={allChanges.filter((c) => c.changeType === "changed").length}
                  color="text-emerald-400"
                  borderColor="border-emerald-500/30"
                  bg="bg-emerald-500/5"
                />
                <StatCard
                  label="Rows removed"
                  value={
                    parsedSheet.rowCount - cleanedRows.length
                  }
                  color="text-rose-400"
                  borderColor="border-rose-500/30"
                  bg="bg-rose-500/5"
                />
                <StatCard
                  label="Rows flagged"
                  value={allQuarantined.length}
                  color="text-amber-400"
                  borderColor="border-amber-500/30"
                  bg="bg-amber-500/5"
                />
                <StatCard
                  label="Rules applied"
                  value={engineResult.stats.rulesApplied}
                  color="text-primary neon-text-glow"
                  borderColor="border-primary/30"
                  bg="bg-primary/5"
                />
              </div>

              <div className="glass-panel border border-primary/10 rounded-2xl overflow-hidden shadow-2xl">
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

              <div className={`flex justify-center gap-4 pt-8 border-t border-primary/10 mt-8 ${!isPro && healthReport ? "pb-24" : "pb-12"}`}>
                <button
                  onClick={() => setStage("configuring")}
                  className="px-6 py-3 text-sm font-bold glass-panel rounded-xl text-slate-300 hover:text-primary hover:border-primary/50 transition-colors border border-primary/20"
                >
                  ← Back to Rules
                </button>
                <button
                  onClick={resetAll}
                  className="px-6 py-3 text-sm font-bold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Start Over
                </button>
              </div>

              {/* Sticky upgrade banner for free users */}
              {!isPro && healthReport && (() => {
                const proFixCount = healthReport.issues
                  .filter((i) => {
                    const ruleId = ({
                      date_inconsistency: "normalizeDate",
                      number_format: "normalizeNumbers",
                      invalid_email: "validateEmail",
                      invalid_phone: "validatePhone",
                    } as Record<string, string>)[i.type];
                    return ruleId !== undefined;
                  })
                  .reduce((sum, i) => sum + i.count, 0);
                if (proFixCount === 0) return null;
                return (
                  <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-amber-500/30 bg-background-dark/95 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-500">
                    <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-slate-300">
                        You cleaned{" "}
                        <span className="text-primary">{allChanges.filter((c) => c.changeType === "changed").length.toLocaleString()} cells</span>
                        {" — Pro would have caught "}
                        <span className="text-amber-400">{proFixCount.toLocaleString()} more</span>
                      </p>
                      <Link
                        href="/pricing"
                        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
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

function StatCard({
  label,
  value,
  color,
  borderColor,
  bg
}: {
  label: string;
  value: number;
  color: string;
  borderColor: string;
  bg: string;
}) {
  return (
    <div className={`glass-panel border ${borderColor} rounded-2xl p-6 relative overflow-hidden group`}>
      <div className={`absolute inset-0 ${bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10">
         <p className={`text-4xl font-extrabold ${color} font-mono tracking-tight`}>
         {value.toLocaleString()}
         </p>
         <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
