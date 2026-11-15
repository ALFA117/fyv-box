// Loads TrueType fonts for next/og at build time. Google Fonts serves TTF to
// non-browser clients; if the network is unavailable the image falls back to
// the renderer's default font instead of failing the build.
async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, { cache: "force-cache" })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url, { cache: "force-cache" });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Same families as the site: Source Serif 4 (display), IBM Plex Sans (body), IBM Plex Mono (labels). */
export const OG_SERIF = "Source Serif 4";
export const OG_SANS = "IBM Plex Sans";
export const OG_MONO = "IBM Plex Mono";

export async function ogFonts() {
  const [serif, sans, mono] = await Promise.all([
    loadGoogleFont("Source+Serif+4", 600),
    loadGoogleFont("IBM+Plex+Sans", 500),
    loadGoogleFont("IBM+Plex+Mono", 500),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 500 | 600; style: "normal" }[] = [];
  if (serif) fonts.push({ name: OG_SERIF, data: serif, weight: 600, style: "normal" });
  if (sans) fonts.push({ name: OG_SANS, data: sans, weight: 500, style: "normal" });
  if (mono) fonts.push({ name: OG_MONO, data: mono, weight: 500, style: "normal" });
  return fonts;
}
