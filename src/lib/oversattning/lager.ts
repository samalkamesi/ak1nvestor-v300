/**
 * MÖS LAGER — översättningarnas sanningslager i Supabase (Våg 52).
 *
 * Tabell: oversattningar (data/sql/oversattningar.sql — kunden kör DEN EN gång
 * i Supabase SQL Editor). All åtkomst går via getSupabaseRest() (endast https
 * *.supabase.co — samma SSRF-skydd som resten av stacken). Supabase-nycklar
 * läses ENBART från env via supabase-rest.ts och hamnar ALDRIG i kod, loggar
 * eller felmeddelanden här.
 *
 * GRACEFUL NEDBRYTNING (deterministisk ärlighet):
 *   - Tabellen saknas (PostgREST 404 / PGRST205) eller Supabase ej konfigurerat
 *     ⇒ TabellSaknasFel med tydlig instruktion "kör data/sql/oversattningar.sql".
 *   - Cron-rutten fångar TabellSaknasFel och köar vidare i fallback-JSON:n
 *     data/oversattning-kö.json (env-konfigurerbar via OVERSATTNING_KO_SOKVAG).
 *     Den är skrivbar LOKALT; på Vercel är filsystemet read-only utom /tmp —
 *     därför: PRODUKTION KRÄVER TABELLEN. Utan tabell andas ronden ändå
 *     (organ-event + rapport skrivs) men översättningarna består inte mellan
 *     körningar — det dokumenteras i rapporten, det döljs aldrig.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import { getSupabaseRest } from "../supabase-rest";
import type { MalSprak, ScopeTyp } from "./kalla";
import type { OversattningStatus } from "./motor";
import type { Kontrollrapport } from "./kontroller";

// ── Typer (speglar tabellens kolumner) ───────────────────────────────────────

/** En rad i tabellen oversattningar. */
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

/** Tydligt fel: tabellen finns inte (eller Supabase ej konfigurerat). */
export class TabellSaknasFel extends Error {
  constructor(orsak: string) {
    super(
      "Tabellen oversattningar kan inte användas (" + orsak + "). " +
        "KÖR data/sql/oversattningar.sql EN gång i Supabase SQL Editor — utan tabellen köar pipelinen endast lokalt (data/oversattning-kö.json) och produktion kräver tabellen.",
    );
    this.name = "TabellSaknasFel";
  }
}

const TABELL = "oversattningar";

/** PostgREST-begäran med timeout — ronden ska aldrig hänga på lagret. */
async function restForfragning(
  sokvag: string,
  init: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const rest = getSupabaseRest();
  if (!rest) throw new TabellSaknasFel("Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)");
  const kontroll = new AbortController();
  const timer = setTimeout(() => kontroll.abort(), init.timeoutMs ?? 15_000);
  try {
    return await fetch(rest.origin + "/rest/v1/" + TABELL + sokvag, {
      ...init,
      headers: { ...rest.headers, ...(init.headers ?? {}) },
      signal: kontroll.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Tolkar PostgREST-fel — tabell-saknas gets sin egen felklass, nycklar läcker aldrig. */
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
  throw new Error("oversattningar-lagret svarade " + orsak);
}

// ── Skrivning (service-role) ─────────────────────────────────────────────────

/**
 * Spara/uppdatera rader (upsert på UNIQUE (scope_typ, scope_nyckel, språk)).
 * Poster skickas som EN begäran — ronden är aldrig pratsam mot lagret.
 */
export async function lasSpara(rader: readonly OversattningRad[]): Promise<void> {
  if (rader.length === 0) return;
  const res = await restForfragning("", {
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
}

// ── Läsning ──────────────────────────────────────────────────────────────────

/** Max ronder att läsa per sid_begäran — PostgREST default-sida är 1000 rader. */
const SIDSTORLEK = 1000;
/** Tak för statuskartan: 40 sidor = 40 000 rader ≈ dagens hela register ×2 språk. */
const MAX_Sidor = 40;

/**
 * Läs HELA statuskartan: "typ:nyckel:sprak" → {kallhash, status}.
 * Paginerad (Range-header). Vid tom databas returneras tom karta.
 */
export async function lasStatusKarta(): Promise<Map<string, StatusPost>> {
  const karta = new Map<string, StatusPost>();
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    const res = await restForfragning(
      "?select=scope_typ,scope_nyckel,sprak,kallhash,status",
      {
        method: "GET",
        headers: { Range: fran + "-" + String(fran + SIDSTORLEK - 1) },
        timeoutMs: 20_000,
      },
    );
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

/**
 * Markera gamla översättningar INAKTUELLA: allt för (typ, nyckel) vars kallhash
 * skiljer sig från den nya. Returnerar antal markerade rader.
 */
export async function markeraInaktuell(
  scope_typ: ScopeTyp,
  scope_nyckel: string,
  nyKallhash: string,
): Promise<number> {
  const res = await restForfragning(
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

/** Publik läsning av en publicerad översättning (framtida UI-konsumtion). */
export async function lasPublicerad(
  scope_typ: ScopeTyp,
  scope_nyckel: string,
  sprak: MalSprak,
): Promise<string | null> {
  const res = await restForfragning(
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

// ── Fallback-kön (lokal JSON) ────────────────────────────────────────────────

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

/** Köns tak: de SENASTE 500 objekterna behålls (filen ska inte växa okontrollerat). */
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
      JSON.stringify({ uppdaterad: new Date().toISOString(), notering: "fallback-kö — produktion kräver tabellen oversattningar (data/sql/oversattningar.sql)", poster: beskuren }, null, 2),
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
