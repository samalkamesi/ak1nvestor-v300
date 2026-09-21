#!/usr/bin/env node
/**
 * s5-u2 omgång 25 — STRUKTURANPASSNING till familjekonventionen (före KVD):
 * kapitel 1-5 slutar med INSIGHT (bk-07/roic-04/se-22/bf-16 eniga); kapitel 6
 * får ha utmaning sist (bf-16-presedens Text/X/Utmaning). Tre block konverteras
 * definition → insight, innehåll och aritmetik bevarade:
 *   bk-08  kap 5  FULLBORDANDEGRAD → FULLBORDANDEGRADENS VAKT
 *   roic-05 kap 3  EVA-SPRIDNINGEN  → SPRIDNINGENS TVÅ TECKEN
 *   roic-05 kap 5  VÄRDEBRYGGAN     → BANKEN ÅTERVINNS, ÖVERSKOTTET RÄKNAS
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1/data/kurser-tillagg/";

// [fil, kapitelindex, blockindex, exakt-igenkänning, ny typ, ny text]
const INGREPP = [
  [
    "bk-08-intaktredovisningen.json",
    4, 2,
    "FULLBORDANDEGRAD PER KOSTNADSANDEL",
    "insight",
    "FULLBORDANDEGRADENS VAKT: graden är utförda kostnader delat med budgeterade totalkostnader — här 400 av 1 000 lika med 40 procent — men enbart när kostnaderna avspeglar prestationens framsteg. Installationer, spill och stillastående perioder ingår varken i täljaren eller nämnaren: graden ska mäta levererat arbete, inte förbrukad peng. Ett bolag vars fullbordandegrad springer på utgifter utan motprestation redovisar mer intäkt i dag — och avslöjar samtidigt var gränsen mellan tillväxt och slöseri går.",
  ],
  [
    "roic-05-den-ekonomiska-vinsten.json",
    2, 2,
    "EVA-SPRIDNINGEN: ROIC minus WACC",
    "insight",
    "SPRIDNINGENS TVÅ TECKEN: ROIC minus WACC, multiplicerad med det investerade kapitalet, är den ekonomiska vinsten i kronor — samma 45 som subtraktionen gav. Positiv spridning: varje kapitalkrona föder värde över sin hyra. Negativ spridning: varje kapitalkrona äter av värdet, och (se kapitel 4) varje tillväxtprocent förvärrar det. Noll: rörelsen är en bank med extra steg — kapitalet bär exakt sin marknadsränta.",
  ],
  [
    "roic-05-den-ekonomiska-vinsten.json",
    4, 2,
    "VÄRDEBRYGGAN: företagsvärde",
    "insight",
    "BANKEN ÅTERVINNS, ÖVERSKOTTET RÄKNAS: företagsvärde lika med investerat kapital plus ekonomisk vinst gånger (1 plus g) delat med (WACC minus g), där g är den långsiktiga tillväxten i ekonomisk vinst. Kapitaldelen är återvinningsbar — den sitter kvar i maskiner och lager och kan i princip säljas tillbaka — strömdelen är förtjänad. Gäller evighetsantagandet bara en period används formeln med utgångsvärde och avslutande värde — bryggan bygger då på terminalvärde-logiken som vr-07 äger. Läsningen: ett förvärv skapar värde för köparen först när det tillför positiv spridning — annars köper köparen tillbaka sina egna pengar.",
  ],
];

let antal = 0;
for (const [fil, ki, bi, igenkanning, nyTyp, nyText] of INGREPP) {
  const j = JSON.parse(readFileSync(ROT + fil, "utf8"));
  const b = j.chapters[ki].blocks[bi];
  if (!b.content.startsWith(igenkanning)) throw new Error("STRUKTURFEL: " + fil + " kap " + (ki + 1) + " block " + (bi + 1) + " börjar inte med «" + igenkanning + "»");
  if (b.type === "insight") { console.log("redan insight: " + fil + " kap " + (ki + 1)); continue; }
  b.type = nyTyp;
  b.content = nyText;
  writeFileSync(ROT + fil, JSON.stringify(j, null, 2) + "\n", "utf8");
  antal++;
  console.log("konverterad: " + fil + " kap " + (ki + 1) + " block " + (bi + 1) + " → " + nyTyp + " (" + nyText.slice(0, 40) + "…)");
}
console.log("STRUKTUR: " + antal + " block konverterade — kap 1-5 slutar nu med insight i båda kurserna");
