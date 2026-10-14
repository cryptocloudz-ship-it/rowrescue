import Link from "next/link";
import { Activity } from "lucide-react";
import { NavAuth } from "./NavAuth";

export function SiteHeader() {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0" aria-label="SpreadsheetFix home">
          <div className="size-8 flex-shrink-0 bg-primary rounded-lg flex items-center justify-center neon-glow">
            <Activity className="size-5 text-background-dark font-bold" aria-hidden="true" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-primary neon-text-glow">SpreadsheetFix</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium" aria-label="Main">
          <Link href="/tools" className="text-slate-300 hover:text-primary transition-colors hidden sm:inline">
            Tools
          </Link>
          <Link href="/pricing" className="text-slate-300 hover:text-primary transition-colors max-[420px]:hidden">
            Pricing
          </Link>
          <NavAuth />
        </nav>
      </div>
    </header>
  );
}
