import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B0F19",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(13,242,223,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo + brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "#0df2df",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 800,
              color: "#0B0F19",
              boxShadow: "0 0 30px rgba(13,242,223,0.4)",
            }}
          >
            RR
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#0df2df",
              letterSpacing: "-0.5px",
            }}
          >
            RowRescue
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#f1f5f9",
            textAlign: "center",
            lineHeight: 1.2,
            margin: "0 80px",
            letterSpacing: "-1px",
          }}
        >
          Clean messy spreadsheets
          <br />
          <span style={{ color: "#0df2df" }}>in seconds.</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            marginTop: "24px",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          Remove duplicates, fix dates, validate emails — 100% in your browser.
          Your data never leaves your machine.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#0df2df" }}>
              17+
            </span>
            <span style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "2px", marginTop: "4px" }}>
              Cleaning Rules
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#0df2df" }}>
              0.3s
            </span>
            <span style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "2px", marginTop: "4px" }}>
              Avg Clean Time
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#0df2df" }}>
              0 bytes
            </span>
            <span style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "2px", marginTop: "4px" }}>
              Uploaded
            </span>
          </div>
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #0df2df, transparent)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
