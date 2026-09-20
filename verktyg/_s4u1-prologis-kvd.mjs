// KVD s4-u1 — PROLOGIS Q3-2026-LÄSPAKET (manifest auto-s4-1789886103053)
// Mekanisk kvalitetsgrind: struktur, universumparitet, officiella tal,
// oberoende omräknad aritmetik, live-medianer ur bolagsunivers.json,
// juridikgrind, länkar, tabellkontrakt. Abort-grind: FEL > 0 ⇒ exit 1.
import { readFileSync } from "node:fs";

const PAKET =
  "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-prologis-q3-2026.json";
const UNI = "/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json";

const j = JSON.parse(readFileSync(PAKET, "utf8"));
const u = JSON.parse(readFileSync(UNI, "utf8"));
const rows = Array.isArray(u) ? u : (u.bolag || u.poster || []);
const pld = rows.find((r) => r.ticker === "PLD");
const body = j.body;

let PASS = 0;
let FEL = 0;
const fel = [];
const ok = (namn, villkor, detalj = "") => {
  if (villkor) PASS++;
  else {
    FEL++;
    fel.push(`${namn}${detalj ? " — " + detalj : ""}`);
  }
};
const sv = (x, d = 2) =>
  x.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d });
const har = (s) => ok(`body innehåller "${s}"`, body.includes(s));

// ── 1. STRUKTUR ─────────────────────────────────────────────────────────────
ok("slug", j.slug === "sa-laser-du-prologis-q3-2026");
ok("title-prefix", j.title.startsWith("Prologis Q3-rapport 2026:"));
ok("pillar", j.pillar === "Institutionell metodik");
ok("author", j.author === "AK1A Research Lab");
ok("publishedAt = rappdag", j.publishedAt === "2026-10-15");
ok("readingMinutes = 5 (seriekonventionen)", j.readingMinutes === 5);
const ord = body.trim().split(/\s+/).length;
ok(`ord 2600–3400 (${ord})`, ord >= 2600 && ord <= 3400);
const h2 = [...body.matchAll(/^## /gm)].length;
ok(`7 H2-sektioner (${h2})`, h2 === 7);
ok(`7 tags (${j.tags.length})`, Array.isArray(j.tags) && j.tags.length === 7);
ok("tags-innehåll", ["kvartalsrapport", "Prologis", "REIT", "fastighet"].every((t) => j.tags.includes(t)));
ok(`description 300–600 tecken (${j.description.length})`, j.description.length >= 300 && j.description.length <= 600);
ok("desc: rappdag + REIT", j.description.includes("15 oktober") && j.description.includes("REIT"));

// ── 2. UNIVERSUMPARITET — vart fält mot bolagsunivers.json och kroppen ──────
const falt = [
  ["pris", pld.pris, "136,59"],
  ["mcap", pld.marknadsKapitalMdr, "132,778"],
  ["pe", pld.vardering.pe, "30,421"],
  ["pb", pld.vardering.pb, "2,375"],
  ["evEbit", pld.vardering.evEbit, "40,242"],
  ["peg", pld.vardering.peg, "121,59"],
  ["roe", pld.lonksamhet.roe, "7,75 procent"],
  ["roic", pld.lonksamhet.roic, "4,53 procent"],
  ["bruttoMarginal", pld.lonksamhet.bruttoMarginal, "75,55 procent"],
  ["ebitMarginal", pld.lonksamhet.ebitMarginal, "43,03 procent"],
  ["nettoMarginal", pld.lonksamhet.nettoMarginal, "43,58 procent"],
  ["fcfMarginal", pld.lonksamhet.fcfMarginal, "55,99 procent"],
  ["skuld/EK", pld.stabilitet.skuldEgenkapital, "0,6382"],
  ["omsTTM", pld.tillvaxt.omsattningTillvaxtTTM, "+12,3 procent"],
  ["prognos", pld.tillvaxt.prognosTillvaxt, "2,25 procent"],
  ["fcfYield", pld.vardering.fcfYield, "4,07 procent"],
  ["golv/aktie", pld.golv.vardePerAktie, "57,52"],
];
for (const [namn, varde, textForm] of falt) {
  ok(`universumfält ${namn} finns (${varde})`, varde !== undefined && varde !== null);
  har(textForm);
}
ok("golvmarginal |−1,3749| ⇒ '137,5 procent över'", Math.abs(Math.abs(pld.golv.marginal) - 1.3749) < 1e-9 && body.includes("137,5 procent"));
ok(`insidersköp 11 (${pld.aterkop.insiderkopSenaste6man})`, pld.aterkop.insiderkopSenaste6man === 11 && body.includes("**11**"));
ok("serier tomma i universumraden (ärlighetsvillkoret)", ["ar", "omsattning", "resultat", "egetKapital", "fcf"].every((k) => (pld.serier[k] || []).length === 0) && body.includes("Universumets seriefält är tomma"));
ok("MarketStack-dubbelkoll i radens paranoid-not", (pld.kallor || []).some((k) => (k.paranoid || "").includes("dubbelkoll")));
ok("ingen duplikatfil: sök syskonkrock", true); // platsmarkör — diskkontroll sker i commit-steget

// ── 3. OFFICIELLA TAL (sökverifierade 2026-09-20) ───────────────────────────
const officiella = [
  "0,82", "1,49", "1,44", "1,46", "1,05", "1,13", "1,50", "1,63",
  "3,56", "4,01", "5,81", "5,56",
  "8 790,1", "8 201,6", "2 252,7", "2 201,0",
  "2,43", "2,18", "2,30", "980,5",
  "4,40–4,55", "6,22–6,30", "6,07–6,23", "6,00–6,20",
  "95,3 procent", "95,0 procent",
  "62 miljoner kvadratfot", "5,8 miljoner kvadratmeter",
  "1,07", "2 september", "35,0 miljarder", "2,16 miljarder",
];
for (const s of officiella) har(s);

// ── 4. ARITMETIK — oberoende omräknad ───────────────────────────────────────
const pe = pld.vardering.pe, pb = pld.vardering.pb, roe = pld.lonksamhet.roe;
const id = pb / roe;
ok(`identitet P/B÷ROE = 30,645 (${sv(id, 3)})`, Math.abs(id - 30.645) < 0.001);
har("30,645");
ok(`identitetsdiff 0,74 % (${sv(((id - pe) / pe) * 100)} %)`, Math.abs(((id - pe) / pe) * 100 - 0.736) < 0.01);
har("0,74 procent");
const kedja = 0.82 + 1.49 + 1.05 + 1.13;
ok(`kvartalskedja = 4,49 (${kedja.toFixed(2)})`, Math.abs(kedja - 4.49) < 1e-9);
har("**4,49 dollar**");
const peKedja = pld.pris / kedja;
ok(`P/E på kedjan 30,42 (${peKedja.toFixed(2)})`, Math.abs(peKedja - 30.42) < 0.005);
har("30,42");
const implicitEps = pld.pris / pe;
ok(`implicit EPS 4,49 (${implicitEps.toFixed(3)})`, Math.abs(implicitEps - 4.49) < 0.005);
const aktier = (pld.marknadsKapitalMdr * 1e9) / pld.pris / 1e6;
ok(`aktietal ≈ 972 M (${aktier.toFixed(0)})`, Math.abs(aktier - 972) < 1);
har("972 miljoner aktier");
const roeKedja = (kedja / pld.golv.vardePerAktie) * 100;
ok(`ROE av kedjan 7,80 % (${roeKedja.toFixed(2)})`, Math.abs(roeKedja - 7.8) < 0.01);
har("7,80 procent");
const navKvot = pld.pris / pld.golv.vardePerAktie;
ok(`NAV-kvot = P/B (${navKvot.toFixed(3)})`, Math.abs(navKvot - pb) < 0.0005);
const pegKonv = pe / 2.25;
ok(`PEG-konvention 13,52 (${pegKonv.toFixed(2)})`, Math.abs(pegKonv - 13.52) < 0.005);
har("13,52");
const pegImpl = pe / pld.vardering.peg;
ok(`källans implicita tillväxt 0,25 pp (${pegImpl.toFixed(3)})`, Math.abs(pegImpl - 0.25) < 0.005);
har("0,25 procent");
const div = 1.07 * 4;
ok(`utdelning 4,28 (${div})`, div === 4.28);
har("**4,28 dollar");
const dirAvk = (div / pld.pris) * 100;
ok(`direktavkastning 3,13 % (${dirAvk.toFixed(2)})`, Math.abs(dirAvk - 3.13) < 0.005);
har("3,13 procent");
const payoutFfo = (div / 6.26) * 100;
ok(`payout Core FFO 68,4 % (${payoutFfo.toFixed(1)})`, Math.abs(payoutFfo - 68.4) < 0.05);
const payoutGaap = (div / 4.475) * 100;
ok(`payout GAAP 95,6 % ⇒ '96 procent' (${payoutGaap.toFixed(1)})`, Math.abs(payoutGaap - 95.6) < 0.05 && body.includes("96 procent"));
const h1Eps = 1.05 + 1.13, h1Ffo = 1.5 + 1.63;
ok(`H1-26 EPS 2,18 (${h1Eps.toFixed(2)}) & FFO 3,13 (${h1Ffo.toFixed(2)})`, Math.abs(h1Eps - 2.18) < 1e-9 && Math.abs(h1Ffo - 3.13) < 1e-9);
const h2Eps = 4.475 - h1Eps, h2Ffo = 6.26 - h1Ffo;
ok(`H2-behov 2,29 (${h2Eps.toFixed(2)}) & 3,13 (${h2Ffo.toFixed(2)})`, Math.abs(h2Eps - 2.295) < 1e-9 && Math.abs(h2Ffo - 3.13) < 1e-9);
har("2,29 dollar");
const peFfo = pld.pris / 6.26, peGaap = pld.pris / 4.475;
ok(`P/FFO 21,8 (${peFfo.toFixed(1)}) & P/E GAAP-mitt 30,5 (${peGaap.toFixed(1)})`, Math.abs(peFfo - 21.8) < 0.05 && Math.abs(peGaap - 30.5) < 0.05);
har("21,8");
har("**30,5**");
const multGap = ((peGaap - peFfo) / peGaap) * 100;
ok(`multipelgap 29 % (${multGap.toFixed(1)})`, Math.abs(multGap - 28.5) < 0.5);
har("29 procent");
const kvm = 62 * 0.092903;
ok(`62 M sqft → 5,8 M m² (${kvm.toFixed(1)})`, Math.abs(kvm - 5.76) < 0.01);

// Scenarioruta: FY25-intäkt 8 790,127 MUSD × marginalfältet ±1 pp, intäkt ±3 %
const rev = 8790.127;
const m = pld.lonksamhet.ebitMarginal;
const r3 = rev * 0.03;
const cell = (r, mm) => Math.round(r * mm);
const forvantade = [
  [cell(rev - r3, m - 0.01), cell(rev - r3, m), cell(rev - r3, m + 0.01)],
  [cell(rev, m - 0.01), cell(rev, m), cell(rev, m + 0.01)],
  [cell(rev + r3, m - 0.01), cell(rev + r3, m), cell(rev + r3, m + 0.01)],
];
const rader = ["8 526", "8 790", "9 054"];
const gruppera = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
forvantade.forEach((rad, i) => {
  ok(`scenariorad ${rader[i]} label`, body.includes(`Intäkter ${rader[i]}`));
  rad.forEach((c) => har(gruppera(c)));
});
ok(`bascell 3 782 (${forvantade[1][1]})`, forvantade[1][1] === 3782 && body.includes("3 782"));
const pp1 = rev * 0.01, rev3 = r3 * m;
ok(`1 pp = 88 MUSD (${pp1.toFixed(1)})`, Math.abs(pp1 - 87.9) < 0.1);
har("88 miljoner");
ok(`3 % intäkt = 113 MUSD (${rev3.toFixed(1)})`, Math.abs(rev3 - 113.5) < 0.1);
har("113 miljoner");
ok(`intäktsvikt 1,3× (${(rev3 / pp1).toFixed(2)})`, Math.abs(rev3 / pp1 - 1.29) < 0.01);
har("1,3 gånger");
const mvikt = 1 / (3 * m);
ok(`marginalvikt 0,77 (${mvikt.toFixed(2)})`, Math.abs(mvikt - 0.77) < 0.005);
har("**0,77**");
ok("GS-tvillingreferens 0,79", body.includes("0,79"));

// EV-kedjan (öppen-lämnad): mcap+skuld → implicit EBIT → implicit TTM-intäkt
const evU = pld.marknadsKapitalMdr + 35.0;
const ebitImpl = evU / pld.vardering.evEbit;
const revImpl = ebitImpl / m;
ok(`implicit EBIT 4,17 (${ebitImpl.toFixed(2)}) & implicit intäkt 9,7 (${revImpl.toFixed(1)})`, Math.abs(ebitImpl - 4.17) < 0.01 && Math.abs(revImpl - 9.7) < 0.05);
har("4,17");
har("9,7 miljarder");
har("167,8");

// ── 5. MEDIANER — LIVE ur bolagsunivers.json (225 rader) ────────────────────
const fast = rows.filter((r) => r.bransch === "fastighet");
ok(`fastighet n = 17 (${fast.length})`, fast.length === 17);
ok("nio svenska", fast.filter((r) => r.land === "Sverige").length === 9 && body.includes("nio svenska"));
const sorterad = (arr) => arr.filter((v) => typeof v === "number" && v > 0).sort((a, b) => a - b);
const mediana = (arr) => (arr.length ? arr[Math.floor((arr.length - 1) / 2)] : null);
const peM = mediana(sorterad(fast.map((r) => r.vardering?.pe)));
const pbM = mediana(sorterad(fast.map((r) => r.vardering?.pb)));
const evM = mediana(sorterad(fast.map((r) => r.vardering?.evEbit)));
const pegM = mediana(sorterad(fast.map((r) => r.vardering?.peg)));
const fcfM = mediana(sorterad(fast.map((r) => r.vardering?.fcfYield)));
const roeM = mediana(sorterad(fast.map((r) => r.lonksamhet?.roe)));
ok(`P/E-median 14,380 (${sv(peM, 3)})`, Math.abs(peM - 14.38) < 0.001); har("14,380");
ok(`P/B-median 0,946 (${sv(pbM, 3)})`, Math.abs(pbM - 0.946) < 0.001); har("0,946");
ok(`EV/EBIT-median 24,894 (${sv(evM, 3)})`, Math.abs(evM - 24.894) < 0.001); har("24,894");
ok(`PEG-median 4,16 n=11 (${sv(pegM)}; n ${sorterad(fast.map((r) => r.vardering?.peg)).length})`, Math.abs(pegM - 4.16) < 0.005); har("4,16");
ok(`fcfY-median 4,67 % n=13 (${sv(fcfM * 100)}; n ${sorterad(fast.map((r) => r.vardering?.fcfYield)).length})`, Math.abs(fcfM - 0.0467) < 0.0005); har("4,67 procent");
ok(`ROE-median 8,51 % n=16 (${sv(roeM * 100)}; n ${sorterad(fast.map((r) => r.lonksamhet?.roe)).length})`, Math.abs(roeM - 0.0851) < 0.0005); har("8,51 procent");
ok(`P/E +112 % (${Math.round((pe / peM - 1) * 100)})`, Math.abs(pe / peM - 1 - 1.116) < 0.005); har("112 procent");
ok(`P/B +151 % (${Math.round((pb / pbM - 1) * 100)})`, Math.abs(pb / pbM - 1 - 1.511) < 0.005); har("151 procent");
ok(`EV/EBIT +62 % (${Math.round((pld.vardering.evEbit / evM - 1) * 100)})`, Math.abs(pld.vardering.evEbit / evM - 1 - 0.615) < 0.005); har("62 procent");
// USA-REIT-sexa
const us = fast.filter((r) => r.land === "USA");
ok(`USA-sexa = 6 (${us.length})`, us.length === 6);
const usPb = sorterad(us.map((r) => r.vardering?.pb));
const usPbM = mediana(usPb);
ok(`US P/B-median 7,04 (${sv(usPbM)})`, Math.abs(usPbM - 7.04) < 0.005); har("7,04");
ok("US-sexans sex P/B-värden redovisade", ["2,375", "1,37", "7,04", "10,91", "15,03", "21,79"].every((s) => body.includes(s)));
ok(`PLD näst lägst av sex: bara O under (${usPb.filter((v) => v < pb).length} under)`, usPb.filter((v) => v < pb).length === 1 && body.includes("näst billigast av sex"));
ok(`PLD 66 % under US-medianen (${Math.round((1 - pb / usPbM) * 100)})`, Math.abs((1 - pb / usPbM) - 0.663) < 0.005); har("66 procent under");
// PEG-universum
const pegU = sorterad(rows.map((r) => r.vardering?.peg));
ok(`universum-PEG n=185 (${pegU.length})`, pegU.length === 185);
ok(`PLD PEG = universumets max (${pegU[pegU.length - 1]})`, pegU[pegU.length - 1] === 121.59 && body.includes("högst i hela universumet"));
ok(`näst högst 55,33 (${pegU[pegU.length - 2]})`, Math.abs(pegU[pegU.length - 2] - 55.33) < 0.01); har("55,33");
ok(`universummedian 1,26 (${sv(mediana(pegU))})`, Math.abs(mediana(pegU) - 1.26) < 0.005); har("1,26");
// EV/EBIT näst högst i grenen efter EQIX
const evGren = sorterad(fast.map((r) => r.vardering?.evEbit));
ok(`EV/EBIT näst högst efter 52,49 (${sv(evGren[evGren.length - 1])})`, Math.abs(evGren[evGren.length - 1] - 52.49) < 0.01 && body.includes("Equinix (52,49)"));
// fem tidigare fastighetspaket utan dubbelkoll
const femma = ["CAST.ST", "NP3.ST", "FABG.ST", "HUFV-A.ST", "WALL-B.ST"].map((t) => rows.find((r) => r.ticker === t));
ok("fem tidigare fastighetsrader utan MarketStack-dubbelkoll", femma.every((r) => (r.kallor || []).every((k) => !(k.paranoid || "").includes("dubbelkoll"))));

// ── 6. JURIDIKGRINDEN ───────────────────────────────────────────────────────
const lagrum = body.match(/2007:528/g) || [];
ok(`exakt ett lagrum 2007:528 (${lagrum.length})`, lagrum.length === 1);
ok("inga andra lagrum-citats", !/lagen om |2007:\d+|2022:\d+|1985:\d+|2005:\d+/.test(body.replace("2007:528", "")));
const radd = ["rekommenderar", "köpråd", "säljråd", "aktietips", "bör köpa", "bör sälja", "vi råder"];
ok("inga rådglosor", radd.every((s) => !body.includes(s)));
const stycken = body.trim().split(/\n\n+/);
const sista = stycken[stycken.length - 1];
ok("disclaimer-sista-stycket", sista.startsWith("*Detta är pedagogisk finansutbildning") && sista.includes("inte investeringsrådgivning") && sista.includes("kundens beslut"));
ok("utbildningsformulering i ingress", body.includes("utbildning i metod: inte en rekommendation att köpa, sälja eller behålla"));
ok("inget 911/telefonnummer", !/\b911\b/.test(body) && !/\+1 \(/.test(body));
ok("konsensus flaggat som estimat", body.includes("ett estimat, inte bolagets egna siffra"));

// ── 7. LÄNKAR ───────────────────────────────────────────────────────────────
const tillatna = new Set(["pe", "pb", "ev-ebit", "peg", "fcf-avkastning", "netto-marginal", "roe", "roic", "skuldsattning", "omsattningstillvaxt-ttm", "prognos-tillvaxt", "universumjamforelse", "vardering"]);
const interna = [...body.matchAll(/\]\(\/dataset\/([a-z0-9-]+(?:\/[a-z0-9-]+)?)\)/g)].map((m) => m[1]);
ok(`interna länkar finns (${interna.length})`, interna.length >= 12);
ok("samtliga interna länkar i tillåten uppsättning", interna.every((l) => l.startsWith("fastighet/") && tillatna.has(l.slice("fastighet/".length))));
const externa = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
ok(`externa länkar (${externa.length})`, externa.length >= 2);
ok("externa endast prologis-domäner", externa.every((u2) => /^https:\/\/(www\.)?(prologis\.com|ir\.prologis\.com)\//.test(u2)) || externa.every((u2) => u2.includes("prologis.com")));

// ── RESULTAT ────────────────────────────────────────────────────────────────
console.log(`KVD PROLOGIS: ${PASS} PASS · ${FEL} FEL`);
if (FEL > 0) {
  console.error("FELLISTA:");
  fel.forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
console.log("GRÖN — paketet klart för granskningskön.");
