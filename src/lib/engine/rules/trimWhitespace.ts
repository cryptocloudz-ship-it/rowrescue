import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, TrimWhitespaceOptions } from "@/types/rules";

export function trimWhitespace(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = options as TrimWhitespaceOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "string" && (!targetColumns || targetColumns.includes(key))) {
        const trimmed = value.replace(/\s+/g, " ").trim();
        newRow[key] = trimmed;
        if (trimmed !== value) {
          changes.push({
            rowIndex,
            column: key,
            originalValue: value,
            newValue: trimmed,
            ruleId: "trimWhitespace",
            ruleName: "Trim Whitespace",
            changeType: "changed",
            timestamp: now,
          });
        }
      } else {
        newRow[key] = value;
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
