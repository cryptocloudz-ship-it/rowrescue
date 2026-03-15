"use client";

import { useState } from "react";
import { Settings2, Lock, ChevronDown, Columns, Sparkles, X, ArrowRight, CheckCircle2, Eye } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";
import { ALL_RULES } from "@/lib/engine/rules";
import { FREE_RULES } from "@/config/plans";
import type { RuleCategory, RuleDefinition } from "@/types/rules";
import type { HealthReport } from "@/types/sheet";

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

// Maps health report issue types to the rule that fixes them
const ISSUE_TO_RULE: Record<string, string> = {
  duplicate_rows: "deduplicateRows",
  empty_rows: "removeEmptyRows",
  empty_columns: "removeEmptyColumns",
  inconsistent_headers: "normalizeHeaders",
  date_inconsistency: "normalizeDate",
  number_format: "normalizeNumbers",
  invalid_email: "validateEmail",
  invalid_phone: "validatePhone",
};

function getIssueCountForRule(ruleId: string, healthReport: HealthReport | null): number {
  if (!healthReport) return 0;
  const entry = Object.entries(ISSUE_TO_RULE).find(([, rid]) => rid === ruleId);
  if (!entry) return 0;
  const issue = healthReport.issues.find((i) => i.type === entry[0]);
  return issue?.count ?? 0;
}

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
        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
      >
        <Columns className="w-3 h-3" />
        {allSelected ? "All columns" : `${selectedColumns.length} column${selectedColumns.length !== 1 ? "s" : ""}`}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 p-3 bg-slate-900 border border-primary/20 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] max-h-48 overflow-y-auto custom-scrollbar relative z-10 w-64">
          <label className="flex items-center gap-3 text-xs text-slate-200 py-1.5 cursor-pointer hover:bg-white/5 rounded px-2 transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={selectAll}
              className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900"
            />
            <span className="font-bold">All columns</span>
          </label>
          <div className="border-t border-slate-700/50 mt-1 mb-1" />
          {headers.map((h) => (
            <label
              key={h}
              className="flex items-center gap-3 text-xs text-slate-300 py-1.5 cursor-pointer hover:bg-white/5 rounded px-2 transition-colors"
            >
              <input
                type="checkbox"
                checked={allSelected || selectedColumns.includes(h)}
                onChange={() => toggleColumn(h)}
                className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900"
              />
              <span className="truncate">{h}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function ProUpgradeModal({
  rule,
  issueCount,
  onClose,
}: {
  rule: RuleDefinition;
  issueCount: number;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!;
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel bg-slate-900/90 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 bg-gradient-to-br from-amber-500/10 to-transparent border-b border-amber-500/20 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl shadow-[inset_0_0_15px_rgba(245,158,11,0.2)] inline-block">
              <Sparkles className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="mt-5 text-2xl font-extrabold text-slate-100 relative z-10 tracking-tight">
            Unlock {rule.name}
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium relative z-10">
            {rule.description}
          </p>
          
          {issueCount > 0 && (
            <div className="mt-5 p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/30 shadow-inner relative z-10">
              <p className="text-sm text-amber-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400 drop-shadow flex-shrink-0" />
                This rule would fix {issueCount.toLocaleString()} issue{issueCount !== 1 ? "s" : ""} in your file instantly.
              </p>
            </div>
          )}
        </div>
        
        <div className="p-8 bg-slate-900/50 space-y-5">
          <ul className="space-y-4">
            {[
              "Access to all 17 advanced cleaning rules",
              "Unlimited daily exports",
              "Process up to 500,000 rows at once",
              "Export to native Excel (.xlsx)",
              "Remove RowRescue watermarks"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(13,242,223,0.5)] flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="pt-6 flex flex-col gap-4 border-t border-slate-800">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-lg font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-50"
            >
              {loading ? "Redirecting..." : "Upgrade to Pro \u2014 \u20AC12/mo"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
            <a
              href="/pricing"
              className="w-full text-center text-sm font-bold text-slate-500 hover:text-primary transition-colors py-2"
            >
              Compare plans &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RuleConfigurator({ onRunCleaning }: RuleConfiguratorProps) {
  const { ruleConfigs, toggleRule, isPro, parsedSheet, healthReport } = useSheetStore();
  const [upgradeRuleId, setUpgradeRuleId] = useState<string | null>(null);

  const enabledCount = ruleConfigs.filter((rc) => rc.enabled).length;
  const headers = parsedSheet?.headers ?? [];

  // Count Pro issues detected in the file
  const proIssueCount = healthReport
    ? healthReport.issues
        .filter((issue) => {
          const ruleId = ISSUE_TO_RULE[issue.type];
          return ruleId && !FREE_RULES.includes(ruleId);
        })
        .reduce((sum, issue) => sum + issue.count, 0)
    : 0;

  return (
    <section aria-labelledby="rules-heading" className="space-y-8 mt-2">
      <div className="flex items-end justify-between px-2">
        <div>
          <h3 id="rules-heading" className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Cleaning Rules
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Select which rules to apply. Preview changes before exporting.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg shadow-inner">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-slate-300">
            {enabledCount} selected
          </span>
        </div>
      </div>

      {/* Pro issues banner with ghost preview */}
      {!isPro && proIssueCount > 0 && (
        <div className="p-6 glass-panel border border-amber-500/30 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 flex-shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6 drop-shadow" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-amber-100">
                Ghost Preview: {proIssueCount} hidden issue{proIssueCount !== 1 ? "s" : ""} found
              </h4>
              <p className="text-sm font-medium text-amber-200/70 mt-1.5 mb-4 leading-relaxed">
                Pro rules can automatically fix these issues. Here&apos;s what we found in your file:
              </p>
              
              <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-amber-500/20 shadow-inner">
                {healthReport!.issues
                  .filter((issue) => {
                    const ruleId = ISSUE_TO_RULE[issue.type];
                    return ruleId && !FREE_RULES.includes(ruleId);
                  })
                  .map((issue) => {
                    return (
                      <div key={issue.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-3 text-slate-300">
                          <Eye className="w-4 h-4 text-amber-500/80" />
                          <span className="font-bold text-slate-200">{issue.title}</span>
                          <span className="text-slate-500 md:inline hidden">— {issue.description}</span>
                        </div>
                        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg whitespace-nowrap shadow-sm">
                          {issue.count} rows
                        </span>
                      </div>
                    );
                  })}
              </div>
              
              <div className="mt-5 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => setUpgradeRuleId("all")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-900 text-sm font-extrabold rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                >
                  <Lock className="w-4 h-4" />
                  Unlock all Pro rules
                </button>
                <span className="text-sm font-bold text-amber-500/60 uppercase tracking-wider">Only €12/month</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {CATEGORY_ORDER.map((category) => {
          const rules = ALL_RULES.filter((r) => r.category === category);
          if (rules.length === 0) return null;

          return (
            <div key={category} className="glass-panel border border-primary/5 rounded-2xl p-6">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-primary/60 mb-5 pl-1">
                {CATEGORY_LABELS[category]}
              </h4>
              <div className="space-y-3">
                {rules.map((rule) => {
                  const config = ruleConfigs.find(
                    (rc) => rc.ruleId === rule.id
                  );
                  const isFreeRule = FREE_RULES.includes(rule.id);
                  const isLocked = !isPro && !isFreeRule;
                  const isEnabled = config?.enabled ?? false;
                  const showColumnPicker =
                    isEnabled && rule.supportsColumnTargeting && headers.length > 0;
                  const issueCount = getIssueCountForRule(rule.id, healthReport);
                  const showUpgrade = upgradeRuleId === rule.id;

                  return (
                    <div
                      key={rule.id}
                      className={`
                        p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group
                        ${isEnabled
                          ? "bg-primary/10 border-primary shadow-[inset_0_0_15px_rgba(13,242,223,0.1)] shadow-[0_0_15px_rgba(13,242,223,0.05)]"
                          : isLocked
                            ? "bg-slate-800/30 border-dashed border-slate-700 hover:border-amber-400/50 hover:bg-slate-800/60"
                            : "bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80"
                        }
                      `}
                    >
                      {isEnabled && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary neon-glow" />
                      )}
                      <div
                        className={`flex items-start gap-4 ${isLocked ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (isLocked) {
                            setUpgradeRuleId(showUpgrade ? null : rule.id);
                          }
                        }}
                      >
                        <div className="mt-0.5 relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => {
                              if (!isLocked) toggleRule(rule.id);
                            }}
                            disabled={isLocked}
                            className={`w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900 transition-all cursor-[inherit] ${!isLocked && enabledCount === 0 && rule.id === FREE_RULES[0] ? "ring-2 ring-primary ring-offset-2 ring-offset-background-dark animate-pulse" : ""}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={`text-base font-bold tracking-tight transition-colors ${isEnabled ? "text-primary drop-shadow-[0_0_5px_rgba(13,242,223,0.5)]" : "text-slate-200 group-hover:text-white"}`}>
                              {rule.name}
                            </span>
                            {isLocked && (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded shadow-sm font-bold uppercase tracking-wider">
                                <Lock className="w-3 h-3" />
                                Pro
                              </span>
                            )}
                            {isLocked && issueCount > 0 && (
                              <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                                {issueCount} hidden issue{issueCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 font-medium transition-colors ${isEnabled ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      {showUpgrade && (
                        // Modal is rendered outside
                        null
                      )}
                      {showColumnPicker && (
                        <div className="ml-9 mt-2 p-3 bg-slate-900/50 rounded-lg border border-primary/20 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
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
      </div>

      {enabledCount > 0 && healthReport && (() => {
        const estimatedFixes = healthReport.issues.reduce((sum, issue) => {
          const ruleId = ISSUE_TO_RULE[issue.type];
          if (!ruleId) return sum;
          const config = ruleConfigs.find((rc) => rc.ruleId === ruleId);
          if (config?.enabled) return sum + issue.count;
          return sum;
        }, 0);
        const rowCount = parsedSheet?.rowCount ?? 0;
        return estimatedFixes > 0 ? (
          <div className="mt-8 p-4 glass-panel border border-primary/20 rounded-xl text-center animate-in fade-in duration-300">
            <p className="text-sm font-bold text-slate-300">
              Estimated impact: <span className="text-primary neon-text-glow text-lg">{estimatedFixes.toLocaleString()}</span> fixes across <span className="text-slate-100">{rowCount.toLocaleString()}</span> rows
            </p>
          </div>
        ) : null;
      })()}

      <button
        onClick={onRunCleaning}
        disabled={enabledCount === 0}
        aria-label={enabledCount === 0 ? "Select at least one rule to proceed" : `Apply ${enabledCount} cleaning rules and preview results`}
        className={`w-full ${enabledCount > 0 && healthReport ? "mt-4" : "mt-8"} px-4 py-4 rounded-xl transition-all duration-300 font-extrabold text-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark
          ${enabledCount === 0
            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            : "bg-primary text-background-dark hover:brightness-110 shadow-[0_0_20px_rgba(13,242,223,0.2)] hover:shadow-[0_0_30px_rgba(13,242,223,0.4)] neon-glow"
          }
        `}
      >
        {enabledCount === 0
          ? "Select at least one rule"
          : `Apply ${enabledCount} Rule${enabledCount > 1 ? "s" : ""} & Preview`}
      </button>

      {/* Render the modal outside of the inner content list */}
      {upgradeRuleId && (
        <ProUpgradeModal
          rule={
            upgradeRuleId === "all"
              ? {
                  id: "all",
                  name: "All Pro Features",
                  description: "Unlock all 17 advanced cleaning rules and process unlimited files up to unlimited rows at once.",
                  category: "row_cleaning", // unused
                  supportsColumnTargeting: false,
                } as RuleDefinition
              : ALL_RULES.find((r) => r.id === upgradeRuleId)!
          }
          issueCount={
            upgradeRuleId === "all"
              ? proIssueCount
              : getIssueCountForRule(upgradeRuleId, healthReport)
          }
          onClose={() => setUpgradeRuleId(null)}
        />
      )}
    </section>
  );
}
