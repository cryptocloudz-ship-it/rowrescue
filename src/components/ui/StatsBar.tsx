"use client";

import { FileSpreadsheet, Rows3, Columns3, HardDrive } from "lucide-react";
import type { ParsedSheet } from "@/types/sheet";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StatsBar({ sheet }: { sheet: ParsedSheet }) {
  return (
    <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg border text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <FileSpreadsheet className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{sheet.fileName}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Rows3 className="w-4 h-4 text-gray-400" />
        <span>{sheet.rowCount.toLocaleString()} rows</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Columns3 className="w-4 h-4 text-gray-400" />
        <span>{sheet.columnCount} columns</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <HardDrive className="w-4 h-4 text-gray-400" />
        <span>{formatBytes(sheet.fileSize)}</span>
      </div>
      {sheet.delimiter && (
        <div className="text-gray-500">
          Delimiter:{" "}
          <span className="font-mono">
            {sheet.delimiter === "\t"
              ? "TAB"
              : sheet.delimiter === ","
              ? ","
              : sheet.delimiter}
          </span>
        </div>
      )}
    </div>
  );
}
