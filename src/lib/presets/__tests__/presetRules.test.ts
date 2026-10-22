import { describe, expect, it } from "vitest";
import {
  applyPresetRules,
  createPresetSchema,
  parseStoredRules,
  PRESET_RULES_MAX_BYTES,
  snapshotRules,
  updatePresetSchema,
} from "../presetRules";
import { defaultRuleConfigs } from "@/lib/engine/issueRules";

const rule = (ruleId: string, options: Record<string, unknown> = {}) => ({ ruleId, enabled: true as const, options });

describe("createPresetSchema", () => {
  it("accepts a named preset of known rules and defaults the rest", () => {
    const parsed = createPresetSchema.parse({ name: "  CRM export ", rules: [rule("trimWhitespace")] });
    expect(parsed).toEqual({ name: "CRM export", description: "", rules: [rule("trimWhitespace")], isShared: false });
  });

  it("rejects unknown rules, duplicates, empty selections and blank names", () => {
    expect(createPresetSchema.safeParse({ name: "x", rules: [rule("dropTables")] }).success).toBe(false);
    expect(createPresetSchema.safeParse({ name: "x", rules: [rule("trimWhitespace"), rule("trimWhitespace")] }).success).toBe(false);
    expect(createPresetSchema.safeParse({ name: "x", rules: [] }).success).toBe(false);
    expect(createPresetSchema.safeParse({ name: "   ", rules: [rule("trimWhitespace")] }).success).toBe(false);
  });

  it("rejects disabled entries, so only the selection is ever stored", () => {
    const disabled = { ruleId: "trimWhitespace", enabled: false, options: {} };
    expect(createPresetSchema.safeParse({ name: "x", rules: [disabled] }).success).toBe(false);
  });

  it("caps the size, so presets can't be used to store file data", () => {
    const big = rule("validateRequired", { columns: [Array(PRESET_RULES_MAX_BYTES).fill("a").join("")] });
    const result = createPresetSchema.safeParse({ name: "x", rules: [big] });
    expect(result.success).toBe(false);
  });
});

describe("updatePresetSchema", () => {
  it("needs at least one field", () => {
    expect(updatePresetSchema.safeParse({}).success).toBe(false);
    expect(updatePresetSchema.safeParse({ isShared: true }).success).toBe(true);
  });
});

describe("snapshotRules", () => {
  it("keeps only enabled rules and copies their options", () => {
    const configs = defaultRuleConfigs().map((rc) =>
      rc.ruleId === "normalizeDate" ? { ...rc, enabled: true, options: { targetFormat: "YYYY-MM-DD" } } : rc
    );
    const snap = snapshotRules(configs);
    expect(snap).toEqual([rule("normalizeDate", { targetFormat: "YYYY-MM-DD" })]);
    expect(snap[0].options).not.toBe(configs.find((c) => c.ruleId === "normalizeDate")!.options);
  });
});

describe("applyPresetRules", () => {
  const presetRules = [rule("trimWhitespace", { columns: ["Name"] }), rule("normalizePhone", { format: "e164" })];

  it("turns on the preset's rules with its options and everything else off", () => {
    const start = defaultRuleConfigs().map((rc) => (rc.ruleId === "deduplicateRows" ? { ...rc, enabled: true } : rc));
    const { ruleConfigs, skipped } = applyPresetRules(start, presetRules, true);
    expect(skipped).toEqual([]);
    expect(ruleConfigs.filter((rc) => rc.enabled).map((rc) => rc.ruleId).sort()).toEqual(["normalizePhone", "trimWhitespace"]);
    expect(ruleConfigs.find((rc) => rc.ruleId === "trimWhitespace")!.options).toEqual({ columns: ["Name"] });
    expect(ruleConfigs.find((rc) => rc.ruleId === "deduplicateRows")!.enabled).toBe(false);
  });

  it("skips Pro rules on the Free plan and reports them", () => {
    const { ruleConfigs, skipped } = applyPresetRules(defaultRuleConfigs(), presetRules, false);
    expect(skipped).toEqual(["normalizePhone"]);
    expect(ruleConfigs.find((rc) => rc.ruleId === "normalizePhone")!.enabled).toBe(false);
    expect(ruleConfigs.find((rc) => rc.ruleId === "trimWhitespace")!.enabled).toBe(true);
  });

  it("round-trips with snapshotRules", () => {
    const applied = applyPresetRules(defaultRuleConfigs(), presetRules, true).ruleConfigs;
    expect(snapshotRules(applied).sort((a, b) => a.ruleId.localeCompare(b.ruleId))).toEqual(
      [...presetRules].sort((a, b) => a.ruleId.localeCompare(b.ruleId))
    );
  });
});

describe("parseStoredRules", () => {
  it("drops rules that no longer exist instead of failing the preset", () => {
    expect(parseStoredRules(JSON.stringify([rule("trimWhitespace"), rule("retiredRule")]))).toEqual([rule("trimWhitespace")]);
  });

  it("returns null for corrupt JSON", () => {
    expect(parseStoredRules("{not json")).toBeNull();
    expect(parseStoredRules('{"a":1}')).toBeNull();
  });
});
