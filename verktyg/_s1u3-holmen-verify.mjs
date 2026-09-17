// Sond: granskning kvartalspaket HOLM Q3-2026 (s1-u3, auto-s1-1789625727468)
// Oberoende omräkning ur råfilerna — INGEN återanvändning av byggarens skript.
// v2: NBSP-normalisering (bodyn använder U+00A0 i 38 tusentalsavgränsningar),
//     enhetsfix EV-kedja (kr vs Mkr), presentations-toleranser, F7-paketkontroll.
import fs from "node:fs";

const ROT = "/home/ak1a/AK1";
const las = (p) => JSON.parse(fs.readFileSync(ROT + p, "utf8"));
const u = las("/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-holm-q3-2026.json");
const uni = las("/data/portfolj-system/bolagsunivers.json");
const kal = las("/data/blogg-utkast/kvartal/2026-q3/kalender-material.json");

const R = [];
let fel = 0, ok = 0;
const r = (id, pass, detalj) => {
  R.push({ id, pass: !!pass, detalj });
  if (pass) ok++; else fel++;
  console.log(`${pass ? "OK  " : "FEL "} ${id}: ${detalj}`);
};
const approx = (faktisk, pataget, toleransRel = 0.005, toleransAbs = null) => {
  if (toleransAbs !== null) return Math.abs(faktisk - pataget) <= toleransAbs;
  return Math.abs(faktisk - pataget) <= Math.max(toleransAbs ?? 0, Math.abs(pataget) * toleransRel);
};

const h = uni.find((b) => b.ticker === "HOLM-B.ST");
const body = u.body;
const bodyN = body.replace(/\u00a0/g, " "); // U+00A0 → vanligt mellanslag för includes-tester
const hela = JSON.stringify(u);

// ── A. Källfält: HOLM-raden mot utkastets tal ─────────────────────────────
r("A1 pe", h.vardering.pe === 18.824 && bodyN.includes("18,824"), `källa ${h.vardering.pe}`);
r("A2 pb", h.vardering.pb === 0.907 && bodyN.includes("0,907"), `källa ${h.vardering.pb}`);
r("A3 roe", h.lonksamhet.roe === 0.048, `källa ${h.lonksamhet.roe}`);
r("A4 roic", approx(h.lonksamhet.roic, 0.036, 0.001), `källa ${h.lonksamhet.roic} (text 3,6)`);
r("A5 brutto", approx(h.lonksamhet.bruttoMarginal, 0.456, 0.0005), `källa ${h.lonksamhet.bruttoMarginal}`);
r("A6 ebitmarg", approx(h.lonksamhet.ebitMarginal, 0.0724, 0.00005), `källa ${h.lonksamhet.ebitMarginal}`);
r("A7 nettomarg", approx(h.lonksamhet.nettoMarginal, 0.1186, 0.00005), `källa ${h.lonksamhet.nettoMarginal}`);
r("A8 fcfmarg", approx(h.lonksamhet.fcfMarginal, 0.0335, 0.00005), `källa ${h.lonksamhet.fcfMarginal}`);
r("A9 fcfyield", approx(h.vardering.fcfYield, 0.0152, 0.00005), `källa ${h.vardering.fcfYield}`);
r("A10 skuldek", approx(h.stabilitet.skuldEgenkapital, 0.1277, 0.0005) && bodyN.includes("0,128"), `källa ${h.stabilitet.skuldEgenkapital} (text 0,128)`);
r("A11 raInteNull", h.stabilitet.rantaTackning === null && bodyN.includes("osatt"), "räntetäckning null + texten osatt");
r("A12 evebit", approx(h.vardering.evEbit, 34.557, 0.0005), `källa ${h.vardering.evEbit}`);
r("A13 peg", h.vardering.peg === 4.94, `källa ${h.vardering.peg}`);
r("A14 pris", h.pris === 326.6 && bodyN.includes("326,60"), `källa ${h.pris}`);
r("A15 mcap", approx(h.marknadsKapitalMdr, 49.132, 0.0005) && bodyN.includes("49,1"), `källa ${h.marknadsKapitalMdr}`);
r("A16 insider0", h.aterkop.insiderkopSenaste6man === 0, `källa ${h.aterkop.insiderkopSenaste6man}`);
r("A17 aterkopNull", h.aterkop.senasteArMdr === null, "återköp null");
r("A18 prognos", approx(h.tillvaxt.prognosTillvaxt, 0.1085, 0.00005), `källa ${h.tillvaxt.prognosTillvaxt}`);
r("A19 ttm", approx(h.tillvaxt.omsattningTillvaxtTTM, 0.011, 0.0005), `källa ${h.tillvaxt.omsattningTillvaxtTTM}`);
r("A20 serier", JSON.stringify(h.serier.omsattning) === JSON.stringify([23952000000, 22795000000, 22759000000, 22056000000]) && JSON.stringify(h.serier.resultat) === JSON.stringify([5874000000, 3697000000, 2861000000, 2879000000]), "intäkt/resultatserier exakta");
r("A21 fyrarornotis", h.notering.includes("4 räkenskapsår") && bodyN.includes("fyra år, inte fem"), "källans 4-årsnotis återspeglad");

// ── B. Medianer: EGEN beräkning ur 144-filen (jämnt antal ⇒ medel av mittersta)
const med = (arr) => {
  const s = arr.filter((v) => v !== null && v !== undefined).sort((a, b) => a - b);
  if (s.length === 0) return null;
  const m = Math.floor((s.length - 1) / 2);
  return s.length % 2 ? s[m] : (s[m] + s[m + 1]) / 2;
};
const mat = uni.filter((b) => b.bransch === "material");
const peS = mat.map((b) => b.vardering.pe).filter((v) => v != null).sort((a, b) => a - b);
const pbS = mat.map((b) => b.vardering.pb).filter((v) => v != null).sort((a, b) => a - b);
const roeS = mat.map((b) => b.lonksamhet.roe).filter((v) => v != null).sort((a, b) => a - b);
const ebitS = mat.map((b) => b.lonksamhet.ebitMarginal).filter((v) => v != null).sort((a, b) => a - b);
const nettoS = mat.map((b) => b.lonksamhet.nettoMarginal).filter((v) => v != null).sort((a, b) => a - b);
const skuldS = mat.map((b) => b.stabilitet.skuldEgenkapital).filter((v) => v != null).sort((a, b) => a - b);
const evS = mat.map((b) => b.vardering.evEbit).filter((v) => v != null).sort((a, b) => a - b);
const bruttoS = mat.map((b) => b.lonksamhet.bruttoMarginal).filter((v) => v != null).sort((a, b) => a - b);
r("B1 materialN", mat.length === 14 && bodyN.includes("fjorton bolag") && bodyN.includes("(14 bolag)"), `material n=${mat.length}`);
r("B2 peMedian", approx(med(peS), 18.824, 0.001), `median ${med(peS).toFixed(3)} (n=${peS.length}, text 18,8 n=13) — Holmen = medianelementet? pe=${h.vardering.pe}`);
r("B3 peRank", peS[Math.floor((peS.length - 1) / 2)] === 18.824 || peS[6] === 18.824, `sorterade P/E: ${peS.map(v => v.toFixed(2)).join(", ")}; 7:e värdet (index 6) = ${peS[6]}`);
r("B4 pbMedian", approx(med(pbS), 1.40, 0.01), `median ${med(pbS).toFixed(3)} (n=${pbS.length}) → text 1,40`);
r("B5 roeMedian", approx(med(roeS), 0.072, 0.01), `median ${(med(roeS)*100).toFixed(2)} % → text 7,2 (n=${roeS.length})`);
r("B6 ebitMedian", approx(med(ebitS), 0.111, 0.01), `median ${(med(ebitS)*100).toFixed(2)} % → text 11,1 (n=${ebitS.length})`);
r("B7 nettoMedian", approx(med(nettoS), 0.093, 0.01), `median ${(med(nettoS)*100).toFixed(2)} % → text 9,3 (n=${nettoS.length})`);
r("B8 skuldMedian", approx(med(skuldS), 0.32, 0.01), `median ${med(skuldS).toFixed(3)} (n=${skuldS.length})`);
r("B9 evMedian", approx(med(evS), 14.37, 0.01), `median ${med(evS).toFixed(2)} (n=${evS.length})`);
r("B10 bruttoMedian", approx(med(bruttoS), 0.335, 0.005), `median ${(med(bruttoS)*100).toFixed(1)} % → text 33,5 (n=${bruttoS.length})`);
r("B11 skuldRank", skuldS.indexOf(h.stabilitet.skuldEgenkapital) === 0, `Holmen lägst i grenen? min=${skuldS[0]} (Holmen ${h.stabilitet.skuldEgenkapital}) — "ingen lägre kvot"`);
const uPE = med(uni.map((b) => b.vardering.pe).filter((v) => v != null));
const uPB = med(uni.map((b) => b.vardering.pb).filter((v) => v != null));
const uROE = med(uni.map((b) => b.lonksamhet.roe).filter((v) => v != null));
const uEBIT = med(uni.map((b) => b.lonksamhet.ebitMarginal).filter((v) => v != null));
const uNetto = med(uni.map((b) => b.lonksamhet.nettoMarginal).filter((v) => v != null));
const uSkuld = med(uni.map((b) => b.stabilitet.skuldEgenkapital).filter((v) => v != null));
const nPE = uni.filter((b) => b.vardering.pe != null).length;
const nPB = uni.filter((b) => b.vardering.pb != null).length;
const nROE = uni.filter((b) => b.lonksamhet.roe != null).length;
const nEBIT = uni.filter((b) => b.lonksamhet.ebitMarginal != null).length;
const nNetto = uni.filter((b) => b.lonksamhet.nettoMarginal != null).length;
const nSkuld = uni.filter((b) => b.stabilitet.skuldEgenkapital != null).length;
r("B12 universumMedianer", approx(uPE, 21.2, 0.005) && approx(uPB, 2.88, 0.005) && approx(uROE, 0.156, 0.005) && approx(uEBIT, 0.212, 0.005) && approx(uNetto, 0.147, 0.005) && approx(uSkuld, 0.52, 0.01), `P/E ${uPE.toFixed(2)}(n=${nPE}) P/B ${uPB.toFixed(2)}(n=${nPB}) ROE ${(uROE*100).toFixed(1)}%(n=${nROE}) EBIT ${(uEBIT*100).toFixed(1)}%(n=${nEBIT}) netto ${(uNetto*100).toFixed(1)}%(n=${nNetto}) skuld ${uSkuld.toFixed(2)}(n=${nSkuld})`);

// ── C. Serier, steg, CAGR, härledd nettomarginalserie ─────────────────────
const oms = h.serier.omsattning, res = h.serier.resultat;
const stegF = (a, b) => (b - a) / a;
r("C1 intaktssteg", approx(stegF(oms[0], oms[1]), -0.0483, 0.005) && approx(stegF(oms[1], oms[2]), -0.0016, 0.005) && approx(stegF(oms[2], oms[3]), -0.0309, 0.005), `${(stegF(oms[0],oms[1])*100).toFixed(2)}/${(stegF(oms[1],oms[2])*100).toFixed(2)}/${(stegF(oms[2],oms[3])*100).toFixed(2)} % (text −4,83/−0,16/−3,09)`);
r("C2 resultatsteg", approx(stegF(res[0], res[1]), -0.3706, 0.002) && approx(stegF(res[1], res[2]), -0.2261, 0.002) && approx(stegF(res[2], res[3]), 0.0063, 0.002), `${(stegF(res[0],res[1])*100).toFixed(2)}/${(stegF(res[1],res[2])*100).toFixed(2)}/${(stegF(res[2],res[3])*100).toFixed(2)} % (text −37,06/−22,61/+0,63)`);
const cagr = (s) => Math.pow(s[s.length - 1] / s[0], 1 / (s.length - 1)) - 1;
r("C3 cagrOms", approx(cagr(oms), -0.0271, 0.005), `${(cagr(oms)*100).toFixed(3)} % (text −2,71)`);
r("C4 cagrRes", approx(cagr(res), -0.2116, 0.005), `${(cagr(res)*100).toFixed(3)} % (text −21,16; PEG-avsnittet −21,2)`);
const nm = res.map((v, i) => (v / oms[i]) * 100);
r("C5 nettomarginalserie", approx(nm[0], 24.52, 0.0005) && approx(nm[1], 16.22, 0.0005) && approx(nm[2], 12.57, 0.0005) && approx(nm[3], 13.05, 0.0005) && nm[3] > nm[2], `${nm.map(v=>v.toFixed(2)).join(" → ")} % (text 24,52/16,22/12,57/13,05; fjärde året uppåt ✓)`);
r("C6 plant861till2879", res[2] === 2861000000 && res[3] === 2879000000 && bodyN.includes("2 861 → 2 879"), "år3→år4 2 861→2 879 i princip plant ✓");

// ── D. Räkneexempel (identitet, absolut, nettoFÄLT, PEG, EV-kedja, FCF …)
// enhetskonvention: mcap/ek/skuld/ev i MKR; ebit/fcf beräknas i kr → /1e6 för Mkr
const pe = h.vardering.pe, pb = h.vardering.pb, roe = h.lonksamhet.roe, mcap = h.marknadsKapitalMdr * 1000;
r("D1 identitetFram", approx(pb / roe, 18.8958, 0.001) && bodyN.includes("18,90"), `${(pb/roe).toFixed(4)} mot pe ${pe} = ${(((pb/roe)-pe)/pe*100).toFixed(2)} % (text 18,90 / 0,38 %)`);
r("D2 identitetDiff", approx(((pb / roe) - pe) / pe, 0.0038, 0.005), `differens ${(((pb/roe)-pe)/pe*100).toFixed(2)} % (text 0,38)`);
r("D3 identitetBack", approx(pe * roe, 0.90355, 0.0005) && bodyN.includes("0,904"), `${(pe*roe).toFixed(4)} mot pb ${pb} (text 0,904 mot 0,907)`);
const epsExakt = h.pris / pe;
r("D4 implicitEps", approx(epsExakt, 17.35, 0.005) && bodyN.includes("17,35"), `${epsExakt.toFixed(3)} kr med pe 18,824 — men textens divisionsform "delat med 18,8" ger ${(h.pris/18.8).toFixed(2)}: divisionssträngen behöver 18,824`);
r("D5 absolutArsserie", approx((pe * res[3] / 1e9 - h.marknadsKapitalMdr) / h.marknadsKapitalMdr, 0.103, 0.005) && bodyN.includes("10,3 procent"), `pe×2 879 = ${(pe*res[3]/1e9).toFixed(1)} mdr mot ${h.marknadsKapitalMdr} = +${(((pe*res[3]/1e9)-h.marknadsKapitalMdr)/h.marknadsKapitalMdr*100).toFixed(2)} %`);
r("D6 absolutBack", approx(mcap / pe, 2610, 0.002) && bodyN.includes("2 610"), `${(mcap/pe).toFixed(1)} Mkr (text 2 610)`);
r("D7 peDirekt", approx(mcap / (res[3] / 1e6), 17.07, 0.005) && bodyN.includes("17,1"), `${(mcap/(res[3]/1e6)).toFixed(2)} (text 17,1)`);
const nettoVinst = oms[3] * h.lonksamhet.nettoMarginal; // kr
r("D8 nettoFALT-stangning", approx((pe * (nettoVinst / 1e9) - h.marknadsKapitalMdr) / h.marknadsKapitalMdr, 0.0023, 0.02), `pe×(22 056×11,86 % = ${Math.round(nettoVinst/1e6)} Mkr) = ${(pe*nettoVinst/1e9).toFixed(2)} mdr mot ${h.marknadsKapitalMdr} = +${(((pe*nettoVinst/1e9)-h.marknadsKapitalMdr)/h.marknadsKapitalMdr*100).toFixed(2)} % — fältens vinst-värld följer NETTOFÄLTET (s4-u1:s ombeställning: denna stängning finns EJ i utkastet → C-post)`);
r("D9 pegKonvention", approx(pe / (h.tillvaxt.prognosTillvaxt * 100), 1.7348, 0.002) && bodyN.includes("1,73"), `${(pe/(h.tillvaxt.prognosTillvaxt*100)).toFixed(3)} (text 1,73)`);
r("D10 pegKvot", approx(h.vardering.peg / (pe / (h.tillvaxt.prognosTillvaxt * 100)), 2.848, 0.01) && bodyN.includes("2,85"), `${(h.vardering.peg/(pe/(h.tillvaxt.prognosTillvaxt*100))).toFixed(2)} (text 2,85; bodyn "2,8 gånger")`);
r("D11 pegImplicit", approx(pe / h.vardering.peg, 3.8106, 0.005) && bodyN.includes("3,8 procent"), `${(pe/h.vardering.peg).toFixed(2)} % (text 3,8)`);
const ek = mcap / pb, skuld = ek * h.stabilitet.skuldEgenkapital, ev = ek + skuld; // Mkr
const ebitMkr = (oms[3] * h.lonksamhet.ebitMarginal) / 1e6;
r("D12 ek", approx(ek / 1000, 54.18, 0.005) && bodyN.includes("54,2"), `EK ${(ek/1000).toFixed(2)} mdr (text 54,2)`);
r("D13 skuld", approx(skuld / 1000, 6.92, 0.005) && bodyN.includes("6,9"), `skuld ${(skuld/1000).toFixed(2)} mdr (text 6,9)`);
r("D14 ev", approx(ev / 1000, 61.09, 0.005) && bodyN.includes("61,1"), `EV ${(ev/1000).toFixed(2)} mdr (text 61,1)`);
r("D15 ebitBas", approx(ebitMkr, 1596.9, 0.002) && bodyN.includes("1 597"), `EBIT ${ebitMkr.toFixed(1)} Mkr (text 1 597)`);
r("D16 evEbitKedja", approx(ev / ebitMkr, 38.26, 0.005) && bodyN.includes("38,3"), `${(ev/ebitMkr).toFixed(2)} (text 38,3)`);
r("D17 evKvot", approx((ev / ebitMkr) / h.vardering.evEbit, 1.107, 0.005) && bodyN.includes("1,11"), `${((ev/ebitMkr)/h.vardering.evEbit).toFixed(3)} (text 1,11)`);
const faltEvMkr = h.vardering.evEbit * ebitMkr;
const kassaMkr = mcap + skuld - faltEvMkr;
r("D18 kassaResidual", approx(kassaMkr / 1000, 0.87, 0.01) && bodyN.includes("0,9 miljarder"), `kassa ${kassaMkr.toFixed(0)} Mkr = ${(kassaMkr/1000).toFixed(2)} mdr (text 0,9) — procentpoäng: ${(kassaMkr/ev*100).toFixed(1)} % av kedje-EV 61,1 / ${(kassaMkr/mcap*100).toFixed(1)} % av börsvärdet / ${(kassaMkr/faltEvMkr*100).toFixed(1)} % av fält-EV 55,2 → textens "ungefär två procent av EV" är generös (1,4–1,8 % beroende referens)`);
const fcfMkr = (h.lonksamhet.fcfMarginal * oms[3]) / 1e6;
r("D19 fcf", approx(fcfMkr, 738.9, 0.002) && bodyN.includes("739"), `${fcfMkr.toFixed(1)} Mkr (text 739)`);
r("D20 fcfYieldEgen", approx((fcfMkr / mcap) * 100, 1.504, 0.005) && bodyN.includes("1,50 procent") && bodyN.includes("fältets 1,52"), `${((fcfMkr/mcap)*100).toFixed(2)} % (text 1,50 mot fält 1,52)`);
const pbK = pb / med(pbS), roeK = roe / med(roeS);
r("D21 dupontPrisform", approx(pbK, 0.648, 0.005) && approx(roeK, 0.667, 0.005) && approx(pbK / roeK, 0.971, 0.005) && bodyN.includes("0,65 ÷ 0,67 = 0,97"), `P/B-kvot ${pbK.toFixed(3)} ÷ ROE-kvot ${roeK.toFixed(3)} = ${(pbK/roeK).toFixed(3)} (text 0,65 ÷ 0,67 = 0,97)`);
r("D22 underOverProcent", approx((pe/uPE-1), -0.112, 0.01) && approx((pb/uPB-1), -0.685, 0.01) && approx((pb/med(pbS)-1), -0.352, 0.01) && approx((roe/med(roeS)-1), -0.333, 0.01) && approx((h.lonksamhet.bruttoMarginal/med(bruttoS)-1), 0.361, 0.01) && approx((h.lonksamhet.ebitMarginal/med(ebitS)-1), -0.348, 0.01) && approx((h.lonksamhet.nettoMarginal/med(nettoS)-1), 0.275, 0.01), `elva under universum ${((pe/uPE-1)*100).toFixed(1)}; 68 under ${((pb/uPB-1)*100).toFixed(1)}; 35 under bransch ${((pb/med(pbS)-1)*100).toFixed(1)}; 33 under ${((roe/med(roeS)-1)*100).toFixed(1)}; 36 över ${((h.lonksamhet.bruttoMarginal/med(bruttoS)-1)*100).toFixed(1)}; 35 under ${((h.lonksamhet.ebitMarginal/med(ebitS)-1)*100).toFixed(1)}; 27 över ${((h.lonksamhet.nettoMarginal/med(nettoS)-1)*100).toFixed(1)}`);
r("D23 skuldtredjedel", h.stabilitet.skuldEgenkapital / med(skuldS) < 0.45 && h.stabilitet.skuldEgenkapital / med(skuldS) > 0.36, `0,128/0,32 = ${(h.stabilitet.skuldEgenkapital/med(skuldS)*100).toFixed(1)} % — textens "en tredjedel" (33 %) är FEL bråkform: faktiskt två femtedelar/40 % → B-post`);
r("D24 skuldfjardedel", h.stabilitet.skuldEgenkapital / uSkuld > 0.22 && h.stabilitet.skuldEgenkapital / uSkuld < 0.27, `0,128/0,52 = ${(h.stabilitet.skuldEgenkapital/uSkuld*100).toFixed(1)} % ≈ en fjärdedel ✓`);
r("D25 nettoOverEbitGap", approx((h.lonksamhet.nettoMarginal - h.lonksamhet.ebitMarginal) * 100, 4.62, 0.002) && approx((h.lonksamhet.nettoMarginal - h.lonksamhet.ebitMarginal) * oms[3] / 1e6, 1018.2, 0.002) && bodyN.includes("4,62") && bodyN.includes("1 019"), `gap ${((h.lonksamhet.nettoMarginal-h.lonksamhet.ebitMarginal)*100).toFixed(2)} pp = ${(((h.lonksamhet.nettoMarginal-h.lonksamhet.ebitMarginal)*oms[3])/1e6).toFixed(1)} Mkr (text 4,62 pp / 1 019)`);
r("D26 rakesatser", approx(oms[3] * 0.01 / 1e6, 220.6, 0.005) && approx(oms[3] * 0.03 / 1e6, 661.7, 0.005) && bodyN.includes("221") && bodyN.includes("662") && approx(661.7 / 220.6, 3.0, 0.01), `1 pp = ${(oms[3]*0.01/1e6).toFixed(1)} Mkr; 3 % = ${(oms[3]*0.03/1e6).toFixed(1)} Mkr; kvot 3,0 ✓ (text 221/662/3,0)`);
r("D27 marginalvikt", approx(1 / (3 * h.lonksamhet.ebitMarginal), 4.60, 0.005) && bodyN.includes("4,6"), `1/(3×0,0724) = ${(1/(3*h.lonksamhet.ebitMarginal)).toFixed(2)} (text 4,6)`);
r("D28 multilovning", approx(pe / 1.1085, 16.98, 0.005) && bodyN.includes("17,0"), `${(pe/1.1085).toFixed(2)} (text 17,0)`);

// ── E. Scenariorutan: korrekt matris + transponeringstest ─────────────────
const niv = [oms[3] * 0.97, oms[3], oms[3] * 1.03];
const mrg = [0.0624, 0.0724, 0.0824];
const M = niv.map((o) => mrg.map((m) => Math.round((o * m) / 1e6)));
const T = [[1335, 1376, 1418], [1549, 1597, 1645], [1763, 1817, 1872]];
const transponerad = T.every((rad, i) => rad.every((v, j) => v === M[j][i]));
const rakta = T.every((rad, i) => rad.every((v, j) => v === M[i][j]));
// exakt block ur RÅA bodyn (med U+00A0 i tusentalen) för diff-posten
const NB = "\u00a0";
const tabellStr = `| Intäkter 21${NB}394 | 1${NB}335 | 1${NB}376 | 1${NB}418 |\n| Intäkter 22${NB}056 | 1${NB}549 | 1${NB}597 | 1${NB}645 |\n| Intäkter 22${NB}718 | 1${NB}763 | 1${NB}817 | 1${NB}872 |`;
r("E1 scenariomatris", rakta === false && transponerad === true && body.includes(tabellStr), `KORREKT matris ${JSON.stringify(M)}; utkastets tabell = TRANSPOSITUM (värdena spegelvända kring diagonalen — 6 av 9 celler felplacerade, diagonalen [1 335, 1 597, 1 872] rätt). Läsaren som slår upp (21 394; 7,24 %) får 1 376 — rätt är 1 549`);
r("E2 tabellstrUnik", body.split(tabellStr).length === 2, "gammalt tabellblock förekommer exakt en gång i RÅA bodyn (diff-bar, U+00A0 bevarat)");

// ── F. Kalenderfakta ──────────────────────────────────────────────────────
const kb = Object.fromEntries(kal.bolag.map((b) => [b.ticker, b]));
r("F1 rappdag", kb["HOLM-B.ST"].rapportfenster.includes("2026-10-22") && kb["HOLM-B.ST"].rapportfenster.includes("på morgonen") && bodyN.includes("22 oktober, på morgonen"), `kalender: ${kb["HOLM-B.ST"].rapportfenster}`);
r("F2 q2augusti", kb["HOLM-B.ST"].notera.includes("2026-08-20") && bodyN.includes("20 augusti"), "Q2 2026-08-20 ✓");
r("F3 billerudYaraNewmont", kb["BILL.ST"].rapportfenster.includes("ca kl 07:00") && kb["YAR.OL"].rapportfenster.includes("kl 08:00") && kb["NEM"].rapportfenster.includes("estimat") && bodyN.includes("ca kl 07:00") && bodyN.includes("kl 08:00") && bodyN.includes("estimat"), "Billerud 07:00 / Yara 08:00 / Newmont estimat ✓");
r("F4 tystperioder", kb["SCA-B.ST"].notera.includes("30 kalenderdagar") && kb["YAR.OL"].notera.includes("2026-09-25") && kb["STERV.HE"].notera.includes("21 dagar") && bodyN.includes("30 kalenderdagar") && bodyN.includes("25 september") && bodyN.includes("21 dagar"), "SCA 30 dgr (från ca 09-23, rapport 10-23) / Yara från 09-25 / Stora Enso 21 dgr ✓");
r("F5 bolidenSsabUpm", kb["BOL.ST"].rapportfenster.includes("2026-10-29") && kb["SSAB-B.ST"].rapportfenster.includes("2026-10-28") && kb["UPM.HE"].rapportfenster.includes("2026-10-28") && bodyN.includes("29 oktober") && bodyN.includes("28 oktober"), "Boliden 10-29, SSAB/UPM 10-28 ✓");
// sexdubbel + 14-paket
const kat = {};
for (const f of fs.readdirSync(ROT + "/data/blogg-utkast/kvartal/2026-q3/").filter((x) => x.startsWith("kalender-"))) {
  const kk = las("/data/blogg-utkast/kvartal/2026-q3/" + f);
  for (const b of kk.bolag || []) {
    for (const d of [20, 21, 22, 23]) {
      if (new RegExp(`2026-10-${d}\\b`).test(b.rapportfenster)) (kat[d] ||= []).push(b.ticker);
    }
  }
}
const sex = ["SWED-A.ST", "ESSITY-B.ST", "SAND.ST", "ATCO-A.ST", "CAST.ST", "HOLM-B.ST"];
r("F6 sexdubbla", sex.every((t) => (kat[22] || []).includes(t)), `22/10 i kalendrarna: ${(kat[22]||[]).join(", ")} — samtliga sex ✓ (Swedbank, Essity, Sandvik, Atlas Copco, Castellum, Holmen)`);
const f20 = (kat[20] || []).filter((t) => ["ABB.ST", "TEL2-A.ST"].includes(t));
const f21 = (kat[21] || []).filter((t) => ["SKF-B.ST", "SHB-A.ST", "IBE.MC"].includes(t));
// Volvo Group + Saab saknar kalenderposter — deras 23/10 står i EGNA paket (officiella källor)
const p23 = ["sa-laser-du-volvo-car-q3-2026.json", "sa-laser-du-volvo-group-q3-2026.json", "sa-laser-du-saab-q3-2026.json"]
  .map((f) => las("/data/blogg-utkast/kvartal/2026-q3/" + f).description.includes("23 oktober"));
r("F7 fyradagarsfonstret", f20.length === 2 && f21.length === 3 && p23.every(Boolean) && bodyN.includes("14 läspaket"), `20:e ${f20.join("+")} · 21:a ${f21.join("+")} · 23:e Volvo Car+Volvo Group+Saab ur EGNA paket (23/10 kl 07:00/07:20/07:30) = 2+3+6+3 = 14 ✓ — NOT: Volvo Group/Saab saknas i kalenderfilerna, källan är syslonpaketen`);
r("F8 torsdag", new Date("2026-10-22").getDay() === 4 && bodyN.includes("torsdagen den **22 oktober"), "2026-10-22 är torsdag ✓");

// ── G. sorteringsfakta Billerud/Yara ──────────────────────────────────────
const bil = uni.find((b) => b.ticker === "BILL.ST");
const yar = uni.find((b) => b.ticker === "YAR.OL");
const bilFall = bil.serier.resultat.map((v) => v / 1e6);
r("G1 billerud", bil.vardering.pe == null && approx(bil.lonksamhet.roe, -0.0015, 0.0006) && approx(bil.lonksamhet.roic, -0.0072, 0.0006) && bodyN.includes("minus 0,15") && bodyN.includes("4 590 till 711"), `pe ${bil.vardering.pe} (null ✓), roe ${bil.lonksamhet.roe}, roic ${bil.lonksamhet.roic}, resultatserie Mkr ${JSON.stringify(bilFall)} — 4 590→711 = första och sista året ✓`);
r("G2 yara", approx(yar.tillvaxt.prognosTillvaxt, -0.209, 0.001) && yar.valuta === "NOK" && bodyN.includes("minus 20,9"), `prognos ${yar.tillvaxt.prognosTillvaxt}, valuta ${yar.valuta}`);
const yGap = Math.abs((yar.vardering.pb / yar.lonksamhet.roe - yar.vardering.pe) / yar.vardering.pe);
r("G3 yaraIdentitetsgap", yGap > 0.07 && yGap < 0.13 && bodyN.includes("kring tio procent"), `Yara P/B÷ROE ${(yar.vardering.pb/yar.lonksamhet.roe).toFixed(2)} mot pe ${yar.vardering.pe} = ${(yGap*100).toFixed(1)} % gap ✓`);

// ── H. vågvalidering + analysbibliotek ────────────────────────────────────
const vv = fs.readFileSync(ROT + "/data/rapporter/vagvalidering-SENASTE.json", "utf8");
r("H1 utanforVagvalidering", !vv.includes("HOLM"), "HOLM 0 träffar i vagvalidering-SENASTE.json ✓ (utkastets utanför-notis)");
const ana = fs.readdirSync(ROT + "/data/analyses").filter((f) => f.toUpperCase().includes("HOLM"));
r("H2 ingenAnalysfil", ana.length === 0 && bodyN.includes("saknar analysfil"), `data/analyses HOLM-träffar: ${ana.length} ✓`);

// ── I. Juridik (2007:528) ────────────────────────────────────────────────
const p911 = ["911", "11 september", "september 2001", "9/11", "terror", "Terrordåd"];
const t911 = p911.filter((p) => hela.includes(p));
r("I1 911", t911.length === 0, t911.length === 0 ? "0 träffar på 6 mönster" : `TRÄFFAR: ${t911.join(", ")}`);
const radVerb = ["köp ", "köp.", "sälj", "rekommendera", "bör du", "målkurs", "målpris", "undvik", "garanterad avkastning", "aktietips"];
const textyta = `${u.title}\n${u.description}\n${body}`.toLowerCase();
const vTraff = radVerb.filter((p) => textyta.includes(p));
const kontexter = [...body.matchAll(/.{50}(köp|sälj)[a-zåäö-]*/gi)].map((m) => m[0].slice(-75));
r("I2 radverb", vTraff.every((p) => ["köp ", "sälj"].includes(p)), `${vTraff.length === 0 ? "0 träffar" : "träffar enbart i neutrala/nekande kontexter (manuellt verifierade): " + JSON.stringify(kontexter)}`);
const lagrum = hela.match(/20\d{2}:\d+|2005:59|LEK 2022/g) || [];
r("I3 lagrum", lagrum.length === 1 && lagrum[0] === "2007:528", `lagrum i filen: ${JSON.stringify(lagrum)} — endast 2007:528 ✓ (ingen lagrumsblandning)`);
const sistaRad = body.trim().split("\n").pop();
r("I4 disclaimerSist", /investeringsråd/i.test(sistaRad) && sistaRad.includes("2007:528") && sistaRad.includes("2 kap 5 §") && sistaRad.includes("kundens beslut"), "disclaimern sista rad med exakt 2007:528 2 kap 5 § + R2-notis ✓");
const kops = [...body.matchAll(/köp/gi)].length;
r("I5 kopsSammanhang", kops === 5, `"köp"-förekomster: ${kops} — alla fem verifierade neutrala/nekande: (1) "inte en rekommendation att köpa" (2) "skogsköp äter skillnaden" (3) "Inga köp-, sälj- eller hållningsrekommendationer" + återköps-/insiderköps-fältnamn`);

// ── K. Struktur + kontrakt ───────────────────────────────────────────────
const ord = `${u.title} ${u.description} ${body}`.trim().split(/\s+/).filter(Boolean).length;
const rm = Math.max(1, Math.round(ord / 600));
r("K1 readingMinutes", rm === u.readingMinutes, `ord ${ord} → kontrakt ${rm}, filens ${u.readingMinutes} ${rm === u.readingMinutes ? "✓" : "— AVVIKELSE"}`);
r("K2 titleLangd", u.title.length <= 160, `${u.title.length} tkn — FYND C: ericsson-precedensens mobilklipp-tak ~60; seriepraxis 77–245, 242 = överkanten`);
r("K3 descLangd", u.description.length <= 160, `${u.description.length} tkn — FYND C: SEO-fönster ~155–160; industrivärden-C4 242→187; 576 = seriens längsta hittills`);
r("K4 mjukaBindestreck", !/\u00AD/.test(hela), "0 mjuka bindestreck");
const utkastLnkar = [...body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]).filter((p) => p.includes("utkast"));
r("K5 utkastlankar", utkastLnkar.length === 0, `${utkastLnkar.length} interna markdown-länkar till utkast`);
const rubriker = [...body.matchAll(/^## .+$/gm)].map((m) => m[0]);
r("K6 rubriker", rubriker.length === 7, `${rubriker.length} H2-rubriker: ${rubriker.map(x => x.replace("## ", "")).join(" | ")}`);

// ── L. Länkar mot levande sajten + extern ────────────────────────────────
const interna = [...new Set([...body.matchAll(/\]\((\/[^)#\s]+)\)/g)].map((m) => m[1]))];
const lnkRes = [];
for (const path of interna) {
  try {
    const resp = await fetch("http://localhost:3000" + path, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    lnkRes.push({ path, status: resp.status });
  } catch (e) {
    lnkRes.push({ path, status: "FEL " + e.message });
  }
}
const dahoga = lnkRes.filter((x) => x.status !== 200);
r("L1 interna", dahoga.length === 0, `${lnkRes.length - dahoga.length}/${lnkRes.length} HTTP 200 mot localhost${dahoga.length ? " — FEL: " + dahoga.map(x => x.path + " " + x.status).join(", ") : ""}`);
let ext = "ejour";
try {
  const re = await fetch("https://www.holmen.com/en/Newsroom/press/calendar/Interim-report-January-September-2026/", { redirect: "follow", signal: AbortSignal.timeout(10000), headers: { "user-agent": "Mozilla/5.0 (compatible; AK1A-granskning/1.0)" } });
  ext = re.status;
} catch (e) { ext = "FEL " + e.message; }
r("L2 extern", true, `holmen.com-kalender i granskarkanalen: HTTP ${ext} (NIKE-precedensen: IR-sidor kan neka botar — kontrolleras mot browser-kanalen vid publicering)`);

// ── M. publishedAt-seriepraxis ───────────────────────────────────────────
const paket = fs.readdirSync(ROT + "/data/blogg-utkast/kvartal/2026-q3/").filter((f) => f.startsWith("sa-laser-du-"));
const pAt = paket.map((f) => [f.replace("sa-laser-du-", "").replace("-q3-2026.json", ""), las("/data/blogg-utkast/kvartal/2026-q3/" + f).publishedAt]);
r("M1 publishedAt", true, `serien: ${pAt.map(x => x[0] + "=" + x[1]).join(", ")} — Holmen ${u.publishedAt} = dagen före rappdagen 10-22, konsistent med nike (09-30/10-01) och hm-b (09-23/09-24); publiceringsdatum förblir kundens beslut (R2)`);

// ── N. Diff-strängars unikhet (kandidatposter, RÅA bodyn med U+00A0) ────
const kandidater = [
  ["A1-tabell", tabellStr],
  ["B2-handssignal", "handssignal"],
  ["B3-tredjedel", "En tredjedel av branschmedianen"],
  ["B4-eps1", "326,60 delat med 18,8 är"],
  ["B5-eps2", "326,60 ÷ 18,8 = 17,35"],
  ["C3-procentEV", "ungefär två procent av EV"],
];
for (const [namn, s] of kandidater) {
  const n = hela.includes(s) ? hela.split(s).length - 1 : 0;
  r(`N ${namn}`, n === 1, `förekomster i filen: ${n}`);
}

// ── sammanfattning ───────────────────────────────────────────────────────
console.log(`\n===== ${ok} OK / ${fel} FEL av ${ok + fel} =====`);
fs.writeFileSync("/tmp/s1u3-holmen-verify.json", JSON.stringify(R, null, 1));
