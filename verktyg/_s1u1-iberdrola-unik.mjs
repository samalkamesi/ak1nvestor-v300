// Temporär unikhetskontroll för diff-from-strängar (ingår sedan i paket-skriptet)
import fs from 'node:fs';
const U = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-iberdrola-q3-2026.json', 'utf8'));
const b = U.body;
const kandidater = [
  ['F1a', '13 läspaket över fyra dagar'],
  ['F1b', 'SKF, Handelsbanken och Iberdrola den 21:a'],
  ['F2-v1', 'ta P/B 2,54, dividera med ROE 0,1002'],
  ['F2-v2', 'Källans eget P/E-tal är 24,8.'],
  ['F2-v3', 'Omvänt: 24,8 multiplicerat med 0,1002'],
  ['F2-v4', 'P/E-fältet 24,8 multiplicerat med årsresultatet 6 285'],
  ['F2-v5', 'FCF-marginalen 5,8 procent gånger intäkterna'],
  ['F2-v6', 'P/E 24,8 delat med 1,0705'],
  ['F2-k1', '2,54 ÷ 0,1002 = 25,31 mot källans P/E 24,8; differens 1,9 procent; omvänt 24,8 × 0,1002 = 2,49'],
  ['F2-k2', 'Absolutkontroll: 24,8 × 6 285 M€'],
  ['F2-k3', 'implicit tillväxt ur fältet 24,8 ÷ 3,02 = 8,23 procent'],
  ['F2-k4', 'FCF-kontroll: 5,8 % × 45 547'],
  ['F2-k5', 'EK 131,0 ÷ 2,54 = 51,6'],
  ['F2-b-ev', 'börsvärdet 131,0 delat med P/B 2,54'],
  ['F3', 'inte en handssignal'],
  ['F5', 'Strax över branschmedianen 2,27 (11 procent)'],
  ['F6', 'energigrenens spann är universumets bredaste'],
  ['F2-v7', 'blir **23,21**'],
  ['F1a-alt', '13 läspaket'],
];
for (const [id, s] of kandidater) {
  const n = b.split(s).length - 1;
  const flag = n === 1 ? 'UNIK ' : n === 0 ? 'SAKNAS' : 'DUBBEL(' + n + ')';
  console.log(flag.padEnd(10), id, JSON.stringify(s.slice(0, 75)));
}
