#!/usr/bin/env node
/**
 * _r231-u33-universum-inlagg.mjs — v173 dataset-djup rond 231 U33 (+1):
 * The Toronto-Dominion Bank TD (Kanada/finans 1→2) — cellmotiverad duo:
 * RY+TD = universalbankens tvillingar med olika bottnar — RY (wealth-
 * tyngd: förvaltning 22,4 mdr störst) + TD (retail-tyngd: Canadian P&C
 * 21,5 + US Retail 15,5 = detaljhandelsbanken med USA-expansion).
 * TSX/CAD-precedensen (BCE/NTR/ENB-klassen; RY:s USD/NYSE dokumenterad som
 * historisk avvikelse). BANK-PROFIL enligt RY/SAN-mallen: EV/D/E/räntetäckning/
 * FCF-fält = n/a i källan (balansräkningens natur: kassa 633 mdr, skuld
 * 533 mdr = insättningsverksamheten) — NULL med dokumentation.
 * FCF-serien NEGATIV (bank-lånetillväxt, RY-precedensen) men identitetslåst
 * exakt fem fönster. Segmentvyn bår elimineringsdifferenser — dokumenterad
 * differansrad i stället för falskt exakthetslås. P/E-bärarkontroll FÖRE
 * leverans: TTM-netto 15,601 mdr CAD > 0 — GRÖN. Kvitto: /tmp/r231-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["TD", "TD.TO"].includes(b.ticker) || /toronto.?dominion/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/tsx/TD/") || (b.kallor?.[0]?.url ?? "").includes("/TD/"))) {
  console.error("ABORT: TD finns redan på disken");
  process.exit(1);
}

const K = {
  prisCAD: 168.66, aktierMdr: 1.64, mcap: 277.40, eps: 9.31, peKalla: 18.12,
  fwdPe: 15.58, pegKalla: 1.09, pb: 2.18, psKalla: 4.56,
  roe: 0.1283, opM: 0.3514, pretaxM: 0.3312,
  nettoTtm: 15.601, revTtm: 60.822,
  div: 4.48, divYieldKalla: 0.0266, payoutKalla: 0.4821,
  // CAD-serier, okt-slut FY2022–FY2025 (fiscalår nov–okt)
  omsSerie: [47741, 49399, 53244, 63271],
  resSerie: [17170, 10071, 8316, 19973],
  fcfSerie: [-68264, -41659, -17162, -77685],
  ocfSerie: [-66810, -39815, -14985, -75540], ocfTtm: -6633,
  capexSerie: [1454, 1844, 2177, 2145], capexTtm: 2523,
  // Segment [TTM · FY25 · FY24 · FY23 · FY22 · FY21], M CAD — med elimineringsdifferans mot totalen
  canPC: [21499, 20686, 19790, 18317, 16586, 14917],
  wealth: [15557, 14562, 13535, 11630, 11005, 10589],
  usRetail: [15488, 12305, 13713, 14290, 12280, 10758],
  wholesale: [9644, 8392, 7286, 5818, 4831, 4700],
  corporate: [2573, 11832, 2899, 635, 4330, 1729],
  segTotal: [60822, 63271, 53244, 49399, 47741, 42917],
};
const R = {
  mcapReplik: (K.aktierMdr * K.prisCAD),
  pePrisEps: K.prisCAD / K.eps,
  peGaap: K.mcap / K.nettoTtm,
  nettoM: K.nettoTtm / K.revTtm,
  divY: K.div / K.prisCAD,
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  psReplik: K.mcap / K.revTtm,
  pbReplik: 2.18,
  payoutReplik: K.div / K.eps,
  epsBeraknad: K.nettoTtm / K.aktierMdr,
  pegBas: K.fwdPe / 14.38,
};
const avv = (a, b) => Math.abs(a / b - 1);
// BANK-PROFILENS LÅS: aktiva repliker + dokumenterade NULL (källans egna n/a — RY/SAN-mallen)
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb (källrad 2,18 — eget kapital 127,02 mdr)", 277.40 / 127.02, 2.18, 0.02],
  ["ev — BANK: n/a i källan (NULL, dokumenterad)", null, null, 1],
  ["nettoM mot financials-TTM-raden 25,65 (statistics-veget 26,62 = annan bas, dokumenterad)", R.nettoM, 0.2565, 0.02],
  ["fcfM — BANK: n/a (NULL)", null, null, 1],
  ["fcfY — BANK: n/a (NULL; källrad −3,30 % dokumenterad i paranoid)", null, null, 1],
  ["divYield", R.divY, K.divYieldKalla, 0.02],
  ["de — BANK: n/a (NULL)", null, null, 1],
  ["payout", R.payoutReplik, K.payoutKalla, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings — BANK: n/a (NULL)", null, null, 1],
  ["evSales — BANK: n/a (NULL)", null, null, 1],
];
const fel = exakt.filter(([n, r, k, tol]) => r !== null && k !== null && avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r?.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}
const nullAntal = exakt.filter(([n, r]) => r === null).length;
if (nullAntal !== 6) { console.error(`ABORT: bank-NULL-profilen avviker (väntade 6, fick ${nullAntal})`); process.exit(1); }
// P/E-familjen
if (!(R.peGaap > K.peKalla - 1 && R.peGaap < K.peKalla + 1)) {
  console.error(`ABORT: P/E-familjen utanför spann (GAAP ${R.peGaap.toFixed(2)})`);
  process.exit(1);
}
// PEG-basen dokumenterad: fwd P/E / konsensus 3Y EPS-tillväxt = 15,58/14,38 = 1,08 ≈ källans 1,09
if (avv(R.pegBas, K.pegKalla) > 0.02) { console.error(`ABORT: PEG-basen avviker (${R.pegBas.toFixed(3)} vs ${K.pegKalla})`); process.exit(1); }
// FCF-IDENTITET (bank: negativa värden, men OCF−capex låser exakt — RY-precedensens dokumentation)
const fcfIdent = [];
for (let i = 0; i < 4; i++) fcfIdent.push([K.ocfSerie[i] - K.capexSerie[i], K.fcfSerie[i]]);
fcfIdent.push([K.ocfTtm - K.capexTtm, -9156]);
if (fcfIdent.some(([a, b]) => Math.abs(a - b) > 0.001)) {
  console.error("ABORT: FCF-serien ej OCF−capex-låst: " + fcfIdent.map(([a, b]) => `${a}≠${b}`).join("; "));
  process.exit(1);
}
// Segmentdifferansen — dokumenterad (källans segmentvy exkluderar inte elimineringsposter konsekvent)
const segNycklar = ["canPC", "wealth", "usRetail", "wholesale", "corporate"];
const diff = K.segTotal.map((x, i) => segNycklar.reduce((s, k) => s + K[k][i], 0) - x);
const vantaDiff = [3939, 4506, 3979, 1291, 1291, -224];
if (!diff.every((d, i) => d === vantaDiff[i])) {
  console.error("ABORT: segmentdifferansen avviker från dokumenterad: " + diff.join(", "));
  process.exit(1);
}
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
if (!(R.nettoM < K.pretaxM && K.pretaxM < K.opM)) { console.error("ABORT: normal kaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "TD",
  namn: "The Toronto-Dominion Bank",
  bransch: "finans",
  land: "Kanada",
  valuta: "CAD",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tsx/TD/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "TSX-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 168,66 CAD; 50/200-dagars MA 168,67/148,31 — priset PÅ 50-MA ÖVER 200-MA; 52v +54,81 % = VÄNDNINGENS ÅR; RSI 49,8; short 2,82 %); färskhämtning med FYRA paneler; FISCALÅR NOV–OKT (31 okt; TTM-fönstret = jul '26 efter Q3-rapporten 2026-08-27 — KVARTALSVIS; nästa Q4/årsredovisning est. dec 2026, UTANFÖR v172-fönstret); TSX/CAD-PRECEDENSEN (BCE/NTR/ENB-klassen; RY:s USD/NYSE-pris 202,29 = dokumenterad historisk avvikelse i cellen): " +
    "pris 168,66 CAD (beta 0,87), mcap 277,40 mdr CAD på 1,64 mdr aktier (replik 1,64×168,66 = 276,60 — 0,3 %, aktieavrundning) — RY (281 mdr USD-noterad ≈ 289 mdr CAD) + TD (277 mdr) = UNIVERSALBANKENS TVILLINGAR MED OLIKA BOTTNAR: RY wealth-tyngd (förvaltning 22,4 mdr = största segmentet) + TD retail-tyngd (Canadian P&C 21,5 + US Retail 15,5 = detaljhandelsbanken med USA-expansion); " +
    "P/E-FAMILJEN DOKUMENTERAD: källrad 18,12 · GAAP 277,40/15,601 = 17,78 · pris/EPS 168,66/9,31 = 18,11 (0,06 % EXAKT); EPS-raden 9,31 mot beräknad netto/aktier 9,51 — aktieavrundningsbas; fwd P/E 15,58 ⇒ implied EPS +16 % (konsensusreferens); PEG-KÄLLRAD 1,09 MED DOKUMENTERAD BAS: fwd 15,58/konsensus 3Y EPS 14,38 % = 1,08 (avrundning) — fältet SATT (RY 1,75/SAN 0,46-precedensen); PS 4,56 EXAKT (277,40/60,82) · P/B 2,18 EXAKT (277,40/127,02) · P/TBV 2,74 (tangible-basen — bankens eget mått); " +
    "BANK-NULL-PROFILEN (källans egna n/a — RY/SAN-mallen): EV n/a · EV/Earnings n/a · EV/Sales n/a · EV/EBIT n/a · D/E n/a · räntetäckning n/a · current ratio n/a · FCF-mått n/a (FCF-yield-källrad −3,30 % dokumenterad) — balansräkningens natur: KASSA 633,4 mdr · SKULD 533,4 mdr · NETTOKASSA +100,0 mdr (+60,83/aktie; insättningsverksamheten är balansen, inte nettoskuld-logik); working capital −827 mdr (bankens rörelsekapital = insättningar i rörelse); " +
    "SEGMENTBILDEN (fem ben, [TTM · FY25 · FY24 · FY23 · FY22 · FY21] M CAD): Canadian P&C [21 499 · 20 686 · 19 790 · 18 317 · 16 586 · 14 917] (STÖRST — hemmamarknadens detaljbank) + Wealth & Insurance [15 557 · 14 562 · 13 535 · 11 630 · 11 005 · 10 589] + US Retail [15 488 · 12 305 · 13 713 · 14 290 · 12 280 · 10 758] (andra benet — US-expansionen) + Wholesale [9 644 · 8 392 · 7 286 · 5 818 · 4 831 · 4 700] + Corporate [2 573 · 11 832 · 2 899 · 635 · 4 330 · 1 729] — ELIMINERINGSDIFFERANSEN DOKUMENTERAD (källans segmentvy brutto mot koncern-total nett0): [TTM +3 939 · FY25 +4 506 · FY24 +3 979 · FY23 +1 291 · FY22 +1 291 · FY21 −224] — segmentLÅS EJ exakt tillämpligt (PSON-modellen tillämpas striktare: differansen redovisas, inget falskt exakthetslås); CORPORATE-SPIKEN FY25 11 832 (mot 635 FY23) = AML-uppgörelsens och Schwab-posternas hem — engångslastat år; " +
    "VÄNDNINGSPROFILEN — FY23-24-KOLLAPSEN DOKUMENTERAD: netto [17 170 · 10 071 · 8 316 · 19 973] + TTM 15 601 (EPS [9,47 · 5,52 · 4,72 · 11,56] + TTM 9,31) — kollapsen −51 % FY23 (AML-programförbiseendena: 3,1 mdr USD-uppgörelsen med amerikanska myndigheter 2024 + Schwab-andelens värdeförluster) följt av FY25-VÄNDNINGEN +140 % (engångstung: Corporate-spirken + Schwab-avyttring) och TTM-NORMALISERINGEN 15 601 (det löpande läget); netto-CAGR +5,2 % FY22→25 (låg-bas-not: kollapsåren mitt i serien — redovisas med sin natur); oms [47 741 · 49 399 · 53 244 · 63 271] + TTM 60 822 (CAGR +9,84 %; TTM −4,12 % = FY25-engångsomsättningen rullar ur fönstret); " +
    "FCF-SERIEN NEGATIV = BANKENS NATUR (RY-precedensen): [−68 264 · −41 659 · −17 162 · −77 685] + TTM −9 156 — IDENTITETSLÅST EXAKT FEM FÖNSTER (OCF−capex: [−66 810−1 454 · −39 815−1 844 · −14 985−2 177 · −75 540−2 145 · −6 633−2 523]) — bankens driftskassa rör låneboken, inte ägarutdelning; FY21 var POSITIVT +55 494 (bokningsmässigt); " +
    "ÅTERKÖPSMASKINEN + UTDELNINGEN = TVÅ BEN: Repurchase [−10 859 · −13 047 · −12 244 · −15 206 · −19 300] TTM −22 169 (kraftigast i universumets bank-rad — 8,0 % av mcap brutto) mot aktieprogrammens Issuance [+10 889 · +11 021 · +8 060 · +11 376 · +13 293] TTM +12 979 — NETTO-MINSKNING av aktiebasen varje år: aktieantal −3,68 % YoY = buyback-yield EXAKT · shareholder yield 6,34 %; Total Dividends [−5 555 · −6 665 · −5 825 · −7 160 · −7 663] TTM −7 804 — 15 RAKA HÖJNINGSÅR (+4,76 % senaste); current 4,48 CAD (2,66 % EXAKT replik 4,48/168,66); payout-källrad 48,21 % (replik 4,48/9,31 = 48,12 % — 0,2 %); preferens-posterna dokumenterade (Utfärdade +4 855 · Inlösen −2 812 TTM); " +
    "LÖNSAMHET: ROE 12,83 % (mot RY 16,21 — tvillingarnas gap: TD:s kollaps-åtstramning mot RY:s jämnare bana) · ROA 0,78 % · WACC 3,08 % (bankens långa skuldbas) · skattesats 19,64 % · institutionsägande 56,69 %; marginalkaskaden TTM: netto-M 25,65 % EXAKT (financials-TTM-raden; statistics-veget 26,62 % = annan fönsterbas, dokumenterad) < pretax-M 33,12 % < operating-M 35,14 % (normal kaskad — engångskontrollen; FY23-24 = kollapsår med AML/Schwab-poster i Corporate, dokumenterat); balansserier M CAD [FY21–FY25]: kassa [530,7 · 548,0 · 546,2 · 635,3 · 661,8] · skuld [315,4 · 386,8 · 437,6 · 492,4 · 531,6] · nettokassa [+215,3 · +161,1 · +108,6 · +142,9 · +130,1] nu +100,0; Altman n/a (bank — källan beräknar ej) · Piotroski visas ej; " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Kanada/finans-cellens TVÅ universalbanksprofiler: RY (wealth/capital-markets-tyngd, jämnast) + TD (retail-tyngd med US Retail 15,5 mdr = expansionens bottnar + vändningsåret 52v +54,8 %): duon speglar Kanadas bankoligopol från två sidor; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 15,601 mdr CAD > 0; Sony/Honda-doktrinen); finans-cellen 1→2, Kanada 11→12; nästa rapport Q4 est. dec 2026 (UTANFÖR v172-fönstret — kalendernotis)." }],
  hamtat: "2026-09-25",
  pris: K.prisCAD,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: -0.0412,
    prognosTillvaxt: 0.0693,
  },
  lonksamhet: {
    roe: K.roe, roic: null, bruttoMarginal: null, ebitMarginal: K.opM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: null,
  },
  stabilitet: {
    skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 5,
  },
  aterkop: { senasteArMdr: 9.19, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: null, peg: K.pegKalla, fcfYield: null, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e6),
  },
  notering:
    "cellmotiverad duo (Kanada/finans 1→2: RY wealth-tyngda universalbanken + TD retail-tyngda detaljhandelsbanken med US Retail 15,5 mdr — tvillingarna med olika bottnar, Kanadas bankoligopol från två sidor); kollisionskontroll primär+sekundär GRÖN (TD/TD.TO+namn+URL); TSX/CAD-precedensen (BCE/NTR/ENB-klassen; RY:s USD/NYSE = dokumenterad historisk avvikelse); fiscalår nov–okt, kvartalsvis (TTM = jul '26; Q4 est. dec 2026 UTANFÖR v172); VÄNDNINGSPROFILEN: netto [17 170 · 10 071 · 8 316 · 19 973] + TTM 15 601 — FY23-24-kollapsen (AML-uppgörelse 3,1 mdr USD + Schwab-förluster, i Corporate-segmentet) + FY25-vändning +140 % (engångstung) + TTM-normalisering; 52v +54,81 %; P/E-familjen 18,12/17,78/18,11; PEG 1,09 med dokumenterad bas (fwd 15,58/14,38); PS/P/B EXAKTA; BANK-NULL-PROFIL (källans n/a — RY/SAN-mallen): EV/D/E/räntetäckning/FCF-mått NULL; kassa 633/skuld 533 mdr = insättningsbalansen; SEGMENTBILDEN fem ben med DOKUMENTERAD elimineringsdifferans [+3 939 · +4 506 · +3 979 · +1 291 · +1 291 · −224] — inget falskt exakthetslås; Corporate-spirken FY25 11 832 = engångsposternas hem; FCF-serien negativ = bankens natur (identitetslåst exakt fem fönster; RY-precedensen); ÅTERKÖPSMASKINEN TTM −22,2 mdr (8,0 % av mcap brutto) mot aktieprogram +13,0 = netto −3,68 % aktiebas EXAKT · 15 raka utdelningshöjningar (4,48 CAD, 2,66 % EXAKT; payout 48,21); ROE 12,83 mot RY 16,21 (tvillinggapet); netto-M 25,65 % EXAKT mot financials-TTM (statistics-veget 26,62 = annan bas dokumenterad); EK-serie saknas; alla repliker i paranoid (StockAnalysis TSX 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "TD") { console.error("ABORT: sista raden ≠ TD"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Toronto-Dominion TD, Kanada/finans 1→2; finans-cellen → ${slut.filter((b) => b.bransch === "finans").length}; Kanada → ${slut.filter((b) => b.land === "Kanada").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `BANK-LÅS (TRETTON): mcap 0,3 % · PS 4,56 EXAKT · P/B 2,18 EXAKT · netto-M 25,65 % EXAKT (financials-TTM-raden; statistics-veget 26,62 dokumenterad annan bas) · divY 2,66 % EXAKT · payout 0,2 % · P/E pris/EPS 0,06 % EXAKT + SEX DOKUMENTERADE NULL (EV/evEarnings/evSales/D-E/fcfM/fcfY — källans n/a, RY/SAN-mallen); P/E-familjen 18,12/17,78/18,11; PEG 1,09 med dokumenterad bas (15,58/14,38 = 1,08)`,
  `SEGMENTBILDEN: fem ben [21 499 · 15 557 · 15 488 · 9 644 · 2 573] TTM — ELIMINERINGSDIFFERANSEN DOKUMENTERAD [+3 939 · +4 506 · +3 979 · +1 291 · +1 291 · −224] (inget falskt exakthetslås); Corporate-spirken FY25 11 832 = AML/Schwab-posternas hem`,
  `VÄNDNINGSPROFILEN: netto [17 170 · 10 071 · 8 316 · 19 973] + TTM 15 601 (FY23-24 AML-kollaps −51 %; FY25 +140 % engångstung; TTM normaliserat); oms-CAGR +9,84 %; 52v +54,81 %`,
  `FCF-SERIEN NEGATIV (bankens natur, RY-precedensen): [−68 264 · −41 659 · −17 162 · −77 685] + TTM −9 156 — IDENTITETSLÅST EXAKT fem fönster`,
  `ÅTERKÖPSMASKINEN TTM −22,2 mdr (8,0 % brutto) mot aktieprogram +13,0 = netto −3,68 % EXAKT · 15 raka utdelningshöjningar (4,48 CAD, 2,66 % EXAKT) · ROE 12,83 %`,
  `P/E-BÄRARKONTROLL: TTM-netto 15,601 mdr CAD > 0 — GRÖN · Q4-rappdag est. dec 2026 (UTANFÖR v172-fönstret)`,
);
writeFileSync("/tmp/r231-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
