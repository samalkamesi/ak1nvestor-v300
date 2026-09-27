#!/usr/bin/env node
/**
 * verktyg/rapptidsuppdatera.mjs — RAPPDAGS-DIFFVERKTYG (v172-fönstrets mall, rond 239).
 * Användning: node verktyg/rapptidsuppdatera.mjs <universumticker> <sa-kod> [<vagar>]
 *   t.ex.: node verktyg/rapptidsuppdatera.mjs A3M.MC bme/A3M 4
 * Vad den gör (READ-ONLY mot universumet — uppdatering sker alltid kirurgiskt per rond):
 *   1. läser universumraden (ticker-match), 2. hämtar quote+statistics (och vid <vagar>=4
 *   även financials+cashflow) från StockAnalysis, 3. kör FÄLT-DIFF mot radens låsbärande
 *   fält, 4. rapporterar: ändrade fält med gamla/nya värden + avvikelsegrad + TTM-lås som
 *   behöver omräkning + P/E-bärarkontroll på färsk TTM. Kvitto: /tmp/rapptid-<ticker>.txt
 * Rond-procedur vid rappdag (bokförd i rond 235/238): fyra färskpaneler → detta verktygs
 * diff → kirurgisk fältuppdatering i bolagsunivers.json → llms HELREGEN → läckagevakt →
 * tsc → protokoll + commit.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const [ , , tickerArg, saKod, vagarArg ] = process.argv;
if (!tickerArg || !saKod) {
  console.error("Användning: node verktyg/rapptidsuppdatera.mjs <universumticker> <sa-kod> [<vagar: 2|4>]  (t.ex. A3M.MC bme/A3M 4)");
  process.exit(2);
}
const vagar = vagarArg === "4" ? 4 : 2;

const UNI = "data/portfolj-system/bolagsunivers.json";
const u = JSON.parse(readFileSync(UNI, "utf8"));
const rad = u.find((b) => b.ticker === tickerArg);
if (!rad) { console.error(`ABORT: ${tickerArg} finns inte i universumet`); process.exit(1); }

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const slug = tickerArg.replace(/[^A-Za-z0-9]/g, '-');
const kat = `/tmp/rapptid-${slug}`;
mkdirSync(kat, { recursive: true });
const sidor = [
  ["quote", `https://stockanalysis.com/quote/${saKod}/`],
  ["statistics", `https://stockanalysis.com/quote/${saKod}/statistics/`],
  ...(vagar === 4 ? [
    ["financials", `https://stockanalysis.com/quote/${saKod}/financials/`],
    ["cashflow", `https://stockanalysis.com/quote/${saKod}/financials/cash-flow-statement/`],
  ] : []),
];
const panel = {};
for (const [namn, url] of sidor) {
  const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
  const html = await r.text();
  writeFileSync(`${kat}/${namn}.html`, html);
  let plain = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
  plain = plain.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'");
  const rr = plain.split("\n").map(x => x.trim()).filter(x => x.length > 1);
  writeFileSync(`${kat}/${namn}.plain.txt`, rr.join("\n"));
  const v = {};
  const NYCKLAR = ["Market Cap", "Revenue (ttm)", "Net Income", "EPS", "PE Ratio", "Forward PE", "Dividend", "Shares Out", "Total Debt", "Cash & Cash Equivalents", "Operating Cash Flow", "Free Cash Flow"];
  for (let i = 0; i < rr.length; i++) {
    if (NYCKLAR.includes(rr[i]) && !(rr[i] in v)) {
      const nasta = rr[i + 1] ?? "";
      // härdning: ENDAST numeriska/procentuella värden (meny-rubriker som "Revenue" avvisas)
      if (/^-?[\d.,]+[%BM]?$|^-/.test(nasta.trim()) || /n\/a/i.test(nasta)) v[rr[i]] = nasta;
    }
    if (rr[i] === "Compare" && !v.pris) v.pris = rr[i + 1];
  }
  panel[namn] = v;
}
const q = panel.quote, s = panel.statistics;
const tal = (x) => { const m = parseFloat(String(x ?? "").replace(/,/g, "")); return Number.isFinite(m) ? m : null; };
const mcapB = tal((s["Market Cap"] ?? q["Market Cap"] ?? "").replace("B", "")) ?? tal(((s["Market Cap"] ?? q["Market Cap"] ?? "").replace("M", ""))) / 1000;

// FÄLT-DIFF: universumradens låsbärande fält mot färsk panel
const diff = [];
const jfr = (namn, gammal, ny, enhet = "") => {
  if (gammal === null || ny === null || ny === undefined) return;
  const avv = Math.abs((ny - gammal) / (gammal || 1));
  diff.push({ namn, gammal, ny, avv });
};
jfr("pris", rad.pris, tal(q.pris));
jfr("marknadsKapitalMdr", rad.marknadsKapitalMdr, mcapB);
jfr("vardering.pe", rad.vardering?.pe, tal(s["PE Ratio"]));
jfr("lonksamhet.nettoMarginal*100", (rad.lonksamhet?.nettoMarginal ?? 0) * 100, tal((s["Profit Margin"] ?? "").replace("%", "")));
jfr("fcf-yield*100 (om fält finns)", (rad.vardering?.fcfYield ?? null) * 100, tal((s["FCF Yield"] ?? "").replace("%", "")));

const nettoTTM = tal(q["Net Income"]);
const barar = nettoTTM !== null && nettoTTM > 0;
const rapport = [
  `RAPPDAGS-DIFF ${tickerArg} (${saKod}, ${vagar} paneler, hämtat ${new Date().toISOString().slice(0, 10)})`,
  `Universumradens hamtat: ${rad.hamtat} · rad ${JSON.stringify({ pris: rad.pris, mcap: rad.marknadsKapitalMdr, pe: rad.vardering?.pe })}`,
  `Färsk panel: pris ${q.pris} · mcap ${s["Market Cap"] ?? q["Market Cap"]} · netto TTM ${q["Net Income"]} · P/E ${s["PE Ratio"]} · EPS ${q["EPS"] ?? s["EPS"]} · utd ${s["Dividend"] ?? q["Dividend"]}`,
  `P/E-BÄRARKONTROLL: TTM-netto ${q["Net Income"]} ⇒ ${barar ? "GRÖN (> 0)" : "RÖD (≤ 0 — raden fryses tills bärare)"}`,
  "",
  `FÄLT-DIFF (låsbärande):`,
  ...diff.map(d => `  ${d.avv < 0.02 ? "≈" : "Δ"} ${d.namn}: ${d.gammal} → ${d.ny} (${(d.avv * 100).toFixed(2)} %)`),
  "",
  `NÄSTA STEG (rond-procedur): ${diff.some(d => d.avv >= 0.02) ? "ÄNDRINGAR ATT UPPDATERA — kirurgisk fältuppdatering + omräknade lås (tretton) + serier/TTM-fönster + llms HELREGEN + läckagevakt + tsc + protokoll" : "INGA väsentliga förändringar (>2 %) — notisrapport räcker denna rappdag"}.`,
];
const txt = rapport.join("\n");
writeFileSync(`/tmp/rapptid-${slug}.txt`, txt + "\n");
console.log(txt);
