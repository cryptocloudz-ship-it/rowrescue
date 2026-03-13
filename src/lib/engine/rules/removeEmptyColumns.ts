import type { Row, CleanResult } from "@/types/sheet";
import type { RuleOptions } from "@/types/rules";

export function removeEmptyColumns(
  rows: Row[],
  _options: RuleOptions = {}
): CleanResult {
  if (rows.length === 0) {
    return { rows: [], changes: [], quarantined: [], stats: { rowsAffected: 0, cellsChanged: 0, rowsRemoved: 0, rowsQuarantined: 0 } };
  }

  const headers = Object.keys(rows[0]);
  const emptyColumns = headers.filter((header) =>
    rows.every((row) => {
      const val = row[header];
      return val === null || val === undefined || String(val).trim() === "";
    })
  );

  if (emptyColumns.length === 0) {
    return { rows: [...rows], changes: [], quarantined: [], stats: { rowsAffected: 0, cellsChanged: 0, rowsRemoved: 0, rowsQuarantined: 0 } };
  }

  const now = Date.now();
  const newRows = rows.map((row) => {
    const newRow: Row = {};
    for (const [key, value] of Object.entries(row)) {
      if (!emptyColumns.includes(key)) {
        newRow[key] = value;
      }
    }
    return newRow;
  });

  const changes = emptyColumns.map((col) => ({
    rowIndex: -1 as const,
    column: col,
    originalValue: col,
    newValue: null as null,
    ruleId: "removeEmptyColumns",
    ruleName: "Remove Empty Columns",
    changeType: "removed" as const,
    timestamp: now,
  }));

  return {
    rows: newRows,
    changes,
    quarantined: [],
    stats: {
      rowsAffected: rows.length,
      cellsChanged: emptyColumns.length * rows.length,
      rowsRemoved: 0,
      rowsQuarantined: 0,
    },
  };
}
