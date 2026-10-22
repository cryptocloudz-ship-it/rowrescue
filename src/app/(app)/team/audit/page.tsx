import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AUDIT_PAGE_SIZE, currentAccount, listAuditLog } from "@/lib/teams/data";
import { auditActionLabel, parseAuditMetadata } from "@/lib/teams/audit";

/** Admin-only list of team activity: preset changes and members joining or leaving. Never file contents. */
export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  const { team } = account;
  if (!team || account.role !== "admin" || team.ownerId !== account.user.id || !account.limits.hasAuditLog) notFound();

  const page = Math.max(0, Number.parseInt((await searchParams).page ?? "0", 10) || 0);
  const rows = await listAuditLog(team.id, page);
  const entries = rows.slice(0, AUDIT_PAGE_SIZE);
  const hasMore = rows.length > AUDIT_PAGE_SIZE;

  return (
    <div className="max-w-[960px] px-6 md:px-10 py-10">
      <p>
        <Link href="/team" className="text-sm text-accent hover:underline">
          ← {team.name}
        </Link>
      </p>
      <h1 className="mt-3 text-[36px] leading-tight font-semibold tracking-[-0.02em]">Audit log</h1>
      <p className="mt-3 text-lg text-ink-body max-w-[640px]">
        Who changed presets and who joined or left the team. Files never reach our servers, so they never appear here.
      </p>

      {entries.length === 0 ? (
        <p className="mt-10 text-ink-body">Nothing yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-[15px] border-t border-rule">
            <thead>
              <tr className="text-left text-[13px] text-ink-muted">
                <th scope="col" className="py-2 pr-4 font-medium">When (UTC)</th>
                <th scope="col" className="py-2 pr-4 font-medium">Who</th>
                <th scope="col" className="py-2 pr-4 font-medium">What</th>
                <th scope="col" className="py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const meta = parseAuditMetadata(entry.metadata);
                const details = [
                  meta.presetName && `“${meta.presetName}”`,
                  meta.changed?.length && `changed ${meta.changed.join(", ")}`,
                  meta.email,
                  meta.removedBy && "removed by the admin",
                  meta.seats && `${meta.seats} seats`,
                ].filter(Boolean);
                return (
                  <tr key={entry.id} className="border-t border-rule align-top">
                    <td className="py-3 pr-4 whitespace-nowrap tabular-nums text-ink-body">
                      {entry.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="py-3 pr-4">{entry.actorName || entry.actorEmail || "Deleted user"}</td>
                    <td className="py-3 pr-4">{auditActionLabel(entry.action)}</td>
                    <td className="py-3 text-ink-body break-words">{details.join(" · ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <nav aria-label="Audit log pages" className="mt-6 flex gap-4 text-sm">
        {page > 0 && (
          <Link href={`/team/audit?page=${page - 1}`} className="text-accent hover:underline">
            ← Newer
          </Link>
        )}
        {hasMore && (
          <Link href={`/team/audit?page=${page + 1}`} className="text-accent hover:underline">
            Older →
          </Link>
        )}
      </nav>
    </div>
  );
}
