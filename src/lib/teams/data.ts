import { randomBytes } from "node:crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, presets, teamInvites, teams, users } from "@/db/drizzle";
import { ensureUser } from "@/lib/billing/ensureUser";
import type { PlanId, PlanLimits } from "@/types/billing";
import { auditRow, type AuditEntry } from "./audit";
import {
  canInvite,
  emailMatchesInvite,
  limitsFor,
  resolvePlan,
  seatCountFromQuantity,
  seatsUsed,
  type PresetActor,
} from "./policy";

export type UserRow = typeof users.$inferSelect;
export type TeamRow = typeof teams.$inferSelect;
export type InviteRow = typeof teamInvites.$inferSelect;

/** An error with the HTTP status a route should answer with. */
export class TeamError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export interface Account {
  user: UserRow;
  team: TeamRow | null;
  role: "admin" | "member" | null;
  plan: PlanId;
  limits: PlanLimits;
}

export function presetActor(account: Account): PresetActor {
  return { userId: account.user.id, teamId: account.team?.id ?? null, limits: account.limits };
}

/** Write an audit entry. Failures are logged, not thrown: the action itself has already happened. */
export async function writeAudit(entry: AuditEntry) {
  try {
    await db.insert(auditLogs).values(auditRow(entry));
  } catch (err) {
    console.error(`[Audit] failed to record ${entry.action} for team ${entry.teamId}`, err);
  }
}

/** A user's plan, team and role. Team members get Team limits while the owner's Team subscription is paid. */
export async function loadAccount(user: UserRow): Promise<Account> {
  let team: TeamRow | null = null;
  let owner: UserRow | null = null;
  if (user.teamId) {
    [team = null] = await db.select().from(teams).where(eq(teams.id, user.teamId));
    if (team) {
      owner = team.ownerId === user.id ? user : ((await db.select().from(users).where(eq(users.id, team.ownerId)))[0] ?? null);
    }
  }
  const plan = resolvePlan({ ...user, teamId: team?.id ?? null }, owner);
  return { user, team, role: team ? (user.teamRole ?? "member") : null, plan, limits: limitsFor(plan) };
}

/** The signed-in user's account, or null when signed out. */
export async function currentAccount(): Promise<Account | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await ensureUser(userId);
  return user ? loadAccount(user) : null;
}

/** Every email address on the signed-in Clerk user, for matching invites. */
export async function currentUserEmails(): Promise<string[]> {
  const clerkUser = await currentUser();
  return clerkUser?.emailAddresses.filter((e) => e.verification?.status === "verified").map((e) => e.emailAddress) ?? [];
}

// ─── Provisioning (Stripe webhook) ───────────────────────────────────────────

/**
 * Create the buyer's team after a Team checkout, or point their existing team at the new subscription.
 * The buyer becomes its admin. Safe to run twice for the same event.
 */
export async function provisionTeam(ownerId: string, subscriptionId: string, quantity: number | null | undefined) {
  const [owner] = await db.select().from(users).where(eq(users.id, ownerId));
  if (!owner) return null;
  const seatCount = seatCountFromQuantity(quantity);

  await db
    .insert(teams)
    .values({
      id: crypto.randomUUID(),
      name: `${owner.name || owner.email}'s team`,
      ownerId,
      stripeSubscriptionId: subscriptionId,
      seatCount,
    })
    .onConflictDoUpdate({
      target: teams.ownerId,
      set: { stripeSubscriptionId: subscriptionId, seatCount, updatedAt: new Date() },
    });
  const [team] = await db.select().from(teams).where(eq(teams.ownerId, ownerId));

  if (owner.teamId !== team.id) {
    if (owner.teamId) await detachMember(owner, owner.teamId, null);
    await db.update(users).set({ teamId: team.id, teamRole: "admin", updatedAt: new Date() }).where(eq(users.id, ownerId));
    await writeAudit({ teamId: team.id, userId: ownerId, action: "member.join", metadata: { email: owner.email, seats: seatCount } });
  }
  return team;
}

/** Keep seat_count in step with the subscription quantity, e.g. after seats are changed in the Customer Portal. */
export async function syncSeatCount(subscriptionId: string, quantity: number | null | undefined) {
  await db
    .update(teams)
    .set({ seatCount: seatCountFromQuantity(quantity), updatedAt: new Date() })
    .where(eq(teams.stripeSubscriptionId, subscriptionId));
}

// ─── Members & invites ───────────────────────────────────────────────────────

export async function listMembers(teamId: string) {
  return db
    .select({ id: users.id, email: users.email, name: users.name, role: users.teamRole })
    .from(users)
    .where(eq(users.teamId, teamId))
    .orderBy(users.email);
}

export async function listInvites(teamId: string) {
  return db.select().from(teamInvites).where(eq(teamInvites.teamId, teamId)).orderBy(teamInvites.createdAt);
}

async function seatUsage(teamId: string) {
  const [[members], [invites]] = await Promise.all([
    db.select({ n: count() }).from(users).where(eq(users.teamId, teamId)),
    db.select({ n: count() }).from(teamInvites).where(eq(teamInvites.teamId, teamId)),
  ]);
  return { members: members.n, invites: invites.n };
}

/** The admin's team. Adding people needs a paid-up subscription; tidying up (revoking, removing) doesn't. */
function requireAdmin(account: Account, needsActivePlan = false): TeamRow {
  if (!account.team || account.role !== "admin" || account.team.ownerId !== account.user.id) {
    throw new TeamError("Only the team admin can do this.", 403);
  }
  if (needsActivePlan && !account.limits.hasTeamFeatures) {
    throw new TeamError("The Team subscription isn't active. Renew it on the Billing page.", 403);
  }
  return account.team;
}

export async function createInvite(account: Account, email: string): Promise<InviteRow> {
  const team = requireAdmin(account, true);

  const [member] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.teamId, team.id), eq(sql`lower(${users.email})`, email)));
  if (member) throw new TeamError(`${email} is already in the team.`, 409);

  const [existing] = await db
    .select()
    .from(teamInvites)
    .where(and(eq(teamInvites.teamId, team.id), eq(teamInvites.email, email)));
  if (existing) return existing;

  const usage = await seatUsage(team.id);
  if (!canInvite(team.seatCount, usage.members, usage.invites)) {
    throw new TeamError(
      `All ${team.seatCount} seats are in use (${seatsUsed(usage.members, usage.invites)} members and invites). Add seats from the Billing page.`,
      409
    );
  }

  const [invite] = await db
    .insert(teamInvites)
    .values({
      id: crypto.randomUUID(),
      teamId: team.id,
      email,
      token: randomBytes(24).toString("base64url"),
      invitedBy: account.user.id,
    })
    .returning();
  await writeAudit({ teamId: team.id, userId: account.user.id, action: "member.invite", metadata: { email } });
  return invite;
}

export async function revokeInvite(account: Account, inviteId: string) {
  const team = requireAdmin(account);
  const [deleted] = await db
    .delete(teamInvites)
    .where(and(eq(teamInvites.id, inviteId), eq(teamInvites.teamId, team.id)))
    .returning();
  if (!deleted) throw new TeamError("Invite not found.", 404);
  await writeAudit({
    teamId: team.id,
    userId: account.user.id,
    action: "member.invite_revoked",
    metadata: { email: deleted.email },
  });
}

/** Invites waiting for any of these addresses, with the team they're for. */
export async function invitesForEmails(emails: string[]) {
  if (emails.length === 0) return [];
  return db
    .select({ token: teamInvites.token, email: teamInvites.email, teamName: teams.name })
    .from(teamInvites)
    .innerJoin(teams, eq(teams.id, teamInvites.teamId))
    .where(inArray(teamInvites.email, emails.map((e) => e.toLowerCase())));
}

export async function inviteByToken(token: string) {
  const [row] = await db
    .select({ invite: teamInvites, teamName: teams.name })
    .from(teamInvites)
    .innerJoin(teams, eq(teams.id, teamInvites.teamId))
    .where(eq(teamInvites.token, token));
  return row ?? null;
}

/** Join a team from an invite. The invite already holds a seat, so accepting doesn't change seat usage. */
export async function acceptInvite(account: Account, userEmails: string[], token: string) {
  const found = await inviteByToken(token);
  if (!found) throw new TeamError("This invite has been used or revoked.", 404);
  const { invite } = found;
  if (!emailMatchesInvite(userEmails, invite.email)) {
    throw new TeamError(`This invite is for ${invite.email}. Sign in with that address to accept it.`, 403);
  }
  if (account.user.teamId && account.user.teamId !== invite.teamId) {
    throw new TeamError("You're already in a team. Leave it before joining another.", 409);
  }

  if (account.user.teamId !== invite.teamId) {
    const [joined] = await db
      .update(users)
      .set({ teamId: invite.teamId, teamRole: "member", updatedAt: new Date() })
      .where(and(eq(users.id, account.user.id), isNull(users.teamId)))
      .returning({ id: users.id });
    if (!joined) throw new TeamError("You're already in a team. Leave it before joining another.", 409);
    await writeAudit({
      teamId: invite.teamId,
      userId: account.user.id,
      action: "member.join",
      metadata: { email: account.user.email },
    });
  }
  await db.delete(teamInvites).where(eq(teamInvites.id, invite.id));
  return invite.teamId;
}

/** Take a user out of a team: their shared presets leave the library with them. */
async function detachMember(member: UserRow, teamId: string, removedBy: string | null) {
  await db
    .update(users)
    .set({ teamId: null, teamRole: null, updatedAt: new Date() })
    .where(and(eq(users.id, member.id), eq(users.teamId, teamId)));
  await db
    .update(presets)
    .set({ isShared: false, teamId: null, updatedAt: new Date() })
    .where(and(eq(presets.userId, member.id), eq(presets.teamId, teamId)));
  await writeAudit({
    teamId,
    userId: member.id,
    action: "member.leave",
    metadata: { email: member.email, ...(removedBy && { removedBy }) },
  });
}

/** A member leaves, or the admin removes them. The admin (the subscription owner) can't be removed. */
export async function removeMember(account: Account, memberId: string) {
  const team = account.team;
  if (!team) throw new TeamError("You're not in a team.", 404);
  const self = memberId === account.user.id;
  if (!self) requireAdmin(account);
  if (memberId === team.ownerId) {
    throw new TeamError("The team admin pays for the seats and can't leave. Cancel the subscription on the Billing page instead.", 409);
  }
  const [member] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, memberId), eq(users.teamId, team.id)));
  if (!member) throw new TeamError("Member not found.", 404);
  await detachMember(member, team.id, self ? null : account.user.id);
}

// ─── Audit log ───────────────────────────────────────────────────────────────

export const AUDIT_PAGE_SIZE = 100;

export async function listAuditLog(teamId: string, page: number) {
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      metadata: auditLogs.metadata,
      presetId: auditLogs.presetId,
      createdAt: auditLogs.createdAt,
      actorEmail: users.email,
      actorName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.userId))
    .where(eq(auditLogs.teamId, teamId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(AUDIT_PAGE_SIZE + 1)
    .offset(Math.max(0, page) * AUDIT_PAGE_SIZE);
}

// ─── Account deletion (Clerk webhook) ────────────────────────────────────────

/** Remove everything tied to a deleted user so the users row can go. An owned team is dissolved. */
export async function deleteUserData(userId: string) {
  const [owned] = await db.select().from(teams).where(eq(teams.ownerId, userId));
  if (owned) {
    await db.update(users).set({ teamId: null, teamRole: null }).where(eq(users.teamId, owned.id));
    await db.update(presets).set({ isShared: false, teamId: null }).where(eq(presets.teamId, owned.id));
    await db.delete(teamInvites).where(eq(teamInvites.teamId, owned.id));
    await db.delete(auditLogs).where(eq(auditLogs.teamId, owned.id));
    await db.delete(teams).where(eq(teams.id, owned.id));
  }
  await db.delete(teamInvites).where(eq(teamInvites.invitedBy, userId));
  await db.delete(auditLogs).where(eq(auditLogs.userId, userId));
  await db.delete(presets).where(eq(presets.userId, userId));
}
