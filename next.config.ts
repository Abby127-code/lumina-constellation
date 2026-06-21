import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // For Capacitor static export (mobile apps), switch to:
  // output: "export",
  // images: { unoptimized: true },
  // trailingSlash: true,
};

export default nextConfig;
