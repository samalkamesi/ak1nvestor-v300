// Kandidatgallring för spår 4: universum × kalender × levererade paket
import fs from 'node:fs';
const KAT = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3';
const L = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const levererade = new Set(
  fs.readdirSync(KAT).filter(f => f.startsWith('sa-laser-du'))
    .map(f => f.replace('sa-laser-du-', '').replace('-q3-2026.json', ''))
);
const kal = {};
for (const f of fs.readdirSync(KAT).filter(f => f.startsWith('kalender-'))) {
  const d = JSON.parse(fs.readFileSync(KAT + '/' + f, 'utf8'));
  for (const b of d.bolag) kal[b.ticker] = { fenster: b.rapportfenster, bransch: d.bransch, namn: b.namn };
}
const rows = [];
for (const p of L) {
  const ser = p.serier || {};
  const nOms = (ser.omsattning || []).filter(x => x > 0).length;
  const nRes = (ser.resultat || []).filter(x => x > 0).length;
  const k = kal[p.ticker];
  if (!k) continue;
  const t = p.ticker.toLowerCase();
  const leverad = [...levererade].some(s => t.startsWith(s.split('-')[0]));
  if (leverad) continue;
  if (Math.min(nOms, nRes) >= 3) rows.push({ t: p.ticker, namn: p.namn.slice(0, 30), br: p.bransch, land: p.land, fenster: k.fenster, nOms, nRes, val: p.valuta });
}
rows.sort((a, b) => String(a.fenster).localeCompare(String(b.fenster)));
for (const r of rows)
  console.log([String(r.fenster).padEnd(30), r.t.padEnd(11), r.br.padEnd(14), r.land.padEnd(12), ('oms' + r.nOms + '/res' + r.nRes).padEnd(13), r.val, r.namn].join(' '));
console.log('ANTAL KANDIDATER:', rows.length);
