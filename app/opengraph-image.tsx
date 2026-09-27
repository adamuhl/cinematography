import { ImageResponse } from "next/og";

export const alt = "Adam Uhl — Cinematographer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#050505",
          color: "#f1f1ed",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          letterSpacing: "0.13em",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 70 }}>ADAM UHL</div>
        <div style={{ color: "#aaa9a4", fontSize: 25, marginTop: 24 }}>DIRECTOR OF PHOTOGRAPHY</div>
      </div>
    ),
    size,
  );
}
