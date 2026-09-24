import fs from 'node:fs';
const f = '/home/ak1a/AK1/verktyg/_s4u3-mtg-byggdata.mjs';
let s = fs.readFileSync(f, 'utf8');
const byten = [
  // NBSP-fritt formaterande (sv-SE ger U+00A0 i tusental — Kambi-precedensen förbjuder nbsp i paket)
  ["const sv = (x, dec = 1) => x.toLocaleString('sv-SE', { minimumFractionDigits: dec, maximumFractionDigits: dec });",
   "const sv = (x, dec = 1) => x.toLocaleString('sv-SE', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/\\u00a0/g, ' ');"],
  ["const sv0 = x => x.toLocaleString('sv-SE', { maximumFractionDigits: 0 });",
   "const sv0 = x => x.toLocaleString('sv-SE', { maximumFractionDigits: 0 }).replace(/\\u00a0/g, ' ');"],
  // enhetsbugg: universumserien är i kronor (×1e6), S-värdet i Mkr
  ['H.dubbling = S.fy25.intakt / U.oms[2] - 1;',
   'H.dubbling = S.fy25.intakt / (U.oms[2] / 1e6) - 1;'],
  // ingressens mcap med full precision (paritetskonvention)
  ['${sv(U.mcap)} miljarder kronor i börsvärde', '${sv(U.mcap, 3)} miljarder kronor i börsvärde'],
  // FCF-marginal med två decimaler
  ['(fönstrets FCF-marginal ${pct(U.fcm', '(fönstrets FCF-marginal ${pct(U.fcm'],
  ['pct(U.fcm', 'pct(U.fcm'],
  // cellnetto med en decimal överallt i scenarieraden
  ['${sv0(H.scen[0].netto)} · ', '${sv(H.scen[0].netto, 1)} · '],
  ['${sv0(H.scen[1].netto)} · ', '${sv(H.scen[1].netto, 1)} · '],
  ['${sv0(H.scen[2].netto)} · ', '${sv(H.scen[2].netto, 1)} · '],
  ['${sv0(H.scen[3].netto)} · ', '${sv(H.scen[3].netto, 1)} · '],
  ['${sv0(H.scen[4].netto)} · ', '${sv(H.scen[4].netto, 1)} · '],
  ['${sv0(H.scen[5].netto)} · ', '${sv(H.scen[5].netto, 1)} · '],
  ['${sv0(H.scen[6].netto)} · ', '${sv(H.scen[6].netto, 1)} · '],
  ['${sv0(H.scen[7].netto)} · ', '${sv(H.scen[7].netto, 1)} · '],
  ['${sv0(H.scen[8].netto)} · ', '${sv(H.scen[8].netto, 1)} · '],
  // citattecken i källor → kursiv
  ['finansiella kalenderns "Q3 & 9 Months 2026 Financial Report" 2026-11-05', 'finansiella kalenderns *Q3 & 9 Months 2026 Financial Report* 2026-11-05'],
  ['**Q3 & 9 Months 2026 Financial Report står uppsatt', '**Q3 & 9M 2026 Financial Report står uppsatt'],
];
let n = 0;
for (const [g, ny] of byten) {
  if (g === ny) continue;
  if (!s.includes(g)) { console.log('SAKNAS:', g.slice(0, 60)); continue; }
  s = s.split(g).join(ny); n++;
}
fs.writeFileSync(f, s);
console.log(n, 'byten applicerade');
