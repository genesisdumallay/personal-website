import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  async redirects() {
    return [
      {
        source: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
