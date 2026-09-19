// _s4u2-fabege-byggdata.mjs — grenmedianer, rang och identitetstest för Fabege-paketet (s4-u2)
import fs from "node:fs";

const u = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const gren = u.filter(b => b.bransch === "fastighet");
const FAB = u.find(b => b.ticker === "FABG.ST");

const val = (b, p) => {
  let x = b;
  for (const k of p.split(".")) x = (x || {})[k];
  return x === undefined || x === null || !Number.isFinite(x) ? null : x;
};

const median = arr => {
  const s = arr.filter(v => v !== null).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const falt = {
  "P/E": "vardering.pe",
  "P/B": "vardering.pb",
  "EV/EBIT": "vardering.evEbit",
  "PEG": "vardering.peg",
  "FCF-yield": "vardering.fcfYield",
  "ROE": "lonksamhet.roe",
  "ROIC": "lonksamhet.roic",
  "EBIT-marginal": "lonksamhet.ebitMarginal",
  "nettomarginal": "lonksamhet.nettoMarginal",
  "FCF-marginal": "lonksamhet.fcfMarginal",
  "skuld/EK": "stabilitet.skuldEgenkapital",
  "prognostillväxt": "tillvaxt.prognosTillvaxt",
  "TTM-tillväxt": "tillvaxt.omsattningTillvaxtTTM",
  "intäkter CAGR 5år": "tillvaxt.omsattningCAGR5ar",
  "bruttomarginal": "lonksamhet.bruttoMarginal",
};

console.log("Fastighetsgrenen:", gren.length, "bolag:", gren.map(b => b.ticker).join(", "));
console.log("\nMÅTT | Fabege | gren-median (n) | universum-median (n) | Fabege rang (x av n lägre)");

for (const [namn, p] of Object.entries(falt)) {
  const fv = val(FAB, p);
  const gv = gren.map(b => val(b, p));
  const uv = u.map(b => val(b, p));
  const gSorted = gv.filter(v => v !== null).sort((a, b) => a - b);
  const antalLägre = gSorted.filter(v => v < fv).length;
  console.log(
    namn + " | " + fv + " | " + median(gv) + " (n=" + gv.filter(v => v !== null).length + ") | " +
    median(uv) + " (n=" + uv.filter(v => v !== null).length + ") | " + antalLägre + " av " + gSorted.length
  );
}

// --- Identitetstest och härledda tal ---
const pe = FAB.vardering.pe, pb = FAB.vardering.pb, roe = FAB.lonksamhet.roe;
const mcap = FAB.marknadsKapitalMdr, pris = FAB.pris;
console.log("\n--- IDENTITETSTEST ---");
console.log("P/E × ROE =", (pe * roe).toFixed(4), "mot P/B", pb, "→ gap", ((pe * roe / pb - 1) * 100).toFixed(2) + "%");
const vinstPE = mcap / pe;
console.log("Implicit vinst ur P/E:", (vinstPE * 1000).toFixed(0), "Mkr");
const oms2025 = FAB.serier.omsattning[FAB.serier.omsattning.length - 1];
console.log("nettomarginal × omsättning 2025:", (FAB.lonksamhet.nettoMarginal * oms2025 / 1e6).toFixed(0), "Mkr");
console.log("årsvinst 2025 ur serien:", FAB.serier.resultat[FAB.serier.resultat.length - 1] / 1e6, "Mkr");
const ekPB = mcap / pb;
const aktier = mcap / pris;
console.log("Implicit EK ur P/B:", ekPB.toFixed(3), "Mdr; aktier ur mcap/pris:", (aktier * 1e6).toFixed(1), "M; EK/aktie:", (ekPB / aktier * 1e3).toFixed(2), "kr mot golvfält", FAB.golv.vardePerAktie, "kr");
console.log("ROE-check: vinstPE/EK =", (vinstPE / ekPB * 100).toFixed(2) + "% mot fält", (roe * 100) + "%");
console.log("Golv-marginal check: 1 - pris/golv =", ((1 - pris / FAB.golv.vardePerAktie) * 100).toFixed(2) + "% mot fält", (FAB.golv.marginal * 100) + "%");

// PEG-anomali
const peg = FAB.vardering.peg, prog = FAB.tillvaxt.prognosTillvaxt;
console.log("\n--- PEG-ANOMALI ---");
console.log("PEG", peg, "× prognostillväxt(%)", (prog * 100).toFixed(2), "=", (peg * Math.abs(prog) * 100 / 100).toFixed(2), "→ implicit P/E", (peg * Math.abs(prog * 100)).toFixed(2), "mot pe-fält", pe);
console.log("Konvention P/E/|tillväxt%|:", (pe / Math.abs(prog * 100)).toFixed(2), "mot fältets PEG", peg);

// EV/EBIT-kedja
console.log("\n--- EV/EBIT-KEDJA ---");
const ebit = FAB.lonksamhet.ebitMarginal * oms2025 / 1e6;
console.log("EBIT ur marginal × omsättning 2025:", ebit.toFixed(0), "Mkr; EV = evEbit × EBIT =", (FAB.vardering.evEbit * ebit / 1e3).toFixed(3), "Mdr mot mcap", mcap);
console.log("EV-mcap = nettskuld-hint:", (FAB.vardering.evEbit * ebit / 1e3 - mcap).toFixed(3), "Mdr");
const skuld = FAB.stabilitet.skuldEgenkapital * ekPB;
console.log("skuld/EK × EK =", skuld.toFixed(3), "Mdr (brutto-skuld-hint ur P/B-vägen)");

// Serier
console.log("\n--- SERIER ---");
const ar = FAB.serier.ar, om = FAB.serier.omsattning, re = FAB.serier.resultat;
for (let i = 0; i < ar.length; i++) console.log(ar[i], "intäkter", om[i] / 1e6, "Mkr, resultat", re[i] / 1e6, "Mkr");
const cagr = (om[om.length - 1] / om[0]) ** (1 / (om.length - 1)) - 1;
console.log("intäkts-CAGR 4 år:", (cagr * 100).toFixed(2) + "%/år mot fält", (FAB.tillvaxt.omsattningCAGR5ar * 100) + "%");
const steg = [];
for (let i = 1; i < re.length; i++) steg.push(((re[i] / re[i - 1]) - 1) * 100);
console.log("resultatsteg i procent:", steg.map(s => s.toFixed(1) + "%").join(", "));
// vinst per aktie-vägar
console.log("\nVinst/aktie ur P/E-vägen:", (pris / pe).toFixed(2), "kr; direktavkastning saknas hos källan (aterkop.fält null)");
console.log("FCF/aktie ur yield:", (pris * FAB.vardering.fcfYield).toFixed(2), "kr; ur marginal×omsättning:", (FAB.lonksamhet.fcfMarginal * oms2025 / (aktier * 1e6)).toFixed(2), "kr");
