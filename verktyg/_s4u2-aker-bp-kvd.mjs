#!/usr/bin/env node
// KVD för sa-laser-du-aker-bp-q3-2026 (s4-u2, manifest auto-s4-1789835700993)
// Alla tal i paketet maskinverifieras mot bolagsunivers.json (2026-09-03-posten)
// och all aritmetik omräknas oberoende. Grind: 0 FEL, 0 VARNING = GRÖN.
import fs from "node:fs";

const PAKET = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-aker-bp-q3-2026.json";
const uni = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const lista = Array.isArray(uni) ? uni : uni.bolag;
const a = lista.find(b => b.ticker === "AKRBP.OL");
const p = JSON.parse(fs.readFileSync(PAKET, "utf8"));
const body = p.body;

let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj = "") => {
  if (villkor) { PASS++; }
  else { FEL++; console.log(`FEL: ${namn} ${detalj}`); }
};
const varna = (namn, villkor, detalj = "") => {
  if (villkor) { PASS++; }
  else { VARN++; console.log(`VARNING: ${namn} ${detalj}`); }
};
const approx = (x, y, tol) => Math.abs(x - y) <= tol;

// ── 1. Struktur ──────────────────────────────────────────────────────────────
ok("slug", p.slug === "sa-laser-du-aker-bp-q3-2026");
ok("filnamn", PAKET.endsWith(p.slug + ".json"));
ok("publishedAt = rappdag", p.publishedAt === "2026-10-29");
ok("author", p.author === "AK1A Research Lab");
ok("pillar", p.pillar === "Institutionell metodik");
ok("readingMinutes 6", p.readingMinutes === 6);
ok("tags", Array.isArray(p.tags) && p.tags.length === 7);
ok("title innehåller gren+antal", /fjärde paket/.test(p.title) && /57:e/.test(body));
ok("energigrenens fjärde i body", /energigrenens fjärde efter Iberdrola, Vår Energi och Fortum/.test(body));

// ── 2. Universumtal i bodyn ─────────────────────────────────────────────────
const falt = [
  ["P/E 17,015", "17,015", a.vardering.pe === 17.015],
  ["P/B 2,059", "2,059", a.vardering.pb === 2.059],
  ["EV/EBIT 26,027", "26,027", a.vardering.evEbit === 26.027],
  ["PEG null", /PEG.*null|null.*PEG/.test(body) && a.vardering.peg === null, true],
  ["FCF-yield −0,16", "minus 0,16 procent", a.vardering.fcfYield === -0.0016],
  ["ROE 12,07", "12,07 procent", a.lonksamhet.roe === 0.1207],
  ["ROIC 7,57", "7,57 procent", a.lonksamhet.roic === 0.0757],
  ["EBIT-marginal 75,80", "75,80 procent", a.lonksamhet.ebitMarginal === 0.758],
  ["Brutto 90,67", "90,67 procent", a.lonksamhet.bruttoMarginal === 0.9067],
  ["Netto 11,94", "11,94 procent", a.lonksamhet.nettoMarginal === 0.1194],
  ["Skuld/EK 0,8337", "0,8337", a.stabilitet.skuldEgenkapital === 0.8337],
  ["Pris 356,80", "356,80", a.pris === 356.8],
  ["Mcap 225,047", "225,047", a.marknadsKapitalMdr === 225.047],
  ["omsCAGR −7,56", "minus 7,56 procent", a.tillvaxt.omsattningCAGR5ar === -0.0756],
  ["resCAGR −57,37", "minus 57,37 procent", a.tillvaxt.resultatCAGR5ar === -0.5737],
  ["TTM +42", "plus 42 procent", a.tillvaxt.omsattningTillvaxtTTM === 0.42],
  ["prognos −16,5", "minus 16,5 procent", a.tillvaxt.prognosTillvaxt === -0.165],
];
for (const [namn, needle, sant] of falt) {
  const har = typeof needle === "string" ? body.includes(needle) : needle;
  ok(`body: ${namn}`, har && sant !== false);
}
// Serier (Mdr NOK)
const oms = a.serier.omsattning.map(v => +(v / 1e9).toFixed(1));   // 132.0 144.5 138.7 104.3
const res = a.serier.resultat.map(v => +(v / 1e9).toFixed(3));     // 16.263 14.121 20.471 1.260
ok("serie omsättning", body.includes("132,0 → 144,5 → 138,7 → 104,3") && [132.0, 144.5, 138.7, 104.3].every((v, i) => approx(oms[i], v, 0.06)));
ok("serie resultat", body.includes("16,263 → 14,121 → 20,471 → 1,260") && [16.263, 14.121, 20.471, 1.26].every((v, i) => approx(res[i], v, 0.001)));

// ── 3. Medianer och rang omräknade ur filen ──────────────────────────────────
const med = v => { const s = [...v].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const gren = lista.filter(b => b.bransch === "energi");
const kol = { pe: b => b.vardering?.pe, pb: b => b.vardering?.pb, evEbit: b => b.vardering?.evEbit, fcf: b => b.vardering?.fcfYield, roe: b => b.lonksamhet?.roe, roic: b => b.lonksamhet?.roic, netto: b => b.lonksamhet?.nettoMarginal, ebit: b => b.lonksamhet?.ebitMarginal, brutto: b => b.lonksamhet?.bruttoMarginal, skuld: b => b.stabilitet?.skuldEgenkapital, prognos: b => b.tillvaxt?.prognosTillvaxt };
const fmt = v => (v >= 10 ? v.toFixed(2) : v >= 1 ? v.toFixed(3) : v.toFixed(4));
const forv = {
  pe: "16,53", pb: "2,275", evEbit: "13,44", fcf: "5,28", roe: "12,91", roic: "11,63", netto: "9,08", ebit: "18,22", brutto: "40,13", skuld: "0,5037", prognos: "5,71"
};
// andelsfält (0–1) redovisas i procent i paketet
const andel = new Set(["fcf", "roe", "roic", "netto", "ebit", "brutto", "prognos"]);
for (const [k, f] of Object.entries(kol)) {
  const gv = gren.map(f).filter(v => typeof v === "number");
  const m = med(gv) * (andel.has(k) ? 100 : 1);
  const hs = forv[k];
  ok(`median ${k} = ${hs} (n ${gv.length})`, approx(m, parseFloat(hs.replace(",", ".")), 0.006) && body.includes(hs), `beräknad ${fmt(m)} n=${gv.length}`);
}
// n-redovisning
ok("P/E n 18", body.includes("16,53 (n 18)"));
ok("prognos n 18", body.includes("5,71 % (n 18)"));
ok("19 bolag", /19 bolag/.test(body));
// Rang
const rangAsc = (v, x) => [...v].sort((q, w) => q - w).indexOf(x) + 1;
ok("rang EBIT högst", rangAsc(gren.map(kol.ebit).filter(v => typeof v === "number"), 0.758) === 19);
ok("rang brutto högst", rangAsc(gren.map(kol.brutto).filter(v => typeof v === "number"), 0.9067) === 19);
ok("rang skuld 4:e högst", 19 - rangAsc(gren.map(kol.skuld).filter(v => typeof v === "number"), 0.8337) + 1 === 4);
ok("rang EV/EBIT 3:e högst", 19 - rangAsc(gren.map(kol.evEbit).filter(v => typeof v === "number"), 26.027) + 1 === 3);

// ── 4. Aritmetik omräknad ────────────────────────────────────────────────────
ok("identitet 17,015×0,1207=2,0537 (gap −0,26 %)", approx(17.015 * 0.1207, 2.0537, 0.0001) && body.includes("2,0537") && body.includes("0,26 procent"));
const ttmPE = 225.047 / 17.015, ttmMarg = 0.1194 * 104.251;
ok("TTM-trippeln 13,226/12,448/1,260 + sväng 11,97", approx(ttmPE, 13.226, 0.001) && approx(ttmMarg, 12.448, 0.001) && approx(ttmPE - 1.260, 11.966, 0.001) && body.includes("13,226") && body.includes("12,448") && body.includes("11,97"));
const ek = 225.047 / 2.059, skuld = ek * 0.8337, ev = 225.047 + skuld;
ok("EV-kedja 109,299/91,122/316,169", approx(ek, 109.299, 0.001) && approx(skuld, 91.122, 0.001) && approx(ev, 316.169, 0.001) && body.includes("109,299") && body.includes("91,122") && body.includes("316,169"));
const ebitA = ev / 26.027, ebitB = 0.758 * 104.251;
ok("EBIT-vägar 12,148/79,022 kvot 6,5", approx(ebitA, 12.148, 0.001) && approx(ebitB, 79.022, 0.001) && approx(ebitB / ebitA, 6.50, 0.01) && body.includes("12,148") && body.includes("79,022"), `ebitA=${ebitA.toFixed(4)} ebitB=${ebitB.toFixed(4)} kvot=${(ebitB / ebitA).toFixed(4)}`);
ok("skatteklippa 84,2 %", approx(100 * (1 - 0.1194 / 0.758), 84.25, 0.05) && body.includes("84,2 procent"));
ok("valutakurser 9,51/9,26 (2 decimaler)", approx(6.29417 / 0.6615, 9.51, 0.005) && approx(6.12853 / 0.6615, 9.26, 0.005) && body.includes("9,51") && body.includes("9,26"), `feb=${(6.29417 / 0.6615).toFixed(4)} maj=${(6.12853 / 0.6615).toFixed(4)}`);
ok("årsrun 24,51 → 6,9 %", approx(4 * 6.12853, 24.514, 0.001) && body.includes("24,51") && approx(100 * 24.514 / 356.8, 6.87, 0.05) && body.includes("6,9 procent"));
// Scenariorutan 9 celler
const celler = [[14, 13.44, "188,2"], [14, 17.015, "238,2"], [14, 20.53, "287,4"], [20.97, 13.44, "281,8"], [20.97, 17.015, "356,8"], [20.97, 20.53, "430,5"], [28, 13.44, "376,3"], [28, 17.015, "476,4"], [28, 20.53, "574,8"]];
for (const [vpa, m, s] of celler) ok(`cell ${vpa}×${m}=${s}`, body.includes(s) && approx(vpa * m, parseFloat(s.replace(",", ".")), 0.06), `räknat ${(vpa * m).toFixed(2)}`);
ok("kalibrering 356,8 mot 356,80 (en hundredels %)", approx(20.97 * 17.015, 356.8, 0.05) && body.includes("en hundredels procent"));
ok("räknesats VPA ~7 kr → 118,6", approx((20.97 - 14) * 17.015, 118.6, 0.1) && body.includes("118,6"));
ok("räknesats multiplen 3,575 → 75,0", approx(3.575 * 20.97, 75.0, 0.1) && body.includes("75,0 kronor"));
ok("VPA 20,97 och 2,00", approx(356.8 / 17.015, 20.97, 0.005) && body.includes("20,97") && approx(1.26e9 / 630.7e6, 2.00, 0.005) && body.includes("2,00 kronor"), `ttm=${(356.8 / 17.015).toFixed(4)} ar2025=${(1.26e9 / 630.7e6).toFixed(4)}`);
ok("P/B-ett 173,29 (−51,4 %)", approx(ek * 1e9 / 630.7e6, 173.29, 0.01) && body.includes("173,29") && body.includes("51,4"));
ok("EK-väg +105,8 %", approx(225.047 / ek, 2.0587, 0.001) && body.includes("105,8"));
ok("P/E-medianväg 346,7", approx(356.8 * 16.53 / 17.015, 346.7, 0.1) && body.includes("346,7"), `räknat ${(356.8 * 16.53 / 17.015).toFixed(2)}`);
ok("universummultiplar 13,44/17,015/20,53 i rutan", body.includes("13,44") && body.includes("20,53"));

// ── 5. Juridikgrind: rådförbud ───────────────────────────────────────────────
const forbjudna = [/\bköp [^"]*(aktie|andel|nu)/i, /\bsälj [^"]*(aktie|andel|nu)/i, /rekommenderar (att )?(köpa|sälja)/i, /\bundvik\b/i, /målkurs/i, /\bväntas\b/, /ge stark avkastning/i, /bör du köpa/i, /dags att köpa/i];
for (const re of forbjudna) ok(`rådförbud ${re}`, !re.test(body));
ok("disclaimer 2007:528", body.includes("2007:528") && body.includes("inte investeringsrådgivning"));
ok("inga råd-formulering ingress", body.includes("inte en rekommendation att köpa, sälja eller behålla"));
ok("publicering = kundens beslut", body.includes("publiceringen av detta paket är kundens beslut"));

// ── 6. Kalender- och källfakta ───────────────────────────────────────────────
ok("rappdag 29 oktober + 2026-10-29", body.includes("29 oktober") && body.includes("2026-10-29"));
ok("sedvana 06:00/08:30", body.includes("06:00 CET") && body.includes("08:30"));
ok("utdelningskedja 3+12 nov", body.includes("3 november") && body.includes("12 november"));
ok("kalender-URL", body.includes("akerbp.com/en/investor/calendar/"));
ok("kalender-energi.json refererad", body.includes("kalender-energi.json"));
ok("hämtdatum 2026-09-15 och 09-03", body.includes("2026-09-15") && body.includes("2026-09-03"));
ok("live-verifierad 2026-09-19", body.includes("live-verifierad 2026-09-19") || body.includes("Verifierad 2026-09-19") || body.includes("sökverifierade 2026-09-19"));
ok("Q2-tal 521/3,7/3,1/0,82/2,10", body.includes("521") && body.includes("3,7 miljarder") && body.includes("3,1 miljarder") && body.includes("0,82 dollar") && body.includes("2,10 dollar"));
ok("produktion 398 000/383 600", body.includes("398 000") && body.includes("383 600"));
ok("utdelningsbelopp 0,6615 + NOK 6,29417/6,12853", body.includes("0,6615") && body.includes("6,29417") && body.includes("6,12853"));
ok("Stora Enso-precedensen för ex-dag-divergens", body.includes("Stora Enso-precedensen"));

// ── 7. Interna länkar (energi-aspekter + bolagssida) ────────────────────────
const lankar = ["/dataset/energi/roe", "/dataset/energi/roic", "/dataset/energi/pe", "/dataset/energi/pb", "/dataset/energi/ev-ebit", "/dataset/energi/fcf-avkastning", "/dataset/energi/netto-marginal", "/dataset/energi/omsattning-cagr-5ar", "/dataset/energi/omsattningstillvaxt-ttm", "/dataset/energi/resultat-cagr-5ar", "/dataset/energi/prognos-tillvaxt", "/dataset/energi/skuldsattning", "/dataset/energi/universumjamforelse", "/dataset/energi/vardering", "/dataset/energi", "/bolag/akrbp-ol", "/kurser", "/transparens", "/kallor"];
for (const l of lankar) ok(`länk ${l}`, body.includes(`](${l})`) || body.includes(`](${l})`));
ok("slug-mappning akrbp-ol giltig (ticker.toLowerCase dots→dash)", "akrbp-ol" === a.ticker.toLowerCase().replace(/\./g, "-"));

// ── 8. Seriens protokoll ─────────────────────────────────────────────────────
ok("klaimfil finns", fs.existsSync("data/vakten/auto-s4-1789835700993-s4-u2-ansprak.md"));
ok("inget duplikat på disk (exakt en aker-bp-fil)", fs.readdirSync("data/blogg-utkast/kvartal/2026-q3/").filter(f => f.includes("aker-bp")).length === 1);
ok("syskonkoordinering redovisad (u1 TRUE, u3 HUFV)", body.includes("Truecaller (3 november, syskon u1)") && body.includes("Hufvudstaden (5 november, syskon u3)"));
ok("vågvaliderings-ärlighetsnot", body.includes("utanför vågvalideringens tolvbolagskarta"));
ok("golv osatt-not", body.includes("osatt"));
ok("Vår Energi-precedensen hänvisad", body.includes("Vår Energi"));
ok("kö-notis vidare (SHELL/RWE/Fresenius)", body.includes("RWE 11/11") && body.includes("Fresenius"));

// ── Resultat ─────────────────────────────────────────────────────────────────
console.log(`\nKVD Aker BP: ${PASS} PASS, ${FEL} FEL, ${VARN} VARNING`);
process.exit(FEL + VARN > 0 ? 1 : 0);
