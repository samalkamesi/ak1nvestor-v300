/**
 * SOND ROND 3 (s6-u2, manifest auto-s6-1789965330060) — kärnordsdisjunktion
 * LIVE + variantfrågor + källkandidater.
 *
 * Del 1: mina planerade kärnord mot SAMTLIGA lagers kärnord (lästa LIVE ur
 *        src/lib/ai-mentor-*-fragor.ts) — tav-tolerans enligt motorn
 *        (≤3 tecken exakt, ≤7 tecken 1 fel, annars 2 fel; fraser exakta).
 * Del 2: variantfrågor genom hela kedjan (ägarprover).
 * Del 3: kandidat-källors registerläge (slug, titel, nivå, kategori).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

function normalisera(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim(); }
function diafri(s) { return normalisera(s).normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC"); }
function tav(a, b) {
  if (a === b) return 0;
  const n = a.length, m = b.length;
  if (n === 0) return m; if (m === 0) return n;
  let fore = Array.from({ length: m + 1 }, (_, j) => j);
  const nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) {
    nu[0] = i;
    for (let j = 1; j <= m; j++) {
      const kost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + kost);
    }
    fore = [...nu];
  }
  return fore[m];
}
function ordTraff(fragaOrd, fragaStr, nk) {
  if (nk.includes(" ")) return fragaStr.includes(nk);
  if (nk.length <= 3) return fragaOrd.includes(nk);
  const max = nk.length <= 7 ? 1 : 2;
  return fragaOrd.some((o) => tav(o, nk) <= max);
}

// ── Del 1: kärnord LIVE ur alla fragor-filer ────────────────────────────────
const MINA = {
  ovning: [
    "övar jag på", "övar man på", "öva på bolag", "övar på bolag", "träna på bolag",
    "tränar man på", "påhittat bolag", "påhittade bolag", "övningsbolag", "övningsbolaget",
    "första analysen", "egen aktieanalys", "egna analysarbetet", "riva årsredovisningen",
    "lära sig analysera", "börja analysera", "komma igång med analys",
  ],
  jamforelse: [
    "sida vid sida", "jämföra bolag", "jämföra två bolag", "jämföra två", "två bolag",
    "bolagsjämförelse", "jämförelse av bolag", "jämföra aktier", "jämföra företag",
    "måttstocken", "kontrastparet", "jämförbarhetens",
  ],
};

const filer = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
const allaKarn = []; // {fil, karnord}
for (const f of filer) {
  const kalla = readFileSync(join(ROT, "src/lib", f), "utf8");
  // Plocka kärnordsblocken: karnord: [ ... ],
  for (const block of kalla.matchAll(/karnord:\s*\[([^\]]*)\]/g)) {
    for (const ord of block[1].matchAll(/"([^"]+)"/g)) allaKarn.push({ fil: f, karnord: diafri(ord[1]) });
  }
}
console.log("Lagerlästa kärnord totalt: " + allaKarn.length + " (ur " + filer.length + " filer)\n");

for (const [grupp, mina] of Object.entries(MINA)) {
  console.log("== Grupp " + grupp + " ==");
  for (const mk of mina) {
    const d = diafri(mk);
    const grannar = [];
    for (const { fil, karnord } of allaKarn) {
      const kollision =
        d.includes(" ") ? karnord === d || karnord.includes(d) || d.includes(karnord)
        : ordTraff([karnord], karnord, d) || ordTraff([d], d, karnord);
      if (kollision) grannar.push(fil.replace("ai-mentor-", "").replace("-fragor.ts", "") + ":" + karnord);
    }
    console.log((grannar.length ? "KOLLISION " : "FRITT     ") + "«" + mk + "»" + (grannar.length ? " → " + grannar.join(", ") : ""));
  }
  console.log("");
}

// ── Del 2: variantfrågor genom kedjan ───────────────────────────────────────
const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const MOTORDEFS = [...kedjekalla.matchAll(
  /\{ namn:\s+"([^"]+)",\s+fil:\s+"([^"]+)",\s+fn:\s+"([^"]+)",\s+arr:\s+"([^"]+)",\s+antal:\s+(\d+) \}/g,
)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const MOTORER = [];
for (const d of MOTORDEFS) {
  const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
  MOTORER.push({ namn: d.namn, fnk: modul[d.fn] });
}
const VARIANTER = [
  "Hur lär jag mig analysera aktier?",
  "Hur börjar jag analysera bolag?",
  "Hur övar jag på aktieanalys?",
  "Var börjar jag med egen analys?",
  "Hur går ett case till steg för steg?",
  "Vad är ett övningsbolag?",
  "Hur jämför man två aktier?",
  "Hur jämför jag bolag i samma bransch?",
  "Vad är en bolagsjämförelse?",
  "Hur gör jag en jämförelse av två företag?",
  "Vad är caseloggen?",
  "Vad är måttstocken?",
];
console.log("== Variantfrågor genom kedjan ==");
for (const fraga of VARIANTER) {
  let traffad = null;
  for (const m of MOTORER) {
    const s = m.fnk(fraga, KURSREGISTER);
    if (s) { traffad = { motor: m.namn, amne: s.amne }; break; }
  }
  console.log((traffad ? "ÄGARE " : "NULL  ") + " " + fraga + (traffad ? "  → " + traffad.motor + " (" + traffad.amne + ")" : ""));
}

// ── Del 3: källkandidater ───────────────────────────────────────────────────
console.log("\n== Källkandidater i registret ==");
const SLUGS = ["pc-21-ditt-forsta-case", "pc-22-ditt-andra-case", "portfolj-ekosystemet",
  "am-03-lasa-aktiesidan", "pc-01-case-atlas-copco", "pc-03-case-swedbank", "pc-12-case-skf",
  "pc-13-case-ssab", "se-01-sektoranalys", "km-002-nyckeltal"];
for (const s of SLUGS) {
  const r = KURSREGISTER.find((x) => x.slug === s);
  console.log(r ? "FINNS  " + s + " · " + r.titel.slice(0, 60) + " · " + r.kategori + " · " + r.niva : "SAKNAS " + s);
}
