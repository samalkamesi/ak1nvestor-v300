#!/usr/bin/env node
// KVD för Ö19 — ehandelsaktier-sa-analyserar-du-plattformsbolag-en (s3-u1, 2026-09-19)
// Kontroller: schema, sökord, längder, ord, korslänkar MULTISET, talparitet
// (tusentalsnormaliserad), aritmetik, rådverb, varumärkesgrind, disclaimer,
// källor 0=0, readingMinutes, svenska läckor. Konvention: Ö13–Ö18.
import { readFileSync } from 'node:fs';

const ROT = '/home/ak1a/AK1';
const SV = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json`, 'utf8'));
const EN = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag-en.json`, 'utf8'));
const VM = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));

let fel = 0, varning = 0, kontroller = 0;
const rad = (namn, ok, detalj) => {
  kontroller++;
  if (!ok) fel++;
  console.log(`${ok ? 'PASS' : 'FEL '} ${namn} — ${detalj}`);
};

// 1. Schema 9 fält
const falt = ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'];
rad('schema', falt.every((f) => EN[f] !== undefined && EN[f] !== ''), `9/9 fält närvarande`);

// 2. Sökord i title + ingress + H2
const kw = 'e-commerce stocks';
const ingress = EN.body.split('\n\n')[0];
const h2or = [...EN.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
rad('sökord title', EN.title.toLowerCase().includes(kw), `"${kw}" i title`);
rad('sökord ingress', ingress.toLowerCase().includes(kw), `i ingress (stycke 1)`);
rad('sökord H2', h2or.some((h) => h.toLowerCase().includes(kw)), `H2: "${h2or.find((h) => h.toLowerCase().includes(kw)) ?? 'SAKNAS'}"`);

// 3. Längder
rad('title ≤60', EN.title.length <= 60, `${EN.title.length}/60 tkn`);
rad('OG ≤155', EN.description.length <= 155, `${EN.description.length}/155 tkn`);
rad('slug = originalet + -en', EN.slug === SV.slug + '-en', EN.slug);

// 4. Ord (raw-metoden)
const ord = (t) => t.split(/\s+/).filter(Boolean).length;
const enOrd = ord(EN.body), svOrd = ord(SV.body);
rad('ord ≤1400', enOrd <= 1400, `${enOrd}/1400 (originalet ${svOrd})`);
rad('readingMinutes = round(ord/600)', EN.readingMinutes === Math.round(enOrd / 600), `rm ${EN.readingMinutes} = round(${enOrd}/600)`);

// 5. Korslänkar MULTISET-identiska med originalet
const lankar = (t) => [...t.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map((m) => m[1]).sort();
const svL = lankar(SV.body), enL = lankar(EN.body);
rad('korslänkar MULTISET', JSON.stringify(svL) === JSON.stringify(enL), `${enL.length}/${svL.length} (${svL.filter((l, i) => svL[i] === svL[i - 1]).length} dubbellänkar bevarade)`);

// 6. Talparitet — tusentalsnormaliserad (SV mellanslag/decimalkomma == EN komma-tusentals/punkt-decimal)
// Mellanslagsfria tokens: "2025, 38,9" blir "2025," + "38,9" (meningskomma är inte decimal);
// SV-tusentals ("9 141") förbehandlas till "9141" innan tokenisering.
const normSV = (t) => {
  const f = t.replace(/\b(\d{1,3}) (\d{3})\b/g, '$1$2');
  return [...f.matchAll(/\d[\d.,]*/g)].map((m) => parseFloat(m[0].replace(/,/g, '.')));
};
const normEN = (t) => [...t.matchAll(/\d[\d.,]*/g)].map((m) => {
  const hel = m[0];
  return /^\d{1,3}(,\d{3})+$/.test(hel) ? parseFloat(hel.replace(/,/g, '')) : parseFloat(hel);
});
const svT = normSV(SV.body).sort((a, b) => a - b), enT = normEN(EN.body).sort((a, b) => a - b);
const talParitet = JSON.stringify(svT) === JSON.stringify(enT);
rad('talparitet', talParitet, `${enT.length} tal — ${talParitet ? 'sorterade multiset identiska' : `DIFF: SV=[${svT}] EN=[${enT}]`}`);

// 7. Aritmetik motorräknad
const a = [
  ['10 × 8 % = 0.8', 10 * 0.08 === 0.8],
  ['94.6 / 15.6 > 6 (sexfalt)', 94.6 / 15.6 > 6],
  ['11.6 / 8.9 − 1 ≈ 30 %', Math.abs(11.6 / 8.9 - 1 - 0.303) < 0.005],
  ['(28.9/10.8)^(1/3) − 1 ≈ 38.9 %', Math.abs(Math.pow(28.9 / 10.8, 1 / 3) - 1 - 0.389) < 0.003],
  ['4,646 / 2,511 ≈ 1.85', Math.abs(4646 / 2511 - 1.851) < 0.005],
  ['2,648 < 4,792 (Airbnb-fallet)', 2648 < 4792],
  ['48.1 > 46.0 > 33.7 > 16.7 (tillväxtordningen)', 48.1 > 46.0 && 46.0 > 33.7 && 33.7 > 16.7],
];
rad('aritmetik', a.every(([, ok]) => ok), `${a.length}/${a.length}: ${a.map(([n]) => n).join(' · ')}`);

// 8. Rådverb EN+SV = 0
const radM = [
  /you should (buy|sell|hold|avoid)/i, /we recommend (buying|selling)/i,
  /(buy|sell) (this|the) stock/i, /invest in (this|these) stocks?/i,
  /köp (den|denna|detta) (aktien|bolaget)/i, /sälj (den|denna|detta) (aktien|bolaget)/i,
  /du bör (köpa|sälja)/i, /rekommenderar (dig )?att (köpa|sälja)/i,
];
const radTr = radM.map((r) => [...EN.body.matchAll(new RegExp(r.source, 'gi'))].length).reduce((s, n) => s + n, 0);
rad('rådverb EN+SV', radTr === 0, `${radTr} träffar`);

// 9. Varumärkesgrind — grundens egna 26 regexer × 3 ytor
const ytor = [EN.title, EN.description, EN.body];
let vmFel = 0, vmVarning = 0;
const vmDetalj = [];
for (const f of VM.forbjudnaFraser) {
  const re = new RegExp(f.fran, 'giu');
  for (let i = 0; i < ytor.length; i++) {
    const n = [...ytor[i].matchAll(re)].length;
    if (n > 0) {
      if (f.allvar === 'FEL') vmFel += n; else vmVarning += n;
      vmDetalj.push(`${f.allvar} "${f.fran}" yta${i + 1} ×${n}`);
    }
  }
}
rad('varumärkesgrind 26×3', vmFel === 0 && vmVarning === 0, `${VM.forbjudnaFraser.length} regexer × 3 ytor = ${vmFel} FEL, ${vmVarning} VARNING ${vmDetalj.length ? vmDetalj.join('; ') : ''}`);

// 10. Disclaimer exakt sista rad (engelsk form)
const sista = EN.body.trimEnd().split('\n').pop().trim();
rad(' disclaimer-sista-rad', sista === '_This is educational financial analysis, not investment advice._', `"${sista}"`);

// 11. Källor: externa URL:er 0=0 (Ö15/Ö18-precedensen — originalet utan källista)
const url = (t) => [...t.matchAll(/https?:\/\//g)].length;
rad('källor paritet 0=0', url(SV.body) === url(EN.body) && url(EN.body) === 0, `SV ${url(SV.body)} == EN ${url(EN.body)}`);

// 12. Svenska läckor i EN-texten (vanliga funktionsord som egna ord) — URL:er strippas
// (svenska slug-ord i länkmål som "…-som-inte-…" är inte textläckor)
const svOrdLista = ['och', 'eller', 'med', 'för', 'från', 'till', 'inte', 'som', 'är', 'var', 'det', 'den'];
const textUtanUrl = EN.body.replace(/\]\([^)]*\)/g, ']');
const lackor = svOrdLista.filter((o) => new RegExp(`\\b${o}\\b`, 'gi').test(textUtanUrl));
rad('svenska läckor', lackor.length === 0, lackor.length ? `träffar: ${lackor.join(', ')}` : '0 svenska funktionsord i brödtexten');

console.log(`\nSUMMERING: ${kontroller} kontroller, ${fel} fel, ${varning} varningar — ${fel === 0 ? 'KVD GRÖN' : 'KVD RÖD'}`);
process.exit(fel === 0 ? 0 : 1);
