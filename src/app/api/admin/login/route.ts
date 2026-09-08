import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_KAKA,
  ADMIN_SESSION_MAX_AGE_S,
  forvantatLosenord,
  forvantatRedaktorLosenord,
  skapaSession,
  type AdminRoll,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/login — SESSIONSINLOGGNING (VÅG 83, ADMIN-MEGA steg 5 —
 * STYRELSE-VAG83-ROLLER.md §A1). ENDAST POST.
 *
 * POST { losenord } → avgör roll (admin- el. redaktör-lösenord) → om
 * SESSION_SECRET finns: Set-Cookie ak1a_admin (httpOnly + secure +
 * sameSite=lax + path=/ + maxAge 8 h) och svar { ok: true, roll }.
 *
 * Svar:
 *   200 { ok, roll }      — session satt
 *   401 { fel }           — GENERELL text; avslöjar ALDRIG vilken roll/
 *                           vilket lösenord som felade (ej heller vilka
 *                           roller som existerar i miljön)
 *   429 { fel }           — för många felaktiga försök (10/min, samma tak
 *                           som admin-auth)
 *   503 { fel }           — rätt lösenord men SESSION_SECRET saknas:
 *                           sessioner går inte — använd lösenordsläget
 *                           (x-admin-password), som består oförändrat.
 *
 * Lösenord och cookie-värden loggas ALDRIG (P6). Timing-säkra jämförelser
 * enligt admin-auth-mönstret.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Timing-säker jämförelse (samma mönster som src/lib/admin-auth.ts). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Rate-limit på FELAKTIGA försök (10/min per process — admin-auth-taket). */
const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const losenord =
    kropp && typeof kropp === "object" && !Array.isArray(kropp)
      ? (kropp as Record<string, unknown>).losenord
      : undefined;
  const givet = typeof losenord === "string" ? losenord : "";

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { fel: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }

  // Rollbestämning — generell 401-text avslöjar ALDRIG vilken roll som felade.
  const vantanAdmin = forvantatLosenord();
  const vantanRedaktor = forvantatRedaktorLosenord();
  let roll: AdminRoll | null = null;
  if (givet && vantanAdmin && timingSafeEqual(givet, vantanAdmin)) {
    roll = "admin";
  } else if (givet && vantanRedaktor && timingSafeEqual(givet, vantanRedaktor)) {
    roll = "redaktor";
  }
  if (roll === null) {
    misslyckade.push(now);
    return NextResponse.json({ fel: "Fel lösenord." }, { status: 401 });
  }

  // SESSION_SECRET saknas ⇒ sessioner går inte — ärlig 503, lösenordsläget
  // (x-admin-password i admin-auth) består oförändrat som fallback.
  const cookie = skapaSession(roll);
  if (!cookie) {
    return NextResponse.json(
      { fel: "Sessioner kräver SESSION_SECRET — använd lösenordsläget." },
      { status: 503 },
    );
  }

  const res = NextResponse.json({ ok: true, roll });
  res.cookies.set(ADMIN_SESSION_KAKA, cookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_S,
  });
  return res;
}
