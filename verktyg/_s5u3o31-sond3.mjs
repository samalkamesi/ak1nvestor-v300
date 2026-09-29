#!/usr/bin/env node
// _s5u3o31-sond3.mjs — sond 3: avgör tredje kursen mellan rp-08/bk-09/vm-12.
import { readFileSync } from 'node:fs';
const reg = JSON.parse(readFileSync('/home/ak1a/AK1/public/deep-courses.json', 'utf8'));
const slugs = Object.keys(reg);
function textOf(k) { const o = []; (function w(v){ if(typeof v==='string') o.push(v); else if(Array.isArray(v)) v.forEach(w); else if(v&&typeof v==='object') Object.values(v).forEach(w); })(k); return o.join('\n'); }
const corpus = new Map();
for (const s of slugs) corpus.set(s, textOf(reg[s]).toLowerCase());
const owners = t => { t=t.toLowerCase(); const h=[]; for (const [s,x] of corpus) if (x.includes(t)) h.push(s); return h; };
for (const t of ['funktionell valuta','valutareserv','greenblatt','earnings yield','magic formula','riskbidrag','marginell risk','korrelationsmatris','korrelationsstress','flykt till kvalitet','diversifieringens gräns','volatilitetsbudget']) {
  const h = owners(t);
  const kurser = h.filter(s => !/^[a-z]{2,4}-?\d/.test(s) === false); // behåll alla, visa först kurser
  console.log(`«${t}» — ${h.length}${h.length ? ': ' + h.slice(0,10).join(', ') + (h.length>10?' …':'') : '  <<VIT FLÄCK>>'}`);
}
