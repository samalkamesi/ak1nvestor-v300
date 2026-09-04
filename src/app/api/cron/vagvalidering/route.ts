import { NextResponse, NextRequest } from "next/server";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { lasCache, lasEllerHamta } from "@/lib/datacache";
import { körVagfundament, type MotorSvar } from "@/lib/vagfundament-motor";
import { publiceraOrganEvent } from "@/lib/organ-event";
import {
  VAGVALIDERING_SCHEMA,
  VAGVALIDERING_PROTOKOLL_VERSION,
  VALIDERING_HORIZONTER,
  klassFranTal,
  momentumMedelPerHorisont,
  byggaDomar,
  rullaFram,
  tomRullande,
  traffProcent,
  osattAndelProcent,
  antalDomda,
  byggVagvalideringRapport,
  type VagKlass,
  type VagvalideringDom,
  type RullandeTillstand,
  type MomentumIndikator,
} from "@/lib/vagvalidering";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/vagvalidering — VÅGVALIDERINGS-KITET (VÅG 56 bygg-A).
 * STYRELSE-vag-exakthet.md rekommendation 1 + §3: automatiserar kundens Träff
 * ✓/✗-kultur — utan mätning av utfall kan "högst exakthet" varken bevisas
 * eller förbättras. Körs av Vercel Cron 05:30 UTC (efter vågskanningen 05:00,
 * före datacentralen 06:00 — tidsläget ledigt i vercel.json).
 *
 * Daglig rond, billigt (noll/få nätanrop utöver Supabase):
 *   (a) FÖRRA rondens vågklasser ur senaste type=vagscan-event FÖRE idag
 *       (reserv: datacache-cachens vagfundament-rader).
 *   (b) DAGENS faktiska fundamentmomentum ur dagens vagscan-event; saknas den
 *       återmotorn via datacache (lasEllerHamta — cache först, Yahoo först vid
 *       kall cache, samma mönster som /api/vagfundament).
 *   (c) DOM enligt protokoll vagvalidering/1 (ren funktion i src/lib/
 *       vagvalidering.ts, testad i 100%-sviten): impulsvåg→träff vid positiv
 *       momentum, korrigering→negativ, basbygge→|momentum| ≤ 6 %, osatt döms
 *       aldrig.
 *   (d) EN system_events-rad type=vagvalidering med dagens domar + RULLANDE
 *       träff-% per (horisont, klass) — räknarna bärs fram i details
 *       (idempotent: redan domad dag → inget nytt, inget dubbelräknat).
 *   (e) publiceraOrganEvent (organ/vagvalidering) + rapport till
 *       data/rapporter/vagvalidering-SENASTE.md (graceful på read-only fs).
 *
 * FAIL-SAFE: utan Supabase/nät körs ronden ändå (domar utan underlag blir
 * osatta — hederligt) och rutten svarar alltid 200 med sitt mätprotokoll.
 */

// AKM1-universum — 12 tickers (samma lista som cron/vagscan och cron/datacache)
const UNIVERSUM = [
  "VOLV-B.ST", "SAAB-B.ST", "ATCO-A.ST", "SAND.ST", "SWED-A.ST", "ESSITY-B.ST",
  "ERIC-B.ST", "AZN.ST", "NDA-SE.ST", "SKF-B.ST", "ALFA.ST", "SHB-B.ST",
];

/** Max-ålder för datacache-rader i motor-fallbacken (samma fönster som /api/vagfundament). */
const CACHE_MAX_ALDER_MIN = 720;

type EventRad = { details: Record<string, unknown> | null; created_at: string };

/** Postform i vagscan-eventets details.tickers (strukturmässigt utsnitt). */
type ScanTicker = {
  ticker?: string;
  fel?: string | null;
  total?: Record<string, number | null> | null;
  indikatorer?: Record<string, MomentumIndikator> | null;
};

/** Läser N senaste system_events-rader av en typ (details + created_at, fallande). */
async function lasEventRader(sb: ReturnType<typeof getSupabaseRest>, typ: string, limit: number): Promise<EventRad[]> {
  if (!sb) return [];
  try {
    const res = await fetch(
      `${sb.origin}/rest/v1/system_events?type=eq.${typ}&select=details,created_at&order=created_at.desc&limit=${limit}`,
      { headers: sb.headers, cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return [];
    const rader = (await res.json()) as EventRad[];
    return Array.isArray(rader) ? rader : [];
  } catch {
    return [];
  }
}

/** UTC-kalenderdag (YYYY-MM-DD) ur en ISO-sträng — deterministisk dagjämförelse. */
function dagIso(iso: string): string {
  return String(iso).slice(0, 10);
}

/** Finns tidigare rullande räknare? Bärvärde ur senaste vagvalidering-radens details. */
function lasBarande(details: Record<string, unknown> | null): RullandeTillstand | null {
  const r = details?.rullande;
  return r && typeof r === "object" ? (r as RullandeTillstand) : null;
}

/** Klasskarta per ticker ur en runds total-tal (±0,50 — motorns egna gränser). */
function klasserFranScan(details: Record<string, unknown> | null): Record<string, Record<string, VagKlass>> {
  const ut: Record<string, Record<string, VagKlass>> = {};
  const tickers = Array.isArray(details?.tickers) ? (details?.tickers as ScanTicker[]) : [];
  for (const t of tickers) {
    if (!t || typeof t !== "object" || t.fel || !t.ticker || !t.total) continue;
    ut[t.ticker] = {};
    for (const hz of VALIDERING_HORIZONTER) {
      ut[t.ticker][hz] = klassFranTal(t.total[hz]);
    }
  }
  return ut;
}

/** Momentumkarta per ticker ur en runds indikatorer (teckenfört medel, 1 decimal). */
function momenterFranScan(details: Record<string, unknown> | null): Record<string, Record<string, number | null>> {
  const ut: Record<string, Record<string, number | null>> = {};
  const tickers = Array.isArray(details?.tickers) ? (details?.tickers as ScanTicker[]) : [];
  for (const t of tickers) {
    if (!t || typeof t !== "object" || t.fel || !t.ticker || !t.indikatorer) continue;
    ut[t.ticker] = momentumMedelPerHorisont(t.indikatorer);
  }
  return ut;
}

/** Reserv: klasser ur datacache-cachens senaste vagfundament-rader (valfri ålder). */
async function klasserFranDatacache(): Promise<Record<string, Record<string, VagKlass>>> {
  const ut: Record<string, Record<string, VagKlass>> = {};
  for (const t of UNIVERSUM) {
    const rad = await lasCache(t, "vagfundament");
    const data = rad?.data as ScanTicker | null | undefined;
    if (!data || typeof data !== "object" || data.fel || !data.total) continue;
    ut[t] = {};
    for (const hz of VALIDERING_HORIZONTER) {
      ut[t][hz] = klassFranTal(data.total[hz]);
    }
  }
  return ut;
}

/** Kör jobb i omgångar om `tak` (samma Yahoo-vänlighet som /api/vagfundament). */
async function iOmgangar<T>(jobb: (() => Promise<T>)[], tak = 4): Promise<T[]> {
  const ut: T[] = [];
  for (let i = 0; i < jobb.length; i += tak) {
    ut.push(...(await Promise.all(jobb.slice(i, i + tak).map((j) => j()))));
  }
  return ut;
}

/**
 * Fallback-momentum: återmotorn via datacache — cache FÖRE nät, en delad
 * (memoiserad) universumkörning serverar alla kalla tickers, omgångar om 4.
 */
async function momenterFranMotor(): Promise<Record<string, Record<string, number | null>>> {
  let gemensam: Promise<MotorSvar> | null = null;
  const korUniversum = (): Promise<MotorSvar> => (gemensam ??= körVagfundament({ tickers: UNIVERSUM }));
  const rader = await iOmgangar(
    UNIVERSUM.map((t) => async () => {
      const { data } = await lasEllerHamta(
        t,
        "vagfundament",
        async () => (await korUniversum()).tickers.find((r) => r.ticker === t) ?? null,
        CACHE_MAX_ALDER_MIN,
      );
      return data as ScanTicker | null;
    }),
  );
  const ut: Record<string, Record<string, number | null>> = {};
  for (const rad of rader) {
    if (!rad || typeof rad !== "object" || rad.fel || !rad.ticker || !rad.indikatorer) continue;
    ut[rad.ticker] = momentumMedelPerHorisont(rad.indikatorer);
  }
  return ut;
}

export async function GET(req: NextRequest) {
  // samma skydd som övriga cron-rutter: om CRON_SECRET är satt krävs matchning
  // via ?secret= (query) eller Authorization: Bearer (Vercel Cron).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const sb = getSupabaseRest();
  const nu = new Date();
  const dagensDatum = dagIso(nu.toISOString());

  // 1) senaste vagvalidering — idempotens + räklarbärare
  const tidigare = (await lasEventRader(sb, "vagvalidering", 1))[0] ?? null;
  if (tidigare?.details && tidigare.details.datum === dagensDatum) {
    // dagens rond redan avgjord — döms aldrig två gånger
    const d = tidigare.details;
    return NextResponse.json({
      idempotent: true,
      datum: dagensDatum,
      genererad: typeof d.genererad === "string" ? d.genererad : tidigare.created_at,
      nyaDomer: typeof d.nyaDomer === "number" ? d.nyaDomer : 0,
      rullande: d.rullande ?? null,
      disclaimer: "Pedagogisk analys — inte investeringsråd",
    });
  }

  // 2) vagscan-ronderna — dagens (momentum) och förra (klasser)
  const scans = await lasEventRader(sb, "vagscan", 2);
  const dagensScan = scans.find((s) => dagIso(s.created_at) === dagensDatum) ?? null;
  const forraScan = scans.find((s) => dagIso(s.created_at) < dagensDatum) ?? null;

  // 3) förra rondens klasser (vagscan-event → reserv: datacache)
  let klasser: Record<string, Record<string, VagKlass>> = {};
  let kallaKlasser = "ingen";
  if (forraScan?.details) {
    klasser = klasserFranScan(forraScan.details);
    if (Object.keys(klasser).length > 0) kallaKlasser = "vagscan-event";
  }
  if (Object.keys(klasser).length === 0) {
    klasser = await klasserFranDatacache();
    if (Object.keys(klasser).length > 0) kallaKlasser = "datacache (senaste cachade vagfundament-rader)";
  }

  // 4) dagens faktiska momentum (vagscan-event → reserv: återmotor via datacache)
  let momenter: Record<string, Record<string, number | null>> = {};
  let kallaMomentum = "ingen";
  if (dagensScan?.details) {
    momenter = momenterFranScan(dagensScan.details);
    if (Object.keys(momenter).length > 0) kallaMomentum = "vagscan-event";
  }
  if (Object.keys(momenter).length === 0) {
    try {
      momenter = await momenterFranMotor();
      if (Object.keys(momenter).length > 0) kallaMomentum = "motor via datacache (lasEllerHamta)";
    } catch {
      momenter = {}; // nätet borta → osatta domar, aldrig gissade
    }
  }

  // 5) domar + rullande räknare (rena funktioner, testade i 100%-sviten)
  const domar: VagvalideringDom[] = byggaDomar(UNIVERSUM, klasser, momenter);
  const barande = lasBarande(tidigare?.details ?? null);
  const rullande = rullaFram(barande, domar);
  const rullandeSedan =
    typeof tidigare?.details?.rullandeSedan === "string" ? tidigare.details.rullandeSedan : dagensDatum;

  let tTraff = 0;
  let tMiss = 0;
  let tOsatt = 0;
  for (const hz of VALIDERING_HORIZONTER) {
    for (const klass of ["impulsvåg", "korrigering", "basbygge", "osatt"] as const) {
      const r = rullande[hz]?.[klass];
      if (!r) continue;
      tTraff += r.traff;
      tMiss += r.miss;
      tOsatt += r.osatt;
    }
  }
  const totaltProcent = tTraff + tMiss > 0 ? Math.round((100 * tTraff) / (tTraff + tMiss)) : null;
  const totaltOsatt = tTraff + tMiss + tOsatt > 0 ? Math.round((100 * tOsatt) / (tTraff + tMiss + tOsatt)) : null;
  const nyaDomer = domar.filter((d) => d.dom !== "osatt").length;

  const sammanstallning = {
    genererad: nu.toISOString(),
    datum: dagensDatum,
    universum: UNIVERSUM,
    kallaKlasser,
    kallaMomentum,
    domar,
    rullande,
    rullandeSedan,
  };

  // 6) EN skrivning per rond — system_events type=vagvalidering (tyst vid fel)
  let supabaseSparad = false;
  if (sb) {
    try {
      const res = await fetch(`${sb.origin}/rest/v1/system_events`, {
        method: "POST",
        headers: { ...sb.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: "vagvalidering",
          severity: "info",
          message:
            "Vågvalidering: " +
            (totaltProcent === null ? "inga dömda mätningar än" : String(totaltProcent) + " % träff") +
            " (n=" + String(tTraff + tMiss) + " dömda" +
            (totaltOsatt !== null ? ", osatta " + String(totaltOsatt) + " %" : "") +
            ") — " + String(nyaDomer) + " nya domar idag",
          details: {
            schema: VAGVALIDERING_SCHEMA,
            protokollVersion: VAGVALIDERING_PROTOKOLL_VERSION,
            genererad: sammanstallning.genererad,
            datum: dagensDatum,
            universum: UNIVERSUM,
            kallaKlasser,
            kallaMomentum,
            nyaDomer,
            domar,
            rullande,
            rullandeSedan,
            notering:
              "Dom-protokoll v1: förra rondens klass döms mot dagens faktiska medel-momentum (impulsvåg>0, korrigering<0, basbygge |mom|<=6%). Osatt döms aldrig. Räknarna bärs fram per rond sedan rullandeSedan.",
          },
          source: "cron/vagvalidering",
        }),
        signal: AbortSignal.timeout(10000),
      });
      supabaseSparad = res.ok;
    } catch {
      // tyst — svaret returneras alltid
    }
  }

  // 7) OrganEvent — nervsystemets puls (fail-safe: kastar aldrig)
  await publiceraOrganEvent({
    source: "organ/vagvalidering",
    verb: "rapport",
    matt: {
      datum: dagensDatum,
      protokoll: VAGVALIDERING_PROTOKOLL_VERSION,
      nyaDomer,
      nyaOsatta: domar.length - nyaDomer,
      rullandeTraffProcent: totaltProcent ?? -1,
      rullandeN: tTraff + tMiss,
      rullandeOsattProcent: totaltOsatt ?? -1,
      kallaKlasser,
      kallaMomentum,
      sparad: supabaseSparad,
    },
  });

  // 8) rapporten — data/rapporter/vagvalidering-SENASTE.md (graceful read-only)
  let rapportSkrivad = false;
  try {
    const rapportSok = path.join(process.cwd(), "data", "rapporter", "vagvalidering-SENASTE.md");
    mkdirSync(path.dirname(rapportSok), { recursive: true });
    writeFileSync(rapportSok, byggVagvalideringRapport(sammanstallning), "utf8");
    rapportSkrivad = true;
  } catch {
    // read-only fs (t.ex. Vercel) — rapporten finns i system_events-raden
  }

  return NextResponse.json({
    idempotent: false,
    genererad: sammanstallning.genererad,
    datum: dagensDatum,
    kallaKlasser,
    kallaMomentum,
    nyaDomer,
    nyaOsatta: domar.length - nyaDomer,
    domar,
    rullande,
    rullandeSedan,
    rullandeTraffProcent: totaltProcent,
    rullandeN: tTraff + tMiss,
    rullandeOsattProcent: totaltOsatt,
    supabaseSparad,
    rapportSkrivad,
    protokoll: { schema: VAGVALIDERING_SCHEMA, version: VAGVALIDERING_PROTOKOLL_VERSION },
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}
