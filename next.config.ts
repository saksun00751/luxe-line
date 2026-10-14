import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // LINE in-app browser + LIFF: allow embedding only from LINE if you later use LIFF "tall/compact" views
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "6mb" }, // slip upload
  },
};

export default nextConfig;
