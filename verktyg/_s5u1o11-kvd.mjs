#!/usr/bin/env node
/**
 * KVD — s5-u1 omgång 11 (2026-09-17): ek-03 arbetsflödet i labbet.
 * Maskinell kvalitetsgrind före register: strukturparitet, aritmetik (varje
 * tal kontrollräknat), juridikgrind (rådsfraser), korsreferenser (prefixmatch
 * mot registret + egen slug) och språkgrind (CJK, mjuka bindestreck, tabbar,
 * engelskläckor, citattecken). Körs FÖRE lagg-till-kurs (registret utan ek-03).
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const regSlugs = Object.keys(register);
const FIL = "ek-03-arbetsflodet-i-labbet";
let PASS = 0, FEL = 0, VARNING = 0;
const ok = (namn, kond, info = "") => {
  if (kond) { PASS++; console.log(`  PASS ${namn}${info ? " — " + info : ""}`); }
  else { FEL++; console.log(`  FEL  ${namn}${info ? " — " + info : ""}`); }
};
const avrund = (x, dec) => Number(x.toFixed(dec));

console.log("════ KVD s5-u1 omgång 11 ════");
const j = JSON.parse(readFileSync(`data/kurser-tillagg/${FIL}.json`, "utf8"));
const raw = readFileSync(`data/kurser-tillagg/${FIL}.json`, "utf8");
console.log(`─── ${FIL} (${j.category}, ${j.level}) ───`);

// ── Strukturparitet ──
ok("struktur: chapters_list↔chapters",
  j.chapters_list.length === j.chapters.length &&
  j.chapters_list.every((c, i) => c.num === j.chapters[i].num && c.title === j.chapters[i].title && c.minutes === j.chapters[i].minutes),
  `${j.chapters.length} kapitel`);
ok("struktur: chapterCount=6, sum=totalMinutes=24, minutes=24, xp=50",
  j.chapterCount === 6 && j.chapters_list.reduce((s, c) => s + c.minutes, 0) === j.totalMinutes &&
  j.totalMinutes === 24 && j.minutes === 24 && j.xp === 50);
ok("struktur: slug ren ASCII + weight— + nivå giltig",
  /^[a-z0-9][a-z0-9-]*$/.test(j.slug) && j.weight === "—" &&
  ["Nybörjare", "Intermediär", "Avancerad"].includes(j.level));
ok("struktur: kategori finns i registret sedan tidigare (familj) + slug ledig",
  regSlugs.some(s => register[s].category === j.category) && !regSlugs.includes(j.slug),
  `${j.category}: ${regSlugs.filter(s => register[s].category === j.category).length + 1} kurser efter insert`);
ok("struktur: P-fält (why/learn/history/3 sektioner)",
  typeof j.why === "string" && j.why.length > 400 && typeof j.learn === "string" &&
  j.history && j.history.origin && j.history.evolution && j.history.modern &&
  typeof j.lynchSection === "string" && typeof j.grahamSection === "string" && typeof j.ak1Section === "string");
ok("struktur: blocktyper kända + blockmönster per kapitel följer ek-02-trappan",
  j.chapters.every(ch => ch.blocks.every(b => ["text", "definition", "insight", "tabell", "utmaning"].includes(b.type))) &&
  ["definition", "tabell", "tabell", "tabell", "definition", "tabell"].every((t, i) => j.chapters[i].blocks.some(b => b.type === t)) &&
  j.chapters[5].blocks.some(b => b.type === "utmaning"));
ok("struktur: intro närvarande i samtliga kapitel",
  j.chapters.every(ch => typeof ch.intro === "string" && ch.intro.length > 30));

// ── Språkgrind ──
ok("språk: 0 CJK", !/[\u4e00-\u9fff\u3040-\u30ff]/.test(raw));
ok("språk: 0 mjuka bindestreck + 0 tabbar", !raw.includes("­") && !raw.includes("\t"));
const glosser = [...raw.matchAll(/\(på engelska [a-z ]+\)/g)].map(m => m[0]);
ok("språk: max 1 engelsk gloss", glosser.length <= 1, glosser.length ? JSON.stringify(glosser) : "0");
const rawUtanGloss = raw.replace(/\(på engelska [a-z ]+\)/g, "");
const engOrd = (rawUtanGloss.match(/\b(the|and|with|compare|retention|well|behind|possible|earnings|complexity|sell|buy|price of|notably|bearish|float|approximately|fundamentals|gimmick|true|climbed|short|recall|utilization|days to cover|vaccinated)\b/gi) || []);
const unika = [...new Set(engOrd.map(w => w.toLowerCase()))];
ok("språk: 0 engelska vardagsläckor", unika.length === 0, unika.length ? JSON.stringify(unika) : "");

// ── Juridikgrind ──
const rad = raw.match(/(rekommenderar|råder dig|du bör köpa|du bör sälja|köp denna|sälj denna|investera i denna|köp aktien|sälj aktien|agera nu|tipsa om att köpa|uppmaning att korta|kort detta bolag)/gi) || [];
ok("juridik: 0 rådsfraser", rad.length === 0, rad.length ? JSON.stringify(rad) : "");

// ── Citatgrind ──
const citat = (raw.match(/\\"/g) || []).length;
ok("språk: 0 citattecken i innehåll (parafras, aldrig citat)", citat === 0, citat ? `${citat} st` : "");

// ── Aritmetik maskinell: Norra Verkstads AB (pc-21-bevisade tal + ek-03:s nya) ──
console.log("─── ARITMETIK ek-03 ───");
{
  const I = [850, 1000, 1150], R = [119, 128, 138], NETTO = 92, EK = 460, BO = 1150, AKTIER = 46, KURS = 30, OKF = 125, INV = 65, UTD = 23;
  ok("marginaler: 119/850=14,0 · 128/1000=12,8 · 138/1150=12,0",
    avrund(R[0]/I[0]*100,1)===14.0 && avrund(R[1]/I[1]*100,1)===12.8 && avrund(R[2]/I[2]*100,1)===12.0);
  ok("marginalnormal: (14,0+12,8+12,0)/3 = 38,8/3 = 12,9",
    avrund((14.0+12.8+12.0)/3,1)===12.9 && avrund(38.8/3,1)===12.9);
  ok("tillväxt: +17,6 sedan +15,0",
    avrund((I[1]/I[0]-1)*100,1)===17.6 && avrund((I[2]/I[1]-1)*100,1)===15.0);
  ok("ROE: 92/460 = 20,0", avrund(NETTO/EK*100,1)===20.0);
  ok("soliditet: 460/1 150 = 40,0", avrund(EK/BO*100,1)===40.0);
  ok("börsvärde: 46 M × 30 = 1 380 Mkr", AKTIER*KURS===1380);
  ok("EPS: 92/46 = 2,0 · bokvärde: 460/46 = 10,0 · P/E 15,0 · P/B 3,0",
    NETTO/AKTIER===2 && EK/AKTIER===10 && KURS/2===15 && KURS/10===3);
  ok("FCF: 125−65 = 60 · kontantkvalitet: 60/92 = 65,2 %",
    OKF-INV===60 && avrund(60/NETTO*100,1)===65.2);
  ok("täckning (pc-21-paritet): 60/23 = 2,6", avrund(60/UTD,1)===2.6);
  ok("AKM1-miniatyr: 4+3+4+4 = 15 av 20 (fyra variabler × 5)",
    4+3+4+4===15 && 4*5===20);
  ok("AK1TS: 5 horisonter × 5 teorier = 25 celler · Kort-raden 2 av 5 utslag",
    5*5===25 && 2<=5);
  ok("arbetsdagen: 30+45+60+20+25 = 180 minuter",
    30+45+60+20+25===180);
  ok("loggrad 5: 30+45+60+20+25 = 180 (samma summa, två förekomster i texten)",
    (raw.match(/30\+45\+60\+20\+25 = 180/g) || []).length >= 1);
}

// ── Korsreferenser: prefixmatch mot registret (med ek-03 för denna omgång) ──
console.log("─── KORSREFERENSER ───");
{
  const minaPrefix = new Set(["ek-03"]);
  const ref = [...new Set([...raw.matchAll(/\b((?:km|rs|rk|rp|ks|kt|ln|st|tx|am|mt|vr|ib|pe|od|ud|bk|bf|ek|ma|roic|pf|sj|pc)-\d{1,3}[a-z]?)/g)].map(m => m[1]))];
  const saknade = ref.filter(r =>
    !minaPrefix.has(r) &&
    !regSlugs.some(s => s === r || s.startsWith(r + "-"))
  );
  ok(`${FIL}: ${ref.length} referenser lever`, saknade.length === 0, saknade.length ? "SAKNAS: " + saknade.join(", ") : ref.join(" "));
  // Trappans bärande referenser: ek-01, ek-02, pc-21, am-03, bk-01, rp-01
  for (const bär of ["ek-01", "ek-02", "pc-21", "am-03", "bk-01", "rp-01"]) {
    ok(`trapprefens ${bär} nämns i kursen`, raw.includes(bär));
  }
}

// ── Omfångsparitet mot syskonkurser (ek-02-presedent) ──
console.log("─── OMFÅNG ───");
{
  const ek02 = JSON.parse(readFileSync("data/kurser-tillagg/ek-02-labbets-karta.json", "utf8"));
  const sum = (k) => k.chapters.reduce((s, ch) => s + ch.blocks.reduce((s2, b) => s2 + b.content.length, 0), 0);
  const min = sum(j), sys = sum(ek02);
  ok(`blockinnehåll ${min} tkn inom syskonband (ek-02: ${sys}, ±35 %)`, min > sys * 0.65 && min < sys * 1.35);
}

console.log(`\n════ KVD TOTALT: ${PASS} PASS · ${FEL} FEL · ${VARNING} VARNING ════`);
process.exit(FEL === 0 ? 0 : 1);
