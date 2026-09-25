// F11-hjälp: räkna RSI-14 för hand på Atlas Copco B (Yahoo Finance 2026-09-24)
const ts = [1787554800,1787641200,1787727600,1787814000,1787900400,1788159600,1788246000,1788332400,1788418800,1788505200,1788764400,1788850800,1788937200,1789023600,1789110000,1789369200,1789455600,1789542000,1789628400,1789714800,1789974000,1790060400,1790146800,1790233200];
const close = [176.95,178.35,179.90,181.35,181.00,178.40,173.10,172.30,174.70,175.95,178.85,180.70,176.70,174.55,175.15,168.35,168.85,170.15,172.45,171.05,175.50,182.00,180.00,177.85];
const dag = t => new Date(t * 1000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
const n = close.length;
const win = close.slice(n - 15); // 15 senaste -> 14 forandningar
console.log('Fonster (15 senaste dagarna):');
win.forEach((c, i) => console.log(`${i + 1}. ${dag(ts[n - 15 + i])}  ${c.toFixed(2)}`));
const forr = [];
for (let i = 1; i < win.length; i++) forr.push(+(win[i] - win[i - 1]).toFixed(2));
const vinster = forr.filter(x => x > 0);
const forluster = forr.filter(x => x < 0).map(x => Math.abs(x));
const U = vinster.reduce((a, b) => a + b, 0) / 14;
const D = forluster.reduce((a, b) => a + b, 0) / 14;
const RS = U / D;
const RSI = 100 - 100 / (1 + RS);
console.log('\nForandringar (14 st):', forr.join(', '));
console.log('Vinster:', vinster.join(', '), '=> summa', vinster.reduce((a, b) => a + b, 0).toFixed(2));
console.log('Forluster:', forluster.join(', '), '=> summa', forluster.reduce((a, b) => a + b, 0).toFixed(2));
console.log('U =', U.toFixed(4), ' D =', D.toFixed(4));
console.log('RS =', RS.toFixed(4), ' RSI =', RSI.toFixed(1));
// kontroll: Wilder-utjämning fran dag 15 kraver langre serie; har ar det SMA(Cutler)-varianten = "for hand"
const wilder = () => { let u = U, d = D; return { u: u.toFixed(4), d: d.toFixed(4) }; };
console.log('Not: SMA-variant (Cutler) =for-hand-metoden;', wilder());
