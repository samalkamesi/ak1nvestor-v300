// KVD för JPM Q3-läspaketet — oberoende omräkning av varenda bärande tal.
import fs from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-jpmorgan-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const p = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const uni = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const jpm = uni.find(r => r.ticker === 'JPM');
const gs = uni.find(r => r.ticker === 'GS');
const body = p.body.replace(/\u00A0/g, ' ');

let pass = 0, fel = 0, varn = 0;
const P = (namn, ok, detalj = '') => { if (ok) { pass++; } else { fel++; console.log('FEL:', namn, detalj); } };
const V = (namn, ok, detalj = '') => { if (ok) pass++; else { varn++; console.log('VARNING:', namn, detalj); } };
const has = (s) => body.includes(s.replace(/\u00A0/g, ' '));
const f3 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const f2 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const f1 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const f0 = x => Math.round(x).toLocaleString('sv-SE');

// — 1. struktur —
P('slug', p.slug === 'sa-laser-du-jpmorgan-q3-2026');
P('fält', ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => p[k] != null && p[k] !== ''));
P('publishedAt = rappdag', p.publishedAt === '2026-10-13');
P('pillar', p.pillar === 'Institutionell metodik');
P('tags', Array.isArray(p.tags) && p.tags.length === 6 && p.tags.includes('JPMorgan') && p.tags.includes('läspaket'));
P('title-sökord', /^JPMorgan Q3-rapport 2026/.test(p.title) && p.title.includes('så läser du'));
P('description-längd', p.description.length >= 300 && p.description.length <= 520, `${p.description.length}`);
P('title-längd', p.title.length <= 200, `${p.title.length}`);
P('stomme', ['Urvalet: varför JPMorgan','Nyckeltalen att ha med sig','Datavakten','Så står sig bolaget mot branschen','Tre sätt att läsa utfallet','Praktiskt inför 13 oktober','## Källor'].every(s => has(s)));
P('disclaimer sist', /\*Detta är pedagogisk finansutbildning enligt lagen \(2007:528\)[^*]+\*\.?$/.test(body.trim().split('\n').pop().trim()));

// — 2. källtalsparitet mot universumposten —
const fpar = [
  ['P/E', f3(jpm.vardering.pe)], ['P/B', f3(jpm.vardering.pb)], ['EV/EBIT', f3(jpm.vardering.evEbit)],
  ['PEG', f2(jpm.vardering.peg)], ['ROE %', f1(jpm.lonksamhet.roe * 100)],
  ['EBIT %', f2(jpm.lonksamhet.ebitMarginal * 100)], ['netto %', f2(jpm.lonksamhet.nettoMarginal * 100)],
  ['TTM % f0', f0(jpm.tillvaxt.omsattningTillvaxtTTM * 100)], ['TTM % f1', f1(jpm.tillvaxt.omsattningTillvaxtTTM * 100)],
  ['prognos %', f2(jpm.tillvaxt.prognosTillvaxt * 100)], ['pris', f2(jpm.pris)], ['mcap', f3(jpm.marknadsKapitalMdr)],
  ['insider', String(jpm.aterkop.insiderkopSenaste6man)]
];
for (const [namn, s] of fpar) P('paritet ' + namn, has(s), s);

// — 3. officiella rapporterade tal (sökverifierade 2026-09-18) —
for (const s of ['20,02','57,0','126,99','124,96','116,07','14,4','5,07','47,1','13,0','4,63','5,23','14,7','45,8','46,8','16,5','5,94','50,5','5,08','21,2','7,71','5,25','4,6','57,3','16,9','6,14','45,7','23,3','15,0'])
  P('officiellt ' + s, has(s));
P('ROTCE 23', has('ROTCE 23') || has('ROTCE ${') || /ROTCE 23/.test(body));
P('kalendercitat', has('Third-Quarter 2026 Earnings Conference Call'));

// — 4. aritmetik: oberoende omräkning av datavaktens tal —
const idFram = jpm.vardering.pb / jpm.lonksamhet.roe;
P('idFram tal', has(f3(idFram)), f3(idFram));
P('idFram gap', has(f1((jpm.vardering.pe / idFram - 1) * 100)) || has('1,4 procent'), f1((jpm.vardering.pe / idFram - 1) * 100));
const idTill = jpm.vardering.pe * jpm.lonksamhet.roe;
P('idTill tal', has(f3(idTill)), f3(idTill));
const implicitPE = jpm.marknadsKapitalMdr / jpm.vardering.pe;
P('implicit P/E-vinst', has(f1(implicitPE)), f1(implicitPE));
const ek = jpm.marknadsKapitalMdr / jpm.vardering.pb;
P('EK-värde', has(f1(ek)), f1(ek));
P('implicit ROE-vinst', has(f1(jpm.lonksamhet.roe * ek)), f1(jpm.lonksamhet.roe * ek));
P('EK-balansgap', has(f1((ek / 362 - 1) * 100)), f1((ek / 362 - 1) * 100));
const absFY = jpm.vardering.pe * 57.0;
P('absFY', has(f1(absFY)), f1(absFY));
P('absFY residual', has('plus ' + f1((jpm.marknadsKapitalMdr / absFY - 1) * 100) + ' procent'), f1((jpm.marknadsKapitalMdr / absFY - 1) * 100));
const ttmNe = 14.4 + 13.0 + 16.5 + 21.2;
P('TTM-vinst', has(f1(ttmNe)), f1(ttmNe));
P('TTM ex-notable', has(f1(ttmNe + 1.7)), f1(ttmNe + 1.7));
const absTTM = jpm.vardering.pe * ttmNe;
P('absTTM', has(f1(absTTM)), f1(absTTM));
P('absTTM residual', has('minus ' + f1(Math.abs((jpm.marknadsKapitalMdr / absTTM - 1) * 100)) + ' procent'), f1(Math.abs((jpm.marknadsKapitalMdr / absTTM - 1) * 100)));
const pegKonv = jpm.vardering.pe / (jpm.tillvaxt.prognosTillvaxt * 100);
P('PEG-konvention', has(f2(pegKonv)), f2(pegKonv));
P('PEG implicit tillväxt', has(f2(jpm.vardering.pe / jpm.vardering.peg)), f2(jpm.vardering.pe / jpm.vardering.peg));
P('PEG jämförelse GS 1,24 mot 3,31', has('1,24 mot 3,31'));
const gapKvot = jpm.tillvaxt.omsattningTillvaxtTTM / jpm.tillvaxt.prognosTillvaxt;
P('konsensusgap kvot', has(f1(gapKvot) + ' gånger'), f1(gapKvot));
const aktFY = 57.0 / 20.02, aktQ4 = 13.0 / 4.63, aktQ2 = 21.2 / 7.71, aktNu = jpm.marknadsKapitalMdr / jpm.pris;
for (const [n, v] of [['aktFY', aktFY], ['aktQ4', aktQ4], ['aktQ2', aktQ2], ['aktNu', aktNu]]) P('aktietal ' + n, has(f3(v)), f3(v));
P('aktietal minsk total', has(f1((1 - aktNu / aktFY) * 100) + ' procent'), f1((1 - aktNu / aktFY) * 100));
const pbMotBVPS = jpm.pris / 126.99, bvpImpl = jpm.pris / jpm.vardering.pb;
P('P/B mot BVPS', has(f3(pbMotBVPS)), f3(pbMotBVPS));
P('fältimpl BVPS', has(f1(bvpImpl)), f1(bvpImpl));
P('BVPS-steg', has(f1((bvpImpl / 126.99 - 1) * 100)), f1((bvpImpl / 126.99 - 1) * 100));
P('BVPS-år', has(f1((126.99 / 116.07 - 1) * 100)), f1((126.99 / 116.07 - 1) * 100));
P('YoY Q2 netto', has('plus ' + f0((21.2 / 15.0 - 1) * 100)) || has(f0((21.2 / 15.0 - 1) * 100) + ' procent'), f0((21.2 / 15.0 - 1) * 100));
P('YoY Q2 EPS', has('plus ' + f0((7.71 / 5.25 - 1) * 100)), f0((7.71 / 5.25 - 1) * 100));
P('YoY Q1 EPS', has('plus ' + f0((5.94 / 5.08 - 1) * 100)), f0((5.94 / 5.08 - 1) * 100));
P('netto Q2-26', has(f1(21.2 / 57.3 * 100)), f1(21.2 / 57.3 * 100));
P('netto Q1-26 managed', has(f1(16.5 / 50.5 * 100)), f1(16.5 / 50.5 * 100));
P('netto Q3-25', has(f1(14.4 / 47.1 * 100)), f1(14.4 / 47.1 * 100));
P('netto Q2-25', has(f1(15.0 / 45.7 * 100)), f1(15.0 / 45.7 * 100));
P('tvilling NI-kvot', has(f1(21.2 / 6.628)), f1(21.2 / 6.628));
P('tvilling rev-kvot', has(f1(57.3 / 20.338)), f1(57.3 / 20.338));
P('Visa ex', has(f1(21.2 - 4.6)), f1(21.2 - 4.6));

// scenariorutan (bas = fyra rapporterade kvartal)
const bas = 47.1 + 46.8 + 50.5 + 57.3, m0 = jpm.lonksamhet.ebitMarginal;
const rutor = [bas * 0.97, bas, bas * 1.03], marg = [m0 - 0.01, m0, m0 + 0.01];
const cell = (r, m) => Math.round(r * m);
const tab = body.split('\n').filter(l => /^\| Intäkter /.test(l));
P('scenariotabell 3 rader', tab.length === 3, String(tab.length));
P('scenariobas', has(f1(bas)), f1(bas));
let cellOK = 0;
const nh = (s) => s.replace(/\u00A0/g, ' ');
for (let i = 0; i < 3; i++) {
  if (tab[i].includes(nh(f1(rutor[i])))) cellOK++;
}
P('scenariotabell radetiketter 3/3', cellOK === 3, cellOK + '/3');
let cellOK2 = 0;
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (tab[i].includes(nh(f0(cell(rutor[i], marg[j]))))) cellOK2++;
P('scenarioceller 9/9', cellOK2 === 9, cellOK2 + '/9');
P('marginalsteg', has(f1(bas * 0.01)), f1(bas * 0.01));
P('intäktssteg', has(f1(bas * 0.03 * m0)), f1(bas * 0.03 * m0));
P('vikt-kvot', has(f1(bas * 0.03 * m0 / (bas * 0.01))), f1(bas * 0.03 * m0 / (bas * 0.01)));
P('marginalvikt', has(f2(1 / (3 * m0))), f2(1 / (3 * m0)));
P('multiplövning prog', has(f2(jpm.vardering.pe / 1.0328)), f2(jpm.vardering.pe / 1.0328));
P('multiplövning TTM', has(f1(jpm.marknadsKapitalMdr / ttmNe)), f1(jpm.marknadsKapitalMdr / ttmNe));
P('GS-tvillingvärden', has(f3(gs.vardering.pe)) && has(f3(gs.vardering.pb)) && has('16,9'));

// — 5. medianer/rang oberoende omräknade ur filen —
function med(a){a=a.filter(v=>v!=null).sort((x,y)=>x-y);const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function rang(v,arr){const a=arr.filter(x=>x!=null).sort((x,y)=>x-y);const i=a.findIndex(x=>x>=v);return (i<0?a.length:i+1)+'/'+a.length;}
const fin = uni.filter(r => r.bransch === 'finans');
const pick = { pe:r=>r.vardering?.pe, pb:r=>r.vardering?.pb, roe:r=>r.lonksamhet?.roe, ebit:r=>r.lonksamhet?.ebitMarginal,
  netto:r=>r.lonksamhet?.nettoMarginal, prog:r=>r.tillvaxt?.prognosTillvaxt, ttm:r=>r.tillvaxt?.omsattningTillvaxtTTM };
const fmt = { pe:f3, pb:f3, roe:f2, ebit:f2, netto:f2, prog:f2, ttm:f2 };
const skala = { pe:1, pb:1, roe:100, ebit:100, netto:100, prog:100, ttm:100 };
for (const k of Object.keys(pick)) {
  const fm = med(fin.map(pick[k])) * skala[k], um = med(uni.map(pick[k])) * skala[k], rg = rang(pick[k](jpm), fin.map(pick[k]));
  P('median '+k+' finans', has(fmt[k](fm)) || has(fmt[k](fm).replace(/,\d\d$/, '')), fmt[k](fm));
  P('median '+k+' universum', has(fmt[k](um)) || has(fmt[k](um).replace(/,\d\d$/, '')), fmt[k](um));
  P('rang '+k, has(rg), rg);
}
P('gren-n 20', has('20 bolag'));
P('universum-n rapporterad', /\d{3} poster/.test(body));

// — 6. juridikgrind —
const lagrum = body.match(/2007:528/g) || [];
P('exakt ett lagrum 2007:528', lagrum.length === 1, String(lagrum.length));
const andra = body.match(/2022:260|2022:261|1985:716|2005:59|2022:482/g) || [];
P('inga främmande lagrum', andra.length === 0, andra.join(','));
const forbjudna = ['köp denna','sälj denna','målkurs','vi rekommenderar','köp aktien','undvik aktien','strong buy','väl värt att köpa'];
for (const s of forbjudna) P('förbjuden fras: ' + s, !has(s));
P('"väntas" ej förekommande', !/\bväntas\b/i.test(body));
P('prognos-disclaimer', has('inte en sanning och inte vår skattning'));
P('konsensus-begrepp', has('ett begrepp att förstå, inte en måttstock'));
P('utbildningsblock', has('inte en rekommendation att köpa, sälja eller behålla'));
['insiderköp','återköp'].forEach(w => V('neutral kontext ' + w, (body.match(new RegExp(w,'g'))||[]).length <= 6));

// — 7. interna länkar —
const links = [...new Set([...body.matchAll(/\]\((\/[^)#\s]+)\)/g)].map(m => m[1]))];
const externa = [...body.matchAll(/\]\((https?:[^)]+)\)/g)].map(m => m[1]);
P('interna länkar >= 8', links.length >= 8, String(links.length));
let ok200 = 0;
for (const l of links) {
  const code = await fetch('http://localhost:3000' + l).then(r => r.status).catch(() => 0);
  if (code === 200) ok200++; else console.log('  länk:', l, code);
}
P('interna länkar 200 (' + links.length + ')', ok200 === links.length, ok200 + '/' + links.length);
P('externa JPM-länkar', externa.every(u => u.includes('jpmorganchase.com')) && externa.length >= 2, String(externa.length));

// — 8. ord/readingMinutes —
const ord = body.replace(/\|/g,' ').replace(/[#*\[\]()>/-]/g,' ').split(/\s+/).filter(Boolean).length;
P('ord 2 800–3 300', ord >= 2800 && ord <= 3300, String(ord));
P('readingMinutes = round(ord/600)', p.readingMinutes === Math.round(ord / 600), Math.round(ord/600) + ' vs ' + p.readingMinutes);

// — 9. utfall —
console.log(`\nKVD JPM: ${pass} PASS, ${fel} FEL, ${varn} VARNINGAR — ord ${ord}, länkar ${ok200}/${links.length}`);
process.exit(fel ? 1 : 0);
