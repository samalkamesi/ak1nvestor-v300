#!/usr/bin/env node
/**
 * s5-u2 KVD (manifest auto-s5-1789812330026, omgång 19) —
 * KVALITETSVERIFIERING av leveransen vr-07 + pe-05 (register 440→442).
 * Lägen: --pre (före insert — kursfilerna på disk, registret orört)
 *        --efter (efter synk — round-trip, ytantal, syskonskydd)
 * Oberoende omräkning av ALL aritmetik; strukturparitet mot seriens kontrakt;
 * juridik- och språkgrind; korslänkar registeräkta.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const PRE = process.argv.includes("--pre");
const pass = [], fel = [], varn = [];
const P = (namn, ok, detalj, arVarning) => { ((ok ? pass : arVarning ? varn : fel)).push(namn); console.log((ok ? "PASS " : arVarning ? "VARN " : "FEL  ") + namn + (detalj ? " — " + detalj : "")); };
const FIL = (p) => readFileSync(ROT + "/" + p, "utf8");

const NYA = ["vr-07-terminalvardet", "pe-05-andrahandsmarknaden"];
const reg = JSON.parse(FIL("public/deep-courses.json"));
const kurs = Object.fromEntries(NYA.map((s) => [s, JSON.parse(FIL("data/kurser-tillagg/" + s + ".json"))]));

// ── 1. Strukturparitet ×2 ────────────────────────────────────────────────────
const FALT = ["slug", "category", "weight", "chapterCount", "totalMinutes", "title", "summary", "minutes", "xp", "level", "learn", "why", "history", "chapters_list", "lynchSection", "grahamSection", "ak1Section", "chapters"];
const blockMall = [3, 3, 3, 3, 2, 3];
for (const s of NYA) {
  const k = kurs[s];
  const saknas = FALT.filter((f) => !(f in k));
  const strukturOk = !saknas.length && k.slug === s && k.chapters.length === 6 && k.chapterCount === 6 && k.chapters_list.length === 6 &&
    k.chapters.every((c, i) => c.num === i + 1 && c.minutes === 4 && c.blocks.length === blockMall[i]) &&
    k.totalMinutes === 24 && k.minutes === 24 && k.xp === 50 && ["Nybörjare", "Intermediär", "Avancerad"].includes(k.level) &&
    k.weight === "—" && Object.keys(k.history).join(",") === "origin,evolution,modern";
  P("S1 struktur " + s, strukturOk, strukturOk ? "18 fält · 6 kap à 4 min · block " + blockMall.join("/") : "avvikelse: " + (saknas.join(",") || "form"));
  const blocktyper = k.chapters.flatMap((c) => c.blocks.map((b) => b.type)).join(",");
  P("S2 blocktyper " + s, blocktyper.includes("text") && blocktyper.includes("insight") && blocktyper.includes("utmaning") && blocktyper.includes("tabell") && blocktyper.includes("definition"), blocktyper);
}
P("S3 kategorier/nivåer", kurs[NYA[0]].category === "VÄRDERING" && kurs[NYA[0]].level === "Avancerad" && kurs[NYA[1]].category === "PRIVATE EQUITY & INVESTMENTBOLAG" && kurs[NYA[1]].level === "Avancerad", "vr-07 VÄRDERING/Avancerad · pe-05 PE&IB/Avancerad");

// ── 2. Register↔kursfil round-trip (endast --efter) ──────────────────────────
if (!PRE) {
  for (const s of NYA) {
    const rp = reg[s];
    const skillnader = FALT.filter((f) => JSON.stringify(rp?.[f]) !== JSON.stringify(kurs[s][f]));
    P("S4 round-trip " + s, !!rp && skillnader.length === 0, skillnader.length ? "avviker: " + skillnader.join(",") : "18/18 fält identiska");
  }
}

// ── 3. Aritmetik — OBEROENDE omräkning ───────────────────────────────────────
const AR = (namn, raknad, forv, tol = 0.005) => P("A " + namn, Math.abs(raknad - forv) <= tol, raknad.toFixed(4).replace(/0+$/, "") + " mot text " + forv);
// vr-07: Nordanverk AB (påhittat) — WACC 8 %, FCF 100/år ×10, g 2 %
const d10 = Math.pow(1.08, 10);
AR("vr07 annuitet (1−1,08⁻¹⁰)/0,08 = 6,7101", (1 - 1 / d10) / 0.08, 6.7101, 0.0005);
AR("vr07 PV explicit 100×6,7101 = 671,0", 100 * (1 - 1 / d10) / 0.08, 671.0, 0.05);
AR("vr07 år-11-flöde 100×1,02 = 102,0", 100 * 1.02, 102.0);
AR("vr07 TV 102/0,06 = 1 700,0", 102 / 0.06, 1700.0);
AR("vr07 diskfaktor 1,08¹⁰ = 2,1589", d10, 2.1589, 0.0005);
AR("vr07 PV(TV) 1 700/2,1589 = 787,4", 1700 / d10, 787.4, 0.05);
AR("vr07 total 671,0+787,4 = 1 458,4", 100 * (1 - 1 / d10) / 0.08 + 1700 / d10, 1458.4, 0.05);
AR("vr07 terminalandel 787,4/1 458,4 = 54,0 %", (1700 / d10) / (100 * (1 - 1 / d10) / 0.08 + 1700 / d10) * 100, 54.0, 0.05);
AR("vr07 exit-TV 8×130 = 1 040,0", 8 * 130, 1040.0);
AR("vr07 PV(exit) 1 040/2,1589 = 481,7", 1040 / d10, 481.7, 0.05);
AR("vr07 exit-total 671,0+481,7 = 1 152,7", 100 * (1 - 1 / d10) / 0.08 + 1040 / d10, 1152.7, 0.05);
AR("vr07 exit/Gordon = 61,2 %", 1040 / 1700 * 100, 61.2, 0.05);
AR("vr07 totaldiff = −305,7", (100 * (1 - 1 / d10) / 0.08 + 1040 / d10) - (100 * (1 - 1 / d10) / 0.08 + 1700 / d10), -305.7, 0.05);
AR("vr07 totaldiff = −21,0 %", ((100 * (1 - 1 / d10) / 0.08 + 1040 / d10) / (100 * (1 - 1 / d10) / 0.08 + 1700 / d10) - 1) * 100, -21.0, 0.05);
AR("vr07 multiplar 1/0,06 = 16,7", 1 / 0.06, 16.7, 0.05);
AR("vr07 multiplar 1/0,05 = 20,0", 1 / 0.05, 20.0);
AR("vr07 multiplar 1/0,04 = 25,0", 1 / 0.04, 25.0);
AR("vr07 multiplar 1/0,03 = 33,3", 1 / 0.03, 33.3, 0.05);
AR("vr07 multiplar 1/0,02 = 50,0", 1 / 0.02, 50.0);
AR("vr07 multiplar 1/0,01 = 100,0", 1 / 0.01, 100.0);
AR("vr07 halverat gap = fördubbling 50/25 = 2,0", (1 / 0.02) / (1 / 0.04), 2.0);
AR("vr07 TV@ränta 10 % 102/0,08 = 1 275,0", 102 / 0.08, 1275.0);
AR("vr07 räntsteg på terminalen = −25,0 %", (102 / 0.08 - 1700) / 1700 * 100, -25.0);
AR("vr07 1,05⁵⁰ = 11,467", Math.pow(1.05, 50), 11.467, 0.001);
AR("vr07 1,02⁵⁰ = 2,6916", Math.pow(1.02, 50), 2.6916, 0.0005);
AR("vr07 tak-kvot 11,467/2,6916 = 4,26", Math.pow(1.05, 50) / Math.pow(1.02, 50), 4.26, 0.005);
// pe-05: Nordkärnanfond 2018 (påhittat) — substans 60, åtagande 20, pris 85 % av NAV
AR("pe05 pris 0,85×60 = 51,0", 0.85 * 60, 51.0);
AR("pe05 utlägg 51+20 = 71,0", 51 + 20, 71.0);
AR("pe05 exponering 60+20 = 80,0", 60 + 20, 80.0);
AR("pe05 sann kvot 71/80 = 0,8875", 71 / 80, 0.8875);
AR("pe05 sann rabatt = 11,25 %", (1 - 71 / 80) * 100, 11.25);
AR("pe05 utan åtagande 51/60 = 0,850 → 15,0 %", (1 - 51 / 60) * 100, 15.0);
AR("pe05 åtagande 40: 91/100 → 9,0 %", (1 - (51 + 40) / (60 + 40)) * 100, 9.0);
AR("pe05 årsränta 3 år = 5,6 %", (Math.pow(100 / 85, 1 / 3) - 1) * 100, 5.6, 0.05);
AR("pe05 årsränta 5 år = 3,3 %", (Math.pow(100 / 85, 1 / 5) - 1) * 100, 3.3, 0.05);
AR("pe05 skillnad 2,3 procentenheter", (Math.pow(100 / 85, 1 / 3) - Math.pow(100 / 85, 1 / 5)) * 100, 2.3, 0.05);
AR("pe05 ung 0,78×80 = 62,4", 0.78 * 80, 62.4);
AR("pe05 mogen 0,90×60 = 54,0", 0.90 * 60, 54.0);

// ── 4. Juristikgrind ─────────────────────────────────────────────────────────
for (const s of NYA) {
  const txt = JSON.stringify(kurs[s]).toLowerCase();
  const rad = /\b(köp|köp denna|sälj denna|investera i (detta|denna)|rekommenderar att (du )?köper|minska din position|öka din position)\b/.test(txt);
  const utbildning = txt.includes("utbildning i att") && txt.includes("inte uppmaningar att köpa eller sälja");
  P("J1 juridik " + s, !rad && utbildning, utbildning ? "framing + avslutande skyddsrad närvarande" : "framing saknas");
  P("J2 R2 " + s, !/"kraverFas"\s*:\s*[1-9]/.test(txt) && !/fas\s*[2-3]/.test(txt), "inga fas-/pris-/publiceringsytor");
}

// ── 5. Språkgrind ────────────────────────────────────────────────────────────
for (const s of NYA) {
  const t = FIL("data/kurser-tillagg/" + s + ".json");
  const cjk = t.match(/[\u4e00-\u9fff\u3040-\u30ff]/g);
  const typoCitat = t.match(/[\u201c\u201d\u2018\u2019\u00ab\u00bb]/g);
  const tabb = t.match(/[\t\u00ad]/g);
  const under = t.split('"chapters_list"').join("").match(/\w_\w/g); // kontraktsnyckel är inte text
  P("L1 språk " + s, !cjk && !typoCitat && !tabb && !under, !cjk && !typoCitat && !tabb && !under ? "0 CJK · 0 typografiska citat · 0 tabb/mjukt bindestreck · 0 underscore" : "FYND");
}

// ── 6. Korslänkar registeräkta ───────────────────────────────────────────────
const refMall = ["km-007", "km-008", "km-028", "vm-06", "vr-02", "ma-03", "ma-06", "roic-04", "pe-01", "pe-02", "pe-03", "pe-04", "ib-01", "ib-02", "ib-03", "ib-04", "km-067", "km-068", "rp-04", "rk-01"];
const brutna = refMall.filter((r) => !Object.keys(reg).some((k) => k.startsWith(r + "-")));
P("K1 korslänkar", brutna.length === 0, brutna.length ? "saknas: " + brutna.join(",") : refMall.length + " referenser registeräkta");

// ── 7. Registerytornas antal (endast --efter) ────────────────────────────────
if (!PRE) {
  const antal = Object.keys(reg).length;
  P("Y1 register " + antal, antal >= 442 && NYA.every((s) => s in reg), "mina 2 på plats" + (antal > 442 ? " + syskoninserts (" + (antal - 442) + ")" : ""));
  const kartaTxt = FIL("src/lib/larvag-karta.ts");
  P("Y2 karta", kartaTxt.includes("(" + antal + " kurser)") && (kartaTxt.match(/slug: "/g) || []).length === antal, (kartaTxt.match(/slug: "/g) || []).length + " rader mot register " + antal);
  const sok = FIL("public/sok-index.json");
  P("Y3 sökindex", sok.includes(NYA[0]) && sok.includes(NYA[1]), "båda slugs indexerade");
  const speglar = FIL("public/speglar-slugar.json");
  P("Y4 speglar", speglar.includes(NYA[0]) && speglar.includes(NYA[1]), "båda slugs speglade");
  const siffror = JSON.parse(FIL("data/siffror.json"));
  const sifKurser = siffror.kurser ?? JSON.stringify(siffror).match(/"kurser"\s*:\s*(\d+)/)?.[1];
  P("Y5 siffror", String(sifKurser) === String(antal), "kurser = " + sifKurser);
  const l1 = FIL("public/llms.txt"), l2 = FIL("public/llms-full.txt");
  const t1 = l1.match(/(\d{3}) kurser/g) || [], t2 = l2.match(/(\d{3}) kurser/g) || [];
  const maxT = Math.max(...t1.map((x) => Number(x.slice(0, 3))), ...t2.map((x) => Number(x.slice(0, 3))));
  P("Y6 llms", t1.filter((x) => Number(x.slice(0, 3)) === antal).length === 6 && t2.filter((x) => Number(x.slice(0, 3)) === antal).length === 4, "llms 6+4 ställen på " + antal + " (maxtal " + maxT + ")");
  const mentor = FIL("src/lib/ai-mentor-register.ts");
  P("Y7 mentorsregister", mentor.includes(NYA[0]) && mentor.includes(NYA[1]) && (mentor.match(/slug: "/g) || []).length === antal, (mentor.match(/slug: "/g) || []).length + " rader");
}

// ── 8. Syskonskydd — inga clobbrar mot HEAD (endast --efter) ─────────────────
if (!PRE) {
  const head = JSON.parse(execSync("git show HEAD:public/deep-courses.json", { cwd: ROT, maxBuffer: 32 * 1024 * 1024, encoding: "utf8" }));
  const skyddade = ["se-17-skogssektorn", "kt-05-katalysatorernas-kalender", "rp-04-volatilitetsbudgeten", "bk-06-obeskattade-reserver-och-avsattningar", "sj-06-arv-gava-och-ingaende-varde", "pf-15-faktorpremierna", "ib-04-avkastningsrakningen", "roic-04-vardeekvationen"];
  const clobtrade = skyddade.filter((s) => JSON.stringify(head[s]) !== JSON.stringify(reg[s]));
  const nytillagda = Object.keys(reg).filter((s) => !(s in head));
  P("Y8 syskonskydd", clobtrade.length === 0 && NYA.every((s) => nytillagda.includes(s)), "clobbrar: " + (clobtrade.length || "0") + " · nya mot HEAD: " + (nytillagda.join(", ") || "0") + " (syskon kan tillkomma under fönstret)");
}

console.log("\nKVD" + (PRE ? " (pre)" : "") + ": " + pass.length + " PASS · " + fel.length + " FEL · " + varn.length + " VARNING");
if (fel.length) { console.log("FELLISTA: " + fel.join(" · ")); process.exit(1); }
