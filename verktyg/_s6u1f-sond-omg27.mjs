/**
 * SOND omgång 27 ROND 2 (s6-u1, manifest auto-s6-1789912510460) —
 * CO-INVESTERINGEN (pe-07).
 *
 * Bakgrund: v1-valet marginalhandeln (am-09) NEDSTÄLLT — syskonet s6-u2:s
 * anspråk 16:03 ligger FÖRE detta lagers anspråk v1 16:04 och claiming exakt
 * samma kurs och kärnordsfamilj; disk-först-konventionen ger dem territoriet
 * (omgång 26-precedensen). v2 = pe-07 co-investeringen — som s6-u2:s anspråk
 * uttryckligen lämnar öppet («passar u1:s +1») och som gör PRIVATE EQUITY &
 * INVESTMENTBOLAG fullt länkad 13/14 → 14/14.
 *
 * Rond A: kandidatfrågor skall vara NULL genom HELA den levande kedjan.
 * Rond B: kontroller fångas av dokumenterade ägare (sonden mäter rätt).
 * Rond C: grannkontroll — planerade kärnord mot SAMTLIGA lagens kärnord
 *         (tolerans en motorn: ≤3 exakt, ≤7 tål 1, >7 tål 2).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

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

// ── ROND A: kandidatfrågor → NULL ────────────────────────────────────────────
const KANDIDATER = [
  "vad är en co-investering?", "vad är co-investeringen?", "vad är co-invest?",
  "vad är en coinvestering?", "vad är coinvesteringen?",
  "hur fungerar co-investeringar?", "vad är co-invest?",
  "vad är urvalsasymmetrin?",
  "vad är break-even-multipeln?",
  "vad är co-invest-protokollet?",
  "vad är co-investorns fem frågor?",
  "vad är biljetten bredvid fonden?",
  "vad är en co-invest-biljett?",
];
let nullFel = 0;
console.log("\n── ROND A: kandidater (väntat NULL) ──");
for (const f of KANDIDATER) {
  const k = kedja(f);
  if (k) { nullFel++; console.log("  FÅNGAD ( fel ): «" + f + "» → " + k.motor); }
  else console.log("  null        : «" + f + "»");
}

// ── ROND B: kontroller → dokumenterade ägare ─────────────────────────────────
const KONTROLLER = [
  { f: "vad är internräntan?",         agare: "pe-mekanik" },
  { f: "vad är vattenfallet?",         agare: "pe-mekanik" },
  { f: "vad är utfasningar?",          agare: "pe-mekanik" },
  { f: "vad är J-kurvan?",             agare: "?" },
  { f: "vad är andrahandsmarknaden?",  agare: "pengarstid" },
  { f: "vad är sekvensrisken?",        agare: "pengarstid" },
  { f: "vad är en capital call?",      agare: "?" },
  { f: "vad är diversifiering?",       agare: "portföljgrund" },
  { f: "vad är en köpoption?",         agare: "optionsdjup" },
];
let kontrollFel = 0;
console.log("\n── ROND B: kontroller ──");
for (const { f, agare } of KONTROLLER) {
  const k = kedja(f);
  const fick = k ? k.motor : "NULL";
  const ok = agare === "?" ? true : fick === agare;
  if (!ok) kontrollFel++;
  console.log("  " + (ok ? "ok  " : "FEL ") + " «" + f + "» → " + fick + (agare !== "?" ? " (väntat " + agare + ")" : ""));
}

// ── ROND C: grannkontroll — planerade kärnord mot alla lagens kärnord ───────
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
  "co-investering", "co-investeringen", "co-investeringar",
  "coinvestering", "coinvesteringen", "co-invest", "coinvest",
  "co-investorn", "urvalsasymmetri", "urvalsasymmetrin",
  "co-invest-biljetten", "biljetten bredvid fonden",
];
let grannar = 0;
console.log("\n── ROND C: grannkontroll (" + MINA_KARNORD.length + " planerade kärnord mot hela kedjan) ──");
for (const m of MOTORER) {
  for (const monster of m.monster) {
    for (const frk of monster.karnord ?? []) {
      const a = diafri(frk);
      for (const mk of MINA_KARNORD) {
        const b = diafri(mk);
        if (a === b) { grannar++; console.log("  EXAKT DUBBLETT: «" + mk + "» = " + m.namn + "«" + frk + "»"); continue; }
        if (a.includes(" ") || b.includes(" ")) {
          // Flerordsfraser: fara om den ANDRA frasen är delsträng i min fråga-
          // kontext — dokumenteras manuellt; här flaggar endast ömsesidig
          // delsträng i kärnorden själva.
          if (a !== b && (a.includes(b) || b.includes(a))) {
            grannar++;
            console.log("  FRASÖVERLAPP: «" + mk + "» ~ " + m.namn + "«" + frk + "»");
          }
          continue;
        }
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

console.log("\nRESULTAT: rondA-fel=" + nullFel + " · rondB-fel=" + kontrollFel + " · rondC-grannar=" + grannar);
process.exit(nullFel + kontrollFel + grannar > 0 ? 1 : 0);
