/**
 * Sond _s6u3o33 (manifest auto-s6-1789999525797, s6-u3 fönster 33):
 * kärnordsdisjunktion för tre nyfödda monsters (bf-18 kompetensillusionen,
 * od-10 kreditderivatet, kt-10 avknoppningen).
 *
 * Rond 1: extrahera ALLA kärnord + starkord ur samtliga 77 lager (textregex)
 *         och kolla kandidaterna mot dem (exakt, delsträng båda vägar).
 * Rond 2: importera motorerna i KEDJEORDNING (ur kedjetestets MOTORDEFS) och
 *         kör kanoniska frågor + grannefrågor — allt ska vara null (då är
 *         utrymmet rent och mina monsters inte skuggade).
 * 0 beroenden utöver Node >= 22.18 (type stripping).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const LIB = join(ROT, "src", "lib");

// ── Rond 1: kärnord + starkord ur alla lager ────────────────────────────────
const lagerFiler = readdirSync(LIB).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
const karnord = new Map(); // ord -> fil
const starkord = new Map();
for (const f of lagerFiler) {
  const txt = readFileSync(join(LIB, f), "utf8");
  for (const m of txt.matchAll(/karnord:\s*\[((?:\s*(?:\/\/[^\n]*)?[\s\S])*?)\]/g)) {
    for (const s of m[1].matchAll(/"([^"]+)"/g)) {
      if (!karnord.has(s[1])) karnord.set(s[1], f);
    }
  }
  for (const m of txt.matchAll(/starkord:\s*\[((?:\s*(?:\/\/[^\n]*)?[\s\S])*?)\]/g)) {
    for (const s of m[1].matchAll(/"([^"]+)"/g)) {
      if (!starkord.has(s[1])) starkord.set(s[1], f);
    }
  }
}
console.log(`Lager: ${lagerFiler.length} · kärnord: ${karnord.size} · starkord: ${starkord.size}`);

const kandidater = {
  kompetensillusionen: [
    "kompetensillusionen", "kompetensillusion", "kunskapsillusionen", "kunskapsillusion",
    "giltighetsmiljö", "giltighetsmiljöer", "giltighetsmiljön",
    "kompetensparadoxen", "kompetensparadox",
    "slantturneringen", "slantturnering", "slant",
    "rådgivarkorrelationerna", "rådgivarkorrelation", "rådgivarstudien",
    "social smitta", "stjärnstatus", "stjärnkulten",
    "illusion of skill", "kvartilbaslinjen",
  ],
  kreditderivatet: [
    "kreditderivat", "kreditderivatet", "kreditderivaten",
    "credit default swap", "default swap", "cds",
    "kredithändelse", "kredithändelsen", "kredithändelser",
    "referensnamn", "referensnamnet", "referensnamnen",
    "förlustandel", "förlustanden", "lgd",
    "återvinning", "återvinningen",
    "statskredit", "statskrediten",
    "naken cds", "kreditspread", "kreditspreaden", "kreditsprid", "sprid",
    "statskreditrisk", "kreditkommittén",
  ],
  avknoppningen: [
    "avknoppning", "avknoppningen", "avknoppas", "avknoppad",
    "spin off", "spin-off", "pro rata", "when-issued", "when issued",
    "distributionsdag", "distributionsdagen",
    "kontinuitetstestet", "kontinuitetstest",
    "utdelning i natur", "dotterbolagsutdelning",
    "modrik", "nordhamn",
  ],
};

console.log("\n── ROND 1: exakta/delsträngskollisioner ──");
for (const [monster, ord] of Object.entries(kandidater)) {
  for (const k of ord) {
    const kl = k.toLowerCase();
    const exakt = karnord.get(kl) || karnord.get(k);
    if (exakt) { console.log(`  KÄRNORD-KOLLISION  "${k}" ∈ ${exakt}`); continue; }
    const exaktS = starkord.get(kl) || starkord.get(k);
    if (exaktS) { console.log(`  starkord-traff     "${k}" ∈ ${exaktS} (OK som gräns, ej kärnord där)`); continue; }
    // delsträng båda vägar mot kärnord (J-fallets fraskonvention)
    for (const [kk, ff] of karnord) {
      if (kk.includes(" ")) continue; // fraser hanteras separat
      if (kl.includes(" ")) {
        // min flerordsfras som innehåller deras enords-kärnord => skuggas ej,
        // men deras ord i min fras kan stjäla deras frågor — flagga bara om identisk
        continue;
      }
      if (!kl.includes(" ") && kk.length >= 4 && (kl.includes(kk) || kk.includes(kl))) {
        console.log(`  DELSTRÄNG           "${k}" ~ kärnord "${kk}" ∈ ${ff}`);
        break;
      }
    }
  }
}
console.log("  (rader ovan = alla fynd; inga rader = rent)");

// ── Rond 2: skuggning i levande kedjan ─────────────────────────────────────
console.log("\n── ROND 2: kedjeskuggning (motorer i kedjetestets ordning) ──");
const kedjaTxt = readFileSync(join(HÄR, "testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [];
for (const m of kedjaTxt.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)",\s*fn:\s*"([^"]+)",\s*arr:\s*"([^"]+)",\s*antal:\s*(\d+)\s*\}/g)) {
  defs.push({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) });
}
console.log(`Motorer i kedjan: ${defs.length} · monsters: ${defs.reduce((s, d) => s + d.antal, 0)}`);

const regMod = await import(pathToFileURL(join(LIB, "ai-mentor-register.ts")).href);
const REGISTER = regMod.KURSREGISTER;
const motorer = [];
for (const d of defs) {
  const mod = await import(pathToFileURL(join(LIB, d.fil)).href);
  motorer.push({ ...d, fnk: mod[d.fn] });
}

const prober = [
  // kanoniska frågor för mina tre monsters — SKA vara null genom hela kedjan
  "vad är kompetensillusionen?",
  "vad är kompetensparadoxen?",
  "vad är en slantturnering?",
  "vad är giltighetsmiljöer?",
  "vad är ett kreditderivat?",
  "vad är en credit default swap?",
  "vad är en kredithändelse?",
  "vad är en avknoppning?",
  "vad betyder pro rata?",
  "vad är when-issued-handel?",
  "vad är kontinuitetstestet?",
  "vad är distributionsdagen?",
  // grannefrågor — ska FORTFARANDE fångas av sina ägare (bevisar att jag inte
  // behöver stjäla deras ord)
  "vad är konglomeratrabatten?",
  "vad är slumpens serier?",
  "vad är övermodet?",
  "vad är spreaden?",
  "vad är en option?",
  "vad är svarta svanar?",
  "vad är indexomläggningen?",
  "vad är en budprocess?",
];

for (const p of prober) {
  const traffade = motorer.filter((m) => m.fnk(p, REGISTER) !== null).map((m) => m.namn);
  console.log(`  "${p}" → ${traffade.length === 0 ? "NULL (rent)" : traffade.join(", ")}`);
}
