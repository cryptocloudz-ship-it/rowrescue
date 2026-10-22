import Link from "next/link";
import { redirect } from "next/navigation";
import {
  currentAccount,
  currentUserEmails,
  invitesForEmails,
  listInvites,
  listMembers,
} from "@/lib/teams/data";
import { seatsUsed } from "@/lib/teams/policy";
import { ActionButton, CopyInviteLink, InviteForm } from "./TeamActions";

export default async function TeamPage() {
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  const { team, user, limits } = account;

  if (!team) {
    const invites = await invitesForEmails(await currentUserEmails());
    return (
      <div className="max-w-[960px] px-6 md:px-10 py-10">
        <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Team</h1>
        {invites.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-[13px] font-medium text-ink-muted">Invites for you</h2>
            <ul className="mt-3 border-t border-rule">
              {invites.map((invite) => (
                <li key={invite.token} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-rule">
                  <span className="text-[15px]">
                    <strong className="font-semibold">{invite.teamName}</strong>
                    <span className="text-ink-muted"> · for {invite.email}</span>
                  </span>
                  <ActionButton url="/api/team/join" method="POST" body={{ token: invite.token }} label="Join team" primary />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="mt-8 rounded-lg border border-rule bg-surface p-8">
            <h2 className="font-semibold">You&apos;re not in a team</h2>
            <p className="mt-2 leading-relaxed text-ink-body max-w-[560px]">
              The Team plan gives everyone on it Pro features, a shared preset library and an audit log. Buy it to
              start a team and invite people, or ask your team admin to invite {user.email}.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center min-h-11 px-5 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted transition-colors"
            >
              See the Team plan
            </Link>
          </div>
        )}
      </div>
    );
  }

  const isAdmin = account.role === "admin" && team.ownerId === user.id;
  const [members, invites] = await Promise.all([listMembers(team.id), isAdmin ? listInvites(team.id) : []]);
  const used = seatsUsed(members.length, invites.length);
  const inactive = !limits.hasTeamFeatures;

  return (
    <div className="max-w-[960px] px-6 md:px-10 py-10">
      <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">{team.name}</h1>
      <p className="mt-3 text-lg text-ink-body">
        {isAdmin ? "You're the admin. " : ""}
        {used} of {team.seatCount} seats used.
      </p>

      {inactive && (
        <div role="status" className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          {isAdmin
            ? "The Team subscription isn't active, so members are on the Free plan. Renew it on the Billing page."
            : "This team's subscription isn't active, so you're on the Free plan for now. Ask your team admin to renew it."}
        </div>
      )}

      {isAdmin && limits.hasAuditLog && (
        <p className="mt-4">
          <Link href="/team/audit" className="text-sm font-medium text-accent hover:underline">
            View the audit log →
          </Link>
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-[13px] font-medium text-ink-muted">Members</h2>
        <ul className="mt-3 border-t border-rule">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-rule text-[15px]">
              <span>
                <span className="font-medium">{m.name || m.email}</span>
                {m.name && <span className="text-ink-muted"> · {m.email}</span>}
                {m.id === team.ownerId && <span className="ml-2 text-xs text-accent font-semibold">Admin</span>}
              </span>
              {isAdmin && m.id !== team.ownerId && (
                <ActionButton
                  url={`/api/team/members/${m.id}`}
                  label="Remove"
                  confirm={`Remove ${m.email} from the team? Their shared presets leave the library.`}
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      {isAdmin && (
        <section className="mt-10">
          <h2 className="text-[13px] font-medium text-ink-muted">Invite people</h2>
          <p className="mt-2 text-sm text-ink-body max-w-[600px]">
            Each invite holds a seat until it&apos;s accepted or revoked. We email the invite with your team name and
            a join link, and you can also copy the link to send it yourself. Only the invited address can accept it,
            and they can also find it on this page after signing in with that address.
          </p>
          <InviteForm disabled={inactive || used >= team.seatCount} />
          {used >= team.seatCount && !inactive && (
            <p className="text-sm text-ink-muted">
              All seats are in use. Add seats with Manage subscription on the{" "}
              <Link href="/billing" className="text-accent hover:underline">
                Billing page
              </Link>
              .
            </p>
          )}
          {invites.length > 0 && (
            <ul className="mt-4 border-t border-rule">
              {invites.map((invite) => (
                <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-rule text-[15px]">
                  <span>
                    {invite.email} <span className="text-ink-muted">· pending</span>
                  </span>
                  <span className="flex gap-2">
                    <CopyInviteLink token={invite.token} />
                    <ActionButton url={`/api/team/invites/${invite.id}`} label="Revoke" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!isAdmin && (
        <section className="mt-10">
          <ActionButton
            url={`/api/team/members/${user.id}`}
            label="Leave team"
            confirm="Leave the team? You'll lose Team features and your shared presets leave the library."
          />
        </section>
      )}
    </div>
  );
}
