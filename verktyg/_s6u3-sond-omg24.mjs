/**
 * SOND omgång 24 (s6-u3, spår 6) — otrackat diskbevis.
 *
 * Rond 1: läs KEDJAN LIVE (motorordning ur testa-ai-mentor-kedja.mjs MOTORDEFS
 * — samma ordning fall G vaktar mot chat-widget.tsx), räkna mentorväglösa
 * kurser (bygg ALLA monsters svar och samla kurs-slugar), och prova
 * kandidatfrågor: spår 5:s sex nya kurser (ma-08/kt-06/kt-07/se-19/mk-12/
 * ib-05 — tillagda 2026-09-19, omöjliga för äldre lager att referera) +
 * dokumenterade fribitar (bokmaster-C/E, se-11 krypto).
 *
 * Kör: node verktyg/_s6u3-sond-omg24.mjs
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

// ── Kedjefunktion (samma semantik som widgetens ??-kedja) ───────────────────
function kedja(fraga) {
  for (let i = 0; i < motorer.length; i++) {
    const svar = motorer[i].fn(fraga, KURSREGISTER);
    if (svar) return { motor: i, namn: motorer[i].namn, svar };
  }
  return null;
}

// ── Mentorväglösa kurser: bygg ALLA monsters svar, samla slugar ─────────────
const nådda = new Set();
let monsterTotal = 0;
for (const m of motorer) {
  for (const monster of m.arr) {
    monsterTotal++;
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
console.log("\n== MENTORVÄGLÖSA KURSER ==");
console.log("monster totalt (kodens sanning):", monsterTotal);
console.log("nådda slugar:", nådda.size, "av", KURSREGISTER.length);
const lösa = KURSREGISTER.filter((r) => !nådda.has(r.slug));
const perKategori = {};
for (const r of lösa) perKategori[r.kategori] = (perKategori[r.kategori] ?? 0) + 1;
const sorterat = Object.entries(perKategori).sort((a, b) => b[1] - a[1]);
console.log("mentorväglösa per kategori (störst först):");
for (const [kat, n] of sorterat) console.log(`  ${kat}: ${n}`);
console.log("\nde sex spår5-nya kursernas läge:");
for (const slug of ["ma-08-bostadsmarknadens-mekanik", "kt-06-guidningen", "kt-07-den-tillverkade-katalysatorn", "se-19-forsakringssektorn", "mk-12-demografins-klocka", "ib-05-kostnadstrappan"]) {
  console.log(`  ${slug}: ${nådda.has(slug) ? "NÅDD" : "mentorväglös"}`);
}

// ── Kandidatfrågor genom LEVANDE kedja ──────────────────────────────────────
const KANDIDATER = [
  // se-19 försäkringssektorn
  "hur analyserar jag ett försäkringsbolag?",
  "vad är combined ratio?",
  "vad är float inom försäkring?",
  "vad är en försäkringssektor?",
  "hur fungerar försäkringsbolag?",
  "vad är skadekvot?",
  // kt-06 guidningen
  "vad är guidning?",
  "vad är guidningen?",
  "vad är en prognos från bolaget?",
  "hur läser jag bolagets egen prognos?",
  // kt-07 den tillverkade katalysatorn
  "vad är en aktivist?",
  "vad är aktivism?",
  "vad är en tillverkad katalysator?",
  // ma-08 bostadsmarknaden
  "hur fungerar bostadsmarknaden?",
  "vad är bostadsmarknadens mekanik?",
  "vad är lånekraft?",
  "vad är en bostadsbubbla?",
  "hur påverkar bostadsmarknaden börsen?",
  // mk-12 demografin
  "vad är demografi?",
  "vad är demografins klocka?",
  "vad betyder åldrandet för ekonomin?",
  "vad är befolkningspyramiden?",
  // ib-05 kostnadstrappan
  "vad är kostnadstrappan?",
  "vad är en kostnadstrappa?",
  // bokmaster-fribitarna (dokumenterade)
  "vad är the outsiders?",
  "vad är 100 baggers?",
  "vad är dhandho investor?",
  "vad är magic formula?",
  "vad är quantitative value?",
  // se-11 krypto (dokumenterad lucka)
  "hur analyserar jag krypto?",
  "vad är bitcoin?",
];

console.log("\n== KANDIDATFRÅGOR GENOM KEDJAN (NULL = fri mark) ==");
for (const f of KANDIDATER) {
  const r = kedja(f);
  console.log(`  ${r ? `[${String(r.motor).padStart(2)} ${r.namn}]` : "NULL          "} ${f}`);
}
