import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  createInvite: vi.fn(),
  currentAccount: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mocks.send } };
  }),
}));
vi.mock("@/lib/teams/data", async () => {
  class TeamError extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  }
  return { createInvite: mocks.createInvite, currentAccount: mocks.currentAccount, TeamError };
});

const { POST } = await import("../route");
const { TeamError } = await import("@/lib/teams/data");

function invite(email: string) {
  return POST(
    new NextRequest("https://spreadsheetfix.com/api/team/invites", { method: "POST", body: JSON.stringify({ email }) })
  );
}

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("INVITE_EMAIL_FROM", "invites@spreadsheetfix.com");
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.send.mockReset().mockResolvedValue({ data: { id: "email_1" }, error: null });
  mocks.currentAccount.mockResolvedValue({ user: { id: "owner", name: "Olive Kelly", email: "olive@acme.test" }, team: { id: "t1", name: "Acme" }, role: "admin" });
  mocks.createInvite.mockReset().mockResolvedValue({ id: "inv1", email: "sam@acme.test", token: "tok/en" });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/team/invites", () => {
  it("creates the invite and emails who sent it, the team name and join link", async () => {
    const res = await invite("sam@acme.test");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ invite: { id: "inv1", email: "sam@acme.test", token: "tok/en" }, emailed: true });

    expect(mocks.send).toHaveBeenCalledTimes(1);
    const sent = mocks.send.mock.calls[0][0];
    expect(sent).toMatchObject({ from: "invites@spreadsheetfix.com", to: "sam@acme.test" });
    expect(sent.subject).toBe("Olive Kelly invited you to join Acme on SpreadsheetFix");
    expect(sent.text).toContain("Olive Kelly (olive@acme.test)");
    expect(sent.text).toContain("https://spreadsheetfix.com/team/join?token=tok%2Fen");
  });

  it("still returns the invite for the copy-link fallback when the email fails", async () => {
    mocks.send.mockRejectedValueOnce(new Error("network down"));
    const res = await invite("sam@acme.test");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ invite: { token: "tok/en" }, emailed: false });
  });

  it("doesn't email when Resend isn't configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await invite("sam@acme.test");
    expect(await res.json()).toMatchObject({ emailed: false });
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("sends nothing when the invite can't be created", async () => {
    mocks.createInvite.mockRejectedValueOnce(new TeamError("All 2 seats are in use.", 409));
    const res = await invite("sam@acme.test");
    expect(res.status).toBe(409);
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
