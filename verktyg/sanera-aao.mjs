#!/usr/bin/env node
/**
 * Sanera manglade å/ä/ö i public/deep-courses.json.
 * Python-heredoc-generatorer skrev vissa fält utan å/ä/ö (å→a, ä→a, ö→o).
 *
 * Strategin: ENDAST otvetydiga token-exakta ersättningar (ordgränser,
 * skiftlägesbevarande par). Inga delordsmatchningar — "start", "marknad",
 * "kopia" ska aldrig röras.
 *
 *   node verktyg/sanera-aao.mjs          → applicera
 *   node verktyg/sanera-aao.mjs --torrt  → bara räkna
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// [manglad, korrekt] — token-exakta par, skiftlägeskänsliga varianter
const PAR = [
  ["varde", "värde"], ["Varde", "Värde"], ["VARDE", "VÄRDE"],
  ["varden", "värden"], ["Varden", "Värden"],
  ["atter", "åter"], ["Atter", "Åter"],
  ["atervaxt", "återväxt"],
  ["ars", "års"], ["Ars", "Års"], ["ARS", "ÅRS"],
  ["arsredovisning", "årsredovisning"], ["Arsredovisning", "Årsredovisning"],
  ["SALJ", "SÄLJ"], ["salj", "sälj"], ["Salj", "Sälj"],
  ["salja", "sälja"], ["saljd", "såld"], ["saljer", "säljer"],
  ["KOP", "KÖP"], ["kopt", "köpt"], ["Kopt", "Köpt"],
  ["kop inte", "köp inte"],
  ["ranta", "ränta"], ["Ranta", "Ränta"], ["rantor", "räntor"], ["Rantor", "Räntor"],
  ["sakerhet", "säkerhet"], ["Sakerhet", "Säkerhet"],
  ["manad", "månad"], ["Manad", "Månad"], ["manader", "månader"], ["Manader", "Månader"],
  ["manads", "månads"],
  ["forvarv", "förvärv"], ["Forvarv", "Förvärv"], ["forvarvade", "förvärvade"],
  ["kassaflode", "kassaflöde"], ["Kassaflode", "Kassaflöde"],
  ["balansrakning", "balansräkning"], ["Balansrakning", "Balansräkning"],
  ["raddsla", "rädsla"], ["Raddsla", "Rädsla"],
  ["kansla", "känsla"], ["Kansla", "Känsla"], ["kanslor", "känslor"],
  ["vaxt", "växt"], ["Vaxt", "Växt"],
  ["tillvaxt", "tillväxt"], ["Tillvaxt", "Tillväxt"],
  ["tacker", "täcker"], ["Tacker", "Täcker"], ["tackning", "täckning"],
  ["Behall", "Behåll"], ["beholder", "behåller"],
  ["foretag", "företag"], ["Foretag", "Företag"], ["foretags", "företags"],
  ["berakna", "beräkna"], ["Berakna", "Beräkna"], ["berakning", "beräkning"], ["beraknat", "beräknat"],
  ["rakna", "räkna"], ["Rakna", "Räkna"], ["rakningen", "räkningen"],
  ["maste", "måste"], ["Maste", "Måste"],
  ["nara", "nära"], ["Nara", "Nära"],
  ["lang", "lång"], ["Lang", "Lång"], ["langa", "långa"], ["langsiktigt", "långsiktigt"],
  ["halv", "hälv".length === 4 ? "halv" : "halv"], // halv är korrekt som det är — hoppas över nedan
  ["tankar", "tankar"], // korrekt — filtreras bort automatiskt (likar)
  ["fran", "från"], ["Fran", "Från"], ["FRAN", "FRÅN"],
  ["forlor", "förlor"], ["forlust", "förlust"], ["Forlust", "Förlust"],
  ["fragor", "frågor"], ["Fraga", "Fråga"], ["fraga", "fråga"],
  ["amne", "ämne"], ["Amne", "Ämne"],
  ["grans", "gräns"], ["Grans", "Gräns"], ["granser", "gränser"],
  ["bryt ok", "bryt ok"],
  ["mostsand", "motstånd"], ["motstand", "motstånd"], ["Motstand", "Motstånd"],
  ["stod", "stöd"], ["Stod", "Stöd"],
  ["vag", "väg"], ["Vag", "Väg"], ["vagar", "vägar"], ["vagor", "vågor"],
  ["sidledes", "sidledes"],
  ["flode", "flöde"], ["Flode", "Flöde"], ["floden", "flödet"],
  ["penningflode", "penningflöde"],
  ["intakt", "intäkt"], ["Intakt", "Intäkt"], ["intakter", "intäkter"], ["Intakter", "Intäkter"],
  ["sma", "små"], ["Sma", "Små"], ["smaforetag", "småföretag"],
  ["bors", "börs"], ["Bors", "Börs"], ["borsen", "börsen"], ["Borsen", "Börsen"], ["obors", "obörs"],
  ["okand", "okänd"], ["riskokand", "riskokänd"],
  ["saker", "säkert"], // OBS: "säkra" → "sakra" hanteras ej — endast token "saker"
  ["dlig", "dlig"], // hanteras via "dalig" nedan
  ["dalig", "dålig"], ["Dalig", "Dålig"], ["daligt", "dåligt"], ["Daligt", "Dåligt"],
  ["sappa", "säppa".length ? "sjönk" : "sjönk"], // "sappa"→"sjönk" är osäkert — hoppa över
  ["vagledning", "vägledning"],
  ["tavariteur ok", "ok"],
  ["jamfor", "jämför"], ["Jamfor", "Jämför"], ["jamforelse", "jämförelse"],
  ["andel ok", "andel ok"],
  ["snitt ok", "snitt ok"],
  ["stal ok", "stål ok"],
  ["spann ok", "spänn ok"],
  ["kil ok", "kil ok"],
];

// Exakta strängbytare (sammansättningar och fraser som ordgränser missar)
const EXAKTA = [
  ["Atterbalansering", "Återbalansering"],
  ["atterbalansering", "återbalansering"],
  ["atterbalansera", "återbalansera"],
  ["atterbalanseras", "återbalanseras"],
  ["Fler ar", "Fler år"],
  ["Dagar-manader", "Dagar-månader"],
  ["saljningstillvaxt", "säljningstillväxt"],
  ["forsaljningstillvaxt", "försäljningstillväxt"],
  ["Forsaljning", "Försäljning"],
  ["forsaljning", "försäljning"],
];


const fil = join(process.cwd(), "public", "deep-courses.json");
let text = readFileSync(fil, "utf8");
const torrt = process.argv.includes("--torrt");

let totalt = 0;
const rapport = [];

// Ta bort tvetydiga par: ord som ÄR korrekt svenska i de flesta kontexter
const TABU = ["saker", "stod", "intakt", "vag", "stal", "spann", "kil"];
const par = PAR.filter(([a, b]) => a && b && a !== b && !a.includes(" ok") && !b.includes(" ok") && !b.includes(".length") && !TABU.includes(a));

for (const [manglad, korrekt] of par) {
  // Ordgränser på båda sidor; JSON-innehåll har \" som gräns också — \b räcker
  const re = new RegExp(`(?<![\\p{L}])${manglad}(?![\\p{L}])`, "gu");
  const n = (text.match(re) || []).length;
  if (n > 0) {
    rapport.push(`${manglad} → ${korrekt}: ${n}`);
    totalt += n;
    if (!torrt) text = text.replace(re, korrekt);
  }
}

for (const [manglad, korrekt] of EXAKTA) {
  const n = text.split(manglad).length - 1;
  if (n > 0) {
    rapport.push(`"${manglad}" → "${korrekt}": ${n}`);
    totalt += n;
    if (!torrt) text = text.split(manglad).join(korrekt);
  }
}

console.log(rapport.join("\n") || "Inga manglade ord hittade.");
console.log(`\nTotalt: ${totalt} ersättningar${torrt ? " (torrkörning)" : " — APPLICERADE"}`);

if (!torrt && totalt > 0) {
  // Validera att resultatet fortfarande är giltig JSON innan skrivning
  try {
    JSON.parse(text);
  } catch (e) {
    console.error("✗ RESULTATET ÄR INTE GILTIG JSON — skriver INTE:", e.message);
    process.exit(1);
  }
  writeFileSync(fil, text, "utf8");
  console.log("✓ public/deep-courses.json sanerad och validerad");
}
