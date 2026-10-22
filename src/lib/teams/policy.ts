import { z } from "zod";
import { effectivePlan, getPlanLimits } from "@/config/plans";
import type { PlanId, PlanLimits } from "@/types/billing";

/** Pure rules for teams, seats and presets. The data layer and routes call these, so they're what the tests cover. */

interface PlanSource {
  plan: string | null;
  subscriptionStatus: string | null;
}

const PLAN_RANK: Record<PlanId, number> = { free: 0, pro: 1, team: 2 };

/**
 * The plan a user gets: their own subscription, or Team if they belong to a team whose owner's Team subscription
 * is paid up. Whichever is higher wins, so a member who also pays for Pro keeps it if they leave.
 */
export function resolvePlan(user: PlanSource & { teamId: string | null }, teamOwner: PlanSource | null): PlanId {
  const own = effectivePlan(user.plan, user.subscriptionStatus) as PlanId;
  const viaTeam: PlanId =
    user.teamId && teamOwner && effectivePlan(teamOwner.plan, teamOwner.subscriptionStatus) === "team" ? "team" : "free";
  return PLAN_RANK[viaTeam] > PLAN_RANK[own] ? viaTeam : own;
}

/** Seats in use: every member (the admin included) plus every pending invite, since an invite reserves a seat. */
export function seatsUsed(memberCount: number, pendingInviteCount: number) {
  return memberCount + pendingInviteCount;
}

export function canInvite(seatCount: number, memberCount: number, pendingInviteCount: number) {
  return seatsUsed(memberCount, pendingInviteCount) < seatCount;
}

/** Seats bought on a Team subscription: the line item quantity, never below 1. */
export function seatCountFromQuantity(quantity: number | null | undefined) {
  return Math.max(1, Math.floor(quantity ?? 1));
}

export const inviteEmailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address").max(254));

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Whether a signed-in user's emails include the invited one. Invites can only be accepted by the invited address. */
export function emailMatchesInvite(userEmails: string[], inviteEmail: string) {
  const wanted = normaliseEmail(inviteEmail);
  return userEmails.some((e) => normaliseEmail(e) === wanted);
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export interface PresetActor {
  userId: string;
  teamId: string | null;
  limits: PlanLimits;
}

export interface PresetOwnership {
  userId: string;
  teamId: string | null;
  isShared: boolean;
}

/** Synced presets need a plan that syncs. Free users save in the browser instead. */
export function canCreatePreset(actor: PresetActor) {
  return actor.limits.syncPresets;
}

/**
 * Only the author edits a preset, and only while their plan syncs. After a downgrade synced presets stay readable
 * (and deletable) but can't be changed, as the pricing FAQ promises.
 */
export function canEditPreset(actor: PresetActor, preset: PresetOwnership) {
  return preset.userId === actor.userId && actor.limits.syncPresets;
}

/** Authors can always delete their own presets, whatever their plan. */
export function canDeletePreset(actor: PresetActor, preset: PresetOwnership) {
  return preset.userId === actor.userId;
}

/** Sharing to the team library needs Team entitlements and a team to share with. */
export function canSharePresets(actor: PresetActor) {
  return actor.limits.hasSharedPresets && actor.teamId !== null;
}

/** A preset the actor may load: their own, or one shared with the team they're in now. */
export function canViewPreset(actor: PresetActor, preset: PresetOwnership) {
  if (preset.userId === actor.userId) return true;
  return preset.isShared && preset.teamId !== null && preset.teamId === actor.teamId && actor.limits.hasSharedPresets;
}

export function limitsFor(plan: PlanId): PlanLimits {
  return getPlanLimits(plan);
}
