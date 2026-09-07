import { NextRequest, NextResponse } from "next/server";

/**
 * ADMIN-AUTH — delat vakt-hjälpsystem för skriv-/läskytor under /api/admin
 * och /api/pro/admin (VÅG 63 bygg-1, O4-robusthet §5 "ogardad admin-yta").
 *
 * Mönstret är EXAKT det fas2-access redan använder (src/app/api/admin/
 * fas2-access/route.ts): ADMIN_PASSWORD på servern (env; dev-fallback
 * "AK1A-2026" ENBAST i development — VÅG 79: i NODE_ENV=production utan
 * ADMIN_PASSWORD satt vägrar requireAdmin med 500, se forvantatLosenord),
 * lösenordet lämnas i headern "x-admin-password" (alternativt
 * "Authorization: Bearer <pwd>" eller body-fältet adminPassword) och
 * jämförs TIMING-SÄKERT. Endast misslyckade försök rate-limitas (10/min
 * per process — samma tak som fas2-access).
 *
 * Användning i en route:
 *
 *   const skydd = requireAdmin(req);            // eller requireAdmin(req, body)
 *   if (skydd) return skydd;                    // 401/429 — klart
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

/**
 * requireAdmin — null när anropet är auktoriserat (fortsätt), annars ett
 * färdigt 401/429/500-svar som routen returnerar direkt.
 */
export function requireAdmin(
  req: NextRequest,
  body: Record<string, unknown> = {},
): NextResponse | null {
  const expected = forvantatLosenord();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD är inte satt i miljön — admin-åtkomst är avstängd i produktion utan lösenord (säkerhetskrav våg 79). Sätt ADMIN_PASSWORD i Vercel-projektets miljövariabler och deploya om.",
      },
      { status: 500 },
    );
  }
  const provided = utdragLosenord(req, body);

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }

  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(now);
    return NextResponse.json(
      { error: "Admin-lösenord krävs (x-admin-password)." },
      { status: 401 },
    );
  }
  return null;
}
