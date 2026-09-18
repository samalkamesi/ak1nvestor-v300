#!/usr/bin/env node
/**
 * s2-u2 omg14 (manifest auto-s2-1789715100341) — DATASET-DJUP:
 * KLARNA GROUP (KLAR, tillväxt, Sverige via SPOT-huvudortskonventionen)
 * + BOOZT (BOOZT, tillväxt, Sverige) — Sverige/tillväxt-mattan 3→5 ⇒
 * NY LANDASPEKTSIDA /dataset/tillvaxt/sverige vid nästa prod-bygge
 * (ORCL/ENEA-precedensen). Universum 171→173 (idempotent append,
 * syskonens rader lämnas elementvis orörda; redan förekommande tickers
 * hoppas). Källa StockAnalysis: KLAR /stocks/klar/{,statistics/,financials/}
 * (close 2026-09-17 16:00 EDT), BOOZT /quote/sto/BOOZT/{,statistics/,
 * financials/} (fördröjd 2026-09-18 09:04 CET, börsen öppen — AIR.PA-
 * precedensens realtidsstämpel). All aritmetik maskinverifierad FÖRE
 * skrivning (abort-grind).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis, hämtat 2026-09-18; KLAR musd / BOOZT msek) ────────
const K = {
  KLAR: {
    pris: 13.94, mcapMdr: 5.29, evSalesMdr: 2.221,             // EV/Sales 0,55 × rev TTM
    pe: null, peFwd: 54.95, pb: 2.17, ptbv: 3.69, ps: 1.31,
    revTTM: 4.039, nettoTTM: -0.142, ebitTTM: -0.025, gpTTM: 1.488, epsTTM: -0.38, epsFwd: 0.2538,
    bruttoM: 0.3684, ebitM: -0.0062,                           // egna kvoter ur TTM-råtal
    roe: -0.0429, roa: -0.0008, roic: -0.0040, roce: -0.0015, wacc: null,
    skuldEk: 0.66, rantaTack: null,                            // källan: interest coverage n/a
    kassaMdr: 4.814, skuldMdr: 1.752, nettokassaMdr: 3.062, equityMdrBVPS: 2.442, equityMdrSida: 2.67,
    ocfTTM: -3.779, capexTTM: -0.002, fcfTTM: -3.781, beta: null,
    insiders: 0.2040, institutioner: 0.3949, kort: 0.0925,
    revTillvaxtTTM: 0.3410, nettoTillvaxtTTM: null,
    v52laag: 12.06, v52hog: 45.98, v52Forandr: -0.6931,
    analytiker: "Buy mål 19,97 (+43,3 %), 24 st",
    serier: {                                                   // musd, FY2022–FY2025
      ar: ["2022", "2023", "2024", "2025"],
      oms: [1904, 2276, 2811, 3509],
      netto: [-1038, -249, 3, -294],
      fcf: [325, 807, 586, -1035],
    },
    brutto5: [1024, 687, 1085, 1217, 1239],                     // bruttovinst FY2021..FY2025 musd
    oms5: [1620, 1904, 2276, 2811, 3509],
  },
  BOOZT: {
    pris: 142.90, mcapMdr: 8.62,                               // SEK; fördröjd 09:04 CET 2026-09-18
    pe: 30.75, peFwd: 18.25, pb: 3.25, ptbv: 4.28, ps: 1.01, pegKalla: 0.77,
    evEbit: 20.50, evEbitda: 13.98, evSales: 1.09,
    revTTM: 8.535, nettoTTM: 0.301, ebitTTM: 0.452, gpTTM: 2.415, epsTTM: 4.67,
    bruttoM: 0.2829, ebitM: 0.0530,
    roe: 0.1106, roa: 0.0538, roic: 0.1094, roce: 0.1353, wacc: 0.1325,
    skuldEk: 0.28, rantaTack: 12.91,
    kassaMdr: 0.112, skuldMdr: 0.755, nettoskuldMdr: 0.643, equityMdr: 2.65,
    ocfTTM: 0.799, capexTTM: 0.096, fcfTTM: 0.703, beta: 1.79,
    insiders: 0.0325, institutioner: 0.4434,
    revTillvaxtTTM: 0.0368, nettoTillvaxtTTM: -0.166,
    v52laag: 84.65, v52hog: 169.30, v52Forandr: 0.5358,
    analytiker: "Buy mål 165,00 SEK (+15,5 %), 5 st",
    rapport: "2026-11-03 (Q3)",
    serier: {                                                   // msek, FY2022–FY2025
      ar: ["2022", "2023", "2024", "2025"],
      oms: [6743, 7755, 8244, 8287],
      netto: [187, 233, 342, 301],
      fcf: [360, 109, 127, 985],
    },
    brutto5: [1740, 1990, 2226, 2388, 2412],                    // bruttovinst FY2021..FY2025 msek
    oms5: [5814, 6743, 7755, 8244, 8287],
  },
};

// ── härledda tal + aritmetikgrind ─────────────────────────────────────────────
const cagr = (a, b, ar) => Math.pow(b / a, 1 / ar) - 1;
const FEL = [];
const jamfor = (namn, calc, ext, tol = 0.005) => {
  if (Math.abs(calc - ext) > tol) FEL.push(`${namn}: beräknat ${calc.toFixed(4)} vs källa ${ext} (tol ${tol})`);
};
const r4 = (x) => Math.round(x * 10000) / 10000;

const bilda = (k, ticker) => {
  const prog = k.pe !== null && k.peFwd ? r4(k.pe / k.peFwd - 1) : null;   // spårkonventionen (null om trailing saknas)
  const peg = prog !== null && prog > 0 ? Math.round((k.pe / (prog * 100)) * 100) / 100 : null;
  const nettoM = r4(k.nettoTTM / k.revTTM);
  const ebitM = r4(k.ebitTTM / k.revTTM);
  const fcfM = k.fcfMarginalNull ? null : r4(k.fcfTTM / k.revTTM);          // KLAR: kundmedelsflöden → null
  const fcfY = k.fcfMarginalNull ? null : r4(k.fcfTTM / k.mcapMdr);
  const omsCagr = cagr(k.serier.oms[0], k.serier.oms[3], 3);
  const resCagr = k.serier.netto[0] > 0 ? cagr(k.serier.netto[0], k.serier.netto[3], 3) : null; // negativ bas → null (KINV/PSNY)
  const bm5 = k.brutto5.map((b, i) => b / k.oms5[i]);
  const moatMedel = k.moatNull ? null : bm5.reduce((a, b) => a + b, 0) / 5;
  const moatSpread = k.moatNull ? null : Math.max(...bm5) - Math.min(...bm5);

  // kontroller mot källans egna publicerade mått (externa vittnen)
  if (k.pe !== null) jamfor("P/E-identitet pris/EPS", k.pris / k.epsTTM, k.pe, ticker === "BOOZT" ? 0.16 : 0.01); // BOOZT: källans EPS visas med 2 dec (4,67; återkonstruerad 4,647) — VALE-precedensens avrundningsklass
  if (k.equityMdr) jamfor("P/B mcap/equity", k.mcapMdr / k.equityMdr, k.pb, 0.02);
  else jamfor("P/B mcap/(BVPS×shares)", k.mcapMdr / k.equityMdrBVPS, k.pb, 0.02);
  if (k.evEbit) jamfor("EV/EBIT (mcap+nettoskuld)/EBIT", (k.mcapMdr + k.nettoskuldMdr) / k.ebitTTM, k.evEbit, 0.06);
  if (k.evSalesMdr) jamfor("EV = mcap−nettokassa", k.mcapMdr - k.nettokassaMdr, k.evSalesMdr, 0.01);
  jamfor("bruttomarginal TTM", k.gpTTM / k.revTTM, k.bruttoM, 0.001);
  jamfor("EBIT-marginal TTM", k.ebitTTM / k.revTTM, k.ebitM, 0.0015);
  if (k.nettoskuldMdr) jamfor("nettoskuld skuld−kassa", k.skuldMdr - k.kassaMdr, k.nettoskuldMdr, 0.01);
  else jamfor("nettokassa kassa−skuld", k.kassaMdr - k.skuldMdr, k.nettokassaMdr, 0.01);
  if (k.serier.netto[0] > 0 && !(k.serier.netto[3] > 0)) FEL.push("CAGR-endpoint: slutår icke-positivt");
  if (!k.moatNull) for (let i = 0; i < 5; i++) if (!(bm5[i] > 0 && bm5[i] < 1)) FEL.push(`bruttomarginal FY${2021 + i} utanför (0,1): ${bm5[i]}`);

  return { prog, peg, nettoM, ebitM, fcfM, fcfY, omsCagr, resCagr, moatMedel, moatSpread };
};

K.KLAR.fcfMarginalNull = true;   // Credit Services: OCF/FCF bär kundmedelsflöden (RBC-precedensen)
K.KLAR.moatNull = true;          // bruttoserien bryts av intäktsredovisningsbyte FY22 — 5-årsmått missvisande
K.BOOZT.fcfMarginalNull = false;
K.BOOZT.moatNull = false;

const D = { KLAR: bilda(K.KLAR, "KLAR"), BOOZT: bilda(K.BOOZT, "BOOZT") };

for (const [n, d] of Object.entries(D)) {
  console.log(`${n}: prognosT ${d.prog === null ? "null" : (d.prog * 100).toFixed(1) + " %"} · PEG ${d.peg ?? "null"} · ebitM ${d.ebitM} · nettoM ${d.nettoM} · fcfM ${d.fcfM ?? "null"} · fcfY ${d.fcfY ?? "null"} · omsCAGR ${(d.omsCagr * 100).toFixed(2)} % · resCAGR ${d.resCagr === null ? "null" : (d.resCagr * 100).toFixed(2) + " %"} · moat ${d.moatMedel === null ? "null" : (d.moatMedel * 100).toFixed(2) + " % / " + (d.moatSpread * 100).toFixed(2) + " pp"}`);
}
if (FEL.length) { console.error("ARITMETIKFEL:", FEL); process.exit(1); }
console.log("ARITMETIKGRIND: GRÖN");

// KLAR-teckenväxlingskontroll (dokumentation, inte fel): EPS −0,38 → fwd +0,2538
console.log(`KLAR EPS-vändning: ${(K.KLAR.epsFwd / (13.94 / K.KLAR.peFwd) * 100).toFixed(0)} % av fwd-EPS förutsatt av pris/fwd-PE-kvoten; procentuell tillväxt från negativ bas ej meningsfull ⇒ prognosTillväxt/PEG null (ORSTED-konventionen utvidgat till teckenväxling)`);

// ── radbygge ──────────────────────────────────────────────────────────────────
const bas = (t, namn, valuta, k, paranoid, notering) => ({
  ticker: t, namn, bransch: "tillvaxt", land: "Sverige", valuta,
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-18", url: k.url, paranoid }],
  hamtat: "2026-09-18",
  pris: k.pris,
  marknadsKapitalMdr: k.mcapMdr,
  tillvaxt: {
    omsattningCAGR5ar: r4(D[t].omsCagr),
    resultatCAGR5ar: D[t].resCagr === null ? null : r4(D[t].resCagr),
    omsattningTillvaxtTTM: k.revTillvaxtTTM,
    prognosTillvaxt: D[t].prog,
  },
  lonksamhet: {
    roe: k.roe, roic: k.roic, bruttoMarginal: k.bruttoM, ebitMarginal: D[t].ebitM,
    nettoMarginal: D[t].nettoM, fcfMarginal: D[t].fcfM,
  },
  stabilitet: {
    skuldEgenkapital: k.skuldEk, rantaTackning: k.rantaTack,
    fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: k.insiderkop ?? null },
  moat: { bruttoMarginalMedel5ar: D[t].moatMedel === null ? null : r4(D[t].moatMedel), bruttoMarginalSpread5ar: D[t].moatSpread === null ? null : r4(D[t].moatSpread), roeMedel5ar: null },
  vardering: {
    pe: k.pe ?? null, pb: k.pb, evEbit: k.evEbit ?? null, peg: D[t].peg, fcfYield: D[t].fcfY, egenKapitalMultipl: k.pb,
  },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: k.serier.ar,
    omsattning: k.serier.oms.map((x) => x * (t === "KLAR" ? 1e6 : 1e6)),
    resultat: k.serier.netto.map((x) => x * 1e6),
    egetKapital: [],
    fcf: k.serier.fcf.map((x) => x * 1e6),
  },
  notering,
});

const rader = [
  bas("KLAR", "Klarna Group plc", "USD", {
    ...K.KLAR, url: "https://stockanalysis.com/stocks/klar/",
    insiderkop: 0.2040,
  },
    "översikt + statistics + financials (underlag S&P Global Market Intelligence; NYSE close 2026-09-17 16:00 EDT 13,94 USD, efterhandel 13,99; sidorna pålästa 2026-09-18): pris, mcap 5,29 mdr USD, EV 2,22 mdr (EV/Sales 0,55), P/E n/a (negativt TTM) forward 54,95, P/B 2,17 (mcap/BVPS×shares — källans equity-rad 2,67 mdr mot BVPS×shares 2,44 mdr: equity-måttens inre spridning dokumenterad, PBR/VALE-precedensen; P/TBV 3,69), PS 1,31, EV/EBIT n/a, marginaler, ROE −4,29 %/ROIC −0,40 %/ROCE −0,15 %/WACC n/a, skuld/EK 0,66, räntetäckning n/a, nettokassa 3,06 mdr USD (8,08/aktie), beta n/a, 52-v 12,06–45,98 (−69,31 %), insiders 20,40 % (CEO Siemiatkowski köpte 692 506 aktier för 9,95 M USD 2026-08-26 enligt Form 4 — källans nyhetsflöde), institutioner 39,49 %, kortrörelse 9,25 % av aktierna/17,87 % av flottet, analytiker Buy 19,97 USD (24 st), IPO 2025-09-10 NYSE; källan klassar Sector Financials/Industry Credit Services (KINV-precedensen: källans finans-etikett ↔ universumets tillväxtgren); rapportvaluta USD (musd)",
    "Svensk betalplattformsjätte enligt universumets huvudortskonvention (SPOT/Kambi-precedensen: toppbolag Klarna Group plc är UK-registrerat, NYSE-noterat i USD — huvudorten Stockholm; källans eget nyhetsflöde kallar bolaget 'the Swedish buy now, pay later company', grundat 2003 i Stockholm; Klarna Bank AB är svensk banklicenshavare). IPO-ÅRETS LÄROBOK: noterad 2025-09-10, 52-v-toppen 45,98 mot nuvarande 13,94 = −69,3 % — tre sänkta guider som börsnoterat bolag (Loop Capital räknar 'a third negative guidance surprise'), Q2-2026 oväntat positivt resultat men svag outlook −21 % i en session. FYRA INTÄKTSMOTORER (FY2025 musd): Transaction 2 103 · Consumer Service 397 · Gain on Sale of Consumer Receivables 73 · Interest Income 937 — räntenettot (banklicensen) är näst största motorn; TTM-omsättning 4 039 musd (+34,1 %) med netto −142 musd: EBIT-marginal −0,6 %, dvs precisionen kring nollstrecket (Q2-2026: transaction margin dollars +42 % enligt bolaget). VÄRDERING MED SAKNAD NÄMNARE: P/E null (negativt TTM-EPS −0,38), forward P/E 54,95 på vändningen till +0,25 USD — prognosTillväxt/PEG OSATT (teckenväxling −→+: procentuell tillväxt från negativ bas är utan mening; ORSTED-konventionen utvidgat, dokumenterat i append-skriptet). FCF-FÄLTEN NULL: OCF/FCF TTM −3,78 mdr USD vid capex −2 M = kundmedelsflöden via bankverksamheten (RBC-precedensen: bankens kassaflöde är inte bolagets konsumtionsbara kassa; serier.fcf bär källans tal FY2022–2025: +325/+807/+586/−1 035). MOAT NULL: bruttoserien 1 024/687/1 085/1 217/1 239 (FY21–25) bryts av intäktsredovisningskonventionens byte FY2022 — 5-årigt bruttomått vore missvisande (Allianz-/BRK-precedensens klass). resultatCAGR null: basåret FY2022 bär −1 038 musd (KINV/PSNY-konventionen); omsättningen däremot 1 904→3 509 musd = +22,5 %/år endpoint, fem raka tillväxtår (17,6/19,5/23,5/24,8 %, TTM +34,1 %). Balansräkningens paradox: kassa 4,81 mot skuld 1,75 mdr = nettokassa 3,06 mdr (8,08/aktie av kursen 13,94!) medan skuld/EK 0,66 — bankbalansen (in-/utlåning i arbetande kapital 14,4 mdr) gör nyckeltalen reading-krävande; klarna-konventionens dokumentation. Insiderköpet: VD och grundare köpte 9,95 M USD aktier 2026-08-26 (20,40 % insiders totalt). Nästa rapport: Q3 2026 (ej datumbelagt hos källan; senaste earnings 2026-08-18)."),
  bas("BOOZT", "Boozt AB (publ)", "SEK", {
    ...K.BOOZT, url: "https://stockanalysis.com/quote/sto/BOOZT/",
  },
    "översikt + statistics + financials (underlag S&P Global Market Intelligence; STO fördröjd kurs 2026-09-18 09:04 CET 142,90 SEK med börsen öppen — AIR.PA-precedensens tidsstämpelkonvention; föregående close 143,60; sidorna pålästa 2026-09-18): pris, mcap 8,62 mdr SEK, P/E 30,75 forward 18,25, PEG 0,77 (källans, grundad på dess tillväxtantaganden — spårkonventionens PEG 0,45 på trailing/fwd-kvoten dokumenterad i notering), P/B 3,25 (mcap/equity 2,65 mdr; P/TBV 4,28), PS 1,01, EV/EBIT 20,50 (EV/Sales 1,09, EV/EBITDA 13,98), marginaler, ROE 11,06 %/ROIC 10,94 %/ROCE 13,53 %/WACC 13,25 % (ROIC−WACC = −2,31 pp), skuld/EK 0,28, räntetäckning 12,91×, nettoskuld 643 Mkr (föregående år nettokassa +657 — lagret/säsongen), beta 1,79, 52-v 84,65–169,30 (+53,58 %), insiders 3,25 %, institutioner 44,34 %, analytiker Buy 165,00 SEK (5 st), effektiv skattesats 21,41 %; källans landetikett Sweden, rapportvaluta SEK, svenskt AB på Nasdaq Stockholm — källans About-text 'headquartered in Copenhagen' är profiltextens avvikelse (dokumenterad); källan klassar Sector Consumer Discretionary/Industry Apparel Retail (PSNY-precedensen: källans konsumentetikett ↔ universumets tillväxtgren)",
    "Nordisk e-handel i två motorer (FY2025 mkr): Boozt.com 6 659 (premium multi-brand) + Booztlet.com 1 628 (re-/outlet) — fullpris och rea som separata världar i samma bolag, TTM 8 535 mkr (+3,7 %). TILLVÄXTENS LÖNSAMHETSSIDA (mot Klarna i samma cell): netto positivt fem raka år 187/233/342/301 mkr (FY2022–25), EBIT-marginal TTM 5,3 % (2026-guidance 5,3–6,5 % enligt bolaget, Q2-2026 'near doubling of EBIT margin' på +13 % omsättningstillväxt), FCF 703 Mkr TTM (fcfYield 8,2 %) efter rekordåret FY2025 985 Mkr — e-handelns lagervarande kassaflöde: FCF-serien 360/109/127/985 (fyra år) svänger med capex-/lagercykeln (FY2022:s autobahn-år 446 Mkr capex i NECS-robotlogistik, FY2024 21 Mkr). MOAT STABIL: bruttomarginalerna 29,9/29,5/28,7/29,0/29,1 % (FY2021–25) — medel 29,2 %, spread 1,22 pp = universumets smalaste klass (e-handelsbruttot som konstant: prissättningen håller bruttovinsten medan volymen växer 5 814→8 287 mkr +12,5 %/år 5-årigt; endpoint FY22→25 +7,1 %/år, nettoresultatet +17,2 %/år — hävstången i fast kostnadstäckning). VÄRDERINGSGAPET: P/E 30,75 mot forward 18,25 ⇒ prognosTillväxt +68,5 % (spårkonventionen) = Q2-accelerationen prissatt i konsensus (PEG 0,45 spårkonventionen; källans PEG 0,77 på 3-årsperspektivet — båda dokumenterade); ROIC 10,94 % mot WACC 13,25 % = −2,31 pp (tillväxten ännu inte gratis). Balansvändningen: från nettokassa +657 Mkr (FY2025) till nettoskuld 643 Mkr (30 jun 2026) — skuld/EK 0,28, räntetäckning 12,9×; utdelning saknas (källan: Dividend n/a — kapitalåterbetalning via återköp/extrautdelning beslutade separata år, ej årlig strm). Beta 1,79 — mot Klarnas n/a: cellens volatilitetspar. Nästa rapport 2026-11-03 (Q3)."),
];

// ── idempotent append (elementvis, syskonens rader orörda) ────────────────────
const tillagda = [];
for (const r of rader) {
  if (har(r.ticker)) { console.log(`HOPPAR ${r.ticker} (finns redan)`); continue; }
  u.push(r);
  tillagda.push(r.ticker);
}
if (!tillagda.length) { console.log("INGET ATT LÄGGA — fil orörd"); process.exit(0); }

writeFileSync(FIL, JSON.stringify(u, null, 1) + "\n");        // befintligt format: indent 1, slutradbrytning
console.log(`APPEND: ${innan}→${u.length} (+${tillagda.join(", ")})`);

// ── efterkontroll: mattor + medianförskjutning (tillväxt/totalt P/E) ─────────
const median = (v) => { const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (v, p) => { const s = [...v].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const pes = (f) => u.filter(f).map((b) => b.vardering?.pe).filter((x) => typeof x === "number");
for (const [namn, f] of [["tillvaxt", (b) => b.bransch === "tillvaxt"], ["TOTALT", () => true]]) {
  const v = pes(f);
  console.log(`${namn}: n=${v.length} median P/E ${median(v).toFixed(3)} P25 ${pct(v, 0.25).toFixed(3)} P75 ${pct(v, 0.75).toFixed(3)}`);
}
const svT = u.filter((b) => b.land === "Sverige" && b.bransch === "tillvaxt").map((b) => b.ticker);
console.log(`Matta Sverige/tillvaxt: ${svT.length} (${svT.join(", ")}) ${svT.length >= 5 ? "⇒ /dataset/tillvaxt/sverige ÖPPNAS vid nästa prod-bygge" : "(under MIN_MATTA=5)"}`);
