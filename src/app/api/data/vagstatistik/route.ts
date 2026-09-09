import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { byggVagstatistikSvar, parseVagvalideringRapport, type VagSpegel } from "@/lib/dataset-nyckeltal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/data/vagstatistik — vågmotorns rullande träffhistorik, maskinläsbar
 * (A2-DATASET-KONTRAKT §3.2; våg 87 bygg).
 *
 * Källval (a), rekommenderat i kontraktet: läser JSON-spegeln
 * data/rapporter/vagvalidering-SENASTE.json — cronen api/cron/vagvalidering
 * skriver den vid varje rond sedan våg 87. Fall-back (b): strikt parser av
 * vagvalidering-SENASTE.md (deterministisk generator gör det möjligt).
 *
 * VERSIONSVAKTEN (§2.2): svaret visar ALLTID senaste protokollets räknare
 * med protokollstämpel — citatet "52 %" är giltigt endast med (n=48, v1)-
 * stämpeln och plockas aldrig okodat när v2-räknare vuxit.
 *
 * Cache 1 h: modulmemo + s-maxage=3600 — följer rapportens dagens kadens.
 *
 * Öppet kvitto om det förflutnet — aldrig garanti om framtiden. Inte
 * investeringsrådgivning (lagen 2007:528).
 */

const CACHE_MS = 60 * 60 * 1000;
const CACHE_HEADER = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
const SPEGEL_SOK = path.join(process.cwd(), "data", "rapporter", "vagvalidering-SENASTE.json");
const RAPPORT_SOK = path.join(process.cwd(), "data", "rapporter", "vagvalidering-SENASTE.md");

let memo: { vid: number; svar: object } | null = null;

/** Spegel först, MD-parsern som fall-back — inget påhittas, null är null. */
function lasVagSpegel(): VagSpegel | null {
  try {
    const rå = JSON.parse(readFileSync(SPEGEL_SOK, "utf8")) as VagSpegel;
    if (rå && typeof rå === "object" && Array.isArray(rå.perHorisontKlass) && rå.totalt) return rå;
  } catch {
    // ingen/giltig spegel — prova MD:n
  }
  try {
    return parseVagvalideringRapport(readFileSync(RAPPORT_SOK, "utf8"));
  } catch {
    return null;
  }
}

export async function GET() {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) {
    return NextResponse.json(memo.svar, { headers: { "Cache-Control": CACHE_HEADER } });
  }

  const spegel = lasVagSpegel();
  if (spegel === null) {
    // Ärligt tomt — aldrig påhittade räknare (osatt är information, inte fel).
    return NextResponse.json(
      { schema: "ak1a-vagstatistik/1", finns: false, fel: "Ingen vågvalideringsrapport kunde läsas." },
      { status: 503, headers: { "Cache-Control": "public, max-age=0, s-maxage=600" } },
    );
  }

  const svar = byggVagstatistikSvar(spegel, new Date().toISOString());
  memo = { vid: Date.now(), svar };
  return NextResponse.json(svar, { headers: { "Cache-Control": CACHE_HEADER } });
}
