import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { SUPPORT_EMAIL } from "@/config/site";
import { BrandMark } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-rule font-ui text-ink">
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-10 grid gap-10 sm:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2.5 font-semibold text-[15px] mb-3">
            <BrandMark />
            SpreadsheetFix
          </div>
          <p className="leading-relaxed text-ink-muted max-w-[300px]">
            CSV and Excel cleaning in your browser. Files are never uploaded.
          </p>
        </div>
        <nav aria-label="Free tools">
          <h2 className="text-[13px] font-medium text-ink-muted mb-3">Free tools</h2>
          <ul className="space-y-2">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`} className="text-ink-body hover:text-ink">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="text-[13px] font-medium text-ink-muted mb-3">SpreadsheetFix</h2>
          <ul className="space-y-2">
            <li><Link href="/tools" className="text-ink-body hover:text-ink">All tools</Link></li>
            <li><Link href="/pricing" className="text-ink-body hover:text-ink">Pricing</Link></li>
            <li><Link href="/legal/terms-of-service" className="text-ink-body hover:text-ink">Terms</Link></li>
            <li><Link href="/legal/privacy-policy" className="text-ink-body hover:text-ink">Privacy</Link></li>
            <li><Link href="/legal/cookie-policy" className="text-ink-body hover:text-ink">Cookies</Link></li>
            <li><a href={`mailto:${SUPPORT_EMAIL}`} className="text-ink-body hover:text-ink">Contact</a></li>
          </ul>
        </nav>
      </div>
      <p className="max-w-[1200px] mx-auto px-6 pb-10 text-[13px] text-ink-muted">
        &copy; {new Date().getFullYear()} SpreadsheetFix
      </p>
    </footer>
  );
}
