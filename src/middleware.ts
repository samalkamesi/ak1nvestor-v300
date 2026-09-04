import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
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

/**
 * MIDDLEWARE — trafikvakten i kanten (edge, snabbt, ALDRIG försenande).
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
 * aldrig — middleware loggar istället bot-sidvisningar (GET, ej /api) till
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

// ── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const nu = Date.now();
  stadaMinne(nu);

  const path = sannyaPath(req.nextUrl.pathname);
  const ua = sannyaUa(req.headers.get("user-agent"));
  const ipHash = await hashIp(utvinnIp(req));

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
  const antal = registreraFlod(ipHash, nu);
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

  // Passera med klass-märkning (Server-Timing är läsbar av klient-JS).
  const res = NextResponse.next();
  res.headers.set("x-ak1a-klass", klass === "ok" ? uaKlass : klass);
  res.headers.set("Server-Timing", `ak1a;desc="${klass === "ok" ? uaKlass : klass}"`);
  return res;
}
