// r312-karta: ALLA <Link ... href="/tung-rutt"> i src — med prefetch-status
import fs from 'node:fs';
import path from 'node:path';

const TUNGA = [
  'superanalys', 'konfluens', 'kalkylator', 'netnet', 'portfoljbyggare',
  'vagfundament', 'topplista', 'rapportbyggare', 'akm2', 'portfolj-forskning',
  'forskningsbiblioteket', 'rapportakademin', 'pro', 'dagens-pass',
];

function vandra(dir, filer = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) vandra(p, filer);
    else if (/\.(tsx|ts)$/.test(f)) filer.push(p);
  }
  return filer;
}

const rader = [];
for (const fil of vandra('src')) {
  const txt = fs.readFileSync(fil, 'utf8').split('\n');
  for (let i = 0; i < txt.length; i++) {
    const rad = txt[i];
    // <Link-block som sträcker sig över rader: hitta href + närmaste prefetch
    if (/<Link\s/.test(rad)) {
      const block = txt.slice(i, Math.min(i + 8, txt.length)).join('\n');
      const href = block.match(/href=["'`]{1}([^"'`]+)["'`]{1}/);
      if (!href) continue;
      const sokVag = href[1].replace(/^\$\{[^}]*\}/, '').replace(/[`}]/g, '');
      const arTung = TUNGA.some((t) => new RegExp(`(^|/)${t}(/|$)`).test(sokVag));
      if (!arTung) continue;
      const harPrefetch = /prefetch=\{/.test(block);
      rader.push({ fil, rad: i + 1, lank: href[1], prefetch: harPrefetch, dorren: /door|portal/.test(sokVag) });
    }
  }
}

const utan = rader.filter((r) => !r.prefetch);
const med = rader.filter((r) => r.prefetch);
console.log(`TOTALT tunga Link-block: ${rader.length} · utan prefetch: ${utan.length} · med prefetch: ${med.length}\n`);
console.log('=== UTAN prefetch (kureringskandidater) ===');
for (const r of utan) console.log(`${r.fil}:${r.rad}  ${r.lank}`);
console.log('\n=== MED prefetch (redan kurerade) ===');
for (const r of med) console.log(`${r.fil}:${r.rad}  ${r.lank}`);
