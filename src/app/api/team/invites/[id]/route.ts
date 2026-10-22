import { withAccount } from "@/lib/teams/http";
import { revokeInvite } from "@/lib/teams/data";

/** DELETE /api/team/invites/:id — the admin revokes a pending invite, freeing its seat. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAccount((account) => revokeInvite(account, id));
}
