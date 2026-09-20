#!/usr/bin/env node
/**
 * s2-u1 omgång 22 (manifest auto-s2-1789882502912) — DATASET-DJUP:
 * SCHWEIZ/FINANS 0→1: UBS Group AG (UBSG.SW) — banklandets första bankrad.
 * Schweiz bär 4 grenar (halso/konsument/material/teknik) men INGEN finans;
 * UBS = världens största förmögenhetsförvaltare + CS-upptaget 2023 =
 * bank-pedagogikens sjätte arketype (ITUB · RY · HSBA.L · 8306.T ·
 * HDFCBANK.NS · UBSG.SW) med WEALTH-MANAGEMENT-modellen.
 * METOD: StockAnalysis SWX-primär (/quote/swx/UBSG/, ROG/STMN-precedensen)
 * hämtad 2026-09-20 (S&P Global MI-underlag; close 2026-09-18, sidan senast
 * kontrollerad 2026-09-20); Yahoo chart-API paranoid-koll (09-17 close 41,89
 * = SA:s "previous close" EXAKT; 09-18 in-progress 41,55 = SA:s close).
 * VALUTAARKITEKTUREN (PBR-precedensen omvänd): FY-serier i USD (UBS:s
 * rapporteringsvaluta), notering/nyckeltal i CHF — implicit FX ≈ 0,808
 * CHF/USD bevisad på tre oberoende par.
 * Bankkonvention (MUFG/BNP/ACA-raderna): evEbit/fcfYield/fcfMarginal/
 * skuldEgenkapital/rantaTackning NULL — insättningsbalansen gör EV/FCF
 * meningslösa; fcf-SERIEN förs (bank-OCF-artefakten dokumenterad).
 * ALL aritmetik maskinverifierad FÖRE skrivning (abort-grind, omg13-läxan).
 * Idempotent append på diskens faktiska läge (omg11–21-konventionen).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);
if (har("UBSG.SW")) {
  console.log("IDEMPOTENT: UBSG.SW finns redan — inget att göra.");
  process.exit(0);
}

// ── käldata (StockAnalysis /quote/swx/UBSG/, hämtat 2026-09-20) ──────────────
const K = {
  pris: 41.55, mcapMdr: 127.22,           // CHF
  pe: 17.52, peFwd: 12.81, pegKalla: 0.64, pb: 1.76, ptbv: 1.91, psKalla: 2.97,
  ebitM: 0.3114, pretaxM: 0.2255, nettoM: 0.1795, fcfMKalla: 0.2179, // statistics TTM
  roe: 0.1067, roa: 0.0057, wacc: 0.0184,
  kassaMdr: 464.90, skuldMdr: 484.16, nettkassaMdr: -19.26,
  ekMdr: 72.26, bvps: 23.53,             // CHF (statistics-ytan)
  aktierM: 3062, beta: 0.83, v52Spann: [28.25, 45.04],
  dps: 0.89, direktAvkKalla: 0.0214, payoutKalla: 0.3576, buybackYield: 0.0271, shareholderYield: 0.0484,
  revTTMchf: 42.86, nettoTTMchf: 7.69, epsTTM: 2.37,
  skatt: 0.2009, piotroski: 4, institutioner: 0.5174, insiders: 0.0045,
  // FY-serier M USD (rapporteringsvalutan) — CS-upptagets fulla båge
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    oms: [35502, 34177, 39614, 48029, 49596],
    netto: [7457, 7630, 27366, 5085, 7767],
    eps: [2.06, 2.25, 8.30, 1.52, 2.36],
    fcf: [-241, 21696, 31597, 16343, 32428],
    utdelningarM: [-1301, -1668, -1679, -2256, -2866],
    aterkopM: [-3341, -6006, -2779, -2923, -5178],
    ek: [61002, 57218, 86155, 85573, 90484],
    tbv: [50449, 46364, 72695, 73307, 78407],
    tillgangar: [1117182, 1104364, 1716924, 1565028, 1617427],
    aktierPerAr: [3400, 3108, 3209, 3175, 3092],
  },
  ttm: { rev: 53040, netto: 9520, eps: 2.93, ocf: 14174, capex: -2413, fcf: 11761, utd: -3404, aterkop: -6294 }, // M USD
};

// ── härledda tal + aritmetikgrind (abort FÖRE skrivning) ─────────────────────
const cagr = (a, b, perioder) => Math.pow(b / a, 1 / perioder) - 1;
const FEL = [];
const INFO = [];
const jamfor = (namn, calc, ext, tol) => {
  const ok = Math.abs(calc - ext) <= tol;
  if (!ok) FEL.push(`${namn}: beräknat ${calc} mot externt ${ext} (tol ${tol})`);
  return ok;
};

const prognos = K.pe / K.peFwd - 1; // +0,367681
jamfor("UBS prognosTillväxt", prognos, 0.367681, 0.0005);
jamfor("UBS peg-spår", K.pe / (prognos * 100), 0.4765, 0.005);
INFO.push("UBS PEG spår 0,48 mot källans fält 0,64 (källans bas: 3-års EPS-prognos 19,18 %/år) — spårets TTE-konvention bär (ACA/GLE/AMUN-familjen)");
jamfor("UBS revCAGR", cagr(K.serier.oms[0], K.serier.oms[4], 4), 0.087172, 0.0005);
jamfor("UBS resCAGR", cagr(K.serier.netto[0], K.serier.netto[4], 4), 0.010235, 0.0005);
INFO.push("UBS endpoint-CAGR-fällan dokumenterad: netto 7 457 → 7 630 → 27 366 → 5 085 → 7 767 M USD — endpointen +1,0 %/år är PLATT men banan bär CS-upptagets negativa goodwill FY2023 (27,4 mdr netto, EPS 8,30 — ALDRIG extrapolerbar) följt av integrationsåret FY2024 (−81,7 % EPS) och återhämtningen FY2025 +52,7 %; GLE-precedensens spegelbild: platt endpoint, dramatisk bana");
jamfor("UBS netto-marginal USD-bas", K.ttm.netto / K.ttm.rev, 0.179487, 0.0005);
jamfor("UBS netto-marginal CHF-bas", K.nettoTTMchf / K.revTTMchf, 0.179421, 0.0005);
INFO.push("UBS netto-marginal två valutobaser GER SAMMA TAL: 9 520÷53 040 = 17,95 % (USD) och 7,69÷42,86 = 17,94 % (CHF) — marginalsrustningen är valutaneutral, fältet bär statistics 17,95 %");
jamfor("UBS direktavkastning", K.dps / K.pris, K.direktAvkKalla, 0.0005);
jamfor("UBS payout aktiebas", K.dps / K.epsTTM, 0.3755, 0.005);
INFO.push("UBS payout två baser: aktiebas 0,89÷2,37 = 37,6 % mot källans fält 35,76 % (källans DPS/EPS-fönster; spridningen 1,8 pp dokumenterad — HEN3/JNJ-klassen)");
jamfor("UBS aktiebas pris/EPS", K.pris / K.epsTTM, 17.5316, 0.01);
const peSpread = (K.pris / K.epsTTM) / K.pe - 1;
INFO.push(`UBS P/E-källspridning: aktiebas 17,53 mot källans fält 17,52 (+${(peSpread * 100).toFixed(2)} % — EPS-rundning 2,37; tightaste fönstret i universumets finans-gren)`);
if (Math.abs(peSpread - 0.0007) > 0.004) FEL.push("UBS aktiebas-P/E-spridning avviker från dokumentationen");
jamfor("UBS P/B mcap/EK", K.mcapMdr / K.ekMdr, K.pb, 0.005);
jamfor("UBS P/B pris/BVPS", K.pris / K.bvps, 1.7658, 0.005);
INFO.push("UBS P/B två baser: mcap÷EK 127,22÷72,26 = 1,7606 (källans fält 1,76 EXAKT) och pris÷BVPS 41,55÷23,53 = 1,766 (+0,3 % — vägt aktietal, HEN3/8411-klassen); P/TBV 1,91");
const mcapIdent = (K.pris * K.aktierM) / (K.mcapMdr * 1000) - 1;
INFO.push(`UBS mcap-identitet: 41,55 × 3 062 M = 127,23 mdr mot källans 127,22 (+${(mcapIdent * 100).toFixed(3)} % — tightaste möjliga fönster, tre aktientalsytor sammanfaller: översikt 3,06 mdr · BS jun-26 3 062 M)`);
if (Math.abs(mcapIdent - 0.00005) > 0.003) FEL.push("UBS mcap-identitet avviker från dokumentationen");
jamfor("UBS nettokassa-replik", K.kassaMdr - K.skuldMdr, K.nettkassaMdr, 0.01);
INFO.push("UBS NETTOSKULD-struktur: kassa 464,90 mot skuld 484,16 mdr CHF = −19,26 mdr (−6,29/aktie) — universumets banker bär oftare NETTKASSA (BNP +402 · ACA · GLE · MUFG +44 T-klassen); UBS:s tradingbok finansierar via skuldsidan, dokumenterat");
// FX-arkitekturen: tre oberoende par ⇒ samma implicita kurs
jamfor("UBS FX-par rev", K.revTTMchf * 1000 / K.ttm.rev, 0.8081, 0.002);
jamfor("UBS FX-par netto", K.nettoTTMchf * 1000 / K.ttm.netto, 0.8078, 0.002);
jamfor("UBS FX-par EPS", K.epsTTM / K.ttm.eps, 0.8089, 0.002);
INFO.push("UBS VALUTA-IDENTITETEN: TTM USD→CHF ger 0,8081 (rev) · 0,8078 (netto) · 0,8089 (EPS) — tre oberoende par, ETT band 0,808 ± 0,0006 CHF/USD; PBR-precedensen omvänd (FY-BRL/TTM-USD ⇒ här FY-USD-serier + CHF-notering)");
jamfor("UBS shareholder yield", K.direktAvkKalla + K.buybackYield, K.shareholderYield, 0.0005);
jamfor("UBS TBVPS-replik", 82319 / 3062, 26.88, 0.01);
if (!(K.v52Spann[0] <= K.pris && K.pris <= K.v52Spann[1])) FEL.push("UBS pris utanför 52-v-spann");
if (K.serier.ar.length !== 5 || K.serier.oms.length !== 5 || K.serier.netto.length !== 5 || K.serier.fcf.length !== 5) FEL.push("UBS serielängder");
const monoOk = K.serier.ar.every((x, i) => i === 0 || Number(x) > Number(K.serier.ar[i - 1]));
if (!monoOk) FEL.push("UBS årsetiketter ej stigande");
const fcfPos = K.serier.fcf.filter((x) => x > 0).length;
if (fcfPos !== 4) FEL.push("UBS fcfPositivaSenaste5 stämmer ej med serien");
jamfor("UBS ROE−WACC", K.roe - K.wacc, 0.0883, 0.0005);

if (FEL.length) {
  console.error("ABORT — aritmetikgrind RÖD:");
  for (const f of FEL) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("ARITMETIK GRÖN — samtliga kontroller inom tolerans");
for (const i of INFO) console.log("  ℹ " + i);

// ── raden (bankkonvention enligt MUFG/BNP/ACA; notering dokumenterar fynden) ─
const rad = {
  ticker: "UBSG.SW", namn: "UBS Group AG", bransch: "finans", land: "Schweiz", valuta: "CHF",
  kallor: [
    { namn: "StockAnalysis", hamtat: "2026-09-20", url: "https://stockanalysis.com/quote/swx/UBSG/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
      paranoid: "SWX-PRIMÄRNOTING i CHF (ROG/STMN-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18, sidan hämtad 2026-09-20): pris 41,55 CHF (−0,81 %), mcap 127,22 mdr CHF (aktiebas-identitet 41,55 × 3 062 M = 127,23 mdr = +0,005 % — tightaste fönstret i finans-grenen), 52-v 28,25–45,04 (−7,7 % från toppen · +47,1 % från botten); P/E 17,52 (aktiebas 41,55÷2,37 = 17,53 = +0,07 % EPS-rundning) forward 12,81 ⇒ prognosTillväxt +36,8 % TTE (PEG spår 0,48; källans fält 0,64 på 3-års EPS-prognos 19,18 %/år — TTE-konventionen bär), P/B 1,76 (127,22÷72,26 = 1,7606 EXAKT; pris÷BVPS 41,55÷23,53 = 1,766 +0,3 % vägt aktietal), P/TBV 1,91, PS 2,97; EV n/a (BANK — kassa 464,90 mot skuld 484,16 mdr CHF = NETTOSKULD 19,26 mdr (−6,29/aktie); universumets banker bär oftare nettokassa, UBS:s tradingbok finansierar via skuldsidan — MUFG/BNP-konventionen: EV/FCF/skuld-EK/räntetäckning meningslösa ⇒ null); VALUTA-IDENTITETEN (PBR-precedensen omvänd): FY-serier i USD (UBS:s RAPPORTERINGSVALUTA), notering/nyckeltal CHF — implicit FX 0,8081/0,8078/0,8089 CHF/USD bevisad på tre par (rev 42,86÷53,04 · netto 7,69÷9,52 · EPS 2,37÷2,93), marginalsrustningen valutaneutral (17,94 % CHF = 17,95 % USD); marginaler TTM: operating 31,14 % pretax 22,55 % netto 17,95 % (statistics); FCF-marginal källfält 21,79 % dokumenterat men fältet NULL enligt bankkonventionen (MUFG/BNP/ACA — insättningsbalansen); ROE 10,67 % ROA 0,57 % ROIC n/a (bank) WACC 1,84 % (schweizisk lågränta — 8306.T:s 1,64-klassen; ROE−WACC +8,83 pp); equity 72,26 mdr CHF, BVPS 23,53; TBV jun-26 82,32 mdr USD = 26,88 USD/aktie replikerbar EXAKT (82 319÷3 062); aktier 3 062 M (−2,71 % YoY, −0,91 % QoQ — ÅTERKÖPSVÄGEN; FY-serien 3 400→3 108→3 209→3 175→3 092→3 062 M = −9,9 % sedan FY2021, 2023-höjningen = CS-aktierna); TTM jun-26 (M USD): rev 53 040 (+10,74 %) netto 9 520 (+51,5 %) EPS 2,93 (+55,5 %) OCF 14 174 capex −2 413 FCF 11 761; FY-serier kalenderår (M USD): rev 35 502→34 177→39 614→48 029→49 596 (+8,7 %/år FY2021→FY2025), netto 7 457→7 630→27 366→5 085→7 767 (endpoint +1,0 %/år — CS-UPPTAGETS BÅGE: FY2023 bär den negativa goodwillen ~28,9 mdr, EPS 8,30 aldrig extrapolerbar; FY2024 integrationsåret −81,7 % EPS; FY2025 +52,7 %), EPS 2,06→2,25→8,30→1,52→2,36; fcf-serien −241→21 696→31 597→16 343→32 428 (BANK-OCF-ARTEFAKTEN: kundmedels- och tradingflöden, ej driftskassa — BNP-noten ordagrant, fältet fcfYield null); utdelningar −1 301→−1 668→−1 679→−2 256→−2 866, återköp −3 341→−6 006→−2 779→−2 923→−5 178 (TTM −6 294 = REKORDNIVÅ, buyback-yield 2,71 %); balansräkningens CS-HOPP: tillgångar 1 104→1 717 mdr USD FY2022→FY2023 (+55 %), EK 57,2→86,2 mdr, TBV 46,4→72,7 mdr — upptagets dubbla balansräkningslärobok (tillgångar OCH ny aktiebas); jun-26: tillgångar 1 707 mdr USD (megabankkalibern — HSBA/8306-klassen), EK 89,4 mdr; utdelning 0,89 CHF (2,14 %) payout aktiebas 37,6 % (källans fält 35,76 % — fönstrets spridning dokumenterad), DPS-tillväxt +16,44 % YoY (fyra raka tillväxtår enligt källan), ex-div 2026-04-21 (ÅRLIG aprilutdelning — schweizisk konvention), shareholder yield 4,84 % (utdelning 2,14 + återköp 2,71); effektiv skatt 20,09 %; Piotroski 4; beta 0,83 (5Y); institutioner 51,74 % insiders 0,45 %; 99 085 anställda; grundat 1862 (källpaketet; NYSE-ADR UBS noterad allmän faktakunskap, ej källpaketet); nästa rapp Q3 2026-10-28 (BNP samma dag — bankföljden); branschfält Financials/Banks—Diversified; analytiker Buy PT 44,40 CHF (+6,86 %; 17 st)" },
    { namn: "Yahoo Finance (chart-API)", hamtat: "2026-09-20", url: "https://query1.finance.yahoo.com/v8/finance/chart/UBSG.SW?range=1mo&interval=1d",
      paranoid: "paranoid kurskoll: Yahoo 09-17 close 41,89 CHF = SA:s 'previous close' EXAKT; 09-18 sessionen NULL-på-close i chart-API:t men regularMarketPrice 41,55 = SA:s 09-18 close EXAKT (två oberoende ytor, noll spread); bandet 09-14 43,33/09-15 41,86/09-16 41,76 kalibrerar nivån; valutafält CHF bekräftat" },
  ],
  hamtat: "2026-09-20",
  pris: 41.55, marknadsKapitalMdr: 127.22,
  tillvaxt: { omsattningCAGR5ar: 0.0872, resultatCAGR5ar: 0.0102, omsattningTillvaxtTTM: 0.1074, prognosTillvaxt: 0.3677 },
  lonksamhet: { roe: 0.1067, roic: null, bruttoMarginal: null, ebitMarginal: 0.3114, nettoMarginal: 0.1795, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 17.52, pb: 1.76, evEbit: null, peg: 0.48, fcfYield: null, egenKapitalMultipl: 1.76 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [35502000000, 34177000000, 39614000000, 48029000000, 49596000000], resultat: [7457000000, 7630000000, 27366000000, 5085000000, 7767000000], egetKapital: [], fcf: [-241000000, 21696000000, 31597000000, 16343000000, 32428000000] },
  notering: "BANKLANDETS FÖRSTA BANKRAD — Schweiz/finans 0→1: världens mest banktäta ekonomi (UBS · Credit Suisse · Zürich/Geneva-förvaltningen) fick äntligen sin finansrad; Schweiz 4→5 grenar (halso 5 · konsument 1 · material 1 · teknik 1 · finans 1). CS-UPPTAGETS FULLA BÅGE I EN FEMÅRSSERIE: netto 7 457 → 7 630 → 27 366 → 5 085 → 7 767 M USD — FY2023 bär den negativa goodwillen från Credit Suisse-upptaget (juni 2023, EPS 8,30 = engångspostens år, ALDRIG extrapolerbar), FY2024 är integrationsåret (−81,7 % EPS) och FY2025→TTM återhämtningen (+52,7 % → TTM 9 520 M USD, EPS 2,93 USD = 2,37 CHF +55,5 %); endpoint-CAGR +1,0 %/år dokumenterar engångspostens vikt (GLE-precedensens spegelbild: platt endpoint, dramatisk bana). BALANSRÄKNINGENS CS-HOPP: tillgångar 1 104 → 1 717 mdr USD (+55 % ett år) med EK 57,2 → 86,2 mdr och aktiebasen 3 108 → 3 209 M (CS-aktierna) — därefter FY2024-tvätten av balansen (1 565) och jun-26 på 1 707 mdr = megabankkalibern; aktieantalet −9,9 % sedan FY2021 = ÅTERKÖPSMASKINEN (TTM-återköp 6 294 M USD = rekordnivå, buyback-yield 2,71 %, shareholder yield 4,84 % på utdelning 2,14 + återköp 2,71). WEALTH-MANAGEMENT-ARKETYPEN = bank-pedagogikens sjätte ben: ITUB (emerging retail) · RY (nordamerikansk universal) · HSBA.L (brittisk universal) · 8306.T (japansk megabank) · HDFCBANK.NS (indisk retail) · UBSG.SW (GLOBAL förmögenhetsförvaltning + investmentbank) — förvaltningskapitalens avgiftsekonomi mot insättningsbankens räntenetto i EN kvartilsvy. KVARTILPLACERING: P/E 17,52 = finans-grenens övre halva (bankradernas 8,7–10,6-klass under, renodlade förvaltare/finansjättar ovan); P/B 1,76 = mitt i spans GLE 0,65–RY 2,72. ROE 10,67 % mot WACC 1,84 % (schweizisk lågränta) = +8,83 pp. NETTOSKULD 19,26 mdr CHF — universumets banker bär oftare nettokassa; tradingbokens finansiering dokumenterad. VALUTAARKITEKTUR (PBR-precedensen omvänd): FY-serier M USD (rapporteringsvalutan), notering/nyckeltal CHF, implicit FX 0,808 ± 0,0006 bevisad på tre par. Bankkonvention: EV/FCF/skuld-EK/räntetäckning null, fcf-serien artefaktbärare (BNP-noten). ÅRLIG aprilutdelning 0,89 CHF (ex-div 2026-04-21). Beta 0,83; Piotroski 4; skatt 20,09 %; 99 085 anställda; grundat 1862. Nästa rapp 2026-10-28 (Q3, BNP samma dag).",
};

// ── innehållsintegritet: gamla rader orörda (bevis efter skrivning) ──────────
const gamlaJson = JSON.stringify(u);
u.push(rad);
writeFileSync(FIL, JSON.stringify(u, null, 1) + "\n");

const efter = JSON.parse(readFileSync(FIL, "utf8"));
const gamlaIgen = efter.slice(0, innan).map(JSON.stringify);
const gamlaFore = JSON.parse(gamlaJson).map(JSON.stringify);
const forandrade = gamlaFore.filter((r, i) => r !== gamlaIgen[i]).length;
console.log(`APPEND: ${innan} → ${efter.length} (+1); gamla rader förändrade: ${forandrade}`);
if (forandrade !== 0) { console.error("ABORT — gamla rader förändrade!"); process.exit(1); }

// ── medianer + kvartiler (EXAKT replik av raknaBranschMedianer) ──────────────
const median = (v) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const r1 = (x) => x === null ? "—" : String(Math.round(x * 10) / 10).replace(".", ",");
const statP = (arr, f) => { const v = arr.map((b) => f(b) ?? null).filter((x) => typeof x === "number" && Number.isFinite(x)); return { median: median(v), p25: percentil(v, 0.25), p75: percentil(v, 0.75), n: v.length }; };

const fore = efter.filter((b) => b.ticker !== "UBSG.SW");
for (const [namn, arr] of [["TOTALT före", fore], ["TOTALT efter", efter], ["finans före", fore.filter((b) => b.bransch === "finans")], ["finans efter", efter.filter((b) => b.bransch === "finans")]]) {
  const pe = statP(arr, (b) => b.vardering?.pe);
  const pb = statP(arr, (b) => b.vardering?.pb);
  const ebit = statP(arr, (b) => b.lonksamhet?.ebitMarginal);
  const res = statP(arr, (b) => b.tillvaxt?.resultatCAGR5ar);
  console.log(`${namn}: n=${arr.length} · P/E ${r1(pe.median)} (kv ${r1(pe.p25)}–${r1(pe.p75)}, n ${pe.n}) · P/B ${r1(pb.median)} · EBIT ${r1(ebit.median === null ? null : ebit.median * 100)} % · resCAGR ${r1(res.median === null ? null : res.median * 100)} % (n ${res.n})`);
}
const cell = efter.filter((b) => b.land === "Schweiz" && b.bransch === "finans");
console.log(`CELL Schweiz/finans: ${cell.length} rad(er) — ${cell.map((b) => b.ticker).join(", ")} (landsidans gränsregel ≥5: ej aktuell, grundplåt lagd)`);
const totPeE = statP(efter, (b) => b.vardering?.pe);
console.log(`UNIVERSUMJÄMFÖRELSE: UBS P/E 17,52 mot finans-medianen och universumets ${r1(totPeE.median)} — placeringen i utskrift nedan`);

// ── UBS:s kvartilsplacering (uppgiftens kärna: universumjämförelsen) ────────
const placera = (ticker, f, pct) => {
  const b = efter.find((x) => x.ticker === ticker);
  if (!b) { console.log(`KVARTIL ${ticker}: EJ PÅ DISK`); return; }
  const varde = f(b);
  const fin = efter.filter((x) => x.bransch === "finans");
  const iFin = fin.filter((x) => typeof f(x) === "number").map(f).sort((a, c) => a - c);
  const iAll = efter.filter((x) => typeof f(x) === "number").map(f).sort((a, c) => a - c);
  const fmt = (x) => (pct ? (100 * x).toFixed(1).replace(".", ",") + " %" : String(x).replace(".", ","));
  console.log(`KVARTIL ${ticker}: ${fmt(varde)} = rad ${iFin.indexOf(varde) + 1} av ${iFin.length} i finans (P25 ${svTal(percentil(fin.map(f), 0.25) * (pct ? 100 : 1))} · median ${svTal(median(fin.map(f)) * (pct ? 100 : 1))} · P75 ${svTal(percentil(fin.map(f), 0.75) * (pct ? 100 : 1))}${pct ? " %" : ""}) · universumrad ${iAll.filter((x) => x < varde).length + 1} av ${iAll.length} (median ${svTal(median(efter.map(f)) * (pct ? 100 : 1))}${pct ? " %" : ""})`);
};
const svTal = (x) => (x === null ? "—" : String(Math.round(x * 10) / 10).replace(".", ","));
placera("UBSG.SW", (b) => b.vardering?.pe, false);
placera("UBSG.SW", (b) => b.vardering?.pb, false);
placera("UBSG.SW", (b) => b.lonksamhet?.roe, true);
for (const t of ["ITUB", "RY", "HSBA.L", "8306.T", "HDFCBANK.NS", "BNP.PA", "UBSG.SW"]) {
  const r = efter.find((x) => x.ticker === t);
  if (r) console.log(`FINANS-ARKETYP: ${t} P/E ${r.vardering.pe} | P/B ${r.vardering.pb} | ROE ${r.lonksamhet?.roe ?? "null"}`);
}
