import { NextRequest } from "next/server";
import { z } from "zod";
import { withAccount, parseBody } from "@/lib/teams/http";
import { createInvite } from "@/lib/teams/data";
import { sendInviteEmail } from "@/lib/teams/inviteEmail";
import { inviteEmailSchema } from "@/lib/teams/policy";

/**
 * POST /api/team/invites — the admin invites someone by email. Each pending invite holds a seat.
 * The invite is emailed when Resend is set up; inviting the same address again resends it.
 */
export async function POST(request: NextRequest) {
  return withAccount(async (account) => {
    const { email } = await parseBody(request, z.object({ email: inviteEmailSchema }));
    const invite = await createInvite(account, email);
    const joinUrl = `${request.nextUrl.origin}/team/join?token=${encodeURIComponent(invite.token)}`;
    const emailed = await sendInviteEmail({ to: invite.email, teamName: account.team!.name, joinUrl });
    return { invite: { id: invite.id, email: invite.email, token: invite.token }, emailed };
  });
}
