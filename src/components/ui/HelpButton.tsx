"use client";

import { useState } from "react";
import { HelpCircle, X, Keyboard, Upload, ScanSearch, Settings2, Eye, Download } from "lucide-react";
import type { ProcessingStage } from "@/types/sheet";

const STAGE_TIPS: Record<string, { title: string; tips: string[] }> = {
  idle: {
    title: "Getting Started",
    tips: [
      "Drag & drop a CSV, TSV, or Excel file to begin",
      "Try the demo data to explore without a file",
      "All processing happens in your browser — your data never leaves your device",
    ],
  },
  "health-check": {
    title: "Health Report",
    tips: [
      "We scanned your data and found potential issues",
      "High severity issues have the biggest impact on data quality",
      "Click Continue to choose which rules to apply",
    ],
  },
  configuring: {
    title: "Cleaning Rules",
    tips: [
      "Toggle rules on/off — matching rules are auto-enabled",
      "Click a locked rule to see what Pro can fix in your file",
      "Use the column picker to target specific columns",
      "The estimated impact shows how many fixes will be applied",
    ],
  },
  previewing: {
    title: "Preview & Export",
    tips: [
      "Green cells were changed, red rows were removed",
      "Click \"Back to Rules\" to adjust and re-run",
      "Export as CSV (free) or upgrade for Excel export",
    ],
  },
  exporting: {
    title: "Export",
    tips: [
      "Your cleaned file is ready to download",
      "Free exports include a small watermark row",
    ],
  },
};

const SHORTCUTS = [
  { keys: "Ctrl+Enter", action: "Run cleaning" },
  { keys: "Ctrl+Z", action: "Undo / go back" },
  { keys: "Ctrl+E", action: "Jump to export" },
  { keys: "Esc", action: "Go back one step" },
];

interface HelpButtonProps {
  stage: ProcessingStage;
}

const STAGE_ICONS: Record<string, React.ElementType> = {
  idle: Upload,
  "health-check": ScanSearch,
  configuring: Settings2,
  previewing: Eye,
  exporting: Download,
};

export function HelpButton({ stage }: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  const mappedStage = stage === "parsing" ? "idle" : stage === "cleaning" ? "configuring" : stage;
  const tip = STAGE_TIPS[mappedStage] ?? STAGE_TIPS.idle;
  const StageIcon = STAGE_ICONS[mappedStage] ?? Upload;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-slate-800 border border-slate-700 hover:border-primary/50 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-lg hover:shadow-[0_0_20px_rgba(13,242,223,0.15)] group"
        aria-label="Help & tips"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 glass-panel border border-primary/20 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Stage tips */}
          <div className="p-5 border-b border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <StageIcon className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                {tip.title}
              </h4>
            </div>
            <ul className="space-y-2.5">
              {tip.tips.map((t, i) => (
                <li key={i} className="text-sm text-slate-400 font-medium flex items-start gap-2">
                  <span className="text-primary mt-1 text-xs">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Keyboard shortcuts */}
          <div className="p-5 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-slate-500" />
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Keyboard Shortcuts
              </h4>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">{s.action}</span>
                  <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
