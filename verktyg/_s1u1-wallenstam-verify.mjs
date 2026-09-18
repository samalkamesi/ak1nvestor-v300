#!/usr/bin/env node
// _s1u1-wallenstam-verify.mjs — granskningssond för sa-laser-du-wallenstam-q3-2026.json
// LÄSER ENDAST: utkastet, källfilerna (nuläge + git-vintage 9e973f07), varumarke.json.
// Skriver INGET till data/ — allt till stdout. Byggcommit för utkastet: 9e973f07 (s4-u1).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const ut = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wallenstam-q3-2026.json`, "utf8"));
const r = (x) => Math.round(x * 100) / 100;
const rr = (x) => Math.round(x * 1000) / 1000;
let ok = 0, nej = 0;
const K = (namn, villkor, detalj) => { if (villkor) { ok++; console.log(`  GRÖN  ${namn}${detalj ? " — " + detalj : ""}`); } else { nej++; console.log(`  RÖD   ${namn}${detalj ? " — " + detalj : ""}`); } };

console.log("== A. VINTAGE-LÅSNING ==");
const vintageRaw = execFileSync("git", ["-C", ROT, "show", "9e973f07:data/portfolj-system/bolagsunivers.json"], { maxBuffer: 64 << 20 }).toString("utf8");
const vU = JSON.parse(vintageRaw);
const dU = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const vFast = vU.filter((b) => b.bransch === "fastighet");
console.log(`  vintage 9e973f07: ${vU.length} bolag, ${vFast.length} fastighet | idag: ${dU.length} bolag, ${dU.filter((b)=>b.bransch==="fastighet").length} fastighet`);
K("utkastets '126 bolag, varav 12 i fastighet' mot vintage", vU.length === 126 && vFast.length === 12, `${vU.length}/${vFast.length}`);
const vW = vU.find((b) => b.ticker === "WALL-B.ST"); const dW = dU.find((b) => b.ticker === "WALL-B.ST");
const samma = JSON.stringify(vW) === JSON.stringify(dW);
K("WALL B-raden oförändrad vintage→idag", samma, samma ? "" : "SKILLNAD — se fältjämförelse");

console.log("== B. WALL B FÄLT FÖR FÄLT (vintage) ==");
K("pris 41,02", vW.pris === 41.02);
K("börsvärde ~25,9 mdr", r(vW.marknadsKapitalMdr) === 25.92, `${vW.marknadsKapitalMdr}`);
K("P/E 10,005", vW.vardering.pe === 10.005);
K("P/B 0,798", vW.vardering.pb === 0.798);
K("EV/EBIT 32,05→'32,1'", r(vW.vardering.evEbit) === 32.05 || r(vW.vardering.evEbit) === 32.1, `${vW.vardering.evEbit}`);
K("PEG 4,16", vW.vardering.peg === 4.16);
K("FCF-avk 3,73 %", vW.vardering.fcfYield === 0.0373);
K("ROE 8,37 %", vW.lonksamhet.roe === 0.0837);
K("ROIC 2,95 %", vW.lonksamhet.roic === 0.0295);
K("brutto 65,42 %", vW.lonksamhet.bruttoMarginal === 0.6542);
K("EBIT-marg 57,37 %", vW.lonksamhet.ebitMarginal === 0.5737);
K("netto 80,80 %", vW.lonksamhet.nettoMarginal === 0.808);
K("FCF-marg 29,38 %", vW.lonksamhet.fcfMarginal === 0.2938);
K("skuld/EK 1,0747→'1,07'", rr(vW.stabilitet.skuldEgenkapital) === 1.075 || vW.stabilitet.skuldEgenkapital === 1.0747, `${vW.stabilitet.skuldEgenkapital}`);
K("omsCAGR 7,31 %", vW.tillvaxt.omsattningCAGR5ar === 0.0731);
K("resCAGR 32,47 %", vW.tillvaxt.resultatCAGR5ar === 0.3247);
K("TTM 0,9 %", vW.tillvaxt.omsattningTillvaxtTTM === 0.009);
K("prognos 1,82 %", vW.tillvaxt.prognosTillvaxt === 0.0182);
K("NAV-proxy 51,40 (golv)", vW.golv.vardePerAktie === 51.4);
K("golvtyp tillgångstung", vW.golv.typ === "tillgangstung");
K("räntetäckning osatt", vW.stabilitet.rantaTackning === null);
K("utdelningsfält null ×2", vW.aterkop.senasteArMdr === null && vW.aterkop.andelUtestande === null);
K("serier år 2022–2025", JSON.stringify(vW.serier.ar) === JSON.stringify(["2022","2023","2024","2025"]));
K("omsättningsserie 2490/2730/2922/3077 Mkr", JSON.stringify(vW.serier.omsattning) === JSON.stringify([2490000000,2730000000,2922000000,3077000000]));
K("resultatserie 1103/−450/774/2564 Mkr", JSON.stringify(vW.serier.resultat) === JSON.stringify([1103000000,-450000000,774000000,2564000000]));

console.log("== C. MEDIANER (vintagefilen, tre metoder) ==");
const med = (arr, metod) => { const s = arr.filter((v) => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b); if (!s.length) return { v: null, n: 0 }; const m = Math.floor(s.length / 2); const v = s.length % 2 === 1 ? s[m] : (metod === "övre" ? s[m] : (s[m - 1] + s[m]) / 2); return { v, n: s.length }; };
const falt = (b, p) => p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), b);
const medianTabell = (universum, metod) => { const ut = {}; for (const [namn, p] of [["pe","vardering.pe"],["pb","vardering.pb"],["roe","lonksamhet.roe"],["ebit","lonksamhet.ebitMarginal"],["netto","lonksamhet.nettoMarginal"]]) { ut[namn] = { fast: med(universum.filter((b)=>b.bransch==="fastighet").map((b)=>falt(b,p)), metod), univ: med(universum.map((b)=>falt(b,p)), metod) }; } return ut; };
const förväntat = { pe: { f: 11.3, u: 20.5 }, pb: { f: 0.81, u: 2.79 }, roe: { f: 8.37, u: 15.3 }, ebit: { f: 63.9, u: 21.2 }, netto: { f: 46.0, u: 14.7 } };
for (const metod of ["övre", "kanon"]) {
  const t = medianTabell(vU, metod);
  console.log(`  -- metod: ${metod === "övre" ? "övre-mittersta (jämnt)" : "kanon: medel av mittersta"}`);
  for (const namn of ["pe","pb","roe","ebit","netto"]) {
    const fP = namn === "pe" || namn === "pb" ? r(t[namn].fast.v) : r(t[namn].fast.v * 100);
    const uP = namn === "pe" || namn === "pb" ? r(t[namn].univ.v) : r(t[namn].univ.v * 100);
    const träff = Math.abs(fP - förväntat[namn].f) < 0.051 && Math.abs(uP - förväntat[namn].u) < 0.051;
    console.log(`     ${namn.padEnd(6)} fastighet ${String(fP).padStart(7)} (n=${t[namn].fast.n})  universum ${String(uP).padStart(7)} (n=${t[namn].univ.n})  utkast: ${förväntat[namn].f}/${förväntat[namn].u}  ${träff ? "TRÄFF" : "avvikelse"}`);
  }
}
const tK = medianTabell(vU, "kanon"); const tO = medianTabell(vU, "övre");
K("ROE fastighet n=11 (ett bolag saknar fältet)", tK.roe.fast.n === 11, `n=${tK.roe.fast.n}`);

console.log("== D. URVALSMOTIVERING (vintage) ==");
const ores = vU.find((b) => b.ticker === "ORES.ST"); const kinv = vU.find((b) => b.ticker === "KINV-B.ST");
K("Öresund serier icke-kontinuerliga 2013/2014/2018/2019", JSON.stringify(ores.serier.ar) === JSON.stringify(["2013","2014","2018","2019"]), JSON.stringify(ores.serier.ar));
K("Öresund CAGR+prognos null", ores.tillvaxt.omsattningCAGR5ar === null && ores.tillvaxt.resultatCAGR5ar === null && ores.tillvaxt.prognosTillvaxt === null, JSON.stringify(ores.tillvaxt));
K("Kinnevik P/E null", kinv.vardering.pe == null);
K("Kinnevik negativ ROE", typeof kinv.lonksamhet.roe === "number" && kinv.lonksamhet.roe < 0, `${kinv.lonksamhet.roe}`);
const kal = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json`, "utf8"));
const kalW = kal.bolag.find((b) => b.ticker === "WALL-B.ST");
K("kalender: rappdag 2026-10-15", kalW.rapportfenster === "2026-10-15");
K("kalender-not: X-dag 2026-10-27 + bokslut 2027-02-04 + tyst ~30 dagar", kalW.notera.includes("2026-10-27") && kalW.notera.includes("2027-02-04") && kalW.notera.includes("30 dagar"));
K("kalender-not innehåller Cision-citatet 'Interim report Q3, 2026 – October 15, 2026'", kalW.notera.includes("Interim report Q3, 2026 – October 15, 2026"));
const vecko = new Date(Date.UTC(2026, 9, 15)).getUTCDay();
K("2026-10-15 är torsdag", vecko === 4, `getUTCDay=${vecko} (4=torsdag)`);
for (const [tick, pat] of [["NP3.ST","2026-10-16"],["WIHL.ST","2026-10-20/21"],["FABG.ST","2026-10-21"],["CAST.ST","2026-10-22"]]) { const p = kal.bolag.find((b) => b.ticker === tick); K(`kalender ${tick} ${pat}`, p && p.rapportfenster.startsWith(pat.split("/")[0]), p ? p.rapportfenster : "saknas"); }
const domFil = readFileSync(`${ROT}/data/rapporter/vagvalidering-SENASTE.json`, "utf8");
K("WALL B utanför vågvalideringens universum (ingen dom)", !domFil.includes("WALL"));

console.log("== E. ARITMETIK (egna omräkningar) ==");
K("kurs/NAV = 0,798", rr(41.02 / 51.4) === 0.798, `${(41.02 / 51.4).toFixed(5)}`);
K("rabatt ~20 % (1−0,798=20,2 %; filens golv.marginal 0,2019)", Math.abs((1 - 41.02 / 51.4) - 0.2019) < 0.0005, `${((1 - 41.02 / 51.4) * 100).toFixed(2)} %`);
K("identitet 0,798/0,0837 = 9,53", rr(0.798 / 0.0837) === 9.53 || Math.abs(0.798 / 0.0837 - 9.53) < 0.005, `${(0.798 / 0.0837).toFixed(3)}`);
K("differens mot P/E 10,005 = 4,7 %", Math.abs(Math.abs(10.005 - 0.798 / 0.0837) / 10.005 - 0.047) < 0.001, `${(Math.abs(10.005 - 0.798 / 0.0837) / 10.005 * 100).toFixed(2)} %`);
K("omvänd 10,005×0,0837 = 0,837", rr(10.005 * 0.0837) === 0.837, `${(10.005 * 0.0837).toFixed(4)}`);
K("implicit EPS 41,02/10,005 = 4,10", Math.abs(41.02 / 10.005 - 4.1) < 0.005, `${(41.02 / 10.005).toFixed(3)}`);
K("PEG-konvention 10,005/1,82 = 5,50", Math.abs(10.005 / 1.82 - 5.5) < 0.005, `${(10.005 / 1.82).toFixed(3)}`);
K("PEG-kvot 4,16/5,50 = 0,76", Math.abs(4.16 / (10.005 / 1.82) - 0.76) < 0.005, `${(4.16 / (10.005 / 1.82)).toFixed(3)}`);
K("multiplövning 10,005/1,0182 = 9,83", Math.abs(10.005 / 1.0182 - 9.83) < 0.005, `${(10.005 / 1.0182).toFixed(3)}`);
K("oms-CAGR (3077/2490)^(1/3) = 7,31 %", Math.abs((Math.pow(3077 / 2490, 1 / 3) - 1) * 100 - 7.31) < 0.01, `${((Math.pow(3077 / 2490, 1 / 3) - 1) * 100).toFixed(2)} %`);
K("oms-totalt +23,6 %", Math.abs((3077 / 2490 - 1) * 100 - 23.6) < 0.05, `${((3077 / 2490 - 1) * 100).toFixed(2)} %`);
K("årliga steg +9,6/+7,0/+5,3", [2730/2490-1,2922/2730-1,3077/2922-1].every((x,i)=>Math.abs(x*100-[9.6,7.0,5.3][i])<0.05), [2730/2490-1,2922/2730-1,3077/2922-1].map(x=>(x*100).toFixed(2)).join("/"));
K("res-CAGR (2564/1103)^(1/3) = 32,47 %", Math.abs((Math.pow(2564 / 1103, 1 / 3) - 1) * 100 - 32.47) < 0.01, `${((Math.pow(2564 / 1103, 1 / 3) - 1) * 100).toFixed(2)} %`);
const EBIT = 3077 * 0.5737;
K("EBIT 2025 ≈ 1 765 Mkr", Math.abs(EBIT - 1765) < 1, `${EBIT.toFixed(1)}`);
K("netto−EBIT ≈ 800 Mkr", Math.abs(2564 - EBIT - 800) < 1, `${(2564 - EBIT).toFixed(1)}`);
let cellOk = 0; const cellFel = [];
for (const [oms, oetik] of [[2984.7,"2 984,7"],[3077.0,"3 077,0"],[3169.3,"3 169,3"]]) for (const [m, metav] of [[0.5637,"56,37"],[0.5737,"57,37"],[0.5837,"58,37"]]) { const v = oms * m; const förv = { "2 984,7": {"56,37":1682.4,"57,37":1712.5,"58,37":1742.5}, "3 077,0": {"56,37":1734.5,"57,37":1765.3,"58,37":1796.0}, "3 169,3": {"56,37":1786.6,"57,37":1818.1,"58,37":1849.8} }[oetik][metav]; if (Math.abs(v - förv) < 0.051) cellOk++; else cellFel.push(`${oetik}×${metav}: ${v.toFixed(1)} vs ${förv}`); }
K("scenarioruta 9/9 celler", cellOk === 9, cellFel.join("; ") || "alla exakta");
K("1 pp marginal ≈ 31 Mkr", Math.abs(3077 * 0.01 - 31) < 0.5, `${(3077 * 0.01).toFixed(1)}`);
const treProcent = 3077 * 0.03 * 0.5737;
K("3 % intäkter ≈ 53 Mkr", Math.abs(treProcent - 53) < 0.5, `${treProcent.toFixed(1)}`);
K("intäktsratten 1,7× tyngre", Math.abs(treProcent / (3077 * 0.01) - 1.7) < 0.03, `${(treProcent / (3077 * 0.01)).toFixed(2)}`);
K("marginalvikt 0,58", Math.abs(3077 * 0.01 / treProcent - 0.58) < 0.005, `${(3077 * 0.01 / treProcent).toFixed(3)}; Essity-formeln 1/(3×0,5737)=${(1 / (3 * 0.5737)).toFixed(3)}`);
const EK = 25.924 / 0.798; const aktier = 25.924 / 41.02;
K("konsistens EK: NAV×aktier = MV/PB", Math.abs(aktier * 51.4 - EK) < 0.05, `EK=${EK.toFixed(2)} mdr, NAV-väg=${(aktier * 51.4).toFixed(2)}`);
console.log(`  NOTIS (ingen rättning): ROE-kors 2564/${EK.toFixed(1)} = ${((2.564 / EK) * 100).toFixed(1)} % mot fältets 8,37 % (def.skillnad senaste/medel-EK — ${Math.abs(2.564 / EK / 0.0837 - 1) * 100 < 0.06 ? "inom" : "utanför"} 6 %-band)`);
const skuld = 1.0747 * EK; const EV = 25.924 + skuld;
console.log(`  NOTIS: EV-kors (MV+skuld)/EBIT = ${(EV / EBIT).toFixed(1)} mot fältets 32,05 — paketet citerar endast fältet`);

console.log("== F. JURIDIK (2007:528) ==");
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
const hela = [ut.title, ut.description, ut.body].join("\n");
let fel = 0, varn = 0;
for (const f of vm.forbjudnaFraser) { const re = new RegExp(f.fran, "gi"); const n = (hela.match(re) || []).length; if (n) { if (f.allvar === "FEL") fel++; else varn++; console.log(`  TRÄFF [${f.allvar}] /${f.fran}/ ×${n}`); } }
K(`varumärkesgrind 26 regexer: 0 FEL 0 varningar`, fel === 0 && varn === 0, `FEL=${fel} varn=${varn}`);
for (const ord of ["köp", "köpa", "sälj", "sälja", "rekommendation", "bör du", "borde"]) { const re = new RegExp(`\\b${ord}\\b`, "gi"); const ix = [...hela.matchAll(re)]; if (ix.length) { console.log(`  rådord '${ord}' ×${ix.length}:`); for (const m of ix.slice(0, 6)) console.log(`    …${hela.slice(Math.max(0, m.index - 55), m.index + 60).replace(/\n/g, " ")}…`); } }
const lagrum = ["2007:528", "2022:260", "2022:261", "1985:716", "2005:59", "2022:482", "GDPR"];
for (const l of lagrum) console.log(`  lagrum ${l}: ${(hela.match(new RegExp(l, "g")) || []).length} träff(ar)`);
K("endast 2007:528 förekommer", ["2022:260","2022:261","1985:716","2005:59","2022:482","GDPR"].every((l) => !(new RegExp(l).test(hela))));
const p911 = ["911", "9/11", "11 september", "september 11", "nine-eleven", "9-1-1"];
let t911 = 0; for (const p of p911) { const n = (hela.match(new RegExp(p.replace(/\//g, "\\/"), "gi")) || []).length; t911 += n; if (n) console.log(`  911-mönster '${p}' ×${n}`); }
K("911-kontroll: 0 träffar på 6 mönster", t911 === 0, `totalt ${t911}`);

console.log("== G. STRUKTUR ==");
K("9 fält (BlogPost-kontrakt)", ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"].every((k) => k in ut));
K("slug = filnamn", ut.slug === "sa-laser-du-wallenstam-q3-2026");
K("pillar/author", ut.pillar === "Institutionell metodik" && ut.author === "AK1A Research Lab");
K("publishedAt = rappdag 2026-10-13 (dagen-före-praxis)", ut.publishedAt === "2026-10-13");
const ord = ut.body.split(/\s+/).filter(Boolean).length;
console.log(`  ord i body: ${ord} (byggcommiten angav 2 634) · title ${ut.title.length} tkn · desc ${ut.description.length} tkn · readingMinutes ${ut.readingMinutes}`);
K("ord ≥ 2 600 (angivet 2 634)", Math.abs(ord - 2634) <= 30, `${ord}`);
const h2 = (ut.body.match(/^## /gm) || []).length;
console.log(`  H2-rubriker: ${h2} · mjuka bindestreck: ${(ut.body.match(/\u00AD/g) || []).length} · body ≥ 800 tkn: ${ut.body.length >= 800}`);
K("disclaimer sista rad: negerad 2007:528", /2007:528/.test(ut.body.slice(-700)) && /inte investeringsrådgivning/.test(ut.body.slice(-700)));
console.log(`\nSUMMA: ${ok} GRÖNA, ${nej} RÖDA`);
