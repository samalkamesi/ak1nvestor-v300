// diagnos: varumärkeslistans innehåll + talmarkörs-diff för v01
import { readFileSync } from 'node:fs';
const vm = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/varumarke.json', 'utf8'));
const ut = [];
(function samla(x) { if (typeof x === 'string') ut.push(x); else if (Array.isArray(x)) x.forEach(samla); else if (x && typeof x === 'object') Object.values(x).forEach(samla); })(vm);
console.log('varumarke.json poster:', ut.length);
console.log(ut.slice(0, 60).join(' | '));
console.log('innehåller "tröskel"?', ut.some(x => x.toLowerCase().includes('tröskel')), '· "Tröskel"?', ut.filter(x => x.toLowerCase().includes('tröskel')).join(','));

// talmarkörsdiff
const txt = readFileSync('/home/ak1a/agent/ak1/data/kurser/fas2-djup/indikatorer-01-10.md', 'utf8');
const sektion = txt.slice(txt.indexOf('## V01 —'), txt.indexOf('\n## V02'));
const d = sektion.slice(sektion.indexOf('### d)'), sektion.indexOf('### e)'));
const f = sektion.slice(sektion.indexOf('### f)'));
function tal(text) {
  const rå = text.match(/\d[\d\s\u00a0]*[.,]?\d*/g) || [];
  return [...new Set(rå.map(t => t.replace(/[\s\u00a0]/g, '').replace(',', '.')).filter(t => t.length))];
}
const källa = tal(d + ' ' + f).filter(t => parseFloat(t) >= 2 || t.includes('.'));
const frag = JSON.parse(readFileSync('/home/ak1a/agent/ak1/data/forskning/KURS-FAS2/v167-fragment/v01-forsaljningstillvaxt.json', 'utf8'));
const mål = tal([frag.kapitel.blocks[0].content, frag.kapitel.blocks[2].content].join(' '));
const miss = källa.filter(t => !mål.includes(t));
console.log('källantal:', källa.length, '· träff:', källa.length - miss.length, '· missade:', JSON.stringify(miss));
