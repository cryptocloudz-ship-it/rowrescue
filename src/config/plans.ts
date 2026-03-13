import type { PlanDefinition } from "@/types/billing";

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "Clean small files instantly. No sign-up needed.",
    priceMonthly: null,
    priceYearly: null,
    limits: {
      maxRows: 5_000,
      maxExportsPerDay: 5,
      maxPresets: 3,
      allowedExportFormats: ["csv"],
      hasChangeLog: false,
      hasPdfReport: false,
      hasQuarantineTab: false,
      hasWatermark: true,
      syncPresets: false,
      hasSharedPresets: false,
      hasAuditLog: false,
      hasTeamFeatures: false,
      proRules: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Full power for professionals.",
    priceMonthly: 900, // €9.00
    priceYearly: 7900, // €79.00
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    limits: {
      maxRows: 500_000,
      maxExportsPerDay: Infinity,
      maxPresets: Infinity,
      allowedExportFormats: ["csv", "xlsx"],
      hasChangeLog: true,
      hasPdfReport: true,
      hasQuarantineTab: true,
      hasWatermark: false,
      syncPresets: true,
      hasSharedPresets: false,
      hasAuditLog: false,
      hasTeamFeatures: false,
      proRules: true,
    },
  },
  team: {
    id: "team",
    name: "Team",
    description: "Shared cleaning for your organisation.",
    priceMonthly: 1900, // €19.00/seat
    priceYearly: null,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE_ID,
    limits: {
      maxRows: 500_000,
      maxExportsPerDay: Infinity,
      maxPresets: Infinity,
      allowedExportFormats: ["csv", "xlsx"],
      hasChangeLog: true,
      hasPdfReport: true,
      hasQuarantineTab: true,
      hasWatermark: false,
      syncPresets: true,
      hasSharedPresets: true,
      hasAuditLog: true,
      hasTeamFeatures: true,
      proRules: true,
    },
  },
};

export function getPlanLimits(planId: string) {
  return PLANS[planId]?.limits ?? PLANS.free.limits;
}

export const FREE_RULES = [
  "deduplicateRows",
  "removeEmptyRows",
  "removeEmptyColumns",
  "trimWhitespace",
  "normalizeHeaders",
];
