import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const alt = "Ur Gay Now — VRChat LGBTQ+ Community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0c0d12",
          backgroundImage: "linear-gradient(135deg, #0c0d12 0%, #1b1020 55%, #221231 100%)",
          color: "#ffffff",
          gap: "32px",
        }}
      >
        {/* Pride bar top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", backgroundImage: "linear-gradient(90deg, #e40303 0%, #ff8c00 16.66%, #ffed00 33.33%, #008026 50%, #004dff 66.66%, #750787 100%)" }} />
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "200px", height: "200px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(189,127,206,0.3) 0%, rgba(117,7,135,0.2) 100%)", border: "3px solid rgba(189,127,206,0.4)" }}>
          <span style={{ fontSize: "64px", fontWeight: "bold", color: "#ffffff" }}>UGN</span>
        </div>
        
        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "80px", fontWeight: "bold", color: "#ffffff" }}>Ur Gay Now</span>
          <span style={{ fontSize: "28px", color: "#d6abe0", letterSpacing: "4px" }}>VRCHAT · LGBTQ+ COMMUNITY</span>
          <span style={{ fontSize: "24px", color: "#9aa2b4" }}>Events · Daily Games · Community · Friends</span>
        </div>
        
        {/* URL */}
        <div style={{ display: "flex", padding: "12px 24px", borderRadius: "12px", background: "rgba(117,7,135,0.2)", border: "1px solid rgba(189,127,206,0.3)" }}>
          <span style={{ fontSize: "24px", color: "#a256bb" }}>urgaynow.com</span>
        </div>
        
        {/* Pride bar bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "8px", backgroundImage: "linear-gradient(90deg, #e40303 0%, #ff8c00 16.66%, #ffed00 33.33%, #008026 50%, #004dff 66.66%, #750787 100%)" }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
