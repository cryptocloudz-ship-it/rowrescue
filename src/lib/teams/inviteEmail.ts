import { Resend } from "resend";

export interface InviteEmail {
  to: string;
  teamName: string;
  joinUrl: string;
  /** Who sent the invite: their display name and/or email. */
  inviterName: string | null;
  inviterEmail: string;
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

/** Who sent it, e.g. `Olive Kelly (olive@acme.com)`, or just the email when there's no name. */
function inviterLabel({ inviterName, inviterEmail }: Pick<InviteEmail, "inviterName" | "inviterEmail">) {
  const name = inviterName?.trim();
  return name ? `${name} (${inviterEmail})` : inviterEmail;
}

/**
 * The whole email: who invited them, the team name and the join link, nothing about the team's files.
 * Names the sender, shows the URL in full and carries a footer, so it doesn't read like phishing.
 * The footer's postal address comes from BUSINESS_POSTAL_ADDRESS and is left out until that's set.
 */
export function inviteEmailContent(invite: Omit<InviteEmail, "to">) {
  const { teamName, joinUrl } = invite;
  const inviter = inviterLabel(invite);
  const address = process.env.BUSINESS_POSTAL_ADDRESS?.trim();
  const footer = ["SpreadsheetFix · https://spreadsheetfix.com", ...(address ? [address] : [])];
  const about = "SpreadsheetFix cleans messy spreadsheets in your browser; teams share their cleaning presets.";

  const subject = `${invite.inviterName?.trim() || inviter} invited you to join ${teamName} on SpreadsheetFix`;
  const text = [
    `${inviter} invited you to join the team "${teamName}" on SpreadsheetFix.`,
    "",
    about,
    "",
    "Accept the invite:",
    joinUrl,
    "",
    "Sign in or create an account with this email address to accept. If you weren't expecting this, you can ignore it.",
    "",
    "--",
    ...footer,
  ].join("\n");

  const p = 'style="margin:0 0 16px"';
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#0e1525;max-width:520px">
<p ${p}><strong>${escapeHtml(inviter)}</strong> invited you to join the team <strong>${escapeHtml(teamName)}</strong> on SpreadsheetFix.</p>
<p ${p}>${escapeHtml(about)}</p>
<p ${p}><a href="${escapeHtml(joinUrl)}" style="display:inline-block;background:#1f3d99;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Accept the invite</a></p>
<p ${p}>Or open this link: <a href="${escapeHtml(joinUrl)}">${escapeHtml(joinUrl)}</a></p>
<p ${p}>Sign in or create an account with this email address to accept. If you weren't expecting this, you can ignore it.</p>
<p style="margin:24px 0 0;font-size:12px;color:#656d76">${footer.map(escapeHtml).join("<br>")}</p>
</div>`;
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
