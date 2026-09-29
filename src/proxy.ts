import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import fs from "node:fs";
import path from "node:path";
import {
  hashIp,
  klassificeraRequest,
  klassificeraUa,
  loggaSakerhetEvent,
  sannyaPath,
  sannyaUa,
  sannyaRefHost,
  trafikRad,
  utvinnIp,
  skrivTrafikBatch,
  type UaKlass,
} from "@/lib/sakerhet";
// Våg 83 B (SPEGLAR404): destillerad slug-lista — se blocket i slutet av filen.
import speglarSlugar from "../public/speglar-slugar.json";

/**
 * PROXY (v188, f.d. middleware) — trafikvakten per request (ALDRIG försenande).
 * Next 16:s konvention: filen proxy.ts + named export `proxy`; körs sedan
 * namnbytet på Node-runtime (ej längre edge) — kodens API:er är gemensamma.
 *
 * Tre jobb, alla med hårda budgetar:
 *   1. DNA-BLOCKERING: kända scanner-sökvägar (.env, wp-admin, phpmyadmin,
 *      .git …) → omedelbar 403 + loggning (type=sakerhet) via
 *      event.waitUntil — skrivningen får ALDRIG hålla svaret värt.
 *      Upprepade hot från samma IP-hash (≥3 inom 10 min, per instans) →
 *      429 för allt från hashen.
 *   2. FREKSENSVAKT: tom/felaktig UA + >30 förfrågningar/10 s (eller
 *      normal UA >150/10 s) från samma IP-hash → 429 + loggning.
 *      In-memory per instans — räcker enligt direktiv.
 *   3. KLASS-MÄRKNING: varje svar får x-ak1a-klass + Server-Timing
 *      ( PerformanceNavigationTiming.serverTiming — så TrafikRapportören
 *      kan läsa serverns UA-klass efter hydrering).
 *
 * TRAFIK-MÄTNING AV BOTAR: bot-UA:er kör sällan JS, så klientvägen ser dem
 * aldrig — proxyn loggar istället bot-sidvisningar (GET, ej /api) till
 * system_events (type=trafik) med 10-minuters dedupe per (klass+path),
 * minnesbunden 300 nycklar. Mänsklig trafik loggas av TrafikRapportören
 * via POST /api/trafik (30 % stickprov + alltid unika sessioner).
 *
 * GDPR: IP hashas (SHA-256 + salt) FÖRE minnet; sökväg trunkerad 120,
 * UA 120, query ALDRIG med. Se /transparens.
 */

export const config = {
  matcher: [
    // Allt utom statiska tillgångar och Next-interna — scannrar syns också.
    // FiländelsernaEscape:as ([^/]+\.(svg|png|…)$) — ogiltiga mönster kastar
    // vid uppstart, därför testas dev-servern efter varje ändring här.
    "/((?!_next/static|_next/image|favicon.ico|ak1a/|manifest.json|robots.txt|sitemap.xml|llms.txt|[^/]+\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|map|woff2?|ttf|otf)$).*)",
  ],
};

// ── In-memory tillstånd (per instans; brandgillar) ──────────────────────────

const FLOD_FONSTER_MS = 10_000;
const FLOD_TROSHEL_BOT = 30; // bot/okänd UA: förfrågningar per fönster
const FLOD_TROSHEL_NORMAL = 150; // normal UA (API-klienter, preloaders)
const HOT_UTESLUT_GRANS = 3; // hot-blockeringar innan hel uteslutning
const HOT_UTESLUT_MS = 10 * 60_000;

/** ipHash → senaste förfrågningstider (glidande 10 s-fönster). */
const flod = new Map<string, number[]>();
/** ipHash → antal hot-blockeringar + senaste tidpunkt + eskaleringslogg. */
const hotRäknare = new Map<string, { n: number; sist: number; uteslutenLoggad: boolean }>();
/** Bot-dedupe: "klass:path" → senaste loggning. */
const botDedupe = new Map<string, number>();
/** Logg-throttle: ipHash → senaste LOGGADE hot-/flod-raden (skriv-DOS-skydd). */
const loggThrottle = new Map<string, number>();

/** Högst 1 hot-logg/sekund per hash — blockeringen slår alltid, raden sällan. */
const HOT_LOGG_MIN_MS = 1_000;
/** Högst 1 flod-logg per 10:e sekund per hash. */
const FLOD_LOGG_MIN_MS = 10_000;

function farLogga(ipHash: string, minMs: number, nu: number): boolean {
  const sist = loggThrottle.get(ipHash + ":" + minMs) ?? 0;
  if (nu - sist < minMs) return false;
  loggThrottle.set(ipHash + ":" + minMs, nu);
  if (loggThrottle.size > 6000) {
    for (const [k, t] of loggThrottle) {
      if (nu - t > FLOD_LOGG_MIN_MS * 2) loggThrottle.delete(k);
      if (loggThrottle.size <= 3000) break;
    }
  }
  return true;
}

function stadaMinne(nu: number): void {
  if (flod.size > 5000) {
    for (const [k, ts] of flod) {
      if (!ts.length || nu - ts[ts.length - 1] > FLOD_FONSTER_MS) flod.delete(k);
      if (flod.size <= 2500) break;
    }
  }
  if (hotRäknare.size > 2000) {
    for (const [k, v] of hotRäknare) {
      if (nu - v.sist > HOT_UTESLUT_MS) hotRäknare.delete(k);
      if (hotRäknare.size <= 1000) break;
    }
  }
  if (botDedupe.size > 300) {
    for (const [k, t] of botDedupe) {
      if (nu - t > 10 * 60_000) botDedupe.delete(k);
      if (botDedupe.size <= 150) break;
    }
  }
}

function registreraFlod(ipHash: string, nu: number): number {
  const ts = (flod.get(ipHash) ?? []).filter((t) => nu - t < FLOD_FONSTER_MS);
  ts.push(nu);
  flod.set(ipHash, ts);
  return ts.length;
}

// ── Proxy (v188: named export = filnamnet, Next 16-kontraktet) ────────────────

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  const nu = Date.now();
  stadaMinne(nu);

  const path = sannyaPath(req.nextUrl.pathname);
  const ua = sannyaUa(req.headers.get("user-agent"));
  const ip = utvinnIp(req);
  const ipHash = await hashIp(ip);
  // VÅG 105: loopback = serverns egna vårdnadskällor (gränsnittsvakten,
  // ISR-värmaren, crons via localhost) — frekvensvakten ska aldrig 429:a dem.
  // DNA-blockeringen och övriga grenar berörs ej (loopback når aldrig dem).
  const arLokal = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";

  // 1) DNA-blockering: kända scanner-mönster → 403.
  const { klass, monster } = klassificeraRequest(path, ua);
  const uaKlass: UaKlass = klassificeraUa(ua);
  if (klass === "hot") {
    const gammal = hotRäknare.get(ipHash);
    // Fönstret gått ut → börja om räkningen (tillbaka till 403-läge).
    const r =
      gammal && nu - gammal.sist < HOT_UTESLUT_MS
        ? gammal
        : { n: 0, sist: nu, uteslutenLoggad: false };
    r.n += 1;
    r.sist = nu;
    hotRäknare.set(ipHash, r);
    if (farLogga(ipHash, HOT_LOGG_MIN_MS, nu)) {
      event.waitUntil(
        loggaSakerhetEvent({ klass: "hot", http: 403, path, ipHash, ua, monster }).then(() => undefined)
      );
    }
    return new NextResponse(
      JSON.stringify({ error: "Förbjuden sökväg." }),
      {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8", "x-ak1a-klass": "hot", "Cache-Control": "no-store" },
      }
    );
  }

  // Upprepade hot (≥3 inom fönstret) → uteslutning. Skyddar människor bakom
  // delad NAT: normala webbläsar-UA:n passerar fortfarande — uteslutningen
  // träffar endast hot-, bot- och okända-UA-förfrågningar från hashen.
  const hot = hotRäknare.get(ipHash);
  if (hot && hot.n >= HOT_UTESLUT_GRANS && nu - hot.sist < HOT_UTESLUT_MS) {
    if (uaKlass === "bot" || uaKlass === "okand") {
      if (!hot.uteslutenLoggad) {
        hot.uteslutenLoggad = true; // loggflod-skydd: eskaleringen loggas EN gång
        event.waitUntil(
          loggaSakerhetEvent({ klass: "hot", http: 429, path, ipHash, ua, monster: `uteslutning ${HOT_UTESLUT_MS / 60_000} min` }).then(() => undefined)
        );
      }
      return new NextResponse(JSON.stringify({ error: "För många förfrågningar." }), {
        status: 429,
        headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "600", "x-ak1a-klass": "utesluten", "Cache-Control": "no-store" },
      });
    }
  }

  // 2) Frekvensvakten: sekvens i glidande fönster per IP-hash.
  const antal = arLokal ? 0 : registreraFlod(ipHash, nu);
  const troskel = uaKlass === "dator" || uaKlass === "mobil" ? FLOD_TROSHEL_NORMAL : FLOD_TROSHEL_BOT;
  if (antal > troskel) {
    if (farLogga(ipHash, FLOD_LOGG_MIN_MS, nu)) {
      event.waitUntil(
        loggaSakerhetEvent({
          klass: uaKlass === "bot" || uaKlass === "okand" ? "misstankt" : "flod",
          http: 429,
          path,
          ipHash,
          ua,
          monster: `${antal} på ${FLOD_FONSTER_MS / 1000} s`,
        }).then(() => undefined)
      );
    }
    return new NextResponse(JSON.stringify({ error: "För många förfrågningar." }), {
      status: 429,
      headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "60", "x-ak1a-klass": "flod", "Cache-Control": "no-store" },
    });
  }

  // 3) Bot-sidvisningar (GET på sidor, ej API): logga med dedupe — bot-andel
  //    utan att dränka tabellen. Mänsklig trafik loggas via klientvägen.
  if (uaKlass === "bot" && (req.method === "GET" || req.method === "HEAD") && !path.startsWith("/api/")) {
    const nyckel = `${uaKlass}:${path}`;
    const sist = botDedupe.get(nyckel);
    if (sist === undefined || nu - sist > 10 * 60_000) {
      botDedupe.set(nyckel, nu);
      const dag = new Date().toISOString().slice(0, 10);
      event.waitUntil(
        skrivTrafikBatch([
          trafikRad({
            dag,
            path,
            refHost: sannyaRefHost(req.headers.get("referer")),
            uaKlass,
            sprak: (req.headers.get("accept-language") || "").slice(0, 8) || null,
            land: null,
            sessionHash: null,
            puls: false,
            urval: "bot",
          }),
        ]).then(() => undefined)
      );
    }
  }

  // 4) SPEGLAR-404 (våg 83 B): ogiltiga spegel-slugar ⇒ äkta 404 FÖRE
  //    routern (soft-404-fällan: speglarnas [slug]-router svarar 200-skal).
  //    Ren tilläggslogik — ingen trafik-/säkerhetsgren ovan påverkas.
  //    Källkod: blocket "SPEGLAR-404" i slutet av filen (inga fetchar,
  //    ingen ny loggning — P6).
  const spegel404 = speglar404Svar(req.nextUrl.pathname, klass === "ok" ? uaKlass : klass);
  if (spegel404) return spegel404;

  // 5) FRAMTIDS-404 (r339, v211:permanent): schemalagda blogginlägg ⇒ äkta
  //    404 FÖRE routern FÖRE publiceringsdagen. Roten: Next 16 skriver inte
  //    status i .meta för notFound-via-generateStaticParams (soft-200) och
  //    ISR-omrenderingar skriver OM .meta till 200 (r336-sondens dom) —
  //    .meta-märkning (postbuild + cron-vakt) är hygien; DETTA är barriären.
  //    Datafil-driven: läser data/blogg/*.json från disk (Node-runtime),
  //    60 s-cache — nya schemalagda inlägg syns utan bygg; publiceringsdagen
  //    lämnar slugen mängden inom 60 s och S2-autopubliceringen (ISR) tar
  //    över. Fail-open: läs-fel ⇒ passera (cron-vakten bär kvar).
  const framtids404 = framtids404Svar(req.nextUrl.pathname, klass === "ok" ? uaKlass : klass);
  if (framtids404) return framtids404;

  // Passera med klass-märkning (Server-Timing är läsbar av klient-JS).
  const res = NextResponse.next();
  res.headers.set("x-ak1a-klass", klass === "ok" ? uaKlass : klass);
  res.headers.set("Server-Timing", `ak1a;desc="${klass === "ok" ? uaKlass : klass}"`);
  return res;
}

// ── SPEGLAR-404 (våg 83 B, STYRELSE-VAG83-ROLLER DEL B — alt C ur P2) ────────
//
// Speglarnas [slug]-sidor (/en|/ar/kurser/[slug], /en|/ar/blogg/[slug]) har
// dynamicParams=true + force-static: okänd slug renderar 404-UI i ett 200-skal
// (soft-404). Detta block validerar slugen mot en destillerad lista och svarar
// ÄKTA 404 FÖRE routern. Regler:
//   • ENDAST exakt ett segment efter prefixet — djupare sökvägar, listsidorna
//     (/en/kurser …), svenska originalen (/kurser/…) och allt annat orörda.
//   • Slug = [a-z0-9-]+ (minnets regel, ren ASCII) — ogiltigt tecken ⇒ 404
//     direkt (ingen normalisering, ingen gissning).
//   • Slugar läses EN gång per kall start (module-scope Set ur JSON-importen;
//     verktyg/kor-speglar-slugar.mjs genererar filen efter kurs-/bloggändring).
//   • ALDRIG nät (ingen fetch), aldrig loggning av ny data (P6), aldrig
//     blockering av giltiga sidor: tom/garper lista = fail-open (då gäller
//     status quo före våg 83 — skyddet viker, aldrig sajten).
// Bunt-påverkan: speglar-slugar.json ~10 kB buntas in i edge-modulen (tak 40 kB).

/** Slug-listor — byggs en gång per kall start ur den genererade JSON-filen. */
const KURS_SLUGAR = new Set(
  (Array.isArray(speglarSlugar?.kurser) ? speglarSlugar.kurser : []).filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  ),
);
const BLOGG_SLUGAR = new Set(
  (Array.isArray(speglarSlugar?.blogg) ? speglarSlugar.blogg : []).filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  ),
);

/** Spegel-detaljsidor: exakt /{en|ar}/{kurser|blogg}/{ett-segment}. */
const SPEGLAR_PATH_MONSTER = /^\/(en|ar)\/(kurser|blogg)\/([^/]+)$/;
/** Minnets slug-regel (ren ASCII — åäö och versaler är ogiltiga). */
const SPEGLAR_SLUG_MONSTER = /^[a-z0-9-]+$/;

/** 404-sidans texter per spegelspråk (hårdkodade — EN på /en, AR/rtl på /ar). */
const SPEGLAR_404_TEXTER = {
  en: {
    htmlLang: "en",
    dir: "ltr",
    title: "Page not found (404) | AK1A Research Lab",
    etikett: "AK1A Research Lab · Navigation error",
    rubrik: "Page not found",
    text: "Even analysts take wrong turns sometimes — the page you are looking for has moved or never existed. Let us guide you back.",
    kurserLank: "Browse all courses",
    bloggLank: "Browse the blog",
    hem: "Start page",
    footer: "AK1A Research Lab · Educational finance research — not investment advice",
  },
  ar: {
    htmlLang: "ar",
    dir: "rtl",
    title: "الصفحة غير موجودة (404) | AK1A Research Lab",
    etikett: "AK1A Research Lab · خطأ في التنقّل",
    rubrik: "الصفحة غير موجودة",
    text: "حتى المحللين يخطئون أحيانًا — الصفحة التي تبحث عنها انتقلت أو لم توجد قط. دعنا نعيدك إلى المسار الصحيح.",
    kurserLank: "استعرض جميع الدورات",
    bloggLank: "استعرض المدونة",
    hem: "الصفحة الرئيسية",
    footer: "AK1A Research Lab · أبحاث مالية تعليمية — ليست نصيحة استثمارية",
  },
} as const;

/** Enkel marin 404-sida i svenska originalets ton (navy/guld/creme, serif) — INLINE, inga resurser. */
function speglar404Sida(lang: "en" | "ar", typ: "kurser" | "blogg"): string {
  const t = SPEGLAR_404_TEXTER[lang];
  const lista = `/${lang}/${typ}`;
  const listaText = typ === "kurser" ? t.kurserLank : t.bloggLank;
  return `<!doctype html>
<html lang="${t.htmlLang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${t.title}</title>
<style>
:root{color-scheme:dark}
body{margin:0;font-family:Georgia,"Times New Roman",serif;background:#0b1321;color:#EDE6D6;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
main{background:#0E1B2E;border:1px solid rgba(232,199,102,.35);border-radius:16px;max-width:560px;width:100%;padding:44px 32px;text-align:center}
.etikett{font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,199,102,.85);margin:0}
.kod{font-size:72px;font-weight:700;color:#E8C766;line-height:1;margin:20px 0 0}
h1{font-size:24px;margin:12px 0 0}
.brod{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:rgba(237,230,214,.8);margin:12px auto 0;max-width:420px}
nav{margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
a{display:inline-block;padding:12px 20px;border:1px solid #E8C766;border-radius:8px;color:#E8C766;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px}
a:hover{background:rgba(232,199,102,.12)}
footer{margin-top:28px;padding-top:16px;border-top:1px solid rgba(232,199,102,.3);font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(237,230,214,.55)}
</style>
</head>
<body>
<main>
<p class="etikett">${t.etikett}</p>
<p class="kod" aria-hidden="true">404</p>
<h1>${t.rubrik}</h1>
<p class="brod">${t.text}</p>
<nav><a href="${lista}">${listaText}</a><a href="/${lang}">${t.hem}</a></nav>
<footer>${t.footer}</footer>
</main>
</body>
</html>`;
}

/**
 * Ren lookup: returnerar en 404-Response för ogiltiga spegel-slugar, null om
 * förfrågan ska passera oförändrad (äkta slug, ej spegel-sökväg, fail-open).
 */
function speglar404Svar(pathname: string, klass: string): Response | null {
  const m = SPEGLAR_PATH_MONSTER.exec(pathname);
  if (!m) return null; // Ej en spegel-detaljsida — helt orörd trafik.
  // Monstersäker avtypning: regexen fångar ENBART (en|ar)/(kurser|blogg).
  const lang = m[1] as "en" | "ar";
  const typ = m[2] as "kurser" | "blogg";
  const slug = m[3];
  const slugar = typ === "kurser" ? KURS_SLUGAR : BLOGG_SLUGAR;
  if (slugar.size === 0) return null; // Fail-open: trasig/genererad-lista saknas ⇒ status quo.
  if (SPEGLAR_SLUG_MONSTER.test(slug) && slugar.has(slug)) return null; // Äkta slug ⇒ routern.
  return new Response(speglar404Sida(lang, typ), {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "x-ak1a-klass": klass,
      "Server-Timing": `ak1a;desc="${klass}"`,
    },
  });
}

// ── FRAMTIDS-404 (r339, v211:permanent — svenska originalens blogg) ───────────
//
// Schemalagda inlägg (data/blogg/*.json med publishedAt i framtiden) skall
// vara OSYNLIGA till publiceringsdagen (SÄLJ-KARTA A2/S2). Statuskodsläckan
// (soft-404) belagd i tre lager: Next 16 skriver ingen .meta-status för
// notFound-via-generateStaticParams (r327/r332), ISR-omrenderingar skriver
// om .meta till 200 (r336-sonden), och .meta respekteras bara utan färsk
// cache (r338). Denna gren svarar ÄKTA 404 FÖRE routern — omrenderings-,
// cache- och kallstartsokänslig. Datumreglerna ÄR content.ts:s kontrakt:
// ISO YYYY-MM-DD, lexikal jämförelse, Europe/Stockholm (dagens datum
// inkluderas). Regler:
//   • ENDAST exakt /blogg/<ett-segment> — listsidor, RSS, API orörda.
//   • data/blogg läses från disk med 60 s mtime-cache (datafil-driven:
//     nya schemalagda inlägg + publiceringsdagssläpp UTAN bygg).
//   • Fail-open vid varje läs-/parsefel (då bär .meta-cron-vakten kvar).
//   • Ogiltigt publishedAt-format ⇒ INTE i mängden (fail-open — S2:s
//     fail-closed-rendering döljer innehållet ändå; här styrs bara status).

/** Dagens datum YYYY-MM-DD i svensk tidszon — content.ts bloggDagensDatum(). */
function framtidsDagensDatum(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "short" }).format(new Date());
}

/** Cache: { slug: publishedAt } för framtidsdiskreta inlägg + läs-tidpunkt. */
let FRAMTIDA_CACHE: { last: number; slugar: Map<string, string> } | null = null;
const FRAMTIDA_CACHE_MS = 60_000;

function lasFramtidaBloggSlugar(): Map<string, string> {
  if (FRAMTIDA_CACHE && Date.now() - FRAMTIDA_CACHE.last < FRAMTIDA_CACHE_MS) {
    return FRAMTIDA_CACHE.slugar;
  }
  const slugar = new Map<string, string>();
  try {
    const dir = path.join(process.cwd(), "data", "blogg");
    const idag = framtidsDagensDatum();
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const post = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as {
          slug?: unknown;
          publishedAt?: unknown;
        };
        if (typeof post.slug !== "string" || typeof post.publishedAt !== "string") continue;
        const d = post.publishedAt.slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d > idag) slugar.set(post.slug, d);
      } catch {
        /* ogiltig json-fil — content.ts:s klass, inte vår */
      }
    }
  } catch {
    return FRAMTIDA_CACHE?.slugar ?? new Map<string, string>(); // fail-open
  }
  FRAMTIDA_CACHE = { last: Date.now(), slugar };
  return slugar;
}

/** Svenska bloggens detaljsida: exakt /blogg/{ett-segment}. */
const FRAMTIDS_PATH_MONSTER = /^\/blogg\/([^/]+)$/;

/** 404-sida i svenska originalets ton (syskon till speglarnas — sv/ltR). */
function framtids404Sida(): string {
  return `<!doctype html>
<html lang="sv" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sidan hittades inte (404) | AK1A Research Lab</title>
<style>
:root{color-scheme:dark}
body{margin:0;font-family:Georgia,"Times New Roman",serif;background:#0b1321;color:#EDE6D6;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
main{background:#0E1B2E;border:1px solid rgba(232,199,102,.35);border-radius:16px;max-width:560px;width:100%;padding:44px 32px;text-align:center}
.etikett{font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,199,102,.85);margin:0}
.kod{font-size:72px;font-weight:700;color:#E8C766;line-height:1;margin:20px 0 0}
h1{font-size:24px;margin:12px 0 0}
.brod{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:rgba(237,230,214,.8);margin:12px auto 0;max-width:420px}
nav{margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
a{display:inline-block;padding:12px 20px;border:1px solid #E8C766;border-radius:8px;color:#E8C766;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px}
a:hover{background:rgba(232,199,102,.12)}
footer{margin-top:28px;padding-top:16px;border-top:1px solid rgba(232,199,102,.3);font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(237,230,214,.55)}
</style>
</head>
<body>
<main>
<p class="etikett">AK1A Research Lab · Navigeringsfel</p>
<p class="kod" aria-hidden="true">404</p>
<h1>Sidan hittades inte</h1>
<p class="brod">Även analytiker tar fel vändningar ibland — sidan du söker har flyttats eller finns inte (än). Låt oss lotsa dig tillbaka.</p>
<nav><a href="/blogg">Alla blogginlägg</a><a href="/">Startsidan</a></nav>
<footer>AK1A Research Lab · Utbildande finansiell forskning — inte investeringsråd</footer>
</main>
</body>
</html>`;
}

/**
 * Ren lookup: 404-Response för schemalagda (ännu ej publicerade) blogg-
 * inläggs-slugar, null om förfrågan ska passera (publicerad slug, ej
 * blogg-detaljsida, läs-fel ⇒ fail-open).
 */
function framtids404Svar(pathname: string, klass: string): Response | null {
  const m = FRAMTIDS_PATH_MONSTER.exec(pathname);
  if (!m) return null; // Ej /blogg/<slug> — helt orörd trafik.
  const slug = m[1];
  if (!lasFramtidaBloggSlugar().has(slug)) return null; // Publicerad/okänd ⇒ routern.
  return new Response(framtids404Sida(), {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "x-ak1a-klass": klass,
      "Server-Timing": `ak1a;desc="${klass}"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
