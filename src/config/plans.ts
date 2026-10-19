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
    priceMonthly: 1200, // €12.00
    priceYearly: 9900, // €99.00
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
    priceMonthly: 2900, // €29.00/seat
    priceYearly: 24900, // €249.00/seat
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE_ID,
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

/** Subscription states that keep paid features on. past_due keeps access during Stripe's retry window. */
export const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

/** The plan a user is actually entitled to, given their stored plan and subscription status. */
export function effectivePlan(plan: string | null | undefined, status: string | null | undefined): string {
  if (!plan || plan === "free") return "free";
  return status && PAID_STATUSES.has(status) ? plan : "free";
}

/** Plan for a Stripe price ID, or null if it isn't one of ours. */
export function planForPriceId(priceId: string | undefined): "pro" | "team" | null {
  if (!priceId) return null;
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (planId === "free") continue;
    if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
      return planId as "pro" | "team";
    }
  }
  return null;
}

export function getPlanLimits(planId: string) {
  return PLANS[planId]?.limits ?? PLANS.free.limits;
}

export const FREE_RULES = [
  "deduplicateRows",
  "removeEmptyRows",
  "removeEmptyColumns",
  "trimWhitespace",
  "normalizeHeaders",
  "fixEncoding",
  "normalizeDate",
  "normalizeEmail",
  "validateEmail",
];
