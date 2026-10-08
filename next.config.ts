import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow product and article images from any https host
    // (retailer CDNs, your own uploads, Unsplash, etc.)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
