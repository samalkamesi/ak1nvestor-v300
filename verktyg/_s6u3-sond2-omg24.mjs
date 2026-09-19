/**
 * SOND omgång 24 — ROND 2 (s6-u3, spår 6), otrackat diskbevis.
 *
 * Fördjupning: (a) lista mentorväglösa slugar i interesting-kategorier,
 * (b) granska ägarskap hos tidiga motorer för planerade kärnord
 * (float, katalysator, prognos, bolån, bostad), (c) grannkontroll:
 * avstånd mellan planerade kärnord och KEDJANS samtliga kärnord.
 *
 * Kör: node verktyg/_s6u3-sond2-omg24.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const defsBlock = kedjeSrc.slice(kedjeSrc.indexOf("const MOTORDEFS = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const MOTORDEFS = [")));
const MOTORDEFS = [...defsBlock.matchAll(/\{ namn: "([^"]+)",\s*fil: "([^"]+)",\s*fn: "([^"]+)",\s*arr: "([^"]+)",\s*antal: (\d+) \}/g)]
  .map((m) => ({ namn: m[1], fil: m[2], fn: m[3], arr: m[4], antal: Number(m[5]) }));

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
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
      nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
    }
    fore = [...nu];
  }
  return fore[m];
}

// ── (a) mentorväglösa per kategori ──────────────────────────────────────────
const nådda = new Set();
for (const m of motorer) {
  for (const monster of m.arr) {
    const svar = monster.bygga(KURSREGISTER);
    if (svar.kalla?.slug) nådda.add(svar.kalla.slug);
    for (const k of svar.kallor ?? []) if (k.slug) nådda.add(k.slug);
    for (const h of svar.handlings ?? []) {
      const mm = h.lank.match(/^\/kurser\/([a-z0-9-]+)$/);
      if (mm) nådda.add(mm[1]);
    }
    const fm = svar.fordjupa?.lank?.match(/^\/kurser\/([a-z0-9-]+)$/);
    if (fm) nådda.add(fm[1]);
  }
}
const VIKTADE = ["KATALYSATOR", "MAKROEKONOMI & RÄNTA", "SEKTORANALYS", "PRIVATE EQUITY & INVESTMENTBOLAG", "MAKROEKONOMI", "MOAT", "BOKFÖRING & ÅRSREDOVISNING", "VÄRDERING", "RISKHANTERING", "LÖNSAMHET"];
console.log("== MENTORVÄGLÖSA (utvalda kategorier) ==");
for (const kat of VIKTADE) {
  const lösa = KURSREGISTER.filter((r) => r.kategori === kat && !nådda.has(r.slug));
  console.log(`\n${kat} (${lösa.length} lösa):`);
  for (const r of lösa) console.log(`  ${r.slug} — ${r.titel} (${r.minuter} min, ${r.niva})`);
}

// ── (b) ägarskap hos tidiga motorer (territoriumkoll) ───────────────────────
console.log("\n== TERRITORIUM (vem fångar vad) ==");
const PROBER = [
  "vad är float?", "vad är floaten?", "vad är insurance float?",
  "vad är en katalysator?", "vad är katalysatorer?",
  "vad är en prognos?", "vad är prognoser?", "hur läser jag en prognos?",
  "vad är väntan på rapport?", "vad är en bolåneränta?", "vad är bolån?",
  "vad är räntan?", "vad är KPI?", "vad är stibor?",
  "vad är en aktieindex?", "vad är riskpremien?",
  "hur analyserar jag en bank?", "vad är utdelning?",
  "vad är en livförsäkring?", "vad är skadeförsäkring?",
  "vad är en försäkringsmatte?", "vad är premier?",
  "vad är en premie?", "vad är återförsäkring?",
  "vad är guidningar?", "vad är bolt guidance?",
  "vad är mr market?", "vad är en blogg?",
];
for (const f of PROVER_SAFE(PROBER)) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL          "} ${f}`);
}
function PROVER_SAFE(arr) { return arr; }

// ── (c) grannkontroll: planerade kärnord mot kedjans alla kärnord ───────────
console.log("\n== GRANNKONTROLL (min ord ↔ kedjans kärnord, tavstånd ≤ 3) ==");
const planerade = [
  // försäkring
  "försäkring", "försäkringar", "försäkringsbolag", "försäkringssektor",
  "combined ratio", "skadekvot", "försäkringsgivare", "livförsäkring",
  "skadeförsäkring", "återförsäkring", "försäkringspremie", "insurance float",
  // guidning
  "guidning", "guidningen", "guidningar", "prognospåminnelse",
  // aktivist / tillverkad katalysator
  "aktivist", "aktivisten", "aktivister", "aktivism",
  // bostad / demografi
  "bostadsmarknad", "bostadsmarknaden", "bostadsbubbla", "lånekraft",
  "bostadsmekanik", "demografi", "demografin", "demografisk",
  "befolkningspyramiden", "åldrandet", "befolkningstillväxt",
];
const befintliga = [];
for (const m of motorer) {
  for (const monster of m.arr) {
    for (const k of monster.karnord ?? []) befintliga.push({ motor: m.namn, ord: diafri(k) });
  }
}
console.log("kedjans kärnord totalt:", befintliga.length);
for (const pRaw of planerade) {
  const p = diafri(pRaw);
  const nära = [];
  for (const b of befintliga) {
    if (b.ord.includes(" ") || p.includes(" ")) continue; // bara enkla ord grannkollas här
    const d = tav(p, b.ord);
    if (d <= 3) nära.push({ d, ...b });
  }
  nära.sort((a, b) => a.d - b.d);
  if (nära.length === 0) console.log(`  ${pRaw}: INGA grannar ≤3`);
  else console.log(`  ${pRaw}: ` + nära.map((x) => `d${x.d} ${x.ord} (${x.motor})`).join(" · "));
}
