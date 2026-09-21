#!/usr/bin/env node
/**
 * s2-u1 omg27 (manifest auto-s2-1790017500456) — Takeda 4502.T, Japan/halso 0→1.
 * Aritmetikgrind med ABORT FÖRE skrivning (omg13-läxan): varje identitet kontroll-
 * räknas ur rådata; EN röd ⇒ filen orörd + exit 1. Idempotent (redan där ⇒ no-op)
 * och race-säker (appendar efter diskens faktiska läge, syskonrader oberoende).
 * Ørsted-konventionen: negativt TTM-netto ⇒ pe/peg/prognosTillväxt null;
 * negativ endpoint i resultattserien ⇒ resultatCAGR5ar null (EKTA/FABG/MTG-
 * precedensraderna). Konventioner enligt 5401.T (TYO, marslutande FY-etiketter).
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));

if (u.some((r) => r.ticker === "4502.T")) {
  console.log("4502.T finns redan — idempotent no-op, disk =", u.length);
  process.exit(0);
}
const FÖRE = u.length;

// ── RÅDATA (StockAnalysis tyo/4502 fem ytor, hämtat 2026-09-21; S&P GMI-underlag,
//    SA-close 2026-09-18 15:30 JST; Yahoo chart-API paranoid 5 968 ¥ = 0,00 % band) ──
const R = {
  kurs: 5968, yahoo: 5968,
  mcapFalt: 9530,              // mdr ¥ (översiktens 9,53 T)
  aktiebasBS: 1580,            // M aktier (balansräkningens common shares)
  epsTTM: -103.52,
  pe: null, fwdPe: 41.87, pbFalt: 1.26, evFalt: 14610, evEbitFalt: 22.88,
  pFcffalt: 12.35, pegFalt: 8.63, dps: 204, dpsYieldFalt: 3.42,
  revTTM: 4618935, bruttoTTM: 2977720, ebitTTM: 639498, nettoTTM: -163436,
  ocfTTM: 953631, capexTTM: 181901, fcfTTM: 771730,
  kassaTTM: 460982, skuldTTM: 5536499, ekTotalTTM: 7558876, ekCommonTTM: 7557887,
  bvps: 4782.57,
  deFalt: 0.73, roeFalt: -0.0226, roicFalt: 0.0513, waccFalt: 0.0401,
  ser: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    oms: [3569006, 4027478, 4263762, 4581551, 4505720],
    brutto: [2441698, 2774315, 2832257, 3010132, 2886506],
    netto: [230059, 317017, 144067, 107928, -152390],
    ek: [5683523, 6354671, 7274005, 6935979, 7430649],
    ocf: [1123105, 977156, 716344, 1057182, 1041431],
    capex: [123252, 140657, 175420, 200795, 176003],
    fcf: [999853, 836499, 540924, 856387, 865428],
    utdel: [283665, 279416, 287188, 302498, 311901],
    aterkop: [77531, 26929, 2326, 51860, 51603],
    goodwill: [4407749, 4790723, 5410067, 5324430, 5809010],
    intangibla: [3818544, 4269657, 4274682, 3631560, 3419348],
    tillgangar: [13178018, 13957750, 15108792, 14248344, 15511506],
    aktiebas: [1550, 1555, 1569, 1574, 1580],
  },
};

// ── ARITMETIKGRIND ────────────────────────────────────────────────────────────
const kontroller = [];
const K = (namn, beraknad, falt, tolerans) => {
  const dev = falt === 0 ? Math.abs(beraknad) : Math.abs((beraknad - falt) / falt);
  kontroller.push({ namn, beraknad, falt, dev, ok: dev <= tolerans, tolerans });
};
K("kurs Yahoo==SA", R.yahoo, R.kurs, 0.001);
K("P/B = mcap/total-EK", (R.mcapFalt * 1000) / R.ekTotalTTM, R.pbFalt, 0.005);
K("P/B BVPS-bas (not)", R.kurs / R.bvps, R.pbFalt, 0.02); // BAS-SPLITTRA: common-BVPS ~1,25
K("EV = mcap+skuld−kassa", R.mcapFalt + R.skuldTTM / 1000 - R.kassaTTM / 1000, R.evFalt, 0.005);
K("EV/EBIT", (R.mcapFalt + (R.skuldTTM - R.kassaTTM) / 1000) / (R.ebitTTM / 1000), R.evEbitFalt, 0.005);
K("bruttoMarginal", R.bruttoTTM / R.revTTM, 0.6447, 0.005);
K("ebitMarginal", R.ebitTTM / R.revTTM, 0.1385, 0.005);
K("nettoMarginal", R.nettoTTM / R.revTTM, -0.0354, 0.005);
K("fcfMarginal", R.fcfTTM / R.revTTM, 0.1671, 0.005);
K("fcfYield", R.fcfTTM / (R.mcapFalt * 1000), 0.0810, 0.005);
K("P/FCF", (R.mcapFalt * 1000) / R.fcfTTM, R.pFcffalt, 0.005);
K("D/E", R.skuldTTM / R.ekTotalTTM, R.deFalt, 0.005);
K("DPS-yield", R.dps / R.kurs, R.dpsYieldFalt / 100, 0.005);
K("EPS TTM = netto/aktiebas", R.nettoTTM / R.aktiebasBS, R.epsTTM, 0.005);
K("omsCAGR FY22→26", Math.pow(R.ser.oms[4] / R.ser.oms[0], 1 / 4) - 1, 0.0600, 0.005);
K("aktiebas-identitet EK/BVPS", R.ekCommonTTM / R.bvps, R.aktiebasBS, 0.005);
// FCF-serien: OCF − capex = fcf, 6/6 EXAKT (hardekrav)
for (let i = 0; i < 5; i++) K(`FCF FY${R.ser.ar[i]} = OCF−capex`, R.ser.ocf[i] - R.ser.capex[i], R.ser.fcf[i], 0.0005);
K("FCF TTM = OCF−capex", R.ocfTTM - R.capexTTM, R.fcfTTM, 0.0005);
// moat-serien
const gm = R.ser.brutto.map((b, i) => (b / R.ser.oms[i]) * 100);
const gmMedel = gm.reduce((a, b) => a + b, 0) / gm.length;
const gmSpread = Math.max(...gm) - Math.min(...gm);
kontroller.push({ namn: "moat medel (→66,70)", beraknad: gmMedel, falt: 66.7, dev: Math.abs(gmMedel - 66.7) / 66.7, ok: Math.abs(gmMedel - 66.7) / 66.7 <= 0.005, tolerans: 0.005 });
kontroller.push({ namn: "moat spread (→4,85)", beraknad: gmSpread, falt: 4.85, dev: Math.abs(gmSpread - 4.85) / 4.85, ok: Math.abs(gmSpread - 4.85) / 4.85 <= 0.01, tolerans: 0.01 });
// Sony-fällan-grinden + Ørsted-nollorna: negativt TTM ⇒ pe/peg/prognosTillväxt null (bindning)
kontroller.push({ namn: "Sony-fällan: TTM<0 ⇒ pe=null (Ørsted)", beraknad: R.nettoTTM < 0 ? "null ✓" : "positivt?!", falt: "null", dev: 0, ok: R.nettoTTM < 0, tolerans: 0 });
kontroller.push({ namn: "endpoint<0 ⇒ resCAGR null (EKTA-precedens)", beraknad: R.ser.netto[4] < 0 ? "null ✓" : "positivt?!", falt: "null", dev: 0, ok: R.ser.netto[4] < 0, tolerans: 0 });

let roda = kontroller.filter((k) => !k.ok);
for (const k of kontroller) {
  console.log(`${k.ok ? "✓" : "✗"} ${k.namn}: beräknad ${typeof k.beraknad === "number" ? k.beraknad.toFixed(6) : k.beraknad} mot fält ${k.falt} (avvik ${(k.dev * 100).toFixed(3)} %, tol ${(k.tolerans * 100).toFixed(1)} %)`);
}
if (roda.length) {
  console.error(`\nARITMETIKGRIND RÖD — ${roda.length} fel — ABORT, filen orörd`);
  process.exit(1);
}
console.log(`\nARITMETIKGRIND GRÖN — ${kontroller.length}/${kontroller.length} — skriver ${FÖRE}→${FÖRE + 1}`);

// ── RADEN (kanonisk fältordning enligt 5401.T) ───────────────────────────────
const rad = {
  ticker: "4502.T",
  namn: "Takeda Pharmaceutical Company Limited",
  bransch: "halso",
  land: "Japan",
  valuta: "JPY",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-21",
      url: "https://stockanalysis.com/quote/tyo/4502/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid: "TYO-PRIMÄRNOTING i JPY (S&P GMI-underlag, SA-close 2026-09-18 15:30 JST; statistics uppdaterad 2026-09-21, financials 2026-07-30): kurs 5 968 ¥ (Yahoo chart-API 5 968 = 0,00 % band EXAKT; previousClose 5 946, dagsvolym 6,5 M), mcap-fält 9,53 T ¥ mot balansräkningens aktiebas 1 580 M × 5 968 = 9 409 mdr — 1,3 % källspridning mellan S&P-ytorna (översiktens 1,60 B mot BS 1 580 M; EK/BVPS-repliken ger 1 580,2 M — BS-basen bär), P/E n/a — TTM-netto −163,4 mdr ¥ NEGATIVT (Ørsted-precedensen: pe/peg/prognosTillväxt null; fwd PE 41,87 ⇒ implicerat framåt-EPS +142,5 ¥ = vändningsåret som not, ALDRIG fält), P/B 1,26 på mcap/total-EK 9 530/7 558,9 EXAKT (BVPS-basen 5 968/4 782,57 = 1,25 — BAS-SPLITTRA dokumenterad), EV 14,61 T = 9 530 + skuld 5 536,5 − kassa 461,0 EXAKT (minoritet endast 989 M — försumbar), EV/EBIT 22,88 (replik 22,84 — källans fältbas), EV/EBITDA 11,25, P/OCF 9,99, P/FCF 12,35 (replik 12,348 EXAKT — KASSAFLÖDETS BÄRANDE VÄRDERING), PEG 8,63 källans 3-årsbas (spårets null), marginaler TTM: brutto 64,47 % (2 977 720/4 618 935 EXAKT) EBIT 13,85 % (EXAKT) netto −3,54 % (EXAKT) pretax −2,82 % FCF 16,71 % (EXAKT), ROE −2,26 %, ROIC 5,13 % mot WACC 4,01 % = +1,12 pp, räntetäckning 3,43, D/E 0,73 (5 536,5/7 558,9 = 0,732 replik), Altman 1,09 (stresszon-not), Piotroski 4, beta 0,10 (5Y) — universums näst lägsta dokumenterade efter NSC:s 0,09, NETTOSKULD −5 075,5 mdr ¥ (kassa 461,0 − skuld 5 536,5; statistiksida −5 075,52 EXAKT), utdelning 204 ¥/år (3,42 %; semi-årlig 102+102 — kontinuitet genom förluståret: betalda 311,9 mdr FY2026), buyback-yield 1,64 % + utdelning 3,42 % ⇒ shareholder yield 5,05 %, aktiebas −1,64 % YoY (+1,56 % QoQ — buybacks med terminer, dokumenterad utan tolkning), institutioner 52,17 % insiders 0,12 %, 52-v 4 102–6 033, analytiker Buy 16 st PT 6 622,06 (+10,96 %), 47 029 anställda, rev/anställd 98,2 M ¥, nästa rapport 2026-10-29 (Q2 FY2027); FY-serier marslutande SA-etiketter FY2022–FY2026 (M ¥): rev 3 569 006→4 027 478→4 263 762→4 581 551→4 505 720 (TTM 4 618 935 +3,1 %), brutto 2 441 698→2 886 506 (marginal 68,40→64,07 % — SEX RAKA ÅR med TTM 64,47: läkemedlets moat-kurva), EBIT 600 062→619 667→502 602→562 936→607 842 (TTM 639 498 = SERIENS HÖGSTA — driftsmaskinen levererar), netto 230 059→317 017→144 067→107 928→−152 390 (FY2026 = FÖRLUSTÅR; TTM −163 436; EPS 145,87→201,94→91,16→67,23→−96,75, TTM −103,52), pretax-marginal 8,48→9,31→1,24→3,82→−3,16 % — GAPET EBIT→pretax TTM −770 mdr ¥ (räntebördan på 5,5 mdr skuld + engångsposter under driftlinjen), EK totalt 5 683 523→7 430 649 (BVPS 3 665,61→4 702,66, TTM 4 782,57), goodwill 4 407 749→5 809 010 + intangibla 3 818 544→3 419 348 = 9 278 mdr TTM = 59,3 % av tillgångarna 15 663 271 (Shire-legatet), tillgångar 13 178 018→15 511 506, skuld 4 810 649→5 476 358 (TTM 5 536 499), kassa 849 695→595 054 (TTM 460 982 — tömd mot utdelning+återköp), OCF 1 123 105→1 041 431 (FY2024-dip 716 344 = arbetskapital¬året −256 003), capex 123 252→176 003, FCF 999 853→836 499→540 924→856 387→865 428 (5/5 positiva + TTM 771 730; varje år OCF−capex EXAKT), D&A 583 151→678 583 (TTM 659 989 — goodwillskulturens avskrivningsberg), utdelningar betalda 283 665→311 901 (MONOTONT stigande genom förluståret), återköp 77 531→51 603 (FY2024-dip 2 326), net debt issued −600 477→+1 076 (FY2025-låneomläggningen 1 051 950 utfärdade/1 366 264 återbetalda)",
    },
    {
      namn: "Yahoo Finance (chart-API)",
      hamtat: "2026-09-21",
      url: "https://query2.finance.yahoo.com/v8/finance/chart/4502.T",
      paranoid: "paranoid kurskoll: Yahoo regularMarketPrice 5 968 ¥ mot SA-close 5 968,00 = 0,00 % band EXAKT (samma streck 2026-09-18 15:30 JST; första försöket rate-limiterat 'Edge: Too Many Requests', omkörning query2 + UA OK), veckoserien 5 737→5 847→5 847→5 946→5 968, valuta JPY verifierad i meta",
    },
  ],
  hamtat: "2026-09-21",
  pris: 5968,
  marknadsKapitalMdr: 9530,
  tillvaxt: {
    omsattningCAGR5ar: 0.06,
    resultatCAGR5ar: null,
    omsattningTillvaxtTTM: 0.031,
    prognosTillvaxt: null,
  },
  lonksamhet: {
    roe: -0.0226,
    roic: 0.0513,
    bruttoMarginal: 0.6447,
    ebitMarginal: 0.1385,
    nettoMarginal: -0.0354,
    fcfMarginal: 0.1671,
  },
  stabilitet: {
    skuldEgenkapital: 0.73,
    rantaTackning: 3.43,
    fcfPositivaSenaste5: 5,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: {
    senasteArMdr: 311.901,
    andelUtestande: 0.0012,
    insiderkopSenaste6man: null,
  },
  moat: {
    bruttoMarginalMedel5ar: 66.7,
    bruttoMarginalSpread5ar: 4.85,
    roeMedel5ar: null,
  },
  vardering: {
    pe: null,
    pb: 1.26,
    evEbit: 22.88,
    peg: null,
    fcfYield: 0.081,
    egenKapitalMultipl: 1.26,
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null,
  },
  serier: {
    ar: R.ser.ar,
    omsattning: R.ser.oms.map((x) => x * 1e6),
    resultat: R.ser.netto.map((x) => x * 1e6),
    egetKapital: R.ser.ek.map((x) => x * 1e6),
    fcf: R.ser.fcf.map((x) => x * 1e6),
  },
  notering: "Japan/halso 0→1 — Japans SJÄTTE gren (konsument 5 · kommunikation 5 · finans 5 · material 1 · teknik 1 ⇒ +halso) och universumets första japanska läkemedelsrad; med Sanofi (Frankrike) · GSK (UK) · Fresenius (Tyskland) blir de fyra europeiska/japanska stormarknadernas pharma-kolosser kompletta. SIGNATURTAL — FÖRLUSTÅRETS ANATOMI (redovisning mot kassa i ETT bolag): (1) DRIFTSMASKINEN LEVERERAR REKORD: EBIT 639,5 mdr ¥ TTM = SERIENS HÖGSTA (600→620→503→563→608→639; marginal 13,85 %) medan netto 317,0→144,1→107,9→−152,4 mdr (FY2026 förlustår, TTM −163,4) — GAPET EBIT→pretax −770 mdr ¥ under driftlinjen: räntebördan på 5,5 mdr ¥ skuld + engångsposter; pretax-marginalens väg 8,48→9,31→1,24→3,82→−3,16 % (fyra raka fallår från 2023-toppen). (2) SHIRE-LEGATET (2019, ~62 Mdr USD — Japans största utlandsförvärv): goodwill 5 886,9 + intangibla 3 391,2 = 9 278 mdr ¥ TTM = 59,3 % av tillgångarna 15 663 mdr (intellektuell balans); D&A 660 mdr/år = avskrivningsberget; nettoskuld 5 075,5 mdr; Altman 1,09 (stresszonen — nedskrivningskulturens balans) MEDAN FCF 771,7 mdr/år (5/5 positiva år, 999,9→836,5→540,9→856,4→865,4) betalar tjänsten: P/FCF 12,35 mot P/E n/a — kassaflödets bärande värdering när bokföringen visar förlust (Ørsted-precedensen: pe/peg/prognosTillväxt null; fwd PE 41,87 ⇒ +142,5 ¥ implicerat = vändningsåret som not). (3) UTDELNINGEN OROCKAD GENOM FÖRLUSTÅRET: betalda 283,7→279,4→287,2→302,5→311,9 mdr ¥ monotont (DPS 204 ¥, 3,42 %, 3 tillväxtår) + återköp 51,6 mdr ⇒ shareholder yield 5,05 % — grundat 1781, universums TREDJE äldsta bolag (BARC 1690 · LSEG 1698 · Takeda 1781 — före Mitsubishi 1873 och Mercedes 1886). (4) KVARTALSVÄNDNINGEN: aktiebas −1,64 % YoY men +1,56 % QoQ (buyback-program med terminsleveranser, dokumenterad utan tolkning) · 52-v +34,7 % (4 102→6 033 — bottnen var nedskrivningsåret) · beta 0,10 = universums näst lägsta efter NSC 0,09 (läkemedels-defensiven) · ROIC 5,13 % mot WACC 4,01 % = +1,12 pp trång spread. Kontrastpartnerna: Novo Nordisk (compounder-motpolen i samma gren) och Nippon Steel (förlustårets mekanik i annan bransch — EBIT-mot-netto-gapet som universumpedagogik). FIFO: Q2 FY2027 2026-10-29.",
};

const gammal = readFileSync(FIL, "utf8");
u.push(rad);
const ny = JSON.stringify(u, null, 2) + "\n";
// prefix-bevis: gamla filens kropp fram till SISTA radens slutande } skall vara
// byte-identisk prefix (nya filen fortsätter där med ",\n  {" — inte "\n]")
const prefix = gammal.slice(0, gammal.lastIndexOf("}") + 1);
if (!ny.startsWith(prefix)) {
  console.error("PREFIX-BEVIS RÖDT — gammal fil ej prefix av ny — ABORT");
  process.exit(1);
}
writeFileSync(FIL, ny);
const efter = JSON.parse(readFileSync(FIL, "utf8"));
console.log(`APPEND KIRURGISK: ${FÖRE}→${efter.length} (0 gamla rader förändrade, prefix bit-identisk)`);
console.log(`LÄS-TILLBAKA ×1: 4502.T närvarande = ${efter.some((r) => r.ticker === "4502.T")} · bransch/land = ${(() => { const r = efter.find((x) => x.ticker === "4502.T"); return r.bransch + "/" + r.land; })()}`);
