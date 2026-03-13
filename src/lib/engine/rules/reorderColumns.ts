import type { Row, CleanResult } from "@/types/sheet";
import type { RuleOptions } from "@/types/rules";

interface ReorderColumnsOptions extends RuleOptions {
  order: string[];
}

export function reorderColumns(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const { order = [] } = options as ReorderColumnsOptions;

  const newRows = rows.map((row) => {
    const newRow: Row = {};
    for (const col of order) {
      if (col in row) {
        newRow[col] = row[col];
      }
    }
    // Append any columns not in the order list
    for (const key of Object.keys(row)) {
      if (!order.includes(key)) {
        newRow[key] = row[key];
      }
    }
    return newRow;
  });

  return {
    rows: newRows,
    changes: [],
    quarantined: [],
    stats: { rowsAffected: rows.length, cellsChanged: 0, rowsRemoved: 0, rowsQuarantined: 0 },
  };
}
