import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DEFAULT_OPEN_GRAPH } from "@/config/site";
import { ALL_RULES } from "@/lib/engine/rules";
import { FREE_MAX_ROWS, PRO_MAX_ROWS } from "@/config/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    `Simple, transparent pricing. Clean spreadsheets free up to ${FREE_MAX_ROWS} rows. Upgrade to Pro for up to ${PRO_MAX_ROWS} rows, all ${ALL_RULES.length} rules, and Excel export.`,
  alternates: { canonical: "/pricing" },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: "Pricing — SpreadsheetFix",
    description: "Simple, transparent pricing for spreadsheet cleaning. Start free, upgrade when you need more.",
    url: "/pricing",
  },
};

// Clerk keeps the session token fresh, so checkout knows who is buying
export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
