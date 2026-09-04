import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";
import { raknaForskningslage, type Forskningslage } from "@/lib/forskningslaget";
import type { RegimeLogg, RegimeLoggRad } from "@/lib/akm3/regim";
import { getSupabaseRest } from "@/lib/supabase-rest";

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
 * Läs senaste loggraden — null när ingen källa fungerar.
 * Källordning (prod-sanning först): (1) system_events type=regime_logg —
 * cronen appendar dit; Vercel-fs är read-only så FIL-skrivning bara är en
 * dev-fallback. (2) regime-logg.json lokalt. Ingenting påhittas; ingen
 * kedjeverifiering här — cronen verifierar FÖRE append (dess bord).
 */
async function lasSenasteRegim(): Promise<RegimeUtsnitt | null> {
  try {
    const rå = JSON.parse(readFileSync(REGIMELOGG_SOK, "utf8")) as unknown;
    if (arRegimeLogg(rå)) {
      const sista = (rå.rader as RegimeLoggRad[]).at(-1);
      if (sista && typeof sista.regime === "string" && typeof sista.datum === "string") {
        return {
          regime: sista.regime,
          datum: sista.datum,
          beskrivning: typeof sista.beskrivning === "string" ? sista.beskrivning : "",
          indikatorer: sista.indikatorer,
          modellVersion: typeof sista.modellVersion === "string" ? sista.modellVersion : "",
        };
      }
    }
  } catch {
    // ingen fil på prod — fall till Supabase nedan
  }
  return lasSenasteRegimSupabase();
}

/** Supabase: senaste system_events type=regime_logg (cronens append +
 *  genesis). Kastar aldrig — null vid motstånd, regimen påhittas aldrig. */
async function lasSenasteRegimSupabase(): Promise<RegimeUtsnitt | null> {
  const rest = getSupabaseRest();
  if (!rest) return null;
  try {
    const kontroll = new AbortController();
    const stoppa = setTimeout(() => kontroll.abort(), 6000);
    const url = new URL(rest.origin + "/rest/v1/system_events");
    url.searchParams.set("type", "eq.regime_logg");
    url.searchParams.set("select", "created_at,details");
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "1");
    const res = await fetch(url, {
      headers: rest.headers,
      signal: kontroll.signal,
      cache: "no-store",
    });
    clearTimeout(stoppa);
    if (!res.ok) return null;
    const rader = (await res.json()) as Array<{ details?: Record<string, unknown> }>;
    const d = rader?.[0]?.details;
    if (!d || typeof d.regime !== "string" || typeof d.datum !== "string") return null;
    return {
      regime: d.regime as RegimeLoggRad["regime"],
      datum: d.datum as string,
      beskrivning: typeof d.beskrivning === "string" ? d.beskrivning : "",
      indikatorer: d.indikatorer as RegimeLoggRad["indikatorer"],
      modellVersion: typeof d.modellVersion === "string" ? d.modellVersion : "",
    };
  } catch {
    return null;
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
  const regim = await lasSenasteRegim();
  const svar = finns
    ? { finns: true, lage: raknaForskningslage(rader), regim }
    : { finns: false, lage: null, regim };
  memo = { vid: Date.now(), svar };
  return NextResponse.json(svar, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } });
}
