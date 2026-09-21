#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789989925484, omgång 26, byggare 3/3) — FRONT B:
 * läsreplik av larvag.ts nomineringsregler mot den GENERERADE kartan
 * (src/lib/larvag-karta.ts). Verifierar att bf-18/od-10/kt-10 nomineras rätt:
 * 90p = BAS 86 + nivåmatch 4 via kategori-fortsättning, korrekt regel,
 * D1 (ny kurs stjäl ingen nominering från delvis-läsare), vIndex −1,
 * kraverFas 0 (R2) och determinism. Syskonvakt: se-24/st-07/pe-08 i kartan.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const kartaKalla = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const kurstips = readFileSync(ROT + "/src/lib/kurstips.ts", "utf8");
const regAntal = Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

const poster = [...kartaKalla.matchAll(/\{\s*slug: "([^"]+)",\s*titel: "((?:[^"\\]|\\.)*)",\s*kategori: "([^"]+)",\s*niva: (-?\d+),\s*kraverFas: (\d+),\s*vIndex: (-?\d+),\s*minuter: (\d+),?\s*\}/g)].map((m) => ({
  slug: m[1], titel: m[2].replace(/\\"/g, '"'), kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]),
}));
const INDEX = new Map(poster.map((p, i) => [p.slug, i]));

const lagXp = Number((kurstips.match(/LAG_XP_GRANS\s*=\s*(\d+)/) || [])[1] ?? 400);
const vsparSlugs = [...kurstips.slice(kurstips.indexOf("export const V_SPÅR"), kurstips.indexOf("];", kurstips.indexOf("export const V_SPÅR"))).matchAll(/slug:\s*"(v\d{2}-[^"]+)"/g)].map((m) => m[1]);

let PASS = 0, FEL = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };

function lasReplik(klaraKurser, lasTillstand, xp) {
  const klaraSet = new Set(klaraKurser);
  const malniva = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-reda": 3 }[lasTillstand] ?? 1;
  const kan = (slug) => { const k = poster[INDEX.get(slug)]; return k && !klaraSet.has(slug) && k.kraverFas <= 1 ? k : undefined; };
  const poang = (bas, k) => bas + (k.niva > 0 && k.niva === malniva ? 4 : 0) + (k.vIndex >= 0 ? 2 : 0);
  const kandidater = [], nominerade = new Set();
  const lamna = (slug, bas, regel) => { const k = kan(slug); if (!k || nominerade.has(slug)) return; nominerade.add(slug); kandidater.push({ slug, poang: poang(bas, k), regel }); };

  const nast = vsparSlugs.map((s) => poster[INDEX.get(s)]).find((k) => kan(k.slug));
  if (nast) lamna(nast.slug, 100, "spar-nasta");
  const raknare = new Map();
  for (const s of klaraKurser) { const k = poster[INDEX.get(s)]; if (k) raknare.set(k.kategori, (raknare.get(k.kategori) ?? 0) + 1); }
  let paborjad = null, paborjadAntal = 0;
  for (const [kat, antal] of raknare) if (antal > paborjadAntal) { paborjad = kat; paborjadAntal = antal; }
  if (paborjad) { const f = poster.filter((k) => k.kategori === paborjad && kan(k.slug) && !nominerade.has(k.slug))[0]; if (f) lamna(f.slug, 86, "kategori-fortsattning"); }
  const perKat = new Map();
  for (const s of vsparSlugs) if (klaraSet.has(s)) { const k = poster[INDEX.get(s)]; perKat.set(k.kategori, (perKat.get(k.kategori) ?? 0) + 1); }
  const balKand = vsparSlugs.map((s) => poster[INDEX.get(s)]).filter((k) => kan(k.slug) && !nominerade.has(k.slug))
    .sort((a, b) => (perKat.get(a.kategori) ?? 0) - (perKat.get(b.kategori) ?? 0) || vsparSlugs.indexOf(a.slug) - vsparSlugs.indexOf(b.slug))[0];
  if (balKand) lamna(balKand.slug, 82, "kategori-balans");
  if (klaraSet.size >= 1) { const n = poster.filter((k) => k.niva > 0 && k.niva === malniva && kan(k.slug) && !nominerade.has(k.slug))[0]; if (n) lamna(n.slug, 62, "niva-steg"); }
  if (xp < lagXp) { const k2 = vsparSlugs.map((s) => poster[INDEX.get(s)]).filter((k) => kan(k.slug) && !nominerade.has(k.slug)).sort((a, b) => a.minuter - b.minuter)[0]; if (k2) lamna(k2.slug, 56, "kortast-kurs"); }

  return kandidater.sort((a, b) => b.poang - a.poang || (INDEX.get(a.slug) ?? 0) - (INDEX.get(b.slug) ?? 0)).slice(0, 3);
}

console.log("═══ Kartläge: " + poster.length + " poster (register " + regAntal + ")");
ok(poster.length === regAntal, "kartan bär " + regAntal + " poster (register-paritet)", String(poster.length));

const MINA = [
  { slug: "bf-18-kompetensillusionen", kat: "BETEENDEFINANS", nivaVant: 2, malas: "växande" },
  { slug: "od-10-kreditderivatet", kat: "OPTIONS & DERIVAT", nivaVant: 3, malas: "avancerad" },
  { slug: "kt-10-avknoppningen", kat: "KATALYSATOR", nivaVant: 2, malas: "växande" },
];

for (const m of MINA) {
  console.log("═══ " + m.slug);
  const p = poster[INDEX.get(m.slug)];
  ok(p !== undefined, "kartpost finns");
  if (p) {
    ok(p.kategori === m.kat, "kategori exakt", p.kategori);
    ok(p.niva === m.nivaVant, "niva-tolkning " + m.nivaVant, String(p.niva));
    ok(p.vIndex === -1, "vIndex −1 (V-spårsskydd — aldrig +2)");
    ok(p.kraverFas === 0, "kraverFas 0 (R2 — ingen tiervägg)");
  }
  const steg = poster.filter((x) => x.kategori === m.kat && x.slug !== m.slug).map((x) => x.slug);
  const rek = lasReplik(steg, m.malas, 100000);
  const min = rek.find((r) => r.slug === m.slug);
  ok(min !== undefined, "nominerad i top-3", JSON.stringify(rek.map((r) => r.slug + " " + r.poang)));
  if (min) ok(min.poang === 90 && min.regel === "kategori-fortsattning", "90p nivåmatch via kategori-fortsättning", min.poang + "p " + min.regel);
  ok(steg.length >= 5, "stegbakgrund [" + steg.length + " steg bakom sig i kategorin]");
  const rnyb = lasReplik(steg, m.malas === "växande" ? "nybörjare" : "växande", 100000).find((r) => r.slug === m.slug);
  ok(rnyb && rnyb.poang === 86, "omvänd riktning: 86p utan nivåmatch", rnyb ? String(rnyb.poang) : "ej nominerad");
  const a = JSON.stringify(lasReplik(steg, m.malas, 100000));
  const b = JSON.stringify(lasReplik(steg, m.malas, 100000));
  ok(a === b, "determinism bitidentisk");
  // why-paritet: registerpostens why ≡ kursfilens why
  const regPost = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))[m.slug];
  const kursFil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + m.slug + ".json", "utf8"));
  ok(regPost && regPost.why === kursFil.why, "why-rad register ≡ kursfil");
}

// D1 — delvis-läsare: enbart km-001 klarad → kategori-fortsättning = km-002, ALDRIG mina kurser
console.log("═══ D1 delvis-läsare");
const d1 = lasReplik(["km-001-bokforingens-grunder"], "växande", 100000);
const d1forts = d1.find((r) => r.regel === "kategori-fortsattning");
ok(d1forts && d1forts.slug === "km-002-forvaltningsberattelsen", "fortsättning = km-002 (lägst kartindex i kategorin)", JSON.stringify(d1.map((r) => r.slug)));
ok(!d1.some((r) => MINA.some((m) => r.slug === m.slug)), "mina kurser stjäl ingen plats");

// Serieordning i kartan
console.log("═══ Serieordning i kartan");
ok(poster.findIndex((x) => x.slug === "bf-17-nutidsbias-och-den-hyperboliska-kurvan") < poster.findIndex((x) => x.slug === "bf-18-kompetensillusionen"), "bf-17 < bf-18");
ok(poster.findIndex((x) => x.slug === "od-09-forsakringsskrivandet") < poster.findIndex((x) => x.slug === "od-10-kreditderivatet"), "od-09 < od-10");
ok(poster.findIndex((x) => x.slug === "kt-09-budpremien-och-budprocessen") < poster.findIndex((x) => x.slug === "kt-10-avknoppningen"), "kt-09 < kt-10");

// Syskonkurserna i kartan (omgångens samtliga sex nykomlingar)
console.log("═══ Syskonvakt i kartan");
for (const s of ["se-24-banksektorn", "st-07-skuggskulderna", "pe-08-avgiftsmaskinen"]) {
  const hit = poster.find((x) => x.slug.startsWith(s.split("-").slice(0, 2).join("-") + "-"));
  ok(!!hit, "syskonkurs i kartan: " + (hit ? hit.slug : s));
}

console.log("────");
console.log(`FRONT B o26: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
