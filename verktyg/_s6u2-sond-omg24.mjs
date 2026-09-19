/**
 * SOND omgång 24 (s6-u2, spår 6) — otrackat diskbevis.
 *
 * Territoryll: syskonet u3 sonderar (_s6u3-sond-omg24.mjs) spår 5:s sex nya
 * kurser (försäkring/guidning/katalysator/bostadsmarknad/demografi/kostnads-
 * trappa) + bokmaster- och kryptofribitarna — de ytorna lämnas åt u3.
 * Denna sond letar på ANDRA familjer: ränta-på-ränta & sparhorisont, guld &
 * råvaror, certifikat & strukturerade produkter, aktieklasser (A/B-aktier),
 * börsnotering/IPO, ETF & fondavgifter, VIX, bull/bear-marknader.
 *
 * Rond 1: kedjan LIVE (motorordning ur kedjetestets MOTORDEFS — samma
 * ordning fall G vaktar mot chat-widget.tsx) + kandidatfrågor genom hela
 * kedjan (NULL = fri mark).
 * Rond 2: grannkontroll — kvarvarande kandidaters kärnord mot ALLA kärnord
 * i kedjan (normaliserat + diakritikafritt plan, samma som motorns traff).
 *
 * Kör: node verktyg/_s6u2-sond-omg24.mjs
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

// ── Kandidatfrågor (u2:s familjer — ej u3:s) ────────────────────────────────
const KANDIDATER = [
  // A. ränta-på-ränta & sparhorisont
  "vad är ränta på ränta?",
  "vad är räntepåränta?",
  "hur fungerar ränta på ränta effekten?",
  "vad är compound interest?",
  "hur länge ska jag spara?",
  "vad är sparhorisont?",
  "vad är tiden i marknaden?",
  // B. guld & råvaror
  "vad är guld som investering?",
  "hur investerar man i guld?",
  "vad driver guldpriset?",
  "vad är råvaror?",
  "hur fungerar råvarumarknaden?",
  "vad är en råvarucykel?",
  // C. certifikat & strukturerade produkter
  "vad är ett certifikat?",
  "vad är bull certifikat?",
  "vad är bear certifikat?",
  "vad är strukturerade produkter?",
  "vad är hävstångsprodukter?",
  // D. aktieklasser
  "vad är a aktier?",
  "vad är b aktier?",
  "vad är aktieklasser?",
  "vad är röstvärde?",
  "varför finns a och b aktier?",
  // E. notering / IPO
  "vad är en börsnotering?",
  "vad är en notering?",
  "vad är ipo?",
  "vad är en börsintroduktion?",
  "hur köper man aktier i en notering?",
  // F. ETF & fondavgifter
  "vad är en etf?",
  "vad är börshandlad fond?",
  "vad är fondavgift?",
  "vad är förvaltningsavgift?",
  "aktiv eller passiv förvaltning?",
  // G. VIX
  "vad är vix?",
  "vad är volatilitetsindex?",
  "vad är fear index?",
  // L. bull/bear-marknad
  "vad är en bullmarknad?",
  "vad är en bearmarknad?",
  "vad är bull market?",
  "vad är bear market?",
  "vad är en korrektion?",
  "vad är ett börsras?",
];

console.log("\n== KANDIDATFRÅGOR GENOM KEDJAN (NULL = fri mark) ==");
for (const f of KANDIDATER) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL          "} ${f}`);
}

// ── Rond 2-förberedelse: alla kärnord i kedjan (diafria) ────────────────────
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

// Prototyper för rond 2 (kör manuellt efter rond 1:s NULL-bild)
const PROTOTYP_KARNORD = [
  "ranta pa ranta", "ranteparanta", "sparhorisont", "guld", "guldpris", "ravaror", "ravarucykel",
  "certifikat", "strukturerade produkter", "aktieklass", "rostvarde", "notering", "ipo",
  "boursintroduktion", "etf", "fondavgift", "vix", "bullmarknad", "bearmarknad", "korrektion", "boursras",
];
console.log("\n== ROND 2-FÖRHAND: prototyp-kärnordens närmaste grannar (≤4) ==");
for (const p of PROTOTYP_KARNORD) {
  const grannar = [];
  for (const k of allaKarnord) {
    if (k.includes(" ") !== p.includes(" ")) continue; // fras vs ord separat
    const d = tav(p, k);
    if (d > 0 && d <= 4) grannar.push(`${k}(${d})`);
  }
  console.log(`  ${p}${grannar.length ? " → " + grannar.join(", ") : " → (0 grannar inom 4)"}`);
}
