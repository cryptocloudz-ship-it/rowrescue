import type { Row, CleanResult, CellChange, QuarantinedRow } from "@/types/sheet";
import type { RuleOptions, ValidateRequiredOptions } from "@/types/rules";

export function validateRequired(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = options as ValidateRequiredOptions;
  const changes: CellChange[] = [];
  const quarantined: QuarantinedRow[] = [];
  const now = Date.now();
  const cleanRows: Row[] = [];

  // No pick (the picker's "All columns") means every column is required
  const requiredColumns = opts.columns?.length ? opts.columns : Object.keys(rows[0] ?? {});

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const missingCols: string[] = [];

    for (const col of requiredColumns) {
      const value = row[col];
      if (value === null || value === undefined || String(value).trim() === "") {
        missingCols.push(col);
        changes.push({
          rowIndex: i,
          column: col,
          originalValue: value,
          newValue: value,
          ruleId: "validateRequired",
          ruleName: "Validate Required",
          changeType: "flagged",
          timestamp: now,
        });
      }
    }

    if (missingCols.length > 0) {
      quarantined.push({
        originalIndex: i,
        row,
        reason: `Missing required: ${missingCols.join(", ")}`,
        ruleId: "validateRequired",
      });
    }
    cleanRows.push(row);
  }

  return {
    rows: cleanRows,
    changes,
    quarantined,
    stats: {
      rowsAffected: quarantined.length,
      cellsChanged: changes.length,
      rowsRemoved: 0,
      rowsQuarantined: quarantined.length,
    },
  };
}
