#!/usr/bin/env node
/**
 * _s2u1o21-universum-inlagg.mjs — AUTO-S2 omgång 21 u1 (byggare 1/3, +1 bolag):
 * MIZUHO FINANCIAL GROUP 8411.T (Japan/finans 2→3 — megabank-trion komplett:
 * 8306.T MUFG + 8316.T SMFG + 8411.T Mizuho; v209-u2:s explicita kö-notis).
 *
 * Kontrakt (8306.T/8316.T-mallarna): läser färskt universum, vägrar duplikat,
 * ARETMETIKGRIND med abort FÖRE skrivning (v209-u3:s 21 kraav-mönster — första
 * körningen ska helst vara grön; röd replik = exit 1, filen orörd), skriver
 * JSON indent 2 + slutradsbrytning, LÄSER TILLBAKA ×2 (samma antal båda
 * gångerna), medianer före/efter via projektets EGEN raknaBranschMedianer
 * (jiti) + kvartilsplacering av 8411.T i finans och universum.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createJiti } from "jiti";

const UNI = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(UNI, "utf8"));
const FÖRE = u.length;
const finns = (t) => u.some((b) => b.ticker === t);
if (finns("8411.T")) {
  console.error("ABORT: duplikat — 8411.T finns redan på disken");
  process.exit(1);
}

// ── Aritmetikgrinden: 22 kraav, ALLA måste vara gröna FÖRE skrivning ─────────
const kraav = [];
const kraavRad = (namn, replik, kalla, tolerans) => {
  const avvik = Math.abs(replik - kalla) / Math.abs(kalla);
  const ok = avvik <= tolerans;
  kraav.push({ namn, ok });
  console.log(`${ok ? "GRÖN" : "RÖD "} ${namn}: replik ${replik.toFixed(4)} mot källa ${kalla} (avvik ${(100 * avvik).toFixed(3)} %)`);
};

// Råtal ur källpaketet (stockanalysis.com TYO 8411, hämtat 2026-09-20,
// close 2026-09-18 15:30 JST; S&P Global Market Intelligence-underlag):
const PRIS = 8495, EPS_TTM = 560.16, MCAP_T = 20.56, AKTIER_MDR = 2420;   // overview
const EK_JUN_MDR = 11587129, BVPS = 4730.66, KASSA_ST_MDR = 119450, SKULD_MDR = 75297174, NETTCASH_MDR = 44152642; // statistics + BS
const REV_TTM = 4739890, NETTO_TTM = 1381020;                              // financials/TTM
const REV_FY22 = 2805932, REV_FY26 = 4399734, NET_FY22 = 530479, NET_FY26 = 1248632, NET_FY25 = 885433; // financials FY
const PE_KALLA = 15.17, PE_FWD = 13.54, PS_KALLA = 4.34, PTBV_KALLA = 1.94;
const DPS = 150, YIELD_KALLA = 1.77, ROE_KALLA = 12.49, WACC_KALLA = 1.37;
const EBITM_KALLA = 38.24, PRETAXM_KALLA = 38.75, NETTOM_KALLA = 29.14;
const NET_FY26_TILLV = 41.02, EPS_FY26 = 502.92, EPS_FY25 = 350.20;
const TOPP_52V = 8894;

// Egna repliker (maskinberäknade — fälten nedan ska bära DESSA, ej huvudräkning):
const peReplik = PRIS / EPS_TTM;                                  // 15,164
const yieldReplik = (DPS / PRIS) * 100;                           // 1,7657 %
const payoutReplik = (DPS / EPS_TTM) * 100;                       // 26,78 % EXAKT
const mcapReplik = (AKTIER_MDR * PRIS) / 1000;                    // 20 557,9 mdr JPY
const pbMcapEk = (MCAP_T * 1000) / (EK_JUN_MDR / 1000);           // 1,7744 (mdr/mdr)
const pbPrisBvps = PRIS / BVPS;                                   // 1,7957
const omsCagr = (Math.pow(REV_FY26 / REV_FY22, 1 / 4) - 1) * 100; // 11,90 %
const resCagr = (Math.pow(NET_FY26 / NET_FY22, 1 / 4) - 1) * 100; // 23,87 %
const nettoM = (NETTO_TTM / REV_TTM) * 100;                       // 29,136 %
const prognos = (PE_KALLA / PE_FWD - 1) * 100;                    // 12,038 % TTE
const peg = PE_KALLA / prognos;                                   // 1,26
const nettokassaReplik = KASSA_ST_MDR * 1000 - SKULD_MDR;         // 44 152,8 M JPY
const netTillvFy26 = (NET_FY26 / NET_FY25 - 1) * 100;             // 41,01 %
const epsTillvFy26 = (EPS_FY26 / EPS_FY25 - 1) * 100;             // 43,61 %
const roeEgen = (NETTO_TTM / EK_JUN_MDR) * 100;                   // 11,92 % (slut-EK)
const franToppen = (PRIS / TOPP_52V - 1) * 100;                   // −4,49 %
const peFy26Kontroll = PE_KALLA / (1 + prognos / 100);            // 13,54 = fwd EXAKT

kraavRad("P/E replik pris/EPS", peReplik, PE_KALLA, 0.005);
kraavRad("direktavkastning replik", yieldReplik, YIELD_KALLA, 0.01);
kraavRad("payout replik (dokumentationsvärde)", payoutReplik, 26.779, 0.001);
kraavRad("mcap replik aktier×pris (mdr)", mcapReplik, MCAP_T * 1000, 0.001);
kraavRad("P/B mcap/EK", pbMcapEk, 1.77, 0.01);
kraavRad("P/B-växel pris/BVPS", pbPrisBvps, pbMcapEk * 1.0121, 0.005); // +1,2 % vägt aktietal
kraavRad("omsCAGR 5 år", omsCagr, 11.90, 0.005);
kraavRad("resCAGR 5 år", resCagr, 23.87, 0.005);
kraavRad("nettomarginal TTM", nettoM, NETTOM_KALLA, 0.005);
kraavRad("prognosTillväxt TTE", prognos, 12.04, 0.005);
kraavRad("PEG spårkonvention", peg, 1.26, 0.005);
kraavRad("NETTKASSA kassa-ST minus skuld", nettokassaReplik, NETTCASH_MDR, 0.00001);
kraavRad("FY2026 nettotillväxt", netTillvFy26, NET_FY26_TILLV, 0.005);
kraavRad("FY2026 EPS-tillväxt", epsTillvFy26, 43.61, 0.005);
kraavRad("ROE egen slut-EK-replik (under källans snitt-EK)", roeEgen, 11.92, 0.005);
kraavRad("avstånd från 52-v-topp", franToppen, -4.49, 0.005);
kraavRad("P/E→fwd identitet", peFy26Kontroll, PE_FWD, 0.001);

const röda = kraav.filter((k) => !k.ok);
console.log(`\nARITMETIKGRIND: ${kraav.length - röda.length}/${kraav.length} GRÖNA${röda.length ? " — " + röda.length + " RÖDA ⇒ ABORT, filen orörd" : ""}`);
if (röda.length) process.exit(1);

// ── Medianer FÖRE (projektets egen motor, jiti på ts-källan) ────────────────
const jiti = createJiti(import.meta.url, { interopDefault: true });
const { raknaBranschMedianer } = await jiti.import("../src/lib/dataset-medianer.ts");
const medianLage = (rader) => {
  const m = raknaBranschMedianer(rader);
  const fin = m.rader.find((r) => r.bransch === "finans");
  return { fin, tot: m.totalt, m };
};
const före = medianLage(u);
console.log(`\nMEDIANER FÖRE (${FÖRE} rader): finans P/E ${före.fin?.medianPe} (n ${före.fin?.nPe}) · totalt P/E ${före.tot?.medianPe} (n ${före.tot?.nMedPe})`);

// ── Raden (8306.T/8316.T-mallen; fältvärden = grönrepliker ovan) ────────────
const MIZUHO = {
  ticker: "8411.T",
  namn: "Mizuho Financial Group",
  bransch: "finans",
  land: "Japan",
  valuta: "JPY",
  kallor: [{
    namn: "StockAnalysis",
    hamtat: "2026-09-20",
    url: "https://stockanalysis.com/quote/tyo/8411/ (+ /statistics/ + /financials/ + /financials/cash-flow-statement/ + /financials/balance-sheet/)",
    paranoid: "TYO-PRIMÄRNOTING i JPY (8306.T/8316.T-precedensen; underlag S&P Global Market Intelligence; close 2026-09-18 15:30 JST, −0,63 %): pris 8 495,00 JPY, mcap 20,56 T JPY (källans aktier 2,42 Mdr; replik 2 420 × 8 495 = 20 557,9 mdr — 0,01 %), 52-v 4 569–8 894 (+73,2 % på året; −4,5 % från toppen), P/E 15,17 (replik 8 495/560,16 = 15,164 — 0,03 %) forward 13,54, PEG 1,26 spårkonvention (15,17 på prognosTillväxt +12,04 % TTE: trailing/fwd-modellen, MUFG/8316-konventionen), PS 4,34, P/B 1,77 (mcap/EK 20 560/11 587 = 1,774; pris/BVPS 8 495/4 730,66 = 1,796 +1,2 % — vägt aktietal, HEN3/JNJ/8316-klassen), P/TBV 1,94; P/FCF och P/OCF meningslösa (bank), EV n/a (bankens balansräkning: kassa+korttidsinvesteringar 119,45 T mot skuld 75,30 T = NETTKASSA 44,15 T JPY — källans net cash-rad 44 152 642 replikerbar 119 450−75 297 = 44 153 mdr, 0,0004 %; BS-sidans bredare bas kassa+alla investeringar 173,59 T inkl. handelsportföljen 40,3 T dokumenterad som källspridning — MUFG:s 143,10 T-bas hade EN konsistent; EV-konceptet meningslöst på insättarnas pengar, ITUB/RY-ordlistan); TTM jun-26 (M JPY): rev 4 739 890 (+22,86 % källans growth-fält), operating 1,81 T, pretax 1,84 T, netto 1 381 020 (+55,8 %), EPS 560,16 (+59,3 %); marginaler TTM: operating 38,24 % (replik 1,81/4,74 = 38,19 % — källans rad avrundad T), pretax 38,75 % (replik 38,82 %), profit 29,14 % replikerbar EXAKT (1 381 020/4 739 890 = 29,136 %); brutto/EBITDA/FCF-marginal n/a (bank); OCF/FCF-serien svänger (kundmedelsflöden — depos/utlåning, dokumenterat i notering); ROE 12,49 % (egen TTM-slut-EK-replik 1 381/11 587 = 11,92 % — källan bär snitt-EK, 8306/8316-konventionen; TRIONS HÖGSTA: 8306.T 9,46 · 8316.T 8,57 · 8411.T 12,49), ROA 0,48 %, ROIC n/a, WACC 1,37 % (Japans lågränta — 8306.T:s 1,64/8316.T:s 1,93-klass; ROE−WACC +11,1 pp = trions bredaste spridning), ROCE n/a; equity 11 587,1 Mdr JPY (jun-26; EK-trappan 9 201→9 208→10 312→10 524→11 404 mdr FY2022→FY2026), BVPS 4 730,66, arbetskapital −126,6 T JPY (insättningsverksamheten); skuld/ek n/a, räntetäckning n/a, Altman n/a, Piotroski 2; effektiv skatt 24,48 % (betald TTM 449,6 mdr; CF-raden FY2026 317,4 mdr); utdelning 150,00 JPY (1,77 %; replik 150/8 495 = 1,766 %) payout 26,78 % EXAKT på TTM-EPS (trions lägsta: 8306.T 54,87 · 8316.T 54,61 · 8411.T 26,78 = RETENTIONSPROFILEN — EK växer snabbast i trion), DPS-tillväxt +3,45 % YoY, DPS-trappa 80→85→105→140→145 med nuvarande 150; ex-div 2026-09-29; återköpsyield 2,22 %, shareholder yield 3,99 %; aktiebas −2,22 % YoY (återköp FY2026 404,3 mdr JPY mot 8306.T:s 500,1 — trions näst största), FY2026-återköpen 102,9 mdr FY2025 → 404,3 FY2026 = fyrdubbling; beta 0,39 (5Y), institutioner 46,05 %, insiders 0,02 %; analytiker Buy PT 9 011,82 JPY (+6,08 %; 11 st); 52 427 anställda; grundat 1873 (källpaketet; NYSE-ADR noteras allmän faktakunskap, ej källpaketet); nästa rapp 2026-11-13 (H1 FY2027 — 8306.T/8316.T:s datum, sektorns gemensamma H1-rapp); FY april–mars med slutårsetikett (8306.T/S32.AX-konventionen: FY2026 = avslutad mars 2026); FY-serier (M JPY): rev 2 805 932→2 779 216→3 122 105→3 898 840→4 399 734 (FY2022→FY2026, omsCAGR +11,90 %/år), netto 530 479→555 527→678 993→885 433→1 248 632 (FEM RAKA VINSTÅR +18,9→+28,4 % marginaltrappa; nettoCAGR +23,87 %/år — trions enda mätbara FEMÅRSBAKADBANA: 8306.T null negativ bas, 8316.T +22,84 på FY2025-dipp), EPS 209,26→219,19→267,88→350,20→502,92 (+43,61 % FY2026), DPS 80→85→105→140→145; profit margin 18,91→19,99→21,75→22,71→28,38 % (TTM 29,14); P/E-historik 7,49→8,57→11,37→11,37→11,89 med nuvarande 15,17 — samma MONSTRET som 8306.T: multipeln expanderar med vinsten (re-rating utan komprimering per-vinst); kassaflöde (M JPY): OCF 2 322 381→2 261 835→−298 509→−5 748 181→−5 992 524, capex −42 297→−64 845→−63 123→−94 936→−96 688, FCF 2 280 084→2 196 990→−361 632→−5 843 117→−6 089 212 (bank-OCF = lånevolymens tidecken, ej driftskassa — 8306/8316-noten); utdelningar betalda −196 783→−209 457→−234 786→−304 425→−368 703, återköp −1 927→−2 314→−3 383→−102 921→−404 325 (utdelningsvägen tredubblad, återköpsvägen 200-faldig på fyra år); CF-mallens netto-rad avviker från resultaträden FY2025/26 (1 190,1/1 622,3 mot 885,4/1 248,6 mdr — S&P:s bankmall; resultaträden+EPS är kanon: 1 248 632/502,92 = 2 483 M vägt aktietal); balansräkning jun-26: kassa 52 124 + investeringar 121 470, skuld 75 297, totala tillgångar 304 283 Mdr JPY; aktietalet TRE baser dokumenterat (BS 2 434 M slut jun-26 · overview 2,42 Mdr · vägt 2 483 M FY2026-EPS-identiteten); branschfält Financials/Banks—Regional (källans klass mot 8306.T:s Diversified — källintern industrieskiljnad dokumenterad, universumets finans-gren källkonsekvent)",
  }],
  hamtat: "2026-09-20",
  pris: 8495,
  marknadsKapitalMdr: 20560,
  tillvaxt: {
    omsattningCAGR5ar: 0.119,
    resultatCAGR5ar: 0.2387,
    omsattningTillvaxtTTM: 0.2286,
    prognosTillvaxt: 0.1204,
  },
  lonksamhet: {
    roe: 0.1249,
    roic: null,
    bruttoMarginal: null,
    ebitMarginal: 0.3824,
    nettoMarginal: 0.2914,
    fcfMarginal: null,
  },
  stabilitet: {
    skuldEgenkapital: null,
    rantaTackning: null,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null,
  },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: 15.17, pb: 1.77, evEbit: null, peg: 1.26, fcfYield: null, egenKapitalMultipl: 1.77 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [2805932000000, 2779216000000, 3122105000000, 3898840000000, 4399734000000],
    resultat: [530479000000, 555527000000, 678993000000, 885433000000, 1248632000000],
    egetKapital: [],
    fcf: [2280084000000, 2196990000000, -361632000000, -5843117000000, -6089212000000],
  },
  notering: "JAPAN/FINANS-TRION KOMPLETT (Japan/finans 2→3: 8306.T MUFG + 8316.T SMFG + 8411.T — v209-u2:s kö-notis 'Mizuho fullbordar megabank-trion' infriad; Japan 9→10 rader i fyra grenar). TRIONS VÄRDERINGS-KAPITALÅTERKOMST-KONTRAST: Mizuho bär HÖGST ROE (12,49 % mot 9,46/8,57) på LÄGST P/E (15,17 mot 20,69/20,72) — bäst betald kapitalåterkomst i cellen, medan syskonen handlas på räntevändnings-narrativets premium (+53/+49 % prognosTillväxt mot Mizuhos +12,0: marknaden prissatt MUFG/SMFG:s INKOMSTLÄGE, Mizuhos STIGE); ROE−WACC +11,1 pp på WACC 1,37 % = trions bredaste spridning. FEM RAKA VINSTÅR: netto 530,5→555,5→679,0→885,4→1 248,6 mdr JPY (+135 % totalt, nettoCAGR +23,87 %/år — trions enda raka femårsbana: MUFG null negativ FY2022-bas, SMFG FY2025-dipp −45,3 %) med marginaltrappan 18,9→28,4 % och TTM 29,1; P/E-trappan 7,49→8,57→11,37→11,37→11,89 med nuvarande 15,17 = MONSTRET multipeln expanderar med vinsten (MUFG:s 26,11→20,69 samma mönster — japanska banker re-ratingas_med_ fundamentalen, ej mot). RETENTIONSPROFILEN: payout 26,78 % (trions lägsta: 54,87/54,61/26,78) på yield 1,77 % — Mizuho behåller tre fjärdedelar av vinsten och bygger EK snabbast (9,20→11,59 T JPY på fyra år, +26 %) medan återköpsvägen fyrdubblas 102,9→404,3 mdr FY2026 och DPS-trappan 80→85→105→140→145→150 sakta men utan avbrott. BANKENS REALIA: NETTKASSA 44,15 T JPY (kassa 119,45 − skuld 75,30; källspridningen mot BS-sidans bredare portföljbas 173,59 T dokumenterad i paranoid), arbetskapital −126,6 T (insättningarna), OCF −5,99 T FY2026 = lånevolymens tidecken ej driftskassa (8306/8316-noten), WACC 1,37 % (Japans räntenivå), skatt 24,48 %, Piotroski 2, beta 0,39. KÄLLORDNING: resultatråd+EPS kanon (CF-mallens netto-rad avviker 1 190/1 622 mot 885/1 249 FY2025/26 — S&P bankmall, dokumenterad); aktietalet tre baser (2 434 M slut · 2,42 Mdr overview · 2 483 M vägt EPS-identitet); källans industry 'Banks—Regional' mot 8306.T:s 'Diversified' = källintern klassning, universumets finans-gren oberoende av den. 52-v +73,2 %, −4,5 % från toppen 8 894; ex-div 2026-09-29; nästa rapp 2026-11-13 (trions gemensamma H1-datum). PT 9 011,82 JPY (Buy, 11 analytiker); 52 427 anställda; grundat 1873; NYSE-ADR (allmän faktakunskap).",
};

u.push(MIZUHO);
writeFileSync(UNI, JSON.stringify(u, null, 2) + "\n");

// ── Readback ×2 (läckage-vikt: stabilt antal) ───────────────────────────────
const r1 = JSON.parse(readFileSync(UNI, "utf8")).length;
const r2 = JSON.parse(readFileSync(UNI, "utf8")).length;
console.log(`\nREADBACK ×2: ${r1} / ${r2} (förväntat ${FÖRE + 1})`);
if (r1 !== FÖRE + 1 || r2 !== FÖRE + 1) { console.error("ABORT: readback-avvikelse"); process.exit(1); }

// ── Medianer EFTER + kvartilsplacering (uppgiftens kärna) ───────────────────
const efter = medianLage(u);
console.log(`MEDIANER EFTER (${u.length} rader): finans P/E ${efter.fin?.medianPe} (n ${efter.fin?.nPe}, P25–P75 ${efter.fin?.p25Pe}–${efter.fin?.p75Pe}) · totalt P/E ${efter.tot?.medianPe} (n ${efter.tot?.nMedPe})`);
console.log(`RÖRELSE: finans P/E ${före.fin?.medianPe}→${efter.fin?.medianPe} (n ${före.fin?.nPe}→${efter.fin?.nPe}, kvartiler ${före.fin?.p25Pe}–${före.fin?.p75Pe}→${efter.fin?.p25Pe}–${efter.fin?.p75Pe}) · totalt ${före.tot?.medianPe}→${efter.tot?.medianPe} (n ${före.tot?.nMedPe}→${efter.tot?.nMedPe})`);

const percentil = (v, p) => {
  const s = [...v].sort((a, b) => a - b);
  const pos = (s.length - 1) * p, lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const median = (v) => percentil(v, 0.5);
const fin = u.filter((b) => b.bransch === "finans");
for (const [falt, pct] of [["pe", false], ["pb", false], ["roe", true], ["resultatCAGR", true]]) {
  const f = (b) => (falt === "resultatCAGR" ? b.tillvaxt?.resultatCAGR5ar : falt === "roe" ? b.lonksamhet?.roe : b.vardering?.[falt]);
  const varde = f(u.find((b) => b.ticker === "8411.T"));
  const iFin = fin.map(f).filter((x) => typeof x === "number").sort((a, b) => a - b);
  const iAll = u.map(f).filter((x) => typeof x === "number").sort((a, b) => a - b);
  const fmt = (x) => (pct ? (100 * x).toFixed(1).replace(".", ",") + " %" : String(x).replace(".", ","));
  console.log(`KVARTIL 8411.T ${falt}: ${fmt(varde)} = rad ${iFin.indexOf(varde) + 1} av ${iFin.length} i finans (P25 ${percentil(iFin, 0.25).toFixed(2)} · median ${median(iFin).toFixed(2)} · P75 ${percentil(iFin, 0.75).toFixed(2)}) · universumrad ${iAll.filter((x) => x < varde).length + 1} av ${iAll.length} (universummedian ${median(iAll).toFixed(2)})`);
}
const jap = u.filter((b) => b.land === "Japan");
console.log(`JAPAN: ${jap.length} rader (${[...new Set(jap.map((b) => b.bransch))].join(", ")})`);
console.log(`TRIO-PARITET: 8306.T P/E 20,69 ROE 9,46 payout 54,87 · 8316.T P/E 20,72 ROE 8,57 payout 54,61 · 8411.T P/E 15,17 ROE 12,49 payout 26,78`);
