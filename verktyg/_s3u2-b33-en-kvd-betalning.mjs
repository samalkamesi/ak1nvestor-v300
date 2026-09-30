#!/usr/bin/env node
// KVD för B33 betalningsaktier-en (Ö31) — engelsk spegling av B33 betalningsaktier.
// Kontrollklasser enligt spårets konvention (Ö28/Ö29/Ö30-mallen + B33:sekvensens
// strängare rådverblista och universum-råvärden i aritmetiken):
// form, varumärkesgrind 26 regexer × 3 ytor, rådverb SV+EN (B33:lista),
// sökordsdisciplin, title/OG-längd, ord 1200–1400, korslänkar + externa URL:er
// MULTISET + live-slutstatus, H1/H2-paritet, talparitet språkmedveten multiset,
// aritmetik motorräknad (originalets KVD-råvärden), readingMinutes,
// disclaimer exakt sista rad, svenska läckor 0, publishedAt = leveransdagen.
import { readFileSync } from 'node:fs';
import https from 'node:https';

const ROT = '/home/ak1a/AK1';
const SV = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/betalningsaktier-sa-analyserar-du-kortnatverken.json`, 'utf8'));
const EN = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/betalningsaktier-sa-analyserar-du-kortnatverken-en.json`, 'utf8'));
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
    const re = new RegExp(r.fran, 'giu');
    for (const [yta, text] of Object.entries(ytor)) {
      re.lastIndex = 0;
      const m = text.match(re);
      if (m) (r.allvar === 'FEL' ? fel : varn).push(`${r.fran} @ ${yta}: ${m[0]}`);
    }
  }
  kryss('varumärkesgrind FEL', fel.length === 0, `${fel.length} träffar${fel.length ? ' — ' + fel.join(' | ') : ''}`);
  kryss('varumärkesgrind VARN', varn.length === 0, `${varn.length} träffar${varn.length ? ' — ' + varn.join(' | ') : ''}`);
}

// ————— 3. Rådverb SV+EN (B33-originalets strängare lista — rådgivningsgrinden, 2007:528)
{
  const radVerb = /\b(köp|köper|köp\.|sälj|sälja|säljer|rekommendera|rekommenderar|rekommendation|buy|sell|hold)\b/gi;
  const träffar = [];
  for (const [yta, text] of Object.entries({ title: EN.title, description: EN.description, body: EN.body })) {
    const t = [...text.matchAll(radVerb)].map((m) => m[0]);
    if (t.length) träffar.push(`${t.join(', ')} @ ${yta}`);
  }
  kryss('rådverb SV+EN (B33-listan)', träffar.length === 0, `${träffar.length} ytor med träffar${träffar.length ? ' — ' + träffar.join(' | ') : ' — 0 ("buybacks" bär ordgräns ochfälldes ej, AR-klassen)'}`);
}

// ————— 4. Sökordsdisciplin: "payment stocks" i title (först) + description + H1 + ingress + ≥2 H2
const SOK = 'payment stocks';
const h1Text = (EN.body.match(/^# (.+)$/m) || [])[1] ?? '';
const h2 = EN.body.split('\n').filter((r) => r.startsWith('## '));
const ingress = EN.body.split('\n\n')[1] || '';
const sokH2 = h2.filter((r) => r.toLowerCase().includes(SOK)).length;
kryss('sökord i title (först)', EN.title.toLowerCase().startsWith(SOK), EN.title);
kryss('sökord i description', EN.description.toLowerCase().includes(SOK), 'description');
kryss('sökord i H1', h1Text.toLowerCase().includes(SOK), h1Text);
kryss('sökord i ingress', ingress.toLowerCase().includes(SOK), 'ingressraden');
kryss('sökord i ≥2 H2', sokH2 >= 2, `${sokH2} av ${h2.length} H2`);

// ————— 5. Längder
kryss('title ≤ 60 tkn', EN.title.length <= 60, `${EN.title.length}/60`);
kryss('description ≤ 155 tkn', EN.description.length <= 155, `${EN.description.length}/155`);

// ————— 6. Ord 1200–1400 (B32-metoden: markdown rensat, token med bokstav/siffra)
const ren = EN.body.replace(/^[-#>*_]+/gm, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[*_`]/g, '');
const ord = ren.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
kryss('ord 1200–1400', ord >= 1200 && ord <= 1400, `${ord} ord`);

// ————— 7. Korslänkar MULTISET-identiska med originalet + mot publicerade ytor
const lankar = (t) => (t.match(/\]\((\/[^)]+)\)/g) || []).map((m) => m.slice(2, -1)).sort();
const svL = lankar(SV.body), enL = lankar(EN.body);
kryss('korslänkar MULTISET', JSON.stringify(svL) === JSON.stringify(enL), `${enL.length} mot originalets ${svL.length}${JSON.stringify(svL) === JSON.stringify(enL) ? '' : ' — diff: ' + JSON.stringify([svL.filter((x) => !enL.includes(x)), enL.filter((x) => !svL.includes(x))])}`);
{
  const dc = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, 'utf8'));
  const kurser = (Array.isArray(dc) ? dc : (dc.courses || Object.values(dc))).map((x) => x.id ?? x.slug).filter(Boolean);
  const fs = await import('node:fs');
  const blogg = fs.readdirSync(`${ROT}/data/blogg`).filter((f) => f.endsWith('.json'))
    .flatMap((f) => { try { return [JSON.parse(fs.readFileSync(`${ROT}/data/blogg/` + f, 'utf8')).slug]; } catch { return []; } });
  const interna = enL.map((l) => l.replace('/kurser/', '').replace('/blogg/', ''));
  const döda = [...new Set(interna.filter((l) => !kurser.includes(l) && !blogg.includes(l)))];
  kryss('korslänkar mot publicerade ytor', döda.length === 0, döda.length ? `döda: ${döda.join(', ')}` : `${new Set(interna).size} unika alla publicerade`);
}

// ————— 8. Externa URL:er MULTISET-identiska + live-slutstatus (eur-lex 202 OK — B22/Ö4-precedensen)
const externa = (t) => (t.match(/https?:\/\/[^)\s]+/g) || []).sort();
const svE = externa(SV.body), enE = externa(EN.body);
kryss('externa URL:er MULTISET', JSON.stringify(svE) === JSON.stringify(enE), `${enE.length} mot originalets ${svE.length}`);
{
  const unika = [...new Set(enE)];
  const hamta = (u, hopp = 0) => new Promise((res) => {
    const req = https.get(u, { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)' }, timeout: 15000 }, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location && hopp < 5) { req.destroy(); return res(hamta(new URL(r.headers.location, u).href, hopp + 1)); }
      res(String(r.statusCode));
    });
    req.on('error', () => res('ERR')).on('timeout', () => { req.destroy(); res('TIMEOUT'); });
  });
  const status = [];
  for (const u of unika) status.push(`${await hamta(u)} ${u}`);
  const missade = status.filter((s) => !s.startsWith('200') && !(s.includes('eur-lex') && s.startsWith('202')));
  kryss('externa URL:er live', missade.length === 0, missade.length ? missade.join(' | ') : status.map((s) => s.split(' ')[0] + ' ' + s.replace(/^\d+ /, '').split('/')[2]).join(', '));
}

// ————— 9. H1/H2-paritet
const h1n = (t) => (t.match(/^# /gm) || []).length, h2n = (t) => (t.match(/^## /gm) || []).length;
kryss('H2-paritet', h2n(EN.body) === h2n(SV.body), `${h2n(EN.body)} = ${h2n(SV.body)}`);
kryss('H1-paritet', h1n(EN.body) === h1n(SV.body), `${h1n(EN.body)} = ${h1n(SV.body)}`);

// ————— 10. Talparitet: språkmedveten numerisk multiset
// SV: mellanslagstusental + decimalkomma. EN: komma-tusental (exakta 3-siffriga grupper) + decimalpunkt.
function talToken(text) {
  const ut = [];
  for (let rå of text.match(/\d[\d.,\u00A0 ]*/g) || []) {
    rå = rå.trim();
    for (let bit of rå.split(/, (?=\d)/)) {
      bit = bit.replace(/[\u00A0 ]/g, '').replace(/−/g, '-').replace(/[.,]+$/, '');
      if (!/\d/.test(bit)) continue;
      if (bit.includes(',')) {
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

// ————— 11. Aritmetik motorräknad — originalets KVD-råvärden (universumet 2026-09-28)
// tol = max(0.05, |text|·1 %) — B33-konventionen.
{
  const arit = [
    ['take rate', 1000 * 0.0025, 2.5],
    ['Visa oms endpoint %', 40000 / 29310 - 1, 0.365],
    ['Visa oms CAGR', Math.pow(40000 / 29310, 1 / 3) - 1, 0.109],
    ['MA oms endpoint %', 32791 / 22237 - 1, 0.475],
    ['MA oms CAGR', Math.pow(32791 / 22237, 1 / 3) - 1, 0.138],
    ['MA FCF CAGR', Math.pow(17159 / 10753, 1 / 3) - 1, 0.170],
    ['MA kurs/substans', 567.75 / 6.40, 88.7],
    ['ROE-kvot', 241.2 / 61.2, 3.94],
    ['MA EPS CAGR', Math.pow(16.52 / 10.22, 1 / 3) - 1, 0.174],
    ['Visa implicit EPS %', 31.98 / 25.98 - 1, 0.231],
    ['Visa litigation-gap pp', 11.7 - 2.0, 9.7],
    ['EPS−oms-skillnad pp', 17.4 - 13.8, 3.6],
  ];
  const fel = arit.filter(([namn, motor, text]) => Math.abs(motor - text) > Math.max(0.05, Math.abs(text) * 0.01)).map(([namn, motor, text]) => `${namn}: motor ${motor.toFixed(4)} mot text ${text}`);
  kryss('aritmetik motorräknad', fel.length === 0, `${arit.length}/${arit.length}${fel.length ? ' — ' + fel.join(' | ') : ''}`);
}

// ————— 12. readingMinutes = round(ord/600)
kryss('readingMinutes', EN.readingMinutes === Math.round(ord / 600), `${EN.readingMinutes} = round(${ord}/600)`);

// ————— 13. Disclaimer exakt sista rad
const sista = EN.body.split('\n').filter((r) => r.trim() !== '').pop().trim();
kryss('disclaimer exakt sista rad', sista === '_This is educational financial analysis, not investment advice._', sista);

// ————— 14. Svenska läckor 0 (ordtoken mot SV-stoppord; URL:ar + egennamn bär ingen kollision)
{
  const stopp = new Set(['och', 'att', 'det', 'är', 'den', 'dem', 'som', 'med', 'för', 'till', 'från', 'inte', 'på', 'av', 'vid', 'över', 'under', 'men', 'eller', 'när', 'där', 'hur', 'kan', 'ska', 'vilka', 'var', 'har', 'hade', 'blir', 'blev', 'år', 'året', 'dag', 'dagar', 'procent', 'miljoner', 'tusen', 'mot', 'efter', 'före', 'mellan', 'inom', 'upp', 'ner', 'ut', 'igen', 'också', 'även', 'bär', 'ger']);
  const rens = EN.body.replace(/https?:\/\/[^)\s]+/g, ' ').replace(/\]\([^)]*\)/g, ')');
  const läckor = [...new Set((rens.match(/[A-Za-zÀ-ÿ]+/g) || []).map((w) => w.toLowerCase()).filter((w) => stopp.has(w)))];
  kryss('svenska läckor', läckor.length === 0, läckor.length ? 'träffar: ' + läckor.join(', ') : '0');
}

// ————— 15. publishedAt = leveransdagen
kryss('publishedAt = leveransdag', EN.publishedAt === '2026-09-30', EN.publishedAt);

// ————— Sammanfattning
const röda = resultat.filter((r) => !r.ok);
console.log(`\nKVD B33-en: ${resultat.length - röda.length}/${resultat.length} GRÖNA${röda.length ? ' — RÖDA: ' + röda.map((r) => r.namn).join(' | ') : ' — ALLT GRÖNT'}`);
process.exit(röda.length ? 1 : 0);
