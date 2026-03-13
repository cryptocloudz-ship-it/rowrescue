import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, NormalizeCaseOptions } from "@/types/rules";

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

export function normalizeCase(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = { caseType: "lower" as const, ...options } as NormalizeCaseOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string" || (targetColumns && !targetColumns.includes(key))) continue;

      let transformed: string;
      switch (opts.caseType) {
        case "upper":
          transformed = value.toUpperCase();
          break;
        case "title":
          transformed = toTitleCase(value);
          break;
        case "lower":
        default:
          transformed = value.toLowerCase();
          break;
      }

      if (transformed !== value) {
        newRow[key] = transformed;
        changes.push({
          rowIndex,
          column: key,
          originalValue: value,
          newValue: transformed,
          ruleId: "normalizeCase",
          ruleName: "Normalize Case",
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
