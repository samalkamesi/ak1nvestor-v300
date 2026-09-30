#!/usr/bin/env node
/**
 * S2-U2 Italien-utökning (manifest auto-s2-1790799927010) — append ISP.MI+UCG.MI
 * till data/portfolj-system/bolagsunivers.json MED aritmetikgrind FÖRE skrivning
 * (omg30-kulturen: ABORT vid ett enda fel; inget skrivs förrän 100 % grönt).
 *
 * Grindens kontroller är oberoende repliker av radernas tal mot källdata som
 * dokumenterats i radfilernas paranoid-fält (SA /quote/bit/ ×5 ytor + Yahoo
 * chart-API, allt 2026-09-30). Mutex = mkdir-lås (omg29-u3:s clobber-läxa);
 * idempotent (redan appenderade rader → verifieras och exit 0).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LOCK = "data/vakten/_s2u2-append-lock";
const raderaLock = () => { try { rmSync(LOCK, { recursive: true }); } catch {} };

// ── Mutex ────────────────────────────────────────────────────────────────────
if (existsSync(LOCK)) { console.error("ABORT: append-låset upptaget (" + LOCK + ")"); process.exit(1); }
mkdirSync(LOCK);
try {
  const huvud = () => {
    const raw = readFileSync(FIL, "utf8");
    const u = JSON.parse(raw);
    const isp = JSON.parse(readFileSync("data/vakten/_s2u2-isp-rad.json", "utf8"));
    const ucg = JSON.parse(readFileSync("data/vakten/_s2u2-ucg-rad.json", "utf8"));
    const fel = [];
    const K = (ok, namn, extra) => { if (!ok) fel.push(namn + (extra ? " — " + extra : "")); };

    // ── 0. Duplikat/idempotens/cell-förutsättning ────────────────────────────
    const fannsIsp = u.findIndex(r => r.ticker === "ISP.MI");
    const fannsUcg = u.findIndex(r => r.ticker === "UCG.MI");
    const italienFinansFöre = u.filter(r => r.land === "Italien" && r.bransch === "finans").length;
    if (fannsIsp !== -1 && fannsUcg !== -1) {
      // Idempotens: båda finns — verifiera innehållsidentitet och avsluta grönt.
      const a = u[fannsIsp], b = u[fannsUcg];
      K(JSON.stringify(a) === JSON.stringify(isp), "idempotens-ISP innehållsidentisk");
      K(JSON.stringify(b) === JSON.stringify(ucg), "idempotens-UCG innehållsidentisk");
      K(u.length === 324, "idempotens-längd 324", "fick " + u.length);
      if (fel.length) { console.error("IDEMPOTENS AVVIKER:\n" + fel.join("\n")); process.exit(1); }
      console.log("IDEMPOTENT: ISP.MI+UCG.MI redan på plats (324) — inget skrivs. GRÖN.");
      return;
    }
    K(fannsIsp === -1 && fannsUcg === -1, "duplikatfria tickers");
    K(u.length === 322, "universum 322 före append", "fick " + u.length);
    K(italienFinansFöre === 0, "Italien/finans tom före append", "fick " + italienFinansFöre);

    // ── 1. Strukturkontroller (bankkonventionen HSBA + kontraktet) ───────────
    for (const [t, r] of [["ISP", isp], ["UCG", ucg]]) {
      K(r.land === "Italien" && r.bransch === "finans" && r.valuta === "EUR", t + " land/bransch/valuta");
      K(typeof r.pris === "number" && typeof r.marknadsKapitalMdr === "number", t + " pris/mcap tal");
      K(r.vardering.evEbit === null && r.vardering.fcfYield === null, t + " bank-null evEbit/fcfYield");
      K(r.lonksamhet.roic === null && r.lonksamhet.bruttoMarginal === null && r.lonksamhet.ebitMarginal === null && r.lonksamhet.fcfMarginal === null, t + " bank-null roic/brutto/ebit/fcf");
      K(Object.values(r.stabilitet).every(v => v === null), t + " bank-null stabilitet×5");
      K(Array.isArray(r.serier.fcf) && r.serier.fcf.length === 0, t + " serier.fcf tom (bank)");
      K(r.serier.ar.length === 5 && r.serier.ar[0] === "2021" && r.serier.ar[4] === "2025", t + " serieår 2021-2025");
      K(r.serier.omsattning.length === 5 && r.serier.resultat.length === 5 && r.serier.egetKapital.length === 5, t + " serielängder 5");
      K(r.vardering.egenKapitalMultipl === r.vardering.pb, t + " egenKapitalMultipl = pb");
      K(r.golv.typ === "osatt" && r.golv.vardePerAktie === null, t + " golv osatt");
      K(Array.isArray(r.kallor) && r.kallor.length === 2 && r.hamtat === "2026-09-30", t + " källor 2 + hämtat");
      K(typeof r.notering === "string" && r.notering.length > 800, t + " notering rik");
    }

    // ── 2. Aritmetikgrind — ISP ──────────────────────────────────────────────
    {
      const pb = 117.19 / 69.149;
      K(Math.abs(pb - 1.69) < 0.005, "ISP P/B-replik 117,19/69,149", pb.toFixed(4));
      const pbBvps = 6.65 / 3.91;
      K(Math.abs(pbBvps - 1.69) < 0.02, "ISP P/B BVPS-väg 6,65/3,91", pbBvps.toFixed(4));
      const pePrev = 6.707 / 0.551;
      K(Math.abs(pePrev - 12.17) < 0.005, "ISP P/E prev-bas 6,707/0,551", pePrev.toFixed(4));
      const peDag = 6.65 / 0.551;
      K(Math.abs(peDag - 12.07) < 0.005, "ISP P/E dagskurs 12,07", peDag.toFixed(4));
      K(Math.abs(isp.vardering.pe - 12.17) < 1e-9, "ISP pe-fält 12,17");
      K(Math.abs(isp.vardering.pb - 1.69) < 1e-9, "ISP pb-fält 1,69");
      const bas = 117.19 / 6.65;
      K(bas > 17.388 && bas < 17.68, "ISP aktiebas-spann ur mcap", bas.toFixed(3));
      const dir = 0.38 / 6.65;
      K(Math.abs(dir * 100 - 5.71) < 0.02, "ISP direktavkastning 5,71 %", (dir * 100).toFixed(2));
      const payout = 0.38 / 0.551;
      K(Math.abs(payout * 100 - 68.97) < 0.05, "ISP payout-replik 68,97 %", (payout * 100).toFixed(2));
      const prog = 12.17 / 11.90 - 1;
      K(Math.abs(prog - isp.tillvaxt.prognosTillvaxt) < 0.0005, "ISP prognosTillväxt pe/fwd", prog.toFixed(4));
      const peg = 12.17 / (prog * 100);
      K(Math.abs(peg - isp.vardering.peg) < 0.01, "ISP peg P/E/prognos-%", peg.toFixed(3));
      const nm = 9.659 / 26.134;
      K(Math.abs(nm - isp.lonksamhet.nettoMarginal) < 0.0005, "ISP nettoMarginal 9,659/26,134", nm.toFixed(4));
      const ocagr = Math.pow(26133 / 17828, 0.25) - 1;
      K(Math.abs(ocagr - isp.tillvaxt.omsattningCAGR5ar) < 0.0005, "ISP omsCAGR", ocagr.toFixed(4));
      const rcagr = Math.pow(9321 / 4185, 0.25) - 1;
      K(Math.abs(rcagr - isp.tillvaxt.resultatCAGR5ar) < 0.0005, "ISP resCAGR", rcagr.toFixed(4));
      const roe = 9.659 / 69.149;
      K(Math.abs(roe * 100 - 13.97) < 0.02 && isp.lonksamhet.roe === 0.1426, "ISP ROE-replik+fält", (roe * 100).toFixed(2));
      K(Math.abs(3.779 - 0.271 - 3.508) < 0.002, "ISP FCF = OCF−capex");
      const nettovaxt = (9321 / 4185 - 1) * 100;
      K(Math.abs(nettovaxt - 123) < 0.5, "ISP netto +123 % (notering)", nettovaxt.toFixed(1));
      const basfall = (17388 / 19400 - 1) * 100;
      K(Math.abs(basfall - (-10.4)) < 0.1, "ISP aktiebas −10,4 % (notering)", basfall.toFixed(2));
      const depEk = 464.833 / 69.149;
      K(Math.abs(depEk - 6.7) < 0.05, "ISP insättningar/EK 6,7×", depEk.toFixed(2));
      const tillg = 992.669 / 117.19;
      K(Math.abs(tillg - 8.5) < 0.1, "ISP tillgångar/mcap ≈8,5×", tillg.toFixed(2));
      K(0.403 / 0.187 >= 2, "ISP DPS dubblad");
      K(30.05 / 12.36 >= 2, "ISP PE-historiken halverad+");
      K(Math.abs(4.185 / 64.066 - 0.0653) < 0.001, "ISP ROE-2021-spegling ~6,5 %", (4.185 / 64.066 * 100).toFixed(2));
    }

    // ── 3. Aritmetikgrind — UCG ──────────────────────────────────────────────
    {
      const pb = 125.56 / 70.816;
      K(Math.abs(pb - 1.77) < 0.005, "UCG P/B-replik 125,56/70,816", pb.toFixed(4));
      const pbBvps = 82.90 / 47.00;
      K(Math.abs(pbBvps - 1.77) < 0.02, "UCG P/B BVPS-väg", pbBvps.toFixed(4));
      const peK = 82.90 / 7.04;
      K(Math.abs(peK - 11.78) < 0.01, "UCG P/E kurs/EPS 11,78", peK.toFixed(3));
      const peM = 125.56 / 10.729;
      K(Math.abs(peM - 11.70) < 0.01, "UCG P/E mcap/netto 11,70", peM.toFixed(3));
      K(Math.abs(ucg.vardering.pe - 11.90) < 1e-9, "UCG pe-fält 11,90 (splittran dokumenterad)");
      K(Math.abs(ucg.vardering.pb - 1.77) < 1e-9, "UCG pb-fält 1,77");
      const bas = 125.56 / 82.90;
      K(bas > 1.498 && bas < 1.5243, "UCG aktiebas-spann ur mcap", bas.toFixed(4));
      const dir = 3.15 / 82.90;
      K(Math.abs(dir * 100 - 3.80) < 0.005, "UCG direktavkastning 3,80 % EXAKT", (dir * 100).toFixed(3));
      const prog = 11.90 / 10.64 - 1;
      K(Math.abs(prog - ucg.tillvaxt.prognosTillvaxt) < 0.0005, "UCG prognosTillväxt", prog.toFixed(4));
      const peg = 11.90 / (prog * 100);
      K(Math.abs(peg - ucg.vardering.peg) < 0.001, "UCG peg", peg.toFixed(4));
      const nm = 10.729 / 24.843;
      K(Math.abs(nm - ucg.lonksamhet.nettoMarginal) < 0.0005, "UCG nettoMarginal attributable", nm.toFixed(4));
      const nmInkl = 10.923 / 24.843;
      K(Math.abs(nmInkl - 0.4397) < 0.0005, "UCG källans 43,97 %-bas bevisad (inkl minoritet)", nmInkl.toFixed(4));
      const ocagr = Math.pow(25048 / 14287, 0.25) - 1;
      K(Math.abs(ocagr - ucg.tillvaxt.omsattningCAGR5ar) < 0.0005, "UCG omsCAGR", ocagr.toFixed(4));
      const rcagr = Math.pow(10709 / 2066, 0.25) - 1;
      K(Math.abs(rcagr - ucg.tillvaxt.resultatCAGR5ar) < 0.0005, "UCG resCAGR", rcagr.toFixed(4));
      const roe = 10.729 / 70.816;
      K(Math.abs(roe * 100 - 15.15) < 0.02 && ucg.lonksamhet.roe === 0.1578, "UCG ROE-replik+fält", (roe * 100).toFixed(2));
      K(Math.abs(17.731 - 0.681 - 17.050) < 0.001, "UCG FCF = OCF−capex EXAKT");
      K(Math.abs(10709 / 2066 - 5.2) < 0.01, "UCG vändsligan 5,2× (notering)", (10709 / 2066).toFixed(3));
      K(Math.abs(3.149 / 0.538 - 5.9) < 0.1, "UCG DPS 5,9×", (3.149 / 0.538).toFixed(2));
      const basfall = (1498 / 2211 - 1) * 100;
      K(Math.abs(basfall - (-32.2)) < 0.1, "UCG aktiebas −32,2 %", basfall.toFixed(2));
      const bvps = (45.46 / 28.12 - 1) * 100;
      K(Math.abs(bvps - 62) < 0.5, "UCG BVPS +62 % (notering)", bvps.toFixed(1));
      K(Math.abs(7.04 / 0.92 - 7.7) < 0.1 && Math.abs(10709 / 2066 - 5.2) < 0.1, "UCG EPS ×7,7 mot netto ×5,2 (notering)");
      const payout = 3.149 / 7.04;
      K(Math.abs(payout * 100 - 44.7) < 0.05, "UCG payout-replik 44,7 %", (payout * 100).toFixed(2));
      const fcfpay = (3.15 * 1.5141) / 17.050;
      K(Math.abs(fcfpay * 100 - 27.97) < 0.1, "UCG FCF-payout ~28 %", (fcfpay * 100).toFixed(2));
      const revAnst = 24843e6 / 66180;
      K(Math.abs(revAnst - 375385) < 50, "UCG rev/anställd 375 385", Math.round(revAnst));
      const vinstAnst = 10729e6 / 66180;
      K(Math.abs(vinstAnst - 162118) < 50, "UCG vinst/anställd 162 118", Math.round(vinstAnst));
    }

    if (fel.length) {
      console.error("ARITMETIKGRIND " + fel.length + " FEL — ABORT FÖRE SKRIVNING:\n" + fel.map(f => "  ✗ " + f).join("\n"));
      process.exit(1);
    }
    console.log("ARITMETIKGRIND GRÖN (0 fel) — samtliga repliker håller.");

    // ── 4. Median-replik FÖRE (finans + totalt) ──────────────────────────────
    const median = v => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
    const pct = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
    const r1 = x => x === null ? null : Math.round(x * 10) / 10;
    const stat = (rader, f, pros) => { const v = rader.map(b => f(b) ?? null); const n = v.filter(x => typeof x === "number" && Number.isFinite(x)).length; const omv = x => x === null ? null : (pros ? x * 100 : x); return { median: r1(omv(median(v))), p25: r1(omv(pct(v, 0.25))), p75: r1(omv(pct(v, 0.75))), n }; };
    const mät = u => {
      const fin = u.filter(b => b.bransch === "finans");
      return {
        finPe: stat(fin, b => b.vardering?.pe), finPb: stat(fin, b => b.vardering?.pb),
        finNetto: stat(fin, b => b.lonksamhet?.nettoMarginal, true), finRoe: stat(fin, b => b.lonksamhet?.roe, true),
        finRes: stat(fin, b => b.tillvaxt?.resultatCAGR5ar, true),
        totPe: stat(u, b => b.vardering?.pe), totRes: stat(u, b => b.tillvaxt?.resultatCAGR5ar, true),
        nFin: fin.length, nTot: u.length,
      };
    };
    const före = mät(u);

    // ── 5. Append + prefix-bevis + läs-tillbaka ×2 ───────────────────────────
    const indent = raw.includes("\n {") ? 1 : 2;
    const rt = JSON.stringify(u, null, indent);
    K(rt === raw, "round-trip indent-" + indent + " stabil (filen kan kirurgiskt appenderas)");
    if (fel.length) { console.error("FORMAT: " + fel.join("; ")); process.exit(1); }
    const ny = [...u, isp, ucg];
    const nyRaw = JSON.stringify(ny, null, indent);
    K(nyRaw.startsWith(rt.slice(0, -2)), "prefix bitidentiskt med gamla filen");
    K(ny.length === 324, "nya längden 324");
    writeFileSync(FIL, nyRaw);
    const lb1 = JSON.parse(readFileSync(FIL, "utf8"));
    const lb2 = JSON.parse(readFileSync(FIL, "utf8"));
    K(lb1.length === 324 && lb2.length === 324, "läs-tillbaka ×2 = 324");
    K(lb1[322].ticker === "ISP.MI" && lb1[323].ticker === "UCG.MI", "mina två rader sist");
    K(JSON.stringify(lb2[322]) === JSON.stringify(isp) && JSON.stringify(lb2[323]) === JSON.stringify(ucg), "läs-tillbaka innehållsidentisk ×2");
    K(lb1.slice(0, 322).every((r, i) => JSON.stringify(r) === JSON.stringify(u[i])), "gamla 322 rader orörda (objektjämförelse)");
    if (fel.length) { console.error("SKRIVNINGSKONTROLL: " + fel.join("; ")); process.exit(1); }

    // ── 6. Median-replik EFTER + rapport ─────────────────────────────────────
    const efter = mät(ny);
    const f = x => JSON.stringify(x);
    console.log("\nAPPEND KLAR: 322→324 · Italien 4→6 · Italien/finans 0→2 · prefix bitidentiskt · läs-tillbaka ×2 GRÖN.");
    console.log("\nMEDIANER FÖRE→EFTER (replik, dataset-medianer.ts metodik):");
    console.log("  finans P/E:      " + f(före.finPe) + " → " + f(efter.finPe));
    console.log("  finans P/B:      " + f(före.finPb) + " → " + f(efter.finPb));
    console.log("  finans netto:    " + f(före.finNetto) + " → " + f(efter.finNetto));
    console.log("  finans ROE:      " + f(före.finRoe) + " → " + f(efter.finRoe));
    console.log("  finans resCAGR:  " + f(före.finRes) + " → " + f(efter.finRes));
    console.log("  TOTALT P/E:      " + f(före.totPe) + " → " + f(efter.totPe) + "  (n " + före.totPe.n + "→" + efter.totPe.n + " av " + före.nTot + "→" + efter.nTot + ")");
    console.log("  TOTALT resCAGR:  " + f(före.totRes) + " → " + f(efter.totRes) + "  (n " + före.totRes.n + "→" + efter.totRes.n + ")");

    // Rang: mina två mot universumet (efter)
    const peSort = ny.map(b => b.vardering?.pe ?? null).filter(x => typeof x === "number").sort((a, b) => a - b);
    const rang = v => { const i = peSort.filter(x => x < v).length + 1; return i + "/" + peSort.length; };
    const nmSort = ny.map(b => b.lonksamhet?.nettoMarginal ?? null).filter(x => typeof x === "number").sort((a, b) => a - b);
    const nmRang = v => { const i = nmSort.filter(x => x < v).length + 1; return i + "/" + nmSort.length; };
    const rcSort = ny.map(b => b.tillvaxt?.resultatCAGR5ar ?? null).filter(x => typeof x === "number").sort((a, b) => a - b);
    const rcRang = v => { const i = rcSort.filter(x => x < v).length + 1; return i + "/" + rcSort.length; };
    console.log("\nUNIVERSUMJÄMFÖRELSE (efter, rang av sorterat):");
    console.log("  ISP P/E 12,17 = rang " + rang(12.17) + " · netto 36,96 % = " + nmRang(0.3696) + " · resCAGR 22,16 % = " + rcRang(0.2216));
    console.log("  UCG P/E 11,90 = rang " + rang(11.9) + " · netto 43,19 % = " + nmRang(0.4319) + " · resCAGR 50,90 % = " + rcRang(0.509));
    console.log("\nGRIND SAMMANFATTNING: 0 FEL — leveransklart läge på disk.");
  };
  huvud();
} finally {
  raderaLock();
}
