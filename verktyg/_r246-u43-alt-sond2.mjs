#!/usr/bin/env node
/** _r246-u43-alt-sond2.mjs — kommunikations-sond generation 2 efter ILD (404) + ETL (negativt netto):
 *  PUB Publicis (reklam) + MMT M6 + TFI TF1 (media). Samma vakter: kollisionskontroll,
 *  sektor ej Industrials, P/E-bärare TTM-netto > 0. Read-only. */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
mkdirSync("/tmp/r246-altsond", { recursive: true });
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const kand = [
  ["PUB", "Publicis", "https://stockanalysis.com/quote/epa/PUB/"],
  ["MMT", "M6", "https://stockanalysis.com/quote/epa/MMT/"],
  ["TFI", "TF1", "https://stockanalysis.com/quote/epa/TFI/"],
];
for (const [tick, namn, url] of kand) {
  const koll = u.filter((b) => b.ticker === tick || b.ticker === tick + ".PA" || (b.namn ?? "").toLowerCase().includes(namn.toLowerCase()));
  console.log(`\n══ ${tick} ${namn} ══ kollisionskontroll: ${koll.length === 0 ? "REN (0 träffar i universumet " + u.length + ")" : "TRÄFFAR: " + koll.map((b) => b.ticker).join(",")}`);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html", "cache-control": "no-cache" }, redirect: "follow" });
    const html = await r.text();
    writeFileSync(`/tmp/r246-altsond/${tick}.html`, html);
    let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
    const rader = plain.split("\n").map((x) => x.trim()).filter((x) => x.length > 1);
    writeFileSync(`/tmp/r246-altsond/${tick}.plain.txt`, rader.join("\n"));
    console.log(`${tick}: HTTP ${r.status} · ${rader.length} textrader`);
    rader.forEach((rad, i) => { if (/^(sector|industry)$/i.test(rad)) console.log(`  ${rad}: ${rader[i + 1] ?? "?"}`); });
    for (const nyckel of ["Market Cap", "PE Ratio", "Revenue", "Net Income", "EPS", "Forward PE", "Dividend Yield", "Quote"] ) {
      const i = rader.findIndex((x) => x === nyckel);
      if (i >= 0) console.log(`  ${nyckel}: ${rader.slice(i + 1, i + 3).filter((x) => !/^(Overview|Statistics|Profile)$/i.test(x)).slice(0, 2).join(" | ")}`);
    }
    const prisIx = rader.findIndex((x) => /^Quote$/i.test(x));
    if (prisIx >= 0) console.log(`  pris kontext: ${rader.slice(prisIx, prisIx + 8).join(" · ")}`);
  } catch (e) {
    console.log(`${tick}: FEL ${e.message}`);
  }
}
