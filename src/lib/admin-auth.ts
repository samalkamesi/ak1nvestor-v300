import { createHmac } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

/**
 * ADMIN-AUTH — delat vakt-hjälpsystem för skriv-/läskytor under /api/admin
 * och /api/pro/admin (VÅG 63 bygg-1, O4-robusthet §5 "ogardad admin-yta").
 *
 * VÅG 83 (ADMIN-MEGA steg 5, STYRELSE-VAG83-ROLLER.md §A1) — ROLLER +
 * SESSIONER, bakåtkompatibelt:
 *   · AdminRoll = "admin" | "redaktor".
 *   · Signerad sessions-cookie `ak1a_admin` = "<roll>.<utgar>.<hmac>" där
 *     hmac = HMAC-SHA256(SESSION_SECRET, "<roll>.<utgar>") hex. AKTIVERAS
 *     ENDAST när SESSION_SECRET finns i miljön — utan den NEKAS
 *     sessionsvägen TYST och lösenordsvägen gäller oförändrat (prod kan
 *     aldrig låsa sig på en env kunden saknar ännu). Utgången vägrar.
 *   · requireAdmin(req, body?, tillat?) — default tillat = ["admin"]
 *     (ADMIN-ONLY: säkraste default; redaktörsytorna passerar uttryckligt
 *     ADMIN_OCH_REDAKTOR). ADMIN_PASSWORD-vägen = roll "admin" och består
 *     som bootstrap/rollback precis som förut.
 *   · REDAKTOR_PASSWORD (dev-fallback "AK1A-REDAKTOR-2026" ENBART i
 *     development — v79-regeln: prod utan env ⇒ rollen finns ej) gäller
 *     ENDAST på ytor där tillat innehåller "redaktor".
 *   · ALDRIG logga lösenord eller cookie-värden (P6 — cookien bär roll +
 *     utgång + HMAC, aldrig lösenord).
 *
 * Mönstret är EXAKT det fas2-access redan använder (src/app/api/admin/
 * fas2-access/route.ts): ADMIN_PASSWORD på servern (env; dev-fallback
 * "AK1A-2026" ENBART i development — VÅG 79: i NODE_ENV=production utan
 * ADMIN_PASSWORD satt vägrar requireAdmin med 500, se forvantatLosenord),
 * lösenordet lämnas i headern "x-admin-password" (alternativt
 * "Authorization: Bearer <pwd>" eller body-fältet adminPassword) och
 * jämförs TIMING-SÄKERT. Endast misslyckade försök rate-limitas (10/min
 * per process — samma tak som fas2-access).
 *
 * Användning i en route:
 *
 *   const skydd = requireAdmin(req);            // admin-only (våg 83-default)
 *   // eller requireAdmin(req, body)              — samma: tillat = ["admin"]
 *   // eller requireAdmin(req, body, ADMIN_OCH_REDAKTOR)  — redaktörens yta
 *   if (skydd) return skydd;                    // 401/429/500 — klart
 *
 * Header-första varianten (requireAdmin(req)) kan köras FÖRE req.json()
 * så obehöriga förfrågningar avvisas utan arbete. Body-stödet finns för
 * parity med fas2-access (body.adminPassword).
 *
 * Pedagogisk analys — inte investeringsråd.
 */

/** Enkel in-memory rate-limit på FELAKTIGA lösenordsförsök (10/minut). */
const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Lösenord ur header (x-admin-password | Authorization: Bearer) eller body. */
function utdragLosenord(req: NextRequest, body: Record<string, unknown>): string {
  const urHeader = req.headers.get("x-admin-password");
  if (urHeader) return urHeader;
  const bearer = req.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) return bearer.slice(7);
  const urBody = body.adminPassword;
  return typeof urBody === "string" ? urBody : "";
}

// ── VÅG 83: roller + signerad sessions-cookie (§A1) ─────────────────────────

/** Rollerna i admin-panelen (steg 5): admin = allt; redaktör = sina ytor. */
export type AdminRoll = "admin" | "redaktor";

/**
 * tillat-lista för redaktörens ytor (blogg/publicera, kurser, media,
 * termbank) — requireAdmin(req, body, ADMIN_OCH_REDAKTOR). ALLT ANNAT har
 * default tillat = ["admin"] (admin-only, säkraste default).
 */
export const ADMIN_OCH_REDAKTOR: readonly AdminRoll[] = ["admin", "redaktor"];

/** Sessions-cookiens namn (httpOnly + secure + sameSite=lax + path=/ + 8 h). */
export const ADMIN_SESSION_KAKA = "ak1a_admin";
/** maxAge i sekunder (kontraktets 8 timmar). */
export const ADMIN_SESSION_MAX_AGE_S = 8 * 60 * 60;

/**
 * Sessionsvägens HMAC-nyckel — SESSION_SECRET ur miljön, eller null när
 * sessionsvägen är AV (tyst: då gäller enbart lösenordsvägen oförändrat).
 */
function sessionsNyckel(): string | null {
  const hemlighet = process.env.SESSION_SECRET;
  return typeof hemlighet === "string" && hemlighet.length > 0 ? hemlighet : null;
}

/** HMAC-SHA256(hex) över payload — null när SESSION_SECRET saknas. */
function hmacSignera(payload: string): string | null {
  const nyckel = sessionsNyckel();
  if (nyckel === null) return null;
  return createHmac("sha256", nyckel).update(payload, "utf8").digest("hex");
}

/**
 * skapaSession — cookie-VÄRDET "<roll>.<utgar>.<hmac>" (utgar = epoch-ms,
 * nu + 8 h). Tom sträng när SESSION_SECRET saknas (sessionsvägen av —
 * login-rutten svarar då 503 innan den når hit i praktiken).
 * Värdet innehåller ALDRIG lösenordet (P6).
 */
export function skapaSession(roll: AdminRoll): string {
  const utgar = Date.now() + ADMIN_SESSION_MAX_AGE_S * 1000;
  const sign = hmacSignera(`${roll}.${String(utgar)}`);
  if (sign === null) return "";
  return `${roll}.${String(utgar)}.${sign}`;
}

/** Cookie-värde ur en rå cookie-header ("a=1; ak1a_admin=…") — eller null. */
function lasCookieVarde(req: NextRequest, namn: string): string | null {
  const rad = req.headers.get("cookie");
  if (!rad) return null;
  for (const del of rad.split(";")) {
    const trimmad = del.trim();
    const lika = trimmad.indexOf("=");
    if (lika <= 0) continue;
    if (trimmad.slice(0, lika) === namn) return trimmad.slice(lika + 1);
  }
  return null;
}

/**
 * lasSessionFranCookie — REN verifiering av sessions-cookien: roll ∈
 * {admin, redaktor}, utgar i framtiden (utgången vägrar) och HMAC:en
 * stämmer (timing-säker). Ogiltig/tamperad/utgången/saknad cookie ⇒ null.
 * SESSION_SECRET saknas ⇒ null TYST (sessionsvägen av — aldrig fel, aldrig
 * loggning av cookie-värdet). Exporterad för verktyg/testa-admin-session.mjs.
 */
export function lasSessionFranCookie(req: NextRequest): AdminRoll | null {
  const varde = lasCookieVarde(req, ADMIN_SESSION_KAKA);
  if (!varde) return null;
  const delar = varde.split(".");
  if (delar.length !== 3) return null;
  const [roll, utgarText, sign] = delar;
  if (roll !== "admin" && roll !== "redaktor") return null;
  if (!/^\d+$/.test(utgarText)) return null;
  if (Number(utgarText) <= Date.now()) return null; // utgången vägrar
  const vantan = hmacSignera(`${roll}.${utgarText}`);
  if (vantan === null) return null; // SESSION_SECRET saknas ⇒ vägen är av
  return timingSafeEqual(sign, vantan) ? roll : null;
}

/** Dev-fallback-lösenordet — gäller ENBAST i development (se förvantatLosenord). */
const DEV_FALLBACK_LOSENORD = "AK1A-2026";

/**
 * Förväntat lösenord — eller null när admin-åtkomst är STÄNGD.
 *
 * VÅG 79 (ADMIN-MEGA steg 1, STYRELSE-ADMIN-MEGA §4.2 + BYGGKONTRAKTETS
 * säkerhetskrav): dev-fallback "AK1A-2026" gäller ENBAST när NODE_ENV !==
 * "production". I produktion utan ADMIN_PASSWORD satt finns INGEN fallback —
 * det publicerade lösenordet får aldrig vara prod-låset när panelen kan
 * ändra PRISER. requireAdmin svarar då 500 med tydligt fel (refused).
 */
export function forvantatLosenord(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "production") return null;
  return DEV_FALLBACK_LOSENORD;
}

/** Dev-fallback för redaktörsrollen — gäller ENBART i development (v79). */
const DEV_FALLBACK_REDAKTOR_LOSENORD = "AK1A-REDAKTOR-2026";

/**
 * Förväntat REDAKTÖR-lösenord — eller null när rollen inte finns.
 * REDAKTOR_PASSWORD ur miljön; dev-fallback "AK1A-REDAKTOR-2026" ENBART
 * när NODE_ENV !== "production" (samma v79-skärpning som ADMIN_PASSWORD:
 * prod utan env ⇒ rollen finns ej — lösenordsvägen låser då ute redaktören).
 */
export function forvantatRedaktorLosenord(): string | null {
  if (process.env.REDAKTOR_PASSWORD) return process.env.REDAKTOR_PASSWORD;
  if (process.env.NODE_ENV === "production") return null;
  return DEV_FALLBACK_REDAKTOR_LOSENORD;
}

/**
 * requireAdmin — null när anropet är auktoriserat (fortsätt), annars ett
 * färdigt 401/429/500-svar som routen returnerar direkt.
 *
 * VÅG 83 §A1 — tre vägar, i ordning:
 *   (1) Giltig sessions-cookie (ak1a_admin) med roll ∈ tillat ⇒ pass.
 *       Kräver SESSION_SECRET; utan den är vägen TYST av.
 *   (2) ADMIN_PASSWORD-vägen (roll "admin", befintligt beteende består som
 *       bootstrap/rollback) — aktiv när tillat innehåller "admin".
 *   (3) REDAKTOR_PASSWORD-vägen (roll "redaktor") — ENBART när tillat
 *       innehåller "redaktor".
 *
 * DEFAULT tillat = ["admin"] (admin-only — säkraste default; redaktörens
 * ytor passerar uttryckligt ADMIN_OCH_REDAKTOR). Jämförelser timing-säkra;
 * lösenord/cookie-värden loggas ALDRIG.
 */
export function requireAdmin(
  req: NextRequest,
  body: Record<string, unknown> = {},
  tillat: readonly AdminRoll[] = ["admin"],
): NextResponse | null {
  const tillatna: readonly AdminRoll[] = tillat.length > 0 ? tillat : ["admin"];

  // (1) sessionsvägen — tyst av när SESSION_SECRET saknas (null ⇒ vidare).
  const sessionRoll = lasSessionFranCookie(req);
  if (sessionRoll !== null && tillatna.includes(sessionRoll)) return null;

  // (2)+(3) lösenordsvägarna — aktiva per roll-tillåtelse ovan.
  const expectedAdmin = tillatna.includes("admin") ? forvantatLosenord() : null;
  const expectedRedaktor = tillatna.includes("redaktor") ? forvantatRedaktorLosenord() : null;
  if (!expectedAdmin && !expectedRedaktor) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD är inte satt i miljön — admin-åtkomst är avstängd i produktion utan lösenord (säkerhetskrav våg 79). Sätt ADMIN_PASSWORD i Vercel-projektets miljövariabler och deploya om.",
      },
      { status: 500 },
    );
  }

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }

  const provided = utdragLosenord(req, body);
  if (provided && expectedAdmin && timingSafeEqual(provided, expectedAdmin)) {
    return null; // admin-lösenordet (roll "admin") — passerar som förut
  }
  if (provided && expectedRedaktor && timingSafeEqual(provided, expectedRedaktor)) {
    return null; // redaktör-lösenordet — endast på redaktörens ytor
  }
  misslyckade.push(now);
  return NextResponse.json(
    { error: "Admin-lösenord krävs (x-admin-password)." },
    { status: 401 },
  );
}
