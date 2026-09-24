// Kartlägg data/kurser + hitta V01-V20-kurserna
import fs from 'node:fs';
import path from 'node:path';
const ws = '/home/ak1a/agent/ak1';
const p = (...a) => console.log(...a);

p('== data/kurser/ ==');
for (const f of fs.readdirSync(`${ws}/data/kurser`)) {
  const st = fs.statSync(path.join(`${ws}/data/kurser`, f));
  p(f, st.isDirectory() ? `(kat, ${fs.readdirSync(path.join(`${ws}/data/kurser`, f)).length} filer)` : `${st.size} B`);
}
p('\n== fas2-djup-innehåll ==');
p(fs.readdirSync(`${ws}/data/kurser/fas2-djup`).join(', '));
// sök V01 i data/kurser
const gran = (dir, djup = 0) => {
  if (djup > 3) return [];
  const r = [];
  for (const f of fs.readdirSync(dir)) {
    const s = path.join(dir, f);
    let st; try { st = fs.statSync(s); } catch { continue; }
    if (st.isDirectory()) r.push(...gran(s, djup + 1));
    else if (/^v\d\d-|^v\d\d\./i.test(f) || /V\d\d/.test(f)) r.push(s.replace(ws + '/', ''));
  }
  return r;
};
const vfiler = gran(`${ws}/data/kurser`);
p('\n== V##-filer i data/kurser (' + vfiler.length + ') ==');
p(vfiler.slice(0, 30).join('\n'));
