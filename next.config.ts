import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
