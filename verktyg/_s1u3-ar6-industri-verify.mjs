// Sond s1-u3 (auto-s1-1789902316443) — AR6 industriaktier-ar mot B6-originalet
// 13 klasser enligt rond 99 (ar-spegling-ar1-ar5-KONTROLL) + B6-fynduppföljning + 911.
// Läser ENDAST — skriver inga utkast. Utdata: JSON-dom på stdout.
import fs from 'node:fs';

const las = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const sv = las('data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag.json');
const ar = las('data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag-ar.json');
const en = las('data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag-en.json');

const r = [];
const K = (id, pass, not) => r.push({ id, dom: pass ? 'GRÖN' : (pass === false ? 'RÖD' : 'NOT'), not: not || '' });

// A. Metadata
K('A1 slug', ar.slug === sv.slug + '-ar', `${ar.slug}`);
const faltSV = Object.keys(sv).sort().join(','), faltAR = Object.keys(ar).sort().join(',');
K('A2 BlogPost-form', faltAR === faltSV, `fält: ${faltAR}`);
K('A3 pillar/author', ar.pillar === 'Institutionell metodik' && ar.author === 'AK1A Research Lab', `${ar.pillar} / ${ar.author}`);
K('A4 publishedAt AR-konvention', ar.publishedAt === '2026-09-19', `${ar.publishedAt} (AR1–AR5 = 2026-09-19; originalet ${sv.publishedAt})`);
K('A5 title ≤60', ar.title.length <= 60, `${ar.title.length}/60`);
K('A6 OG-desc ≤155', ar.description.length <= 155, `${ar.description.length}/155`);
K('A7 tags', Array.isArray(ar.tags) && ar.tags.length === sv.tags.length, `${ar.tags.length} taggar (orig ${sv.tags.length})`);

// B. Kropp
const ord = t => (t.trim().split(/\s+/)).filter(w => /[\p{L}\p{N}]/u.test(w));
const arBodyOrd = ord(ar.body).length;
const arAllt = ord(ar.title + ' ' + ar.description + ' ' + ar.body).length;
const svAllt = ord(sv.title + ' ' + sv.description + ' ' + sv.body).length;
K('B1 ordantal', arAllt >= 1000 && arAllt <= 1600, `AR ${arAllt} ord (title+desc+body; body ${arBodyOrd}) mot SV ${svAllt}`);
const rmCalc = Math.round(arAllt / 600);
K('B2 rm = round(ord/600)', ar.readingMinutes === rmCalc, `rm ${ar.readingMinutes} mot beräknat ${rmCalc} (${arAllt}/600)`);
const h2 = t => (t.match(/^## /gm) || []).length;
K('B3 H2-paritet', h2(ar.body) === h2(sv.body), `AR ${h2(ar.body)} = SV ${h2(sv.body)}`);
const sistaRad = t => t.trimEnd().split('\n').pop().trim();
const arSista = sistaRad(ar.body);
K('B4 disclaimer exakt sist', /هذا تحليل مالي تعليمي، وليس نصيحة استثمارية/.test(arSista) && arSista.startsWith('_') && arSista.endsWith('_'), `sista rad: ${arSista}`);
// svenska läckor efter URL/markerings-strip
const stripad = ar.body.replace(/\([^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/[_*[\]]/g, ' ');
const lakor = (stripad.match(/[åäöÅÄÖ]/g) || []).length;
K('B5 svenska läckor 0', lakor === 0, `${lakor} å/ä/ö-träffar utanför URL:er`);
// rådgivningsmönster AR utanför disclaimer-raden
const arUtanDisclaimer = ar.body.slice(0, ar.body.lastIndexOf('_هذا تحليل'));
const radM = ['اشترِ', 'بِعْ', 'أنصحك', 'نوصي بشراء', 'استثمر في هذا', 'توصية بالشراء', 'توصية بالبيع', 'ننصحك'];
const radTr = radM.filter(m => arUtanDisclaimer.includes(m));
K('B6 rådgivningsmönster AR 0', radTr.length === 0, radTr.length ? `träff: ${radTr.join(',')}` : '0 på 8 mönster utanför disclaimern');
K('B7 utbildningsfras bärande', ar.body.includes('تعليم في المنهجية، لا إرشاداً بشأن أسهم بعينها'), 'ingressformeln (= SV "utbildning i metod, aldrig råd om enskilda aktier")');

// C. Länkar
const lankar = t => [...t.matchAll(/\]\((\/[^)\s]+)\)/g)].map(m => m[1]);
const ms = a => [...a].sort().join('|');
const li = lankar(sv.body), la = lankar(ar.body);
K('C1 interna multiset', ms(li) === ms(la), `AR ${la.length} = SV ${li.length} förekomster; diff: ${ms(li) === ms(la) ? 'none' : [...new Set([...li.filter(x => !la.includes(x)), ...la.filter(x => !li.includes(x))])].join(',') || 'endast antal'}`);
const ext = t => [...t.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map(m => m[1]);
const es = ext(sv.body), ea = ext(ar.body);
K('C2 externa URL:er', ms(es) === ms(ea), `AR ${ea.length} = SV ${es.length}; AR-uppsättning: ${ea.join(' · ')}`);
const dodSandvikAR = ar.body.includes('home.sandvik.com');
const dodSandvikSV = sv.body.includes('home.sandvik.com');
const rattadEN = en.body.includes('](https://www.sandvik.com/en/investors)');
K('C3 B2-uppföljning Sandvik', !dodSandvikAR, `AR bär ${dodSandvikAR ? 'DÖDA home.sandvik.com (fynd B2-AR)' : 'rättad länk'}; SV bär fortfarande ${dodSandvikSV ? 'den döda länken' : 'rättad'}; EN ${rattadEN ? 'rättad (Ö6)' : 'orättad'} — u1:s B2-diff 09-17`); // RÖD = fynd att rätta

// D. Siffror (decimalnormalisering SV komma → punkt)
const siffror = t => {
  const n = t.replace(/(\d),(\d)/g, '$1.$2');
  return (n.match(/\d+(?:\.\d+)?/g) || []);
};
const frek = a => { const f = {}; for (const x of a) f[x] = (f[x] || 0) + 1; return f; };
const fs2 = frek(siffror(sv.body)), fa = frek(siffror(ar.body));
const baraSV = [], baraAR = [];
for (const k of new Set([...Object.keys(fs2), ...Object.keys(fa)])) {
  const d = (fa[k] || 0) - (fs2[k] || 0);
  if (d > 0) baraAR.push(`${k}×${d}`);
  if (d < 0) baraSV.push(`${k}×${-d}`);
}
const totSV = siffror(sv.body).length, totAR = siffror(ar.body).length;
K('D1 sifferparitet', baraSV.length === 0 && baraAR.length === 0, `SV ${totSV} token · AR ${totAR} token · SV-övervikt: [${baraSV.join(', ')}] · AR-övervikt: [${baraAR.join(', ')}]`);
const eko = [['1.1', 'book-to-bill'], ['1.5', 'toppvinst mdr'], ['8.5', 'bottenvolym'], ['0.7', 'bottenvinst mdr'], ['240', 'P/E-topp kurs'], ['12', 'EPS topp'], ['20', 'P/E topp'], ['180', 'P/E-botten kurs'], ['30', 'P/E botten'], ['28', 'median P/E'], ['20.2', 'universum P/E'], ['16.9', 'EBIT %'], ['10.8', 'FCF %'], ['8.4', 'tillväxt %'], ['18.2', 'kvartil låg'], ['35.8', 'kvartil hög'], ['4.9', 'P/B'], ['40', 'eftermarknad %'], ['2026', 'rådata-år'], ['15', 'datum/rådata']];
const saknade = eko.filter(([t]) => !siffror(ar.body).includes(t)).map(([, n]) => `${n} (${t})`); // eslint fix nedan
K('D2 nyckeltal-echon', saknade.length === 0, saknade.length ? `saknas i AR: ${saknade.join(', ')}` : ` samtliga ${eko.length} nyckeltalsbärare närvarande i AR`);
K('D3 911-referenser', !/(911|11 سبتمبر|سبتمبر 2001|9\/11|إرهاب)/.test(ar.title + ar.description + ar.body), '0 träffar (911 · 11 september · september 2001 · 9/11 · terror-mönster, arabiska+västerländska)');

// E. B6-fyndens AR-status
K('E1 B1 (rm) i AR', ar.readingMinutes === 2, `AR rm ${ar.readingMinutes} — u1:s B1-rättning var 3→2; SV-filen bär fortfarande ${sv.readingMinutes}`);
K('E2 C1 (mätperiod) i AR', ar.body.includes('رول') || ar.body.includes('اثني عشر شهرا') ? true : false, ar.body.includes('رول') || ar.body.includes('اثني عشر شهرا') ? 'mätperiod angiven' : 'saknar mätperiod på tillväxttalet (samma som SV-C1 — förslag)');
K('E3 C2 publishedAt', true, `AR ${ar.publishedAt} = AR-familjekonvention; exportvägen stämplar publiceringsdagen (R2)`);

// F. Källnot (dagens vintage = drift, ej byggtid)
let not = '';
try {
  const uni = las('data/portfolj-system/bolagsunivers.json');
  const ind = uni.filter(b => b.bransch === 'industri');
  const pe = ind.map(b => b.vardering?.pe).filter(x => typeof x === 'number' && x > 0).sort((a, b) => a - b);
  const med = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
  not = `dagens fil ${uni.length} poster, industri n=${ind.length}, P/E-median ${med(pe).toFixed(1)} (värdet i texten 28 är vinutexakt för 09-15 enligt u1:s B6-grundning git 0e399f13; median-drift = fabriksägarens flagga)`;
} catch (e) { not = 'källfil ej läsbar: ' + e.message; }
K('F1 källnot', true, not);

const rod = r.filter(x => x.dom === 'RÖD');
console.log(JSON.stringify({ sond: 'verktyg/_s1u3-ar6-industri-verify.mjs', objekt: ar.slug, kontroller: r.length, grona: r.filter(x => x.dom === 'GRÖN').length, roda: rod.length, not: r.filter(x => x.dom === 'NOT').length, resultat: r }, null, 1));
process.exit(0);
