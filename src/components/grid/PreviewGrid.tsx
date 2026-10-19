"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { Row, CellChange } from "@/types/sheet";

interface PreviewGridProps {
  originalRows: Row[];
  cleanedRows: Row[];
  headers: string[];
  changes: CellChange[];
  maxPreviewRows?: number;
}

type ChangeMap = Map<string, CellChange>;

function buildChangeMap(changes: CellChange[]): ChangeMap {
  const map = new Map<string, CellChange>();
  for (const c of changes) {
    if (c.rowIndex >= 0) {
      map.set(`${c.rowIndex}:${c.column}`, c);
    }
  }
  return map;
}

function cellKey(rowIndex: number, column: string) {
  return `${rowIndex}:${column}`;
}

export function PreviewGrid({
  cleanedRows,
  headers,
  changes,
  maxPreviewRows = 50,
}: PreviewGridProps) {
  const [showChangesOnly, setShowChangesOnly] = useState(false);

  const changeMap = useMemo(() => buildChangeMap(changes), [changes]);

  const displayRows = useMemo(() => {
    const rows = cleanedRows.slice(0, maxPreviewRows);
    if (!showChangesOnly) return rows;
    return rows.filter((_, i) =>
      headers.some((h) => changeMap.has(cellKey(i, h)))
    );
  }, [cleanedRows, maxPreviewRows, showChangesOnly, changeMap, headers]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "_rowNum",
        header: "#",
        size: 50,
        cell: ({ row }) => (
          <span className="text-xs text-ink-muted font-mono">
            {row.index + 1}
          </span>
        ),
      },
      ...headers.map(
        (header): ColumnDef<Row> => ({
          accessorKey: header,
          header: () => (
            <span className="text-xs font-semibold uppercase tracking-wider">
              {header}
            </span>
          ),
          cell: ({ row }) => {
            const change = changeMap.get(cellKey(row.index, header));
            const value = String(row.original[header] ?? "");

            if (!change) {
              return (
                <span className="text-sm font-mono text-ink-body truncate block max-w-[200px]">
                  {value || <span className="text-ink-muted">—</span>}
                </span>
              );
            }

            let bg = "";
            let textColor = "text-ink-body";
            let title = "";

            switch (change.changeType) {
              case "changed":
                bg = "bg-green-50";
                textColor = "text-green-800";
                title = `Changed by ${change.ruleName}: "${change.originalValue}" → "${change.newValue}"`;
                break;
              case "removed":
                bg = "bg-red-50";
                textColor = "text-red-800";
                title = `Removed by ${change.ruleName}`;
                break;
              case "flagged":
                bg = "bg-amber-50";
                textColor = "text-amber-800";
                title = `Flagged by ${change.ruleName}: ${change.originalValue}`;
                break;
            }

            return (
              <span
                className={`text-sm font-mono ${textColor}  ${bg} px-1 rounded truncate block max-w-[200px] cursor-help`}
                title={title}
              >
                {value || <span className="text-ink-muted">—</span>}
              </span>
            );
          },
        })
      ),
    ],
    [headers, changeMap]
  );

  const table = useReactTable({
    data: displayRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          Showing {displayRows.length} of {cleanedRows.length} rows
          {cleanedRows.length > maxPreviewRows &&
            ` (preview limited to ${maxPreviewRows})`}
        </p>
        <label className="flex items-center gap-2 text-sm text-ink-body cursor-pointer">
          <input
            type="checkbox"
            checked={showChangesOnly}
            onChange={(e) => setShowChangesOnly(e.target.checked)}
            className="rounded border-rule-strong text-accent focus:ring-teal-500"
          />
          Show changed rows only
        </label>
      </div>

      <div className="flex gap-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          Changed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          Removed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          Flagged
        </span>
      </div>

      <div className="border border-rule rounded-lg shadow-sm overflow-hidden bg-white max-h-[500px] flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface/90 sticky top-0 z-20 shadow-sm">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold text-ink-body tracking-wider border-b border-rule"
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-rule">
              {table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className={`hover:bg-surface transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-surface/40'}`}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-sm text-accent hover:text-accent-strong disabled:text-ink-muted"
          >
            ← Previous
          </button>
          <span className="text-sm text-ink-muted">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-sm text-accent hover:text-accent-strong disabled:text-ink-muted"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
