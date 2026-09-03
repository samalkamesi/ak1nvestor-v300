/**
 * AKM2 — LAGER 4: VIKTPROFILER (namngiven viktsamling per analys).
 *
 * Källor (reproducerbarhet):
 *  - data/forskning/AKM2-BESLUT.md §2–§3 (NORMATIVT — moderagentens syntes)
 *  - data/forskning/r2-vikter-2026-09-03.md §4–§6 (faktorevidens + poängkurvor)
 *  - data/forskning/r4-akm2-arkitektur-2026-09-03.md §3 lager 4
 *
 * ─── VIKTIG DOKUMENTATION OM "akm2-2026" OCH 58/97-SPÄNNINGEN ───────────────
 * BESLUT §2 deklarerar strukturerna "V01–V20 (58 %) + modulblocket V21–V28
 * (42 %)" men tabellens V01–V20-siffror (8+4+3+4+4+11+10+6+6+4+4+4+4+3+3+2+2+2+
 * 9+4) summerar 97, inte 58 — en aritmetisk spänning i beslutsdokumentet.
 * Upplösning (dokumenterad, deterministisk, versionerad):
 *   1. BESLUT §2:s V01–V20-tal bevaras EXAKT i sin inbördes proportion — de är
 *      de normerade talen; den relativa fördelningen är vad forskningen sagt.
 *   2. Blockspliten 58/42 (§2:s deklarerade arkitektur) hålls: V01–V20 skalas
 *      med 58/97, modulblocket V21–V28 behåller §1-talen (8+8+5+4+5+3+3+6 = 42).
 *   3. Profilens råvikter summerar därmed EXAKT 100 (test vaktar: 100/100/100).
 * Exempel: V01 = 8 × (58/97) = 4,78 rå-%. Med alla moduler inaktiva omfördelas
 * modulblockets 42 % proportionellt till satta kärnvariabler (BESLUT §2) —
 * V01:s effektiva andel blir då 8/97 av det aktiva spannet. Se karna.ts
 * (losaVikter) för normalisering/omfördelning.
 *
 * ─── "akm1-klassisk" OCH 112 %-PROBLEMET ────────────────────────────────────
 * R2 §2 fann att dagens procentvikttabell i kalkylatorn (5×8 % + 12×6 % +
 * 3× "KRITISK") summerar 112 %. Den klassiska profilen använder därför
 * POÄNGSKALAN som vikt: 5 poäng × 20 variabler = 100 rå-%, uniform — vilket
 * exakt reproducerar kalkylatorns publika kontrakt (rak summa av 20 variabler
 * à 0–5 p, max 100). "KRITISK" är en pedagogisk etikett, inte en vikt; dess
 * testbara efterföljare är portreglerna (t.ex. hård port BESLUT §5). Profilen
 * är LÅST (las: true) och får ALDRIG redigeras — den är projektionsinvariantens
 * garant.
 *
 * ─── "superanalys-2026" ────────────────────────────────────────────────────
 * BESLUT §3:s kategorivikter: Lönsamhet 24 · Värdering 20 · Risk/Stabilitet 20
 * · Tillväxt 16 · Moat 10 · Katalysator 6 · Kapitalstruktur 4 (= 100). OBS:
 * dessa är R2 §4.1:s evidensbaserade kategorivikter — inte dagens superanalys.ts
 * (15/20/20/15/15/5/10), som förblir orörd i sin fil; profilen här är den
 * 2026-reviderade forskningsfördelningen enligt BESLUT. BESLUT slår ihop
 * Risk/Stabilitet till 20 — här löst ut som Risk 10 + Stabilitet 10 (likadelat,
 * dokumenterat; justera här om forskningen anger annan split). Inom kategori:
 * likavikt (R2 §7.5:s hybridrekommendation).
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import type { ViktProfil, ViktProfilId } from "./typer";

// ── akm2-2026: BESLUT §2 exakt, V01–V20 proportionellt skalade till 58 ──────

/** Skalfaktor: BESLUT §2:s V01–V20-tabell (summa 97) → deklarerat block 58 %. */
const SKALA_KARNA_58 = 58 / 97;

/** BESLUT §2:s V01–V20-tabell, råa forskningstal (summa 97) — dokumentation. */
export const AKM2_2026_GRUNDTABELL_KARNA: Record<string, number> = {
  V01: 8, V02: 4, V03: 3, V04: 4, V05: 4, V06: 11, V07: 10, V08: 6, V09: 6, V10: 4,
  V11: 4, V12: 4, V13: 4, V14: 3, V15: 3, V16: 2, V17: 2, V18: 2, V19: 9, V20: 4,
};

/** BESLUT §1:s modulvikter V21–V28 (8+8+5+4+5+3+3+6 = 42) — V29 är villkorad/inaktiv. */
export const AKM2_2026_MODULVIKTER: Record<string, number> = {
  V21: 8, V22: 8, V23: 5, V24: 4, V25: 5, V26: 3, V27: 3, V28: 6,
};

/** Skala §2-tabellen till 58-blocket (inbördes proportioner exakt bevarade). */
function skalaKarna(tabell: Record<string, number>): Record<string, number> {
  const ut: Record<string, number> = {};
  for (const [v, w] of Object.entries(tabell)) ut[v] = w * SKALA_KARNA_58;
  return ut;
}

// ── superanalys-2026: kategorivikter BESLUT §3 (Risk/Stabilitet 20 = 10+10) ──

/** Kategorivikter i procentenheter — summa exakt 100. */
export const SUPERANALYS_2026_KATEGORIVIKTER: Record<string, number> = {
  "Lönsamhet": 24,
  "Värdering": 20,
  "Risk": 10,          // BESLUT §3 "Risk/Stabilitet 20" — likadelat 10 + 10
  "Stabilitet": 10,
  "Tillväxt": 16,
  "Moat": 10,
  "Katalysator": 6,
  "Kapitalstruktur": 4,
};

// ── Registret ────────────────────────────────────────────────────────────────

/**
 * AKM2:s viktprofiler. Råvikter i procentenheter; normalisering till summa 1
 * över AKTIVA variabler sker i karna.ts (losaVikter) vid varje analys.
 */
export const VIKTPROFILER: ViktProfil[] = [
  {
    id: "akm1-klassisk",
    namn: "AKM1-klassisk (låst)",
    beskrivning:
      "Uniform vikt över V01–V20: 5 poäng × 20 variabler = 100 rå-%, normaliserat " +
      "till 1/20 per variabel. Reproducerar EXAKT kalkylatorns publika kontrakt — " +
      "kompositen blir den klassiska AKM1-summan (projektionsinvarianten). Osatta " +
      "variabler bidrar 0 poäng men behåller sin vikt: ingen omfördelning i detta " +
      "klassiska läge. R2 §2 fann att den gamla procenttabellen summerade 112 % — " +
      "därför vilar den klassiska profilen på poängskalan, inte procenttabellen.",
    forskningsKalla:
      "data/forskning/AKM2-BESLUT.md §0+§2 · data/forskning/r4-akm2-arkitektur-2026-09-03.md §3 lager 4",
    viktPerVariabel: {
      V01: 5, V02: 5, V03: 5, V04: 5, V05: 5, V06: 5, V07: 5, V08: 5, V09: 5, V10: 5,
      V11: 5, V12: 5, V13: 5, V14: 5, V15: 5, V16: 5, V17: 5, V18: 5, V19: 5, V20: 5,
    },
    omfordelaVidOsatt: false,
    las: true,
  },
  {
    id: "akm2-2026",
    namn: "AKM2-2026 (BESLUT §2)",
    beskrivning:
      "AKM2:s standardprofil: V01–V20 enligt BESLUT §2 (58 % block, inbördes " +
      "proportioner exakta — V06 11 → 6,58 rå-%, V07 10 → 5,98, V19 9 → 5,38 …) + " +
      "modulblocket V21–V28 enligt §1 (42 %). Osatta variabler (null-data) får 0 " +
      "poäng men deras vikt OMFÖRDELAS proportionellt till aktiva variabler — " +
      "saknad data straffas aldrig (BESLUT §2). Moduler utan data omfördelar sitt " +
      "block på samma sätt; omfördelningen dokumenteras i resultatet (lager4.omfordelning). " +
      "V29 (insider-ägande) är villkorad och väger 0 tills en manuell FI-modul aktiveras.",
    forskningsKalla:
      "data/forskning/AKM2-BESLUT.md §1+§2 · data/forskning/r2-vikter-2026-09-03.md §4.2 " +
      "(Loughran & Wellman 2011; Novy-Marx 2013; Pontiff & Woodgate 2008 m.fl.)",
    viktPerVariabel: {
      ...skalaKarna(AKM2_2026_GRUNDTABELL_KARNA),
      ...AKM2_2026_MODULVIKTER,
    },
    omfordelaVidOsatt: true,
  },
  {
    id: "superanalys-2026",
    namn: "Superanalys-2026 (kategorivikter BESLUT §3)",
    beskrivning:
      "Kategori-baserad profil: Lönsamhet 24 · Värdering 20 · Risk/Stabilitet 20 " +
      "(här 10 + 10, likadelat dokumenterat) · Tillväxt 16 · Moat 10 · Katalysator 6 · " +
      "Kapitalstruktur 4. Inom kategori likavikt (R2 §7.5). Nya modulvariabler (V21+) " +
      "med känd kategori inkluderas automatiskt och delar på kategorins vikt. " +
      "OBS: detta är BESLUT §3:s/R2 §4.1:s 2026-fördelning — inte dagens superanalys.ts " +
      "(15/20/20/15/15/5/10), som förblir orörd; historiken deklareras öppet (R4 §7.5).",
    forskningsKalla:
      "data/forskning/AKM2-BESLUT.md §3 · data/forskning/r2-vikter-2026-09-03.md §4.1 " +
      "(Novy-Marx 2013; Fama–French 2015; Asness m.fl. 2019; Baker–Bradley–Wurgler 2012)",
    viktPerVariabel: {
      // Kanonisk utlösning för V01–V20 (alla aktiva) — dokumentationsspegel av
      // kategorivikterna; vid analys löser kärnan istället kategorivikterna ut.
      V01: 16 / 3, V02: 16 / 3, V03: 16 / 3,          // Tillväxt 16
      V04: 20 / 3, V05: 20 / 3, V06: 20 / 3,          // Värdering 20
      V07: 8, V08: 8, V09: 8,                          // Lönsamhet 24
      V10: 10 / 3, V11: 10 / 3, V12: 10 / 3,          // Stabilitet 10
      V13: 10 / 3, V14: 10 / 3, V15: 10 / 3,          // Moat 10
      V16: 2, V17: 2, V18: 2,                          // Katalysator 6
      V19: 10,                                          // Risk 10
      V20: 4,                                           // Kapitalstruktur 4
    },
    kategorivikter: SUPERANALYS_2026_KATEGORIVIKTER,
    omfordelaVidOsatt: true,
  },
];

/** Hämta profil ur registret (okänd kod → undefined; kärnan felar ärligt). */
export function hamtaViktProfil(id: ViktProfilId): ViktProfil | undefined {
  return VIKTPROFILER.find((p) => p.id === id);
}
