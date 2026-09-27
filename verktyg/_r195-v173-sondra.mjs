#!/usr/bin/env node
// _r195-v173-sondra.mjs — dataset-spårets läge: sidor, mönster, läckagevakt, datakälla
import fs from 'node:fs';
import path from 'node:path';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. Dataset-rutter i src
const dsRot = `${ROT}/src/app/dataset`;
ut.push('=== src/app/dataset ===');
if (fs.existsSync(dsRot)) {
  const vandrа = (dir, djup) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) { if (djup < 3) vandrа(p, djup + 1); }
      else ut.push('  ' + path.relative(dsRot, p));
    }
  };
  vandrа(dsRot, 0);
} else ut.push('(finns ej)');

// 2. Dataset-datafiler
for (const kand of ['data/dataset', 'public/dataset', 'data/dataset-aspekter']) {
  const p = `${ROT}/${kand}`;
  if (fs.existsSync(p)) {
    ut.push(`\n=== ${kand} ===`);
    const lista = fs.readdirSync(p);
    ut.push(`(${lista.length} poster) ` + lista.slice(0, 30).join(' · ') + (lista.length > 30 ? ' …' : ''));
  }
}

// 3. llms.txt: dataset-rader
const llmsP = `${ROT}/public/llms.txt`;
if (fs.existsSync(llmsP)) {
  const rader = fs.readFileSync(llmsP, 'utf8').split('\n').filter((l) => /dataset/i.test(l));
  ut.push(`\n=== llms.txt: ${rader.length} dataset-rader (första 15) ===`);
  ut.push(rader.slice(0, 15).join('\n'));
  ut.push('llms.txt total längd: ' + fs.readFileSync(llmsP, 'utf8').length + ' tecken');
}

// 4. sitemap: dataset-poster
for (const s of ['public/sitemap.xml', 'src/app/sitemap.ts']) {
  const p = `${ROT}/${s}`;
  if (fs.existsSync(p)) {
    const t = fs.readFileSync(p, 'utf8');
    const träff = (t.match(/dataset/g) || []).length;
    ut.push(`\n=== ${s}: ${träff} "dataset"-träffar (första 3 rader) ===`);
    ut.push(t.split('\n').filter((l) => /dataset/i.test(l)).slice(0, 3).join('\n').slice(0, 400));
  }
}

// 5. Läckagevakten
ut.push('\n=== verktyg: läckage/filtreringsverktyg ===');
ut.push(fs.readdirSync(`${ROT}/verktyg`).filter((f) => /l[aä�]?ck|filter|sanit/i.test(f)).join(' · ') || '(inget tydligt namn)');

fs.writeFileSync('/tmp/r195-sondra.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r195-sondra.txt');
