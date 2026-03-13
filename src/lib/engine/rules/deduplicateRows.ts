import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, DeduplicateRowsOptions } from "@/types/rules";

export function deduplicateRows(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = { mode: "exact" as const, ...options } as DeduplicateRowsOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const seen = new Set<string>();
  const uniqueRows: Row[] = [];
  let removed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let key: string;

    if (opts.mode === "by_columns" && opts.keyColumns?.length) {
      key = opts.keyColumns.map((col) => String(row[col] ?? "")).join("||");
    } else {
      key = JSON.stringify(row);
    }

    if (seen.has(key)) {
      removed++;
      const headers = Object.keys(row);
      for (const col of headers) {
        changes.push({
          rowIndex: i,
          column: col,
          originalValue: row[col],
          newValue: null,
          ruleId: "deduplicateRows",
          ruleName: "Remove Duplicates",
          changeType: "removed",
          timestamp: now,
        });
      }
    } else {
      seen.add(key);
      uniqueRows.push(row);
    }
  }

  return {
    rows: uniqueRows,
    changes,
    quarantined: [],
    stats: {
      rowsAffected: removed,
      cellsChanged: changes.length,
      rowsRemoved: removed,
      rowsQuarantined: 0,
    },
  };
}
