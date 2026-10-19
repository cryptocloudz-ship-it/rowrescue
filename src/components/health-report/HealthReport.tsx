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
      return <AlertCircle className="w-5 h-5 text-rose-700" />;
    case "MEDIUM":
      return <AlertTriangle className="w-5 h-5 text-amber-700" />;
    case "LOW":
      return <Info className="w-5 h-5 text-accent" />;
  }
}

function severityBadge(severity: Severity) {
  const base = "text-xs font-semibold px-2 py-0.5 rounded-full border";
  switch (severity) {
    case "HIGH":
      return `${base} bg-rose-500/10 text-rose-400 border-rose-500/20`;
    case "MEDIUM":
      return `${base} bg-amber-500/10 text-amber-400 border-amber-500/20`;
    case "LOW":
      return `${base} bg-accent-tint text-accent border-rule-strong`;
  }
}

export function HealthReportPanel({ report, onContinue }: HealthReportProps) {
  if (report.totalIssues === 0) {
    return (
      <div className="border bg-emerald-50 border-emerald-200 rounded-lg p-8 relative overflow-hidden group">
        <div className="flex items-center gap-4 relative z-10">
          <CheckCircle className="w-8 h-8 text-emerald-700 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-emerald-700">
              Your data looks great!
            </h3>
            <p className="text-sm font-medium text-emerald-700 mt-1">
              No issues detected. You can still apply cleaning rules if needed.
            </p>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="mt-6 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-strong transition-all duration-300 font-semibold animate-pulse hover:animate-none group relative z-10"
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
          <h3 className="text-2xl font-semibold text-ink tracking-tight">
            Health Report
          </h3>
          <p className="text-sm font-medium text-ink-muted mt-1">
            {report.totalIssues} issue{report.totalIssues !== 1 ? "s" : ""}{" "}
            detected in your data
          </p>
        </div>
        <div className="flex gap-2">
          {report.highCount > 0 && (
            <span className="text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full">
              {report.highCount} High
            </span>
          )}
          {report.mediumCount > 0 && (
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full">
              {report.mediumCount} Medium
            </span>
          )}
          {report.lowCount > 0 && (
            <span className="text-xs font-semibold bg-accent-tint text-accent border border-rule-strong px-3 py-1.5 rounded-full">
              {report.lowCount} Low
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {report.issues.map((issue) => (
          <div
            key={issue.id}
            className="bg-paper border border-rule hover:border-rule-strong rounded-lg p-5 hover:bg-surface transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <SeverityIcon severity={issue.severity} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-semibold text-ink group-hover:text-accent transition-colors">
                    {issue.title}
                  </h4>
                  <span className={severityBadge(issue.severity)}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed font-medium">
                  {issue.description}
                </p>
                {issue.examples.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {issue.examples.map((ex, i) => (
                      <p
                        key={i}
                        className="text-xs font-mono text-ink-body bg-surface border border-rule rounded-md px-3 py-1.5 break-all"
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
        className="w-full mt-8 px-4 py-4 bg-accent text-white rounded-lg hover:bg-accent-strong transition-all duration-300 font-semibold animate-pulse hover:animate-none text-lg flex items-center justify-center gap-2"
      >
        Continue to Cleaning Rules
      </button>
    </div>
  );
}
