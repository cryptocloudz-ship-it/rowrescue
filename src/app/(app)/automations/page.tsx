import Link from "next/link";

export default function AutomationsPage() {
  return (
    <div className="max-w-[960px] px-6 md:px-10 py-10">
      <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.02em]">Automations</h1>
      <div className="mt-8 rounded-lg border border-rule bg-surface p-8">
        <h2 className="font-semibold">Not available yet</h2>
        <p className="mt-2 leading-relaxed text-ink-body max-w-[560px]">
          To reuse the same cleaning steps, save a preset in the cleaner. Presets apply your chosen rules and options
          to the next file you open.
        </p>
        <Link
          href="/clean"
          className="mt-6 inline-flex items-center min-h-11 px-5 rounded-md border border-rule-strong text-sm font-medium hover:border-ink-muted transition-colors"
        >
          Open the cleaner
        </Link>
      </div>
    </div>
  );
}
