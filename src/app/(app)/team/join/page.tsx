import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAccount, currentUserEmails, inviteByToken } from "@/lib/teams/data";
import { emailMatchesInvite } from "@/lib/teams/policy";
import { ActionButton } from "../TeamActions";

export default async function JoinTeamPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  if (account.team) redirect("/team");

  const found = token ? await inviteByToken(token) : null;
  const matches = found ? emailMatchesInvite(await currentUserEmails(), found.invite.email) : false;

  return (
    <div className="max-w-[640px] px-6 md:px-10 py-10">
      <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Join a team</h1>
      {!found ? (
        <p className="mt-4 text-lg text-ink-body">
          This invite has been used or revoked. Ask your team admin for a new link.
        </p>
      ) : matches ? (
        <>
          <p className="mt-4 text-lg text-ink-body">
            You&apos;ve been invited to <strong className="font-semibold">{found.teamName}</strong>. Members get Team
            features and the team&apos;s shared presets.
          </p>
          <div className="mt-8">
            <ActionButton url="/api/team/join" method="POST" body={{ token }} label="Join team" redirectTo="/team" primary />
          </div>
        </>
      ) : (
        <p className="mt-4 text-lg text-ink-body">
          This invite is for {found.invite.email}, but you&apos;re signed in as {account.user.email}. Sign in with the
          invited address to accept it.
        </p>
      )}
      <p className="mt-10">
        <Link href="/team" className="text-sm text-accent hover:underline">
          Back to Team
        </Link>
      </p>
    </div>
  );
}
