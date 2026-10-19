import Link from "next/link";
import { NavAuth } from "./NavAuth";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 7.5h18M7.5 7.5V19" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-rule font-ui text-ink">
      <div className="max-w-[1200px] mx-auto px-6 min-h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 font-semibold text-[17px]" aria-label="SpreadsheetFix home">
          <BrandMark className="shrink-0" />
          <span>SpreadsheetFix</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7 text-[15px]" aria-label="Main">
          <Link href="/tools" className="text-ink-body hover:text-ink py-3 hidden sm:inline">
            Tools
          </Link>
          <Link href="/#security" className="text-ink-body hover:text-ink py-3 hidden md:inline">
            Security
          </Link>
          <Link href="/pricing" className="text-ink-body hover:text-ink py-3 max-[420px]:hidden">
            Pricing
          </Link>
          <NavAuth />
        </nav>
      </div>
    </header>
  );
}
