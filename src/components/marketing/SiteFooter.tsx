import Link from "next/link";
import { HUBS, hubPath } from "@/content/hubs";
import { COMPARISONS } from "@/content/comparisons";
import { GUIDES } from "@/content/guides";
import { SUPPORT_EMAIL } from "@/config/site";
import { BrandMark } from "./SiteHeader";

const linkClass = "text-ink-body hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-rule font-ui text-ink">
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 text-sm">
        <div>
          <div className="flex items-center gap-2.5 font-semibold text-[15px] mb-3">
            <BrandMark />
            SpreadsheetFix
          </div>
          <p className="leading-relaxed text-ink-muted max-w-[300px]">
            CSV and Excel cleaning in your browser. Files are never uploaded.
          </p>
        </div>
        <nav aria-label="Cleaning tools">
          <h2 className="text-[13px] font-medium text-ink-muted mb-3">Clean</h2>
          <ul className="space-y-2">
            {HUBS.map((h) => (
              <li key={h.slug}>
                <Link href={hubPath(h)} className={linkClass}>{h.name}</Link>
              </li>
            ))}
            <li><Link href="/tools" className={linkClass}>All cleaning tools</Link></li>
          </ul>
        </nav>
        <nav aria-label="Comparisons">
          <h2 className="text-[13px] font-medium text-ink-muted mb-3">Compare</h2>
          <ul className="space-y-2">
            {COMPARISONS.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`} className={linkClass}>vs {c.competitor}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Guides">
          <h2 className="text-[13px] font-medium text-ink-muted mb-3">Guides</h2>
          <ul className="space-y-2">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className={linkClass}>{g.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Product">
          <h2 className="text-[13px] font-medium text-ink-muted mb-3">Product</h2>
          <ul className="space-y-2">
            <li><Link href="/clean" className={linkClass}>Spreadsheet cleaner</Link></li>
            <li><Link href="/guides" className={linkClass}>All guides</Link></li>
            <li><Link href="/import" className={linkClass}>Import guides</Link></li>
            <li><Link href="/compare" className={linkClass}>All comparisons</Link></li>
            <li><Link href="/security" className={linkClass}>Security</Link></li>
            <li><Link href="/pricing" className={linkClass}>Pricing</Link></li>
            <li><Link href="/contact" className={linkClass}>Contact</Link></li>
          </ul>
        </nav>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 pb-10">
        <div className="border-t border-rule pt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-muted">
          <span>&copy; {new Date().getFullYear()} SpreadsheetFix</span>
          <Link href="/legal/terms-of-service" className="hover:text-ink">Terms</Link>
          <Link href="/legal/privacy-policy" className="hover:text-ink">Privacy</Link>
          <Link href="/legal/cookie-policy" className="hover:text-ink">Cookies</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">{SUPPORT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
