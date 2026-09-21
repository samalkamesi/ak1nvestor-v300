/**
 * Kärnordsdisjunktionssond omgång 33 (s6-u2, manifest auto-s6-1789999525797):
 * kandidat-kärnord för balansbakom-lagret (st-07 skuggskulderna + vr-09
 * konglomeratrabatten) mot SAMTLIGA befintliga lagers kärnord + u1:s och
 * u3:s kandidatlistor (parallella syskon i fönstret — deras sonder på disk).
 * Tav-tolerans enligt motorn: ≤3 tecken = exakt, ≤7 = 1, annars 2.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LIB = "/home/ak1a/AK1/src/lib";

function normalisera(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}
function diafri(s) {
  return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kostnad = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kostnad);
    }
    fore = [...nu];
  }
  return fore[m];
}

// Samla befintliga kärnord per fil
const filer = readdirSync(LIB).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
const befintliga = new Map(); // ord -> [filer]
for (const f of filer) {
  const t = readFileSync(join(LIB, f), "utf8");
  for (const block of t.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
    for (const ord of block[1].matchAll(/"([^"]+)"/g)) {
      const o = diafri(ord[1]);
      if (!befintliga.has(o)) befintliga.set(o, []);
      befintliga.get(o).push(f);
    }
  }
}
console.log(`Befintliga unika kärnord: ${befintliga.size} (i ${filer.length} filer)`);

// u1:s och u3:s kandidatord ur deras sondfiler (fönstrets syskon)
const syskonOrd = new Map(); // ord -> källa
for (const sond of ["_s6u1o33-karnord.mjs", "_s6u3o33-karnord.mjs"]) {
  try {
    const t = readFileSync(join("/home/ak1a/AK1/verktyg", sond), "utf8");
    for (const block of t.matchAll(/MINA\s*=\s*\[([\s\S]*?)\n\s*\]/g)) {
      for (const ord of block[1].matchAll(/"([^"]+)"/g)) {
        syskonOrd.set(diafri(ord[1]), sond);
      }
    }
    console.log(`Syskonord från ${sond}: ${syskonOrd.size} samlade`);
  } catch { /* syskonets sond finns ej ännu */ }
}

const MINA_SKUGGA = [
  "skuggskuld", "skuggskulden", "skuggskulderna",
  "borgensåtagande", "borgensåtagandet", "borgensåtaganden",
  "garantiåtagande", "garantiåtagandet", "garantiåtaganden",
  "förbindelsenot", "förbindelsenoten", "förbindelsenoter",
  "förbindelsekvot", "förbindelsekvoten",
  "bruttoskugga", "bruttoskuggan",
  "beställningsstock", "beställningsstocken",
  "förlustkontrakt", "förlustkontraktet", "förlustkontrakten",
  "checkräkningskredit", "checkräkningskrediten",
  "kreditutfästelse", "kreditutfästelserna",
  "panttak", "panttaket",
  "justerad skuldsättningsgrad", "justerade skuldsättningsgraden",
  "borgen", "solidarisk borgen",
  "kreditutrymme", "kreditutrymmet",
  "borgenär", "namnteckning", "namnteckningen",
];

const MINA_RABATT = [
  // bk-08 intäktredovisningen (ersätter vr-09 — nedlagt val, se anspråket)
  "intäktsredovisning", "intäktsredovisningen",
  "intäktredovisning", "intäktredovisningen",
  "prestationsplikt", "prestationsplikterna", "prestationspliktens",
  "avtalsskuld", "avtalsskulden",
  "avtalstillgång", "avtalstillgången",
  "transaktionspris", "transaktionspriset",
  "fullbordandegrad", "fullbordandegraden",
  "kostnadsandelsmetoden", "kostnadsandel",
  "fristående pris", "fristående priset", "fristående försäljningspris",
  "femstegsmodellen", "serieregeln", "serieplikten",
  "kanalfyllning", "kanalfyllningen",
  "backlog", "backlogen",
  "ifrs 15",
  "fakturera-och-håll",
  "modifieringen", "modifieringar",
  "leveransbonus", "leveransbonusen",
  "allokerat pris", "allokerade priset",
];

function kolla(namn, lista) {
  console.log(`\n=== ${namn} — ${lista.length} kandidater ===`);
  let fynd = 0;
  for (const rå of lista) {
    const o = diafri(rå);
    // exaktträff i befintliga?
    if (befintliga.has(o)) {
      console.log(`  KOLLISION(exakt): "${rå}" → ${[...new Set(befintliga.get(o))].join(", ")}`);
      fynd++;
      continue;
    }
    // syskonkandidat exakt?
    if (syskonOrd.has(o)) {
      console.log(`  SYSKON(exakt): "${rå}" → ${syskonOrd.get(o)}`);
      fynd++;
      continue;
    }
    // närträff: korta ord exakt, längre tål 1–2 fel (motorns matchningslogik)
    const max = o.length <= 3 ? 0 : o.length <= 7 ? 1 : 2;
    if (max === 0) continue;
    const grav = [];
    for (const [b, fs] of befintliga) {
      if (Math.abs(b.length - o.length) > max) continue;
      if (tav(b, o) <= max) grav.push(`"${rå}"~${b} (${[...new Set(fs)].join(",")})`);
    }
    for (const [s, k] of syskonOrd) {
      if (Math.abs(s.length - o.length) > max) continue;
      if (tav(s, o) <= max) grav.push(`"${rå}"~${s} (${k}, SYSKON)`);
    }
    if (grav.length > 0) {
      for (const g of [...new Set(grav)].slice(0, 6)) console.log(`  NÄRA: ${g}`);
      fynd += grav.length;
    }
  }
  if (fynd === 0) console.log("  → RENT: 0 kollisioner");
}

kolla("SKUGGSKULDerna (st-07)", MINA_SKUGGA);
kolla("INTÄKTREDOVISNINGEN (bk-08)", MINA_RABATT);
