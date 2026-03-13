"use client";

import { useState } from "react";
import { Settings2, Lock, ChevronDown, Columns } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";
import { ALL_RULES } from "@/lib/engine/rules";
import { FREE_RULES } from "@/config/plans";
import type { RuleCategory } from "@/types/rules";

const CATEGORY_LABELS: Record<RuleCategory, string> = {
  column_management: "Column Management",
  row_cleaning: "Row Cleaning",
  data_standardisation: "Data Standardisation",
  validation: "Validation",
};

const CATEGORY_ORDER: RuleCategory[] = [
  "row_cleaning",
  "column_management",
  "data_standardisation",
  "validation",
];

interface RuleConfiguratorProps {
  onRunCleaning: () => void;
}

function ColumnPicker({
  ruleId,
  headers,
}: {
  ruleId: string;
  headers: string[];
}) {
  const { ruleConfigs, updateRuleOptions } = useSheetStore();
  const [open, setOpen] = useState(false);

  const config = ruleConfigs.find((rc) => rc.ruleId === ruleId);
  const selectedColumns = (config?.options?.columns as string[] | undefined) ?? [];
  const allSelected = selectedColumns.length === 0;

  const toggleColumn = (col: string) => {
    const current = selectedColumns;
    const updated = current.includes(col)
      ? current.filter((c) => c !== col)
      : [...current, col];
    updateRuleOptions(ruleId, { columns: updated.length === headers.length ? [] : updated });
  };

  const selectAll = () => {
    updateRuleOptions(ruleId, { columns: [] });
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700"
      >
        <Columns className="w-3 h-3" />
        {allSelected ? "All columns" : `${selectedColumns.length} column${selectedColumns.length !== 1 ? "s" : ""}`}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1.5 p-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-40 overflow-y-auto">
          <label className="flex items-center gap-2 text-xs text-gray-700 py-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={selectAll}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium">All columns</span>
          </label>
          <div className="border-t border-gray-100 mt-1 pt-1">
            {headers.map((h) => (
              <label
                key={h}
                className="flex items-center gap-2 text-xs text-gray-600 py-0.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={allSelected || selectedColumns.includes(h)}
                  onChange={() => toggleColumn(h)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                {h}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RuleConfigurator({ onRunCleaning }: RuleConfiguratorProps) {
  const { ruleConfigs, toggleRule, isPro, parsedSheet } = useSheetStore();

  const enabledCount = ruleConfigs.filter((rc) => rc.enabled).length;
  const headers = parsedSheet?.headers ?? [];

  return (
    <section aria-labelledby="rules-heading" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 id="rules-heading" className="text-lg font-semibold text-gray-900">
            Cleaning Rules
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Select which rules to apply. Preview changes before exporting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {enabledCount} selected
          </span>
        </div>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const rules = ALL_RULES.filter((r) => r.category === category);
        if (rules.length === 0) return null;

        return (
          <div key={category}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {CATEGORY_LABELS[category]}
            </h4>
            <div className="space-y-2">
              {rules.map((rule) => {
                const config = ruleConfigs.find(
                  (rc) => rc.ruleId === rule.id
                );
                const isFreeRule = FREE_RULES.includes(rule.id);
                const isLocked = !isPro && !isFreeRule;
                const isEnabled = config?.enabled ?? false;
                const showColumnPicker =
                  isEnabled && rule.supportsColumnTargeting && headers.length > 0;

                return (
                  <div
                    key={rule.id}
                    className={`
                      p-3 rounded-lg border transition-all
                      ${isEnabled
                        ? "bg-teal-50 border-teal-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                      }
                      ${isLocked ? "opacity-60" : ""}
                    `}
                  >
                    <label
                      className={`flex items-start gap-3 cursor-pointer ${isLocked ? "cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleRule(rule.id)}
                        disabled={isLocked}
                        className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {rule.name}
                          </span>
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              <Lock className="w-3 h-3" />
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {rule.description}
                        </p>
                      </div>
                    </label>
                    {showColumnPicker && (
                      <div className="ml-7">
                        <ColumnPicker ruleId={rule.id} headers={headers} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={onRunCleaning}
        disabled={enabledCount === 0}
        aria-label={enabledCount === 0 ? "Select at least one rule to proceed" : `Apply ${enabledCount} cleaning rules and preview results`}
        className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        {enabledCount === 0
          ? "Select at least one rule"
          : `Apply ${enabledCount} Rule${enabledCount > 1 ? "s" : ""} & Preview`}
      </button>
    </section>
  );
}
