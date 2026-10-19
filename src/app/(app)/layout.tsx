import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BrandMark } from "@/components/marketing/SiteHeader";
import { AppNav } from "@/components/app/AppNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row md:overflow-hidden bg-paper font-ui text-ink">
      <aside className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-rule bg-surface flex flex-col gap-4 md:gap-8 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-[17px]" aria-label="SpreadsheetFix home">
            <BrandMark />
            SpreadsheetFix
          </Link>
          <div className="md:hidden">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <AppNav />
        <div className="hidden md:block mt-auto">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      <main id="main-content" className="flex-1 min-w-0 md:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
