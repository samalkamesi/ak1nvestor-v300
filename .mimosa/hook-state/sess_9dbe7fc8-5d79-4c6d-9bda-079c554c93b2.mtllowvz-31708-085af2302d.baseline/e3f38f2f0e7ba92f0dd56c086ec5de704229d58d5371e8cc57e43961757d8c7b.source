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
      // Gamla ytliga villkorssidan → komplett /villkor (2026-09-01).
      { source: "/terms", destination: "/villkor", permanent: true },
      // Gamla å/ä/ö-kursslugar → ASCII-slug:arna (url-scan-2026-09-03).
      // Källorna är percent-encodade (ö=%C3%B6 ä=%C3%A4 å=%C3%A5) eftersom
      // produktion/Next URL-encodar diakriterna i inkommande begäran.
      {
        source: "/kurser/v01-f%C3%B6rs%C3%A4ljningstillv%C3%A4xt",
        destination: "/kurser/v01-forsaljningstillvaxt",
        permanent: true,
      },
      {
        source: "/kurser/v02-arr-tillv%C3%A4xt",
        destination: "/kurser/v02-arr-tillvaxt",
        permanent: true,
      },
      {
        source: "/kurser/km-054-r%C3%A4nta",
        destination: "/kurser/km-054-ranta",
        permanent: true,
      },
      {
        source: "/kurser/ts-16-stod-och-motst%C3%A5nd",
        destination: "/kurser/ts-16-stod-och-motstand",
        permanent: true,
      },
      {
        source: "/kurser/mk-01-bnp-och-tillv%C3%A4xt",
        destination: "/kurser/mk-01-bnp-och-tillvaxt",
        permanent: true,
      },
      {
        source: "/kurser/konfluens-v%C3%A4rde-moter-v%C3%A5gor",
        destination: "/kurser/konfluens-varde-moter-vagor",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
