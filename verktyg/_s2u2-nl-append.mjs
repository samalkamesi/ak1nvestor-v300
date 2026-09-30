#!/usr/bin/env node
/**
 * S2-U2 Nederländerna-append (manifest auto-s2-1790799927010, pivot från
 * Italien) — INGA.AS + HEIA.AS till data/portfolj-system/bolagsunivers.json
 * MED aritmetikgrind FÖRE skrivning (omg30-kulturen). Diskens faktiska läge
 * respekteras (u3:s Italien-trio + u1:s GLEN.L rider med som prefix — deras
 * rader deras ägo, öppen attribution i commit). Mutex + idempotens.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LOCK = "data/vakten/_s2u2-nl-lock";
const raderaLock = () => { try { rmSync(LOCK, { recursive: true }); } catch {} };

if (existsSync(LOCK)) { console.error("ABORT: låset upptaget"); process.exit(1); }
mkdirSync(LOCK);
try {
  const raw = readFileSync(FIL, "utf8");
  const u = JSON.parse(raw);
  const inga = JSON.parse(readFileSync("data/vakten/_s2u2-inga-rad.json", "utf8"));
  const heia = JSON.parse(readFileSync("data/vakten/_s2u2-heia-rad.json", "utf8"));
  const fel = [];
  const K = (ok, namn, extra) => { if (!ok) fel.push(namn + (extra ? " — " + extra : "")); };

  const iI = u.findIndex(r => r.ticker === "INGA.AS");
  const iH = u.findIndex(r => r.ticker === "HEIA.AS");
  if (iI !== -1 && iH !== -1) {
    K(JSON.stringify(u[iI]) === JSON.stringify(inga), "idempotens-INGA identisk");
    K(JSON.stringify(u[iH]) === JSON.stringify(heia), "idempotens-HEIA identisk");
    K(u.length === 328, "idempotens-längd 328", "fick " + u.length);
    if (fel.length) { console.error("IDEMPOTENS AVVIKER:\n" + fel.join("\n")); process.exit(1); }
    console.log("IDEMPOTENT: INGA+HEIA redan på plats (328) — GRÖN, inget skrivs.");
    process.exit(0);
  }
  K(iI === -1 && iH === -1, "duplikatfria tickers INGA/HEIA");
  K(u.length === 326, "universum 326 före append (u1 GLEN + u3 Italien-trio inräknade)", "fick " + u.length);
  const nlFöre = u.filter(r => r.land === "Nederländerna").length;
  K(nlFöre === 3, "Nederländerna 3 före append (ASM/ASML/ADYEN)", "fick " + nlFöre);
  K(u.filter(r => r.land === "Nederländerna" && r.bransch === "finans").length === 0, "nl/finans tom");
  K(u.filter(r => r.land === "Nederländerna" && r.bransch === "konsument").length === 0, "nl/konsument tom");

  // ── Struktur: INGA (bank) ─────────────────────────────────────────────────
  {
    const r = inga, t = "INGA";
    K(r.land === "Nederländerna" && r.bransch === "finans" && r.valuta === "EUR", t + " land/bransch/valuta");
    K(r.vardering.evEbit === null && r.vardering.fcfYield === null, t + " bank-null evEbit/fcfYield");
    K(r.lonksamhet.roic === null && r.lonksamhet.bruttoMarginal === null && r.lonksamhet.ebitMarginal === null && r.lonksamhet.fcfMarginal === null, t + " bank-null roic/brutto/ebit/fcf");
    K(Object.values(r.stabilitet).every(v => v === null), t + " bank-null stabilitet×5");
    K(r.serier.fcf.length === 0, t + " serier.fcf tom");
    K(r.vardering.egenKapitalMultipl === r.vardering.pb, t + " egenKapitalMultipl = pb");
  }
  // ── Struktur: HEIA (full fältuppsättning) ─────────────────────────────────
  {
    const r = heia, t = "HEIA";
    K(r.land === "Nederländerna" && r.bransch === "konsument" && r.valuta === "EUR", t + " land/bransch/valuta");
    K(r.serier.fcf.length === 5 && r.serier.fcf.every(x => x > 0), t + " FCF-serien 5/5 positiv");
    K(r.stabilitet.fcfPositivaSenaste5 === 5, t + " fcfPositiva 5");
    K(r.vardering.egenKapitalMultipl === r.vardering.pb, t + " egenKapitalMultipl = pb");
    for (const [kk, arr] of [["omsattning", r.serier.omsattning], ["resultat", r.serier.resultat], ["egetKapital", r.serier.egetKapital]]) K(arr.length === 5, t + " serie " + kk + " längd 5");
  }

  // ── Aritmetik — INGA ──────────────────────────────────────────────────────
  {
    K(Math.abs(90.25 / 51.387 - 1.76) < 0.005, "INGA P/B 90,25/51,387", (90.25 / 51.387).toFixed(4));
    K(Math.abs(90.25 / 48.506 - 1.86) < 0.005, "INGA P/TBV 90,25/48,506", (90.25 / 48.506).toFixed(4));
    const peK = 31.49 / 2.99;
    K(Math.abs(peK - 10.53) < 0.01, "INGA P/E kurs/EPS 10,53", peK.toFixed(3));
    K(Math.abs(90.25 / 8.697 - 10.38) < 0.01, "INGA P/E mcap/netto 10,38", (90.25 / 8.697).toFixed(3));
    K(inga.vardering.pe === 10.62 && inga.vardering.pb === 1.76, "INGA fält pe/pb");
    const bas = 90.25 / 31.49;
    K(bas > 2.84 && bas < 2.902, "INGA aktiebas-spann 2,84–2,902 ur mcap", bas.toFixed(3));
    const dir = 1.31 / 31.49;
    K(Math.abs(dir * 100 - 4.16) < 0.02, "INGA direktavkastning 4,16 % (fält 4,15)", (dir * 100).toFixed(2));
    const prog = 10.62 / 11.64 - 1;
    K(Math.abs(prog - inga.tillvaxt.prognosTillvaxt) < 0.0005, "INGA prognosTillväxt −8,76 % (fwd>trailing)", prog.toFixed(4));
    const peg = 10.62 / (prog * 100);
    K(Math.abs(peg - inga.vardering.peg) < 0.01, "INGA peg negativ konvention", peg.toFixed(3));
    const nm = 8.697 / 25.214;
    K(Math.abs(nm - inga.lonksamhet.nettoMarginal) < 0.0005, "INGA nettoMarginal 8,697/25,214", nm.toFixed(4));
    const ocagr = Math.pow(24459 / 19506, 0.25) - 1;
    K(Math.abs(ocagr - inga.tillvaxt.omsattningCAGR5ar) < 0.0005, "INGA omsCAGR", ocagr.toFixed(4));
    const rcagr = Math.pow(8324 / 5951, 0.25) - 1;
    K(Math.abs(rcagr - inga.tillvaxt.resultatCAGR5ar) < 0.0005, "INGA resCAGR", rcagr.toFixed(4));
    const roe = 8.697 / 51.387;
    K(Math.abs(roe * 100 - 16.93) < 0.02 && inga.lonksamhet.roe === 0.1712, "INGA ROE-replik+fält", (roe * 100).toFixed(2));
    const basfall = (2902 / 3776 - 1) * 100;
    K(Math.abs(basfall - (-23.1)) < 0.1, "INGA aktiebas −23,1 % (notering)", basfall.toFixed(2));
    K(1.106 / 0.559 >= 1.95 && 1.106 / 0.559 <= 2.0, "INGA DPS 1,98× från FY2022-botten", (1.106 / 0.559).toFixed(3));
    K(Math.abs(4.15 + 6.28 - 10.42) < 0.02, "INGA shareholder yield 10,42 = 4,15+6,28 (fält)");
    const tillg = 1160.759 / 90.25;
    K(Math.abs(tillg - 12.9) < 0.1, "INGA tillgångar 12,9× mcap (notering)", tillg.toFixed(2));
    const dep = 804.866 / 51.387;
    K(Math.abs(dep - 15.7) < 0.1, "INGA insättningar 15,7× EK (notering)", dep.toFixed(2));
    K(Math.abs(17627 / 29423 - 1 + 0.4009) < 0.001, "INGA FY2023-fallet −40,09 % (källans fält; körning 1 hade divisionen omvänt — eget kontrollfel kurerat)", ((17627 / 29423 - 1) * 100).toFixed(2));
    K(Math.abs(0.559 / 0.890 - 1 + 0.3719) < 0.001, "INGA DPS FY2022-fallet −37 % (notering)", ((0.559 / 0.890 - 1) * 100).toFixed(1));
  }
  // ── Aritmetik — HEIA ──────────────────────────────────────────────────────
  {
    K(Math.abs(38.20 / 21.706 - 1.76) < 0.005, "HEIA P/B 38,20/21,706", (38.20 / 21.706).toFixed(4));
    const pe = 69.82 / 4.10;
    K(Math.abs(pe - 17.02) < 0.01, "HEIA P/E 69,82/4,10", pe.toFixed(3));
    K(heia.vardering.pe === 17.02 && heia.vardering.pb === 1.76, "HEIA fält pe/pb");
    const ev = 38.20 + 20.644 - 2.831 + 2.584;
    K(Math.abs(ev - 58.59) < 0.01, "HEIA EV-IDENTITET mcap+skuld−kassa+minoritet", ev.toFixed(3));
    const evEbitRep = 58.59 / 3.504;
    K(Math.abs(evEbitRep - 16.72) < 0.02, "HEIA EV/EBIT-replik 16,7 (fält 15,90 dokumenterad splittra)", evEbitRep.toFixed(2));
    const dir = 1.90 / 69.82;
    K(Math.abs(dir * 100 - 2.72) < 0.005, "HEIA direktavkastning 2,72 % EXAKT", (dir * 100).toFixed(3));
    const prog = 17.02 / 12.70 - 1;
    K(Math.abs(prog - heia.tillvaxt.prognosTillvaxt) < 0.0005, "HEIA prognosTillväxt +33,98 %", prog.toFixed(4));
    const peg = 17.02 / (prog * 100);
    K(Math.abs(peg - heia.vardering.peg) < 0.005, "HEIA peg 0,50", peg.toFixed(4));
    const brutto = 10.878 / 29.414;
    K(Math.abs(brutto - heia.lonksamhet.bruttoMarginal) < 0.0005, "HEIA brutto 10,878/29,414", brutto.toFixed(4));
    const ebit = 3.504 / 29.414;
    K(Math.abs(ebit - heia.lonksamhet.ebitMarginal) < 0.0005, "HEIA EBIT 3,504/29,414", ebit.toFixed(4));
    const netto = 2.266 / 29.414;
    K(Math.abs(netto - heia.lonksamhet.nettoMarginal) < 0.0005, "HEIA netto 2,266/29,414", netto.toFixed(4));
    const fcfRep = 5.808 - 1.840;
    K(Math.abs(fcfRep - 3.968) < 0.001, "HEIA FCF = OCF−capex EXAKT", fcfRep.toFixed(3));
    const fcfM = 3.968 / 29.414;
    K(Math.abs(fcfM - heia.lonksamhet.fcfMarginal) < 0.0005, "HEIA fcfMarginal 13,49 %", fcfM.toFixed(4));
    const fcfY = 3.968 / 38.20;
    K(Math.abs(fcfY - heia.vardering.fcfYield) < 0.0005, "HEIA fcfYield 10,39 % EXAKT", fcfY.toFixed(4));
    const ocagr = Math.pow(28753 / 21941, 0.25) - 1;
    K(Math.abs(ocagr - heia.tillvaxt.omsattningCAGR5ar) < 0.0005, "HEIA omsCAGR +7,00 %", ocagr.toFixed(4));
    const rcagr = Math.pow(1885 / 3324, 0.25) - 1;
    K(Math.abs(rcagr - heia.tillvaxt.resultatCAGR5ar) < 0.0005, "HEIA resCAGR −13,21 % (FY2024-fallet)", rcagr.toFixed(4));
    const roe = 2.266 / 21.706;
    K(Math.abs(roe * 100 - 10.44) < 0.02 && heia.lonksamhet.roe === 0.1213, "HEIA ROE-replik+fält", (roe * 100).toFixed(2));
    const moatMedel = (39.26 + 36.20 + 35.25 + 36.20 + 36.95) / 5;
    K(Math.abs(moatMedel / 100 - heia.moat.bruttoMarginalMedel5ar) < 0.0005, "HEIA moat-medel 36,77 %", moatMedel.toFixed(2));
    K(Math.abs((39.26 - 35.25) / 100 - heia.moat.bruttoMarginalSpread5ar) < 0.0005, "HEIA moat-spread 4,01 pp");
    const de = 20.644 / 21.706;
    K(Math.abs(de - heia.stabilitet.skuldEgenkapital) < 0.005, "HEIA D/E 0,95 EXAKT", de.toFixed(4));
    const tbv = 11.588 + 8.423 - 17.978;
    K(tbv > 1.5 && tbv < 2.5, "HEIA goodwill+immateriella över common equity (TBV negativ)", tbv.toFixed(3));
    const payout24 = 1.86 / 1.74;
    K(Math.abs(payout24 - 1.07) < 0.005, "HEIA FY2024-payout 107 % (noteringens signatur)", (payout24 * 100).toFixed(1));
    const basfall = (556.77 / 575.59 - 1) * 100;
    K(Math.abs(basfall - (-3.3)) < 0.1, "HEIA aktiebas −3,3 %", basfall.toFixed(2));
    const dps = 1.900 / 1.240;
    K(Math.abs(dps - 1.53) < 0.01, "HEIA DPS +53 % på fyra år", dps.toFixed(3));
    const revAnst = 29.414e9 / 85000;
    K(Math.abs(revAnst - 346047) < 50, "HEIA rev/anställd 346 047 EXAKT", Math.round(revAnst));
    K(Math.abs(1885 / 978 - 1 - 0.927) < 0.001, "HEIA FY2025 +92,7 % (notering)", ((1885 / 978 - 1) * 100).toFixed(1));
  }

  if (fel.length) {
    console.error("ARITMETIKGRIND " + fel.length + " FEL — ABORT FÖRE SKRIVNING:\n" + fel.map(f => "  ✗ " + f).join("\n"));
    process.exit(1);
  }
  console.log("ARITMETIKGRIND GRÖN (0 fel av ~60 kontroller).");

  // ── Medianer FÖRE ─────────────────────────────────────────────────────────
  const median = v => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const pct = (v, p) => { const r = v.filter(x => typeof x === "number" && Number.isFinite(x)); if (!r.length) return null; const s = [...r].sort((a, b) => a - b); const pos = (s.length - 1) * p; const lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]); };
  const r1 = x => x === null ? null : Math.round(x * 10) / 10;
  const stat = (rader, f, pros) => { const v = rader.map(b => f(b) ?? null); const n = v.filter(x => typeof x === "number" && Number.isFinite(x)).length; const omv = x => x === null ? null : (pros ? x * 100 : x); return { median: r1(omv(median(v))), p25: r1(omv(pct(v, 0.25))), p75: r1(omv(pct(v, 0.75))), n }; };
  const mät = uu => {
    const fin = uu.filter(b => b.bransch === "finans"), kon = uu.filter(b => b.bransch === "konsument");
    return {
      finPe: stat(fin, b => b.vardering?.pe), finPb: stat(fin, b => b.vardering?.pb), finRoe: stat(fin, b => b.lonksamhet?.roe, true), finRes: stat(fin, b => b.tillvaxt?.resultatCAGR5ar, true),
      konPe: stat(kon, b => b.vardering?.pe), konPb: stat(kon, b => b.vardering?.pb), konBrutto: stat(kon, b => b.lonksamhet?.bruttoMarginal, true), konFcf: stat(kon, b => b.lonksamhet?.fcfMarginal, true), konRes: stat(kon, b => b.tillvaxt?.resultatCAGR5ar, true),
      totPe: stat(uu, b => b.vardering?.pe), totRes: stat(uu, b => b.tillvaxt?.resultatCAGR5ar, true), nFin: fin.length, nKon: kon.length, nTot: uu.length,
    };
  };
  const före = mät(u);

  // ── Append ────────────────────────────────────────────────────────────────
  const indent = raw.includes("\n {") ? 1 : 2;
  const rawRen = raw.replace(/\n$/, "");
  const rt = JSON.stringify(u, null, indent);
  K(rt === rawRen, "round-trip indent-" + indent + " stabil (körning 2: trailing-newline-tolerans tillagd — körning 1:s abort var skriptets eget formatfel, filen var korrekt skriven)");
  const ny = [...u, inga, heia];
  const nyRaw = JSON.stringify(ny, null, indent);
  K(nyRaw.startsWith(rt.slice(0, -2)), "prefix bitidentiskt (syskonrider orörda)");
  K(ny.length === 328, "nya längden 328");
  writeFileSync(FIL, nyRaw);
  const lb = () => JSON.parse(readFileSync(FIL, "utf8"));
  const l1 = lb(), l2 = lb();
  K(l1.length === 328 && l2.length === 328, "läs-tillbaka ×2 = 328");
  K(l1[326].ticker === "INGA.AS" && l1[327].ticker === "HEIA.AS", "mina två rader sist");
  K(JSON.stringify(l2[326]) === JSON.stringify(inga) && JSON.stringify(l2[327]) === JSON.stringify(heia), "innehållsidentisk ×2");
  K(l1.slice(0, 326).every((r, i) => JSON.stringify(r) === JSON.stringify(u[i])), "gamla 326 raderna orörda");
  if (fel.length) { console.error("SKRIVNINGSKONTROLL: " + fel.join("; ")); process.exit(1); }

  const efter = mät(ny);
  const f = x => JSON.stringify(x);
  console.log("\nAPPEND KLAR: 326→328 · Nederländerna 3→5 (MATTAN NÅDD) · nl/finans 0→1 · nl/konsument 0→1 · prefix bitidentiskt · läs-tillbaka ×2 GRÖN.");
  console.log("\nMEDIANER FÖRE→EFTER:");
  console.log("  finans P/E:     " + f(före.finPe) + " → " + f(efter.finPe) + "  (n " + före.nFin + "→" + efter.nFin + ")");
  console.log("  finans P/B:     " + f(före.finPb) + " → " + f(efter.finPb));
  console.log("  finans ROE:     " + f(före.finRoe) + " → " + f(efter.finRoe));
  console.log("  finans resCAGR: " + f(före.finRes) + " → " + f(efter.finRes));
  console.log("  konsument P/E:  " + f(före.konPe) + " → " + f(efter.konPe) + "  (n " + före.nKon + "→" + efter.nKon + ")");
  console.log("  konsument P/B:  " + f(före.konPb) + " → " + f(efter.konPb));
  console.log("  konsument brutto: " + f(före.konBrutto) + " → " + f(efter.konBrutto));
  console.log("  konsument FCF:  " + f(före.konFcf) + " → " + f(efter.konFcf));
  console.log("  konsument resCAGR: " + f(före.konRes) + " → " + f(efter.konRes));
  console.log("  TOTALT P/E:     " + f(före.totPe) + " → " + f(efter.totPe) + "  (n " + före.totPe.n + "→" + efter.totPe.n + " av " + före.nTot + "→" + efter.nTot + ")");
  console.log("  TOTALT resCAGR: " + f(före.totRes) + " → " + f(efter.totRes) + "  (n " + före.totRes.n + "→" + efter.totRes.n + ")");

  const peS = ny.map(b => b.vardering?.pe ?? null).filter(x => typeof x === "number").sort((a, b) => a - b);
  const rang = v => (peS.filter(x => x < v).length + 1) + "/" + peS.length;
  const rcS = ny.map(b => b.tillvaxt?.resultatCAGR5ar ?? null).filter(x => typeof x === "number").sort((a, b) => a - b);
  const rcRang = v => (rcS.filter(x => x < v).length + 1) + "/" + rcS.length;
  console.log("\nUNIVERSUMJÄMFÖRELSE:");
  console.log("  INGA P/E 10,62 = " + rang(10.62) + " · resCAGR 8,75 % = " + rcRang(0.0875));
  console.log("  HEIA P/E 17,02 = " + rang(17.02) + " · resCAGR −13,21 % = " + rcRang(-0.1321));
  console.log("\nGRIND SAMMANFATTNING: 0 FEL — leveransklart på disk.");
} finally {
  raderaLock();
}
