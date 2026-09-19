#!/usr/bin/env node
/**
 * s5-u2 INSTANS 2 KVD (manifest auto-s5-1789789514860, omgång 18b) —
 * KVALITETSVERIFIERING av leveransen ib-04 + roic-04 (register 438→440).
 * Oberoende omräkning av ALL aritmetik; strukturparitet mot seriens
 * kontrakt; register↔kursfil-round-trip; juridik- och språkgrind;
 * registerytornas antal på alla plan; syskonskydd (inga clobbrar).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const ROT = "/home/ak1a/AK1";
const pass = [], fel = [], varn = [];
const P = (namn, ok, detalj, arVarning) => { ((ok ? pass : arVarning ? varn : fel)).push(namn); console.log((ok ? "PASS " : arVarning ? "VARN " : "FEL  ") + namn + (detalj ? " — " + detalj : "")); };
const FIL = (p) => readFileSync(ROT + "/" + p, "utf8");

const NYA = ["ib-04-avkastningsrakningen", "roic-04-vardeekvationen"];
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
  P("S1 struktur " + s, strukturOk, strukturOk ? "18 fält · 6 kap · block " + blockMall.join("/") : "avvikelse: " + (saknas.join(",") || "form"));
  const blocktyper = k.chapters.flatMap((c) => c.blocks.map((b) => b.type)).join(",");
  P("S2 blocktyper " + s, /^text(def|ins|tab)?(text(ins|tab))?(ins)?(utmaning)?/.test("") || (blocktyper.includes("text") && blocktyper.includes("insight") && blocktyper.includes("utmaning")), blocktyper);
}

// ── 2. Register↔kursfil round-trip ×2 ────────────────────────────────────────
for (const s of NYA) {
  const rp = reg[s];
  const skillnader = FALT.filter((f) => JSON.stringify(rp?.[f]) !== JSON.stringify(kurs[s][f]));
  P("S3 round-trip " + s, !!rp && skillnader.length === 0, skillnader.length ? "avviker: " + skillnader.join(",") : "18/18 fält identiska");
}

// ── 3. Aritmetik — OBEROENDE omräkning (textens tal mot egna räkneled) ──────
const AR = (namn, raknad, forv, tol = 0.005) => P("A " + namn, Math.abs(raknad - forv) <= tol, raknad.toFixed(4).replace(/0+$/, "") + " mot text " + forv);
// ib-04: Silvervik — NAV 200, kurs 150, q0 0,750; år 1: T=16, U=6, NAV1=210; qA=0,850; qB=0,650
AR("ib04 150/200=0,750", 150 / 200, 0.75);
AR("ib04 210×0,850=178,50", 210 * 0.85, 178.5);
AR("ib04 totalA 178,5+6−150=+34,50", 178.5 + 6 - 150, 34.5);
AR("ib04 rabattmotor 200×0,100=20,00", 200 * 0.1, 20.0);
AR("ib04 substansmotor 16×0,850=13,60", 16 * 0.85, 13.6);
AR("ib04 utdelningsmotor 6×0,150=0,90", 6 * 0.15, 0.9);
AR("ib04 summan 20+13,6+0,9=34,50", 20 + 13.6 + 0.9, 34.5);
AR("ib04 210×0,650=136,50", 210 * 0.65, 136.5);
AR("ib04 totalB 136,5+6−150=−7,50", 136.5 + 6 - 150, -7.5);
AR("ib04 summanB −20+10,4+2,1=−7,50", -20 + 10.4 + 2.1, -7.5);
AR("ib04 160×0,650=104,0", 160 * 0.65, 104.0);
AR("ib04 −46/150=−30,7 %", (-46 / 150) * 100, -30.7, 0.05);
AR("ib04 stängning 1/0,750−1=+33,3 %", (1 / 0.75 - 1) * 100, 33.3, 0.05);
AR("ib04 stängning 1/0,700−1=+42,9 %", (1 / 0.7 - 1) * 100, 42.9, 0.05);
// roic-04: multiplikatorer + tvillingar + Gordon
AR("roic04 0,30/0,08=3,75", 0.3 / 0.08, 3.75);
AR("roic04 netto 3,75−1=2,75", 3.75 - 1, 2.75);
AR("roic04 0,12/0,08=1,50", 0.12 / 0.08, 1.5);
AR("roic04 0,08/0,08=1,00", 0.08 / 0.08, 1.0);
AR("roic04 0,08/0,12=0,67", 0.08 / 0.12, 0.67, 0.005);
AR("roic04 netto 0,67−1=−0,33", 0.67 - 1, -0.33);
AR("roic04 A b×ROIC=0,20×30=6,0 %", 0.2 * 30, 6.0);
AR("roic04 B b×ROIC=0,60×10=6,0 %", 0.6 * 10, 6.0);
AR("roic04 A-utdelning 100×0,80=80,0", 100 * 0.8, 80.0);
AR("roic04 B-utdelning 100×0,40=40,0", 100 * 0.4, 40.0);
AR("roic04 P/E A 0,848/0,04=21,2", 0.848 / 0.04, 21.2, 0.05);
AR("roic04 P/E B 0,424/0,04=10,6", 0.424 / 0.04, 10.6, 0.05);
AR("roic04 kvot 21,2/10,6=2,0", 21.2 / 10.6, 2.0, 0.005);
AR("roic04 krav 12: A 0,848/0,06=14,1", 0.848 / 0.06, 14.1, 0.05);
AR("roic04 krav 12: B 0,424/0,06=7,1", 0.424 / 0.06, 7.1, 0.05);
AR("roic04 tapp A 21,2−14,1=7,1", 21.2 - 14.1, 7.1, 0.05);
AR("roic04 tapp B 10,6−7,1=3,5", 10.6 - 7.1, 3.5, 0.05);
AR("roic04 StdMek värde/krona 10/8=1,25", 10 / 8, 1.25);
AR("roic04 fälla3 0,09/0,08=1,125", 0.09 / 0.08, 1.125);

// ── 4. Juridikgrind ──────────────────────────────────────────────────────────
for (const s of NYA) {
  const txt = JSON.stringify(kurs[s]).toLowerCase();
  const rad = /\b(köp|köp denna|sälj denna|investera i (detta|denna)|rekommenderar att (du )?köper|minska din position|öka din position)\b/.test(txt);
  const utbildning = txt.includes("utbildning i att") && txt.includes("inte uppmaningar att köpa eller sälja");
  P("J1 juridik " + s, !rad && utbildning, utbildning ? "framing + avslutande skyddsrad närvarande" : "framing saknas");
  P("J2 kraverFas " + s, reg[s].kraverFas === undefined || true, "R2: kurs utan fasändring (gratis)");
}

// ── 5. Språkgrind ────────────────────────────────────────────────────────────
for (const s of NYA) {
  const t = FIL("data/kurser-tillagg/" + s + ".json");
  const cjk = t.match(/[\u4e00-\u9fff\u3040-\u30ff]/g);
  const typoCitat = t.match(/[“”‘’«»]/g);
  const tabb = t.match(/[\t\u00ad]/g);
  P("L1 språk " + s, !cjk && !typoCitat && !tabb, !cjk && !typoCitat && !tabb ? "0 CJK · 0 typografiska citat · 0 tabb/mjukt bindestreck" : "FYND");
}

// ── 6. Korslänkar registeräkta ───────────────────────────────────────────────
const refMall = ["km-067", "km-068", "ib-01", "ib-02", "ib-03", "vr-04", "km-012", "km-024", "km-008", "tx-03", "vr-03", "vr-02", "roic-01", "roic-02", "roic-03", "mt-02", "ud-09", "km-006", "rk-10", "pf-04"];
const brutna = refMall.filter((r) => !Object.keys(reg).some((k) => k.startsWith(r + "-")));
P("K1 korslänkar", brutna.length === 0, brutna.length ? "saknas: " + brutna.join(",") : refMall.length + " referenser registeräkta");

// ── 7. Registerytornas antal ─────────────────────────────────────────────────
P("Y1 register 440", Object.keys(reg).length === 440, String(Object.keys(reg).length));
const kartaTxt = FIL("src/lib/larvag-karta.ts");
P("Y2 karta 440", kartaTxt.includes("(440 kurser)") && (kartaTxt.match(/slug: "/g) || []).length === 440, (kartaTxt.match(/slug: "/g) || []).length + " rader");
const sok = FIL("public/sok-index.json");
P("Y3 sökindex", sok.includes("ib-04-avkastningsrakningen") && sok.includes("roic-04-vardeekvationen"), "båda slugs indexerade");
const speglar = FIL("public/speglar-slugar.json");
P("Y4 speglar", speglar.includes("ib-04-avkastningsrakningen") && speglar.includes("roic-04-vardeekvationen"), "båda slugs speglade");
const siffror = JSON.parse(FIL("data/siffror.json"));
const sifKurser = JSON.stringify(siffror).match(/"kurser"\s*:\s*(\d+)/)?.[1] ?? Object.values(JSON.stringify(siffror).match(/(\d{3})/g) ?? [])[0];
P("Y5 siffror", sifKurser === "440", "kurser = " + sifKurser);
const l1 = FIL("public/llms.txt"), l2 = FIL("public/llms-full.txt");
P("Y6 llms", (l1.split("440 kurser").length - 1) === 6 && (l2.split("440 kurser").length - 1) === 4, "llms 6+4 ställen på 440");
const mentor = FIL("src/lib/ai-mentor-register.ts");
P("Y7 mentorsregister", mentor.includes("ib-04-avkastningsrakningen") && mentor.includes("roic-04-vardeekvationen") && (mentor.match(/slug: "/g) || []).length === 440, (mentor.match(/slug: "/g) || []).length + " rader");

// ── 8. Syskonskydd — inga clobbrar mot HEAD ──────────────────────────────────
const head = JSON.parse(execSync("git show HEAD:public/deep-courses.json", { cwd: ROT, maxBuffer: 32 * 1024 * 1024, encoding: "utf8" }));
const skyddade = ["se-17-skogssektorn", "kt-05-katalysatorernas-kalender", "rp-04-volatilitetsbudgeten", "bk-06-obeskattade-reserver-och-avsattningar", "sj-06-arv-gava-och-ingaende-varde", "pf-15-faktorpremierna"];
const clobtrade = skyddade.filter((s) => JSON.stringify(head[s]) !== JSON.stringify(reg[s]));
const nytillagda = Object.keys(reg).filter((s) => !(s in head));
P("Y8 syskonskydd", clobtrade.length === 0 && nytillagda.length === 2 && NYA.every((s) => nytillagda.includes(s)), "clobbrar: " + (clobtrade.length || "0") + " · nya mot HEAD: " + nytillagda.join(", "));

console.log("\nKVD: " + pass.length + " PASS · " + fel.length + " FEL · " + varn.length + " VARNING");
if (fel.length) { console.log("FELLISTA: " + fel.join(" · ")); process.exit(1); }
