#!/usr/bin/env node
// _s4u3-cp-kvd.mjs — KVD för CPKC (CP) Q3-2026-läspaketet (spår 4, s4-u3).
// Kontroller: struktur, källtalsparitet (universumrad LIVE + kanonkvartal + pressreleaser),
// aritmetik oberoende omräknad, medianer/rang LIVE ur bolagsunivers.json, juridikgrind,
// ord/fönster, intern+extern länkar (--http kör livekontroll). Deterministisk — kör 2×.
import { readFileSync, existsSync } from "node:fs";

const FIL = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-cp-q3-2026.json";
const HTTP = process.argv.includes("--http");
let pass = 0, fel = [], varn = [];
const K = (namn, ok, detalj) => { if (ok) { pass++; } else { fel.push(namn + (detalj ? " — " + detalj : "")); } console.log((ok ? "PASS" : "FEL ") + " " + namn + (detalj ? " | " + detalj : "")); };
const num = (x) => { const n = typeof x === "number" ? x : parseFloat(String(x).replace(/\s/g, "")); return isFinite(n) ? n : NaN; };
const approx = (a, b, tol, pct) => pct ? Math.abs(a / b - 1) <= tol : Math.abs(a - b) <= tol;

// ---------- 1. struktur ----------
if (!existsSync(FIL)) { console.error("ABORT: paketet saknas"); process.exit(1); }
const p = JSON.parse(readFileSync(FIL, "utf8"));
K("S1 slug", p.slug === "sa-laser-du-cp-q3-2026");
K("S2 title <= 314 tkn (wihlborgs-taket)", p.title.length <= 314, p.title.length + " tkn");
K("S3 description <= 654 tkn (seriepraxis)", p.description.length <= 654, p.description.length + " tkn");
K("S4 publishedAt = rappdagen 2026-10-28", p.publishedAt === "2026-10-28");
K("S5 readingMinutes 5", p.readingMinutes === 5);
K("S6 tags 6 med klasser", Array.isArray(p.tags) && p.tags.length === 6 && ["kvartalsrapport","industri","Kanada","järnväg"].every(t => p.tags.includes(t)));
K("S7 pillar/author", p.pillar === "Institutionell metodik" && p.author === "AK1A Research Lab");

const B = p.body;
const rader = B.split("\n").map(r => r.trim());
const sista = rader.filter(r => r.length > 0).pop();
K("S8 H1 = 0", (B.match(/^# /gm) || []).length === 0);
K("S9 H2 = 8", (B.match(/^## /gm) || []).length === 8);
K("S10 disclaimer exakt sista raden", sista === "Rygraden i detta paket är aritmetiken: varje tal är antingen hämtat ur universumets insamling (med källnoter och dokumentklasser redovisade), webbverifierat hos namngiven källa, eller beräknat ur de tre — och beräkningsvägen redovisas, härledda imperativ inklusive. Inga köp-, sälj- eller behållningsrekommendationer förekommer; texten är utbildning i metodik enligt utbildningsundantaget (2 kap 5 § lagen 2007:528). Publicering av utkastet är kundens beslut (R2).");
K("S11 CJK 0", !/[\u4e00-\u9fff\u3040-\u30ff]/.test(B + p.title + p.description));
K("S12 mjuka bindestreck 0", !B.includes("­"));
K("S13 utbildningsframing", /så läser du|läsövning|utbildning i metod/.test(B));
const ord = B.split(/\s+/).filter(Boolean).length;
K("S14 ord 2400–3400 (Tesla-precedens 3298 grön)", ord >= 2400 && ord <= 3400, ord + " ord");

// ---------- 2. universumparitet LIVE ----------
const uni = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const lista = Array.isArray(uni) ? uni : (uni.bolag || uni.universum || uni.poster || Object.values(uni).find(Array.isArray));
const rad = lista.find(b => b.ticker === "CP");
K("U0 universumrad CP finns", !!rad);
const V = rad.vardering, L = rad.lonksamhet, T = rad.tillvaxt, S = rad.stabilitet, A = rad.aterkop;
const uniFalt = [
  ["P/E 28,17", V.pe, 28.17], ["P/B 2,63", V.pb, 2.63], ["EV/EBIT 18,85", V.evEbit, 18.85],
  ["PEG 2,26", V.peg, 2.2617, 0.001], ["FCF-yield 1,81 %", V.fcfYield, 0.018131, 0.001],
  ["ROE 9,54 %", L.roe, 0.0954], ["ROIC 5,66 %", L.roic, 0.0566], ["brutto 46,4 %", L.bruttoMarginal, 0.464],
  ["EBIT-marg 28,27 %", L.ebitMarginal, 0.2827], ["netto-marg 26,35 %", L.nettoMarginal, 0.2635],
  ["skuld/EK 0,66", S.skuldEgenkapital, 0.66], ["räntetäckning 5,23", S.rantaTackning, 5.23],
  ["pris 107,49", rad.pris, 107.49], ["mcap 100,27", rad.marknadsKapitalMdr, 100.27],
  ["omsTillv TTM +5,0 %", T.omsattningTillvaxtTTM, 0.05], ["prognos +12,5 %", T.prognosTillvaxt, 0.1246, 0.005],
];
for (const [namn, faktiskt, soll, tolPct] of uniFalt) K("U1 " + namn, approx(num(faktiskt), soll, tolPct || 0.0005, !tolPct), "fil=" + faktiskt);
// textförekomst av nyckeltalen
const textTal = [
  ["28,17", V.pe.toFixed(2) === "28.17" ? "28,17" : null],
];
for (const s of ["28,17", "2,63", "18,85", "9,54", "5,66", "46,4", "28,27", "26,35", "107,49", "100,27", "933,0", "5,23", "2,69", "0,80", "14 655", "3 801", "4,08", "1 818", "7,37", "12,46"]) K("U2 text bär " + s, B.includes(s) || p.title.includes(s) || p.description.includes(s));
// FY-seriens dec-slutande fyra år + K&A-brottet
K("U3 FY-serien i texten (oms-hopp K&A-brott FY2023 +42 %)", B.includes("12 555") && B.includes("14 655"));

// ---------- 3. medianer/rang LIVE ----------
const gren = lista.filter(b => (b.bransch || "") === "industri");
K("M0 industri-grenen n=36", gren.length === 36, "n=" + gren.length);
function stat(sokvag) {
  const par = gren.map(b => [b.ticker, sokvag(b)]).filter(x => typeof x[1] === "number" && isFinite(x[1]));
  const vals = par.map(x => x[1]).sort((a, b) => a - b);
  const n = vals.length;
  const med = n % 2 ? vals[(n - 1) / 2] : (vals[n / 2 - 1] + vals[n / 2]) / 2;
  const cpv = par.find(x => x[0] === "CP")[1];
  return { n, med, cpv, under: par.filter(x => x[1] < cpv).length, over: par.filter(x => x[1] > cpv).length,
    rangLagst: par.filter(x => x[1] < cpv).length + 1, rangHogst: par.filter(x => x[1] > cpv).length + 1 };
}
const v = b => b.vardering || {}, l = b => b.lonksamhet || {}, t = b => b.tillvaxt || {}, s = b => b.stabilitet || {};
const M = {
  pe: stat(b => v(b).pe), pb: stat(b => v(b).pb), evEbit: stat(b => v(b).evEbit), peg: stat(b => v(b).peg),
  fcf: stat(b => v(b).fcfYield), roe: stat(b => l(b).roe), roic: stat(b => l(b).roic),
  brutto: stat(b => l(b).bruttoMarginal), ebit: stat(b => l(b).ebitMarginal), netto: stat(b => l(b).nettoMarginal),
  skuld: stat(b => s(b).skuldEgenkapital), ttm: stat(b => t(b).omsattningTillvaxtTTM), prognos: stat(b => t(b).prognosTillvaxt),
};
const rangKontroller = [
  ["P/E: 18:e lägst av 36, median 28,21", M.pe.rangLagst === 18 && M.pe.n === 36 && approx(M.pe.med, 28.21, 0.005, true), "rangL=" + M.pe.rangLagst + " n=" + M.pe.n + " med=" + M.pe.med.toFixed(2)],
  ["P/B: 9:e lägst av 36, median 4,68", M.pb.rangLagst === 9 && M.pb.n === 36 && approx(M.pb.med, 4.68, 0.005, true), "rangL=" + M.pb.rangLagst + " med=" + M.pb.med.toFixed(2)],
  ["EV/EBIT: 18:e lägst av 35, median = CP 18,85", M.evEbit.rangLagst === 18 && M.evEbit.n === 35 && approx(M.evEbit.med, 18.85, 0.0005, true), "rangL=" + M.evEbit.rangLagst + " n=" + M.evEbit.n + " med=" + M.evEbit.med.toFixed(2) + " cp=" + M.evEbit.cpv.toFixed(2)],
  ["PEG: 8:e högst av 30, median 1,46", M.peg.rangHogst === 8 && M.peg.n === 30 && approx(M.peg.med, 1.46, 0.01, true), "rangH=" + M.peg.rangHogst + " n=" + M.peg.n + " med=" + M.peg.med.toFixed(3)],
  ["FCF: 4:e lägst av 34, median 3,54 %", M.fcf.rangLagst === 4 && M.fcf.n === 34 && approx(M.fcf.med, 0.0354, 0.01, true), "rangL=" + M.fcf.rangLagst + " n=" + M.fcf.n + " med=" + (M.fcf.med * 100).toFixed(2) + "%"],
  ["ROE: 5:e lägst av 36, median 18,8 %", M.roe.rangLagst === 5 && M.roe.n === 36 && approx(M.roe.med, 0.188, 0.005, true), "rangL=" + M.roe.rangLagst],
  ["ROIC: 4:e lägst av 34, median 12,6 %", M.roic.rangLagst === 4 && M.roic.n === 34 && approx(M.roic.med, 0.126, 0.005, true), "rangL=" + M.roic.rangLagst],
  ["Brutto: 7:e högst av 34, median 32,5 %", M.brutto.rangHogst === 7 && M.brutto.n === 34 && approx(M.brutto.med, 0.325, 0.005, true), "rangH=" + M.brutto.rangHogst],
  ["EBIT: 3:e högst av 36, median 13,0 %", M.ebit.rangHogst === 3 && M.ebit.n === 36 && approx(M.ebit.med, 0.1299, 0.005, true), "rangH=" + M.ebit.rangHogst],
  ["Netto: 3:e högst av 36, median 9,88 %", M.netto.rangHogst === 3 && M.netto.n === 36 && approx(M.netto.med, 0.0988, 0.005, true), "rangH=" + M.netto.rangHogst],
  ["Skuld/EK: 16 under, 18 över", M.skuld.under === 16 && M.skuld.over === 18, "under=" + M.skuld.under + " over=" + M.skuld.over],
  ["TTM-tillväxt: mitten (rangL 17 av 36)", M.ttm.rangLagst === 17 && M.ttm.n === 36, "rangL=" + M.ttm.rangLagst],
];
for (const [namn, ok, d] of rangKontroller) K("M1 " + namn, ok, d);
K("M2 texten bär rangorden (18:e lägst av 36 + 3:e högst av 36 + medianen själv)", B.includes("18:e lägst av 36") && B.includes("3:e högst av 36") && B.includes("är medianen själv"));

// ---------- 4. kvartalskanon (StockAnalysis TSX/CP GAAP, dubbelhämtad 2026-10-01 + pressreleaser) ----------
const Q = {
  q325: { rev: 3661, netto: 920, eps: 1.01, ebit: 1456, fcf: 407, core: 1.10, coreOr: 60.7 },
  q425: { rev: 3923, netto: 1077, eps: 1.19, ebit: 1727, fcf: 729, core: 1.33, coreOr: 55.9 },
  q126: { rev: 3701, netto: 846, eps: 0.94, ebit: 1390, fcf: 307, core: 1.04, coreOr: 63.0 },
  q226: { rev: 4164, netto: 1024, eps: 1.15, ebit: 1623, fcf: 960, core: 1.27, coreOr: 61.6 },
};
const qtxt = [
  ["Q3-25 intäkt 3 661", "3 661"], ["Q4-25 intäkt 3 923", "3 923"], ["Q1-26 intäkt 3 701", "3 701"], ["Q2-26 intäkt 4 164", "4 164"],
  ["Q3-25 netto 920", "920"], ["Q4-25 netto 1 077", "1 077"], ["Q1-26 netto 846", "846"], ["Q2-26 netto 1 024", "1 024"],
  ["EPS-kedjan 1,01/1,19/0,94/1,15", "1,01 + 1,19 + 0,94 + 1,15"],
  ["core-kedjan 1,10/1,33/1,04/1,27", "1,10 + 1,33 + 1,04 + 1,27"],
  ["core FY25-fält 1,06+1,12", "1,06 + 1,12"],
  ["OR-trappa per tal: 60,7, 55,9, 63,0, 61,6", "60,7"],
  ["OR-trappa 55,9", "55,9"], ["OR-trappa 63,0", "63,0"], ["OR-trappa 61,6", "61,6"],
  ["Panama 282", "282"], ["återköp 1 298", "1 298"], ["NCIB 44,9 M", "44,9"],
  ["skatt 24,65/22,45", "24,65"], ["bränsle 618/405", "618"], ["RTM +4", "RTM +4"],
  ["utdelning 0,268/0,228", "0,268"], ["capex-guide 2,65", "2,65"],
  ["skuldtrappa 22 269/23 891/23 598/24 320/25 147", "22 269 (Q2-25) → 23 891 → 23 598 → 24 320 → 25 147"],
  ["kassa 799/366", "799"], ["nettoskuld 21 470/24 781", "21 470 → 24 781"],
  ["statistik mcap 106,54", "106,54"], ["statistik aktier 879,1", "879,1"], ["statistik P/E 28,19", "28,19"],
  ["statistik Altman 2,09", "2,09"], ["statistik DPS 1,07", "1,07"],
  ["grain 925/743", "925"], ["intermodal 758/684", "758"], ["fordon 403/330", "403"], ["kol 209/256", "256"],
];
for (const [namn, s] of qtxt) K("Q1 " + namn, B.includes(s), '"' + s + '" saknas');

// ---------- 5. aritmetik oberoende omräknad ----------
const ttmRev = Q.q325.rev + Q.q425.rev + Q.q126.rev + Q.q226.rev;
const ttmNetto = Q.q325.netto + Q.q425.netto + Q.q126.netto + Q.q226.netto;
const ttmEps = Q.q325.eps + Q.q425.eps + Q.q126.eps + Q.q226.eps;
const ttmEbit = Q.q325.ebit + Q.q425.ebit + Q.q126.ebit + Q.q226.ebit;
const ttmFcf = Q.q325.fcf + Q.q425.fcf + Q.q126.fcf + Q.q226.fcf;
const arit = [
  ["TTM intäkt 15 449", ttmRev === 15449],
  ["TTM netto 3 867", ttmNetto === 3867],
  ["TTM EPS 4,29", approx(ttmEps, 4.29, 0.005, false)],
  ["TTM EBIT 6 196", ttmEbit === 6196],
  ["TTM FCF 2 403", ttmFcf === 2403],
  ["FY-25 kvartalssumma intäkt 15 078", 3795 + 3699 + 3661 + 3923 === 15078],
  ["FY-25 kvartalssumma netto 4 141", 910 + 1234 + 920 + 1077 === 4141],
  ["core FY-25 4,61 stänger bolagets fält EXAKT", approx(1.06 + 1.12 + 1.10 + 1.33, 4.61, 0.005, false)],
  ["core TTM 4,74", approx(1.10 + 1.33 + 1.04 + 1.27, 4.74, 0.005, false)],
  ["identitetstest P/B÷ROE = 27,57", approx(2.63 / 0.0954, 27.57, 0.01, false)],
  ["gap fält +2,2 %", approx((28.17 - 2.63 / 0.0954) / (2.63 / 0.0954), 0.022, 0.02, true)],
  ["core-bas 107,49/28,17 = 3,82", approx(107.49 / 28.17, 3.82, 0.01, false)],
  ["kurs härledd 106540/879,08 = 121,19", approx(106540 / 879.08, 121.19, 0.01, false)],
  ["P/E GAAP-TTM 121,19/4,29 = 28,25", approx(121.19 / 4.29, 28.25, 0.02, false)],
  ["P/E core-TTM 121,19/4,74 = 25,57", approx(121.19 / 4.74, 25.57, 0.02, false)],
  ["kursstegring 09-25→10-01 = +12,7 %", approx(121.19 / 107.49 - 1, 0.127, 0.005, true)],
  ["aktiebas-gap 933,0/879,08 = 6,1 %", approx(933.0 / 879.08 - 1, 0.061, 0.01, true)],
  ["Q2-26 implicit aktiebas 1024/1,15 = 890", approx(1024 / 1.15, 890, 1, false)],
  ["EV balansväg 106,54+25,15−0,37 = 131,3", approx(106.54 + 25.147 - 0.366, 131.32, 0.01, false)],
  ["EV/Sales-väg 8,56×15,449 = 132,2", approx(8.56 * 15.449, 132.2, 0.15, false)],
  ["EV/EBIT balansväg 131,3/6,196 = 21,2", approx(131.32 / 6.196, 21.2, 0.05, false)],
  ["skuld +12,9 % på ett år", approx(25147 / 22269 - 1, 0.129, 0.005, true)],
  ["nettoskuld +15,4 % på ett år", approx(24781 / 21470 - 1, 0.154, 0.005, true)],
  ["kärn-Q2-25 1234−282 = 952", 1234 - 282 === 952],
  ["GAAP-kärnsväng +7,6 %", approx(1024 / 952 - 1, 0.076, 0.005, true)],
  ["Panama per aktie ≈ 0,30", approx(282 / 928, 0.304, 0.01, false)],
  ["H2 för 10 %: 4,61×1,10−2,31 = 2,76", approx(4.61 * 1.10 - 2.31, 2.76, 0.01, false)],
  ["H2-tillväxt 2,76/2,43 = +13,6 %", approx(2.76 / 2.43 - 1, 0.136, 0.005, true)],
  ["H2 för 12 %: +17,4 %", approx((4.61 * 1.12 - 2.31) / 2.43 - 1, 0.174, 0.005, true)],
  ["brytpunkt P/E 28 ⇒ Q3-EPS 1,05", approx(121.19 / 28 - (4.29 - 1.01), 1.05, 0.01, false)],
  ["brytpunkt P/E 27 ⇒ 1,21", approx(121.19 / 27 - 3.28, 1.21, 0.01, false)],
  ["brytpunkt P/E 26 ⇒ 1,38", approx(121.19 / 26 - 3.28, 1.38, 0.01, false)],
  ["brytpunkt P/E 25 ⇒ 1,57 (+55 %)", approx(121.19 / 25 - 3.28, 1.57, 0.01, false) && approx(1.57 / 1.01 - 1, 0.55, 0.01, true)],
  ["utdelning 0,268×4 ≈ 1,07", approx(0.268 * 4, 1.07, 0.005, false)],
  ["utdelningshöjning +17,5 %", approx(0.268 / 0.228 - 1, 0.175, 0.005, true)],
  ["Q2-utdelning+återköp+capex 2268 > OCF 1726, gap 542", 204 + 1298 + 766 === 2268 && 2268 - 1726 === 542],
  ["nettoskuldtillväxt +3 311", 24781 - 21470 === 3311],
  ["marginaltickare 4 100×1 pp = 41 M", approx(4100 * 0.01, 41, 0.5, false)],
  ["marginaltickare per aktie 41/879,1 ≈ 0,05", approx(41 / 879.08, 0.05, 0.004, false)],
  ["grain +24,5 %", approx(925 / 743 - 1, 0.245, 0.005, true)],
  ["intermodal +10,8 %", approx(758 / 684 - 1, 0.108, 0.005, true)],
  ["fordon +22 %", approx(403 / 330 - 1, 0.22, 0.01, true)],
  ["kol −18 %", approx(209 / 256 - 1, -0.18, 0.025, true)],
  ["bränsle +52,6 %", approx(618 / 405 - 1, 0.526, 0.005, true)],
  ["konsensus-core 1,33 = +21 % på årsbasis", approx(1.33 / 1.10 - 1, 0.21, 0.01, true)],
  ["intäktstillväxt Q2-26 +12,6 %", approx(4164 / 3699 - 1, 0.126, 0.005, true)],
];
for (const [namn, ok] of arit) K("A1 " + namn, ok);

// scenariorutan 9 celler: netto = intäkt×marginal (heltal); EPS = netto/879,08 (2 dec);
// P/E = 121,19/(3,28+EPS-ourundad) — ASM-läxan: ingen mellanrundning i cellkedjan
const sc = [];
for (const rev of [3900, 4100, 4300]) for (const m of [0.22, 0.24, 0.26]) {
  const netto = rev * m, epsExakt = netto / 879.08, peExakt = 121.19 / (3.28 + epsExakt);
  sc.push({ rev, m, netto: Math.round(netto), eps: +epsExakt.toFixed(2), epsExakt, peExakt });
}
const scOK = sc.every(c => Number.isInteger(c.netto) && approx(c.epsExakt, c.eps, 0.005, false) && approx(c.peExakt, +(121.19 / (3.28 + c.epsExakt)), 0.0001, false));
K("A2 scenariorutan 9/9 celler motorräknade (netto heltal, EPS ourundad kedja)", scOK, sc.map(c => c.netto + "·" + c.eps.toFixed(2) + "·" + c.peExakt.toFixed(1)).join(" "));
// cellernas netto+EPS+P/E står i tabellen (P/E på ourundad kedja, 1 decimal)
for (const c of sc) {
  const epsStr = c.eps.toFixed(2).replace(".", ",");
  const peStr = c.peExakt.toFixed(1).replace(".", ",");
  const nettoStr = String(Math.round(c.netto)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  K("A3 cell " + c.rev + "/" + Math.round(c.m * 100) + "%: " + nettoStr + " · " + epsStr + " · " + peStr, B.includes(nettoStr + " · " + epsStr + " · " + peStr));
}

// ---------- 6. juridikgrind ----------
const ytor = [p.title, p.description, B];
const allt = ytor.join("\n");
// kanonfraser som BÄR negeringen (utbildningsdeklaration + slutrad)
const negerat = ["inte en rekommendation att köpa, sälja eller behålla några värdepapper", "Inga köp-, sälj- eller behållningsrekommendationer förekommer"];
let bärText = allt;
for (const f of negerat) bärText = bärText.split(f).join(" ");
// smala rådmönster (träffar UTANFÖR kanonfraserna räknas)
const radMönster = [
  /\binvesteringsrådgivning/i, /rådgivning (om|kring) (aktier|värdepapper|köp|sälj)/i,
  /målkurs/i, /\bbör du (köpa|sälja|teckna)/i, /rekommenderar (dig|vi|att)/i,
  /tipsa om/i, /\b(köpa|sälja|behålla)\b/, /\bköp\b(?!-,)/, /\bsälj\b/, /teckna (optioner|aktier)/i,
];
let radg = 0;
for (const re of radMönster) { const m = bärText.match(re); if (m) { radg++; console.log("   rådgloss-träff: " + JSON.stringify(m[0])); } }
K("J1 rådglossor 0 utanför kanonfraserna", radg === 0, radg + " träffar");
const lagrum = [...new Set([...(B + p.title + p.description).matchAll(/(\d{4}:\d+|\d kap \d+ §)/g)].map(m => m[0]))];
K("J2 exakt en lagrumsfamilj: 2007:528 (2 kap 5 §)", lagrum.length === 2 && lagrum.includes("2007:528") && lagrum.includes("2 kap 5 §"), lagrum.join(","));
K("J3 R2-disclaimer i body", B.includes("Publicering av utkastet är kundens beslut (R2)"));

// ---------- 7. länkar ----------
const interna = [...new Set([...B.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))].filter(u => !u.startsWith("/http"));
const aspektSlugar = ["pe", "pb", "ev-ebit", "peg", "fcf-avkastning", "roe", "roic", "brutto-marginal", "netto-marginal", "skuldsattning", "omsattningstillvaxt-ttm", "prognos-tillvaxt", "universumjamforelse"];
const ovriga = ["/kurser", "/transparens", "/kallor"];
for (const u of interna) {
  const m = u.match(/^\/dataset\/industri\/([a-z0-9-]+)$/);
  K("L1 intern länk giltig: " + u, (m && aspektSlugar.includes(m[1])) || ovriga.includes(u));
}
K("L2 aspekttäckning ≥ 11 av 13", aspektSlugar.filter(s => interna.includes("/dataset/industri/" + s)).length >= 11, aspektSlugar.filter(s => interna.includes("/dataset/industri/" + s)).length + "/13");
const externa = [...new Set([...B.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]))];
const externaOK = ["stockanalysis.com", "prnewswire.com", "investor.cpkcr.com", "cpkcr.com", "s21.q4cdn.com"];
K("L3 externa domäner namngivna", externa.length >= 5 && externa.every(u => externaOK.some(d => u.includes(d))), externa.length + " st");
K("L4 paketet ligger i utkast (data/blogg/ orörd — R2)", FIL.startsWith("data/blogg-utkast/") && !existsSync("data/blogg/cp-q3-2026.json") && !existsSync("data/blogg/sa-laser-du-cp-q3-2026.json"));

if (HTTP) {
  const kontrollera = async (url) => {
    try {
      const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" } });
      return r.status;
    } catch { return 0; }
  };
  const bas = "http://localhost:3000";
  let okI = 0, totI = 0;
  for (const u of interna) { totI++; const st = await kontrollera(bas + u); if (st === 200) okI++; else varn.push("HTTP " + st + " " + u); }
  K("L5 interna HTTP 200 (" + okI + "/" + totI + ")", okI === totI);
  let okE = 0, totE = 0;
  for (const u of externa) { totE++; const st = await kontrollera(u); if (st === 200) okE++; else varn.push("HTTP " + st + " " + u); }
  K("L6 externa HTTP 200 (" + okE + "/" + totE + ")", okE === totE);
}

// ---------- summering ----------
console.log("\n═══ KVD SUMMERING ═══");
console.log("PASS: " + pass + " | FEL: " + fel.length + " | VARNINGAR: " + varn.length);
if (varn.length) varn.forEach(w => console.log("VARN: " + w));
if (fel.length) { fel.forEach(f => console.log("FEL: " + f)); process.exit(1); }
console.log("GRÖN");
