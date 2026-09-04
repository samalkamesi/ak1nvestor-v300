/**
 * FORSKNINGSLÄGET (M3 — STYRELSE-mega-integration) — korstabellens 100-bolags-
 * forskning sammanfattad till ett deterministiskt läge för eleven.
 *
 * REN FUNKTION (testbar, inget nät / fs / Date-now i kärnan): raknaForskningslage
 * räknar grön/gul/röd ur P6:s korstabellrader, andel gröna, topp-3 gröna
 * (högst akm1Totalt), veckans research-bolag (deterministisk hash ur ISO-vecko-
 * numret — samma mönster som veckoplan: samma vecka ger alltid samma bolag) och
 * en "marknadsläge"-text ur FASTA trösklar. Dateringen härleds ur radernas
 * senastKontrollerad — ärlighetsprincipen: korstabellen är manuellt levererad,
 * så varje yta som visar läget bär datumet, aldrig "just nu på börsen".
 *
 * Språk: beskrivande forskningsredovisning — ALDRIG rådgivning (lagen 2007:528).
 * "Klarar de strikta kraven" beskriver korstabellens statusregler (grön =
 * AKM1 ≥ 70 % av max, datatäckning ≥ 60 %, inget port-brott) — inget omdöme.
 */

import type { KorstabbellRad } from "./portfolj-forskning/typer";

// ── Fasta trösklar (deterministiska — samma underlag ger alltid samma text) ──

/** RIKT: andel gröna ≥ 10 % av korstabellens rader. */
export const TROSKEL_RIKT_ANDEL_GRONA = 0.1;
/** RIKT: andel röda ≤ 30 % (få port-brott/underperformers). */
export const TROSKEL_RIKT_ANDEL_RODA = 0.3;
/** MAGERT: andel gröna < 8 % — få bolag klarar de strikta kraven. */
export const TROSKEL_MAGERT_ANDEL_GRONA = 0.08;
/** MAGERT: andel röda > 35 % — många port-brott/underperformers. */
export const TROSKEL_MAGERT_ANDEL_RODA = 0.35;

export type ForskningslageTyp = "rikt" | "balanserat" | "magert" | "osatt";

/** Ett bolag i topp-3/veckourvalet — bara fält eleven behöver (små svar). */
export type ForskningslageBolag = {
  ticker: string;
  namn: string;
  bransch: string;
  akm1Totalt: number;
  akm1MaxMojligt: number | null;
  /** akm1Totalt / akm1MaxMojligt när taket finns — "poäng av max", aldrig dolt. */
  andelAvMax: number | null;
};

export type Forskningslage = {
  /** Antal rader i underlaget (0 = inget levererat). */
  antal: number;
  grona: number;
  gula: number;
  roda: number;
  osatta: number;
  /** Gröna andel av antal, 0–1, avrundad till 4 decimaler (stabilt JSON). */
  andelGrona: number;
  /** andelGrona i hela procent — donut-kortets siffra. */
  andelGronaProcent: number;
  typ: ForskningslageTyp;
  /** Deterministisk lägestext ur fasta trösklar — beskriver, dömer aldrig. */
  marknadslage: string;
  /** Topp-3 gröna (högst akm1Totalt, ties på ticker stigande). */
  topp: ForskningslageBolag[];
  /** Veckans research-bolag — hash ur ISO-veckonumret mot grönapoolen. */
  veckansBolag: {
    veckonr: number;
    bolag: ForskningslageBolag | null;
    text: string;
  };
  /** Senaste senastKontrollerad i underlaget ("2026-09-03") — "" saknas. */
  senastKontrollerad: string;
};

// ── Tid och veckorum (UTC-stabilt — server/klient ger samma veckonummer) ─────

/** ISO-veckonummer (torsdagen definierar veckan) — samma algoritm som veckoplan. */
export function veckoNummer(d: Date = new Date()): number {
  const datum = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dagNr = datum.getUTCDay() || 7; // måndag 1 … söndag 7
  datum.setUTCDate(datum.getUTCDate() + 4 - dagNr);
  const arsStart = new Date(Date.UTC(datum.getUTCFullYear(), 0, 1));
  return Math.ceil(((datum.getTime() - arsStart.getTime()) / 86400000 + 1) / 7);
}

/** Deterministisk hash av veckonumret — veckans signatur (veckoplanens mönster). */
export function veckoHash(vn: number): number {
  let h = Math.imul(Math.trunc(vn) + 0x5bd1e995, 0x27d4eb2f);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return h >>> 0;
}

// ── Hjälpare (rena) ──────────────────────────────────────────────────────────

function tillBolag(rad: KorstabbellRad): ForskningslageBolag {
  const max = typeof rad.akm1MaxMojligt === "number" && rad.akm1MaxMojligt > 0 ? rad.akm1MaxMojligt : null;
  return {
    ticker: rad.ticker,
    namn: rad.namn || rad.ticker,
    bransch: rad.bransch,
    akm1Totalt: rad.akm1Totalt,
    akm1MaxMojligt: max,
    andelAvMax: max !== null ? Math.round((rad.akm1Totalt / max) * 1000) / 1000 : null,
  };
}

/** Gröna poolen, deterministisk ordning: akm1Totalt fallande, ticker stigande. */
function gronaPoolSorterad(rader: KorstabbellRad[]): KorstabbellRad[] {
  return rader
    .filter((r) => r.status === "gron")
    .sort((a, b) => (b.akm1Totalt - a.akm1Totalt) || (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0));
}

/** Senaste giltiga ISO-datum ur radernas senastKontrollerad ("" om inget). */
function senasteDatum(rader: KorstabbellRad[]): string {
  let senaste = "";
  for (const r of rader) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(r.senastKontrollerad) && r.senastKontrollerad > senaste) {
      senaste = r.senastKontrollerad;
    }
  }
  return senaste;
}

function raknaAndel(del: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((del / total) * 10000) / 10000;
}

// ── Kärnan ───────────────────────────────────────────────────────────────────

/**
 * Räkna forskningsläget ur korstabellrader. Ren funktion: inga globaler, inget
 * nät, ingen klocka när veckonr anges explicit (testbarhet). Utan veckonr
 * används aktuell ISO-vecka — samma vecka ger alltid samma veckans bolag.
 */
export function raknaForskningslage(rader: KorstabbellRad[], veckonr: number = veckoNummer()): Forskningslage {
  const antal = rader.length;
  const grona = rader.filter((r) => r.status === "gron").length;
  const gula = rader.filter((r) => r.status === "gul").length;
  const roda = rader.filter((r) => r.status === "rod").length;
  const osatta = rader.filter((r) => r.status === "osatt").length;

  const andelGrona = raknaAndel(grona, antal);
  const andelRoda = raknaAndel(roda, antal);
  const andelGronaProcent = Math.round(andelGrona * 100);

  // Lägestyp ur fasta trösklar — deterministiskt, samma underlag ⇒ samma text.
  let typ: ForskningslageTyp;
  let marknadslage: string;
  if (antal === 0) {
    typ = "osatt";
    marknadslage =
      "Forskningsunderlaget är ännu inte levererat — läget redovisas när korstabellens mätningar finns (motorn gissar aldrig).";
  } else if (andelGrona >= TROSKEL_RIKT_ANDEL_GRONA && andelRoda <= TROSKEL_RIKT_ANDEL_RODA) {
    typ = "rikt";
    marknadslage = `Forskningsläget är rikt — ${grona} av ${antal} bolag klarar de strikta kraven.`;
  } else if (andelGrona < TROSKEL_MAGERT_ANDEL_GRONA || andelRoda > TROSKEL_MAGERT_ANDEL_RODA) {
    typ = "magert";
    marknadslage = `Forskningsläget är magert — ${grona} av ${antal} bolag klarar de strikta kraven, selektion avgör.`;
  } else {
    typ = "balanserat";
    marknadslage = `Forskningsläget är i rörelse — ${grona} av ${antal} bolag klarar de strikta kraven och ${gula} rör sig i mellanskiktet.`;
  }

  // Topp-3 gröna + veckans research-bolag (hash ur veckonumret mot grönapoolen).
  const pool = gronaPoolSorterad(rader);
  const topp = pool.slice(0, 3).map(tillBolag);
  const vBolag = pool.length > 0 ? tillBolag(pool[veckoHash(veckonr) % pool.length]) : null;

  return {
    antal,
    grona,
    gula,
    roda,
    osatta,
    andelGrona,
    andelGronaProcent,
    typ,
    marknadslage,
    topp,
    veckansBolag: {
      veckonr,
      bolag: vBolag,
      text: vBolag
        ? `Vecka ${veckonr}: ${vBolag.namn} leder forskningsurvalet`
        : `Vecka ${veckonr}: inget bolag klarar de strikta kraven ännu`,
    },
    senastKontrollerad: senasteDatum(rader),
  };
}
