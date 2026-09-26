import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stellar SDK uses Node.js crypto — keep it out of the browser bundle
  serverExternalPackages: ["@stellar/stellar-sdk"],
  // Allows a second local dev server (e.g. a preview) without clashing with .next's lock
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
