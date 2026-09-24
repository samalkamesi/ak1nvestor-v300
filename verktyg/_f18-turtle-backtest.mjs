// F18 Way of the Turtle — Donchian 20/10 breakout-backtest på ^OMX (OMX Stockholm PI).
// Längre pedagogisk genomräkning: köp när slutkurs > högsta höga föregående 20 dagar,
// exit när slutkurs < lägsta låga föregående 10 dagar. Långsida, en position, close-to-close.
import { readFileSync } from 'node:fs';

const d = JSON.parse(readFileSync('/tmp/f18-omx.json', 'utf8')).chart.result[0];
const ts = d.timestamp.map(t => new Date(t * 1000).toISOString().slice(0, 10));
const q = d.indicators.quote[0];
const rows = ts
  .map((dag, i) => ({ dag, h: q.high[i], l: q.low[i], c: q.close[i] }))
  .filter(r => r.c !== null && Number.isFinite(r.c));

const TEST_START = '2025-09-24'; // 12 månader till 2026-09-23
const UPPEHALL = 20, EXIT_N = 10;

let pos = null;
const trades = [];
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  if (r.dag < TEST_START) continue;
  const pre = rows.slice(Math.max(0, i - UPPEHALL), i);
  const preExit = rows.slice(Math.max(0, i - EXIT_N), i);
  const donHigh = Math.max(...pre.map(x => x.h));
  const donLow = Math.min(...preExit.map(x => x.l));
  if (!pos && r.c > donHigh) {
    pos = { inDag: r.dag, inKurs: r.c, donHigh };
  } else if (pos && r.c < donLow) {
    trades.push({ ...pos, utDag: r.dag, utKurs: r.c, donLow,
      pnlPct: ((r.c - pos.inKurs) / pos.inKurs) * 100 });
    pos = null;
  }
}
if (pos) { // öppen position vid slutet → mät till senaste kurs
  const s = rows.at(-1);
  trades.push({ ...pos, utDag: s.dag + ' (öppen, värd)', utKurs: s.c,
    pnlPct: ((s.c - pos.inKurs) / pos.inKurs) * 100, oppen: true });
}

const vinnare = trades.filter(t => t.pnlPct > 0);
const produkt = trades.reduce((a, t) => a * (1 + t.pnlPct / 100), 1);
console.log('Period:', TEST_START, '→', rows.at(-1).dag, `(${rows.filter(r => r.dag >= TEST_START).length} börsdagar)`);
console.log('Källkod: ^OMX OMX Stockholm PI, Yahoo Finance, hämtat 2026-09-24');
console.log('Regler: köp close > 20-dagars high | exit close < 10-dagars low | långsida, en position');
console.log(`Trades: ${trades.length}, vinnare: ${vinnare.length} (${(100 * vinnare.length / trades.length).toFixed(0)} %)`);
for (const t of trades) {
  console.log(`  ${t.inDag} köp ${t.inKurs.toFixed(0)} (break >${t.donHigh.toFixed(0)}) → ${t.utDag} exit ${t.utKurs.toFixed(0)} (bryt <${t.donLow.toFixed(0)}): ${t.pnlPct >= 0 ? '+' : ''}${t.pnlPct.toFixed(1)} %${t.oppen ? ' [öppen]' : ''}`);
}
console.log(`Totalt multiplicerat: ${(produkt - 1) * 100 >= 0 ? '+' : ''}${((produkt - 1) * 100).toFixed(1)} %`);
// buy-and-hold som jämförelse
const p0 = rows.find(r => r.dag >= TEST_START).c;
console.log(`Indexet samma period (buy & hold): ${(((rows.at(-1).c - p0) / p0) * 100).toFixed(1)} % (från ${p0.toFixed(0)} till ${rows.at(-1).c.toFixed(0)})`);
