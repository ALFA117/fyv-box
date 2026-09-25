import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stellar SDK uses Node.js crypto — keep it out of the browser bundle
  serverExternalPackages: ["@stellar/stellar-sdk"],
};

export default nextConfig;
