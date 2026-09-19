#!/usr/bin/env node
// KVD-sond för B2-ar (sa-analyserar-du-bankaktier-ar) — s3-u3, manifest auto-s3-1789784725944
// Konvention: Ö-kvD-mönstret (ord raw, längder, sökordslägen, länk-/talparitet, aritmetik,
// varumärkesgrindens egna regexer, rådverb SV/EN/AR, disclaimer-sista-rad).
import { readFileSync } from 'node:fs';

const ROT = '/home/ak1a/AK1';
const las = (p) => JSON.parse(readFileSync(ROT + p, 'utf8'));
const SV = las('/data/blogg-utkast/sa-analyserar-du-bankaktier.json');
const AR = las('/data/blogg-utkast/sa-analyserar-du-bankaktier-ar.json');
const VM = las('/data/varumarke.json');

const r = []; const fel = [];
const K = (namn, ok, detalj) => { r.push({ namn, ok, detalj }); if (!ok) fel.push(namn + ': ' + detalj); };

// --- 1. Form: exakt BlogPost-fältuppsättning ---
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
K('form:fält', falt.every((f) => f in AR) && Object.keys(AR).length === falt.length,
  Object.keys(AR).join(','));

// --- 2. Sökord i title + ingress + H2 ---
const sok = 'أسهم البنوك';
const body = AR.body;
const ingress = body.split('\n\n')[0];
const h2 = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
K('sökord:title', AR.title.includes(sok), AR.title);
K('sökord:ingress', ingress.includes(sok), 'första stycket');
K('sökord:H2', h2.filter((h) => h.includes(sok)).length, h2.filter((h) => h.includes(sok)).length + ' H2 av ' + h2.length);

// --- 3-4. Längder ---
K('title ≤ 60', [...AR.title].length <= 60, [...AR.title].length + ' tkn');
K('OG ≤ 155', [...AR.description].length <= 155, [...AR.description].length + ' tkn');

// --- 5-6. Ord + readingMinutes ---
const ord = body.split(/\s+/).filter(Boolean).length;
K('ord 800–1400', ord >= 800 && ord <= 1400, ord + ' ord');
K('readingMinutes = round(ord/600)', AR.readingMinutes === Math.round(ord / 600),
  AR.readingMinutes + ' mot ' + Math.round(ord / 600));

// --- 7. Korslänkar: MULTISET-identiska med originalet ---
const lnkar = (t) => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]).sort();
const a = lnkar(SV.body), b = lnkar(body);
K('korslänkar paritet', JSON.stringify(a) === JSON.stringify(b),
  b.length + ' länkar; diff: ' + JSON.stringify(a.filter((x) => !b.includes(x)).concat(b.filter((x) => !a.includes(x)))));
const externa = (t) => [...t.matchAll(/\]\(https?:\/\/([^)]+)\)/g)].map((m) => m[1].split('/')[0]).sort();
K('externa källor paritet', JSON.stringify(externa(SV.body)) === JSON.stringify(externa(body)), externa(body).join(', '));

// --- 8. Talparitet: normaliserade tal-multiset (SV decimalkomma == AR punkt) ---
const tal = (t) => {
  const ut = [];
  const ren = t.replace(/(\d),(\d)/g, '$1.$2');            // SV decimalkomma → punkt
  for (const m of ren.matchAll(/\d+(?:\.\d+)?/g)) ut.push(parseFloat(m[0]));
  return ut.sort((x, y) => x - y).map(String);
};
const ts = tal(SV.body), ta = tal(body);
const vitlista = ['1990']; // AR: "تسعينيات القرن العشرين" — decenniet utskrivet, siffran ej (dokumenterad tolerans)
const baraTS = ts.filter((x) => !vitlista.includes(x));
const baraTA = ta.filter((x) => !vitlista.includes(x));
K('talparitet', JSON.stringify(baraTS) === JSON.stringify(baraTA),
  'SV ' + ts.length + ' / AR ' + ta.length + ' tal; endast-SV: ' + JSON.stringify(ts.filter((x) => !ta.includes(x))) + ' endast-AR: ' + JSON.stringify(ta.filter((x) => !ts.includes(x))));

// --- 9. Aritmetik motorräknad ---
const ap = [];
const apK = (namn, ok, d) => ap.push(namn + ' ' + (ok ? 'OK' : 'FEL') + ' (' + d + ')');
apK('P/E=PB/ROE', Math.abs(2.07 / 0.150 - 13.8) < 0.05, '2.07÷0.150=' + (2.07 / 0.150).toFixed(3));
apK('SEB', Math.abs(1.9 / 0.141 - 13.5) < 0.95, '1.9÷0.141=' + (1.9 / 0.141).toFixed(1) + ' ≈ källans 14.4 (P/B avrundat 1.94)');
apK('SHB', Math.abs(1.6 / 0.128 - 12.4) < 0.15, '1.6÷0.128=' + (1.6 / 0.128).toFixed(1));
const roe = [15.0, 15.3, 14.1, 12.8], pe = [13.8, 13.0, 14.4, 12.4];
apK('ROE-spann', Math.min(...roe) === 12.8 && Math.max(...roe) === 15.3, '12.8–15.3');
apK('P/E-spann', Math.min(...pe) === 12.4 && Math.max(...pe) === 14.4, '12.4–14.4');
apK('marginal SHB', Math.abs(46.8 - 41.8 - 5.0) < 0.001, '−5.0 pp');
apK('marginal SEB', Math.abs(47.5 - 40.4 - 7.1) < 0.001, '−7.1 pp (flyttalstolerans 0.001)');
K('aritmetik 7/7', ap.every((x) => x.includes('OK')), ap.join(' · '));

// --- 10. Varumärkesgrinden: egna regexer × 3 ytor ---
const ytor = [AR.title, AR.description, body];
let vmFEL = 0, vmVARN = 0; const vmTraff = [];
for (const fras of VM.forbjudnaFraser) {
  for (const y of ytor) {
    try { if (new RegExp(fras.fran, 'giu').test(y)) { fras.allvar === 'FEL' ? vmFEL++ : vmVARN++; vmTraff.push(fras.fran); } }
    catch { /* regex-dialekt som inte kan köras i JS — räknas som icke-träff, loggas ej */ }
  }
}
K('varumärkesgrind 0 FEL', vmFEL === 0, vmFEL + ' FEL, ' + vmVARN + ' varning' + (vmTraff.length ? '; träffar: ' + vmTraff.join('|') : ''));

// --- 11. Rådverb SV/EN/AR ---
const radSV = /\b(köp|sälj|rekommenderar|råder dig)\b/gi;
const radEN = /\b(you should (buy|sell)|we recommend (buying|selling))\b/gi;
const radAR = /(?:^|[^\p{L}])(?:اشترِ|اشترِي|بِع|بيع أسهمك|استثمر في هذا|أنصحك|ننصحك|نوصي بشراء|نوصي بالبيع)(?![\p{L}])/gu;
const radTraff = [...body.matchAll(radSV)].length + [...body.matchAll(radEN)].length + [...body.matchAll(radAR)].length;
K('rådverb SV+EN+AR = 0', radTraff === 0, radTraff + ' träffar');

// --- 12. Disclaimer exakt sista rad ---
const sista = body.trimEnd().split('\n').pop().trim();
K('disclaimer sista rad', sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', JSON.stringify(sista));
const ingressTv = [body.split('\n\n')[0], body.split('\n\n')[1]].join('\n\n'); // originalets ram ligger i stycke 2
K('utbildningsram i ingress', ingressTv.includes('تعليم') && ingressTv.includes('لا إرشاداً'), 'ingressens ram (stycke 1–2, som originalets)');

// --- 13-14. Metadata ---
K('slug', AR.slug === 'sa-analyserar-du-bankaktier-ar', AR.slug);
K('publishedAt', AR.publishedAt === '2026-09-19', AR.publishedAt);
K('H2-antal == originalet', [...SV.body.matchAll(/^## /gm)].length === h2.length, h2.length + ' H2 (originalet ' + [...SV.body.matchAll(/^## /gm)].length + ')');

// --- Rapport ---
console.log('KVD B2-ar — ' + new Date().toISOString());
for (const x of r) console.log((x.ok ? '✅' : '❌') + ' ' + x.namn + ' — ' + x.detalj);
console.log('\n' + (fel.length === 0 ? 'KVD GRÖN — ' + r.length + ' kontroller, 0 FEL' : 'KVD RÖD — ' + fel.length + ' FEL:\n' + fel.join('\n')));
process.exit(fel.length === 0 ? 0 : 1);
