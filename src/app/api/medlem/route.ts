import { NextRequest, NextResponse } from "next/server";

import {
  MEDLEM_KAKA,
  fornyaMedlemSession,
  ipHash,
  klientIp,
  lasKakaVarde,
  lasMedlemSession,
  medlemSignIn,
  medlemSignOut,
  medlemSignup,
  rensaMedlemKakor,
  sattMedlemKakor,
  skrivMedlemProfilEvent,
  utvarderaRateLimit,
} from "@/lib/medlem-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/medlem — MEDLEMSAUTH-PROXY (FAS L1, STYRELSE-INLOGGNING-ADMIN.md våg
 * 86 — kontraktet för V86-L1AUTH). ENDAST POST — ingen GET-handler finns
 * (Next svarar 405; session läses av server-komponenter DIREKTE ur
 * src/lib/medlem-auth.ts lasMedlemSession, aldrig över nätverket).
 *
 * POST { action, ... }:
 *   signup  {epost, losenord, namn?} → medlemSignup (Supabase Auth) + profil-
 *           rad i system_events (type=medlem; details={authId, epostHash sha256
 *           första 12, namn?, skapad} — ALDRIG lösenord/e-post i klartext).
 *           Profilraden är best-effort: auth-kontot får ALDRIG misslyckas av
 *           den (vbout/referral-mönstret). Svar 200 {ok, profilSkriven} /
 *           400 validering / 502 generiskt (supprimerat — kontots existens
 *           avslöjas aldrig).
 *   signin  {epost, losenord} → tokens i httpOnly-kakor (ak1a_medlem 1 h +
 *           ak1a_medlem_refresh 30 d; ALDRIG i svaret/kroppen). Rate-limit
 *           10 FEL per minut per IP-hash (sha256 av proxy-IP — raw-IP:n lagras
 *           aldrig). 401-texten GENERELL: "Fel e-post eller lösenord."
 *   signout {} → best-effort /auth/v1/logout + kakorna rensas; idempotent.
 *   session {} → lasMedlemSession, vid utgången access FÖRSÖK refresh-
 *           rotation (fornyaMedlemSession) och sätt om kakorna — svaret bär
 *           {inloggad, epost}, ALDRIG tokens.
 *
 * P6: lösenord, tokens och cookie-värden loggas ALDRIG. Feltexter generella.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Rate-limit: FELA Signin-försök per IP-hash (mönstret ur admin-auth — men
 *  nycklat per sha256(IP) i stället för per process). Map:en töms av fönstret. */
const misslyckadeSignin = new Map<string, number[]>();
const MAX_SIGNIN_FEL_PER_MIN = 10;

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body: Record<string, unknown> =
    kropp && typeof kropp === "object" && !Array.isArray(kropp) ? (kropp as Record<string, unknown>) : {};
  const action = typeof body.action === "string" ? body.action : "";

  // ── signup: auth-user + profil-event ────────────────────────────────────────
  if (action === "signup") {
    const resultat = await medlemSignup(body.epost, body.losenord);
    if (!resultat.ok) {
      const status = resultat.orsak === "validering" ? 400 : 502;
      return NextResponse.json({ fel: resultat.fel }, { status });
    }
    // Auth-kontot finns nu — profilraden är best-effort och misslyckanden
    // döljs inte (profilSkriven:false) men kraschar ALDRIG registreringen.
    const profilSkriven = await skrivMedlemProfilEvent(
      resultat.authId,
      String(body.epost).trim().toLowerCase(),
      typeof body.namn === "string" ? body.namn : undefined,
    );
    return NextResponse.json({ ok: true, profilSkriven });
  }

  // ── signin: rate-limit per IP-hash → tokens i httpOnly-kakor ────────────────
  if (action === "signin") {
    const nyckel = ipHash(klientIp(req));
    const nu = Date.now();
    const bedomning = utvarderaRateLimit(misslyckadeSignin.get(nyckel) ?? [], nu, MAX_SIGNIN_FEL_PER_MIN);
    if (bedomning.limitad) {
      return NextResponse.json(
        { fel: "För många försök — vänta en minut." },
        { status: 429 },
      );
    }

    const resultat = await medlemSignIn(body.epost, body.losenord);
    if (!resultat.ok) {
      misslyckadeSignin.set(nyckel, [...bedomning.stansade, nu]); // ENDAST fel räknas
      return NextResponse.json({ fel: resultat.fel }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, epost: resultat.user.epost });
    sattMedlemKakor(res, resultat.access, resultat.refresh);
    return res;
  }

  // ── signout: best-effort revoke + kakor bort ────────────────────────────────
  if (action === "signout") {
    const access = lasKakaVarde(req, MEDLEM_KAKA);
    if (access) await medlemSignOut(access); // best-effort — kakorna rensas ändå
    const res = NextResponse.json({ ok: true });
    rensaMedlemKakor(res);
    return res;
  }

  // ── session: verifiera (och försök rotera) — ALDRIG tokens i svaret ─────────
  if (action === "session") {
    const session = await lasMedlemSession(req);
    if (session !== null) {
      return NextResponse.json({ inloggad: true, epost: session.epost });
    }
    const fornyad = await fornyaMedlemSession(req);
    if (fornyad !== null) {
      const res = NextResponse.json({ inloggad: true, epost: fornyad.session.epost });
      sattMedlemKakor(res, fornyad.access, fornyad.refresh);
      return res;
    }
    return NextResponse.json({ inloggad: false });
  }

  return NextResponse.json({ fel: "Ogiltigt action." }, { status: 400 });
}

// Medvetet INGEN GET-export: session konsumeras av server-komponenter via
// lasMedlemSession (src/lib/medlem-auth.ts) — ingen token-läckage-yta behövs.
