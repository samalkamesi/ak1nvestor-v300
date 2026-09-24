/**
 * SOND (s6-u3, fönstret efter omgång 28 — verktygsprefix _s6u3o29-):
 * LÖNSAMHET-TRION — ln-05 VAD ÄR LÖNSAMHET? + roic-03 INKREMENTELL ROIC +
 * roic-04 VÄRDEEKVATIONEN. Tre monsters ⇒ kategorin LÖNSAMHET fullt
 * mentorlänkad (3 mentorväglösa → 0; sonden _s6u1d-mentorlosa.mjs mot
 * 70-motorläget: 108 lösa, varav LÖNSAMHET exakt dessa 3).
 *
 * Rond 1: kandidatfrågor skall vara NULL genom HELA den levande kedjan.
 * Rond 2: kontrollfrågor skall fångas av sina dokumenterade ägare
 *         (lonsamhetsdjup äger roic/dupont/wacc-nakna ord; djup äger
 *         multipel-familjen; volatilitetsmekanik äger marginaltrappan;
 *         basens V-uppslag äger variabeltitelorden).
 * Rond 3: grannkontroll — planerade kärnord mot SAMTLIGA lagers kärnord
 *         LIVE-lästa ur modulerna (redigeringstavstånd ≤ 2 = granne).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// Motorlistan läses LIVE ur kedjetestets MOTORDEFS (kan inte ljuga om ordningen).
const kedjaKalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defs = [...kedjaKalla.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of defs) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ ...d, fnk: modul[d.fn], monster: modul[d.arr] });
}
function kedja(fraga) {
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) return { svar: s, motor: m.namn };
  }
  return null;
}
console.log("Kedjan LIVE: " + MOTORER.length + " motorer / " + MOTORER.reduce((s, m) => s + m.monster.length, 0) + " monsters / register " + KURSREGISTER.length);

// ── ROND 1: kandidatfrågor → NULL ────────────────────────────────────────────
const KANDIDATER = [
  // Monster 1 — ln-05 vad är lönsamhet (solidformen är lagrets kanoniska).
  "vad är lönsamhet?", "vad är lönsamheten?", "vad menas med lönsamhet?",
  "hur mäts lönsamhet?", "hur mäter man lönsamhet?",
  "vad är lönsamhetsgrad?", "vad är god lönsamhet?",
  "var uppstår vinsten?", "vad är vinst kontra kassa?",
  "vad är bageriexemplet?", "vad är bageriets trappa?",
  // Monster 2 — roic-03 inkrementell avkastning (ROIC-naket ord = lonsamhetsdjup).
  "vad är inkrementell avkastning?", "vad är inkrementella avkastningen?",
  "vad är nästa kronas avkastning?", "vad är medeltalets blindhet?",
  "vad är det vandrande medeltalet?", "vad är inflationens minne?",
  "hur räknar man inkrementellt?", "vad är inkrementell avkastning på nytt kapital?",
  // Monster 3 — roic-04 värdeekvationen (multipel-naket ord = djup-lagret).
  "vad är värdeekvationen?", "vad är värdeekvation?", "vad är värdeekvationer?",
  "vad är värdemultiplikatorn?", "vad är återinvesteringsandelen?",
  "vad är tillväxtens tvillingar?", "vad är en återinvesterad krona värd?",
  "hur läser man värdeekvationen?", "vad är multipelns pris på spridningen?",
];
console.log("\n── ROND 1: kandidater (skall vara NULL)");
let r1noll = 0, r1fangad = [];
for (const k of KANDIDATER) {
  const r = kedja(k);
  if (r) r1fangad.push(`  FÅNGAD: "${k}" → ${r.motor}`);
  else r1noll++;
}
console.log(`  ${r1noll}/${KANDIDATER.length} NULL`);
for (const f of r1fangad) console.log(f);

// ── ROND 2: kontrollfrågor → rätt ägare ──────────────────────────────────────
const KONTROLLER = [
  ["vad är roic?", "lonsamhetsdjup"],
  ["vad är dupont-analysen?", "lonsamhetsdjup"],
  ["vad är wacc?", "lonsamhetsdjup"],
  ["vad är nopat?", "lonsamhetsdjup"],
  ["vad är en multipel?", "djup"],
  ["vad är värderingsmultiplar?", "djup"],
  ["vad är marginaltrappan?", "volatilitetsmekanik"],
  ["vad är bruttomarginal?", null],   // basens V7 el. praktik — dokumenteras löst
  ["vad är roe?", null],              // basens V9 el. lonsamhetsdjup
  ["vad är kapitalbindning?", "kapitalbindning"],
  ["vad är resultatkvalitet?", null],
];
console.log("\n── ROND 2: kontroller (dokumenterade ägare)");
for (const [k, vantat] of KONTROLLER) {
  const r = kedja(k);
  const tag = r ? r.motor : "NULL";
  const ok = vantat === null ? "(öppen)" : (tag === vantat ? "OK" : "AVVIK");
  console.log(`  "${k}" → ${tag} ${ok}${vantat ? " (väntat " + vantat + ")" : ""}`);
}

// ── ROND 3: grannkontroll — planerade kärnord mot ALLA lagers kärnord ────────
function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
function redigeringstavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m; if (m === 0) return n;
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
const PLANCHEFER = {
  "M1 lönsamhetsgrunden": [
    "lönsamhet", "lönsamheten", "vad är lönsamhet", "vinstens förståelse",
    "vinsten föds i verksamheten", "bageriexemplet", "bageriets trappa",
    "vinst kontra kassa", "fakturans trettio dagar", "kampanjräkningen",
    "sex stegen", "vinstens födelse",
  ],
  "M2 inkrementell avkastning": [
    "inkrementell", "inkrementella", "inkrementell avkastning",
    "nästa krona", "nästa kronas avkastning", "medeltalets blindhet",
    "det vandrande medeltalet", "inflationens minne",
    "formeln går sönder", "nya kronor mot bokförda",
  ],
  "M3 värdeekvationen": [
    "värdeekvationen", "värdeekvation", "värdeekvationer",
    "värdemultiplikatorn", "värdemultiplikator", "per återinvesterad krona",
    "återinvesteringsandelen", "återinvesteringsandel",
    "tillväxtens tvillingar", "tvillingbolagen", "kapitalbehovet",
    "värdeekvationens fem frågor",
  ],
};
console.log("\n── ROND 3: grannkontroll (tav ≤ 2 mot samtliga lagers kärnord)");
let grannar = 0;
const fp = new Set();
for (const m of MOTORER) {
  for (const mon of m.monster) for (const k of mon.karnord ?? []) fp.add(diafri(k));
}
const fpArr = [...fp];
console.log("  " + fpArr.length + " unika syskonkärnord LIVE");
for (const [chef, plan] of Object.entries(PLANCHEFER)) {
  for (const p of plan) {
    const dp = diafri(p);
    for (const f of fpArr) {
      // Enkelords-jämförelse på hela strängen (fraser jämförs som fraser).
      const t = redigeringstavstand(dp, f);
      if (t > 0 && t <= 2) { console.log(`  GRANNE ${chef}: "${p}" ↔ "${f}" (tav ${t})`); grannar++; }
    }
  }
}
console.log(grannar === 0 ? "  0 grannar — planen är fri" : `  ${grannar} grannar — STRYK/ERSÄTT FÖRE BYGG`);

// ── ROND 4: mentorväglös-verifiering (källslugar live i registret) ───────────
console.log("\n── ROND 4: källslugar i registret");
for (const s of ["ln-05-vad-ar-lonsamhet", "roic-03-inkrementell-roic", "roic-04-vardeekvationen",
  "v07-bruttomarginal", "v09-roe", "ln-04-kapitalbindning-och-rorelsekapital", "roic-01-avkastning-pa-investerat-kapital",
  "ln-01-dupont-analysen", "ln-02-resultatkvalitet-och-accruals", "mk-09-deflation-vs-inflation",
  "km-008-wacc", "vr-03-multipelns-anatomi", "ib-04-avkastningsrakningen", "v08-ebitda-marginal"]) {
  const r = KURSREGISTER.find((x) => x.slug === s);
  console.log(`  ${r ? "FINNS " + r.kategori + " · " + r.niva : "SAKNAS  "} ${s}`);
}
const lnAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
console.log(`  LÖNSAMHET i registret: ${lnAntal} kurser`);
