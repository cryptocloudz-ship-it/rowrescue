import { Resend } from "resend";

export interface InviteEmail {
  to: string;
  teamName: string;
  joinUrl: string;
}

let client: Resend | null = null;

function resend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** The whole email: the team name and the join link, nothing else about the team or its files. */
export function inviteEmailContent({ teamName, joinUrl }: Omit<InviteEmail, "to">) {
  const subject = `You're invited to join ${teamName} on SpreadsheetFix`;
  const text = [
    `You've been invited to join the team "${teamName}" on SpreadsheetFix.`,
    "",
    `Accept the invite: ${joinUrl}`,
    "",
    "Sign in with this email address to accept. If you weren't expecting this, you can ignore it.",
  ].join("\n");
  const html = `<p>You've been invited to join the team <strong>${escapeHtml(teamName)}</strong> on SpreadsheetFix.</p>
<p><a href="${escapeHtml(joinUrl)}">Accept the invite</a></p>
<p>Sign in with this email address to accept. If you weren't expecting this, you can ignore it.</p>`;
  return { subject, text, html };
}

/**
 * Emails an invite through Resend. Returns whether it was sent: without RESEND_API_KEY and
 * INVITE_EMAIL_FROM, or if Resend fails, the invite still exists and the admin copies the link.
 */
export async function sendInviteEmail(invite: InviteEmail): Promise<boolean> {
  const from = process.env.INVITE_EMAIL_FROM;
  const api = resend();
  if (!api || !from) return false;
  try {
    const { error } = await api.emails.send({ from, to: invite.to, ...inviteEmailContent(invite) });
    if (error) console.error("Invite email failed:", error.message);
    return !error;
  } catch (err) {
    console.error("Invite email failed:", err);
    return false;
  }
}
