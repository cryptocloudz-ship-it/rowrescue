import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions } from "@/types/rules";

export function removeEmptyRows(
  rows: Row[],
  _options: RuleOptions = {}
): CleanResult {
  const changes: CellChange[] = [];
  const now = Date.now();
  const nonEmptyRows: Row[] = [];
  let removed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const isEmpty = Object.values(row).every(
      (val) => val === null || val === undefined || String(val).trim() === ""
    );

    if (isEmpty) {
      removed++;
      for (const col of Object.keys(row)) {
        changes.push({
          rowIndex: i,
          column: col,
          originalValue: row[col],
          newValue: null,
          ruleId: "removeEmptyRows",
          ruleName: "Remove Empty Rows",
          changeType: "removed",
          timestamp: now,
        });
      }
    } else {
      nonEmptyRows.push(row);
    }
  }

  return {
    rows: nonEmptyRows,
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
