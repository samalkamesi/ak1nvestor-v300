/**
 * AKM2-SNAPSHOT-LAGRING — Supabase-persistens för AKM2-kalkylatorns cacher
 * (VÅG 86, kö-artikel våg 57: "AKM2-berikningen bygger lokala filer som
 * försvinner på servern och inte delas mellan enheter").
 *
 * ── KONTRAKTET (system_events — beprövat mönster, INGEN DDL) ────────────────
 * data/cache/akm2-{TICKER}.json (schema akm2-resultat-v1, skrivs av verktyg/
 * kor-akm2-berika.mjs) är DEV-SANNINGEN; servern (read-only fs utöver git)
 * behöver samma data delad över enheter ⇒ snapshot-rader i system_events:
 *
 *   type="akm2_snapshot"  severity="info"  source="akm2"
 *   message="[akm2-snapshot] <ticker> komposit <N> (<datum>)"
 *   details={ticker, resultat, schema, berikat, datum}
 *     ticker    — ÄKTA ticker ur resultat.ticker ("ABB.ST" — aldrig filnamns-
 *                sanerad form; saneringen är ett rent filnamnsproblem)
 *     resultat  — HELA AKM2Resultat (jsonb-objekt, formguardat vid skriv)
 *     schema    — "akm2-resultat-v1" (cachefilens schema-kontrakt)
 *     berikat   — true när raden speglar kor-akm2-berika:s D2-cache (den
 *                enda producenten idag; false reserverat för framtida
 *                on-demand-generering)
 *     datum     — resultat.datum (kärnans deterministiska k.hamtat-datum —
 *                ALDRIG väggklockan)
 *
 * SENASTE-VINNER per ticker (order=created_at.desc,id.desc — id.desc ger
 * total ordning bland ties, lager.ts våg 67). INGEN tombstone-semantik (skill-
 * naden mot kurs_metadata): en rad utan giltigt resultat kan helt enkelt inte
 * vinna och lämnar tickern osedd — en ÄLDRE giltig rad får chansen. Rollback =
 * kundens radering av tickerns rader i Supabase ⇒ ingen vinnare ⇒ filen/dev
 * gäller igen (synka-variabler-precedensen).
 *
 * ── RETENTION (organ.ts, våg 86) ─────────────────────────────────────────────
 * akm2_snapshot står i BÅDA undantagslistorna (ålderstak + övrigt-radtak) och
 * har i stället ett EGET hårt radtak AKM2_SNAPSHOT_TAK_RADER = 2 000 rader
 * (100 tickers × 20 generationer): snapshots är serverns enda källa när
 * cachefilen saknas och får ALDRIG åldras bort — men 17,7M-kollapsen (organ.ts
 * designregel 1–6) får aldrig upprepas, därför stympas äldsta överskottet
 * hårt vid 2 000 rader. Skrivvägen är IDEMPOTENT (oförändrad resultat jämfört
 * med gällande rad ⇒ ingen ny rad) så tillväxten är en rad per ticker och
 * generation — taket räcker till 20 generationer.
 *
 * ── VÅG 79-HERMETIK ──────────────────────────────────────────────────────────
 * NEXT_PHASE==="phase-production-build" ⇒ läsning svarar tomt UTAN nät och
 * skrivning NEKAS — modulen FÅR ALDRIG fetcha under next build.
 *
 * ── MIMOSA-RECEPTET (våg 81:s hårdlärda mönster) ─────────────────────────────
 * Origin hämtas ENBART via getSupabaseRest() (supabase-rest.ts — host-vakten;
 * origin-tainten bryts på modulgränsen). Fetch-URL:er byggs med "+"-konkat
 * och ticker intygas av regex FÖRE den når URL:en — ALDRIG mallsträng med
 * variabel i sökvägen. Import-ytan: ./supabase-rest + type-import ur
 * ./akm2/typer — kärnan (src/lib/akm2/**) rörs ALDRIG, endast dess typ.
 *
 * GRACEFUL NEDBRYTNING: Supabase ej konfigurerat, svarar fel eller tomt ⇒
 * tomt/tom karta — läsvägen KASTAR ALDRIG (konsumentens fil-kedja gäller).
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import { getSupabaseRest } from "./supabase-rest";
import type { AKM2Resultat } from "./akm2/typer";

// ── Event-typ & konstanter ───────────────────────────────────────────────────

/** Värde-raden — SENASTE-VINNER-enheten i lagret (en rad per generation). */
export const AKM2_SNAPSHOT_EVENT_TYP = "akm2_snapshot";
/** Cachefilens schema-kontrakt (kor-akm2-berika.mjs våg 57 D2). */
export const AKM2_SNAPSHOT_SCHEMA = "akm2-resultat-v1";
const AKM2_KALLA = "akm2";

// ── Formguards + regex-intyget (Mimosa-receptet) ─────────────────────────────

/** Regex-INTYG (Mimosa-receptet våg 81): tickern får endast bära börsformer
 *  [A-Za-z0-9._-] (verifierat mot alla 100 cacher: "AAPL", "ABB.ST",
 *  "ASSA-B.ST", "AKRBP.OL" …) — max 16 tecken. Endast intygade tickers får
 *  vidare in i en URL eller en filväg. */
const TICKER_INTYG_RE = /^[A-Za-z0-9._-]{1,16}$/;

/** Sant exakt för intygade tickers — skriv- och läsvägens djupa försvarslinje. */
export function arGiltigAkm2Ticker(ticker: unknown): ticker is string {
  return typeof ticker === "string" && TICKER_INTYG_RE.test(ticker);
}

/** Formguard: ser ut som ett AKM2Resultat (lager 1/2/4 + komposit)? Samma
 *  kontrakt som akm2-onsdemand/demoklient-data — EN källa här, tre köpare. */
export function arAkm2Resultat(x: unknown): x is AKM2Resultat {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.ticker === "string" &&
    typeof r.komposit === "number" &&
    Number.isFinite(r.komposit) &&
    !!r.lager1 &&
    typeof r.lager1 === "object" &&
    !!(r.lager1 as Record<string, unknown>)?.poang &&
    !!r.lager2 &&
    typeof r.lager2 === "object" &&
    !!r.lager4 &&
    typeof r.lager4 === "object" &&
    !!(r.lager4 as Record<string, unknown>)?.viktPerVariabel
  );
}

/** Samma filnamnssanering som verktyg/kor-akm2-berika.mjs tickerFil (".":ar →
 *  "_", punktprefix/.." avvisas FÖR punktutbytet — filproducentens ordning).
 *  Cachefilens namn — INTE lagertickern (details.ticker bär äkta form). */
export function akm2CacheFilnamn(ticker: string): string | null {
  if (!ticker || ticker.includes("..")) return null;
  const rensat = ticker.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!rensat || rensat.startsWith(".")) return null;
  return rensat.replace(/\./g, "_");
}

/** Kanonisk JSON-serialisering (rekursivt sorterade nycklar) — jämförelsen i
 *  skrivvägens idempotenskontroll. jsonb bevarar INTE nyckelordning, så ett
 *  cachefils-objekt och dess återlästa rad kan aldrig jämföras med rå
 *  stringify — kanonisk form är den enda ärliga likheten. */
export function kanoniskJson(x: unknown): string {
  if (x === null || typeof x !== "object") return JSON.stringify(x) ?? "null";
  if (Array.isArray(x)) return "[" + x.map(kanoniskJson).join(",") + "]";
  const nycklar = Object.keys(x as Record<string, unknown>).sort();
  return "{" + nycklar.map((k) => JSON.stringify(k) + ":" + kanoniskJson((x as Record<string, unknown>)[k])).join(",") + "}";
}

// ── PostgREST-plumbing (variabler-lagring.ts våg 79, ordagrant mönster) ──────

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";

/** Max rader per sidobegäran — en snapshot-rad är ~10–15 kB (hela resultatet
 *  bärs i details), därför 250 rader/sida i stället för 1 000 (~3 MB/sida). */
const SIDSTORLEK = 250;
/** Tak: 8 sidor à 250 = 2 000 rader = retentionens AKM2_SNAPSHOT_TAK_RADER ⇒
 *  skannet är GARANTERAT komplett (typen kan per konstruktion inte bära fler
 *  rader än så) samtidigt som byte-volymen förblir avgränsad. */
const MAX_Sidor = 8;
/** Per-ticker-läsning: 100 nyaste raderna räcker vida över 20 generationer. */
const TICKER_RADER = 100;

/** En rå läses-rad såsom PostgREST returnerar den (arrow-select ur details;
 *  details->>resultat ger resultatet som JSON-TEXT som tolkas lokalt). */
export type Akm2SnapshotLasRad = {
  created_at?: string | null;
  ticker?: string | null;
  schema?: string | null;
  berikat?: string | boolean | null;
  datum?: string | null;
  resultat?: string | null;
};

/** Det lasAkm2Snapshot returnerar — cacheradens innehåll + radens egen datering. */
export type Akm2Snapshot = {
  ticker: string;
  resultat: AKM2Resultat;
  schema: string;
  berikat: boolean;
  datum: string;
  /** Radens created_at (ISO) — när snapshoten skrevs till lagret. */
  sparad: string;
};

/** Tolka berikat (jsonb->> ger text "true"/"false", pilform ger boolean). */
function tolkaBerikat(v: Akm2SnapshotLasRad["berikat"]): boolean {
  return v === true || v === "true" || v === "t";
}

/**
 * tolkaSnapshotRad — REN tolkning av en rå rad → Akm2Snapshot, eller null om
 * raden inte bär ett giltigt snapshot (ticker utan intyg, resultat som ej
 * parse:ar/formguardar). Ogiltiga rader kan ALDRIG vinna (ärlig läsning).
 */
export function tolkaSnapshotRad(r: Akm2SnapshotLasRad): Akm2Snapshot | null {
  if (!arGiltigAkm2Ticker(r?.ticker)) return null;
  if (typeof r?.resultat !== "string" || r.resultat.trim() === "") return null;
  let resultat: unknown;
  try {
    resultat = JSON.parse(r.resultat);
  } catch {
    return null; // trasig JSON-text — raden kan inte vinna
  }
  if (!arAkm2Resultat(resultat)) return null;
  return {
    ticker: r.ticker as string,
    resultat,
    schema: typeof r.schema === "string" && r.schema ? r.schema : AKM2_SNAPSHOT_SCHEMA,
    berikat: tolkaBerikat(r.berikat),
    datum: typeof r.datum === "string" && r.datum ? r.datum : (resultat as AKM2Resultat).datum,
    sparad: typeof r.created_at === "string" ? r.created_at : "",
  };
}

/**
 * senasteVinnerAkm2Snapshot — REN funktion (testernas kärna): rader (nyast
 * först) → karta ticker → gällande snapshot. FÖREKOMST först vinner eftersom
 * indata är sorterad nyast-först. INGEN tombstone: en ogiltig rad hopas över
 * UTAN att markera tickern sedd — nästa (äldre) giltiga rad för tickern får
 * chansen (dokumenterad skillnad mot kurs_metadata:s rollback-semantik).
 */
export function senasteVinnerAkm2Snapshot(rader: readonly Akm2SnapshotLasRad[]): Map<string, Akm2Snapshot> {
  const karta = new Map<string, Akm2Snapshot>();
  for (const r of rader) {
    const snap = tolkaSnapshotRad(r);
    if (snap === null) continue; // ogiltig rad kan inte vinna — tickern förblir osedd
    if (karta.has(snap.ticker)) continue; // senaste raden har redan vunnit
    karta.set(snap.ticker, snap);
  }
  return karta;
}

// ── Modul-cache 10 min ───────────────────────────────────────────────────────

const CACHE_MS = 10 * 60 * 1000;

let memoAll: { vid: number; karta: Map<string, Akm2Snapshot> } | null = null;
const memoTicker = new Map<string, { vid: number; snap: Akm2Snapshot | null }>();

/** Rensa modul-cachen (efter lyckad skrivning — nästa läsning ser nya läget
 *  direkt istället för att vänta ut cachen). */
export function glomAkm2SnapshotCache(): void {
  memoAll = null;
  memoTicker.clear();
}

/** Pilen (arrow-select) som alla läsvägar delar — "+"-konkat, konstant sökväg. */
const SELECT_PIL = "created_at,details->>ticker,details->>schema,details->>berikat,details->>datum,details->>resultat";

/** Nätverksfel-namn utan hemligheter ("TimeoutError", "TypeError" …). */
function felnamn(e: unknown): string {
  return e instanceof Error ? e.name : "okänt nätverksfel";
}

/** Läs en sida rader (tom array vid fel — tyst fall-back, kastar ALDRIG). */
async function lasSida(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
  urlFilter: string,
  fran: number,
): Promise<Akm2SnapshotLasRad[]> {
  try {
    const url =
      rest.origin +
      "/rest/v1/system_events?type=eq." +
      fv(AKM2_SNAPSHOT_EVENT_TYP) +
      urlFilter +
      "&select=" +
      SELECT_PIL +
      "&" +
      SENASTE;
    const res = await fetch(url, {
      headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return []; // tyst fall-back — fil-kedjan gäller
    const rader = (await res.json()) as Akm2SnapshotLasRad[];
    return Array.isArray(rader) ? rader : [];
  } catch {
    return []; // nätverksfel/timeout — tyst fall-back
  }
}

/**
 * lasAkm2Snapshot — gällande snapshot(s) ur lagret, SENASTE-VINNER per ticker.
 * Modul-cache 10 min. Supabase-fel/tom databas/byggfas ⇒ tomt (fil-kedjan
 * gäller — läsvägen kastar ALDRIG).
 *
 *   lasAkm2Snapshot()          → karta ticker → gällande snapshot (ALLA)
 *   lasAkm2Snapshot(ticker)    → tickerns gällande snapshot, eller null
 */
export async function lasAkm2Snapshot(ticker: string): Promise<Akm2Snapshot | null>;
export async function lasAkm2Snapshot(): Promise<Map<string, Akm2Snapshot>>;
export async function lasAkm2Snapshot(ticker?: string): Promise<Map<string, Akm2Snapshot> | Akm2Snapshot | null> {
  // Våg 79-hermetiken: under next build ALDRIG nät — ISR-revalidation (runtime)
  // läser live; bygget förblir nätverks-hermetiskt.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return typeof ticker === "string" ? null : new Map<string, Akm2Snapshot>();
  }
  const rest = getSupabaseRest();
  if (!rest) {
    return typeof ticker === "string" ? null : new Map<string, Akm2Snapshot>();
  }

  // Per-ticker-läsning: tickerns 100 nyaste rader → senaste-vinner lokalt.
  if (typeof ticker === "string") {
    if (!arGiltigAkm2Ticker(ticker)) return null; // ointygad ticker kan aldrig finnas
    const minne = memoTicker.get(ticker);
    if (minne !== undefined && Date.now() - minne.vid < CACHE_MS) return minne.snap;
    const rader = await lasSida(rest, "&details->>ticker=eq." + fv(ticker), 0);
    const snap = senasteVinnerAkm2Snapshot(rader).get(ticker) ?? null;
    memoTicker.set(ticker, { vid: Date.now(), snap });
    return snap;
  }

  // All-läsning: paginerat nyest-först, tak 2 000 rader (= retentionstaket ⇒
  // alltid komplett över typen).
  if (memoAll !== null && Date.now() - memoAll.vid < CACHE_MS) return memoAll.karta;
  const karta = new Map<string, Akm2Snapshot>();
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const sidRader = await lasSida(rest, "", sida * SIDSTORLEK);
    if (sidRader.length === 0) break; // fel eller sista sidan — det lästa gäller
    for (const [t, snap] of senasteVinnerAkm2Snapshot(sidRader)) {
      if (!karta.has(t)) karta.set(t, snap);
    }
    if (sidRader.length < SIDSTORLEK) break; // sista sidan — allt är läst
  }
  memoAll = { vid: Date.now(), karta };
  return karta;
}

// ── Skrivväg (verktyg/cron — service-role, samma POST-mönster som v79) ───────

/**
 * skrivAkm2Snapshot — skriv EN generation för EN ticker. Returnerar ALLTID
 * {ok, fel?, hoppat?} — kastar aldrig (verktyget mappar direkt till logg/exit).
 *
 * (a) NEXT_PHASE-hermetik: skrivning NEKAS under next build.
 * (b) Ren validering FÖRE nät: ticker-intyget (Mimosa), formguard på hela
 *     resultatet, samt ticker === resultat.ticker (integritet — lagret får
 *     aldrig bära en ticker/resultat-misspar).
 * (c) IDEMPOTENS: är gällande snapshots resultat KANONISKT identiskt (jsonb
 *     bevarar inte nyckelordning — kanoniskJson är likheten) hoppas skrivningen
 *     över: ok:true + hoppat:true, NOLL ny rad (tillväxten är en rad per
 *     ticker och generation — retentionens 2 000-tak räcker till 20 generationer).
 * (d) POST av värde-raden; misslyckande ⇒ ärligt ok:false.
 * (e) glomAkm2SnapshotCache — cachen speglar nya läget omedelbart.
 */
export async function skrivAkm2Snapshot(p: {
  ticker: string;
  resultat: AKM2Resultat;
  /** true = speglar kor-akm2-berika:s D2-cache (default). */
  berikat?: boolean;
  /** Vem som skrev (verktyg/cron-namn) — endast i message, ej i details. */
  av?: string;
}): Promise<{ ok: boolean; fel?: string; hoppat?: boolean }> {
  // (a) byggfasen är nätverks-hermetisk — skrivning nekas alltid.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { ok: false, fel: "Skrivning nekas under next build (bygget är nätverks-hermetiskt)." };
  }

  // (b) ren validering — nät-fri, densamma som testa-akm2-snapshot kör.
  if (!arGiltigAkm2Ticker(p?.ticker)) {
    return { ok: false, fel: "Tickern bär inte intygade börsformer [A-Za-z0-9._-] (max 16) — skrivningen avbröts." };
  }
  if (!arAkm2Resultat(p?.resultat)) {
    return { ok: false, fel: "Resultatet bär inte AKM2Resultat-formen (lager 1/2/4 + komposit) — skrivningen avbröts." };
  }
  if (p.resultat.ticker !== p.ticker) {
    return { ok: false, fel: "Tickern matchar inte resultat.ticker — lagret får aldrig bära ett misspar." };
  }
  const ticker: string = p.ticker;
  const resultat: AKM2Resultat = p.resultat;
  const berikat = p.berikat !== false;
  const datum = typeof resultat.datum === "string" && resultat.datum ? resultat.datum : "";

  const rest = getSupabaseRest();
  if (!rest) {
    return { ok: false, fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)." };
  }

  // (c) idempotens — jämför mot gällande med KANONISK form (jsonb ≡ nyckelordning).
  const nuvarande = await lasAkm2Snapshot(ticker);
  if (nuvarande !== null && kanoniskJson(nuvarande.resultat) === kanoniskJson(resultat)) {
    return { ok: true, hoppat: true };
  }

  // (d) värde-rad (EN rad — ingen ändringsloggtyp; generationshistoriken ÄR
  //     raderna, och retentionens 2 000-tak förvaltar den).
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: AKM2_SNAPSHOT_EVENT_TYP,
        severity: "info",
        message:
          "[akm2-snapshot] " +
          ticker +
          " komposit " +
          String(Math.round(resultat.komposit * 10) / 10) +
          " (" +
          (datum || "datum saknas") +
          (berikat ? ", berikat" : "") +
          ")",
        details: { ticker, resultat, schema: AKM2_SNAPSHOT_SCHEMA, berikat, datum },
        source: AKM2_KALLA,
      }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, fel: "Snapshoten kunde inte sparas (lagret svarade HTTP " + String(res.status) + ")." };
    }
  } catch (e) {
    return { ok: false, fel: "Snapshoten kunde inte sparas (" + felnamn(e) + ")." };
  }

  // (e) cachen måste spegla det nya läget omedelbart.
  glomAkm2SnapshotCache();
  return { ok: true };
}
