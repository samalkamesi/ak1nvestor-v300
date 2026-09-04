/**
 * AKM2 ON-DEMAND — server-side hämtning av ett AKM2Resultat för en analys i
 * Forskningsbiblioteket (våg 57 D3).
 *
 * Prioritering (uppdraget §4b, anpassat till D2:s leverans våg 57):
 *   1) analys-JSON:ns `akm2`-block OM det bär ett HELT AKM2Resultat
 *      (D2:s sammanfattande block har inte den formen — se steg 2),
 *   2) D2:s berikningscache data/cache/akm2-{TICKER}.json → `.resultat`
 *      (fullständigt AKM2Resultat: raknaAKM2 med automatiska moduler ur
 *      modulregistret + viktprofilen "akm2-2026" — samma konfiguration som
 *      fallbacken i steg 3, så siffrorna överensstämmer),
 *   3) annars beräknas resultatet on-demand med raknaAKM2 ur P1:s
 *      nyckeltalscache data/cache/fundamental-{TICKER}.json (BolagsNyckeltal):
 *      moduler aktiva per bransch (byggModulAktiveringar), viktprofilen
 *      "akm2-2026" (BESLUT §2 — omfördelning vid osatt), UTAN dynamik
 *      (neutral degradering, R4 §4: nedåt mot AKM1, aldrig mot gissning).
 *
 * ÄRLIGHET: kärnans raknaAKM1 skiljer sig medvetet från P1-passens motor
 * (som härleder proxy-värden, t.ex. P/S ur P/E × vinstmarginal) — kärnan
 * lämnar sådana variabler osatta. Dashboarden jämför därför AKM1-skuggan och
 * kompositen INOM samma motor (lager1.totalt vs komposit), och sidan förklarar
 * skillnaden mot P1-summan i löptext. Osatt är osatt.
 *
 * Determinism: raknaAKM2 har inga klockor (datum = k.hamtat) — samma cache
 * ger JSON-identiskt resultat vid varje build. Läsning är tolerant: saknas
 * eller är ogiltig cachefilen returneras null och sektionen renderas ej.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { AKM2Resultat } from "./akm2/typer";
import { raknaAKM2 } from "./akm2/karna";
import type { BolagsNyckeltal } from "./portfolj-forskning/typer";
import { getAnalys } from "./analysfabrik";
import { byggModulAktiveringar } from "./akm2-visningsdata";

export type Akm2Kalla = "analys-json" | "akm2-cache" | "beraknad-ur-cache";

export type Akm2Upphamtning = {
  ticker: string;
  resultat: AKM2Resultat;
  /** Varifrån resultatet kom — visas i UI för transparens. */
  kalla: Akm2Kalla;
};

/** Formguard: ser ut som ett AKM2Resultat (lager 1/2/4 + komposit)? */
function arAkm2Resultat(x: unknown): x is AKM2Resultat {
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

/** Formguard: ser ut som ett BolagsNyckeltal (kärnans minimikontrakt)? */
function arNyckeltal(x: unknown): x is BolagsNyckeltal {
  if (!x || typeof x !== "object") return false;
  const k = x as Record<string, unknown>;
  return (
    typeof k.ticker === "string" &&
    k.ticker !== "" &&
    typeof k.bransch === "string" &&
    typeof k.hamtat === "string" &&
    typeof k.namn === "string"
  );
}

/** Samma sanering som verktyg/kor-analysfabrik.mjs tickerFil (".":ar → "_"). */
function tickerFil(ticker: string): string | null {
  if (!ticker || ticker.includes("..")) return null;
  const rensat = ticker.replace(/[^A-Za-z0-9._-]/g, "_").replace(/\./g, "_");
  return rensat && !rensat.startsWith(".") ? rensat : null;
}

/**
 * Hämta AKM2-resultatet för en analys i Forskningsbiblioteket.
 * Returnerar null när varken akm2-block eller fundamental-cache finns —
 * anroparen renderar då ingenting (motorn gissar aldrig).
 */
export function hamtaAkm2ForAnalys(ticker: string): Akm2Upphamtning | null {
  const a = getAnalys(ticker);
  if (!a) return null;

  // (1) D2:s akm2-block i analys-JSON — används OM det bär hela resultatet.
  const block = (a as { akm2?: unknown }).akm2;
  if (arAkm2Resultat(block)) {
    return { ticker: a.ticker, resultat: block, kalla: "analys-json" };
  }

  const fil = tickerFil(a.ticker);
  if (!fil) return null;

  // (2) D2:s berikningscache — fullständigt AKM2Resultat (kor-akm2-berika.mjs).
  const akm2CacheVag = join(process.cwd(), "data", "cache", `akm2-${fil}.json`);
  if (existsSync(akm2CacheVag)) {
    try {
      const c = JSON.parse(readFileSync(akm2CacheVag, "utf8")) as { resultat?: unknown };
      if (arAkm2Resultat(c?.resultat)) {
        return { ticker: a.ticker, resultat: c.resultat, kalla: "akm2-cache" };
      }
    } catch {
      // ogiltig cache — fall vidare till on-demand-beräkningen
    }
  }

  // (3) On-demand ur P1:s nyckeltalscache.
  const vag = join(process.cwd(), "data", "cache", `fundamental-${fil}.json`);
  if (!existsSync(vag)) return null;
  try {
    const k = JSON.parse(readFileSync(vag, "utf8")) as unknown;
    if (!arNyckeltal(k)) return null;
    const resultat = raknaAKM2(k, {
      moduler: byggModulAktiveringar(k),
      viktprofil: "akm2-2026",
    });
    return { ticker: a.ticker, resultat, kalla: "beraknad-ur-cache" };
  } catch {
    return null; // ogiltig JSON/läsfel — ärlighetsprincipen gäller läsning också
  }
}
