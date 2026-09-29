#!/usr/bin/env node
// KVD för B30 rederiaktier-en (Ö29) — engelsk spegling av B30 rederiaktier.
// Kontrollklasser enligt spårets konvention (Ö21/Ö26/Ö27-mall):
// form, varumärkesgrind 26 regexer × 3 ytor, rådverb SV+EN, sökordsdisciplin,
// title/OG-längd, ord 1200–1400, korslänkar + externa URL:er MULTISET,
// H1/H2-paritet, talparitet språkmedveten multiset, aritmetik motorräknad,
// readingMinutes, disclaimer exakt sista rad, svenska läckor 0, publishedAt.
import { readFileSync } from 'node:fs';

const ROT = '/home/ak1a/AK1';
const SV = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/rederiaktier-sa-analyserar-du-rederibolag.json`, 'utf8'));
const EN = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/rederiaktier-sa-analyserar-du-rederibolag-en.json`, 'utf8'));
const VARUMARKE = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));

const resultat = [];
const kryss = (namn, ok, detalj) => { resultat.push({ namn, ok, detalj }); if (!ok) console.log(`RÖD  ${namn}: ${detalj}`); else console.log(`GRÖN ${namn}: ${detalj}`); };

// ————— 1. Form: BlogPost-fält + slug-konvention
const falt = ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'];
const saknas = falt.filter((f) => !(f in EN) || EN[f] === undefined || EN[f] === '');
kryss('form: BlogPost-fält kompletta', saknas.length === 0, saknas.length === 0 ? '9/9' : `saknas: ${saknas.join(', ')}`);
kryss('form: slug = originalets + -en', EN.slug === SV.slug + '-en', EN.slug);

// ————— 2. Varumärkesgrind: 26 regexer × 3 ytor
{
  const ytor = { title: EN.title, description: EN.description, body: EN.body };
  const fel = [], varn = [];
  for (const r of VARUMARKE.forbjudnaFraser) {
    const re = new RegExp(r.fran, 'gi');
    for (const [yta, text] of Object.entries(ytor)) {
      re.lastIndex = 0;
      const m = text.match(re);
      if (m) (r.allvar === 'FEL' ? fel : varn).push(`${r.fran} @ ${yta}: ${m[0]}`);
    }
  }
  kryss('varumärkesgrind FEL', fel.length === 0, `${fel.length} träffar${fel.length ? ' — ' + fel.join(' | ') : ''}`);
  kryss('varumärkesgrind VARN', varn.length === 0, `${varn.length} träffar${varn.length ? ' — ' + varn.join(' | ') : ''}`);
}

// ————— 3. Rådverb SV+EN (rådgivningsgrinden — juridik 2007:528)
{
  const mönster = [
    /\b(köp|sälj)\b/i, /\b(vi|jag) rekommenderar\b/i, /\bråder (vi|dig)\b/i, /\b(köp|sälj) (denna|detta)\b/i,
    /\byou should (buy|sell)\b/i, /\b(we|i) recommend\b/i, /\brecommend (buying|selling)\b/i,
    /\bconsider (buying|selling)\b/i, /\b(buy|sell) (this|the) stock\b/i, /\binvest in this\b/i, /\bgo (long|short)\b/i,
  ];
  const träffar = [];
  for (const [yta, text] of Object.entries({ title: EN.title, description: EN.description, body: EN.body }))
    for (const re of mönster) { const m = text.match(re); if (m) träffar.push(`${re.source} @ ${yta}`); }
  kryss('rådverb SV+EN', träffar.length === 0, `${träffar.length} träffar${träffar.length ? ' — ' + träffar.join(' | ') : ''}`);
}

// ————— 4. Sökordsdisciplin: "shipping stocks" i title + ingress + ≥2 H2
const h2 = EN.body.split('\n').filter((r) => r.startsWith('## '));
const ingress = EN.body.split('\n\n')[1] || '';
const sokH2 = h2.filter((r) => /shipping stocks/i.test(r)).length;
kryss('sökord i title (först)', /^shipping stocks/i.test(EN.title), EN.title);
kryss('sökord i ingress', /shipping stocks/i.test(ingress), 'ingressraden');
kryss('sökord i ≥2 H2', sokH2 >= 2, `${sokH2} av ${h2.length} H2`);

// ————— 5. Längder
kryss('title ≤ 60 tkn', EN.title.length <= 60, `${EN.title.length}/60`);
kryss('description ≤ 155 tkn', EN.description.length <= 155, `${EN.description.length}/155`);

// ————— 6. Ord 1200–1400
const ord = EN.body.split(/\s+/).filter(Boolean).length;
kryss('ord 1200–1400', ord >= 1200 && ord <= 1400, `${ord} ord`);

// ————— 7. Korslänkar MULTISET-identiska med originalet
const lankar = (t) => (t.match(/\]\((\/[^)]+)\)/g) || []).map((m) => m.slice(2, -1)).sort();
const svL = lankar(SV.body), enL = lankar(EN.body);
kryss('korslänkar MULTISET', JSON.stringify(svL) === JSON.stringify(enL), `${enL.length} mot originalets ${svL.length}${JSON.stringify(svL) === JSON.stringify(enL) ? '' : ' — diff: ' + JSON.stringify([svL.filter((x) => !enL.includes(x)), enL.filter((x) => !svL.includes(x))])}`);

// ————— 8. Externa URL:er MULTISET-identiska
const externa = (t) => (t.match(/https?:\/\/[^)\s]+/g) || []).sort();
const svE = externa(SV.body), enE = externa(EN.body);
kryss('externa URL:er MULTISET', JSON.stringify(svE) === JSON.stringify(enE), `${enE.length} mot originalets ${svE.length}`);

// ————— 9. H1/H2-paritet
const h1 = (t) => (t.match(/^# /gm) || []).length, h2n = (t) => (t.match(/^## /gm) || []).length;
kryss('H2-paritet', h2n(EN.body) === h2n(SV.body), `${h2n(EN.body)} = ${h2n(SV.body)}`);
kryss('H1-paritet', h1(EN.body) === h1(SV.body), `${h1(EN.body)} = ${h1(SV.body)}`);

// ————— 10. Talparitet: språkmedveten numerisk multiset
// SV: mellanslagstusental + decimalkomma. EN: komma-tusental (exakta 3-siffriga grupper) + decimalpunkt.
function talToken(text) {
  const ut = [];
  for (let rå of text.match(/\d[\d.,\u00A0 ]*/g) || []) {
    rå = rå.trim();
    // Separator = komma + faktiskt mellanslag (listor: "17,568, 12,315" — AR16-klassen).
    // Komma UTAN mellanslag är tusental (EN) eller decimal (SV) och ska ALDRIG splittras.
    for (let bit of rå.split(/, (?=\d)/)) {
      bit = bit.replace(/[\u00A0 ]/g, '').replace(/−/g, '-').replace(/[.,]+$/, '');
      if (!/\d/.test(bit)) continue;
      if (bit.includes(',')) {
        // SV: komma = decimal. EN: komma med exakta tresiffriga grupper = tusental.
        // Första gruppen får inte börja med 0 — "0,056" är SV-decimal, aldrig EN-tusental.
        const enTusental = /^[1-9]\d{0,2}(,\d{3})+$/.test(bit);
        bit = enTusental ? bit.replace(/,/g, '') : bit.replace(',', '.');
      }
      ut.push(bit);
    }
  }
  return ut.sort();
}
const svT = talToken(SV.body), enT = talToken(EN.body);
const endastSv = svT.filter((t) => !enT.includes(t)), endastEn = enT.filter((t) => !svT.includes(t));
kryss('talparitet multiset', svT.length === enT.length && endastSv.length === 0 && endastEn.length === 0,
  `${enT.length} EN-tal mot ${svT.length} SV-tal${endastSv.length || endastEn.length ? ' — endast-SV: ' + JSON.stringify(endastSv) + ' endast-EN: ' + JSON.stringify(endastEn) : ''}`);

// ————— 11. Aritmetik motorräknad (tolerans 0.05 för avrundade procentsatser)
{
  const n = (x) => Math.abs(x) < 1e-9 ? 0 : x;
  const kontroller = [
    ['kvot torrbulk 2008', n(663 / 11793), 0.056, 0.001],
    ['breakeven 12k+8k+5k', 12000 + 8000 + 5000, 25000, 0],
    ['bidrag topp 80k−25k', 80000 - 25000, 55000, 0],
    ['årsbidrag 55k×300', 55000 * 300, 16500000, 0],
    ['botten 18k−25k', 18000 - 25000, -7000, 0],
    ['bottenår −7k×300', -7000 * 300, -2100000, 0],
    ['flottblödning ×10 (21 miljoner)', Math.abs(-2100000 * 10) / 1e6, 21, 0.05],
    ['mix 0.6×35k+0.4×18k', 0.6 * 35000 + 0.4 * 18000, 28200, 0],
    ['mix över noll 28.2k−25k', 28200 - 25000, 3200, 0],
    ['mixår 3.2k×300', 3200 * 300, 960000, 0],
    ['certifikatbidrag 35k−25k', 35000 - 25000, 10000, 0],
    ['hävstångskvot 35k/10k', 35000 / 10000, 3.5, 0],
    ['fallet 31.5k−25k', 31500 - 25000, 6500, 0],
    ['resultatfall −35 %', (6500 - 10000) / 10000 * 100, -35, 0.05],
    ['toppkvot 80k/55k', 80000 / 55000, 1.45, 0.01],
    ['toppfall 72k−25k', 72000 - 25000, 47000, 0],
    ['toppresultatfall −14.5 %', (47000 - 55000) / 55000 * 100, -14.5, 0.05],
    ['andrahand 110−55', 110 - 55, 55, 0],
    ['skrotgolv 15/55', 15 / 55 * 100, 27, 0.3],
    ['Maersk intäkt −37.4 %', (51065 - 81529) / 81529 * 100, -37.4, 0.05],
    ['Maersk resultat −86.9 %', (3822 - 29198) / 29198 * 100, -86.9, 0.05],
    ['2025 = 9.3 % av rekordet', 2725 / 29198 * 100, 9.3, 0.05],
    ['certifikatsandel 6/10', 6 / 10, 0.60, 0.001],
  ];
  const fel = kontroller.filter(([namn, ber, text, tol]) => Math.abs(ber - text) > tol).map(([namn, ber, text]) => `${namn}: motor ${ber} mot text ${text}`);
  kryss('aritmetik motorräknad', fel.length === 0, `${kontroller.length}/${kontroller.length}${fel.length ? ' — ' + fel.join(' | ') : ''}`);
}

// ————— 12. readingMinutes = round(ord/600)
kryss('readingMinutes', EN.readingMinutes === Math.round(ord / 600), `${EN.readingMinutes} = round(${ord}/600)`);

// ————— 13. Disclaimer exakt sista rad
const sista = EN.body.split('\n').filter((r) => r.trim() !== '').pop().trim();
kryss(' disclaimer exakt sista rad', sista === '_This is educational financial analysis, not investment advice._', sista);

// ————— 14. Svenska läckor 0 (ordtoken mot SV-stoppord; URL:ar + egennamn bär ingen kollision)
{
  const stopp = new Set(['och', 'att', 'det', 'är', 'den', 'dem', 'som', 'med', 'för', 'till', 'från', 'inte', 'på', 'av', 'vid', 'över', 'under', 'men', 'eller', 'när', 'där', 'hur', 'kan', 'ska', 'vilka', 'var', 'har', 'hade', 'blir', 'blev', 'år', 'året', 'dag', 'dagar', 'procent', 'miljoner', 'tusen', 'mot', 'efter', 'före', 'mellan', 'inom', 'upp', 'ner', 'ut', 'igen', 'också', 'även', 'bär', 'ger']);
  const rens = EN.body.replace(/https?:\/\/[^)\s]+/g, ' ').replace(/\]\([^)]*\)/g, ')');
  const läckor = [...new Set((rens.match(/[A-Za-zÀ-ÿ]+/g) || []).map((w) => w.toLowerCase()).filter((w) => stopp.has(w)))];
  kryss('svenska läckor', läckor.length === 0, läckor.length ? 'träffar: ' + läckor.join(', ') : '0');
}

// ————— 15. publishedAt = leveransdagen
kryss('publishedAt = leveransdag', EN.publishedAt === '2026-09-29', EN.publishedAt);

// ————— Sammanfattning
const röda = resultat.filter((r) => !r.ok);
console.log(`\nKVD B30-en: ${resultat.length - röda.length}/${resultat.length} GRÖNA${röda.length ? ' — RÖDA: ' + röda.map((r) => r.namn).join(' | ') : ' — ALLT GRÖNT'}`);
process.exit(röda.length ? 1 : 0);
