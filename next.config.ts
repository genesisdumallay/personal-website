import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://edith.feutech.edu.ph/briefcase/profile/genesisdumallay",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
