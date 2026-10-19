import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-[960px] px-6 md:px-10 py-10">
      <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Dashboard</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-body max-w-[640px]">
        Files are cleaned in your browser and never reach our servers, so there is no file history or usage to show
        here.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Link href="/clean" className="group rounded-lg border border-rule p-6 hover:border-rule-strong transition-colors">
          <h2 className="font-semibold group-hover:text-accent">Clean a file</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-body">
            Open the cleaner and choose a CSV or Excel file. Your presets load automatically.
          </p>
        </Link>
        <Link href="/billing" className="group rounded-lg border border-rule p-6 hover:border-rule-strong transition-colors">
          <h2 className="font-semibold group-hover:text-accent">Plan and billing</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-body">
            See your current plan, its limits and invoices, or change your subscription.
          </p>
        </Link>
      </div>
    </div>
  );
}
