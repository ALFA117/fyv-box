import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { ogFonts, OG_MONO, OG_SANS, OG_SERIF } from "@/lib/ogFonts";

export const alt = `${BRAND.name} — ${BRAND.tagline}. Simulacros gratuitos en Stellar testnet.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TOPICS = ["Phishing", "Airdrops falsos", "Ingeniería social", "Firmas peligrosas"];
const LINE = "rgba(236,233,225,0.14)";

export default async function OGImage() {
  const fonts = await ogFonts();
  const has = (n: string) => fonts.some((f) => f.name === n);
  const serif = has(OG_SERIF) ? OG_SERIF : undefined;
  const sans = has(OG_SANS) ? OG_SANS : undefined;
  const mono = has(OG_MONO) ? OG_MONO : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: BRAND.navy,
          color: BRAND.cream,
          fontFamily: sans,
          borderTop: `8px solid ${BRAND.gold}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontFamily: serif, fontSize: 44, fontWeight: 600 }}>
            <span>FYV</span>
            <span style={{ color: BRAND.gold, marginLeft: 10 }}>Box</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: mono,
              fontSize: 22,
              color: BRAND.amber,
              border: `2px solid ${BRAND.amber}`,
              borderRadius: 4,
              padding: "6px 14px",
            }}
          >
            Simulador · Stellar testnet · sin dinero real
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontFamily: serif, fontSize: 88, fontWeight: 600, lineHeight: 1.04 }}>
            <span>No caigas en&nbsp;</span>
            <span style={{ color: BRAND.gold }}>estafas crypto.</span>
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: BRAND.creamMuted, lineHeight: 1.4, maxWidth: 900 }}>
            Simulacros gratis en español. Practica sin arriesgar dinero y obtén una credencial verificable.
          </div>
        </div>

        <div style={{ display: "flex", borderTop: `1px solid ${LINE}`, paddingTop: 24 }}>
          {TOPICS.map((t, i) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontFamily: mono,
                fontSize: 22,
                color: BRAND.creamMuted,
                paddingLeft: i === 0 ? 0 : 24,
                paddingRight: 24,
                borderLeft: i === 0 ? "none" : `1px solid ${LINE}`,
              }}
            >
              <span style={{ color: BRAND.gold }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ marginLeft: 12 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
