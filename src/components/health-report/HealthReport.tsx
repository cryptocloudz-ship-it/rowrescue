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
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "MEDIUM":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "LOW":
      return <Info className="w-5 h-5 text-blue-500" />;
  }
}

function severityBadge(severity: Severity) {
  const base = "text-xs font-semibold px-2 py-0.5 rounded-full";
  switch (severity) {
    case "HIGH":
      return `${base} bg-red-100 text-red-700`;
    case "MEDIUM":
      return `${base} bg-amber-100 text-amber-700`;
    case "LOW":
      return `${base} bg-blue-100 text-blue-700`;
  }
}

export function HealthReportPanel({ report, onContinue }: HealthReportProps) {
  if (report.totalIssues === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">
              Your data looks great!
            </h3>
            <p className="text-sm text-green-600 mt-1">
              No issues detected. You can still apply cleaning rules if needed.
            </p>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          Continue to Cleaning Rules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Health Report
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {report.totalIssues} issue{report.totalIssues !== 1 ? "s" : ""}{" "}
            detected in your data
          </p>
        </div>
        <div className="flex gap-2">
          {report.highCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              {report.highCount} High
            </span>
          )}
          {report.mediumCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              {report.mediumCount} Medium
            </span>
          )}
          {report.lowCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {report.lowCount} Low
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {report.issues.map((issue) => (
          <div
            key={issue.id}
            className="border rounded-lg p-4 bg-white"
          >
            <div className="flex items-start gap-3">
              <SeverityIcon severity={issue.severity} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {issue.title}
                  </h4>
                  <span className={severityBadge(issue.severity)}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {issue.description}
                </p>
                {issue.examples.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {issue.examples.map((ex, i) => (
                      <p
                        key={i}
                        className="text-xs font-mono text-gray-500 bg-gray-50 rounded px-2 py-1"
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
        className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
      >
        Continue to Cleaning Rules
      </button>
    </div>
  );
}
