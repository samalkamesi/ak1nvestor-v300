#!/usr/bin/env node
/**
 * s2-u1 omg16 — HÄMTA Embraer (NYSE:ERJ ADR, industri/Brasilien) rådata från
 * stockanalysis.com: översikt + statistics + financials (resultaträkning,
 * kassaflöde, balansräkning). Skriver rå-HTML till cache och en parserad
 * tabell-utskrift för granskning. Läsverktyg — skriver ENDAST cache.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import https from "node:https";

const get = (url) =>
  new Promise((res, rej) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/128 Safari/537.36" } },
        (r) => {
          let d = "";
          r.on("data", (c) => (d += c));
          r.on("end", () => res({ code: r.statusCode, d, url }));
        })
      .on("error", rej);
  });

const SIDLAR = [
  ["overview", "https://stockanalysis.com/stocks/embj/"],
  ["statistics", "https://stockanalysis.com/stocks/embj/statistics/"],
  ["financials", "https://stockanalysis.com/stocks/embj/financials/"],
  ["cashflow", "https://stockanalysis.com/stocks/embj/financials/cash-flow-statement/"],
  ["balancesheet", "https://stockanalysis.com/stocks/embj/financials/balance-sheet/"],
];

mkdirSync("data/cache/erj-omg16", { recursive: true });
const rensa = (s) => s.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&euro;/g, "€").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

for (const [namn, url] of SIDLAR) {
  const r = await get(url);
  if (r.code !== 200) { console.log(`FEL ${namn}: kod ${r.code}`); continue; }
  writeFileSync(`data/cache/erj-omg16/${namn}.html`, r.d);
  // plocka tabellrader med textinnehåll
  const rader = [...r.d.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)].map((m) => m[1]);
  const ut = [];
  for (const rad of rader) {
    const celler = [...rad.matchAll(/<(?:td|th)[^>]*>(.*?)<\/(?:td|th)>/gs)].map((m) => rensa(m[1]));
    if (celler.length >= 2 && celler.some((c) => /\d/.test(c))) ut.push(celler.join(" | "));
  }
  console.log(`\n########## ${namn} (kod ${r.code}, ${ut.length} rader) ##########`);
  console.log(ut.join("\n"));
}
