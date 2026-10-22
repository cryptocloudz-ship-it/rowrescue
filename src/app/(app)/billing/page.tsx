import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureUser } from "@/lib/billing/ensureUser";
import { loadAccount } from "@/lib/teams/data";
import { BillingActions } from "./BillingActions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await ensureUser(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const showSuccess = params.success === "true";
  // Members of a team get its plan; the admin owns the subscription and sees its details here
  const { plan, limits, team } = await loadAccount(user);
  const viaTeam = team && team.ownerId !== user.id && plan === "team" ? team : null;
  const periodEnd = user.currentPeriodEnd
    ? new Date(user.currentPeriodEnd).toLocaleDateString("en-IE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const statusLabel = viaTeam
    ? "Team member"
    : user.subscriptionStatus
      ? user.subscriptionStatus.replace("_", " ")
      : "Free account";
  const statusColour =
    user.subscriptionStatus === "active"
      ? "text-emerald-700"
      : user.subscriptionStatus === "past_due"
        ? "text-amber-700"
        : "text-ink-body";
  const limitItems = [
    { label: "Max rows per file", value: limits.maxRows.toLocaleString() },
    { label: "Exports per day", value: limits.maxExportsPerDay === Infinity ? "Unlimited" : String(limits.maxExportsPerDay) },
    { label: "Export formats", value: limits.allowedExportFormats.map((f) => `.${f}`).join(", ") },
    { label: "Presets", value: limits.maxPresets === Infinity ? "Unlimited" : String(limits.maxPresets) },
  ];

  return (
    <div className="max-w-[960px] px-6 md:px-10 py-10">
      {showSuccess && (
        <div role="status" className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="font-semibold text-emerald-800">Subscription activated</p>
          <p className="text-sm text-emerald-800 mt-1">
            {user.plan === "team" ? (
              <>
                Your team is ready. <Link href="/team" className="underline">Invite people</Link> to fill your seats.
              </>
            ) : (
              "Pro features are now available on this account."
            )}
          </p>
        </div>
      )}

      <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Billing</h1>
      <p className="mt-3 text-lg text-ink-body">Your plan, its limits and your subscription.</p>

      <section className="mt-10 rounded-lg border border-rule">
        <dl className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-rule">
          <div className="p-5">
            <dt className="text-[13px] text-ink-muted">Plan</dt>
            <dd className="mt-1 text-xl font-semibold capitalize">{plan}</dd>
            {viaTeam && <p className="mt-1 text-sm text-ink-muted">Through {viaTeam.name}</p>}
          </div>
          <div className="p-5">
            <dt className="text-[13px] text-ink-muted">Status</dt>
            <dd className={`mt-1 text-xl font-semibold capitalize ${statusColour}`}>{statusLabel}</dd>
          </div>
          {periodEnd && (
            <div className="p-5">
              <dt className="text-[13px] text-ink-muted">
                {user.subscriptionStatus === "canceled" ? "Access until" : "Next billing date"}
              </dt>
              <dd className="mt-1 text-xl font-semibold">{periodEnd}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] font-medium text-ink-muted">Plan limits</h2>
        <dl className="mt-3 border-t border-rule">
          {limitItems.map((item) => (
            <div key={item.label} className="flex justify-between gap-4 py-3 border-b border-rule text-[15px]">
              <dt className="text-ink-body">{item.label}</dt>
              <dd className="font-medium tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10">
        <BillingActions plan={plan} hasStripeCustomer={!!user.stripeCustomerId} />
      </div>
    </div>
  );
}
