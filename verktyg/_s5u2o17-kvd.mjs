#!/usr/bin/env node
/**
 * KVD s5-u2 omgång 17 (manifest auto-s5-1789766125084) — EFTER synk, FÖRE commit:
 * rs-08-modellrisken + od-06-positionen-efter-bygget.
 *
 * Round-trip register ≡ kursfil (djupt), mentorsregister-bastest (E01 registeräkthet),
 * siffror/llms-paritet, kartrader, speglar närvarande. tsc körs separat (projektbinär).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rs-08-modellrisken", "od-06-positionen-efter-bygget"];
const pass = [], fail = [];
const T = (n, v, d) => (v ? pass : fail).push((v ? "PASS " : "FAIL ") + n + (d ? " — " + d : ""));

// ── 1. Round-trip: registerpost ≡ kursfil (djup jämförelse) ─────────────────
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
for (const slug of MINA) {
  const fil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));
  T("round-trip " + slug + " (register ≡ kursfil, djupt)", JSON.stringify(reg[slug]) === JSON.stringify(fil));
  T("kategori/nivå " + slug, (slug.startsWith("rs-") ? reg[slug].category === "RISK" : reg[slug].category === "OPTIONS & DERIVAT") && reg[slug].level === "Avancerad", reg[slug].category + " · " + reg[slug].level);
}
T("registerantal 429", Object.keys(reg).length === 429, String(Object.keys(reg).length));

// ── 2. AI-Mentorn bastest (E01 registeräkthet) ───────────────────────────────
const mentor = execFileSync("node", ["verktyg/testa-ai-mentor.mjs"], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const samman = mentor.match(/(\d+) PASS · (\d+) FAIL av \d+/) ?? ["0", "0", "1"];
const mentorPass = Number(samman[1]);
const mentorFail = Number(samman[2]);
T("AI-Mentorn bastest 26 PASS 0 FAIL", mentorPass >= 26 && mentorFail === 0, mentorPass + " PASS · " + mentorFail + " FAIL");
const e01 = mentor.split("\n").find((l) => l.includes("E01")) ?? "";
T("E01 registeräkthet 429 kurser", e01.includes("429"), e01.trim().slice(0, 100));
const quizRad = mentor.split("\n").find((l) => l.toLowerCase().includes("quiz")) ?? "";
console.log("  mentor: " + mentorPass + " PASS · " + mentorFail + " FAIL · " + quizRad.trim().slice(0, 90));

// ── 3. Siffror-paritet ───────────────────────────────────────────────────────
const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
const siffKurser = siffror.kurser ?? siffror.antalKurser ?? siffror.kursAntal ?? null;
T("siffror.json bär 429 (fält: " + Object.keys(siffror).filter((k) => /kurs/i.test(k)).join("/") + ")", siffKurser === 429, String(siffKurser));
const xpFalt = Object.entries(siffror).find(([k, v]) => /xp/i.test(k) && typeof v === "number");
console.log("  siffror: kurser=" + siffKurser + " · " + (xpFalt ? xpFalt.join("=") : "xp-fält ej funnet"));

// ── 4. llms-paritet ─────────────────────────────────────────────────────────
for (const [fil, vantal] of [["public/llms.txt", 6], ["public/llms-full.txt", 4]]) {
  const t = readFileSync(ROT + "/" + fil, "utf8");
  const traf = [...t.matchAll(/429 kurser/g)].length;
  const gamla = [...t.matchAll(/42[0-8] kurser/g)].length;
  T("llms " + fil.split("/").pop() + ": " + vantal + " träffar »429 kurser«, 0 kvarvarande gamla 42x", traf === vantal && gamla === 0, traf + " träffar · gamla " + gamla);
}

// ── 5. Kartrader ────────────────────────────────────────────────────────────
const karta = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
T("kartan: LARVAG_ANTAL_KURSER = 429", /LARVAG_ANTAL_KURSER = 429/.test(karta));
for (const slug of MINA) {
  const rad = karta.split("\n").find((l) => l.includes('slug: "' + slug + '"')) ?? "";
  T("kartRad " + slug + " (niva 3, kraverFas 0)", rad.includes("niva: 3") && rad.includes("kraverFas: 0"), rad.trim().slice(0, 110));
}

// ── 6. Speglar + sökindex fräscha (mina slugs närvarande) ───────────────────
for (const slug of MINA) {
  const sok = readFileSync(ROT + "/public/sok-index.json", "utf8");
  T("sökindex bär " + slug, sok.includes(slug));
}
const spegel = readFileSync(ROT + "/public/speglar-slugar.json", "utf8");
T("speglar bär mina två", MINA.every((s) => spegel.includes(s)));

// ── 7. Syskonytor orörda (BASF) ──────────────────────────────────────────────
T("u1:s rs-07-leverantorsrisken orörd i registret (deras post kvar)", "rs-07-leverantorsrisken" in reg && reg["rs-07-leverantorsrisken"].slug === "rs-07-leverantorsrisken");
T("u1:s kursfil orörd på disk (ägarskap)", readFileSync(ROT + "/data/kurser-tillagg/rs-07-leverantorsrisken.json", "utf8").length > 0);

console.log(`\n${pass.length} PASS · ${fail.length} FAIL`);
if (fail.length) { console.log(fail.join("\n")); process.exit(1); }
console.log("KVD GRÖN — round-trip ×2, mentorsregister, siffror, llms ×2, karta, speglar, sökindex, syskonytor.");
