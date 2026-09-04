import { NextResponse } from "next/server";
import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";
import { raknaForskningslage, type Forskningslage } from "@/lib/forskningslaget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * FORSKNINGSLÄGET — M3:s läs-API.
 *
 * GET /api/forskningslage
 *   → 200 { finns: true,  lage: Forskningslage }   (sammanfattat ur korstabellen)
 *   → 200 { finns: false, lage: null }             (P6 ej levererat — ärligt läge)
 *
 * Server-side: läser korstabell-grund.json via lasKorstabellGrund (normaliserad,
 * dedubblerad) och räknar läget med raknaForskningslage — klienten får ALDRIG
 * 100 rader, bara sammanfattningen (M3-risken "no-store per sidvisning" undviks).
 *
 * Cache 1 h: modulmemo + Cache-Control max-age=3600 — korstabellen levereras
 * manuellt av P6 (daterad), så en timmes utsikt ändrar aldrig siffrorna, och
 * fil-läsningen (~100 rader) sker max en gång per timme per process.
 *
 * Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528).
 */

/** 1 timme — cachen är en accelererare; vid omstart räknas läget om direkt. */
const CACHE_MS = 60 * 60 * 1000;

let memo: { vid: number; svar: { finns: boolean; lage: Forskningslage | null } } | null = null;

export async function GET() {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) {
    return NextResponse.json(memo.svar, { headers: { "Cache-Control": "public, max-age=3600" } });
  }

  const { finns, rader } = lasKorstabellGrund();
  const svar = finns ? { finns: true, lage: raknaForskningslage(rader) } : { finns: false, lage: null };
  memo = { vid: Date.now(), svar };
  return NextResponse.json(svar, { headers: { "Cache-Control": "public, max-age=3600" } });
}
