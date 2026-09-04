/**
 * AKM3 — ENSEMBLE (BESLUT §4, r5 Design A) — steg 1 i byggordningen.
 *
 * Formeln (BESLUT §4, normativ — följs exakt):
 *   K_p        = raknaAKM2(k, { moduler, viktprofil: p }).komposit
 *                p ∈ { akm1-klassisk, akm2-2026, superanalys-2026 }  (exakt 3)
 *   AKM3_total = round( Σ_p α_p·K_p ),  α = 1/3 för alla — LÅST i 2026.09
 *   band       = [ min_p K_p, max_p K_p ],  median = mittenvärdet
 *   spridning  = max − min
 *   enighet:   0–3 p "enig" · 4–7 p "delad" · ≥ 8 p "profilspanning"
 *   modellVersion = "AKM3.2026.09"
 *
 * VARFÖR likavikt (forecast combination puzzle): obestridlig grund —
 * likavikt = noll fria parametrar. α är INTE en parameter: funktionen tar
 * EMOTT inga vikter och resultatets `alfa`-fält dokumenterar de låsta 1/3
 * (acceptanskriterium §11.1.vi: "α=1/3 låst — test nekar custom-α").
 *
 * LAGER-5-AGGREGAT: ensemblen beräknar OM ingenting — den läser tre
 * färdiga AKM2-kompositer. AKM3 ersätter ALDRIG AKM2-kompositen eller
 * AKM1-projektionen i existerande ytor — alltid sida vid sida (P4, FORBUD
 * §10.9). Porten slår igenom automatiskt per profil (den följer DATA, inte
 * profilen); osatta andelar ärvs per profil och visas.
 *
 * DETERMINISM (P1): inga klockor, inget slump — datum härleds ur k.hamtat
 * via raknaAKM2; samma indata ⇒ JSON-identisk utdata (test vaktar 2×).
 * Okänd profil-id ⇒ ärligt fel (kärnan kastar — ärvs rakt igenom).
 *
 * BYGGREGLER-TOLKNING (dokumenterad): "import type" gäller akm2/typer.ts +
 * portfolj-forskning/typer.ts; det ENDA runtime-anropet nedåt är raknaAKM2
 * ur akm2/karna.ts — läsning av kärnan, samma precedens som portfolj-
 * forskning/akm2-koppling.ts och akm2-onsdemand.ts. AKM2:s filer rörs ej.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import { raknaAKM2 } from "../akm2/karna";
import type { ModulAktivering } from "../akm2/typer";
import type { BolagsNyckeltal } from "../portfolj-forskning/typer";
import type {
  AKM3Ensemble,
  EnsembleBand,
  EnsembleEnighet,
  EnsembleProfilId,
  EnsembleProfilResultat,
} from "./typer";
import { ENSEMBLE_PROFILER } from "./typer";

/** Semantisk modellversion — låst för hela 2026.09 (BESLUT §0/§4). */
export const AKM3_MODELL_VERSION = "AKM3.2026.09";

/** α per medlem — 1/3 för alla tre, LÅST i 2026.09 (BESLUT §4). */
export const ENSEMBLE_ALFA = 1 / 3;

/** Enighetstrappans gränser i kompositpoäng (BESLUT §4 / r5 §3.2). */
export const ENIGHET_GRANS_ENIG = 3;   // spridning 0–3 ⇒ enig
export const ENIGHET_GRANS_DELAD = 7;  // spridning 4–7 ⇒ delad; ≥ 8 ⇒ profilspanning

/**
 * Spridning → enighetsetikett (ren funktion — trappan testas för sig):
 * 0–3 p "enig" (robust poäng) · 4–7 p "delad" (läs differenserna) ·
 * ≥ 8 p "profilspanning" (poängen styrs av profilval, inte bolaget).
 */
export function enighetFranSpridning(spridning: number): EnsembleEnighet {
  if (!Number.isFinite(spridning)) return "delad"; // ogiltigt tal är inget omdöme — mittfacket
  if (spridning <= ENIGHET_GRANS_ENIG) return "enig";
  if (spridning <= ENIGHET_GRANS_DELAD) return "delad";
  return "profilspanning";
}

/** Median av exakt tre tal — mittenvärdet (deterministisk, inget sorteringsslump). */
function medianTre(a: number, b: number, c: number): number {
  return a + b + c - Math.min(a, b, c) - Math.max(a, b, c);
}

/** Parametrarna till raknaEnsemble — INGEN vikt-Parameter finns (α=1/3 låst). */
export type RaknaEnsembleOpts = {
  /** Aktiva moduler med injicerade poäng (V21+) — samma aktiveringar för
   *  alla tre profiler (uppdraget: "samma modulaktiveringar"). Default: []. */
  moduler?: ModulAktivering[];
};

/**
 * Räkna AKM3-ensemblen för ett BolagsNyckeltal — tre raknaAKM2-körningar
 * (en per kanonisk profil, samma moduler), därefter det låsta aggregatet.
 * Ren funktion: lämnar indata orörd, rör ALDRIG AKM2:s filer eller resultat.
 */
export function raknaEnsemble(k: BolagsNyckeltal, opts?: RaknaEnsembleOpts): AKM3Ensemble {
  const moduler = opts?.moduler ?? [];

  const resultat = ENSEMBLE_PROFILER.map((profil) => ({
    profil,
    // K_p enligt §4 — okänd profil-id kastar ärligt inifrån kärnan
    // (kan inte inträffa: de tre id:n är de kanoniska ur vikter.ts).
    r: raknaAKM2(k, { moduler, viktprofil: profil }),
  }));
  const perProfil: EnsembleProfilResultat[] = resultat.map(({ profil, r }) => ({
    profil,
    komposit: r.komposit,
    band: r.band,
    andelOsatta: r.osakerhet.andelOsatta,
    portAktiv: r.lager2.notering?.includes("HÅRD PORT") ?? false,
  }));

  const K = perProfil.map((p) => p.komposit);
  const min = Math.min(...K);
  const max = Math.max(...K);
  const band: EnsembleBand = { min, median: medianTre(K[0], K[1], K[2]), max };
  const spridning = max - min;

  // AKM3_total = round( Σ α_p·K_p ) med α = 1/3 — K_p är heltal ⇒ summan
  // är exakt (3 · (1/3) · medel), round() är enda avrundningen (§4).
  const total = Math.round(K.reduce((s, kp) => s + ENSEMBLE_ALFA * kp, 0));

  const akm2 = perProfil.find((p) => p.profil === "akm2-2026")!;
  const klassisk = perProfil.find((p) => p.profil === "akm1-klassisk")!;
  const superanalys = perProfil.find((p) => p.profil === "superanalys-2026")!;

  // Diagnostiktexternas tal (§4): tolkningsnycklarna till en eventuell spridning.
  const omfordelningseffekt = akm2.komposit - klassisk.komposit;
  const kategoriMotVariabel = superanalys.komposit - akm2.komposit;

  // AKM1-projektionen är identisk i alla tre körningar (lager1 orörligt) —
  // läs den ur den klassiska körningens resultat (projektionsinvarianten,
  // BESLUT §0). Ingen fjärde kärnkörning behövs: lager1 beror ALDRIG på
  // viktprofilen, men vi läser den från samma objekt som redan räknats.
  const akm1Totalt = resultat.find((x) => x.profil === "akm1-klassisk")!.r.lager1.totalt;

  const notering =
    `Likaviktat medel (α=1/3 låst) av tre AKM2-kompositer — akm1-klassisk ${klassisk.komposit}, ` +
    `akm2-2026 ${akm2.komposit}, superanalys-2026 ${superanalys.komposit}. ` +
    `Diagnostik: omfördelningseffekten (akm2-2026 − akm1-klassisk) = ${omfordelningseffekt > 0 ? "+" : ""}${omfordelningseffekt} p; ` +
    `kategorivikt vs variabelvikt (superanalys-2026 − akm2-2026) = ${kategoriMotVariabel > 0 ? "+" : ""}${kategoriMotVariabel} p. ` +
    `Ensemblen är ett presentationsaggregat ÖVER AKM2 — den ersätter ALDRIG kompositen eller AKM1-projektionen.`;

  return {
    ticker: k.ticker,
    namn: k.namn,
    datum: k.hamtat,
    modellVersion: AKM3_MODELL_VERSION,
    total,
    perProfil,
    band,
    spridning,
    enighet: enighetFranSpridning(spridning),
    alfa: { "akm1-klassisk": ENSEMBLE_ALFA, "akm2-2026": ENSEMBLE_ALFA, "superanalys-2026": ENSEMBLE_ALFA },
    diagnostik: { omfordelningseffekt, kategoriMotVariabel },
    akm1Totalt,
    akm2Komposit: akm2.komposit,
    notering,
  };
}

/**
 * Formguard: ser ut som ett AKM3Ensemble (modellVersion + total + tre profiler)?
 * Används av läsningen av data/cache/akm3-{TICKER}.json (onsdemand-mönstret).
 */
export function arAkm3Ensemble(x: unknown): x is AKM3Ensemble {
  if (!x || typeof x !== "object") return false;
  const e = x as Record<string, unknown>;
  return (
    typeof e.ticker === "string" &&
    typeof e.modellVersion === "string" &&
    e.modellVersion === AKM3_MODELL_VERSION &&
    typeof e.total === "number" &&
    Number.isFinite(e.total) &&
    Array.isArray(e.perProfil) &&
    e.perProfil.length === ENSEMBLE_PROFILER.length &&
    e.perProfil.every(
      (p) => p && typeof p === "object" && typeof (p as EnsembleProfilResultat).profil === "string" && typeof (p as EnsembleProfilResultat).komposit === "number",
    )
  );
}
