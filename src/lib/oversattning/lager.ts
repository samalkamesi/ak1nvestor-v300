/**
 * MÖS LAGER — översättningarnas sanningslager i Supabase (Våg 52 → Våg 55 L1).
 *
 * BACKEND-AUTODETEKTERING (Våg 55 agent L1): kundproblemet "men inte kurser…
 * ingen översätts" hade en enda rot — tabellen oversattningar kräver att
 * kunden kör data/sql/oversattningar.sql för hand i Supabase SQL Editor, vilket
 * aldrig hände, så ALLT (importören + cron-ronder) köade i fallback och prod
 * visade 0 %. Lagret är nu OBEROENDE av den nya tabellen:
 *
 *   1. Vid första anropet per process PROBAS tabellen oversattningar
 *      (GET ...?select=scope_typ&limit=1). Svarar den (PGRST200) ⇒
 *      TABELL-BACKEND: oförändrat beteende (UNIQUE-nycklar, upsert,
 *      RLS-publik läsning av publicerade rader) — fortfarande det bästa
 *      läget när/kunden kör SQL:en.
 *   2. Saknas den (PGRST205/404/övrigt fel) ⇒ SYSTEM_EVENTS-BACKEND på den
 *      BEFINTLIGA tabellen system_events (skapad sedan länge av
 *      scripts/supabase-setup-ak1a.sql — nervsystemet skriver dit sedan våg
 *      49). Översättningar lagras som event-rader och kräver INGEN ny SQL.
 *
 * EVENT-RADENS KONTRAKT (schema "mös/1"):
 *   type     = "oversattning"
 *   severity = "info"
 *   message  = "[mös] <status> <scope_nyckel> <sprak>"   (sökbart prefix)
 *   details  = { schema:"mös/1", scope_typ, scope_nyckel, sprak, kallhash,
 *                text, status, kvalitet, kontrollrapport }
 *   source   = "mos"
 *
 * LÄS-REGLER (hela event-sourcing): alltid order=created_at.desc — id är
 * uuid-TEXT och alltså INTE kronologiskt — plus SENASTE-VINNER-dedupe per
 * (scope_typ, scope_nyckel, sprak) i koden (dedupeSenasteVinner). En äldre
 * "publicerad"-rad servas ALDRIG om den senaste raden för nyckeln har en
 * annan status (t.ex. inaktuell) — då blir det svensk originaltext i
 * spegeln, vilket är den ärliga degraderingen.
 *
 * FILTER-SYNTAX (verifierad mot produktions-PostgREST 2026-09-04, se worklog
 * våg 55 L1): RÅA värden %-kodade — CITERADE värden ("…") är verifierat
 * icke-träffande för details->>-filter på den aktuella versionen. Exakta
 * frågan för en kurs-spegel (båda språken, nyast först):
 *   GET /rest/v1/system_events?type=eq.oversattning
 *       &details->>scope_nyckel=like.{slug:%2A -> like.slug:*}
 *       &select=created_at,details->>scope_nyckel,details->>sprak,
 *               details->>status,details->>text
 *       &order=created_at.desc&limit=1000
 *
 * KVANTITETSGRÄNSER — 17,7M-KOLLAPSEN (2026-08) FÅR ALDRIG UPPREPA SIG:
 *   - HÅRT TAK 200 000 RADER (höjt våg 67; var 45 000) för type=oversattning,
 *     hållet av retention-
 *     organet (src/lib/autonom/organ.ts, dagligen via /api/cron/autonom):
 *     (a) äldsta DUBLETTRADER raderas FÖRST (samma scope_nyckel+sprak —
 *         behåll senaste), (b) därefter stympas äldsta rader med
 *         status != "publicerad" först, (c) sist äldsta publicerade.
 *     Översättningseventen har INGET ålderstak (publicerade översättningar
 *     ska bestå tills de ersätts) — därför är typen EXKLUDERAD ur organets
 *     generella 30-dagars/500-raders-regler för övriga typer.
 *   - lasSpara raderar dessutom bästa-ansats föregångaren med samma
 *     (scope_typ, scope_nyckel, sprak) vid varje skrivning (≤ 12 unika
 *     nycklar per anrop; större batchar litar på läs-dedupe + organets
 *     dagstädsrunda — tillväxten är bunden av cron-takten).
 *   - Fallback-kön (data/oversattning-kö.json) behåller sitt tak: 500 poster.
 *
 * GRACEFUL NEDBRYTNING (deterministisk ärlighet):
 *   - Supabase ej konfigurerat, eller varken oversattningar eller
 *     system_events nåbara ⇒ TabellSaknasFel med tydlig instruktion.
 *     Cron-rutten fångar felet och köar vidare i fallback-JSON:n
 *     data/oversattning-kö.json (env-konfigurerbar via OVERSATTNING_KO_SOKVAG).
 *     Den är skrivbar LOKALT; på Vercel är filsystemet read-only — utan
 *     fungerande backend andas ronden ändå (organ-event + rapport skrivs)
 *     men översättningarna består inte mellan körningar — det dokumenteras
 *     i rapporten, det döljs aldrig.
 *
 * Supabase-nycklar läses ENBART från env via supabase-rest.ts (endast https
 * *.supabase.co — samma SSRF-skydd som resten av stacken) och hamnar ALDRIG
 * i kod, loggar eller felmeddelanden här.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { getSupabaseRest } from "../supabase-rest";
import type { MalSprak, ScopeTyp } from "./kalla";
import type { OversattningStatus } from "./motor";
import type { Kontrollrapport } from "./kontroller";

// ── Typer (speglar tabellens kolumner — oförändrade sedan våg 52) ────────────

/** En översättningspost (tabellrad ELLER event-radens details). */
export type OversattningRad = {
  scope_typ: ScopeTyp;
  scope_nyckel: string;
  sprak: MalSprak;
  /** SHA-256 12 hex av den källtext raden översattes från. */
  kallhash: string;
  /** Översättningen ("vantar-motor"-rader låter texten vara tom markerare). */
  text: string;
  status: OversattningStatus;
  kvalitet: number;
  /** korKontroller-rapporten som JSON (detaljer per kontroll). */
  kontrollrapport: Kontrollrapport | { tom: true } | null;
};

/** Lättviktig statusvy för rondens hashjämförelse. */
export type StatusPost = { kallhash: string; status: OversattningStatus };

/** Tydligt fel: inget användbart lager finns (tabell + system_events borta,
 *  eller Supabase ej konfigurerat). */
export class TabellSaknasFel extends Error {
  constructor(orsak: string) {
    super(
      "MÖS-lagret kan inte användas (" + orsak + "). " +
        "Tabellen oversattningar skapas av data/sql/oversattningar.sql (bästa läget), men lagret klarar sig även utan den via system_events — kontrollera NEXT_PUBLIC_SUPABASE_URL/nyckel i miljön och att system_events existerar.",
    );
    this.name = "TabellSaknasFel";
  }
}

const TABELL = "oversattningar";
const EVENTS = "system_events";

// ── system_events-kontraktet (rena funktioner — testas i validera-motorer) ──

export const MOS_EVENT_TYP = "oversattning";
const MOS_EVENT_SCHEMA = "mös/1";
const MOS_EVENT_KALLA = "mos";

/** Event-radens sökbara meddelande: "[mös] <status> <scope_nyckel> <sprak>". */
export function mosMeddelande(status: string, scope_nyckel: string, sprak: string): string {
  return "[mös] " + status + " " + scope_nyckel + " " + sprak;
}

/** OversattningRad → system_events-POST-kropp (schema "mös/1"). Ren funktion. */
export function mosEventKropp(rad: OversattningRad): {
  type: string;
  severity: string;
  message: string;
  details: Record<string, unknown>;
  source: string;
} {
  return {
    type: MOS_EVENT_TYP,
    severity: "info",
    message: mosMeddelande(rad.status, rad.scope_nyckel, rad.sprak),
    details: {
      schema: MOS_EVENT_SCHEMA,
      scope_typ: rad.scope_typ,
      scope_nyckel: rad.scope_nyckel,
      sprak: rad.sprak,
      kallhash: rad.kallhash,
      text: rad.text,
      status: rad.status,
      kvalitet: rad.kvalitet,
      kontrollrapport: rad.kontrollrapport ?? { tom: true },
    },
    source: MOS_EVENT_KALLA,
  };
}

/** En event-rad såsom PostgREST returnerar den (arrow-select ur details). */
export type MosEventLasRad = {
  id?: unknown;
  created_at?: string | null;
  scope_typ?: string | null;
  scope_nyckel?: string | null;
  sprak?: string | null;
  kallhash?: string | null;
  text?: string | null;
  status?: string | null;
  kvalitet?: number | null;
  kontrollrapport?: unknown;
};

/** Nyckeln för dedupe: (scope_nyckel, sprak) — scope_typ ingår i filtren. */
function mosDedupeNyckel(r: { scope_nyckel?: string | null; sprak?: string | null }): string {
  return (r.scope_nyckel ?? "") + "\u0000" + (r.sprak ?? "");
}

/**
 * SENASTE-VINNER-dedupe: ur rader SORTERADE nyast-först (created_at.desc)
 * behålls den FÖRSTA raden per (scope_nyckel, sprak). Ren funktion —
 * deterministisk, ingen IO; kärnan i event-läsningarna.
 */
export function dedupeSenasteVinner<T extends { scope_nyckel?: string | null; sprak?: string | null }>(
  rader: readonly T[],
): T[] {
  const sedda = new Set<string>();
  const vinnare: T[] = [];
  for (const r of rader) {
    const k = mosDedupeNyckel(r);
    if (sedda.has(k)) continue;
    sedda.add(k);
    vinnare.push(r);
  }
  return vinnare;
}

/**
 * Event-rader (nyast först) → statuskarta "typ:nyckel:sprak" → {kallhash,
 * status}. Samma form som tabell-läsningen — cron jämför hashar oavsett
 * backend. Ofullständiga rader hoppas tyst (tolerant avläsning). Ren funktion.
 */
export function mosStatusKartaUrEventRader(rader: readonly MosEventLasRad[]): Map<string, StatusPost> {
  const karta = new Map<string, StatusPost>();
  for (const r of dedupeSenasteVinner(rader)) {
    if (!r.scope_typ || !r.scope_nyckel || !r.sprak || !r.kallhash || !r.status) continue;
    karta.set(r.scope_typ + ":" + r.scope_nyckel + ":" + r.sprak, {
      kallhash: r.kallhash,
      status: r.status as OversattningStatus,
    });
  }
  return karta;
}

/**
 * Event-rader (nyast först) → kurs-spegelns lager Map<nyckel, Map<sprak,
 * text>>: dedupe FÖRST, därefter status-filter — en äldre publicerad rad
 * servas ALDRIG när den senaste för nyckeln har annan status. Säkerhetsnät:
 * endast nycklar med prefix "{slug}:" tas (like-mönstrets falska träffar).
 * Ren funktion.
 */
export function mosSpegelKartaUrRader(rader: readonly MosEventLasRad[], slug: string): Map<string, Map<string, string>> {
  const karta = new Map<string, Map<string, string>>();
  for (const r of dedupeSenasteVinner(rader)) {
    if (r.status !== "publicerad") continue;
    if (typeof r.text !== "string" || r.text.trim().length === 0) continue;
    if (typeof r.scope_nyckel !== "string" || !r.scope_nyckel.startsWith(slug + ":")) continue;
    if (typeof r.sprak !== "string") continue;
    const perSprak = karta.get(r.scope_nyckel) ?? new Map<string, string>();
    perSprak.set(r.sprak, r.text);
    karta.set(r.scope_nyckel, perSprak);
  }
  return karta;
}

// ── PostgREST-plumbing ───────────────────────────────────────────────────────

/** PostgREST-begäran med timeout — ronden ska aldrig hänga på lagret. */
async function restForfragning(
  tabell: string,
  sokvag: string,
  init: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const rest = getSupabaseRest();
  if (!rest) throw new TabellSaknasFel("Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)");
  const kontroll = new AbortController();
  const timer = setTimeout(() => kontroll.abort(), init.timeoutMs ?? 15_000);
  try {
    return await fetch(rest.origin + "/rest/v1/" + tabell + sokvag, {
      ...init,
      headers: { ...rest.headers, ...(init.headers ?? {}) },
      signal: kontroll.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Tolkar PostgREST-fel — saknad relation får sin egen felklass, nycklar läcker aldrig. */
async function sankaFel(res: Response): Promise<never> {
  let orsak = "HTTP " + String(res.status);
  try {
    const kropp = (await res.json()) as { code?: string; message?: string };
    if (kropp?.code === "PGRST205" || res.status === 404) {
      throw new TabellSaknasFel("relationen saknas — " + orsak);
    }
    if (kropp?.message) orsak += " " + String(kropp.message).slice(0, 120);
  } catch (e) {
    if (e instanceof TabellSaknasFel) throw e;
  }
  throw new Error("MÖS-lagret svarade " + orsak);
}

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (citerade värden
 *  är verifierat icke-träffande för details->>-filter på aktuell version;
 *  encodeURIComponent kodar , ( ) : som PostgREST annars tolkar som syntax). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Typfilter + nyckelfilter för MÖS-event-rader (räkar både läs + delete). */
function mosEventFilter(r: { scope_typ: string; scope_nyckel: string; sprak: string }): string {
  return (
    "type=eq." + MOS_EVENT_TYP +
    "&details->>scope_typ=eq." + fv(r.scope_typ) +
    "&details->>scope_nyckel=eq." + fv(r.scope_nyckel) +
    "&details->>sprak=eq." + fv(r.sprak)
  );
}

/** Gemensam projektion: nyast först + bara de fält läsningarna behöver.
 *  Ordningen MÅSTE bära id.desc som tiebreaker: alla rader i en och samma
 *  POST-batch delar transaktionens created_at (now() är transaktionstid) —
 *  utan unik sekundärnyckel är offset-sidningen över ties icke-deterministisk
 *  och kan HOPPA rader (våg 67: 16 vm-07/vm-08-block försvann ur statuskartan
 *  trots publicerade rader). id är uuid-TEXT (inte kronologiskt) men ger en
 *  TOTAL ordning — det är determinismen som krävs, inte kronologi bland ties. */
const MOS_VAL_FALT =
  "created_at,details->>scope_typ,details->>scope_nyckel,details->>sprak,details->>kallhash,details->>status";
const MOS_ORDNING = "&order=created_at.desc,id.desc";

// ── Backend-detektering (en sond per process) ────────────────────────────────

export type MosBackend = "tabell" | "events";

let backendLovelse: Promise<MosBackend> | null = null;

/**
 * Detektera backend VID FÖRSTA ANROPET per process (därefter cachat):
 *   GET /rest/v1/oversattningar?select=scope_typ&limit=1 — ok ⇒ "tabell",
 *   annars GET /rest/v1/system_events?select=id&limit=1 — ok ⇒ "events".
 * Når ingen av dem ⇒ TabellSaknasFel (cachen nollställs så nästa anrop
 * provar om — tillfälliga nätverksfel ska inte låsa processen).
 */
async function detekteraBackend(): Promise<MosBackend> {
  if (!backendLovelse) {
    backendLovelse = provBackend().catch((e) => {
      backendLovelse = null;
      throw e;
    });
  }
  return backendLovelse;
}

async function provBackend(): Promise<MosBackend> {
  const rest = getSupabaseRest();
  if (!rest) throw new TabellSaknasFel("Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)");
  // Sond 1: dedikerad tabell (bäst — UNIQUE-nycklar + publik RLS-läsning).
  try {
    const res = await fetch(rest.origin + "/rest/v1/" + TABELL + "?select=scope_typ&limit=1", {
      headers: rest.headers,
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) return "tabell";
    // 404/PGRST205 (tabellen saknas) LIKASÅ övriga fel (t.ex. 500 mitt i en
    // schema-reload): fortsätt till sond 2 — system_events kräver ingen SQL.
  } catch {
    /* nätverksfel → sond 2 */
  }
  // Sond 2: system_events (befintlig sedan setup-SQL:en — nervsystemets tabell).
  try {
    const res = await fetch(rest.origin + "/rest/v1/" + EVENTS + "?select=id&limit=1", {
      headers: rest.headers,
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) return "events";
  } catch {
    /* nedan: tydligt fel */
  }
  throw new TabellSaknasFel("varken oversattningar eller system_events kunde nås");
}

// ── Skrivning (service-role) ─────────────────────────────────────────────────

/** Tak för best-effort-radering av föregångare per lasSpara-anrop. Större
 *  batchar (importörens 250-radersbatchar) hoppar över — läs-dedupe +
 *  retention-organets dagliga dublettröjning håller radantalet motsvarande. */
const RADERA_MAX_NYCKLAR = 12;

/**
 * Spara/uppdatera rader. Tabell-backend: upsert på UNIQUE (scope_typ,
 * scope_nyckel, språk) i EN begäran (oförändrat sedan våg 52).
 * system_events-backend: se lasSparaEvents.
 */
export async function lasSpara(rader: readonly OversattningRad[]): Promise<void> {
  if (rader.length === 0) return;
  const backend = await detekteraBackend();
  if (backend === "tabell") {
    const res = await restForfragning(TABELL, "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(
        rader.map((r) => ({
          scope_typ: r.scope_typ,
          scope_nyckel: r.scope_nyckel,
          sprak: r.sprak,
          kallhash: r.kallhash,
          text: r.text,
          status: r.status,
          kvalitet: r.kvalitet,
          kontrollrapport: r.kontrollrapport ?? { tom: true },
          uppdaterad: new Date().toISOString(),
        })),
      ),
      timeoutMs: 20_000,
    });
    if (!res.ok) await sankaFel(res);
    return;
  }
  await lasSparaEvents(rader);
}

/**
 * Event-skrivning: (a) best-effort DELETE av föregångare med samma
 * (scope_typ, scope_nyckel, sprak) — lagret sväller inte när DELETE tillåts
 * (service-role); nekas den (anon-nyckel/RLS) vinner ändå senaste raden vid
 * läsning och organet städar dagligen. (b) POST av nya rader i EN begäran.
 * Dublettnycklar INOM batchen slås samman före skriv (sista vinner — samma
 * semantik som tabell-upserten, deterministiskt trots samma created_at).
 */
async function lasSparaEvents(rader: readonly OversattningRad[]): Promise<void> {
  const unika = new Map<string, OversattningRad>();
  for (const r of rader) unika.set(r.scope_typ + ":" + r.scope_nyckel + ":" + r.sprak, r);
  const poster = [...unika.values()];

  if (unika.size <= RADERA_MAX_NYCKLAR) {
    for (const r of poster) {
      try {
        await restForfragning(EVENTS, "?" + mosEventFilter(r) + "&select=id", {
          method: "DELETE",
          timeoutMs: 8_000,
        });
      } catch {
        /* best effort — läs-dedupe + retention täcker det */
      }
    }
  }

  const res = await restForfragning(EVENTS, "", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(poster.map(mosEventKropp)),
    timeoutMs: 20_000,
  });
  if (!res.ok) await sankaFel(res);
}

// ── Läsning ──────────────────────────────────────────────────────────────────

/** Max rader att läsa per sid_begäran — PostgREST default-sida är 1000 rader. */
const SIDSTORLEK = 1000;
/** Tak för statuskartan: 200 sidor = 200 000 rader. Våg 67: korpusen växte
 *  över det gamla 40-sidorstaketet (59k råa rader) — kartan läste bara de
 *  nyaste 40 000 och "tappade" äldre nycklar (falskt ofullständiga kurser).
 *  Full korpus ≈ 139 164 unika språknycklar; 200 sidor täcker det med marginal.
 *  Enda tunga anroparen är cron-oversatt (tidsbudgetad) — speglarna läser
 *  per kurs och berörs inte. Retentionstaketet synkas i organ.ts (200 000). */
const MAX_Sidor = 200;

/**
 * Läs HELA statuskartan: "typ:nyckel:sprak" → {kallhash, status}.
 * Tabell: paginerad (Range-header). system_events: samma sidning men
 * nyast-först + senaste-vinner-dedupe i koden. Vid tom databas: tom karta.
 */
export async function lasStatusKarta(): Promise<Map<string, StatusPost>> {
  const backend = await detekteraBackend();
  const karta = new Map<string, StatusPost>();

  if (backend === "tabell") {
    for (let sida = 0; sida < MAX_Sidor; sida++) {
      const fran = sida * SIDSTORLEK;
      const res = await restForfragning(TABELL, "?select=scope_typ,scope_nyckel,sprak,kallhash,status", {
        method: "GET",
        headers: { Range: fran + "-" + String(fran + SIDSTORLEK - 1) },
        timeoutMs: 20_000,
      });
      if (!res.ok) await sankaFel(res);
      const rader = (await res.json()) as Array<{
        scope_typ: ScopeTyp;
        scope_nyckel: string;
        sprak: MalSprak;
        kallhash: string;
        status: OversattningStatus;
      }>;
      for (const r of rader) {
        karta.set(r.scope_typ + ":" + r.scope_nyckel + ":" + r.sprak, { kallhash: r.kallhash, status: r.status });
      }
      if (rader.length < SIDSTORLEK) return karta; // sista sidan
    }
    return karta; // taket nått — resterande hanteras nästa rond (ärligt avgränsat)
  }

  // system_events: nyast först ⇒ FÖREKOMST i tidigare sida vinner.
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    const res = await restForfragning(
      EVENTS,
      "?type=eq." + MOS_EVENT_TYP + "&select=" + MOS_VAL_FALT + MOS_ORDNING,
      {
        method: "GET",
        headers: { Range: fran + "-" + String(fran + SIDSTORLEK - 1) },
        timeoutMs: 20_000,
      },
    );
    if (!res.ok) await sankaFel(res);
    const rader = (await res.json()) as MosEventLasRad[];
    for (const [nyckel, post] of mosStatusKartaUrEventRader(rader)) {
      if (!karta.has(nyckel)) karta.set(nyckel, post);
    }
    if (rader.length < SIDSTORLEK) return karta; // sista sidan
  }
  return karta; // taket nått — ärligt avgränsat, nästa rond fortsätter
}

/**
 * Markera gamla översättningar INAKTUELLA: allt för (typ, nyckel) vars
 * kallhash skiljer sig från den nya. Tabell: PATCH (oförändrat).
 * system_events: läs senaste raden per språk, appecha en kopia med
 * status="inaktuell" (gamla kallhash/text bevaras — hashjämförelsen i cron
 * fortsätter köa objektet tills det verkligen översatts om) — föregångarna
 * raderas samtidigt av lasSparaEvents (≤ 2 nycklar). Returnerar antal
 * markerade rader.
 */
export async function markeraInaktuell(
  scope_typ: ScopeTyp,
  scope_nyckel: string,
  nyKallhash: string,
): Promise<number> {
  const backend = await detekteraBackend();

  if (backend === "tabell") {
    const res = await restForfragning(
      TABELL,
      "?scope_typ=eq." + encodeURIComponent(scope_typ) +
        "&scope_nyckel=eq." + encodeURIComponent(scope_nyckel) +
        "&kallhash=neq." + encodeURIComponent(nyKallhash) +
        "&status=neq.inaktuell&select=scope_typ",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({ status: "inaktuell", uppdaterad: new Date().toISOString() }),
        timeoutMs: 15_000,
      },
    );
    if (!res.ok) await sankaFel(res);
    const rader = (await res.json()) as unknown[];
    return Array.isArray(rader) ? rader.length : 0;
  }

  // system_events: senaste raden per språk → appecha inaktuell-kopia.
  const res = await restForfragning(
    EVENTS,
    "?type=eq." + MOS_EVENT_TYP +
      "&details->>scope_typ=eq." + fv(scope_typ) +
      "&details->>scope_nyckel=eq." + fv(scope_nyckel) +
      "&select=" + MOS_VAL_FALT + ",details->>text,details->>kvalitet,details->>kontrollrapport" +
      MOS_ORDNING + "&limit=100",
    { method: "GET", timeoutMs: 15_000 },
  );
  if (!res.ok) await sankaFel(res);
  const rader = (await res.json()) as MosEventLasRad[];
  const attSkriva: OversattningRad[] = [];
  for (const r of dedupeSenasteVinner(rader)) {
    if (!r.scope_typ || !r.scope_nyckel || !r.sprak) continue;
    if (r.status === "inaktuell") continue; // redan markerad — inga dubbletter
    if (r.kallhash === nyKallhash) continue; // aktuell källa — lämnas ifred
    attSkriva.push({
      scope_typ: r.scope_typ as ScopeTyp,
      scope_nyckel: r.scope_nyckel,
      sprak: r.sprak as MalSprak,
      kallhash: r.kallhash ?? "",
      text: typeof r.text === "string" ? r.text : "",
      status: "inaktuell",
      kvalitet: typeof r.kvalitet === "number" ? r.kvalitet : 0,
      kontrollrapport: (r.kontrollrapport ?? { tom: true }) as OversattningRad["kontrollrapport"],
    });
  }
  if (attSkriva.length === 0) return 0;
  await lasSparaEvents(attSkriva);
  return attSkriva.length;
}

/** En hel rad som lasRad returnerar — kontrollrapporten är tolkningsbar
 *  (tabellen ger jsonb-OBJEKT, system_events->> ger JSON-STRÄNG; anroparen
 *  tolkar försiktigt, se admin-ruttens tolkaRapport). */
export type OversattningRadLas = {
  id: number | null;
  scope_typ: ScopeTyp;
  scope_nyckel: string;
  sprak: MalSprak;
  kallhash: string;
  text: string;
  status: OversattningStatus;
  kvalitet: number;
  kontrollrapport: unknown;
};

/** Tabellrad → OversattningRadLas (delad mappning för lasRad/lasRadEfterId). */
function tabellRadTillLasRad(r: {
  id?: number;
  scope_typ: ScopeTyp;
  scope_nyckel: string;
  sprak: MalSprak;
  kallhash: string;
  text: string;
  status: OversattningStatus;
  kvalitet: number;
  kontrollrapport: unknown;
}): OversattningRadLas {
  return {
    id: typeof r.id === "number" ? r.id : null,
    scope_typ: r.scope_typ,
    scope_nyckel: r.scope_nyckel,
    sprak: r.sprak,
    kallhash: r.kallhash ?? "",
    text: typeof r.text === "string" ? r.text : "",
    status: r.status,
    kvalitet: typeof r.kvalitet === "number" ? r.kvalitet : 0,
    kontrollrapport: r.kontrollrapport ?? null,
  };
}

/**
 * Läs EN rads SENASTE läge oavsett backend (våg 62 — admin-panelens POST
 * granskar/publicerar även i system_events-läget): tabell ⇒ enda raden;
 * system_events ⇒ senaste-vinner-dedupe av de 25 nyaste för nyckeln (en
 * äldre status servas ALDRIG, samma semantik som lasPublicerad).
 * Returnerar null när nyckeln saknas i lagret.
 */
export async function lasRad(
  scope_typ: ScopeTyp,
  scope_nyckel: string,
  sprak: MalSprak,
): Promise<OversattningRadLas | null> {
  const backend = await detekteraBackend();

  if (backend === "tabell") {
    const res = await restForfragning(
      TABELL,
      "?scope_typ=eq." + encodeURIComponent(scope_typ) +
        "&scope_nyckel=eq." + encodeURIComponent(scope_nyckel) +
        "&sprak=eq." + sprak + "&limit=1" +
        "&select=id,scope_typ,scope_nyckel,sprak,kallhash,text,status,kvalitet,kontrollrapport",
      { method: "GET", timeoutMs: 12_000 },
    );
    if (!res.ok) await sankaFel(res);
    const rader = (await res.json()) as Parameters<typeof tabellRadTillLasRad>[0][];
    return rader[0] ? tabellRadTillLasRad(rader[0]) : null;
  }

  // system_events: nyast först ⇒ dedupe ger senaste läget för nyckeln.
  const res = await restForfragning(
    EVENTS,
    "?" + mosEventFilter({ scope_typ, scope_nyckel, sprak }) +
      "&select=created_at,details->>scope_typ,details->>scope_nyckel,details->>sprak,details->>kallhash,details->>text,details->>status,details->>kvalitet,details->>kontrollrapport" +
      MOS_ORDNING + "&limit=25",
    { method: "GET", timeoutMs: 12_000 },
  );
  if (!res.ok) await sankaFel(res);
  const rader = (await res.json()) as MosEventLasRad[];
  const senaste = dedupeSenasteVinner(rader)[0] ?? null;
  if (!senaste || !senaste.scope_typ || !senaste.scope_nyckel || !senaste.sprak || !senaste.status) return null;
  return {
    id: null,
    scope_typ: senaste.scope_typ as ScopeTyp,
    scope_nyckel: senaste.scope_nyckel,
    sprak: senaste.sprak as MalSprak,
    kallhash: senaste.kallhash ?? "",
    text: typeof senaste.text === "string" ? senaste.text : "",
    status: senaste.status as OversattningStatus,
    kvalitet:
      typeof senaste.kvalitet === "number"
        ? senaste.kvalitet
        : Number(senaste.kvalitet ?? 0) || 0, // details->> ger text — tolka både former
    kontrollrapport: senaste.kontrollrapport ?? null,
  };
}

/** Publik läsning av EN publicerad översättning (framtida UI-konsumtion). */
export async function lasPublicerad(
  scope_typ: ScopeTyp,
  scope_nyckel: string,
  sprak: MalSprak,
): Promise<string | null> {
  const backend = await detekteraBackend();

  if (backend === "tabell") {
    const res = await restForfragning(
      TABELL,
      "?scope_typ=eq." + encodeURIComponent(scope_typ) +
        "&scope_nyckel=eq." + encodeURIComponent(scope_nyckel) +
        "&sprak=eq." + sprak +
        "&status=eq.publicerad&select=text",
      { method: "GET", timeoutMs: 10_000 },
    );
    if (!res.ok) await sankaFel(res);
    const rader = (await res.json()) as Array<{ text: string }>;
    return rader.length > 0 ? rader[0].text : null;
  }

  // system_events: senaste raden för nyckeln vinner — publicerad endast om
  // just den senaste är publicerad (äldre publicerade servas aldrig).
  const res = await restForfragning(
    EVENTS,
    "?" + mosEventFilter({ scope_typ, scope_nyckel, sprak }) +
      "&select=created_at,details->>status,details->>text" + MOS_ORDNING + "&limit=25",
    { method: "GET", timeoutMs: 10_000 },
  );
  if (!res.ok) await sankaFel(res);
  const rader = (await res.json()) as MosEventLasRad[];
  const senaste = dedupeSenasteVinner(rader)[0] ?? null;
  return senaste && senaste.status === "publicerad" && typeof senaste.text === "string" ? senaste.text : null;
}

/**
 * Läs raden med TABELL-id (våg 62, admin-POST:ens id-form). id:n är tabellfödda
 * — i system_events-läget har panelraderna id=null och använder scope-tuppeln.
 * Kastar TabellSaknasFel när tabellen saknas (ärligt: ett id kan inte finnas
 * utan tabellen).
 */
export async function lasRadEfterId(id: number): Promise<OversattningRadLas | null> {
  const res = await restForfragning(
    TABELL,
    "?id=eq." + encodeURIComponent(String(id)) + "&limit=1" +
      "&select=id,scope_typ,scope_nyckel,sprak,kallhash,text,status,kvalitet,kontrollrapport",
    { method: "GET", timeoutMs: 12_000 },
  );
  if (!res.ok) await sankaFel(res);
  const rader = (await res.json()) as Parameters<typeof tabellRadTillLasRad>[0][];
  return rader[0] ? tabellRadTillLasRad(rader[0]) : null;
}

/**
 * Kurs-spegelns läsning (Våg 55 L1): alla publicerade översättningar för EN
 * kurs-slug → Map<nyckel, Map<sprak, text>> — exakt den form kurs-speglar.ts
 * bygger sina speglar av. Körs bara som FALLBACK när tabellen oversattningar
 * inte svarar (den primära spegelläsningen är oförändrad). Nyast först +
 * senaste-vinner-dedupe + status-filter i koden (ren kärna: se
 * mosSpegelKartaUrRader).
 *
 * VÅG 78 C #2 — SIDUPPDELAD läsning (Range-header, 1 000 rader i taget):
 * flaggskeppskurserna har >1 000 event-rader per slug (ak1ts-vaglarans-
 * hierarki 1 080, the-intelligent-investor 1 008) och det gamla limit=1000-
 * fönstret skar av de äldsta nycklarna (EN 73 % ⇒ noindex i prod). Samma
 * totala ordning som alltid (created_at.desc,id.desc — id.desc ger
 * determinism bland ties, se MOS_ORDNING) gör offset-sidningen stabil, och
 * dedupe senaste-vinner sker ÖVER ALLA sidor tillsammans. Tak 10 sidor =
 * 10 000 rader per slug — gott om marginal (största slugen ≈ 1 100 rader).
 * Server-side funktion som memo-cachas av anroparen (hamtaKursOversattningar)
 * — en extra sida kostar en REQUEST, inte en sidrendering.
 */
const SPEGEL_MAX_Sidor = 10;

export async function lasPubliceradeForSpegel(slug: string): Promise<Map<string, Map<string, string>>> {
  const rader: MosEventLasRad[] = [];
  for (let sida = 0; sida < SPEGEL_MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    const res = await restForfragning(
      EVENTS,
      "?type=eq." + MOS_EVENT_TYP +
        "&details->>scope_nyckel=like." + fv(slug + ":*") +
        "&select=created_at,details->>scope_nyckel,details->>sprak,details->>status,details->>text" +
        MOS_ORDNING,
      {
        method: "GET",
        headers: { Range: fran + "-" + String(fran + SIDSTORLEK - 1) },
        timeoutMs: 12_000,
      },
    );
    if (!res.ok) await sankaFel(res);
    const sidRader = (await res.json()) as MosEventLasRad[];
    rader.push(...sidRader);
    if (sidRader.length < SIDSTORLEK) break; // sista sidan — slugen är helt läst
  }
  return mosSpegelKartaUrRader(rader, slug);
}

// ── Fallback-kö (lokal JSON) ────────────────────────────────────────────────

/** Köpost = rad + tidsstämpel (filformat data/oversattning-kö.json). */
export type KoPost = {
  scope_typ: ScopeTyp;
  scope_nyckel: string;
  sprak: MalSprak;
  kallhash: string;
  status: OversattningStatus;
  kvalitet: number;
  uppdaterad: string;
};

/** Köns tak: de SENASTE 500 objekten behålls (filen ska inte växa okontrollerat). */
const MAX_KO_POSTER = 500;

export function koSokvag(): string {
  return process.env.OVERSATTNING_KO_SOKVAG || path.join("data", "oversattning-kö.json");
}

/** Läs kön (saknad fil = tom kö — aldrig ett fel). */
export function lasKo(): KoPost[] {
  try {
    if (!existsSync(koSokvag())) return [];
    const parsad = JSON.parse(readFileSync(koSokvag(), "utf8")) as { poster?: KoPost[] };
    return Array.isArray(parsad.poster) ? parsad.poster : [];
  } catch {
    return []; // korrupt köfil ⇒ börja omifrån — deterministiskt och loggfritt
  }
}

/**
 * Skriv kön (merge på typ+nyckel+språk, cap 500 senaste). Returnerar ok=false
 * när filsystemet är read-only (Vercel) — anroparen dokumenterar, inte döljer.
 */
export function sparaKo(nya: readonly KoPost[]): { ok: boolean; fel: string | null; antal: number } {
  if (nya.length === 0) return { ok: true, fel: null, antal: lasKo().length };
  const befintliga = lasKo();
  const index = new Map<string, number>();
  befintliga.forEach((p, i) => index.set(p.scope_typ + ":" + p.scope_nyckel + ":" + p.sprak, i));
  for (const p of nya) {
    const id = p.scope_typ + ":" + p.scope_nyckel + ":" + p.sprak;
    const i = index.get(id);
    if (i === undefined) befintliga.push(p);
    else befintliga[i] = p;
  }
  const beskuren = befintliga.slice(-MAX_KO_POSTER);
  try {
    writeFileSync(
      koSokvag(),
      JSON.stringify(
        {
          uppdaterad: new Date().toISOString(),
          notering:
            "fallback-kö — lagret sparar i system_events när tabellen oversattningar saknas; kön är en lokal dev-spegling av senaste ronden",
          poster: beskuren,
        },
        null,
        2,
      ),
      "utf8",
    );
    return { ok: true, fel: null, antal: beskuren.length };
  } catch (e) {
    return {
      ok: false,
      fel: e instanceof Error ? "skrivning nekades (read-only filsystem?): " + e.name : "skrivning nekades",
      antal: beskuren.length,
    };
  }
}

/** Statuskarta ur kön — samma form som lasStatusKarta (cron använder bägge). */
export function koStatusKarta(): Map<string, StatusPost> {
  const karta = new Map<string, StatusPost>();
  for (const p of lasKo()) {
    karta.set(p.scope_typ + ":" + p.scope_nyckel + ":" + p.sprak, { kallhash: p.kallhash, status: p.status });
  }
  return karta;
}
