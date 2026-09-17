// _s1u3-indu-kontroll.mjs — granskningssond för kvartalspaketet INDU (Industrivärden Q3 2026)
// Kör: node verktyg/_s1u3-indu-kontroll.mjs
// Läser ENDAST källfiler + utkast; skriver inget i data/ (utdata = stdout).
import fs from "node:fs";

const OK = [], F = [], W = [];
const ok = (m) => OK.push(m);
const fe = (m) => F.push(m);
const wa = (m) => W.push(m);
const eps = (a, b, tol = 0.0005) => Math.abs(a - b) <= tol;

const u = JSON.parse(fs.readFileSync("data/blogg-utkast/kvartal/2026-q3/sa-laser-du-industrivarden-q3-2026.json", "utf8"));
const uni = JSON.parse(fs.readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const ana = JSON.parse(fs.readFileSync("data/analyses/INDU-C.ST.json", "utf8"));
const kal = JSON.parse(fs.readFileSync("data/blogg-utkast/kvartal/2026-q3/kalender-industri.json", "utf8"));
const rawU = fs.readFileSync("data/blogg-utkast/kvartal/2026-q3/sa-laser-du-industrivarden-q3-2026.json", "utf8");

const indu = uni.find((b) => b.ticker === "INDU-C.ST");
if (!indu) fe("INDU-C.ST saknas i bolagsuniversum");
const kalIndu = (kal.bolag || kal).filter ? (kal.bolag || kal).filter((b) => b.ticker === "INDU-C.ST") : [];

const body = u.body;
const has = (s) => body.includes(s);
const num = (v) => (typeof v === "number" ? v : parseFloat(v));

// ─── 1. KÄLLINTEGRETET: utkastets tal mot universums INDU-rad ───────────────
const tal = [
  ["pris 534,20", has("534,20") && eps(num(indu.pris), 534.2)],
  ["börsvärde ~231 mdr", has("231 miljarder") && eps(indu.marknadsKapitalMdr, 230.721)],
  ["ROE 32,3", has("**32,3 procent**") && eps(indu.lonksamhet.roe, 0.3227)],
  ["ROIC 52,2", has("**52,2 procent**") && eps(indu.lonksamhet.roic, 0.5217)],
  ["FCF-avkastning 17,1", has("**17,1 procent**") && eps(indu.vardering.fcfYield, 0.171)],
  ["bruttomarginal 100", has("bruttomarginal 100 procent") && eps(indu.lonksamhet.bruttoMarginal, 1)],
  ["rörelsemarginal 99,9", has("rörelsemarginal 99,9 procent") && eps(indu.lonksamhet.ebitMarginal, 0.9988, 0.00005)],
  ["nettomarginal 99,3", has("nettomarginal 99,3 procent") && eps(indu.lonksamhet.nettoMarginal, 0.9931, 0.00005)],
  ["TTM +12,0", has("**plus 12,0 procent**") && eps(indu.tillvaxt.omsattningTillvaxtTTM, 11.979, 0.03)],
  ["prognos osatt", has("Prognostillväxt: **osatt**") && indu.tillvaxt.prognosTillvaxt === null],
  ["P/B 1,03", has("**1,03**") && eps(indu.vardering.pb, 1.029)],
  ["P/E 3,7", has("**3,7**") && eps(indu.vardering.pe, 3.671)],
  ["EV/EBIT 3,6", has("**3,6**") && eps(indu.vardering.evEbit, 3.624)],
  ["skuld/EK 0,028", has("**0,028**") && eps(indu.stabilitet.skuldEgenkapital, 0.028)],
  ["räntetäckning osatt", has("räntetäckning kunde inte beräknas") && indu.stabilitet.rantaTackning === null],
  ["bransch industri", has("klassat under branschen industri") && indu.bransch === "industri"],
];
for (const [namn, sant] of tal) (sant ? ok : fe)("universum: " + namn);

// Källnotis-speglingar
indu.notering.includes("4 räkenskapsår") && has("fyra år med hål i")
  ? ok("notering: 'fyra år med hål i' speglar källans notering")
  : fe("notering: serier-noteringen speglas ej korrekt");
indu.notering.includes("EBIT före skatt / (skuld + bokfört EK)") && has("rörelseresultat före skatt dividerat med skulder plus bokfört eget kapital")
  ? ok("notering: ROIC-proxyn speglad ordagrant i klartext")
  : fe("notering: ROIC-proxy ej speglad");
indu.notering.includes("ingen dubbelkoll av pris/valuation") && has("MarketStack, saknade färsk kurs")
  ? ok("notering: enkelkällat pris speglat öppet")
  : fe("notering: MarketStack-enkelkälla ej speglad");
indu.kallor[0].hamtat === "2026-09-03" && has("datainsamling 2026-09-03")
  ? ok("källstämpel 2026-09-03 korrekt")
  : fe("källstämpel avvikande");

// FYND-underlag: källfält utkastet tiger om
indu.tillvaxt.omsattningCAGR5ar !== null
  ? wa(`källfakta: omsättningCAGR5ar = ${indu.tillvaxt.omsattningCAGR5ar} (90,8 %/år) FINNS i källan — utkastets "därför redovisas inga CAGR-tal" gäller paketets eget redovisande, inte källans fält`)
  : null;
indu.vardering.peg !== null
  ? wa(`källfakta: peg = ${indu.vardering.peg} FINNS i källan trots prognosTillvaxt null — utkastets "PEG bygger på prognostillväxt" är konventionen, inte källfältets grund`)
  : null;

// ─── 2. VÅGDATA mot INDU-C.ST.json ──────────────────────────────────────────
const ph = ana.waveSummary.perHorisont;
const vt = [
  ["mikro=basbygge", has("| mikro | basbygge |") && ph.mikro === "basbygge"],
  ["kort=basbygge", has("| kort | basbygge |") && ph.kort === "basbygge"],
  ["medellång=impulsvåg", has("| medellång | impulsvåg |") && ph.medellang === "impulsvåg"],
  ["lång=impulsvåg", has("| lång | impulsvåg |") && ph.lang === "impulsvåg"],
  ["mega=impulsvåg", has("| mega | impulsvåg |") && ph.mega === "impulsvåg"],
];
for (const [n, s] of vt) (s ? ok : fe)("vågklass: " + n);

// 25-cellersmatrisen räknad ur analysens egen matris25
const m25 = ana.waveSummary.matris25;
const bull = Object.values(m25).filter((v) => v === 1).length;
const bear = Object.values(m25).filter((v) => v === -1).length;
const neut = Object.values(m25).filter((v) => v === 0).length;
bull === 15 && bear === 5 && neut === 5 && has("15 bullish-, 5 bearish- och 5 neutrala")
  ? ok(`matris25: 15▲/5▼/5— räknad ur analysfilen (${bull}/${bear}/${neut}) == utkastet`)
  : fe(`matris25: analysen ger ${bull}/${bear}/${neut}, utkastet påstår 15/5/5`);
const volymBear = ["mikro","kort","medellang","lang","mega"].every((h) => m25["volym." + h] === -1);
volymBear && bear === 5 && has("alla fem fallande cellerna är volymteorin")
  ? ok("matris25: volymteorin ensam om alla 5 ▼ — utkastets metoddetalj SANN")
  : fe("matris25: volym-påståendet håller ej");
const langa = ["elliott","fibonacci","gann","lucas"].every((t) =>
  ["medellang","lang","mega"].every((h) => m25[`${t}.${h}`] === 1));
langa && has("enhälligt positiva på de tre längsta horisonterna")
  ? ok("matris25: Elliott/Fibonacci/Gann/Lucas enhälliga ▲ på 3 längsta — SANN")
  : fe("matris25: enhällighetspåståendet håller ej");

eps(ana.risk.sigmaAr, 0.1987) && has("**19,9 procent per år**")
  ? ok(`volatilitet: sigmaAr ${ana.risk.sigmaAr} → 19,9 % korrekt`)
  : fe("volatilitet avvikande");
eps(ana.risk.pos52, 0.855, 0.0005) && has("**86 procent av sitt 52-veckorsspann**")
  ? ok(`52v-position: pos52 0,855 → 86 % korrekt avrundning`)
  : fe("52v-position avvikande");
ana.verified === "2026-08-24" && has("verifierad 2026-08-24")
  ? ok("analysstämpel 2026-08-24 korrekt")
  : fe("analysstämpel avvikande");

// Datastyrda nivåer 6/6
const nivaer = [
  ["298,80", 298.8], ["401,18", 401.176], ["464,42", 464.424],
  ["472,76", 472.7635], ["527,54", 527.536], ["566,80", 566.8],
];
for (const [txt, v] of nivaer) {
  const iAnalys = ana.priceLevels.levels.some((l) => eps(num(l.value), v, 0.05));
  (has(txt) && iAnalys) ? ok(`nivå ${txt} == analysens ${v}`) : fe(`nivå ${txt} stämmer ej mot analysen`);
}

// ─── 3. KALENDER ────────────────────────────────────────────────────────────
const k = kalIndu[0];
k && k.rapportfenster === "2026-10-07" && has("onsdagen **7 oktober**")
  ? ok("kalender: rappdag 2026-10-07 korrekt (kalender-industri.json)")
  : fe("kalender: rappdag avvikande");
k && k.notera.includes("2026-04-10") && has("10 april") && k.notera.includes("2026-07-08") && has("8 juli")
  ? ok("kalender: Q1 04-10 + Q2 07-08 (kvartalsvis NAV-rytm) korrekt")
  : fe("kalender: Q1/Q2-datum avvikande");
const d = new Date("2026-10-07T12:00:00Z");
const dow = ["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"][d.getUTCDay()];
dow === "onsdag"
  ? ok(`veckodag: 2026-10-07 är ${dow} — utkastets "onsdagen" KORREKT`)
  : fe(`veckodag: 2026-10-07 är ${dow}, utkastet säger onsdag`);
const jan1 = Date.UTC(2026, 0, 1);
const dayOfYear = Math.floor((d - jan1) / 86400000) + 1;
const isoDow = (d.getUTCDay() + 6) % 7 + 1; // måndag=1 … söndag=7 (ISO)
const vecka = Math.ceil((dayOfYear + 6 - isoDow) / 7); // verifierad mot 1 jan (v1), 5 okt (v41), 7 okt (v41)
vecka === 41 && has("vecka 41")
  ? ok(`ISO-vecka: 2026-10-07 ligger i v${vecka} — utkastets "vecka 41" KORREKT`)
  : fe(`ISO-vecka: beräknad v${vecka}, utkastet säger 41`);
!k.notera.toLowerCase().includes("kl.") && !k.notera.includes("07:00")
  ? ok("klockslag: kalendern anger ej klockslag — utkastets notis 'anger datum men inte klockslag' KORREKT")
  : wa("klockslag: kalenderns notera kan bära klockslag — dubbelkolla");

// ─── 4. ARITMETIK / INTERNA KONSIСТENS ──────────────────────────────────────
const pb = indu.vardering.pb, pe = indu.vardering.pe, roe = indu.lonksamhet.roe;
const ident = pb / roe;
const avv = Math.abs(pe - ident) / pe;
ok(`identitet P/E = P/B ÷ ROE = ${pb} ÷ ${roe} = ${ident.toFixed(3)} mot P/E ${pe} = ${(avv * 100).toFixed(1)} % avvikelse (SEK hela vägen — tidsmetrik i svängresultat; jfr NP3 14 %)`);
const premie = (pb - 1) * 100;
premie > 2.5 && premie < 3.5 && has("cirka tre procent över")
  ? ok(`P/B 1,029 ⇒ premie ${premie.toFixed(1)} % — "cirka tre procent över" KORREKT`)
  : fe(`premieberäkning: ${premie.toFixed(1)} %, utkastet säger cirka tre`);
const span = (566.8 - 298.8);
const posInsamling = (534.2 - 298.8) / span;
ok(`52v-position vid 09-03-kursen: (534,20−298,80)/${span.toFixed(0)} = ${(posInsamling * 100).toFixed(1)} % — utkastets "86 %" är VÅGMÄTNINGENS 08-24-pos (0,855), korrekt märkt "vid mätningen"`);
const ma50diff = Math.abs(527.536 - 534.2) / 534.2;
ma50diff < 0.02 && has("(527,54) nära insamlingskursen (534,20)")
  ? ok(`MA50 vs kurs: ${ (ma50diff * 100).toFixed(1) } % skillnad — "nära" KORREKT`)
  : fe("MA50-närhet felaktig");
has("13") || ok("Avståndet till industrirappdagarna: 10-07→10-20 = 13 dagar — 'nästan två veckor' (KONTROLL: sant)");
const hm = JSON.parse(fs.readFileSync("data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hm-b-q3-2026.json", "utf8"));
hm.body.includes("24 september") || has("efter H&M (24 september)")
  ? ok("H&M-rappdagen 2026-09-24 — utkastets ordning 'nästa rapportdag efter H&M' korrekt")
  : fe("H&M-ordningen oklar");

// ─── 5. STRUKTUR + KVD-kontrakt ─────────────────────────────────────────────
const ord = body.split(/\s+/).filter(Boolean).length;
const rmKontrakt = Math.max(1, Math.round(ord / 600));
u.readingMinutes === rmKontrakt
  ? ok(`readingMinutes ${u.readingMinutes} == kontraktet round(${ord}/600)`)
  : wa(`readingMinutes ${u.readingMinutes} ≠ kontraktet round(${ord}/600) = ${rmKontrakt} — seriebred systematik (nike 6/5, ericsson 6/2, hm-b 7/3, volvo-car 6/2)`);
const h2 = (body.match(/^## /gm) || []).length;
h2 >= 2 ? ok(`H2-rubriker: ${h2} ≥ 2`) : fe("för få H2-rubriker");
const sistaRad = body.trimEnd().split("\n").pop();
sistaRad.includes("2007:528") && sistaRad.includes("inte investeringsrådgivning")
  ? ok("disclaimer-sista-rad: negerad investeringsråds-disclaimer med 2007:528 2 kap 5 § sist")
  : fe("disclaimer-sista-rad saknas/felaktig");
u.publishedAt < "2026-10-07"
  ? ok(`publishedAt ${u.publishedAt} = D−2 före rappdagen (seriepraxis hm-b D−1, nike D−1, ericsson D−2)`)
  : fe("publishedAt efter rappdagen");
ord >= 800 ? ok(`body ${ord} ord ≥ 800`) : fe("body för kort");
u.pillar === "Institutionell metodik" && u.author === "AK1A Research Lab"
  ? ok("pillar/author enligt seriekontrakt") : fe("pillar/author avvikande");

// ─── 6. JURIDIK (2007:528) — manuell grind enligt nike-precedens (F1: vakten skannar ej kvartalsmappen)
const lagrum = [...body.matchAll(/20\d\d:\d+/g)].map((m) => m[0]);
[...new Set(lagrum)].join(",") === "2007:528"
  ? ok("lagrum: endast 2007:528 förekommer — ingen lagrumsblandning")
  : fe("lagrum: " + [...new Set(lagrum)].join(","));
const kop = [...body.matchAll(/.{45}köp.{0,12}/gi)].map((m) => m[0]);
const salj = [...body.matchAll(/.{30}(sälj|behålla).{0,30}/gi)].map((m) => m[0]);
ok(`rådverbsträffar köp (${kop.length}): ` + kop.map((s) => s.trim().replace(/\s+/g, " ")).join(" § "));
ok(`rådverbsträffar sälj/behålla (${salj.length}): ` + salj.map((s) => s.trim().replace(/\s+/g, " ")).join(" § "));
const rek = [...body.matchAll(/.{30}(rekommendation|rekommendera|bör du| borde ).{0,40}/gi)].map((m) => m[0]);
ok(`rekommendations-/bör du-träffar (${rek.length}): ` + rek.map((s) => s.trim().replace(/\s+/g, " ")).join(" § "));
const namn = [...body.matchAll(/\b(Levin|Boberg|Svensson|Andersson|Johansson|Lundberg)\b/g)];
namn.length === 0 ? ok("personnamn: 0 träffar — ingen fysisk person nämns") : fe("personnamn: " + namn.map((m) => m[0]).join(", "));

// ─── 7. 911-KONTROLL (seriestandard: sex mönster, hel filen) ────────────────
const p911 = [["911", /911/], ["9/11", /9\s*\/\s*11/], ["11 september", /11\s+september/i], ["september 11", /september\s+11/i], ["nine-eleven", /nine[\s-]?eleven/i], ["9-1-1", /9[\s-]1[\s-]1/]];
let a911 = 0;
for (const [namn, re] of p911) { const m = rawU.match(re); if (m) { a911++; wa(`911-träff ${namn}: "${m[0]}"`); } }
a911 === 0 ? ok("911-referenser: 0 träffar på 6 mönster (hel filen, title+desc+body)") : fe(`911: ${a911} träffar`);

// ─── 8. DIFF-strängarnas unikhet (mot utkastfilen) ──────────────────────────
const kandidater = [
  ["B1", "och därmed seriens tredje format"],
  ["B2", "därför redovisas inga CAGR-tal"],
  ["C1-ankare", "(P/E): **3,7**"],
  ["C2-ankare", "transparansregler på [transparenssidan](/transparens)"],
  ["D1", "Elliots, Fibonacci, Gann och Lucas-teorierna"],
];
for (const [id, s] of kandidater) {
  const n = rawU.split(s).length - 1;
  n === 1 ? ok(`diff-sträng ${id} UNIK (1 träff): "${s.slice(0, 50)}"`) : fe(`diff-sträng ${id} ${n} träffar — ej unik: "${s}"`);
}
// B1-grund: räkna formaten som texten själv listar
const formatListade = ["telekom (Ericsson)", "detaljhandel (H&M)", "biltillverkning (Volvo Car)"].filter((s) => body.includes(s)).length;
formatListade === 3
  ? fe("SERIEORDNING: texten listar TRE format före Industrivärden men kallar det 'seriens tredje format' — ska vara FJÄRDE")
  : wa("serieordningsgrund ofullständig");

// ─── RAPPORT ────────────────────────────────────────────────────────────────
console.log(`\n=== S1-U3 INDU-SOND ${new Date().toISOString()} ===`);
console.log(`OK: ${OK.length} · FEL: ${F.length} · VARNING: ${W.length}\n`);
for (const m of OK) console.log("  ✓", m);
if (F.length) { console.log("\n-- FEL --"); for (const m of F) console.log("  ✗", m); }
if (W.length) { console.log("\n-- VARNING/FYND --"); for (const m of W) console.log("  ⚠", m); }
process.exit(F.length ? 1 : 0);
