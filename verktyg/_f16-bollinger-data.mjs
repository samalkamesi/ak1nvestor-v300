// F16 — hämta dagsslutkurser + räkna Bollinger-band (20 dagar, 2 stdavv, population)
const TICKERS = ['ERIC-B.ST', 'VOLV-B.ST', 'SAND.ST'];

async function hamta(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=3mo&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' } });
  if (!res.ok) throw new Error(`${ticker}: HTTP ${res.status}`);
  const j = await res.json();
  const r = j?.chart?.result?.[0];
  if (!r) throw new Error(`${ticker}: inget resultat`);
  const tider = r.timestamp ?? [];
  const stang = r.indicators?.quote?.[0]?.close ?? [];
  const valuta = r.meta?.currency ?? '?';
  const rader = [];
  for (let i = 0; i < tider.length; i++) {
    if (stang[i] == null) continue;
    rader.push({ dag: new Date(tider[i] * 1000).toISOString().slice(0, 10), kurs: stang[i] });
  }
  return { ticker, valuta, rader };
}

function bollinger(decista) {
  const win = decista.slice(-20);
  const n = win.length;
  const summa = win.reduce((a, d) => a + d.kurs, 0);
  const medel = summa / n;
  const avv = win.map(d => d.kurs - medel);
  const kvSum = avv.reduce((a, x) => a + x * x, 0);
  const stdavv = Math.sqrt(kvSum / n); // population (n) — Bollingers convention
  return { win, n, summa, medel, kvSum, stdavv, ovre: medel + 2 * stdavv, nedre: medel - 2 * stdavv };
}

for (const t of TICKERS) {
  try {
    const { ticker, valuta, rader } = await hamta(t);
    const sista = rader[rader.length - 1];
    console.log(`\n=== ${ticker} (${valuta}) — ${rader.length} handeldagar, senast ${sista.dag} ===`);
    const b = bollinger(rader);
    b.win.forEach((d, i) => {
      const avv = d.kurs - b.medel;
      console.log(`${String(i + 1).padStart(2)} ${d.dag}  ${d.kurs.toFixed(2).padStart(8)}  avvik ${avv >= 0 ? '+' : ''}${avv.toFixed(2).padStart(7)}  kvadrat ${(avv * avv).toFixed(3)}`);
    });
    console.log(`SUMMA ${b.summa.toFixed(2)} | MEDEL ${b.medel.toFixed(4)} | KVAVSUMMA ${b.kvSum.toFixed(4)} | (÷20) ${b.medel.toFixed(2)} varav ${(b.kvSum / b.n).toFixed(4)} | STDAVV ${b.stdavv.toFixed(4)}`);
    console.log(`ÖVRE ${b.ovre.toFixed(2)} | NEDRE ${b.nedre.toFixed(2)} | BREDD ${((b.ovre - b.nedre) / b.medel * 100).toFixed(1)} % av medel`);
    // även föregående fönster för squeeze-jämförelse
    if (rader.length >= 41) {
      const b2 = bollinger(rader.slice(0, -1));
      console.log(`FÖREGÅENDE dag: bredd ${((b2.ovre - b2.nedre) / b2.medel * 100).toFixed(1)} % | nedre ${b2.nedre.toFixed(2)} ovre ${b2.ovre.toFixed(2)}`);
    }
    break; // första lyckade ticker räcker
  } catch (e) {
    console.error(`MISSLYCKADES ${t}: ${e.message}`);
  }
}
