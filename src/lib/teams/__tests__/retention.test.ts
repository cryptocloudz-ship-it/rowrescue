import { beforeEach, describe, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import path from "path";
import * as schema from "@/db/drizzle";

// Runs against a real Postgres (PGlite, in memory) with the app's migrations applied
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

const { users, teams, auditLogs, teamInvites } = schema;
const { purgeLapsedTeams, AUDIT_RETENTION_DAYS } = await import("../retention");

const DAY = 24 * 60 * 60 * 1000;
const start = new Date("2026-01-01T00:00:00Z");
const daysLater = (n: number) => new Date(start.getTime() + n * DAY);

beforeEach(async () => {
  holder.db = drizzle(new PGlite(), { schema });
  await migrate(holder.db, { migrationsFolder: path.resolve(__dirname, "../../../../drizzle") });
  await holder.db.insert(users).values([
    { id: "olive", email: "olive@acme.test", plan: "team", subscriptionStatus: "active" },
    { id: "sam", email: "sam@acme.test" },
    { id: "rita", email: "rita@other.test", plan: "team", subscriptionStatus: "active" },
  ]);
  await holder.db.insert(teams).values([
    { id: "acme", name: "Acme", ownerId: "olive" },
    { id: "other", name: "Other", ownerId: "rita" },
  ]);
  for (const teamId of ["acme", "other"]) {
    const owner = teamId === "acme" ? "olive" : "rita";
    await holder.db.insert(auditLogs).values([
      { id: `${teamId}-log-1`, teamId, userId: owner, action: "member.join" },
      { id: `${teamId}-log-2`, teamId, userId: owner, action: "preset.create" },
    ]);
    await holder.db
      .insert(teamInvites)
      .values({ id: `${teamId}-inv`, teamId, email: `new@${teamId}.test`, token: `tok-${teamId}`, invitedBy: owner });
  }
});

async function setOwner(id: string, values: Partial<typeof users.$inferInsert>) {
  await holder.db.update(users).set(values).where(eq(users.id, id));
}

async function lapsedAt(teamId: string) {
  const [team] = await holder.db.select().from(teams).where(eq(teams.id, teamId));
  return team.planLapsedAt;
}

async function remaining(teamId: string) {
  const logs = await holder.db.select().from(auditLogs).where(eq(auditLogs.teamId, teamId));
  const invites = await holder.db.select().from(teamInvites).where(eq(teamInvites.teamId, teamId));
  return { logs: logs.length, invites: invites.length };
}

describe("purgeLapsedTeams", () => {
  it("leaves teams with a paid Team plan alone", async () => {
    const result = await purgeLapsedTeams(daysLater(365));
    expect(result).toMatchObject({ lapsed: 0, purged: 0, auditLogsDeleted: 0 });
    expect(await lapsedAt("acme")).toBeNull();
    expect(await remaining("acme")).toEqual({ logs: 2, invites: 1 });
  });

  it("keeps past_due owners on the plan during Stripe's retry window", async () => {
    await setOwner("olive", { subscriptionStatus: "past_due" });
    await purgeLapsedTeams(start);
    expect(await lapsedAt("acme")).toBeNull();
  });

  it("starts the clock when the plan lapses and purges only after the retention period", async () => {
    await setOwner("olive", { plan: "free", subscriptionStatus: "canceled" });

    expect(await purgeLapsedTeams(start)).toMatchObject({ lapsed: 1, purged: 0 });
    expect(await lapsedAt("acme")).toEqual(start);

    // A later run doesn't move the clock forward
    await purgeLapsedTeams(daysLater(10));
    expect(await lapsedAt("acme")).toEqual(start);

    await purgeLapsedTeams(daysLater(AUDIT_RETENTION_DAYS - 1));
    expect(await remaining("acme")).toEqual({ logs: 2, invites: 1 });

    const result = await purgeLapsedTeams(daysLater(AUDIT_RETENTION_DAYS));
    expect(result).toMatchObject({ purged: 1, auditLogsDeleted: 2, invitesDeleted: 1 });
    expect(await remaining("acme")).toEqual({ logs: 0, invites: 0 });
    // Other teams are untouched; the team itself and its members stay
    expect(await remaining("other")).toEqual({ logs: 2, invites: 1 });
    expect(await holder.db.select().from(teams)).toHaveLength(2);
  });

  it("treats a downgrade to Pro, or a stored team plan with a dead status, as lapsed", async () => {
    await setOwner("olive", { plan: "pro", subscriptionStatus: "active" });
    await setOwner("rita", { plan: "team", subscriptionStatus: "incomplete" });
    expect(await purgeLapsedTeams(start)).toMatchObject({ lapsed: 2 });
  });

  it("clears the clock when the owner resubscribes, so nothing is purged", async () => {
    await setOwner("olive", { plan: "free", subscriptionStatus: "canceled" });
    await purgeLapsedTeams(start);

    await setOwner("olive", { plan: "team", subscriptionStatus: "active" });
    expect(await purgeLapsedTeams(daysLater(30))).toMatchObject({ restored: 1 });
    expect(await lapsedAt("acme")).toBeNull();

    await purgeLapsedTeams(daysLater(200));
    expect(await remaining("acme")).toEqual({ logs: 2, invites: 1 });
  });

  it("deletes entries written after a purge on the next run", async () => {
    await setOwner("olive", { plan: "free", subscriptionStatus: "canceled" });
    await purgeLapsedTeams(start);
    await purgeLapsedTeams(daysLater(AUDIT_RETENTION_DAYS));
    await holder.db.insert(auditLogs).values({ id: "late", teamId: "acme", userId: "sam", action: "member.leave" });

    expect(await purgeLapsedTeams(daysLater(AUDIT_RETENTION_DAYS + 1))).toMatchObject({ auditLogsDeleted: 1 });
  });
});
