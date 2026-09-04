/**
 * ÖVERSÄTTNINGS-ADMIN — termbankens levande tillägsfil (Våg 52 agent C).
 *
 * Admin-panelens termbanksvy (GET/POST /api/admin/oversattning/termbank) låter
 * administratören lägga till och uppdatera termer löpande. Den kanoniska banken
 * (src/lib/oversattning/termbank.ts) är källfakta i kod — den filen ägs av
 * översättningspipelinen och redigeras inte av admin-rutterna. Nya termer
 * persistas därför här, i data/termbank-tillagg.json, och presenteras i panelen
 * som "väntar sammanslagning": kontrollgarantin (termKonsistens i
 * src/lib/oversattning/kontroller.ts) gäller termen först när raden slagits
 * samman in i TERMBANK-arrayen (termbank.ts:s dokumenterade utökningsmodell:
 * "nya rader i TERMBANK-arrayen = nya termer").
 *
 * LAGRING: data/termbank-tillagg.json (env-överridbar via
 * TERMBANK_TILLAGG_SOKVAG) — samma mönster som lager.ts:s lokala fallback-kö:
 * skrivbar lokalt, på Vercel kan filsystemet neka (read-only utom /tmp) och då
 * returneras ok=false med ärlig felorsak — aldrig tyst förlust.
 *
 * Modulen är fs-beroende: endast server-sammanhang (API-rutter).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { TermRad } from "@/lib/oversattning/termbank";

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
