// verifiera v167-manifestet: parse, uppgiftstälning, nyckeldetaljer per prompt
import { readFileSync, readdirSync } from 'node:fs';
const ko = '/home/ak1a/agent/ak1/data/vakten/agentfabrik/ko/';
const fil = readdirSync(ko).find(f => f.startsWith('v167'));
const m = JSON.parse(readFileSync(ko + fil, 'utf8'));
console.log('fil:', fil);
console.log('id:', m.id, '· titel:', m.titel);
console.log('uppgifter:', m.uppgifter.length, '· commitPrefix:', JSON.stringify(m.commitPrefix));
const fel = [];
if (m.uppgifter.length !== 20) fel.push('uppgifter != 20');
m.uppgifter.forEach((u, i) => {
  const p = u.prompt;
  const slug = u.filer[0].replace('data/forskning/KURS-FAS2/v167-fragment/', '').replace('.json', '');
  const num = p.includes('"num": 14') ? 14 : p.includes('"num": 12') ? 12 : null;
  if (!num) fel.push(u.id + ': num saknas');
  if (u.filer.length !== 1) fel.push(u.id + ': filer != 1');
  if (!p.includes('LEVERANS:')) fel.push(u.id + ': LEVERANS-rad saknas');
  if (!p.includes('2007:528')) fel.push(u.id + ': lagrum-deklaration saknas');
  if (!p.includes('NorrTeknik AB är ett konstruerat bolag')) fel.push(u.id + ': bolag-deklaration saknas');
  if (!p.includes('ordagrant') && !p.includes('ORDAGRAT')) fel.push(u.id + ': ordagratskrav saknas');
  console.log(u.id, slug.padEnd(26), 'num:' + num, 'promptLen:' + p.length);
});
// V19-specifikt
const u19 = m.uppgifter[18];
const v19ok = u19.prompt.includes('"num": 14') && u19.filer[0].includes('v19-');
console.log('V19 num=14 kontroll:', v19ok ? 'GRÖN' : 'RÖD');
console.log(fel.length === 0 ? 'VERIFIERING GRÖN — 0 fel' : 'FEL: ' + fel.join('; '));
