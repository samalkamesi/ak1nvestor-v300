import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles output automatically — no standalone needed */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      { source: "/mina-analyser", destination: "/min-sida", permanent: true },
      { source: "/diagnos", destination: "/profil", permanent: true },
    ];
  },
};

export default nextConfig;
