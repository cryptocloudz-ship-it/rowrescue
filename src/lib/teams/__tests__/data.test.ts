import { beforeEach, describe, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import path from "path";
import * as schema from "@/db/drizzle";

// The data layer runs against a real Postgres (PGlite, in memory) with the app's migrations applied
const holder = vi.hoisted(() => ({ db: null as unknown as ReturnType<typeof drizzle<typeof import("@/db/drizzle")>> }));
vi.mock("@/db", () => ({
  db: new Proxy(
    {},
    {
      get: (_, key) => {
        const value = (holder.db as unknown as Record<string | symbol, unknown>)[key];
        return typeof value === "function" ? value.bind(holder.db) : value;
      },
    }
  ),
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn(), currentUser: vi.fn() }));

const { users, presets, auditLogs, teamInvites, teams } = schema;
const {
  acceptInvite,
  createInvite,
  deleteUserData,
  loadAccount,
  provisionTeam,
  removeMember,
  revokeInvite,
  syncSeatCount,
  TeamError,
} = await import("../data");
const { createPreset, deletePreset, listPresets, updatePreset } = await import("@/lib/presets/data");

const rules = [{ ruleId: "trimWhitespace", enabled: true as const, options: { columns: ["CustomerRef"] } }];

beforeEach(async () => {
  holder.db = drizzle(new PGlite(), { schema });
  await migrate(holder.db, { migrationsFolder: path.resolve(__dirname, "../../../../drizzle") });
  await holder.db.insert(users).values([
    { id: "owner", email: "owner@acme.test", name: "Olive", plan: "team", subscriptionStatus: "active", stripeSubscriptionId: "sub_1" },
    { id: "sam", email: "sam@acme.test" },
    { id: "pat", email: "pat@acme.test", plan: "pro", subscriptionStatus: "active" },
  ]);
});

async function account(id: string) {
  const [user] = await holder.db.select().from(users).where(eq(users.id, id));
  return loadAccount(user);
}

async function auditActions() {
  const rows = await holder.db.select().from(auditLogs).orderBy(auditLogs.createdAt);
  return rows.map((r) => r.action);
}

async function expectTeamError(promise: Promise<unknown>, status: number) {
  const err = (await promise.catch((e: unknown) => e)) as InstanceType<typeof TeamError>;
  expect(err).toBeInstanceOf(TeamError);
  expect(err.status).toBe(status);
}

async function teamWithSam(seats = 3) {
  await provisionTeam("owner", "sub_1", seats);
  const invite = await createInvite(await account("owner"), "sam@acme.test");
  await acceptInvite(await account("sam"), ["sam@acme.test"], invite.token);
}

describe("provisionTeam", () => {
  it("creates the buyer's team with the seats bought and makes them admin", async () => {
    const team = await provisionTeam("owner", "sub_1", 4);
    expect(team).toMatchObject({ ownerId: "owner", seatCount: 4, stripeSubscriptionId: "sub_1", name: "Olive's team" });
    const owner = await account("owner");
    expect(owner).toMatchObject({ role: "admin", plan: "team" });
    expect(owner.team?.id).toBe(team!.id);
    expect(await auditActions()).toEqual(["member.join"]);
  });

  it("is idempotent and reuses the team on a repeat checkout", async () => {
    const first = await provisionTeam("owner", "sub_1", 2);
    const second = await provisionTeam("owner", "sub_2", 5);
    expect(second!.id).toBe(first!.id);
    expect(second).toMatchObject({ seatCount: 5, stripeSubscriptionId: "sub_2" });
    expect(await holder.db.select().from(teams)).toHaveLength(1);
    expect(await auditActions()).toEqual(["member.join"]);
  });

  it("follows seat changes from the subscription", async () => {
    await provisionTeam("owner", "sub_1", 2);
    await syncSeatCount("sub_1", 7);
    expect((await account("owner")).team?.seatCount).toBe(7);
  });
});

describe("invites and membership", () => {
  it("lets an invited member join and gives them Team entitlements", async () => {
    await teamWithSam();
    const sam = await account("sam");
    expect(sam).toMatchObject({ role: "member", plan: "team" });
    expect(sam.limits.hasSharedPresets).toBe(true);
    expect(await holder.db.select().from(teamInvites)).toHaveLength(0);
    expect(await auditActions()).toEqual(["member.join", "member.invite", "member.join"]);
  });

  it("counts the admin and pending invites against the seats", async () => {
    await provisionTeam("owner", "sub_1", 2);
    const owner = await account("owner");
    await createInvite(owner, "sam@acme.test");
    await expectTeamError(createInvite(owner, "pat@acme.test"), 409);
    // Re-inviting the same address returns the existing invite rather than using another seat
    expect((await createInvite(owner, "sam@acme.test")).email).toBe("sam@acme.test");
  });

  it("frees the seat when an invite is revoked", async () => {
    await provisionTeam("owner", "sub_1", 2);
    const owner = await account("owner");
    const invite = await createInvite(owner, "sam@acme.test");
    await revokeInvite(owner, invite.id);
    await createInvite(owner, "pat@acme.test");
    await expectTeamError(acceptInvite(await account("sam"), ["sam@acme.test"], invite.token), 404);
  });

  it("only lets the admin invite, and only the invited address accept", async () => {
    await teamWithSam();
    await expectTeamError(createInvite(await account("sam"), "pat@acme.test"), 403);
    const invite = await createInvite(await account("owner"), "pat@acme.test");
    await expectTeamError(acceptInvite(await account("pat"), ["pat@elsewhere.test"], invite.token), 403);
    expect((await account("pat")).team).toBeNull();
  });

  it("stops invites once the Team subscription has lapsed", async () => {
    await provisionTeam("owner", "sub_1", 3);
    await holder.db.update(users).set({ subscriptionStatus: "canceled" }).where(eq(users.id, "owner"));
    await expectTeamError(createInvite(await account("owner"), "sam@acme.test"), 403);
  });

  it("drops members to their own plan when the owner's subscription ends", async () => {
    await teamWithSam();
    await holder.db.update(users).set({ plan: "free", subscriptionStatus: "canceled" }).where(eq(users.id, "owner"));
    expect((await account("sam")).plan).toBe("free");
  });

  it("removes a member, unsharing their presets, and never the admin", async () => {
    await teamWithSam();
    const shared = await createPreset(await account("sam"), { name: "Sam's", description: "", rules, isShared: true });
    await expectTeamError(removeMember(await account("owner"), "owner"), 409);
    await expectTeamError(removeMember(await account("sam"), "owner"), 403);
    await removeMember(await account("owner"), "sam");

    const sam = await account("sam");
    expect(sam.team).toBeNull();
    expect(sam.plan).toBe("free");
    const [row] = await holder.db.select().from(presets).where(eq(presets.id, shared.id));
    expect(row).toMatchObject({ isShared: false, teamId: null });
    const [leave] = await holder.db.select().from(auditLogs).where(eq(auditLogs.action, "member.leave"));
    expect(JSON.parse(leave.metadata!)).toEqual({ email: "sam@acme.test", removedBy: "owner" });
  });

  it("lets a member leave on their own", async () => {
    await teamWithSam();
    await removeMember(await account("sam"), "sam");
    expect((await account("sam")).team).toBeNull();
  });
});

describe("presets", () => {
  it("keeps Free users on browser presets", async () => {
    await expectTeamError(createPreset(await account("sam"), { name: "x", description: "", rules, isShared: false }), 403);
  });

  it("syncs Pro presets but doesn't let Pro share them", async () => {
    const pat = await account("pat");
    const preset = await createPreset(pat, { name: "Mine", description: "", rules, isShared: false });
    expect(preset).toMatchObject({ name: "Mine", rules, mine: true, readOnly: false, isShared: false });
    await expectTeamError(updatePreset(pat, preset.id, { isShared: true }), 403);
    expect((await listPresets(pat)).presets.map((p) => p.name)).toEqual(["Mine"]);
    // Not in a team, so nothing is audited
    expect(await auditActions()).toEqual([]);
  });

  it("shares Team presets with current members only", async () => {
    await teamWithSam();
    const owner = await account("owner");
    const preset = await createPreset(owner, { name: "Team CRM", description: "", rules, isShared: false });
    await updatePreset(owner, preset.id, { isShared: true });

    const samView = await listPresets(await account("sam"));
    expect(samView.presets).toEqual([
      expect.objectContaining({ id: preset.id, mine: false, readOnly: true, author: "Olive", isShared: true }),
    ]);
    expect(samView.canShare).toBe(true);
    expect((await listPresets(await account("pat"))).presets).toEqual([]);

    // Someone else's preset can't be changed or deleted, and reads as missing
    await expectTeamError(updatePreset(await account("sam"), preset.id, { name: "mine now" }), 404);
    await expectTeamError(deletePreset(await account("sam"), preset.id), 404);

    await removeMember(await account("sam"), "sam");
    expect((await listPresets(await account("sam"))).presets).toEqual([]);
  });

  it("writes an audit trail of preset changes without rule settings", async () => {
    await teamWithSam();
    const sam = await account("sam");
    const preset = await createPreset(sam, { name: "A", description: "", rules, isShared: true });
    await updatePreset(sam, preset.id, { name: "B", rules });
    await updatePreset(sam, preset.id, { isShared: false });
    await deletePreset(sam, preset.id);

    const rows = await holder.db.select().from(auditLogs).where(eq(auditLogs.presetId, preset.id)).orderBy(auditLogs.createdAt);
    expect(rows.map((r) => r.action)).toEqual(["preset.create", "preset.share", "preset.update", "preset.unshare", "preset.delete"]);
    expect(JSON.parse(rows[2].metadata!)).toEqual({ presetName: "B", changed: ["name", "rules"] });
    for (const row of rows) expect(row.metadata).not.toContain("CustomerRef"); // the column picked in the rules
  });

  it("makes synced presets read-only after a downgrade, but keeps them loadable and deletable", async () => {
    const pat = await account("pat");
    const preset = await createPreset(pat, { name: "Mine", description: "", rules, isShared: false });
    await holder.db.update(users).set({ plan: "free", subscriptionStatus: "canceled" }).where(eq(users.id, "pat"));

    const downgraded = await account("pat");
    const list = await listPresets(downgraded);
    expect(list.canCreate).toBe(false);
    expect(list.presets).toEqual([expect.objectContaining({ id: preset.id, readOnly: true, rules })]);
    await expectTeamError(updatePreset(downgraded, preset.id, { name: "x" }), 403);
    await deletePreset(downgraded, preset.id);
    expect((await listPresets(downgraded)).presets).toEqual([]);
  });
});

describe("deleteUserData", () => {
  it("dissolves an owner's team so the user row can be deleted", async () => {
    await teamWithSam();
    await createPreset(await account("sam"), { name: "Sam's", description: "", rules, isShared: true });
    await createInvite(await account("owner"), "pat@acme.test");

    await deleteUserData("owner");
    await holder.db.delete(users).where(eq(users.id, "owner"));

    expect(await holder.db.select().from(teams)).toEqual([]);
    expect((await account("sam")).team).toBeNull();
    const [samPreset] = await holder.db.select().from(presets);
    expect(samPreset).toMatchObject({ isShared: false, teamId: null });
  });

  it("removes a member's own data", async () => {
    await teamWithSam();
    await createPreset(await account("sam"), { name: "Sam's", description: "", rules, isShared: false });
    await deleteUserData("sam");
    await holder.db.delete(users).where(eq(users.id, "sam"));
    expect(await holder.db.select().from(presets)).toEqual([]);
  });
});
