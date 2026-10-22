import { describe, expect, it } from "vitest";
import { getPlanLimits } from "@/config/plans";
import {
  canCreatePreset,
  canDeletePreset,
  canEditPreset,
  canInvite,
  canSharePresets,
  canViewPreset,
  emailMatchesInvite,
  inviteEmailSchema,
  resolvePlan,
  seatCountFromQuantity,
  type PresetActor,
} from "../policy";

const free = { plan: "free", subscriptionStatus: null };
const teamOwner = { plan: "team", subscriptionStatus: "active" };

describe("resolvePlan", () => {
  it("gives team members Team while the owner's Team subscription is paid", () => {
    expect(resolvePlan({ ...free, teamId: "t1" }, teamOwner)).toBe("team");
    expect(resolvePlan({ ...free, teamId: "t1" }, { plan: "team", subscriptionStatus: "past_due" })).toBe("team");
  });

  it("drops members to their own plan when the owner's subscription ends or changes", () => {
    expect(resolvePlan({ ...free, teamId: "t1" }, { plan: "team", subscriptionStatus: "canceled" })).toBe("free");
    expect(resolvePlan({ ...free, teamId: "t1" }, { plan: "pro", subscriptionStatus: "active" })).toBe("free");
    expect(resolvePlan({ plan: "pro", subscriptionStatus: "active", teamId: "t1" }, { plan: "free", subscriptionStatus: "canceled" })).toBe("pro");
  });

  it("needs team membership to inherit anything", () => {
    expect(resolvePlan({ ...free, teamId: null }, teamOwner)).toBe("free");
    expect(resolvePlan({ ...free, teamId: "t1" }, null)).toBe("free");
  });

  it("uses the owner's own subscription for the owner", () => {
    expect(resolvePlan({ ...teamOwner, teamId: "t1" }, teamOwner)).toBe("team");
  });
});

describe("seats", () => {
  it("counts members and pending invites against the seats bought", () => {
    expect(canInvite(2, 1, 0)).toBe(true);
    expect(canInvite(2, 1, 1)).toBe(false);
    expect(canInvite(2, 2, 0)).toBe(false);
    expect(canInvite(2, 3, 0)).toBe(false); // seats reduced below membership
  });

  it("reads the seat count from the subscription quantity", () => {
    expect(seatCountFromQuantity(5)).toBe(5);
    expect(seatCountFromQuantity(undefined)).toBe(1);
    expect(seatCountFromQuantity(0)).toBe(1);
  });
});

describe("invites", () => {
  it("normalises invite emails and rejects bad ones", () => {
    expect(inviteEmailSchema.parse("  Sam@Example.COM ")).toBe("sam@example.com");
    expect(inviteEmailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("matches only the invited address, ignoring case", () => {
    expect(emailMatchesInvite(["other@x.com", "Sam@Example.com"], "sam@example.com")).toBe(true);
    expect(emailMatchesInvite(["sam@example.org"], "sam@example.com")).toBe(false);
    expect(emailMatchesInvite([], "sam@example.com")).toBe(false);
  });
});

describe("preset permissions", () => {
  const actor = (plan: "free" | "pro" | "team", teamId: string | null = null, userId = "u1"): PresetActor => ({
    userId,
    teamId,
    limits: getPlanLimits(plan),
  });
  const mine = { userId: "u1", teamId: null, isShared: false };
  const teammates = { userId: "u2", teamId: "t1", isShared: true };

  it("syncs presets on Pro and Team only", () => {
    expect(canCreatePreset(actor("free"))).toBe(false);
    expect(canCreatePreset(actor("pro"))).toBe(true);
    expect(canCreatePreset(actor("team", "t1"))).toBe(true);
  });

  it("makes synced presets read-only after a downgrade, but still deletable", () => {
    expect(canEditPreset(actor("pro"), mine)).toBe(true);
    expect(canEditPreset(actor("free"), mine)).toBe(false);
    expect(canDeletePreset(actor("free"), mine)).toBe(true);
  });

  it("never lets anyone edit or delete someone else's preset", () => {
    expect(canEditPreset(actor("team", "t1"), teammates)).toBe(false);
    expect(canDeletePreset(actor("team", "t1"), teammates)).toBe(false);
  });

  it("shares only on Team, inside a team", () => {
    expect(canSharePresets(actor("pro"))).toBe(false);
    expect(canSharePresets(actor("team", null))).toBe(false);
    expect(canSharePresets(actor("team", "t1"))).toBe(true);
  });

  it("shows the team library only to current members with Team entitlements", () => {
    expect(canViewPreset(actor("team", "t1"), teammates)).toBe(true);
    expect(canViewPreset(actor("team", "t2"), teammates)).toBe(false);
    expect(canViewPreset(actor("free", "t1"), teammates)).toBe(false);
    expect(canViewPreset(actor("team", "t1"), { ...teammates, isShared: false })).toBe(false);
  });
});
