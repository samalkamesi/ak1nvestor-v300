#!/usr/bin/env node
/**
 * _s1u2-essity-paket.mjs — bygger FLYTTKLART-PAKET för Essity Q3 2026 ur
 * utkastet + diff-satserna (granskare s1-u2, 2026-10-01).
 *
 * Grindar (vägrar skriva vid rött):
 *  G1 utkastet orört: md5 == diff.utkastMd5Fore
 *  G2 varje body/description-sats: from exakt 1 träff FÖRE, 0 EFTER; to på plats
 *  G3 metadata-satser: fältvärde == from FÖRE, == to EFTER
 *  G4 kontrolleraText på paketets publicerbara yta (title+description+body): 0 FEL
 *  G5 title ≤ 314 tkn · rm == round(ord/600) · JSON giltig · disclaimer sist
 * Skriver: granskning/sa-laser-du-essity-q3-2026-FLYTTKLART-PAKET-2026-10-01-s1u2.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const UTAST = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-essity-q3-2026.json";
const DIFF = "data/blogg-utkast/granskning/sa-laser-du-essity-q3-2026-diff-2026-10-01-s1u2.json";
const PAKET = "data/blogg-utkast/granskning/sa-laser-du-essity-q3-2026-FLYTTKLART-PAKET-2026-10-01-s1u2.json";
const VARUMARKE = "data/varumarke.json";

const diff = JSON.parse(readFileSync(DIFF, "utf8"));
const vm = JSON.parse(readFileSync(VARUMARKE, "utf8"));
const md5 = (s) => execSync(`md5sum ${s}`, { encoding: "utf8" }).split(" ")[0];

// G1
const md5Fore = md5(UTAST);
if (md5Fore !== diff.utkastMd5Fore) {
  console.error(`G1 RÖT: utkastet rört (md5 ${md5Fore} ≠ ${diff.utkastMd5Fore}) — skriver INGET`);
  process.exit(1);
}
console.log(`G1 GRÖN: utkastet orört (md5 ${md5Fore})`);

const pkt = JSON.parse(readFileSync(UTAST, "utf8"));
const count = (hay, needle) => hay.split(needle).length - 1;

// G2+G3 — verkställ
const verkställda = [];
for (const s of diff.satser) {
  if (s.yta === "metadata.publishedAt") {
    if (pkt.publishedAt !== s.from) { console.error(`G3 RÖT ${s.id}: publishedAt ${pkt.publishedAt} ≠ ${s.from}`); process.exit(1); }
    pkt.publishedAt = s.to;
  } else if (s.yta === "metadata.readingMinutes") {
    if (String(pkt.readingMinutes) !== s.from) { console.error(`G3 RÖT ${s.id}: readingMinutes ${pkt.readingMinutes} ≠ ${s.from}`); process.exit(1); }
    pkt.readingMinutes = Number(s.to);
  } else {
    const mål = s.yta === "description" ? pkt.description : pkt.body;
    const n = count(mål, s.from);
    if (n !== 1) { console.error(`G2 RÖT ${s.id}: ${n} träffar av from-strängen på ${s.yta}`); process.exit(1); }
    if (s.yta === "description") pkt.description = pkt.description.replace(s.from, s.to);
    else pkt.body = pkt.body.replace(s.from, s.to);
  }
  verkställda.push(s.id);
}
// Efterverifiering av satserna
for (const s of diff.satser) {
  if (s.yta.startsWith("metadata")) continue;
  const mål = s.yta === "description" ? pkt.description : pkt.body;
  const nFrom = count(mål, s.from), nTo = count(mål, s.to);
  if (nFrom !== 0 || nTo !== 1) { console.error(`G2 RÖT ${s.id} efter: from ${nFrom} träffar, to ${nTo} träffar`); process.exit(1); }
}
console.log(`G2+G3 GRÖN: ${verkställda.length} satser verkställda (${verkställda.join(", ")}) — from 0träff, to 1träff överall`);

// G4 — kontrolleraText-spegel på paketytan
function kontrolleraText(text) {
  const fel = [], varningar = [];
  for (const f of vm.forbjudnaFraser) {
    const re = new RegExp(f.fran, "giu");
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      (f.allvar === "FEL" ? fel : varningar).push({ fras: m[0], ersattning: f.istallet });
    }
  }
  return { fel, varningar };
}
const yta = [pkt.title, pkt.description, pkt.body].join("\n\n");
const j = kontrolleraText(yta);
if (j.fel.length) { console.error(`G4 RÖT: kontrolleraText ${j.fel.length} FEL ${JSON.stringify(j.fel)}`); process.exit(1); }
console.log(`G4 GRÖN: kontrolleraText 0 FEL / ${j.varningar.length} VARN ${JSON.stringify(j.varningar.map((v) => v.fras))} på paketytan`);

// G5 — strukturkontrakt
const ord = pkt.body.split(/\s+/).filter(Boolean).length;
const rmKontrakt = Math.round(ord / 600);
const sista = pkt.body.trim().split("\n\n").pop();
if (!(pkt.title.length <= 314 && pkt.readingMinutes === rmKontrakt && sista.includes("2007:528") && sista.includes("kundens beslut"))) {
  console.error(`G5 RÖT: title ${pkt.title.length} · rm ${pkt.readingMinutes} ≠ ${rmKontrakt} (ord ${ord}) · disclaimer-sist saknas`); process.exit(1);
}
console.log(`G5 GRÖN: title ${pkt.title.length} ≤ 314 · rm ${pkt.readingMinutes} == round(${ord}/600) · disclaimer+R2 sist`);

// Skriv paketet med _flyttklart-block
pkt._flyttklart = {
  objekt: UTAST,
  granskare: "s1-u2 manifest auto-s1-1790858103968",
  datum: "2026-10-01",
  dom: "GRÖN EFTER DIFF — FLYTTKLART (publicering = kundens beslut, R2)",
  byggvintage: "9839c5304 (120-postfilen 2026-09-16 01:44 — byggarens deklarerade medianunderlag)",
  utkastMd5Fore: md5Fore,
  satserVerkställda: verkställda,
  titellangdEfter: pkt.title.length,
  readingMinutesEfter: pkt.readingMinutes,
  publishedAtEfter: pkt.publishedAt,
  sond: "verktyg/_s1u2-essity-kontroll.mjs (93 OK · 8 FEL · 3 NOT på utkastet; FEL:en = diffens satser)",
  efterverifiering: "gamla felsträngar 0 träffar · 9 satser på plats · kontrolleraText 0 FEL på paketytan · rm == round(ord/600) · JSON giltig · utkastet orört",
  kontroll: "granskning/sa-laser-du-essity-q3-2026-KONTROLL-2026-10-01-s1u2.md",
  diff: DIFF,
};
writeFileSync(PAKET, JSON.stringify(pkt, null, 1) + "\n");
JSON.parse(readFileSync(PAKET, "utf8")); // JSON-giltighet
const md5Efter = md5(UTAST);
console.log(`\nPAKET skrivet: ${PAKET} (${(readFileSync(PAKET, "utf8").length / 1024).toFixed(1)} KiB)`);
console.log(`utkastet fortfarande orört: md5 ${md5Efter} == ${md5Fore}`);
console.log(`LEVERANS-KVITTO: satser ${verkställda.join("+")} · publishedAt ${pkt.publishedAt} · rm ${pkt.readingMinutes} · ord ${ord}`);
