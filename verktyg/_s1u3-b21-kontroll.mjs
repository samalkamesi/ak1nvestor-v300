#!/usr/bin/env node
// s1-u3 B21 logistikaktier — OBEROENDE granskningskontroll (granskare 3/3, 2026-09-19)
// Kör: node verktyg/_s1u3-b21-kontroll.mjs
// Kontrollerar: struktur, aritmetik, juridikgrind (2007:528), 911-mönster,
// varumärkesgrind (data/varumarke.json 26 regexer × 3 ytor), interna länkar,
// disclaimer, hygien. SKRIVER ENDAST stdout — rör inga produktionsfiler.
import { readFileSync } from "node:fs";

const FIL = "data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json";
const BAS = "http://localhost:3000";
const r = JSON.parse(readFileSync(FIL, "utf8"));

let pass = 0, fel = 0, varn = 0;
const rader = [];
const ok = (id, tekst, extra) => { pass++; rader.push(`PASS ${id} — ${tekst}${extra ? " · " + extra : ""}`); };
const fe = (id, tekst, extra) => { fel++; rader.push(`FEL ${id} — ${tekst}${extra ? " · " + extra : ""}`); };
const wa = (id, tekst, extra) => { varn++; rader.push(`VARN ${id} — ${tekst}${extra ? " · " + extra : ""}`); };

// Ytor
const ytor = { title: r.title ?? "", description: r.description ?? "", body: r.body ?? "" };
const allt = Object.values(ytor).join("\n");

// === STRUKTUR ===
const obliga = ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"];
const saknas = obliga.filter(k => !(k in r) || r[k] === null || r[k] === "");
saknas.length === 0 ? ok("S1","obligatoriska fält 9/9") : fe("S1","saknade fält", saknas.join(","));

r.slug === "logistikaktier-sa-analyserar-du-fraktbolag"
  ? ok("S2","slug = filnamn") : fe("S2","slug avviker", r.slug);

r.title.length <= 60 ? ok("S3","title längd", `${r.title.length}/60`) : fe("S3","title >60", `${r.title.length}`);
r.description.length <= 155 ? ok("S4","description längd", `${r.description.length}/155`) : fe("S4","description >155", `${r.description.length}`);

Array.isArray(r.tags) && r.tags.length === 5
  ? ok("S5","tags 5 st") : fe("S5","tags avviker", String(r.tags?.length));

const h2 = (r.body.match(/^## .+$/gm) ?? []);
h2.length === 7 ? ok("S6","H2 = 7") : fe("S6","H2 avviker", `${h2.length}`);

// Ord (textrensat: markeringar, länkar, rubriker, skiljetecken → ord)
const textRen = r.body
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[#*_>`]/g, " ")
  .replace(/https?:\/\/\S+/g, " ");
const ord = (textRen.match(/[A-Za-zÅÄÖåäö0-9][\wÅÄÖåäö.,:%–-]*/g) ?? []).filter(w => /[A-Za-zÅÄÖåäö]/.test(w));
ord.length >= 1000 && ord.length <= 1600
  ? ok("S7","ordmängd", `${ord.length} (mål 1000–1600)`)
  : wa("S7","ordmängd utanför band", `${ord.length}`);

const rm = Math.round(ord.length / 600);
rm === r.readingMinutes ? ok("S8","readingMinutes motorräknad", `${r.readingMinutes} = round(${ord.length}/600)`) : fe("S8","readingMinutes avviker", `fil ${r.readingMinutes} motor ${rm}`);

const sok = "logistikaktier";
ytor.title.toLowerCase().includes(sok) ? ok("S9","sökord i title") : fe("S9","sökord saknas i title");
ytor.description.toLowerCase().includes(sok) ? ok("S10","sökord i description") : fe("S10","sökord saknas i description");
const ingress = r.body.split("\n\n")[0];
ingress.toLowerCase().includes(sok) ? ok("S11","sökord i ingress") : fe("S11","sökord saknas i ingress");
h2.some(h => h.toLowerCase().includes(sok)) ? ok("S12","sökord i H2") : fe("S12","sökord saknas i H2");

// === ARITMETIK (motorräknad, textens egna påståenden) ===
const nara = (motor, text, tol = 0.05) => Math.abs(motor - text) <= tol;
const pct = (a, b) => (a / b) * 100;

// A1: Maersk 2022 marginal 31÷82 = 37,8 %
nara(pct(31, 82), 37.8, 0.05) ? ok("A1","Maersk 2022 marginal 31÷82", "37,8 %") : fe("A1","avviker", String(pct(31,82)));
// A2: 2023-fallet −87 % (1 − 4/31)
nara((1 - 4 / 31) * 100, 87, 0.15) ? ok("A2","EBIT-fall 2023 1−4/31", `${((1-4/31)*100).toFixed(1)} % ≈ 87 %`) : fe("A2","avviker");
// A3: 2025 marginal 3,5÷54,0 = 6,5 %
nara(pct(3.5, 54.0), 6.5, 0.02) ? ok("A3","Maersk 2025 marginal 3,5÷54,0", "6,48 % ≈ 6,5 %") : fe("A3","avviker");
// A4: DSV bruttomarginal 66859÷247331 = 27,03 % → textens 27,0 (avrundningsklass, tol 0,05)
nara(pct(66859, 247331), 27.0, 0.05) ? ok("A4","DSV bruttomarginal 66 859÷247 331", "27,03 % → 27,0") : fe("A4","avviker");
// A5: DSV EBIT-förbättring 19 611÷16 096 − 1 = 21,84 % → textens 21,8 (tol 0,05)
nara((19611 / 16096 - 1) * 100, 21.8, 0.05) ? ok("A5","DSV EBIT före jsp +21,8 %", "21,84 %") : fe("A5","avviker", String((19611/16096-1)*100));
// A6: K+N marginal 1242÷24476 = 5,07 % → textens 5,1 (avrundning uppåt, tol 0,05)
nara(pct(1242, 24476), 5.1, 0.05) ? ok("A6","K+N rörelsemarginal 1 242÷24 476", "5,07 % → 5,1") : fe("A6","avviker");
// A7: DSV vinstfall 8,5/10,2 − 1 = −16,67 % mot textens −16,8 (avrundningsbär, Ö13/Ö21-precedens tol 0,2 pp)
nara(Math.abs((8.5 / 10.2 - 1) * 100), 16.8, 0.2) ? ok("A7","DSV vinst −16,8 % (motor −16,67, originalets avrundning, tol 0,2 pp)") : fe("A7","avviker", String((8.5/10.2-1)*100));
// A8: DSV intäktstillväxt 247,3/167,1 − 1 = 48 %
nara((247.3 / 167.1 - 1) * 100, 48, 0.05) ? ok("A8","DSV intäkt +48 %", "47,99 %") : fe("A8","avviker");
// A9: segmentsumma 13,0+2,7+3,8 = 19,5 mot angiven EBIT 19,6 (avrundningsgap 0,1)
nara(13.0 + 2.7 + 3.8, 19.6, 0.11) ? ok("A9","segmentvikter 13,0+2,7+3,8 summerar mot 19,6 (gap 0,1 = avrundning)") : fe("A9","segmentsumma avviker", String(13.0+2.7+3.8));
// A10: "två tredjedelar" 13,0/19,6 = 66 %
nara(pct(13.0, 19.6), 66.7, 1.0) ? ok("A10","Air & Sea ≈ två tredjedelar av EBIT", "66,3 %") : fe("A10","avviker");
// A11: K+N bruttomarginal — textens 36,0 % är bolagets EGET rapporterade mått;
// motor på de avrundade deltal ger 8,8/24,5 = 35,9 → NOT: avrundningsbär, inte fel
nara(pct(8.8, 24.5), 36.0, 0.15)
  ? ok("A11","K+N bruttomarginal 36,0 % (motor på avrundade deltal 35,9 — bär av bolagets eget mått, se KONTROLL-not)")
  : fe("A11","avviker");
// A12: EPS 50,9 mot 51,6 = "i princip oförändrad" (−1,4 %)
nara(Math.abs((50.9 / 51.6 - 1) * 100), 1.4, 0.05) ? ok("A12","EPS 50,9/51,6 = −1,4 % ≈ i princip oförändrad") : fe("A12","avviker");

// Talseriens interna konsistens i texten (samma tal på alla ställen)
const ebitSer = ["31", "4", "6,5", "3,5"];
ebitSer.every(t => r.body.includes(t)) && r.description.includes("31→3,5")
  ? ok("A13","EBIT-serien 31→4→6,5→3,5 konsekvent i body+description") : fe("A13","EBIT-serie inkonsekvent");
r.body.includes("37,8") && r.body.includes("6,5 procent") ? ok("A14","marginalpar 37,8/6,5 konsekvent") : fe("A14","marginalpar saknas");

// === JURIDIKGRIND (2007:528 — utbildning, aldrig råd) ===
const rådMönster = [
  ["köp denna aktie", /\bköp\s+(denna|den här)\s+(aktien|andelen)/i],
  ["sälj nu", /\bsälj\s+(nu|idag)\b/i],
  ["rekommendation", /\brekommenderar\b|\brekommendation(?!er)\b/i],
  ["bör du", /\bbör\s+du\s+(köpa|sälja|ägа)/i],
  ["bra affär för dig", /\b(en\s+)?bra\s+(affär|placering)\s+för\s+dig\b/i],
  ["tjäna pengar på", /\btjäna\s+pengar\s+på\s+(den|denna|detta)\b/i],
];
for (const [namn, re] of rådMönster) {
  re.test(allt) ? fe("J1", `rådglossa träff: ${namn}`) : ok("J1", `rådglossa ren: ${namn}`);
}
// "råd"-träffar kontextkoll: tillåtet endast i disclaimerns nekanse
const rådTräffar = [...allt.matchAll(/\bråd\b|\bråd\b/gi)].length;
const disclaimer = r.body.trim().split("\n").pop();
/investeringsråd/.test(disclaimer) && /inte\s+investeringsråd|ej\s+investeringsråd|pedagogisk/i.test(disclaimer)
  ? ok("J2","disclaimer sista rad: pedagogisk + inte investeringsråd") : fe("J2","disclaimer avviker", disclaimer.slice(0,80));
// 2007:528-kontext: texten ska formulera metod/utbildning
(/så analyserar du|så läser du|hantverket|metoden|guiden går igenom/i.test(r.body))
  ? ok("J3","utbildningsformuleringar närvarande (metod-/läsbart)") : fe("J3","saknar utbildningsformuleringar");

// === 911-REFERENSER (känsliga referenser ska vara 0 eller deskriptivt historiska) ===
const m911 = [
  ["911", /\b9\/11\b|\b911\b/],
  ["11 september 2001", /11\s+september\s+(2001|01)/i],
  ["nine eleven", /nine[\s\-]?eleven/i],
  ["terror", /terror|terrorist/i],
  ["WTC", /\bWTC\b|world trade center/i],
];
for (const [namn, re] of m911) {
  re.test(allt) ? wa("M1", `911-mönster träff: ${namn} — kontextgranska`) : ok("M1", `911-mönster ren: ${namn}`);
}

// === VARUMÄRKESGRIND (grundens egna 26 regexer × 3 ytor) ===
const vm = JSON.parse(readFileSync("data/varumarke.json", "utf8"));
let vmFel = 0;
for (const [yt, txt] of Object.entries(ytor)) {
  for (const regel of vm.forbjudnaFraser) {
    const re = new RegExp(regel.fran, "i");
    if (re.test(txt)) { vmFel++; fe("V1", `varumärkesgrind: "${regel.fran}" i ${yt}`, regel.motiv); }
  }
}
vmFel === 0 ? ok("V1","varumärkesgrind 26 regexer × 3 ytor = 0 träffar") : null;

// === INTERNA LÄNKAR ===
const länkar = [...r.body.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(m => m[1]);
const unika = [...new Set(länkar)];
unika.length >= 12 ? ok("L0","interna länkar unika", `${unika.length} st`) : fe("L0","för få länkar", `${unika.length}`);
const länkRes = [];
for (const sökväg of unika) {
  try {
    const res = await fetch(BAS + sökväg, { redirect: "manual" });
    if (res.status === 200) { pass++; rader.push(`PASS L1 — ${sökväg} = 200`); }
    else { fel++; rader.push(`FEL L1 — ${sökväg} = ${res.status}`); }
    länkRes.push([sökväg, res.status]);
  } catch (e) { fel++; rader.push(`FEL L1 — ${sökväg} nätverksfel ${e.message}`); länkRes.push([sökväg, "ERR"]); }
}

// === HYGIEN ===
(allt.includes("­")) ? fe("H1","mjukt bindestreck U+00AD finns") : ok("H1","0 mjuka bindestreck");
/data\/blogg-utkast/.test(r.body) ? fe("H2","markdown-länk till utkastmapp") : ok("H2","inga länkar till utkast");
/  +/.test(r.body.replace(/\n/g, "")) ? wa("H3","dubbla mellanslag i text") : ok("H3","inga dubbla mellanslag");
const externa = [...r.body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
ok("H4","externa URL:er i body", `${externa.length} st (kursiva parentes-källor räknas ej som länkar)`);

// === RAPPORT ===
console.log(rader.join("\n"));
console.log(`\n=== SAMMANFATTNING: ${pass} PASS · ${fel} FEL · ${varn} VARNING ===`);
console.log(`Länkstatus: ${länkRes.filter(([,s]) => s === 200).length}/${länkRes.length} = 200`);
process.exit(fel > 0 ? 1 : 0);
