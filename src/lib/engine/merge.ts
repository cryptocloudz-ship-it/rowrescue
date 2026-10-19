import type { ParsedSheet, Row } from "@/types/sheet";

export interface MergeResult {
  headers: string[];
  rows: Row[];
  duplicatesRemoved: number;
  /** Row count before truncation, when maxRows cut the result */
  truncatedFrom: number | null;
}

/**
 * Stack sheets into one, matching columns by header name ignoring case and surrounding spaces.
 * Columns missing from a sheet are left empty. Header order and spelling follow first appearance.
 */
export function mergeSheets(
  sheets: Pick<ParsedSheet, "headers" | "rows">[],
  { dedupe = false, maxRows }: { dedupe?: boolean; maxRows?: number } = {}
): MergeResult {
  const headers: string[] = [];
  const canonical = new Map<string, string>(); // normalized key → first-seen header
  const keyOf = (h: string) => h.trim().toLowerCase();
  for (const sheet of sheets) {
    for (const h of sheet.headers) {
      const key = keyOf(h);
      if (key && !canonical.has(key)) {
        canonical.set(key, h.trim());
        headers.push(h.trim());
      }
    }
  }

  const seen = new Set<string>();
  let duplicatesRemoved = 0;
  const rows: Row[] = [];

  for (const sheet of sheets) {
    for (const source of sheet.rows) {
      const row: Row = {};
      for (const h of headers) row[h] = "";
      for (const [key, value] of Object.entries(source)) {
        const name = canonical.get(keyOf(key));
        if (name) row[name] = value ?? "";
      }
      if (dedupe) {
        const key = JSON.stringify(headers.map((h) => row[h]));
        if (seen.has(key)) {
          duplicatesRemoved++;
          continue;
        }
        seen.add(key);
      }
      rows.push(row);
    }
  }

  const truncatedFrom = maxRows !== undefined && rows.length > maxRows ? rows.length : null;
  return {
    headers,
    rows: truncatedFrom ? rows.slice(0, maxRows) : rows,
    duplicatesRemoved,
    truncatedFrom,
  };
}
