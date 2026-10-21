import { ImageResponse } from "next/og";
import { GUIDES, GUIDE_MAP } from "@/content/guides";
import { OgCard, ogFonts } from "@/lib/og/OgCard";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SpreadsheetFix guide";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = GUIDE_MAP.get(slug);
  return new ImageResponse(
    <OgCard title={g?.title ?? "Spreadsheet cleaning guides"} subtitle="SpreadsheetFix guides" />,
    { ...size, fonts: await ogFonts() }
  );
}
