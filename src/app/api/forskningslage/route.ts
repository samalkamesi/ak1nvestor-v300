import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";
import { raknaForskningslage, type Forskningslage } from "@/lib/forskningslaget";
import type { RegimeLogg, RegimeLoggRad } from "@/lib/akm3/regim";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * FORSKNINGSLÄGET — M3:s läs-API.
 *
 * GET /api/forskningslage
 *   → 200 { finns: true,  lage: Forskningslage, regim: RegimeUtsnitt | null }
 *   → 200 { finns: false, lage: null,           regim: RegimeUtsnitt | null }
 *
 * Server-side: läser korstabell-grund.json via lasKorstabellGrund (normaliserad,
 * dedubblerad) och räknar läget med raknaForskningslage — klienten får ALDRIG
 * 100 rader, bara sammanfattningen (M3-risken "no-store per sidvisning" undviks).
 *
 * REGIMFÄLTET (våg 60 bygg-A, AKM3-BESLUT §8 steg 5): additiv nyckel `regim` —
 * AKM3:s deterministiska regimebeskrivning, LÄST ur senaste raden i
 * data/portfolj-system/regime-logg.json (append-only + hash-kedjad; cronen
 * cron/vagvalidering räknar + appendar). Loggen är sanningen: regimen är en
 * bekräftad, daterad beskrivning (hysteres + 2-snapshots-bekräftelse) — API:t
 * räknar ALDRIG om den på egen hand, då vippning vid tröskeln skulle kunna
 * visas innan bekräftelse. Saknas loggen ⇒ regim: null (kortet vilar — P3).
 *
 * Cache 1 h: modulmemo + Cache-Control max-age=3600 — korstabellen levereras
 * manuellt av P6 (daterad), så en timmes utsikt ändrar aldrig siffrorna, och
 * fil-läsningen (~100 rader) sker max en gång per timme per process.
 *
 * Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528).
 */

/** 10 min — läget ändras sällan men regimen/filen kan landa i en deploy;
 *  en timme (v1) höll kvar ett null-läge ett helt dygn efter fix. */
const CACHE_MS = 10 * 60 * 1000;

/** Regime-loggens hem (append-only + hash-kedjad — prediktionsloggens granne). */
const REGIMELOGG_SOK = path.join(process.cwd(), "data", "portfolj-system", "regime-logg.json");

/** Utsnitt av loggraden som klienten får — allt chippet behöver, inget mer. */
export type RegimeUtsnitt = {
  regime: RegimeLoggRad["regime"];
  /** "Läget i underlaget per X" — loggradens snapshot-datering. */
  datum: string;
  beskrivning: string;
  indikatorer: RegimeLoggRad["indikatorer"];
  modellVersion: string;
};

/** Formguard: ser ut som loggfilen (rader-array)? Annars ärligt tomt. */
function arRegimeLogg(x: unknown): x is RegimeLogg {
  if (!x || typeof x !== "object") return false;
  const l = x as Record<string, unknown>;
  return Array.isArray(l.rader) && l.rader.every((r) => r && typeof r === "object");
}

/**
 * Läs senaste loggraden — null när filen saknas, är ogiltig eller inte har
 * några rader ännu (cronen har inte hunnit/kunnat skriva: read-only fs).
 * Ingen kedjeverifiering här: läs-API:t visar; cronen verifierar FÖRE append
 * och lämnar en bruten kedja orörd + rapporterad — det är dess bord.
 */
function lasSenasteRegim(): RegimeUtsnitt | null {
  try {
    const rå = JSON.parse(readFileSync(REGIMELOGG_SOK, "utf8")) as unknown;
    if (!arRegimeLogg(rå)) return null;
    const sista = (rå.rader as RegimeLoggRad[]).at(-1);
    if (!sista || typeof sista.regime !== "string" || typeof sista.datum !== "string") return null;
    return {
      regime: sista.regime,
      datum: sista.datum,
      beskrivning: typeof sista.beskrivning === "string" ? sista.beskrivning : "",
      indikatorer: sista.indikatorer,
      modellVersion: typeof sista.modellVersion === "string" ? sista.modellVersion : "",
    };
  } catch {
    return null; // filen saknas/oläsbar — regim: null, aldrig påhittad
  }
}

let memo: {
  vid: number;
  svar: { finns: boolean; lage: Forskningslage | null; regim: RegimeUtsnitt | null };
} | null = null;

export async function GET() {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) {
    return NextResponse.json(memo.svar, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } });
  }

  const { finns, rader } = lasKorstabellGrund();
  const svar = finns
    ? { finns: true, lage: raknaForskningslage(rader), regim: lasSenasteRegim() }
    : { finns: false, lage: null, regim: lasSenasteRegim() };
  memo = { vid: Date.now(), svar };
  return NextResponse.json(svar, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } });
}
