import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { ogFonts } from "@/lib/ogFonts";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const fonts = (await ogFonts()).filter((f) => f.name === "Syne");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.navy,
          fontFamily: fonts.length ? "Syne" : undefined,
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: BRAND.cream,
        }}
      >
        FYV
        <span style={{ color: BRAND.gold }}>.</span>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
