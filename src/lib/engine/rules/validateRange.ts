import type { Row, CleanResult, CellChange, QuarantinedRow } from "@/types/sheet";
import type { RuleOptions, ValidateRangeOptions } from "@/types/rules";

export function validateRange(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = options as ValidateRangeOptions;
  const changes: CellChange[] = [];
  const quarantined: QuarantinedRow[] = [];
  const now = Date.now();
  const cleanRows: Row[] = [];

  if (!opts.column) return { rows: [...rows], changes: [], quarantined: [], stats: { rowsAffected: 0, cellsChanged: 0, rowsRemoved: 0, rowsQuarantined: 0 } };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const value = row[opts.column];
    const num = Number(value);

    if (value !== null && value !== undefined && String(value).trim() !== "" && !isNaN(num)) {
      const belowMin = opts.min !== undefined && num < opts.min;
      const aboveMax = opts.max !== undefined && num > opts.max;

      if (belowMin || aboveMax) {
        changes.push({
          rowIndex: i,
          column: opts.column,
          originalValue: value,
          newValue: value,
          ruleId: "validateRange",
          ruleName: "Validate Range",
          changeType: "flagged",
          timestamp: now,
        });
        quarantined.push({
          originalIndex: i,
          row,
          reason: `Value ${num} out of range [${opts.min ?? "-∞"}, ${opts.max ?? "∞"}]`,
          ruleId: "validateRange",
        });
      }
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
