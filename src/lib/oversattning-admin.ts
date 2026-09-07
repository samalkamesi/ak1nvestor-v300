/**
 * ÖVERSÄTTNINGS-ADMIN — termbankens levande tillägsfil (Våg 52 agent C → våg 79 prod-fix).
 *
 * Admin-panelens termbanksvy (GET/POST /api/admin/oversattning/termbank) låter
 * administratören lägga till och uppdatera termer löpande. Den kanoniska banken
 * (src/lib/oversattning/termbank.ts) är källfakta i kod — den filen ägs av
 * översättningspipelinen och redigeras inte av admin-rutterna. Nya termer
 * persistas därför här och presenteras i panelen som "väntar sammanslagning":
 * kontrollgarantin (termKonsistens i src/lib/oversattning/kontroller.ts) gäller
 * termen först när raden slagits samman in i TERMBANK-arrayen (termbank.ts:s
 * dokumenterade utökningsmodell) — eller via termbank.ts:s tilläggs-overlay.
 *
 * LAGRING (VÅG 79 — STYRELSE-ADMIN-MEGA steg 1, "TERMBANK-PROD-FIX"):
 *   1. SUPABASE ÄR SANNINGEN: varje laggTill/uppdatera/taBort skriver en rad i
 *      system_events med type="termbank_tillagg" (details={sv,en,ar,kat,notering?,
 *      av:"admin"}; taBort ⇒ {sv, raderad:true, av:"admin"}). Senaste-vinner per
 *      sv-nyckel (order created_at.desc,id.desc — samma totala ordning som
 *      lager.ts:s MÖS-event). Detta fungerar på Vercel: inget filsystem krävs.
 *   2. FILEN ÄR DEV-SPEGEL: data/termbank-tillagg.json (env-överridbar via
 *      TERMBANK_TILLAGG_SOKVAG) skrivs som bästa försök lokalt; på Vercel är
 *      filsystemet read-only och ok=false är ett ACCEPTERAT svar — Supabase-
 *      raden är sanningen och synkas ner av verktyg/synka-termbank.mjs före
 *      lokala pipeline-runs (idempotent merge, befintliga rader bevaras).
 *
 * Modulen är fs-beroende: endast server-sammanhang (API-rutter + tsx-verktyg).
 * Supabase-nycklar läses ENBART via supabase-rest.ts (SSRF-skydd) och hamnar
 * aldrig i loggar eller felmeddelanden här.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getSupabaseRest } from "./supabase-rest";
import type { TermRad } from "./oversattning/termbank";

// ── Typer ─────────────────────────────────────────────────────────────────────

/** En admin-tillagd/uppdaterad term — TermRad + spårbarhet. */
export type TermbankTillagg = TermRad & {
  /** När termen lades till/uppdaterades senast (ISO). */
  uppdaterad: string;
};

export type TermbankTillaggFil = {
  uppdaterad: string;
  notering: string;
  poster: TermbankTillagg[];
};

// ── Sökväg ────────────────────────────────────────────────────────────────────

export function termbankTillaggSokvag(): string {
  return process.env.TERMBANK_TILLAGG_SOKVAG || path.join(process.cwd(), "data", "termbank-tillagg.json");
}

// ── Läsning ───────────────────────────────────────────────────────────────────

/** Läs tilläggen — saknad/korrupt fil = tom lista (aldrig ett fel). */
export function lasTermbankTillagg(): { poster: TermbankTillagg[] } {
  try {
    if (!existsSync(termbankTillaggSokvag())) return { poster: [] };
    const parsad = JSON.parse(readFileSync(termbankTillaggSokvag(), "utf8")) as Partial<TermbankTillaggFil>;
    if (!Array.isArray(parsad.poster)) return { poster: [] };
    return {
      poster: parsad.poster.filter(
        (p) => p && typeof p.sv === "string" && typeof p.en === "string" && typeof p.ar === "string",
      ),
    };
  } catch {
    return { poster: [] };
  }
}

// ── Skrivning ─────────────────────────────────────────────────────────────────

/**
 * Spara tilläggen (upsert på sv är anroparens ansvar — här persistas listan).
 * Returnerar ok=false när filsystemet nekar (read-only) — ärligt, aldrig tyst.
 */
export function sparaTermbankTillagg(poster: TermbankTillagg[]): { ok: boolean; fel: string | null } {
  try {
    const fil: TermbankTillaggFil = {
      uppdaterad: new Date().toISOString(),
      notering:
        "Admin-tillägg till MÖS-termbanken. Kontrollgarantin (termKonsistens) gäller termen först när " +
        "raden slagits samman in i TERMBANK i src/lib/oversattning/termbank.ts — tills dess är den ett " +
        "granskat förslag i pipeline-kön.",
      poster,
    };
    writeFileSync(termbankTillaggSokvag(), JSON.stringify(fil, null, 2), "utf8");
    return { ok: true, fel: null };
  } catch (e) {
    return {
      ok: false,
      fel: e instanceof Error ? "filen kunde inte sparas (read-only filsystem?): " + e.name : "filen kunde inte sparas",
    };
  }
}

/**
 * Lägg till UPPDATERA en term (upsert på sv i tilläggsfilen).
 * Returnerar den nya listan + om nyckeln var ny.
 */
export function upsertTermbankTillagg(rad: TermRad): { poster: TermbankTillagg[]; varNy: boolean } {
  const { poster } = lasTermbankTillagg();
  const stampad: TermbankTillagg = { ...rad, uppdaterad: new Date().toISOString() };
  const ix = poster.findIndex((p) => p.sv === rad.sv);
  const varNy = ix === -1;
  const nya = [...poster];
  if (varNy) nya.push(stampad);
  else nya[ix] = stampad;
  return { poster: nya, varNy };
}

/** Ta bort en term ur tilläggsfilen (den kanoniska banken rörs aldrig här). */
export function taBortTermbankTillagg(sv: string): { poster: TermbankTillagg[]; fanns: boolean } {
  const { poster } = lasTermbankTillagg();
  const utan = poster.filter((p) => p.sv !== sv);
  return { poster: utan, fanns: utan.length !== poster.length };
}

// ── Supabase-lagret (våg 79): system_events type="termbank_tillagg" ──────────

/** Event-typen i system_events — hela prod-lagrets nyckel. */
export const TERMBANK_EVENT_TYP = "termbank_tillagg";

/** details-kroppen för ett termbank-event. taBort ⇒ {sv, raderad:true, av}. */
export type TermbankEventDetails = {
  sv: string;
  en?: string;
  ar?: string;
  kat?: string;
  notering?: string;
  raderad?: boolean;
  av: string;
};

/** Tilläggsrad + system_events-radens id (för ev. precis rensning). */
export type TermbankTillaggMedId = TermbankTillagg & { eventId?: string };

/**
 * Termbank-event → system_events-POST-kropp. Ren funktion (mönster: lager.ts
 * mosEventKropp). message är sökbart: "[termbank] <action> <sv>".
 */
export function termbankEventKropp(
  details: TermbankEventDetails,
  action: string,
): {
  type: string;
  severity: string;
  message: string;
  details: TermbankEventDetails;
  source: string;
} {
  return {
    type: TERMBANK_EVENT_TYP,
    severity: "info",
    message: "[termbank] " + action + " " + details.sv,
    details,
    source: "termbank-admin",
  };
}

/**
 * Skriv ett termbank-event till Supabase (SANNINGEN — fungerar på Vercel).
 * service-role-headers kommer från env via supabase-rest.ts och loggas ALDRIG.
 * Returnerar ok=false med ärlig, nyckelfri felorsak vid misslyckande.
 */
export async function skrivTermbankEventSupabase(
  details: TermbankEventDetails,
  action: string,
): Promise<{ ok: boolean; fel: string | null }> {
  const rest = getSupabaseRest();
  if (!rest) {
    return { ok: false, fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)" };
  }
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(termbankEventKropp(details, action)),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return { ok: false, fel: "Supabase svarade HTTP " + String(res.status) };
    return { ok: true, fel: null };
  } catch (e) {
    return { ok: false, fel: e instanceof Error ? "Supabase-onåbart (" + e.name + ")" : "Supabase-onåbart" };
  }
}

/** Tak för läsningen: 20 sidor à 1 000 rader — termbank-event är få (organet
 *  deduplicerar dessutom typen dagligen), taket är bara ett ärligt staggerp. */
const SUPABASE_MAX_Sidor = 20;

/**
 * Läs termbank-tilläggen ur Supabase: HELA typen, nyast först (created_at.desc,
 * id.desc — samma totala ordning som lager.ts), SENASTE-VINNER per sv-nyckel.
 * Rader vars senaste event har raderad:true är BORTTAGNA (redovisas i raderadeSv).
 * Tolerant: nätverksfel ⇒ ok=false med felorsak — anroparen består då utan
 * Supabase-vy (fil-läget), aldrig krasch.
 */
export async function lasTermbankTillaggSupabase(): Promise<{
  ok: boolean;
  fel: string | null;
  poster: TermbankTillaggMedId[];
  raderadeSv: string[];
  raRader: number;
}> {
  const rest = getSupabaseRest();
  if (!rest) {
    return { ok: false, fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)", poster: [], raderadeSv: [], raRader: 0 };
  }
  type EventRad = { created_at?: string | null; id?: string | null; details?: unknown };
  const rader: EventRad[] = [];
  try {
    for (let sida = 0; sida < SUPABASE_MAX_Sidor; sida++) {
      const fran = sida * 1000;
      const res = await fetch(
        rest.origin +
          "/rest/v1/system_events?type=eq." + TERMBANK_EVENT_TYP +
          "&select=created_at,id,details&order=created_at.desc,id.desc",
        {
          headers: { ...rest.headers, Range: fran + "-" + String(fran + 999) },
          signal: AbortSignal.timeout(15_000),
        },
      );
      if (!res.ok) {
        return { ok: false, fel: "Supabase svarade HTTP " + String(res.status), poster: [], raderadeSv: [], raRader: rader.length };
      }
      const batch = (await res.json()) as EventRad[];
      if (!Array.isArray(batch)) break;
      rader.push(...batch);
      if (batch.length < 1000) break; // sista sidan
    }
  } catch (e) {
    return {
      ok: false,
      fel: e instanceof Error ? "Supabase-onåbart (" + e.name + ")" : "Supabase-onåbart",
      poster: [],
      raderadeSv: [],
      raRader: rader.length,
    };
  }

  // SENASTE-VINNER per sv (rader kommer nyast-först): första raden vinner.
  const sedda = new Set<string>();
  const poster: TermbankTillaggMedId[] = [];
  const raderadeSv: string[] = [];
  for (const r of rader) {
    const d = r?.details;
    if (!d || typeof d !== "object" || Array.isArray(d)) continue;
    const o = d as Record<string, unknown>;
    if (typeof o.sv !== "string" || !o.sv.trim() || sedda.has(o.sv)) continue;
    sedda.add(o.sv);
    if (o.raderad === true) {
      raderadeSv.push(o.sv);
      continue;
    }
    if (typeof o.en !== "string" || typeof o.ar !== "string" || !o.en.trim() || !o.ar.trim()) continue;
    poster.push({
      sv: o.sv,
      en: o.en,
      ar: o.ar,
      kat: (typeof o.kat === "string" && o.kat ? o.kat : "pedagogik") as TermRad["kat"],
      ...(typeof o.notering === "string" && o.notering ? { notering: o.notering } : {}),
      uppdaterad: typeof r.created_at === "string" && r.created_at ? r.created_at : new Date(0).toISOString(),
      ...(typeof r.id === "string" && r.id ? { eventId: r.id } : {}),
    });
  }
  return { ok: true, fel: null, poster, raderadeSv, raRader: rader.length };
}
