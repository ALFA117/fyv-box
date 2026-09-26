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

export async function ogFonts() {
  const [serif, inter] = await Promise.all([loadGoogleFont("Playfair+Display", 700), loadGoogleFont("Inter", 500)]);
  const fonts: { name: string; data: ArrayBuffer; weight: 500 | 700; style: "normal" }[] = [];
  if (serif) fonts.push({ name: "Playfair Display", data: serif, weight: 700, style: "normal" });
  if (inter) fonts.push({ name: "Inter", data: inter, weight: 500, style: "normal" });
  return fonts;
}
