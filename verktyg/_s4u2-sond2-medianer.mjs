import fs from "node:fs";
const uni = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const lista = Array.isArray(uni) ? uni : uni.bolag;
const med = (v) => { const s=[...v].sort((a,b)=>a-b); const n=s.length; return n===0?null:n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2; };
const rang = (v, x, asc=true) => { const s=[...v].sort((a,b)=>asc?a-b:b-a); return s.indexOf(x)+1; };

const fält = {
  pe: b => b.vardering?.pe, pb: b => b.vardering?.pb, evEbit: b => b.vardering?.evEbit,
  fcfYield: b => b.vardering?.fcfYield, roe: b => b.lonksamhet?.roe, roic: b => b.lonksamhet?.roic,
  netto: b => b.lonksamhet?.nettoMarginal, ebit: b => b.lonksamhet?.ebitMarginal,
  brutto: b => b.lonksamhet?.bruttoMarginal, skuldEk: b => b.stabilitet?.skuldEgenkapital,
  prognos: b => b.tillvaxt?.prognosTillvaxt
};

const gren = lista.filter(b => b.bransch === "energi");
const ut = {};
for (const [k, f] of Object.entries(fält)) {
  const gv = gren.map(f).filter(v => typeof v === "number");
  const uv = lista.map(f).filter(v => typeof v === "number");
  const akr = gren.find(b => b.ticker === "AKRBP.OL");
  const x = f(akr);
  ut[k] = {
    akrbp: x,
    grenMedian: +(med(gv).toFixed(4)),
    grenN: gv.length,
    grenRangStigande: rang(gv, x, true),
    grenRangFallande: rang(gv, x, false),
    uniMedian: +(med(uv).toFixed(4)),
    uniN: uv.length
  };
}
console.log(JSON.stringify(ut, null, 1));

// AKRBP-specifika kontroller
const a = gren.find(b => b.ticker === "AKRBP.OL");
console.log("IDENTITET P/E*ROE =", (a.vardering.pe * a.lonksamhet.roe).toFixed(4), "mot P/B", a.vardering.pb, "gap %", (100 * (a.vardering.pe * a.lonksamhet.roe / a.vardering.pb - 1)).toFixed(2));
console.log("mcap/PE implicit vinst Mdr NOK =", (a.marknadsKapitalMdr / a.vardering.pe).toFixed(3));
console.log("netto*oms2025 Mdr =", (a.lonksamhet.nettoMarginal * a.serier.omsattning[3] / 1e9).toFixed(3));
console.log("skattegap: 1 - netto/EBIT =", (100 * (1 - a.lonksamhet.nettoMarginal / a.lonksamhet.ebitMarginal)).toFixed(1), "%");
console.log("omsättningsserie Mdr:", a.serier.omsattning.map(v => +(v / 1e9).toFixed(1)));
console.log("resultatserie Mdr:", a.serier.resultat.map(v => +(v / 1e9).toFixed(3)));
console.log("omssättningsförändring 24->25 %:", (100 * (a.serier.omsattning[3] / a.serier.omsattning[2] - 1)).toFixed(1));
console.log("resultatförändring 24->25 %:", (100 * (a.serier.resultat[3] / a.serier.resultat[2] - 1)).toFixed(1));
console.log("aktier implicit M =", (a.marknadsKapitalMdr * 1e9 / a.pris).toFixed(1));
console.log("EV = mcap + skuld: skuld Mdr =", (a.stabilitet.skuldEgenkapital * a.vardering.pb > 0 ? "se EK-väg" : ""));
console.log("EK implicit Mdr = mcap/pb =", (a.marknadsKapitalMdr / a.vardering.pb).toFixed(3), "→ skuld Mdr =", (a.marknadsKapitalMdr / a.vardering.pb * a.stabilitet.skuldEgenkapital).toFixed(3));
console.log("implicit EK per aktie NOK =", (a.marknadsKapitalMdr * 1e9 / a.vardering.pb / (a.marknadsKapitalMdr * 1e9 / a.pris)).toFixed(2));
