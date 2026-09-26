import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { ogFonts } from "@/lib/ogFonts";

export const alt = `${BRAND.name} — ${BRAND.tagline}. Simulacros gratuitos en Stellar testnet.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PILLS = [
  { label: "Phishing", color: BRAND.danger },
  { label: "Airdrops falsos", color: BRAND.amber },
  { label: "Ingeniería social", color: BRAND.info },
  { label: "Credencial verificable", color: BRAND.success },
];

export default async function OGImage() {
  const fonts = await ogFonts();
  const display = fonts.some((f) => f.name === "Syne") ? "Syne" : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.surface} 62%, ${BRAND.surface2} 100%)`,
          color: BRAND.cream,
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -180,
            top: -180,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(201,162,39,0.22) 0%, rgba(201,162,39,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontFamily: display, fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em" }}>
            <span>FYV</span>
            <span style={{ color: BRAND.gold, marginLeft: 12 }}>Box</span>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: BRAND.creamMuted }}>fyv-box.vercel.app</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: display,
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            <span>No caigas en&nbsp;</span>
            <span style={{ color: BRAND.gold }}>estafas crypto</span>
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 32, color: BRAND.creamMuted, lineHeight: 1.35 }}>
            Simulacros gratis en español sobre Stellar testnet. Practica sin arriesgar dinero.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {PILLS.map((p) => (
            <div
              key={p.label}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: `2px solid ${p.color}`,
                color: p.color,
                fontSize: 24,
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
