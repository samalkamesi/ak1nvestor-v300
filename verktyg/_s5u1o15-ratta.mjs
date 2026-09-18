#!/usr/bin/env node
/**
 * s5-u1 omgång 15 (manifest auto-s5-1789722300593) — språkgrindsrättningar
 * av bk-05 FÖRE register-insert. Varje ersättning kräver EXAKT förväntat
 * antal träffar — annars abort utan skrivning. (o14-mönstret.)
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/kurser-tillagg/bk-05-redovisningspolitiken.json";
let s = readFileSync(FIL, "utf8");

const RATTNINGAR = [
  // stavfel och påhittade ord
  ["lärde läsastatements", "lärde läsa statements", 1],
  ["resultatånsträckning till år tio.Politikens", "avskrivningsbörda i resultatet till år tio. Politikens", 1],
  ["posts födelse", "postens födelse", 1],
  ["kostnadsförd slagér resultatet med 30", "kostnadsförd belastar resultatet med 30", 1],
  ["positivekontraktet", "tidpunktens frihet", 1],
  ["EBITDA-läsanvändaren", "EBITDA-läsaren", 1],
  ["Resultatpåslag (kostnad)", "Kostnad i resultaträkningen", 1],
  ["Bolag B jämkt på A:s avskrivningstid", "Bolag B jämkad på A:s avskrivningstid", 1],
  // engelskaläcka
  ["den look-en", "det skenet", 1],
  // IGENOM → in i (learn)
  ["läcker den in IGENOM EBITDA", "läcker den in i EBITDA", 1],
  // avskrivningstäcket → avskrivningsrummet (summary + learn)
  ["avskrivningstäcket", "avskrivningsrummet", 2],
  // versal å saknades
  ["NAR blir", "NÄR blir", 1],
  // böka-former → bokföra-former
  ["intäkten bökas i takt", "intäkten bokförs i takt", 1],
  ["böka 100 per år", "bokföra 100 per år", 1],
  ["provisionslicenser som bökar månadsvis", "provisionslicenser som bokför månadsvis", 1],
  ["ska nedskrivningen bökas", "ska nedskrivningen bokföras", 1],
  ["intäkt kunde bökas vid kontrakt", "intäkt kunde bokföras vid kontrakt", 1],
  // klumpiga formuleringar
  ["tio år i stället för fem flyttar tio Mkr resultat från framtiden till VARJE år fram till slaget — och eftersom avskrivningen aldrig är en kassaflödespost", "tio år i stället för fem sänker årets kostnad med tio Mkr och sträcker den över dubbla tiden — resultat flyttas mellan år, aldrig skapas, och eftersom avskrivningen aldrig är en kassaflödespost", 1],
  ["Samma kontrakt, samma kontanta fakturering i grunden, två helt olika resultaträkningar", "Samma kontrakt, samma underliggande affär — två helt olika resultaträkningar", 1],
  ["deras soliditet (st-01) är INTE jämförbara förrän", "är deras soliditet (st-01) inte jämförbar förrän", 1],
  ["gjorde valsprågen koncerngemensamma", "gjorde valen koncerngemensamma", 1],
  ["valspråken är offentliga", "valen är offentliga", 1],
  ["redovisningen 0 träffar på politikbegreppet", "sonden gav 0 träffar på politikbegreppet", 1],
];

const fel = [];
for (const [fran, till, vantan] of RATTNINGAR) {
  const n = s.split(fran).length - 1;
  if (n !== vantan) { fel.push(`${fran}: ${n} träffar (väntade ${vantan})`); continue; }
  s = s.split(fran).join(till);
}
if (fel.length) { console.error("ABORT — träffavvikelse:\n" + fel.join("\n")); process.exit(1); }

// postgrind: CJK, kyrilliska, mjuka bindestreck, typografiska citattecken, tabbar
const cjk = [...s].filter((c) => { const o = c.codePointAt(0); return (o >= 0x4e00 && o <= 0x9fff) || (o >= 0x3040 && o <= 0x30ff) || (o >= 0xac00 && o <= 0xd7af); });
const kyr = [...s].filter((c) => { const o = c.codePointAt(0); return o >= 0x400 && o <= 0x4ff; });
const mjuka = [...s].filter((c) => c === "\u00ad");
const typCitat = [...s].filter((c) => ["\u2018", "\u2019", "\u201c", "\u201d"].includes(c));
const tabbar = [...s].filter((c) => c === "\t");
if (cjk.length || kyr.length || mjuka.length || typCitat.length || tabbar.length) {
  console.error(`ABORT — läckage kvar: CJK ${cjk.length}, kyr ${kyr.length}, mjuka ${mjuka.length}, typCitat ${typCitat.length}, tab ${tabbar.length}`); process.exit(1);
}
JSON.parse(s);
writeFileSync(FIL, s);
console.log("RÄTTAD: " + RATTNINGAR.length + " ersättningar exakt, JSON giltig, 0 CJK/kyrilliska/mjuka bindestreck/typografiska citattecken/tabbar.");
