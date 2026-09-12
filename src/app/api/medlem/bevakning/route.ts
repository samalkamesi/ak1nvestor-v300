import { NextRequest, NextResponse } from "next/server";

import { fornyaMedlemSession, lasMedlemSession, sattMedlemKakor, utvarderaRateLimit } from "@/lib/medlem-auth";
import {
  analysTickerUppstattning,
  lasMedlemBevakning,
  skrivMedlemBevakningEvent,
  valideraBevakningSkrivning,
} from "@/lib/medlem-bevakning";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/medlem/bevakning — VÅG 104 (STYRELSE-PORTAL-MEGA.md: "Analyserna i
 * navet"): medlemmens bevakningslista över analysbiblioteket, per konto.
 *
 * GET (hydreringens enda nätverksberoende utöver session):
 *   lasMedlemSession → 200 {inloggad:false} (gäst — TYST, aldrig 401-text)
 *   eller 200 {inloggad:true, tickers} ur lasMedlemBevakning
 *   (requestskopad läsning, ALDRIG modul-cache). Personliga värden når
 *   ALDRIG en CDN-cache (rutten är force-dynamic).
 *
 * POST { ticker, pa }:
 *   1. lasMedlemSession → 401 utan giltig session (generell text — ingen
 *      info om kontoexistens, v83-regeln).
 *   2. Rate-limit 60/min per authId — in-memory per process (samma klass
 *      som /api/medlem/progress §B.5).
 *   3. Validering: ticker MÅSTE finnas i analysbiblioteket; värdet "1"/"0"
 *      fastställs av SERVERN; tak BEVAKNING_MAX aktiva (409 vid full lista).
 *   4. EN system_events-POST (type=medlem_bevakning, Prefer: return=minimal,
 *      timeout 8 s, fail-safe) — senaste-vinner gör upprepade klick idempotenta.
 *
 * P6: inga tokens/lösenord i denna väg. Feltexter generella.
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Rate-limit: alla POST per authId (fönster 60 s, tak 60 — §B.5). */
const bevakningAnrop = new Map<string, number[]>();
const MAX_POST_PER_MIN = 60;

/**
 * Session MED refresh-rotation (LOGIN-2.0, våg 101 — samma kontrakt som
 * /api/medlem/progress): läs access-kakan; är den utgången (1 h) FÖRSÖK
 * rotation med refresh-kakan (30 d) och sätt om kakorna på svaret.
 */
async function sessionMedRotation(req: NextRequest): Promise<{
  session: { authId: string; epost: string } | null;
  fornyad?: { access: string; refresh: string };
}> {
  const session = await lasMedlemSession(req);
  if (session !== null) return { session };
  const fornyad = await fornyaMedlemSession(req);
  if (fornyad !== null) {
    return { session: fornyad.session, fornyad: { access: fornyad.access, refresh: fornyad.refresh } };
  }
  return { session: null };
}

export async function GET(req: NextRequest) {
  const { session, fornyad } = await sessionMedRotation(req);
  if (session === null) {
    return NextResponse.json({ inloggad: false });
  }
  const bevakning = await lasMedlemBevakning(session.authId);
  const res = NextResponse.json({ inloggad: true, tickers: bevakning.tickers });
  if (fornyad) sattMedlemKakor(res, fornyad.access, fornyad.refresh);
  return res;
}

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body: Record<string, unknown> =
    kropp && typeof kropp === "object" && !Array.isArray(kropp) ? (kropp as Record<string, unknown>) : {};

  // ── 1. Session — utan den finns inget att skriva (401, generell text) ─────
  const { session, fornyad } = await sessionMedRotation(req);
  if (session === null) {
    return NextResponse.json({ fel: "Inloggning krävs." }, { status: 401 });
  }

  // ── 2. Rate-limit per authId (ALLA anrop räknas — inte bara fel) ──────────
  const nu = Date.now();
  const bedomning = utvarderaRateLimit(bevakningAnrop.get(session.authId) ?? [], nu, MAX_POST_PER_MIN);
  if (bedomning.limitad) {
    return NextResponse.json({ fel: "För många anrop — vänta en minut." }, { status: 429 });
  }
  bevakningAnrop.set(session.authId, [...bedomning.stansade, nu]);

  // ── 3. Validering mot biblioteket + taket (aktiva räknas FÖRE skrivning) ──
  const bevakning = await lasMedlemBevakning(session.authId);
  const validering = valideraBevakningSkrivning(body, analysTickerUppstattning(), bevakning.tickers.length);
  if (!validering.ok) {
    return NextResponse.json({ fel: validering.fel }, { status: validering.status });
  }

  // ── 4. EN system_events-rad — senaste-vinner gör klicket idempotent ───────
  const pa = body.pa === true;
  const skrivning = await skrivMedlemBevakningEvent(
    session.authId,
    String(body.ticker).trim(),
    validering.nyckel,
    pa,
  );
  if (!skrivning.ok) {
    return NextResponse.json({ fel: skrivning.fel }, { status: 502 });
  }
  const res = NextResponse.json({ ok: true, ticker: String(body.ticker).trim(), pa });
  if (fornyad) sattMedlemKakor(res, fornyad.access, fornyad.refresh);
  return res;
}
