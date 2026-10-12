import { ImageResponse } from "next/og";
import { RIDGE_PATH } from "@/components/ridge-line";
import { hero, site } from "@/content/site";

export const alt = `${site.name}: ${hero.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#EDF1EF",
          color: "#1E3D32",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>{site.name}</div>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 120 }}>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            {hero.headline}
          </div>
          <div style={{ display: "flex", fontSize: 36, marginTop: 24, color: "#24302B" }}>{site.tagline}</div>
        </div>
        <svg
          width="1200"
          height="160"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, bottom: 0 }}
        >
          <path d={RIDGE_PATH} fill="none" stroke="#8FAE9C" strokeWidth="4" />
        </svg>
      </div>
    ),
    size,
  );
}
