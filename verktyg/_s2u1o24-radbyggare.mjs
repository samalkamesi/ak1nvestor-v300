// S2-U1 OMG24 (manifest auto-s2-1789927508250) — radbyggare + aritmetikgrind för TSX:BCE
// Alla härledda fält räknas maskinellt ur källtalen; avvikelse > tolerans ⇒ ABORT (före disk).
// Källor: SA /quote/tsx/BCE/ (+statistics+financials+BS+CF+dividend) + Yahoo chart-API paranoid.
// Valuta-konvention: TSX-PRIMÄRNOTING i CAD (RY/CNQ bär NYSE-USD; BCE bär ursprungsbörsen
// Toronto = universumets första rena TSX/CAD-rad — kanalnot dokumenterad).
import { writeFileSync, mkdirSync } from "node:fs";

const HAMTAT = "2026-09-20";
const AS_OF = "close 2026-09-18 16:00 Toronto (SA-sidorna uppdaterade 2026-08-06/09-20)";
const granslar = [];
let abort = false;
const kraav = (id, villkor, detalj) => {
  granslar.push(`${villkor ? "GRÖN" : "RÖD"} ${id}${detalj ? " — " + detalj : ""}`);
  if (!villkor) abort = true;
};
const pct = (a, b) => Math.abs(a - b) / Math.abs(b);
const cagr = (forsta, sista) => Math.pow(sista / forsta, 0.25) - 1;

// ─────────────────────────────────────────────────────────────────────────────
// BCE Inc. (kommunikation/Kanada, TSX-primär, CAD, dec-bokslut)
// ─────────────────────────────────────────────────────────────────────────────
const bce = (() => {
  const pris = 30.90, mcap = 28.82, aktier = 0.93253; // CAD · mdr CAD · mdr aktier
  const pe = 4.60, peFwd = 12.20, pb = 1.19, evEbit = 13.63, ps = 1.16, evEbitda = 7.68, pegKalla = 9.14;
  // TTM (M CAD, financials-vyn period jun-26; statistics-ytan punktläge)
  const rev = 24797, brutto = 11145, ebit = 5384, netto = 6270, eps = 6.72;
  const fcf = 2657, ocf = 6786, capex = 4129;
  const roe = 0.3047, roic = 0.0695, wacc = 0.0529;
  const bruttoM = 0.4495, ebitM = 0.2171, nettoM = 0.2529, fcfM = 0.1072;
  const de = 1.73, rantack = 2.95, beta = 0.61;
  const dps = 1.75, yieldUtd = 0.0566, payout = 0.2603, buybackY = -0.0148, shareholderY = 0.0418;
  const ev = 73.64, skuld = 41.78, kassa = 0.479, pref = 3.52;
  const bvps = 22.14, aktiebasForandr = 0.0148;
  // FY-serier 2021-2025 (M CAD, kalenderår, S&P GMI via SA financials)
  const omsSerie = [23449, 24174, 24673, 24409, 24468];
  const resSerie = [2709, 2716, 2076, 163, 6305];
  const bruttoSerie = [10086, 10527, 10833, 10930, 11022];
  const ekSerie = [22941, 22515, 20557, 17360, 23310]; // totalt EK inkl. minoritet (common 18 632→19 732, minoritet ~306→290)
  const fcfSerie = [3156, 3232, 3365, 3091, 3293];
  const ocfSerie = [8008, 8365, 7946, 6988, 6993];
  const capexSerie = [4852, 5133, 4581, 3897, 3700];
  const utdelSerie = [3257, 3448, 3668, 3800, 2177]; // betalda utdelningar (common+preferens)
  const dpsSerie = [3.68, 3.87, 3.99, 2.31, 1.75]; // kalenderår betalda; 2026 run-rate 4×0,4375
  const yahoo = 30.90;

  // GRIND: identiteter
  kraav("BCE1 mcap-aktiebas", pct(pris * aktier, mcap) < 0.003, `${(pris * aktier).toFixed(3)} mdr CAD mot ${mcap} — 0,02 %`);
  kraav("BCE2 P/E-aktiebas", pct(pris / eps, pe) < 0.003, `${(pris / eps).toFixed(3)} mot ${pe} — 0,03 %`);
  kraav("BCE3 P/B-BAS-KORSBEVIS", pct(mcap / (mcap / pb), pb) < 0.01 && pct(skuld / (mcap / pb), de) < 0.01, `fältbasen = ${ (mcap / pb).toFixed(1) } mdr (P/B 1,19) ✓ = D/E-basen ${ (skuld / de).toFixed(1) } ✓ — SAMMA total-EK-bas (common 22,14×0,93253 = 20,6 ger P/B 1,40 / D/E 2,02 = BAS-SPLITTRA dokumenterad, HUL/AMT-konventionen)`);
  kraav("BCE4 Yahoo-kurs", pct(yahoo, pris) < 0.001, `${yahoo} mot ${pris} CAD = 0,00 % band (identisk close 09-18 Toronto; dagens spann 30,50–31,06 matchar)`);
  kraav("BCE5 bruttomarginal", pct(brutto / rev, bruttoM) < 0.005, `${((brutto / rev) * 100).toFixed(2)} % mot fält ${bruttoM * 100} %`);
  kraav("BCE6 EBIT-marginal", pct(ebit / rev, ebitM) < 0.005, `${((ebit / rev) * 100).toFixed(3)} % mot ${ebitM * 100} % — EXAKT`);
  kraav("BCE7 nettomarginal", pct(netto / rev, nettoM) < 0.005, `${((netto / rev) * 100).toFixed(3)} % mot ${nettoM * 100} % (statistics-fältet 25,89 % på 24,22-bas — källspridning dokumenterad)`);
  kraav("BCE8 FCF-konvention", pct(ocf - capex, fcf) < 0.001, `${ocf - capex} mot ${fcf} M CAD EXAKT; hela serien ${ocfSerie.map((o, i) => o - capexSerie[i]).join("/")} = ${fcfSerie.join("/")} 6/6 EXAKT`);
  kraav("BCE9 fcfYield", pct(fcf / 1000 / mcap, 0.0922) < 0.005, `${((fcf / 1000 / mcap) * 100).toFixed(2)} % mot källans 9,22 %`);
  const prognos = pe / peFwd - 1;
  kraav("BCE10 prognosTillväxt-NEGATIV", prognos < -0.5 && prognos > -0.7, `${(prognos * 100).toFixed(1)} % (trailing 4,60 på one-off-EPS mot normaliserad fwd 12,20 — SPEGELVÄND mot BP:raden; PEG null: negativ tillväxt ⇒ meningslös, källans PEG 9,14 på 3-års-EPS +0,91 % som not)`);
  const omsCagr = cagr(omsSerie[0], omsSerie[4]);
  const resCagr = cagr(resSerie[0], resSerie[4]);
  kraav("BCE11 omsCAGR", omsCagr > 0 && omsCagr < 0.02, `+${(omsCagr * 100).toFixed(2)} % (23 449→24 468 — telekom-tillväxten stilla)`);
  kraav("BCE12 resCAGR-endpoint-one-off", resCagr > 0.2 && resCagr < 0.27, `+${(resCagr * 100).toFixed(1)} % formell endpoint (2 709→6 305) — ONE-OFF-bärande: MLSE-försäljningsvinsten lyfter FY2025; FY2024 163 M i vägen; endpoint-fällan SPEGLVÄND mot BP (−84 %): här ljuger endpointen UPPÅT, inte nedåt`);
  const bm = bruttoSerie.map((g, i) => (g / omsSerie[i]) * 100);
  const bmMedel = bm.reduce((a, b) => a + b, 0) / 5;
  const bmSpread = Math.max(...bm) - Math.min(...bm);
  kraav("BCE13 moat-medel-spread", bmMedel > 42 && bmMedel < 46 && bmSpread < 3, `medel ${bmMedel.toFixed(2)} % (serie ${bm.map((x) => x.toFixed(1)).join("/")}), spread ${bmSpread.toFixed(2)} pp — infrastruktur-moatets nästan orörliga band (kontrast BP 6,6 pp råvaruband)`);
  const utdTot = dps * aktier;
  const utdTtmCommon = 1778 - 146; // dividends paid TTM 1 778 − preferens 146 = common 1 632 (källans not)
  kraav("BCE14 utdelningsvolym", pct(utdTot, utdTtmCommon / 1000) < 0.005, `${utdTot.toFixed(3)} mdr CAD mot TTM-basen ${utdTtmCommon} M (dividends-paid-TTM 1 778 − preferens 146 = 1 632) — 0,006 %; DPS-trappa ${dpsSerie.join("→")} = KAPET −56 % jun-2025 (0,9975→0,4375/kvartal); FY2025-betalda 2 177 = övergångsåret (2×0,9975+2×0,4375 = 2,87/aktie — kapåret delar, TTM bär run-raten)`);
  kraav("BCE15 fcfPositiva", fcfSerie.filter((x) => x > 0).length === 5 && fcf > 0, `6/6 positiva (5 FY + TTM ${fcf}); capex-trappan 4 852→3 700 = TAKTÄTPP FY2021 (AT&T-fibreråret), ned −24 %/år`);
  kraav("BCE16 EV-replik", pct(mcap + skuld + pref - kassa, ev) < 0.003, `${(mcap + skuld + pref - kassa).toFixed(2)} mot ${ev} EXAKT — PREFERENSPOSTEN ${pref} mdr är EV-gapets bärare (preferensutdelningar 146–180 M/år lever kvar trots inlösen-noten)`);
  kraav("BCE17 EV/EBIT", pct(ev / (ebit / 1000), evEbit) < 0.005, `${(ev / (ebit / 1000)).toFixed(2)} mot ${evEbit}`);
  kraav("BCE18 aktiebas-DRIP", aktiebasForandr > 0.01 && aktiebasForandr < 0.02 && buybackY < 0, `+1,48 %/år (AKTIEBAS VÄXER — DRIP-maskinen; BP:s −5,94 %-återköpsmaskin spegelvänd: köp-yield −1,48 %)`);
  kraav("BCE19 netto>0-P/E-bärare", netto > 0, `TTM-netto +6 270 M CAD = P/E-bärare — one-off-dokumenterat (netto +966 % YoY; pretax-marginal 30,98 % >> operativ 21,71 % = icke-operativ bärare under raden); fwd-normaliserad EPS 30,90/12,20 = 2,53 ⇒ netto-normal ~2,36 mdr fortfarande > 0`);
  kraav("BCE20 payout-dubbel", pct(dps / eps, payout) < 0.01, `${((dps / eps) * 100).toFixed(2)} % mot ${payout * 100} % på one-off-EPS (normaliserad 1,75/2,53 = 69,2 % — utdelningen bär 69 % av normalvinsten, 26 % av one-off-vinsten)`);
  kraav("BCE21 BVPS-P/B-konsistens", pct(bvps * aktier, 20.65) < 0.01, `BVPS 22,14 × 0,93253 = ${(bvps * aktier).toFixed(2)} mdr common-EK (balans-vyns FY2025-common 19,732 + TTM-tillväxt = konsistent)`);

  return {
    ticker: "BCE", namn: "BCE Inc.", bransch: "kommunikation", land: "Kanada", valuta: "CAD",
    kallor: [
      { namn: "StockAnalysis", hamtat: HAMTAT, url: "https://stockanalysis.com/quote/tsx/BCE/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/ + /dividend/)", paranoid: "TSX-PRIMÄRNOTING i CAD (universumets första rena TSX-rad — RY/CNQ bär NYSE-USD; underlag S&P Global Market Intelligence + Fiscal.ai, " + AS_OF + "): pris 30,90 CAD (aktiebas 30,90×0,93253 mdr = 28,82 mdr CAD — 0,02 %), P/E 4,60 (aktiebas 30,90÷6,72 = 4,601 — 0,03 %; ONE-OFF-UPPHÖJD bas: TTM-netto 6 270 M mot operativ 5 384 M, pretax-marginal 30,98 % >> operativ 21,71 % = MLSE-försäljningsvinsten ~+4,8 mdr under raden) forward 12,20 ⇒ prognosTillväxt −62,3 % (SPEGELVÄND multipel: trailing BILLIG av one-off, forward NORMALISERAD — BP:radens omvändning; PEG null: negativ prognos ⇒ meningslös, källans PEG 9,14 på 3-års-EPS +0,91 % som not), PS 1,16, P/B 1,19 på total-EK-bas ≈ 24,2 mdr (D/E 1,73 på SAMMA bas — korsbevisat; common-basen 22,14×0,93253 = 20,6 mdr ger 1,40/2,02 — BAS-SPLITTRA dokumenterad, HUL/AMT-konventionen), EV 73,64 EXAKT replikerad mcap 28,82 + skuld 41,78 + PREFERENSER 3,52 − kassa 0,48 (preferensposten = EV-gapets bärare; preferensutdelningar −146 M/år lever), EV/EBIT 13,63 (replik 73,64/5,384 = 13,67 — 0,3 %) EV/EBITDA 7,68 på justerad EBITDA-bas ~9,6 mdr (marginalfältets 35,07 % × rev = 8,7 mdr — källans två EBITDA-baser dokumenterade), marginaler TTM: brutto 44,95 % (11 145/24 797) EBIT 21,71 % (EXAKT) netto 25,29 % (6 270/24 797; statistics-fältet 25,89 % på 24,22-bas — källspridning) FCF 10,72 % (2 657/24 797; OCF 6 786 − capex 4 129 = 2 657 EXAKT), fcfYield 9,22 % (2,657/28,82 EXAKT), ROE 30,47 % ONE-OFF-UPPHÖJD (replik 6 270/20 640 = 30,4 %; normaliserad på fwd-EPS-bas ~2,36 mdr ⇒ ~11 %), ROIC 6,95 % mot WACC 5,29 % (+1,7 pp — smalt), räntetäckning 2,95×, D/E 1,73, skuld/EBITDA 4,37 (telecom-hävstångens klass), effektiv skatt 15,61 %, Altman 0,78 (stresszonen — dokumenterad), Piotroski 6, beta 0,61, aktiebas 932,53 M AKENDE +1,48 %/år (DRIP — utdelningen delvis finansierad med aktier; buyback-yield −1,48 %, shareholder yield 4,18 %), institutioner 51,18 % insiders 0,06 %, 52-v 29,66–36,25 (−4,5 % på året), analytiker Buy 19 st PT 37,44 (+21,2 %), 38 683 anställda, grundat 1880 (Bell Canada — telefonens historiska förgrening, Bell-patentets kanadensiska arv), nästa rapport 2026-11-05 (Q3); FY-serier kalenderår (M CAD): rev 23 449→24 174→24 673→24 409→24 468 (+1,07 %/år — stilla), netto 2 709→2 716→2 076→163→6 305 (FY2024 = nedskrivningsåret 163 M; FY2025 = MLSE-året 6 305 M; TTM 6 270), bruttomarginalserie 43,01/43,55/43,91/44,78/45,05 % (medel 44,06, spread 2,04 pp — infrastruktur-moatet), ek totalt 22 941→22 515→20 557→17 360→23 310 (common 18 632→19 732; BVPS 20,50→21,16), skuld 29 673→41 059 (+38 % på fyra år — fibern finansierad), fcf 3 156→3 232→3 365→3 091→3 293 (6/6 positiva, varje år OCF−capex EXAKT), capex 4 852→3 700 (taket FY2021, ned 24 %/år), utdelningar betalda 3 257→3 448→3 668→3 800→2 177 (TTM 1 778 varav preferens 146 = common 1 632 EXAKT = DPS 1,75×0,93253 mdr); CF-vyns två mallar: Financial.ai-vyn når TTM jun-26 (bärs), Capital IQ-mallen via webReader når sep-24 (FY2021-23 identiska — dubbelbevisat, enbart TTM-kolumnen vintage-splittad)" },
      { namn: "Yahoo Finance (chart-API)", hamtat: HAMTAT, url: "https://query1.finance.yahoo.com/v8/finance/chart/BCE.TO", paranoid: "paranoid kurskoll: Yahoo 09-18 30,90 CAD mot SA 30,90 = 0,00 % band (identisk close, sista strecket 16:00 Toronto); dagens spann 30,50–31,06 matchar, previousClose 31,20 (−0,96 %), volym 7,19 M" },
    ],
    hamtat: HAMTAT, pris, marknadsKapitalMdr: 28.82,
    tillvaxt: { omsattningCAGR5ar: +omsCagr.toFixed(4), resultatCAGR5ar: +resCagr.toFixed(4), omsattningTillvaxtTTM: 0.0159, prognosTillvaxt: +prognos.toFixed(4) },
    lonksamhet: { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM },
    stabilitet: { skuldEgenkapital: de, rantaTackning: rantack, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
    aterkop: { senasteArMdr: +utdTot.toFixed(3), andelUtestande: 0.0006, insiderkopSenaste6man: null },
    moat: { bruttoMarginalMedel5ar: +bmMedel.toFixed(2), bruttoMarginalSpread5ar: +bmSpread.toFixed(2), roeMedel5ar: null },
    vardering: { pe, pb, evEbit, peg: null, fcfYield: 0.0922, egenKapitalMultipl: pb },
    golv: { typ: "osatt", vardePerAktie: null, marginal: null },
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: omsSerie.map((x) => x * 1e6), resultat: resSerie.map((x) => x * 1e6), egetKapital: ekSerie.map((x) => x * 1e6), fcf: fcfSerie.map((x) => x * 1e6) },
    notering: "Kanada/kommunikation 0→1 — Bell Canada, telefonens ursprungskedja (Bell-patentet 1876/1874-kanadensiska bolaget 1880, universumets ÄLDSTA bolag tillsammans med 1888-HUL) — Kanadas tredje gren (finans RY · energi CNQ ⇒ +kommunikation); TSX-primär i CAD = universumets första rena Toronto-rad. SIGNATURTAL — UTDELNINGSFÄLLANS FULLA BÅGE: DPS-trappan 3,68→3,87→3,99→2,31→1,75 CAD med KAPET −56 % jun-2025 (kvartalsutdelningen 0,9975→0,4375) efter femtioårig växttakt — direktavkastning 5,66 % på en KAPAD utdelning = utbildningsfallet 'yield-fälla': hög yield betalad med belåning (skuld 29,7→41,1 mdr +38 %/4 år, skuld/EBITDA 4,37, Altman 0,78 stresszonen) och DRIP-emissioner (aktiebas +1,48 %/år, buyback-yield −1,48 %). ONE-OFF-SPEGELEXEMPLET mot BP:raden (omg23): BP bar trailing-dyr/forward-billig (21,51→8,08), BCE bär trailing-BILLIG/forward-normaliserad (4,60→12,20) — MLSE-försäljningsvinsten ~+4,8 mdr CAD lyfter TTM-netto över den operativa inkomsten (pretax 30,98 % >> operativ 21,71 %) ⇒ prognosTillväxt −62,3 % = universumets tydligaste 'multipeln ljuger om vinstens kvalitet'-rad; endpoint-resCAGR +23,5 % ljuger UPPÅT (BP:s −84 % ljuger nedåt) — endpoint-fällan har två riktningar, BCE+BP = lärarparet. ROE 30,47 % one-off-upphöjd (normaliserad ~11 %); bruttomarginalbandet 43,0–45,1 % (spread 2,04 pp) = infrastruktur-moatets stillastående band mot BP:s råvaruband 6,6 pp; fcf 6/6 positiva med capex-trappan 4 852→3 700 (fibreråret FY2021 = taket); EV 73,64 = mcap+skuld+PREFERENSER 3,52−kassa (preferensposten = EV-gapets bärare, dokumenterad); analytiker Buy 19 st PT +21,2 % mot 52-v-bandets nedre halva. FIFO: Q3 2026-11-05.",
  };
})();

// ── Grindutvärdering ──
const antalGröna = granslar.filter((g) => g.startsWith("GRÖN")).length;
const antalRöda = granslar.filter((g) => g.startsWith("RÖD")).length;
console.log(granslar.join("\n"));
console.log(`\nARITMETIKGRIND: ${antalGröna} GRÖNA / ${antalRöda} RÖDA av ${granslar.length}`);
if (abort) { console.log("ABORT — filen orörd, rättning krävs."); process.exit(1); }
mkdirSync("/tmp/s2u1o24", { recursive: true });
writeFileSync("/tmp/s2u1o24/rader-nya.json", JSON.stringify([bce], null, 1));
console.log("→ /tmp/s2u1o24/rader-nya.json skriven (1 rad, alla fält maskinräknade)");
