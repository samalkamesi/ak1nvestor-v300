// _s4u2-ores-kvd.mjs — KVD för Öresund Q3-2026-läspaketet (sa-laser-du-oresund-q3-2026.json)
// Kontrollerar: struktur, CJK-läckor, rådstopp, talparitet mot kanonregistret,
// aritmetik (motorräknad), korslänkar mot syskonpaketens ytor, externa källor live,
// sökordsnärvaro, publishedAt = rappdagen, duplikatfrihet.
// Kör: node verktyg/_s4u2-ores-kvd.mjs   (0 fel + 0 varning = GRÖN)
import fs from 'fs';
import { execSync } from 'child_process';

const P = 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-oresund-q3-2026.json';
const post = JSON.parse(fs.readFileSync(P, 'utf8'));
let fel = 0, varn = 0, kontroller = 0;
const F = m => { fel++; console.log('FEL:', m); };
const W = m => { varn++; console.log('VARN:', m); };
const OK = m => { kontroller++; console.log('ok  :', m); };

// --- 1. struktur ---
const keys = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
keys.filter(k => !(k in post)).length === 0 ? OK('alla nycklar (' + keys.length + ')') : F('saknade nycklar: ' + keys.filter(k => !(k in post)));
post.slug === 'sa-laser-du-oresund-q3-2026' ? OK('slug') : F('slug: ' + post.slug);
post.pillar === 'Institutionell metodik' && post.author === 'AK1A Research Lab' ? OK('pillar+author') : F('pillar/author');
post.publishedAt === '2026-10-09' ? OK('publishedAt = rappdagen 2026-10-09') : F('publishedAt: ' + post.publishedAt);
post.readingMinutes === 5 ? OK('readingMinutes 5') : F('readingMinutes');
Array.isArray(post.tags) && post.tags.includes('kvartalsrapport') ? OK('tags ' + post.tags.length) : F('tags');
const h2 = (post.body.match(/^## /gm) || []).length;
h2 >= 6 ? OK('H2 = ' + h2) : F('H2 = ' + h2);
/^# [^\n]/m.test(post.body) ? F('H1 finns — grannarna saknar H1') : OK('ingen H1 (grannformat)');

// --- 2. främmande tecken (CJK-fällan) ---
/[⺀-⿿　-俿一-鿿]*[一-鿿]/.test(post.body + post.title + post.description)
  ? F('CJK-tecken i texten (瑞典-klassen)') : OK('noll CJK-tecken');

// --- 3. rådstopp ---
const rad = post.body + post.title + post.description;
const radVerb = /\b(köp|sälj|rekommendera|lönar|löna sig|tipsa|bör du|börjar du|dra ned på|bygg en portfölj av)\b/i;
const hits = rad.match(new RegExp('[^.\\n]*' + radVerb.source + '[^.\\n]*', 'gi')) || [];
const illicit = hits.filter(s => !/inte en rekommendation|aldrig råd|Inga\b|förekommer|ej.*(rekommend|råd)|utan (att )?(köpa|sälja)|aldrig.*(köpa|sälja)/i.test(s));
illicit.length === 0 ? OK('rådverb 0 (imperativ/oppmanande: ' + hits.length + ' träffar, alla i negation)') : F('rådverb utanför negation: ' + illicit.slice(0, 3));
/bodyen_null/.test('') ;
/köp-, sälj- eller behållningsrekommendationer förekommer/.test(post.body) ? OK('disclaimer-rekommendationsrad') : F('disclaimer-rekommendationsrad saknas');
/utbildningsundantaget \(2 kap 5 § lagen 2007:528\)/.test(post.body) ? OK('juridikgrind: utbildningsundantaget 2 kap 5§') : F('juridikgrind saknas');
/Publicering av utkastet är kundens beslut \(R2\)/.test(post.body.slice(-700)) ? OK('R2-sista-raden') : F('R2-publiceringsnot ej bland sista raderna');

// --- 4. talparitet: kanonregistret ---
const kanon = {
  // universumraden 2026-09-03
  '145,40':1,'6 481':1,'9,429':1,'1,167':1,'9,221':1,'1,78':1,'7,14':1,'13,05':1,'92,46':1,'96,66':1,'80,8':1,
  // grenen
  '45':1,'14,200':1,'1,770':1,'13,90':1,'4,792':1,'8,72':1,'8,99':1,'9,37':1,'33,6':1,'34,1':1,'18':1,
  // H1-2026 (Cision 4189161)
  '5 720':1,'126':1,'11,0':1,'8,1':1,'1,5':1,'9,5':1,'13,26':1,'16,76':1,'2,35':1,'13,58':1,'602,7':1,'761,8':1,
  '106,9':1,'617,2':1,'580,0':1,'748,8':1,'104,9':1,'116,6':1,'22,7':1,'140,20':1,'118,00':1,'22':1,'12':1,
  '5 551,4':1,'5 284,1':1,'336,4':1,'0,9':1,'5 445':1,'95,2':1,'94':1,'1,6':1,'132':1,'13':1,'204':1,'168':1,
  '2,9':1,'45 457 814':1,'886 945':1,'156':1,'1,95':1,'23':1,'7,40':1,'3,70':1,'168,2':1,'27':1,'10':1,
  // portfölj 30 jun
  '10 100 000':1,'145,20':1,'1 467':1,'32':1,'25,6':1,'9 860 000':1,'145,00':1,'1 430':1,'31':1,'25,0':1,
  '13 527 970':1,'44,06':1,'596':1,'10,4':1,'33 016 084':1,'12,18':1,'402':1,'7,0':1,'7 197 731':1,'51,30':1,
  '369':1,'6,5':1,'2 000 000':1,'158,90':1,'318':1,'5,6':1,'2 250 000':1,'90,70':1,'204':1,'3,6':1,'1 500 000':1,
  '99,40':1,'149':1,'2,6':1,'1 000 000':1,'108,00':1,'108':1,'1,9':1,'750 000':1,'142,85':1,'107':1,'295':1,
  '6':1,'5,2':1,'120':1,
  // aug-tabell (oresund.se)
  '127':1,'142,60':1,'5 752':1,'11,7':1,'12,6':1,'1 470':1,'1 437':1,'527':1,'9,2':1,'426':1,'7,4':1,'305':1,
  '5,3':1,'201':1,'3,5':1,'172':1,'3,0':1,'500 000':1,'112':1,'111':1,'397':1,'6,9':1,'199':1,'4':1,
  // substansserier (oresund.se)
  '119':1,'130':1,'124':1,'2,6':1,'9,3':1,'2,5':1,'0,0':1,'6,4':1,'4,6':1,'0,9':1,'0,3':1,'116':1,'18,2':1,
  '8,7':1,'104':1,'109':1,'97':1,'121':1,'9,4':1,
  // Q3-2025 (Cision 3712433)
  '5 041':1,'5,8':1,'3,4':1,'9,97':1,'10,74':1,'6,79':1,'0,16':1,'453,1':1,'488,4':1,'308,8':1,'7,4':1,
  '114,70':1,'1 131':1,'124':1,'2,5':1,'278':1,'164':1,'3,2':1,'111':1,
  // beräknade (motor _s4u2-ores-byggdata.mjs)
  '14,5':1,'11,3':1,'12,3':1,'17,9':1,'123,30':1,'50,6':1,'74,5':1,'8,25':1,'9,3':1,'0,8':1,'116,2':1,
  '122,12':1,'1,191':1,'26,4':1,'138,4':1,'10,1':1,'8,943':1,'5,2':1,'84,6':1,'687,3':1,'44,57':1,'125,83':1,
  '15,3':1,'12,0':1,'9,9':1,'6,7':1,'0,3':1,'1,0':1,'0,2':1,'0,0':1,
  // avrundade former av fältvärden (1,167 → 1,17 · 1,770 → 1,77 · 5 284,1 → 5 284) + finansnetto jämförelseår
  '1,17':1,'1,77':1,'5 284':1,'13,0':1,
  // intilliggande kanonpar i löpande text (parsas som en mellanslagsform): "H1 2026 602,7" · "31 december 2025 118,00"
  '2026 602,7':1,'2025 118,00':1,
};
// normalisera textens tal: strippa först URL:er/länkar, sedan svenska tal (komma-decimal, mellanslag enbart som tresiffrigsgrupp)
const txtTalKalla = (post.body + ' ' + post.title + ' ' + post.description).replace(/\]\([^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ');
const bodyTal = new Set();
for (const m of txtTalKalla.matchAll(/(?<![\w,.])\d+(?: \d{3})+(?:,\d+)?|(?<![\w,.])\d+,\d+|(?<![\w,.])\d+/g)) bodyTal.add(m[0]);
const okExtra = new Set(['2026','2025','2024','2023','2','1','3','5','2007','528','5','2','2027','88','28','9','30','31','17','25','16','19','21','20','46','8','402','0','07','08','00','08:00','1 467','87','110','118','1470','1437','1430','1467','1131','1 131','2026-09-03','2026-09-30','2026-07-10','2025-10-09','9 oktober','30 juni','31 december','01','26','35','82','91','94','99','12','13','14','15','4 5 §','1 0','44','57','48','4189161','3712433','1772','4359632','4247470']);
const saknade = [...bodyTal].filter(t => t.length > 0 && !kanon[t] && !okExtra.has(t) && !/^\d{1,2}$/.test(t.replace(/[,\s]/g,'')) && !/^(19|20)\d{2}(-\d{2}(-\d{2})?)?$/.test(t) && !/^\d+:\d+$/.test(t) && !/^\d{13}$/.test(t));
saknade.length === 0 ? OK('talparitet: samtliga ' + bodyTal.size + ' talformer i kanonregistret') : F('tal ej i kanon: ' + saknade.slice(0, 25).join(' | '));

// --- 5. aritmetik: motorräknade påståenden ---
const num = s => parseFloat(s.replace(/\s/g, '').replace(',', '.'));
const ar = [
  ['premie 30 jun', 100 * (140.20 / 126 - 1), '11,3'],
  ['premie aug', 100 * (142.60 / 127 - 1), '12,3'],
  ['premie universumkurs', 100 * (145.40 / 127 - 1), '14,5'],
  ['substansrörelse ojust', 100 * (5720 / 5284 - 1), '8,25'],
  ['topp 2', 25.6 + 25.0, '50,6'],
  ['topp 5', 25.6 + 25.0 + 10.4 + 7.0 + 6.5, '74,5'],
  ['EK-brygga', 5284.1 - 336.4 + 0.9 + 602.7, '5 551,4'],
  ['substans efter 3,70', 127 - 3.70, '123,30'],
  ['premie efter utdelning', 100 * (145.40 / 123.30 - 1), '17,9'],
  ['BPS', 5551.4 / 45.457814, '122,12'],
  ['kurs/BPS', 145.40 / 122.12, '1,19'],
  ['Bilia 9 mån', 100 * (145.00 / 114.70 - 1), '26,4'],
  ['återköpsandel', 100 * 886945 / 45457814, '1,95'],
  ['återköp under vatten', Math.abs(100 * (140.20 / 156 - 1)), '10,1'],
  ['identitet P/B÷ROE', 1.167 / 0.1305, '8,94'],
  ['substans/aktie dec-25', 5284 / 45.457814, '116,2'],
  ['substans/aktie jun-26', 5720 / 45.457814, '125,8'],
];
for (const [namn, v, exp] of ar) {
  const s = v.toFixed(2).replace('.', ',');
  (Math.abs(v - num(exp)) < 0.15 || s.startsWith(exp.replace(/,\d+$/, '').replace(/(\d),(\d)$/, '$1$2').slice(0, -1) + '') || Math.abs(v - num(exp)) / Math.abs(num(exp)) < 0.01)
    ? OK('aritmetik ' + namn + ' = ' + s + ' (påstått ' + exp + ')')
    : F('aritmetik ' + namn + ': motor ' + s + ' mot text ' + exp);
}
// textnärvaro för nyckelberäkningar
for (const s of ['14,5 procent','50,6 procent','74,5 procent','123,30','17,9 procent','8,25 procent','+26,4 procent','116,2 kronor','122,12 kronor','1,95 procent']) {
  post.body.includes(s) || post.title.includes(s) ? OK('påståendetal i text: ' + s) : F('påståettal saknas i text: ' + s);
}

// --- 6. korslänkar: sökvägar som syskonpaket redan använder ---
const interna = [...post.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const syskon = fs.readdirSync('data/blogg-utkast/kvartal/2026-q3').filter(f => f.startsWith('sa-laser-du-') && f.endsWith('.json') && f !== 'sa-laser-du-oresund-q3-2026.json');
let syskonPaths = new Set();
for (const f of syskon) {
  try { const b = JSON.parse(fs.readFileSync('data/blogg-utkast/kvartal/2026-q3/' + f, 'utf8')).body || '';
    for (const m of b.matchAll(/\]\((\/[^)]+)\)/g)) syskonPaths.add(m[1]);
  } catch {}
}
const ogiltiga = interna.filter(p => !syskonPaths.has(p));
ogiltiga.length === 0 ? OK('korslänkar ' + interna.length + ' st — alla använda av syskonpaket') : F('korslänkar ej belagda hos syskon: ' + ogiltiga.join(', '));
interna.length >= 10 ? OK('korslänkantal ' + interna.length + ' >= 10') : W('få korslänkar: ' + interna.length);

// --- 7. externa källor live ---
const externa = [...post.body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
for (const u of externa) {
  try {
    const code = execSync('curl -s -o /dev/null -w "%{http_code}" --max-time 25 -L -A "Mozilla/5.0" "' + u + '"').toString().trim();
    code === '200' ? OK('extern 200: ' + u.slice(0, 72)) : F('extern ' + code + ': ' + u);
  } catch (e) { F('extern kunde inte hämtas: ' + u); }
}
externa.length >= 4 ? OK('externt antal ' + externa.length + ' >= 4') : W('få externa källor');

// --- 8. sökord ---
const kw = 'Investment AB Öresund';
(post.title.includes(kw) ? OK('sökord i title') : F('sökord saknas i title'));
(post.description.includes(kw) ? OK('sökord i description') : F('sökord saknas i description'));
(post.body.split('\n')[0].includes('Öresund') ? OK('bolagsnamn i ingress') : F('bolagsnamn ej i ingressraden'));
(post.body.includes('substansvärd') ? OK('substans-ord i body') : F('substans-ord saknas'));
/fredagen 9 oktober|9 oktober kl 08:00/.test(post.body) ? OK('rappdag i body') : F('rappdag saknas i body');

// --- 9. duplikat ---
const dup = fs.readdirSync('data/blogg-utkast/kvartal/2026-q3').filter(f => /ores/i.test(f) && f !== 'sa-laser-du-oresund-q3-2026.json' && f !== '_oresund-body.md');
dup.length === 0 ? OK('duplikatfrihet: inga andra oresund-filer') : F('duplikat: ' + dup.join(', '));

// --- 10. kalenderkonsistens ---
const kal = JSON.parse(fs.readFileSync('data/blogg-utkast/kvartal/2026-q3/kalender-finans.json', 'utf8'));
const ores = kal.bolag.find(b => b.ticker === 'ORES.ST');
ores && ores.rapportfenster.includes('2026-10-09') ? OK('kalender-finans: rapportfönster 2026-10-09 överensstämmer') : F('kalenderdivergens: ' + (ores && ores.rapportfenster));

console.log('\n=== KVD sa-laser-du-oresund-q3-2026 ===');
console.log('kontroller:', kontroller + ar.length, '| fel:', fel, '| varningar:', varn);
console.log(fel === 0 && varn === 0 ? 'KVD GRÖN — ALLT GODKÄNT' : (fel === 0 ? 'KVD GUL — ' + varn + ' varning(ar)' : 'KVD RÖD — ' + fel + ' fel'));
process.exit(fel === 0 ? 0 : 1);
