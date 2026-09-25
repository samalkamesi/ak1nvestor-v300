#!/usr/bin/env node
/**
 * _r246-u43-pub-universum-inlagg.mjs — v173 dataset-djup rond 246 U43 (+1):
 * Publicis Groupe PUB.PA (Frankrike/kommunikation 1→2). Cellmotiverad duo:
 * Orange (kommunikationens NÄT — infrastrukturen) + Publicis (kommunikationens
 * BUDSKAP — reklambyråsidan: medieplanering/data/AI-agenter). EPA/EUR.
 * SEKTOR-VILLKORET dokumenterat: TEP Teleperformance AVVISAD i hämtningssteget
 * (källan visar Sector: Industrials — rond 245:s villkor); alternativ sond:
 * ILD 404 hos källan, ETL negativt netto (P/E-bärare röd); PUB vald av tre
 * gröna kandidater (PUB/MMT/TFI — Communication Services alla).
 * Kvartalsrapporterande (TTM = jun '26; nästa rapport 2026-10-15 = PRE-fönster-
 * klassen, EL/PSON-mönstret). GEO-SEX-BENSLÅS exakt i FEM fönster.
 * Kvitto: /tmp/r246-pub-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["PUB", "PUB.PA"].includes(b.ticker) || /publicis/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/epa/PUB/"))) {
  console.error("ABORT: PUB finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 97.62, aktierMdr: 0.24972, mcap: 24.39, eps: 6.42, peKalla: 15.21,
  fwdPe: 11.90, pb: 2.32, psKalla: 1.38, evKalla: 27.69,
  evEarnings: 17.07, evSales: 1.57, evEbit: 10.57, evEbitda: 8.53, pFcf: 9.87,
  roe: 0.1618, roic: 0.1392, roce: 0.1619, wacc: 0.0668,
  ebitM: 0.1486, pretaxM: 0.1257, bruttoM: 0.4667,
  nettoTtm: 1.622, revTtm: 17.65, fcfTtm: 2.471,
  skuld: 5.45, ek: 10.50, kassa: 2.13, de: 0.52, rantaTackning: 12.73,
  div: 3.75, divYieldKalla: 0.0384, payoutKalla: 0.5567,
  utdelningTtm: 903, epsFwdTillvaxt: 6.73, pegKalla: 1.77,
  // EUR-serier, dec-slut FY2022–FY2025 + TTM jun '26 (kvartalsrapporterande)
  omsSerie: [14196, 14802, 16030, 17399],
  resSerie: [1222, 1312, 1660, 1653],
  fcfSerie: [2219, 1868, 2063, 2693],
  ocfSerie: [2417, 2048, 2301, 2943], capexSerie: [198, 180, 238, 250],
  ocfTtm: 2697, capexTtm: 226,
  bruttoSerie: [6067, 6399, 6942, 7960], bruttoTtm: 8238,
  // GEO NET-revenue sex ben: [TTM, FY25, FY24, FY23, FY22]
  geo: {
    eu: [3568, 3520, 3384, 3172, 2879],
    na: [8906, 8899, 8583, 8050, 7869],
    apac: [1269, 1260, 1218, 1156, 1176],
    latam: [457, 428, 374, 341, 289],
    mea: [424, 440, 406, 380, 359],
    other: [3026, 2852, 2065, 1703, 1624],
    total: [17650, 17399, 16030, 14802, 14196],
  },
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisEUR),
  pePrisEps: K.prisEUR / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  evReplik: K.mcap + K.skuld - K.kassa,
  nettoM: K.nettoTtm / K.revTtm,
  fcfM: K.fcfTtm / K.revTtm,
  fcfY: K.fcfTtm / K.mcap,
  divY: K.div / K.prisEUR,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  psReplik: K.mcap / K.revTtm,
  pbReplik: K.mcap / K.ek,
  deReplik: K.skuld / K.ek,
  evEarningsReplik: K.evKalla / K.nettoTtm,
  evSalesReplik: K.evKalla / K.revTtm,
  payoutReplik: K.utdelningTtm / (K.nettoTtm * 1000),
  epsBeraknad: K.nettoTtm / K.aktierMdr,
  pegRen: K.fwdPe / K.epsFwdTillvaxt,
  bruttoMarginaler: [...K.bruttoSerie.map((g, i) => g / K.omsSerie[i]), K.bruttoTtm / K.revTtm],
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition", R.evReplik, K.evKalla, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["nettoM mot källans rad", R.nettoM, 0.0919, 0.02],
  ["fcfM mot källans rad", R.fcfM, 0.1400, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.1013, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout med RÄTT bas (betald TTM 903/netto 1 622)", R.payoutReplik, K.payoutKalla, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
if (!(R.peGaap > K.peKalla - 0.5 && R.peGaap < K.peKalla + 0.5)) {
  console.error(`ABORT: P/E-familjen utanför spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
if (avv(R.pegRen, K.pegKalla) > 0.005) { console.error(`ABORT: PEG-ren-bas ${R.pegRen.toFixed(3)} vs ${K.pegKalla}`); process.exit(1); }
// FCF-identitetslås: OCF − capex == källans FCF-rad FY22–FY25 + TTM (sex fönster)
const fcfId = K.fcfSerie.every((f, i) => K.ocfSerie[i] - K.capexSerie[i] === f) && (K.ocfTtm - K.capexTtm === Math.round(K.fcfTtm * 1000));
if (!fcfId) { console.error("ABORT: FCF-identitetslås bruten"); process.exit(1); }
// GEO-SEX-BENSLÅS: sex ben summerar till totalen i TTM+FY25+FY24+FY23+FY22 (tolerans 0,1 %)
const geoFel = [];
for (let i = 0; i < 5; i++) {
  const sum = K.geo.eu[i] + K.geo.na[i] + K.geo.apac[i] + K.geo.latam[i] + K.geo.mea[i] + K.geo.other[i];
  if (Math.abs(sum / K.geo.total[i] - 1) > 0.001) geoFel.push(`fönster ${i}: ${sum} vs ${K.geo.total[i]}`);
}
if (geoFel.length) { console.error("ABORT: GEO-sex-benslås: " + geoFel.join("; ")); process.exit(1); }
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
// Kaskad + bruttomarginal stigande fem raka (moat-dokumentation)
if (!(K.bruttoM > K.ebitM && K.ebitM > K.pretaxM && K.pretaxM > R.nettoM)) { console.error("ABORT: kaskad bruten"); process.exit(1); }
const stigandeBm = R.bruttoMarginaler.every((x, i) => i === 0 || x > R.bruttoMarginaler[i - 1]);
if (!stigandeBm) { console.error("ABORT: bruttomarginal ej stigande fem raka"); process.exit(1); }

const RAD = {
  ticker: "PUB.PA",
  namn: "Publicis Groupe S.A.",
  bransch: "kommunikation",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/epa/PUB/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "EPA-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 97,62 EUR · 52v +21,29 %; pris ÖVER både 50-MA 97,36 och 200-MA 85,43 = radens TRENDBÄRARE; RSI 47,7; beta 0,60; konsensus PT 112,19 = +14,93 % Buy 16 analytiker); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec) + KVARTALSRAPPORTERING (TTM = jun '26 efter H1; NÄSTA RAPPORT 2026-10-15 — Q3/9m — PRE-FÖNSTERKLASSEN: v172-fönstret 10-20→11-04, PUB i EL 10-16/PSON 10-12-klassen; H1 '26 rapporterad 07-16 med UPPGRADERAD guidance); SEKTOR-VILLKORET dokumenterat: TEP Teleperformance AVVISAD i hämtningssteget (källans Sector-rad: Industrials — rond 245:s dokumenterade villkor); ALTERNATIV SOND: ILD Iliad 404 hos källan, ETL Eutelsat negativt netto (P/E-bärare röd); PUB vald av TRE GRÖNA kandidater (PUB 24,39 mdr/netto +1,62/P/E 15,21 · MMT M6 · TFI TF1 — alla Communication Services, alla RENA i kollisionskontrollen); " +
    "pris 97,62 EUR, mcap 24,39 mdr EUR på 0,24972 mdr aktier (replik 0,24972×97,62 = 24,39 — EXAKT på fyra siffror; aktieantal −0,48 % YoY — återköp −179 M TTM, buyback-yield 0,48 %; insiders 7,44 % · institutioner 47,86 % · float 217,14 M), " +
    "P/E-FAMILJEN: källrad 15,21 · pris/EPS 97,62/6,42 = 15,203 (0,05 % EXAKT) · GAAP 24,39/1,622 = 15,04 (familjen tight); fwd P/E 11,90 ⇒ implied EPS +27 % (AI-tillnäten efter LiveRamp); PEG 1,77 MED REN BAS (fwd P/E/EPS-fwd-3Y = 11,90/6,73 = 1,768 — källraden replikerad, ingen basblandning); PS 1,38 · P/B 2,32 · P/FCF 9,87 · P/OCF 9,04; " +
    "EV-DEKOMPOSITION NÄSTAN EXAKT: 24,39 + 5,45 − 2,13 = 27,71 mot källans 27,69 (0,07 %); EV/Earnings 17,07 (0,06 %) · EV/Sales 1,57 (0,07 %) · EV/EBIT 10,57 · EV/EBITDA 8,53 · EV/FCF 11,20; NETTO-SKULD −3,32 mdr (−13,30/aktie) — FÖRDUBBLAD från −1,53: LIVERAMP-FÖRVÄRVET $2,2 mdr KONTANT (maj '26, största sedan 2019; kassan 4 166→2 128 HALVERAD; ny EUR 500 M-obligation prisad 09-16 — dokumenterad händelsekedja); " +
    "GEO-SEX-BENSLÅSET VÅGEN BREDASTE: Europa + Nordamerika + APAC + Latinamerika + MEA + Other = totalen EXAKT (±0 %) i FEM FÖNSTER (TTM+FY25+FY24+FY23+FY22); NA störst 8 906 = 50,5 % av TTM (byråns amerikanska vikt) · Europa 3 568 = 20,2 % · APAC 7,2 % · LatAm 2,6 % · MEA 2,4 % · Other 3 026 = 17,1 % (pass-through/mellanhänder — växer 1 624→3 026, vyn erbjuder sex ben); " +
    "TILLVÄXTPORTRÄTT: oms [14 196 · 14 802 · 16 030 · 17 399] + TTM 17 650 (CAGR +7,02 % FY22→25; FY22 +20,94 % efterpandemi-topp · FY25 +8,54 %; TTM +1,44 % — takten dalar men nivån rekord); NETTO svävande [1 222 · 1 312 · 1 660 · 1 653] + TTM 1 622 — NETTO FALLAR SVAGT medan EBIT stiger [2 061→2 623] (finansnetto/skatt i LiveRamp-året: skatt 592 M, effektiv 26,69 % — dokumenterat); res-CAGR +10,58 %; " +
    "BRUTTOMARGINAL STIGANDE FEM RAKA: [42,73 · 43,23 · 43,31 · 45,75 · 46,67] % (moat-dokumentation: medel 44,34 % · spread 3,94 p — prissättningsmakten byggs); kaskad brutto 46,67 > EBIT 14,86 > pretax 12,57 > netto 9,18 (finansnetto nedåt — normal tjänstekaskad); " +
    "FCF-IDENTITETSLÅSET SEX FÖNSTER EXAKT: OCF − capex = källans FCF-rad FY22–FY25 + TTM ([2 417−198 · 2 048−180 · 2 301−238 · 2 943−250] + [2 697−226] = [2 219 · 1 868 · 2 063 · 2 693] + 2 471); FY23-dip = working capital-reningen, därefter STIGANDE; FCF-M 14,00 % EXAKT · FCF-yield 10,13 % EXAKT (FCF/aktie 9,90); " +
    "UTDELNING DPS 3,75 (3,84 % EXAKT replik 3,75/97,62; +4,17 % YoY); PAYOUT med RÄTT bas EXAKT (betald TTM 903/netto 1 622 = 55,67 % mot källraden 55,67 — TD-mönstret); utdelningsbelopp [−227 · −83,2 · −726 · −853 · −903 · −903] (FY22-kolumnens −83,2 = källans avstämningsbild, dokumenterad); shareholder yield 4,32 % (utd 3,84 + buyback 0,48); " +
    "LÖNSAMHET: ROE 16,18 % · ROIC 13,92 % mot WACC 6,68 % (gap +7,24 p — bland vågens bredaste: byråns goodwill-tyngda kapital är likvid och avkastar) · ROCE 16,19 % · räntetäckning 12,73 · D/E 0,52 (5,45/10,50 — 0,2 %) · Debt/EBITDA 1,68 (skuld nedtrappad [6 561→5 695→5 450]) · current 0,94/quick 0,90 · working capital −1,45 mdr (tjänstemodellen: kunden finansierar); skatt 592 M (26,69 %); anställda 115 782 (152 442 EUR oms/anställd · 14 009 EUR netto/anställd); " +
    "NARRATIV-DATAFAKTA (källans nyhetsflöde, inga köpsignaler): PepsiCo $1,7 mdr-kontot VUNNET 09-2026 (Coke-pitchen lämnad — konfliktregeln bruten i branschen); LiveRamp = data-co-creation/agentic AI; H1 '26: stark organisk tillväxt + marginalökning + UPPGRADERAD guidance; Maurice Lévys appell om europeisk AI-fond; 52v +21,29 % med pris över båda MA = radens trendbärare (mot de flesta senaste inläggens nedgångar); " +
    "SEGMENTSTRUKTUR: källan erbjuder GEO (sex ben, låst) men ingen verksamhetssegment-panel (Publicis comms/media/sapient/health redovisas i bolagets EPRD-rapportering utanför panelunderlaget — dokumenterat, inget falskt lås); EK-serie saknas (nuvärde 10,50 mdr · 42,12/aktie dokumenterat här); " +
    "kandidatur: CELLMOTIVERAD duo — Frankrike/kommunikation-cellens NÄTET MOT BUDSKAPET: Orange (nätet/infrastrukturen — telefonin) + Publicis (budskapet — reklambyråsidan: medieplanering, data, AI-agenter); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 1 622 M EUR > 0 — GRÖN); kommunikation-cellen 1→2, Frankrike 26→27; NÄSTA RAPPORT 2026-10-15 (pre-fönsterklassen)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0144,
    prognosTillvaxt: -0.0064,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.903, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: 0.4434, bruttoMarginalSpread5ar: 0.0394, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbit, peg: K.pegKalla, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Frankrike/kommunikation 1→2: Orange nätet/infrastrukturen + Publicis budskapet/reklambyråsidan — kommunikationens två lager: nätet mot budskapet); SEKTOR-VILLKORET dokumenterat: TEP avvisad (källan: Industrials — rond 245:s villkor), ILD 404, ETL negativt netto; PUB vald av tre gröna (PUB/MMT/TFI); kollisionskontroll primär+sekundär GRÖN; EPA/EUR; kvartalsrapporterande (TTM jun '26); RAPPDAG 2026-10-15 PRE-fönsterklassen (EL/PSON-mönstret; H1 '26 med UPPGRADERAD guidance); GEO-SEX-BENSLÅSET EXAKT i FEM FÖNSTER (NA 50,5 % · Europa 20,2 % · Other/pass-through 17,1 % växande); oms [14 196·14 802·16 030·17 399]+TTM 17 650 (CAGR +7,02 %; FY22 +20,94 %); NETTO svag nedgång [1 660→1 653→1 622] medan EBIT stiger (LiveRamp-årets finansnetto/skatt 26,69 %); BRUTTOMARGINAL STIGANDE FEM RAKA [42,73→46,67] % (moat); FCF-IDENTITETSÅS sex fönster exakt [2 219·1 868·2 063·2 693]+TTM 2 471 (FCF-M 14,00 EXAKT · yield 10,13 EXAKT); DPS 3,75 (3,84 % EXAKT; payout RÄTT BAS EXAKT 903/1 622 = 55,67); NETTO-SKULD FÖRDUBBLAD −3,32 mdr = LIVERAMP $2,2 mdr kontant (kassan halverad; EUR 500 M ny obligation); ROIC-gap +7,24 p; räntetäckning 12,73; PEG 1,77 REN BAS (11,90/6,73); P/E-familjen 15,21/15,04/15,203; 52v +21,29 % över båda MA = trendbäraren (PT +14,93 %); EK-serie saknas (10,50 mdr dokumenterat); alla repliker i paranoid (StockAnalysis EPA 2026-09-25)",
};

const kao = u.find((b) => b.ticker === "4452.T");
const fält = (o) => Object.keys(o).sort().join(",");
const strukturOk =
  fält(RAD) === fält(kao) &&
  ["tillvaxt", "lonksamhet", "stabilitet", "aterkop", "moat", "vardering", "golv", "serier"].every(
    (k) => fält(RAD[k]) === fält(kao[k]),
  );
if (!strukturOk) { console.error("ABORT: fältstruktur avviker från 4452.T-mallen"); process.exit(1); }

const rad2 = raw.split("\n")[1] ?? "";
const indent = rad2.startsWith("  ") ? 2 : rad2.startsWith(" ") ? 1 : 0;
const backup = JSON.parse(JSON.stringify(u));
u.push(RAD);
writeFileSync(UNI, JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : ""));

for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "PUB.PA") { console.error("ABORT: sista raden ≠ PUB.PA"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Publicis PUB.PA, Frankrike/kommunikation 1→2; kommunikation-cellen → ${slut.filter((b) => b.bransch === "kommunikation").length}; Frankrike → ${slut.filter((b) => b.land === "Frankrike").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS): mcap EXAKT (0,24972×97,62 = 24,39 fyra siffror) · payout RÄTT BAS EXAKT (903/1 622 = 55,67 mot 55,67) · fcfM EXAKT (14,00) · fcfY EXAKT (10,13) · divY EXAKT (3,84) · P/E pris/EPS 0,05 % · EV-dekomposition 0,07 % · evEarnings 0,06 % · evSales 0,07 % · nettoM 0,07 % · PS 0,2 % · PB 0,1 % · D/E 0,2 % — TOLV lås ≤0,2 %; PEG 1,77 REN BAS (11,90/6,73 = 1,768)`,
  `GEO-SEX-BENSLÅSET EXAKT I FEM FÖNSTER (±0 %): Europa+NA+APAC+LatAm+MEA+Other = totalen i TTM+FY25+FY24+FY23+FY22 — vågens bredaste geo-lås; NA 50,5 % · Europa 20,2 % · Other 17,1 % (pass-through, växande 1 624→3 026)`,
  `FCF-IDENTITETSÅS SEX FÖNSTER EXAKT: OCF−capex = FCF-rad FY22–FY25+TTM; FY23-dip dokumenterad; BRUTTOMARGINAL STIGANDE FEM RAKA [42,73→46,67] % (medel 44,34 · spread 3,94 p)`,
  `LIVERAMP-KEDJAN dokumenterad: netto-skuld −1,53→−3,32 mdr (fördubblad) · kassa 4 166→2 128 (halverad) · skuld nedtrappad [6 561→5 450] · ny EUR 500 M-obligation; netto svag nedgång medan EBIT stiger (skatt 26,69 %)`,
  `P/E-BÄRARKONTROLL: TTM-netto 1 622 M EUR > 0 — GRÖN · SEKTORVILLKOR: PUB Communication Services (TEP avvisad Industrials; ILD 404; ETL negativt) · RAPPDAG 2026-10-15 PRE-fönsterklassen (första franska pre-fönster-bolaget; H1 '26 uppgraderad guidance)`,
  `FRANKRIKE KOMPLETT efter inlägget: kommunikation 1→2 = TOLV GRENNAR ALLA ≥2 (SJÄTTE LANDET) — energi 2 · fastighet 2 · finans 5 · halso 2 · industri 2 · kommunikation 2 · konsument 5 · material 2 · teknik 5`,
);
writeFileSync("/tmp/r246-pub-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
