/**
 * Database record types for TidySheet.
 * The Drizzle ORM schema (source of truth for migrations) is in ./drizzle.ts.
 * These interfaces are used for type-safe query results and API responses.
 */

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  plan: "free" | "pro" | "team";
  subscription_status: "active" | "past_due" | "canceled" | "trialing" | "incomplete" | null;
  stripe_subscription_id: string | null;
  current_period_end: Date | null;
  exports_today: number;
  exports_reset_date: string; // YYYY-MM-DD
  team_id: string | null;
  team_role: "admin" | "member" | null;
  created_at: Date;
  updated_at: Date;
}

export interface TeamRecord {
  id: string;
  name: string;
  owner_id: string;
  stripe_subscription_id: string | null;
  seat_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PresetRecord {
  id: string;
  user_id: string;
  team_id: string | null;
  name: string;
  description: string;
  rules: string; // JSON
  is_shared: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogRecord {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  preset_id: string | null;
  metadata: string; // JSON — NO file contents
  created_at: Date;
}

export interface ExportLogRecord {
  id: string;
  user_id: string;
  file_name: string; // Name only, no contents
  row_count: number;
  rules_applied: string; // JSON array of rule IDs
  exported_at: Date;
}
