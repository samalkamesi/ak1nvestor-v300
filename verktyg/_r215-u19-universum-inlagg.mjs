#!/usr/bin/env node
/**
 * _r215-u19-universum-inlagg.mjs — v173 dataset-djup rond 215 U19 (+1):
 * Tokyo Gas 9531.T (Japan/energi 1→2) — cellmotiverad duo: INPEX (olje/gas-
 * producent) + Tokyo Gas (reglerad distributör/LNG-terminaler) = cellens två
 * modeller. P/E-bärarkontroll FÖRE leverans (TTM-netto 138 mdr JPY > 0 — GRÖN);
 * kollisionskontroll exakt-match GRÖN. VÅGENS SJUNDE BROTTSFRIA RAD.
 * Källans basvister (P/E adjusted, netto-M-fönster, PS-rad) dokumenterade.
 * Kvitto: /tmp/r215-inlagg.txt
 */
import { readFileSync, writeFileSync } from "node:fs";

const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const FÖRE = u.length;
if (u.some((b) => b.ticker === "9531.T" || /tokyo gas/i.test(b.namn ?? ""))) {
  console.error("ABORT: 9531.T finns redan på disken");
  process.exit(1);
}

const K = {
  pris: 3345.0, aktierMdr: 930, mcap: 3108, pe: 14.9, fwdPe: 13.2,
  pb: 0.89, evEbit: 10.4, pFcf: 12.3, pegKalla: 4.9,
  roe: 0.061, roic: 0.037, wacc: 0.048, ebitM: 0.050,
  nettoTtm: 138, revTtm: 3004, nettoMKalla: 0.024,
  fcf: 253, de: 0.88, rantaTackning: 5.0, altman: 1.7, piotroski: 6, beta: 0.3,
  div: 82,
  omsSerie: [2391, 2570, 2929, 2961],   // mdr JPY, mars-slut FY2022–FY2025
  resSerie: [84, 91, 115, 124],
  fcfSerie: [171, 168, 216, 261],
};
const R = {
  mcap: (K.aktierMdr * K.pris) / 1000,
  epsGaap: (K.nettoTtm * 1000) / K.aktierMdr,
  peGaap: K.pris / ((K.nettoTtm * 1000) / K.aktierMdr),
  nettoM: K.nettoTtm / K.revTtm,
  fcfY: K.fcf / K.mcap,
  prognos: K.pe / K.fwdPe - 1,
  peg: K.pe / ((K.pe / K.fwdPe - 1) * 100),
  omsCagr3: Math.pow(K.omsSerie[3] / K.omsSerie[0], 1 / 3) - 1,
  resCagr3: Math.pow(K.resSerie[3] / K.resSerie[0], 1 / 3) - 1,
  payoutReplik: K.div / ((K.nettoTtm * 1000) / K.aktierMdr),
};
const avv = (a, b) => Math.abs(a / b - 1);
const exakt = [["mcap", R.mcap, K.mcap, 0.02], ["fcfY", R.fcfY, 1 / K.pFcf, 0.02]];
const fel = exakt.filter(([n, r, k, tol]) => avv(r, k) > tol);
if (fel.length) {
  console.error("ABORT: replik utanför tolerans: " + fel.map(([n, r, k]) => `${n} ${r.toFixed(4)} vs ${k}`).join("; "));
  process.exit(1);
}

const PARANOID =
  "TYO-PRIMÄRNOTING i JPY (1605.T/6501.T-precedensens Tokyo-rad; underlag S&P Global Market Intelligence + Fiscal.ai via StockAnalysis; intradag 2026-09-25 delayed +0,4 %; färshämtning direkt med cache-bypass + kompletterande FY-panel; MARS-BOKSLUT, etikett = slutår): " +
  "pris 3 345 JPY (beta 0,3 — vågens lugnaste), mcap 3 108 mdr JPY på 930 M aktier (replik 930 × 3 345 = 3 111 — 0,1 %), " +
  "P/E 14,9 ur källan på dess justerade EPS-bas 224,5 (GAAP-aktiebasrepliken 3 345/148,4 = 22,5 — gasdistributörens förråds-/engångsjusteringar gör basgapet stort; dokumenterad, Hitachi-klassens not) mot forward P/E 13,2 ⇒ prognosTillväxt +12,88 % (trailing/fwd-modellen, MUFG-konventionen; spår-PEG 14,9/12,88 = 1,16 mot källans PEG 4,9 på 3-års, kalibreringsnot), P/B 0,89 (UNDER bokfört värde — reglerad distributörens klassiska låga multiplar; dokumenterat som profil) · EV/EBIT 10,4 · källans netto-M-rad 2,4 % bär annat fönster (aktiebasrepliken 138/3 004 = 4,59 % TTM är seriekonsistent — fältet bär repliken, Hitachi-mönstret) · källans PS-rad 0,52 avviker stort mot repliken 3 108/3 004 = 1,03 (dokumenterad källavvikelse; PS ingår ej i radens fält), " +
  "ROE 6,1 % · ROIC 3,7 % under WACC 4,8 % (REGLERAD NÄTMETODNOT — distributionsnätets tillgångsbas bär avkastningsformeln, Redeia-konventionen) · EBIT-marginal 5,0 % (distributörens volymbranssmarginal) · FCF-yield EXAKT replik (253/3 108 = 8,14 % = 1/P·FCF 1/12,3 = 8,13 %); " +
  "balans: D/E 0,88 · räntetäckning 5,0 · Altman 1,7 (KÄLLANS VARNINGSZON — reglerat nätverk med tung infrastrukturbas, Redeia/Cellnex-metodnot-klassen; datafakta) · Piotroski 6; " +
  "utdelning 82 JPY/aktie (2,45 %) ⇒ senasteArMdr 76 (82 × 930) med payout-rad saknad i utdraget (GAAP-replik 55,3 % med not); " +
  "FY-SERIEN mars-slutande (mdr JPY): oms [2 391 · 2 570 · 2 929 · 2 961] · netto [84 · 91 · 115 · 124] · FCF [171 · 168 · 216 · 261] — VÅGENS SJUNDE BROTTSFRIA RAD: samtliga positiva och NETTO/EPS STIGANDE VARJE ÅR (84→91→115→124; rak CAGR oms +7,38 % · netto +13,86 % — energiprisnormaliseringen + LNG-terminaldiversifieringen); EPS-GAAP-serien [90,0 · 97,7 · 123,5 · 132,4]; " +
  "analytikerläge saknas i panelutdraget — ingen målkurs förs in; NÄSTA RAPPORT Q2 FY2026 est. tidigt november — v172-könotis v45; " +
  "kandidatur: CELLMOTIVERAD duo enligt U13-mönstret — Japan/energi-cellens TVÅ affärsmodeller: INPEX (1605.T, olje/gas-PRODUCENT) + Tokyo Gas (9531.T, reglerad DISTRIBUTÖR med LNG-terminaler) — cellens pedagogiska kontrast (råvarupris-cykel mot reglerad nättariff); P/E-bärarkriteriet kontrollerat FÖRE leverans (TTM-netto 138 mdr JPY > 0; Sony/Honda-doktrinen); kollisionskontroll exakt-match GRÖN; Utilities ⇒ energi-cellen (26→27 bolag), Japan 25→26 (energi-grenen 1→2 — JAPANS ALLA FYRA ENBOLAGSCELLER ÖPPNA på 1→2: material/halso/industri/energi).";

const RAD = {
  ticker: "9531.T",
  namn: "Tokyo Gas Co., Ltd.",
  bransch: "energi",
  land: "Japan",
  valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-25", url: "https://stockanalysis.com/quote/tyo/9531/ (+ /statistics/ + /financials/)", paranoid: PARANOID }],
  hamtat: "2026-09-25",
  pris: K.pris,
  marknadsKapitalMdr: K.mcap,
  tillvaxt: {
    omsattningCAGR5ar: R.omsCagr3,
    resultatCAGR5ar: R.resCagr3,
    omsattningTillvaxtTTM: 0.031,
    prognosTillvaxt: R.prognos,
  },
  lonksamhet: {
    roe: K.roe, roic: K.roic, bruttoMarginal: null, ebitMarginal: K.ebitM,
    nettoMarginal: R.nettoM, fcfMarginal: K.fcf / K.revTtm,
  },
  stabilitet: {
    skuldEgenkapital: K.de, rantaTackning: K.rantaTackning, fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0,
  },
  aterkop: { senasteArMdr: 0.076, andelUtestande: +R.payoutReplik.toFixed(3), insiderkopSenaste6man: 0 },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: K.pe, pb: K.pb, evEbit: K.evEbit, peg: R.peg, fcfYield: R.fcfY, egenKapitalMultipl: K.pb },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025"],
    omsattning: K.omsSerie.map((x) => x * 1e9),
    resultat: K.resSerie.map((x) => x * 1e9),
    egetKapital: [],
    fcf: K.fcfSerie.map((x) => x * 1e9),
  },
  notering:
    "cellmotiverad duo (Japan/energi 1→2: INPEX producent + Tokyo Gas reglerad distributör/LNG — cellens kontrast råvarucykel mot nättariff); TYO-primär JPY; mars-bokslut; VÅGENS SJUNDE BROTTSFRIA RAD (netto/EPS stigande varje år 84→124; rak CAGR oms +7,38 % · netto +13,86 %); P/E 14,9 källans justerade bas (GAAP-replik 22,5 — förrådsjusteringarnas basgap dokumenterat); P/B 0,89 UNDER bokfört (reglerad profil); netto-M fält=replik 4,59 % (källans 2,4 %-rad annat fönster, noterad); FCF-yield EXAKT 8,14 %; REGLERAD NÄTMETODNOT (ROIC speglar avkastningsformeln — Redeia-konventionen); Altman 1,7 varningszon datafakta (Cellnex/Redeia-klassen); payout-rad saknades (GAAP-replik med not); EK-serie saknas — serier.egetKapital tomt; rappdag Q2 FY2026 est. november = v172-könotis; alla repliker i paranoid (StockAnalysis TYO 2026-09-25)",
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

const kvitto = [];
for (let i = 1; i <= 2; i++) {
  const el = JSON.parse(readFileSync(UNI, "utf8"));
  if (el.length !== FÖRE + 1) { console.error(`ABORT: läs-tillbaka ${i}`); process.exit(1); }
  if (el[el.length - 1].ticker !== "9531.T") { console.error("ABORT: sista raden ≠ 9531.T"); process.exit(1); }
}
const slut = JSON.parse(readFileSync(UNI, "utf8"));
const forandrade = backup.filter((b, i) => JSON.stringify(b) !== JSON.stringify(slut[i])).length;
if (forandrade !== 0) { console.error(`ABORT: ${forandrade} gamla rader förändrade`); process.exit(1); }

kvitto.push(
  `UNIVERSUM-INLÄGG GRÖN: ${FÖRE}→${slut.length} (+1 Tokyo Gas 9531.T, Japan/energi 26→${slut.filter((b) => b.bransch === "energi").length}; Japan → ${slut.filter((b) => b.land === "Japan").length})`,
  `indent=${indent} · gamla rader förändrade=${forandrade} · läs-tillbaka ×2 OK`,
  `REPLIKER: mcap ${R.mcap.toFixed(0)} (${K.mcap}) 0,1 % · fcfY ${(R.fcfY * 100).toFixed(2)} % (mot ${(100 / K.pFcf).toFixed(2)} %) EXAKT · pe 14,9 källa (GAAP-replik 22,5 noterad) · netto-M fält=replik ${(R.nettoM * 100).toFixed(2)} % (källans 2,4 %-rad annat fönster)`,
  `CAGR rak brottsfri (VÅGENS SJUNDE — netto/EPS stigande varje år): oms ${(R.omsCagr3 * 100).toFixed(2)} % · netto ${(R.resCagr3 * 100).toFixed(2)} %`,
  `prognosTillväxt +${(R.prognos * 100).toFixed(2)} % · spår-PEG ${R.peg.toFixed(2)} · P/B 0,89 under bokfört · reglerad nätmotodnot · JAPANS ALLA FYRA ENBOLAGSCELLER NU ÖPPNA`,
);
writeFileSync("/tmp/r215-inlagg.txt", kvitto.join("\n"));
console.log(kvitto.join("\n"));
