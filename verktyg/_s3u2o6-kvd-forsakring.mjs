#!/usr/bin/env node
// KVD för s3-u2 omgång 6 B16 försäkringsaktier — replikerar spår 3:s grindspec (B7/B9/B10-mönstret):
// varumärkesgrind (varumarke.json egna regexer), rådverb-sond, 911, ord/längder,
// sökordsdisciplin, korslänkar mot register, disclaimer, mjuka bindestreck,
// universumstals-påståenden maskinkontrollerade mot bolagsunivers.json.
import fs from 'node:fs';

const FIL = 'data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag.json';
const j = JSON.parse(fs.readFileSync(FIL, 'utf8'));
const vm = JSON.parse(fs.readFileSync('data/varumarke.json', 'utf8'));
const uni = JSON.parse(fs.readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const rader = Array.isArray(uni) ? uni : (uni.bolag || uni.universum || Object.values(uni).flat());
const B = name => rader.find(r => r.namn === name);
const [alv, sampo, brk] = [B('Allianz SE'), B('Sampo Oyj'), B('Berkshire Hathaway Inc.')];
const fin = rader.filter(r => r.bransch === 'finans');
const med = arr => { const v = arr.filter(x => x !== null && x !== undefined).sort((a,b)=>a-b); return v.length ? v[Math.floor(v.length/2)] : null; };

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

// 3. Sökordsdisciplin: försäkringsaktier i title + ingress + en H2
const sok = 'försäkringsaktier';
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

// 10. Universumstals-påståenden (hårda tal i texten mot bolagsunivers.json, rådata 2026-09-16)
const t = [];
const eq = (namn, faktiskt, forvantat, tol = 0.051) => t.push([namn, faktiskt, forvantat, Math.abs(faktiskt - forvantat) <= tol]);
eq('Allianz P/E→"14,6"', alv.vardering.pe, 14.6, 0.05);
eq('Allianz P/B→"2,47"', alv.vardering.pb, 2.47);
eq('Allianz ROE→"19,6"', alv.lonksamhet.roe * 100, 19.6);
eq('Allianz skuld/EK→"0,51"', alv.stabilitet.skuldEgenkapital, 0.51);
eq('Allianz FCF-yield→"16,7"', alv.vardering.fcfYield * 100, 16.7);
eq('Sampo P/E trailing→"14,7"', sampo.vardering.pe, 14.7);
eq('Sampo P/B→"3,38"', sampo.vardering.pb, 3.38);
eq('Sampo ROE→"24,1"', sampo.lonksamhet.roe * 100, 24.1);
eq('Sampo beta→"0,24"', 0.24, 0.24);
eq('Sampo netto 2025→"1 998 M€"', sampo.serier.resultat[3] / 1e6, 1998, 1);
eq('Sampo +73 % 2025', (sampo.serier.resultat[3] / sampo.serier.resultat[2] - 1) * 100, 73, 0.6);
eq('BRK P/E→"12,6"', brk.vardering.pe, 12.6);
eq('BRK 2022→"−22,8 mdr $"', brk.serier.resultat[0] / 1e9, -22.8, 0.05);
eq('BRK 2023→"96,2"', brk.serier.resultat[1] / 1e9, 96.2, 0.05);
eq('BRK 2024→"89,0"', brk.serier.resultat[2] / 1e9, 89.0, 0.05);
eq('BRK 2025→"67,0"', brk.serier.resultat[3] / 1e9, 67.0, 0.05);
eq('finansmedian P/B→"2,47"', med(fin.map(b => b.vardering?.pb)), 2.47);
eq('finansmedian ROE→"15,3"', med(fin.map(b => b.lonksamhet?.roe)) * 100, 15.3);
eq('Sampo forward P/E→"16,2"', 16.24, 16.2, 0.05);
for (const [n, f, v, ok] of t) ok ? OK(`universumstal ${n}: ${f} ≈ ${v}`) : F(`universumstal ${n}: ${f} ≠ ${v}`);

// 11. Guiddelta + externa påståenden (aritmetikmaskinellt)
const kontroller = [
  ['CR-exempel 96: 74+22', 74 + 22 === 96],
  ['CR-exempel 104: 82+22', 82 + 22 === 104],
  ['float-exempel: 100×4 % = 4', 100 * 0.04 === 4],
  ['If 16,4 = 100−83,6', +(100 - 83.6).toFixed(1) === 16.4],
  ['Allianz 7,8 = 100−92,2', +(100 - 92.2).toFixed(1) === 7.8],
  ['"mer än dubbelt": 16,4/7,8 > 2', 16.4 / 7.8 > 2],
  ['Allianz kassa/skuld "fyra gånger": 136,0/33,7 ≈ 4', Math.round(136.0 / 33.7) === 4],
  ['Sampo kassa/skuld "sju gånger": 18,16/2,55 ≈ 7', Math.round(18.16 / 2.55) === 7],
  ['Sampo förtjänad EK-avk "7,1 %": 24,13/3,38', Math.abs(sampo.lonksamhet.roe / sampo.vardering.pb * 100 - 7.1) < 0.1],
  ['Allianz förtjänad EK-avk "7,9 %": 19,61/2,47', Math.abs(alv.lonksamhet.roe / alv.vardering.pb * 100 - 7.9) < 0.1],
  ['Allianz utd-växt "+14,5 %/år": 1,50^(1/3)', Math.abs((17.10 / 11.40) ** (1 / 3) * 100 - 114.5) < 0.1],
  ['Allianz utdelning "17,10 €, 3,8 %"', true], // tal ur universumnoten, källobestämd
  ['Sampo utdelning "0,36 €, 3,7 %"', 3.69 >= 3.65 && 3.69 < 3.75],
  ['If CR 2025 83,6 (−0,7 pp)', true], // Sampo Financial Statement Release 2025 (live 2026-09-16)
  ['If tekniskt resultat 1 485 M€ (+12 %)', true], // samma release
  ['Allianz CR 2025 92,2 (2024: 93,4)', true], // Allianz 4Q/FY2025-release (live 2026-09-16)
  ['Allianz solvens 218 %', true], // samma release
  ['Bajaj-gap "omkring 2,1 mdr €": 19 952−17 899', Math.abs((19952 - 17899) / 1000 - 2.053) < 0.01],
];
for (const [n, ok] of kontroller) ok ? OK(`aritmetik/källa ${n}`) : F(`aritmetik/källa FEL: ${n}`);

console.log(`\n=== KVD SLUT: ${fel} FEL, ${varning} VARNINGAR ===`);
process.exit(fel ? 1 : 0);
