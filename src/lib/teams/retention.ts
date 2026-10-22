import { and, eq, inArray, isNotNull, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, teamInvites, teams, users } from "@/db/drizzle";
import { effectivePlan } from "@/config/plans";

/** Privacy policy §7: team audit log metadata is kept for the Team subscription plus this many days. */
export const AUDIT_RETENTION_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface RetentionResult {
  /** Teams whose owner was newly seen without a paid Team plan. */
  lapsed: number;
  /** Teams whose owner has a paid Team plan again. */
  restored: number;
  /** Teams past the retention window whose audit log and pending invites were deleted. */
  purged: number;
  auditLogsDeleted: number;
  invitesDeleted: number;
}

/**
 * Enforce the audit log retention period. Each run records when a team owner's paid Team plan
 * lapses (or clears that mark if it comes back), then deletes the audit log and pending invites
 * of teams that have been lapsed for AUDIT_RETENTION_DAYS or more. Safe to run repeatedly.
 */
export async function purgeLapsedTeams(now = new Date()): Promise<RetentionResult> {
  const rows = await db
    .select({
      id: teams.id,
      planLapsedAt: teams.planLapsedAt,
      plan: users.plan,
      status: users.subscriptionStatus,
    })
    .from(teams)
    .innerJoin(users, eq(users.id, teams.ownerId));

  const paid = rows.filter((r) => effectivePlan(r.plan, r.status) === "team");
  const unpaid = rows.filter((r) => effectivePlan(r.plan, r.status) !== "team");
  const toRestore = paid.filter((r) => r.planLapsedAt).map((r) => r.id);
  const toLapse = unpaid.filter((r) => !r.planLapsedAt).map((r) => r.id);

  if (toRestore.length) {
    await db.update(teams).set({ planLapsedAt: null, updatedAt: now }).where(inArray(teams.id, toRestore));
  }
  if (toLapse.length) {
    // Guarded on isNull so a concurrent run can't push the clock forward
    await db
      .update(teams)
      .set({ planLapsedAt: now, updatedAt: now })
      .where(and(inArray(teams.id, toLapse), isNull(teams.planLapsedAt)));
  }

  const cutoff = new Date(now.getTime() - AUDIT_RETENTION_DAYS * DAY_MS);
  const expired = unpaid
    .filter((r) => r.planLapsedAt && r.planLapsedAt <= cutoff)
    .map((r) => r.id);

  let auditLogsDeleted = 0;
  let invitesDeleted = 0;
  if (expired.length) {
    // Re-check the lapse mark in the delete itself, in case the plan came back since the read above
    const stillExpired = db
      .select({ id: teams.id })
      .from(teams)
      .where(and(inArray(teams.id, expired), isNotNull(teams.planLapsedAt), lte(teams.planLapsedAt, cutoff)));
    const deletedLogs = await db
      .delete(auditLogs)
      .where(inArray(auditLogs.teamId, stillExpired))
      .returning({ id: auditLogs.id });
    const deletedInvites = await db
      .delete(teamInvites)
      .where(inArray(teamInvites.teamId, stillExpired))
      .returning({ id: teamInvites.id });
    auditLogsDeleted = deletedLogs.length;
    invitesDeleted = deletedInvites.length;
  }

  return {
    lapsed: toLapse.length,
    restored: toRestore.length,
    purged: expired.length,
    auditLogsDeleted,
    invitesDeleted,
  };
}
