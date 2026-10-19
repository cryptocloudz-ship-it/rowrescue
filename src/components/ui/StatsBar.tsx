"use client";

import type { ParsedSheet } from "@/types/sheet";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StatsBar({ sheet }: { sheet: ParsedSheet }) {
  const delimiter = sheet.delimiter === "\t" ? "tab" : sheet.delimiter;
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 py-3 bg-surface rounded-lg border border-rule text-sm">
      <span className="font-data font-medium text-ink">{sheet.fileName}</span>
      <span className="text-ink-muted">{sheet.rowCount.toLocaleString()} rows</span>
      <span className="text-ink-muted">{sheet.columnCount} columns</span>
      <span className="text-ink-muted">{formatBytes(sheet.fileSize)}</span>
      {delimiter && (
        <span className="text-ink-muted">
          Delimiter <span className="font-data text-ink-body">{delimiter}</span>
        </span>
      )}
    </div>
  );
}
