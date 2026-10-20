import { ImageResponse } from "next/og";
import { TOOLS, TOOL_MAP, toolNeedsPro } from "@/content/tools";
import { OgCard, ogFonts } from "@/lib/og/OgCard";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SpreadsheetFix free CSV tool";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = TOOL_MAP.get(slug);
  return new ImageResponse(
    <OgCard
      title={tool?.h1 ?? "Free CSV cleaning tools"}
      subtitle={tool && toolNeedsPro(tool) ? "A Pro rule. Runs in your browser." : "Free for files up to 5,000 rows."}
    />,
    { ...size, fonts: await ogFonts() }
  );
}
