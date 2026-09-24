// Kärnordsdisjunktion sond (s6-u3, manifest auto-s6-1790245511290, fönster 35):
// 1) extraherar ALLA kärnord+starkord ur samtliga frågemoduler,
// 2) kollar kandidatlistorna för tre nya monsters (bankens lönsamhet /
//    krishantering / väntat fall i svansen) mot dem = 0 kollisioner krävs,
// 3) skuggningsprober: de kanoniska frågorna genom hela LEVANDE kedjan
//    (MOTORDEFS-ordning) = NULL för alla motorer före det nya lagret.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROT = "/home/ak1a/AK1";
const LIB = join(ROT, "src/lib");

const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
// \s+ mellan fält: rader är blandat kompakt- och kolumnjusterat formatterade —
// exakt-ett-mellanslag missade 17 av 83 motorer (fönster 35-fynd).
const MOTORDEFS = [...kedjekalla.matchAll(/\{ namn: "([^"]+)",\s+fil: "([^"]+)",\s+fn: "([^"]+)"/g)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));

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
console.log(`LIVE: ${lager.length} motorer · ${allaKarn.length} kärnord · ${allaStark.length} starkord`);

// Kandidater (kursens egna begrepp ur public/deep-courses.json).
// Fönster 35 rond 1-fynd (mot 66-motorlistan): "riskvägda tillgångar" är
// banksektorns kärnord → STRUKET (gräns: banksektorn äger balansläsningen,
// detta lager äger lönsamhetsläsningen); starkord "krisen" → realekonomi +
// marknadsrytm → STRUKET.
// ROND 3 — PIVOT efter syskonrace: u1 levererade krishantering (pf-07,
// deras modul wiread 12:37 medan detta lager byggdes; mitt anspråk 12:28:37
// FÖRE deras 12:31:31 — precedensen noterad men deras FÄRDIGA arbete rives
// inte: mitt krishantering-monster kasseras, ytan deras) och u2 siktar på
// tx-06/tx-07. ERSÄTTNING: SKATT & JURIDIK-stängningen — sj-07 primär +
// sj-06 som källa = kategorins två sista lösa i ett monster (7/7).
const KAND = {
  bankensLonsamhet: {
    karn: ["bankens lönsamhet", "bankernas lönsamhet", "banklönsamhet", "banklönsamheten",
      "arbetsmaterialet", "mätningsbytet", "måttet byter sida",
      "riskvägningen", "kärnkapitalrelation", "kärnkapitalrelationen",
      "förlustbågen", "grusmarginalen"],
    stark: ["norra bank", "verkstad", "tillsynen", "kapitalkrav", "periodisera",
      "c/i", "lugnitårs", "riskvikt", "kärnkapital", "platserna byter"],
  },
  forlustavdraget: {
    karn: ["förlustavdrag", "förlustavdraget", "förlustavdragen",
      "kvotering", "kvoteringen",
      "överskottsavdrag", "överskottsavdraget",
      "utjämningsordningen", "utjämningsunderlag",
      "sparat avdrag", "det sparade avdraget",
      "dagkvittning", "dagkvittningen",
      "återförvärvsregeln",
      "skalans dörr"],
    stark: ["kapitalförlust", "realisationen", "sjuttio", "hundra procent",
      "pappersförlust", "schablonkontot", "trappan", "skattevärdet"],
  },
  vantaISvansen: {
    karn: ["cvar", "svansmedel", "svansmedlet", "väntat fall i svansen",
      "expected shortfall", "förväntat underskott", "svansprotokollet",
      "rummet bakom tröskeln", "tröskelbrottet", "konfidensgradens pris"],
    stark: ["svansen", "tröskeln", "tröskel", "rockafellar", "uryasev",
      "subadditiv", "koherens", "percentilen", "rangvändningen", "fem svansmånader"],
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
    if (d.includes(" ")) continue;
    for (const { k, lager: lag } of allaKarn) {
      const t = tav(d, diafri(k));
      if (t > 0 && t <= 2) console.log(`  ${monster}: "${kd}" ~ "${k}" (tav ${t}) @ ${lag}`);
    }
  }
}

console.log("\nSkuggningsprober genom kedjan (motor svarar = ligger FÖRE nytt lager — ska vara NULL för mina, RÄTT ägare för gränserna):");
const { KURSREGISTER } = await import(pathToFileURL(join(LIB, "ai-mentor-register.ts")).href);
const PROBER = [
  // Mina tre kanoniska (ska vara NULL — ingen tidigare motor äger dem)
  "vad är banklönsamhet?", "vad är kärnkapitalrelationen?", "vad är mätningsbytet?",
  "vad är förlustavdrag?", "vad är kvoteringen?", "vad är överskottsavdrag?",
  "vad är dagkvittning?", "vad är återförvärvsregeln?",
  "vad är cvar?", "vad är svansmedel?", "vad är expected shortfall?",
  // Gränsprober (ska svara av RÄTT ägare — dokumenterar att jag inte tar dem)
  "vad är räntenetto?", "vad är value at risk?", "vad är dupont-analysen?",
  "vad är kapitalvinstskatt?", "vad är utländsk källskatt?", "vad är isk?",
  "vad är tail-risk hedging?", "vad är stress testing?", "vad är volatilitetsbudgeten?",
  "vad är sekvensrisken?", "vad är enhetsekonomi?", "vad är krishantering?",
];
for (const p of PROBER) {
  const svar = [];
  for (const d of MOTORDEFS) {
    const modul = await import(pathToFileURL(join(LIB, d.fil)).href);
    const s = modul[d.fn](p, KURSREGISTER);
    if (s) { svar.push(d.namn); break; }
  }
  console.log(`  ${svar.length ? "svar: " + svar.join(", ") : "NULL ✓"}  ← "${p}"`);
}
