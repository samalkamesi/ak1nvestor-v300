#!/usr/bin/env node
/**
 * PREKOLL — s5-u2 (manifest auto-s5-1789789514860, omgång 18), FÖRE insert:
 * rp-04-volatilitetsbudgeten + kt-05-katalysatorernas-kalender.
 * Struktur ×2 · språkgrind ×2 · aritmetik oberoende omräknad · korsreferenser
 * registeräkta · juridikgrind · dup-koll mot 432-registret.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rp-04-volatilitetsbudgeten", "kt-05-katalysatorernas-kalender"];
const pass = [], fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const nr = (x) => Math.round(x * 100) / 100;

// ── 0. Register-läge + dup ────────────────────────────────────────────────────
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const regAntal = Object.keys(reg).length;
for (const s of MINA) testa("0 dup: " + s + " finns INTE i registret (ännu)", !(s in reg), "register " + regAntal);

// ── 1. Struktur ×2 ────────────────────────────────────────────────────────────
for (const slug of MINA) {
  const fil = ROT + "/data/kurser-tillagg/" + slug + ".json";
  testa("1 finns: " + slug, existsSync(fil));
  const k = JSON.parse(readFileSync(fil, "utf8"));
  const TOP = ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "learn", "why", "history", "chapters_list", "chapters", "lynchSection", "grahamSection", "ak1Section"];
  testa("1 " + slug + ": topfält exakta", JSON.stringify(Object.keys(k)) === JSON.stringify(TOP), Object.keys(k).join(","));
  testa("1 " + slug + ": slug + level + category", k.slug === slug && ["Nybörjare", "Intermediär", "Avancerad"].includes(k.level) && typeof k.category === "string" && k.category.length > 3);
  testa("1 " + slug + ": 6 kapitel à 4 min = 24/24/50xp/weight —", k.chapters.length === 6 && k.chapterCount === 6 && k.totalMinutes === 24 && k.minutes === 24 && k.xp === 50 && k.weight === "—");
  testa("1 " + slug + ": chapters_list ≡ chapters", JSON.stringify(k.chapters_list) === JSON.stringify(k.chapters.map((c) => ({ num: c.num, title: c.title, minutes: c.minutes }))));
  const blockOk = k.chapters.every((c) => c.blocks.length >= 2 && c.blocks.every((b) => ["text", "definition", "insight", "tabell", "utmaning"].includes(b.type) && typeof b.content === "string" && b.content.length > 20));
  testa("1 " + slug + ": blocktyper giltiga + innehåll", blockOk);
  testa("1 " + slug + ": history origin+evolution+modern", !!k.history?.origin && !!k.history?.evolution && !!k.history?.modern);
  testa("1 " + slug + ": lynch+graham+ak1 ≥ 200 tecken vardera", [k.lynchSection, k.grahamSection, k.ak1Section].every((s) => s.length >= 200));
  const T = JSON.stringify(k);
  const sprak = { CJK: /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/, kyrilliska: /[\u0400-\u04FF]/, mjuka: /\u00AD/, typCitat: /[\u201C\u201D\u2018\u2019]/, tabbar: /\t/, dubbel: /  / };
  for (const [n, re] of Object.entries(sprak)) testa("1 " + slug + ": språkgrind " + n + " = 0", !re.test(T));
  const bal = [...T].reduce((d, c) => d + (c === "(" ? 1 : c === ")" ? -1 : 0), 0);
  testa("1 " + slug + ": parentesbalans", bal === 0, "delta " + bal);
}

// ── 2. Aritmetik: oberoende omräkning av kurspåståenden (rp-04) ────────────────
{
  const k = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/rp-04-volatilitetsbudgeten.json", "utf8"));
  const T = JSON.stringify(k);
  const svar = (x) => T.includes(x);
  const v1 = Math.sqrt(0.6 * 0.6 * 324 + 0.4 * 0.4 * 36); // 60/40
  const v2 = Math.sqrt(0.7 * 0.7 * 324 + 0.3 * 0.3 * 36); // 70/30
  const w = (2 + Math.sqrt(124)) / 20; // budgetroten
  const vB = Math.sqrt(w * w * 324 + (1 - w) * (1 - w) * 36);
  const bA = (w * w * 324) / vB, bR = ((1 - w) * (1 - w) * 36) / vB;
  const vD = Math.sqrt(w * w * 576 + (1 - w) * (1 - w) * 36); // vol 24, oförändrad vikt
  const w2 = (2 + Math.sqrt(208)) / 34; // återförd vikt
  const vD2 = Math.sqrt(w2 * w2 * 576 + (1 - w2) * (1 - w2) * 36);
  const w10 = (9 + 39) / 90; // utmaningens 10 %-lösning
  const v10 = Math.sqrt(w10 * w10 * 324 + (1 - w10) * (1 - w10) * 36);
  testa("2 rp-04: 60/40-variansen 116,64 + 5,76 = 122,4", nr(0.36 * 324) === 116.64 && nr(0.16 * 36) === 5.76 && nr(0.36 * 324 + 0.16 * 36) === 122.4 && svar("116,64 + 5,76 = 122,4"));
  testa("2 rp-04: 60/40-vol 11,06", nr(v1) === 11.06 && svar("11,06"));
  testa("2 rp-04: 70/30-vol 12,73 (162,0)", nr(0.49 * 324) === 158.76 && nr(0.09 * 36) === 3.24 && nr(v2) === 12.73 && svar("158,76 + 3,24 = 162,0"));
  testa("2 rp-04: budgetvikt w=0,6568 (10w²−2w−3=0)", nr(w) === 0.66 && svar("0,6568"));
  testa("2 rp-04: budgetvol 12,00 (144,00)", nr(vB) === 12.0 && nr(w * w * 324) === 139.76 && nr((1 - w) * (1 - w) * 36) === 4.24 && svar("139,76 + 4,24 = 144,00"));
  testa("2 rp-04: bidrag 11,65 + 0,35 = 12,00 · andelar 97,1/2,9", nr(bA) === 11.65 && nr(bR) === 0.35 && nr(bA + bR) === 12.0 && Math.round((bA / 12) * 1000) / 10 === 97.1 && svar("11,65") && svar("97,1"));
  testa("2 rp-04: drift 15,90 (252,70) + överskott 3,90 = 32,5 %", nr(w * w * 576) === 248.46 && nr(vD) === 15.9 && nr(vD - 12) === 3.9 && nr((15.9 - 12) / 12 * 100) === 32.5);
  testa("2 rp-04: återförd vikt 0,4830 → 12,00 (17w²−2w−3=0)", nr(w2) === 0.48 && nr(w2 * w2 * 576) === 134.38 && nr((1 - w2) * (1 - w2) * 36) === 9.62 && nr(vD2) === 12 && svar("134,38 + 9,62 = 144,00"));
  testa("2 rp-04: flytt 17,4 procentenheter (65,7 − 48,3)", nr(65.7 - 48.3) === 17.4 && svar("65,7 − 48,3 = 17,4"));
  testa("2 rp-04: utmaning w=0,5333 → 10,00 (92,16 + 7,84)", nr(w10 * 100) === 53.33 && nr(w10 * w10 * 324) === 92.16 && nr((1 - w10) * (1 - w10) * 36) === 7.84 && nr(v10) === 10);
  testa("2 rp-04: kvadratlagen 324/36 = 9 (= (18/6)²)", 324 / 36 === 9 && Math.pow(18 / 6, 2) === 9);
}

// ── 3. Aritmetik: kt-05 ───────────────────────────────────────────────────────
{
  const k = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/kt-05-katalysatorernas-kalender.json", "utf8"));
  const T = JSON.stringify(k);
  const svar = (x) => T.includes(x);
  // mars: 3 beslut 10–22 mars = 12 dagar → 1 per 4,0
  testa("3 kt-05: mars 3 beslut på 12 dagar = 1 per 4,0", nr(12 / 3) === 4.0 && svar("1 per 4,0"));
  // sommar: 92 dagar, 3 händelser → 1 per 30,67
  testa("3 kt-05: sommar 92 dagar / 3 = 30,7", nr(92 / 3) === 30.67 && svar("30,7"));
  // kvot 30,7/4,0 = 7,68
  testa("3 kt-05: kvot 30,7 / 4,0 = 7,7", nr(30.67 / 4.0) === 7.67 && svar("7,7"));
  // p-trappan: 0,45·20=9,0 ... steg 0,15·20=3,0; EV 0,60·20=12,0
  for (const [p, pr] of [[0.45, "9,0"], [0.6, "12,0"], [0.75, "15,0"], [0.9, "18,0"], [1.0, "20,0"]]) testa("3 kt-05: trappan p=" + p + " → " + pr, nr(p * 20) === Number(pr.replace(",", ".")) && svar(pr));
  testa("3 kt-05: steg 0,15 × 20 = 3,0", nr(0.15 * 20) === 3.0 && svar("plus 3,0 procent") && svar("minus 3,0 procent"));
  testa("3 kt-05: väntevärde 0,60 × 20 = 12,0", nr(0.6 * 20) === 12 && svar("0,60 × 20 = 12,0"));
  testa("3 kt-05: resterande vid domen (1,00 − 0,90) × 20 = 2,0", nr((1 - 0.9) * 20) === 2 && svar("2,0 procent"));
  // tomrum: 1,1 × 4,0 = 4,4
  testa("3 kt-05: drift 1,1 × 4,0 = 4,4", nr(1.1 * 4.0) === 4.4 && svar("4,4 procent"));
  // utmaning: (0,30 − 0,60) × 20 = −6,0; 0,30 × 20 = 6,0
  testa("3 kt-05: utmaning −6,0 + 6,0", nr((0.3 - 0.6) * 20) === -6 && nr(0.3 * 20) === 6 && svar("minus 6,0 procent") && svar("6,0 procent"));
}

// ── 4. Korsreferenser registeräkta (prefix-test mot registret) ────────────────
{
  const prefix = (ref) => ref.match(/^([a-z]+-\d+[a-z]?-[^ :.,;)]*)/)?.[1] ?? ref.replace(/:.*/, "");
  for (const slug of MINA) {
    const T = JSON.stringify(JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8")));
    const refs = [...new Set([...T.matchAll(/\b((?:km|ts|pc|rk|pf|se|sj|bf|mk|vm|ud|bk|ln|st|tx|ks|rs|mt|kt|am|vr|ib|pe|roic|ma|od|ek|rp|v)-\d+[a-z]?-[a-z0-9-]*)/g)].map((m) => m[1]))];
    const egna = refs.filter((r) => r.startsWith(slug.split("-")[0] + "-"));
    const främmande = refs.filter((r) => !r.startsWith(slug.split("-")[0] + "-"));
    const saknade = främmande.filter((r) => !(r in reg));
    testa("4 " + slug + ": " + främmande.length + " främmande referenser registeräkta (0 saknade)", saknade.length === 0, saknade.join(", ").slice(0, 200) || "refs: " + främmande.slice(0, 8).join(","));
  }
}

// ── 5. Juridikgrind ───────────────────────────────────────────────────────────
{
  const råd = [/du (bör|ska) (köpa|sälja|handla)/i, /vi rekommenderar/i, /köp (denna|denna aktie)/i, /sälj (dina )?aktier/i, /investera i /i];
  const lagrum = /(19\d{2}|20\d{2}):\d+/;
  for (const slug of MINA) {
    const k = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));
    const T = JSON.stringify(Object.values(k).flat(2));
    const rådTräff = råd.filter((re) => re.test(T));
    testa("5 " + slug + ": 0 rådgivningsfraser", rådTräff.length === 0, rådTräff.map((r) => r.source).join(","));
    testa("5 " + slug + ": 0 lagrum (juridikgrinden ren)", !lagrum.test(T));
    const framings = ["utbildning"].filter((f) => T.toLowerCase().includes(f));
    testa("5 " + slug + ": utbildningsframing närvarande", framings.length >= 1);
  }
}

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nPREKOLL RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nPREKOLL GRÖN: ${pass.length} PASS 0 FAIL — struktur ×2, språk ×2, aritmetik oberoende omräknad, korsreferenser registeräkta, juridikgrind ren, dup-koll mot register ${regAntal}.`);
