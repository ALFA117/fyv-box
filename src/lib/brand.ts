// Raw brand values for contexts that can't read CSS variables (OG images,
// web manifest, <meta name="theme-color">). Keep in sync with globals.css.
export const BRAND = {
  name: "FYV Box",
  tagline: "Aprende a no caer en estafas crypto",
  description:
    "Simulador gratuito de estafas crypto en español: practica con phishing, airdrops falsos, ingeniería social y firmas peligrosas en Stellar testnet, sin arriesgar dinero, y obtén una credencial verificable.",
  navy: "#0A1A33",
  surface: "#11284D",
  surface2: "#162F58",
  gold: "#C9A227",
  goldHover: "#E0C35A",
  cream: "#F5F1E6",
  creamMuted: "#B8C2D6",
  lightBg: "#F3F0E7",
  danger: "#EF6363",
  amber: "#F5A524",
  info: "#6BA4F8",
  success: "#3DB882",
} as const;

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "https://fyv-box.vercel.app";
}
