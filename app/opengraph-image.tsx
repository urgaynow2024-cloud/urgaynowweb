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
  "radial-gradient(ellipse at 20% 80%, rgba(181,0,160,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,89,248,0.10) 0%, transparent 50%), linear-gradient(135deg, #0c0d12 0%, #1b1020 55%, #221231 100%)";

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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top pride bar */}
        <div style={{ height: "8px", width: "100%", backgroundImage: PRIDE_BAR }} />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(189,127,206,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(189,127,206,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            filter: "blur(80px)",
            background: "rgba(189,127,206,0.12)",
            top: "-100px",
            left: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            filter: "blur(80px)",
            background: "rgba(168,89,248,0.08)",
            bottom: "-80px",
            right: "-80px",
          }}
        />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            gap: "60px",
            position: "relative",
          }}
        >
          {/* Logo circle with glow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(189,127,206,0.2) 0%, rgba(117,7,135,0.1) 100%)",
              boxShadow: "0 0 60px -10px rgba(117,7,135,0.5), 0 0 120px -20px rgba(189,127,206,0.3)",
              border: "3px solid rgba(189,127,206,0.3)",
            }}
          >
            <div style={{ display: "flex", color: "#ffffff", fontSize: "80px", fontWeight: 700 }}>
              UGN
            </div>
          </div>

          {/* Text content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              maxWidth: "680px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 16px",
                borderRadius: "999px",
                background: "rgba(117,7,135,0.15)",
                border: "1px solid rgba(189,127,206,0.2)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <div style={{ display: "flex", color: "#d6abe0", fontSize: "18px", letterSpacing: "3px" }}>
                VRCHAT · LGBTQ+ COMMUNITY
              </div>
            </div>
            <div
              style={{
                display: "flex",
                color: "#ffffff",
                fontSize: "96px",
                marginTop: "20px",
                lineHeight: 1.02,
              }}
            >
              Ur Gay Now
            </div>
            <div
              style={{
                display: "flex",
                color: "#cdd2dd",
                fontSize: "32px",
                marginTop: "16px",
                lineHeight: 1.4,
              }}
            >
              Events · Daily Games · Community · Friends
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "28px",
                padding: "10px 20px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", color: "#a256bb", fontSize: "28px" }}>
                urgaynow.com
              </div>
            </div>
          </div>
        </div>

        {/* Bottom pride bar */}
        <div style={{ height: "8px", width: "100%", backgroundImage: PRIDE_BAR }} />
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans", data: fontData, weight: 400, style: "normal" }],
    }
  );
}
