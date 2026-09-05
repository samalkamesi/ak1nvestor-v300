/**
 * MORNONRONDEN — SERVER-DATA (B2B-BESLUT §4a kort 1 + §7 steg 3, våg 61 bygg-3).
 *
 * Vågvalideringens träff-% har INGEN läs-API — cronen (api/cron/vagvalidering)
 * skriver rapporten data/rapporter/vagvalidering-SENASTE.md (append-only
 * sanning). Morgonrondens första kort läser DÄRFÖR filen server-side (fs,
 * build/request-vägen — aldrig klienten) och plockar ut:
 *   - raden "**Totalt:** 52 % träff (n=48 dömda, osatta 20 % …)"
 *   - per-horizontabellen "| mikro | 75 % (n=4) | — (n=0) | 63 % (n=8) | … |"
 *   - dateringen ("**Genererad:** 2026-09-04T14:35:23.935Z")
 *
 * PARSER-KONTRAKT (ren, deterministisk — P1: inga klockor, inget slump):
 * samma filinnehåll ⇒ JSON-identiskt utsnitt. Ogiltiga/ändrade rader tolkas
 * defensivt: en cell som inte kan läsas blir null, aldrig påhittad. Saknas
 * filen eller totalraden ⇒ null (kortet vilar — motorn gissar aldrig).
 *
 * Träff-% är ett öppet kvitto om det förflutna — ALDRIG en garanti om
 * framtiden (BESLUT §10). Pedagogisk forskning, inte investeringsråd.
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

/** Rapportens hem (cronens utdata — läses som den är, skrivs aldrig här). */
const RAPPORT_SOK = join(process.cwd(), "data", "rapporter", "vagvalidering-SENASTE.md");

/** En tabellcell: "75 % (n=4)" — null när cellen är "—" eller oläsbar. */
export type TraffCell = {
  /** Träffprocent i hela tal, 0–100. */
  procent: number;
  /** Antal dömda mätningar (träff + miss). */
  n: number;
};

/** Per horisont: impulsvåg | korrigering | basbygge (osatt-klassen döms aldrig). */
export type TraffHorisont = {
  horisont: string;
  impulsvag: TraffCell | null;
  korrigering: TraffCell | null;
  basbygge: TraffCell | null;
};

/** Utsnittet morgonrondens träff-kort får — åäö-fria nycklar (JSON-konventionen). */
export type TraffUtsnitt = {
  /** Rapportens "Genererad"-stamp (ISO) — dateringen syns alltid i kortet. */
  genererad: string;
  /** Total träffprocent över alla dömda mätningar, heltal 0–100. */
  totaltProcent: number;
  /** n = antal dömda mätningar (träff + miss). */
  domda: number;
  /** Osatta andelen av ALLA mätningar, heltal procent. */
  osattaProcent: number;
  /** "Rullande räknare sedan"-datumet ("2026-09-04"). */
  raknareSedan: string;
  /** Tabellen per horisont i rapportens ordning. */
  perHorisont: TraffHorisont[];
};

// ── Småhjälpare (defensiva — allt oläsbart blir null, inget påhittas) ───────

/** Läs "75 % (n=4)" / "75%(n=4)" → { procent: 75, n: 4 }; "—" och annat → null. */
function lasCell(rå: string): TraffCell | null {
  const m = /(\d+(?:[.,]\d+)?)\s*%\s*\(n=(\d+)\)/.exec(rå ?? "");
  if (!m) return null;
  const procent = Number(m[1].replace(",", "."));
  const n = Number(m[2]);
  if (!Number.isFinite(procent) || !Number.isFinite(n)) return null;
  return { procent: Math.round(procent), n };
}

/** "| mikro | 75 % (n=4) | — (n=0) | 63 % (n=8) | — (n=0) |" → TraffHorisont. */
function lasHorisontRad(rad: string): TraffHorisont | null {
  const falt = rad.split("|").map((f) => f.trim());
  // falt[0] är tom (ledande |) — horisont + tre klassceller + osatt-cell.
  const horisont = falt[1] ?? "";
  if (!/^[a-zåäö]+$/i.test(horisont)) return null;
  return {
    horisont,
    impulsvag: lasCell(falt[2] ?? ""),
    korrigering: lasCell(falt[3] ?? ""),
    basbygge: lasCell(falt[4] ?? ""),
  };
}

// ── Kärnan ───────────────────────────────────────────────────────────────────

/**
 * Tolka rapportens TEXT (ren funktion — P1-testbar, ingen fs). Null när
 * totalraden inte kan tolkas — kortet vilar då (P3).
 */
export function tolkaVagvalideringText(text: string): TraffUtsnitt | null {
  if (typeof text !== "string" || text === "") return null;

  // Totalraden: "**Totalt:** 52 % träff (n=48 dömda, osatta 20 % av alla
  // mätningar) — räknare sedan 2026-09-04."
  const totalt =
    /\*\*Totalt:\*\*\s*(\d+(?:[.,]\d+)?)\s*%\s*träff\s*\(n=(\d+)\s*dömda,\s*osatta\s*(\d+(?:[.,]\d+)?)\s*%/.exec(
      text,
    );
  if (!totalt) return null;
  const totaltProcent = Number(totalt[1].replace(",", "."));
  const domda = Number(totalt[2]);
  const osattaProcent = Number(totalt[3].replace(",", "."));
  if (!Number.isFinite(totaltProcent) || !Number.isFinite(domda) || !Number.isFinite(osattaProcent)) {
    return null;
  }

  const genereradMatch = /\*\*Genererad:\*\*\s*([^\s·]+)/.exec(text);
  const sedanMatch = /räknare sedan\s*(\d{4}-\d{2}-\d{2})/.exec(text);

  // Per-horisontrader: tabellrader under "## Rullande träff-% …".
  const perHorisont: TraffHorisont[] = [];
  for (const rad of text.split(/\r?\n/)) {
    const trimmad = rad.trim();
    if (!trimmad.startsWith("|")) continue;
    const tolkad = lasHorisontRad(trimmad);
    if (tolkad && tolkad.horisont !== "Horisont") perHorisont.push(tolkad);
  }

  return {
    genererad: genereradMatch ? genereradMatch[1] : "",
    totaltProcent: Math.round(totaltProcent),
    domda,
    osattaProcent: Math.round(osattaProcent),
    raknareSedan: sedanMatch ? sedanMatch[1] : "",
    perHorisont,
  };
}

/**
 * Läs och tolka senaste vågvalideringsrapporten (fs-wrapper kring den rena
 * tolkaren). Null när filen saknas, är oläsbar eller totalraden inte kan
 * tolkas — kortet vilar då (P3).
 */
export function lasVagvalideringTraff(): TraffUtsnitt | null {
  if (!existsSync(RAPPORT_SOK)) return null;
  try {
    return tolkaVagvalideringText(readFileSync(RAPPORT_SOK, "utf8"));
  } catch {
    return null;
  }
}
