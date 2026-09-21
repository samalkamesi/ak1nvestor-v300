// Kärnordsdisjunktion sond ROND 2 (s6-u3, manifest auto-s6-1790029519192):
// LIVE-läge efter syskonens ränteswap + skuldordning — kollar de två
// behållna monstren + underhållscapex-kandidater (pivot efter race).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROT = "/home/ak1a/AK1";
const LIB = join(ROT, "src/lib");
const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const MOTORDEFS = [...kedjekalla.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)",\s*fn:\s*"([^"]+)"/g)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));

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
console.log("LIVE-läge: " + lager.length + " motorer, " + allaKarn.length + " kärnord");

const KAND = {
  produktionsgapet: {
    karn: ["produktionsgap", "produktionsgapet", "potentialproduktion", "potentialproduktionen", "hastighetstaket", "gap-formeln", "vakanskvoten", "spänningsmåttet", "okuns räknelära", "phillips-läxan", "nollgolvet", "gap-läget"],
    stark: ["svealand", "gapet", "potential", "timmar", "produktivitet", "övertid", "flaskhalsar", "norrverk", "maskintimmar", "taylor", "okun", "phillips", "vakanser", "arbetslösa", "konjunktursituation", "referenspunkten"],
  },
  bindningsrisken: {
    karn: ["bindningsrisk", "bindningsrisken", "känslighetstalet", "bindningstrappan", "förfallotrappan", "det korrelerade stresstestet", "premien för visshet"],
    stark: ["sund värme", "värmepumpar", "bindning", "bindningstid", "förfaller", "förfallodatum", "visshet", "rörlig", "räntenoten", "premien", "räntetäckning", "stärräntan"],
  },
  underhallscapexet: {
    karn: ["underhållscapex", "tillväxtcapex", "kassaörat", "kassaöret", "kassaöre-marginalen", "underinvesteringsfällan", "fas-kvoten", "ersättningsinvesteringarna", "tre skattningsvägar", "kassaörat före tillväxt"],
    stark: ["svanhals", "monteringshallen", "hallen", "maskinparken", "avskrivningarna", "capex", "nolltillväxt", "substanset", "nettotappet", "arbetsnumret"],
  },
};

let kol = 0;
for (const [monster, listor] of Object.entries(KAND)) {
  console.log(`\n=== ${monster} ===`);
  for (const [typ, kand] of Object.entries(listor)) {
    const falt = typ === "karn" ? allaKarn : allaStark;
    for (const kd of kand) {
      const t = falt.filter((x) => x.k === kd);
      if (t.length) { kol++; console.log(`  KOLLISION ${typ}: "${kd}" → ${t.map((x) => x.lager).join(", ")}`); }
    }
  }
}
console.log("\nExakta kollisioner: " + kol);

function normal(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normal(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n || !m) return Math.max(n, m);
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    fore = [...nu];
  }
  return fore[m];
}
console.log("\nGrannar (kärnord, tav ≤ 2):");
for (const [monster, listor] of Object.entries(KAND)) {
  for (const kd of listor.karn) {
    const d = diafri(kd);
    if (d.includes(" ")) continue;
    for (const { k, lager: lag } of allaKarn) {
      const t = tav(d, diafri(k));
      if (t > 0 && t <= 2) console.log(`  ${monster}: "${kd}" ~ "${k}" (tav ${t}) @ ${lag}`);
    }
  }
}

// Skuggningsprober genom LEVANDE kedjan (nya kanoniska)
console.log("\nSkuggningsprober:");
const { KURSREGISTER } = await import(pathToFileURL(join(LIB, "ai-mentor-register.ts")).href);
const PROBER = [
  "vad är underhållscapex?", "vad är tillväxtcapex?", "vad är kassaörat före tillväxt?",
  "vad är underinvesteringsfällan?", "vad är fas-kvoten?",
  "vad är produktionsgapet?", "vad är bindningsrisken?", "vad är känslighetstalet?",
  "vad är en ränteswap?", "vad är senioritetsordningen?",
];
let skuggade = 0;
for (const p of PROBER) {
  const svar = [];
  for (const d of MOTORDEFS) {
    const modul = await import(pathToFileURL(join(LIB, d.fil)).href);
    const s = modul[d.fn](p, KURSREGISTER);
    if (s) { svar.push(d.namn); break; }
  }
  if (svar.length) { skuggade++; console.log(`  '${p}' → ${svar.join(", ")}`); }
  else console.log(`  NULL: '${p}' ✓`);
}
console.log(`\nSkuggade: ${skuggade} av ${PROBER.length}`);
