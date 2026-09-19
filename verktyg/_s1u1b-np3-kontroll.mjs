#!/usr/bin/env node
// _s1u1b-np3-kontroll.mjs — granskningskontroller för NP3 Q3-läspaketet (s1-u1 instans 2)
// Läser ENDAST (utkast, källor, syskonpaket); skriver ingenting i data/.
import { execSync } from "node:child_process";
import fs from "node:fs";

const R = "/home/ak1a/AK1";
const UT = `${R}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-np3-q3-2026.json`;
const ut = JSON.parse(fs.readFileSync(UT, "utf8"));
const body = ut.body;

const res = [];
const FAIL = [];
function k(id, ok, detalj) {
  res.push({ id, ok, detalj });
  if (!ok) FAIL.push(id + ": " + detalj);
  console.log((ok ? "PASS" : "FAIL") + " " + id + " — " + detalj);
}
const nra = (x, d = 2) => Number(x.toFixed(d));

// ── A. Universumfält: NP3-radens exakthet (aktuell fil + byggvintagen) ───────
const uni = JSON.parse(fs.readFileSync(`${R}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const np3 = uni.find(p => p.ticker === "NP3.ST");
const F = {
  pris: 260, mcap: 16.025, pe: 11.374, pb: 1.422, evEbit: 17.505, peg: null,
  fcfYield: 0.0467, roe: 0.1453, roic: 0.0655, brutto: 0.7594, ebit: 0.7488,
  netto: 0.6404, fcfM: 0.3139, skuldEK: 1.4152, omsCAGR: 0.136, resCAGR: 0.014,
  ttm: 0.101, prognos: -0.057, insider: 0, golv: 182.88,
};
k("A1 pris", np3.pris === F.pris, "260 == " + np3.pris);
k("A2 mcap", np3.marknadsKapitalMdr === F.mcap, "16,025 mdr == " + np3.marknadsKapitalMdr);
k("A3 vardering", np3.vardering.pe === F.pe && np3.vardering.pb === F.pb && np3.vardering.evEbit === F.evEbit && np3.vardering.peg === F.peg && np3.vardering.fcfYield === F.fcfYield, "pe/pb/evEbit/peg/fcfYield exakta");
k("A4 lonksamhet", np3.lonksamhet.roe === F.roe && np3.lonksamhet.roic === F.roic && np3.lonksamhet.bruttoMarginal === F.brutto && np3.lonksamhet.ebitMarginal === F.ebit && np3.lonksamhet.nettoMarginal === F.netto && np3.lonksamhet.fcfMarginal === F.fcfM, "roe/roic/brutto/ebit/netto/fcf exakta");
k("A5 stabilitet+aterkop", np3.stabilitet.skuldEgenkapital === F.skuldEK && np3.stabilitet.rantaTackning === null && np3.aterkop.insiderkopSenaste6man === F.insider, "skuldEK 1,4152 + räntetäckning null + insider 0");
k("A6 tillvaxt", np3.tillvaxt.omsattningCAGR5ar === F.omsCAGR && np3.tillvaxt.resultatCAGR5ar === F.resCAGR && np3.tillvaxt.omsattningTillvaxtTTM === F.ttm && np3.tillvaxt.prognosTillvaxt === F.prognos, "CAGR/TTM/prognos exakta");
k("A7 golv", np3.golv.vardePerAktie === F.golv && np3.golv.typ === "tillgangstung", "182,88 tillgångstung == " + JSON.stringify(np3.golv));
k("A8 serier", JSON.stringify(np3.serier.omsattning) === JSON.stringify([1551000000, 1797000000, 1992000000, 2274000000]) && JSON.stringify(np3.serier.resultat) === JSON.stringify([1224000000, -62000000, 914000000, 1276000000]) && np3.serier.ar.join() === "2022,2023,2024,2025", "intäkts-/resultatserier 2022–2025 exakta");
k("A9 hamtat", np3.hamtat === "2026-09-03" && np3.kallor[0].hamtat === "2026-09-03", "insamlingsdatum 2026-09-03");

// ── B. Aritmetik: serier, steg, CAGR, måttserie ─────────────────────────────
const oms = np3.serier.omsattning, resS = np3.serier.resultat;
const steg = [oms[1]/oms[0]-1, oms[2]/oms[1]-1, oms[3]/oms[2]-1];
k("B1 intäktssteg", nra(steg[0]*100,1)===15.9 && nra(steg[1]*100,1)===10.9 && nra(steg[2]*100,1)===14.2, `+15,9/+10,9/+14,2 == ${nra(steg[0]*100,1)}/${nra(steg[1]*100,1)}/${nra(steg[2]*100,1)}`);
k("B2 total+ CAGR", nra((oms[3]/oms[0]-1)*100,1)===46.6 && nra(((oms[3]/oms[0])**(1/3)-1)*100,2)===13.6, `+46,6 % och 13,60 %/år == ${nra((oms[3]/oms[0]-1)*100,1)} % / ${nra(((oms[3]/oms[0])**(1/3)-1)*100,2)} %`);
k("B3 resultat-ändpunkter", nra((resS[3]/resS[0]-1)*100,1)===4.2 && nra(((resS[3]/resS[0])**(1/3)-1)*100,2)===1.4, `+4,2 % totalt och +1,40 %/år == ${nra((resS[3]/resS[0]-1)*100,1)} / ${nra(((resS[3]/resS[0])**(1/3)-1)*100,2)}`);
const ms = resS.map((r,i) => r/oms[i]*100);
k("B4 måttserie", nra(ms[0],1)===78.9 && nra(ms[1],1)===-3.5 && nra(ms[2],1)===45.9 && nra(ms[3],1)===56.1, `78,9/−3,5/45,9/56,1 == ${ms.map(x=>nra(x,1)).join("/")}`);

// ── C. Identitet, tre vinstvägar, PEG, DuPont ───────────────────────────────
const pb = 1.422, roe = 0.1453, pe = 11.374, mcapM = 16025;
k("C1 identitet", nra(pb/roe)===9.79 && nra((1-(pb/roe)/pe)*100)===-14.0, `1,422÷0,1453=${nra(pb/roe)} ; avvikelse ${nra((1-(pb/roe)/pe)*100,1)} %`);
k("C2 omvänd identitet", nra(pe*roe)===1.65 && nra((pe*roe/pb-1)*100)===16, `11,374×0,1453=${nra(pe*roe)} ; +${nra((pe*roe/pb-1)*100)} %`);
k("C3 implicit EPS", nra(260/pe)===22.86, `260÷11,374=${nra(260/pe)}`);
k("C4 vinstväg 2025", nra(mcapM/1276,1)===12.6, `16 025÷1 276=${nra(mcapM/1276,1)}`);
k("C5 fältimplicerad vinst", nra(mcapM/pe)===1409, `16 025÷11,374=${nra(mcapM/pe)}`);
const ttmV = 2274*1.101*0.6404;
k("C6 TTM-vägen", nra(2274*1.101)===2504 && nra(ttmV)===1603 && nra(mcapM/ttmV,1)===10.0, `2 274×1,101=${nra(2274*1.101)} ; vinst ${nra(ttmV)} ; P/E ${nra(mcapM/ttmV,1)}`);
k("C7 PEG-konvention", nra(pe/(-5.7),1)===-2.0, `11,374÷(−5,7)=${nra(pe/(-5.7),1)}`);
k("C8 DuPont median", nra(11.3*roe)===1.64, `11,3×0,1453=${nra(11.3*roe)}`);
k("C9 P/E-övning", nra(pe/0.943)===12.06, `11,374÷0,943=${nra(pe/0.943)}`);
k("C10 premie", nra((260/182.88-1)*100,1)===42.2 && nra(260/182.88,3)===1.422, `+${nra((260/182.88-1)*100,1)} % ; kvot ${nra(260/182.88,3)}`);

// ── D. Scenarioruta 9 celler + räknesatser + marginalvikt ──────────────────
const intr = [2205.78, 2274, 2342.22], marg = [0.7388, 0.7488, 0.7588];
const förv = [["1629,6","1651,7","1673,7"],["1680,0","1702,8","1725,5"],["1730,4","1753,9","1777,3"]];
let celler = 0;
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
  const v = intr[i] * marg[j];
  const sv = (Math.round(v * 10) / 10).toFixed(1).replace(".", ",");
  if (sv === förv[i][j]) celler++;
  else console.log("  cell " + i + "," + j + ": beräknad " + sv + " väntad " + förv[i][j]);
}
k("D1 rutnät", celler === 9, `9/9 celler == ${celler}/9`);
k("D2 bas-EBIT", nra(2274*0.7488,1)===1702.8, `2 274×74,88 %=${nra(2274*0.7488,1)}`);
k("D3 intäktsnivåer", nra(2274*0.97,1)===2205.8 && nra(2274*1.03,1)===2342.2, `±3 %: ${nra(2274*0.97,1)}/${nra(2274*1.03,1)}`);
k("D4 räknesatser", nra(2274*0.01,1)===22.7 && nra(2274*1.03*0.7488-1702.77,1)===51.1, `1 pp=${nra(2274*0.01,1)} ; 3 %=${nra(2274*1.03*0.7488-1702.77,1)} mkr`);
k("D5 marginalvikt", nra(1/(3*0.7488),2)===0.45 && nra((2274*1.03*0.7488-1702.77)/(2274*0.01),1)===2.2, `1/(3×0,7488)=${nra(1/(3*0.7488),2)} ; kvot ${nra((2274*1.03*0.7488-1702.77)/(2274*0.01),1)}`);

// ── E. Medianer: vintage 09-16 (132 poster) med projektets mediankonvention ─
function median(v) { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a,b)=>a-b); const m = Math.floor(s.length/2); return s.length%2===1 ? s[m] : (s[m-1]+s[m])/2; }
let vintage = null, vcommit = null;
try {
  const commits = execSync(`git -C ${R} log --format="%h %ad" --date=format:"%Y-%m-%d %H:%M" --until="2026-09-16T16:21" -- data/portfolj-system/bolagsunivers.json`, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  if (commits.length) {
    vcommit = commits[0];
    vintage = JSON.parse(execSync(`git -C ${R} show ${vcommit.split(" ")[0]}:data/portfolj-system/bolagsunivers.json`, { encoding: "utf8", maxBuffer: 64*1024*1024 }));
  }
} catch (e) { console.log("  vintage-fel: " + e.message.slice(0, 120)); }
if (vintage) {
  const fast = vintage.filter(p => p.bransch === "fastighet");
  const p = {
    pe: median(fast.map(x => x.vardering?.pe)), pb: median(fast.map(x => x.vardering?.pb)),
    roe: median(fast.map(x => x.lonksamhet?.roe)), ebit: median(fast.map(x => x.lonksamhet?.ebitMarginal)),
    netto: median(fast.map(x => x.lonksamhet?.nettoMarginal)),
    uPe: median(vintage.map(x => x.vardering?.pe)), uPb: median(vintage.map(x => x.vardering?.pb)),
    uRoe: median(vintage.map(x => x.lonksamhet?.roe)), uEbit: median(vintage.map(x => x.lonksamhet?.ebitMarginal)),
    uNetto: median(vintage.map(x => x.lonksamhet?.nettoMarginal)),
  };
  const nRoe = fast.filter(x => typeof x.lonksamhet?.roe === "number").length;
  const n = { pe: vintage.filter(x=>typeof x.vardering?.pe==="number").length, pb: vintage.filter(x=>typeof x.vardering?.pb==="number").length };
  console.log(`  vintage ${vcommit}: ${vintage.length} poster, fastighet ${fast.length} (ROE n=${nRoe}); universum n: pe=${n.pe} pb=${n.pb}`);
  console.log("  medianer: fastighet pe=" + nra(p.pe,2) + " pb=" + nra(p.pb,2) + " roe=" + nra(p.roe*100,2) + " ebit=" + nra(p.ebit*100,1) + " netto=" + nra(p.netto*100,1) + " | universum pe=" + nra(p.uPe,1) + " pb=" + nra(p.uPb,2) + " roe=" + nra(p.uRoe*100,1) + " ebit=" + nra(p.uEbit*100,1) + " netto=" + nra(p.uNetto*100,1));
  k("E1 vintage-storlek", vintage.length === 132, "132 poster == " + vintage.length + " (commit " + vcommit + ")");
  k("E2 fastighetsmedianer", nra(p.pe,1)===11.3 && nra(p.pb,2)===0.81 && nra(p.roe*100,2)===8.37 && nra(p.ebit*100,1)===63.9 && nra(p.netto*100,1)===46.0, "tabellens 11,3/0,81/8,37/63,9/46,0");
  k("E3 universummedianer", nra(p.uPe,1)===21.2 && nra(p.uPb,2)===2.81 && nra(p.uRoe*100,1)===15.6 && nra(p.uEbit*100,1)===21.9 && nra(p.uNetto*100,1)===14.9, "tabellens 21,2/2,81/15,6/21,9/14,9");
  k("E4 ROE-n", nRoe === 11, "n=11 == " + nRoe);
  const pbOver14 = fast.filter(x => (x.vardering?.pb ?? 0) > 1.4).map(x => x.ticker + ":" + x.vardering.pb);
  k("E5 P/B>1,4", pbOver14.length === 2 && pbOver14.some(s=>s.startsWith("NP3")) && pbOver14.some(s=>s.startsWith("PLD")), "endast NP3+PLD: " + pbOver14.join(","));
  const nordisk = fast.filter(x => x.land === "Sverige" || x.land === "Norge" || x.land === "Danmark" || x.land === "Finland");
  const nordiskPremie = nordisk.filter(x => (x.vardering?.pb ?? 0) > 1.05).map(x => x.ticker + ":" + x.vardering.pb);
  k("E6 nordisk premie", nordiskPremie.length === 1 && nordiskPremie[0].startsWith("NP3"), "enda nordiska med klar premie: " + nordiskPremie.join(","));
} else k("E vintage", false, "ingen vintage hittad");

// ── F. Kalenderfakta ────────────────────────────────────────────────────────
const kf = JSON.parse(fs.readFileSync(`${R}/data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json`, "utf8"));
const knp3 = kf.bolag.find(b => b.ticker === "NP3.ST");
k("F1 rappdag", knp3.rapportfenster === "2026-10-16" && knp3.notera.includes("2026-10-16: Interim report January–September 2026"), "officiell kalenderpost 16/10 ordagrant");
k("F2 nästa post", knp3.notera.includes("2027-02-05"), "bokslut 2027-02-05");
k("F3 webcast-sedvana", knp3.notera.includes("presentation/webcast"), "notera bär sedvanan");
const pld = kf.bolag.find(b => b.ticker === "PLD");
k("F4 Prologis", pld.rapportfenster.startsWith("2026-10-15") && pld.notera.includes("Earnings Conference Call"), "15/10 konferensbokning (ej publiceringstid)");
k("F5 Wallenstam 15/10", kf.bolag.find(b => b.ticker === "WALL-B.ST").rapportfenster === "2026-10-15", "ett dygn före NP3");
const kfin = JSON.parse(fs.readFileSync(`${R}/data/blogg-utkast/kvartal/2026-q3/kalender-finans.json`, "utf8"));
const gs = kfin.bolag.find(b => b.ticker === "GS"), jpm = kfin.bolag.find(b => b.ticker === "JPM");
k("F6 JPM/GS 13/10 officiella", jpm.notera.includes("officiellt") && gs.notera.includes("officiellt"), "kalender-finans: 'Datumet är officiellt' ×2 — utkastets 'estimat'-avfärdning FEL");
const nda = kfin.bolag.find(b => b.ticker === "NDA-SE.ST");
k("F7 Nordea 15/10", nda.rapportfenster === "2026-10-15", "dagen-efter-kedjan Wallenstam/Nordea/Ericsson");
const eric = JSON.parse(fs.readFileSync(`${R}/data/blogg-utkast/kvartal/2026-q3/kalender-industri.json`, "utf8")).bolag.find(b => /ERIC/i.test(b.ticker));
k("F8 Ericsson 15/10", eric && eric.rapportfenster === "2026-10-15", "Ericsson " + (eric ? eric.rapportfenster : "saknas"));
const cast = kf.bolag.find(b => b.ticker === "CAST.ST"), wihl = kf.bolag.find(b => b.ticker === "WIHL.ST"), fabg = kf.bolag.find(b => b.ticker === "FABG.ST");
k("F9 nästa fastighet", cast.rapportfenster === "2026-10-22" && cast.notera.includes("Interim Report January-September 2026") && wihl.rapportfenster.includes("estimat") && fabg.rapportfenster === "2026-10-21" && fabg.notera.includes("Inderes"), "Castellum 22/10 officiell; Wihlborgs 20/21 estimat; Fabege 21/10 Inderes");
k("F10 fredag", new Date("2026-10-16").getDay() === 5, "16/10 är fredag");

// ── G. Syskonkorsreferenser ────────────────────────────────────────────────
const wall = JSON.parse(fs.readFileSync(`${R}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wallenstam-q3-2026.json`, "utf8"));
const wu = uni.find(p => p.ticker === "WALL-B.ST");
k("G1 Wallenstam-tal", wu.lonksamhet.roe === 0.0837 && wu.lonksamhet.roic === 0.0295 && nra(wu.stabilitet.skuldEgenkapital)===1.07 && nra(wu.tillvaxt.omsattningCAGR5ar*100,1)===7.3 && nra(wu.lonksamhet.nettoMarginal*100,1)===80.8 && nra(wu.lonksamhet.ebitMarginal*100,1)===57.4, "8,37/2,95/1,07/7,3/80,8/57,4");
k("G2 Wallenstam rabatt", wall.body.includes("51,40") && wall.body.includes("cirka 20 procent under") && nra(wu.pris/wu.golv.vardePerAktie,3)===0.798, "NAV-proxy 51,40 → 0,798 = 20 % under");
k("G3 800-miljoner", wall.body.includes("grovt 800 miljoner kronor"), "korsref övning B finns ordagrant");
k("G4 32,47", wall.body.includes("32,47"), "CAGR-kritikens 32,47 finns");
k("G5 sjunkande P/E", wall.body.includes("delat med 1,0182") && wall.body.includes("sjunker P/E"), "Wallenstams övning: sjunkande P/E (9,83)");
k("G6 NIKE insider", uni.find(p => p.ticker === "NKE").aterkop.insiderkopSenaste6man === 11, "elva transaktioner");
k("G7 P/B-konvergens serie", wall.body.includes("kvoten 0,798, alltså samma läsning som P/B"), "Wallenstam visade kurs÷golv==P/B FÖRE NP3 — 'seriens första' är FALSKT");
const vg = fs.readFileSync(`${R}/data/rapporter/vagvalidering-SENASTE.md`, "utf8");
k("G8 vågvalidering", !/np3/i.test(vg), "NP3 ej i domfilen");
k("G9 analyses", !fs.existsSync(`${R}/data/analyses/np3`), "ingen analysfil (ofullständig sökväg kontrollerad separat)");

// ── H. Struktur: ord, readingMinutes, title/desc ───────────────────────────
const ren = body.replace(/https?:\/\/[^\s)]+/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#*|>-]/g, " ");
const ord = ren.split(/\s+/).filter(w => /[a-zA-Z0-9åäöÅÄÖ]/.test(w)).length;
k("H1 ord", ord >= 2400 && ord <= 3600, `bodyn ${ord} ord`);
k("H2 readingMinutes", ut.readingMinutes === Math.round(ord/600), `round(${ord}/600)=${Math.round(ord/600)} == rm ${ut.readingMinutes}`);
k("H3 title-längd", ut.title.length >= 77 && ut.title.length <= 314, `${ut.title.length} tkn (kvartalsfamilj 77–314)`);
k("H4 desc-längd", ut.description.length <= 1100, `${ut.description.length} tkn (familjepraxis upp till ~1 057)`);

// ── I. Juridik 2007:528 ────────────────────────────────────────────────────
const hela = ut.title + " " + ut.description + " " + body;
const lagrum = hela.match(/20\d\d:\d+/g) || [];
k("I1 lagrum", lagrum.length === 1 && lagrum[0] === "2007:528" && hela.includes("2 kap 5 §"), "endast 2007:528 2 kap 5 §: " + lagrum.join(","));
const verb = [...hela.matchAll(/(rekommender\w*|bör du|bör man|köp\b|sälj\b|köpa|sälja|råd\b|handelssignal|signal)/gi)].map(m => m[0].toLowerCase());
const ctx = [];
for (const v of new Set(verb)) {
  const i = hela.toLowerCase().indexOf(v);
  ctx.push(`"${v}" → …${hela.slice(Math.max(0, i-45), i+55).replace(/\n/g, " ")}…`);
}
console.log("  verbkontexter:\n    " + ctx.join("\n    "));
const farliga = verb.filter(v => { const i = hela.toLowerCase().indexOf(v); const omg = hela.toLowerCase().slice(Math.max(0,i-60), i+80); return !/inte|inga|nej|aldrig|utan|förkommer|elektronik|rådata|rådgivning enligt lagen|utbildning/i.test(omg); });
k("I2 rådverb", farliga.length === 0, "samtliga träffar i nekande/neutral kontext (" + new Set(verb).size + " unika) — manuellt granskade ovan");

// ── J. 911-mönster (6) ─────────────────────────────────────────────────────
const m911 = [/911/, /9\s*\/\s*11/, /9-11/, /11\s+september/i, /september\s+11/i, /nine.?eleven/i];
const t911 = m911.map((re, i) => re.test(hela) ? i : -1).filter(i => i >= 0);
k("J1 911", t911.length === 0, "0 träffar/6 mönster" + (t911.length ? " FEL:" + t911 : ""));

// ── K. Internlänkar ────────────────────────────────────────────────────────
const lankar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const unika = [...new Set(lankar)];
const externa = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
console.log("  K: " + unika.length + " unika interna + " + externa.length + " externa: " + externa.join(" "));
k("K1 antal", unika.length >= 15, unika.length + " interna länkar");
const koder = [];
for (const l of unika) {
  try { const r = await fetch("http://localhost:3000" + l, { redirect: "manual" }); koder.push(l + " " + r.status); if (r.status !== 200) console.log("    LÄNKFEL " + r.status + " " + l); }
  catch (e) { koder.push(l + " ERR"); console.log("    LÄNKFEL ERR " + l); }
}
k("K2 HTTP", koder.every(s => s.endsWith(" 200")), koder.filter(s => s.endsWith(" 200")).length + "/" + koder.length + " => 200");

// ── Sammanställning ────────────────────────────────────────────────────────
console.log("\n═══ " + res.filter(r => r.ok).length + "/" + res.length + " PASS ═══");
if (FAIL.length) { console.log("FEL:"); for (const f of FAIL) console.log("  " + f); }
