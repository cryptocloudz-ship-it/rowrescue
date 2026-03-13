import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, NormalizeHeadersOptions } from "@/types/rules";

export function normalizeHeaders(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const opts: NormalizeHeadersOptions = { style: "lowercase_underscore", ...options };
  const changes: CellChange[] = [];
  const now = Date.now();

  if (rows.length === 0) {
    return { rows: [], changes: [], quarantined: [], stats: { rowsAffected: 0, cellsChanged: 0, rowsRemoved: 0, rowsQuarantined: 0 } };
  }

  const originalHeaders = Object.keys(rows[0]);
  const headerMap: Record<string, string> = {};

  for (const header of originalHeaders) {
    let normalized: string;
    const trimmed = header.trim();

    switch (opts.style) {
      case "lowercase_dash":
        normalized = trimmed.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
        break;
      case "camelCase":
        normalized = trimmed
          .toLowerCase()
          .replace(/[^a-z0-9\s_]/g, "")
          .replace(/[\s_]+(.)/g, (_, c: string) => c.toUpperCase());
        break;
      case "lowercase_underscore":
      default:
        normalized = trimmed.toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_]/g, "");
        break;
    }

    if (!normalized) normalized = `column_${originalHeaders.indexOf(header)}`;
    headerMap[header] = normalized;
  }

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = {};
    for (const [oldKey, newKey] of Object.entries(headerMap)) {
      newRow[newKey] = row[oldKey];
      if (oldKey !== newKey) {
        changes.push({
          rowIndex,
          column: newKey,
          originalValue: oldKey,
          newValue: newKey,
          ruleId: "normalizeHeaders",
          ruleName: "Normalize Headers",
          changeType: "changed",
          timestamp: now,
        });
      }
    }
    return newRow;
  });

  // Only count header changes once, not per-row
  const headerChanges = Object.entries(headerMap)
    .filter(([old, n]) => old !== n)
    .map(
      ([old, n]): CellChange => ({
        rowIndex: -1,
        column: n,
        originalValue: old,
        newValue: n,
        ruleId: "normalizeHeaders",
        ruleName: "Normalize Headers",
        changeType: "changed",
        timestamp: now,
      })
    );

  return {
    rows: newRows,
    changes: headerChanges,
    quarantined: [],
    stats: {
      rowsAffected: headerChanges.length > 0 ? rows.length : 0,
      cellsChanged: headerChanges.length,
      rowsRemoved: 0,
      rowsQuarantined: 0,
    },
  };
}
