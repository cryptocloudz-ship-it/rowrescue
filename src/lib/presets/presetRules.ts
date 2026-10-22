import { z } from "zod";
import type { RuleConfig } from "@/types/rules";
import { FREE_RULES } from "@/config/plans";
import { ALL_RULES } from "@/lib/engine/rules";

/**
 * A saved preset is the enabled rules and their options, nothing else. Options can name columns the user picked,
 * but never hold row data, so a preset is safe to store server-side.
 */

const RULE_IDS = new Set(ALL_RULES.map((r) => r.id));

export const PRESET_NAME_MAX = 80;
export const PRESET_DESCRIPTION_MAX = 280;
/** Serialised rules cap. Real presets are a few hundred bytes; the cap stops the column abusing as a file store. */
export const PRESET_RULES_MAX_BYTES = 16_384;

const ruleConfigSchema = z.object({
  ruleId: z.string().refine((id) => RULE_IDS.has(id), "Unknown rule"),
  enabled: z.literal(true),
  options: z.record(z.string(), z.unknown()),
});

export const presetRulesSchema = z
  .array(ruleConfigSchema)
  .min(1, "Select at least one rule")
  .max(ALL_RULES.length)
  .refine((rules) => new Set(rules.map((r) => r.ruleId)).size === rules.length, "Duplicate rule")
  .refine((rules) => JSON.stringify(rules).length <= PRESET_RULES_MAX_BYTES, "Preset is too large");

export const presetNameSchema = z.string().trim().min(1, "Name the preset").max(PRESET_NAME_MAX);
export const presetDescriptionSchema = z.string().trim().max(PRESET_DESCRIPTION_MAX);

export const createPresetSchema = z.object({
  name: presetNameSchema,
  description: presetDescriptionSchema.default(""),
  rules: presetRulesSchema,
  isShared: z.boolean().default(false),
});

export const updatePresetSchema = z
  .object({
    name: presetNameSchema.optional(),
    description: presetDescriptionSchema.optional(),
    rules: presetRulesSchema.optional(),
    isShared: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), "Nothing to update");

/** The enabled rules from the cleaner, in the shape a preset stores. */
export function snapshotRules(ruleConfigs: RuleConfig[]): RuleConfig[] {
  return ruleConfigs
    .filter((rc) => rc.enabled)
    .map((rc) => ({ ruleId: rc.ruleId, enabled: true, options: { ...rc.options } }));
}

/**
 * Switch the cleaner to a preset: its rules on with its options, everything else off.
 * Rules the plan doesn't allow, or that no longer exist, are skipped and returned so the UI can say so.
 */
export function applyPresetRules(
  ruleConfigs: RuleConfig[],
  presetRules: RuleConfig[],
  isPro: boolean
): { ruleConfigs: RuleConfig[]; skipped: string[] } {
  const wanted = new Map(presetRules.filter((r) => r.enabled).map((r) => [r.ruleId, r.options ?? {}]));
  const known = new Set(ruleConfigs.map((rc) => rc.ruleId));
  const skipped = [...wanted.keys()].filter((id) => !known.has(id) || !(isPro || FREE_RULES.includes(id)));

  return {
    ruleConfigs: ruleConfigs.map((rc) => {
      const options = wanted.get(rc.ruleId);
      if (!options || skipped.includes(rc.ruleId)) return { ...rc, enabled: false, options: {} };
      return { ...rc, enabled: true, options: { ...options } };
    }),
    skipped,
  };
}

/**
 * Parse a stored rules JSON string. Entries for rules that have since been removed are dropped;
 * null only if the string is corrupt, so one bad row doesn't break the whole list.
 */
export function parseStoredRules(json: string): RuleConfig[] | null {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (!Array.isArray(raw)) return null;
  return raw.flatMap((entry) => {
    const parsed = ruleConfigSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}
