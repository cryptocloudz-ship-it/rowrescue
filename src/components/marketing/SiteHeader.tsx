import Link from "next/link";
import { NavAuth } from "./NavAuth";

// A 2×2 grid of cells with the bottom-right one filled
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`text-accent ${className}`}>
      <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10.2" y="10.2" width="7.6" height="7.6" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-rule font-ui text-ink">
      <div className="max-w-[1200px] mx-auto px-6 min-h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 font-semibold text-[17px]" aria-label="SpreadsheetFix home">
          <BrandMark className="shrink-0" />
          <span className="truncate">SpreadsheetFix</span>
        </Link>
        <nav className="shrink-0 flex items-center gap-4 sm:gap-7 text-[15px]" aria-label="Main">
          <Link href="/tools" className="text-ink-body hover:text-ink py-3 hidden sm:inline">
            Tools
          </Link>
          <Link href="/security" className="text-ink-body hover:text-ink py-3 hidden md:inline">
            Security
          </Link>
          <Link href="/pricing" className="text-ink-body hover:text-ink py-3 max-[519px]:hidden">
            Pricing
          </Link>
          <NavAuth />
        </nav>
      </div>
    </header>
  );
}
