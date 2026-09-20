#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789932910773, omgång 24) — FRONT B: läsreplik av
 * larvag.ts kategori-fortsättningsregel mot den GENERERADE kartan
 * (src/lib/larvag-karta.ts). Verifierar att de tre nya kurserna nomineras
 * rätt: 90p = BAS 86 + nivåmatch 4, korrekt regel, D1 (ny kurs stjäl ingen
 * nominering från delvis-läsare), V-spårsskydd (vIndex −1) och determinism.
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
  const malniva = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-redo": 3 }[lasTillstand] ?? 1;
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

const MINA = [
  { slug: "rp-07-vantan-i-svansen", kat: "RISKHANTERING & PORTFÖLJTEORI", nivaVant: 3, malas: "avancerad",
    steg: poster.filter((p) => p.kategori === "RISKHANTERING & PORTFÖLJTEORI" && p.slug !== "rp-07-vantan-i-svansen").map((p) => p.slug) },
  { slug: "ib-07-family-officen", kat: "PRIVATE EQUITY & INVESTMENTBOLAG", nivaVant: 2, malas: "växande",
    steg: poster.filter((p) => p.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG" && p.slug !== "ib-07-family-officen").map((p) => p.slug) },
  { slug: "tx-07-fran-siffra-till-kassa", kat: "TILLVÄXT", nivaVant: 2, malas: "växande",
    steg: poster.filter((p) => p.kategori === "TILLVÄXT" && p.slug !== "tx-07-fran-siffra-till-kassa").map((p) => p.slug) },
];

console.log("═══ Kartläge: " + poster.length + " poster (register " + regAntal + ")");
ok(poster.length === regAntal, "kartan bär " + regAntal + " poster (register-paritet)", String(poster.length));
for (const m of MINA) {
  console.log("═══ " + m.slug);
  const p = poster[INDEX.get(m.slug)];
  ok(p !== undefined, "kartpost finns");
  if (!p) continue;
  ok(p.kategori === m.kat, "kategori exakt", p.kategori);
  ok(p.niva === m.nivaVant, "niva-tolkning " + m.nivaVant, String(p.niva));
  ok(p.vIndex === -1, "vIndex −1 (V-spårsskydd — aldrig +2)");
  ok(p.kraverFas === 0, "kraverFas 0 (R2 — ingen tiervägg)");
  const rek = lasReplik(m.steg, m.malas, 100000);
  const min = rek.find((r) => r.slug === m.slug);
  ok(min !== undefined, "nominerad i top-3", JSON.stringify(rek.map((r) => r.slug + " " + r.poang)));
  if (min) ok(min.poang === 90 && min.regel === "kategori-fortsattning", "90p nivåmatch via kategori-fortsättning", min.poang + "p " + min.regel);
  ok(m.steg.length >= 5, "stegbakgrund [" + m.steg.length + " steg bakom sig i kategorin]");
}

// D1 — delvis-läsare: enbart km-001 klarad → kategori-fortsättning = km-002 (lägst index), ALDRIG mina kurser
console.log("═══ D1 delvis-läsare");
const d1 = lasReplik(["km-001-bokforingens-grunder"], "växande", 100000);
const d1forts = d1.find((r) => r.regel === "kategori-fortsattning");
ok(d1forts && d1forts.slug === "km-002-forvaltningsberattelsen", "fortsättning = km-002 (lägst kartindex i kategorin)", JSON.stringify(d1.map((r) => r.slug)));
ok(!d1.some((r) => MINA.some((m) => r.slug === m.slug)), "nya kurser stjäl ingen plats");

// Omvänd riktning — fel nivå ger 86 (ingen nivåmatch), fortfarande nominerad
console.log("═══ Poäng omvänd riktning");
const rpnyb = lasReplik(MINA[0].steg, "nybörjare", 100000).find((r) => r.slug === MINA[0].slug);
ok(rpnyb && rpnyb.poang === 86, "rp-07 på nybörjarmål: 86p utan nivåmatch", rpnyb ? String(rpnyb.poang) : "ej nominerad");
const ibavancerad = lasReplik(MINA[1].steg, "avancerad", 100000).find((r) => r.slug === MINA[1].slug);
ok(ibavancerad && ibavancerad.poang === 86, "ib-07 på avancerad-mål: 86p utan nivåmatch", ibavancerad ? String(ibavancerad.poang) : "ej nominerad");

// Determinism
const a = JSON.stringify(lasReplik(MINA[2].steg, "växande", 100000));
const b = JSON.stringify(lasReplik(MINA[2].steg, "växande", 100000));
ok(a === b, "determinism bitidentisk");

// Syskonlandningar i kartan (omgångens fulla skörd — notis-villkor)
for (const s of ["sj-07-forlustavdrag-och-kvotering", "ib-06-evighetskapitalet", "tx-06-enhetsekonomin"]) {
  ok(INDEX.has(s), "syskonkurs i kartan " + s);
}

console.log("────");
console.log(`FRONT B: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
