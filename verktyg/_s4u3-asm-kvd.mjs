#!/usr/bin/env node
// _s4u3-asm-kvd.mjs — KVD för ASM International Q3-2026-läspaketet (spår 4, s4-u3).
// Oberoende kanal: källtalen hårdkodade här (ej import ur motorn), aritmetiken omräknad,
// universum/medianer/rang LIVE ur data/portfolj-system/bolagsunivers.json.
// Körning 2× med identisk utdata = deterministisk (jämför SUMMA-raden).

import { readFileSync, readdirSync, existsSync } from "node:fs";

let pass = 0, fel = 0;
const resultat = [];
const K = (namn, ok, detalj = "") => {
  pass += ok ? 1 : 0; fel += ok ? 0 : 1;
  resultat.push(`${ok ? "PASS" : "FEL"} ${namn}${detalj ? " — " + detalj : ""}`);
};

// ── Paketet ──────────────────────────────────────────────────────────────────
const FIL = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-asm-international-q3-2026.json";
const paket = JSON.parse(readFileSync(FIL, "utf8"));
const B = paket.body;
const BN = B.replace(/\u00A0/g, " "); // sv-SE-tusentalsgruppering ger icke-brytbart mellanslag
const BT = (s) => BN.includes(String(s).replace(/\u00A0/g, " ")); // textsök: normalisera både kropp och söksträng

// ── A. Filstruktur & meta ────────────────────────────────────────────────────
K("A1 slug", paket.slug === "sa-laser-du-asm-international-q3-2026");
K("A2 title-ämne", /ASM International kvartalsrapport Q3 2026/.test(paket.title) && /teknikspårets paket 11/.test(paket.title));
K("A3 description", paket.description.length >= 400 && /27 oktober/.test(paket.description) && /ordermörkret|EV/.test(paket.description));
K("A4 pillar/author", paket.pillar === "Institutionell metodik" && paket.author === "AK1A Research Lab");
K("A5 publishedAt = rappdagen", paket.publishedAt === "2026-10-27");
K("A6 readingMinutes", paket.readingMinutes === 5);
K("A7 tags", Array.isArray(paket.tags) && paket.tags.length === 6 && paket.tags.includes("ASM International"));
K("A8 inga tomma fält", Object.values(paket).every(v => v !== "" && v != null));

// ── B. Bodystruktur ──────────────────────────────────────────────────────────
const h2 = B.match(/^## .*$/gm) || [];
K("B1 H2 exakt 12", h2.length === 12, `fann ${h2.length}`);
K("B2 inga H1", !/^# [^#]/m.test(B));
const ord = B.replace(/[#*|_>`[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
K("B3 ord 2700–3300", ord >= 2700 && ord <= 3300, `${ord} ord`);
const sista = B.split("\n").filter(r => r.trim()).slice(-1)[0];
const DISC = "*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar med källa och datum angivna; där en källa saknar data står det explicit, och där källans fält inte håller för kontroll redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*";
K("B4 disclaimer exakt sista raden", sista === DISC);
K("B5 inga CJK-tecken", !/[\u3400-\u9fff\u3000-\u30ff]/.test(B));
K("B6 publicering ej i live-mappen", !existsSync("data/blogg/sa-laser-du-asm-international-q3-2026.json"));

// ── C. Universumparitet LIVE ────────────────────────────────────────────────
const uniRaw = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const uni = Array.isArray(uniRaw) ? uniRaw : (uniRaw.bolag || Object.values(uniRaw).find(Array.isArray));
const ASM = uni.find(p => p.ticker === "ASM.AS");
K("C1 ASM.AS finns", !!ASM);
const sv = (x, d = 1) => x.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d });
const sv0 = (x) => x.toLocaleString("sv-SE", { maximumFractionDigits: 0 });
const falt = [
  ["pris", sv(ASM.pris, 2)], ["mcap", sv0(ASM.marknadsKapitalMdr)],
  ["P/E", sv(ASM.vardering.pe, 2)], ["P/B", sv(ASM.vardering.pb, 3)],
  ["EV/EBIT", sv(ASM.vardering.evEbit, 3)], ["PEG", sv(ASM.vardering.peg, 2)],
  ["ROE %", sv(ASM.lonksamhet.roe * 100, 1)], ["ROIC %", sv(ASM.lonksamhet.roic * 100, 1)],
  ["brutto %", sv(ASM.lonksamhet.bruttoMarginal * 100, 1)], ["EBIT %", sv(ASM.lonksamhet.ebitMarginal * 100, 1)],
  ["netto %", sv(ASM.lonksamhet.nettoMarginal * 100, 1)],
  ["omsCAGR %", sv(ASM.tillvaxt.omsattningCAGR5ar * 100, 1)], ["resCAGR %", sv(ASM.tillvaxt.resultatCAGR5ar * 100, 1)],
  ["prognos %", sv(ASM.tillvaxt.prognosTillvaxt * 100, 1)],
  ["skuld/EK", sv(ASM.stabilitet.skuldEgenkapital, 2)],
  ...ASM.serier.omsattning.map((v, i) => ["serOms" + ASM.serier.ar[i], sv(v / 1e6, 1)]),
  ...ASM.serier.resultat.map((v, i) => ["serRes" + ASM.serier.ar[i], sv(v / 1e6, 1)]),
];
for (const [namn, format] of falt) K(`C2 ${namn}="${format}"`, BT(format));

// ── D. PR-paritet (multiset, oberoende hårdkodade källtal — de tal paketet bär) ─
const prTal = [
  // kvartalstabellens kolumner (omsättning, brutto-%, rörelseresultat, netto, justerat netto)
  "809,0", "222,3", "225,8", "231,5", "50,3",
  "839,2", "53,4", "266,2", "−28,9", "191,9",
  "835,6", "51,8", "258,5", "202,4", "173,0",
  "800,0", "51,9", "242,8", "384,1", "206,2",
  "698,3", "49,8", "170,5", "166,1", "169,6",
  "862,5", "53,3", "278,2", "238,5", "246,0",
  "1 003,1", "51,9", "322,8", "285,4", "292,9",
  // textburna källtal
  "636,8", "802,8", "521,1", "355", "830", "630", "660",
  "3,25", "3,00", "18:00", "27 oktober",
];
const saknas = prTal.filter(t => !BT(t));
K("D1 PR-tal multiset", saknas.length === 0, saknas.length ? `saknas: ${saknas.join(", ")}` : `${prTal.length} tal`);

// ── E. Aritmetik oberoende omräknad ──────────────────────────────────────────
const E = [];
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const [q1n, q2n, q3n, q4n, q1o, q2o, q3o, q4o, q1j, q2j, q3j, q4j, q3op, q4op, q1op, q2op] = [-28.9, 202.4, 384.1, 166.1, 839.2, 835.6, 800.0, 698.3, 191.9, 173.0, 206.2, 169.6, 242.8, 170.5, 278.2, 322.8];
const q1n26 = 238.5, q2n26 = 285.4, q1o26 = 862.5, q2o26 = 1003.1, q1j26 = 246.0, q2j26 = 292.9;
E.push(["FY25-netto", r1(q1n + q2n + q3n + q4n), sv(723.7, 1)]);
E.push(["FY25-oms", r1(q1o + q2o + q3o + q4o), sv(3173.1, 1)]);
const ttmN = r1(q3n + q4n + q1n26 + q2n26), ttmO = r1(q3o + q4o + q1o26 + q2o26);
E.push(["TTM-netto", ttmN, sv(1074.1, 1)]);
E.push(["TTM-oms", ttmO, sv(3363.9, 1)]);
E.push(["TTM-nettomarginal %", r2(ttmN / ttmO * 100), sv(31.93, 2)]);
const mcap = ASM.marknadsKapitalMdr * 1000, peBas = mcap / ASM.vardering.pe; // M EUR
E.push(["P/E-bas", r1(peBas), sv(1069.2, 1)]);
E.push(["TTM-gap %", r2((ttmN / peBas - 1) * 100), sv(0.46, 2)]);
const ttmOp = r1(q3op + q4op + q1op + q2op), ev = ASM.vardering.evEbit * ttmOp;
E.push(["EBIT-TTM", ttmOp, sv(1014.3, 1)]);
E.push(["EV", Math.round(ev), sv0(35577)]);
E.push(["nettokassa", Math.round(mcap - ev), sv0(2562)]);
const aktier = mcap / ASM.pris;
E.push(["aktier M", r1(aktier), sv(48.9, 1)]);
E.push(["EPS rapporterad", r2(ttmN / aktier), sv(21.95, 2)]);
const ttmJ = r1(q3j + q4j + q1j26 + q2j26);
E.push(["TTM justerad", ttmJ, sv(914.7, 1)]);
E.push(["EPS justerad", r2(ttmJ / aktier), sv(18.69, 2)]);
E.push(["P/E justerad", r2(ASM.pris / (ttmJ / aktier)), sv(41.70, 2)]);
E.push(["EK ur P/B", Math.round(mcap / ASM.vardering.pb), sv0(4443)]);
E.push(["medel-EK ur ROE", Math.round(ttmN / ASM.lonksamhet.roe), sv0(4008)]);
E.push(["börjar-EK", Math.round(2 * (ttmN / ASM.lonksamhet.roe) - mcap / ASM.vardering.pb), sv0(3573)]);
E.push(["PEG-konvention", r2(ASM.vardering.pe / (ASM.tillvaxt.prognosTillvaxt * 100)), sv(1.17, 2)]);
const h1 = r1(q1o26 + q2o26), h2m = h1 * 1.2;
E.push(["H2-plan", r1(h2m), sv(2238.7, 1)]);
E.push(["FY26-plan", r1(h1 + h2m), sv(4104.3, 1)]);
E.push(["Q3-botten", Math.round(1100 * 0.95), sv0(1045)]);
E.push(["Q3-topp", Math.round(1100 * 1.05), sv0(1155)]);
const utd = 3.25 * aktier;
E.push(["utdelningsflöde", r1(utd), sv(159.0, 1)]);
E.push(["återbörd", r1(utd + 150), sv(309.0, 1)]);
E.push(["återbörd/TTM %", r1((utd + 150) / ttmN * 100), sv(28.8, 1)]);
E.push(["återbörd/just %", r1((utd + 150) / ttmJ * 100), sv(33.8, 1)]);
E.push(["direktavk %", r2(3.25 / ASM.pris * 100), sv(0.42, 2)]);
E.push(["utdelningshöjning %", r1((3.25 / 3.00 - 1) * 100), sv(8.3, 1)]);
E.push(["Q4 QoQ %", r1((698.3 / 800.0 - 1) * 100), sv(-12.7, 1)]);
E.push(["Q4 YoY %", r1((698.3 / 809.0 - 1) * 100), sv(-13.7, 1)]);
E.push(["Q4 mot guide %", r1((698.3 / 660 - 1) * 100), sv(5.8, 1)]);
E.push(["b2b Q3-25", r2(636.8 / 800.0), sv(0.80, 2)]);
E.push(["b2b Q4-25", r2(802.8 / 698.3), sv(1.15, 2)]);
// Scenariorutans 9 celler
const scen = [[3960, 0.24], [3960, 0.27], [3960, 0.30], [4104.3, 0.24], [4104.3, 0.27], [4104.3, 0.30], [4260, 0.24], [4260, 0.27], [4260, 0.30]];
for (const [o, m] of scen) {
  const netto = Math.round(o * m * 10) / 10, peS = r2(mcap / netto); // motor-kedjan: en decimal i netto, två i P/E
  E.push([`scen ${o}×${m}`, netto, sv0(netto) + " ("]);
  E.push([`scen ${o}×${m} P/E`, peS, sv(peS, 1) + ")"]);
}
// Premier
E.push(["P/E-premie ×", r2(ASM.vardering.pe / 21.57), sv(1.65, 2)]);
E.push(["P/B-premie ×", r2(ASM.vardering.pb / 4.49), sv(1.91, 2)]);
E.push(["netto-premie ×", r2(ASM.lonksamhet.nettoMarginal / 0.1637), sv(1.95, 2)]);
E.push(["prognos-premie ×", r2(ASM.tillvaxt.prognosTillvaxt / 0.2108), sv(1.45, 2)]);
E.push(["ROE-delta pp", r1((ASM.lonksamhet.roe - 0.2608) * 100), sv(0.7, 1)]);
E.push(["FCF-andel av mcap %", r1(355 / mcap * 100), sv(0.9, 1)]);
E.push(["kassa/aktie", r1((mcap - ev) / aktier), sv(52.4, 1)]);
const tolerans = (ber, textStr) => {
  const t = parseFloat(String(textStr).replace(/−/g, "-").replace(/,/g, ".").replace(/\s/g, "").replace(/[()]/g, ""));
  return isFinite(t) && Math.abs(ber - t) <= Math.max(0.05, Math.abs(ber) * 0.004);
};
for (const [namn, ber, sok] of E) {
  const s = String(sok).replace(/\u00A0/g, " ");
  const i = BN.indexOf(s);
  K(`E ${namn} (${sok.slice(0, 14).trim()})`, i >= 0 && tolerans(ber, sok), `ber=${ber}`);
}

// ── F. Medianer/rang LIVE ────────────────────────────────────────────────────
const tekn = uni.filter(p => p.bransch === "teknik");
const median = (vals) => { const s = vals.filter(v => typeof v === "number" && isFinite(v)).sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const rankDesc = (vals, v) => vals.filter(x => typeof x === "number" && isFinite(x)).sort((a, b) => b - a).indexOf(v) + 1;
K("F1 teknik n=33", tekn.length === 33);
const fTal = [
  ["median P/E", sv(median(tekn.map(p => p.vardering?.pe)), 2), "21,57"],
  ["median P/B", sv(median(tekn.map(p => p.vardering?.pb)), 2), "4,49"],
  ["median EV/EBIT", sv(median(tekn.map(p => p.vardering?.evEbit)), 2), "19,28"],
  ["median PEG", sv(median(tekn.map(p => p.vardering?.peg)), 3), "0,745"],
  ["median ROE %", sv(median(tekn.map(p => p.lonksamhet?.roe)) * 100, 1), "26,1"],
  ["median ROIC %", sv(median(tekn.map(p => p.lonksamhet?.roic)) * 100, 1), "18,7"],
  ["median brutto %", sv(median(tekn.map(p => p.lonksamhet?.bruttoMarginal)) * 100, 1), "48,7"],
  ["median EBIT %", sv(median(tekn.map(p => p.lonksamhet?.ebitMarginal)) * 100, 1), "21,2"],
  ["median netto %", sv(median(tekn.map(p => p.lonksamhet?.nettoMarginal)) * 100, 1), "16,4"],
  ["median prognos %", sv(median(tekn.map(p => p.tillvaxt?.prognosTillvaxt)) * 100, 1), "21,1"],
  ["median skuld/EK", sv(median(tekn.map(p => p.stabilitet?.skuldEgenkapital)), 2), null],
];
for (const [namn, live, bodified] of fTal) K(`F2 ${namn} LIVE="${live}"`, bodified === null || live === bodified || tolerans(parseFloat(live.replace(",", ".")), bodified));
const rPe = rankDesc(tekn.map(p => p.vardering?.pe), ASM.vardering.pe);
const nPe = tekn.filter(p => typeof p.vardering?.pe === "number").length;
const rPb = rankDesc(tekn.map(p => p.vardering?.pb), ASM.vardering.pb);
const rRoe = rankDesc(tekn.map(p => p.lonksamhet?.roe), ASM.lonksamhet.roe);
const rBrutto = rankDesc(tekn.map(p => p.lonksamhet?.bruttoMarginal), ASM.lonksamhet.bruttoMarginal);
const rEbit = rankDesc(tekn.map(p => p.lonksamhet?.ebitMarginal), ASM.lonksamhet.ebitMarginal);
const rNetto = rankDesc(tekn.map(p => p.lonksamhet?.nettoMarginal), ASM.lonksamhet.nettoMarginal);
const rProg = rankDesc(tekn.map(p => p.tillvaxt?.prognosTillvaxt), ASM.tillvaxt.prognosTillvaxt);
K("F3 rang P/E", rPe === 11 && nPe === 32 && BT("11:a av 32"), `r=${rPe}/${nPe}`);
K("F4 rang P/B", rPb === 8 && B.includes("8:a av 33"), `r=${rPb}`);
K("F5 rang ROE", rRoe === 16, `r=${rRoe}`);
K("F6 rang brutto", rBrutto === 15, `r=${rBrutto}`);
K("F7 rang EBIT", rEbit === 10, `r=${rEbit}`);
K("F8 rang netto", rNetto === 5, `r=${rNetto}`);
K("F9 rang prognos", rProg === 13, `r=${rProg}`);
const skVals = tekn.map(p => p.stabilitet?.skuldEgenkapital).filter(x => typeof x === "number" && isFinite(x)).sort((a, b) => a - b);
const skRang = skVals.indexOf(ASM.stabilitet.skuldEgenkapital) + 1;
K("F10 rang skuld/EK", skRang >= 1 && BT(`nummer ${skRang} av ${skVals.length}`), `r=${skRang}/${skVals.length}`);

// ── G. Juridik ───────────────────────────────────────────────────────────────
const lagrum = (B.match(/2007:528/g) || []).length;
K("G1 exakt ett lagrum 2007:528", lagrum === 1, `${lagrum}`);
K("G2 paragraf 2 kap 5 §", (B.match(/2 kap 5 §/g) || []).length === 1);
const råd = ["vi rekommenderar", "rekommenderar att", "bör köpa", "bör sälja", "köp aktien", "sälj aktien", "vårt råd", "råder vi", "aktieköp nu"];
K("G3 rådfraser 0", råd.every(f => !BN.toLowerCase().includes(f)));
K("G4 utbildningsframing", /så läser du|läsövning|räkneövning|pedagogisk/.test(B));

// ── H. Länkar ────────────────────────────────────────────────────────────────
const lankar = [...B.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
const GILTIGA = new Set(["pe", "pb", "ev-ebit", "peg", "roe", "roic", "brutto-marginal", "netto-marginal",
  "fcf-avkastning", "vardering", "universumjamforelse", "omsattning-cagr-5ar", "omsattningstillvaxt-ttm",
  "prognos-tillvaxt", "resultat-cagr-5ar", "skuldsattning", "egenkapitalmultipl",
  "sverige", "danmark", "usa", "storbritannien", "tyskland", "frankrike", "schweiz", "japan", "australien"]);
const interna = lankar.filter(l => l.startsWith("/"));
const externa = lankar.filter(l => !l.startsWith("/"));
let lankOk = interna.length >= 15;
const detaljer = [];
for (const l of interna) {
  const m = l.match(/^\/dataset\/teknik\/([a-z0-9-]+)$/);
  if (m) { if (!GILTIGA.has(m[1])) { lankOk = false; detaljer.push("aspekt:" + m[1]); } continue; }
  if (l === "/bolag/asm-as" || l === "/kurser" || l === "/transparens" || l === "/kallor") continue;
  lankOk = false; detaljer.push(l);
}
K("H1 interna länkar giltiga", lankOk, `${interna.length} interna; ogiltiga: ${detaljer.join(",") || "0"}`);
const pubSlugs = JSON.parse(readFileSync("data/cache/bolags-publicerade.json", "utf8"));
K("H2 /bolag/asm-as publicerad", JSON.stringify(pubSlugs).includes("asm-as"));
K("H3 externa markdown-länkar 0", externa.length === 0, `${externa.length}`);

// ── I. Kontext ───────────────────────────────────────────────────────────────
K("I1 klaimfil", existsSync("data/vakten/klaim-s4u3-asm-q3-2026.md"));
const dup = readdirSync("data/blogg-utkast/kvartal/2026-q3").filter(f => f.includes("asm-international"));
K("I2 exakt ett asm-paket", dup.length === 1, dup.join(","));
K("I3 motor finns", existsSync("verktyg/_s4u3-asm-byggdata.mjs"));
K("I4 asml = annat bolag (ej duplikat)", existsSync("data/blogg-utkast/kvartal/2026-q3/sa-laser-du-asml-q3-2026.json"));

// ── UTDATA ───────────────────────────────────────────────────────────────────
for (const r of resultat) console.log(r);
const summa = `${pass} PASS ${fel} FEL ${Math.round(B.length / 1024)} kB ord ${ord}`;
console.log("---");
console.log("KVD " + (fel === 0 ? "GRÖN" : "FÖRBI") + ": " + summa);
console.log("SUMMA:" + Buffer.from(resultat.join("|")).toString("base64").slice(0, 40));
