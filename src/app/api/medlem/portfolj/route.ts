import { NextRequest, NextResponse } from "next/server";

import { fornyaMedlemSession, lasMedlemSession, sattMedlemKakor, utvarderaRateLimit } from "@/lib/medlem-auth";
import { analysTickerUppstattning } from "@/lib/medlem-bevakning";
import {
  importeraLegacyPortfolj,
  lasMedlemPortfolj,
  PORTFOLJ_MAX,
  skrivMedlemPortfoljEvent,
  valideraPortfoljSkrivning,
} from "@/lib/medlem-portfolj";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/medlem/portfolj — VÅG 119 P1 (PIPELINE-KO.md: PORTFÖLJNAVET):
 * medlemmens utbildningsportfölj — en STUDIELISTA per konto (AKM2-UI).
 *
 * GET (hydreringens enda nätverksberoende utöver session):
 *   lasMedlemSession → 200 {inloggad:false} (gäst — TYST, aldrig 401-text)
 *   eller, i ordning: FÖRST await importeraLegacyPortfolj (engångs-
 *   kontraktet: members.email → client_portfolios — tyst fail-safe, ett
 *   importfel får ALDRIG gömma befintliga holdings), DÄREFTER
 *   lasMedlemPortfolj ⇒ 200 {inloggad:true, holdings, legacyImporterad}
 *   (requestskopad läsning, ALDRIG modul-cache — personliga värden når
 *   ALDRIG en CDN-cache; rutten är force-dynamic).
 *
 * POST { ticker, pa, antal?, kurs? }:
 *   1. lasMedlemSession → 401 utan giltig session (generell text — ingen
 *      info om kontoexistens, v83-regeln).
 *   2. Rate-limit 60/min per authId — in-memory per process (samma klass
 *      som /api/medlem/bevakning och /api/medlem/progress §B.5).
 *   3. lasMedlemPortfolj räknar AKTIVA holdings FÖRE skrivningen;
 *      valideraPortfoljSkrivning vaktar tickern (MÅSTE finnas i
 *      analysbiblioteket), pa-värdet och taket PORTFOLJ_MAX aktiva.
 *      Trasig JSON-kropp ⇒ body={} ⇒ valideringens 400.
 *   4. antal/kurs tvättas till number|null (ändligt tal > 0 — annars
 *      null) FÖRE skrivningen; skrivMedlemPortfoljEvent skriver EN
 *      system_events-rad (senaste-vinner gör klicket idempotent) —
 *      misslyckande ⇒ 502 med generell feltext.
 *
 * P6: inga tokens/lösenord i denna väg. Feltexter generella.
 * Pedagogisk plattform (lagen 2007:528): utbildningsportföljen är en
 * studielista i AKM2-metodens övningar — "så fungerar metoden",
 * ALDRIG investeringsråd ("köp/sälj denna aktie").
 */

/** Rate-limit: alla POST per authId (fönster 60 s, tak 60 — §B.5). */
const portfoljAnrop = new Map<string, number[]>();
const MAX_POST_PER_MIN = 60;

/**
 * Session MED refresh-rotation (LOGIN-2.0, våg 101 — samma kontrakt som
 * /api/medlem/bevakning): läs access-kakan; är den utgången (1 h) FÖRSÖK
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

/** Tal-tvätt för antal/kurs: ändligt tal > 0 — annars null (ospecifierat). */
function rensaTal(varde: unknown): number | null {
  if (typeof varde !== "number" || !Number.isFinite(varde) || varde <= 0) return null;
  return varde;
}

export async function GET(req: NextRequest) {
  const { session, fornyad } = await sessionMedRotation(req);
  if (session === null) {
    return NextResponse.json({ inloggad: false });
  }
  // Engångs-import av legacy-portföljen (e-postbryggan) — tyst fail-safe:
  // ett importfel får ALDRIG gömma medlemmens befintliga holdings.
  await importeraLegacyPortfolj(session.authId, session.epost);
  const portfolj = await lasMedlemPortfolj(session.authId);
  const res = NextResponse.json({
    inloggad: true,
    holdings: portfolj.holdings,
    legacyImporterad: portfolj.legacyImporterad,
  });
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
  const bedomning = utvarderaRateLimit(portfoljAnrop.get(session.authId) ?? [], nu, MAX_POST_PER_MIN);
  if (bedomning.limitad) {
    return NextResponse.json({ fel: "För många anrop — vänta en minut." }, { status: 429 });
  }
  portfoljAnrop.set(session.authId, [...bedomning.stansade, nu]);

  // ── 3. Aktiva holdings räknas FÖRE skrivningen; valideringen vaktar
  //      tickern mot biblioteket + taket PORTFOLJ_MAX aktiva ──────────────────
  const portfolj = await lasMedlemPortfolj(session.authId);
  const validering = valideraPortfoljSkrivning(body, analysTickerUppstattning(), portfolj.holdings.length);
  if (!validering.ok) {
    return NextResponse.json({ fel: validering.fel }, { status: validering.status });
  }

  // ── 4. antal/kurs rensas till number|null FÖRE skrivningen ────────────────
  const antal = rensaTal(body.antal);
  const kurs = rensaTal(body.kurs);

  // ── 5. EN system_events-rad — senaste-vinner gör klicket idempotent ───────
  const pa = body.pa === true;
  const skrivning = await skrivMedlemPortfoljEvent(
    session.authId,
    String(body.ticker).trim(),
    validering.nyckel,
    pa,
    antal,
    kurs,
  );
  if (!skrivning.ok) {
    return NextResponse.json({ fel: skrivning.fel }, { status: 502 });
  }
  const res = NextResponse.json({ ok: true, ticker: String(body.ticker).trim(), pa });
  if (fornyad) sattMedlemKakor(res, fornyad.access, fornyad.refresh);
  return res;
}
