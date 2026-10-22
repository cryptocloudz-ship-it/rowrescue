import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: vi.fn(function () {
    return { emails: { send } };
  }),
}));

const { inviteEmailContent, sendInviteEmail } = await import("../inviteEmail");

const invite = { to: "sam@acme.test", teamName: "Acme <Ops>", joinUrl: "https://spreadsheetfix.com/team/join?token=abc" };

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "email_1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("INVITE_EMAIL_FROM", "SpreadsheetFix <invites@spreadsheetfix.com>");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("inviteEmailContent", () => {
  it("contains the team name and join link, with the name escaped in HTML", () => {
    const { subject, text, html } = inviteEmailContent(invite);
    expect(subject).toBe("You're invited to join Acme <Ops> on SpreadsheetFix");
    expect(text).toContain('"Acme <Ops>"');
    expect(text).toContain(invite.joinUrl);
    expect(html).toContain("Acme &#60;Ops&#62;");
    expect(html).not.toContain("<Ops>");
    expect(html).toContain('href="https://spreadsheetfix.com/team/join?token=abc"');
  });
});

describe("sendInviteEmail", () => {
  it("sends through Resend from the configured address", async () => {
    await expect(sendInviteEmail(invite)).resolves.toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      from: "SpreadsheetFix <invites@spreadsheetfix.com>",
      to: "sam@acme.test",
      ...inviteEmailContent(invite),
    });
  });

  it("skips sending when Resend isn't configured", async () => {
    vi.stubEnv("INVITE_EMAIL_FROM", "");
    await expect(sendInviteEmail(invite)).resolves.toBe(false);
    vi.stubEnv("INVITE_EMAIL_FROM", "a@b.c");
    vi.stubEnv("RESEND_API_KEY", "");
    await expect(sendInviteEmail(invite)).resolves.toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("reports failure instead of throwing when Resend returns an error or rejects", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "validation_error", message: "Domain not verified" } });
    await expect(sendInviteEmail(invite)).resolves.toBe(false);
    send.mockRejectedValueOnce(new Error("network down"));
    await expect(sendInviteEmail(invite)).resolves.toBe(false);
  });
});
