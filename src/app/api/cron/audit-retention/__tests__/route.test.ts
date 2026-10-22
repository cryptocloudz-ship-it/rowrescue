import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const purgeLapsedTeams = vi.hoisted(() => vi.fn(async () => ({ lapsed: 0, restored: 0, purged: 1, auditLogsDeleted: 3, invitesDeleted: 0 })));
vi.mock("@/lib/teams/retention", () => ({ purgeLapsedTeams }));

const { GET } = await import("../route");

function call(authorization?: string) {
  return GET(new Request("http://localhost/api/cron/audit-retention", { headers: authorization ? { authorization } : {} }));
}

beforeEach(() => {
  purgeLapsedTeams.mockClear();
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/cron/audit-retention", () => {
  it("runs the purge with the right secret", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const res = await call("Bearer s3cret");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ purged: 1, auditLogsDeleted: 3 });
    expect(purgeLapsedTeams).toHaveBeenCalledOnce();
  });

  it.each([undefined, "Bearer wrong", "s3cret", "Bearer s3cret2"])("refuses %s", async (header) => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    expect((await call(header)).status).toBe(401);
    expect(purgeLapsedTeams).not.toHaveBeenCalled();
  });

  it("refuses everything when CRON_SECRET isn't set", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    expect((await call("Bearer undefined")).status).toBe(401);
    expect(purgeLapsedTeams).not.toHaveBeenCalled();
  });
});
