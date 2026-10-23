import { ImageResponse } from "next/og";
import { IMPORTS, IMPORT_MAP } from "@/content/imports";
import { OgCard, ogFonts } from "@/lib/og/OgCard";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SpreadsheetFix import guide";

export function generateStaticParams() {
  return IMPORTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = IMPORT_MAP.get(slug);
  return new ImageResponse(
    <OgCard title={page?.h1 ?? "Bank to accounting software imports"} subtitle="From your bank's CSV to your accounting software's import, step by step." />,
    { ...size, fonts: await ogFonts() }
  );
}
