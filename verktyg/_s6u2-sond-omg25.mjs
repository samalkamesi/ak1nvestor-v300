/**
 * SOND omgång 25 (s6-u2, manifest auto-s6-1789864506792) — otrackat diskbevis.
 *
 * Fokus: spår 5:s sex FÄRSKA kurser (födda 2026-09-19, EFTER omgång 24:s
 * sonder) — am-08 ETF:ens inre mekanik · rk-16 Kontrahentrisken · se-20
 * Gruv- och metallsektorn · vr-08 Tobins Q · bk-07 Lagret och
 * lagervärderingen · ks-08 Valutasäkringen — plus angränsande familjer.
 * OBS: ks-08-valutasäkringens KÄRNORD "valutasäkring" ägs redan av våg 210:s
 * valutamekanik-monster (hedging) — den familjen sonderas endast som
 * källmöjlighet, inte som territory.
 *
 * Rond 1: kedjan LIVE (motorordning ur kedjetestets MOTORDEFS — samma
 * ordning fall G vaktar mot chat-widget.tsx) + kandidatfrågor genom hela
 * kedjan (NULL = fri mark).
 * Rond 2: grannkontroll — kvarvarande kandidaters kärnord mot ALLA kärnord
 * i kedjan (normaliserat + diakritikafritt plan, samma som motorns traff).
 *
 * Kör: node verktyg/_s6u2-sond-omg25.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// ── Motorordning ur kedjetestets MOTORDEFS (speglar widgeten; fall G vaktar) ─
const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defsBlock = kedjeSrc.slice(kedjeSrc.indexOf("const MOTORDEFS = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const MOTORDEFS = [")));
const MOTORDEFS = [...defsBlock.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

console.log("== ROND 1: kedjan LIVE ==");
console.log("motorer i MOTORDEFS:", MOTORDEFS.length);
console.log("monster i MOTORDEFS:", MOTORDEFS.reduce((s, d) => s + d.antal, 0));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
console.log("register rader:", KURSREGISTER.length);
for (const slug of ["am-08-etfens-inre-mekanik", "rk-16-kontrahentrisken", "se-20-gruv-och-metallsektorn", "vr-08-tobins-q", "bk-07-lagret-och-lagervarderingen", "ks-08-valutasakringen"]) {
  const r = KURSREGISTER.find((x) => x.slug === slug);
  console.log("  register:", r ? r.slug + " — " + r.titel.slice(0, 40) : slug + " SAKNAS");
}

const motorer = [];
for (const d of MOTORDEFS) {
  const mod = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  motorer.push({ ...d, fn: mod[d.fn], arr: mod[d.arr] });
}

function kedja(fraga) {
  for (let i = 0; i < motorer.length; i++) {
    const svar = motorer[i].fn(fraga, KURSREGISTER);
    if (svar) return { motor: i, namn: motorer[i].namn, svar };
  }
  return null;
}

// ── Kandidatfrågor ──────────────────────────────────────────────────────────
const KANDIDATER = [
  // A. ETF:ens inre mekanik (am-08)
  "vad är etf arbitrage?",
  "vad är en auktoriserad deltagare?",
  "vad är skapelse och inlösen?",
  "vad är creation units?",
  "vad är premie mot nav?",
  "vad är discount mot nav?",
  "vad är en hävstångsetf?",
  "vad är hävstångsfonden?",
  "vad är terminsrullning?",
  "vad är contango?",
  "vad är backwardation?",
  "vad är nav?",
  // B. Kontrahentrisken (rk-16)
  "vad är kontrahentrisk?",
  "vad är kontrahentrisk?",
  "vad är en kontrahent?",
  "vad är ccp?",
  "vad är ett clearinghus?",
  "vad är netting?",
  "vad är initial margin?",
  "vad är variation margin?",
  "vad är collateral?",
  "vad är en garantifond?",
  "vem står på andra sidan när det blåser?",
  // C. Gruv- och metallsektorn (se-20)
  "hur analyserar jag ett gruvbolag?",
  "vad är gruvsektorn?",
  "vad är metallsektorn?",
  "vad är malmhalt?",
  "vad är brytkostnad?",
  "vad är c1 kostnad?",
  "vad är ett anrikningsverk?",
  "vad är malmbanan?",
  // D. Tobins Q (vr-08)
  "vad är tobins q?",
  "vad är q kvoten?",
  "vad är återanskaffningskostnaden?",
  // E. Lagret och lagervärderingen (bk-07)
  "vad är lagervärdering?",
  "vad är fifo?",
  "vad är nrv?",
  "hur värderas lagret?",
];

console.log("\n== KANDIDATFRÅGOR GENOM KEDJAN (NULL = fri mark) ==");
for (const f of KANDIDATER) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL          "} ${f}`);
}

// ── Rond 2: alla kärnord i kedjan (diafria) ─────────────────────────────────
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

const allaKarnord = new Set();
for (const m of motorer) for (const monster of m.arr) for (const k of monster.karnord) allaKarnord.add(diafri(k));
console.log("\nkärnord totalt (diafria, unika):", allaKarnord.size);

const PROTOTYP_KARNORD = [
  // A. ETF-mekanik
  "etf arbitrage", "auktoriserad deltagare", "auktoriserade deltagare", "skapelse och inlösen",
  "creation units", "premie mot nav", "hävstångsetf", "hävstångsfond", "terminsrullning",
  "contango", "backwardation", "nav",
  // B. Kontrahent
  "kontrahent", "kontrahentrisk", "kontrahentrisk", "ccp", "clearinghus", "netting",
  "initial margin", "variation margin", "collateral", "garantifond",
  // C. Gruv
  "gruvbolag", "gruvsektorn", "metallsektorn", "malmhalt", "brytkostnad", "c1 kostnad",
  "anrikningsverk", "malmbanan",
  // D. Tobins Q
  "tobins q", "q kvoten", "ateranskaffningskostnad",
  // E. Lager
  "lagervärdering", "lagervardering", "fifo", "nrv",
];
console.log("\n== ROND 2: prototyp-kärnordens närmaste grannar (≤4) ==");
for (const p of PROTOTYP_KARNORD) {
  const grannar = [];
  for (const k of allaKarnord) {
    if (k.includes(" ") !== p.includes(" ")) continue; // fras vs ord separat
    const d = tav(p, k);
    if (d > 0 && d <= 4) grannar.push(`${k}(${d})`);
  }
  console.log(`  ${p}${grannar.length ? " → " + grannar.join(", ") : " → (0 grannar inom 4)"}`);
}
