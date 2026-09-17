#!/usr/bin/env node
/**
 * KVD s5-u3 (manifest auto-s5-1789592726665) — 2026-09-16, omgång 8.
 * Kvalitetsverifiering av tre kursleveranser: bf-15, ek-01, ln-05.
 *
 *   1. STRUKTURPARITET ×3: chapters_list ↔ chapters, summa minuter,
 *      chapterCount, xp, level/kategori.
 *   2. REGISTERPARITET ×3: registrets kopia == proveniensfilen (round-trip).
 *   3. ARITMETIK (maskinell): bf-15 multipelresan + asymmetri + NASDAQ +
 *      dubbelnedräkning · ek-01 mikro-SAM + total-SAM + röstbudgetens saldo ·
 *      ln-05 trappan + känslighet + kampanjräkningen + per-styck.
 *   4. KORSREFERENSER: varje xx-nnn-referens prefixmatchar en verklig slug
 *      i registret (0 brutna, 0 fantomer).
 *   5. JURIDIKGRIND: 0 rådsfraser; utbildningsframing närvarande; köp/sälj-
 *      träffar listas med kontext (manuell granskning = maskinutskrift).
 *
 * Pedagogisk plattform — inte investeringsråd (2007:528, 2 kap 5 §).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const register = JSON.parse(readFileSync(path.join(ROT, "public/deep-courses.json"), "utf8"));
const slugs = Object.keys(register);

const MINA = [
  { fil: "bf-15-bubblans-anatomi.json", slug: "bf-15-bubblans-anatomi", kat: "BETEENDEFINANS", level: "Avancerad" },
  { fil: "ek-01-sam-viktningen.json", slug: "ek-01-sam-viktningen", kat: "EKOSYSTEM", level: "Avancerad" },
  { fil: "ln-05-vad-ar-lonsamhet.json", slug: "ln-05-vad-ar-lonsamhet", kat: "LÖNSAMHET", level: "Nybörjare" },
];

let pass = 0;
let fail = 0;
const kontroll = (villkor, text) => {
  if (villkor) { pass += 1; }
  else { fail += 1; console.log(`  FAIL ${text}`); }
};
const approx = (a, b, tol = 0.005) => Math.abs(a - b) <= tol;

// ── 1+2. Struktur- och registerparitet ─────────────────────────────────────
console.log("== Struktur- och registerparitet ==");
for (const m of MINA) {
  const prov = JSON.parse(readFileSync(path.join(ROT, "data/kurser-tillagg", m.fil), "utf8"));
  const reg = register[m.slug];
  kontroll(!!reg, `${m.slug} finns i registret`);
  kontroll(prov.slug === m.slug && prov.category === m.kat, `${m.slug}: slug/kategori korrekt (${m.kat})`);
  kontroll(prov.level === m.level, `${m.slug}: level ${m.level}`);
  kontroll(prov.chapterCount === 6 && prov.chapters.length === 6, `${m.slug}: 6 kapitel`);
  kontroll(prov.chapters.reduce((s, c) => s + c.minutes, 0) === prov.totalMinutes && prov.totalMinutes === 24, `${m.slug}: minuter 6×4 = 24`);
  kontroll(prov.xp === 50, `${m.slug}: XP 50`);
  kontroll(prov.minutes === 24, `${m.slug}: minutes 24`);
  kontroll(
    JSON.stringify(prov.chapters_list) === JSON.stringify(prov.chapters.map(({ num, title, minutes }) => ({ num, title, minutes }))),
    `${m.slug}: chapters_list ↔ chapters paritet`,
  );
  kontroll(prov.chapters_list.every((c) => c.title !== null && typeof c.title === "string" && c.title.length > 3), `${m.slug}: chapters_list bär titlar (akm1-fällan)`);
  kontroll(JSON.stringify(reg) === JSON.stringify(prov), `${m.slug}: registrets kopia == proveniensfilen (round-trip)`);
  kontroll(typeof prov.why === "string" && prov.why.length > 200, `${m.slug}: why-rad (varför-raden) närvarande`);
  kontroll(typeof prov.learn === "string" && prov.learn.includes("·"), `${m.slug}: learn-lista med separatorer`);
  kontroll(prov.history && ["origin", "evolution", "modern"].every((k) => typeof prov.history[k] === "string" && prov.history[k].length > 100), `${m.slug}: history {origin, evolution, modern}`);
  for (const s of ["lynchSection", "grahamSection", "ak1Section"]) {
    kontroll(typeof prov[s] === "string" && prov[s].length > 200, `${m.slug}: ${s} närvarande`);
  }
}

// ── 3. Aritmetik ────────────────────────────────────────────────────────────
console.log("== Aritmetik (maskinell) ==");
// bf-15 — multipelresan (Berättelse AB)
kontroll(10 * 15 === 150, "bf-15: 10 mkr × P/E 15 = 150 mkr");
kontroll(10 * 60 === 600, "bf-15: 10 mkr × P/E 60 = 600 mkr");
kontroll(10 * 12 === 120, "bf-15: 10 mkr × P/E 12 = 120 mkr");
kontroll(approx((600 - 150) / 150, 3.0), "bf-15: 150 → 600 = plus 300 procent");
kontroll(approx((120 - 600) / 600, -0.80), "bf-15: 600 → 120 = minus 80 procent");
// bf-15 — procentens asymmetri
kontroll(approx((100 - 200) / 200, -0.50), "bf-15: +100 % sedan −50 % = återgång");
kontroll(approx((100 - 500) / 500, -0.80), "bf-15: +400 % sedan −80 % = återgång");
kontroll(approx((100 - 300) / 300, -2 / 3), "bf-15: +200 % sedan −67 % = återgång");
// bf-15 — NASDAQ
kontroll(approx((1114 - 5048) / 5048, -0.7793, 0.001), "bf-15: NASDAQ 5 048 → 1 114 = −77,9 %");
kontroll(Math.round(((1114 - 5048) / 5048) * 100) === -78, "bf-15: avrundat minus 78 procent");
// bf-15 — dubbelnedräkningen (vinst −50 %, multiplar −2/3)
kontroll(approx(0.5 * (1 / 3), 1 / 6), "bf-15: 0,5 × 1/3 ≈ 0,17 kvar");
kontroll(Math.round((1 - 0.5 * (1 / 3)) * 100) === 83, "bf-15: fall ≈ 83 procent");
// ek-01 — mikro-SAM
kontroll(approx(0.6 * 30, 18) && approx(0.4 * 25, 10) && approx(-0.2 * 20, -4) && 0 * 15 === 0 && approx(0.1 * 10, 1), "ek-01: fem röster 18/10/−4/0/1");
kontroll(18 + 10 - 4 + 0 + 1 === 25, "ek-01: täljare 25");
kontroll(30 + 25 + 20 + 15 + 10 === 100, "ek-01: nämnare 100");
kontroll(approx(25 / 100, 0.25), "ek-01: SAM(mikro) = +0,25");
// ek-01 — total-SAM
kontroll(approx(0.25 * 15, 3.75) && approx(0.40 * 20, 8) && approx(0.60 * 30, 18) && approx(0.30 * 20, 6) && 0 * 15 === 0, "ek-01: fem horisontroster 3,75/8/18/6/0");
kontroll(approx(3.75 + 8 + 18 + 6 + 0, 35.75), "ek-01: täljare 35,75");
kontroll(approx(35.75 / 100, 0.3575), "ek-01: total-SAM = +0,3575 ≈ +0,36");
// ek-01 — röstbudgeten
const vol = 30 * 0.15 + 25 * 0.20 + 25 * 0.30 + 25 * 0.20 + 25 * 0.15;
const ew = 20 * 0.15 + 25 * 0.20 + 25 * 0.30 + 30 * 0.20 + 30 * 0.15;
const fib = 25 * 0.15 + 25 * 0.20 + 25 * 0.30 + 20 * 0.20 + 20 * 0.15;
const gann = 15 * (0.15 + 0.20 + 0.30 + 0.20 + 0.15);
const luc = 10 * (0.15 + 0.20 + 0.30 + 0.20 + 0.15);
kontroll(approx(vol, 25.75), "ek-01: VOL total 25,75");
kontroll(approx(ew, 26.0), "ek-01: EW total 26,00");
kontroll(approx(fib, 23.25), "ek-01: FIB total 23,25");
kontroll(approx(gann, 15.0), "ek-01: GANN total 15,00");
kontroll(approx(luc, 10.0), "ek-01: LUC total 10,00");
kontroll(approx(vol + ew + fib + gann + luc, 100.0), "ek-01: röstbudgeten stänger på exakt 100");
kontroll(approx(15 + 20 + 30 + 20 + 15, 100), "ek-01: horisontvikterna summerar till 100");
kontroll(ew < 26.001 && vol < 26.001, "ek-01: ingen teori över 26 % (fjärdedelsprincipen)");
// ln-05 — trappan
kontroll(1000 - 400 === 600, "ln-05: bruttovinst 1 000 − 400 = 600");
kontroll(approx(600 / 1000, 0.60), "ln-05: bruttomarginal 60 %");
kontroll(600 - 350 === 250, "ln-05: EBITDA 600 − 350 = 250");
kontroll(approx(250 / 1000, 0.25), "ln-05: EBITDA-marginal 25 %");
kontroll(250 - 50 === 200, "ln-05: EBIT 250 − 50 = 200");
kontroll(approx(200 / 1000, 0.20), "ln-05: EBIT-marginal 20 %");
kontroll(200 - 20 === 180, "ln-05: före skatt 200 − 20 = 180");
kontroll(180 * 0.25 === 45, "ln-05: skatt 25 % av 180 = 45");
kontroll(180 - 45 === 135, "ln-05: netto 135");
kontroll(approx(135 / 1000, 0.135), "ln-05: nettomarginal 13,5 %");
kontroll(approx(100 - 13.5, 86.5), "ln-05: 86,50 av hundralappen förbrukas");
// ln-05 — känsligheten (en post i taget +10 %)
kontroll(600 - 40 - 350 - 50 - 20 === 140 && 140 * 0.75 === 105, "ln-05: varukostnad +10 % → netto 105");
kontroll(approx((105 - 135) / 135, -0.2222), "ln-05: …= minus 22 procent");
kontroll(600 - 350 + 215 - 50 - 20 === undefined ? false : (600 - 385 - 50 - 20) * 0.75 === 108.75, "ln-05: löner +10 % → netto 108,75");
kontroll((180 - 2) * 0.75 === 133.5, "ln-05: ränta +10 % → netto 133,5");
// ln-05 — kampanjen
kontroll(approx(48 * 22.5, 1080), "ln-05: 48 paket × 22,50 = 1 080");
kontroll(approx(48 * 10, 480), "ln-05: varukostnad 48 × 10 = 480");
kontroll(1080 - 480 === 600, "ln-05: kampanjbruttovinst 600 = oförändrad");
kontroll(approx(1.2 * 0.9, 1.08), "ln-05: 1,20 × 0,90 = 1,08 (plus 8 % intäkt)");
kontroll(approx(22.5 - 10, 12.5), "ln-05: bruttovinst per paket 15 → 12,50");
kontroll(approx(1000 / 25, 40), "ln-05: 40 paket à 25 = 1 000");
// ln-05 — per styck
kontroll(approx(25 - 10, 15), "ln-05: 15 kr per paket");
kontroll(approx(100 * 15, 1500), "ln-05: 100 paket/dag = 1 500 kr");
kontroll(approx(1500 * 300, 450000), "ln-05: 300 dagar = 450 000 kr");
// ln-05 — fakturaexemplet
kontroll(approx(50 * 25, 1250), "ln-05: 50 paket à 25 = 1 250 kr faktura");

// Talen ska också FINNAS i filerna (räkneexemplen citatvärda)
console.log("== Citatvärda räknetal i kurserna ==");
for (const [slug, stralar] of [
  ["bf-15-bubblans-anatomi", ["10 gånger 15", "minus 80 procent", "5 048", "1 114", "minus 78", "0,5 × en tredjedel", "plus 400 procent"]],
  ["ek-01-sam-viktningen", ["= 25", "35,75", "25,75", "23,25", "= 100,0", "+0,25", "+0,36"]],
  ["ln-05-vad-ar-lonsamhet", ["= 600", "13,5 procent", "1 080", "86,50", "12,50", "450 000"]],
]) {
  const t = readFileSync(path.join(ROT, "data/kurser-tillagg", `${slug}.json`), "utf8");
  for (const s of stralar) kontroll(t.includes(s), `${slug}: räknevärdet "${s}" citeras i kursen`);
}

// ── 4. Korsreferenser ───────────────────────────────────────────────────────
console.log("== Korsreferenser (prefixmatch mot registret) ==");
let refTotal = 0;
for (const m of MINA) {
  const t = readFileSync(path.join(ROT, "data/kurser-tillagg", m.fil), "utf8");
  const refEr = [...new Set([...t.matchAll(/\b([a-z]{1,4}-\d{1,3})(?![\w-])/g)].map((x) => x[1]))]
    .filter((r) => !["v-spår", "x-antal"].includes(r));
  for (const r of refEr) {
    refTotal += 1;
    kontroll(slugs.some((s) => s.startsWith(r)), `${m.slug}: referens ${r} matchar slug i registret`);
  }
}
console.log(`  ${String(refTotal)} unika referenser kontrollerade`);

// ── 5. Juridikgrind ─────────────────────────────────────────────────────────
console.log("== Juridikgrind ==");
const FEL_FRASER = [
  "garanterad avkastning", "köp denna aktie", "bör köpa", "bör sälja",
  "rekommenderar köp", "rekommenderar att köpa", "säker investering",
  "riskfri avkastning", "slå index garanterat", "investera i detta bolag",
  "mina bästa aktietips", "köp nu", "sälj nu",
];
for (const m of MINA) {
  const t = readFileSync(path.join(ROT, "data/kurser-tillagg", m.fil), "utf8").toLowerCase();
  for (const fras of FEL_FRASER) kontroll(!t.includes(fras), `${m.slug}: 0 träff på rådsfrasen "${fras}"`);
  kontroll(
    t.includes("utbildning") && (t.includes("uppmaning") || t.includes("varje persons eget")),
    `${m.slug}: utbildningsframing närvarande`,
  );
  const trafFar = [...t.matchAll(/[^.]*\b(köpa|köp|sälja|sälj|försäljning)\b[^.]*\.?/gi)].map((x) => x[0].trim().slice(0, 90));
  if (trafFar.length > 0) console.log(`  ${m.slug}: ${String(trafFar.length)} köp/sälj-träff(ar) — kontext:`);
  for (const f of trafFar) console.log(`    · ${f}`);
}

console.log(`\nKVD: ${String(pass)} PASS, ${String(fail)} FAIL`);
if (fail > 0) process.exit(1);
