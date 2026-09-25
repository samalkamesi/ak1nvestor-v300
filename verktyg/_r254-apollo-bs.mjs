#!/usr/bin/env node
/** _r254-apollo-bs.mjs — U49 komplettering: balance-sheet (EK-serien) + Yahoo paranoid. */
import { writeFileSync } from "node:fs";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
// 1) Balance sheet
try {
  const r = await fetch("https://stockanalysis.com/quote/nse/APOLLOHOSP/financials/balance-sheet/", { headers: { "user-agent": UA, "accept": "text/html" } });
  const html = await r.text();
  writeFileSync("/tmp/r254-apollo/balance.html", html);
  let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
  plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
  const rader = plain.split("\n").map((r) => r.trim()).filter((r) => r.length > 1);
  writeFileSync("/tmp/r254-apollo/balance.plain.txt", rader.join("\n"));
  console.log(`balance: HTTP ${r.status} · ${rader.length} textrader`);
} catch (e) { console.log("balance: FEL", e.message); }
// 2) Yahoo chart paranoid
try {
  const r = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/APOLLOHOSP.NS?range=5d&interval=1d", { headers: { "user-agent": UA } });
  const txt = await r.text();
  writeFileSync("/tmp/r254-apollo/yahoo.json", txt);
  console.log(`yahoo: HTTP ${r.status} · ${txt.length} bytes`);
} catch (e) { console.log("yahoo: FEL", e.message); }
