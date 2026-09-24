#!/usr/bin/env node
// _s4u3-asml-kvd.mjs — kvalitetsverifikation av ASML Q3-läspaketet (kvartalsrapportserien)
// Klass: struktur + källtalsparitet + oberoende aritmetik + medianer/rang + juridik + språk + länkar.
import { readFileSync, readdirSync, existsSync } from "node:fs";

const FIL = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-asml-q3-2026.json";
let PASS = 0, FEL = 0, VARN = 0;
const ok = (vill, namn, detalj = "") => {
  if (vill) { PASS++; console.log(`  PASS ${namn}${detalj ? " — " + detalj : ""}`); }
  else { FEL++; console.log(`  FEL  ${namn}${detalj ? " — " + detalj : ""}`); }
};
const num = v => (v === null || v === undefined) ? null : Number(v);
const median = a => { const b = a.filter(v => v !== null && !Number.isNaN(v)).sort((x, y) => x - y); if (!b.length) return null; const m = Math.floor(b.length / 2); return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const rang = (val, a, hog) => { const b = a.filter(v => v !== null && !Number.isNaN(v)); return [...b].sort((x, y) => hog ? y - x : x - y).indexOf(val) + 1; };
const nal = (v, n) => v.toFixed(n).replace(".", ",");

console.log("=== KVD ASML Q3-LÄSPAKET ===");

// ---------- 1. STRUKTUR ----------
console.log("\n[1] STRUKTUR");
const j = JSON.parse(readFileSync(FIL, "utf8"));
ok(j.slug === "sa-laser-du-asml-q3-2026" && FIL.endsWith(j.slug + ".json"), "slug/filnamn-paritet", j.slug);
for (const f of ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"])
  ok(j[f] !== undefined && j[f] !== null && String(j[f]).length > 0, `fält ${f}`);
ok(j.publishedAt === "2026-10-14", "publishedAt = rappdagen 2026-10-14 (bolagets egen kalender)");
ok(j.pillar === "Institutionell metodik" && j.author === "AK1A Research Lab", "pillar/author enligt serien");
ok(!FIL.includes("data/blogg/") || FIL.includes("blogg-utkast"), "utkast-läge: INTE live-mappen");
const ord = j.body.replace(/\s+/g, " ").trim().split(" ").length;
ok(ord >= 2700 && ord <= 3400, `ordantal ${ord} i spannet 2700-3400`);
ok(j.readingMinutes === Math.round(ord / 600), `readingMinutes ${j.readingMinutes} = round(${ord}/600)`);
ok(Array.isArray(j.tags) && j.tags.length >= 5 && j.tags.every(t => /^[a-z0-9åäö\-]+$/i.test(t)), `tags ${j.tags.length} st`);
const h2 = [...j.body.matchAll(/^## .+$/gm)].map(m => m[0].slice(3));
ok(h2.length === 6, `sex H2-sektioner`, h2.join(" | "));
ok(/^## Källor$/m.test(j.body), "Källor-sektion sist av H2");

// duplikat + klaim
const dir = "data/blogg-utkast/kvartal/2026-q3/";
ok(readdirSync(dir).filter(f => f.startsWith("sa-laser-du-") && f.includes("asml")).length === 1, "exakt en asml-fil på disk (inget duplikat)");
ok(existsSync("data/vakten/auto-s4-1789860306737-s4-u3-ansprak.md"), "klaimfil finns på disk");

// ---------- 2. KÄLLTALSPARITET ----------
console.log("\n[2] KÄLLTALSPARITET mot universumposten ASML.AS");
const U = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const poster = Array.isArray(U) ? U : (U.bolag || U.poster);
const P = poster.find(p => p.ticker === "ASML.AS");
ok(!!P, "ASML.AS finns i universumet");
const b = j.body;
const paritet = [
  ["pris", "1 419"], ["mcap", "529,53"], ["P/E", "50,07"], ["P/B", "24,26"], ["EV/EBIT", "41,08"],
  ["PEG", "0,65"], ["fcfYield %", "1,90"], ["ROE %", "53,94"], ["ROIC %", "65,98"], ["brutto %", "52,73"],
  ["EBITmarg %", "35,42"], ["nettomarg %", "30,11"], ["FCFmarg %", "28,42"], ["skuld/EK", "0,09"],
  ["omsCAGR %", "15,56"], ["resCAGR %", "19,55"], ["TTM %", "9,80"], ["prognos %", "76,72"], ["nettokassa", "5,6"],
];
for (const [etik, str] of paritet) ok(b.includes(str), `värdet ${str} (${etik}) i body`);
for (const v of P.serier.omsattning) ok(b.includes(nal(v / 1e9, 3)), `serie-omsättning ${nal(v / 1e9, 3)} i body`);
for (const v of P.serier.resultat) ok(b.includes(nal(v / 1e9, 3)), `serie-resultat ${nal(v / 1e9, 3)} i body`);
for (const v of P.serier.fcf) ok(b.includes(nal(v / 1e9, 3)), `serie-FCF ${nal(v / 1e9, 3)} i body`);
// webbverifierade kvartalstal
for (const s of ["8 767", "9 326", "2 918", "7,15", "7,59", "86 nya och 5 begagnade", "2 762", "1,88", "1,1 miljarder", "43 till 45", "55 till 57", "32,7 miljarder", "9,6 miljarder"])
  ok(b.includes(s), `kvartalstal ${s} (asml.com, sökverifierat 2026-09-20) i body`);
ok(b.includes("14 oktober 2026") && b.includes("15 april") && b.includes("15 juli"), "kalenderfakta (rappdag + infriade Q1/Q2)");

// ---------- 3. ARITMETIK — OBEROENDE OMRÄKNING ----------
console.log("\n[3] ARITMETIK (datavaktens sex prov + härledningar)");
const eps = 1e-9;
const mcap = num(P.marknadsKapitalMdr), pris = num(P.pris);
const pe = num(P.vardering.pe), pb = num(P.vardering.pb), evEbit = num(P.vardering.evEbit);
const roe = num(P.lonksamhet.roe), nettoM = num(P.lonksamhet.nettoMarginal), ebitM = num(P.lonksamhet.ebitMarginal);
const fcfY = num(P.vardering.fcfYield), fcfM = num(P.lonksamhet.fcfMarginal), skuldEk = num(P.stabilitet.skuldEgenkapital);
const ttmT = num(P.tillvaxt.omsattningTillvaxtTTM), progT = num(P.tillvaxt.prognosTillvaxt);
const omsM = P.serier.omsattning.map(v => v / 1e9), resM = P.serier.resultat.map(v => v / 1e9), fcfS = P.serier.fcf.map(v => v / 1e9);
const ttmOms = omsM[3] * (1 + ttmT);
const close = (x, y, tol, namn, utStr) => ok(Math.abs(x - y) <= tol, namn, `${utStr} gap ${nal((x / y - 1) * 100, 2)} %`);

close(pe * roe, 27.01, 0.005, "P1 identitet P/E x ROE = 27,01", `${nal(pe * roe, 2)}`);
close(pb / roe, 44.98, 0.005, "P1b bok-P/E = 44,98", `${nal(pb / roe, 2)}`);
close(mcap / pe, 10.58, 0.005, "P2 P/E-vägen 10,58 mdr", `${nal(mcap / pe, 3)}`);
close(nettoM * ttmOms, 10.80, 0.005, "P2 marginalvägen 10,80 mdr", `${nal(nettoM * ttmOms, 3)}`);
close(nettoM * ttmOms / (mcap / pe), 1.0212, 0.0005, "P2 gap +2,12 %");
const ek = mcap / pb, skuld = skuldEk * ek, ev = mcap + skuld - 5.6;
close(ek, 21.83, 0.005, "P3 EK 21,83 mdr", nal(ek, 3));
close(skuld, 1.96, 0.005, "P3 skuld 1,96 mdr", nal(skuld, 3));
close(ev, 525.89, 0.005, "P3 EV 525,89 mdr (under mcap)", nal(ev, 3));
ok(ev < mcap, "P3 EV < börsvärde (nettokassan subtraherad)");
close(ev / evEbit, 12.80, 0.005, "P3b EV-väg EBIT 12,80", nal(ev / evEbit, 3));
close(ebitM * ttmOms, 12.70, 0.006, "P3b marginalväg EBIT 12,70", nal(ebitM * ttmOms, 3));
close(fcfY * mcap, 10.06, 0.005, "P4 FCF yield-väg 10,06", nal(fcfY * mcap, 3));
close(fcfM * ttmOms, 10.19, 0.005, "P4 FCF marginalväg 10,19", nal(fcfM * ttmOms, 3));
close(Math.pow(omsM[3] / omsM[0], 1 / 3) * 100 - 100, 15.55, 0.005, "P5 oms-CAGR 15,55");
close(Math.pow(resM[3] / resM[0], 1 / 3) * 100 - 100, 19.55, 0.005, "P5 res-CAGR 19,55 (exakt = fältet)");
close(Math.pow(fcfS[3] / fcfS[0], 1 / 3) * 100 - 100, 15.44, 0.005, "P5 FCF-CAGR 15,44");
close(pe / (progT * 100), 0.6526, 0.0005, "P6 PEG-konvention 0,6526");
close(pe / (ttmT * 100), 5.11, 0.005, "P6 PEG-på-TTM 5,11 (känslighetsrad)");
const aktier = mcap / pris * 1000; // miljoner
close(aktier, 373.2, 0.05, "aktietalet härledet 373,2 M", nal(aktier, 1));
close((mcap / pe) / (mcap / pris), 28.34, 0.005, "TTM-VPA 28,34 euro");
close(resM[3] / (mcap / pris), 25.75, 0.005, "bok-VPA 2025 25,75 euro");
close(pris / (resM[3] / (mcap / pris)), 55.1, 0.05, "bok-P/E 55,1");
close(pris / 28.34, pe, 0.01, "1 419 / 28,34 = P/E-fältet");

// trappan + övningar
console.log("\n[3b] TRAPPOR, SCENARIORUTA, ÖVNINGAR");
const q1 = 8.767, q2 = 9.326;
close(q1 + q2, 18.093, 0.0005, "H1 18,093 mdr");
close((44 - q1 - q2) / 44 * 100, 58.9, 0.05, "H2-andel 58,9 %");
close(44 - q1 - q2 - 11.5, 14.41, 0.005, "Q4-implied 14,41 mdr");
close((q2 / q1 - 1) * 100, 6.4, 0.06, "Q2-steg +6,4 %");
close((11.5 / q2 - 1) * 100, 23.3, 0.05, "Q3-steg +23,3 %");
close((14.407 / 11.5 - 1) * 100, 25.3, 0.05, "Q4-steg +25,3 %");
close((44 / 38 - 1) * 100, 15.8, 0.05, "guidelyft +15,8 %");
close((7.59 / 7.15 - 1) * 100, 6.2, 0.06, "EPS-steg +6,2 %");
close(7.15 + 7.59, 14.74, 0.005, "H1-EPS 14,74");
close(1.88 * 2 / pris * 100, 0.26, 0.006, "årsrun-utdelning 0,26 %");
close(1.1 / mcap * 100, 0.21, 0.005, "återköp andel 0,21 %/kvartal");
// återköpsmotorn mot utdelningen: ~0,83 %/år mot ~0,265 % => ~3,1x (paketet: ungefär tre gånger)
close((1.1 * 4 / mcap * 100) / (1.88 * 2 / pris * 100), 3.13, 0.05, "återköp ca 3x utdelningen");
const res23 = (resM[1] / resM[0] - 1) * 100, fcf23 = (fcfS[1] / fcfS[0] - 1) * 100;
const res24 = (resM[2] / resM[1] - 1) * 100, fcf24 = (fcfS[2] / fcfS[1] - 1) * 100;
close(res23, 39.4, 0.05, "2023 resultat +39,4 %");
close(fcf23, -54.4, 0.05, "2023 FCF -54,4 %");
close(res24, -3.4, 0.05, "2024 resultat -3.4 %");
close(fcf24, 176.7, 0.05, "2024 FCF +176,7 %");
for (const [ar, fo] of [[2022, 34.0], [2023, 11.9], [2024, 32.2], [2025, 33.9]])
  close(fcfS[ar - 2022] / omsM[ar - 2022] * 100, fo, 0.05, `FCF/oms ${ar} ${nal(fo, 1)} %`);
for (const [ar, fr] of [[2022, 1.28], [2023, 0.42], [2024, 1.20], [2025, 1.15]])
  close(fcfS[ar - 2022] / resM[ar - 2022], fr, 0.005, `FCF/res ${ar} ${nal(fr, 2)}`);
// scenariorutans nio celler + kalibrering
const sc = [[24.10, [964, 1207, 1446]], [28.34, [1134, 1419, 1700]], [35.50, [1420, 1777, 2130]]];
for (const [vpa, cells] of sc) {
  close(vpa * 40, cells[0], 0.5, `cell ${nal(vpa, 2)} x 40 = ${cells[0]}`);
  close(vpa * 50.07, cells[1], 0.5, `cell ${nal(vpa, 2)} x 50,07 = ${cells[1]}`);
  close(vpa * 60, cells[2], 0.5, `cell ${nal(vpa, 2)} x 60 = ${cells[2]}`);
}
close(28.34 * 50.07, pris, 0.5, "mittencell = kursen 1 419 (kalibrering)");
close(44 * 0.3011 / (mcap / pris), 35.50, 0.05, "upp-ankare: FY-mitt x nettomarginal = VPA 35,50");

// ---------- 4. MEDIANER + RANG ----------
console.log("\n[4] MEDIANER + RANG mot universumfilen (teknikgren n=22)");
const teknik = poster.filter(p => p.bransch === "teknik");
ok(teknik.length === 22, `teknikgrenen 22 poster`, String(teknik.length));
const kontroller = [
  // [etikett, värde, grenmedian-förväntat, universummedian-förväntat, hog (true = bäst högst), rPos = förväntad rang-position med den riktningen, n]
  // Ordinal påståenden i paketet: P/E,P/B,EV/EBIT "fjärde högst" (22-19+1=4) · PEG "fjärde lägst" (position 4 underifrån) ·
  // skuld/EK "sjunde lägst" (position 7 underifrån) · ROE "näst högst" · ROIC/FCFmarg/prognos "tredje högst" ·
  // EBITmarg "fjärde högst" · netto "sjätte högst" · omsCAGR "femte högst" · resCAGR "tionde av nitton" · mcap "nionde störst"
  ["P/E", pe, 24.8515, 20.69, false, 19, 22],
  ["P/B", pb, 6.3615, 2.76, false, 19, 22],
  ["EV/EBIT", evEbit, 24.401, 17.886, false, 19, 22],
  ["PEG", num(P.vardering.peg), 1.195, 1.28, false, 4, 18],
  ["FCF-yield", fcfY * 100, 2.27, 4.22, true, 12, 21],
  ["ROE", roe * 100, 28.68, 14.82, true, 2, 22],
  ["ROIC", num(P.lonksamhet.roic) * 100, 21.18, 13.375, true, 3, 21],
  ["brutto", num(P.lonksamhet.bruttoMarginal) * 100, 52.28, 47.725, true, 11, 22],
  ["EBITmarg", ebitM * 100, 25.615, 21.11, true, 4, 22],
  ["netto", nettoM * 100, 20.33, 14.09, true, 6, 22],
  ["FCFmarg", fcfM * 100, 14.70, 12.58, true, 3, 21],
  ["skuld/EK", skuldEk, 0.1893, 0.51, false, 7, 22],
  ["omsCAGR", num(P.tillvaxt.omsattningCAGR5ar) * 100, 8.63, 4.495, true, 5, 21],
  ["resCAGR", num(P.tillvaxt.resultatCAGR5ar) * 100, 19.55, 4.665, true, 10, 19],
  ["TTM", ttmT * 100, 11.97, 6.80, true, 12, 21],
  ["prognos", progT * 100, 17.80, 13.60, true, 3, 20],
  ["mcap", mcap, 370.9425, 126.011, true, 9, 22],
];
for (const [namn, val, gm, um, hog, rPos, nExp] of kontroller) {
  const fns = {
    // null-säker procentomvandling: num(null)*100 === 0 förorenar medianer/rangar (Aker BP-fällan)
    "P/E": p => num(p.vardering?.pe), "P/B": p => num(p.vardering?.pb), "EV/EBIT": p => num(p.vardering?.evEbit),
    PEG: p => num(p.vardering?.peg), "FCF-yield": p => num(p.vardering?.fcfYield) === null ? null : num(p.vardering.fcfYield) * 100, ROE: p => num(p.lonksamhet?.roe) === null ? null : num(p.lonksamhet.roe) * 100,
    ROIC: p => num(p.lonksamhet?.roic) === null ? null : num(p.lonksamhet.roic) * 100, brutto: p => num(p.lonksamhet?.bruttoMarginal) === null ? null : num(p.lonksamhet.bruttoMarginal) * 100,
    EBITmarg: p => num(p.lonksamhet?.ebitMarginal) === null ? null : num(p.lonksamhet.ebitMarginal) * 100, netto: p => num(p.lonksamhet?.nettoMarginal) === null ? null : num(p.lonksamhet.nettoMarginal) * 100,
    FCFmarg: p => num(p.lonksamhet?.fcfMarginal) === null ? null : num(p.lonksamhet.fcfMarginal) * 100, "skuld/EK": p => num(p.stabilitet?.skuldEgenkapital),
    omsCAGR: p => num(p.tillvaxt?.omsattningCAGR5ar) === null ? null : num(p.tillvaxt.omsattningCAGR5ar) * 100, resCAGR: p => num(p.tillvaxt?.resultatCAGR5ar) === null ? null : num(p.tillvaxt.resultatCAGR5ar) * 100,
    TTM: p => num(p.tillvaxt?.omsattningTillvaxtTTM) === null ? null : num(p.tillvaxt.omsattningTillvaxtTTM) * 100, prognos: p => num(p.tillvaxt?.prognosTillvaxt) === null ? null : num(p.tillvaxt.prognosTillvaxt) * 100,
    mcap: p => num(p.marknadsKapitalMdr),
  };
  const f = fns[namn];
  const t = teknik.map(f), u = poster.map(f);
  const r = rang(val, t, hog);
  ok(Math.abs(median(t) - gm) < 0.001 || Math.abs(median(t) - gm) / Math.max(gm, 0.001) < 0.001, `${namn}: grenmedian ${nal(median(t), 2)} (paketet ${nal(gm, 2)})`);
  ok(Math.abs(median(u) - um) < 0.001 || Math.abs(median(u) - um) / Math.max(Math.abs(um), 0.001) < 0.001, `${namn}: universummedian ${nal(median(u), 2)}`);
  ok(r === rPos, `${namn}: rang ${r} (förväntat ${rPos} i ${hog ? "fallande" : "stigande"} ordning) av ${t.filter(v => v !== null).length}`);
}

// ---------- 5. JURIDIKGRIND ----------
console.log("\n[5] JURIDIKGRIND");
const lagrum = [...b.matchAll(/(\d{4}:\d+)|\((\d{4})\)/g)].map(m => m[1] || m[2]).filter(x => /^\d{4}:\d+$/.test(x));
ok(b.includes("(2007:528)") && b.includes("2 kap 5 §"), "exakt ett lagrum: 2007:528 2 kap 5 § (värdepappersrörelsen, utbildningsundantaget)");
ok(lagrum.length === 1, `lagrumsräknare = 1`, lagrum.join(","));
const rad = /(rekommenderar att (du )?(köper|säljer)|du (bör|borde) (köpa|sälja|behålla)|tips att köpa|köp upp|sälj av|strong buy|strong sell|vi rekommenderar)/i;
const radTraff = b.match(rad);
ok(!radTraff, "0 rådgivningsfraser", radTraff ? radTraff[0] : "");
const kop = [...b.matchAll(/\b(köpa|sälja|köp|sälj|rekommendation|rekommendera)\b/gi)];
const neutrala = kop.every(m => {
  const s = b.slice(Math.max(0, m.index - 60), m.index + 60);
  return /inte en rekommendation|Inga köp-, sälj- eller hållnings|inte investeringsrådgivning|publiceringen/i.test(s);
});
ok(neutrala, `rådord endast i neutrala kontexter (${kop.length} förekomster)`);
ok(!/\bväntas\b|\bförväntas\b/i.test(b), "0 väntas/förväntas-formuleringar");
ok(/utbildning i metod|pedagogisk finansutbildning/i.test(b), "utbildningsframing närvarande");

// ---------- 6. SPRÅKGRIND ----------
console.log("\n[6] SPRÅKGRIND");
ok(!/\u00a0/.test(b), "0 hårda mellanslag (nbsp)");
ok(!/[\u201c\u201d\u2018\u2019\u00ab\u00bb]/.test(b), "0 typografiska citattecken");
ok(!/[\u4e00-\u9fff\u3040-\u30ff]/.test(b), "0 CJK-tecken");
ok(!/  +/.test(b), "0 dubbla mellanslag");
ok(!/\u2011|\u00ad/.test(b), "0 mjuka bindestreck");
const utanUrl = b.replace(/https?:\/\/[^\s)]+/g, "").replace(/asml\.com|MarketBeat|StockAnalysis|Euronext|Nasdaq/g, "");
ok(!/\d+\.\d+/.test(utanUrl), "0 punktdecimaler utanför URL:er/domäner");
ok(!/\\u|\t/.test(b), "0 tab/escape-läckor i body");

// ---------- 7. INTERNLÄNKAR ----------
console.log("\n[7] INTERNLÄNKAR (HTTP 200 mot localhost)");
const lankar = [...new Set([...b.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(m => m[1]))];
ok(lankar.length >= 20, `${lankar.length} unika interna länkar`);
for (const u2 of lankar) {
  const kod = await fetch("http://localhost:3000" + u2, { signal: AbortSignal.timeout(10000) }).then(r => r.status).catch(() => 0);
  ok(kod === 200, `länk ${u2} => ${kod}`);
}

console.log(`\n=== RESULTAT: ${PASS} PASS, ${FEL} FEL, ${VARN} VARNINGAR ===`);
process.exit(FEL ? 1 : 0);
