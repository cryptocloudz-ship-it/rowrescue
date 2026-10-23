"use client";

import { useSheetStore } from "@/store/sheetStore";
import { DATE_FORMATS, DATE_ORDERS } from "@/lib/engine/rules/normalizeDate";
import { FILTER_OPERATORS } from "@/lib/engine/rules/filterRows";

/** Rules with settings beyond the column picker. */
const RULES_WITH_OPTIONS = new Set(["normalizeDate", "removeColumns", "filterRows"]);

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

function FilterRowsOptions({ headers }: { headers: string[] }) {
  const { options, update } = useRuleOptions("filterRows");
  const mode = (options.mode as string | undefined) ?? "remove";
  const column = (options.column as string | undefined) ?? "";
  const operator = (options.operator as string | undefined) ?? "equals";
  const value = (options.value as string | undefined) ?? "";
  const needsValue = FILTER_OPERATORS.find((o) => o.value === operator)?.needsValue ?? true;
  const numeric = operator === "gt" || operator === "lt";
  const incomplete = !column || (needsValue && value.trim() === "");

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className={labelClass}>
          Rows
          <select value={mode} onChange={(e) => update({ mode: e.target.value })} className={selectClass}>
            <option value="remove">Remove rows</option>
            <option value="keep">Keep only rows</option>
          </select>
        </label>
        <label className={labelClass}>
          where column
          <select value={column} onChange={(e) => update({ column: e.target.value })} className={selectClass}>
            <option value="" disabled>
              Choose a column
            </option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          condition
          <select value={operator} onChange={(e) => update({ operator: e.target.value })} className={selectClass}>
            {FILTER_OPERATORS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {needsValue && (
          <label className={labelClass}>
            value
            <input
              type="text"
              inputMode={numeric ? "decimal" : undefined}
              value={value}
              onChange={(e) => update({ value: e.target.value })}
              placeholder={numeric ? "e.g. 0" : "e.g. Pending"}
              className={selectClass}
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        {incomplete
          ? "Choose a column and a value to filter by. Until then this rule changes nothing."
          : numeric
            ? "Reads amounts like €1,234.56 or (50.00). Cells that aren't numbers never match. Removed rows are counted in the summary and change log."
            : "Ignores upper/lower case and spaces at either end. Removed rows are counted in the summary and change log."}
      </p>
    </div>
  );
}

/** Settings for one rule, shown under it while it's switched on. */
export function RuleOptionsPanel({ ruleId, headers }: { ruleId: string; headers: string[] }) {
  switch (ruleId) {
    case "normalizeDate":
      return <DateOptions />;
    case "removeColumns":
      return <DeleteColumnsOptions headers={headers} />;
    case "filterRows":
      return <FilterRowsOptions headers={headers} />;
    default:
      return null;
  }
}
