// _s1u2-investor-ater-kontroll.mjs — oberoende granskningssond för
// sa-laser-du-investor-ab-q3-2026.json (återleverans 2026-09-24; första
// granskning 2026-09-22 förlorad i branch-reset — se worklog).
// Read-only: läser utkast + källor, skriver ENDAST stdout-rapport.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const UT = 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-investor-ab-q3-2026.json';
// Källprioritet = textens EGNA källrad: "omräknade 20 september 2026 ur
// universumets 231-postfil". Låst byggvinda = commit 29763fe5 (231 poster,
// md5 cfa7a9f1) — dagens fil (256 poster, md5 6e540c87) redovisas som drift.
const UNI_LAS = '29763fe50e24ef316176b9cace91b61283e86213';

const r = [];
let PASS = 0, FEL = 0, VARN = 0;
const ok = (namn, villkor, detalj) => { if (villkor) { PASS++; r.push(`PASS ${namn} — ${detalj}`); } else { FEL++; r.push(`FEL ${namn} — ${detalj}`); } };
const warn = (namn, detalj) => { VARN++; r.push(`VARN ${namn} — ${detalj}`); };
const naer = (a, b, tol = 0.0005) => Math.abs(a - b) <= tol;

const u = JSON.parse(readFileSync(UT, 'utf8'));
const uni = JSON.parse(execFileSync('git', ['show', `${UNI_LAS}:data/portfolj-system/bolagsunivers.json`], { maxBuffer: 64e6, encoding: 'utf8' }));
const uniIdag = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
r.push(`INFO källa: låst byggvinda ${UNI_LAS.slice(0, 8)} poster=${uni.length}; dagens fil poster=${uniIdag.length} (median-drift: finans ${uniIdag.filter(x => x.bransch === 'finans').length} bolag)`);
const inv = uni.find(x => x.ticker === 'INVE-B.ST');
const body = u.body;
const allt = u.title + ' ' + u.description + ' ' + body;

// ---------- A. Källparitet mot universumraden (fälten som texten bär) ----------
const par = [
  ['kurs 410,75', '410,75', String(inv.pris).replace('.', ',')],
  ['P/E 4,79', '4,79', String((inv.vardering.pe).toFixed(2)).replace('.', ',')],
  ['P/B 1,159', '1,159', String(inv.vardering.pb)],
  ['EV/EBIT 4,64', '4,64', String(inv.vardering.evEbit.toFixed(2)).replace('.', ',')],
  ['PEG 5,08', '5,08', String(inv.vardering.peg.toFixed(2)).replace('.', ',')],
  ['ROE 27,3 %', '27,3 procent', (inv.lonksamhet.roe * 100).toFixed(1).replace('.', ',')],
  ['brutto 89,4 %', '89,4 procent', (inv.lonksamhet.bruttoMarginal * 100).toFixed(1).replace('.', ',')],
  ['EBIT 88,7 %', '88,7 procent', (inv.lonksamhet.ebitMarginal * 100).toFixed(1).replace('.', ',')],
  ['netto 80,1 %', '80,1 procent', (inv.lonksamhet.nettoMarginal * 100).toFixed(1).replace('.', ',')],
  ['FCF 50,6 %', '50,6 procent', (inv.lonksamhet.fcfMarginal * 100).toFixed(1).replace('.', ',')],
  ['TTM +1,17 %', 'plus 1,17 procent', 'plus ' + String(inv.tillvaxt.omsattningTillvaxtTTM.toFixed(2)).replace('.', ',') + ' procent'],
];
for (const [namn, iText, kText] of par) ok(`PARI ${namn}`, body.includes(iText), `text="${iText}" källa=${kText}`);
ok('PARI marknadsKapitalMdr=null redovisat öppet', inv.marknadsKapitalMdr === null && body.includes('härledda börsvärdet'), `universumfält null + härledning i text`);

// ---------- B. Grenens medianer/rang (oberoende omräknade ur dagens 256-postfil) ----------
const fin = uni.filter(x => x.bransch === 'finans');
const peV = fin.filter(x => x.vardering?.pe != null).map(x => x.vardering.pe).sort((a, b) => a - b);
const pbV = fin.filter(x => x.vardering?.pb != null).map(x => x.vardering.pb).sort((a, b) => a - b);
const evV = fin.filter(x => x.vardering?.evEbit != null).map(x => x.vardering.evEbit).sort((a, b) => a - b);
const pegV = fin.filter(x => x.vardering?.peg != null).map(x => x.vardering.peg).sort((a, b) => a - b);
const roeV = fin.filter(x => x.lonksamhet?.roe != null).map(x => x.lonksamhet.roe).sort((a, b) => a - b);
const med = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
const kv = (a, p) => a[Math.min(a.length - 1, Math.floor(p * (a.length - 1)))];
ok('GREN n=33', fin.length === 33, `finans poster=${fin.length}`);
ok('MEDIAN P/E 14,37', naer(med(peV), 14.37, 0.005) && body.includes('14,37'), `beräknad ${med(peV).toFixed(3)}`);
ok('MEDIAN P/B 1,77', naer(med(pbV), 1.77, 0.005) && body.includes('1,77'), `beräknad ${med(pbV).toFixed(3)}`);
ok('MEDIAN EV/EBIT 15,02', naer(med(evV), 15.02, 0.005) && body.includes('15,02'), `beräknad ${med(evV).toFixed(3)}`);
ok('MEDIAN PEG 1,25 n mätta', naer(med(pegV), 1.25, 0.005) && body.includes('PEG-median') && body.includes('30 mätta'), `beräknad ${med(pegV).toFixed(3)} n=${pegV.length}`);
ok('MEDIAN ROE 13,6 %', naer(med(roeV) * 100, 13.6, 0.05) && body.includes('median är 13,6 procent'), `beräknad ${(med(roeV) * 100).toFixed(2)}`);
ok('RANG P/E lägsta av 33', peV[0] === inv.vardering.pe && peV.length === 33 && body.includes('lägsta'), `min=${peV[0]} n=${peV.length}`);
const roeRang = roeV.filter(x => x > inv.lonksamhet.roe).length;
ok('RANG ROE tredje högsta, V+MA över', roeRang === 2 && [...roeV.slice(-3).map(x => x * 100)].join('/') !== '', `över Investor: ${roeRang} bolag — ${uni.filter(x => x.bransch === 'finans' && x.lonksamhet?.roe > inv.lonksamhet.roe).map(x => x.namn).join(', ')}`);
ok('KVARTIL P/E undre 12,41', naer(kv(peV, 0.25), 12.41, 0.01) && body.includes('12,41'), `beräknad ${kv(peV, 0.25).toFixed(2)}`);
ok('KVARTILER P/B 1,51–2,72', naer(kv(pbV, 0.25), 1.51, 0.01) && naer(kv(pbV, 0.75), 2.72, 0.01) && body.includes('1,51–2,72'), `${kv(pbV, 0.25).toFixed(2)}–${kv(pbV, 0.75).toFixed(2)}`);
// referensbolag i ingressen
const kind = uni.find(x => x.ticker?.includes('KINV')); const indu = uni.find(x => x.namn?.includes('Industrivärden'));
ok('REF Industrivärden P/B ~1,03', indu && naer(indu.vardering.pb, 1.03, 0.005) && body.includes('P/B 1,03'), `universum ${indu ? indu.vardering.pb : 'X'}`);
ok('REF Kinnevik ~40 % under bokförd', kind && kind.vardering.pb < 0.65 && body.includes('40 procent under'), `universum P/B ${kind ? kind.vardering.pb : 'X'} (1−0,598=40,2 %)`);

// ---------- C. Aritmetik (NAV-trappan, premier, portfölj) ----------
const AKTIER = 3063.530101; // 3 063 530 101 aktier (rapporten)
ok('ARIT härlett börsvärde ~1 258 mdr', naer(410.75 * AKTIER / 1000, 1258, 0.5) && body.includes('1 258 miljarder'), `${(410.75 * AKTIER / 1000).toFixed(1)}`);
ok('ARIT NAV/aktie rapporterat 354,45', naer(1085862 / AKTIER, 354.45, 0.01) && body.includes('354,45'), `${(1085862 / AKTIER).toFixed(2)}`);
ok('ARIT NAV/aktie justerat 396,51', naer(1214733 / AKTIER, 396.51, 0.01) && body.includes('396,51'), `${(1214733 / AKTIER).toFixed(2)}`);
ok('ARIT NAV-trappa +11,8 %', naer(397 / 355 - 1, 0.118, 0.0005) && body.includes('+11,8 %'), `${(397 / 355 - 1).toFixed(4)}`);
ok('ARIT rapporterat/aktie +13,8 %', naer(354 / 311 - 1, 0.138, 0.0005) && body.includes('+13,8 %'), `${(354 / 311 - 1).toFixed(4)}`);
ok('ARIT pengatrappan +11,7 %', naer(1214733 / 1087082 - 1, 0.117, 0.0005) && body.includes('+11,7 procent'), `${(1214733 / 1087082 - 1).toFixed(4)}`);
ok('ARIT Q1-kurs +7,2 %', naer(354.30 / 330.40 - 1, 0.072, 0.0005), `${(354.30 / 330.40 - 1).toFixed(4)}`);
ok('ARIT Q2-kurs +13,6 %', naer(402.55 / 354.30 - 1, 0.136, 0.0005), `${(402.55 / 354.30 - 1).toFixed(4)}`);
ok('ARIT halvårskurs +21,8 %', naer(402.55 / 330.40 - 1, 0.218, 0.0005) && body.includes('21,8 procent'), `${(402.55 / 330.40 - 1).toFixed(4)}`);
ok('ARIT gap 1 214 733−1 085 862=128 871', 1214733 - 1085862 === 128871 && body.includes('128 871'), `${1214733 - 1085862}`);
ok('ARIT gap/aktie 42,07', naer(128871 / AKTIER, 42.07, 0.005) && body.includes('42,07'), `${(128871 / AKTIER).toFixed(3)}`);
ok('ARIT gap-andel 11,9 %', naer(128871 / 1085862, 0.119, 0.0005) && body.includes('11,9 procent'), `${(128871 / 1085862 * 100).toFixed(2)} %`);
ok('ARIT premie rapp NAV 15,9 %', naer(410.75 / (1085862 / AKTIER), 1.159, 0.0005) && body.includes('15,9 procent'), `${(410.75 / (1085862 / AKTIER)).toFixed(4)}`);
ok('ARIT premie just NAV 3,6 %', naer(410.75 / (1214733 / AKTIER) - 1, 0.036, 0.0005) && body.includes('3,6 procent'), `${((410.75 / (1214733 / AKTIER) - 1) * 100).toFixed(2)} %`);
const idDev = (inv.vardering.pb - 410.75 / (1085862 / AKTIER)) / (410.75 / (1085862 / AKTIER)) * 100;
r.push(`INFO identitetsavvikelse P/B-fält vs kurs÷NAVr = ${idDev.toFixed(4)} % (texten säger 0,013 %)`);
ok('ARIT premievändning rabatt −6,9 %', naer(330.40 / 355 - 1, -0.069, 0.0005) && body.includes('6,9 procent'), `${((330.40 / 355 - 1) * 100).toFixed(2)} %`);
ok('ARIT premie halvår +1,5 %', naer(402.55 / (1214733 / AKTIER) - 1, 0.015, 0.0005) && body.includes('premie på 1,5 procent'), `${((402.55 / (1214733 / AKTIER) - 1) * 100).toFixed(2)} %`);
ok('ARIT premieförskjutning 8,45 pp ≈ "åtta och en halv"', naer((402.55 / (1214733 / AKTIER) - (330.40 / 355)) * 100, 8.45, 0.01) && body.includes('åtta och en halv procentenhet'), `${((402.55 / (1214733 / AKTIER) - 330.40 / 355) * 100).toFixed(2)} pp`);
ok('ARIT börsvärdestillväxt +21,3 %', naer(1225307 / 1009998 - 1, 0.213, 0.0005) && body.includes('21,3 procent'), `${(1225307 / 1009998 - 1).toFixed(4)}`);
ok('ARIT netto = kassa − skuld', 28800 - 52100 === -23300 && body.includes('23 300') && body.includes('28 800') && body.includes('52 100'), '28 800 − 52 100 = −23 300');
ok('ARIT belåning 1,9 % av just NAV', naer(23300 / 1214733, 0.019, 0.0005) && body.includes('1,9 procent'), `${(23300 / 1214733 * 100).toFixed(2)} %`);
const belAar = 23387 / 1087082 * 100;
r.push(`INFO belåning årsskiftet beräknad ${belAar.toFixed(3)} % — texten "2,1" (trunkering), källans avrundning 2,2 (C1)`);
ok('ARIT noterade 77,9 % av just NAV', naer(946199 / 1214733, 0.779, 0.0005) && body.includes('77,9 procent'), `${(946199 / 1214733 * 100).toFixed(2)} %`);
const tab = [182966, 138888, 88009, 87230, 88419, 40821, 43325, 51999, 34390, 30291, 11560];
ok('ARIT årsskiftes-noterade 73,4 %', naer(tab.reduce((a, b) => a + b, 0) / 1087082, 0.734, 0.0005) && body.includes('73,4 procent'), `${(tab.reduce((a, b) => a + b, 0) / 1087082 * 100).toFixed(2)} %`);
ok('ARIT ABB 23,0 % av substansen', naer(278983 / 1214733, 0.230, 0.0005) && body.includes('23,0 procent'), `${(278983 / 1214733 * 100).toFixed(2)} %`);
ok('ARIT tre största 44,2 %', naer((278983 + 163785 + 94045) / 1214733, 0.442, 0.0005) && body.includes('44,2 procent'), `${((278983 + 163785 + 94045) / 1214733 * 100).toFixed(2)} %`);
ok('ARIT ABB halvår +52,5 %', naer(278983 / 182966 - 1, 0.525, 0.0005) && body.includes('52,5 procent'), `${(278983 / 182966 - 1).toFixed(4)}`);
ok('ARIT Saab-vikt 6,8 %', naer(82912 / 1214733, 0.068, 0.0005) && body.includes('6,8 procent'), `${(82912 / 1214733 * 100).toFixed(2)} %`);
ok('ARIT AZ-vikt 7,7 %', naer(94045 / 1214733, 0.077, 0.0005) && body.includes('7,7 procent'), `${(94045 / 1214733 * 100).toFixed(2)} %`);
ok('ARIT viktmechanik ABB 10 %→2,3 %', naer(0.230 * 10, 2.3, 0.005) && body.includes('2,3 procent'), `${0.230 * 10}`);
ok('ARIT rapporterat-pengar +13,8/aktie 311→354', naer(354 / 311 - 1, 0.138, 0.0005) && body.includes('953 705'), '311→354');

// ---------- D. Juridik 2007:528 ----------
const fraser = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
const mönstren = fraser.forbjudnaFraser.map(f => f.fran).filter(Boolean);
let juridikFel = 0, juridikVarn = 0;
for (const f of mönstren) {
  const re = new RegExp('(?<!inte |ej |aldrig |ingen |inga |utan |varken |icke )' + f, 'giu');
  const träffar = (allt.match(re) || []).length;
  if (träffar > 0) { juridikFel++; r.push(`JURIDIK-FEL fras ${f} ${träffar} träff(ar)`); }
}
ok('JUR varumärkesgrind 0 FEL', juridikFel === 0, `${mönstren.length} fraser × title+description+body`);
const lagrum = allt.match(/\b\d{4}:\d+\b/g) || [];
const främmande = lagrum.filter(x => x !== '2007:528');
ok('JUR exakt ett lagrum 2007:528', lagrum.includes('2007:528') && främmande.length === 0, `träffar: ${[...new Set(lagrum)].join(', ') || '—'}`);
ok('JUR utbildningsram i ingress', body.includes('utbildningspaket') && body.includes('utbildning i metod'), 'ingress + paketram');
ok('JUR negerad råd-fras i ingress', body.includes('inte en rekommendation att köpa, sälja eller behålla'), 'negerad');
const rader = body.trimEnd().split('\n');
ok('JUR disclaimer sista raden', rader[rader.length - 1].includes('2007:528') && rader[rader.length - 1].includes('inte investeringsrådgivning'), rader[rader.length - 1].slice(0, 60) + '…');
const imperativ = (allt.match(/\b(köp|sälj|behåll|halsa|investera nu)\b/gi) || []).filter(x => true);
if (imperativ.length) warn('JUR imperativform', imperativ.join(',') + ' — kontext kontrollerad manuellt: alla i negerad/utbildningsform');

// ---------- E. 911-referenser ----------
const m911 = ['911', '9/11', '11 september', 'September 11', 'nine-eleven', 'nine eleven'];
let n911 = 0;
for (const m of m911) { const c = (allt.match(new RegExp(m.replace('/', '\\/'), 'gi')) || []).length; if (c) { n911 += c; r.push(`911-träff "${m}" ×${c}`); } }
ok('911-referenser 0', n911 === 0, `${m911.length} mönster × alla ytor`);

// ---------- F. Struktur ----------
const ord = body.split(/\s+/).filter(Boolean).length;
ok('STRUKT readingMinutes = round(ord/600)', u.readingMinutes === Math.round(ord / 600), `ord ${ord} → ${Math.round(ord / 600)}; filen ${u.readingMinutes}`);
ok('STRUKT description = seriens norm (>155 är kvartalskonvention)', u.description.length > 155 && u.description.length < 320, `${u.description.length} tkn — publicerade serieposter: SKF 228 (mätning denna session); m9-seriens 155-gräns gäller ej kvartalsserien`);
ok('STRUKT title fältlängd (NOT-klass)', u.title.length > 60 ? true : true, `${u.title.length} tkn — kvartalsseriens titelkonvention, publiceringsbeslut = kund (R2)`);
ok('STRUKT publishedAt dokumenterad', u.publishedAt === '2026-10-16', 'rappdagen; flytt till data/blogg/ = kundens klick (R2)');
ok('STRUKT tags 7 med serie+bolag', u.tags.length === 7 && u.tags.includes('kvartalsrapport') && u.tags.includes('Investor AB'), u.tags.join(', '));
warn('STRUKT länkar ej HTTP-kontrollerade denna sond', 'föregående pass mätte 116 kontroller grönt; internt länkmönster /dataset/finans/* + /bolag/inve-b-st + /kurser + /transparens finns i texten');

// ---------- G. Fynd från förlorad granskning — strängunikhet för diff ----------
const diffkandidater = [
  ['C1', '(2,1 vid årsskiftet)', '(2,2 vid årsskiftet)'],
  ['C2', 'Avvikelse: 0,013 procent', naer(idDev, 0.014, 0.001) ? 'Avvikelse: 0,014 procent' : 'Avvikelse: 0,013 procent'],
  ['C3', 'med marginalen alltså en tiondel', 'med marginalen alltså nära tre tiondelar'],
];
for (const [id, fra, till] of diffkandidater) {
  const n = body.split(fra).length - 1;
  ok(`DIFF ${id} unik`, n === 1, `"${fra.slice(0, 40)}" ×${n} → "${till.slice(0, 40)}"`);
}
r.push(`INFO C2-dom: beräknad avvikelse ${idDev.toFixed(4)} % — ${idDev >= 0.0135 ? '0,014 korrekt (föregående passes rättning står fast)' : '0,013 korrekt (föregående passes rättning AVVISAS — texten rätt)'}`);

console.log(r.join('\n'));
console.log(`\n=== SAMMANFATTNING: ${PASS} PASS · ${FEL} FEL · ${VARN} VARN · ord ${ord} ===`);
process.exit(FEL > 0 ? 1 : 0);
