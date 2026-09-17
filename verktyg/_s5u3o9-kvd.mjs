#!/usr/bin/env node
/**
 * KVD — s5-u3 omgång 9 (2026-09-17): rp-01 + ks-04 + od-02.
 * Maskinell kvalitetsgrind före register: aritmetik (varje tal kontrollräknat),
 * strukturparitet chapters_list↔chapters, juridikgrind (rådsfraser), korsreferenser
 * (prefixmatch mot registret) och språkgrind (CJK, mjuka bindestreck, engelskläckor).
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const regSlugs = Object.keys(register);
const fila = ["rp-01-riskmattens-karta", "ks-04-konvertibler-och-hybridkapital", "od-02-implicit-volatilitet"];
let PASS = 0, FEL = 0, VARNING = 0;
const ok = (namn, kond, info = "") => {
  if (kond) { PASS++; console.log(`  PASS ${namn}${info ? " — " + info : ""}`); }
  else { FEL++; console.log(`  FEL  ${namn}${info ? " — " + info : ""}`); }
};
const avrund = (x, dec) => Number(x.toFixed(dec));

console.log("════ KVD s5-u3 omgång 9 ════");

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
  ok("struktur: slug ren ASCII + weight—", /^[a-z0-9][a-z0-9-]*$/.test(j.slug) && j.weight === "—");
  ok("struktur: kategori finns i registret sedan tidigare (familj)",
    regSlugs.some(s => register[s].category === j.category) && !regSlugs.includes(j.slug),
    `${j.category}: ${regSlugs.filter(s => register[s].category === j.category).length + 1} kurser efter insert`);
  ok("struktur: Pfält (why/learn/history/3 sektioner)",
    typeof j.why === "string" && j.why.length > 400 && typeof j.learn === "string" &&
    j.history && j.history.origin && j.history.evolution && j.history.modern &&
    typeof j.lynchSection === "string" && typeof j.grahamSection === "string" && typeof j.ak1Section === "string");

  // ── Språkgrind ──
  ok("språk: 0 CJK", !/[\u4e00-\u9fff\u3040-\u30ff]/.test(raw));
  ok("språk: 0 mjuka bindestreck", !raw.includes("­"));
  const engOrd = (raw.match(/\b(the|and|with|compare|retention|well|behind|possible|earnings|complexity|sell|buy now|price of)\b/gi) || []);
  ok("språk: 0 engelska vardagsläckor", engOrd.length === 0, engOrd.length ? JSON.stringify([...new Set(engOrd)]) : "");

  // ── Juridikgrind ──
  const rad = raw.match(/(rekommenderar|råder dig|du bör köpa|du bör sälja|köp denna|sälj denna|investera i denna|köp aktien|sälj aktien|nöj dig med|agera nu)/gi) || [];
  ok("juridik: 0 rådsfraser", rad.length === 0, rad.length ? JSON.stringify(rad) : "");
}

// ── Aritmetik maskinell: rp-01 ──
console.log("\n─── ARITMETIK rp-01 ───");
{
  const A = [4, 6, 10, 12], B = [-14, 6, 18, 22];
  const medel = x => x.reduce((a, b) => a + b, 0) / x.length;
  const std = x => Math.sqrt(x.map(v => (v - medel(x)) ** 2).reduce((a, b) => a + b, 0) / x.length);
  ok("medel A = 8,0", avrund(medel(A), 1) === 8.0);
  ok("medel B = 8,0", avrund(medel(B), 1) === 8.0);
  ok("std A: √10 = 3,16", avrund(std(A), 2) === 3.16, `√${avrund(std(A)**2,1)} — avvikelser −4,−2,+2,+4; kvadrater 16+4+4+16=40; 40/4=10`);
  ok("std B: √196 = 14,0", avrund(std(B), 1) === 14.0, "kvadrater 484+4+100+196=784; 784/4=196; √196=14,0 exakt");
  ok("kvot B/A = 4,4", avrund(std(B) / std(A), 1) === 4.4);
  ok("beta 8/5 = 1,6 och 3,5/5 = 0,7", 8/5 === 1.6 && 3.5/5 === 0.7);
  ok("beta-förstärkning: 1,6×10 = 16; dämpning 0,7×10 = 7", 1.6*10 === 16 && 0.7*10 === 7);
  ok("Sharpe A: (8−2)/3,16 → 1,90", avrund((8-2)/std(A), 2) === 1.9, String(avrund((8-2)/std(A), 2)));
  ok("Sharpe B: (8−2)/14,0 → 0,43", avrund((8-2)/std(B), 2) === 0.43);
  ok("drawdown −38: 100/62−1 = 61,3 %", avrund((100/62 - 1) * 100, 1) === 61.3);
  ok("trappa: −10→11,1 · −20→25,0 · −50→100,0",
    avrund((100/90-1)*100, 1) === 11.1 && avrund((100/80-1)*100, 1) === 25 && avrund((100/50-1)*100, 1) === 100);
  const dowFall = (1 - 41.22/381.17) * 100, dowTillbaka = (381.17/41.22 - 1) * 100;
  ok("Dow 1929–1932: −89,2 % och +824,7 % tillbaka",
    avrund(dowFall, 1) === 89.2 && avrund(dowTillbaka, 1) === 824.7, `${avrund(dowFall,1)} % / +${avrund(dowTillbaka,1)} %`);
}

// ── Aritmetik maskinell: ks-04 ──
console.log("\n─── ARITMETIK ks-04 ───");
{
  ok("1 000/125 = 8 aktier", 1000/125 === 8);
  ok("aktie 160: 8 × 160 = 1 280 → +28,0 %", 8*160 === 1280 && avrund((1280/1000-1)*100, 1) === 28.0);
  ok("aktie 100: 8 × 100 = 800 (byte = −200)", 8*100 === 800 && 1000-800 === 200);
  ok("paritet: 8 × 125 = 1 000", 8*125 === 1000);
  ok("kupongbesparing: 5,0 − 2,0 = 3,0 pp = 30 kr/år på 1 000", (5.0-2.0) === 3.0 && 0.03*1000 === 30);
  ok("preferens: 6,50/0,065 = 100", avrund(6.50/0.065, 0) === 100);
  ok("preferens: 6,50/0,078 = 83,3 → fall 16,7 %", avrund(6.50/0.078, 1) === 83.3 && avrund((1-83.3/100)*100, 1) === 16.7);
  ok("motsatt håll: 6,50/83,3 = 7,8 % (stänger)", avrund(6.50/83.3*100, 1) === 7.8);
  ok("stämpel: 70−60 = 10; 10/25 = 40 %", 70-60 === 10 && 10/25 === 0.4);
  ok("trappkostnad per tusen: obligation 50 · konvertibel 20 · preferens 65",
    0.05*1000 === 50 && 0.02*1000 === 20 && 0.065*1000 === 65);
}

// ── Aritmetik maskinell: od-02 ──
console.log("\n─── ARITMETIK od-02 ───");
{
  ok("√0,25 = 0,5 och √12 = 3,464", Math.sqrt(0.25) === 0.5 && avrund(Math.sqrt(12), 3) === 3.464);
  ok("prisregel: 0,4 × 100 × 0,20 × 0,5 = 4,0", 0.4*100*0.20*0.5 === 4.0);
  ok("invertering: 5,0/(0,4 × 100 × 0,5) = 25,0 %", 5.0/(0.4*100*0.5)*100 === 25.0);
  ok("volens prisbidrag: (25−20) × 0,4 × 100 × 0,5/100 = 1,0 kr", (25-20)*0.4*100*0.5/100 === 1.0);
  ok("VIX 12 → 3,5 %", avrund(12/3.464, 1) === 3.5);
  ok("VIX 24 → 6,9 %", avrund(24/3.464, 1) === 6.9);
  ok("VIX 80,86 → 23,3 %", avrund(80.86/3.464, 1) === 23.3);
  ok("VIX 82,69 → 23,9 %", avrund(82.69/3.464, 1) === 23.9);
  ok("riskpremie: 22 − 19 = 3 pp", 22-19 === 3);
  ok("smiletabell monoton nedåt: 28>24>20>18>17", [28,24,20,18,17].every((v,i,a) => i===0 || a[i-1] > v));
}

// ── Korsreferenser: prefixmatch mot registret ──
console.log("\n─── KORSREFERENSER ───");
for (const fil of fila) {
  const raw = readFileSync(`data/kurser-tillagg/${fil}.json`, "utf8");
  const ref = [...new Set([...raw.matchAll(/\b((?:km|rs|rk|rp|ks|kt|ln|st|tx|am|mt|vr|ib|pe|od|ud|bk|bf|ek|ma|roic|v|pf|sj)-\d{1,3}[a-z]?)/g)].map(m => m[1]))];
  const saknade = ref.filter(r => r !== fil && !fil.startsWith(r + "-") && !regSlugs.some(s => s === r || s.startsWith(r + "-")));
  ok(`${fil}: ${ref.length} referenser lever`, saknade.length === 0, saknade.length ? "SAKNAS: " + saknade.join(", ") : ref.join(" "));
}

console.log(`\n════ KVD TOTALT: ${PASS} PASS · ${FEL} FEL · ${VARNING} VARNING ════`);
process.exit(FEL === 0 ? 0 : 1);
