import type { Row } from "@/types/sheet";
import { generateHealthReport } from "@/lib/engine/healthReport";
import { autoEnableRules, defaultRuleConfigs } from "@/lib/engine/issueRules";
import { runEngine } from "@/lib/engine/ruleEngine";
import { reconcile, type Reconciliation } from "@/lib/engine/reconcile";

// The example file shown in the homepage hero. src/content/__tests__/heroSample.test.ts runs it
// through the real import → auto-enable → clean flow, so the hero can't claim more than the app does.

export type HeroCell = string | { before: string; after: string; pro?: boolean };

export interface HeroRow {
  date: HeroCell;
  vendor: HeroCell;
  amount: HeroCell;
  /** A repeat of an earlier row that de-duplication removes. */
  duplicate?: boolean;
}

export const HERO_FILE_NAME = "transactions_sept.csv";
export const HERO_COLUMNS = ["date", "vendor", "amount"] as const;

export const HERO_ROWS: HeroRow[] = [
  {
    date: { before: "03/09/2026", after: "2026-09-03" },
    vendor: { before: "Acme Supplies  ", after: "Acme Supplies" },
    amount: { before: "€1.250,00", after: "1250.00", pro: true },
  },
  {
    date: "2026-09-04",
    vendor: "Northwind Ltd",
    amount: "312.00",
  },
  {
    date: { before: "5 Sep 2026", after: "2026-09-05" },
    vendor: "Harbor Freight Co",
    amount: { before: "1,980.50", after: "1980.50", pro: true },
  },
  // Repeats row 2 exactly and needs no other fix, so every counted fix is visible in the hero
  { date: "2026-09-04", vendor: "Northwind Ltd", amount: "312.00", duplicate: true },
  {
    date: "2026-09-08",
    vendor: "Blue Pine LLC",
    amount: { before: "$450.00", after: "450.00", pro: true },
  },
];

/** The "N fixes" the cleaner reports for this file (changed cells + removed rows + flagged rows). */
export const HERO_FIXES = { free: 4, pro: 7 };

export function cellBefore(cell: HeroCell): string {
  return typeof cell === "string" ? cell : cell.before;
}

export function cellAfter(cell: HeroCell, isPro: boolean): string {
  if (typeof cell === "string") return cell;
  return cell.pro && !isPro ? cell.before : cell.after;
}

/** The hero file as CSV text, built from the "before" side of every cell. */
export function heroCsv(): string {
  const quote = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = HERO_ROWS.map((row) => HERO_COLUMNS.map((c) => quote(cellBefore(row[c]))).join(","));
  return [HERO_COLUMNS.join(","), ...lines].join("\n");
}

/** The hero file as parsed rows. */
export function heroRows(): Row[] {
  return HERO_ROWS.map((row) => Object.fromEntries(HERO_COLUMNS.map((c) => [c, cellBefore(row[c])])));
}

/** The totals check the cleaner shows for the hero file, run through the real engine. */
export function heroTotals(isPro = true): Reconciliation {
  const rows = heroRows();
  const headers = [...HERO_COLUMNS];
  const configs = autoEnableRules(defaultRuleConfigs(), generateHealthReport(rows, headers), isPro, null);
  const result = runEngine(rows, configs);
  return reconcile(rows, result.cleanedRows, result.snapshots, headers);
}
