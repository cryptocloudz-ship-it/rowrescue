import Link from "next/link";
import { Activity } from "lucide-react";
import { TOOLS } from "@/content/tools";

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/10 glass-panel py-12 relative z-10">
      <div className="max-w-5xl mx-auto px-4 grid gap-10 sm:grid-cols-3 text-sm text-slate-400">
        <div>
          <div className="flex items-center gap-2 text-slate-200 font-bold mb-3">
            <Activity className="size-4 text-primary" aria-hidden="true" />
            SpreadsheetFix
          </div>
          <p className="leading-relaxed">
            Privacy-first CSV and Excel cleaning. Files are processed in your browser and never uploaded.
          </p>
        </div>
        <nav aria-label="Free tools">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Free tools</h2>
          <ul className="space-y-2">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`} className="hover:text-primary transition-colors">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">SpreadsheetFix</h2>
          <ul className="space-y-2">
            <li><Link href="/tools" className="hover:text-primary transition-colors">All tools</Link></li>
            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="/legal/terms-of-service" className="hover:text-primary transition-colors">Terms</Link></li>
            <li><Link href="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link></li>
            <li><Link href="/legal/cookie-policy" className="hover:text-primary transition-colors">Cookies</Link></li>
          </ul>
        </nav>
      </div>
      <p className="max-w-5xl mx-auto px-4 mt-10 text-xs text-slate-600">
        &copy; {new Date().getFullYear()} SpreadsheetFix. All rights reserved.
      </p>
    </footer>
  );
}
