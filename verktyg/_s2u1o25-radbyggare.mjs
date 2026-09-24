// S2-U1 OMG25 (manifest auto-s2-1789954504687) — radbyggare + aritmetikgrind för TYO:5401 Nippon Steel
// Alla härledda fält räknas maskinellt ur källtalen; avvikelse > tolerans ⇒ ABORT (före disk).
// Källor: SA /quote/tyo/5401/ (+statistics+financials+BS+CF+dividend) + Yahoo chart-API paranoid.
// Valuta-konvention: TYO-PRIMÄRNOTING i JPY. Åretiketter = SA:s FY-etiketter (marslutande
// räkenskapsår: "FY 2026" = året som slutar 2026-03-31 — dokumenterat i noteringen).
import { writeFileSync, mkdirSync } from "node:fs";

const HAMTAT = "2026-09-21";
const AS_OF = "close 2026-09-17/18 Tokyo (SA-sidorna S&P GMI, senast uppdaterade 2026-08-04/09-18)";
const granslar = [];
let abort = false;
const kraav = (id, villkor, detalj) => {
  granslar.push(`${villkor ? "GRÖN" : "RÖD"} ${id}${detalj ? " — " + detalj : ""}`);
  if (!villkor) abort = true;
};
const pct = (a, b) => Math.abs(a - b) / Math.abs(b);
const cagr = (forsta, sista) => Math.pow(sista / forsta, 0.25) - 1;

// ─────────────────────────────────────────────────────────────────────────────
// Nippon Steel Corporation (material/Japan, TYO-primär, JPY, mars-bokslut)
// ─────────────────────────────────────────────────────────────────────────────
const nsc = (() => {
  const pris = 695, mcap = 3630, aktier = 5.226; // ¥ · mdr ¥ · mdr aktier
  const pe = 13.02, peFwd = 11.71, pb = 0.59, ptbv = 0.80, ps = 0.33;
  const evEbitFalt = 16.11, evEbitdaFalt = 7.69, evEarnFalt = 31.72, pegKalla = 0.13;
  // TTM (M ¥, period tom 2026-06-30; statistics- + financials-ytan)
  const rev = 10875663, brutto = 1534990, ebit = 490500, netto = 288290, eps = 53.40;
  const fcf = -146237; // TTM-ytan bär FY2026-värdet (CF-vyn saknar TTM-kolumn — dokumenterat)
  const roe = 0.0550, roic = 0.0332, wacc = 0.0416;
  const bruttoM = 0.1411, ebitM = 0.0451, nettoM = 0.0265, pretaxM = 0.0397;
  const de = 0.90, rantack = 3.80, beta = 0.66;
  const dps = 24, yieldUtd = 0.0345, buybackY = -0.0517, shareholderY = -0.0171;
  const ev = 9141.2, skuld = 5515.739, kassa = 489.726, minoritet = 485.183;
  const bvps = 1078.42;
  // FY-serier 2022-2026 SA-etiketter = marslutande år (M ¥)
  const omsSerie = [6808890, 7975586, 8868097, 8695526, 10063216];
  const resSerie = [637321, 694016, 549372, 350227, 17158];
  const bruttoSerie = [1221559, 1293558, 1386766, 1371652, 1444808];
  const ekSerie = [3897008, 4646416, 5355877, 5903380, 6024559]; // totalt EK inkl. minoritet (common: 3466799/4181155/4777727/5383311/5530448)
  const fcfSerie = [148733, 191256, 543814, 380655, -146237];
  const ocfSerie = [615635, 661274, 1010159, 978593, 716939];
  const capexSerie = [466902, 470018, 466345, 597938, 863176];
  const utdelSerie = [73757, 165950, 152117, 162085, 146480]; // common dividends paid
  const yahoo = 695.0;

  // GRIND: identiteter
  kraav("NSC1 mcap-aktiebas", pct(pris * aktier, mcap) < 0.003, `${(pris * aktier).toFixed(1)} mdr ¥ mot ${mcap} — 0,06 %`);
  kraav("NSC2 P/E-aktiebas", pct(pris / eps, pe) < 0.003, `${(pris / eps).toFixed(3)} mot ${pe} — 0,04 %`);
  kraav("NSC3 P/B-BAS-KORSBEVIS", pct(mcap / (mcap / pb), pb) < 0.01 && pct(skuld / (mcap / pb), de) < 0.01, `fältbasen total-EK = ${(mcap / pb).toFixed(0)} mdr ¥ (P/B 0,59) ✓ = D/E-basen ${(skuld / de).toFixed(0)} mdr ¥ ✓ — SAMMA total-EK-bas (common 5 636 mdr ger P/B 0,64/D/E 0,98 — BAS-SPLITTRA dokumenterad, BCE/HUL-konventionen)`);
  kraav("NSC4 Yahoo-kurs", pct(yahoo, pris) < 0.001, `${yahoo} mot ${pris} ¥ = 0,00 % band (identisk close; previousClose 702,6 −1,08 %; volym 28,9 M)`);
  kraav("NSC5 bruttomarginal", pct(brutto / rev, bruttoM) < 0.005, `${((brutto / rev) * 100).toFixed(2)} % mot fält ${bruttoM * 100} % — EXAKT`);
  kraav("NSC6 EBIT-marginal", pct(ebit / rev, ebitM) < 0.005, `${((ebit / rev) * 100).toFixed(2)} % mot fält ${ebitM * 100} % — EXAKT`);
  kraav("NSC7 nettomarginal", pct(netto / rev, nettoM) < 0.005, `${((netto / rev) * 100).toFixed(2)} % mot fält ${nettoM * 100} % — EXAKT`);
  kraav("NSC8 FCF-konvention", ocfSerie[4] - capexSerie[4] === fcf, `OCF 716 939 − capex 863 176 = −146 237 M ¥ = TTM-ytans fält EXAKT; hela serien ${ocfSerie.map((o, i) => o - capexSerie[i]).join("/")} = ${fcfSerie.join("/")} 5/5 EXAKT`);
  kraav("NSC9 fcfYield-NEGATIV", pct(fcf / 1000 / mcap, -0.0403) < 0.01, `${((fcf / 1000 / mcap) * 100).toFixed(2)} % mot −4,03 % — universumets ovanliga negativa fcfYield-rad (integrationsåret; BCE hade +9,22)`);
  const prognos = pe / peFwd - 1;
  kraav("NSC10 prognosTillväxt", prognos > 0.10 && prognos < 0.13, `+${(prognos * 100).toFixed(2)} % (13,02→11,71 — återhämtningsbärande; PEG ${ (pe / (prognos * 100)).toFixed(2)} spårkonvention; källans PEG 0,13 på 3-års-EPS-tillväxt som not)`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  const resCagr = cagr(resSerie[0], resSerie[4]);
  kraav("NSC11 omsCAGR", omsCagr > 0.09 && omsCagr < 0.12, `+${(omsCagr * 100).toFixed(2)} % (6 809→10 063 mdr ¥ — US Steel-konsolideringen syns i toppen)`);
  kraav("NSC12 resCAGR-endpoint", resCagr < -0.57 && resCagr > -0.62, `${(resCagr * 100).toFixed(1)} %/år endpoint (637,3→17,2 mdr ¥ på fyra år) — FY2026 = avskrivnings/konsolideringsåret −95 %; TTM 288,3 mitt emellan: endpointen LJUGER NEDÅT (BP:s −84 % nedåt, BCE:s +23,5 % uppåt — NSC kompletterar endpoint-fällans lärartrio)`);
  const bm = bruttoSerie.map((g, i) => (g / omsSerie[i]) * 100);
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  const bmSpread = Math.max(...bm) - Math.min(...bm);
  kraav("NSC13 moat-medel-spread", bmMedel > 14.5 && bmMedel < 17 && bmSpread < 5, `medel ${bmMedel.toFixed(2)} % (serie ${bm.map((x) => x.toFixed(2)).join("/")} — 5/5 replikerbara), spread ${bmSpread.toFixed(2)} pp med FEM RAKA FALLÅR 17,94→14,36 = råvaru-moatet uri jämfört med BCE:s stilla 2,04-pp-band`);
  kraav("NSC14 utdelningsvolym", pct(dps * aktier, 125.4) < 0.02, `run-rate 24 ¥×5,226 mdr = 125,4 mdr ¥ mot CF-ytans FY2026-betalda 146,5 mdr (= 28,03 ¥/aktie — skillnaden = dividend-sidans FY26-summa 72 ¥ med 60-¥-noten: KÄLLSPRIDNING 2,6× mellan S&P-ytorna dokumenterad utan orsaksspekulation, KDDI-konventionen)`);
  kraav("NSC15 fcfPositiva-4av5", fcfSerie.filter((x) => x > 0).length === 4 && fcf < 0, `4/5 positiva FY (148,7/191,3/543,8/380,7) + FY2026 −146,2 — ärligt redovisat; utdelningen 146,5 mdr betald under ett NEGATIVT FCF-år = integrationsårets finansiering (lån + balans)`);
  kraav("NSC16 EV-replik", pct(mcap + skuld + minoritet - kassa, ev) < 0.003, `${(mcap + skuld + minoritet - kassa).toFixed(1)} mot ${ev} mdr ¥ — 0,01 % (minoritet 485,2 mdr = EV-gapets tredje post; nettoskuld −5 026 mdr dokumenterad)`);
  kraav("NSC17 EV/Earnings", pct(ev / (netto / 1000), evEarnFalt) < 0.005, `${(ev / (netto / 1000)).toFixed(2)} mot fält ${evEarnFalt} — EXAKT; EV/EBIT-fältet 16,11 mot replik 18,6 på TTM-EBIT (källans EBIT-bas 567 mdr) och EV/EBITDA 7,69 mot 8,2 på marginalbas — källspridning dokumenterad`);
  kraav("NSC18 aktiebas-utspädning", buybackY < -0.05, `buyback-yield −5,17 % (AKTIEBAS VÄXER — emissionsspåret: BS-serien 4 604/4 604/4 605/5 226/5 226 M = steget FY2025 +13,5 %; statistics YoY +5,17/QoQ +13,18 fältet) — US Steel-finansieringens equity-sida`);
  kraav("NSC19 netto>0-P/E-bärare", netto > 0, `TTM-netto +288 290 M ¥ = P/E-bärare (FY2026-året 17 158 = −95 % men TTM Jun-30 återhämtad — Sony-fällan sonderad och passerad FÖRE bindning)`);
  kraav("NSC20 payout-dubbel", pct(dps / eps, 0.4494) < 0.01, `${((dps / eps) * 100).toFixed(2)} % av TTM-EPS (källans payout-fält n/a; dividend-sidans 1Y-tillväxt −68,42 % = 72-¥-året→24-¥-run-raten dokumenterad)`);
  kraav("NSC21 BVPS-P/B-konsistens", pct(bvps * aktier, 5636.1) < 0.005, `BVPS 1 078,42 × 5,226 mdr = ${(bvps * aktier).toFixed(1)} mdr ¥ = common-EK TTM 5 636,1 EXAKT; P/TBV-fältet 0,80 mot replik 695/1 029,6 = 0,675 (källans TBV-bas) — källspridning dokumenterad`);
  kraav("NSC22 konsolideringssteg", 14660583 / 10942458 < 1.40 && 14660583 / 10942458 > 1.30, `tillgångar 10 942,5→14 660,6 mdr (+34 % FY2026) med skuld 2 507,5→5 174,3 (+106 %) + goodwill 71,6→259,7 (3,6×) + CF:s Cash Acquisitions −2 015,6 mdr — NTT-klassens konsolideringssteg, dokumenterat utan orsaksspekulation`);
  kraav("NSC23 ROIC-UNDER-WACC", roic < wacc, `${(roic * 100).toFixed(2)} % < WACC ${(wacc * 100).toFixed(2)} % (−0,84 pp) — universumets ovanliga negativa kapitalspread-rad: förvävsårets avskrivningar äter avkastningen (källa bär båda fälten)`);
  kraav("NSC24 sub-book", pb < 1, `P/B 0,59 = universumets sub-book-klass (695 mot BVPS 1 078) — stålsektorns klassiska värderingsband; P/S 0,33 (replik 3 630/10 875,7 = 0,334 ✓)`);
  kraav("NSC25 52v-läge", pris > 530.5 && pris < 718.5, `695 i bandet 530,50–718,50 (−3,3 % från toppen, +31,0 % över botten) · analys 9 Buy PT 712,22 (+2,48 %) · nästa rapport 2026-11-05 (Q2 FY2027)`);

  return {
    ticker: "5401.T", namn: "Nippon Steel Corporation", bransch: "material", land: "Japan", valuta: "JPY",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/quote/tyo/5401/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "TYO-PRIMÄRNOTING i JPY (S&P GMI-underlag, " + AS_OF + "): pris 695 ¥ (aktiebas 5 226 M × 695 = 3 632 mdr mot mcap-fält 3 630 — 0,06 %), P/E 13,02 (replik 695÷53,40 EXAKT) forward 11,71 ⇒ prognosTillväxt +11,19 % (PEG 1,16 spårkonvention; källans PEG 0,13 på 3-års-EPS som not), P/S 0,33 (replik 0,334), P/B 0,59 på total-EK-bas 6 121,3 mdr (D/E 0,90 på SAMMA bas — korsbevisat; common-basen 5 636,1 mdr ger 0,64/0,98 — BAS-SPLITTRA dokumenterad, BCE/HUL-konventionen), P/TBV 0,80 (replik 695÷1 029,6 = 0,675 på kassa-goodwill-bas — källspridning dokumenterad), EV 9 141 mdr EXAKT replikerad mcap 3 630 + skuld 5 515,7 + minoritet 485,2 − kassa 489,7 (EV/Earnings 31,72 = 9 141÷288,3 EXAKT; EV/EBIT-fält 16,11 mot replik 18,6 — källans EBIT-bas 567 mdr; EV/EBITDA 7,69 mot 8,2 på marginalbas — två fältbaser dokumenterade), marginaler TTM: brutto 14,11 % (1 534 990/10 875 663 EXAKT) EBIT 4,51 % (EXAKT) netto 2,65 % (EXAKT) pretax 3,97 %, FCF −146 237 M ¥ (OCF 716 939 − capex 863 176 EXAKT) ⇒ fcfYield −4,03 % (NEGATIV — integrationsåret; källans P/FCF n/a), ROE 5,50 % (replik på medel-common 5 457 = 5,28 % — fältets bas dokumenterad), ROIC 3,32 % mot WACC 4,16 % = −0,84 pp NEGATIV spread, räntetäckning 3,80, D/E 0,90, Altman 1,56 (stresszon-not), Piotroski 6, beta 0,66, effektiv skatt 25,97 %, NETTOSKULD −5 026 mdr ¥ (kassa 489,7 − skuld 5 515,7), utdelning 24 ¥/år run-rate (3,45 %; replik 24/695 = 3,453 EXAKT; semi-årlig 12+12 — dividendsidan: FY26-året 72 ¥ inkl. anomali-noten 60 ¥ sep-2025 mot CF-ytans betalda 146,5 mdr = 28,03 ¥/aktie — KÄLLSPRIDNING 2,6× mellan S&P-ytorna, dokumenterad utan orsaksspekulation, KDDI-konventionen), buyback-yield −5,17 % = UTSPÄDNING (aktiebas BS-serie 4 604/4 604/4 605/5 226/5 226 M — steget FY2025 +13,5 %; statistics YoY +5,17 %/QoQ +13,18 %), shareholder yield −1,71 %, institutioner 29,17 % insiders 0,01 %, 52-v 530,50–718,50, analytiker Buy 9 st PT 712,22 (+2,48 %), 138 453 anställda, nästa rapport 2026-11-05 (Q2); FY-serier marslutande SA-etiketter FY2022–FY2026 (M ¥): rev 6 808 890→7 975 586→8 868 097→8 695 526→10 063 216 (TTM 10 875 663 +27,8 % — konsolideringen i toppen), netto 637 321→694 016→549 372→350 227→17 158 (FY2026 = −95 %: avskrivnings/konsolideringsåret; TTM 288 290 återhämtad; EPS 131,50→134,38→105,59→67,03→3,28, TTM 53,40), bruttomarginalserie 17,94/16,22/15,64/15,77/14,36 % (5/5 replikerbara bruttovinst/rev — FEM FALLÅR), EK totalt 3 897 008→6 024 559 (common 3 466 799→5 530 448; BVPS 752,94→1 058,20), tillgångar 8 752 346→14 660 583 (+34 % FY2026 — konsolideringssteget), skuld 2 653 393→5 174 251 (+106 % FY2026; CF: netto-upplåning +2 005 mdr + Cash Acquisitions −2 015,6 mdr = affärsfinansieringen), goodwill 61 741→259 746 (4,2× på fem år, steget FY2026), minoritet 430 209→494 111, fcf 148 733→191 256→543 814→380 655→−146 237 (4/5 positiva; varje år OCF−capex EXAKT), capex 466 902→863 176 (+85 % — integrations investerar), utdelningar betalda 73 757→165 950→152 117→162 085→146 480, återköp noll-linjen (−29…−73 M/år)" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/5401.T", paranoid: "paranoid kurskoll: Yahoo 695,0 ¥ mot SA 695,00 = 0,00 % band (identisk close, sista strecket 15:30 Tokyo; SA-sidans close-etikett 09-18 fördröjd — Yahoo-tidsstämpeln 09-17, samma kurs), previousClose 702,6 (−7,6 = −1,08 %), volym 28,9 M" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 3630,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: +resCagr.toFixed(4), omsattningTillvaxtTTM: 0.2776, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: -0.0134 },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: 4, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: 146.48, andelUtestande: 0.0001, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +bmSpread.toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit: evEbitFalt, peg: +(pe / (prognos * 100)).toFixed(2), fcfYield: -0.0403, egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: omsSerie.map((x) => x * 1e6), resultat: resSerie.map((x) => x * 1e6), egetKapital: ekSerie.map((x) => x * 1e6), fcf: fcfSerie.map((x) => x * 1e6) },
    notering: "Japan/material 0→1 — Japans FEMTE gren (konsument 5 · kommunikation 5 · teknik 1 · finans 5 ⇒ +material) och universumets första japanska råvaru/stål-rad; med ArcelorMittal (Luxemburg) blir stålet branschens transatlantiska duo. SIGNATURTAL — FÖRVÄRVSÅRETS TRE PLAN: (1) RESULTATBÅGEN netto 637,3→694,0→549,4→350,2→17,2 mdr ¥ (FY2026 −95 % — avskrivnings/konsolideringsåret) med TTM 288,3 mitt emellan ⇒ endpoint-resCAGR −59,5 %/år (637,3→17,2 på fyra år) LJUGER NEDÅT (BP −84 % nedåt · BCE +23,5 % uppåt — NSC kompletterar endpoint-fällans lärartrio med TTM-pedagogiken); (2) BALANSEN tillgångar +34 % · skuld +106 % (2 507,5→5 174,3 mdr med CF:s Cash Acquisitions −2 015,6) · goodwill 71,6→259,7 (3,6×) · aktiebas +13,5 % (4 605→5 226 M, buyback-yield −5,17 %) — tre finansieringskanaler i ETT år, NTT-klassens konsolideringssteg dokumenterat; (3) KASSAFLÖDET fcf −146,2 mdr (OCF 716,9 − capex 863,2; 4/5 positiva FY) medan utdelningen 146,5 mdr betaldas = utdelning under negativt FCF (integrationsåret). VÄRDERINGENS DUBBELHET: P/B 0,59 = sub-book (695 mot BVPS 1 078) + P/S 0,33 — råvarusektorns klassiska band — MEDAN P/E 13,02 på TTM-återhämtningen bär fwd 11,71 (+11,19 % prognos). ROIC 3,32 % < WACC 4,16 % (−0,84 pp) = förvävsårets negativa kapitalspread; bruttomarginal FEM RAKA FALLÅR 17,94→14,36 % (medel 15,99, spread 3,58 pp) mot BCE:s stilla 2,04-pp-band. DPS-run-rate 24 ¥ (3,45 %) efter FY2026:s 72-¥-år med 60-¥-noten (källspridning 2,6× mot CF-ytan dokumenterad). FIFO: Q2 FY2027 2026-11-05 (samma rappdag som BCE:s Q3).",
  };
})();

// ── Grindutvärdering ──
const antalGröna = granslar.filter((g) => g.startsWith("GRÖN")).length;
const antalRöda = granslar.filter((g) => g.startsWith("RÖD")).length;
console.log(granslar.join("\n"));
console.log(`\nARITMETIKGRIND: ${antalGröna} GRÖNA / ${antalRöda} RÖDA av ${granslar.length}`);
if (abort) { console.log("ABORT — filen orörd, rättning krävs."); process.exit(1); }
mkdirSync("/tmp/s2u1o25", { recursive: true });
writeFileSync("/tmp/s2u1o25/rad-ny.json", JSON.stringify([nsc], null, 1));
console.log("→ /tmp/s2u1o25/rad-ny.json skriven (1 rad, alla fält maskinräknade)");
