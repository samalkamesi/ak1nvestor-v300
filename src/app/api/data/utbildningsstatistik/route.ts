import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { byggUtbildningsstatistikSvar } from "@/lib/dataset-nyckeltal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/data/utbildningsstatistik — SKALA-påståendet, maskinläsbart
 * (A2-DATASET-KONTRAKT §3.3; våg 87 bygg).
 *
 * Passthrough av data/siffror.json (sajtens enda talkälla, genererad av
 * verktyg/rakna-siffror.mjs) + schema/källa/disclaimer-omslag. Ren
 * referensstatistik — noll läckagerisk, noll gating (kontraktet §6).
 *
 * Cache 1 h: modulmemo + s-maxage=3600 — filen uppdateras vid deploy och
 * kurstillägg, aldrig oftare.
 *
 * Pedagogisk utbildningsstatistik — inte investeringsrådgivning (2007:528).
 */

const CACHE_MS = 60 * 60 * 1000;
const CACHE_HEADER = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
const SIFFROR_SOK = path.join(process.cwd(), "data", "siffror.json");

let memo: { vid: number; svar: object } | null = null;

export async function GET() {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) {
    return NextResponse.json(memo.svar, { headers: { "Cache-Control": CACHE_HEADER } });
  }

  const siffror = JSON.parse(readFileSync(SIFFROR_SOK, "utf8"));
  const svar = byggUtbildningsstatistikSvar(siffror, new Date().toISOString());
  memo = { vid: Date.now(), svar };
  return NextResponse.json(svar, { headers: { "Cache-Control": CACHE_HEADER } });
}
