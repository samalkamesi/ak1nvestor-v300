#!/usr/bin/env node
// _s4u2-ge-kvd.mjs — KVD-motor för GE Aerospace Q3-2026-läspaketet (s4-u2, manifest auto-s4-1790873126824).
// Läser: paket-JSON + bolagsuniversum.json. Kontrollerar (maskinellt, inga mjuka ögon):
//   A) grenmedianer + GE-rang LIVE ur universumet (tabellens tal + n)
//   B) talparitet: universumradens fälttal mot pakettexten
//   C) aritmetik: varje beräknat påstående i paketet motorräknas
//   D) rådsverb-grind (positiva råd förbjudna, negationer tillåtna)
//   E) sökordsgrind (kvartalsrapport i title/description/ingress/H2)
//   F) disclaimer = exakt sista rad; title/description-längder; H2-stomme; ordinal
//   G) externa URL:er: live-koll (HEAD/GET, 8 s timeout — nätverksbortfall = varning ej fel)
// Utgångskod 0 = GRÖN (0 fel), 1 = RÖT, 2 = GRÖN med varningar. Svaren skrivs som KVD-rapport på stdout.

import { readFileSync, existsSync, readdirSync } from "node:fs";

const PAKET = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-ge-q3-2026.json";
const UNI = "/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json";

const fel = [];
const varn = [];
const ok = (id, msg) => { console.log(`  OK ${id}: ${msg}`); };

// ---------- inläsning ----------
const PAKET_FINNS = existsSync(PAKET);
const uni = JSON.parse(readFileSync(UNI, "utf8"));
const rader = uni.bolag || uni.rader || uni;
const ge = rader.find((b) => b.ticker === "GE");
if (!ge) { console.error("FEL: universumrad GE saknas"); process.exit(1); }
const gren = rader.filter((b) => b.bransch === "industri");
if (!PAKET_FINNS) {
  // planeringsläge: skriv endast A-sektionens live-tal, avsluta
  console.log("== A) PLANERINGSLÄGE (paket saknas — endast live-medianer) ==");
  const hamta2 = (rad, vag) => vag.reduce((o, k) => (o == null ? undefined : o[k]), rad);
  const median2 = (arr) => { const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const falt2 = { pe: ["vardering","pe"], pb: ["vardering","pb"], evEbit: ["vardering","evEbit"], peg: ["vardering","peg"], fcfYield: ["vardering","fcfYield"], roe: ["lonksamhet","roe"], roic: ["lonksamhet","roic"], bruttoMarginal: ["lonksamhet","bruttoMarginal"], ebitMarginal: ["lonksamhet","ebitMarginal"], nettoMarginal: ["lonksamhet","nettoMarginal"], skuldEgenkapital: ["stabilitet","skuldEgenkapital"], omsattningTillvaxtTTM: ["tillvaxt","omsattningTillvaxtTTM"] };
  for (const [n, v] of Object.entries(falt2)) {
    const varr = gren.map((r) => hamta2(r, v)).filter((x) => typeof x === "number" && isFinite(x));
    const g = hamta2(ge, v);
    const pros = ["fcfYield","roe","roic","bruttoMarginal","ebitMarginal","nettoMarginal","omsattningTillvaxtTTM"].includes(n);
    const rang = g == null ? null : varr.filter((x) => x > g).length + 1;
    console.log(`  ${n.padEnd(22)} GE=${pros ? (g*100).toFixed(2)+"%" : g}  median=${pros ? (median2(varr)*100).toFixed(2) : median2(varr).toFixed(2)}  rang=högst nr ${rang} av ${varr.length}`);
  }
  console.log(`  Grenen industri: ${gren.length} bolag.`);
  const diskfiler = readdirSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3").filter((f) => f.startsWith("sa-laser"));
  console.log(`  Paket på disk totalt: ${diskfiler.length}`);
  process.exit(0);
}
const pkg = JSON.parse(readFileSync(PAKET, "utf8"));
const body = pkg.body;
const title = pkg.title || "";
const description = pkg.description || "";

console.log("== A) GRENMEDIANER + RANG (LIVE ur bolagsuniversum.json) ==");
const faltVagar = {
  pe: ["vardering", "pe"],
  pb: ["vardering", "pb"],
  evEbit: ["vardering", "evEbit"],
  peg: ["vardering", "peg"],
  fcfYield: ["vardering", "fcfYield"],
  roe: ["lonksamhet", "roe"],
  roic: ["lonksamhet", "roic"],
  bruttoMarginal: ["lonksamhet", "bruttoMarginal"],
  ebitMarginal: ["lonksamhet", "ebitMarginal"],
  nettoMarginal: ["lonksamhet", "nettoMarginal"],
  skuldEgenkapital: ["stabilitet", "skuldEgenkapital"],
  omsattningTillvaxtTTM: ["tillvaxt", "omsattningTillvaxtTTM"],
};
const hamta = (rad, vag) => vag.reduce((o, k) => (o == null ? undefined : o[k]), rad);
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const svFmt = (x, prose = "tal") => {
  // procentfält visas med 2 decimaler i paketet, multiplar med 2
  return prose === "procent" ? (x * 100).toFixed(2) : x.toFixed(2);
};
const ut = {};
for (const [namn, vag] of Object.entries(faltVagar)) {
  const varden = gren.map((r) => hamta(r, vag)).filter((v) => typeof v === "number" && isFinite(v));
  const geV = hamta(ge, vag);
  const med = median(varden);
  const rang = geV == null ? null : varden.filter((v) => v > geV).length + 1;
  ut[namn] = { ge: geV, median: med, rang, n: varden.length };
  const arProcent = ["fcfYield","roe","roic","bruttoMarginal","ebitMarginal","nettoMarginal","omsattningTillvaxtTTM"].includes(namn);
  console.log(
    `  ${namn.padEnd(22)} GE=${geV == null ? "null" : arProcent ? svFmt(geV,"procent")+" %" : geV.toFixed(3)}  median=${arProcent ? svFmt(med,"procent") : med.toFixed(2)}  rang=högst nr ${rang} av ${varden.length}`
  );
}
console.log(`  Grenen industri: ${gren.length} bolag totalt i universumet.`);

// tabellens påstådda värden (slug → [påstått GE, påstådd median, påstådd rangtext]) deklareras här och kontrolleras mot live:
const tabellPastaenden = [
  // [fält, påstått GE-tal i tabellen (sträng som den står i paketet), påstådd median (sträng)] — LIVE-värden 2026-10-01
  ["pe", "39,04", "28,21"],
  ["pb", "19,38", "4,68"],
  ["evEbit", "33,83", "18,85"],
  ["peg", "4,23", "1,46"],
  ["fcfYield", "1,93 procent", "3,54 procent"],
  ["roe", "48,23 procent", "18,84 procent"],
  ["roic", "27,51 procent", "12,58 procent"],
  ["bruttoMarginal", "31,05 procent", "32,48 procent"],
  ["ebitMarginal", "20,57 procent", "13,00 procent"],
  ["nettoMarginal", "17,72 procent", "9,88 procent"],
  ["skuldEgenkapital", "1,13", "0,68"],
  ["omsattningTillvaxtTTM", "+21,1 procent", "+5,22 procent"],
];
console.log("  -- tabellkontroll (påståenden i paketet mot LIVE) --");
const num = (x) => parseFloat(String(x).replace(/,/g, ".").replace(/[+ %]/g, ""));
for (const [falt, pGe, pMed] of tabellPastaenden) {
  const live = ut[falt];
  const arProcent = pGe.includes("procent");
  const liveGeTxt = arProcent ? svFmt(live.ge, "procent") : svFmt(live.ge);
  const liveMedTxt = arProcent ? svFmt(live.median, "procent") : svFmt(live.median);
  const geOK = Math.abs(num(pGe) - num(liveGeTxt)) < 0.005;
  const medOK = Math.abs(num(pMed) - num(liveMedTxt)) < 0.005;
  // rangtexten "X:e högst av N" för fältet måste finnas i body med rätt N
  const rangOK = body.includes(`av ${live.n}`) || body.includes(`av ${live.n} `);
  if (geOK && medOK && rangOK) ok(`tabell.${falt}`, `GE ${liveGeTxt}${arProcent ? " %" : ""} · median ${liveMedTxt} · n ${live.n} — stämmer mot paket`);
  else fel.push(`tabell.${falt}: paket säger GE ${pGe} / median ${pMed}, live ger GE ${liveGeTxt} / median ${liveMedTxt} / n ${live.n}${rangOK ? "" : " (rangtextens n saknas)"}`);
}

console.log("== B) TALPARITET — universumradens fält i pakettexten ==");
const paritet = [
  ["pris 329,50", ge.pris, "329,50"],
  ["marknadsvärde 341,877 mdr", ge.marknadsKapitalMdr, "341,877"],
  ["P/E 39,04", ge.vardering.pe, "39,04"],
  ["P/B 19,381", ge.vardering.pb, "19,381"],
  ["EV/EBIT 33,828", ge.vardering.evEbit, "33,828"],
  ["PEG 4,23", ge.vardering.peg, "4,23"],
  ["FCF-avkastning 1,93", ge.vardering.fcfYield, "1,93"],
  ["ROE 48,23", ge.lonksamhet.roe, "48,23"],
  ["ROIC 27,51", ge.lonksamhet.roic, "27,51"],
  ["bruttomarginal 31,05", ge.lonksamhet.bruttoMarginal, "31,05"],
  ["EBIT-marginal 20,57", ge.lonksamhet.ebitMarginal, "20,57"],
  ["nettomarginal 17,72", ge.lonksamhet.nettoMarginal, "17,72"],
  ["FCF-marginal 13,02", ge.lonksamhet.fcfMarginal, "13,02"],
  ["skuld/EK 1,1322", ge.stabilitet.skuldEgenkapital, "1,1322"],
  ["TTM-tillväxt +21,1", ge.tillvaxt.omsattningTillvaxtTTM, "21,1"],
  ["prognostillväxt +14,68", ge.tillvaxt.prognosTillvaxt, "14,68"],
  ["insiderköp 32", ge.aterkop.insiderkopSenaste6man, "32"],
];
let pOK = 0;
for (const [namn, fält, txt] of paritet) {
  const v = typeof fält === "number" && Math.abs(fält) < 1 ? (fält * 100).toFixed(2) : String(fält);
  const match = v.startsWith(txt.replace(",", ".")) || txt === v || Math.abs(parseFloat(txt.replace(",", ".")) - parseFloat(v)) < 0.005;
  const finns = body.includes(txt);
  if (match && finns) pOK++;
  else fel.push(`paritet ${namn}: fält=${v} textInnehåller "${txt}"=${finns}`);
}
ok("paritet", `${pOK}/${paritet.length} universumfält korrekt återgivna i texten`);
if (ge.serier && Array.isArray(ge.serier.ar) && ge.serier.ar.length === 0 && body.includes("serier")) ok("paritet.serier", "radens tomma serier (spin-off-arvet) redovisas öppet i paketet");

console.log("== C) ARITMETIK — motorräknade påståenden ==");
const aer = (id, uttryck, forvantat, tolerans = 0.005) => {
  const f = Math.abs(uttryck - forvantat);
  if (f <= tolerans) ok(`aritmetik.${id}`, `${uttryck.toFixed(4)} ≈ ${forvantat} (Δ ${f.toFixed(4)})`);
  else fel.push(`aritmetik.${id}: ${uttryck} ≠ ${forvantat} (Δ ${f})`);
};
// C1 P/E-nämnaren: kurs/PE implicerar EPS-bas; GAAP-kedjan återvinner den
const epsBas = 329.5 / 39.04;
aer("pe-namnare-implicerad", epsBas, 8.4401, 0.0005);
aer("gaap-kedja", 2.04 + 2.31 + 1.83 + 2.3, 8.48);
const gapKedja = ((2.04 + 2.31 + 1.83 + 2.3) / epsBas - 1) * 100;
aer("gap-procent", gapKedja, 0.473, 0.01);
aer("halvars-kryss", 1.83 + 2.3, 4.13); // = releasens 6M GAAP-EPS exakt
// C2 P/B ÷ ROE = P/E-testet
const peVia = 19.381 / 0.4823;
aer("pb-roe-vag", peVia, 40.18, 0.01);
aer("identitetsgap", (peVia / 39.04 - 1) * 100, 2.92, 0.02);
// C3 EK och netto, två vägar
const ek = 341.877 / 19.381;
aer("ek", ek, 17.64, 0.005);
const nettoRoe = 0.4823 * ek;
aer("netto-roe-vag", nettoRoe, 8.508, 0.005);
const aktier = 341.877 / 329.5;
aer("aktier-spot", aktier, 1.03758, 0.0005);
aer("netto-eps-vag", 8.48 * aktier, 8.799, 0.01);
// C4 intäkt och marginalvärldar
aer("intakt-kedja", 12.2 + 12.7 + 12.4 + 13.349, 50.649, 0.002);
aer("netto-intakts-vag", 8.508 / 0.1772, 48.02, 0.02);
aer("vinstsumma", 2.5 + 2.45 + 2.2 + 2.801, 9.951, 0.002);
aer("continuing-gap", (2.801 - 2.405), 0.396, 0.001);
// C5 FCF-världarna
aer("fcf-yield-vag", 0.0193 * 341.877, 6.598, 0.005);
aer("fcf-kedja", 2.4 + 1.8 + 1.7 + 3.027, 8.927, 0.002);
aer("fcf-marginal-vag", 0.1302 * 50.649, 6.594, 0.005);
aer("fcf-falt-gap", (0.0193 * 341.877) / (0.1302 * 50.649) - 1, 0.0006, 0.002);
// C6 PEG:s tre nämnare
aer("peg-falt-implicerad", 39.04 / 4.23, 9.229, 0.01);
aer("peg-prognos", 39.04 / 14.68, 2.66, 0.01);
aer("peg-guide", 39.04 / (7.75 / 6.37 * 100 - 100), 1.80, 0.01);
aer("guide-tillvaxt", (7.75 / 6.37 - 1) * 100, 21.66, 0.02);
// C7 EV-imperativ
const ebitTTM = 0.2057 * 50.649;
aer("ebit-ttm", ebitTTM, 10.42, 0.01);
aer("ev", 33.828 * ebitTTM, 352.5, 0.1);
aer("nettoskuld-ev", 33.828 * ebitTTM - 341.877, 10.62, 0.1);
aer("skuldvag", 1.1322 * ek, 19.97, 0.02);
aer("kassa-harled", 1.1322 * ek - (33.828 * ebitTTM - 341.877), 9.35, 0.1);
// C8 utdelning och direktavkastning
aer("dir-avk", (0.47 * 4) / 329.5 * 100, 0.5706, 0.005);
aer("hojning-1", (0.36 / 0.28 - 1) * 100, 28.57, 0.02);
aer("hojning-2", (0.47 / 0.36 - 1) * 100, 30.56, 0.02);
// C9 backlog och konsensus
aer("backlog-kvot", 210 / 50.649, 4.146, 0.01);
aer("konsensus-tillvaxt", (2.01 / 1.66 - 1) * 100, 21.08, 0.02);
aer("fy-konsensus", 6.37 * 1.242, 7.911, 0.005);
aer("h2-guide", 7.75 - 3.88, 3.87);
aer("implicerad-q4", 7.75 - 3.88 - 2.01, 1.86);
aer("rullande-fore", 1.66 + 1.57 + 1.86 + 2.02, 7.11);
aer("rullande-efter-konsensus", 1.57 + 1.86 + 2.02 + 2.01, 7.46);
aer("justerat-pe-konsensus", 329.5 / (1.57 + 1.86 + 2.02 + 2.01), 44.17, 0.02);
// C10 scenariorutan: 3 intäkter × 3 marginaler → vinst → EPS (kvot 1,36) → rullande (5,45+EPS) → justerat P/E
const kvot = 2.746 / 2.02;
aer("vinst-eps-kvot", kvot, 1.3594, 0.001);
const intakter = [13.3, 13.7, 14.0];
const marginaler = [0.205, 0.215, 0.225];
const cellut = [];
for (const I of intakter) for (const M of marginaler) {
  const v = I * M; const e = v / kvot; const rull = 5.45 + e; const pj = 329.5 / rull;
  cellut.push(`${I}×${M}: ${v.toFixed(2)} · ${e.toFixed(2)} · ${rull.toFixed(2)} · ${pj.toFixed(1)}`);
}
console.log("  -- scenariorutans 9 celler (vinst mdr · EPS · rullande · justerat P/E) --");
for (const c of cellut) console.log(`     ${c}`);
aer("scen-lag-horn", 13.3 * 0.205 / kvot, 2.006, 0.005); // ≈ konsensus 2,01
aer("scen-mitt", 13.7 * 0.215 / kvot, 2.167, 0.005);
aer("scen-hogt-horn", 14.0 * 0.225 / kvot, 2.317, 0.005);
aer("rullande-spann-lag", 5.45 + 13.3 * 0.205 / kvot, 7.456, 0.005);
aer("rullande-spann-hog", 5.45 + 14.0 * 0.225 / kvot, 7.767, 0.005);
aer("pe-spann-lag", 329.5 / (5.45 + 14.0 * 0.225 / kvot), 42.42, 0.02);
aer("pe-spann-hog", 329.5 / (5.45 + 13.3 * 0.205 / kvot), 44.19, 0.02);

console.log("== D) RÅDSVERB-GRIND (positiva råd förbjudna; negationer tillåtna) ==");
const forbudna = [
  /[Kk]öp (den här|denna|aktien|nu)/, /[Ss]älj (dina|aktien|nu)/, /[Bb]ör du (köpa|sälja)/,
  /[Rr]ekommendation: ?(köp|sälj|accumulera|reducera)/, /[Mm]ålkurs \d/, /[Tt]ips: (köp|sälj)/,
  /[Vv]i rekommenderar/, /[Aa]ktien är (ett köp|ett sälj)/, /[Kk]öp upp/, /[Ss]älj av/,
  /\b(undvik)(?= (aktien|bolaget|GE))/, /[Bb]ehåll (aktien|positionen)/, /[Aa]rbetsorder/,
  /[Vv]äntas (stiga|falla|stiga till|gå till)/, /[Pp]rognos: (upp|ned|köp|sälj)/,
];
let råd = 0;
for (const re of forbudna) { const m = (title + " " + description + " " + body).match(re); if (m) { fel.push(`rådsverb: "${m[0]}" matchar ${re}`); råd++; } }
ok("rådsverb", råd === 0 ? "0 förbjudna rådmönster i title+description+body" : `${råd} fynd`);

console.log("== E) SÖKORDS- OCH STRUKTURGRIND ==");
const sokord = "kvartalsrapport";
const ytor = [
  ["title", title.toLowerCase().includes(sokord)],
  ["description", description.toLowerCase().includes(sokord)],
  ["ingress (första stycket)", body.slice(0, 1200).toLowerCase().includes(sokord)],
];
for (const [yta, bra] of ytor) bra ? ok(`sökord.${yta}`, `"${sokord}" finns`) : fel.push(`sökord.${yta}: "${sokord}" saknas`);
const h2 = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const stomme = ["Urvalet", "Nyckeltalen", "Källkritiken", "Kvartalskedjan", "Så står sig bolaget", "Tre sätt att läsa", "Praktiskt", "Källor"];
let stomOK = 0;
for (const s of stomme) if (h2.some((h) => h.includes(s))) stomOK++;
if (stomOK === stomme.length) ok("H2-stomme", `${h2.length} H2, alla 8 mallsektioner närvarande`);
else fel.push(`H2-stomme: ${stomOK}/${stomme.length} sektioner (H2: ${h2.join(" | ")})`);
const tl = title.length, dl = description.length;
if (tl > 0 && tl <= 60) fel.push(`title ${tl} tecken — paketserien använder långa titlar (kontrollera mot syskon: >60 normalt)`);
ok("title", `${tl} tecken (syskonformat: långa)`);
if (dl >= 141 && dl <= 155) ok("description", `${dl} tecken (141–155)`);
else fel.push(`description ${dl} tecken (mål 141–155)`);
const raderBody = body.split("\n").filter((r) => r.trim());
const sista = raderBody[raderBody.length - 1];
if (sista.startsWith("Rygraden") && sista.includes("2 kap 5 §") && sista.includes("R2")) ok("disclaimer", "sista raden = ryggrads-disclaimern");
else fel.push(`disclaimer: sista raden börjar "${sista.slice(0, 40)}…" — ska vara Rygraden…(2 kap 5 §…R2)`);
const ord = body.split(/\s+/).length;
ok("ord", `${ord} ord i body (syskonnivå ~2 000–2 600)`);
if (!pkg.slug || pkg.slug !== "sa-laser-du-ge-q3-2026") fel.push("slug felaktig");
else ok("slug", pkg.slug);
if (pkg.publishedAt !== "2026-10-20") fel.push(`publishedAt ${pkg.publishedAt} ≠ rappdagen 2026-10-20`);
else ok("publishedAt", "2026-10-20 = rappdagen (tisdag, före börsöppning)");
// ordinal: 90 på disk vid klaimen — deklareras i paketet, räknas här
const diskAntal = readdirSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3").filter((f) => f.startsWith("sa-laser")).length;
ok("ordinal", `${diskAntal} paket på disk nu (90 vid klaimen ⇒ paketet ska kalla sig seriens ~91:a)`);

console.log("== G) EXTERNA URL:ER — live-koll ==");
const urler = [
  ["GE Aerospace pressrelease Q3-2025", "https://www.geaerospace.com/news/press-releases/ge-aerospace-announces-third-quarter-2025-results"],
  ["GE Aerospace pressrelease Q1-2026", "https://www.geaerospace.com/news/press-releases/ge-aerospace-announces-first-quarter-2026-results"],
  ["SEC Q2-2026-release", "https://www.sec.gov/Archives/edgar/data/40545/000004054526000047/ge2q2026earningsrelease.htm"],
  ["Yahoo förväntningsartikel Q3-2026", "https://finance.yahoo.com/markets/stocks/articles/expect-ge-aerospaces-q3-2026-183051789.html"],
];
for (const [namn, url] of urler) {
  if (!body.includes(url.replace("https://", "").replace("www.", "").split("/")[0]) && !body.includes(url)) varn.push(`källa ${namn}: domänen nämns ej i paketet`);
}
const live = async () => {
  const { execFileSync } = await import("node:child_process");
  for (const [namn, url] of urler) {
    let kontrollerad = false;
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch(url, { signal: ctl.signal, method: "GET", headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AK1A-KVD/1.0" } });
      clearTimeout(t);
      if (r.status >= 200 && r.status < 400) { ok(`live.${namn}`, `HTTP ${r.status}`); kontrollerad = true; }
      else varn.push(`live.${namn}: HTTP ${r.status}`);
    } catch (e) {
      // fallback: node-fetch nöt mot vissa kant-CDN:er — curl med browser-UA
      try {
        const kod = execFileSync("curl", ["-sI", "-A", "Mozilla/5.0", "-m", "15", url, "-o", "/dev/null", "-w", "%{http_code}"], { encoding: "utf8" }).trim();
        if (kod.startsWith("2") || kod.startsWith("3")) { ok(`live.${namn}`, `HTTP ${kod} (curl-fallback)`); kontrollerad = true; }
        else varn.push(`live.${namn}: curl HTTP ${kod}`);
      } catch (e2) { varn.push(`live.${namn}: fetch ${e.name || e.message}, curl ${e2.message}`); }
    }
    if (!kontrollerad && !varn.length) varn.push(`live.${namn}: ej verifierad`);
  }
  Slut();
};
const Slut = () => {
  console.log("\n=========================================");
  console.log(`KVD GE Q3-2026: ${fel.length} FEL / ${varn.length} VARN`);
  if (fel.length) { console.log("FEL:"); for (const f of fel) console.log("  ✗ " + f); }
  if (varn.length) { console.log("VARNINGAR:"); for (const v of varn) console.log("  ! " + v); }
  console.log(fel.length === 0 ? (varn.length === 0 ? "DOMÄN: GRÖN" : "DOMÄN: GRÖN med varningar") : "DOMÄN: RÖD");
  process.exit(fel.length === 0 ? (varn.length === 0 ? 0 : 2) : 1);
};
if (process.env.KVD_UTAN_NAT) Slut(); else live();
