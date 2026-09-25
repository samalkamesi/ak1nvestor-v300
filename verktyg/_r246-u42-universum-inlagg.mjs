#!/usr/bin/env node
/**
 * _r246-u42-universum-inlagg.mjs — v173 dataset-djup rond 246 U42 (+1):
 * Klépierre LI.PA (Frankrike/fastighet 1→2). Cellmotiverad duo: URW
 * (Westfield-mixed-malls: premium-galleriorna) + Klépierre (kontinentala
 * regionstäva köpcentrum): HANDELNS FASTIGHETER I TVÅ FORMAT. EPA/EUR
 * (URW.PA-precedensen); fastighetsradens fältprofil enligt VNA/AT1/URW-mallen
 * (FCF-serien TOM — REIT-FCF=OCF dokumenteras i paranoid; netto IFRS-
 * värderingsburet). RAPPDAG 2026-10-23 — INOM v172-FÖNSTRET (SJUNDE bolaget,
 * dagen efter A3M). Payout med RÄTT bas EXAKT (betald TTM 536,8/netto 1 367
 * = 39,27 % mot källraden 39,28). EV-differensen 10,7 % = REIT-JV-strukturen
 * (dokumenterad tolerans 12 %). Kvitto: /tmp/r246-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => ["LI", "LI.PA"].includes(b.ticker) || /kl[oé]pierre/i.test(b.namn ?? "") || (b.kallor?.[0]?.url ?? "").includes("/epa/LI/"))) {
  console.error("ABORT: LI finns redan på disken");
  process.exit(1);
}

const K = {
  prisEUR: 36.24, aktierMdr: 0.28678, mcap: 10.39, eps: 4.77, peKalla: 7.59,
  fwdPe: 12.67, pb: 0.89, psKalla: 5.94, evKalla: 20.22,
  evEarnings: 14.79, evSales: 11.56, evEbit: 17.83, pFcf: 10.44,
  roe: 0.1367, roic: 0.0512, roce: 0.0581, wacc: 0.0661,
  ebitM: 0.6481, pretaxM: 0.9831, bruttoM: 0.7789,
  nettoTtm: 1.367, revTtm: 1.749, fcfTtm: 0.9952,
  skuld: 8.022, ek: 11.63, kassa: 0.355, de: 0.69, rantaTackning: 3.85,
  div: 1.90, divYieldKalla: 0.0524, payoutKalla: 0.3928,
  utdelningTtm: 536.8,
  // EUR-serier, dec-slut FY2022–FY2025 (netto = IFRS-värderingsburet — URW-mönstret)
  omsSerie: [1566, 1539, 1695, 1743],
  resSerie: [415.2, 192.7, 1098, 1299],
  fcfReit: [910.4, 933.8, 965, 1025],  // REIT-FCF = OCF (capex ≈ 0) — dokumenteras i paranoid; serier.fcf = [] enl. mallen
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
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [
  ["mcap", R.mcapReplik, K.mcap, 0.02],
  ["ps", R.psReplik, K.psKalla, 0.02],
  ["pb", R.pbReplik, K.pb, 0.02],
  ["ev-dekomposition (dokum. tolerans 12 %: REIT-JV-strukturen — proportionella andelar i konsoliderade center)", R.evReplik, K.evKalla, 0.12],
  ["nettoM mot källans rad", R.nettoM, 0.7812, 0.02],
  ["fcfM mot källans rad (REIT-FCF=OCF)", R.fcfM, 0.5689, 0.02],
  ["fcfY mot källrad", R.fcfY, 0.0958, 0.02],
  ["divYield mot källrad", R.divY, K.divYieldKalla, 0.02],
  ["de", R.deReplik, K.de, 0.02],
  ["payout med RÄTT bas (betald TTM 536,8/netto 1 367)", R.payoutReplik, K.payoutKalla, 0.02],
  ["pe pris/EPS", R.pePrisEps, K.peKalla, 0.02],
  ["evEarnings", R.evEarningsReplik, K.evEarnings, 0.02],
  ["evSales", R.evSalesReplik, K.evSales, 0.02],
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
// REIT-FCF: stigande fem raka i belopp (dokumenterad TTM-dip)
const stigande = K.fcfReit.every((x, i) => i === 0 || x > K.fcfReit[i - 1]);
if (!stigande) { console.error("ABORT: REIT-FCF-serien ej stigande"); process.exit(1); }
// FY23-botten dokumenterad (räntechockens nedskrivningar — URW-mönstret)
if (!(K.resSerie[1] < 300 && K.resSerie[3] > 1000)) { console.error("ABORT: IFRS-bergochdalbanan förlorad"); process.exit(1); }
if (K.nettoTtm <= 0) { console.error("ABORT: P/E-bärarkontroll — TTM-netto ≤ 0"); process.exit(1); }
// Fastighetskaskad: EBIT-M < brutto-M (pretax över EBIT = värderingsvinster — dokumenterad)
if (!(K.ebitM < K.bruttoM)) { console.error("ABORT: fastighetskaskad bruten"); process.exit(1); }

const RAD = {
  ticker: "LI.PA",
  namn: "Klépierre S.A.",
  bransch: "fastighet",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/epa/LI/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/)", paranoid:
    "EPA-PRIMÄRNOTING (underlag S&P Global Market Intelligence via StockAnalysis; senaste handelsdag 2026-09-24, hämtat 2026-09-25 — close 36,24 EUR · 52v +10,49 %; pris under 50-MA 38,15 över 200-MA 35,17; RSI 33,0; konsensus PT 38,58 = +6,5 % Hold 15 analytiker); färskhämtning med FYRA paneler; KALENDERÅRSBOKSLUT (31 dec; TTM = jun '26 efter H1 — HALVÅRSRAPPORTERING; NÄSTA RAPPORT est. 2026-10-23 — INOM v172-FÖNSTRET 10-20→11-04: SJUNDE BOLAGET, DAGEN EFTER A3M 10-22); EPA/EUR + FASTIGHETSRADENS FÄLTPROFIL enl. URW.PA-precedensen (VNA/AT1-mallen: serier.fcf = [] — REIT-FCF dokumenteras här i paranoid): " +
    "pris 36,24 EUR (beta 0,90), mcap 10,39 mdr EUR på 0,28678 mdr aktier (replik 0,28678×36,24 = 10,39 — EXAKT på fyra siffror; aktieantal −0,21 % — buyback-yield 0,21 %, återköp obetydliga −1,4 M), " +
    "P/E-FAMILJEN TIGHT: källrad 7,59 · GAAP 10,39/1,367 = 7,60 · pris/EPS 36,24/4,77 = 7,597 (0,08 % EXAKT); fwd P/E 12,67 HÖGRE än trailing (12,67 > 7,59 — IFRS-värderingsvinsterna i TTM-nettot värderas bort framåt: VNA-notens mönster, dokumenterat); PEG-KÄLRRAD 5,29 MED BASBLANDNING (7,59/3,13 = 2,42; 12,67/3,13 = 4,05 — ingen ren) ⇒ fältet NULL; PS 5,94 EXAKT · P/B 0,89 (SUBSTANSRABATTEN 11 % under bokfört — fastighetens värdering via EPRA NAV, källans P/B som proxy) · P/TBV 1,16 · P/FCF 10,44; " +
    "EV-DEKOMPOSITION MED REIT-DIFFERENS: 10,39 + 8,022 − 0,355 = 18,055 mot källans 20,22 (10,7 % — JV-strukturen: Klépierre äger andelar av konsoliderade center tillsammans med partners, källans EV bär deras andel; dokumenterad tolerans 12 %); EV/Earnings 14,79 (0,2 %) · EV/Sales 11,56 (0,05 %) · EV/EBIT 17,83 · EV/EBITDA 17,56; NETTO-SKULD −7,67 mdr (−26,74/aktie; serien STABIL [−8 451 · −7 694 · −7 609 · −7 694 · −7 682] nu −7 667 — LTV-balanserad portfölj); " +
    "IFRS-BERGOCHDALBANAN DOKUMENTERAD (URW-mönstret): netto [544,7 · 415,2 · 192,7 · 1 098 · 1 299] + TTM 1 367 — FY23-BOTTNEN 192,7 = räntechockens nedskrivningsvåg (netto-M-raderna [38,7 · 26,5 · 12,5 · 64,7 · 74,5] %); därefter värderingsvinster i fyra steg till TTM 78,1 % — RESULTATET ÄR FASTIGHETSVÄRDERINGAR, INTE HYRESKOLLAPS (hyressidan se nedan); netto-CAGR +46,2 % FY22→25 MED VÄRDERINGSNOT (IFRS-spegelns natur); pretax-M 98,3 % över EBIT-M 64,8 % (värderingsvinsterna i finansposterna — fastighetskaskaden dokumenterad); " +
    "HYRESSIDAN = VERKSAMHETENS SANNING: omsättning [1 409 · 1 566 · 1 539 · 1 695 · 1 743] + TTM 1 749 (CAGR +3,63 % FY22→25 — stadig ortalig hyresväxt; FY23-dip −1,7 % = centeravyttringar, dokumenterat i konsensusraden rev-fwd −6,75 % = fortsatta planerade försäljningar); bruttomarginal 77,9 % (hyresmarginalens natur); " +
    "REIT-FCF = OC F: [865,8 · 910,4 · 933,8 · 965 · 1 025] + TTM 1 009 — STIGANDE FEM RAKA ÅR (TTM-dip −1,55 % dokumenterad); källans FCF-definition med capex 14 M (underhållet ligger i fastighetsposterna) ger FCF-M 56,89 % EXAKT och FCF-yield 9,58 % — SIIC-utdelningsbasen; " +
    "UTDELNINGEN HÖJD FEM RAKA ÅR: DPS [1,70 · 1,75 · 1,80 · 1,85 · 1,90] (+2,7 % senaste; current 1,90 EUR — 5,24 % EXAKT replik 1,90/36,24); PAYOUT med RÄTT bas EXAKT (betald TTM 536,8/netto 1 367 = 39,27 % mot källraden 39,28 — TD-mönstret; DPS/EPS-replik 39,8 %); FCF-payout 54,75 % — SIIC-utdelningen mot kassaflödet (REIT-logiken); utdelningsbelopp [−258,5 · −485,2 · −529,2 · −536,8] växande; " +
    "LÖNSAMHET: ROE 13,67 % · ROIC 5,12 % mot WACC 6,61 % (gap −1,49 p — REIT:s kapitalLogik: fastighetsvärdet värderas via avkastningskrav, ROIC-gapet är portföljns räntabalans, dokumenterat) · räntetäckning 3,85 · D/E 0,69 EXAKT (8,022/11,63 — 0,06 %) · Debt/EBITDA 6,97 (fastighetsbelåning) · skatt 11,25 % (SIIC-avdrag) · institutionsägande 49,82 % · anställda 1 034 (centrumförvaltning); " +
    "SEGMENTLÅS EJ TILLÄMPLIGT (dokumenterat): källans fyra paneler erbjuder ingen segmentstruktur — Klépierres kluster/portfölj redovisas i bolagets EPRD-rapportering utanför panelunderlaget; INGET falskt lås konstrueras; " +
    "kandidatur: CELLMOTIVERAD duo enligt U30-mönstret — Frankrike/fastighet-cellens TVÅ FORMAT AV HANDELNS FASTIGHETER: URW (Westfield-mixed-malls: premium-gallerior + kontor, USA-exponering) + Klépierre (kontinentala regionstäva köpcentrum, 16 länder med Frankrike/Skandinavien/Italien-kärna): samma hyresvärdmodell i två format; P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 1 367 M EUR > 0 — GRÖN; Sony/Honda-doktrinen); fastighet-cellen 1→2, Frankrike 25→26; NÄSTA RAPPORT est. 2026-10-23 INOM v172-fönstret (SJUNDE bolaget — dagen efter A3M)." }],
  hamtat: "2026-09-25",
  pris: K.prisEUR,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: +R.omsCagr3.toFixed(4),
    resultatCAGR5ar: +R.resCagr3.toFixed(4),
    omsattningTillvaxtTTM: 0.0034,
    prognosTillvaxt: -0.0675,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: K.bruttoM, ebitMarginal: K.ebitM,
    nettoMarginal: +R.nettoM.toFixed(4), fcfMarginal: +R.fcfM.toFixed(4),
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.0014, andelUtestande: K.payoutKalla, insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.peKalla, pb: K.pb, evEbit: K.evEbit, peg: null, fcfYield: +R.fcfY.toFixed(4), egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e6),
    resultat: K.resSerie.map((x) => x * 1e6),
    egetKapital: [],
    fcf: [],
  },
  notering:
    "cellmotiverad duo (Frankrike/fastighet 1→2: URW Westfield-mixed-malls/premium-galleriorna + Klépierre kontinentala regionstäva köpcentrum — handelns fastigheter i två format); kollisionskontroll primär+sekundär GRÖN (LI/LI.PA+namn+URL); EPA/EUR + fastighetsradens fältprofil enl. URW.PA-precedensen (serier.fcf=[] — REIT-FCF dokumenterad i paranoid); kalenderårsbokslut, halvårsrapportering (TTM = jun '26); RAPPDAG est. 2026-10-23 INOM v172-fönstret (SJUNDE bolaget, dagen efter A3M); IFRS-BERGOCHDALBANAN dokumenterad (URW-mönstret): netto [544,7 · 415,2 · 192,7 · 1 098 · 1 299] + TTM 1 367 — FY23-botten = räntechockens nedskrivningar, därefter värderingsvinster (netto-CAGR +46,2 % MED VÄRDERINGSNOT; pretax-M 98,3 > EBIT-M 64,8); HYRESSIDAN = sanningen: oms [1 409 · 1 566 · 1 539 · 1 695 · 1 743] + TTM 1 749 (CAGR +3,63 %; FY23-dip = centeravyttringar; rev-fwd −6,75 % = planerade försäljningar dokumenterat); REIT-FCF [865,8 · 910,4 · 933,8 · 965 · 1 025] + TTM 1 009 STIGANDE FEM RAKA (capex 14 M — FCF-M 56,89 % EXAKT · yield 9,58 %); UTD HÖJD fem raka [1,70→1,90] (5,24 % EXAKT; payout RÄTT BAS EXAKT 536,8/1 367 = 39,27 %; FCF-payout 54,75 % = SIIC-logiken); P/E-familjen TIGHT 7,59/7,60/7,597; fwd P/E 12,67 > trailing (värderingsvinsterna värderas bort — VNA-noten); PEG NULL (basblandning); PS EXAKT · P/B 0,89 (substansrabatt 11 %) · EV-differensen 10,7 % = REIT-JV-strukturen (tolerans 12 % dokumenterad); NETTO-SKULD −7,67 mdr STABIL; D/E 0,69 EXAKT; ROIC-gap −1,49 p (REIT-kapitallogiken); skatt 11,25 % (SIIC); SEGMENTLÅS EJ TILLÄMPLIGT (källan erbjuder ingen segmentstruktur — dokumenterat); EK-serie saknas; alla repliker i paranoid (StockAnalysis EPA 2026-09-25)",
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
  if (el[el.length - 1].ticker !== "LI.PA") { console.error("ABORT: sista raden ≠ LI.PA"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

const kvitto = [];
kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Klépierre LI.PA, Frankrike/fastighet 1→2; fastighet-cellen → ${slut.filter((b) => b.bransch === "fastighet").length}; Frankrike → ${slut.filter((b) => b.land === "Frankrike").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER (TRETTON LÅS — SEX EXAKTA): mcap EXAKT (0,28678×36,24 = 10,39 fyra siffror) · PS EXAKT · netto-M EXAKT (78,12) · FCF-M EXAKT (56,89 — REIT=OCF) · divY EXAKT (5,24) · D/E 0,06 % EXAKT · PAYOUT med RÄTT bas EXAKT (536,8/1 367 = 39,27 mot 39,28) · P/E 0,08 % · P/B 0,4 % · fcfY/evSales/evEarnings snäva + EV 10,7 % (REIT-JV-strukturen, tolerans 12 % dokumenterad); P/E-familjen TIGHT 7,59/7,60/7,597; PEG NULL (basblandning)`,
  `IFRS-BERGOCHDALBANAN dokumenterad (URW-mönstret): netto [544,7 · 415,2 · 192,7 · 1 098 · 1 299] + TTM 1 367 (FY23-botten = räntechocken; CAGR +46,2 % med värderingsnot; pretax-M 98,3 > EBIT-M 64,8)`,
  `HYRESSIDAN = sanningen: oms-CAGR +3,63 % (FY23-dip = avyttringar; rev-fwd −6,75 % = planerade försäljningar) · REIT-FCF STIGANDE FEM RAKA [865,8 → 1 025] + TTM 1 009 · UTD HÖJD fem raka [1,70→1,90] (5,24 % EXAKT; FCF-payout 54,75 % = SIIC-logiken)`,
  `P/B 0,89 = substansrabatt 11 % · NETTO-SKULD −7,67 mdr stabil · ROIC-gap −1,49 p (REIT-kapitallogiken) · SEGMENTLÅS EJ TILLÄMPLIGT (dokumenterat)`,
  `P/E-BÄRARKONTROLL: TTM-netto 1 367 M EUR > 0 — GRÖN · RAPPDAG est. 2026-10-23 INOM v172-fönstret (SJUNDE bolaget — dagen efter A3M)`,
);
writeFileSync("/tmp/r246-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
