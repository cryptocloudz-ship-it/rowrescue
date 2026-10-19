import type { HealthReport } from "@/types/sheet";
import type { RuleConfig } from "@/types/rules";
import { FREE_RULES } from "@/config/plans";
import { ALL_RULES } from "./rules";

/** Maps each health report issue type to the rule that fixes it. */
export const ISSUE_TO_RULE: Record<string, string> = {
  duplicate_rows: "deduplicateRows",
  encoding_issues: "fixEncoding",
  stray_whitespace: "trimWhitespace",
  empty_rows: "removeEmptyRows",
  empty_columns: "removeEmptyColumns",
  inconsistent_headers: "normalizeHeaders",
  date_inconsistency: "normalizeDate",
  number_format: "normalizeNumbers",
  invalid_email: "validateEmail",
  invalid_phone: "validatePhone",
};

/** Issues found that only a Pro rule would fix, summed (used for the free-plan upsell). */
export function proOnlyIssueCount(report: HealthReport): number {
  return report.issues
    .filter((i) => {
      const ruleId = ISSUE_TO_RULE[i.type];
      return ruleId !== undefined && !FREE_RULES.includes(ruleId);
    })
    .reduce((sum, i) => sum + i.count, 0);
}

/** Every rule, switched off: the starting point before auto-enable. */
export function defaultRuleConfigs(): RuleConfig[] {
  return ALL_RULES.map((rule) => ({ ruleId: rule.id, enabled: false, options: {} }));
}

/** Rules a tool landing page asks to switch on, with optional per-rule options. */
export interface RulePreset {
  ruleIds: string[];
  options?: Record<string, Record<string, unknown>>;
}

/** Enable rules matching detected issues plus any preset rules, limited to what the plan allows. */
export function autoEnableRules(
  ruleConfigs: RuleConfig[],
  report: HealthReport,
  isPro: boolean,
  preset: RulePreset | null
): RuleConfig[] {
  const wanted = new Set(
    report.issues
      .filter((i) => i.count > 0)
      .map((i) => ISSUE_TO_RULE[i.type])
      .filter(Boolean)
  );
  preset?.ruleIds.forEach((id) => wanted.add(id));
  return ruleConfigs.map((rc) => {
    if (!wanted.has(rc.ruleId) || !(isPro || FREE_RULES.includes(rc.ruleId))) return rc;
    const presetOptions = preset?.options?.[rc.ruleId];
    return { ...rc, enabled: true, options: presetOptions ? { ...rc.options, ...presetOptions } : rc.options };
  });
}
