#!/usr/bin/env node
/**
 * _s4u3-kvd-tele2.mjs — KVD för kvartalsläspaketet sa-laser-du-tele2-q3-2026.
 * Två lägen:
 *   node verktyg/_s4u3-kvd-tele2.mjs tal      → skriv ut alla kanoniska tal (tillverkning)
 *   node verktyg/_s4u3-kvd-tele2.mjs kvd      → kontrollera levererad fil (sifferval i text,
 *                                                länkar 200, juridikgrind, ordantal, disclaimer)
 * Källor: data/portfolj-system/bolagsunivers.json (TEL2-A.ST), kalender-kommunikation.json.
 */
import { readFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const T = uni.find((b) => b.ticker === "TEL2-A.ST");
if (!T) throw new Error("TEL2-A.ST saknas i universumfilen");

const med = (arr) => {
  const s = arr.filter((v) => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const sekt = uni.filter((b) => b.bransch === "kommunikation");
const fält = (b) => ({
  pe: b.vardering?.pe ?? null, pb: b.vardering?.pb ?? null, roe: b.lonksamhet?.roe ?? null,
  ebit: b.lonksamhet?.ebitMarginal ?? null, netto: b.lonksamhet?.nettoMarginal ?? null,
  skuld: b.stabilitet?.skuldEgenkapital ?? null,
});
const sektMed = {}, uniMed = {}, n = {};
for (const k of Object.keys(fält(T))) {
  sektMed[k] = med(sekt.map((b) => fält(b)[k]));
  uniMed[k] = med(uni.map((b) => fält(b)[k]));
  n[k] = { sekt: sekt.filter((b) => fält(b)[k] !== null).length, uni: uni.filter((b) => fält(b)[k] !== null).length };
}

// ── Kanoniska tal ────────────────────────────────────────────────────────────
const pe = T.vardering.pe, pb = T.vardering.pb, roe = T.lonksamhet.roe, roic = T.lonksamhet.roic;
const pris = T.pris, bv = T.marknadsKapitalMdr, ebitM = T.lonksamhet.ebitMarginal;
const nettoM = T.lonksamhet.nettoMarginal, skuldEk = T.stabilitet.skuldEgenkapital;
const pegKalla = T.vardering.peg, prognos = T.tillvaxt.prognosTillvaxt;
const oms = T.serier.omsattning, res = T.serier.resultat, år = T.serier.ar;
const cagr = (a, b, p) => (b / a) ** (1 / p) - 1;

const tal = {
  // Identitetstest åttonde ronden
  identitet: pb / roe,                         // P/E-enligt-identiteten
  peKalla: pe,
  identAvvPct: (pe - pb / roe) / pe * 100,     // avvikelse relativt källans P/E
  omvand: pe * roe,                            // P/B-enligt-identiteten
  implicitEPS: pris / pe,
  // EV-kedja (NIKE-mönstret) — enheter: mdr för EK/skuld/EV, Mkr för EBIT
  ekKedja: bv / pb,                            // börsvärde ÷ P/B = bokfört EK (mdr)
  skuldKedja: (bv / pb) * skuldEk,
  evKedja: bv / pb + (bv / pb) * skuldEk,
  ebitBas: oms.at(-1) * ebitM / 1e6,           // Mkr, 2025-bas
  evEbitKedja: (bv / pb + (bv / pb) * skuldEk) / (oms.at(-1) * ebitM / 1e9),
  evEbitKalla: T.vardering.evEbit,
  kedjeKvot: T.vardering.evEbit / ((bv / pb + (bv / pb) * skuldEk) / (oms.at(-1) * ebitM / 1e9)),
  residualKassa: bv / pb + (bv / pb) * skuldEk - T.vardering.evEbit * (oms.at(-1) * ebitM / 1e9),
  // PEG: konvention omöjlig (prognos null) — implicit tillväxt ur källans eget tal
  pegKalla, prognos,
  implicitTillvaxt: pe / pegKalla,             // % (P/E ÷ PEG)
  omsCagr: T.tillvaxt.omsattningCAGR5ar * 100,
  ttm: T.tillvaxt.omsattningTillvaxtTTM * 100,
  resCagr: T.tillvaxt.resultatCAGR5ar * 100,
  // Serier
  omsCagrEgen: cagr(oms[0], oms.at(-1), 3) * 100,
  resCagrEgen: cagr(res[0], res.at(-1), 3) * 100,
  omsSteg: [oms[1] / oms[0] - 1, oms[2] / oms[1] - 1, oms[3] / oms[2] - 1].map((v) => v * 100),
  resSteg: [res[1] / res[0] - 1, res[2] / res[1] - 1, res[3] / res[2] - 1].map((v) => v * 100),
  vandring: cagr(res[1], res[3], 2) * 100,     // 2023→2025
  nettoMargSerie: res.map((r, i) => (r / oms[i]) * 100),
  bruttoBas: oms.at(-1) * T.lonksamhet.bruttoMarginal / 1e6,
  // Scenarioruta 3×3 på 2025-basen (Mkr)
  bas: { oms: oms.at(-1) / 1e6, marginal: ebitM * 100 },
  ebitBasMkr: oms.at(-1) * ebitM / 1e6,
  rutor: (() => {
    const r = {};
    for (const [oi, o] of [-0.03, 0, 0.03].entries())
      for (const [mi, m] of [-0.01, 0, 0.01].entries())
        r[`o${oi}m${mi}`] = oms.at(-1) * (1 + o) * (ebitM + m) / 1e6;
    return r;
  })(),
  enPpMkr: oms.at(-1) * 0.01 / 1e6,
  treProcentMkr: oms.at(-1) * 0.03 * ebitM / 1e6,
  marginalvikt: 1 / (3 * ebitM),
  // Multiplövningar
  multImplicit: pe / (1 + pe / pegKalla / 100),
  multOms: pe / (1 + T.tillvaxt.omsattningCAGR5ar),
  // Medianer
  sektMed, uniMed, n,
  T: { pe, pb, roe: roe * 100, roic: roic * 100, ebit: ebitM * 100, netto: nettoM * 100, skuldEk, fcfY: T.vardering.fcfYield * 100, fcfMarg: T.lonksamhet.fcfMarginal * 100, brutto: T.lonksamhet.bruttoMarginal * 100 },
  fcfKontroll: (oms.at(-1) * T.lonksamhet.fcfMarginal / 1e9) / bv * 100, // FCF-yield enligt marginal × omsättning
  sektAntal: sekt.length, uniAntal: uni.length,
};

const sv = (v, d = 1) => v.toFixed(d).replace(".", ",");

if (process.argv[2] === "tal") {
  console.log(JSON.stringify(tal, null, 1));
  process.exit(0);
}

// ── KVD-läge: kontrollera levererad fil ─────────────────────────────────────
const fil = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-tele2-q3-2026.json`;
const fel = [], varning = [], gron = [];
const ok = (villkor, namn) => (villkor ? gron.push(namn) : fel.push(namn));
if (!existsSync(fil)) { console.error("FEL: filen finns inte"); process.exit(1); }
const paket = JSON.parse(readFileSync(fil, "utf8"));
const body = paket.body;

// A. Aritmetik mot källdata (kanonvärden som texten SKALL innehålla, omformaterade)
const narr = (x) => String(x.toFixed(1)).replace(".", ","); // tusentalsvärd tolerans
const kr = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const kontroller = [
  [`identitet ${sv(tal.identitet, 2)}`, body.includes(sv(tal.identitet, 2))],
  [`avvikelse ${sv(tal.identAvvPct, 1)} %`, body.includes(`${sv(tal.identAvvPct, 1)} procent`)],
  [`omvänd identitet ${sv(tal.omvand, 2)}`, body.includes(sv(tal.omvand, 2).replace(",", ",")) || body.includes(String(tal.omvand.toFixed(2)).replace(".", ","))],
  [`implicit EPS ${sv(tal.implicitEPS, 2)}`, body.includes(sv(tal.implicitEPS, 2))],
  [`EK kedja ${sv(tal.ekKedja, 2)} mdr`, body.includes(sv(tal.ekKedja, 2))],
  [`skuld kedja ${sv(tal.skuldKedja, 1)} mdr`, body.includes(sv(tal.skuldKedja, 1))],
  [`EV kedja ${sv(tal.evKedja, 2)} mdr`, body.includes(sv(tal.evKedja, 2))],
  [`EBIT bas ${kr(tal.ebitBasMkr)} Mkr`, body.includes(kr(tal.ebitBasMkr))],
  [`EV/EBIT kedja ${sv(tal.evEbitKedja, 2)}×`, body.includes(sv(tal.evEbitKedja, 2))],
  [`kedjekvot ${sv(tal.kedjeKvot, 2)}`, body.includes(sv(tal.kedjeKvot, 2))],
  [`implicit tillväxt ${sv(tal.implicitTillvaxt, 2)} %`, body.includes(sv(tal.implicitTillvaxt, 2))],
  [`omsCAGR ${sv(tal.omsCagrEgen, 2)} %`, body.includes(sv(tal.omsCagrEgen, 2))],
  [`resCAGR −${sv(Math.abs(tal.resCagrEgen), 2)} %`, body.includes(sv(Math.abs(tal.resCagrEgen), 2))],
  [`vändning +${sv(tal.vandring, 1)} %`, body.includes(sv(tal.vandring, 1))],
  [`marginalvikt ${sv(tal.marginalvikt, 2)}`, body.includes(sv(tal.marginalvikt, 2))],
  [`1 pp ≈ ${kr(tal.enPpMkr)} Mkr`, body.includes(kr(tal.enPpMkr))],
  [`3 % ≈ ${kr(tal.treProcentMkr)} Mkr`, body.includes(kr(tal.treProcentMkr))],
  [`multipl. implicit ${sv(tal.multImplicit, 2)}`, body.includes(sv(tal.multImplicit, 2))],
  ...Object.entries(tal.rutor).map(([k, v]) => [`ruta ${k} = ${kr(v)} Mkr`, body.includes(kr(v))]),
  ...tal.nettoMargSerie.map((v, i) => [`nettomarginal ${år[i]} ${sv(v, 1)} %`, body.includes(sv(v, 1))]),
  ...tal.omsSteg.map((v, i) => [`oms-steg ${i} +${sv(v, 1)} %`, body.includes(sv(v, 1))]),
  ...tal.resSteg.map((v, i) => [`res-steg ${i} ${v < 0 ? "−" : "+"}${sv(Math.abs(v), 1)} %`, body.includes(sv(Math.abs(v), 1))]),
];
for (const [namn, p] of kontroller) ok(p, namn);

// B. Medianer i tabellen (P/B-medianen 2,675 → svensk halv-upp-avrundning 2,68 i texten)
ok(body.includes(sv(sektMed.pe, 1)), `median P/E sekt ${sv(sektMed.pe, 1)}`);
ok(body.includes("2,68"), `median P/B sekt 2,68`);
ok(body.includes(sv(sektMed.roe * 100, 1)), `median ROE sekt ${sv(sektMed.roe * 100, 1)} %`);
ok(body.includes(sv(sektMed.ebit * 100, 1)), `median EBIT sekt ${sv(sektMed.ebit * 100, 1)} %`);
ok(body.includes(sv(sektMed.netto * 100, 1)), `median netto sekt ${sv(sektMed.netto * 100, 1)} %`);

// C. Interna länkar: markdown-länkar extraheras och kontrolleras mot localhost
// (retry en gång vid 404 — ISR-kallstart efter pm2-omstart kan ge enstaka falska 404)
const lankar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
const unika = [...new Set(lankar)];
let lankFel = 0;
for (const l of unika) {
  let kod = await fetch(`http://localhost:3000${l}`).then((r) => r.status).catch(() => 0);
  if (kod === 404) {
    await new Promise((r) => setTimeout(r, 1500));
    kod = await fetch(`http://localhost:3000${l}`).then((r) => r.status).catch(() => 0);
  }
  if (kod !== 200) { lankFel++; fel.push(`länk ${l} = ${kod}`); }
}
gron.push(`länkar ${unika.length - lankFel}/${unika.length} = 200`);

// D. Juridikgrind: rådverb (köp/sälj/behåll som rekommendation), målkurs, "vi rekommenderar"
const radMönster = [/\b(köp|sälj|behåll)\s+(denna|detta|aktien|andelar)/gi, /vi rekommenderar/gi, /målkurs/gi, /köptips/gi, /placeringstips/gi, /du bör (köpa|sälja)/gi];
const rådTräffar = radMönster.flatMap((re) => [...body.matchAll(re)].map((m) => m[0]));
if (rådTräffar.length) fel.push(`juridikgrind: ${rådTräffar.length} träffar (${rådTräffar.slice(0, 3).join(" ; ")})`);
else gron.push("juridikgrind 0 rådfraser");
ok(body.includes("2007:528") || body.includes("inte investeringsråd"), "disclaimer närvarande");
ok(!body.trimEnd().endsWith("!"), "inget utropstecken sist");

// E. Ordantal och struktur
const ord = body.replace(/[#*|\-`\[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
if (ord < 1800) fel.push(`ordantal ${ord} < 1800`); else gron.push(`ordantal ${ord}`);
const h2 = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
ok(h2.length >= 7, `H2-sektioner ${h2.length}`);

console.log(`KVD Tele2-paketet — GRÖNA ${gron.length}, FEL ${fel.length}, VARNINGAR ${varning.length}`);
for (const f of fel) console.log(`  FEL: ${f}`);
for (const v of varning) console.log(`  VARNING: ${v}`);
console.log(`  (gröna: ${gron.length} kontroller — sifferkontroller ${kontroller.length}, medianer 5, länkar ${unika.length}, juridik, struktur)`);
process.exit(fel.length ? 1 : 0);
