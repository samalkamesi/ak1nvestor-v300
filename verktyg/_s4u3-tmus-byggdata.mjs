#!/usr/bin/env node
// _s4u3-tmus-byggdata.mjs — beräkningsmotor för TMUS Q3-2026-läspaketet (spår 4, s4-u3).
// Låser källtalen (universumpost TMUS 2026-09-20 + sökverifierad primärinsamling
// 2026-09-29), räknar ALLA härledda tal oberoende, verifierar paritet mot universumfält
// och medianer/rang LIVE ur bolagsunivers.json. ABORT-grind: nonzero exit före skrivning
// om någon kontroll spricker — paketet skrivs ALDRIG på motande motor.
import { readFileSync } from "node:fs";

const UNIVERSUM = "/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json";
const K = {
  // — universumpost TMUS (hämtad 2026-09-20, close 2026-09-18) —
  pris: 168.18, mcap: 180.40, aktiebasM: 1072.6,
  pe: 17.63, peFwd: 13.43, pb: 3.21, bps: 52.35, evEbit: 14.63, evEbitda: 8.66, peg: 0.56,
  ev: 298.0, nettoskuld: 117.60, skuld: 120.43, ekTTM: 56.265, de: 2.14,
  rantaTackning: 5.06, altman: 1.8,
  bruttoM: 0.6305, ebitM: 0.2209, nettoM: 0.1145, fcfM: 0.1996,
  roe: 0.1799, roic: 0.0893, wacc: 4.66,
  ocf: 28.833, capex: 10.434, fcf: 18.399, fcfYield: 0.102,
  revTTM: 92189, nettoTTM: 10560, epsTTM: 9.54,
  prognos: 0.3127, omsCagr: 0.0246, resCagr: 0.3808, ttmTillvaxt: 0.0968,
  utdelning: 4.08, direktAvk: 0.0243, payout: 0.4278,
  aterkopTtm: 12.388, aktiebasMinsk: 0.0393, shareholderYield: 0.0635,
  beta: 0.33, topp52: 242.37, botten52: 164.02,
  qUtd: [0.65, 0.88, 1.02],
  ar: [2021, 2022, 2023, 2024, 2025],
  rev: [80118, 79571, 78558, 81400, 88309],
  netto: [3024, 2590, 8317, 11339, 10992],
  bruttoSerie: [56.85, 59.77, 62.39, 63.79, 63.17],
  ekSerie: [69.102, 69.656, 64.715, 61.741, 59.203],
  fcfSerie: [1.591, 2.811, 8.758, 13.453, 17.995],
  // — sökverifierad primärinsamling 2026-09-29 —
  // Rappdag: bolagsutlyst 2026-09-17 — Q3 2026 earnings call 2026-10-28 16:30 EDT
  // (investor.t-mobile.com events + t-mobile.com/news + Yahoo/Nasdaq-speglingar)
  rappdag: "2026-10-28", callEDT: "16:30", materialET: "16:05",
  // Q2-2026 (rapporterat 2026-07-23; Benzinga/StockTitan/GuruFocus/Yahoo)
  q2NetAdds: 277000, q2NetAddsYoY: -0.13, q2PostpaidServiceRev: 15.9, q2PostpaidServiceTillv: 0.13,
  q2Arpa: 152.91, q2ArpaTillv: 0.02, q2Netto: 3.2, q2NettoTillv: 0.01, q2Eps: 2.99, q2EpsTillv: 0.05,
  q2Ocf: 7.5, q2OcfTillv: 0.07, q2Fcf: 4.8, q2FcfTillv: 0.04,
  q3NetAddsUtsikt: 250000, fcfGuidance: [18.4, 18.8], guidanceHojning: 0.2,
};

const fel = [], varn = [];
const kontroll = (namn, faktisk, expect, tolerans = 0.005) => {
  const ok = typeof expect === "string" ? faktisk === expect :
    Math.abs(faktisk - expect) <= tolerans * Math.abs(expect);
  if (!ok) fel.push(`${namn}: motorn ${faktisk} mot väntat ${expect}`);
  return ok;
};
const vid = (namn, varde, enhet = "") => {
  console.log(`  ${namn}: ${varde}${enhet}`);
  return varde;
};

console.log("== TMUS byggdata " + new Date().toISOString().slice(0, 10));

// — 1. Aktiebas och marknadsvärde —
const mcapViaBas = K.pris * K.aktiebasM / 1000; // mdr USD
kontroll("mcap via aktiebas (1 072,6 M × 168,18)", mcapViaBas, K.mcap, 0.001);
vid("mcap via aktiebas", mcapViaBas.toFixed(2), " mdr");

// — 2. P/E-dubbelvägen —
const peEps = K.pris / K.epsTTM;
kontroll("P/E EPS-vägen (168,18 ÷ 9,54)", peEps, K.pe, 0.001);
vid("P/E EPS-vägen", peEps.toFixed(3));
const peNetto = K.mcap * 1000 / K.nettoTTM;
vid("P/E netto-vägen (180 400 ÷ 10 560)", peNetto.toFixed(2));
const peGap = (peEps - peNetto) / peNetto;
vid("P/E-vägarnas divergens", (peGap * 100).toFixed(1), " %");

// — 3. Identitetstest P/E = P/B ÷ ROE —
const peIdent = K.pb / K.roe;
const identDiff = (peIdent - K.pe) / K.pe;
vid("identitet P/B ÷ ROE", peIdent.toFixed(2), ` (diff ${(identDiff * 100).toFixed(2)} %)`);
kontroll("identitetstest inom 2 %", Math.abs(identDiff) <= 0.02, 1);
// omvänd: P/E × ROE = P/B
const pbIdent = K.pe * K.roe;
vid("omvänt P/E × ROE", pbIdent.toFixed(3), ` mot P/B ${K.pb} (${((pbIdent - K.pb) / K.pb * 100).toFixed(2)} %)`);

// — 4. PEG-konventionen —
const pegConv = K.pe / (K.prognos * 100);
kontroll("PEG konvention (17,63 ÷ 31,27)", pegConv, 0.56, 0.01);
vid("PEG konvention", pegConv.toFixed(3), ` mot fältet 0,56`);

// — 5. Forward-P/E-ekvationen (multiplövningen) —
const peFwdConv = K.pe / (1 + K.prognos);
kontroll("forward P/E (17,63 ÷ 1,3127)", peFwdConv, K.peFwd, 0.001);
vid("forward P/E via prognos", peFwdConv.toFixed(2), ` mot fältet ${K.peFwd}`);

// — 6. EV-kedjan fem steg —
const ekKedja = K.mcap / K.pb;
vid("steg 1 EK (mcap ÷ P/B)", ekKedja.toFixed(1), " mdr");
kontroll("EK-kedjan mot TTM-EK-fältet", ekKedja, K.ekTTM, 0.005);
const skuldKedja = ekKedja * K.de;
kontroll("steg 2 skuld (EK × D/E)", skuldKedja, K.skuld, 0.005);
const evNetto = K.mcap + K.nettoskuld;
kontroll("steg 3 EV (mcap + nettoskuld)", evNetto, K.ev, 0.001);
const kassa = K.skuld - K.nettoskuld;
const evBrutto = K.mcap + skuldKedja - kassa;
kontroll("steg 3b EV bruttovägen", evBrutto, K.ev, 0.005);
const ebitTTM = K.revTTM * K.ebitM;
vid("steg 4 EBIT TTM (92 189 × 22,09 %)", ebitTTM.toFixed(0), " MUSD");
const evEbitKedja = K.ev * 1000 / ebitTTM;
kontroll("steg 5 EV/EBIT kedjan", evEbitKedja, K.evEbit, 0.005);
vid("EV/EBIT kedja", evEbitKedja.toFixed(2), ` mot fältet ${K.evEbit}`);
// bonus EBITDA
const ebitda = K.ev / K.evEbitda;
vid("EBITDA implicit (EV ÷ 8,66)", ebitda.toFixed(1), " mdr");
vid("EBITDA-marginal implicit", (ebitda * 1000 / K.revTTM * 100).toFixed(1), " %");

// — 7. FCF-kedjan —
const fcfKedja = K.ocf - K.capex;
kontroll("FCF (OCF − capex)", fcfKedja, K.fcf, 0.005);
const fcfY = K.fcf * 1000 / (K.mcap * 1000);
kontroll("FCF-yield (18 399 ÷ 180 400)", fcfY, K.fcfYield, 0.005);
const fcfMarg = K.fcf * 1000 / K.revTTM;
kontroll("FCF-marginal (18 399 ÷ 92 189)", fcfMarg, K.fcfM, 0.005);

// — 8. ROIC−WACC —
kontroll("ROIC−WACC spridning", K.roic * 100 - K.wacc, 4.27, 0.02);

// — 9. Direktavkastning, payout, shareholder yield —
kontroll("direktavkastning (4,08 ÷ 168,18)", K.utdelning / K.pris, K.direktAvk, 0.01);
kontroll("payout (4,08 ÷ 9,54)", K.utdelning / K.epsTTM, K.payout, 0.01);
const shYield = K.direktAvk + K.aktiebasMinsk;
kontroll("shareholder yield (2,43 + 3,93)", shYield, K.shareholderYield, 0.02);
// kvartalstrappan
const trapp1 = (K.qUtd[1] / K.qUtd[0] - 1) * 100;
const trapp2 = (K.qUtd[2] / K.qUtd[1] - 1) * 100;
kontroll("kvartalstrappa steg 1 (+35,4 %)", trapp1, 35.4, 0.01);
kontroll("kvartalstrappa steg 2 (+15,9 %)", trapp2, 15.9, 0.01);
const utdAr = K.qUtd.reduce((a, b) => a + b, 0);
kontroll("årsutdelning av trappan (0,65+0,88+1,02)", utdAr, 2.55, 0.001);
// NOTE: årsfältet 4,08 är trappan 0,65+0,88+0,88+0,88? Nej: trappan i noten är de TRE
// nivåerna; årsutdelning 4,08 deklareras av källan. Trapp-summan 2,55 är första året
// (Q4-23 start: 0,65 en gång). Redovisas öppet i paketet, ingen ekvation.

// — 10. 52-veckorsavstånd —
kontroll("avstånd från topp (1 − 168,18/242,37)", 1 - K.pris / K.topp52, 0.306, 0.005);
kontroll("avstånd till botten ((168,18/164,02) − 1)", K.pris / K.botten52 - 1, 0.0254, 0.05);

// — 11. Serier: steg och CAGR —
const steg = (a, b) => (b / a - 1) * 100;
const revSteg = [0, 1, 2, 3].map(i => steg(K.rev[i], K.rev[i + 1]));
const nettoSteg = [0, 1, 2, 3].map(i => steg(K.netto[i], K.netto[i + 1]));
vid("intäktssteg %", revSteg.map(x => x.toFixed(2)).join(" / "));
vid("resultatsteg %", nettoSteg.map(x => x.toFixed(1)).join(" / "));
const cagr = (a, b, n) => (Math.pow(b / a, 1 / n) - 1) * 100;
kontroll("intäkter CAGR endpoint 4 år", cagr(K.rev[0], K.rev[4], 4), K.omsCagr * 100, 0.02);
kontroll("resultat CAGR endpoint 4 år", cagr(K.netto[0], K.netto[4], 4), K.resCagr * 100, 0.02);
kontroll("synergibågen ×4,4 (11 339 ÷ 2 590)", K.netto[3] / K.netto[1], 4.38, 0.01);
kontroll("bruttomarginalbana endpoint (63,17 − 56,85)", K.bruttoSerie[4] - K.bruttoSerie[0], 6.32, 0.01);
kontroll("bruttomarginalbana topp (63,79 − 56,85)", K.bruttoSerie[3] - K.bruttoSerie[0], 6.94, 0.01);
kontroll("EK-serien fall (1 − 59,2/69,1)", (1 - K.ekSerie[4] / K.ekSerie[0]) * 100, 14.3, 0.02);
const fcfFaktor = K.fcfSerie[4] / K.fcfSerie[0];
kontroll("FCF-trappan 11,3× (17 995 ÷ 1 591)", fcfFaktor, 11.31, 0.01);
const fcfAllaVaxer = K.fcfSerie.every((v, i) => i === 0 || v > K.fcfSerie[i - 1]);
kontroll("FCF 5/5 växande", fcfAllaVaxer, 1);
// härledd nettomarginalserie
const nettoMargSerie = K.netto.map((n, i) => n / K.rev[i] * 100);
vid("nettomarginalserie %", nettoMargSerie.map(x => x.toFixed(2)).join(" / "));

// — 12. Scenarioruta TTM-bas —
const basRev = K.revTTM, basM = K.ebitM * 100;
const revNiva = [-0.03, 0, 0.03].map(d => basRev * (1 + d));
const margNiva = [basM - 1, basM, basM + 1];
const ruta = revNiva.map(r => margNiva.map(m => r * m / 100));
console.log("  scenarioruta (MUSD):");
ruta.forEach((rad, i) => console.log("   " + (revNiva[i].toFixed(0)) + ": " + rad.map(c => c.toFixed(0)).join(" / ")));
const cellexakt = ruta.every((rad, i) => rad.every((c, j) => Math.abs(c - revNiva[i] * margNiva[j] / 100) < 0.5));
kontroll("scenariorutans 9 celler aritmetiskt exakta", cellexakt, 1);
const ratMarginal = basRev * 0.01;
const ratIntakt = basRev * basM / 100 * 0.03;
const vikt = ratMarginal / ratIntakt;
vid("marginalratan (1 pp)", ratMarginal.toFixed(0), " MUSD");
vid("intäktsratan (3 %)", ratIntakt.toFixed(0), " MUSD");
vid("marginalvikt", vikt.toFixed(2));
kontroll("Essity-formeln 1 ÷ (3 × marginal)", 1 / (3 * basM / 100), vikt, 0.01);

// — 13. Medianer och rang LIVE ur universumfilen —
const u = JSON.parse(readFileSync(UNIVERSUM, "utf8"));
const arr = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u).find(Array.isArray));
const kom = arr.filter(b => b.bransch === "kommunikation");
const f = (b, p) => p.split(".").reduce((o, k) => (o || {})[k], b);
const med = xs => { const v = xs.filter(x => typeof x === "number" && !isNaN(x)).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const rang = (p, dir) => { const vs = kom.map(b => ({ v: f(b, p), t: b.ticker })).filter(x => typeof x.v === "number").sort((a, b) => dir === "low" ? a.v - b.v : b.v - a.v); return { r: vs.findIndex(x => x.t === "TMUS") + 1, n: vs.length }; };
console.log("  medianer kommunikation n=" + kom.length + " (TMUS | median | n | rang):");
for (const [namn, p, dir] of [
  ["P/E", "vardering.pe", "low"], ["P/B", "vardering.pb", "low"], ["EV/EBIT", "vardering.evEbit", "low"],
  ["PEG", "vardering.peg", "low"], ["FCF-yield", "vardering.fcfYield", "high"], ["ROE", "lonksamhet.roe", "high"],
  ["EBIT-marginal", "lonksamhet.ebitMarginal", "high"], ["nettomarginal", "lonksamhet.nettoMarginal", "high"],
  ["skuld/EK", "stabilitet.skuldEgenkapital", "low"], ["prognostillväxt", "tillvaxt.prognosTillvaxt", "high"]]) {
  const tmus = f(arr.find(b => b.ticker === "TMUS"), p);
  const m = med(kom.map(b => f(b, p)));
  const r = rang(p, dir);
  console.log(`   ${namn.padEnd(16)} ${typeof tmus === "number" ? tmus.toFixed(3) : tmus} | ${m === null ? "null" : m.toFixed(3)} | n=${r.n} | rang ${r.r}/${r.n} (${dir === "low" ? "lägst" : "högst"}=${r.r === 1})`);
}
// TMUS-fältparitet mot filen (källintegritet: det som står i paketet = det som står i filen)
const tmusFil = arr.find(b => b.ticker === "TMUS");
const pari = [
  ["pris", K.pris, tmusFil.pris], ["mcap", K.mcap, tmusFil.marknadsKapitalMdr],
  ["P/E", K.pe, tmusFil.vardering.pe], ["P/B", K.pb, tmusFil.vardering.pb],
  ["EV/EBIT", K.evEbit, tmusFil.vardering.evEbit], ["PEG", K.peg, tmusFil.vardering.peg],
  ["FCF-yield", K.fcfYield, tmusFil.vardering.fcfYield], ["ROE", K.roe, tmusFil.lonksamhet.roe],
  ["ROIC", K.roic, tmusFil.lonksamhet.roic], ["EBIT-marginal", K.ebitM, tmusFil.lonksamhet.ebitMarginal],
  ["nettomarginal", K.nettoM, tmusFil.lonksamhet.nettoMarginal], ["bruttomarginal", K.bruttoM, tmusFil.lonksamhet.bruttoMarginal],
  ["skuld/EK", K.de, tmusFil.stabilitet.skuldEgenkapital], ["räntetäckning", K.rantaTackning, tmusFil.stabilitet.rantaTackning],
  ["prognostillväxt", K.prognos, tmusFil.tillvaxt.prognosTillvaxt], ["resultatCAGR", K.resCagr, tmusFil.tillvaxt.resultatCAGR5ar],
  ["utdelning Mdr TTM", K.aterkopTtm, tmusFil.aterkop.senasteArMdr],
  ["rev 2025", K.rev[4] / 1000, tmusFil.serier.omsattning[4] / 1e9],
  ["netto 2025", K.netto[4] / 1000, tmusFil.serier.resultat[4] / 1e9],
];
for (const [namn, mot, fil] of pari) kontroll(`fältparitet ${namn} (motor vs fil)`, mot, fil, 0.001);

// — 14. Notens påstående: resultatCAGR +38,1 % = kommunikationens HÖGSTA —
const cagrKollegor = kom.map(b => ({ t: b.ticker, c: b.tillvaxt.resultatCAGR5ar })).filter(x => typeof x.c === "number").sort((a, b) => b.c - a.c);
console.log("  resultatCAGR top-5 kommunikation: " + cagrKollegor.slice(0, 5).map(x => `${x.t} ${(x.c * 100).toFixed(1)}%`).join(" · "));
const tmusTopp = cagrKollegor[0].t === "TMUS";
if (!tmusTopp) varn.push(`påståendet 'kommunikationens högsta resultatCAGR': TMUS är nr ${cagrKollegor.findIndex(x => x.t === "TMUS") + 1} — skriv rang, inte 'högst'`);
else console.log("  påståendet 'kommunikationens högsta resultatCAGR' STÄMMER (nr 1 av " + cagrKollegor.length + ")");

// — 15. Grenens paketantal (ordinal för title) —
const paketFinns = ["att", "vz", "telia", "tele2", "mtg-b", "disney", "meta", "nflx", "truecaller", "samsung", "nokia", "ericsson", "palantir"];
// vilka av dessa står i kommunikation-grenen i universumet?
const komTickers = new Set(kom.map(b => b.ticker));
const grenensPaket = paketFinns.filter(s => {
  const kand = kom.filter(b => (b.namn || "").toLowerCase().includes(s.replace("-b", "").slice(0, 5)) || b.ticker.toLowerCase().startsWith(s.split("-")[0]));
  return kand.length > 0;
});
console.log("  kommunikation-tickers med paket (kandidatmatchning): " + grenensPaket.join(", "));
console.log("  (ordinallen kontrolleras manuellt mot kalender-kommunikation: DIS, META, MTG, NFLX, T, TEL2, TELIA, VZ — TMUS blir grenens 9:e)");

// — 16. Q2-2026-utfall (sökverifierat; redovisas med källor, ingen paritet att testa) —
console.log("  Q2-26: net adds " + K.q2NetAdds + " (" + (K.q2NetAddsYoY * 100).toFixed(0) + " % YoY) · postpaid service " +
  K.q2PostpaidServiceRev + " mdr (" + (K.q2PostpaidServiceTillv * 100).toFixed(0) + " %) · ARPA " + K.q2Arpa + " (" + (K.q2ArpaTillv * 100).toFixed(0) + " %)");
console.log("        netto " + K.q2Netto + " mdr (" + (K.q2NettoTillv * 100).toFixed(0) + " %) · EPS " + K.q2Eps + " (" + (K.q2EpsTillv * 100).toFixed(0) + " %) · OCF " + K.q2Ocf + " mdr (" + (K.q2OcfTillv * 100).toFixed(0) + " %) · justerad FCF " + K.q2Fcf + " mdr (" + (K.q2FcfTillv * 100).toFixed(0) + " %)");
const guidMid = (K.fcfGuidance[0] + K.fcfGuidance[1]) / 2;
console.log("        FCF-guidance " + K.fcfGuidance[0] + "–" + K.fcfGuidance[1] + " mdr (mitt " + guidMid.toFixed(1) + ", höjning +" + (K.guidanceHojning * 1000).toFixed(0) + " MUSD)");
kontroll("guidance mittpunkt", guidMid, 18.6, 0.001);

// — DOM —
console.log("\n== DOM: " + (fel.length === 0 ? "GRÖN — " + varn.length + " varningar" : "RÖD — " + fel.length + " fel"));
fel.forEach(x => console.log("  FEL: " + x));
varn.forEach(x => console.log("  VARN: " + x));
if (fel.length) { console.log("ABORT — paketet skrivs inte på motande motor."); process.exit(1); }
console.log("Källtalen är låsta; paketet kan skrivas mot dessa tal.");
