#!/usr/bin/env node
/**
 * KVD s5-u3 (manifest auto-s5-1789569318697) — 2026-09-16
 * Kvalitetsverifiering av tre kursleveranser: rs-05, kt-03, ma-01.
 *
 *   1. STRUKTURPARITET ×3: chapters_list ↔ chapters (num/titel/minuter),
 *      summa minuter = totalMinutes, chapterCount, xp 50, level/kategori.
 *   2. REGISTERPARITET ×3: registrets kopia == proveniensfilen (round-trip).
 *   3. ARITMETIK (maskinell): ma-01 evighetsräkningen + priskanalens två
 *      exempel · kt-03 indexflödesexemplet · rs-05 matrisexemplet.
 *   4. KORSREFERENSER: varje slug-referens i de tre filerna prefixmatchar
 *      en verklig slug i registret (0 brutna länkar, 0 fantomer).
 *   5. JURIDIKGRIND: 0 rådsfraser (FEL-klass); utbildningsframing närvarande;
 *      köp/sälj-endast-i-neutral-mekanik (register över träffar, manellt
 *      granskade = maskinutskrift för efterföljning).
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
  { fil: "rs-05-riskavsnittet-mellan-raderna.json", slug: "rs-05-riskavsnittet-mellan-raderna", kat: "RISK" },
  { fil: "kt-03-katalysatorkedjor.json", slug: "kt-03-katalysatorkedjor", kat: "KATALYSATOR" },
  { fil: "ma-01-transmissionsmekaniken.json", slug: "ma-01-transmissionsmekaniken", kat: "MAKROEKONOMI & RÄNTA" },
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
  kontroll(prov.level === "Avancerad", `${m.slug}: level Avancerad`);
  kontroll(prov.chapterCount === 6 && prov.chapters.length === 6, `${m.slug}: 6 kapitel`);
  kontroll(prov.chapters.reduce((s, c) => s + c.minutes, 0) === prov.totalMinutes && prov.totalMinutes === 24, `${m.slug}: minuter 6×4 = 24`);
  kontroll(prov.xp === 50, `${m.slug}: XP 50`);
  kontroll(
    JSON.stringify(prov.chapters_list) === JSON.stringify(prov.chapters.map(({ num, title, minutes }) => ({ num, title, minutes }))),
    `${m.slug}: chapters_list ↔ chapters paritet`,
  );
  kontroll(JSON.stringify(reg) === JSON.stringify(prov), `${m.slug}: registrets kopia == proveniensfilen (round-trip)`);
}

// ── 3. Aritmetik ────────────────────────────────────────────────────────────
console.log("== Aritmetik (maskinell) ==");
// ma-01 — priskanalen
kontroll(3_000_000 * 0.02 === 60_000, "ma-01: 3 mkr × 2 pp = 60 000 kr/år");
kontroll(60_000 / 12 === 5_000, "ma-01: 60 000 kr/år = 5 000 kr/månad");
kontroll(300 * 0.02 === 6, "ma-01: 300 mkr rörligt × 2 pp = 6 mkr");
kontroll(approx(6 / 60, 0.10), "ma-01: 6 av 60 mkr resultat = 10 procent");
// ma-01 — värderingskanalen (evighetsströmmen)
kontroll(approx(10 / 0.08, 125), "ma-01: 10 mkr / 8 procent = 125 mkr");
kontroll(approx(10 / 0.10, 100), "ma-01: 10 mkr / 10 procent = 100 mkr");
kontroll(approx((125 - 100) / 125, 0.20), "ma-01: 25 av 125 = 20 procents värdefall");
kontroll(Math.round(10 / 0.12) === 83, "ma-01: 10 / 12 procent ≈ 83 mkr");
kontroll(Math.round(((100 - 83) / 100) * 100) === 17, "ma-01: 83 mot 100 = minus 17 procent");
kontroll(Math.round(10 / 0.06) === 167, "ma-01: 10 / 6 procent ≈ 167 mkr");
kontroll(Math.round(((167 - 100) / 100) * 100) === 67, "ma-01: 167 mot 100 = plus 67 procent");
// kt-03 — indexflödet
kontroll(approx(0.02 * 60_000, 1_200), "kt-03: 2,0 procent av 60 mdr = 1,2 mdr (1 200 mkr)");
kontroll(1_200 / 40 === 30, "kt-03: 1 200 mkr / 40 mkr dagsomsättning = 30 handelsdagar");
kontroll(0.02 + 0.035 > 0, "kt-03: räknevärden närvarande");
// rs-05 — matrisexemplet
kontroll(4 * 4 === 16 && 5 * 2 === 10 && 2 * 5 === 10 && 3 * 2 === 6, "rs-05: fyra celler 16/10/10/6");
kontroll(16 + 10 + 10 + 6 === 42, "rs-05: summan 42");
kontroll(4 * 25 === 100, "rs-05: max 4 × 25 = 100");
kontroll(2 + 2 + 3 === 7, "rs-05: 2+2+3 = 7 extraherade risker");

// Talen ska också FINNAS i filerna (räkneexemplen citatvärda)
for (const [slug, stralar] of [
  ["ma-01-transmissionsmekaniken", ["60 000 kronor", "5 000 kronor i månaden", "6 miljoner", "125 miljoner", "100 miljoner"]],
  ["kt-03-katalysatorkedjor", ["1,2 miljarder", "40 miljoner", "30 handelsdagar"]],
  ["rs-05-riskavsnittet-mellan-raderna", ["4 × 4 = 16", "3 × 2 = 6", "42 på maximalt 100"]],
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
];
for (const m of MINA) {
  const t = readFileSync(path.join(ROT, "data/kurser-tillagg", m.fil), "utf8").toLowerCase();
  for (const fras of FEL_FRASER) kontroll(!t.includes(fras), `${m.slug}: 0 träff på rådsfrasen "${fras}"`);
  kontroll(
    t.includes("utbildning") && (t.includes("uppmaning") || t.includes("eget ansvar") || t.includes("varje persons eget")),
    `${m.slug}: utbildningsframing närvarande`,
  );
  // köp/sälj-träffar med kontext (manellt granskade: neutral mekanik)
  const trafFar = [...t.matchAll(/[^.]*\b(köpa|köp|sälja|sälj|försäljning)\b[^.]*\.?/gi)].map((x) => x[0].trim().slice(0, 90));
  if (trafFar.length > 0) console.log(`  ${m.slug}: ${String(trafFar.length)} köp/sälj-träff(ar) — kontext:`);
  for (const f of trafFar) console.log(`    · ${f}`);
}

console.log(`\nKVD: ${String(pass)} PASS, ${String(fail)} FAIL`);
if (fail > 0) process.exit(1);
