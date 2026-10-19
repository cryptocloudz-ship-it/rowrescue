"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings2, Lock, ChevronDown, Columns, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSheetStore } from "@/store/sheetStore";
import { ALL_RULES } from "@/lib/engine/rules";
import { FREE_RULES } from "@/config/plans";
import type { RuleCategory, RuleDefinition } from "@/types/rules";
import type { HealthReport } from "@/types/sheet";
import { ISSUE_TO_RULE } from "@/lib/engine/issueRules";

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
        className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent transition-colors"
      >
        <Columns className="w-3 h-3" />
        {allSelected ? "All columns" : `${selectedColumns.length} column${selectedColumns.length !== 1 ? "s" : ""}`}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 p-3 bg-surface border border-rule rounded-lg max-h-48 overflow-y-auto custom-scrollbar relative z-10 w-64">
          <label className="flex items-center gap-3 text-xs text-ink py-1.5 cursor-pointer hover:bg-surface rounded px-2 transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={selectAll}
              className="rounded border-rule bg-surface text-accent focus:ring-accent focus:ring-offset-white"
            />
            <span className="font-semibold">All columns</span>
          </label>
          <div className="border-t border-rule mt-1 mb-1" />
          {headers.map((h) => (
            <label
              key={h}
              className="flex items-center gap-3 text-xs text-ink-body py-1.5 cursor-pointer hover:bg-surface rounded px-2 transition-colors"
            >
              <input
                type="checkbox"
                checked={allSelected || selectedColumns.includes(h)}
                onChange={() => toggleColumn(h)}
                className="rounded border-rule bg-surface text-accent focus:ring-accent focus:ring-offset-white"
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40">
      <div role="dialog" aria-modal="true" className="w-full max-w-md bg-paper border border-rule-strong rounded-[10px] shadow-frame overflow-hidden">
        <div className="p-8 border-b border-rule relative">
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-muted hover:bg-surface hover:text-ink transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="-mt-6 pr-10 text-2xl font-semibold text-ink tracking-tight">
            Unlock {rule.name}
          </h2>
          <p className="mt-2 text-sm text-ink-muted font-medium relative z-10">
            {rule.description}
          </p>
          
          {issueCount > 0 && (
            <div className="mt-5 p-3.5 bg-accent-tint rounded-lg border border-rule relative z-10">
              <p className="text-sm text-accent font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                This rule would fix {issueCount.toLocaleString()} issue{issueCount !== 1 ? "s" : ""} in your file.
              </p>
            </div>
          )}
        </div>
        
        <div className="p-8 bg-surface space-y-5">
          <ul className="space-y-4">
            {[
              `All ${ALL_RULES.length} cleaning rules`,
              "Unlimited daily exports",
              "Process up to 500,000 rows at once",
              "Export to native Excel (.xlsx)",
              "No watermark on exports"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-ink-body">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="pt-6 flex flex-col gap-4 border-t border-rule">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-accent text-white text-lg font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Redirecting..." : "Upgrade to Pro \u2014 \u20AC12/mo"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
            <Link
              href="/pricing"
              className="w-full text-center text-sm font-semibold text-ink-muted hover:text-accent transition-colors py-2"
            >
              Compare plans &rarr;
            </Link>
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
          <h3 id="rules-heading" className="text-2xl font-semibold text-ink tracking-tight">
            Cleaning Rules
          </h3>
          <p className="text-sm font-medium text-ink-muted mt-1">
            Select which rules to apply. Preview changes before exporting.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-rule px-3 py-1.5 rounded-lg">
          <Settings2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-ink-body">
            {enabledCount} selected
          </span>
        </div>
      </div>

      {/* Pro issues banner with ghost preview */}
      {!isPro && proIssueCount > 0 && (
        <div className="p-6 bg-paper border border-rule rounded-lg relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-ink">
                Pro rules would fix {proIssueCount} more issue{proIssueCount !== 1 ? "s" : ""}
              </h4>
              <p className="text-sm text-ink-body mt-1.5 mb-4 leading-relaxed">
                Found in your file:
              </p>
              
              <div className="space-y-2 bg-surface p-4 rounded-lg border border-rule">
                {healthReport!.issues
                  .filter((issue) => {
                    const ruleId = ISSUE_TO_RULE[issue.type];
                    return ruleId && !FREE_RULES.includes(ruleId);
                  })
                  .map((issue) => {
                    return (
                      <div key={issue.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-3 text-ink-body">
                          
                          <span className="font-semibold text-ink">{issue.title}</span>
                          <span className="text-ink-muted md:inline hidden">— {issue.description}</span>
                        </div>
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-accent-tint text-accent border border-rule rounded-lg whitespace-nowrap">
                          {issue.count} to fix
                        </span>
                      </div>
                    );
                  })}
              </div>
              
              <div className="mt-5 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => setUpgradeRuleId("all")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-strong transition-all"
                >
                  <Lock className="w-4 h-4" />
                  Unlock all Pro rules
                </button>
                <span className="text-sm text-ink-muted">Pro is €12 a month</span>
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
            <div key={category} className="bg-paper border border-rule rounded-lg p-6">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-accent mb-5 pl-1">
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
                        p-4 rounded-lg border transition-all duration-300 relative overflow-hidden group
                        ${isEnabled
                          ? "bg-accent-tint border-accent"
                          : isLocked
                            ? "bg-surface border-dashed border-rule hover:border-rule-strong hover:bg-surface"
                            : "bg-surface border-rule hover:border-rule hover:bg-surface"
                        }
                      
                      `}
                    >
                      {isEnabled && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
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
                            className={`w-5 h-5 rounded border-rule bg-surface text-accent focus:ring-accent focus:ring-offset-white transition-all cursor-[inherit] ${!isLocked && enabledCount === 0 && rule.id === FREE_RULES[0] ? "ring-2 ring-accent ring-offset-2 ring-offset-white animate-pulse" : ""}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={`text-base font-semibold tracking-tight transition-colors ${isEnabled ? "text-accent" : "text-ink group-hover:text-white"}`}>
                              {rule.name}
                            </span>
                            {isLocked && (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-accent-tint border border-rule text-accent px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                                <Lock className="w-3 h-3" />
                                Pro
                              </span>
                            )}
                            {isLocked && issueCount > 0 && (
                              <span className="text-xs text-accent font-semibold bg-accent-tint px-2 py-0.5 rounded border border-rule">
                                {issueCount} hidden issue{issueCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 font-medium transition-colors ${isEnabled ? "text-ink-body" : "text-ink-muted group-hover:text-ink-muted"}`}>
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      {showUpgrade && (
                        // Modal is rendered outside
                        null
                      )}
                      {showColumnPicker && (
                        <div className="ml-9 mt-2 p-3 bg-surface rounded-lg border border-rule animate-in fade-in slide-in-from-top-2 duration-300">
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
          <div className="mt-8 p-4 bg-paper border border-rule rounded-lg text-center animate-in fade-in duration-300">
            <p className="text-sm font-semibold text-ink-body">
              Estimated impact: <span className="text-accent text-lg">{estimatedFixes.toLocaleString()}</span> fixes across <span className="text-ink">{rowCount.toLocaleString()}</span> rows
            </p>
          </div>
        ) : null;
      })()}

      <button
        onClick={onRunCleaning}
        disabled={enabledCount === 0}
        aria-label={enabledCount === 0 ? "Select at least one rule to proceed" : `Apply ${enabledCount} cleaning rules and preview results`}
        className={`w-full ${enabledCount > 0 && healthReport ? "mt-4" : "mt-8"} px-4 py-4 rounded-lg transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-white
          ${enabledCount === 0
            ? "bg-surface text-ink-muted cursor-not-allowed border border-rule"
            : "bg-accent text-white hover:bg-accent-strong"
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
                  description: "Unlock every cleaning rule and process files of up to 500,000 rows at once.",
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
