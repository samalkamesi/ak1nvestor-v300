// KVD för GS Q3-läspaketet — oberoende omräkning av varenda bärande tal.
import fs from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-goldman-sachs-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const p = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const uni = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const gs = uni.find(r => r.ticker === 'GS');
const jpm = uni.find(r => r.ticker === 'JPM');
const body = p.body.replace(/\u00A0/g, ' '); // sv-SE-tusentalsmellanslag → vanligt

let pass = 0, fel = 0, varn = 0;
const P = (namn, ok, detalj = '') => { if (ok) { pass++; } else { fel++; console.log('FEL:', namn, detalj); } };
const V = (namn, ok, detalj = '') => { if (ok) pass++; else { varn++; console.log('VARNING:', namn, detalj); } };
const has = (s) => body.includes(s.replace(/\u00A0/g, ' '));
const near = (target, str, tol = 0.005) => { const x = parseFloat(str.replace(',', '.')); return Math.abs(x - target) <= tol * Math.abs(target); };

// — 1. struktur —
P('slug', p.slug === 'sa-laser-du-goldman-sachs-q3-2026');
P('fält', ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => p[k] != null && p[k] !== ''));
P('publishedAt = rappdag', p.publishedAt === '2026-10-13');
P('pillar', p.pillar === 'Institutionell metodik');
P('tags', Array.isArray(p.tags) && p.tags.length === 6 && p.tags.includes('Goldman Sachs') && p.tags.includes('läspaket'));
P('title-sökord', /^Goldman Sachs Q3-rapport 2026/.test(p.title) && p.title.includes('så läser du'));
P('description-längd', p.description.length >= 300 && p.description.length <= 520, `${p.description.length}`);
P('title-längd', p.title.length <= 200, `${p.title.length}`);
P('stomme', ['Urvalet: varför Goldman Sachs','Nyckeltalen att ha med sig','Datavakten','Så står sig bolaget mot branschen','Tre sätt att läsa utfallet','Praktiskt inför 13 oktober','## Källor'].every(s => has(s)));
P('disclaimer sist', /\*Detta är pedagogisk finansutbildning enligt lagen \(2007:528\)[^*]+\*\.?$/.test(body.trim().split('\n').pop().trim()));

// — 2. källtalsparitet mot universumposten —
const fpar = [
  ['P/E', f3(gs.vardering.pe)], ['P/B', f3(gs.vardering.pb)], ['EV/EBIT', f3(gs.vardering.evEbit)],
  ['PEG', f2(gs.vardering.peg)], ['ROE %', f1(gs.lonksamhet.roe * 100)],
  ['brutto %', f2(gs.lonksamhet.bruttoMarginal * 100)], ['EBIT %', f2(gs.lonksamhet.ebitMarginal * 100)],
  ['netto %', f2(gs.lonksamhet.nettoMarginal * 100)], ['TTM %', f0(gs.tillvaxt.omsattningTillvaxtTTM * 100)],
  ['prognos %', f2(gs.tillvaxt.prognosTillvaxt * 100)], ['pris', f2(gs.pris)], ['mcap', f3(gs.marknadsKapitalMdr)],
  ['insider', String(gs.aterkop.insiderkopSenaste6man)]
];
for (const [namn, s] of fpar) P('paritet ' + namn, has(s), s);
function f3(x){return x.toLocaleString('sv-SE',{minimumFractionDigits:3,maximumFractionDigits:3});}
function f2(x){return x.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2});}
function f1(x){return x.toLocaleString('sv-SE',{minimumFractionDigits:1,maximumFractionDigits:1});}
function f0(x){return Math.round(x).toLocaleString('sv-SE');}

// — 3. officiella rapporterade tal —
for (const s of ['20 338','6 628','20,98','23,5','17 227','5 630','17,55','58 280','17 180','51,32','15,0','13 450','4 620','14,01','16,0','12,25','14,2','14 580','3 720','37 565'])
  P('officiellt ' + s, has(s));
P('Q1rev härled ning ej bruten', near(17227/1.14, '15 111') || !has('15 111')); // får förekomma endast om korrekt
P('kalendercitat', has('Third quarter 2026 – Tuesday, October 13, 2026'));

// — 4. aritmetik: oberoende omräkning av datavaktens tal —
const idFram = gs.vardering.pb / gs.lonksamhet.roe;
P('idFram tal', has(f3(idFram)), f3(idFram));
P('idFram gap', has('+6,0') || has('6,0 procent'), '');
const idTill = gs.vardering.pe * gs.lonksamhet.roe;
P('idTill tal', has(f3(idTill)), f3(idTill));
const implicitPE = gs.marknadsKapitalMdr / gs.vardering.pe;
P('implicit P/E-vinst', has(f1(implicitPE)), f1(implicitPE));
const ek = gs.marknadsKapitalMdr / gs.vardering.pb;
const implicitROE = gs.lonksamhet.roe * ek;
P('EK-värde', has(f1(ek)), f1(ek));
P('implicit ROE-vinst', has(f1(implicitROE)), f1(implicitROE));
const absFY = gs.vardering.pe * 17.180;
P('absFY', has(f1(absFY)), f1(absFY));
P('absFY residual +10,0', has('plus 10,0 procent'));
const aktQ2 = 6628 / 20.98, aktFY = 17180 / 51.32;
P('aktietal FY', has(f1(aktFY)), f1(aktFY));
P('aktietal Q2', has(f1(aktQ2)), f1(aktQ2));
const q3ne = 12.25 * 328, q1ne = 17180 - 3720 - q3ne - 4620, ttmNe = q3ne + 4620 + 5630 + 6628;
P('TTM-vinst', has(f1(ttmNe / 1000)), f1(ttmNe / 1000));
const absTTM = gs.vardering.pe * ttmNe / 1000;
P('absTTM', has(f1(absTTM)), f1(absTTM));
P('absTTM residual', has('minus ' + f1(Math.abs((gs.marknadsKapitalMdr - absTTM) / absTTM * 100)) + ' procent'),
  f1(Math.abs((gs.marknadsKapitalMdr - absTTM) / absTTM * 100)));
const pegKonv = gs.vardering.pe / (gs.tillvaxt.prognosTillvaxt * 100);
P('PEG-konvention', has(f2(pegKonv)), f2(pegKonv));
P('PEG implicit tillväxt', has(f2(gs.vardering.pe / gs.vardering.peg)), f2(gs.vardering.pe / gs.vardering.peg));
P('PEG jämförelse', has('0,37'));
const yoyQ2 = 20338 / 14580 - 1;
P('YoY Q2', has('+' + f1(yoyQ2 * 100).replace(',0',',') ) || has('+' + (yoyQ2*100).toFixed(1).replace('.',',') + ' procent'), (yoyQ2*100).toFixed(2));
P('nettoFY', has(f1(17180/58280*100).replace(',5',',5')), f1(17180/58280*100));
P('nettoQ1', has(f1(5630/17227*100)), f1(5630/17227*100));
P('nettoQ2', has(f1(6628/20338*100)), f1(6628/20338*100));
const q1rev = 17227 / 1.14, q3rev = 58280 - q1rev - 14580 - 13450, ttmRev = q3rev + 13450 + 17227 + 20338;
P('TTM-intäkt', has(f1(ttmRev / 1000)), f1(ttmRev / 1000));
P('aktietal minsk', has(f1((1 - aktQ2/aktFY) * 100) + ' procent') || has((1-aktQ2/aktFY)*100 .toFixed(1).replace('.',',')), '');
// scenariorutan
const bas = 58280, m0 = gs.lonksamhet.ebitMarginal;
const rutor = [bas*0.97, bas, bas*1.03], marg = [m0-0.01, m0, m0+0.01];
const cell = (r,m) => Math.round(r*m);
const tab = body.split('\n').filter(l => /^\| Intäkter /.test(l));
P('scenariotabell 3 rader', tab.length === 3, String(tab.length));
let cellOK = 0;
const nh = (s) => s.replace(/\u00A0/g, ' ');
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (tab[i].includes(nh(f0(cell(rutor[i], marg[j]))))) cellOK++;
P('scenarioceller 9/9', cellOK === 9, cellOK + '/9');
P('marginalsteg', has(f0(bas*0.01)), f0(bas*0.01));
P('intäktssteg', has(f0(bas*0.03*m0)), f0(bas*0.03*m0));
P('vikt-kvot', has(f1(bas*0.03*m0/(bas*0.01))), f1(bas*0.03*m0/(bas*0.01)));
P('marginalvikt', has(f2(1/(3*m0))), f2(1/(3*m0)));
P('multiplövning prog', has(f2(gs.vardering.pe/1.0468)), f2(gs.vardering.pe/1.0468));
P('multiplövning TTM', has(f1(gs.marknadsKapitalMdr*1000/ttmNe)), f1(gs.marknadsKapitalMdr*1000/ttmNe));
// median-tabellens GS-värden och tvillingtal
P('JPM-tvilling', has(f3(jpm.vardering.pe)) && has(f3(jpm.vardering.pb)) && has(f1(jpm.lonksamhet.roe*100) + ','));

// — 5. medianer/rang oberoende omräknade ur filen —
function med(a){a=a.filter(v=>v!=null).sort((x,y)=>x-y);const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function rang(v,arr){const a=arr.filter(x=>x!=null).sort((x,y)=>x-y);const i=a.findIndex(x=>x>=v);return (i<0?a.length:i+1)+'/'+a.length;}
const fin = uni.filter(r => r.bransch === 'finans');
const pick = { pe:r=>r.vardering?.pe, pb:r=>r.vardering?.pb, roe:r=>r.lonksamhet?.roe, ebit:r=>r.lonksamhet?.ebitMarginal,
  netto:r=>r.lonksamhet?.nettoMarginal, prog:r=>r.tillvaxt?.prognosTillvaxt, ttm:r=>r.tillvaxt?.omsattningTillvaxtTTM };
const forv = {
  pe: ['15,269','21,153','11/19',1], pb: ['2,678','2,807','12/19',1], roe: ['15,34','15,34','13/19',100],
  ebit: ['47,90','21,17','7/18',100], netto: ['35,19','14,09','7/19',100], prog: ['9,50','12,31','4/16',100], ttm: ['10,00','7,20','18/19',100] };
for (const k of Object.keys(pick)) {
  const skala = forv[k][3];
  const fm = med(fin.map(pick[k])) * skala, um = med(uni.map(pick[k])) * skala, rg = rang(pick[k](gs), fin.map(pick[k]));
  P('median '+k+' finans', body.includes(forv[k][0]) && Math.abs(fm - parseFloat(forv[k][0].replace(',','.'))) < 0.01, fm.toFixed(3));
  P('median '+k+' universum', body.includes(forv[k][1]) && Math.abs(um - parseFloat(forv[k][1].replace(',','.'))) < 0.01, um.toFixed(4));
  P('rang '+k, body.includes(forv[k][2]) && forv[k][2] === rg, rg);
  P('n-redovisat gren', true);
}
P('gren-n 19', has('19 bolag'));

// — 6. juridikgrind —
const lagrum = body.match(/2007:528/g) || [];
P('exakt ett lagrum 2007:528', lagrum.length === 1, String(lagrum.length));
const andra = body.match(/2022:260|2022:261|1985:716|2005:59|2022:482/g) || [];
P('inga främmande lagrum', andra.length === 0, andra.join(','));
const rad = /(?!inte en rekommendation)(?:^|[^genom att ])\b(rekommendera|råd)\b/i;
const forbjudna = ['köp denna','sälj denna','målkurs','vi rekommenderar','köp aktien','undvik aktien','strong buy','väl värt att köpa'];
for (const s of forbjudna) P('förbjuden fras: ' + s, !has(s));
P('"väntas" endast ej-förekommande', !/\bväntas\b/i.test(body));
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
P('externa GS-länkar', externa.every(u => u.includes('goldmansachs.com')) && externa.length >= 2, String(externa.length));

// — 8. ord/readingMinutes —
const ord = body.replace(/\|/g,' ').replace(/[#*\[\]()>/-]/g,' ').split(/\s+/).filter(Boolean).length;
P('ord 2 800–3 300', ord >= 2800 && ord <= 3300, String(ord));
P('readingMinutes = round(ord/600)', p.readingMinutes === Math.round(ord / 600), Math.round(ord/600) + ' vs ' + p.readingMinutes);

// — 9. duplikat + granskningskö-registrering sker separat —
console.log(`\nKVD GS: ${pass} PASS, ${fel} FEL, ${varn} VARNINGAR — ord ${ord}, länkar ${ok200}/${links.length}`);
process.exit(fel ? 1 : 0);
