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
        <div style={{ height: "16px", width: "100%", backgroundImage: PRIDE_BAR }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 84px",
            gap: "64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "320px",
              height: "320px",
              borderRadius: "52px",
              backgroundImage: PRIDE_BAR,
              boxShadow: "0 24px 70px -24px rgba(117,7,135,0.65)",
            }}
          >
            <div style={{ display: "flex", color: "#ffffff", fontSize: "140px" }}>UGN</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              maxWidth: "660px",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#d6abe0",
                fontSize: "28px",
                letterSpacing: "5px",
              }}
            >
              VRCHAT · LGBTQ+ COMMUNITY
            </div>
            <div
              style={{
                display: "flex",
                color: "#ffffff",
                fontSize: "104px",
                marginTop: "16px",
                lineHeight: 1.02,
              }}
            >
              Ur Gay Now
            </div>
            <div
              style={{
                display: "flex",
                color: "#cdd2dd",
                fontSize: "34px",
                marginTop: "18px",
              }}
            >
              Events · Staff · Guides · News · Gallery
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "30px" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "999px", backgroundColor: "#750787" }} />
              <div style={{ display: "flex", color: "#9aa2b4", fontSize: "28px" }}>urgaynow.com</div>
            </div>
          </div>
        </div>

        <div style={{ height: "16px", width: "100%", backgroundImage: PRIDE_BAR }} />
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans", data: fontData, weight: 400, style: "normal" }],
    }
  );
}
