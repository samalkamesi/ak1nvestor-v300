/**
 * ANALYSFABRIKEN — server-side läsning av det automatiska Forskningsbiblioteket.
 *
 * Källa: data/forskningsbiblioteket/{TICKER}.json (schema analysfabrik-v1),
 * genererat av verktyg/kor-analysfabrik.mjs ur korstabell + AKM1/FVag-cacher
 * (byggplan: data/forskning/STYRELSE-analysbibliotek.md §2.2–§2.3).
 *
 * INTE samma sak som:
 *  - src/lib/analysbank.ts      (KLIENT-side localStorage, elevens egna verk)
 *  - src/lib/content.ts         (data/analyses/ — grundarens premiumanalyser)
 *
 * Läsmönster: toleranta fs-läsningar vid build/render (samma princip som
 * src/lib/portfolj-forskning/korstabell-data.ts) — ogiltiga filer stryks,
 * en tom katalog ger tom lista; motorn gissar aldrig.
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const KATALOG = join(ROOT, "data", "forskningsbiblioteket");

export const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"] as const;
export type HorisontNyckel = (typeof HORIZONTER)[number];

export type VagKlassText = "impulsvag" | "korrigering" | "basbygge" | "osatt" | string;
export type DynamikText = "forbattras" | "stabilt" | "forsvamras" | "osatt" | string;

export type Motiveringsrad = {
  variabel: string;
  namn: string;
  poang: number;
  motivering: string;
};

/** Våg 57 D2: en aktiverad branschmodul i AKM2-blocket (ur modulregistret). */
export type Akm2ModulRad = {
  modulId: string;
  orsak: string;
  variabler: string[];
  poang: Record<string, number>;
};

/** Våg 57 D2: AKM2-profilen — raknaAKM2 med moduler auto + akm2-2026. */
export type AnalysfabrikAkm2 = {
  totalt: number | null;
  skillnad: number | null;
  viktprofil: string;
  modellVersion: string | null;
  band: string | null;
  portAktiv: boolean;
  aktivaModuler: Akm2ModulRad[];
  modulVariablerSatta: string[];
  modulVariablerOsatta: string[];
  dynamikPaverkan: string | null;
  omfordelningText: string | null;
  osakerhetNote: string | null;
  radModuler: string[];
  kalla: string;
};

/** analysfabrik-v1 — genererat dokument (se verktyg/kor-analysfabrik.mjs). */
export type AnalysfabrikAnalys = {
  schema: "analysfabrik-v1";
  ticker: string;
  namn: string;
  bransch: string;
  land: string | null;
  valuta: string | null;
  versionsdatum: string;
  underlagSenastKontrollerad: string | null;
  genereradAv?: string;
  urval: {
    regel: string;
    status: "gron" | "gul" | string;
    statusEtikett: string;
    relativAkm1: number;
    datatackning: number;
    portV19: boolean;
    varning: string | null;
  };
  rankPoang: number;
  akm1: {
    totalt: number;
    maxMojligt: number;
    relativ: number;
    perKategori: Record<string, number>;
    starkast: string;
    svagast: string;
    osattaVariabler: string[];
    antalOsatta: number;
    topp3Motiveringar: Motiveringsrad[];
    botten3Motiveringar: Motiveringsrad[];
  };
  /** Våg 57 D2: bolagets AKM2-profil — null när beriknings-cachen saknades. */
  akm2?: AnalysfabrikAkm2 | null;
  vaglage: {
    perHorisont: Record<HorisontNyckel, VagKlassText>;
    fvagDynamik: DynamikText;
    tolkning: string;
  };
  konfluens: null;
  golv: { typ: string; marginal: number | null; not: string };
  risker: string[];
  falsifiering: string[];
  lasMer: { bloggSlug: string | null; kurser: string[]; analysSida: string };
  etikett: string;
  disclaimer: string;
};

let cache: AnalysfabrikAnalys[] | null = null;

/** Alla analyser, sorterade på rankPoang (fallande) — urvalets rangordning. */
export function lasAnalyser(): AnalysfabrikAnalys[] {
  if (cache) return cache;
  const lista: AnalysfabrikAnalys[] = [];
  if (existsSync(KATALOG)) {
    for (const fil of readdirSync(KATALOG)) {
      if (!fil.endsWith(".json")) continue;
      try {
        const a = JSON.parse(readFileSync(join(KATALOG, fil), "utf8")) as AnalysfabrikAnalys;
        // Tolerant kontrakt: ticker + namn + schema måste finnas — resten
        // renderas defensivt av sidorna.
        if (a?.ticker && a?.namn && a?.schema === "analysfabrik-v1") {
          lista.push(a);
        }
      } catch {
        // ogiltig JSON stryks tyst — ärlighetsprincipen gäller läsning också
      }
    }
  }
  lista.sort((a, b) => (b.rankPoang ?? 0) - (a.rankPoang ?? 0) || a.ticker.localeCompare(b.ticker));
  cache = lista;
  return lista;
}

/** Normaliserad uppslagning: INDU-C_ST ≈ "INDU-C.ST" ≈ "indu-c.st". */
export function getAnalys(ticker: string): AnalysfabrikAnalys | null {
  const norm = decodeURIComponent(ticker)
    .trim()
    .toUpperCase()
    .replace(/\.JSON$/, "")
    .replace(/_/g, ".");
  return (
    lasAnalyser().find((a) => {
      const t = a.ticker.toUpperCase();
      return t === norm || t.replace(/_/g, ".") === norm;
    }) ?? null
  );
}

/** Sverige-först för listvyer (bloggkadens §2.4) — övriga efter rank. */
export function svenskaForst(): AnalysfabrikAnalys[] {
  const alla = lasAnalyser();
  const sv = alla.filter((a) => a.land === "Sverige");
  const ovriga = alla.filter((a) => a.land !== "Sverige");
  return [...sv, ...ovriga];
}
