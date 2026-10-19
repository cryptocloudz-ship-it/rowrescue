import type { Row, CleanResult, CellChange } from "@/types/sheet";
import type { RuleOptions, FixEncodingOptions } from "@/types/rules";

// Windows-1252 code points 0x80–0x9F that differ from Latin-1
const CP1252_EXTRAS: Record<string, number> = {
  "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87,
  "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91,
  "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98,
  "™": 0x99, "š": 0x9a, "›": 0x9b, "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
};

// UTF-8 lead byte (Ã, Â, â, ð…) misread as Windows-1252, followed by a continuation byte
const MOJIBAKE = /[Â-ô][\u0080-¿ŒœŠšŸŽžƒˆ˜–—‘-‚“-„†-•…‰‹›€™]/;

const utf8 = new TextDecoder("utf-8", { fatal: true });

/** Undo one round of UTF-8 → Windows-1252 misdecoding. Returns null if the value isn't mojibake. */
export function repairMojibake(value: string): string | null {
  if (!MOJIBAKE.test(value)) return null;
  const bytes: number[] = [];
  for (const ch of value) {
    const code = ch.codePointAt(0)!;
    if (code <= 0xff) bytes.push(code);
    else if (ch in CP1252_EXTRAS) bytes.push(CP1252_EXTRAS[ch]);
    else return null; // a character Windows-1252 can't produce — not a clean round-trip
  }
  try {
    const repaired = utf8.decode(new Uint8Array(bytes));
    return repaired !== value ? repaired : null;
  } catch {
    return null;
  }
}

export function fixEncoding(rows: Row[], options: RuleOptions = {}): CleanResult {
  const opts = options as FixEncodingOptions;
  const changes: CellChange[] = [];
  const now = Date.now();
  const targetColumns = opts.columns;

  const newRows = rows.map((row, rowIndex) => {
    const newRow: Row = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string" || (targetColumns && !targetColumns.includes(key))) continue;
      let repaired = repairMojibake(value);
      // Double-encoded text (Ã\u0083Â©) needs a second pass
      const twice = repaired && repairMojibake(repaired);
      if (twice) repaired = twice;
      if (repaired) {
        const cleaned = repaired;
        newRow[key] = cleaned;
        changes.push({
          rowIndex,
          column: key,
          originalValue: value,
          newValue: cleaned,
          ruleId: "fixEncoding",
          ruleName: "Fix Encoding",
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
