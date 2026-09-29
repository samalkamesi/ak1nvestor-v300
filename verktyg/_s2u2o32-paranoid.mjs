// _s2u2o32-paranoid.mjs — Yahoo chart-API paranoid bandkontroll (spårets kanon-steg)
// Jämför StockAnalysis close 2026-09-28 mot Yahoo regularMarketPrice; band < 1 %.
const ticker = process.argv[2];
const saClose = Number(process.argv[3]);
const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`;
try {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" } });
  if (!r.ok) { console.log(`FAIL HTTP ${r.status}`); process.exit(1); }
  const j = await r.json();
  const m = j?.chart?.result?.[0]?.meta;
  if (!m) { console.log("FAIL ingen meta"); process.exit(1); }
  const y = m.regularMarketPrice;
  const prev = m.chartPreviousClose ?? m.previousClose;
  const band = Math.abs(y - saClose) / saClose;
  console.log(JSON.stringify({
    ticker,
    yahoo: y,
    saClose,
    bandProcent: +(band * 100).toFixed(3),
    dom: band < 0.01 ? "GRÖN (<1 %)" : "RÖD",
    valuta: m.currency,
    exchangeTimezone: m.exchangeTimezoneName,
    prevClose: prev,
  }));
} catch (e) {
  console.log("FAIL", e.message);
  process.exit(1);
}
