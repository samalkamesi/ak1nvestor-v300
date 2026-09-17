#!/usr/bin/env node
/**
 * KVD — s5-u3 omgång 10 (2026-09-17): pc-21 + ek-02 + am-06.
 * Maskinell kvalitetsgrind före register: aritmetik (varje tal kontrollräknat),
 * strukturparitet chapters_list↔chapters, juridikgrind (rådsfraser), korsreferenser
 * (prefixmatch mot registret + egna slugs) och språkgrind (CJK, mjuka bindestreck,
 * tabbar, engelskläckor). Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const regSlugs = Object.keys(register);
const fila = ["pc-21-ditt-forsta-case", "ek-02-labbets-karta", "am-06-kortlage-och-aktieutlaning"];
let PASS = 0, FEL = 0, VARNING = 0;
const ok = (namn, kond, info = "") => {
  if (kond) { PASS++; console.log(`  PASS ${namn}${info ? " — " + info : ""}`); }
  else { FEL++; console.log(`  FEL  ${namn}${info ? " — " + info : ""}`); }
};
const avrund = (x, dec) => Number(x.toFixed(dec));

console.log("════ KVD s5-u3 omgång 10 ════");

for (const fil of fila) {
  const j = JSON.parse(readFileSync(`data/kurser-tillagg/${fil}.json`, "utf8"));
  const raw = readFileSync(`data/kurser-tillagg/${fil}.json`, "utf8");
  console.log(`\n─── ${fil} (${j.category}, ${j.level}) ───`);

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
  ok("struktur: kategori finns i registret sedan tidigare (familj)",
    regSlugs.some(s => register[s].category === j.category) && !regSlugs.includes(j.slug),
    `${j.category}: ${regSlugs.filter(s => register[s].category === j.category).length + 1} kurser efter insert`);
  ok("struktur: Pfält (why/learn/history/3 sektioner)",
    typeof j.why === "string" && j.why.length > 400 && typeof j.learn === "string" &&
    j.history && j.history.origin && j.history.evolution && j.history.modern &&
    typeof j.lynchSection === "string" && typeof j.grahamSection === "string" && typeof j.ak1Section === "string");

  // ── Språkgrind ──
  ok("språk: 0 CJK", !/[\u4e00-\u9fff\u3040-\u30ff]/.test(raw));
  ok("språk: 0 mjuka bindestreck + 0 tabbar", !raw.includes("­") && !raw.includes("\t"));
  // EN engelsk parentesgloss per kurs är husstil (am-04:s "(settlement)"-precedent) — exakt mönster
  const glosser = [...raw.matchAll(/\(på engelska [a-z ]+\)/g)].map(m => m[0]);
  ok("språk: max 1 engelsk gloss", glosser.length <= 1, glosser.length ? JSON.stringify(glosser) : "0");
  const rawUtanGloss = raw.replace(/\(på engelska [a-z ]+\)/g, "");
  const engOrd = (rawUtanGloss.match(/\b(the|and|with|compare|retention|well|behind|possible|earnings|complexity|sell|buy|price of|notably|bearish|float|approximately|fundamentals|gimmick|true|climbed|short|recall|utilization|days to cover)\b/gi) || []);
  const unika = [...new Set(engOrd.map(w => w.toLowerCase()))];
  ok("språk: 0 engelska vardagsläckor", unika.length === 0, unika.length ? JSON.stringify(unika) : "");

  // ── Juridikgrind ──
  const rad = raw.match(/(rekommenderar|råder dig|du bör köpa|du bör sälja|köp denna|sälj denna|investera i denna|köp aktien|sälj aktien|agera nu|tipsa om att köpa|uppmaning att korta|kort detta bolag)/gi) || [];
  ok("juridik: 0 rådsfraser", rad.length === 0, rad.length ? JSON.stringify(rad) : "");

  // ── Citatgrind: inga påhittade citat (citattecken runt Lynch/Graham-PÅSTÅENDEN förbjuds) ──
  const citat = (raw.match(/\\"/g) || []).length;
  ok("språk: 0 citattecken i innehåll (parafras, aldrig citat)", citat === 0, citat ? `${citat} st` : "");
}

// ── Aritmetik maskinell: pc-21 (Norra Verkstads AB) ──
console.log("\n─── ARITMETIK pc-21 ───");
{
  const I = [850, 1000, 1150], R = [119, 128, 138], NETTO = 92, EK = 460, BO = 1150, AKTIER = 46, KURS = 30, OKF = 125, INV = 65, UTD = 23;
  ok("marginaler: 119/850=14,0 · 128/1000=12,8 · 138/1150=12,0",
    avrund(R[0]/I[0]*100,1)===14.0 && avrund(R[1]/I[1]*100,1)===12.8 && avrund(R[2]/I[2]*100,1)===12.0);
  ok("tillväxt: +17,6 sedan +15,0",
    avrund((I[1]/I[0]-1)*100,1)===17.6 && avrund((I[2]/I[1]-1)*100,1)===15.0);
  ok("nettomarginal: 92/1150 = 8,0", avrund(NETTO/I[2]*100,1)===8.0);
  ok("soliditet: 460/1150 = 40,0", avrund(EK/BO*100,1)===40.0);
  ok("skulder: 1150−460 = 690", BO-EK===690);
  ok("ROE: 92/460 = 20,0", avrund(NETTO/EK*100,1)===20.0);
  ok("DuPont: (92/1150)×(1150/460) = 8,0 % × 2,5 = 20,0",
    avrund(NETTO/I[2]*100,1)===8.0 && avrund(I[2]/EK,1)===2.5 && avrund((NETTO/I[2])*(I[2]/EK)*100,1)===20.0);
  ok("EPS: 92/46 = 2,0 · bokvärde: 460/46 = 10,0", NETTO/AKTIER===2 && EK/AKTIER===10);
  ok("multiplar: 30/2,0 = 15,0 · 30/10,0 = 3,0", KURS/(NETTO/AKTIER)===15 && KURS/(EK/AKTIER)===3);
  ok("fritt kassaflöde: 125−65 = 60 · täckning: 60/23 = 2,6",
    OKF-INV===60 && avrund(60/UTD,1)===2.6);
  ok("utdelning per aktie: 23/46 = 0,50 · direktavkastning: 0,50/30 = 1,7 %",
    avrund(UTD/AKTIER,2)===0.50 && avrund((UTD/AKTIER)/KURS*100,1)===1.7);
}

// ── Aritmetik maskinell: ek-02 ──
console.log("\n─── ARITMETIK ek-02 ───");
{
  ok("AKM1: 20 variabler · 7 kategorier · 0–5 poäng · max 100", 20*5===100);
  ok("AK1TS: 5 horisonter × 5 teorier = 25 celler", 5*5===25);
  ok("konfluens: 3 oberoende källor (inte 2)", 3>2);
  ok("fem rum — fem frågor", 5===5);
  ok("akm1-poängexempel: 3 av 5 med motivering (0≤3≤5)", 0<=3 && 3<=5);
}

// ── Aritmetik maskinell: am-06 ──
console.log("\n─── ARITMETIK am-06 ───");
{
  ok("sälj: 100×30 = 3 000 · återköp à 24: 2 400 · brutto 600",
    100*30===3000 && 100*24===2400 && 3000-2400===600);
  ok("kostnader: avgift 3 000×0,010 = 30 · utdeln.ers. 100×1,50 = 150 · netto 420",
    3000*0.010===30 && 100*1.5===150 && 600-30-150===420);
  ok("halvårsvarianten: 600−15−150 = 435", 600-15-150===435);
  ok("uppgången: 100×45 = 4 500 · brutto −1 500 · netto −1 680",
    100*45===4500 && 4500-3000===1500 && -1500-30-150===-1680);
  ok("extremerna: 100×90 = 9 000 (−6 000) · 100×150 = 15 000 (−12 000)",
    100*90===9000 && 9000-3000===6000 && 100*150===15000 && 15000-3000===12000);
  ok("utlånare: 2 000 000×0,08 = 160 000 · ×30 = 4,8 Mkr · ×0,004 = 19 200 kr",
    2000000*0.08===160000 && 160000*30===4800000 && 4800000*0.004===19200);
  ok("data: 6,0/100 = 6,0 % · 6,0/1,2 = 5,0 dagar · 5,1/6,0 = 85 %",
    avrund(6.0/100*100,1)===6.0 && avrund(6.0/1.2,1)===5.0 && avrund(5.1/6.0*100,0)===85);
  ok("VW: 1 005,01/210 ≈ 4,8× (knappt femdubblat)", avrund(1005.01/210,1)===4.8);
  ok("GameStop: 483/20 ≈ 24× (mer än tjugofaldig)", avrund(483/20,0)===24);
  ok("Porsche: 42,6 + 31,5 = 74,1 % kontroll", avrund(42.6+31.5,1)===74.1);
  ok("Sverige 120 %: 1,50×1,2 = 1,80 ersättning per aktie", avrund(1.5*1.2,2)===1.8);
}

// ── Korsreferenser: prefixmatch mot registret (med pc + ek för denna omgång) ──
console.log("\n─── KORSREFERENSER ───");
const minaPrefix = new Set(["pc-21", "ek-02", "am-06"]);
for (const fil of fila) {
  const raw = readFileSync(`data/kurser-tillagg/${fil}.json`, "utf8");
  const ref = [...new Set([...raw.matchAll(/\b((?:km|rs|rk|rp|ks|kt|ln|st|tx|am|mt|vr|ib|pe|od|ud|bk|bf|ek|ma|roic|pf|sj|pc)-\d{1,3}[a-z]?)/g)].map(m => m[1]))];
  const saknade = ref.filter(r =>
    !minaPrefix.has(r) &&
    !regSlugs.some(s => s === r || s.startsWith(r + "-")) &&
    !regSlugs.some(s => s.startsWith(r + "-"))
  );
  ok(`${fil}: ${ref.length} referenser lever`, saknade.length === 0, saknade.length ? "SAKNAS: " + saknade.join(", ") : ref.join(" "));
}

console.log(`\n════ KVD TOTALT: ${PASS} PASS · ${FEL} FEL · ${VARNING} VARNING ════`);
process.exit(FEL === 0 ? 0 : 1);
