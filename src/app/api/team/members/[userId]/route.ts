import { withAccount } from "@/lib/teams/http";
import { removeMember } from "@/lib/teams/data";

/** DELETE /api/team/members/:userId — leave the team (your own id) or, as admin, remove a member. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return withAccount((account) => removeMember(account, userId));
}
