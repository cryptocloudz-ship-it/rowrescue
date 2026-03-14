"use client";

import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import type { HealthReport as HealthReportType, Severity } from "@/types/sheet";

interface HealthReportProps {
  report: HealthReportType;
  onContinue: () => void;
}

function SeverityIcon({ severity }: { severity: Severity }) {
  switch (severity) {
    case "HIGH":
      return <AlertCircle className="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />;
    case "MEDIUM":
      return <AlertTriangle className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
    case "LOW":
      return <Info className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />;
  }
}

function severityBadge(severity: Severity) {
  const base = "text-xs font-bold px-2 py-0.5 rounded-full border";
  switch (severity) {
    case "HIGH":
      return `${base} bg-rose-500/10 text-rose-400 border-rose-500/20`;
    case "MEDIUM":
      return `${base} bg-amber-500/10 text-amber-400 border-amber-500/20`;
    case "LOW":
      return `${base} bg-blue-500/10 text-blue-400 border-blue-500/20`;
  }
}

export function HealthReportPanel({ report, onContinue }: HealthReportProps) {
  if (report.totalIssues === 0) {
    return (
      <div className="glass-panel bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <CheckCircle className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-emerald-300">
              Your data looks great!
            </h3>
            <p className="text-sm font-medium text-emerald-400/80 mt-1">
              No issues detected. You can still apply cleaning rules if needed.
            </p>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="mt-6 px-6 py-3 bg-primary text-background-dark rounded-xl hover:brightness-110 transition-all duration-300 font-bold shadow-[0_0_20px_rgba(13,242,223,0.2)] hover:shadow-[0_0_30px_rgba(13,242,223,0.4)] animate-pulse hover:animate-none group relative z-10"
        >
          Continue to Cleaning Rules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between px-2">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Health Report
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-1">
            {report.totalIssues} issue{report.totalIssues !== 1 ? "s" : ""}{" "}
            detected in your data
          </p>
        </div>
        <div className="flex gap-2">
          {report.highCount > 0 && (
            <span className="text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-full shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]">
              {report.highCount} High
            </span>
          )}
          {report.mediumCount > 0 && (
            <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full shadow-[inset_0_0_10px_rgba(251,191,36,0.1)]">
              {report.mediumCount} Medium
            </span>
          )}
          {report.lowCount > 0 && (
            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full shadow-[inset_0_0_10px_rgba(96,165,250,0.1)]">
              {report.lowCount} Low
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {report.issues.map((issue) => (
          <div
            key={issue.id}
            className="glass-panel border border-primary/10 hover:border-primary/30 rounded-2xl p-5 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <SeverityIcon severity={issue.severity} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-slate-200 group-hover:text-primary transition-colors">
                    {issue.title}
                  </h4>
                  <span className={severityBadge(issue.severity)}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed font-medium">
                  {issue.description}
                </p>
                {issue.examples.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {issue.examples.map((ex, i) => (
                      <p
                        key={i}
                        className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700/50 rounded-md px-3 py-1.5 break-all shadow-inner"
                      >
                        {ex}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full mt-8 px-4 py-4 bg-primary text-background-dark rounded-xl hover:brightness-110 transition-all duration-300 font-extrabold shadow-[0_0_20px_rgba(13,242,223,0.2)] hover:shadow-[0_0_30px_rgba(13,242,223,0.4)] animate-pulse hover:animate-none text-lg flex items-center justify-center gap-2 neon-glow"
      >
        Continue to Cleaning Rules
      </button>
    </div>
  );
}
