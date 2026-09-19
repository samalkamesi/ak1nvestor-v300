// _s4u1-rwe-underlag.mjs — oberoende omräkning av RWE.DE-posten (bolagsunivers.json)
// inför läspaket sa-laser-du-rwe-q3-2026.json. Alla tal beräknas ur postens egna fält.
import { readFileSync } from "node:fs";

const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const r = U.find((x) => x.ticker === "RWE.DE");
const p = (s) => console.log(s);

p("=== RWE.DE-posten (hamtat " + r.hamtat + ", kallor: " + r.kallor.map((k) => k.namn).join(" + ") + ")");
p("pris " + r.pris + " " + r.valuta + " | mcap " + r.marknadsKapitalMdr + " mdr | bransch " + r.bransch + " | land " + r.land);

const V = r.vardering, L = r.lonksamhet, T = r.tillvaxt, S = r.stabilitet, SER = r.serier;
p("\n=== FÄLT");
p("P/E " + V.pe + " | P/B " + V.pb + " | EV/EBIT " + V.evEbit + " | PEG " + V.peg + " | FCFy " + V.fcfYield);
p("ROE " + L.roe + " | ROIC " + L.roic + " | brutto " + L.bruttoMarginal + " | EBIT " + L.ebitMarginal + " | netto " + L.nettoMarginal + " | fcfMarg " + L.fcfMarginal);
p("skuld/EK " + S.skuldEgenkapital + " | omsCAGR " + T.omsattningCAGR5ar + " | resCAGR " + T.resultatCAGR5ar + " | prognos " + T.prognosTillvaxt + " | TTM " + T.omsattningTillvaxtTTM);

p("\n=== SERIER");
const ar = SER.ar, oms = SER.omsattning, res = SER.resultat;
for (let i = 0; i < ar.length; i++) p(ar[i] + ": oms " + (oms[i] / 1e9).toFixed(3) + " mdr | res " + (res[i] / 1e9).toFixed(3) + " mdr | netto-marginal " + ((res[i] / oms[i]) * 100).toFixed(2) + " %");

p("\n=== STEG OCH CAGR");
for (let i = 1; i < ar.length; i++) {
  p(ar[i - 1] + "→" + ar[i] + ": oms " + (((oms[i] / oms[i - 1]) - 1) * 100).toFixed(2) + " % | res " + (((res[i] / res[i - 1]) - 1) * 100).toFixed(2) + " %");
}
const cagr = (a, b, n) => (Math.pow(b / a, 1 / n) - 1);
p("omsCAGR 3ar: " + (cagr(oms[0], oms[3], 3) * 100).toFixed(2) + " % (fält " + (T.omsattningCAGR5ar * 100).toFixed(2) + ")");
p("resCAGR 3ar: " + (cagr(res[0], res[3], 3) * 100).toFixed(2) + " % (fält " + (T.resultatCAGR5ar * 100).toFixed(2) + ")");
p("intäkt topp→2025: " + (((oms[3] / oms[0]) - 1) * 100).toFixed(1) + " % | res samma period " + (((res[3] / res[0]) - 1) * 100).toFixed(1) + " %");
p("2024-topp res mot 2025: " + (((res[2] / res[3]) - 1) * 100).toFixed(1) + " %");

p("\n=== TTM-DETALJEN (tre vinstläsningar)");
const ttmOms = oms[3] * (1 + T.omsattningTillvaxtTTM);
const vPe = r.marknadsKapitalMdr / V.pe;
const vMarg = (L.nettoMarginal * ttmOms) / 1e9; // mdr
p("TTM-omsättning: 17.628 × (1−0.091) = " + (ttmOms / 1e9).toFixed(3) + " mdr");
p("väg 1 P/E-motorn: 45.146 ÷ 12.949 = " + vPe.toFixed(3) + " mdr");
p("väg 2 nettofältet: 0.2025 × " + (ttmOms / 1e9).toFixed(3) + " = " + vMarg.toFixed(3) + " mdr");
p("väg 3 årsserien FY2025: " + (res[3] / 1e9).toFixed(3) + " mdr");
p("gap väg2/väg1: " + (((vMarg / vPe) - 1) * 100).toFixed(1) + " % | väg3/väg1: " + (((res[3] / 1e9 / vPe) - 1) * 100).toFixed(1) + " %");

p("\n=== IDENTITETSTESTET P/E ÷ P/B = ROE");
const id = V.pe / V.pb; // kvoten är redan i procentenheter
p("12.949 ÷ 1.038 = " + id.toFixed(3) + " % mot ROE-fält " + (L.roe * 100).toFixed(2) + " % → gap " + (((id / (L.roe * 100)) - 1) * 100).toFixed(1) + " %");

p("\n=== TRAPPAN (fältens invertering)");
p("brutto " + (L.bruttoMarginal * 100).toFixed(2) + " → EBIT " + (L.ebitMarginal * 100).toFixed(2) + " → netto " + (L.nettoMarginal * 100).toFixed(2));
p("inversion: netto − EBIT = " + ((L.nettoMarginal - L.ebitMarginal) * 100).toFixed(2) + " pp");

p("\n=== EV-KEDJAN");
const ek = r.marknadsKapitalMdr / V.pb;
const skuld = S.skuldEgenkapital * ek;
const ev = r.marknadsKapitalMdr + skuld;
p("EK = 45.146 ÷ 1.038 = " + ek.toFixed(3) + " mdr");
p("skuld = 0.5037 × EK = " + skuld.toFixed(3) + " mdr");
p("EV = " + ev.toFixed(3) + " mdr");
const ebitA = ev / V.evEbit, ebitB = (L.ebitMarginal * ttmOms) / 1e9; // mdr båda
p("EBIT väg A (EV ÷ 81.472) = " + ebitA.toFixed(4) + " mdr | väg B (4.64 % × TTM) = " + ebitB.toFixed(4) + " mdr | kvot " + (ebitA / ebitB).toFixed(3));
p("EV/EBIT omvänt mot serie-2025-vinst: " + (ev / (res[3] / 1e9)).toFixed(1) + " (fält 81.472)");

p("\n=== FCF-BLOCKET");
const fcf1 = V.fcfYield * r.marknadsKapitalMdr, fcf2 = (L.fcfMarginal * ttmOms) / 1e9; // mdr båda
p("väg 1 yield: −0.2461 × 45.146 = " + (fcf1).toFixed(2) + " mdr | väg 2 marginal: −0.6958 × " + (ttmOms / 1e9).toFixed(3) + " = " + fcf2.toFixed(2) + " mdr");
p("inbördes kvot: " + (fcf1 / fcf2).toFixed(3) + " (internt konsistent kring −11 mdr)");

p("\n=== PEG-KONVENTIONEN");
p("12.949 ÷ 11.93 = " + (V.pe / (T.prognosTillvaxt * 100)).toFixed(3) + " mot fält 35.4 → fältet " + (V.peg / (V.pe / (T.prognosTillvaxt * 100))).toFixed(1) + "× konventionen");
p("teckengläpp prognos " + (T.prognosTillvaxt * 100).toFixed(2) + " % mot TTM " + (T.omsattningTillvaxtTTM * 100).toFixed(1) + " % = " + ((T.prognosTillvaxt - T.omsattningTillvaxtTTM) * 100).toFixed(1) + " pp");

p("\n=== AKTIER, VPA, TVÅ VINSTVÄRLDAR");
const aktier = r.marknadsKapitalMdr / r.pris;
p("aktier = 45.146 ÷ 57.88 = " + (aktier * 1000).toFixed(0) + " miljoner");
p("VPA TTM (P/E-motor): 57.88 ÷ 12.949 = " + (r.pris / V.pe).toFixed(2) + " EUR");
p("VPA FY2025 (serien): 3.131 ÷ " + (aktier).toFixed(4) + " = " + ((res[3] / 1e9) / aktier).toFixed(2) + " EUR");
p("justerad guidning 2026: 2.60–3.30 EUR (mittpunkt 2.95) → justerad P/E = 57.88 ÷ 2.95 = " + (r.pris / 2.95).toFixed(1));
p("gap rapportmässig-TTM mot justerad mittpunkt: " + ((((r.pris / 2.95) / V.pe) - 1) * 100).toFixed(1) + " % dyrare på justerad bas");
p("utdelning 1.32 EUR mål 2026 → direktavkastning " + ((1.32 / r.pris) * 100).toFixed(2) + " % | utdelningsandel på 2.95: " + ((1.32 / 2.95) * 100).toFixed(1) + " %");

p("\n=== SCENARIORUTA 9 CELLER (FY2025-bas: oms 17.628, netto-marginal 17.76 %)");
const bas = res[3] / 1e9;
const marginaler = [0.1476, 0.1776, 0.2076];
const resul = marginaler.map((m) => m * (oms[3] / 1e9));
for (let i = 0; i < 3; i++) p("marginal " + (marginaler[i] * 100).toFixed(2) + " % → resultat " + resul[i].toFixed(3) + " mdr (" + (((resul[i] / bas) - 1) * 100).toFixed(1) + " % mot 2025)");
for (const m of [12.949, 15.0, 17.015]) {
  p("P/E " + m + ": " + resul.map((x) => (x * m / 1e0).toFixed(1)).join(" / ") + " mdr värde");
}
p("1 pp marginal = " + (0.01 * (oms[3] / 1e9)).toFixed(3) + " mdr = " + ((0.01 * (oms[3] / 1e9) / bas) * 100).toFixed(1) + " % av 2025-resultatet");

p("\n=== GRENMEDIANER (energi, 219-filen " + U.length + " rader, beräknade nu)");
const E = U.filter((x) => x.bransch === "energi");
const med = (get) => { const v = E.map(get).filter((x) => typeof x === "number").sort((a, b) => a - b); const n = v.length; return { n, m: n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2 }; };
const medU = (get) => { const v = U.map(get).filter((x) => typeof x === "number").sort((a, b) => a - b); const n = v.length; return { n, m: n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2 }; };
const rang = (get, val) => { const v = E.map(get).filter((x) => typeof x === "number").sort((a, b) => a - b); let pos = 0; for (const x of v) if (x < val) pos++; return pos + 1 + "/" + v.length; };
for (const [namn, get, val] of [
  ["P/E", (x) => x.vardering?.pe, V.pe],
  ["P/B", (x) => x.vardering?.pb, V.pb],
  ["EV/EBIT", (x) => x.vardering?.evEbit, V.evEbit],
  ["ROE", (x) => x.lonksamhet?.roe, L.roe],
  ["brutto", (x) => x.lonksamhet?.bruttoMarginal, L.bruttoMarginal],
  ["EBIT", (x) => x.lonksamhet?.ebitMarginal, L.ebitMarginal],
  ["netto", (x) => x.lonksamhet?.nettoMarginal, L.nettoMarginal],
  ["skuld/EK", (x) => x.stabilitet?.skuldEgenkapital, S.skuldEgenkapital],
  ["prognos", (x) => x.tillvaxt?.prognosTillvaxt, T.prognosTillvaxt],
]) {
  const g = med(get), uu = namn === "P/E" || namn === "P/B" || namn === "ROE" || namn === "prognos" ? medU(get) : null;
  p(namn + ": gren n=" + g.n + " median " + g.m.toFixed(3) + " | RWE " + val + " rang " + rang(get, val) + (uu ? " | universum n=" + uu.n + " median " + uu.m.toFixed(3) : ""));
}
p("\n=== ROIC-PROXY");
p("EBIT-väg B " + ebitB.toFixed(3) + " ÷ (skuld " + skuld.toFixed(1) + " + EK " + ek.toFixed(1) + ") = " + ((ebitB / (skuld + ek)) * 100).toFixed(2) + " % mot fält 1.1 %");
