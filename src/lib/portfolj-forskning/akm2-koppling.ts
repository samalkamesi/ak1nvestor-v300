/**
 * AKM2-KOPPLING — portföljforskningens bro till den färdiga AKM2-kärnan.
 *
 * AKM2-kärnan (src/lib/akm2/ — karna.ts, moduler/, vikter.ts, dynamik.ts)
 * är FÄRDIG och FÅR ALDRIG röras av portföljsystemet; denna fil är den enda
 * kopplingspunkten och gör exakt två saker:
 *
 *  1. byggAutomatiskaModuler(k) — modulregistret (src/lib/akm2/moduler) slås
 *     upp på bolagets bransch och varje matchande branschmodul blir en
 *     ModulAktivering med poäng. DELEGERAR till byggModulAktiveringar i
 *     src/lib/akm2-visningsdata.ts (våg 57 D3:s gemensamma källa — samma
 *     funktion driver kalkylatorns AKM2-läge och on-demand-beräkningarna;
 *     EN implementering, aldrig två). ÄRLIGHET: modulvariabler som svarar
 *     osatt injiceras aldrig — kärnans omfördelningsprofil (akm2-2026)
 *     omfördelar då deras vikt istället för att straffa saknad data
 *     (BESLUT §2). V29 (insider) är villkorad och ingår aldrig automatiskt.
 *
 *  2. berikaRadMedAkm2(rad, k) — en korstabellrad berikas med AKM2:
 *       akm2         = raknaAKM2(k, { moduler: auto, viktprofil: "akm2-2026" }).komposit
 *       akm2Skillnad = akm2 − rad.akm1Totalt   (P6:s viktade AKM1-publicerade total)
 *       akm2Moduler  = namnen på modulerna som aktiverades för branschen
 *     Saknas nyckeltal lämnas fälten null/[] — motorn gissar aldrig.
 *
 * DETERMINISM: arv från kärnan (datum ur k.hamtat, inga klockor, inget slump)
 * + fast modulordning ur registret — samma indata ger JSON-identisk berikning.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import { raknaAKM2 } from "../akm2/karna";
import type { AKM2Resultat, ModulAktivering } from "../akm2/typer";
import { aktivaModulerForBransch } from "../akm2/moduler";
import { byggModulAktiveringar } from "../akm2-visningsdata";
import type { BolagsNyckeltal, KorstabbellRad } from "./typer";

/** Viktprofilen portföljforskningens AKM2-läge använder (BESLUT §2). */
export const AKM2_VIKTPROFIL = "akm2-2026" as const;

/**
 * Automatiska modulaktiveringar för ett bolag — branschmatchning enligt
 * modulregistret (src/lib/akm2/moduler/index.ts), poäng injicerade via den
 * gemensamma källan i akm2-visningsdata.ts (våg 57 D3). Osatta modulvariabler
 * injiceras aldrig — kärnans viktlösning omfördelar deras vikt (aldrig
 * straffa saknad data, BESLUT §2).
 */
export function byggAutomatiskaModuler(k: BolagsNyckeltal): ModulAktivering[] {
  return byggModulAktiveringar(k);
}

/**
 * Full AKM2-beräkning för ett bolag i portföljforskningens läge:
 * automatiska moduler ur registret + viktprofil "akm2-2026" + NEUTRALT
 * dynamiklager (lager 3 ej injicerat — ren fundamental syntes; kärnan
 * degraderar neutralt, aldrig mot gissning).
 */
export function raknaAkm2ForNyckeltal(k: BolagsNyckeltal): AKM2Resultat {
  return raknaAKM2(k, {
    moduler: byggAutomatiskaModuler(k),
    viktprofil: AKM2_VIKTPROFIL,
  });
}

/** 1 decimal, deterministiskt (Math.round — aldrig toFixed/locale). */
function r1(x: number): number {
  return Math.round(x * 10) / 10;
}

/**
 * Berika EN korstabellrad med AKM2 (våg 57 D2):
 *   akm2         — kompositen 0–100 (raknaAKM2 ... viktprofil "akm2-2026")
 *   akm2Skillnad — akm2 − akm1Totalt (1 decimal; P6:s publicerade AKM1-total)
 *   akm2Moduler  — namnen på branschmodulerna som aktiverades
 * Saknat nyckeltal ⇒ akm2/akm2Skillnad null och tom modullista (ärlighet:
 * berikningen hittar aldrig på siffror). Befintliga fält rörs aldrig.
 */
export function berikaRadMedAkm2(
  rad: KorstabbellRad,
  k: BolagsNyckeltal | undefined | null,
): KorstabbellRad {
  if (!k || k.ticker !== rad.ticker) {
    return { ...rad, akm2: null, akm2Skillnad: null, akm2Moduler: [] };
  }
  const resultat = raknaAkm2ForNyckeltal(k);
  const akm2 = Number.isFinite(resultat.komposit) ? r1(resultat.komposit) : null;
  const bas =
    Number.isFinite(rad.akm1Totalt) && rad.akm1Totalt !== null ? rad.akm1Totalt : null;
  const skillnad = akm2 !== null && bas !== null ? r1(akm2 - bas) : null;
  const moduler = aktivaModulerForBransch(k.bransch).map((m) => m.namn);
  return { ...rad, akm2, akm2Skillnad: skillnad, akm2Moduler: moduler };
}

/** Serialiserbar AKM2-profil för detaljsidor/generatorer (ur ett resultat). */
export type Akm2Profil = {
  viktprofil: string;
  modellVersion: string;
  totalt: number;
  band: AKM2Resultat["band"];
  portAktiv: boolean;
  moduler: Array<{ modulId: string; orsak: string; variabler: string[]; poang: Record<string, number> }>;
  modulVariablerSatta: string[];
  modulVariablerOsatta: string[];
  dynamikPaverkan: string;
  omfordelningText: string | null;
  osakerhetNote: string;
};

/**
 * Kort, serialiserbar AKM2-profil ur ett AKM2Resultat — det block
 * detaljsidorna (/forskningsbiblioteket/[ticker]) redovisar: total, aktiva
 * moduler med variabler/poäng samt dynamikpåverkan (ärlig kort-text —
 * lager 3 är neutralt i detta läge, FVag-dynamiken redovisas separat i
 * korstabellen och påstås ALDRIG påverka kompositen när den inte fick).
 */
export function akm2ProfilUr(r: AKM2Resultat): Akm2Profil {
  const neutralDynamik = r.lager3.konfluens.text.startsWith("Dynamiklagret ej anropat");
  const satta = Object.keys(r.lager2.poang).sort();
  const osatta = (r.lager4.omfordelning?.exkluderade ?? []).filter((v) =>
    /^V(2[1-9])$/.test(v),
  );
  return {
    viktprofil: r.lager4.viktprofil,
    modellVersion: r.modellVersion,
    totalt: r.komposit,
    band: r.band,
    portAktiv: (r.lager2.notering ?? "").includes("HÅRD PORT"),
    moduler: r.lager2.aktiveradeModuler.map((m) => ({
      modulId: m.modulId,
      orsak: m.orsak ?? "",
      variabler: Object.keys(m.poang ?? {}).sort(),
      poang: m.poang ?? {},
    })),
    modulVariablerSatta: satta,
    modulVariablerOsatta: osatta,
    dynamikPaverkan: neutralDynamik
      ? "Dynamiklagret (lager 3) var inte aktiverat i denna beräkning — kompositen är en ren fundamental syntes utan vågmodulering (neutral degradering, aldrig gissning). Den fundamentala dynamiken redovisas separat i korstabellens FVag-kolumn och påverkar inte kompositen."
      : r.lager3.konfluens.text,
    omfordelningText: r.lager4.omfordelning?.text ?? null,
    osakerhetNote: r.osakerhet.note,
  };
}
