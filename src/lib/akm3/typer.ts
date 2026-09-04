/**
 * AKM3 — TYPKONTRAKT för AKM3.2026.09 (AKM3-BESLUT §0 + §4).
 *
 * AKM3 = ett SYNTES- och ÄRLIGHETSSKIKT ÖVER den orörda AKM2-kärnan —
 * INGEN ny poängmotor. Denna version (2026.09) definierar ensemblen (r5
 * Design A: likaviktat medel av de tre existerande viktprofilernas
 * AKM2-kompositer + ensemble-band). Kalibrering/regim/osakerhet/peer är
 * SENARE steg i beslutets byggordning (§11 steg 3–6) och deras typer läggs
 * i sina egna filer när de byggs.
 *
 * NAMNKONVENTION (BESLUT §0): AKM2:s lager 4 = vikter. Kundens "AKM3-lager 4"
 * är PROJEKTNAMN; kodidentifierare utan lagernummer. Ensemblen är matematiskt
 * ett lager-5-aggregat ÖVER redan beräknade resultat.
 *
 * Denna fil innehåller ENBART typer (inga runtime-konstanter, inga funktioner)
 * så att ensemble.ts och framtida akm3-domäner säkert kan `import type` från
 * den — samma mönster som akm2/typer.ts.
 *
 * JSON-nycklar utan åäö. Importregeln (BESLUT "Byggregler"): ensemble.ts
 * importerar typer via `import type` härifrån + akm2/typer.ts +
 * portfolj-forskning/typer.ts; runtime-anropet nedåt är ENBAST raknaAKM2
 * (läsning av kärnan — samma precedens som portfolj-forskning/akm2-koppling.ts).
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import type { AKM2Band, ViktProfilId } from "../akm2/typer";

// ── Ensemble (BESLUT §4, r5 Design A) ────────────────────────────────────────

/**
 * De tre exakt likaviktade ensemble-medlemmarna (BESLUT §4: "exakt 3").
 * "akm1-klassisk" är låst (las: true) och ingår som medlem — ensemblen bygger
 * ÖVER den orörda kärnan, aldrig istället för den.
 */
export type EnsembleProfilId = "akm1-klassisk" | "akm2-2026" | "superanalys-2026";

/** Kanonisk medlemsordning (deterministisk utdata-ordning i perProfil). */
export const ENSEMBLE_PROFILER: readonly EnsembleProfilId[] = [
  "akm1-klassisk",
  "akm2-2026",
  "superanalys-2026",
];

/** Profil-enighetstrappan (BESLUT §4 / r5 §3.2): spridning i kompositpoäng. */
export type EnsembleEnighet = "enig" | "delad" | "profilspanning";

/**
 * En medlems resultatutsnitt — det ensemble-lagret behöver om varje profil.
 * Porten slår igenom automatiskt per profil (den följer DATA, inte profilen);
 * osatta andelar ärvs per profil och visas (BESLUT §4).
 */
export type EnsembleProfilResultat = {
  profil: EnsembleProfilId;
  /** K_p = raknaAKM2(k, { moduler, viktprofil: p }).komposit — 0–100. */
  komposit: number;
  band: AKM2Band;
  /** Profilens andel osatta kärnvariabler (0–1) — ärvs ur AKM2-resultatet. */
  andelOsatta: number;
  /** Hård port aktiv för just denna profils körning (följer DATA). */
  portAktiv: boolean;
};

/** Bandet över de tre profilkompositerna: [min, median, max] (BESLUT §4). */
export type EnsembleBand = {
  min: number;
  /** Mittenvärdet av de tre K_p (median — robust mot en avvikande profil). */
  median: number;
  max: number;
};

/** Diagnostik-differenser (BESLUT §4: tolkningsnycklarna till spridningen). */
export type EnsembleDiagnostik = {
  /** akm2-2026 − akm1-klassisk = omfördelningseffekten (osatta + moduler). */
  omfordelningseffekt: number;
  /** superanalys-2026 − akm2-2026 = kategorivikt vs variabelvikt. */
  kategoriMotVariabel: number;
};

/**
 * AKM3-ensemble-resultatet — lagret-5-aggregatet. Kontrakt (BESLUT §4):
 *   AKM3_total = round( Σ_p α_p·K_p ), α = 1/3 för alla — LÅST i 2026.09.
 *   spridning = max − min; enighet: 0–3 p "enig" · 4–7 p "delad" · ≥8 "profilspanning".
 *   modellVersion = "AKM3.2026.09".
 * AKM3 ersätter ALDRIG AKM2-kompositen eller AKM1-projektionen i existerande
 * ytor — alltid sida vid sida (P4).
 */
export type AKM3Ensemble = {
  ticker: string;
  namn: string;
  /** ISO — härlett ur k.hamtat (determinism: aldrig klocka). */
  datum: string;
  /** Semantisk modellversion — följer med i prediktionsloggen (BESLUT §12). */
  modellVersion: string;
  /** Likaviktat, avrundat medel av de tre K_p. */
  total: number;
  /** Medlemsresultat i kanonisk ordning (ENBART läsning — aldrig new). */
  perProfil: EnsembleProfilResultat[];
  band: EnsembleBand;
  /** max − min av de tre K_p (kompositpoäng). */
  spridning: number;
  enighet: EnsembleEnighet;
  /** α per medlem — dokumenterade, alla 1/3 (LÅST i 2026.09; test vaktar). */
  alfa: Record<EnsembleProfilId, number>;
  diagnostik: EnsembleDiagnostik;
  /** AKM1-projektionen (lager1.totalt) — samma tal för alla tre körningar. */
  akm1Totalt: number;
  /** Jämförelsespåret: AKM2-kompositen i visningsläge (profilen akm2-2026). */
  akm2Komposit: number;
  notering?: string;
};

// ── Prediktionsloggen (BESLUT §3 "mätning" + §12) ───────────────────────────

/**
 * Typnamn på det nya prediktorspåret i P5-uppföljningens logg. AKM3.2026.09
 * registreras som NYTT spår BREDAVID AKM1/AKM2 — verkligheten dömer inom
 * 8–12 kvartal (BESLUT §12). Loggen är append-only och hash-kedjad.
 */
export type PREDIKTIONSSPAR = "akm3-ensemble";

/**
 * En rad i prediktionsloggen: ensemble-totalen sida vid sida med
 * AKM2-kompositten och AKM1-projektionen per bolag och mättillfälle, med
 * versionsstämpel — allt som krävs för att §12:s "då vs nu"-dom ska kunna
 * fällas öppet. Fältnamn utan åäö (spår-konventionen i typer.ts).
 */
export type Akm3Prediktionsrad = {
  ticker: string;
  /** Mätningens datum (samma som portföljsnapshotens). */
  datum: string;
  /** "akm3-ensemble" — prediktorspårets typnamn. */
  spar: PREDIKTIONSSPAR;
  /** "AKM3.2026.09". */
  modellVersion: string;
  ensembleTotal: number;
  bandMin: number;
  bandMedian: number;
  bandMax: number;
  spridning: number;
  enighet: EnsembleEnighet;
  /** Jämförelsespår 1: AKM2-kompositen (profil akm2-2026, samma moduler). */
  akm2Komposit: number;
  /** Jämförelsespår 2: AKM1-projektionen (lager1.totalt). */
  akm1Totalt: number;
  /** Kursen vid mättillfället om den finns (verkligheten dömer — inte vi). */
  pris: number | null;
  /** sha-256 över prev-hash + kanonisk rad — tamper-vakten (append-only). */
  hash?: string;
};

/** Hjälptyp: loggfilens form (append-only; senasteHash = sista radens hash). */
export type Akm3Prediktionslogg = {
  modellVersion: string;
  /** Skapad vid första raden (ISO-datum ur första mätningen). */
  skapad?: string;
  rader: Akm3Prediktionsrad[];
  senasteHash?: string;
};

// ── Hjälpexport som ensemble.ts återanvänder (ren typidentifiering) ─────────

/** Smalare profil-id-typ i ensemble-sammanhang (medlemmar är alltid de tre). */
export type EnsembleMedlemsProfil = ViktProfilId & EnsembleProfilId;
