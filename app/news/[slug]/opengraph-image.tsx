import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Ur Gay Now announcement";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIDE_BAR =
  "linear-gradient(90deg, #e40303 0%, #ff8c00 16.66%, #ffed00 33.33%, #008026 50%, #004dff 66.66%, #750787 100%)";
const BG = "linear-gradient(135deg, #0c0d12 0%, #1b1020 55%, #221231 100%)";

export default async function Image({ params }: { params: { slug: string } }) {
  const fontData = await readFile(
    join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf"),
  );

  const item = await safeQuery(
    () => prisma.announcement.findUnique({ where: { slug: params.slug } }),
    null,
  );

  const title = item?.title ?? "Ur Gay Now";
  const snippet = (item?.excerpt ?? "").slice(0, 140);

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
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 84px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#d6abe0",
              fontSize: "26px",
              letterSpacing: "5px",
            }}
          >
            ANNOUNCEMENT
          </div>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: title.length > 40 ? "64px" : "84px",
              marginTop: "14px",
              lineHeight: 1.05,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          {snippet && (
            <div
              style={{
                display: "flex",
                color: "#cdd2dd",
                fontSize: "30px",
                marginTop: "22px",
                maxWidth: "900px",
                lineHeight: 1.3,
              }}
            >
              {snippet}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "30px" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "999px", backgroundColor: "#750787" }} />
            <div style={{ display: "flex", color: "#9aa2b4", fontSize: "26px" }}>urgaynow.com</div>
          </div>
        </div>
        <div style={{ height: "16px", width: "100%", backgroundImage: PRIDE_BAR }} />
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans", data: fontData, weight: 400, style: "normal" }],
    },
  );
}
