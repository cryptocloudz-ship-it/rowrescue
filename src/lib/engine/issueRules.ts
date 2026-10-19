import type { HealthReport } from "@/types/sheet";
import { FREE_RULES } from "@/config/plans";

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
