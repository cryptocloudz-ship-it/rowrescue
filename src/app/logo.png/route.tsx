import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// Square logo for the Organization JSON-LD (Google wants ≥112px). Same mark as src/app/icon.svg.
export async function GET() {
  return new ImageResponse(
    (
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="7" fill="#1F3D99" />
        <path d="M23 16.4V7.5H6v15.5h11" fill="none" stroke="#fff" strokeWidth="2.6" />
        <rect x="19" y="18.5" width="7.5" height="7.5" fill="#fff" />
      </svg>
    ),
    { width: 512, height: 512 }
  );
}
