// Kärnordsdisjunktion sond (s6-u3, manifest auto-s6-1790029519192, fönster 34):
// 1) extraherar ALLA kärnord+starkord ur samtliga frågemoduler,
// 2) kollar kandidatlistorna för tre nya monsters (produktionsgapet /
//    ränteswapen / bindningsrisken) mot dem = 0 kollisioner krävs,
// 3) skuggningsprober: de kanoniska frågorna genom hela LEVANDE kedjan
//    (MOTORDEFS-ordning) = NULL för alla motorer före det nya lagret.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROT = "/home/ak1a/AK1";
const LIB = join(ROT, "src/lib");

// Motorordning ur kedjetestets MOTORDEFS (sanning enligt fall G)
const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const MOTORDEFS = [...kedjekalla.matchAll(/\{ namn: "([^"]+)", fil: "([^"]+)", fn: "([^"]+)"/g)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));

// Extrahera kärnord + starkord per modul ur källkoden
function extrahera(fil) {
  const t = readFileSync(join(LIB, fil), "utf8");
  const ord = { karn: [], stark: [] };
  const karnBlock = t.match(/karnord:\s*\[([^\]]*)\]/);
  if (karnBlock) ord.karn = [...karnBlock[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  const starkBlock = t.match(/starkord:\s*\[([^\]]*)\]/);
  if (starkBlock) ord.stark = [...starkBlock[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  return ord;
}

const lager = MOTORDEFS.map((d) => ({ ...d, ...extrahera(d.fil) }));
const allaKarn = lager.flatMap((l) => l.karn.map((k) => ({ k, lager: l.namn })));
const allaStark = lager.flatMap((l) => l.stark.map((k) => ({ k, lager: l.namn })));

// Kandidater
const KAND = {
  produktionsgapet: {
    karn: ["produktionsgap", "produktionsgapet", "potentialproduktion", "potentialproduktionen",
      "hastighetstaket", "gap-formeln", "vakanskvoten", "spänningsmåttet",
      "okuns räknelära", "phillips-läxan", "nollgolvet", "gap-läget"],
    stark: ["svealand", "gap", "gapet", "potential", "timmar", "produktivitet",
      "tak", "taket", "övertid", "flaskhalsar", "norrverk", "maskintimmar",
      "taylor", "okun", "phillips", "vakanser", "arbetslösa", "kvartilbaslinjen"],
  },
  ränteswapen: {
    karn: ["ränteswap", "ränteswapen", "säkringsidentiteten", "swapkurvan",
      "brytvärdet", "det fasta benet", "det rörliga benet", "dubbelssäkringen",
      "amorteringsglidet", "swapavtalet", "swapavtal", "nominellt belopp"],
    stark: ["stibor", "storheden", "fixingen", "referensräntan", "kvartalsvis",
      "differensen", "räntebyte", "swap", "swappen", "punktval", "rullfrekvens"],
  },
  bindningsrisken: {
    karn: ["bindningsrisk", "bindningsrisken", "känslighetstalet",
      "bindningstrappan", "förfallotrappan", "räntenoten",
      "det korrelerade stresstestet", "premien för visshet"],
    stark: ["sund värme", "fabrik", "bindning", "binda", "bindningstid",
      "förfaller", "förfallodatum", "visshet", "rörlig", "fasta", "trappan"],
  },
};

function normal(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normal(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }

let kollisioner = 0;
for (const [monster, listor] of Object.entries(KAND)) {
  console.log(`\n=== ${monster} ===`);
  for (const [typ, kandidater] of Object.entries(listor)) {
    const falt = typ === "karn" ? allaKarn : allaStark;
    for (const kd of kandidater) {
      const träffar = falt.filter((x) => x.k === kd);
      if (träffar.length) { kollisioner++; console.log(`  KOLLISION ${typ}: "${kd}" → ${träffar.map((t) => t.lager).join(", ")}`); }
    }
  }
}
console.log(`\nExakta kollisioner: ${kollisioner}`);

// Närmaste grannar (tavstånd ≤ 2) för kärnorden — diafritt fångar även ä-kollisioner
function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n || !m) return Math.max(n, m);
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    fore = [...nu];
  }
  return fore[m];
}
console.log("\nGrannar (kärnord, tav ≤ 2, exklusive identiska):");
for (const [monster, listor] of Object.entries(KAND)) {
  for (const kd of listor.karn) {
    const d = diafri(kd);
    if (d.includes(" ")) continue; // flerordsfraser: exakt includes-matchning i motorn
    for (const { k, lager: lag } of allaKarn) {
      const t = tav(d, diafri(k));
      if (t > 0 && t <= 2) console.log(`  ${monster}: "${kd}" ~ "${k}" (tav ${t}) @ ${lag}`);
    }
  }
}

// Skuggningsprober: kanoniska frågor genom den levande kedjan
console.log("\nSkuggningsprober genom kedjan (motor före nytt lager svarar = PROBLEM):");
const { KURSREGISTER } = await import(pathToFileURL(join(LIB, "ai-mentor-register.ts")).href);
const PROBER = [
  "vad är produktionsgapet?", "vad är potentialproduktion?", "vad är hastighetstaket?",
  "vad är okuns räknelära?", "vad är phillipsläxan?", "vad är nollgolvet?",
  "vad är en ränteswap?", "vad är säkringsidentiteten?", "vad är swapkurvan?",
  "vad är brytvärdet på en swap?", "vad är dubbelssäkring?",
  "vad är bindningsrisken?", "vad är känslighetstalet?", "vad är bindningstrappan?",
  "vad är räntenoten?",
];
let skuggade = 0;
for (const p of PROBER) {
  const svar = [];
  for (const d of MOTORDEFS) {
    const modul = await import(pathToFileURL(join(LIB, d.fil)).href);
    const s = modul[d.fn](p, KURSREGISTER);
    if (s) { svar.push(d.namn); break; }
  }
  if (svar.length) { skuggade++; console.log(`  SKUGGAD: "${p}" → ${svar.join(", ")}`); }
  else console.log(`  NULL: "${p}" ✓`);
}
console.log(`\nSkuggade: ${skuggade} av ${PROBER.length}`);
