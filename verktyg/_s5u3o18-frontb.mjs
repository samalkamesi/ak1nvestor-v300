#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789789514860, omgång 18) — FRONT B: läsreplik av
 * larvag.ts kategori-fortsättningsregel mot den GENERERADE kartan
 * (src/lib/larvag-karta.ts). Verifierar att de tre nya kurserna nomineras
 * rätt: 90p = BAS 86 + nivåmatch 4, korrekt varför-rad-textform, D1 (ny
 * kurs stjäl ingen nominering från delvis-läsare), V-spårsskydd (vIndex −1)
 * och determinism (två körningar bitidentiska).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const kartaKalla = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const kurstips = readFileSync(ROT + "/src/lib/kurstips.ts", "utf8");

// ── Kartposter ur genererad fil ──────────────────────────────────────────────
const poster = [...kartaKalla.matchAll(/\{\s*slug: "([^"]+)",\s*titel: "((?:[^"\\]|\\.)*)",\s*kategori: "([^"]+)",\s*niva: (-?\d+),\s*kraverFas: (\d+),\s*vIndex: (-?\d+),\s*minuter: (\d+),?\s*\}/g)].map((m) => ({
  slug: m[1], titel: m[2].replace(/\\"/g, '"'), kategori: m[3], niva: Number(m[4]), kraverFas: Number(m[5]), vIndex: Number(m[6]), minuter: Number(m[7]),
}));
const INDEX = new Map(poster.map((p, i) => [p.slug, i]));

// ── kurstips-konstanter ur källkod (paritet med runtime) ────────────────────
const grundlagt = Number((kurstips.match(/GRUNDLAGT_ANTAL\s*=\s*(\d+)/) || [])[1] ?? 8);
const lagXp = Number((kurstips.match(/LAG_XP_GRANS\s*=\s*(\d+)/) || [])[1] ?? 400);
const vsparSlugs = [...kurstips.slice(kurstips.indexOf("export const V_SPÅR"), kurstips.indexOf("];", kurstips.indexOf("export const V_SPÅR"))).matchAll(/slug:\s*"(v\d{2}-[^"]+)"/g)].map((m) => m[1]);

let PASS = 0, FEL = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };

// ── Läsreplik av raknaLarvag (regler 1,3,4,5,6,8 — 2 svagheten och 7 streak
//    vilar i testscenarierna: svagheter tomma, streak 0) ──────────────────────
function lasReplik(klaraKurser, lasTillstand, xp) {
  const klaraSet = new Set(klaraKurser);
  const malniva = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-redo": 3 }[lasTillstand] ?? 1;
  const kan = (slug) => { const k = poster[INDEX.get(slug)]; return k && !klaraSet.has(slug) && k.kraverFas <= 1 ? k : undefined; };
  const poang = (bas, k) => bas + (k.niva > 0 && k.niva === malniva ? 4 : 0) + (k.vIndex >= 0 ? 2 : 0);
  const kandidater = [], nominerade = new Set();
  const lamna = (slug, bas, regel) => { const k = kan(slug); if (!k || nominerade.has(slug)) return; nominerade.add(slug); kandidater.push({ slug, poang: poang(bas, k), regel }); };

  // 1 spar-nasta
  const nast = vsparSlugs.map((s) => poster[INDEX.get(s)]).find((k) => kan(k.slug));
  if (nast) lamna(nast.slug, 100, "spar-nasta");
  // 3 kategori-fortsattning
  const raknare = new Map();
  for (const s of klaraKurser) { const k = poster[INDEX.get(s)]; if (k) raknare.set(k.kategori, (raknare.get(k.kategori) ?? 0) + 1); }
  let paborjad = null, paborjadAntal = 0;
  for (const [kat, antal] of raknare) if (antal > paborjadAntal) { paborjad = kat; paborjadAntal = antal; }
  if (paborjad) { const f = poster.filter((k) => k.kategori === paborjad && kan(k.slug) && !nominerade.has(k.slug))[0]; if (f) lamna(f.slug, 86, "kategori-fortsattning"); }
  // 4 kategori-balans (V-spåret)
  const perKat = new Map();
  for (const s of vsparSlugs) if (klaraSet.has(s)) { const k = poster[INDEX.get(s)]; perKat.set(k.kategori, (perKat.get(k.kategori) ?? 0) + 1); }
  const balKand = vsparSlugs.map((s) => poster[INDEX.get(s)]).filter((k) => kan(k.slug) && !nominerade.has(k.slug))
    .sort((a, b) => (perKat.get(a.kategori) ?? 0) - (perKat.get(b.kategori) ?? 0) || vsparSlugs.indexOf(a.slug) - vsparSlugs.indexOf(b.slug))[0];
  if (balKand) lamna(balKand.slug, 82, "kategori-balans");
  // 5 bokmaster hoppas över i repliken (FLAGGSKEPP varför-funktioner — poäng 70
  //   kan aldrig slå 90; närvaro noteras i worklog), 6 niva-steg
  if (klaraSet.size >= 1) { const n = poster.filter((k) => k.niva > 0 && k.niva === malniva && kan(k.slug) && !nominerade.has(k.slug))[0]; if (n) lamna(n.slug, 62, "niva-steg"); }
  // 8 kortast (låg XP)
  if (xp < lagXp) { const k2 = vsparSlugs.map((s) => poster[INDEX.get(s)]).filter((k) => kan(k.slug) && !nominerade.has(k.slug)).sort((a, b) => a.minuter - b.minuter)[0]; if (k2) lamna(k2.slug, 56, "kortast-kurs"); }

  return kandidater.sort((a, b) => b.poang - a.poang || (INDEX.get(a.slug) ?? 0) - (INDEX.get(b.slug) ?? 0)).slice(0, 3);
}

// ── Scenarier ────────────────────────────────────────────────────────────────
const MINA = [
  { slug: "bk-06-obeskattade-reserver-och-avsattningar", kat: "BOKFÖRING & ÅRSREDOVISNING", nivaVant: 2, malas: "växande",
    steg: poster.filter((p) => p.kategori === "BOKFÖRING & ÅRSREDOVISNING" && p.slug !== "bk-06-obeskattade-reserver-och-avsattningar").map((p) => p.slug) },
  { slug: "sj-06-arv-gava-och-ingaende-varde", kat: "SKATT & JURIDIK", nivaVant: 2, malas: "växande",
    steg: poster.filter((p) => p.kategori === "SKATT & JURIDIK" && p.slug !== "sj-06-arv-gava-och-ingaende-varde").map((p) => p.slug) },
  { slug: "pf-15-faktorpremierna", kat: "PORTFÖLJHANTERING", nivaVant: 3, malas: "avancerad",
    steg: poster.filter((p) => p.kategori === "PORTFÖLJHANTERING" && p.slug !== "pf-15-faktorpremierna").map((p) => p.slug) },
];

console.log("═══ Kartläge: " + poster.length + " poster (syskonlandningar syns som antal)");
for (const m of MINA) {
  console.log("═══ " + m.slug);
  const p = poster[INDEX.get(m.slug)];
  ok(p !== undefined, "kartpost finns");
  if (!p) continue;
  ok(p.kategori === m.kat, "kategori exakt", p.kategori);
  ok(p.niva === m.nivaVant, "niva-tolkning " + m.nivaVant, String(p.niva));
  ok(p.vIndex === -1, "vIndex −1 (V-spårsskydd — aldrig +2)");
  const rek = lasReplik(m.steg, m.malas, 100000);
  const min = rek.find((r) => r.slug === m.slug);
  ok(min !== undefined, "nominerad i top-3", JSON.stringify(rek.map((r) => r.slug + " " + r.poang)));
  if (min) ok(min.poang === 90 && min.regel === "kategori-fortsattning", "90p nivåmatch via kategori-fortsättning", min.poang + "p " + min.regel);
  const steg = m.steg.length;
  ok(steg >= 5, "stegbakgrund [" + steg + " steg bakom sig i kategorin]");
}

// D1 — delvis-läsare: enbart km-001 klarad → kategori-fortsättning = km-002 (lägst index), ALDRIG mina kurser
console.log("═══ D1 delvis-läsare");
const d1 = lasReplik(["km-001-bokforingens-grunder"], "växande", 100000);
const d1forts = d1.find((r) => r.regel === "kategori-fortsattning");
ok(d1forts && d1forts.slug === "km-002-forvaltningsberattelsen", "fortsättning = km-002 (lägst kartindex i kategorin)", JSON.stringify(d1.map((r) => r.slug)));
ok(!d1.some((r) => MINA.some((m) => r.slug === m.slug)), "nya kurser stjäl ingen plats");

// Determinism
const a = JSON.stringify(lasReplik(MINA[0].steg, "växande", 100000));
const b = JSON.stringify(lasReplik(MINA[0].steg, "växande", 100000));
ok(a === b, "determinism bitidentisk");

// Syskonlandningar i kartan (notis-villkor, inte fel)
for (const s of ["se-17-skogssektorn", "kt-05-katalysatorernas-kalender", "rp-04-volatilitetsbudgeten"]) {
  ok(INDEX.has(s), "syskonkurs i kartan " + s);
}

console.log("────");
console.log(`FRONT B: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
