import { ImageResponse } from "next/og";
import { COMPARISONS, COMPARISON_MAP } from "@/content/comparisons";
import { OgCard, ogFonts } from "@/lib/og/OgCard";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SpreadsheetFix comparison";

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPARISON_MAP.get(slug);
  return new ImageResponse(
    <OgCard title={c?.h1 ?? "How SpreadsheetFix compares"} subtitle="What each tool does better, and when to use which." />,
    { ...size, fonts: await ogFonts() }
  );
}
