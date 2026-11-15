// Raw brand values for contexts that can't read CSS variables (OG images,
// web manifest, <meta name="theme-color">). Keep in sync with globals.css.
export const BRAND = {
  name: "FYV Box",
  tagline: "Aprende a no caer en estafas crypto",
  description:
    "Simulador gratuito de estafas crypto en español: practica con phishing, airdrops falsos, ingeniería social y firmas peligrosas en Stellar testnet, sin arriesgar dinero, y obtén una credencial verificable.",
  navy: "#0B111D",
  surface: "#111927",
  surface2: "#172131",
  gold: "#D0A63A",
  goldHover: "#DFBA5A",
  cream: "#ECE9E1",
  creamMuted: "#A7AFBE",
  lightBg: "#F5F3EE",
  danger: "#E46A62",
  amber: "#E2A746",
  info: "#86A8D6",
  success: "#4FB68B",
} as const;

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "https://fyv-box.vercel.app";
}
