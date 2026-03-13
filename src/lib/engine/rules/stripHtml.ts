import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, StripHtmlOptions } from "@/types/rules";

const HTML_TAG_REGEX = /<[^>]*>/g;

export function stripHtml(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts = options as StripHtmlOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "string" && (!targetColumns || targetColumns.includes(key))) {
        const stripped = value.replace(HTML_TAG_REGEX, "").trim();
        newRow[key] = stripped;
        if (stripped !== value) {
          changes.push({
            rowIndex,
            column: key,
            originalValue: value,
            newValue: stripped,
            ruleId: "stripHtml",
            ruleName: "Strip HTML",
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
