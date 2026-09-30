#!/usr/bin/env node
// _s4u3-asm-byggdata.mjs — byggmotor för ASM International Q3-2026-läspaketet (spår 4, s4-u3).
// Alla källtal låsta nedan; härledda tal beräknas och GRINDAS (throw) före filskrivning.
// Gren-medianer/räng och paketräknare hämtas LIVE ur data/portfolj-system/bolagsunivers.json.
// Källor: ASM-PR via GlobeNewswire (Q2-26 2026-07-28, Q1-26 2026-04-21, Q4/FY-25 2026-03-03),
// asm.com/calendar (sökverifierad 2026-09-30), universumrad ASM.AS hämtad 2026-09-03 (Yahoo+MarketStack).

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

// ── KÄLLTAL ──────────────────────────────────────────────────────────────────

// Universumrad ASM.AS (data/portfolj-system/bolagsunivers.json, hämtad 2026-09-03)
const U = {
  pris: 779.4, mcap: 38139, // EUR; M EUR
  pe: 35.67, pb: 8.584, evEbit: 35.075, peg: 1.15, fcfY: 0.0062,
  roe: 0.268, roic: 0.2398, brutto: 0.5183, ebit: 0.3217, netto: 0.3193,
  omsCagr: 0.0959, resCagr: 0.2298, omsTtm: 0.20, prognos: 0.3061,
  skuldEk: 0.0158,
  serAr: [2022, 2023, 2024, 2025],
  serOms: [2410.9, 2634.3, 2932.7, 3173.2], // M EUR (källans 3 173 200 000)
  serRes: [389.1, 752.1, 685.8, 723.7],     // M EUR
};

// Kvartalsserie ur ASM:s egna pressreleaser (M EUR; brutto-%/rörelse-% = PR:ns egna)
const Q = {
  q4_24: { oms: 809.0, orders: 731.4, op: 222.3, netto: 225.8, jnetto: 231.5, bruttoPct: 50.3, opPct: 27.5 },
  q1_25: { oms: 839.2, brutto: 447.8, bruttoPct: 53.4, op: 266.2, opPct: 31.7, jop: 271.0, jopPct: 32.3, netto: -28.9, jnetto: 191.9 },
  q2_25: { oms: 835.6, brutto: 433.2, bruttoPct: 51.8, op: 258.5, opPct: 30.9, jop: 263.2, jopPct: 31.5, netto: 202.4, jnetto: 173.0 },
  q3_25: { oms: 800.0, brutto: 414.9, bruttoPct: 51.9, op: 242.8, opPct: 30.3, jop: 247.5, jopPct: 30.9, netto: 384.1, jnetto: 206.2, orders: 636.8, ordersCc: -17 },
  q4_25: { oms: 698.3, brutto: 347.7, bruttoPct: 49.8, op: 170.5, opPct: 24.4, jop: 175.2, jopPct: 25.1, netto: 166.1, jnetto: 169.6, orders: 802.8, ordersCc: 19, guide: [630, 660] },
  q1_26: { oms: 862.5, brutto: 459.9, bruttoPct: 53.3, op: 278.2, opPct: 32.2, jop: 285.9, jopPct: 33.1, netto: 238.5, jnetto: 246.0, guide: 830 },
  q2_26: { oms: 1003.1, brutto: 521.1, bruttoPct: 51.9, op: 322.8, opPct: 32.2, jop: 330.5, jopPct: 33.0, netto: 285.4, jnetto: 292.9, fcf: 355, guide: 980, fx: 22, fxPy: -60 },
};

const KALENDER = {
  rappdag: "2026-10-27", tid: "18:00 CET", veckodag: "tisdagen",
  q3Guide: 1100, q3Spann: 5,           // ±5 % cc
  h12026: 1865.6,                       // 862,5 + 1 003,1
  h2VaxtMinst: 0.20,                    // "över 20 % mot H1"
  spannde2027: [3700, 4600],
  utdelning2025: 3.25, utdelning2024: 3.00, agm: "2026-05-11",
  aterkop: 150, aterkopStart: "2026-08-10", aterkopKlar: "2026-09-15",
  asmptAndelFore: "~25", asmptSalu: "~9", asmptDatum: "2025-11-02",
};

// ── BERÄKNINGAR + GRINDAR ────────────────────────────────────────────────────

const approx = (faktisk, referens, tol, namn) => {
  const ok = Math.abs(faktisk - referens) <= tol * Math.abs(referersAbs(referens));
  if (!ok) throw new Error(`GRIND ${namn}: ${faktisk} vs ${referens} (tol ${tol})`);
};
function referersAbs(x) { return x === 0 ? 1e-9 : x; }
const assert = (villkor, msg) => { if (!villkor) throw new Error("GRIND " + msg); };

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

// FY2025-kedjan återvinner universumseriens resultat
const fy25Netto = r1(Q.q1_25.netto + Q.q2_25.netto + Q.q3_25.netto + Q.q4_25.netto);
approx(fy25Netto, U.serRes[3], 0.001, "FY25-netto = universumfältet");
const fy25Oms = r1(Q.q1_25.oms + Q.q2_25.oms + Q.q3_25.oms + Q.q4_25.oms);
approx(fy25Oms, U.serOms[3], 0.001, "FY25-omsättning = universumfältet");

// TTM-fönstret Q3-25 → Q2-26
const ttmNetto = r1(Q.q3_25.netto + Q.q4_25.netto + Q.q1_26.netto + Q.q2_26.netto);
const ttmJnetto = r1(Q.q3_25.jnetto + Q.q4_25.jnetto + Q.q1_26.jnetto + Q.q2_26.jnetto);
const ttmOms = r1(Q.q3_25.oms + Q.q4_25.oms + Q.q1_26.oms + Q.q2_26.oms);
const ttmOp = r1(Q.q3_25.op + Q.q4_25.op + Q.q1_26.op + Q.q2_26.op);
const ttmNettoMarg = ttmNetto / ttmOms;
approx(ttmNettoMarg, U.netto, 0.001, "TTM-nettomarginal = fältets 31,93 %");

// P/E-fältets implicerade netto
const peBasNetto = U.mcap / U.pe;
const ttmGap = ttmNetto / peBasNetto - 1;
assert(Math.abs(ttmGap) < 0.006, `TTM mot P/E-bas gap ${ttmGap}`);

// EV-kedjan: fältets EV/EBIT × TTM-rörelseresultat
const ev = U.evEbit * ttmOp;
assert(ev < U.mcap, "EV måste ligga under mcap (nettokassa)");
const nettokassa = U.mcap - ev;

// Aktieantal ur mcap/pris; EPS-världar
const aktier = U.mcap / U.pris; // M
const epsRapp = ttmNetto / aktier;
const epsJust = ttmJnetto / aktier;
const peRapp = U.pris / epsRapp;
approx(peRapp, U.pe, 0.006, "rapporterad P/E-omväg mot fältet");
const peJust = U.pris / epsJust;

// ROE-vägar (härledda, deklarerade i texten)
const ekPb = U.mcap / U.pb;
const medelEkRoe = ttmNetto / U.roe;
const beginEk = 2 * medelEkRoe - ekPb;

// PEG-konvention
const pegEgen = U.pe / (U.prognos * 100);
assert(Math.abs(pegEgen - U.peg) < 0.03, `PEG egen ${pegEgen} mot fält ${U.peg}`);

// Guidens aritmetik
const h2planMinst = KALENDER.h12026 * (1 + KALENDER.h2VaxtMinst);
const fy26Plan = KALENDER.h12026 + h2planMinst;
const q3Botten = KALENDER.q3Guide * (1 - KALENDER.q3Spann / 100);
const q3Topp = KALENDER.q3Guide * (1 + KALENDER.q3Spann / 100);

// Återbörd
const utdFlode = KALENDER.utdelning2025 * aktier;
const aterbord = utdFlode + KALENDER.aterkop;
const direktAvk = KALENDER.utdelning2025 / U.pris;

// Q4-25-dippen: tre mått
const q4QoQ = Q.q4_25.oms / Q.q3_25.oms - 1;
const q4YoY = Q.q4_25.oms / Q.q4_24.oms - 1;
const q4MotGuide = Q.q4_25.oms / KALENDER && Q.q4_25.guide ? Q.q4_25.oms / Q.q4_25.guide[1] - 1 : 0;

// b2b sista redovisade kvartal
const b2bQ3 = Q.q3_25.orders / Q.q3_25.oms;
const b2bQ4 = Q.q4_25.orders / Q.q4_25.oms;

// Scenarioruta FY2026: oms 3 960 / fy26Plan / 4 260 × marginal 24/27/30 %
// (axelvärden valda utan exakta halvtal i cellprodukterna — deterministisk avrundning)
const scenOms = [3960, r1(fy26Plan), 4260];
const scenMarg = [0.24, 0.27, 0.30];
const scen = scenOms.map(o => scenMarg.map(m => {
  const netto = r1(o * m);
  return { netto, pe: r2(U.mcap / netto) };
}));

// ── LIVE GRENDATA (medianer/räng) ur universumfilen ─────────────────────────

const uniRaw = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const uni = Array.isArray(uniRaw) ? uniRaw : (uniRaw.bolag || uniRaw.poster || Object.values(uniRaw).find(Array.isArray));
const tekn = uni.filter(p => p.bransch === "teknik");
const median = (vals) => {
  const s = vals.filter(v => typeof v === "number" && isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const rankDesc = (vals, v) => vals.filter(x => typeof x === "number" && isFinite(x)).sort((a, b) => b - a).indexOf(v) + 1;
const nPe = tekn.filter(p => typeof p.vardering?.pe === "number").length;
const M = {
  pe: median(tekn.map(p => p.vardering?.pe)),
  pb: median(tekn.map(p => p.vardering?.pb)),
  evEbit: median(tekn.map(p => p.vardering?.evEbit)),
  peg: median(tekn.map(p => p.vardering?.peg)),
  roe: median(tekn.map(p => p.lonksamhet?.roe)),
  roic: median(tekn.map(p => p.lonksamhet?.roic)),
  brutto: median(tekn.map(p => p.lonksamhet?.bruttoMarginal)),
  ebit: median(tekn.map(p => p.lonksamhet?.ebitMarginal)),
  netto: median(tekn.map(p => p.lonksamhet?.nettoMarginal)),
  prognos: median(tekn.map(p => p.tillvaxt?.prognosTillvaxt)),
};
const R = {
  pe: rankDesc(tekn.map(p => p.vardering?.pe), U.pe),
  pb: rankDesc(tekn.map(p => p.vardering?.pb), U.pb),
  roe: rankDesc(tekn.map(p => p.lonksamhet?.roe), U.roe),
  brutto: rankDesc(tekn.map(p => p.lonksamhet?.bruttoMarginal), U.brutto),
  ebit: rankDesc(tekn.map(p => p.lonksamhet?.ebitMarginal), U.ebit),
  netto: rankDesc(tekn.map(p => p.lonksamhet?.nettoMarginal), U.netto),
  prognos: rankDesc(tekn.map(p => p.tillvaxt?.prognosTillvaxt), U.prognos),
};
// Skuld/EK: lägst är bäst → stigande rang
const M2 = {
  skuldEk: median(tekn.map(p => p.stabilitet?.skuldEgenkapital)),
};
const skuldEkVals = tekn.map(p => p.stabilitet?.skuldEgenkapital).filter(x => typeof x === "number" && isFinite(x)).sort((a, b) => a - b);
const skuldEkRang = skuldEkVals.indexOf(U.skuldEk) + 1;
assert(tekn.length === 33, `teknik-grenen n=${tekn.length} (väntat 33)`);

// Grenens teknikpaket på disk (exklusive detta pakets egen slug) + seriens total
const katalog = "data/blogg-utkast/kvartal/2026-q3";
const EGEN_SLUG = "asm-international";
const paket = readdirSync(katalog).filter(f => f.startsWith("sa-laser-du-") && f.endsWith(".json") && !f.includes(EGEN_SLUG));
const slugTicker = (slug) => {
  const m = {
    asml: "ASML.AS", sap: "SAP.DE", hexagon: "HEXA-B.ST", nokia: "NOKIA.HE", ericsson: "ERIC-B.ST",
    samsung: "005930.KS", microsoft: "MSFT", meta: "META", alphabet: "GOOGL", apple: "AAPL",
    palantir: "PLTR", truecaller: "TRUE-B.ST", "asm-international": "ASM.AS",
    logitech: "LOGN.SW", kambi: "KAMBI.ST", sinch: "SINCH.ST",
  };
  for (const [k, v] of Object.entries(m)) if (slug.includes(k)) return v;
  return null;
};
const teknPaket = paket.filter(f => {
  const t = slugTicker(f.replace("sa-laser-du-", "").replace("-q3-2026.json", ""));
  return t && uni.find(p => p.ticker === t)?.bransch === "teknik";
}).length;
const serienNr = paket.length + 1;

// ── FORMATTERARE (svenska tal) ───────────────────────────────────────────────

const sv = (x, d = 1) => x.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d });
const sv0 = (x) => x.toLocaleString("sv-SE", { maximumFractionDigits: 0 });
const pct = (x, d = 1) => sv(x * 100, d) + " %";
const pn = (x, d = 1) => (x >= 0 ? "" : "−") + sv(Math.abs(x), d); // teckenbevarande minus

// ── BODY ─────────────────────────────────────────────────────────────────────

const body = `ASM International — ticker ASM på Euronext Amsterdam — publicerar sin rapport för tredje kvartalet 2026 ${KALENDER.veckodag} den **27 oktober kl 18:00** (leveransen kommer efter börsens stängning; telefonsamtalet hålls påföljande dag). Detta är teknikgrenens paket nummer ${teknPaket + 1} och seriens nummer ${serienNr} på disk.

## Urvalet: två gallringar, en sökverifiering — och en identitet med två förväxlingsrisker

Bland kalenderns återstående objekt gällde seriens sorteringsregler: tidigaste rappdag med bärande data. Två objekt med bolagsutlysta datum den 22 oktober gallras på data: PowerCell (P/E-fältet null, ROE −35,3 procent, rörelsemarginal −124,7 procent) och Viaplay (P/E null, ROE −52,9 procent) — utan vinstmultipel blir identitetstestet omöjligt, samma gallra som Billerud tidigare i spåret; gallran gäller tills datan botas, inte för alltid. Kvar som tidigaste bärande objekt står ASM International med full universumpost: samtliga värderings- och lönsamhetsfält bär, fyra räkenskapsår i serien, marknadsvärde ${sv0(U.mcap)} miljoner euro.

Rappdagen är bolagsbekräftad — seriens högsta datumklass. ASM:s egen kalender bokat "Quarterly results Q3 2026" till 27 oktober 2026 kl 18:00 CET (asm.com/calendar, sökverifierad 2026-09-30), och förra årets Q3 kom 28 oktober. Kalenderpanelens estimerade alternativ senare i fönstret (Canadian Pacific 28 oktober, ExxonMobil 30 oktober, novemberfältet) är alla tredjepartsprojektioner som väntar egna utlysningar; den 27 oktober med bolagets egen booking vinner FIFO:n. Datumläran är seriens arv från P&G-gallran: ett tredjepartsestimat är ett spår, en bolagsutlysning är ett faktum — och först när båda finns vinner inte det senare automatiskt, men när bara den ena finns gör det hela skillnaden.

Identiteten förtjänar en egen rad, för här finns två förväxlingsrisker. ASM International (ASM.AS, Almere, Nederländerna) gör utrustning för atomskiktdeposition — Atomic Layer Deposition, ALD — och epitaxi i halvledarens front-end. ASML i Veldhoven (lithografi) är ett helt annat bolag som redan har sitt paket i serien. ASMPT Limited i Hongkong (back-end, förpackning och montering) är ett tredje bolag — som ASM International äger en betydande andel av (cirka ${KALENDER.asmptAndelFore} procent under 2025; den 2 november 2025 tillkännagav bolaget avsikten att sälja cirka ${KALENDER.asmptSalu} procentenheter). Tre bolag, två gemensamma bokstavsprefix — läs tickern, inte namnet.

## Grundberättelsen: från cykelbotten till rekord — på fyra år

Universumserien ritar en hel cykelbåge: omsättningen ${sv(U.serOms[0], 1)} → ${sv(U.serOms[1], 1)} → ${sv(U.serOms[2], 1)} → ${sv(U.serOms[3], 1)} miljoner euro 2022–2025 (CAGR ${pct(U.omsCagr, 1)} på seriens fyra räkenskapsår), medan resultatet går ${sv(U.serRes[0], 1)} → ${sv(U.serRes[1], 1)} → ${sv(U.serRes[2], 1)} → ${sv(U.serRes[3], 1)} (CAGR ${pct(U.resCagr, 1)}). Toppåret 2023 följdes av en mjuk landning 2024 — och därefter tog AI-bygget i logic- och foundrysegmentet över: fjolåret slutade med rekordintäkt ${sv(U.serOms[3] / 1000, 1)} miljarder euro och rekordbruttomarginal 51,8 procent, och Q2 2026 blev första kvartal över en miljard (${sv(Q.q2_26.oms, 1)}).

Konkret handlar rytmerna om gate-all-around-övergången — de nya transistorstrukturerna kräver ALD i nya processsteg — och bolaget väntar de första pilotinvesteringarna för 1,4-nanometernoder under andra halvåret 2026. Volymen bakom rubrikerna har en geografi och en segmentfördelning som är värda att läsa långsamt: Kina stod för mer än 30 procent av omsättningen 2025, och minnet för 16 procent av verktygsförsäljningen — resten bär logic- och foundrykunderna som driver GAA-övergången. Reservdelar och service växte 18 procent i fasta valutor under 2025 — en motcykelstubbe av intäkter som inte är orderbunden på det sätt verktygen är, och som därför värdesätter läsningen av ordermörkret (signatur 3). Fjolårets tre rekord — intäkt, bruttomarginal 51,8 och justerad rörelsemarginal 30,2 procent — sattes alltså i ett år där kvartalsbilderna svängde kraftigt (signatur 1); årsrekord och kvartalskaos är inte motsatser i cykelbolag, de är samma mynt från två håll.

## Nyckeltalen i fyra dimensioner

| Dimension | ASM:s fält | Grenens median (teknik, n=${tekn.length}) | Läge |
|---|---|---|---|
| P/E | ${sv(U.pe, 2)} | ${sv(M.pe, 2)} | ${R.pe}:a av ${nPe} — ${sv(U.pe / M.pe, 2)}× medianen |
| P/B | ${sv(U.pb, 3)} | ${sv(M.pb, 2)} | ${R.pb}:a av ${tekn.length} — ${sv(U.pb / M.pb, 2)}× medianen |
| EV/EBIT | ${sv(U.evEbit, 2)} | ${sv(M.evEbit, 2)} | ${sv(U.evEbit / M.evEbit, 2)}× medianen |
| PEG | ${sv(U.peg, 2)} | ${sv(M.peg, 3)} | premie även i PEG |
| ROE | ${pct(U.roe, 1)} | ${pct(M.roe, 1)} | ${R.roe}:a — precis över medianen |
| ROIC | ${pct(U.roic, 1)} | ${pct(M.roic, 1)} | klart över |
| Bruttomarginal | ${pct(U.brutto, 1)} | ${pct(M.brutto, 1)} | ${R.brutto}:a — strax över medianen |
| Rörelsemarginal | ${pct(U.ebit, 1)} | ${pct(M.ebit, 1)} | ${R.ebit}:a — ${sv(U.ebit / M.ebit, 2)}× medianen |
| Nettomarginal | ${pct(U.netto, 1)} | ${pct(M.netto, 1)} | ${R.netto}:a — ${sv(U.netto / M.netto, 2)}× medianen |
| Prognostillväxt | ${pct(U.prognos, 1)} | ${pct(M.prognos, 1)} | ${R.prognos}:a — ${sv(U.prognos / M.prognos, 2)}× medianen |
| Skuld/EK | ${sv(U.skuldEk, 2)} | ${sv(M2.skuldEk, 2)} | nummer ${skuldEkRang} av ${skuldEkVals.length} — nästan skuldfri |

Mönstret i tabellen är seriens klassiker i ren form: marginalpremie med multiplar som betalar för den. Nettomarginalen ${pct(U.netto, 1)} mot grenens ${pct(M.netto, 1)} är nästan exakt dubblerad — men ROE ${pct(U.roe, 1)} landar bara ${sv((U.roe - M.roe) * 100, 1)} procentenheter över medianen. Signatur 2 visar varför. Och den sista raden är sin egen lilla historia: skuld per eget kapital ${sv(U.skuldEk, 2)} — inte ${sv(M2.skuldEk, 2)} som grenen i median — gör balansräkningen i praktiken skuldfri, vilket är spegelbilden av kassan i EV-spegeln. Ett bolag utan räntebörda kan låta kassan ligga; ett belåat kan inte. Stabilitetsdimensionen (läs mer i [skuldsättningsaspekten](/dataset/teknik/skuldsattning)) bär samma budskap som värderingsdimensionen, fast inifrån.

## Signatur 1: Sju kvartal, två sanningar — kedjan som återvinner fältet

| € M | Q4-24 | Q1-25 | Q2-25 | Q3-25 | Q4-25 | Q1-26 | Q2-26 |
|---|---|---|---|---|---|---|---|
| Omsättning | ${sv(Q.q4_24.oms, 1)} | ${sv(Q.q1_25.oms, 1)} | ${sv(Q.q2_25.oms, 1)} | ${sv(Q.q3_25.oms, 1)} | ${sv(Q.q4_25.oms, 1)} | ${sv(Q.q1_26.oms, 1)} | ${sv(Q.q2_26.oms, 1)} |
| Brutto-% | ${sv(Q.q4_24.bruttoPct, 1)} | ${sv(Q.q1_25.bruttoPct, 1)} | ${sv(Q.q2_25.bruttoPct, 1)} | ${sv(Q.q3_25.bruttoPct, 1)} | ${sv(Q.q4_25.bruttoPct, 1)} | ${sv(Q.q1_26.bruttoPct, 1)} | ${sv(Q.q2_26.bruttoPct, 1)} |
| Rörelseresultat | ${sv(Q.q4_24.op, 1)} | ${sv(Q.q1_25.op, 1)} | ${sv(Q.q2_25.op, 1)} | ${sv(Q.q3_25.op, 1)} | ${sv(Q.q4_25.op, 1)} | ${sv(Q.q1_26.op, 1)} | ${sv(Q.q2_26.op, 1)} |
| Netto (IFRS) | ${sv(Q.q4_24.netto, 1)} | ${pn(Q.q1_25.netto, 1)} | ${sv(Q.q2_25.netto, 1)} | ${sv(Q.q3_25.netto, 1)} | ${sv(Q.q4_25.netto, 1)} | ${sv(Q.q1_26.netto, 1)} | ${sv(Q.q2_26.netto, 1)} |
| Justerat netto | ${sv(Q.q4_24.jnetto, 1)} | ${sv(Q.q1_25.jnetto, 1)} | ${sv(Q.q2_25.jnetto, 1)} | ${sv(Q.q3_25.jnetto, 1)} | ${sv(Q.q4_25.jnetto, 1)} | ${sv(Q.q1_26.jnetto, 1)} | ${sv(Q.q2_26.jnetto, 1)} |

Tre kontroller, tre olika läxor.

**Kedjan stänger på öret.** Q1+Q2+Q3+Q4 2025: ${pn(Q.q1_25.netto, 1)} + ${sv(Q.q2_25.netto, 1)} + ${sv(Q.q3_25.netto, 1)} + ${sv(Q.q4_25.netto, 1)} = ${sv(fy25Netto, 1)} miljoner euro — exakt universumfältets årsresultat (och omsättningen: ${sv(Q.q1_25.oms, 1)} + ${sv(Q.q2_25.oms, 1)} + ${sv(Q.q3_25.oms, 1)} + ${sv(Q.q4_25.oms, 1)} = ${sv(fy25Oms, 1)} mot fältets ${sv(U.serOms[3], 1)}; gapet ${pct(fy25Oms / U.serOms[3] - 1, 3)}). Källorna mäter samma bolag.

**TTM-fönstret återvinner P/E-fältet.** Senaste fyra kvartalens IFRS-netto: ${sv(Q.q3_25.netto, 1)} + ${sv(Q.q4_25.netto, 1)} + ${sv(Q.q1_26.netto, 1)} + ${sv(Q.q2_26.netto, 1)} = ${sv(ttmNetto, 1)} på omsättningen ${sv(Q.q3_25.oms, 1)} + ${sv(Q.q4_25.oms, 1)} + ${sv(Q.q1_26.oms, 1)} + ${sv(Q.q2_26.oms, 1)} = ${sv(ttmOms, 1)} — nettomarginal ${pct(ttmNettoMarg, 2)}, exakt fältets ${pct(U.netto, 2)}. Och P/E-fältets implicerade netto (marknadsvärde ${sv0(U.mcap)} delat på ${sv(U.pe, 2)}) blir ${sv(peBasNetto, 1)} — TTM-kedjan landar ${pct(Math.abs(ttmGap), 2)} därifrån. Fältet och kvartalen talar med varandra.

**Men IFRS-lådan har två rum.** Samma år som innehåller kvartalsförlusten ${pn(Q.q1_25.netto, 1)} (Q1-25) innehåller också rekordkvartalet ${sv(Q.q3_25.netto, 1)} (Q3-25) — medan de justerade talen för samma kvartal är ${sv(Q.q1_25.jnetto, 1)} respektive ${sv(Q.q3_25.jnetto, 1)}. Skillnaden — ${sv(Q.q3_25.netto - Q.q3_25.jnetto, 1)} respektive ${sv(Q.q1_25.jnetto - Q.q1_25.netto, 1)} miljoner euro — består av poster utanför kärnrörelsen (pressreleasens Annex 3 specificerar avstämningen; ASMPT-andelens värdering till marknad är en känd mekanism som kan röra resultatet åt båda hållen). Konsekvensen för TTM: rapporterat ${sv(ttmNetto, 1)} mot justerat ${sv(ttmJnetto, 1)} — två världar att hålla isär. Med aktieantalet ${sv(aktier, 1)} miljoner (marknadsvärde dividerat med kurs ${sv(U.pris, 2)}) blir EPS-världarna ${sv(epsRapp, 2)} (P/E ${sv(peRapp, 2)}) och ${sv(epsJust, 2)} (P/E ${sv(peJust, 2)}). Fältets ${sv(U.pe, 2)} levererar den rapporterade världen.

## Signatur 2: Kassan i spegeln — EV under börsvärdet, och ROE-möllstenen

EV-kedjan öppnar en dörr som P/E håller stängd. TTM-rörelseresultat ${sv(Q.q3_25.op, 1)} + ${sv(Q.q4_25.op, 1)} + ${sv(Q.q1_26.op, 1)} + ${sv(Q.q2_26.op, 1)} = ${sv(ttmOp, 1)}; gånger fältets EV/EBIT ${sv(U.evEbit, 3)} ger enterprise value ${sv0(ev)} miljoner euro — understigande börsvärdet ${sv0(U.mcap)}. Skillnaden är en härledd nettokassa på cirka ${sv0(nettokassa)} miljoner euro, ${pct(nettokassa / U.mcap, 1)} av börsvärdet eller ${sv(nettokassa / aktier, 1)} euro per aktie. För EV-tänkaren handlas alltså rörelsen med rabatt mot vad P/E-ytan visar — och EV/EBIT-${sv(U.evEbit, 2)}-fältet speglar en rörelse, inte en kassa. (Beräkningen är härledd: fältet ger multipeln, kedjan ger EBIT, skillnaden blir kassan; balansräkningens exakta kassapost redovisas först i rapporten den 27 oktober.)

Samma kassa förklarar ROE-gåtan i nyckeltalstabellen: nettomarginal ${R.netto}:a av ${tekn.length} i grenen men ROE först ${R.roe}:a. En kassa som inte tjänar multipelavkastning kapar avkastningen på eget kapital. P/B-vägen ger EK ${sv0(ekPb)} miljoner euro (börsvärde delat med ${sv(U.pb, 3)}); fältets ROE ${pct(U.roe, 1)} på TTM-nettot ${sv(ttmNetto, 1)} implicerar medel-EK ${sv0(medelEkRoe)} — vänds den baklänges blir börjar-EK ${sv0(beginEk)} (härlett, deklarerat; balansräkningen avgör).

Kassaflödessidan håller samma dubbelbottnade ton som resultatet. Q2 2026 redovisade rekordkassaflöde ${sv0(Q.q2_26.fcf)} miljoner euro efter kapitalutgifter — ett kvartal som i sig motsvarar ungefär ${pct(Q.q2_26.fcf / U.mcap, 1)} av hela börsvärdet — medan universumfältets FCF-avkastning landar på ${pct(U.fcfY, 2)}. Skillnaden är fönster och definition: fältet mäter en annan period med källans egen konvention, kvartalstalet är bolagets uttalande. Båda är sanna; ingen av dem härleds ur den andra, och paketet anger källa för vartdera i stället för att blanda dem till en siffra.

Återbörden till ägarna: ordinarie utdelning ${sv(KALENDER.utdelning2025, 2)} euro över 2025 (upp från ${sv(KALENDER.utdelning2024, 2)}; AGM ${KALENDER.agm}) — direktavkastning ${pct(direktAvk, 2)} på kursen — plus återköpsprogrammet ${sv0(KALENDER.aterkop)} miljoner euro 2026/27, som startade ${KALENDER.aterkopStart} och avslutades ${KALENDER.aterkopKlar}, fem veckor. Utdelningsflödet ${sv(KALENDER.utdelning2025, 2)} × ${sv(aktier, 1)} miljoner aktier = ${sv(utdFlode, 1)}; tillsammans med återköpet ${sv(aterbord, 1)} miljoner — ${pct(aterbord / ttmNetto, 1)} av rapporterat TTM-netto (${pct(aterbord / ttmJnetto, 1)} av justerat). Trappan 3,00 → 3,25 är en +8,3-procentshöjning; återbördens vikt ligger hos återköpet.

## Signatur 3: Ordermörkret — cykeln utan orderlys

Med Q4-rapporten 2025 slopade ASM den kvartalsvisa order- och backlogredovisningen: från och med Q1 2026 publiceras backlog endast vid årsskiftet. De sista offentliga ordertalen är Q3-25 ${sv(Q.q3_25.orders, 1)} miljoner euro (−17 procent i fasta valutor år mot år) och Q4-25 ${sv(Q.q4_25.orders, 1)} (+19 procent) — book-to-bill ${sv(b2bQ3, 2)} respektive ${sv(b2bQ4, 2)}. Hur läser man ett cykelbolag när lyset släckts? Paketets svar: fyra proxyer ur bolagets egna utsaggor — med olika beviskraft, rangordnade från hårdast till mjukast.

1. **Guidens aritmetik.** Q3-guiden ${sv0(KALENDER.q3Guide)} miljoner ±${KALENDER.q3Spann} procent (spann ${sv0(q3Botten)}–${sv0(q3Topp)}), och "andra halvåret över +20 procent mot första" — H1 är ${sv(KALENDER.h12026, 1)}, så H2-planen är minst ${sv(h2planMinst, 1)} och räkneövningen för hela 2026: ${sv(KALENDER.h12026, 1)} + ${sv(h2planMinst, 1)} = ${sv(fy26Plan, 1)} miljoner euro.
2. **2027-spannet.** Vid investerardagen september 2025 sattes 3,7–4,6 miljarder euro; i Q2-rapporten höjer bolaget sig själv — 2027 väntas överstiga spannets topp ${sv0(KALENDER.spannde2027[1])}.
3. **Motcykelstuben.** Reservdelar och service +18 procent 2025 — intäkter som inte är orderbundna på samma sätt som verktygen.
4. **Kinasvängen.** Framtidsbilden gick från "dubbelsiffrig nedgång 2026" till "uppgång 2026" mellan Q3- och Q4-rapporterna.

Proxyernas inbördes ordning är själva läxan: guiden är aritmetik (siffror att räkna baklänges), spannet är en ambitionsdeklaration (ord att minnas till nästa höst), reservdelsstubben är en strukturförskjutning (långsam, nästan oberoende av verktygscykeln) och Kinasvängen är en segmentkall — den mjukaste av de fyra, men också den som vände snabbast. En läsare som vill väga samman dem börjar i toppen och slutar i botten, aldrig omvänt.

Och så dippen som pedagogiskt exempel: Q4-25-omsättningen ${sv(Q.q4_25.oms, 1)} ser kalendermässigt ugglan i minibagen — ${pct(q4QoQ, 1)} mot Q3 och ${pct(q4YoY, 1)} mot Q4-24. Men mot bolagets egen guide ${sv0(Q.q4_25.guide[0])}–${sv0(Q.q4_25.guide[1])} var den +${pct(q4MotGuide, 1)} över toppen. Dippen var leveransrytm, inte efterfrågefall — kalenderjämförelse och guidejämförelse ger olika diagnoser, och guiden äger svepet.

## Datavakten: kontroller av källans egna tal

- **Enkelkällor redovisas öppet.** Universumraden är hämtad 2026-09-03 (Yahoo som primär med MarketStack som dubbelkoll av pris och multiplar; kursen ${sv(U.pris, 2)} euro är alltså åtta veckor gammal vid leverans — ingen färskare kurs har inhämtats, och alla kursberoende mått (direktavkastning, P/E-omvägar, aktieantalet) bär det datumet).
- **Pressreleaserna redovisar inte EPS.** Peraktietal i paketet är härledda via aktieantalet ${sv(aktier, 1)} miljoner (marknadsvärde/kurs); det deklareras som härledning, inte källfakta.
- **ROIC är en approximation** enligt universumkällans egen not (rörelseresultat före skatt över skuld plus bokfört eget kapital), och PEG-fältets nämnare är konsensus EPS-tillväxt ett år fram (${pct(U.prognos, 1)}; konventionen ger ${sv(U.pe, 2)}/${sv(U.prognos * 100, 1)} = ${sv(pegEgen, 2)} mot fältets ${sv(U.peg, 2)} — avrundningsgap).
- **FCF-fältet 0,62 procent** (avkastning på börsvärde) lever sida vid sida med Q2-26:s rekordkassaflöde ${sv0(Q.q2_26.fcf)} miljoner euro — olika fönster och definitioner; ingen av dem härleds ur den andra.
- **Vågvalideringsnot:** ASM saknar analysfil i biblioteket och finns inte i vågvalideringens universum — paketet bygger på kalender och universumsdata; ingen vågklass eller dom redovisas.
- **Femårstalet på fyra år.** Universumkällans notering är explicit: serierna bygger på fyra räkenskapsår (2022–2025), inte fem. CAGR-talen räknas därför på tre intervall — metoden är seriens standardnotis och gäller alla jämförelser mot grenens medianer, som lever under samma konvention.
- **Valutaeffekterna** är avsedda läromedel: Q2-26 bar +${sv(Q.q2_26.fx, 0)} miljoner euro mot −${sv(Math.abs(Q.q2_26.fxPy), 0)} i Q2-25 — samma rörelse, två valutavindar, skillnaden hamnar i IFRS-rummet (signatur 1). Q1-26 bar +10,4 mot −40,3 miljoner; två kvartal i rad med motverkande vindar året innan är hela förklaringen till skillnaden mellan tillväxten i fasta valutor (${pct(0.24, 0)} för Q2) och rapporterad (${pct(0.20, 0)}).

## Scenariorutan: nio celler i ren aritmetik

Tre omsättningsplaner för 2026 — konservativ ${sv0(scenOms[0])} (Q3 i spannets botten och svagt Q4), plan ${sv0(scenOms[1])} (guidens aritmetik från signatur 3), stark ${sv0(scenOms[2])} — mot tre nettomarginaler: 24 procent (Q4-25-nivå), 27 procent (justerad TTM) och 30 procent (Q2-26-takt). Cellerna visar netto i miljoner euro och, inom parentes, implied P/E på börsvärdet ${sv0(U.mcap)}.

| FY2026 | Marginal 24 % | Marginal 27 % | Marginal 30 % |
|---|---|---|---|
| Omsättning ${sv0(scenOms[0])} | ${sv(scen[0][0].netto, 0)} (P/E ${sv(scen[0][0].pe, 1)}) | ${sv(scen[0][1].netto, 0)} (${sv(scen[0][1].pe, 1)}) | ${sv(scen[0][2].netto, 0)} (${sv(scen[0][2].pe, 1)}) |
| Omsättning ${sv0(scenOms[1])} | ${sv(scen[1][0].netto, 0)} (${sv(scen[1][0].pe, 1)}) | ${sv(scen[1][1].netto, 0)} (${sv(scen[1][1].pe, 1)}) | ${sv(scen[1][2].netto, 0)} (${sv(scen[1][2].pe, 1)}) |
| Omsättning ${sv0(scenOms[2])} | ${sv(scen[2][0].netto, 0)} (${sv(scen[2][0].pe, 1)}) | ${sv(scen[2][1].netto, 0)} (${sv(scen[2][1].pe, 1)}) | ${sv(scen[2][2].netto, 0)} (${sv(scen[2][2].pe, 1)}) |

Mittrutans läsning: guidens egen aritmetik vid fortsatt marginal håller P/E:n nära dagens fält ${sv(U.pe, 2)} — planen ligger i prisytan, vilket är en observation om förväntningar, inte en kursprognos. Rutan multiplicerar omsättning med marginal; den säger inget om IFRS-rummets engångsposter (signatur 1) — vill du träna vidare: byt marginalaxelns mittpost mot 24 procent och se vad kvartalskedjan gjorde med Q1-25. Notera också axlarnas ursprung: omsättningsaxeln är guidens aritmetik (signatur 3), inte en analyzerkonsensus, och marginalaxeln är tre historiska nivåer ur kvartalsserien — 24 procent är Q4-25-takten (dippkvartalet), 27 procent den justerade TTM-nivån och 30 procent Q2-26-takten. Rutan är en räkneövning i vad orden "plan" och "marginal" gör mot multiplen, inte ett uttalande om vilken cell som träffar.

## Multiplövningen

| Multipl | ASM | Grenens median | ASM/median |
|---|---|---|---|
| P/E | ${sv(U.pe, 2)} | ${sv(M.pe, 2)} | ${sv(U.pe / M.pe, 2)}× |
| P/B | ${sv(U.pb, 2)} | ${sv(M.pb, 2)} | ${sv(U.pb / M.pb, 2)}× |
| EV/EBIT | ${sv(U.evEbit, 2)} | ${sv(M.evEbit, 2)} | ${sv(U.evEbit / M.evEbit, 2)}× |
| Nettomarginal | ${pct(U.netto, 1)} | ${pct(M.netto, 1)} | ${sv(U.netto / M.netto, 2)}× |
| Prognostillväxt | ${pct(U.prognos, 1)} | ${pct(M.prognos, 1)} | ${sv(U.prognos / M.prognos, 2)}× |

Premien är ${sv(U.pe / M.pe - 1, 0)}-procentnivån på P/E och ${sv(U.pb / M.pb - 1, 0)} procent på P/B; marginalerna (${sv(U.netto / M.netto, 2)}× netto) och prognostillväxten (${sv(U.prognos / M.prognos, 2)}×) är premiens motpart i spegeln. Övningen för läsaren: placera ASM i grenens [P/E-matris](/dataset/teknik/pe) och [P/B-matris](/dataset/teknik/pb) och testa hur premien rör sig om marginalaxeln i scenariorutan flyttas ett steg.

## Tre läsövningar inför 27 oktober

1. **Guidemekaniken.** Q3-ledartalet ${sv0(KALENDER.q3Guide)} miljoner ±${KALENDER.q3Spann} procent: räkna ut vad botten ${sv0(q3Botten)} och topp ${sv0(q3Topp)} betyder för den årliga planen ${sv(fy26Plan, 1)} — och notera att spannet är i fasta valutor (valutaeffekten Q2 visar varför det spelar roll).
2. **IFRS-rummet.** Leta Annex 3: hur stor blir skillnaden mellan rapporterat och justerat netto denna gång — och åt vilket håll? Kvartalsserien 2025 (två riktningar!) är facit i handen om att skillnaden är ett väder, inte en trend.
3. **ASMPT-linjen.** Försäljningsavsikten från november 2025 och ASMPT-andelens värdeförändringar syns i finansiella poster — håll isär rörelsens marginal (Q2-26: brutto ${sv(Q.q2_26.bruttoPct, 1)} procent, justerad rörelse ${sv(Q.q2_26.jopPct, 1)} procent) från ägarresultatet. Frågan att bära med sig: rörde den här kvartalsrapportens IFRS-rum rörelsen eller portföljen — och hur stor var skillnaden i euro?

En fjärde övning för den som vill gå längre: räkna EV-kedjan igen med rapportens färska balansräkning. Nettokassan ${sv0(nettokassa)} miljoner euro är härledd från fältets multipel; när kassaposten publiceras kan du ersätta härledningen med faktan och se hur många procent härledningen avvek — det är precis så källkritik övas, inte genom att misstro källor utan genom att mäta dem.

## Kalender och omgivning

Rapporten publiceras ${KALENDER.veckodag} 27 oktober 2026 kl ${KALENDER.tid}; telefonsamtalet hålls påföljande dag (Q2-rutinen var rapport tisdag kväll, samtal onsdag kl 15:00 — samma koreografi väntas). Fjolårets Q3 kom 28 oktober 2025 — rytmen är etablerad, och 18:00-släppet gör att svenska läsare får rapporten på kvällen och samtalet nästa eftermiddag. Omvärldsfönstret samma vecka: halvledarutrustningsgrenens stora rapporter klämtar i oktober, och teknikgrenens syskonpaket i serien (bland annat ASML, SAP, Logitech och Kambi) ger medianer att spegla mot. Bolagskalendern noterar vidare Morgan Stanley European TMT i Barcelona 19 november och UBS-konferensen i Scottsdale 1 december — höstens [värderingssidor för teknikgrenen](/dataset/teknik/vardering) samlar fältet.

Läs mer i biblioteket: [universumjämförelsen för teknikgrenen](/dataset/teknik/universumjamforelse), [ROE-aspekten](/dataset/teknik/roe), [bruttomarginalen](/dataset/teknik/brutto-marginal), [nettomarginalen](/dataset/teknik/netto-marginal), [EV/EBIT-aspekten](/dataset/teknik/ev-ebit), [PEG](/dataset/teknik/peg), [FCF-avkastningen](/dataset/teknik/fcf-avkastning), [ROIC](/dataset/teknik/roic), [tillväxttaxan](/dataset/teknik/omsattning-cagr-5ar), [prognostillväxten](/dataset/teknik/prognos-tillvaxt) samt ASM:s [bolagssida](/bolag/asm-as). Kurserna i [utbildningen](/kurser) sammanfattar metodiken; [transparenssidan](/transparens) och [källförteckningen](/kallor) redovisar hur datainsamlingen går till.

## Källor

- ASM pressrelease Q2 2026 (2026-07-28, GlobeNewswire): omsättning ${sv(Q.q2_26.oms, 1)}, brutto ${sv(Q.q2_26.brutto, 1)} (${sv(Q.q2_26.bruttoPct, 1)} %), justerat rörelseresultat ${sv(Q.q2_26.jop, 1)} (${sv(Q.q2_26.jopPct, 1)} %), netto ${sv(Q.q2_26.netto, 1)} / justerat ${sv(Q.q2_26.jnetto, 1)}, FCF ${sv0(Q.q2_26.fcf)}, Q3-guide ${sv0(KALENDER.q3Guide)} ±${KALENDER.q3Spann} %, H2-utsaga, 2027-spannet, jämförelsekolumner Q1-26/Q2-25.
- ASM pressrelease Q1 2026 (2026-04-21, GlobeNewswire): Q1-tabellen ${sv(Q.q1_26.oms, 1)}/${sv(Q.q1_26.netto, 1)}, Q4-25- och Q1-25-kolumner, Q2-guiden ${sv0(Q.q1_26.guide)}.
- ASM pressrelease Q4/FY2025 (2026-03-03, GlobeNewswire): Q4/Q3-kolumner med orders ${sv(Q.q3_25.orders, 1)}/${sv(Q.q4_25.orders, 1)}, FY-rekorden (brutto 51,8 %, justerad rörelse 30,2 %), Kina över 30 procent av omsättningen, minne 16 procent av verktygsförsäljningen, utdelningsförslaget ${sv(KALENDER.utdelning2025, 2)} euro, återköpsprogrammet ${sv0(KALENDER.aterkop)}, orderredovisningens nedläggning.
- ASM kalender (asm.com/calendar, sökverifierad 2026-09-30): "Quarterly results Q3 2026" 27 oktober 2026 kl ${KALENDER.tid}; konferensdatum november–december.
- ASM tillkännagivande om ASMPT-innehavet (2025-11-02, asm.com): avsikt sälja cirka ${KALENDER.asmptSalu} procentenheter av cirka ${KALENDER.asmptAndelFore} procents andelen.
- Universumrad ASM.AS (data/portfolj-system/bolagsunivers.json, hämtad 2026-09-03, Yahoo + MarketStack-dubbelkoll): samtliga multiplar, marginaler, serier och kurs ${sv(U.pris, 2)} euro.
- Identitetstest, TTM-kedjor, EV-kedja, ROE-vägar, scenarioruta, multiplövning och guidearitmetik: egna beräkningar omräknade i byggmotorn (verktyg/_s4u3-asm-byggdata.mjs) och kontrollerade oberoende i KVD:n (verktyg/_s4u3-asm-kvd.mjs).

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar med källa och datum angivna; där en källa saknar data står det explicit, och där källans fält inte håller för kontroll redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

// ── PAKET ────────────────────────────────────────────────────────────────────

const paketJson = {
  slug: "sa-laser-du-asm-international-q3-2026",
  title: `ASM International kvartalsrapport Q3 2026: så läser du den — teknikspårets paket ${teknPaket + 1}: kvartalskedjan som stänger på öret (FY-2025 = 723,7 exakt, TTM inom en halv procent av P/E-fältet) men bär två sanningar (IFRS 1 074 mot justerat 915), kassan som vänder EV under börsvärdet (35,6 mot 38,1 mdr euro) och ordermörkret efter att orderredovisningen lades ner — fyra proxyer ur bolagets egna utsaggor`,
  description: `ASM International rapporterar Q3 2026 tisdagen 27 oktober kl 18:00 — datumet bolagsutlyst i egen kalender. Teknikspårets läspaket: sju kvartal där FY-2025-kedjan återvinner universumfältet på öret och TTM-nettot landar inom en halv procent av P/E-fältets bas — men med två sanningar (rapporterat P/E 35,7 mot justerat 41,7), EV-spegeln som visar nettokassa cirka 2,6 miljarder euro under börsvärdet 38,1 miljarder, ROE-gåtan (nettomarginal femma av 33, ROE först sextonde — kassan är möllstenen), utdelningstrappan 3,00 till 3,25 med återköpet 150 miljoner på fem veckor, och ordermörkret: sista ordertalet 802,8 (book-to-bill 1,15), därefter fyra proxyer. Scenarioruta i nio celler, multiplövning mot grenens medianer, tre läsövningar.`,
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: KALENDER.rappdag,
  readingMinutes: 5,
  tags: ["kvartalsrapport", "ASM International", "teknik", "halvledare", "nyckeltal", "läspaket"],
  body,
};

const utfil = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-asm-international-q3-2026.json";
if (!existsSync("data/blogg-utkast/kvartal/2026-q3")) throw new Error("katalog saknas");
writeFileSync(utfil, JSON.stringify(paketJson, null, 2) + "\n");

const ord = body.replace(/[#*|_>`[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
console.log("SKREV", utfil);
console.log("ord:", ord, "| teknikpaket före detta:", teknPaket, "| serienummer:", serienNr);
console.log("kontroller: fy25Netto", fy25Netto, "| ttmNetto", ttmNetto, "| ttmOms", ttmOms,
  "| peBas", r1(peBasNetto), "| gap", pct(ttmGap, 3), "| ev", r0(ev), "| nettokassa", r0(nettokassa));
console.log("scen mittruta:", scen[1][1].netto, "→ P/E", scen[1][1].pe, "| aktier", r1(aktier),
  "| epsRapp", r2(epsRapp), "| peJust", r2(peJust));
function r0(x) { return Math.round(x); }
