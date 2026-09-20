/**
 * SOND omgång 27 (s6-u1, manifest auto-s6-1789912510460) — MARGINALHANDELN.
 *
 * Rond 1: kandidatfrågorna för marginalhandels-familjen skall vara NULL genom
 *          HELA den levande kedjan (alla motorer, widgetens ordning).
 * Rond 2: kontrollfrågor skall fångas av sina dokumenterade ägare (sonden
 *          mäter rätt) — basens «hävstång», handelsdagens «kortläge»,
 *          kontrahentens «clearinghus», nyaterritoriernas «bolånetak».
 * Rond 3: grannkontroll — planerade kärnord mot SAMTLIGA lagens kärnord
 *          (redigeringstavstånd en motorns tolerans: ≤3 exakt, ≤7 tål 1,
 *          >7 tål 2) — 0 riskgrannar krävs.
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
  // ROND 2 — rensad lista efter rond 1:s fynd: «margin call» = basens,
  // «belåningsgrad» = sektorns «utlåningsgrad» (tav 2), «belåningsräntan» =
  // handelsdagens «utlåningsräntan» (tav 2) — STRUKNA, nämns endast i text.
  "vad är marginalhandel?", "vad är marginalhandeln?", "hur fungerar marginalhandel?",
  "vad är ett belåningskonto?", "vad är belåningskontot?",
  "vad är det belåningsbara värdet?", "vad är belåningsvärdet?",
  "hur räknar man ut belåningsvärdet?",
  "vad är ett marginalkrav?", "vad är marginalkravet?",
  "vad är värdeandelen?",
  "vad är kaskadpunkten?", "vad är min kaskadpunkt?",
  "vad är en tvångsförsäljning?", "vad är kravdagen?", "vad är en kravdag?",
  "vad är underhållskravet?",
  "vad är belåningsfaktorerna?", "vad är en belåningsfaktor?",
  "hur räknar man ut kaskadpunkten?",
  "vad är marginalens två betydelser?",
];
let nullFel = 0;
console.log("\n── ROND 1: kandidater (väntat NULL) ──");
for (const f of KANDIDATER) {
  const k = kedja(f);
  if (k) { nullFel++; console.log("  FÅNGAD ( fel ): «" + f + "» → " + k.motor); }
  else console.log("  null        : «" + f + "»");
}

// ── ROND 2: kontroller → dokumenterade ägare ─────────────────────────────────
const KONTROLLER = [
  { f: "vad är hävstång?",                 agare: "bas" },
  { f: "vad är kortläge?",                 agare: "handelsdag" },
  { f: "vad är ett clearinghus?",          agare: "kontrahent" },
  { f: "vad är bolånetak?",                agare: "nyaterritorier" },
  { f: "vad är spread?",                   agare: "?" },
  { f: "vad är värderingsmarginalen?",     agare: "?" },
  { f: "vad är aktieutlåning?",            agare: "?" },
  { f: "vad är margin of safety?",         agare: "?" },
];
let kontrollFel = 0;
console.log("\n── ROND 2: kontroller (ägare dokumenterade) ──");
for (const { f, agare } of KONTROLLER) {
  const k = kedja(f);
  const fick = k ? k.motor : "NULL";
  const ok = agare === "?" ? true : fick === agare;
  if (!ok) kontrollFel++;
  console.log("  " + (ok ? "ok  " : "FEL ") + " «" + f + "» → " + fick + (agare !== "?" ? " (väntat " + agare + ")" : ""));
}

// ── ROND 3: grannkontord — planerade kärnord mot alla lagens kärnord ────────
function diafri(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim()
    .normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}
function tavstand(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (!n) return m; if (!m) return n;
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
const MINA_KARNORD = [
  // ROND 2 — rensad efter rond 1: «margin call» (basens), «belåningsgrad»/
  // «belåningsgraden» (sektorns «utlåningsgrad», tav 2) och «belåningsränta»/
  // «belåningsräntan» (handelsdagens «utlåningsränta(n)», tav 2) STRUKNA —
  // dokumenterade gränser, nämns endast i svarets text.
  "marginalhandel", "marginalhandeln", "belåningskonto", "belåningskontot",
  "belåningsvärde", "belåningsvärdet", "belåningsbara", "marginalkrav",
  "marginalkravet", "marginkrav", "värdeandel", "värdeandelen",
  "kaskadpunkt", "kaskadpunkten", "kaskaden", "tvångsförsäljning",
  "tvångsförsäljningen", "kravdag", "kravdagen", "underhållskrav",
  "underhållskravet", "belåningsfaktor", "belåningsfaktorerna",
];
let grannar = 0;
console.log("\n── ROND 3: grannkontroll (" + MINA_KARNORD.length + " planerade kärnord mot hela kedjan) ──");
for (const m of MOTORER) {
  for (const monster of m.monster) {
    for (const frk of monster.karnord ?? []) {
      const a = diafri(frk);
      for (const mk of MINA_KARNORD) {
        const b = diafri(mk);
        if (a === b) { grannar++; console.log("  EXAKT DUBBLETT: «" + mk + "» = " + m.namn + "«" + frk + "»"); continue; }
        if (a.includes(" ") || b.includes(" ")) continue; // flerordsfraser matchar via includes, ej tavstånd
        const tolerans = Math.max(a.length, b.length) <= 3 ? 0 : (Math.min(a.length, b.length) <= 7 ? 1 : 2);
        const d = tavstand(a, b);
        if (d <= Math.min(tolerans, 2) && a !== b) {
          grannar++;
          console.log("  GRANNE tav " + d + ": «" + mk + "» ~ " + m.namn + "«" + frk + "»");
        }
      }
    }
  }
}
if (grannar === 0) console.log("  0 riskgrannar — kärnorden mekaniskt fria.");

// Delmängds-faran: mitt korta ord som delsträng i frågor andra äger ( Ej aktuellt:
// traff kräver helordsmatch eller tavstånd — delsträngar används endast för
// flerordsfraser. Dokumenteras i anspråket.)

console.log("\nRESULTAT: rond1-fel=" + nullFel + " · rond2-fel=" + kontrollFel + " · rond3-grannar=" + grannar);
process.exit(nullFel + kontrollFel + grannar > 0 ? 1 : 0);
