// Hitta indikatorunderlagen + variabelkursernas hem
import fs from 'node:fs';
import path from 'node:path';
const ws = '/home/ak1a/agent/ak1';
const p = (...a) => console.log(...a);

// 1. find efter indikatorer-filer i data/
const gran = (dir, djup = 0) => {
  if (djup > 3) return;
  for (const f of fs.readdirSync(dir)) {
    const s = path.join(dir, f);
    let st; try { st = fs.statSync(s); } catch { continue; }
    if (st.isDirectory() && !/node_modules|\.next|\.git/.test(f)) gran(s, djup + 1);
    else if (/indikator/i.test(f)) p('INDIKATORFIL:', s.replace(ws + '/', ''));
  }
};
gran(`${ws}/data`);

// 2. variabelkurser: sök bokmaster-JSON:er med "variabel"-kategori eller v01-v20 i titel
const BM = `${ws}/data/bokmaster`;
let traff = [];
for (const f of fs.readdirSync(BM)) {
  if (!f.endsWith('.json')) continue;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(BM, f), 'utf8'));
    const t = (j.title || '') + ' ' + (j.category || '') + ' ' + (j.slug || '');
    if (/variabel|V0?\d\b|AKM/i.test(t) && /variabel/i.test(t)) traff.push(`${f} | ${j.title} | ${j.category}`);
  } catch {}
}
p('\nVARIABELKURSER (' + traff.length + '):');
p(traff.slice(0, 25).join('\n'));
