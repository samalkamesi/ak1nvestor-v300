#!/usr/bin/env node
// _s5u3o31-sond2.mjs — sond 2: tredje kurskandidaten + kategoristridning för serierna.
import { readFileSync } from 'node:fs';
const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const slugs = Object.keys(reg);
function textOf(k) { const o = []; (function w(v){ if(typeof v==='string') o.push(v); else if(Array.isArray(v)) v.forEach(w); else if(v&&typeof v==='object') Object.values(v).forEach(w); })(k); return o.join('\n'); }
const corpus = new Map();
for (const s of slugs) corpus.set(s, textOf(reg[s]).toLowerCase());
const owners = t => { t=t.toLowerCase(); const h=[]; for (const [s,x] of corpus) if (x.includes(t)) h.push(s); return h; };

console.log('== TREDJE KURSEN — kandidater ==');
for (const t of ['utdelningsstopp','utdelningsinskränkning','kapitalbuffert','penningmängd','magisk formel','vix','aktiverade utvecklingskostnader','valutadifferens','korrelationsbudget','net revenue retention','nrr','kvarhållningstal','inklusionseffekten','indexfond','övertagandeerbjudande']) {
  const h = owners(t);
  console.log(`«${t}» — ${h.length}${h.length ? ': ' + h.slice(0,8).join(', ') + (h.length>8?' …':'') : '  <<VIT FLÄCK>>'}`);
}
console.log('\n== KATEGORIER (stridning serie → kategori) ==');
for (const s of slugs) {
  if (/^(mt-0[1-9]|kt-(09|10)|rs-(08|09)|ek-0[67]|rp-0[67]|od-1[01]|ma-09|ks-09|st-08|tx-07|roic-06|ib-07|pe-08|vr-09|bk-08|ln-06|am-09)-/.test(s)) {
    console.log(s, '→', reg[s].category, '| level:', reg[s].level, '| min:', reg[s].totalMinutes, '| xp:', reg[s].xp);
  }
}
