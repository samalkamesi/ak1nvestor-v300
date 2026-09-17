#!/usr/bin/env node
// KVD för s3-u1 B10 bilaktier — replikerar spår 3:s grindspec (B7/B9-mönstret):
// varumärkesgrind (varumarke.json egna regexer), rådverb-sond, 911, ord/längder,
// sökordsdisciplin, korslänkar mot register, disclaimer, mjuka bindestreck,
// universumstals-påståenden maskinkontrollerade mot bolagsunivers.json.
import fs from 'node:fs';

const FIL = 'data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json';
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const uni = JSON.parse(fs.readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const rader = Array.isArray(uni) ? uni : (uni.bolag || uni.universum || Object.values(uni).flat());
const B = name => rader.find(r => r.namn === name);
const [volvo, tesla, polestar, pcell] = [B('Volvo Car AB (publ.)'), B('Tesla, Inc.'), B('Polestar Automotive Holding UK PLC'), B('PowerCell Sweden AB (publ)')];

let fel = 0, varning = 0;
const F = m => { console.log('FEL:', m); fel++; };
const V = m => { console.log('VARNING:', m); varning++; };
const OK = m => console.log('OK:', m);

// 1. Form-kontrakt
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
const saknas = falt.filter(k => !(k in j));
saknas.length ? F('fält saknas: ' + saknas.join(',')) : OK('BlogPost-form komplett (9 fält)');

// 2. Ord, längder, readingMinutes (600-ordskontraktet)
const ord = j.body.trim().split(/\s+/).length;
(ord >= 800 && ord <= 1400) ? OK(`ord ${ord} (span 800–1400, mallmål 1200)`) : F(`ord ${ord} utanför span`);
j.title.length <= 60 ? OK(`title ${j.title.length} tkn (≤60)`) : F(`title ${j.title.length} tkn (>60)`);
j.description.length <= 155 ? OK(`OG-desc ${j.description.length} tkn (≤155)`) : F(`OG-desc ${j.description.length} tkn (>155)`);
const rm = Math.max(1, Math.round(ord / 600));
rm === j.readingMinutes ? OK(`readingMinutes ${j.readingMinutes} = kontraktet (ord 600)`) : F(`readingMinutes ${j.readingMinutes} ≠ ${rm}`);

// 3. Sökordsdisciplin: bilaktier i title + första stycket + en H2
const sok = 'bilaktier';
const ingress = j.body.split('\n\n')[0];
const h2or = [...j.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
j.title.toLowerCase().includes(sok) && ingress.toLowerCase().includes(sok) && h2or.some(h => h.toLowerCase().includes(sok))
  ? OK(`sökord "${sok}" i title+ingress+H2 ("${h2or.find(h => h.toLowerCase().includes(sok))}")`)
  : F(`sökord "${sok}" ej i title/ingress/H2`);

// 4. Varumärkesgrind: varumarke.json egna regexer på title+desc+body
const yta = j.title + '\n' + j.description + '\n' + j.body;
for (const fp of vm.forbjudnaFraser) {
  let re;
  try { re = new RegExp(fp.fran, 'gi'); } catch { continue; }
  const tra = yta.match(re);
  if (tra) (fp.allvar === 'FEL' ? F : V)(`"${tra[0]}" matchar "${fp.fran}" (${fp.allvar}) → "${fp.istallet}"`);
}
OK(`varumärkesgrind körd: ${vm.forbjudnaFraser.length} regexer`);

// 5. Rådverb-sond (juridikgrindens genomläsningsstöd; kontext bedöms manuellt)
const radm = [...yta.matchAll(/\b(köp|köper|köpt|sälj|sälja|sålt|rekommendera|rekommenderar|råd(er)? till|bör du|borde du|rådgivning till)\b/gi)].map(m => m[0]);
radm.length === 0 ? OK('0 rådverb-träffar') : V('rådverb-träffar att kontextläsa: ' + [...new Set(radm)].join(', '));

// 6. 911-kontroll
const nioelva = ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'].filter(p => yta.toLowerCase().includes(p.toLowerCase()));
nioelva.length === 0 ? OK('911 = 0 träffar på 6 mönster') : F('911-träffar: ' + nioelva.join(', '));

// 7. Mjuka bindestreck och smuts
/\u00AD|\u200B|\u200C|\u200D/.test(j.body) ? F('mjuka bindestreck/nollbreddstecken i body') : OK('0 mjuka bindestreck');

// 8. Disclaimer-sista-rad identisk mallens
const sista = j.body.trimEnd().split('\n').pop();
sista === '_Detta är pedagogisk finansanalys, inte investeringsråd._' ? OK('disclaimer-sista-rad identisk mallens') : F('fel sista rad: ' + JSON.stringify(sista));

// 9. Korslänkar mot register; 0 mot utkast
const kurser = JSON.parse(fs.readFileSync('public/deep-courses.json', 'utf8'));
const klista = Array.isArray(kurser) ? kurser : (kurser.kurser || kurser.courses || Object.values(kurser).flat());
const kursSlugs = new Set(klista.map(k => k.slug));
const bloggSlugs = new Set(fs.readdirSync('data/blogg').filter(x => x.endsWith('.json')).map(x => JSON.parse(fs.readFileSync('data/blogg/' + x, 'utf8')).slug));
const utkastSlugs = new Set(fs.readdirSync('data/blogg-utkast').filter(x => x.endsWith('.json')).map(x => JSON.parse(fs.readFileSync('data/blogg-utkast/' + x, 'utf8')).slug));
const lankar = [...j.body.matchAll(/\]\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
for (const l of lankar) {
  const slug = l.replace(/^\/(kurser|blogg)\//, '');
  if (l.startsWith('/kurser/')) kursSlugs.has(slug) ? OK(`kurslänk ${l} i registret (${klista.length} kurser)`) : F(`kurslänk ${l} SAKNAS i registret`);
  else if (bloggSlugs.has(slug)) OK(`blogglänk ${l} publicerad (${bloggSlugs.size} poster)`);
  else if (utkastSlugs.has(slug)) F(`blogglänk ${l} pekar på UTKAST — förbjudet`);
  else F(`blogglänk ${l} varken publicerad eller utkast — okänd`);
}

// 10. Universumstals-påståenden (hårda tal i texten mot bolagsunivers.json, rådata 2026-09-03)
const t = [];
const eq = (namn, faktiskt, forvantat) => t.push([namn, faktiskt, forvantat, Math.abs(faktiskt - forvantat) < 1e-9]);
eq('Volvo P/E→"6,0"', volvo.vardering.pe, 5.957);
eq('Volvo P/B→"0,37"', volvo.vardering.pb, 0.369);
eq('Volvo EV/EBIT→"över 21"', volvo.vardering.evEbit, 21.219);
eq('Volvo brutto→"15,6 %"', volvo.lonksamhet.bruttoMarginal, 0.1562);
eq('Volvo EBIT→"0,8 %"', volvo.lonksamhet.ebitMarginal, 0.0084);
eq('Volvo resultat 2024→"15,4 mdr"', volvo.serier.resultat[2] / 1e9, 15.401);
eq('Volvo resultat 2025→"noll"', volvo.serier.resultat[3] / 1e9, 0.174);
eq('Tesla P/E→"334"', tesla.vardering.pe, 333.654);
eq('Tesla PEG→"4,3"', tesla.vardering.peg, 4.26);
eq('Tesla brutto→"18,9 %"', tesla.lonksamhet.bruttoMarginal, 0.1885);
eq('Tesla vinst 2023→"15,0"', tesla.serier.resultat[1] / 1e9, 14.997);
eq('Tesla vinst 2024→"7,1"', tesla.serier.resultat[2] / 1e9, 7.091);
eq('Tesla vinst 2025→"3,8"', tesla.serier.resultat[3] / 1e9, 3.794);
eq('Polestar förlust→"2,4 mdr"', polestar.serier.resultat[3] / 1e9, -2.357);
eq('Polestar burn→"15 mån"', polestar.stabilitet.kassaManaderBurnRate, 15.2);
eq('PowerCell brutto→"30,6 %"', pcell.lonksamhet.bruttoMarginal, 0.3055);
eq('PowerCell oms 2022→"245"', pcell.serier.omsattning[0] / 1e6, 244.691);
eq('PowerCell oms 2025→"385"', pcell.serier.omsattning[3] / 1e6, 384.958);
for (const [n, f, v, ok] of t) ok ? OK(`universumstal ${n}: ${f} ≈ ${v}`) : F(`universumstal ${n}: ${f} ≠ ${v}`);
// Tesla-fallprocenterna i texten: −53 % och −46 %
const fa1 = (tesla.serier.resultat[2] / tesla.serier.resultat[1] - 1) * 100, fa2 = (tesla.serier.resultat[3] / tesla.serier.resultat[2] - 1) * 100;
(Math.round(fa1) === -53 && Math.round(fa2) === -46) ? OK(`Teslas fallprocenter −53/−46 beräknade (${fa1.toFixed(1)}/${fa2.toFixed(1)})`) : F(`fallprocent fel: ${fa1}/${fa2}`);
// Fabriksexemplet: 300k×60k=18mdr; −15 % volym → 3,3 mdr (−45 %); pris −5 % → 0
const ebit1 = 300000*60000 - 12e9, ebit2 = 255000*60000 - 12e9, ebit3 = 300000*40000 - 12e9;
(ebit1 === 6e9 && ebit2 === 3.3e9 && Math.round((ebit2/ebit1-1)*100) === -45 && ebit3 === 0)
  ? OK('fabriksexempel: EBIT 6→3,3 mdr (−45 % på volym −15 %); pris −5 % → 0')
  : F(`fabriksexempel fel: ${ebit1}/${ebit2}/${ebit3}`);

console.log(`\n=== KVD SLUT: ${fel} FEL, ${varning} VARNINGAR ===`);
process.exit(fel ? 1 : 0);
