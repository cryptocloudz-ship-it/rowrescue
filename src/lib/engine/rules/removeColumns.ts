import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, RemoveColumnsOptions } from "@/types/rules";

/** Drop the chosen columns, whatever they hold. Each dropped column is logged once, like Remove Empty Columns. */
export function removeColumns(rows: Row[], options: RuleOptions = {}): CleanResult {
  const opts = options as RemoveColumnsOptions;
  const present = new Set(rows.flatMap((row) => Object.keys(row)));
  const dropped = (opts.columns ?? []).filter((col) => present.has(col));

  if (dropped.length === 0) {
    return { rows: [...rows], changes: [], quarantined: [], stats: { rowsAffected: 0, cellsChanged: 0, rowsRemoved: 0, rowsQuarantined: 0 } };
  }

  const drop = new Set(dropped);
  const newRows = rows.map((row) => {
    const newRow: Row = {};
    for (const [key, value] of Object.entries(row)) {
      if (!drop.has(key)) newRow[key] = value;
    }
    return newRow;
  });

  const now = Date.now();
  const changes: CellChange[] = dropped.map((col) => ({
    rowIndex: -1,
    column: col,
    originalValue: col,
    newValue: null,
    ruleId: "removeColumns",
    ruleName: "Delete Columns",
    changeType: "removed",
    timestamp: now,
  }));

  return {
    rows: newRows,
    changes,
    quarantined: [],
    stats: {
      rowsAffected: rows.length,
      cellsChanged: dropped.length * rows.length,
      rowsRemoved: 0,
      rowsQuarantined: 0,
    },
  };
}
