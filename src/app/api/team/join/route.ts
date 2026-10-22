import { z } from "zod";
import { withAccount, parseBody } from "@/lib/teams/http";
import { acceptInvite, currentUserEmails } from "@/lib/teams/data";

/** POST /api/team/join — accept an invite sent to one of the signed-in user's verified addresses. */
export async function POST(request: Request) {
  return withAccount(async (account) => {
    const { token } = await parseBody(request, z.object({ token: z.string().min(1).max(100) }));
    const teamId = await acceptInvite(account, await currentUserEmails(), token);
    return { teamId };
  });
}
