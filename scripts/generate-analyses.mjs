#!/usr/bin/env node
/**
 * Genererar datadrivna föranalyser från Analysis Engine (Python, live-data).
 * Ärlighet: dessa är TEKNISKT/DATADRIVNA föranalyser — AKM1:s 20-variabel-
 * granskning görs manuellt av grundaren och märks som väntande.
 *
 * Kör: node scripts/generate-analyses.mjs
 */
import { spawn } from "child_process";
import { writeFileSync, existsSync, readFileSync } from "fs";
import path from "path";

const TICKERS = [
  "SAND.ST", "ERIC-B.ST", "HM-B.ST", "AZN.ST", "ABB.ST",
  "ATCO-A.ST", "EVO.ST", "KOG.ST", "SKF-B.ST", "INDU-C.ST",
];

function körPython(tickers) {
  return new Promise((resolve) => {
    const barn = spawn("python", ["scripts/analysis_engine.py"], { cwd: process.cwd() });
    let ut = "";
    barn.stdout.on("data", (d) => (ut += d));
    barn.on("close", () => {
      try { resolve(JSON.parse(ut).tickers || []); } catch { resolve([]); }
    });
    barn.on("error", () => resolve([]));
    barn.stdin.write(JSON.stringify({ tickers }));
    barn.stdin.end();
  });
}

const biasTillRek = (b) =>
  b.includes("BULLISH") ? "DATA POSITIVT — AKM1-GRANSKNING VÄNTAR"
  : b.includes("BEARISH") ? "DATA NEGATIVT — AKM1-GRANSKNING VÄNTAR"
  : "DATA NEUTRALT — AKM1-GRANSKNING VÄNTAR";

const idag = new Date().toISOString().slice(0, 10);

const analyser = await körPython(TICKERS);
let n = 0;
for (const a of analyser) {
  if (a.fel || !a.data) { console.log("✗", a.ticker, a.fel || "ingen data"); continue; }
  const fil = path.join("data", "analyses", `${a.ticker}.json`);
  if (existsSync(fil)) {
    // Skriv inte över manuella/granskade analyser
    const bef = JSON.parse(readFileSync(fil, "utf8"));
    if (bef.kalla !== "analysis-engine") { console.log("⏭ hoppar (manuell):", a.ticker); continue; }
  }
  const d = a.data;
  const doc = {
    ticker: a.ticker,
    displayTicker: a.ticker.replace(".ST", ""),
    company: a.namn,
    exchange: a.bors || "Nasdaq Stockholm",
    currency: a.valuta || "SEK",
    verified: idag,
    analysisDate: idag,
    source: `AK1A Analysis Engine — Yahoo Finance (pris/volym, ${a.kallor} källa${a.kallor > 1 ? "r" : ""})`,
    status: "Datadriven föranalys — AKM1:s 20-variabelgranskning väntar grundaren",
    kalla: "analysis-engine",
    recommendation: {
      del: "Datadriven genomlysning",
      title: "Rekommendation",
      body: "Signaler beräknade ur pris och volym via 5 horisonter × 5 teorier. Fundamental AKM1-granskning kompletteras manuellt innan full rekommendation.",
      main: biasTillRek(a.sammanfattning ? "" : ""),
      mainSub: "Föranalys — ej investeringsråd",
      period: "löpande",
      bullets: [
        `25-cell: ${a.sammanfattning.bull}▲ / ${a.sammanfattning.bear}▼ / ${a.sammanfattning.neutral}—`,
        `Volatilitet σ ${Math.round((d.sigma_ar || 0) * 100)} %/år`,
        `52v-position: ${Math.round(d.pos52 * 100)} %`,
      ],
      priceTarget: {
        value: String(d.hojd52),
        currency: a.valuta || "SEK",
        span12m: `${d.lag52} – ${d.hojd52}`,
        risk: (d.sigma_ar || 0) > 0.6 ? "HÖG" : (d.sigma_ar || 0) > 0.35 ? "MEDEL" : "LÅG-MEDEL",
      },
      nyborjareCallout: {
        title: "Vad är en datadriven föranalys?",
        body: "Vi har låtit motorn läsa pris och volym via fem tidshorisonter. Det visar TREND och RISK — men inte om bolaget är värt sitt pris. Det avgör fundamentalgranskningen (AKM1) som väntar.",
      },
    },
    waveSummary: {
      title: "Våganalys — motorns klassificering",
      overallBias: a.vager ? Object.values(a.vager).filter((v) => v === "impulsvåg").length >= 3
        ? "Impulsvågsdomans" : Object.values(a.vager).filter((v) => v === "korrigering").length >= 3
        ? "Korrigeringsdomans" : "Blandad bild" : "Osatt",
      perHorisont: a.vager,
      matris25: a.matris25,
    },
    priceLevels: {
      title: "Datastyrda nivåer",
      levels: [
        { label: "52v-lägsta", value: String(d.lag52), tone: "bear" },
        { label: "Fib 61,8 % (från topp)", value: String(d.fib62), tone: "neutral" },
        { label: "MA 50 dagar", value: String(d.ma50 ?? "—"), tone: "neutral" },
        { label: "Fib 38,2 % (från topp)", value: String(d.fib38), tone: "neutral" },
        { label: "MA 200 dagar", value: String(d.ma200 ?? "—"), tone: "neutral" },
        { label: "52v-högsta", value: String(d.hojd52), tone: "bull" },
      ],
    },
    motivation: {
      del: "Motivering",
      body: `Motorn hämtade ${a.kallor} oberoende källa${a.kallor > 1 ? "r" : ""} och beräknade momentum per horisont, volatilitet (σ ${Math.round((d.sigma_ar || 0) * 100)} %/år), 52-veckorsposition (${Math.round(d.pos52 * 100)} %) och vågklass per horisont: ${Object.entries(a.vager || {}).map(([h, v]) => `${h}=${v}`).join(", ")}. 25-cellersmatrisen ger ${a.sammanfattning.bull} bullish-, ${a.sammanfattning.bear} bearish- och ${a.sammanfattning.neutral} neutrala celler. Detta är trend- och riskläget — värderingen kommer i den manuella AKM1-granskningen.`,
    },
    risk: {
      sigmaAr: d.sigma_ar,
      atr14: d.atr14,
      voltrend: d.voltrend,
      pos52: d.pos52,
    },
    disclaimer: "Datadriven föranalys från pris/volymdata. Pedagogisk finansanalys — inte investeringsråd.",
  };
  writeFileSync(fil, JSON.stringify(doc, null, 2) + "\n");
  n++;
  console.log("✓", a.ticker, "—", a.namn, `(${a.sammanfattning.bull}▲/${a.sammanfattning.bear}▼)`);
}
console.log(`\nKlart: ${n} föranalyser genererade (manuela analyser bevarade)`);
