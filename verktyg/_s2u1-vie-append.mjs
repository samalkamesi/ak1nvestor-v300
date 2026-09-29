#!/usr/bin/env node
/**
 * s2-u1 (manifest auto-s2-1790657113931) — VIE.PA Veolia Environnement-append
 * i data/portfolj-system/bolagsunivers.json (universum 316→317).
 *
 * Konventioner (spår 2, NYTTOVALT-/industri-familjerna):
 *  - idempotensguard: SKIP om VIE.PA redan finns (race-disciplin, omg2-läxan)
 *  - aritmetikgrind med ABORT FÖRE skrivning (nyttovalt-u1:s 69/69-mönster)
 *  - medianer mätta i PROCESSMINNET före skrivning + efter (omg6-konventionen)
 *  - ALL data live-hämtad 2026-09-29 från stockanalysis.com /quote/epa/VIE/
 *    (+statistics +financials +balance-sheet +cash-flow-statement), S&P GMI.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(FIL, "utf8"));

// ── idempotensguard ─────────────────────────────────────────────────────────
if (u.some((r) => r.ticker === "VIE.PA")) {
  console.log("SKIP: VIE.PA finns redan — append idempotent, inget görs.");
  process.exit(0);
}

// ── medianreplik (dataset-medianer.ts, EXAKT — _nyttovalt-llms-regen-mönstret)
const median = (v) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentil = (v, p) => {
  const r = v.filter((x) => typeof x === "number" && Number.isFinite(x));
  if (!r.length) return null;
  const s = [...r].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? s[lo] : s[lo] + (pos - lo) * (s[hi] - s[lo]);
};
const stat = (rader, f, pct) => {
  const v = rader.map((b) => f(b) ?? null);
  const n = v.filter((x) => typeof x === "number" && Number.isFinite(x)).length;
  const omv = (x) => (x === null ? null : pct ? Math.round(x * 1000) / 10 : Math.round(x * 100) / 100);
  return { median: omv(median(v)), p25: omv(percentil(v, 0.25)), p75: omv(percentil(v, 0.75)), n };
};
const mät = (label, rader) => {
  console.log(`  ${label}: P/E ${JSON.stringify(stat(rader, (b) => b.vardering?.pe, false))} ` +
    `P/B ${JSON.stringify(stat(rader, (b) => b.vardering?.pb, false))} ` +
    `EBIT ${JSON.stringify(stat(rader, (b) => b.lonksamhet?.ebitMarginal, true))} ` +
    `FCF ${JSON.stringify(stat(rader, (b) => b.lonksamhet?.fcfMarginal, true))} ` +
    `tillv ${JSON.stringify(stat(rader, (b) => b.tillvaxt?.omsattningTillvaxtTTM, true))} ` +
    `resCAGR ${JSON.stringify(stat(rader, (b) => b.tillvaxt?.resultatCAGR5ar, true))}`);
};
const mätTotalt = (label, rader) => {
  console.log(`  ${label}: totalt P/E ${JSON.stringify(stat(rader, (b) => b.vardering?.pe, false))} ` +
    `resCAGR ${JSON.stringify(stat(rader, (b) => b.tillvaxt?.resultatCAGR5ar, true))}`);
};
const matta = (rader) => {
  // samtliga land×bransch- och aspektmattor (gränsregel: >=5 publiceras)
  const m = {};
  for (const r of rader) {
    const lb = `${r.land}|${r.bransch}`;
    m[lb] = (m[lb] ?? 0) + 1;
  }
  return m;
};

console.log(`FÖRE (${u.length} rader):`);
mät("industri", u.filter((r) => r.bransch === "industri"));
mätTotalt("universum", u);
const mattorFöre = matta(u);
console.log(`  Frankrike|industri-matta: ${mattorFöre["Frankrike|industri"] ?? 0}`);

// ── raden (ALLA tal från källhämtningen 2026-09-29) ─────────────────────────
const rad = {
  ticker: "VIE.PA",
  namn: "Veolia Environnement S.A.",
  bransch: "industri",
  land: "Frankrike",
  valuta: "EUR",
  kallor: [
    {
      namn: "StockAnalysis",
      hamtat: "2026-09-29",
      url: "https://stockanalysis.com/quote/epa/VIE/ (+ /statistics/ + /financials/ + /financials/balance-sheet/ + /financials/cash-flow-statement/)",
      paranoid: "Euronext Paris-primärnotering, S&P Global Market Intelligence-underlag, close 2026-09-28 CET (fördröjd slutnotering vid hämtningsläget, SAMPO-precedensen): pris 31,09 EUR/22,77 mdr EUR (aktier 732,35 M; replik 31,09×732,35 = 22 769 M EXAKT); STATISTICS-panelen bär multiplarna: P/E 17,99 trailing mot forward 12,41 ⇒ prognosTillvaxt +44,96 % implicit (normaliseringsgap — källans EGEN 3-års EPS-prognos +8,28 %/år dokumenterad som kontrast-not, ASML-precedensens klass); PEG 1,32 källans fält (protokollet), spårets peg-konvention pe÷prognos = 0,40 dokumenterad i protokollet med källans fält som primär (industri-familjens AIR.PA-notering bär spårvägen; skillnaden enbart den stora implicita normaliseringen); P/B 1,69 (replik mcap÷totalt EK 13 264 = 1,72 på års-slutet, källans fält bärs); EV/EBIT 13,80 (replik EV 49 660÷(7,87 %×44 541) = 14,16 — källans fält bärs, troligen normaliserat EBIT-fönster; EV 49,66 mot mcap 22,77 + nettoskuld 19,37 = 42,14 ⇒ differens ~7,5 mdr € bär minoritetsintressen + pensionsåtaganden, fransk koncessionsstruktur); netto 2,59 % = 1 153÷44 541 TTM EXAKT (financials-sidans eget TTM-fält; statistics 2,79 % = annan EPS-bas, avvikelsen dokumenterad); FCF POSITIV (kontrast mot nyttovalt-elbolagens samtliga negativa): fcfYield 9,55 % = 2 175÷22 770 EXAKT, fcfMarginal 4,88 % = 2 175÷44 541 EXAKT; brutto 17,86 % enbart TTM i källan (ingen 5-årig bruttovinstserie ⇒ moat-fält null, NEE-precedensen); skuld/EK 2,50 källans fält (replik 29 517÷13 264 = 2,23 på års-slutet — källans snitt-/justerade bas, fältet bärs); räntetäckning 3,69; ROE 13,43 % ROIC 4,87 % (S&P-bearbetade baser med minoritetsjusteringar — replikerna avviker, fälten bärs); utdelning 1,50 EUR (4,83 %) payout 97,67 % av vinsten MOT FCF-payout 50,51 % (definitionsnoten dokumenterad); beta 0,99; 52-v 27,69–37,66; 203 100 anställda; analytiker Buy 39,56 EUR (17 st); nästa rapp 2026-11-05; branschfältet industri = källans Sector Industrials/Industry Waste Management (S&P; KLASSNINGSFYNDET: vardagligt 'utility' men GICS/S&P bär Industrials→Environmental & Facilities Services — Keyence-precedensen primärkällan vinner, raden landar i industri som branschens FÖRSTA avfallshantering-rad); FY kalenderår; seriens stegetapp 2021→2022 (oms 28,5→42,9 mdr) bär Suez-fusionen (slutförd 2022) — endpoint-CAGR dokumenteras som fusionseffekt i protokollet"
    }
  ],
  hamtat: "2026-09-29",
  pris: 31.09,
  marknadsKapitalMdr: 22.77,
  tillvaxt: {
    omsattningCAGR5ar: 0.1171,
    resultatCAGR5ar: 0.2923,
    omsattningTillvaxtTTM: -0.002,
    prognosTillvaxt: 0.4496
  },
  lonksamhet: {
    roe: 0.1343,
    roic: 0.0487,
    bruttoMarginal: 0.1786,
    ebitMarginal: 0.0787,
    nettoMarginal: 0.0259,
    fcfMarginal: 0.0488
  },
  stabilitet: {
    skuldEgenkapital: 2.5,
    rantaTackning: 3.69,
    fcfPositivaSenaste5: null,
    kassaManaderBurnRate: null,
    nyemissionerSenaste5ar: null
  },
  aterkop: {
    senasteArMdr: null,
    andelUtestande: null,
    insiderkopSenaste6man: null
  },
  moat: {
    bruttoMarginalMedel5ar: null,
    bruttoMarginalSpread5ar: null,
    roeMedel5ar: null
  },
  vardering: {
    pe: 17.99,
    pb: 1.69,
    evEbit: 13.8,
    peg: 1.32,
    fcfYield: 0.0955,
    egenKapitalMultipl: 1.69
  },
  golv: {
    typ: "osatt",
    vardePerAktie: null,
    marginal: null
  },
  serier: {
    ar: ["2021", "2022", "2023", "2024", "2025"],
    omsattning: [28508000000, 42885000000, 45351000000, 44692000000, 44396000000],
    resultat: [404300000, 716000000, 937000000, 1040000000, 1128000000],
    egetKapital: [12770000000, 14867000000, 14702000000, 15306000000, 13264000000],
    fcf: [1418000000, 1364000000, 1865000000, 2073000000, 2097000000]
  }
};

// ── aritmetikgrind (ABORT FÖRE skrivning) ───────────────────────────────────
const kontroller = [];
const K = (namn, beräknad, fält, tol) =>
  kontroller.push({ namn, ok: Math.abs(beräknad - fält) <= tol, beräknad, fält });

K("omsCAGR endpoint (44396/28508)^(1/4)-1", (44396 / 28508) ** 0.25 - 1, rad.tillvaxt.omsattningCAGR5ar, 0.0005);
K("resCAGR endpoint (1128/404.3)^(1/4)-1", (1128 / 404.3) ** 0.25 - 1, rad.tillvaxt.resultatCAGR5ar, 0.0005);
K("prognosTillvaxt 17.99/12.41-1", 17.99 / 12.41 - 1, rad.tillvaxt.prognosTillvaxt, 0.001);
K("peg spårkonvention pe/(prognos×100)", 17.99 / (rad.tillvaxt.prognosTillvaxt * 100), 0.4, 0.01);
K("fcfYield TTM 2175/22770", 2175 / 22770, rad.vardering.fcfYield, 0.0005);
K("fcfMarginal TTM 2175/44541", 2175 / 44541, rad.lonksamhet.fcfMarginal, 0.0005);
K("nettoMarginal TTM 1153/44541", 1153 / 44541, rad.lonksamhet.nettoMarginal, 0.0005);
K("mcap-replik 31.09×732.35/1000", (31.09 * 732.35) / 1000, rad.marknadsKapitalMdr, 0.02);
K("ekm = pb", rad.vardering.pb, rad.vardering.egenKapitalMultipl, 0);
K("serielängd 5×5",
  Math.min(rad.serier.omsattning.length, rad.serier.resultat.length, rad.serier.egetKapital.length, rad.serier.fcf.length, rad.serier.ar.length),
  5, 0);

const fel = kontroller.filter((k) => !k.ok);
for (const k of kontroller) {
  console.log(`${k.ok ? "GRÖN" : "RÖD"} ${k.namn}: beräknad ${k.beräknad.toFixed(6)} mot fält ${k.fält}`);
}
if (fel.length) {
  console.error(`ABORT: ${fel.length} aritmetikkontroller RÖDA — ingen skrivning.`);
  process.exit(1);
}

// ── append + skrivning ──────────────────────────────────────────────────────
u.push(rad);
writeFileSync(FIL, JSON.stringify(u, null, 2) + "\n");
console.log(`SKRIVEN: VIE.PA appendad — universum ${u.length - 1}→${u.length} rader.`);

console.log(`EFTER (${u.length} rader):`);
mät("industri", u.filter((r) => r.bransch === "industri"));
mätTotalt("universum", u);
const mattorEfter = matta(u);
console.log(`  Frankrike|industri-matta: ${mattorEfter["Frankrike|industri"] ?? 0} (gräns 5 för aspektsida)`);
const nyaMattor = Object.entries(mattorEfter).filter(([k, v]) => v >= 5 && (mattorFöre[k] ?? 0) < 5);
console.log(nyaMattor.length ? `  NYA ASPEKTMATTOR ≥5: ${JSON.stringify(nyaMattor)}` : "  inga nya land×bransch-mattor över gränsen 4→5");
