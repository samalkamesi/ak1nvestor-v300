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
  // O108 (vakt-s8, 2026-09-20): typkontrollen i BYGGET är PÅ — baslinjen
  // (tsc 0 sedan våg 133) är next builds eget villkor, inte bara pre-commit-
  // och patch-köns (o106). Tidigare ignoreBuildErrors=true
  // lämnade kod-vägen (git pull → npm ci → next build) typblind: sista
  // försvarslinjen fanns inte om typerna bröts utanför de grindarna
  // (låsfilsingrepp, cache-träd, framtida leveransvägar). tsconfig inkluderar
  // .next/types/**/*.ts ⇒ projektbinärens tsc --noEmit typar samma
  // route-kontrakt som bygget — grönt här är grönt där.
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  // VÅG 96 D1 (prestanda våg 3): skickar inte X-Powered-By: Next.js —
  // ett par header-bytes mindre per svar + mindre fingeravtryck av servern.
  poweredByHeader: false,
  // VÅG 105 (gränsnittsvakt-paketet): BYGGESTÄMPEL — inlinas i klientbunten
  // vid byggstart OCH läsas av /api/version på servern vid körning. En flik
  // som lever kvar efter deploy (SPA-skal utan omladdning) upptäcker
  // stämpel-skillnaden via VersionVakten och erbjuder uppdatering —
  // kundens "samma fel igen"-klass (stala assets) dör vid roten.
  env: {
    NEXT_PUBLIC_BYGGE: new Date().toISOString(),
  },
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
  // VÅG s7 (prestanda spår 7, o8 §4 GUL): /deep-courses.json är 17,5 MB och
  // hämtas på klientens väg ENBART som fallback när /sok-index.json (76 kB)
  // misslyckas (käll-loopen i sokindex.ts). Default för public/-filer är
  // "public, max-age=0" — dvs. om fallet inträffar omvalideras hela 17,5 MB
  // vid VARJE hämtning. 1 h fönster + swr-dag = samma stabil-hybrid som
  // sok-index.json (max-age=3600); innehållet byts först vid kurs-deploy.
  async headers() {
    return [
      {
        source: "/deep-courses.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // VÅG s7 o66 (cache rond 3 — public/-assets): Next-default för public/ är
      // "public, max-age=0" = noll browsercache. Drabbat enligt HEAD-sond
      // 2026-09-18: favicon.svg + PWA-ikoner (ikon-192/512 via manifest.json),
      // varumärkesfilerna i /ak1a/logo/, og/-socialbilderna (8,1 MB — hämtas av
      // delnings-botar vid varje omdelning) och llms-full.txt (294 kB, AI-botar).
      // o10/o13 täckte HTML-vägar + data-json — public/-assets var okartlagt.
      // Ikoner/logotyper byts endast vid designdeploy: 1 d + swr 1 vecka är
      // försiktigt (swr-fönstret täcker övergången vid byte, etag kvarstår).
      {
        source: "/ak1a/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      // og/-bilderna är per-slug innehållsstabila (build-genererade, kontrakt
      // AC4): sociala botar och delningspreview får veckocache + swr-dag.
      {
        source: "/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      // manifest.json (PWA) och llms-full.txt (AI-crawler-text) kan evolvera
      // vid deploy: samma 1 h + swr-dag-hybrid som deep-courses.json ovan.
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/llms-full.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
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
      // Våg 194 (brandgenomgången P1): /pris och /kontakt är naturliga
      // besöksvägar men gav 404 (aldrig egna sidor). Priserna bor på
      // /medlemskap; kontaktuppgifterna i om-oss kontakt-sektion
      // (id="kontakt" tillagt samma våg — scroll-mt enligt #fas2-mönstret).
      { source: "/pris", destination: "/medlemskap", permanent: true },
      { source: "/kontakt", destination: "/om-oss#kontakt", permanent: true },
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
    // VÅG 80c (utvecklingspanelen): worklog.md parsas med readFileSync i
    // /api/admin/utveckling — roten följs inte alltid med i tracingen på
    // Vercel, så filen inkluderas explicit (samma mönster som data/-filerna).
    "/api/admin/utveckling": ["./worklog.md"],
  },
};

export default nextConfig;
