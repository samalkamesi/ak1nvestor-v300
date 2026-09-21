#!/usr/bin/env node
/**
 * s5-u2 KVD (manifest auto-s5-1789837501089, omgång 20) —
 * KVALITETSVERIFIERING av leveransen kt-06 + ib-05 (register 446→448 förväntat).
 * Lägen: --pre (före insert — kursfilerna på disk, registret orört)
 *        --efter (efter synk — round-trip, ytantal, syskonskydd)
 * Oberoende omräkning av ALL aritmetik; strukturparitet mot seriens kontrakt;
 * juridik- och språkgrind; korslänkar registeräkta.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const PRE = process.argv.includes("--pre");
const pass = [], fel = [], varn = [];
const P = (namn, ok, detalj, arVarning) => { ((ok ? pass : arVarning ? varn : fel)).push(namn); console.log((ok ? "PASS " : arVarning ? "VARN " : "FEL  ") + namn + (detalj ? " — " + detalj : "")); };
const FIL = (p) => readFileSync(ROT + "/" + p, "utf8");

const NYA = ["kt-07-den-tillverkade-katalysatorn", "ib-05-kostnadstrappan"];
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
P("S3 kategorier/nivåer", kurs[NYA[0]].category === "KATALYSATOR" && kurs[NYA[0]].level === "Avancerad" && kurs[NYA[1]].category === "PRIVATE EQUITY & INVESTMENTBOLAG" && kurs[NYA[1]].level === "Avancerad", "kt-07 KATALYSATOR/Avancerad · ib-05 PE&IB/Avancerad");
if (PRE) P("S3b pre-läge", !(NYA[0] in reg) && !(NYA[1] in reg), "kurserna ännu ej i registret");

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
// kt-06: Bergsvik Hydraulik AB (påhittat) — NAV 178,0 · kurs 124,0 · A/B-röststruktur
AR("kt06 P/NAV 124/178 = 0,6966", 124 / 178, 0.6966, 0.0005);
AR("kt06 rabatt = 30,3 %", (1 - 124 / 178) * 100, 30.3, 0.05);
AR("kt06 flagg 124×1,046 = 129,7", 124 * 1.046, 129.7, 0.05);
AR("kt06 kravbrev 129,7×1,023 = 132,7", 129.7 * 1.023, 132.7, 0.05);
AR("kt06 toppsteg 144,8/132,7−1 = 9,1 %", (144.8 / 132.7 - 1) * 100, 9.1, 0.05);
AR("kt06 dött 126,4/144,8−1 = −12,7 %", (126.4 / 144.8 - 1) * 100, -12.7, 0.05);
AR("kt06 dött mot start +1,9 %", (126.4 / 124 - 1) * 100, 1.9, 0.05);
AR("kt06 segerkurs 178×0,820 = 146,0", 178 * 0.82, 146.0, 0.05);
AR("kt06 seger mot start +17,7 %", (146 / 124 - 1) * 100, 17.7, 0.05);
AR("kt06 röster 20,0+80,0×0,1 = 28,0", 20 + 80 * 0.1, 28.0);
AR("kt06 stiftelsen röster 14,4/28,0 = 51,4 %", (14.4 / 28) * 100, 51.4, 0.05);
AR("kt06 fyrbåken röster 0,54/28,0 = 1,9 %", (0.54 / 28) * 100, 1.9, 0.05);
AR("kt06 gap 178−124 = 54,0", 178 - 124, 54.0);
AR("kt06 gap andel 54/124 = 43,5 %", (54 / 124) * 100, 43.5, 0.05);
AR("kt06 kassa 1200/12400 = 9,7 %", (1200 / 12400) * 100, 9.7, 0.05);
AR("kt06 tidslinje flagg→stämma 21−7 = 14 mån", 21 - 7, 14);
AR("kt06 genomförande 29−21 = 8 mån", 29 - 21, 8);
// ib-05: Kupolverk/Havstekel/Nordpost (påhittat) — 12,0 % underliggande · 0,8/2,0+carry
AR("ib05 havstekel 12,0−0,8 = 11,2", 12 - 0.8, 11.2);
AR("ib05 havstekel genomslipning 11,2/12,0 = 93,3 %", (11.2 / 12) * 100, 93.3, 0.05);
AR("ib05 kostnadsandel 0,8/12,0 = 6,7 %", (0.8 / 12) * 100, 6.7, 0.05);
AR("ib05 nordpost före carry 12,0−2,0 = 10,0", 12 - 2, 10.0);
AR("ib05 överskott 10,0−8,0 = 2,0", 10 - 8, 2.0);
AR("ib05 carry 0,2×2,0 = 0,4", 0.2 * 2, 0.4);
AR("ib05 nordpost ägare 10,0−0,4 = 9,6", 10 - 0.4, 9.6);
AR("ib05 genomslipning 9,6/12,0 = 80,0 %", (9.6 / 12) * 100, 80.0, 0.05);
AR("ib05 matning 2,0+0,4 = 2,4", 2 + 0.4, 2.4);
AR("ib05 matningsandel 2,4/12,0 = 20,0 %", (2.4 / 12) * 100, 20.0, 0.05);
AR("ib05 dubbelkostnad 0,3+0,8 = 1,1", 0.3 + 0.8, 1.1);
AR("ib05 kassadragering 0,8/78 = 1,0 %", (0.8 / 78) * 100, 1.0, 0.05);
AR("ib05 engångstull 1,2×6 = 7,2", 1.2 * 6, 7.2);
AR("ib05 1,08^20 = 466,1 (per 100)", 100 * Math.pow(1.08, 20), 466.1, 0.05);
AR("ib05 1,06^20 = 320,7 (per 100)", 100 * Math.pow(1.06, 20), 320.7, 0.05);
AR("ib05 kvot 320,7/466,1 = 0,688", 320.7 / 466.1, 0.688, 0.0005);
AR("ib05 äten = 31,2 %", (1 - Math.pow(1.06 / 1.08, 20)) * 100, 31.2, 0.05);
AR("ib05 äten 1 år = 1,9 %", (1 - 1.06 / 1.08) * 100, 1.9, 0.05);
AR("ib05 äten 10 år = 17,0 %", (1 - Math.pow(1.06 / 1.08, 10)) * 100, 17.0, 0.05); // 17,0491 avrundas NED — text rättad från 17,1 av prekollen
AR("ib05 årsbild 2,0/8,0 = 25,0 %", (2 / 8) * 100, 25.0, 0.05);
AR("ib05 brutto-hurdle överskott 12,0−8,0 = 4,0", 12 - 8, 4.0);
AR("ib05 brutto-carry 0,2×4,0 = 0,8", 0.2 * 4, 0.8);
AR("ib05 bruttoläge ägare 12,0−2,0−0,8 = 9,2", 12 - 2 - 0.8, 9.2);
AR("ib05 definitionsfrågan 9,6−9,2 = 0,4", 9.6 - 9.2, 0.4);

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
// kt-06-guidningen = syskonet u3:s dokumenterade pågående post (klaim före min,
// kursfil på disk) — referensen är äkta om den finns i registret ELLER som
// kursfil på disk (race-tolerant; o16-u2-precedensens omnumreringssituation).
const refMall = ["kt-01", "kt-02", "kt-03", "kt-04", "kt-05", "ib-01", "ib-02", "ib-03", "ib-04", "pe-01", "pe-02", "pe-04", "pe-05", "am-01", "am-02", "am-07", "sj-03", "km-067", "km-068", "rk-07", "bk-05", "bf-14"];
const brutna = refMall.filter((r) => !Object.keys(reg).some((k) => k.startsWith(r + "-")));
P("K1 korslänkar", brutna.length === 0, brutna.length ? "saknas: " + brutna.join(",") : refMall.length + " referenser registeräkta");
const kt06PaDisk = existsSync(ROT + "/data/kurser-tillagg/kt-06-guidningen.json");
const kt06Refererad = (FIL("data/kurser-tillagg/kt-07-den-tillverkade-katalysatorn.json").match(/kt-06/g) || []).length;
P("K1b syskonreferens kt-06", kt06Refererad === 0 || Object.keys(reg).some((k) => k.startsWith("kt-06-")) || kt06PaDisk, kt06Refererad + " omnämnanden · register: " + (Object.keys(reg).some((k) => k.startsWith("kt-06-")) ? "ja" : "nej") + " · kursfil på disk: " + (kt06PaDisk ? "ja" : "nej"));

// ── 7. Registerytornas antal (endast --efter) ────────────────────────────────
if (!PRE) {
  const antal = Object.keys(reg).length;
  P("Y1 register " + antal, antal >= 449 && NYA.every((s) => s in reg), "mina 2 på plats" + (antal > 449 ? " + syskoninserts (" + (antal - 449) + ")" : ""));
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
  const skyddade = ["mt-07-prisfullmakten", "vr-07-terminalvardet", "pe-05-andrahandsmarknaden", "mt-08-kvalitetspremien", "se-18-rederi-och-shipping", "ma-07-valutakursens-mekanik", "ma-08-bostadsmarknadens-mekanik", "ib-04-avkastningsrakningen", "roic-04-vardeekvationen", "kt-05-katalysatorernas-kalender"];
  const clobtrade = skyddade.filter((s) => JSON.stringify(head[s]) !== JSON.stringify(reg[s]));
  const nytillagda = Object.keys(reg).filter((s) => !(s in head));
  P("Y8 syskonskydd", clobtrade.length === 0 && NYA.every((s) => nytillagda.includes(s)), "clobbrar: " + (clobtrade.length || "0") + " · nya mot HEAD: " + (nytillagda.join(", ") || "0") + " (syskon kan tillkomma under fönstret)");
}

console.log("\nKVD" + (PRE ? " (pre)" : "") + ": " + pass.length + " PASS · " + fel.length + " FEL · " + varn.length + " VARNING");
if (fel.length) { console.log("FELLISTA: " + fel.join(" · ")); process.exit(1); }
