import { NextResponse, NextRequest } from "next/server";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { lasCache, lasEllerHamta } from "@/lib/datacache";
import { körVagfundament, type MotorSvar } from "@/lib/vagfundament-motor";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";
import { raknaForskningslage } from "@/lib/forskningslaget";
import {
  raknaRegime,
  byggRegimeLoggrad,
  raknaRegimehash,
  stemplaRegimeRad,
  verifieraRegimekedja,
  REGIM_MODELL_VERSION,
  REGIMELOGG_GENESIS,
  type RegimeLogg,
  type RegimeLoggRad,
  type RegimeTyp,
  type Sha256Funktion,
} from "@/lib/akm3/regim";
import {
  VAGVALIDERING_SCHEMA,
  VAGVALIDERING_PROTOKOLL_VERSION,
  TROSKEL_PROCENT_PER_HORIZONT,
  TROSKEL_V2_BESLUTAD,
  TROSKEL_V2_ORSAK,
  VALIDERING_HORIZONTER,
  klassFranTal,
  momentumMedelPerHorisont,
  domVagvalidering,
  byggaDomar,
  byggaVariabelDomar,
  raknaVariabelRaknare,
  rullaFram,
  tomRullande,
  traffProcent,
  osattAndelProcent,
  antalDomda,
  byggVagvalideringRapport,
  type VagKlass,
  type VagvalideringDom,
  type VagvalideringVariabelDom,
  type RullandeTillstand,
  type MomentumIndikator,
} from "@/lib/vagvalidering";
import { byggVagSpegelFranRullande } from "@/lib/dataset-nyckeltal";

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
 *   (c) DOM enligt protokoll vagvalidering/1 v2 (ren funktion i src/lib/
 *       vagvalidering.ts, testad i 100%-sviten): impulsvåg→träff vid positiv
 *       momentum, korrigering→negativ, basbygge→|momentum| ≤ tröskel PER
 *       HORISONT (mikro/kort 6 % · medellång 15 % · lång/mega 25 % — AKM3-
 *       BESLUT §7), osatt döms aldrig. Första v2-körningen NOLLSTÄLLER de
 *       rullande räknarna med deklarerad orsak (FORBUD §10.6: en ändring
 *       per protokollversion).
 *   (d) EN system_events-rad type=vagvalidering med dagens domar + RULLANDE
 *       träff-% per (horisont, klass) — räknarna bärs fram i details
 *       (idempotent: redan domad dag → inget nytt, inget dubbelräknat).
 *       SEDAN VÅG 59 bygg-1 (BESLUT §7) även BANA B i samma rad: tabellen
 *       vagvalidering_dom (per ticker × variabel × horisont: förra klassen
 *       mot variabelns EGEN momentum, episodkedjad — klassbyte/osatt
 *       avgränsar episoden) + variabelRaknare + episodAntal.
 *   (e) publiceraOrganEvent (organ/vagvalidering) + rapport till
 *       data/rapporter/vagvalidering-SENASTE.md (graceful på read-only fs).
 *   (f) SEDAN VÅG 60 bygg-A (BESLUT §8 steg 5): AKM3-regimen — deskriptiv +
 *       loggad. Räknas ur dagens data (G/R ur korstabellen, N ur senaste
 *       vagscan-event om läsbart annars osatt-degradering) med hysteres +
 *       2-snapshots-bekräftelse (3 vid års-Σu > 25 %); regime-loggen
 *       data/portfolj-system/regime-logg.json appendas vid REGLERAD
 *       förändring (hash-kedjad som prediktionsloggen). Regimen väljer
 *       ALDRIG profil och ändrar ALDRIG poäng (BESLUT §9.1).
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
  indikatorer?: Record<string, MomentumIndikator & { vager?: Record<string, unknown> }> | null;
};

/** Per-variabel-kartor (Bana B): ticker → variabel → horisont → klass/momentum. */
type PerVariabelKlasser = Record<string, Record<string, Record<string, unknown>>>;
type PerVariabelMomenter = Record<string, Record<string, Record<string, number | null>>>;

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

// ── BANA B (AKM3-BESLUT §7, våg 59 bygg-1): per-variabel klasser + momenter ──

/** Klass per (ticker, variabel, horisont) ur en runds indikatorer.vager. */
function perVariabelKlasserFranScan(details: Record<string, unknown> | null): PerVariabelKlasser {
  const ut: PerVariabelKlasser = {};
  const tickers = Array.isArray(details?.tickers) ? (details?.tickers as ScanTicker[]) : [];
  for (const t of tickers) {
    if (!t || typeof t !== "object" || t.fel || !t.ticker || !t.indikatorer) continue;
    ut[t.ticker] = {};
    for (const [v, ind] of Object.entries(t.indikatorer)) {
      if (!ind || typeof ind !== "object") continue;
      ut[t.ticker][v] = (ind as { vager?: Record<string, unknown> }).vager ?? {};
    }
  }
  return ut;
}

/** Momentum per (ticker, variabel, horisont) ur en runds indikatorer.momentum
 *  — variabelns EGEN serie, inte universumets medeltal (Bana B:s mätobjekt). */
function perVariabelMomenterFranScan(details: Record<string, unknown> | null): PerVariabelMomenter {
  const ut: PerVariabelMomenter = {};
  const tickers = Array.isArray(details?.tickers) ? (details?.tickers as ScanTicker[]) : [];
  for (const t of tickers) {
    if (!t || typeof t !== "object" || t.fel || !t.ticker || !t.indikatorer) continue;
    ut[t.ticker] = {};
    for (const [v, ind] of Object.entries(t.indikatorer)) {
      if (!ind || typeof ind !== "object") continue;
      ut[t.ticker][v] = (ind as MomentumIndikator).momentum ?? {};
    }
  }
  return ut;
}

/** Klass per (variabel, horisont) ur en ScanTicker-formad datacache-rad. */
function perVariabelKlasserFranRad(rad: unknown): Record<string, Record<string, unknown>> {
  const data = rad as ScanTicker | null | undefined;
  if (!data || typeof data !== "object" || data.fel || !data.indikatorer) return {};
  const ut: Record<string, Record<string, unknown>> = {};
  for (const [v, ind] of Object.entries(data.indikatorer)) {
    if (!ind || typeof ind !== "object") continue;
    ut[v] = (ind as { vager?: Record<string, unknown> }).vager ?? {};
  }
  return ut;
}

/** Momentum per (variabel, horisont) ur en ScanTicker-formad datacache-rad. */
function perVariabelMomenterFranRad(rad: unknown): Record<string, Record<string, number | null>> {
  const data = rad as ScanTicker | null | undefined;
  if (!data || typeof data !== "object" || data.fel || !data.indikatorer) return {};
  const ut: Record<string, Record<string, number | null>> = {};
  for (const [v, ind] of Object.entries(data.indikatorer)) {
    if (!ind || typeof ind !== "object") continue;
    ut[v] = (ind as MomentumIndikator).momentum ?? {};
  }
  return ut;
}

/** Reserv: klasser ur datacache-cachens senaste vagfundament-rader (valfri ålder).
 *  Total-klasserna (Bana A) OCH per-variabel-klasserna (Bana B) ur samma rad. */
async function klasserFranDatacache(): Promise<{
  total: Record<string, Record<string, VagKlass>>;
  perVariabel: PerVariabelKlasser;
}> {
  const total: Record<string, Record<string, VagKlass>> = {};
  const perVariabel: PerVariabelKlasser = {};
  for (const t of UNIVERSUM) {
    const rad = await lasCache(t, "vagfundament");
    const data = rad?.data as ScanTicker | null | undefined;
    if (!data || typeof data !== "object" || data.fel || !data.total) continue;
    total[t] = {};
    for (const hz of VALIDERING_HORIZONTER) {
      total[t][hz] = klassFranTal(data.total[hz]);
    }
    perVariabel[t] = perVariabelKlasserFranRad(data);
  }
  return { total, perVariabel };
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
 * Returnerar MEDEL-momenten (Bana A) OCH per-variabel-momenten (Bana B).
 */
async function momenterFranMotor(): Promise<{
  medel: Record<string, Record<string, number | null>>;
  perVariabel: PerVariabelMomenter;
}> {
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
  const medel: Record<string, Record<string, number | null>> = {};
  const perVariabel: PerVariabelMomenter = {};
  for (const rad of rader) {
    if (!rad || typeof rad !== "object" || rad.fel || !rad.ticker || !rad.indikatorer) continue;
    medel[rad.ticker] = momentumMedelPerHorisont(rad.indikatorer);
    perVariabel[rad.ticker] = perVariabelMomenterFranRad(rad);
  }
  return { medel, perVariabel };
}

// ── AKM3-regimen (våg 60 bygg-A, BESLUT §8 steg 5) ──────────────────────────

/** Regime-loggens hem — append-only + hash-kedjad (prediktionsloggens granne). */
const REGIMELOGG_SOK = path.join(process.cwd(), "data", "portfolj-system", "regime-logg.json");

/** sha-256 (hex) — injiceras till lib:ts rena kedjefunktioner (klientsäkert). */
const sha256Regim: Sha256Funktion = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");

/** Formguard: ser ut som loggfilen (rader-array)? Annars ärligt tomt. */
function arRegimeLogg(x: unknown): x is RegimeLogg {
  if (!x || typeof x !== "object") return false;
  const l = x as Record<string, unknown>;
  return Array.isArray(l.rader) && l.rader.every((r) => r && typeof r === "object");
}

/** Läs regime-loggen — null när filen saknas/är ogiltig (första mätningen). */
function lasRegimeLogg(): RegimeLogg | null {
  try {
    const rå = JSON.parse(readFileSync(REGIMELOGG_SOK, "utf8")) as unknown;
    return arRegimeLogg(rå) ? rå : null;
  } catch {
    return null;
  }
}

/**
 * KEDJEBAS UR SYSTEM_EVENTS (VÅG 63 bygg-1, O4-robusthet §6): på prod är
 * regime-loggen frusen sedan build (read-only fs — writeFileSync misslyckas
 * tyst), så varje REGLERAD förändring kedjade mot samma prevHash = syskon-
 * rader, inte en kedja. Fallback: varje akm3_regime-event (skrivs av denna
 * cron sedan VÅG 63) bär sin STAMPADE rad i details.loggRad — DB:n vinner
 * som kedjebas när den är den sanna fortsättningen på filens huvud (se
 * basvalet i GET). Regime-rader är glesa (reglerade förändringar), därför
 * ett eget event per rad: fönstret 100 räcker årtionden och payloaden
 * hålls minimal (select=details->loggRad).
 */
async function lasRegimeKedjebasUrEventer(
  sb: ReturnType<typeof getSupabaseRest>,
  limit = 100,
): Promise<RegimeLoggRad[]> {
  if (!sb) return [];
  try {
    const res = await fetch(
      `${sb.origin}/rest/v1/system_events?type=eq.akm3_regime&select=details->loggRad&order=created_at.desc&limit=${limit}`,
      { headers: sb.headers, cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return [];
    const svar = (await res.json()) as Array<{ loggRad?: unknown } | null>;
    const ut: RegimeLoggRad[] = [];
    for (const r of Array.isArray(svar) ? svar : []) {
      const lr = r?.loggRad;
      if (lr && typeof lr === "object" && typeof (lr as RegimeLoggRad).hash === "string") {
        ut.push(lr as RegimeLoggRad);
      }
    }
    return ut.reverse(); // fallande → stigande
  } catch {
    return [];
  }
}

/**
 * Länkkontroll för en rekonstruerad DB-kedja: varje rads (≥ 2) hash omräknas
 * mot föregående rads hash. Fönstrets huvud får vara trunkerat — regime-
 * rader bär ingen egen prevHash (kedjan är implicit rad→rad), så rad 1 i
 * fönstret kan inte verifieras mot sin osedda föregångare; append-only-
 * kontraktet (§10.10) kräver hel länk framåt, och sista radens äkthet
 * garanteras transivt av kedjan bakåt inom fönstret.
 */
function regimeDbLankarOk(rader: readonly RegimeLoggRad[]): boolean {
  for (let i = 1; i < rader.length; i += 1) {
    const rad = rader[i];
    const fore = rader[i - 1];
    if (!rad || !fore || typeof rad.hash !== "string" || typeof fore.hash !== "string") return false;
    if (raknaRegimehash(rad, fore.hash, sha256Regim) !== rad.hash) return false;
  }
  return true;
}

/**
 * N (netto fundamental vågbredd) + antal MÄTTA vågbolag ur ett vagscan-events
 * details: (impulsvåg − korrigering) / (impulsvåg + korrigering + basbygge)
 * över universumSammanfattningen; antalet = fel-fria tickers i eventet.
 * Oläsbart ⇒ { null, null } — regimen degraderar ärligt till G/R-only.
 */
function nettoVagbreddFranScan(details: Record<string, unknown> | null): {
  netto: number | null;
  antal: number | null;
} {
  if (!details) return { netto: null, antal: null };
  const u = details.universumSammanfattning as
    | { impulsvag?: unknown; korrigering?: unknown; basbygge?: unknown }
    | undefined;
  const i = Number(u?.impulsvag);
  const k = Number(u?.korrigering);
  const b = Number(u?.basbygge);
  const tickers = Array.isArray(details.tickers) ? (details.tickers as ScanTicker[]) : [];
  const antal = tickers.filter((t) => t && typeof t === "object" && !t.fel && typeof t.ticker === "string").length;
  if (!Number.isFinite(i) || !Number.isFinite(k) || !Number.isFinite(b)) {
    return { netto: null, antal: antal > 0 ? antal : null };
  }
  const namn = i + k + b;
  return {
    netto: namn > 0 ? Math.round(((i - k) / namn) * 1000) / 1000 : null,
    antal: antal > 0 ? antal : null,
  };
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

  // 3) förra rondens klasser (vagscan-event → reserv: datacache) — BANA A
  //    (total-klasserna) och BANA B (per variabel) ur samma källor.
  let klasser: Record<string, Record<string, VagKlass>> = {};
  let klasserPerVariabel: PerVariabelKlasser = {};
  let kallaKlasser = "ingen";
  let domatDatum = ""; // klassens datum — känt endast för vagscan-källan (aldrig påhittat)
  if (forraScan?.details) {
    klasser = klasserFranScan(forraScan.details);
    klasserPerVariabel = perVariabelKlasserFranScan(forraScan.details);
    domatDatum = dagIso(forraScan.created_at);
    if (Object.keys(klasser).length > 0) kallaKlasser = "vagscan-event";
  }
  if (Object.keys(klasser).length === 0) {
    const reserv = await klasserFranDatacache();
    klasser = reserv.total;
    klasserPerVariabel = reserv.perVariabel;
    if (Object.keys(klasser).length > 0) kallaKlasser = "datacache (senaste cachade vagfundament-rader)";
  }

  // 4) dagens faktiska momentum (vagscan-event → reserv: återmotor via datacache)
  let momenter: Record<string, Record<string, number | null>> = {};
  let momenterPerVariabel: PerVariabelMomenter = {};
  let kallaMomentum = "ingen";
  if (dagensScan?.details) {
    momenter = momenterFranScan(dagensScan.details);
    momenterPerVariabel = perVariabelMomenterFranScan(dagensScan.details);
    if (Object.keys(momenter).length > 0) kallaMomentum = "vagscan-event";
  }
  if (Object.keys(momenter).length === 0) {
    try {
      const reserv = await momenterFranMotor();
      momenter = reserv.medel;
      momenterPerVariabel = reserv.perVariabel;
      if (Object.keys(momenter).length > 0) kallaMomentum = "motor via datacache (lasEllerHamta)";
    } catch {
      momenter = {}; // nätet borta → osatta domar, aldrig gissade
      momenterPerVariabel = {};
    }
  }

  // 4b) PROTKOLL v2-BYTE (AKM3-BESLUT §7): första körningen med version 2 ⇒
  //     räknarna NOLLSTÄLLS (en ändring per protokollversion, FORBUD §10.6),
  //     orsaken deklareras öppet och rullandeSedan sätts till versionsbytets
  //     datum. Bana A-räknarna börjar om från noll under v2:s trösklar.
  const tidigareVersion =
    typeof tidigare?.details?.protokollVersion === "number"
      ? tidigare.details.protokollVersion
      : tidigare?.details
        ? 1 // äldre rader (före fältet) var alla v1
        : null;
  const protokollByte =
    tidigareVersion !== null && tidigareVersion < VAGVALIDERING_PROTOKOLL_VERSION
      ? {
          fran: tidigareVersion,
          till: VAGVALIDERING_PROTOKOLL_VERSION,
          beslutad: TROSKEL_V2_BESLUTAD,
          orsak: TROSKEL_V2_ORSAK,
          raknareNollstallda: dagensDatum,
        }
      : null;

  // 5) domar + rullande räknare (rena funktioner, testade i 100%-sviten)
  const domar: VagvalideringDom[] = byggaDomar(UNIVERSUM, klasser, momenter);
  const barande = protokollByte ? null : lasBarande(tidigare?.details ?? null); // nollställning vid byte
  const rullande = rullaFram(barande, domar);
  const rullandeSedan = protokollByte
    ? dagensDatum // räknarna börjar om under v2
    : typeof tidigare?.details?.rullandeSedan === "string"
      ? tidigare.details.rullandeSedan
      : dagensDatum;

  // 5b) BANA B (BESLUT §7): per-variabel-domar med episodkedja — tabellen
  //     vagvalidering_dom (STYRELSE §3.2 exakt). Episod-identiteten ärvs från
  //     föregående events rader när klassen är oförändrad; klassbyte/osatt
  //     startar ny episod. Domen dömer med v2:s horisonttrösklar.
  const tidigareDomRader: VagvalideringVariabelDom[] = Array.isArray(
    (tidigare?.details as { vagvalidering_dom?: unknown } | null)?.vagvalidering_dom,
  )
    ? ((tidigare?.details as unknown as { vagvalidering_dom: VagvalideringVariabelDom[] }).vagvalidering_dom)
    : [];
  const variabelDomar = byggaVariabelDomar(
    UNIVERSUM,
    klasserPerVariabel,
    momenterPerVariabel,
    tidigareDomRader,
    domatDatum,
    dagensDatum,
  );
  const variabelRaknare = raknaVariabelRaknare(variabelDomar);
  const variabelDomda = variabelDomar.filter((d) => domVagvalidering(d.klass, d.utfall_momentum, d.horisont) !== "osatt").length;
  const episodSet = new Set<string>();
  for (const d of variabelDomar) episodSet.add(d.episod_id);

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

  // 5c) AKM3-REGIMEN (våg 60 bygg-A, BESLUT §8 steg 5): räkna regimen ur
  //     dagens data + append regime-loggen vid REGLERAD förändring (genesis,
  //     bekräftat byte eller kandidatrörelse — hysteresminnet bärs av loggen).
  //     G/R ur korstabellen via raknaForskningslage (kanoniska tal 0,10/0,08/
  //     0,35/0,30 i lib:t); N ur SENASTE vagscan-event om läsbart, annars
  //     osatt-degradering (n-vakt: N gäller först vid ≥ 30 mätta vågbolag —
  //     idag 12 ⇒ G/R-only). Σu (vagkon) kopplas när N aktiveras: osatt ⇒
  //     standard 2 bekräftelse-snapshots. Regimen är ENBART deskriptiv +
  //     loggad — den väljer ALDRIG profil och ändrar ALDRIG poäng
  //     (viktprofil-kopplingen AVSLOGEN, BESLUT §9.1).
  const regimeStatus: {
    las: boolean;
    verifierad: boolean;
    regime: RegimeTyp | null;
    byte: boolean;
    kandidat: RegimeLoggRad["kandidat"];
    indikatorer: RegimeLoggRad["indikatorer"] | null;
    nOsattOrsak: string;
    loggSkriven: boolean;
    notis: string;
    /** Var kedjebasen lästes ifrån (VÅG 63 bygg-1): filen eller system_events. */
    kalla: "fil" | "system_events";
    /** true när den stampade raden sparades som akm3_regime-event (prod-spår). */
    dbSparad: boolean;
  } = {
    las: false,
    verifierad: false,
    regime: null,
    byte: false,
    kandidat: null,
    indikatorer: null,
    nOsattOrsak: "",
    loggSkriven: false,
    notis: "",
    kalla: "fil",
    dbSparad: false,
  };
  const regimeLoggLäst = lasRegimeLogg();
  const regimeFilRader: RegimeLoggRad[] = regimeLoggLäst ? regimeLoggLäst.rader : [];

  // KEDJEBAS (VÅG 63 bygg-1): DB:n vinner när den är den SANNA fortsättningen
  // på filen — på prod frös filen med build och växer aldrig; DB:n är då
  // sanningen. Regime-rader bär ingen egen prevHash, men länken kan OMRÄKNAS:
  // om NÅGON DB-rad hashas exakt av filens sista hash är DB:n en fortsättning
  // på filens huvud (prod-fallet, oavsett hur många ronder som gått). Saknas
  // en sådan rad är filen framme eller kedjorna förgrenade → filen (dev-
  // sanningen; en eventuell DB-förgrening lämnas orörd och rapporteras av
  // länkkontrollen).
  const regimeDbRader = await lasRegimeKedjebasUrEventer(sb);
  const regimeFilSista = regimeFilRader.length > 0 ? regimeFilRader[regimeFilRader.length - 1] : null;
  const anvandDbBas =
    regimeDbRader.length > 0 &&
    (regimeFilSista === null ||
      regimeDbRader.some(
        (rad) =>
          typeof regimeFilSista?.hash === "string" &&
          raknaRegimehash(rad, regimeFilSista.hash, sha256Regim) === rad.hash,
      ));
  const regimeBas: RegimeLoggRad[] = anvandDbBas ? regimeDbRader : regimeFilRader;
  regimeStatus.kalla = anvandDbBas ? "system_events" : "fil";

  if (regimeBas.length > 0) {
    regimeStatus.las = true;
    regimeStatus.verifierad =
      regimeBas === regimeFilRader
        ? verifieraRegimekedja(regimeFilRader, sha256Regim)
        : regimeDbLankarOk(regimeBas);
    if (!regimeStatus.verifierad) {
      regimeStatus.notis =
        "Befintlig regime-kedja (källa: " + regimeStatus.kalla + ") verifierar EJ mot sin hash-kedja — loggen lämnas orörd och ingen rad skrivs (append-only: öppen rapport, ALDRIG tyst överskrivning).";
    }
  }
  // Förra raden är bara minne värt om kedjan hänger ihop — en bruten kedja
  // är ingen historia att bygga hysteres på.
  const regimeTidigare: RegimeLoggRad | null =
    regimeStatus.verifierad && regimeBas.length > 0 ? regimeBas[regimeBas.length - 1] : null;

  const { finns: korstabellFinns, rader: korstabellRader } = lasKorstabellGrund();
  const lage = korstabellFinns ? raknaForskningslage(korstabellRader) : null;
  const rodAndel = lage && lage.antal > 0 ? Math.round((lage.roda / lage.antal) * 10000) / 10000 : null;
  const nv = nettoVagbreddFranScan(scans[0]?.details ?? null); // SENASTE vagscan-event

  const regimResultat = raknaRegime(
    {
      gronAndel: lage ? lage.andelGrona : null,
      rodAndel,
      nettoVagbredd: nv.netto,
      antalVagbolag: nv.antal,
      sigmaArs: null,
      senastKontrollerad: lage ? lage.senastKontrollerad : "",
    },
    regimeTidigare,
  );
  regimeStatus.regime = regimResultat.regime;
  regimeStatus.byte = regimResultat.byte;
  regimeStatus.kandidat = regimResultat.kandidat;
  regimeStatus.indikatorer = regimResultat.indikatorer;
  regimeStatus.nOsattOrsak = regimResultat.nOsattOrsak;

  // REGLERAD förändring = genesis (ingen historia), bekräftat byte ELLER
  // kandidatrörelse (start/avancemang/nollställning). Tyst kvartal (samma
  // snapshot, oförskjutet tillstånd) appendar inget — dagar räknas ALDRIG
  // som observationer; snapshot-identiteten är senastKontrollerad.
  const regimeNyRad = byggRegimeLoggrad(regimResultat);
  const regimeKandidatFörändrad =
    JSON.stringify(regimResultat.kandidat ?? null) !== JSON.stringify(regimeTidigare?.kandidat ?? null);
  const regimeRegleradFörändring =
    regimeNyRad !== null && (regimeTidigare === null || regimResultat.byte || regimeKandidatFörändrad);
  if (regimeRegleradFörändring && (regimeStatus.verifierad || regimeBas.length === 0)) {
    const prevHash =
      regimeBas.length > 0 && regimeBas[regimeBas.length - 1].hash
        ? String(regimeBas[regimeBas.length - 1].hash)
        : REGIMELOGG_GENESIS;
    const stampad = stemplaRegimeRad(regimeNyRad, prevHash, sha256Regim);
    try {
      mkdirSync(path.dirname(REGIMELOGG_SOK), { recursive: true });
      writeFileSync(
        REGIMELOGG_SOK,
        JSON.stringify(
          {
            modellVersion: REGIM_MODELL_VERSION,
            skapad: regimeLoggLäst?.skapad ?? stampad.datum,
            rader: [...regimeBas, stampad], // bas (ev. DB-ikapphämning) + ny rad
            senasteHash: stampad.hash,
          },
          null,
          2,
        ) + "\n",
        "utf8",
      );
      regimeStatus.loggSkriven = true;
    } catch {
      // read-only fs (t.ex. Vercel) — regimen lever ändå i akm3_regime-eventet
      // nedan och i svaret; loggen skrivs där fs tillåter (dev/CI).
    }

    // DB-SPÅRET (VÅG 63 bygg-1): den stampade raden som EGET akm3_regime-
    // event — på prod (read-only fs) är detta den enda växande kedjan; nästa
    // rond läser details.loggRad som kedjebas (se lasRegimeKedjebasUrEventer).
    if (sb) {
      try {
        const res = await fetch(`${sb.origin}/rest/v1/system_events`, {
          method: "POST",
          headers: { ...sb.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            type: "akm3_regime",
            severity: "info",
            message:
              "AKM3-regimen: reglerad förändring (" +
              String(stampad.regime) +
              (stampad.byte ? ", bekräftat byte" : "") +
              ") — loggrad " + String(stampad.datum) + ", hash " + String(stampad.hash).slice(0, 12) + "…",
            details: {
              modellVersion: REGIM_MODELL_VERSION,
              loggRad: stampad,
              kedjekalla: regimeStatus.kalla,
              notering:
                "Append-only hash-kedjad regime-rad (BESLUT §10.10): hash = sha256(prevHash + kanonisk rad). " +
                "Filen regime-logg.json kan vara frusen på read-only fs — detta event är prod-spåret.",
            },
            source: "cron/vagvalidering",
          }),
          signal: AbortSignal.timeout(10000),
        });
        regimeStatus.dbSparad = res.ok;
      } catch {
        // tyst — svaret returneras alltid
      }
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
            protokollByte,
            troskelProcentPerHorisont: TROSKEL_PROCENT_PER_HORIZONT,
            genererad: sammanstallning.genererad,
            datum: dagensDatum,
            universum: UNIVERSUM,
            kallaKlasser,
            kallaMomentum,
            nyaDomer,
            domar,
            rullande,
            rullandeSedan,
            // BANA B (AKM3-BESLUT §7): tabellen vagvalidering_dom — STYRELSE
            // §3.2:s schema exakt, episodkedjad (klassbyte/osatt avgränsar).
            vagvalidering_dom: variabelDomar,
            variabelRaknare,
            episodAntal: episodSet.size,
            // AKM3-REGIMEN (våg 60 bygg-A, BESLUT §8 steg 5): deskriptiv +
            // loggad — additivt fält, påverkar ALDRIG domar/poäng/profiler.
            regim: {
              regime: regimeStatus.regime,
              indikatorer: regimeStatus.indikatorer,
              byte: regimeStatus.byte,
              kandidat: regimeStatus.kandidat,
              kravdaSnapshots: regimResultat.kravdaSnapshots,
              nOsattOrsak: regimeStatus.nOsattOrsak,
              senastKontrollerad: regimResultat.senastKontrollerad,
              loggSkriven: regimeStatus.loggSkriven,
              loggKalla: regimeStatus.kalla,
              loggDbSparad: regimeStatus.dbSparad,
              loggnotis: regimeStatus.notis,
            },
            notering:
              "Dom-protokoll v" + String(VAGVALIDERING_PROTOKOLL_VERSION) +
              ": förra rondens klass döms mot dagens faktiska medel-momentum (impulsvåg>0, korrigering<0, basbygge |mom|<=tröskel per horisont: mikro/kort 6%, medellång 15%, lång/mega 25%). Osatt döms aldrig. Räknarna bärs fram per rond sedan rullandeSedan" +
              (protokollByte ? " — NOLLSTÄLLDA vid v2-bytet (" + TROSKEL_V2_BESLUTAD + "), se protokollByte.orsak" : "") +
              ". Bana B (vagvalidering_dom): per (ticker, variabel, horisont) döms variabelns EGEN klass mot variabelns EGEN momentum; episod_id ärvs medan klassen står still (osatt avgränsar också).",
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
      protokollByte: !!protokollByte,
      nyaDomer,
      nyaOsatta: domar.length - nyaDomer,
      rullandeTraffProcent: totaltProcent ?? -1,
      rullandeN: tTraff + tMiss,
      rullandeOsattProcent: totaltOsatt ?? -1,
      // Bana B (grova tal only — P8): dömda per-variabelrader + episoder.
      banaBDomda: variabelDomda,
      banaBRader: variabelDomar.length,
      banaBEpisoder: episodSet.size,
      // AKM3-regimen (våg 60 bygg-A): grova tal only — etikett + byte + logg.
      regimRegime: regimeStatus.regime,
      regimByte: regimeStatus.byte,
      regimLoggSkriven: regimeStatus.loggSkriven,
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
    // VÅG 87 (A2-DATASET-KONTRAKT §3.2, källval a): spegla samma rond som JSON —
    // /api/data/vagstatistik + /data/vagstatistik läser strukturerat utan att
    // tolka MD:n. MD:n förblir byte-identisk; spegeln är additiv.
    const spegelSok = path.join(process.cwd(), "data", "rapporter", "vagvalidering-SENASTE.json");
    writeFileSync(
      spegelSok,
      JSON.stringify(byggVagSpegelFranRullande(sammanstallning), null, 2) + "\n",
      "utf8",
    );
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
    protokollByte,
    troskelProcentPerHorisont: TROSKEL_PROCENT_PER_HORIZONT,
    banaB: {
      rader: variabelDomar.length,
      domda: variabelDomda,
      episoder: episodSet.size,
      variabelRaknare,
      vagvalidering_dom: variabelDomar,
    },
    regim: {
      regime: regimeStatus.regime,
      indikatorer: regimeStatus.indikatorer,
      byte: regimeStatus.byte,
      kandidat: regimeStatus.kandidat,
      kravdaSnapshots: regimResultat.kravdaSnapshots,
      senastKontrollerad: regimResultat.senastKontrollerad,
      beskrivning: regimResultat.beskrivning,
      nOsattOrsak: regimeStatus.nOsattOrsak,
      logg: {
        las: regimeStatus.las,
        verifierad: regimeStatus.verifierad,
        skriven: regimeStatus.loggSkriven,
        kalla: regimeStatus.kalla,
        dbSparad: regimeStatus.dbSparad,
        notis: regimeStatus.notis,
      },
    },
    supabaseSparad,
    rapportSkrivad,
    protokoll: { schema: VAGVALIDERING_SCHEMA, version: VAGVALIDERING_PROTOKOLL_VERSION },
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}
