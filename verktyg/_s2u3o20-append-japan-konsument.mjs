#!/usr/bin/env node
/**
 * s2-u3 omg20 (manifest auto-s2-1789831500945) — DATASET-DJUP:
 * JAPAN/KONSUMENT +3: 3382.T (Seven & i) + 2914.T (Japan Tobacco) +
 * 4452.T (Kao) — cellen matta 2→5 P/E-mätbara ⇒ /dataset/konsument/japan
 * föds vid nästa prod-bygge (land.ts-japanmodulen byggs i samma leverans,
 * tyskland-/australien-precedenserna omg17/18).
 * HONDA-PIVOTEN: 7267.T sonderades FÖRST men TTM-netto −169,7 mdr ¥
 * (P/E n/a) ⇒ avvisad enligt spårets P/E-bärande-kriterium (Sony-fällan,
 * omg18) — dokumenterad i anspråksfilen; Kao (4452.T) tog platsen.
 * Cellens fem affärsmodeller efter leverans: bilcykel (TM) + varumärkes-
 * plagg (9983.T) + närbutik (3382.T) + tobak (2914.T) + hushållsvarumärken
 * (4452.T) = kvartilpedagogik i EN cell.
 * Idempotent append på diskens faktiska läge (omg11–18-konventionen).
 * Källa StockAnalysis TYO-primär (/quote/tyo/, 8035.T-/9983.T-precedenserna)
 * hämtad 2026-09-19 (S&P Global MI-underlag, close 2026-09-18 15:30 JST).
 * ALL aritmetik maskinverifierad FÖRE skrivning (abort-grind, omg13-läxan).
 * Enhetshygiien: mcapMdr i mdr ¥; skuld/kassa/EBIT/serier i M¥ — alla
 * repliker kör mcapMdr×1000 (s4-u2:s KVD-enhetsfälla dokumenterad).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));
const innan = u.length;
const har = (t) => u.some((b) => b.ticker === t);

// ── käldata (StockAnalysis /quote/tyo/, hämtat 2026-09-19; paranoid per rad) ─
const K = {
  SVEN: {
    // JPY hela vägen; FY mars–februari (slutårsetikett = slutåret, FMG-konventionen)
    pris: 2020, mcapMdr: 4290, // JPY mdr
    pe: 15.90, peFwd: 16.60, pegKalla: 7.10, pb: 1.15, evEbit: 16.29, evEbitda: 7.77,
    bruttoM: 0.1636, ebitM: 0.0542, nettoM: 0.0356, fcfM: 0.0538,
    roe: 0.0805, roic: 0.0465, roa: 0.0279, wacc: 0.0290,
    skuldM: 3878661, kassaStatM: 661460, nettoSkuldM: 3217205, skuldEk: 1.04, rantaTack: 9.74,
    ocfTTM: 774897, capexTTM: 315083, fcfTTM: 459814, // JPY M
    revTTM: 8544490, nettoTTM: 304346, epsTTM: 127.02, ebitTTM: 462960, evKalla: 7530000, // JPY M
    dps: 60, direktAvk: 0.0297, payoutKalla: 0.3922, payoutAktiebas: 0.47241,
    aktier: 2124, beta: 0.09, v52Spann: [1811, 2417], v52Change: 0.0218,
    rapport: "2026-10-08", analytiker: "Hold mål 2 271,25 ¥ (+12,4 %), 16 st",
    utdelningarJPY: [87490, 89762, 106092, 101408, 113563],
    aterkopJPY: [22, 16, 52393, 59643, 600004],
    kassaFall: [1368663, 438634], // FY2025 → FY2026 (feb)
    serier: { ar: ["2022", "2023", "2024", "2025", "2026"], oms: [8749752, 11811303, 11471753, 11972762, 10430269], netto: [210774, 280976, 224623, 173068, 292760], ek: [3147730, 3648160, 3900624, 4217444, 3648194], fcf: [398971, 623259, 335576, 445592, 333118] }, // JPY M, feb-FY
  },
  JT: {
    // JPY hela vägen; kalenderår
    pris: 6886, mcapMdr: 12230,
    pe: 20.04, peFwd: 17.87, pegKalla: 1.28, pb: 2.76, evEbit: 12.89, evEbitda: 10.87,
    bruttoM: 0.5686, ebitM: 0.2700, nettoM: 0.1673, fcfM: 0.1437,
    roe: 0.1430, roic: 0.1291, roa: 0.0741, wacc: 0.0481,
    skuldM: 1676772, kassaM: 827909, nettoSkuldM: 848863, skuldEk: 0.38, rantaTack: 13.47,
    ocfTTM: 677934, capexTTM: 143449, fcfTTM: 534485,
    revTTM: 3719202, nettoTTM: 622099, epsTTM: 350.41, ebitTTM: 1004226, evKalla: 13100000,
    dps: 272, direktAvk: 0.0395, payoutKalla: 0.6677, payoutAktiebas: 0.77625,
    aktier: 1780, beta: 0.15, v52Spann: [4734, 7218], v52Change: 0.4509,
    rapport: "2026-10-29", analytiker: "Buy mål 7 232,08 ¥ (+5,0 %), 13 st",
    goodwillJPY: [2060965, 2446063, 2616440, 2914254, 2923096], // FY2021–FY2025
    goodwillTTM: 2986714,
    utdelningarJPY: [251935, 266175, 367331, 349645, 356853],
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [2324838, 2657832, 2841077, 3149759, 3467675], netto: [338490, 442716, 482288, 179240, 510175], ek: [2886081, 3616761, 3912492, 3848727, 4115389], fcf: [512559, 402388, 472153, 502242, 370852] }, // JPY M, dec-FY
  },
  KAO: {
    // JPY hela vägen; kalenderår
    pris: 3478, mcapMdr: 3147,
    pe: 23.26, peFwd: 21.66, pegKalla: 1.71, pb: 2.74, evEbit: 15.64, evEbitda: 12.03,
    bruttoM: 0.4017, ebitM: 0.1109, nettoM: 0.0777, fcfM: 0.0841,
    roe: 0.1232, roic: 0.1282, roa: 0.0656, wacc: 0.0502,
    skuldM: 237207, kassaM: 326659, nettokassaM: 89452, skuldEk: 0.21, rantaTack: 51.22,
    ocfTTM: 208421, capexTTM: 61099, fcfTTM: 147322,
    revTTM: 1751545, nettoTTM: 136112, epsTTM: 149.50, ebitTTM: 194162, evKalla: 3090000,
    dps: 78, direktAvk: 0.0224, payoutKalla: 0.5193, payoutAktiebas: 0.52174,
    aktier: 904.76, beta: 0.19, v52Spann: [2880, 3782], v52Change: 0.0351,
    rapport: "2026-11-05", analytiker: "Buy mål 4 038,46 ¥ (+16,1 %), 13 st",
    utdelningarJPY: [67859, 68931, 69339, 70246, 71149],
    serier: { ar: ["2021", "2022", "2023", "2024", "2025"], oms: [1418768, 1551059, 1532579, 1628448, 1688633], netto: [109636, 86038, 43870, 107767, 120081], ek: [983877, 995384, 1012043, 1098835, 1094700], fcf: [115573, 65385, 148315, 144181, 138466] }, // JPY M, dec-FY
  },
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
const moatFalt = (n) => {
  const bm = n.serier.oms.map((o, i) => n.bruttoSerie[i] / o);
  const medel = bm.reduce((a, b) => a + b, 0) / bm.length;
  return { medel, spread: Math.max(...bm) - Math.min(...bm) };
};

// 3382.T — Seven & i Holdings
{
  const n = K.SVEN;
  n.bruttoSerie = [2732380, 3307686, 3410834, 3486921, 3130034]; // FY bruttovinst JPY M
  const prognos = n.pe / n.peFwd - 1;                            // −0,04217 NEGATIVT
  jamfor("SVEN prognosgap (negativt)", prognos, -0.04217, 0.0005);
  INFO.push(`SVEN NEGATIVT prognosgap ${(prognos * 100).toFixed(1)} % (P/E ${n.pe} mot forward ${n.peFwd}) ⇒ prognosTillväxt/PEG sätts null enligt BUD-konventionen (källans PEG 7,10 på 3-års EPS-prognos ~2,2 %/år kalibrerar — universumets fjärde dokumenterat negativa gap: BUD −0,7 · BEI −8,6 · FMG −11,6 · SVEN −4,2)`);
  jamfor("SVEN revCAGR", cagr(n.serier.oms[0], n.serier.oms[4], 4), 0.04489, 0.0005);
  jamfor("SVEN resCAGR", cagr(n.serier.netto[0], n.serier.netto[4], 4), 0.08561, 0.0005);
  jamfor("SVEN fcfYield", n.fcfTTM / (n.mcapMdr * 1000), 0.10718, 0.0005);
  jamfor("SVEN EV/EBIT fönster", n.evKalla / n.ebitTTM, 16.265, 0.01);
  jamfor("SVEN EV-replik mcap+nettoskuld", (n.mcapMdr * 1000 + n.nettoSkuldM) / n.ebitTTM, 16.215, 0.005);
  INFO.push(`SVEN EV/EBIT-källspridning: källa-EV ${((n.evKalla / n.ebitTTM)).toFixed(2)} och replik ${(((n.mcapMdr * 1000 + n.nettoSkuldM) / n.ebitTTM)).toFixed(2)} mot källans fält ${n.evEbit} (−0,2 resp −0,5 % — källans EV bär exakta poster; repliken nettoskuld-fönstret statistics-TTM mot balans feb 3 355 mdr)`);
  jamfor("SVEN direktavkastning", n.dps / n.pris, n.direktAvk, 0.0005);
  jamfor("SVEN payout aktiebas", n.dps / n.epsTTM, n.payoutAktiebas, 0.0005);
  INFO.push(`SVEN payout två baser: källans fält ${(n.payoutKalla * 100).toFixed(1)} % (kärn-EPS-bas ≈153 ¥) mot aktiebas GAAP ${(n.payoutAktiebas * 100).toFixed(1)} % (60÷127,02) — scope-årets dubbla vinstläsning, båda dokumenterade`);
  jamfor("SVEN aktiebas pris/EPS", n.pris / n.epsTTM, 15.906, 0.01);
  if (Math.abs((n.pris / n.epsTTM) / n.pe - 1) > 0.001) FEL.push("SVEN aktiebas-P/E avviker från källans fält");
  INFO.push(`SVEN P/E-fönster: aktiebas ${(n.pris / n.epsTTM).toFixed(2)} = källans fält ${n.pe} EXAKT (EPS 127,02 på viktat aktiesnitt ≈2,40 mdr under TTM-fönstret — återköpen drog nuvarande bas till ≈2,12 mdr; mcap/netto-panelen 4 290÷304 = 14,10 = −11 % mot fältet: TTM-nettot bär maj'25–maj'26-fönstret med lägre netto — fönstren dokumenterade öppet)`);
  jamfor("SVEN mcap-identitet", (n.pris * n.aktier) / (n.mcapMdr * 1000) - 1, 0.00011, 0.005);
  jamfor("SVEN P/B equity", (n.mcapMdr * 1000) / 3716661, n.pb, 0.005);
  const m = moatFalt(n);
  jamfor("SVEN moat-medel5ar", m.medel, 0.29622, 0.0005);
  jamfor("SVEN moat-spread5ar", m.spread, 0.03215, 0.0005);
  INFO.push(`SVEN brutto-fönstrens gap: TTM-statistics ${(n.bruttoM * 100).toFixed(1)} % mot FY-seriens ${(m.medel * 100).toFixed(1)} % medel — TTM-fönstret (maj'25–maj'26) bär omstruktureringens omklassificering av kostnadsposter; fältet bär statistics-TTM (VITEC-lärdomen), moat-fälten FY-serien (GSK-konventionen), båda dokumenterade`);
  if (!(n.v52Spann[0] <= n.pris && n.pris <= n.v52Spann[1])) FEL.push("SVEN pris utanför 52-v-spann");
  if (n.serier.ar.length !== 5 || n.serier.oms.length !== 5 || n.serier.netto.length !== 5 || n.serier.ek.length !== 5 || n.serier.fcf.length !== 5) FEL.push("SVEN serielängder");
}
// 2914.T — Japan Tobacco
{
  const s = K.JT;
  s.bruttoSerie = [1367977, 1566843, 1615103, 1742297, 1948584];
  const prognos = s.pe / s.peFwd - 1;                            // +0,12143
  jamfor("JT prognosTillväxt", prognos, 0.12143, 0.0005);
  jamfor("JT peg-spår", s.pe / (prognos * 100), 1.6502, 0.005);
  INFO.push(`JT PEG spår 1,65 mot källans fält 1,28 (källans bas: annan tillväxtserie) — spårets TTE-konvention bär`);
  jamfor("JT revCAGR", cagr(s.serier.oms[0], s.serier.oms[4], 4), 0.10511, 0.0005);
  jamfor("JT resCAGR", cagr(s.serier.netto[0], s.serier.netto[4], 4), 0.10799, 0.0005);
  jamfor("JT fcfYield", s.fcfTTM / (s.mcapMdr * 1000), 0.04370, 0.0005);
  jamfor("JT EV/EBIT fönster", s.evKalla / s.ebitTTM, 13.045, 0.01);
  jamfor("JT EV-replik", (s.mcapMdr * 1000 + s.nettoSkuldM) / s.ebitTTM, 13.024, 0.005);
  const evSpread = (s.mcapMdr * 1000 + s.nettoSkuldM) / s.ebitTTM / s.evEbit - 1;
  INFO.push(`JT EV/EBIT-källspridning: replik ${(((s.mcapMdr * 1000 + s.nettoSkuldM) / s.ebitTTM)).toFixed(2)} mot källans fält ${s.evEbit} (+${(evSpread * 100).toFixed(1)} % — källans fält räknar på justerad EBIT-bas ≈1 016 mdr ¥, panelens 1 004; VALE/BUD-familjen, fältet bär källans)`);
  if (Math.abs(evSpread - 0.0104) > 0.005) FEL.push("JT EV/EBIT-spridning avviker från dokumentationen");
  jamfor("JT direktavkastning", s.dps / s.pris, s.direktAvk, 0.0005);
  jamfor("JT payout aktiebas", s.dps / s.epsTTM, s.payoutAktiebas, 0.0005);
  INFO.push(`JT payout två baser: källans fält ${(s.payoutKalla * 100).toFixed(1)} % (kärn-bas EPS ≈407 ¥) mot aktiebas GAAP ${(s.payoutAktiebas * 100).toFixed(1)} % (272÷350,41) — båda dokumenterade`);
  jamfor("JT aktiebas pris/EPS", s.pris / s.epsTTM, 19.653, 0.01);
  const peSpread = (s.pris / s.epsTTM) / s.pe - 1;
  if (Math.abs(peSpread + 0.0194) > 0.006) FEL.push("JT aktiebas-P/E-spridning avviker från dokumentationen");
  INFO.push(`JT P/E-källspridning: aktiebas ${(s.pris / s.epsTTM).toFixed(2)} mot källans fält ${s.pe} (${(peSpread * 100).toFixed(1)} % — källans P/E-bas EPS ≈343,6 ¥ mot panelens 350,41; viktat aktiesnitt i EPS-fönstret, dokumenterat)`);
  jamfor("JT mcap-identitet", (s.pris * s.aktier) / (s.mcapMdr * 1000) - 1, 0.00221, 0.005);
  jamfor("JT P/B equity", (s.mcapMdr * 1000) / 4423050, s.pb, 0.006);
  const m = moatFalt(s);
  jamfor("JT moat-medel5ar", m.medel, 0.57226, 0.0005);
  jamfor("JT moat-spread5ar", m.spread, 0.03636, 0.0005);
  jamfor("JT goodwill-bågen TTM", s.goodwillTTM / s.goodwillJPY[0], 1.4493, 0.001);
  if (!(s.v52Spann[0] <= s.pris && s.pris <= s.v52Spann[1])) FEL.push("JT pris utanför 52-v-spann");
  if (s.serier.ar.length !== 5 || s.serier.oms.length !== 5 || s.serier.netto.length !== 5 || s.serier.ek.length !== 5 || s.serier.fcf.length !== 5) FEL.push("JT serielängder");
}
// 4452.T — Kao
{
  const g = K.KAO;
  g.bruttoSerie = [573194, 548342, 560427, 638404, 668169];
  const prognos = g.pe / g.peFwd - 1;                            // +0,07387
  jamfor("KAO prognosTillväxt", prognos, 0.07387, 0.0005);
  jamfor("KAO peg-spår", g.pe / (prognos * 100), 3.1488, 0.005);
  INFO.push(`KAO PEG spår 3,15 mot källans fält 1,71 (källans 3-års-rev-prognos +4,70 %/år som bas; spårets TTE bär)`);
  jamfor("KAO revCAGR", cagr(g.serier.oms[0], g.serier.oms[4], 4), 0.04450, 0.0005);
  jamfor("KAO resCAGR", cagr(g.serier.netto[0], g.serier.netto[4], 4), 0.02301, 0.0005);
  jamfor("KAO fcfYield", g.fcfTTM / (g.mcapMdr * 1000), 0.04682, 0.0005);
  jamfor("KAO EV/EBIT replik nettokassa", (g.mcapMdr * 1000 - g.nettokassaM) / g.ebitTTM, 15.747, 0.005);
  const evSpread = (g.mcapMdr * 1000 - g.nettokassaM) / g.ebitTTM / g.evEbit - 1;
  INFO.push(`KAO EV/EBIT-källspridning: replik ${(((g.mcapMdr * 1000 - g.nettokassaM) / g.ebitTTM)).toFixed(2)} mot källans fält ${g.evEbit} (+${(evSpread * 100).toFixed(1)} % — källans EV 3,09 T mot replik 3,06 T och justerad EBIT-bas; fältet bär källans)`);
  if (Math.abs(evSpread - 0.0068) > 0.005) FEL.push("KAO EV/EBIT-spridning avviker från dokumentationen");
  jamfor("KAO direktavkastning", g.dps / g.pris, g.direktAvk, 0.0005);
  jamfor("KAO payout aktiebas", g.dps / g.epsTTM, g.payoutAktiebas, 0.0005);
  INFO.push(`KAO payout två baser: källans fält ${(g.payoutKalla * 100).toFixed(1)} % mot aktiebas ${(g.payoutAktiebas * 100).toFixed(1)} % (78÷149,50) — 0,5 pp:s fönster, båda dokumenterade`);
  jamfor("KAO aktiebas pris/EPS", g.pris / g.epsTTM, 23.264, 0.01);
  if (Math.abs((g.pris / g.epsTTM) / g.pe - 1) > 0.001) FEL.push("KAO aktiebas-P/E avviker från källans fält");
  INFO.push("KAO P/E-fönster: aktiebas 23,26 = källans fält EXAKT (EPS 149,50 på 904,76 M aktier)");
  jamfor("KAO mcap-identitet", (g.pris * g.aktier) / (g.mcapMdr * 1000) - 1, -0.00008, 0.005);
  jamfor("KAO P/B equity", (g.mcapMdr * 1000) / 1149540, g.pb, 0.005);
  const m = moatFalt(g);
  jamfor("KAO moat-medel5ar", m.medel, 0.38217, 0.0005);
  jamfor("KAO moat-spread5ar", m.spread, 0.05037, 0.0005);
  if (!(g.v52Spann[0] <= g.pris && g.pris <= g.v52Spann[1])) FEL.push("KAO pris utanför 52-v-spann");
  if (g.serier.ar.length !== 5 || g.serier.oms.length !== 5 || g.serier.netto.length !== 5 || g.serier.ek.length !== 5 || g.serier.fcf.length !== 5) FEL.push("KAO serielängder");
}
// gemensamma strukturkontroller
for (const [t, n] of Object.entries(K)) {
  const monoOk = n.serier.ar.every((x, i) => i === 0 || Number(x) > Number(n.serier.ar[i - 1]));
  if (!monoOk) FEL.push(t + " årsetiketter ej stigande");
}

if (FEL.length) {
  console.error("ABORT — aritmetikgrind RÖD:");
  for (const f of FEL) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("ARITMETIK GRÖN — samtliga kontroller inom tolerans");
for (const i of INFO) console.log("  ℹ " + i);

// ── rader (konventionsenliga; noteringar dokumenterar konventioner+fynd) ─────
const rader = [];
if (!har("3382.T")) rader.push({
  ticker: "3382.T", namn: "Seven & i Holdings Co., Ltd.", bransch: "konsument", land: "Japan", valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-19", url: "https://stockanalysis.com/quote/tyo/3382/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "TYO-PRIMÄRNOTERING (8035.T-/9983.T-precedenserna; ADR-vägen SVNDY-OTC undveken — SSNLF-fällan: tunn volym/stala kurser), S&P Global Market Intelligence + Fiscal.ai-underlag, close 2026-09-18 15:30 JST (−1,68 %): pris 2 020 ¥/4,29 T¥ mcap; FY mars–februari (slutårsetikett = slutåret, FMG-konventionen); P/E 15,90 (aktiebas 2 020÷127,02 = 15,91 EXAKT; mcap/netto-panel 4 290÷304 = 14,10 = −11 % — TTM-fönstret maj'25–maj'26 bär lägre netto än feb-FY2026:s 292,8; fönstren dokumenterade) forward 16,60 HÖGRE ⇒ NEGATIVT prognosgap −4,2 % ⇒ prognosTillväxt/PEG null enligt BUD-konventionen (källans PEG 7,10 på 3-års-prognos ~2,2 %/år kalibrerar; universumets fjärde negativa gap: BUD −0,7 · BEI −8,6 · FMG −11,6 · SVEN −4,2); P/B 1,15 (4 290÷3 717 EXAKT) P/TBV 3,55 EV/EBIT 16,29 (EV 7,53 T÷EBIT 463,0 = 16,26; replik (4 290+3 217)÷463,0 = 16,21 — −0,2 resp −0,5 %) EV/EBITDA 7,77 EV/Earnings 24,75 PS 0,50 P/FCF 9,32 P/OCF 5,53; brutto TTM 16,36 % (FY-seriens medel 29,6 % — TTM-fönstret bär omstruktureringens kostnadsklassificering; statistics-TTM fältbärare, VITEC-lärdomen) EBIT 5,42 % netto 3,56 % FCF 5,38 %; ROE 8,05 % ROA 2,79 % ROIC 4,65 % MOT WACC 2,90 % (spread +1,8 pp — närbutikens franchise-kapitalstyrka men EV-tyngd; ROCE 6,08 %); skuld 3 879 mdr kassa 661 mdr ⇒ NETTOSKULD 3 217 mdr ¥ (feb-FY2026-läget 3 355 djupare — återköpsåret) skuld/EK 1,04 räntetäckning 9,74× debt/EBITDA 4,00 Altman 1,98 (sorti-föråret) Piotroski 6; aktier 2,12 mdr (YoY −7,57 % — ÅTERKÖPSMASKINEN) EPS TTM 127,02; TTM: oms 8 544 mdr ¥ (−17,6 % — superstore-exiten i fönstret) netto 304,3 mdr (+51,6 %) OCF 774,9 capex 315,1 ⇒ FCF 459,8 (fcfYield 10,72 % — statistics-yield 10,73 %) D&A 507,5; utdelning 60 ¥ (2,97 %) payout källans fält 39,22 % (kärn-bas) mot aktiebas GAAP 47,2 %; utdelningstillväxt +22,22 % YoY; ÅTERKÖP 600 mdr ¥ FY2026 (16 → 600 på ett år!) buyback-yield 7,57 % shareholder-yield 10,54 %; skatt 30,06 %; beta 0,09 (5Y — cellens och universumets lägsta dokumenterade); 52-v 1 811–2 417 (+2,18 %); institutions 35,75 % insiders 0,90 %; analytiker Hold 2 271,25 ¥ (+12,4 %, 16 st); anställda 35 967; grundat 2005 (7-Eleven-vägen: Southland-licensen 1974 → holding 2005); nästa rapp 2026-10-08 (samma FIFO-dag som 9983.T!); Sector Consumer Staples Industry Grocery Stores — källkonsekvent med konsument-grenen (ULVR-staples-klassen)" }],
  hamtat: "2026-09-19",
  pris: 2020, marknadsKapitalMdr: 4290,
  tillvaxt: { omsattningCAGR5ar: 0.0449, resultatCAGR5ar: 0.0856, omsattningTillvaxtTTM: -0.1759, prognosTillvaxt: null },
  lonksamhet: { roe: 0.0805, roic: 0.0465, bruttoMarginal: 0.1636, ebitMarginal: 0.0542, nettoMarginal: 0.0356, fcfMarginal: 0.0538 },
  stabilitet: { skuldEgenkapital: 1.04, rantaTackning: 9.74, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.2962, bruttoMarginalSpread5ar: 0.0322, roeMedel5ar: null },
  vardering: { pe: 15.9, pb: 1.15, evEbit: 16.29, peg: null, fcfYield: 0.1072, egenKapitalMultipl: 1.15 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2022", "2023", "2024", "2025", "2026"], omsattning: [8749752000, 11811303000, 11471753000, 11972762000, 10430269000], resultat: [210774000000, 280976000000, 224623000000, 173068000000, 292760000000], egetKapital: [3147730000000, 3648160000000, 3900624000000, 4217444000000, 3648194000000], fcf: [398971000000, 623259000000, 335576000000, 445592000000, 333118000000] },
  notering: "SCOPE-BRYTET OCH ÅTERKÖPSMASKINEN — 7-Elevens moderbolag (världens största närbutikskedja, holding grundad 2005 på Ito-Yokado/7-Eleven-vägen) levererar cellens renaste omstruktureringsekonomi: FY2026 (feb) föll INTÄKTEN −12,9 % (11 973 → 10 430 mdr ¥) medan EPS STEG +78,4 % (66,61 → 118,80 ¥) — superstore-exiten lämnade portföljen med lägre volym men högre vinst (Holcim/Amrize-mekaniken i omvänd riktning: där avknoppningen lyfte marginalen, här lyfte FÖRSÄLJNINGEN resultatet — intäktsfallet är en reklassificering, inte en förtvinning). BALANSRÄKNINGEN BERÄTTAR FINANSIERINGEN: kassan föll 1 369 → 439 mdr ¥ (FY2025→FY2026) medan ÅTERKÖPEN gick 59,6 → 600 mdr ¥ (16 → 600 på två år!) och aktieantalet −7,57 % YoY — buyback-yield 7,57 % + utdelning 2,97 % = shareholder-yield 10,54 %, MEN nettoskulden fördjupades 1 478 → 3 355 mdr ¥ och Altman 1,98: KAPITALÅTERKOMSTEN LÅNEFINANSIERAD — närbutikens stabila OCF (774,9 mdr TTM) bär belåningen (debt/EBITDA 4,00, räntetäckning 9,7×). PEG null: P/E 15,90 mot forward 16,60 = NEGATIVT prognosgap −4,2 % (BUD-konventionen; universumets fjärde dokumenterade) — TTM-fönstret bär scope-vinsten +51,6 %, forward-fönstret det normaliserade. KVARTILPEDAGOGIK: P/E 15,90 = cellens P25-läge (under medianen 20,0), fcfYield 10,72 % = cellens högsta, beta 0,09 = universumets lägsta dokumenterade (mathandeln som försäkring). ROIC 4,65 mot WACC 2,90 = +1,8 pp — smal spread på tung kapitalbas (EV/EBIT 16,29 högt i cellen). Brutto-fönstren 16,4 % TTM mot 29,6 % FY-medel = omklassificeringen efter omstruktureringen (fältet statistics-TTM, moat-fälten FY — GSK-konventionen). FY mars–februari, slutårsetikett = slutåret. Nästa rapp 2026-10-08 — SAMMA DAG som Fast Retailing 9983.T: Japans två konsumentjättar i EN FIFO-dubbel.",
});
if (!har("2914.T")) rader.push({
  ticker: "2914.T", namn: "Japan Tobacco Inc.", bransch: "konsument", land: "Japan", valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-19", url: "https://stockanalysis.com/quote/tyo/2914/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "TYO-PRIMÄRNOTERING i JPY hela vägen; S&P Global Market Intelligence-underlag, close 2026-09-18 15:30 JST (−0,43 %): pris 6 886 ¥/12,23 T¥ mcap (aktiebas 1,78 mdr); kalenderår; P/E 20,04 (aktiebas 6 886÷350,41 = 19,65 = −1,9 % — källans P/E-bas EPS ≈343,6 på viktat aktiesnitt; dokumenterat) forward 17,87 ⇒ prognosTillväxt +12,1 % TTE (PEG spår 1,65; källans fält 1,28 på annan tillväxtbas — båda dokumenterade); P/B 2,76 (12 230÷4 423 = 2,765 EXAKT; goodwill 2,99 T av EK 4,42 T — P/TBV 11,96 dokumenterar förvärvsböckernas vikt) EV/EBIT 12,89 (källans EV 13,10 T; replik (12 230+849)÷1 004,2 = 13,02 = +1,0 % — källans fält på justerad EBIT-bas ≈1 016, VALE/BUD-familjen) EV/EBITDA 10,87 EV/Earnings 21,06 PS 3,29 P/FCF 22,87 P/OCF 18,03; brutto TTM 56,86 % (CELLLENS HÖGSTA) EBIT 27,00 % pretax 24,41 % netto 16,73 % FCF 14,37 %; ROE 14,30 % ROA 7,41 % ROIC 12,91 % MOT WACC 4,81 % (spread +8,1 pp; ROCE 14,80 %); skuld 1 677 mdr kassa 828 mdr ⇒ nettoskuld 849 mdr ¥ skuld/EK 0,38 räntetäckning 13,47× debt/EBITDA 1,41 Altman 3,01 Piotroski 7; aktier 1,78 mdr (float 1,10 mdr = 62 % — DEN JAPANSKA STATEN via finansministeriet är blockägare, JT-lagens ägarstruktur; institutions 21,93 % insiders 0,05 %); EPS TTM 350,41 (+220,8 %!); TTM: oms 3 719 mdr ¥ (+12,2 %) netto 622,1 mdr OCF 677,9 capex 143,4 ⇒ FCF 534,5 (fcfYield 4,37 %); utdelning 272 ¥ (3,95 %) payout källans fält 66,77 % (kärn-bas ≈407 ¥) mot aktiebas GAAP 77,6 %; utdelningstillväxt +16,24 %; återköp ≈0 (0,01 % yield — UTDelningsBOLAGET, staten vill ha kassan); skatt 32,56 %; beta 0,15; 52-v 4 734–7 218 (+45,09 %!! — cellens största ettårsrörelse); analytiker Buy 7 232,08 ¥ (+5,0 %, 13 st); anställda 52 867; grundat 1898 (Japan Monopoly Bureau → 1985 privatisering); nästa rapp 2026-10-29; Sector Consumer Staples Industry Tobacco — källkonsekvent med konsument-grenen" }],
  hamtat: "2026-09-19",
  pris: 6886, marknadsKapitalMdr: 12230,
  tillvaxt: { omsattningCAGR5ar: 0.1051, resultatCAGR5ar: 0.108, omsattningTillvaxtTTM: 0.1221, prognosTillvaxt: 0.1214 },
  lonksamhet: { roe: 0.143, roic: 0.1291, bruttoMarginal: 0.5686, ebitMarginal: 0.27, nettoMarginal: 0.1673, fcfMarginal: 0.1437 },
  stabilitet: { skuldEgenkapital: 0.38, rantaTackning: 13.47, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.5723, bruttoMarginalSpread5ar: 0.0364, roeMedel5ar: null },
  vardering: { pe: 20.04, pb: 2.76, evEbit: 12.89, peg: 1.65, fcfYield: 0.0437, egenKapitalMultipl: 2.76 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [2324838000, 2657832000, 2841077000, 3149759000, 3467675000], resultat: [338490000000, 442716000000, 482288000000, 179240000000, 510175000000], egetKapital: [2886081000000, 3616761000000, 3912492000000, 3848727000000, 4115389000000], fcf: [512559000000, 402388000000, 472153000000, 502242000000, 370852000000] },
  notering: "FY2024-DIPEN, VECTOR-BÅGEN OCH STATENS BLOCK — tobaksjättens femårsserie är cellens renaste hänvisning till engångsposternas makt: netto 338 → 443 → 482 → 179 → 510 mdr ¥ (FY2024-dipen: EBIT 645 → 302 mdr på nedskrivningar, netto −62,8 % — DÄREFTER FY2025-rekordet EBIT 838 / netto +184,6 % och TTM 622 med EPS +220,8 %: dipen och rekordet är SAMMA bolag 24 månader isär, P/E-talens fälldokumenterade läxa). GOODWILL-BÅGEN 2,06 → 2,99 T¥ (+45 %, Vector Group-förvärvet okt 2024 — den amerikanska cigarettmarknaden köptes in) = balansräkningens förvärvsspår; P/TBV 11,96 mot P/B 2,76 dokumenterar förvärvsböckernas vikt. STATEN ÄGER BLOCKET: float 1,10 av 1,78 mdr aktier (~62 %) — finansministeriet som största ägare (JT-lagens struktur sedan 1985-privatiseringen) är minoritetspedagogikens renaste fall: återköp ≈ 0 (yield 0,01 %), UTDELNINGEN bär kapitalåterkomsten 272 ¥ = 3,95 % med payout 66,8 % (källbas) — statens kassaflödesbehov formar bolagets utdelningspolitik. VALLGRAVEN: brutto 56,86 % = CELLLENS HÖGSTA (beroendekapitalets ekonomi — rökarnas byte är besvärligt, prissättningsmakten dokumenterad i utdelningstrappan 252 → 415 mdr ¥ TTM) med ROIC 12,91 mot WACC 4,81 = +8,1 pp. KVARTILPLACERING: P/E 20,04 = CELLENS EXAKTA MEDIAN (femte raden som mittpunkt — sidans pedagogiska tyngdpunkt). 52-v +45,09 % = cellens största ettårsrörelse (dip-återkomsten prissatt). Beta 0,15. Kalenderår, JPY hela vägen. Nästa rapp 2026-10-29.",
});
if (!har("4452.T")) rader.push({
  ticker: "4452.T", namn: "Kao Corporation", bransch: "konsument", land: "Japan", valuta: "JPY",
  kallor: [{ namn: "StockAnalysis", hamtat: "2026-09-19", url: "https://stockanalysis.com/quote/tyo/4452/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "TYO-PRIMÄRNOTERING i JPY hela vägen; S&P Global Market Intelligence-underlag, close 2026-09-18 15:30 JST (−0,43 %): pris 3 478 ¥/3,147 T¥ mcap (aktiebas 904,76 M, −1,99 % YoY); kalenderår; P/E 23,26 (aktiebas 3 478÷149,50 = 23,26 EXAKT) forward 21,66 ⇒ prognosTillväxt +7,4 % TTE (PEG spår 3,15; källans fält 1,71 på 3-års-rev-prognos +4,70 %/år — baserna dokumenterade) PS 1,80; P/B 2,74 (3 147÷1 149,5 EXAKT) EV/EBIT 15,64 (EV 3,09 T UNDER mcap — NETTKASSA; replik (3 147−89)÷194,2 = 15,75 = +0,7 %) EV/EBITDA 12,03 EV/Earnings 22,68 EV/FCF 20,96 P/FCF 21,36 P/OCF 15,10; brutto TTM 40,17 % EBIT 11,09 % pretax 11,16 % netto 7,77 % FCF 8,41 %; ROE 12,32 % ROA 6,56 % ROIC 12,82 % MOT WACC 5,02 % (spread +7,8 pp; ROCE 14,09 %); skuld 237 mdr kassa 327 mdr ⇒ NETTKASSA +89 mdr ¥ (EV under mcap) skuld/EK 0,21 räntetäckning 51,22×!! (cellens högsta) debt/EBITDA 0,94 Altman 4,4 Piotroski 7; EPS TTM 149,50 (+21,8 %); TTM: oms 1 751,5 mdr ¥ (+6,2 %) netto 136,1 mdr (+19,4 %) OCF 208,4 capex 61,1 ⇒ FCF 147,3 (fcfYield 4,68 %); utdelning 78 ¥ (2,24 %) payout 51,93 % (aktiebas 52,2 % — 0,5 pp-fönster) 12 ÅR AV UTDELNINGSTILLVÄXT (+51,95 % YoY DPS-rebasning); återköp 80 mdr ¥/år (buyback-yield 1,99 %, shareholder-yield 4,24 %); skatt 29,71 %; beta 0,19; 52-v 2 880–3 782 (+3,51 %); institutions 51,98 % insiders 0,02 %; analytiker Buy 4 038,46 ¥ (+16,1 %, 13 st); anställda 31 514; grundat 1887 (Kao Soap); nästa rapp 2026-11-05; Sector Consumer Staples Industry Household & Personal Products — källkonsekvent med konsument-grenen (BEI/HEN3-klassen)" }],
  hamtat: "2026-09-19",
  pris: 3478, marknadsKapitalMdr: 3147,
  tillvaxt: { omsattningCAGR5ar: 0.0445, resultatCAGR5ar: 0.023, omsattningTillvaxtTTM: 0.0619, prognosTillvaxt: 0.0739 },
  lonksamhet: { roe: 0.1232, roic: 0.1282, bruttoMarginal: 0.4017, ebitMarginal: 0.1109, nettoMarginal: 0.0777, fcfMarginal: 0.0841 },
  stabilitet: { skuldEgenkapital: 0.21, rantaTackning: 51.22, fcfPositivaSenaste5: null, kassaManaderBurnRate: null, nyemissionerSenaste5ar: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.3822, bruttoMarginalSpread5ar: 0.0504, roeMedel5ar: null },
  vardering: { pe: 23.26, pb: 2.74, evEbit: 15.64, peg: 3.15, fcfYield: 0.0468, egenKapitalMultipl: 2.74 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [1418768000, 1551059000, 1532579000, 1628448000, 1688633000], resultat: [109636000000, 86038000000, 43870000000, 107767000000, 120081000000], egetKapital: [983877000000, 995384000000, 1012043000000, 1098835000000, 1094700000000], fcf: [115573000000, 65385000000, 148315000000, 144181000000, 138466000000] },
  notering: "FY2023-TROUGHEN OCH TVÅ ÅTERKOMSTÅR — Japans P&G (Kao Soap 1887 → Attack/Bioré/Goldwell-portföljen; BEI/HEN3-klassen i universumet) bär cellens djupaste resultatsvängning utan scope-brott: netto 109,6 → 86,0 → 43,9 (FY2023-botten: EPS 47,19 = 41 % av 2021-läget på oförändrad intäktsbas 1 533 mdr — KOSTNADSSVÄNGEN, inte volymsvådan: engångskostnader + råvarupriser) → 107,8 → 120,1 mdr (+11,4 %) med TTM 136,1: VÄNDNINGENS TRAPPA i fyra steg med intäkten monotont växande (+4,5 %/år CAGR — resultatrullningen är HELT marginalburen: brutto 35,4 → 39,6 %, EBIT 6,5 → 9,9 % = moat-läxan i data: varumärkesbolagets resultat äts och återföds i marginalen, inte i volymen). BALANSRÄKNINGEN ÄR KVALITETENS KVITTO: NETTKASSA +89 mdr ¥ (EV 3,09 T under mcap 3,15 T), skuld/EK 0,21, räntetäckning 51,2× (CELLLENS HÖGSTA — JT 13,5 · SVEN 9,7), Altman 4,4, FCF positiv alla fem åren (65,4–148,3 mdr). 12 ÅR AV UTDELNINGSTILLVÄXT med DPS 78 ¥ (2,24 %, payout 52 %) + återköp 80 mdr/år = shareholder-yield 4,24 %. ROIC 12,82 mot WACC 5,02 = +7,8 pp. KVARTILPLACERING: P/E 23,26 = cellens P75-läge (över medianen 20,0 — varumärkeskvaliteten prissatt över tobakens blockägarrabatt och närbutikens belåning). PEG spår 3,15 på prognos +7,4 % (källans 1,71 på rev-prognos +4,7 % — TTE-konventionen bär). Beta 0,19. Kalenderår, JPY hela vägen. Nästa rapp 2026-11-05.",
});

if (rader.length === 0) {
  console.log("IDEMPOTENT: samtliga tre tickers finns redan — inget att göra.");
  process.exit(0);
}

// ── innehållsintegritet: gamla rader orörda (bevis efter skrivning) ──────────
const gamlaJson = JSON.stringify(u);

u.push(...rader);
writeFileSync(FIL, JSON.stringify(u, null, 1) + "\n");

// ── efterkontroll ────────────────────────────────────────────────────────────
const efter = JSON.parse(readFileSync(FIL, "utf8"));
const gamlaIgen = efter.slice(0, innan).map(JSON.stringify);
const gamlaFore = JSON.parse(gamlaJson).map(JSON.stringify);
const forandrade = gamlaFore.filter((r, i) => r !== gamlaIgen[i]).length;
console.log(`APPEND: ${innan} → ${efter.length} (+${rader.length}); gamla rader förändrade: ${forandrade}`);
if (forandrade !== 0) { console.error("ABORT — gamla rader förändrade!"); process.exit(1); }

// ── medianer + kvartiler (EXAKT replik av raknaBranschMedianer) ──────────────
const median = (v) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const percentil = (v, p) => { const r = v.filter((x) => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
const r1 = (x) => x === null ? "—" : String(Math.round(x * 10) / 10).replace(".", ",");
const statP = (arr, f) => { const v = arr.map((b) => f(b) ?? null).filter((x) => typeof x === "number" && Number.isFinite(x)); return { median: median(v), p25: percentil(v, 0.25), p75: percentil(v, 0.75), n: v.length }; };

// FÖRE-läget = efter minus mina tre (identiskt)
const fore = efter.filter((b) => !["3382.T", "2914.T", "4452.T"].includes(b.ticker));
for (const [namn, arr] of [["TOTALT före", fore], ["TOTALT efter", efter], ["konsument före", fore.filter((b) => b.bransch === "konsument")], ["konsument efter", efter.filter((b) => b.bransch === "konsument")]]) {
  const pe = statP(arr, (b) => b.vardering?.pe);
  const pb = statP(arr, (b) => b.vardering?.pb);
  const ebit = statP(arr, (b) => b.lonksamhet?.ebitMarginal);
  const fcf = statP(arr, (b) => b.lonksamhet?.fcfMarginal);
  console.log(`${namn}: n=${arr.length} · P/E ${r1(pe.median)} (kv ${r1(pe.p25)}–${r1(pe.p75)}, n ${pe.n}) · P/B ${r1(pb.median)} · EBIT ${r1(ebit.median === null ? null : ebit.median * 100)} % · FCF ${r1(fcf.median === null ? null : fcf.median * 100)} %`);
}
const cell = efter.filter((b) => b.land === "Japan" && b.bransch === "konsument");
const cellPe = statP(cell, (b) => b.vardering?.pe);
console.log(`CELL Japan/konsument: ${cell.length} rader, P/E mätbara ${cellPe.n} — median ${r1(cellPe.median)} kv ${r1(cellPe.p25)}–${r1(cellPe.p75)} (landsidans tal vid nästa bygge — GRÄNSREGEL: ≥5 mätta publiceras)`);
const cellPb = statP(cell, (b) => b.vardering?.pb);
const cellEbit = statP(cell, (b) => b.lonksamhet?.ebitMarginal);
console.log(`CELL P/B ${r1(cellPb.median)} (kv ${r1(cellPb.p25)}–${r1(cellPb.p75)}) · EBIT ${r1(cellEbit.median === null ? null : cellEbit.median * 100)} % (kv ${r1(cellEbit.p25 === null ? null : cellEbit.p25 * 100)}–${r1(cellEbit.p75 === null ? null : cellEbit.p75 * 100)})`);
const totPeE = statP(efter, (b) => b.vardering?.pe);
console.log(`UNIVERSUMJÄMFÖRELSE: cellens median ${r1(cellPe.median)} mot universumets ${r1(totPeE.median)} — konsument-Japans premie/diskont i ett tal`);
console.log(`CELLRADERNA: ${cell.map((b) => b.ticker + " " + (b.vardering?.pe ?? "null")).join(" · ")}`);
