import type { NextConfig } from "next";

/**
 * Supabase-projektref för next/image (VÅG 81 A5 — mediebiblioteket).
 * Refen är publik i alla bild-URL:er ändå: läs ur NEXT_PUBLIC_SUPABASE_URL
 * när byggmiljön bär den (Vercel-bygget har env:n), annars fallback till den
 * kända ref:en. Endast https-hostnamn på formen <ref>.supabase.co accepteras
 * — remotePatterns får EXAKT en post, ALDRIG wildcards på hostname
 * (STYRELSE-VAG81-MEDIABIBLIOTEK.md §A5).
 */
function supabaseProjektRef(): string {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
    const m = /^([a-z0-9][a-z0-9-]{2,})\.supabase\.co$/.exec(host);
    if (m) return m[1];
  } catch {
    // Ogiltig/tom URL ⇒ fallback nedan.
  }
  return "aufrvmesyzsfsuhvlsbp";
}

const nextConfig: NextConfig = {
  /* Vercel handles output automatically — no standalone needed */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // VÅG 86 (KARTA §5, flytt-avvikelse #2): aktiverar src/app/global-not-found.js
  // som global 404 för HELT omatchade URL:er — nödvändigt med flera rot-layouter
  // ((huvud)/(en)/(ar)) där ingen gemensam rot-layout finns. Flaggnamn verifierat
  // mot installerad Next 16.3.2 (config-schema.js + config-shared.d.ts).
  experimental: {
    globalNotFound: true,
  },
  images: {
    // VÅG 81 A5: mediebibliotekets publika bucket — EXAKT en post, exakt
    // hostname + pathname, inga wildcards på host. Media-bilder är OVERRIDE
    // för enskilda bloggposter (omslagUrl/ogBild) — ALDRIG ersättning av de
    // build-genererade public/og/-bilderna (kontrakt AC4: ingen runtime-OG).
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${supabaseProjektRef()}.supabase.co`,
        pathname: "/storage/v1/object/public/media/**",
      },
    ],
  },
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
  // Vercel-bundla datafilerna som läses dynamiskt med readFileSync i routes —
  // Natives tracing följer inte alltid path.join(process.cwd(), ...) vid nya
  // filer (regimen saknades på prod 2026-09-04 tills dessa lades till).
  outputFileTracingIncludes: {
    "/api/forskningslage": [
      "./data/portfolj-system/korstabell-grund.json",
      "./data/portfolj-system/regime-logg.json",
    ],
    "/api/cron/vagvalidering": ["./data/portfolj-system/regime-logg.json"],
    "/api/cron/akm3-kalibrering": [
      "./data/portfolj-system/kalibrering-logg.json",
    ],
    "/api/cron/portfolj-uppfoljning": [
      "./data/portfolj-system/prediktionslogg-akm3.json",
    ],
    // G2-juridikpaketet (våg 66): DPA-mallen serveras som dokument av
    // /api/pro/dpa-mall — filen måste följa med i tracingen på prod.
    "/api/pro/dpa-mall": ["./data/forskning/B2B/DPA-MALL.md"],
  },
};

export default nextConfig;
