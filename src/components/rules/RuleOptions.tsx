"use client";

import { useSheetStore } from "@/store/sheetStore";
import { DATE_FORMATS, DATE_ORDERS } from "@/lib/engine/rules/normalizeDate";

/** Rules with settings beyond the column picker. */
const RULES_WITH_OPTIONS = new Set(["normalizeDate"]);

export function hasRuleOptions(ruleId: string): boolean {
  return RULES_WITH_OPTIONS.has(ruleId);
}

const selectClass =
  "mt-1 block w-full max-w-xs rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-accent focus:ring-accent";
const labelClass = "block text-xs font-semibold text-ink-body";

function useRuleOptions(ruleId: string) {
  const { ruleConfigs, updateRuleOptions } = useSheetStore();
  const options = ruleConfigs.find((rc) => rc.ruleId === ruleId)?.options ?? {};
  return { options, update: (patch: Record<string, unknown>) => updateRuleOptions(ruleId, patch) };
}

function DateOptions() {
  const { options, update } = useRuleOptions("normalizeDate");
  const targetFormat = (options.targetFormat as string | undefined) ?? "YYYY-MM-DD";
  const dateOrder = (options.dateOrder as string | undefined) ?? "auto";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Output format
        <select value={targetFormat} onChange={(e) => update({ targetFormat: e.target.value })} className={selectClass}>
          {DATE_FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.value} ({f.example})
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Read dates like 03/04/2024 as
        <select value={dateOrder} onChange={(e) => update({ dateOrder: e.target.value })} className={selectClass}>
          {DATE_ORDERS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

/** Settings for one rule, shown under it while it's switched on. */
export function RuleOptionsPanel({ ruleId }: { ruleId: string; headers: string[] }) {
  switch (ruleId) {
    case "normalizeDate":
      return <DateOptions />;
    default:
      return null;
  }
}
