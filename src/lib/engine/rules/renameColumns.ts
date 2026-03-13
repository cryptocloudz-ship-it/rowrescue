import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, RenameColumnsOptions } from "@/types/rules";

export function renameColumns(
  rows: Row[],
  options: RuleOptions = {}
): CleanResult {
  const { aliasMap = {} } = options as RenameColumnsOptions;
  const changes: CellChange[] = [];
  const now = Date.now();

  const newRows = rows.map((row) => {
    const newRow: Row = {};
    for (const [key, value] of Object.entries(row)) {
      const newKey = aliasMap[key] ?? key;
      newRow[newKey] = value;
    }
    return newRow;
  });

  for (const [oldName, newName] of Object.entries(aliasMap)) {
    if (rows.length > 0 && oldName in rows[0]) {
      changes.push({
        rowIndex: -1,
        column: newName,
        originalValue: oldName,
        newValue: newName,
        ruleId: "renameColumns",
        ruleName: "Rename Columns",
        changeType: "changed",
        timestamp: now,
      });
    }
  }

  return {
    rows: newRows,
    changes,
    quarantined: [],
    stats: {
      rowsAffected: changes.length > 0 ? rows.length : 0,
      cellsChanged: changes.length,
      rowsRemoved: 0,
      rowsQuarantined: 0,
    },
  };
}
