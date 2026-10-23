"use client";

import { useSheetStore } from "@/store/sheetStore";
import { DATE_FORMATS, DATE_ORDERS } from "@/lib/engine/rules/normalizeDate";

/** Rules with settings beyond the column picker. */
const RULES_WITH_OPTIONS = new Set(["normalizeDate", "removeColumns"]);

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

function DeleteColumnsOptions({ headers }: { headers: string[] }) {
  const { options, update } = useRuleOptions("removeColumns");
  const selected = (options.columns as string[] | undefined) ?? [];
  const toggle = (col: string) =>
    update({ columns: selected.includes(col) ? selected.filter((c) => c !== col) : [...selected, col] });

  return (
    <fieldset>
      <legend className={labelClass}>
        Columns to delete{selected.length > 0 ? ` (${selected.length} of ${headers.length})` : ""}
      </legend>
      {selected.length === 0 && <p className="mt-1 text-xs text-ink-muted">Tick the columns you don&apos;t want in the cleaned file.</p>}
      {selected.length > 0 && selected.length === headers.length && (
        <p className="mt-1 text-xs text-rose-700">Every column is ticked, so the cleaned file would be empty.</p>
      )}
      <div className="mt-2 max-h-48 overflow-y-auto custom-scrollbar grid gap-x-4 sm:grid-cols-2">
        {headers.map((h) => (
          <label key={h} className="flex items-center gap-3 text-xs text-ink-body py-1.5 cursor-pointer rounded px-2">
            <input
              type="checkbox"
              checked={selected.includes(h)}
              onChange={() => toggle(h)}
              className="rounded border-rule bg-surface text-accent focus:ring-accent focus:ring-offset-white"
            />
            <span className="truncate">{h}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Settings for one rule, shown under it while it's switched on. */
export function RuleOptionsPanel({ ruleId, headers }: { ruleId: string; headers: string[] }) {
  switch (ruleId) {
    case "normalizeDate":
      return <DateOptions />;
    case "removeColumns":
      return <DeleteColumnsOptions headers={headers} />;
    default:
      return null;
  }
}
