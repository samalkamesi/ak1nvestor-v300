#!/usr/bin/env node
/**
 * _s4u3-kvd-yara.mjs — Yara Q3-2026-läspaket: tal-läge (beräkning), KVD-läge (verifiering).
 * Källor: data/portfolj-system/bolagsunivers.json (YAR.OL),
 *         data/blogg-utkast/kvartal/2026-q3/kalender-*.json (rappdagar).
 * Lägen: `node verktyg/_s4u3-kvd-yara.mjs tal` | `... kvd`
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const bolag = Array.isArray(uni) ? uni : uni.bolag || uni.universum;
const y = bolag.find((b) => b.ticker === "YAR.OL");

const fmt = (x, d = 1) => Number(x).toFixed(d);
const pct = (x, d = 2) => `${fmt(x * 100, d)} procent`;
const mdr = (x) => x / 1e9;

// —— medianer (excluding null) ——
const median = (arr) => {
  const v = arr.filter((x) => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};
const mat = bolag.filter((b) => b.bransch === "material");
const med = {
  pe: median(mat.map((b) => b.vardering?.pe)),
  pb: median(mat.map((b) => b.vardering?.pb)),
  roe: median(mat.map((b) => b.lonksamhet?.roe)),
  ebit: median(mat.map((b) => b.lonksamhet?.ebitMarginal)),
  netto: median(mat.map((b) => b.lonksamhet?.nettoMarginal)),
  skuld: median(mat.map((b) => b.stabilitet?.skuldEgenkapital)),
};
const uniMed = {
  pe: median(bolag.map((b) => b.vardering?.pe)),
  pb: median(bolag.map((b) => b.vardering?.pb)),
  roe: median(bolag.map((b) => b.lonksamhet?.roe)),
  ebit: median(bolag.map((b) => b.lonksamhet?.ebitMarginal)),
  netto: median(bolag.map((b) => b.lonksamhet?.nettoMarginal)),
  skuld: median(bolag.map((b) => b.stabilitet?.skuldEgenkapital)),
};
const n = (f) => bolag.filter((b) => { const v = f(b); return v !== null && v !== undefined && Number.isFinite(v); }).length;
const nMat = (f) => mat.filter((b) => { const v = f(b); return v !== null && v !== undefined && Number.isFinite(v); }).length;

if (process.argv[2] === "tal") {
  const S = y.serier;
  const oms = S.omsattning.map(mdr), res = S.resultat.map(mdr); // miljarder NOK
  const omsMkr = S.omsattning.map((x) => x / 1e6); // miljoner NOK
  const resMkr = S.resultat.map((x) => x / 1e6);
  const cagr = (a, b, yr) => (Math.pow(b / a, 1 / yr) - 1);
  const ar = S.ar;
  console.log("=== YARA YAR.OL — samtliga tal ur bolagsunivers.json (hämtad", y.hamtat, ") ===");
  console.log("pris", y.pris, "NOK | mcap", y.marknadsKapitalMdr, "mdr NOK | valuta", y.valuta);
  console.log("P/E", y.vardering.pe, "| P/B", y.vardering.pb, "| EV/EBIT", y.vardering.evEbit, "| PEG", y.vardering.peg, "| FCF-yield", y.vardering.fcfYield);
  console.log("ROE", y.lonksamhet.roe, "| ROIC", y.lonksamhet.roic, "| brutto", y.lonksamhet.bruttoMarginal, "| EBIT", y.lonksamhet.ebitMarginal, "| netto", y.lonksamhet.nettoMarginal, "| FCFmarg", y.lonksamhet.fcfMarginal);
  console.log("skuld/EK", y.stabilitet.skuldEgenkapital, "| räntetäckning", y.stabilitet.rantaTackning, "| insiderköp", y.aterkop.insiderkopSenaste6man);
  console.log("omsCAGR", y.tillvaxt.omsattningCAGR5ar, "| resCAGR", y.tillvaxt.resultatCAGR5ar, "| TTM", y.tillvaxt.omsattningTillvaxtTTM, "| prognos", y.tillvaxt.prognosTillvaxt);
  console.log("\nserier år:", ar.join(" "));
  console.log("omsättning Mkr:", omsMkr.map((x) => fmt(x, 0)).join(" → "));
  console.log("resultat Mkr:", resMkr.map((x) => fmt(x, 0)).join(" → "));
  console.log("årliga intäktssteg %:", S.omsattning.slice(1).map((x, i) => fmt((x / S.omsattning[i] - 1) * 100, 2)).join(" / "));
  console.log("årliga resultatsteg %:", S.resultat.slice(1).map((x, i) => fmt((x / S.resultat[i] - 1) * 100, 2)).join(" / "));
  console.log("härledd nettomarginalserie %:", resMkr.map((r, i) => fmt((r / omsMkr[i]) * 100, 2)).join(" / "));
  console.log("kontroll CAGR oms (4 år, 3 steg):", pct(cagr(S.omsattning[0], S.omsattning[3], 3)), "källa:", y.tillvaxt.omsattningCAGR5ar);
  console.log("kontroll CAGR res (4 år, 3 steg):", pct(cagr(S.resultat[0], S.resultat[3], 3)), "källa:", y.tillvaxt.resultatCAGR5ar);
  console.log("kvot topp/botten resultat:", fmt(resMkr[0] / resMkr[2], 0), "x | botten→2025:", fmt(resMkr[3] / resMkr[2], 1), "x");

  // identitetstest P/E = P/B / ROE
  const id = y.vardering.pb / y.lonksamhet.roe;
  console.log("\n=== IDENTITETSTEST P/E = P/B ÷ ROE ===");
  console.log(`${y.vardering.pb} ÷ ${y.lonksamhet.roe} =`, fmt(id, 2), "mot P/E-fältet", y.vardering.pe, "→ avvikelse", fmt((id / y.vardering.pe - 1) * 100, 1), "%");
  console.log("omvänt: P/E × ROE =", fmt(y.vardering.pe * y.lonksamhet.roe, 3), "mot P/B", y.vardering.pb, "→", fmt((y.vardering.pe * y.lonksamhet.roe / y.vardering.pb - 1) * 100, 1), "%");
  console.log("implicit EPS:", fmt(y.pris / y.vardering.pe, 2), "NOK");

  // absolutkontroll
  console.log("\n=== ABSOLUTKONTROLL (P/E × vinst mot mcap", y.marknadsKapitalMdr, "mdr) ===");
  const nettoFalt = S.omsattning[3] / 1e9 * y.lonksamhet.nettoMarginal;
  const v1 = y.vardering.pe * nettoFalt;
  const v2 = y.vardering.pe * (S.resultat[3] / 1e9);
  console.log("väg 1 nettofältet: intäkt", fmt(S.omsattning[3] / 1e9, 1), "mdr × netto", y.lonksamhet.nettoMarginal, "=", fmt(nettoFalt, 0), "Mkr → P/E×netto =", fmt(v1, 1), "mdr → residual", fmt((v1 / y.marknadsKapitalMdr - 1) * 100, 1), "%");
  console.log("väg 2 serie-2025:", fmt(S.resultat[3] / 1e6, 0), "Mkr → P/E×res =", fmt(v2, 1), "mdr → residual", fmt((v2 / y.marknadsKapitalMdr - 1) * 100, 1), "%");
  console.log("underlagen isär:", fmt(Math.abs(nettoFalt * 1e9 / S.resultat[3] - 1) * 100, 1), "%");

  // PEG
  console.log("\n=== PEG ===");
  const pegConv = y.vardering.pe / (y.tillvaxt.prognosTillvaxt * 100);
  console.log("fältets PEG", y.vardering.peg, "| prognostillväxt", y.tillvaxt.prognosTillvaxt, "=", pct(y.tillvaxt.prognosTillvaxt));
  console.log("konvention P/E ÷ (tillväxt i %):", y.vardering.pe, "÷", fmt(y.tillvaxt.prognosTillvaxt * 100, 2), "=", fmt(pegConv, 2), "| kvot mot fältet:", fmt(pegConv / y.vardering.peg, 3));
  console.log("implicit tillväxt ur fältet: P/E ÷ PEG =", fmt(y.vardering.pe / y.vardering.peg, 2), "%");

  // EV-kedjan
  console.log("\n=== EV-KEDJAN (5 steg) ===");
  const ek = y.marknadsKapitalMdr / y.vardering.pb;
  const skuld = ek * y.stabilitet.skuldEgenkapital;
  const ev = ek + skuld;
  const ebit25 = (S.omsattning[3] / 1e9) * y.lonksamhet.ebitMarginal;
  const evEbitKedja = ev / ebit25;
  console.log("EK =", y.marknadsKapitalMdr, "÷", y.vardering.pb, "=", fmt(ek, 1), "mdr");
  console.log("skuld = EK ×", y.stabilitet.skuldEgenkapital, "=", fmt(skuld, 1), "mdr");
  console.log("EV =", fmt(ev, 1), "mdr");
  console.log("EBIT 2025 = intäkt", fmt(S.omsattning[3] / 1e9, 1), "mdr ×", y.lonksamhet.ebitMarginal, "=", fmt(ebit25 * 1000, 0), "Mkr");
  console.log("EV/EBIT-kedja =", fmt(evEbitKedja, 2), "mot fältet", y.vardering.evEbit, "→ kvot", fmt(evEbitKedja / y.vardering.evEbit, 3));
  console.log("fältets EV implicerar:", fmt(y.vardering.evEbit * ebit25, 1), "mdr → residual", fmt(y.vardering.evEbit * ebit25 - ev, 1), "mdr (=", fmt(y.vardering.evEbit * ebit25 / ev, 1), "× kedjans EV)");

  // FCF-kontroll
  console.log("\n=== FCF-KONTROLL ===");
  const fcfMarg = (S.omsattning[3] / 1e9) * y.lonksamhet.fcfMarginal;
  const yieldHarled = fcfMarg / y.marknadsKapitalMdr;
  console.log("FCF enligt marginalfältet:", fmt(y.lonksamhet.fcfMarginal, 4), "×", fmt(S.omsattning[3] / 1e9, 1), "mdr =", fmt(fcfMarg * 1000, 0), "Mkr → yield", fmt(yieldHarled * 100, 2), "% mot fältet", y.vardering.fcfYield * 100, "% → kvot", fmt(yieldHarled / y.vardering.fcfYield, 1));
  const fcfFranYield = y.marknadsKapitalMdr * y.vardering.fcfYield;
  console.log("FCF enligt yieldfältet =", fmt(fcfFranYield * 1000, 0), "Mkr → marginal", fmt(fcfFranYield / (S.omsattning[3] / 1e9) * 100, 2), "% mot marginalfältet", y.lonksamhet.fcfMarginal * 100, "%");

  // ROIC-kedja
  console.log("\n=== ROIC-PROXY-KONTROLL ===");
  console.log("källans ROIC", y.lonksamhet.roic, "| egen kedja EBIT/(skuld+EK) =", fmt(ebit25 / (skuld + ek) * 100, 1), "% → gap", fmt((ebit25 / (skuld + ek) - y.lonksamhet.roic) * 100, 1), "pp | ROE-gap:", fmt((y.lonksamhet.roe - y.lonksamhet.roic) * 100, 1), "pp");
  console.log("kapital som krävs för källans ROIC:", fmt(ebit25 / y.lonksamhet.roic, 1), "mdr (mot kedjans", fmt(skuld + ek, 1), "mdr)");

  // scenarioruta
  console.log("\n=== SCENARIORUTA (bas 2025) ===");
  const I = S.omsattning[3] / 1e6; // Mkr
  const m0 = y.lonksamhet.ebitMarginal;
  const niv = [-0.03, 0, 0.03].map((d) => I * (1 + d));
  const mar = [m0 - 0.01, m0, m0 + 0.01];
  for (const ni of niv) console.log(fmt(ni, 0), "|", mar.map((m) => fmt(ni * m, 0)).join(" | "));
  console.log("1 pp marginal =", fmt(I * 0.01, 0), "Mkr | 3 % intäkter =", fmt(I * 0.03, 0), "Mkr | marginalvikt =", fmt(I * 0.01 / (I * 0.03), 2), "| Essity-formeln 1/(3×marginal) =", fmt(1 / (3 * m0), 2));
  console.log("FCF-variant (marginal", y.lonksamhet.fcfMarginal * 100, "%):", niv.map((ni) => fmt(ni * y.lonksamhet.fcfMarginal, 0)).join(" / "), "Mkr → yield", niv.map((ni) => fmt((ni * y.lonksamhet.fcfMarginal / 1e9) / y.marknadsKapitalMdr * 100, 2)).join(" / "), "%");
  console.log("multiplövning P/E ÷ (1+prognos):", y.vardering.pe, "÷", fmt(1 + y.tillvaxt.prognosTillvaxt, 4), "=", fmt(y.vardering.pe / (1 + y.tillvaxt.prognosTillvaxt), 2));

  // medianer
  console.log("\n=== MEDIANER (beräknade 2026-09-17 ur", bolag.length, "bolagsfilen; material n =", mat.length + ") ===");
  const f = { pe: (b) => b.vardering?.pe, pb: (b) => b.vardering?.pb, roe: (b) => b.lonksamhet?.roe, ebit: (b) => b.lonksamhet?.ebitMarginal, netto: (b) => b.lonksamhet?.nettoMarginal, skuld: (b) => b.stabilitet?.skuldEgenkapital };
  for (const k of Object.keys(f)) {
    console.log(k, "YARA:", y.vardening?.[k] ?? y.lonksamhet?.[k] ?? y.stabilitet?.[k], "| material-median:", fmt(med[k], 4), "(n=" + nMat(f[k]) + ")", "| universum:", fmt(uniMed[k], 4), "(n=" + n(f[k]) + ")");
  }
  console.log("Yara mot medianer: P/E", fmt((y.vardering.pe / med.pe - 1) * 100, 0), "% mot material |", fmt((y.vardering.pe / uniMed.pe - 1) * 100, 0), "% mot universum");
  console.log("P/B", fmt((y.vardering.pb / med.pb - 1) * 100, 0), "% |", fmt((y.vardering.pb / uniMed.pb - 1) * 100, 0), "%");
  console.log("ROE", fmt((y.lonksamhet.roe / med.roe - 1) * 100, 0), "% |", fmt((y.lonksamhet.roe / uniMed.roe - 1) * 100, 0), "%");
  console.log("EBIT", fmt((y.lonksamhet.ebitMarginal / med.ebit - 1) * 100, 0), "% |", fmt((y.lonksamhet.ebitMarginal / uniMed.ebit - 1) * 100, 0), "%");
  console.log("netto", fmt((y.lonksamhet.nettoMarginal / med.netto - 1) * 100, 0), "% |", fmt((y.lonksamhet.nettoMarginal / uniMed.netto - 1) * 100, 0), "%");
  console.log("skuld", fmt((y.stabilitet.skuldEgenkapital / med.skuld - 1) * 100, 0), "% |", fmt((y.stabilitet.skuldEgenkapital / uniMed.skuld - 1) * 100, 0), "%");
  console.log("brutto-median material:", fmt(median(mat.map((b) => b.lonksamhet?.bruttoMarginal)), 4), "universum:", fmt(median(bolag.map((b) => b.lonksamhet?.bruttoMarginal)), 4));
  console.log("marginaler fält:", "brutto", y.lonksamhet.bruttoMarginal, "ebit", y.lonksamhet.ebitMarginal, "netto", y.lonksamhet.nettoMarginal, "→ trapplän brutto→EBIT:", fmt((y.lonksamhet.bruttoMarginal - y.lonksamhet.ebitMarginal) * 100, 2), "pp, EBIT→netto:", fmt((y.lonksamhet.ebitMarginal - y.lonksamhet.nettoMarginal) * 100, 2), "pp, total:", fmt((y.lonksamhet.bruttoMarginal - y.lonksamhet.nettoMarginal) * 100, 2), "pp");

  // rappfönster 20–23 oktober
  console.log("\n=== RAPPFÖNSTER 20–23 oktober (kalenderfilerna) ===");
  const kal = readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-material.json`, "utf8");
  const paketFiler = ["abb", "alfa-laval", "astrazeneca", "atlas-copco", "castellum", "ericsson", "essity", "evolution", "handelsbanken", "hm-b", "holm", "iberdrola", "industrivarden", "nike", "nordea", "np3", "precise-biometrics", "saab", "sandvik", "skf-b", "swedbank", "tele2", "telia", "volvo-car", "volvo-group", "wallenstam"];
  console.log("paket på disk:", paketFiler.length, "+ yara =", paketFiler.length + 1);
  console.log("materialgrenens rappdagar: Yara/Billerud/Holmen 22, Hydro/SCA 23, SSAB/UPM 28, Boliden 29, Stora Enso 30, NEM 22 (estimat)");
  process.exit(0);
}

if (process.argv[2] === "kvd") {
  const P = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-yara-q3-2026.json`, "utf8"));
  const body = P.body;
  let fel = 0, varn = 0, pass = 0;
  const F = (ok, msg) => { if (ok) { pass++; } else { fel++; console.log("FEL:", msg); } };
  const W = (ok, msg) => { if (ok) { pass++; } else { varn++; console.log("VARNING:", msg); } };
  const has = (s) => body.includes(s);

  // —— struktur & metadata ——
  F(P.slug === "sa-laser-du-yara-q3-2026", "slug");
  F(typeof P.title === "string" && P.title.length > 20 && P.title.length < 320, `title-längd ${P.title.length}`);
  F(typeof P.description === "string" && P.description.length > 200 && P.description.length < 700, `description-längd ${P.description.length}`);
  F(P.pillar === "Institutionell metodik", "pillar");
  F(P.publishedAt === "2026-10-21", "publishedAt dagen före rappdagen");
  const ord = body.split(/\s+/).filter(Boolean).length;
  F(ord >= 2800 && ord <= 3450, `ordantal ${ord} (spann 2800–3450)`);
  const rm = Math.round(ord / 600);
  F(P.readingMinutes === rm, `readingMinutes ${P.readingMinutes} mot round(${ord}/600)=${rm}`);
  F(Array.isArray(P.tags) && P.tags.length >= 5, "tags");
  F(!body.includes("­"), "mjuka bindestreck");

  // —— juridikgrind: 2007:528 exakt en gång, sista rad; lagrum ej blandade ——
  const lawHits = (body.match(/2007:528/g) || []).length;
  F(lawHits === 1, `lagen 2007:528 förekommer ${lawHits} gånger (ska vara 1, i disclaimern)`);
  for (const lag of ["2022:260", "2022:261", "1985:716", "2005:59", "2022:482"]) F(!body.includes(lag), `lagrumsblandning: ${lag}`);
  const disclaim = body.slice(-900);
  F(disclaim.includes("inte investeringsrådgivning") && disclaim.includes("2007:528"), "disclaimer-sista-rad med lagrum");
  // rådmönster: köp/sälj endast i neutrala kontexter
  for (const m of ["köp", "sälj", "rekommendation att", "bör du", "vi råder", "tipsa om"]) {
    const re = new RegExp(m === "sälj" ? "sälj" : m, "g");
    let match, ok = true;
    while ((match = re.exec(body)) !== null) {
      const ctx = body.slice(Math.max(0, match.index - 60), match.index + 60);
      if (/inte en rekommendation att köpa|Inga köp-, sälj-|insiderköp|Insiderköp|skogsköp/.test(ctx)) continue;
      ok = false; console.log(`  rådkontext "${m}": …${ctx.replace(/\n/g, " ")}…`);
    }
    F(ok, `rådmönster: ${m}`);
  }
  F(!/"?köp (denna|aktien|nu)"?/i.test(body), "explicit köpråd");

  // —— tal ur källfilen (redan laddad: y, med, uniMed) ——
  const T = [
    ["466,70", "pris"], ["118,9", "mcap"], ["8,29", "P/E"], ["8,287", "P/E exakt"], ["1,34", "P/B"], ["1,335", "P/B exakt"],
    ["53,8", "EV/EBIT"], ["53,784", "EV/EBIT exakt"], ["2,53", "PEG"], ["1,79", "FCF-yield"],
    ["17,94", "ROE"], ["2,41", "ROIC"], ["30,0", "brutto"], ["13,52", "EBIT"], ["9,26", "netto"], ["12,88", "FCF-marginal"],
    ["0,42", "skuld/EK"], ["0,4175", "skuld/EK exakt"],
    ["15,67", "omsCAGR"], ["23,25", "resCAGR"], ["8,1", "TTM"], ["20,92", "prognos"],
    ["249 666", "oms 2022"], ["165 083", "oms 2023"], ["156 218", "oms 2024"], ["149 712", "oms 2025"],
    ["28 827", "res 2022"], ["13 033", "res 2025"], ["157", "res 2024"], ["510", "res 2023"],
    ["33,88", "omssteg 1"], ["5,37", "omssteg 2"], ["4,16", "omssteg 3"], ["98,23", "ressteg 1"], ["69,20", "ressteg 2"], ["8 203", "ressteg 3"],
    ["11,55", "nettomarg 2022"], ["0,31", "nettomarg 2023"], ["0,10", "nettomarg 2024"], ["8,71", "nettomarg 2025"],
    ["7,44", "identitet"], ["10,2", "ident-avv"], ["56,32", "implicit EPS"], ["1,487", "omvänd identitet"], ["11,4", "omvänd avv"],
    ["13 863", "nettofält"], ["114,9", "abs väg1"], ["3,4", "abs residual1"], ["108,0", "abs väg2"], ["9,2", "abs residual2"], ["6,4", "underlag isär"],
    ["0,40", "PEG-konvention"], ["3,27", "PEG-implicit"], ["0,16", "PEG-kvot"],
    ["89,0", "EK-kedja"], ["37,2", "skuld-kedja"], ["126,2", "EV-kedja"], ["20 241", "EBIT-kedja"], ["6,24", "EV/EBIT-kedja"], ["0,12", "kvot kedja"],
    ["1 088,6", "fältets EV"], ["962", "residual EV"], ["19 283", "FCF marg"], ["16,22", "FCF yield härledd"], ["2 128", "FCF yieldfält"], ["1,42", "marg ur yield"],
    ["16,0", "ROIC-kedja"], ["839,9", "kapitalkrav"],
    ["18 182", "cell11"], ["19 634", "cell12"], ["21 086", "cell13"], ["18 744", "cell21"], ["20 241", "cell22"], ["21 738", "cell23"], ["19 306", "cell31"], ["20 848", "cell32"], ["22 390", "cell33"],
    ["145 221", "nivå1"], ["154 203", "nivå3"], ["1 497", "1pp"], ["4 491", "3%"], ["2,47", "marginalvikt"],
    ["18 704", "FCF-nivå1"], ["19 861", "FCF-nivå3"], ["10,48", "multiplövning"],
    ["18,66", "median PE material"], ["20,84", "median PE univ"], ["1,46", "median PB material"], ["2,87", "median PB univ"], ["8,13", "median ROE material"], ["15,60", "median ROE univ"], ["9,81", "median EBIT material"], ["20,59", "median EBIT univ"], ["13,66", "median netto univ"],
    ["47,5", "median brutto univ"], ["20,7", "trapptotal"], ["16,5", "trapp steg1"], ["4,26", "trapp steg2"],
  ];
  for (const [s, namn] of T) F(has(s), `tal saknas i body: ${s} (${namn})`);

  // —— mediansiffermot källfilen (skydd mot handskrivna medianer) ——
  const n2 = (x, d = 2) => Number(x).toFixed(d);
  F(n2(med.pe) === "18.66", `P/E-median material ${n2(med.pe)}`);
  F(n2(med.pb) === "1.46", `P/B-median material ${n2(med.pb, 2)} (filen ${med.pb})`);
  F(n2(med.roe * 100) === "8.13", `ROE-median material ${n2(med.roe * 100)}`);
  F(n2(med.ebit * 100) === "9.81", `EBIT-median material ${n2(med.ebit * 100)}`);
  F(n2(med.netto * 100) === "9.26", `netto-median material ${n2(med.netto * 100)}`);
  F(n2(uniMed.netto * 100) === "13.66", `netto-median universum ${n2(uniMed.netto * 100)}`);
  F(y.lonksamhet.nettoMarginal.toFixed(4) === "0.0926" && n2(med.netto * 100) === "9.26", "dubbelmedian: Yara = material-nettomedianen");
  F(y.lonksamhet.bruttoMarginal.toFixed(4) === "0.3000", "Yara = material-bruttomedianen");
  F(mat.length === 15 && bolag.length === 153, `grupptal material=${mat.length} universum=${bolag.length}`);

  // —— oberoende efterräkning av nyckelberäkningar ——
  const S = y.serier;
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  F(near((S.resultat[3] / S.resultat[2]), 83.0, 0.1), "botten→2025 = 83,0×");
  F(near(S.resultat[0] / S.resultat[2], 183.7, 0.5), "topp/botten ≈ 184×");
  F(near((1 - Math.pow((S.resultat[3] / S.resultat[0]), 1 / 3)) * 100, 23.25, 0.01), "resCAGR 23,25");
  F(near((1 - Math.pow((S.omsattning[3] / S.omsattning[0]), 1 / 3)) * 100, 15.67, 0.01), "omsCAGR 15,67");
  F(near(y.vardering.pb / y.lonksamhet.roe, 7.44, 0.01), "identitet 7,44");
  F(near((y.vardering.pb / y.lonksamhet.roe / y.vardering.pe - 1) * 100, -10.2, 0.1), "ident-avv −10,2");
  F(near(S.omsattning[3] / 1e9 * 0.0926, 13.863, 0.001), "nettofält 13 863 Mkr");
  F(near(y.vardering.pe * 13.863, 114.87, 0.1), "abs väg1 114,9 mdr");
  F(near((y.marknadsKapitalMdr / y.vardering.pb) * (1 + y.stabilitet.skuldEgenkapital), 126.2, 0.1), "EV-kedja 126,2");
  F(near((S.omsattning[3] / 1e6) * y.lonksamhet.ebitMarginal, 20241, 1), "EBIT-kedja 20 241");
  F(near(126.2 / 20.241, 6.235, 0.01), "EV/EBIT-kedja 6,24");
  F(near((S.omsattning[3] / 1e9) * y.lonksamhet.fcfMarginal / y.marknadsKapitalMdr * 100, 16.22, 0.01), "FCF-yield härled 16,22");
  F(near((y.marknadsKapitalMdr * y.vardering.fcfYield) / (S.omsattning[3] / 1e9) * 100, 1.42, 0.01), "marginal ur yield 1,42");
  const I = S.omsattning[3] / 1e6;
  for (const [ni, m, cell] of [[145221, 0.1252, 18182], [145221, 0.1352, 19634], [145221, 0.1452, 21086], [149712, 0.1252, 18744], [149712, 0.1352, 20241], [149712, 0.1452, 21738], [154203, 0.1252, 19306], [154203, 0.1352, 20848], [154203, 0.1452, 22390]]) {
    F(near(ni * m, cell, 1), `scenariecell ${ni}×${m} = ${cell}`);
  }
  F(near(I * 0.01, 1497, 1) && near(I * 0.03, 4491, 1), "räknesatser 1 497/4 491");
  F(near(1 / (3 * 0.1352), 2.465, 0.01), "marginalvikt 2,47");
  F(near(y.vardering.pe / (1 + y.tillvaxt.prognosTillvaxt), 10.48, 0.01), "multiplövning 10,48");

  // —— interna länkar ——
  const links = [...new Set((body.match(/\]\((\/[^)]+)\)/g) || []).map((s) => s.slice(2, -1)))];
  F(links.length === 20, `unika interna länkar ${links.length} (väntat 20)`);
  F(!links.some((l) => l.includes("blogg-utkast")), "0 utkastlänkar");
  F(links.includes("/bolag/yar-ol") && links.includes("/kurser") && links.includes("/transparens") && links.includes("/kallor"), "kärnlänkar");
  const externa = [...new Set((body.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map((s) => s.slice(2, -1)))];
  F(externa.length === 1 && externa[0].includes("yara.com"), `externa länkar ${externa.length}`);

  // Mimosa-paritet (s8-u2 2026-09-18): länkarna (ur bloggtextens data) når
  // ALDRIG ett skal — fetch ersätter execSync(`node -e …path:'${l}'`)
  // (CHILD_PROC_INTERP); redirect:"manual" bevarar rå-statussemantiken.
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let ok200 = 0;
  for (const l of links) {
    let code = "";
    for (let forsok = 0; forsok < 3; forsok++) {
      try {
        const res = await fetch(`http://localhost:3000${l}`, { signal: AbortSignal.timeout(25000), redirect: "manual" });
        code = String(res.status);
      } catch { code = "ERR"; }
      if (code === "200") break;
      await sleep(500);
    }
    if (code === "200") ok200++; else console.log(`  länk ${l} → ${code}`);
    await sleep(250);
  }
  F(ok200 === links.length, `interna länkar HTTP 200: ${ok200}/${links.length}`);

  // —— rappdag & fönster ——
  F(has("22 oktober") && has("08:00"), "rappdag + klockslag i body");
  F(has("17 läspaket"), "fönsterräkning 17 (med Yara och Hydro)");
  F(has("4,60") && has("2,69") && has("1,20"), "trappan med Holmen/Boliden/Hydro");
  F(has("2026-09-25"), "tyst period");
  F(has("NOK"), "valutanot NOK");
  F(has("tolftebolagsuniversum") || has("tolvbolagsuniversum"), "vågvalideringsnot");

  console.log(`\nKVD YARA: ${pass} PASS, ${fel} FEL, ${varn} VARNINGAR (ord ${ord}, title ${P.title.length} tkn, description ${P.description.length} tkn, länkar ${links.length}+${externa.length} externa)`);
  process.exit(fel || varn ? 1 : 0);
}

console.log("använd: node verktyg/_s4u3-kvd-yara.mjs tal | kvd");
