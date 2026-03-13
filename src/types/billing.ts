/** Billing & entitlement types for TidySheet */

export type PlanId = "free" | "pro" | "team";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "incomplete";

export interface PlanLimits {
  maxRows: number;
  maxExportsPerDay: number;
  maxPresets: number;
  allowedExportFormats: ("csv" | "xlsx")[];
  hasChangeLog: boolean;
  hasPdfReport: boolean;
  hasQuarantineTab: boolean;
  hasWatermark: boolean;
  syncPresets: boolean;
  hasSharedPresets: boolean;
  hasAuditLog: boolean;
  hasTeamFeatures: boolean;
  proRules: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: number | null; // cents, null = free
  priceYearly: number | null;
  limits: PlanLimits;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export interface UserEntitlement {
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  exportsToday: number;
  periodEnd: string | null;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}
