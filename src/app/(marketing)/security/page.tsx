import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/seo/Breadcrumbs";
import { DEFAULT_OPEN_GRAPH, SUPPORT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Security and Data Handling",
  description:
    "How SpreadsheetFix cleans CSV and Excel files in your browser without uploading them, what our servers do store, and how to check it yourself.",
  alternates: { canonical: "/security" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: "Security and Data Handling | SpreadsheetFix", url: "/security" },
};

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Security", path: "/security" },
];

// Keep in step with the code: parsing in src/lib/engine/parsers, export recording in
// src/app/api/entitlements, the CSP in next.config.ts and analytics consent in ConsentedAnalytics.
const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "Your file is processed in your browser",
    body: (
      <>
        When you choose a file, your browser reads it from disk and SpreadsheetFix’s JavaScript parses and cleans it
        inside the page. The rows, cells and the file itself are never sent to our servers or to anyone else. The
        cleaned file is built in the page too and saved straight to your computer.
      </>
    ),
  },
  {
    heading: "What reaches our server",
    body: (
      <>
        When you download a cleaned file, the page tells our server its row count and which rules ran, so that plan
        limits can be applied. The file name stays in your browser, and the rules aren’t stored. If you’re signed in,
        we keep a count of today’s exports. For accounts we also store your email address and plan, and Stripe holds billing
        details.
      </>
    ),
  },
  {
    heading: "Third parties",
    body: (
      <>
        Clerk handles sign-in, and may show a Cloudflare bot check when you sign up, and Stripe handles payments;
        none of them receives anything from your files. Google Analytics
        loads only if you accept cookies, and records usage events such as file type, row count and number of changes,
        never cell contents or file names.
      </>
    ),
  },
  {
    heading: "Enforced by the browser",
    body: (
      <>
        Every page is served with a Content Security Policy that only lets the page connect to our own domain, Clerk,
        Stripe and Google Analytics. Pages can’t be framed by other sites, and access to the camera, microphone and
        location is switched off.
      </>
    ),
  },
  {
    heading: "Check it yourself",
    body: (
      <>
        Open your browser’s developer tools, go to the Network tab and clean a file. You’ll see the page load and,
        when you download, one small request to <code className="font-data text-[0.95em]">/api/entitlements</code>{" "}
        with the row count and the rules that ran. There is no upload.
      </>
    ),
  },
  {
    heading: "Where we are",
    body: (
      <>
        SpreadsheetFix is based in the EU and GDPR applies. Details are in the{" "}
        <Link href="/legal/privacy-policy" className="text-accent underline underline-offset-2">privacy policy</Link>.
        Report a security issue to <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent underline underline-offset-2">{SUPPORT_EMAIL}</a>.
      </>
    ),
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <SiteHeader />
      <main id="main-content" className="max-w-[1200px] mx-auto px-6 pt-14 pb-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[36px] sm:text-[46px] leading-[1.08] font-semibold tracking-[-0.03em] max-w-[820px]">
          Your files stay on your computer
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-body max-w-[680px]">
          SpreadsheetFix cleans CSV and Excel files inside your browser. This page explains exactly what that means,
          what our servers do see, and how you can verify it.
        </p>
        <div className="mt-14 max-w-[720px] space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.heading} className="border-t border-rule-strong pt-5">
              <h2 className="text-[22px] leading-tight font-semibold tracking-[-0.01em]">{s.heading}</h2>
              <p className="mt-3 text-ink-body leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
