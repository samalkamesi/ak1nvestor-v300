#!/usr/bin/env node
// _s1u2-varenergi-paket.mjs — genererar FLYTTKLART-PAKET ur utkastet + diffen (fabege-mönstret):
// EXAKT-EN-TRÄFF-assert per sats, efterverifiering, utkastet självt ORÖRT.
import fs from 'node:fs';
import crypto from 'node:crypto';

const ROT = '/home/ak1a/AK1';
const UT = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-var-energi-q3-2026.json`;
const DIFF = `${ROT}/data/blogg-utkast/granskning/sa-laser-du-var-energi-q3-2026-diff-2026-09-30-s1u2.json`;
const PAKET = `${ROT}/data/blogg-utkast/granskning/sa-laser-du-var-energi-q3-2026-FLYTTKLART-PAKET-2026-09-30-s1u2.json`;

const utkastRaw = fs.readFileSync(UT, 'utf8');
const md5 = s => crypto.createHash('md5').update(s).digest('hex');
const utkastMd5 = md5(utkastRaw);
const diff = JSON.parse(fs.readFileSync(DIFF, 'utf8'));

// 1) Applicera alla satser med EXAKT-EN-TRÄFF-assert
let ny = utkastRaw;
for (const s of diff.satser) {
  const n = ny.split(s.from).length - 1;
  if (n !== 1) { console.error(`AVBRYTER: ${s.id} gav ${n} träffar (väntat 1)`); process.exit(1); }
  ny = ny.replace(s.from, s.to);
  console.log(`VERKSTÄLLD ${s.id} (${s.klass})`);
}

// 2) Efterverifiering
const paketObj = JSON.parse(ny); // giltig JSON?
const fel = [];
for (const s of diff.satser) {
  if (ny.includes(s.from)) fel.push(`${s.id}: gamla strängen kvar`);
  if (!ny.includes(s.to)) fel.push(`${s.id}: nya strängen saknas`);
}
const tl = [...paketObj.title].length;
if (tl > 314) fel.push(`title fortfarande ${tl} tkn > 314`);
if (md5(fs.readFileSync(UT, 'utf8')) !== utkastMd5) fel.push('UTKASTET RÖRD under körningen');
if (fel.length) { console.error('EFTERVERIFIERING FEL:\n' + fel.join('\n')); process.exit(1); }

// 3) Skriv paketet (utkastet + granskningsmetadata)
const paket = {
  ...paketObj,
  _flyttklart: {
    objekt: diff.objekt,
    granskare: 's1-u2 manifest auto-s1-1790796926223',
    datum: '2026-09-30',
    dom: 'GRÖN EFTER DIFF — FLYTTKLART (publicering = kundens beslut, R2)',
    byggvintage: diff.byggvintage,
    utkastMd5Fore: utkastMd5,
    satserVerkställda: diff.satser.map(s => s.id),
    titellangdEfter: tl,
    sond: 'verktyg/_s1u2-varenergi-q3-kontroll.mjs (165 OK · 4 FEL · 3 NOT på utkastet; FEL:en = diffens satser)',
    efterverifiering: `gamla felsträngar 0 träffar · ${diff.satser.length} satser på plats · JSON giltig · title ${tl} ≤ 314 · utkastet orört (md5 ${utkastMd5})`,
    kontroll: 'granskning/sa-laser-du-var-energi-q3-2026-KONTROLL-2026-09-30-s1u2.md',
    diff: 'granskning/sa-laser-du-var-energi-q3-2026-diff-2026-09-30-s1u2.json',
  },
};
fs.writeFileSync(PAKET, JSON.stringify(paket, null, 2) + '\n');
console.log(`PAKET skrivet: ${PAKET}`);
console.log(`title efter D6: ${tl} tkn · utkast-md5 oförändrad: ${utkastMd5 === md5(fs.readFileSync(UT, 'utf8'))}`);
