import { z } from "zod";
import { withAccount, parseBody } from "@/lib/teams/http";
import { createInvite } from "@/lib/teams/data";
import { inviteEmailSchema } from "@/lib/teams/policy";

/** POST /api/team/invites — the admin invites someone by email. Each pending invite holds a seat. */
export async function POST(request: Request) {
  return withAccount(async (account) => {
    const { email } = await parseBody(request, z.object({ email: inviteEmailSchema }));
    const invite = await createInvite(account, email);
    return { invite: { id: invite.id, email: invite.email, token: invite.token } };
  });
}
