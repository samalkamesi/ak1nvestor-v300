#!/usr/bin/env node
// KVD för AR14 flygaktier-ar (s3-u1 byggare 1/3) — AR13-kontrollklassen.
// Kontroller: schema, varumärkesgrind (26 regexer × 3 ytor), rådverb SV+EN+AR,
// sökordsdisciplin, title/OG-längd, ord, korslänkar MULTISET, externa URL:er,
// H2-paritet, talparitet FREKVENSIDENTISK (normaliserad, AR2-vitlista 1990),
// aritmetik motorräknad, readingMinutes, disclaimer exakt sista rad,
// svenska läckor 0.
import { readFileSync } from 'node:fs';

const ROTT = '/home/ak1a/AK1';
const sv = JSON.parse(readFileSync(`${ROTT}/data/blogg-utkast/flygaktier-sa-analyserar-du-flygplansindustrin.json`, 'utf8'));
const ar = JSON.parse(readFileSync(`${ROTT}/data/blogg-utkast/flygaktier-sa-analyserar-du-flygplansindustrin-ar.json`, 'utf8'));
const vm = JSON.parse(readFileSync(`${ROTT}/data/varumarke.json`, 'utf8'));

const r = [];
const kontroll = (id, ok, detalj) => r.push({ id, ok: !!ok, detalj });

// 1. Schema 9/9
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
kontroll('schema-9', falt.every(k => k in ar && ar[k] !== undefined && ar[k] !== ''), `fält ${falt.filter(k => !(k in ar)).join(',') || 'alla 9'} närvarande`);

// 2. Varumärkesgrind 26 regexer × 3 ytor
const ytor = [ar.title, ar.description, ar.body];
let vmFel = 0, vmVarn = 0; const vmDetalj = [];
for (const gr of vm.forbjudnaFraser) {
  const re = new RegExp(gr.fran, 'gi');
  ytor.forEach((yta, i) => {
    const m = yta.match(re);
    if (m) {
      if (gr.allvar === 'FEL') vmFel += m.length; else vmVarn += m.length;
      vmDetalj.push(`yta${i + 1}: /${gr.fran}/ ×${m.length}`);
    }
  });
}
kontroll('varumarke-FEL', vmFel === 0, `${vm.forbjudnaFraser.length} regexer × 3 ytor: ${vmFel} FEL ${vmDetalj.join('; ') || '(ren)'}`);
kontroll('varumarke-VARNING', vmVarn === 0, `${vmVarn} VARNING`);

// 3. Rådverb SV+EN+AR
const radSV = /(köp|sälj|investera i|rekommenderar)\s+(denna|detta|den här|den|det)\s+(aktie|bolag)|(du\s+borde|du\s+bör|du\s+ska)\s+(köpa|sälja|investera)/i;
const radEN = /(buy|sell|invest in)\s+(this|the)\s+(stock|share|company)|you should (buy|sell)/i;
const radAR = /اشترِ|بِع|استثمر في هذا|أنصحك|نوصي بشراء/;
kontroll('radverb-SV', !radSV.test(ar.body), radSV.test(ar.body) ? 'träff!' : '0 träffar');
kontroll('radverb-EN', !radEN.test(ar.body), radEN.test(ar.body) ? 'träff!' : '0 träffar');
kontroll('radverb-AR', !radAR.test(ar.body), radAR.test(ar.body) ? 'träff!' : '0 träffar');

// 4. Sökord i title + ingress + 2 H2
const sok = 'أسهم الطيران';
const ingress = ar.body.split('\n\n')[0];
const h2 = (ar.body.match(/^## .*$/gm) || []);
const h2med = h2.filter(h => h.includes(sok)).length;
kontroll('sokord-title', ar.title.includes(sok), `"${sok}" i title`);
kontroll('sokord-ingress', ingress.includes(sok), `"${sok}" i ingress`);
kontroll('sokord-H2x2', h2med >= 2, `${h2med} H2 med sökordet (krav ≥2)`);

// 5. Title ≤60, OG ≤155
kontroll('title-60', ar.title.length <= 60, `${ar.title.length}/60`);
kontroll('og-155', ar.description.length <= 155, `${ar.description.length}/155`);

// 6. Ord (body, whitespace-token)
const ord = ar.body.split(/\s+/).filter(Boolean).length;
kontroll('ord-1400', ord <= 1400, `${ord}/1400 (originalet ${sv.body.split(/\s+/).filter(Boolean).length})`);

// 7. Korslänkar MULTISET-identiska med B14
const lank = t => [...t.matchAll(/\]\((\/[^)\s]+)\)/g)].map(m => m[1]);
const lsv = lank(sv.body), lar = lank(ar.body);
const mset = a => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1); return m; };
const msv = mset(lsv), mar = mset(lar);
let lankOk = msv.size === mar.size && [...msv].every(([k, v]) => mar.get(k) === v);
kontroll('korslankar', lankOk, `${lar.length}/${lsv.length} MULTISET-identiska med B14 (dubletter: ${[...msv].filter(([,v])=>v>1).map(([k,v])=>`${k}×${v}`).join(', ') || 'none'})`);

// 8. Externa URL:er identiska
const ext = t => [...t.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map(m => m[1]);
const esv = ext(sv.body), ear = ext(ar.body);
kontroll('externa-url', JSON.stringify(esv) === JSON.stringify(ear), `${ear.length}/${esv.length} identiska (${ear.map(u => u.replace(/^https?:\/\//, '')).join(' + ')})`);

// 9. H2-paritet
const h2sv = (sv.body.match(/^## .*$/gm) || []).length;
kontroll('h2-paritet', h2.length === h2sv, `${h2.length} = ${h2sv}`);

// 10. Talparitet FREKVENSIDENTISK (normaliserad)
function normSVt(t) { let p; do { p = t; t = t.replace(/(\d)\s(\d{3})(?!\d)/g, '$1$2'); } while (t !== p); return t.replace(/(\d),(\d)/g, '$1.$2'); }
function normARt(t) { return t.replace(/(\d),(\d{3})(?!\d)/g, '$1$2'); }
const tal = t => [...t.matchAll(/\d+(?:\.\d+)?/g)].map(m => m[0]);
const tsv = tal(normSVt(sv.body)), tar = tal(normARt(ar.body));
const fsv = mset(tsv), far = mset(tar);
// AR2-precedens-vitlista: decenniet utskrivet i AR (تسعينيات القرن العشرين)
const vittradeSV = new Map([['1990', 1]]);
let disk = 0, endastSV = [], endastAR = [];
for (const [k, v] of fsv) {
  const vit = Math.min(v, vittradeSV.get(k) || 0);
  const rest = v - vit; disk += vit;
  const av = far.get(k) || 0;
  if (av !== rest) endastSV.push(`${k}: SV ${rest} (vit ${vit}) vs AR ${av}`);
}
for (const [k, v] of far) if ((fsv.get(k) || 0) - (vittradeSV.get(k) || 0) !== v) endastAR.push(`${k}: AR ${v} vs SV ${(fsv.get(k) || 0)}`);
kontroll('tal-paritet', endastSV.length === 0 && endastAR.length === 0,
  `SV ${tsv.length} tal, AR ${tar.length} tal — frekvensidentiska normaliserade; vitlistade AR2-toleranser: 1990×${disk} (decenniet utskrivet تسعينيات القرن العشرين)${endastSV.length ? ' | AVVIKELSER SV: ' + endastSV.join('; ') : ''}${endastAR.length ? ' | AVVIKELSER AR: ' + endastAR.join('; ') : ''}`);

// 11. Aritmetik motorräknad
const a = [];
a.push(['orderbok 8000÷800', 8000 / 800 === 10]);
a.push(['2023-vändningen: oms +11.4 % (65.4>58.8) med res −10.8 % (3789<4247)', 65.4 > 58.8 && 3789 < 4247]);
a.push(['2025-räntesvansen 5221/4232−1 = ' + (5221 / 4232 * 100 - 100).toFixed(1) + ' % ≈ 23.4', Math.round((5221 / 4232 * 100 - 100) * 10) / 10 === 23.4]);
a.push(['bruttokvot 31.1÷16.3 = ' + (31.1 / 16.3).toFixed(2) + ' = «قرابة الضعف» (1.5<kvot<2)', 31.1 / 16.3 > 1.5 && 31.1 / 16.3 < 2]);
a.push(['PEG 25.9÷6.5 = ' + (25.9 / 6.5).toFixed(2) + ' ≈ 4.0', Math.abs(25.9 / 6.5 - 4.0) < 0.05]);
a.push(['kassa 13.1 < skuld 14.3 med skuldsättningsgrad 0.55 närvarande', 13.1 < 14.3 && ar.body.includes('0.55')]);
a.push(['FCF-serien samtliga > 0 (3824, 3204, 3733, 4031)', [3824, 3204, 3733, 4031].every(x => x > 0)]);
kontroll('aritmetik-7', a.every(([, ok]) => ok), a.map(([n, ok]) => `${ok ? '✓' : '✗'} ${n}`).join(' · '));

// 12. readingMinutes = round(ord/600)
kontroll('readingMinutes', ar.readingMinutes === Math.round(ord / 600), `${ar.readingMinutes} = round(${ord}/600)`);

// 13. Disclaimer arabisk form exakt sista rad
const discl = '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._';
kontroll('disclaimer', ar.body.trimEnd().endsWith(discl), 'arabisk form exakt sista rad');

// 14. Svenska läckor 0 (URL-slugar strippade + vitlista enligt AR6/AR9-konventionen)
const vit = ['Airbus','Boeing','GE','Aerospace','Safran','CFM','AK1A','Yahoo','Finance','MarketStack','Stockanalysis','S&P','Global','P/E','EV/EBIT','PEG','P/B','ROIC','EBIT','FCF','EPS','book-to-bill','SE'];
let leakText = ar.body
  .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')  // hela markdown-länkar [text](url)
  .replace(/\]\([^)]*\)/g, ' ')          // kvarvarande url-parenteser
  .replace(/\[[^\]]*\]/g, ' ');          // kvarvarande hakparenteser
// SE = Airbus SE juridiskt namnsuffix — AR6-konventionen "namn översätts aldrig"
for (const v of vit) leakText = leakText.split(v).join(' ');
leakText = leakText.replace(/[0-9.,:%/+\-–—_÷()]/g, ' ');
const svOrd = new Set(['och','att','det','som','för','med','inte','är','till','på','en','ett','den','deras','kan','ska','vid','av','om','ett','per','år','mot','mellan','här']);
const latinska = leakText.match(/\b[a-zåäö]{2,}\b/gi) || [];
const lackage = latinska.filter(w => !vit.some(v => v.toLowerCase() === w.toLowerCase()));
kontroll('svenska-lackage', lackage.length === 0, `${lackage.length} icke-vitlistade latinska token ${lackage.slice(0, 10).join(', ') || '(rena)'}`);

// Rapport
const fel = r.filter(x => !x.ok);
for (const x of r) console.log(`${x.ok ? '✓ PASS' : '✗ FAIL'} ${x.id}: ${x.detalj}`);
console.log('\n' + (fel.length === 0 ? `KVD GRÖN — ${r.length}/${r.length} kontroller 0 FEL` : `KVD RÖD — ${fel.length} FEL av ${r.length}: ${fel.map(x => x.id).join(', ')}`));
process.exit(fel.length === 0 ? 0 : 1);
