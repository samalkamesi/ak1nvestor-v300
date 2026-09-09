import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { raknaNyckeltalsmedianer, byggNyckeltalsguideSvar, type UniversumRad } from "@/lib/dataset-nyckeltal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/data/nyckeltalsguide — maskinläsbar median-nyckeltalstabell
 * (A2-DATASET-KONTRAKT §3.1; våg 87 bygg).
 *
 * Server-side: läser data/portfolj-system/bolagsunivers.json (100 bolag,
 * 10 branscher × 10) och aggregerar MEDIANER PER BRANSCH — aldrig
 * per-bolag-rader, aldrig AKM-poäng (gränsdragningen §1: aggregat av publikt
 * källmaterial = publikt; allt som bär AKM-poäng = prenumerationsvärde).
 *
 * Cache 1 h: modulmemo + Cache-Control s-maxage=3600 (llms.txt-mönstret) —
 * universumet levereras manuellt och daterat (hämtat 2026-09-03), så en
 * timmes utsikt ändrar aldrig siffrorna.
 *
 * Pedagogisk forskning — inte investeringsrådgivning enligt lagen (2007:528).
 */

const CACHE_MS = 60 * 60 * 1000;
/** Kontrakt §4: llms.txt-mönstret — CDN-cache 1 h + dagslång stale-revalidate. */
const CACHE_HEADER = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
const UNIVERSUM_SOK = path.join(process.cwd(), "data", "portfolj-system", "bolagsunivers.json");

let memo: { vid: number; svar: object } | null = null;

export async function GET() {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) {
    return NextResponse.json(memo.svar, { headers: { "Cache-Control": CACHE_HEADER } });
  }

  const rader = JSON.parse(readFileSync(UNIVERSUM_SOK, "utf8")) as UniversumRad[];
  const svar = byggNyckeltalsguideSvar(raknaNyckeltalsmedianer(rader), new Date().toISOString());
  memo = { vid: Date.now(), svar };
  return NextResponse.json(svar, { headers: { "Cache-Control": CACHE_HEADER } });
}
