/**
 * SOND omgång 24 — ROND 3 (s6-u3, spår 6): slutlig kärnordskontroll.
 *
 * (a) grannkontroll för resterande planerade kärnord (prognos-familjen,
 *     bostadspris-familjen, bolån, combined, float), (b) kanoniska +
 *     variantfrågor NULL-genomströmning, (c) gränsfrågor förblir hos sina
 *     ägare (försäkring-singular → beteendedjup, katalysator → bas,
 *     räntan → makro, påverkar-form → bas).
 *
 * Kör: node verktyg/_s6u3-sond3-omg24.mjs
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
    for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, fore[j] + 1, fore[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
    fore = [...nu];
  }
  return fore[m];
}

// (a) grannkontroll, enkelord
const planerade = ["prognos", "prognosen", "prognoser", "prognoserna", "bolagsprognos",
  "bostadspris", "bostadspriser", "bostadspriset", "bostadspriserna",
  "bolån", "bolåneränta", "combined", "float", "floaten", "skadekvot",
  "bostadsmarknad", "demografi", "händelsekarta", "händelsekartan"];
const befintliga = [];
for (const m of motorer) for (const monster of m.arr) for (const k of monster.karnord ?? []) befintliga.push({ motor: m.namn, ord: diafri(k) });
console.log("== (a) GRANNKONTROLL ==");
for (const pRaw of planerade) {
  const p = diafri(pRaw);
  const nära = [];
  for (const b of befintliga) {
    if (b.ord.includes(" ") || p.includes(" ")) continue;
    const d = tav(p, b.ord);
    if (d <= 3) nära.push({ d, ...b });
  }
  nära.sort((a, b) => a.d - b.d);
  if (nära.length === 0) console.log(`  ${pRaw}: INGA grannar ≤3`);
  else console.log(`  ${pRaw}: ` + nära.map((x) => `d${x.d} ${x.ord} (${x.motor})`).join(" · "));
}

// (b) kanoniska + varianter — ska vara NULL idag
console.log("\n== (b) KANONISKA + VARIANTER (NULL = fri mark) ==");
const KANONISKA = [
  "hur analyserar jag ett försäkringsbolag?",
  "vad är combined ratio?",
  "vad är skadekvoten?",
  "vad är float?",
  "vad är floaten?",
  "vad är återförsäkring?",
  "vad är en livförsäkring?",
  "hur fungerar försäkringsbolag?",
  "vad är försäkringssektorn?",
  "vad är guidningen?",
  "vad är guidning?",
  "vad är bolagets prognos?",
  "hur läser jag bolagets egen prognos?",
  "vad är prognoser?",
  "vad är en händelsekarta?",
  "hur fungerar bostadsmarknaden?",
  "vad är bostadsmarknadens mekanik?",
  "vad är lånekraft?",
  "vad är en bostadsbubbla?",
  "vad är demografi?",
  "vad är demografins klocka?",
  "vad är befolkningspyramiden?",
  "vad betyder åldrandet för ekonomin?",
  "vad är ett bolån?",
];
for (const f of KANONISKA) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL          "} ${f}`);
}

// (c) gränser — ska FÖRBLIVA hos sina ägare
console.log("\n== (c) GRÄNSER (skal ligga kvar hos ägaren) ==");
const GRÄNSER = [
  "vad är försäkring?",            // beteendedjup via förankring d2 (V19)
  "vad är float inom försäkring?", // dito
  "vad är en katalysator?",        // bas
  "vad är en tillverkad katalysator?", // bas (naket katalysator-ord)
  "vad är räntan?",                // makro
  "vad är KPI?",                   // makro
  "hur påverkar bostadsmarknaden börsen?", // bas X-påverkar-börsen
  "vad är väntan på rapport?",     // makro
  "hur analyserar jag en bank?",   // sektor
  "vad är förväntningsanalys?",    // förväntningsdjup
];
for (const f of GRÄNSER) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL (!)       "} ${f}`);
}
