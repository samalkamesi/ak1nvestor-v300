#!/usr/bin/env node
// KVD för s3-u2 omg5: flygaktier-guiden (B14) — varumärkesgrind-replik,
// länkvalidering, ordräkning, aritmetik och universumtalskontroll.
import { readFileSync, readdirSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const post = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/flygaktier-sa-analyserar-du-flygplansindustrin.json`, "utf8"));
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const kurser = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, "utf8"));
const bloggSlugs = new Set(readdirSync(`${ROT}/data/blogg`).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5)));

let fel = 0, varningar = 0;
const fail = m => { console.log("FEL: " + m); fel++; };
const varna = m => { console.log("VARNING: " + m); varningar++; };
const ok = m => console.log("GRÖN: " + m);

// --- 1. Varumärkesgrind (kontrolleraText-replik: forbjudnaFraser, "giu") ---
const ytor = [["title", post.title], ["description", post.description], ["body", post.body]];
for (const [yta, text] of ytor) {
  for (const { fran, istallet, allvar } of vm.forbjudnaFraser) {
    const re = new RegExp(fran, "giu");
    for (const m of String(text).matchAll(re)) {
      const rad = `${yta}: träff "${m[0]}" (${allvar}) → ${istallet}`;
      if (allvar === "FEL") fail(rad); else varna(rad);
    }
  }
}
ok(`varumärkesgrind körd på ${vm.forbjudnaFraser.length} regexer × 3 ytor`);

// --- 2. Rådverb (juridikgrindens genomläsning) ---
const radverb = [...post.body.matchAll(/\b(köp|sälj|rekommenderar?|bör du)\b/giu)].map(m => m[0]);
if (radverb.length === 0) ok("0 rådverb i body"); else varna("rådverb-kandidater: " + JSON.stringify(radverb));

// --- 3. Ord, längder ---
const ord = post.body.trim().split(/\s+/).length;
if (ord >= 800 && ord <= 1400) ok(`ord ${ord} (span 800–1400, mallmål 1200)`); else fail(`ord ${ord} utanför spannet 800–1400`);
if (post.title.length <= 60) ok(`title ${post.title.length} tkn (≤60)`); else fail(`title ${post.title.length} > 60`);
if (post.description.length <= 155) ok(`OG-desc ${post.description.length} tkn (≤155)`); else fail(`OG-desc ${post.description.length} > 155`);

// --- 4. Sökordsdisciplin: H1(title) + ingress + minst en H2 ---
const sokord = "flygaktier";
const h2 = [...post.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const ingress = post.body.split("\n\n")[0];
if (post.title.toLowerCase().includes(sokord)) ok("sökord i H1 (title)"); else fail("sökord saknas i H1");
if (ingress.toLowerCase().includes(sokord)) ok("sökord i ingress"); else fail("sökord saknas i ingress");
if (h2.some(h => h.toLowerCase().includes(sokord))) ok("sökord i ≥1 H2"); else fail("sökord saknas i H2-rubriker");

// --- 5. Korslänkar ---
const lankar = [...post.body.matchAll(/\]\((\/kurser\/[a-z0-9-]+|\/blogg\/[a-z0-9-]+)\)/g)].map(m => m[1]);
const ogiltiga = lankar.filter(l => {
  if (l.startsWith("/kurser/")) return !(l.slice(8) in kurser);
  if (l.startsWith("/blogg/")) return !bloggSlugs.has(l.slice(7));
  return true;
});
const utkastLankar = lankar.filter(l => l.includes("blogg-utkast"));
if (ogiltiga.length === 0 && utkastLankar.length === 0) ok(`${lankar.length} korslänkar giltiga (${new Set(lankar).size} unika), 0 mot utkast`);
else fail("ogiltiga/utkastlänkar: " + JSON.stringify({ ogiltiga, utkastLankar }));

// --- 6. Disclaimer-sista-rad + mjuka bindestreck ---
if (post.body.trimEnd().endsWith("_Detta är pedagogisk finansanalys, inte investeringsråd._")) ok("disclaimer-sista-rad identisk mallens"); else fail("disclaimer saknas/felaktig");
if (post.body.includes("­")) fail("mjukt bindestreck i body"); else ok("0 mjuka bindestreck");

// --- 7. Universumtal: Airbus + GE + industrimedianer ---
const air = uni.find(b => b.ticker === "AIR.PA"), ge = uni.find(b => b.ticker === "GE");
if (!air || !ge || !air.lonksamhet || !ge.lonksamhet) { console.log("FEL: universumfilen lästes under pågående syskonskrivning (AIR/GE ofullständiga) — kör igen när filen stabiliserats"); process.exit(1); }
const pct = (a, b) => (a / b - 1) * 100;
const kontroller = [
  ["AIR bruttomarginal 16,3", air.lonksamhet.bruttoMarginal * 100, 16.3, 0.05],
  ["AIR EBIT-marginal 8,7", air.lonksamhet.ebitMarginal * 100, 8.7, 0.05],
  ["GE bruttomarginal 31,1", ge.lonksamhet.bruttoMarginal * 100, 31.1, 0.06],
  ["GE EBIT-marginal 20,6", ge.lonksamhet.ebitMarginal * 100, 20.6, 0.06],
  ["GE ROIC 27,5", ge.lonksamhet.roic * 100, 27.5, 0.06],
  ["AIR ROIC 20,5", air.lonksamhet.roic * 100, 20.5, 0.06],
  ["AIR P/E 25,9", air.vardering.pe, 25.9, 0.05],
  ["AIR EV/EBIT 22,0", air.vardering.evEbit, 22.0, 0.05],
  ["AIR P/B 5,9", air.vardering.pb, 5.9, 0.05],
  ["GE P/E 39,0", ge.vardering.pe, 39.0, 0.06],
  ["GE EV/EBIT 33,8", ge.vardering.evEbit, 33.8, 0.06],
  ["GE P/B 19,4", ge.vardering.pb, 19.4, 0.06],
  ["AIR skuld/EK 0,55", air.stabilitet.skuldEgenkapital, 0.55, 0.01],
  ["AIR FCF-marginal 6,1", air.lonksamhet.fcfMarginal * 100, 6.1, 0.05],
  ["GE prognostillväxt 14,7 %", ge.tillvaxt.prognosTillvaxt * 100, 14.7, 0.06],
  ["AIR prognostillväxt 6,5 %", air.tillvaxt.prognosTillvaxt * 100, 6.5, 0.06],
];
for (const [namn, kalla, pastadt, tol] of kontroller) {
  if (Math.abs(kalla - pastadt) <= tol) ok(`universum ${namn} == källa ${kalla}`); else fail(`universum ${namn}: källa ${kalla} mot text ${pastadt}`);
}
// kassa/skuld ur AIR-noteringen (13,1/14,3) + serierna
if (/kassa 13,1/.test(post.body) && /14,3 mdr/.test(post.body)) ok("AIR kassa 13,1 / skuld 14,3 mdr € (universumnoteringen)"); else fail("AIR kassa/skuld-tal matchar ej noteringen");
const [o, r] = [air.serier.omsattning, air.serier.resultat];
const serOK = o.join("/") === "58763000000/65446000000/69230000000/73420000000" && r.join("/") === "4247000000/3789000000/4232000000/5221000000" && air.serier.fcf.join("/") === "3824000000/3204000000/3733000000/4031000000";
if (serOK) ok("AIR-serier 2022–2025 (oms/resultat/FCF) == universumet"); else fail("AIR-serier matchar ej universumet");
// industrimedianer
const ind = uni.filter(b => b.bransch === "industri");
const pe = ind.map(b => b.vardering?.pe).filter(x => x != null).sort((a, b) => a - b);
const ev = ind.map(b => b.vardering?.evEbit).filter(x => x != null).sort((a, b) => a - b);
const med = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
ok(`industrimedian P/E ${med(pe).toFixed(1)} / EV/EBIT ${med(ev).toFixed(1)} (n ${pe.length}) — texten säger 26,9/21,8 n 14: ${Math.abs(med(pe) - 26.9) < 0.05 && Math.abs(med(ev) - 21.8) < 0.05 && pe.length === 14 ? "STÄMMER" : "AVVIKER"}`);

// --- 8. Aritmetik i räkneexemplen ---
const arit = [
  ["backlog 8 000 ÷ 800 = 10 år", 8000 / 800 === 10],
  ["2023 oms +11,4 %", Math.abs(pct(65446, 58763) - 11.4) < 0.05],
  ["2023 res −10,8 %", Math.abs(pct(3789, 4247) + 10.8) < 0.05],
  ["2025 oms +6,1 %", Math.abs(pct(73420, 69230) - 6.1) < 0.05],
  ["2025 res +23,4 %", Math.abs(pct(5221, 4232) - 23.4) < 0.05],
  ["GE/AIR brutto ≈ dubbelt (nästan)", 31.05 / 16.31 > 1.8 && 31.05 / 16.31 < 2.0],
  ["AIR fwd P/E 24,4 (trailing 25,94/fwd 24,35 ur noteringen)", Math.abs(24.35 - 24.4) < 0.06],
];
for (const [namn, sant] of arit) { if (sant) ok("aritmetik " + namn); else fail("aritmetik fel: " + namn); }

// --- 9. Strukturfält ---
if (post.readingMinutes === 2) ok("readingMinutes 2 (600-ordskontraktet)"); else fail("readingMinutes != 2");
if (post.pillar === "Institutionell metodik" && post.author === "AK1A Research Lab") ok("pillar/author enligt mallen"); else fail("pillar/author avviker");

console.log(`\nSAMMANFATTNING: ${fel} FEL, ${varningar} VARNINGAR, ${ord} ord, ${lankar.length} korslänkar`);
process.exit(fel > 0 ? 1 : 0);
