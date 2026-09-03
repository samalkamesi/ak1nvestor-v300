/**
 * AKM2 · LAGER 2 — MODULER-registret: branschfamilj → aktiva V21+-variabler.
 *
 * ÄGARE: modul-agenten (src/lib/akm2/moduler/). Kärna (karna.ts/typer.ts),
 * dynamik.ts och vikter.ts rörs aldrig härifrån.
 *
 * AKM2-BESLUT "Byggregler" + R4 lager 2: en modul är ett avgränsat paket
 * aktiva V21+-variabler + aktiveringsregel (branschmatchning). R4-regeln
 * "en modul får ALDRIG ändra en V01–V20-variabels poäng" respekteras —
 * viktJusteringar på AKM1-ID:n (t.ex. V05/V10/V19) påverkar enbart
 * VIKTprofilen vid sammanslagning, aldrig poängen i kärnan.
 *
 * viktJusteringar = multiplikativ faktor per variabel-ID (1 = oförändrad;
 * >1 = tonas upp; <1 = tonas ner; 0 = i praktiken avstängd). När flera
 * moduler matchar samma bransch multipliceras faktorerna per variabel-ID.
 *
 * Registret exporterar samtliga räknefunktioner (V21–V28 ur karna-moduler.ts,
 * V29 ur insider-modul.ts) så att konsumenter behöver en enda import.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */

import type { Bransch } from "../../portfolj-forskning/typer";

// ── Kontrakt ────────────────────────────────────────────────────────────────

/** En branschmodul: vilka V21+-variabler som är aktiva för en branschfamilj. */
export type BranschModul = {
  namn: string;
  matchar: (bransch: Bransch) => boolean;
  /** Aktiva variabel-ID:n (V21+; V29 ingår aldrig — villkorad och inaktiv). */
  aktivaV: string[];
  /** Multiplikativa viktfaktorer; AKM1-ID:n tillåtna (vikter, aldrig poäng). */
  viktJusteringar?: Record<string, number>;
};

// ── Branschmodulerna ────────────────────────────────────────────────────────

/**
 * SAAS — prenumerationsbolag (bransch: teknik).
 * V02-adaptern: SaaS-toningen av TILLVÄXTEN bärs av AKM1-kärnans V02
 * (ARR-tillväxt) — modulen lägger inte till den utan tonar upp de nya
 * variabler där SaaS-bolag skiljer sig: V21 (kapitalproduktivitet),
 * V22 (FCF-konversion är SaaS:s löftesrealisering) och V25 (SBC-utspädning
 * är den strukturella risken enligt Pontiff–Woodgate/Damodaran).
 */
const SAAS_MODUL: BranschModul = {
  namn: "SaaS — prenumerationsmodell (V02-adapter i kärnan bär ARR-toningen)",
  matchar: (b) => b === "teknik",
  aktivaV: ["V21", "V22", "V23", "V25"],
  viktJusteringar: { V21: 1.25, V22: 1.25, V25: 1.3 },
};

/**
 * BANK — finansiella bolag (bransch: finans).
 * V21 (ROIC) och V28 (EBIT/EV) är INAKTIVA: för banker är in- och utlåning
 * själva rörelsen — investerat kapital och företagsvärde mäter inte
 * värdeskapandet (R1:s kapitalstrukturneutrala mått bygger på operativa
 * bolag). I stället tonas AKM1:s V05 (P/B — eget kapital är bankens råvara)
 * och V10 (skuldsättningsgrad — balansräkningen ÄR verksamheten) upp via
 * viktJusteringar (enbart vikter; R4: en modul ändrar aldrig kärnpoäng).
 */
const BANK_MODUL: BranschModul = {
  namn: "Bank — V21/V28 inaktiva (ROIC/EV meningslöst när låneverksamheten är rörelsen), V05/V10 tonas upp",
  matchar: (b) => b === "finans",
  aktivaV: ["V22", "V23", "V24", "V25", "V26", "V27"],
  viktJusteringar: { V05: 1.25, V10: 1.25 },
};

/**
 * CYKLISK — normaliseringsnot (bransch: industri, material, energi).
 * NOT: nivåvariablerna ska tolkas genom cykelläget — en hög V21/V28 i
 * cykeltopp och god V24 i topp är normaliseringskrav, inte strukturella
 * kvaliteter. V24 tonas upp (skuldbetjäningen prövas i tråget), V28 tonas
 * ner (toppvinster gör earnings yield billig på fel grunder).
 */
const CYKLISK_MODUL: BranschModul = {
  namn: "Cyklisk — normaliseringsnot: läs nivåer genom cykelläge (topp överdriver V21/V28, tråg prövar V24)",
  matchar: (b) => b === "industri" || b === "material" || b === "energi",
  aktivaV: ["V21", "V24", "V27", "V28"],
  viktJusteringar: { V24: 1.15, V28: 0.85 },
};

/**
 * TILLGÅNGSTUNG — golv-koppling (bransch: fastighet, material, energi).
 * Kopplingen till BolagsNyckeltal.golv (NCAV/reim/tillgångstung): golvmarginalen
 * ska läsas mot kapitalproduktiviteten (V21) och kapitalcykeln (V26) — ett högt
 * golv med låg kapitalomsättning är dött kapital. V26 tonas upp (verkar först
 * när CapEx-data tillförs; idag osatt av karna-modulerna).
 */
const TILLGANGSTUNG_MODUL: BranschModul = {
  namn: "Tillgångstung — golv-koppling: NCAV/reim-värdet läsas mot kapitalproduktivitet (V21) och kapitalcykel (V26)",
  matchar: (b) => b === "fastighet" || b === "material" || b === "energi",
  aktivaV: ["V21", "V24", "V26", "V28"],
  viktJusteringar: { V26: 1.2 },
};

/**
 * TILLVÄXT — tillväxtbolag (bransch: tillvaxt, teknik).
 * V25 (utspädning) och AKM1:s V19 (kassatäckning/nyemissionsrisk) är
 * tillväxtbolagens huvudrisker — unga bolag finansierar tillväxten med
 * emissioner och SBC. V22 hålls aktiv men FCF är ofta negativt i
 * tillväxtfasen (poängen speglar det ärligt).
 */
const TILLVAXT_MODUL: BranschModul = {
  namn: "Tillväxt — V25/V19 betoning: utspädning och nyemissionsrisk är huvudriskerna",
  matchar: (b) => b === "tillvaxt" || b === "teknik",
  aktivaV: ["V22", "V25", "V28"],
  viktJusteringar: { V25: 1.25, V19: 1.25 },
};

/**
 * STANDARD — fallback då ingen branschfamilj matchar (konsument, hälso,
 * kommunikation m.fl.): samtliga kärnvariabler V21–V28 aktiva, inga justeringar.
 * matchar returnerar alltid false — modulen slås på av
 * aktivaModulerForBransch när registret annars ger tom lista.
 */
const STANDARD_MODUL: BranschModul = {
  namn: "Allmän — samtliga kärnvariabler aktiva (fallback utan branschfamilj)",
  matchar: () => false,
  aktivaV: ["V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28"],
};

// ── Registret (ordning = prioritet) ─────────────────────────────────────────

/** MODULER — samtliga branschmoduler, prioriteringsordning. */
export const MODULER: BranschModul[] = [
  SAAS_MODUL,
  BANK_MODUL,
  CYKLISK_MODUL,
  TILLGANGSTUNG_MODUL,
  TILLVAXT_MODUL,
  STANDARD_MODUL,
];

// ── Slå upp moduler/variabler per bransch ───────────────────────────────────

/** Alla moduler som matchar branschen (faller tillbaka på STANDARD_MODUL). */
export function aktivaModulerForBransch(bransch: Bransch): BranschModul[] {
  const traffar = MODULER.filter((m) => m.matchar(bransch));
  return traffar.length > 0 ? traffar : [STANDARD_MODUL];
}

/** Union av aktiva variabel-ID:n för branschen (sorterad, unik). */
export function aktivaVariablerForBransch(bransch: Bransch): string[] {
  const mängd = new Set<string>();
  for (const m of aktivaModulerForBransch(bransch)) {
    for (const v of m.aktivaV) mängd.add(v);
  }
  return [...mängd].sort();
}

/**
 * Sammanslagna viktjusteringar för branschen: när flera moduler matchar
 * multipliceras faktorerna per variabel-ID (dokumenterat val — dubbel
 * betoning ska förstärka, inte överskrivas).
 */
export function viktJusteringarForBransch(bransch: Bransch): Record<string, number> {
  const resultat: Record<string, number> = {};
  for (const m of aktivaModulerForBransch(bransch)) {
    for (const [id, faktor] of Object.entries(m.viktJusteringar ?? {})) {
      resultat[id] = id in resultat ? resultat[id] * faktor : faktor;
    }
  }
  return resultat;
}

// ── Vidareexport av alla beräkningsfunktioner (V21–V28 + V29) ───────────────

export {
  KARNA_MODUL_VARIABLER,
  KARNA_MODUL_FUNKTIONER,
  raknaV21ROIC,
  raknaV22FriaKassaflodesavkastning,
  raknaV23Redovisningskvalitet,
  raknaV24Skuldbetjaningsformaga,
  raknaV25Utspadning,
  raknaV26Kapitalcykel,
  raknaV27Utdelningskontinuitet,
  raknaV28EarningsYield,
} from "./karna-moduler";

export type { VariabelSvar } from "./karna-moduler";

export { INSIDER_MODUL_AKTIV, raknaV29Insider } from "./insider-modul";
export type { InsiderData } from "./insider-modul";
