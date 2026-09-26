import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt    = "FYV Box — Aprende a no caer en estafas crypto";
export const size   = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #0A1A33 0%, #11284D 60%, #162F58 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(201,162,39,0.12)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(80,140,255,0.07)",
            filter: "blur(60px)",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, zIndex: 1 }}>
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "rgba(201,162,39,0.15)",
                border: "1.5px solid rgba(201,162,39,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              🛡
            </div>
            <span
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#F5F1E6",
                letterSpacing: "-0.03em",
              }}
            >
              FYV<span style={{ color: "#C9A227" }}> Box</span>
            </span>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: 26,
              color: "#B8C2D6",
              textAlign: "center",
              maxWidth: 700,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Aprende a detectar estafas crypto con simulacros reales
          </p>

          {/* Pills */}
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            {[
              { label: "Phishing", color: "rgba(224,82,82,0.2)", border: "rgba(224,82,82,0.4)", text: "#E05252" },
              { label: "Ingeniería Social", color: "rgba(80,140,255,0.15)", border: "rgba(80,140,255,0.4)", text: "#60A5FA" },
              { label: "Activos Falsos", color: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "#F59E0B" },
              { label: "Credencial Stellar", color: "rgba(61,184,130,0.15)", border: "rgba(61,184,130,0.4)", text: "#3DB882" },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  background: p.color,
                  border: `1px solid ${p.border}`,
                  borderRadius: 999,
                  padding: "8px 18px",
                  fontSize: 16,
                  color: p.text,
                  fontWeight: 600,
                }}
              >
                {p.label}
              </div>
            ))}
          </div>

          {/* URL */}
          <p style={{ fontSize: 18, color: "rgba(184,194,214,0.5)", margin: 0, marginTop: 8 }}>
            fyv-box.vercel.app
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
