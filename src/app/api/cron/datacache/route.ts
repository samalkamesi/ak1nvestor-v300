import { NextResponse, NextRequest } from "next/server";
import { körVagfundament } from "@/lib/vagfundament-motor";
import { körAnalysMotor } from "@/lib/analys-motor";
import { skannaKonfluens, MAX_TICKER_KONFLUENS } from "@/lib/konfluens-motor";
import { skannaNetnet } from "@/lib/netnet-motor";
import { sparaCache, cacheStatistik, type CacheTyp } from "@/lib/datacache";
import { publiceraOrganEvent } from "@/lib/organ-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/datacache — DATACENTRALENS dagliga fyllare (Vercel Cron 06:00
 * UTC, se vercel.json — DAGLIG enligt Hobby-regeln: max en körning/dag).
 *
 * Direktiv: "varje dag spara alla data för att nå rätt cache och optimera
 * analysen utan att söka på nätet — med tiden söka via vår egen databas."
 *
 * För AKM1-universumet (12 tickers, samma som cron/vagscan) körs ALLA FYRA
 * motorerna och varje ticker-svar sparas per typ i data/cache/ (fallback
 * /tmp/datacache/ på read-only fs — se src/lib/datacache.ts):
 *   vagfundament → körVagfundament   (20×5 fundamentalvågsmatrisen)
 *   analys       → körAnalysMotor    (pris/volym 5×5×4 + fundament)
 *   netnet       → skannaNetnet      (NCAV/Graham-rader)
 *   konfluens    → skannaKonfluens   (fem dimensioner 0–100, max 10/anrop → 2 batcher)
 *
 * Faserna körs SEKVENSIELLT (varje motor har sin egen interna parallellism —
 * sammanlagt Yahoo-vänligt tryck) och varje fas fångar sina egna fel: en
 * motor som fallerar dödar aldrig de redan sparade faserna. Efteråt loggas
 * ett OrganEvent (organ/datacache) och svaret innehåller cacheStatistik().
 */

// AKM1-universum — 12 tickers (samma lista som cron/vagscan)
const UNIVERSUM = [
  "VOLV-B.ST", "SAAB-B.ST", "ATCO-A.ST", "SAND.ST", "SWED-A.ST", "ESSITY-B.ST",
  "ERIC-B.ST", "AZN.ST", "NDA-SE.ST", "SKF-B.ST", "ALFA.ST", "SHB-B.ST",
];

const TYPER: CacheTyp[] = ["vagfundament", "analys", "netnet", "konfluens"];

/** Utfall per fas: antal sparade rader + felposter (ticker → orsak). */
type FasResultat = { sparade: number; fel: Record<string, string> };

/** Spara en rad om den inte är en motor-felrad; räkna upp antalet. */
async function sparaRad(
  ticker: string,
  typ: CacheTyp,
  data: unknown,
  resultat: FasResultat,
): Promise<void> {
  const lagring = await sparaCache(ticker, typ, data, "cron");
  if (lagring === "no-cache") {
    resultat.fel[ticker] = "ingen skrivbar cache-katalog";
  } else {
    resultat.sparade += 1;
  }
}

/** Fas 1: vågfundament — hela universumet i ett anrop (motorns tak är 12). */
async function fasVagfundament(): Promise<FasResultat> {
  const resultat: FasResultat = { sparade: 0, fel: {} };
  const svar = await körVagfundament({ tickers: UNIVERSUM });
  for (const rad of svar.tickers) {
    if (rad.fel) {
      resultat.fel[rad.ticker] = rad.fel;
      continue;
    }
    await sparaRad(rad.ticker, "vagfundament", rad, resultat);
  }
  return resultat;
}

/** Fas 2: analysmotorn — hela universumet i ett anrop (motorns tak är 12). */
async function fasAnalys(): Promise<FasResultat> {
  const resultat: FasResultat = { sparade: 0, fel: {} };
  const svar = await körAnalysMotor({ tickers: UNIVERSUM });
  for (const rad of svar.tickers) {
    if (rad.fel) {
      resultat.fel[rad.ticker] = rad.fel;
      continue;
    }
    await sparaRad(rad.ticker, "analys", rad, resultat);
  }
  return resultat;
}

/** Fas 3: netnet-skannern — hela universumet i ett anrop (motorns tak är 15). */
async function fasNetnet(): Promise<FasResultat> {
  const resultat: FasResultat = { sparade: 0, fel: {} };
  const rader = await skannaNetnet(UNIVERSUM);
  for (const rad of rader) {
    if (rad.fel) {
      resultat.fel[rad.ticker] = rad.fel;
      continue;
    }
    await sparaRad(rad.ticker, "netnet", rad, resultat);
  }
  return resultat;
}

/** Fas 4: konfluensskannern — max 10 tickers/anrop → två batcher. */
async function fasKonfluens(): Promise<FasResultat> {
  const resultat: FasResultat = { sparade: 0, fel: {} };
  for (let i = 0; i < UNIVERSUM.length; i += MAX_TICKER_KONFLUENS) {
    const batch = UNIVERSUM.slice(i, i + MAX_TICKER_KONFLUENS);
    const rader = await skannaKonfluens(batch);
    for (const rad of rader) {
      // Konfluensrader är alltid välformade (null-dimensioner är graciösa) —
      // rader med 0 datakällor sparas inte, de bär ingen analys.
      if (rad.datakallor === 0) {
        resultat.fel[rad.ticker] = "0 datakällor";
        continue;
      }
      await sparaRad(rad.ticker, "konfluens", rad, resultat);
    }
  }
  return resultat;
}

export async function GET(req: NextRequest) {
  // samma skydd som cron/autonom + cron/vagscan: om CRON_SECRET är satt krävs
  // matchning via ?secret= (query) eller Authorization: Bearer (Vercel Cron).
  // utan satt secret är rutten öppen (dev/lokal förfyllning).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Fyra faser, sekventiellt — varje fas fångar sitt eget fel (partiella
  // fyllningar behålls: det som sparats finns kvar i data/cache/).
  const faser: Record<string, FasResultat> = {};
  const fasKorare: [string, () => Promise<FasResultat>][] = [
    ["vagfundament", fasVagfundament],
    ["analys", fasAnalys],
    ["netnet", fasNetnet],
    ["konfluens", fasKonfluens],
  ];
  for (const [namn, kor] of fasKorare) {
    try {
      faser[namn] = await kor();
    } catch (e) {
      faser[namn] = { sparade: 0, fel: { _fas: e instanceof Error ? e.message : String(e) } };
    }
  }

  const totaltSparade = Object.values(faser).reduce((s, f) => s + f.sparade, 0);
  const allaFel = Object.values(faser).flatMap((f) => Object.entries(f.fel));

  // OrganEvent — verb "atgard" (OrganVerb-typen tillåter inte "fyllde"; det
  // är en utförd åtgärd i nervsystemet). Tyst vid Supabase-fel (fail-safe).
  await publiceraOrganEvent({
    source: "organ/datacache",
    verb: "atgard",
    matt: {
      tickers: UNIVERSUM.length,
      typer: TYPER.length,
      sparadeRader: totaltSparade,
      misslyckade: allaFel.length,
    },
  });

  // Hälsoläget efter fyllningen
  const statistik = await cacheStatistik();

  return NextResponse.json({
    genererad: new Date().toISOString(),
    universum: UNIVERSUM,
    faser,
    totaltSparade,
    fel: allaFel,
    statistik,
    notering: (
      "Daglig förfyllning av data/cache (fallback /tmp/datacache på read-only fs). "
      + "Rapport-routes kan nu läsa via lasEllerHamta och slippa nätverksanropet "
      + "inom cache-fönstret. Pedagogiskt verktyg — inte investeringsråd."
    ),
  });
}
