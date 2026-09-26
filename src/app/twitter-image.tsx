import OGImage from "./opengraph-image";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name} — ${BRAND.tagline}. Simulacros gratuitos en Stellar testnet.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return OGImage();
}
