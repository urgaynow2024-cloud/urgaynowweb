import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Ur Gay Now — VRChat LGBTQ+ Community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIDE_BAR =
  "linear-gradient(90deg, #e40303 0%, #ff8c00 16.66%, #ffed00 33.33%, #008026 50%, #004dff 66.66%, #750787 100%)";
const BG =
  "linear-gradient(135deg, #0c0d12 0%, #1b1020 55%, #221231 100%)";
const PRIDE_DOTS = ["#e40303", "#ff8c00", "#ffed00", "#008026", "#004dff", "#750787"];

export default async function Image() {
  const fontData = await readFile(
    join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0c0d12",
          backgroundImage: BG,
          color: "#ffffff",
          fontFamily: "Noto Sans",
        }}
      >
        <div style={{ height: "20px", width: "100%", backgroundImage: PRIDE_BAR }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 90px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#d6abe0",
              fontSize: 32,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            VRChat · LGBTQ+ Community
          </div>

          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 116,
              marginTop: 14,
              lineHeight: 1.05,
            }}
          >
            Ur Gay Now
          </div>

          <div
            style={{
              display: "flex",
              color: "#cdd2dd",
              fontSize: 38,
              marginTop: 22,
            }}
          >
            Events · Staff · Guides · News · Gallery
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
            {PRIDE_DOTS.map((c) => (
              <div
                key={c}
                style={{
                  width: 58,
                  height: 12,
                  borderRadius: 999,
                  backgroundColor: c,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ height: "20px", width: "100%", backgroundImage: PRIDE_BAR }} />
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans", data: fontData, weight: 400, style: "normal" }],
    }
  );
}
