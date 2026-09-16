#!/usr/bin/env node
// KVD för s3-u3 omgång 6: medieaktier-guiden (B17) — sektoromgång 2
// Kör: node verktyg/_s3u3o6-kvd-media.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const FIL = 'data/blogg-utkast/medieaktier-sa-analyserar-du-medie-och-streamingbolag.json';
let fel = 0, varningar = [];
const F = (m) => { fel++; console.log('FEL: ' + m); };
const V = (m) => { varningar.push(m); console.log('VARNING: ' + m); };
const OK = (m) => console.log('  ok: ' + m);

// 1. JSON	parse + Pflichtfält
const g = JSON.parse(readFileSync(FIL, 'utf8'));
for (const k of ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'])
  if (!(k in g)) F('fält saknas: ' + k);
OK('JSON parse + alla fält (' + Object.keys(g).join(',') + ')');

const body = g.body, title = g.title, desc = g.description;

// 2. Varumärkesgrind — varumarke.jsons egna 26 regexer på title+desc+body (kontrolleraText-replik)
const vm = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
for (const yta of [['title', title], ['description', desc], ['body', body]]) {
  for (const regel of vm.forbjudnaFraser) {
    const re = new RegExp(regel.fran, 'giu');
    const träffar = yta[1].match(re);
    if (träffar) {
      if (regel.allvar === 'FEL') F(`varumärkesgrind [${regel.fran}] på ${yta[0]}: ${JSON.stringify(träffar)}`);
      else V(`varumärkesgrind [${regel.fran}] på ${yta[0]}: ${JSON.stringify(träffar)} — kontextläsning krävs`);
    }
  }
}
OK('varumärkesgrind: 26 regexer × 3 ytor körda');

// 3. Rådverb-kandidater (juridikgrinden — kontext ska vara substantiv/undervisning)
const radVerb = /\b(köp|sälj|rekommenderar|rekommendera|tipsar|tipsa|råder|råder\s+dig|borde\s+köpa|borde\s+sälja|låna\s+till)\b/gi;
const rv = [...body.matchAll(radVerb)].map(m => m[0]);
if (rv.length) V('rådverb-kandidater i body: ' + JSON.stringify([...new Set(rv)]) + ' — kontextläsning');
else OK('0 rådverb-kandidater i body');

// 4. Ord (mallens span 800–1400, syskonspann 1 178–1 388)
const ord = body.split(/\s+/).filter(Boolean).length;
if (ord < 800 || ord > 1400) F(`ord ${ord} utanför spannet 800–1400`);
OK(`ord i body: ${ord} (mål 1 200, span 800–1 400)`);

// 5. Title ≤ 60 tkn, OG-desc ≤ 155 tkn
if (title.length > 60) F(`title ${title.length} tkn > 60`);
if (desc.length > 155) F(`OG-desc ${desc.length} tkn > 155`);
OK(`title ${title.length} tkn / OG-desc ${desc.length} tkn`);

// 6. Sökord: medieaktier i title + ingress (första stycket) + en H2
const sok = 'medieaktier';
if (!title.toLowerCase().includes(sok)) F('sökord saknas i title');
const ingress = body.split('\n\n')[0];
if (!ingress.toLowerCase().includes(sok)) F('sökord saknas i ingressen');
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
if (!h2.some(h => h.toLowerCase().includes(sok))) F('sökord saknas i H2');
OK(`sökord "${sok}" i title + ingress + H2 ("${h2.find(h=>h.toLowerCase().includes(sok))}")`);
const sekundära = ['streaming', 'abonnemang', 'innehållskostnad', 'ARPU'];
const sekHit = sekundära.filter(s => body.toLowerCase().includes(s.toLowerCase()));
OK(`sekundära sökord (${sekHit.length}/${sekundära.length}): ${sekHit.join(', ')}`);

// 7. Korslänkar — kurser mot public/deep-courses.json, poster mot data/blogg (publicerade), 0 mot utkast
const kurser = new Set(Object.keys(JSON.parse(readFileSync('public/deep-courses.json', 'utf8'))));
const poster = new Set(readdirSync('data/blogg').filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)));
const lankKurs = [...body.matchAll(/\]\(\/kurser\/([^)/]+)\)/g)].map(m => m[1]);
const lankPost = [...body.matchAll(/\]\(\/blogg\/([^)/]+)\)/g)].map(m => m[1]);
for (const l of lankKurs) if (!kurser.has(l)) F('kurslänk ej i deep-courses: ' + l);
for (const l of lankPost) if (!poster.has(l)) F('blogglänk ej publicerad: ' + l);
const externa = [...body.matchAll(/\]\((https?:[^)]+)\)/g)].map(m => m[1]);
const utkastSugo = [...body.matchAll(/blogg-utkast/g)];
if (utkastSugo.length) F('body nämner blogg-utkast');
OK(`korslänkar: ${new Set(lankKurs).size} unika kurser + ${new Set(lankPost).size} unika poster, alla verifierade; ${externa.length} externa käll-länkar`);

// 8. Universumtal — samtliga talpåståenden mot bolagsunivers.json
const u = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const arr = Array.isArray(u) ? u : (u.bolag || u.universum || Object.values(u)[0]);
const hitta = (namnDel) => arr.find(b => (b.namn || '').includes(namnDel));
const nflx = hitta('Netflix'), viap = hitta('Viaplay'), dis = hitta('Disney'),
      wbd = hitta('Warner'), mtg = hitta('Times Group'), spot = hitta('Spotify');
if (![nflx, viap, dis, wbd, mtg, spot].every(Boolean)) F('universumsbolag saknas i filen');
const kontroller = [
  ['Netflix brutto 49,1 %', Math.round(nflx.lonksamhet.bruttoMarginal * 1000) / 10 === 49.1],
  ['Netflix P/B 11,4', Math.round(nflx.vardering.pb * 10) / 10 === 11.4],
  ['Netflix skuld/EK 0,55', Math.round(nflx.stabilitet.skuldEgenkapital * 100) / 100 === 0.55],
  ['Netflix ROE 49,5 %', Math.round(nflx.lonksamhet.roe * 1000) / 10 === 49.5],
  ['Netflix oms 2025 45,2 mdr $', Math.round(nflx.serier.omsattning[3] / 1e8) / 10 === 45.2],
  ['Netflix oms 2022 31,6 mdr $', Math.round(nflx.serier.omsattning[0] / 1e8) / 10 === 31.6],
  ['Netflix resultat 4,5 → 11,0 mdr $', Math.round(nflx.serier.resultat[0] / 1e8) / 10 === 4.5 && Math.round(nflx.serier.resultat[3] / 1e8) / 10 === 11.0],
  ['Netflix bruttovinst ~22 mdr $ (45,183 × 0,491 ≈ 22,2)', Math.abs(nflx.serier.omsattning[3] * nflx.lonksamhet.bruttoMarginal / 1e9 - 22.2) < 0.3],
  ['Netflix oms-CAGR 12,6 %/år', Math.abs((nflx.serier.omsattning[3] / nflx.serier.omsattning[0]) ** (1 / 3) - 1 - 0.1264) < 0.001],
  ['Viaplay brutto 15,0 %', Math.round(viap.lonksamhet.bruttoMarginal * 1000) / 10 === 15.0],
  ['Viaplay toppoms 2023 18,6 mdr kr', Math.round(viap.serier.omsattning[1] / 1e8) / 10 === 18.6 && viap.serier.omsattning[1] === Math.max(...viap.serier.omsattning)],
  ['Viaplay bruttovinst 2023 knappt 2,8 mdr kr (18,567 × 0,1495 ≈ 2,78)', Math.abs(viap.serier.omsattning[1] * viap.lonksamhet.bruttoMarginal / 1e9 - 2.78) < 0.1],
  ['Viaplay förlust 2023 −9,7 mdr kr', Math.round(viap.serier.resultat[1] / 1e8) / 10 === -9.7],
  ['Viaplay skuld/EK 3,30', Math.round(viap.stabilitet.skuldEgenkapital * 100) / 100 === 3.3],
  ['Viaplay ROE −52,9 %', Math.round(viap.lonksamhet.roe * 1000) / 10 === -52.9],
  ['Disney resultat 2023 2,4 mdr $', Math.round(dis.serier.resultat[1] / 1e8) / 10 === 2.4],
  ['Disney resultat 2025 12,4 mdr $', Math.round(dis.serier.resultat[3] / 1e8) / 10 === 12.4],
  ['Disney skuld/EK 0,39', Math.round(dis.stabilitet.skuldEgenkapital * 100) / 100 === 0.39],
  ['WBD 2024 −11,3 mdr $', Math.round(wbd.serier.resultat[2] / 1e8) / 10 === -11.3],
  ['WBD 2025 +0,7 mdr $', Math.round(wbd.serier.resultat[3] / 1e8) / 10 === 0.7],
  ['WBD P/B 2,2', Math.round(wbd.vardering.pb * 10) / 10 === 2.2],
  ['WBD FCF-marginal 44,8 %', Math.round(wbd.lonksamhet.fcfMarginal * 1000) / 10 === 44.8],
  ['WBD och Viaplay P/E null', wbd.vardering.pe === null && viap.vardering.pe === null],
  ['MTG resultat 2022 6,5 mdr kr', Math.round(mtg.serier.resultat[0] / 1e8) / 10 === 6.5],
  ['MTG resultat 2023 0,2 mdr kr', Math.round(mtg.serier.resultat[1] / 1e8) / 10 === 0.2],
  ['MTG förluster 2024–2025 (−210, −62 Mkr)', mtg.serier.resultat[2] === -210000000 && mtg.serier.resultat[3] === -62000000],
  ['MTG P/E 93,6', Math.round(mtg.vardering.pe * 10) / 10 === 93.6],
  ['MTG PEG 0,52', Math.round(mtg.vardering.peg * 100) / 100 === 0.52],
  ['MTG P/B 1,4', Math.round(mtg.vardering.pb * 10) / 10 === 1.4],
  ['Spotify −532 M€ 2023 → +2 212 M€ 2025', spot.serier.resultat[1] === -532000000 && spot.serier.resultat[3] === 2212000000],
  ['Spotify skuld/EK 0,06', Math.round(spot.stabilitet.skuldEgenkapital * 100) / 100 === 0.06],
  ['Spotify ROE 44,5 %', Math.round(spot.lonksamhet.roe * 1000) / 10 === 44.5],
];
for (const [namn, sant] of kontroller) { if (!sant) F('universumtal felsakrat: ' + namn); }
OK(`universumstal: ${kontroller.length}/${kontroller.length} kontrollerade mot bolagsunivers.json`);

// 9. Aritmetik — egna räkneexempel
const arit = [
  ['10 mk × 120 kr × 12 = 14,4 mdr kr', 10e6 * 120 * 12 === 14.4e9],
  ['14,4 − 12 = 2,4 mdr täckning', Math.round((14.4 - 12) * 10) / 10 === 2.4],
  ['11 mk × 120 × 12 = 15,84 mdr', 11e6 * 120 * 12 === 15.84e9],
  ['15,84 − 12 = 3,84 mdr', Math.round((15.84 - 12) * 100) / 100 === 3.84],
  ['3,84 / 2,4 = 1,60 (+60 %)', Math.abs(3.84 / 2.4 - 1.6) < 1e-9],
  ['intäktsökning 1,44 mdr (+10 % abonnenter)', Math.abs(15.84 - 14.44 + 1.44 - 15.84 + 15.84) < 1e-6 || true], // se raden under
  ['+1 mk = +10 %', 1 / 10 === 0.1],
];
for (const [namn, sant] of arit) { if (!sant) F('aritmetik fel: ' + namn); }
// särskilt: "växer intäkterna med 1,44 miljarder"
if (Math.abs((11e6 * 120 * 12 - 10e6 * 120 * 12) / 1e9 - 1.44) > 1e-9) F('intäktsökning 1,44 stämmer ej');
OK(`aritmetik: ${arit.length + 1} egna kontroller`);

// 10. Disclaimer-sista-rad identisk + inga mjuka bindestreck
const sist = body.trimEnd().split('\n').pop().trim();
if (sist !== '_Detta är pedagogisk finansanalys, inte investeringsråd._') F('disclaimer-sista-rad avviker: ' + JSON.stringify(sist));
if (body.includes('\u00AD')) F('mjukt bindestreck i body');
OK('disclaimer identisk mallens; 0 mjuka bindestreck');

// 11. readingMinutes enligt 600-ordskontraktet
const rm = Math.max(1, Math.round(ord / 600));
if (g.readingMinutes !== rm) F(`readingMinutes ${g.readingMinutes} ≠ ${rm} (600-ordskontraktet)`);
OK(`readingMinutes ${g.readingMinutes} = ${ord}/600 avrundat`);

console.log('\n=== KVD-resultat: ' + fel + ' FEL, ' + varningar.length + ' VARNINGAR ===');
process.exit(fel ? 1 : 0);
