import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions } from "@/types/rules";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = options as { columns?: string[] };
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string" || (targetColumns && !targetColumns.includes(key))) continue;

      const trimmed = value.trim().toLowerCase();
      if (!trimmed || !EMAIL_REGEX.test(trimmed)) continue;

      if (trimmed !== value) {
        newRow[key] = trimmed;
        changes.push({
          rowIndex,
          column: key,
          originalValue: value,
          newValue: trimmed,
          ruleId: "normalizeEmail",
          ruleName: "Normalize Email",
          changeType: "changed",
          timestamp: now,
        });
      }
    }
    return newRow;
  });

  return {
    rows: newRows,
    changes,
    quarantined: [],
    stats: {
      rowsAffected: new Set(changes.map((c) => c.rowIndex)).size,
      cellsChanged: changes.length,
      rowsRemoved: 0,
      rowsQuarantined: 0,
    },
  };
}
