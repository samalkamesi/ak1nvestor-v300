// KVD för s4-u3: SCA Q3-2026-läspaket — körs mot utkastfilen och källfilen
import fs from 'node:fs';
const paketSokvag = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-sca-q3-2026.json';
const uni = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(uni) ? uni : (uni.bolag || uni.universum || Object.values(uni).find(Array.isArray));
const s = list.find(b => b.ticker === 'SCA-B.ST');
const mat = list.filter(b => b.bransch === 'material');
const j = JSON.parse(fs.readFileSync(paketSokvag, 'utf8'));
let fel = 0, varn = 0, pass = 0;
const F = (namn, villkor, detalj) => { if (villkor) { pass++; } else { fel++; console.log('FEL:', namn, detalj || ''); } };
const W = (namn, villkor, detalj) => { if (!villkor) { varn++; console.log('VARNING:', namn, detalj || ''); } };

// 1. Struktur
F('JSON giltig', true);
F('9 fält exakt', JSON.stringify(Object.keys(j)) === JSON.stringify(['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body']), Object.keys(j).join(','));
F('slug', j.slug === 'sa-laser-du-sca-q3-2026');
F('publishedAt = dagen före rappdagen', j.publishedAt === '2026-10-22');
F('title 140–240 tkn', j.title.length >= 140 && j.title.length <= 240, j.title.length + ' tkn');
F('description 300–460 tkn', j.description.length >= 300 && j.description.length <= 460, j.description.length + ' tkn');

// 2. Ord + readingMinutes (600-ordskontraktet)
const ord = (j.body.match(/\S+/g) || []).length;
F('ord i spann 2400–3400', ord >= 2400 && ord <= 3400, 'ord=' + ord);
F('readingMinutes = round(ord/600) = 5', j.readingMinutes === Math.round(ord / 600) && j.readingMinutes === 5, j.readingMinutes + ' mot ' + Math.round(ord / 600));

// 3. Teckenhygien
F('mjuka bindestreck = 0', !/[\u00AD\u2010\u2011]/.test(j.body + j.title + j.description));
F('tabbar = 0', !/\t/.test(j.body));

// 4. Juridikgrind
console.log('rådträffar:', JSON.stringify((j.body.match(/[^\s]{0,25}(köp|sälj)[^\s]{0,25}/gi) || [])));
const bodyLower = j.body.toLowerCase();
for (const nk of ['inte en rekommendation att köpa, sälja eller behålla', 'inga köp-, sälj- eller hållningsrekommendationer förekommer']) F('nekande kontext finns: "' + nk.slice(0, 30) + '…"', bodyLower.includes(nk));
const lagrum = j.body.match(/lagen \(2007:528\)/g) || [];
F('exakt ett lagrum 2007:528', lagrum.length === 1, 'antal=' + lagrum.length);
F('disclaimer-sista-stycket', j.body.trimEnd().endsWith('kundens beslut.*') && j.body.includes('inte investeringsrådgivning'));
F('inga andra lagrum', !/(2022:260|2022:261|1985:716|2005:59|2022:482)/.test(j.body));
F('inga rådverb-formuleringar (köp denna aktie etc)', !/köp (denna|den här) aktien|rekommenderar (att )?köp/i.test(j.body));

// 5. Länkar
const internal = [...new Set((j.body.match(/\]\((\/[^)]+)\)/g) || []).map(x => x.slice(2, -1)))];
console.log('unika interna länkar:', internal.length);
F('minst 19 interna länkar', internal.length >= 19, 'antal=' + internal.length);
F('0 utkastlänkar', !internal.some(l => l.includes('blogg-utkast')));
const http = await Promise.all(internal.map(async l => [l, await fetch('http://localhost:3000' + l).then(r => r.status).catch(() => 0)]));
for (const [l, st] of http) F('länk 200: ' + l, st === 200, 'status=' + st);
const externa = [...new Set((j.body.match(/\]\((https?:\/\/[^)]+)\)/g) || []).map(x => x.slice(2, -1)))];
F('0 externa markdown-länkar', externa.length === 0, externa.join(' '));

// 6. Källtalsparitet mot universumsfilen
const talpar = [
  ['P/E-fält 36,503', '36,503'], ['P/B-fält 0,801', '0,801'], ['EV/EBIT-fält 108,4', '108,4'], ['PEG-fält 0,45', '0,45'],
  ['fcfYield 1,53', '1,53'], ['ROE 2,17', '2,17'], ['ROIC-fält 0,83', '0,83'], ['brutto 69,35', '69,35'],
  ['EBIT 3,90', '3,90'], ['netto 9,70', '9,70'], ['fcfMarg 5,44', '5,44'], ['skuld 0,1536', '0,1536'],
  ['pris 115,35', '115,35'], ['mcap 81,0', '81,0'], ['TTM −1,4', '−1,4'], ['prognos 36,47', '36,47'],
  ['omsCAGR minus 0,59', 'minus 0,59 procent per år'], ['resCAGR minus 22,26', 'minus 22,26 procent per år'],
];
for (const [namn, iText] of talpar) F('källtal i body: ' + namn, j.body.includes(iText));
F('källtalen stämmer med filen: pe/pb/evEbit/peg', Math.abs(s.vardering.pe - 36.503) < 0.001 && Math.abs(s.vardering.pb - 0.801) < 0.001 && Math.abs(s.vardering.evEbit - 108.416) < 0.001 && Math.abs(s.vardering.peg - 0.45) < 0.001);
F('källtalen stämmer med filen: marginaler/roe/roic/skuld/pris/mcap', Math.abs(s.lonksamhet.roe - 0.0217) < 1e-9 && Math.abs(s.lonksamhet.roic - 0.0083) < 1e-9 && Math.abs(s.lonksamhet.bruttoMarginal - 0.6935) < 1e-9 && Math.abs(s.lonksamhet.ebitMarginal - 0.039) < 1e-9 && Math.abs(s.lonksamhet.nettoMarginal - 0.097) < 1e-9 && Math.abs(s.lonksamhet.fcfMarginal - 0.0544) < 1e-9 && Math.abs(s.stabilitet.skuldEgenkapital - 0.1536) < 1e-9 && Math.abs(s.pris - 115.35) < 1e-9 && Math.abs(s.marknadsKapitalMdr - 81.015) < 1e-9);

// 7. Aritmetik (oberoende omräkning)
const pe = s.vardering.pe, pb = s.vardering.pb, roe = s.lonksamhet.roe, m = s.lonksamhet.ebitMarginal;
const oms = s.serier.omsattning, res = s.serier.resultat;
const base = oms[3] / 1e6, n25 = res[3] / 1e6;
const ber = {
  ident: pb / roe, identDiff: (pb / roe / pe - 1) * 100,
  abs: pe * n25 / 1000, absRes: (pe * n25 / 1000 / s.marknadsKapitalMdr - 1) * 100,
  implNetto: s.marknadsKapitalMdr / pe,
  peDirekt: s.marknadsKapitalMdr * 1000 / n25,
  pegConv: pe / (s.tillvaxt.prognosTillvaxt * 100), pegImpl: pe / s.vardering.peg,
  ek: s.marknadsKapitalMdr / pb, skuld: s.marknadsKapitalMdr / pb * s.stabilitet.skuldEgenkapital,
  ebit: base * m, fcf1: base * s.lonksamhet.fcfMarginal, fcf2: s.marknadsKapitalMdr * 1000 * s.vardering.fcfYield,
  roic: base * m / ((s.marknadsKapitalMdr / pb) * (1 + s.stabilitet.skuldEgenkapital) * 1000),
  vikt: 1 / (3 * m), mult: pe / (1 + s.tillvaxt.prognosTillvaxt),
  roeKors: s.marknadsKapitalMdr / pe * 1000 / (s.marknadsKapitalMdr / pb * 1000),
};
const arit = [
  ['identitet 36,91', '36,91'], ['identitetsskillnad 1,12', '1,12 procent'], ['omvänd identitet 0,792', '0,792'],
  ['implicit EPS 3,16', '3,16'], ['aktier 702', '702 miljoner'], ['vinstavkastning 2,71', '2,71 procent'],
  ['absolut 117,0', '117,0 miljarder'], ['absolutresidual −44,4', 'minus 44,4 procent'],
  ['implicit netto 2 219', '2 219 miljoner'], ['implicit lägre 31 %', '31 procent lägre'],
  ['P/E direkt 25,3', '25,3'],
  ['PEG-konvention 1,00', '**1,00**'], ['PEG implicit 81,1', '**81,1 procent**'],
  ['EK 101,1', '**101,1 miljarder**'], ['skuld 15,5', '**15,5 miljarder**'], ['EV 116,7', '**116,7 miljarder**'],
  ['EBIT 797', '**797 miljoner**'], ['EV/EBIT-kedja 146,5', '**146,5**'],
  ['FCF marginalväg 1 111', '**1 111 miljoner**'], ['FCF yieldväg 1 240', '**1 240 miljoner**'],
  ['FCF-kvot 1,12', 'kvot **1,12**'], ['yield omräknad 1,37', '1,37'],
  ['ROIC omräknad 0,68', '0,68'], ['ROE-korskontroll 2,19', '2,19'],
  ['Essity-vikt 8,55', '**8,55**'], ['multiplövning 26,7', '**26,7**'],
  ['trappa brutto→EBIT 65,4', '65,4 procentenheter'], ['trappa EBIT→netto 5,80', '5,80 procentenheter över rörelsemarginalen'],
  ['1 pp = 204', '204 miljoner'], ['3 % = 24', '24 miljoner'], ['intäktsekvivalent 25,6', '25,6 procents'],
];
for (const [namn, iText] of arit) F('aritmetik i body: ' + namn, j.body.includes(iText));
F('BERÄKNING identitet', Math.abs(ber.ident - 36.91) < 0.01, ber.ident.toFixed(3));
F('BERÄKNING identitetsskillnad 1,12 %', Math.abs(ber.identDiff - 1.12) < 0.02, ber.identDiff.toFixed(3));
F('BERÄKNING absolut 117,0 mdr', Math.abs(ber.abs - 117.0) < 0.1, ber.abs.toFixed(2));
F('BERÄKNING absolutresidual +44,42 % (fältet implicerar)', Math.abs(ber.absRes - 44.42) < 0.05, ber.absRes.toFixed(2));
F('BERÄKNING implicit netto 2 219 Mkr', Math.abs(ber.implNetto * 1000 - 2219) < 1, (ber.implNetto * 1000).toFixed(1));
F('BERÄKNING P/E direkt 25,3', Math.abs(ber.peDirekt - 25.28) < 0.05, ber.peDirekt.toFixed(2));
F('BERÄKNING PEG-konvention 1,00', Math.abs(ber.pegConv - 1.0009) < 0.001, ber.pegConv.toFixed(4));
F('BERÄKNING PEG implicit 81,1', Math.abs(ber.pegImpl - 81.1) < 0.1, ber.pegImpl.toFixed(2));
F('BERÄKNING EV/EBIT-kedja 146,5', Math.abs((ber.ek + ber.skuld) * 1000 / ber.ebit - 146.5) < 0.1, ((ber.ek + ber.skuld) * 1000 / ber.ebit).toFixed(2));
F('BERÄKNING kedjekvot 1,35', Math.abs(((ber.ek + ber.skuld) * 1000 / ber.ebit) / s.vardering.evEbit - 1.351) < 0.01);
F('BERÄKNING FCF-par 1 111/1 240', Math.abs(ber.fcf1 - 1111.2) < 1 && Math.abs(ber.fcf2 - 1239.5) < 1, ber.fcf1.toFixed(1) + '/' + ber.fcf2.toFixed(1));
F('BERÄKNING FCF-kvot 1,12', Math.abs(ber.fcf2 / ber.fcf1 - 1.116) < 0.005, (ber.fcf2 / ber.fcf1).toFixed(3));
F('BERÄKNING ROIC 0,68 %', Math.abs(ber.roic * 100 - 0.683) < 0.01, (ber.roic * 100).toFixed(3));
F('BERÄKNING ROE-kors 2,19', Math.abs(ber.roeKors * 100 - 2.194) < 0.01, (ber.roeKors * 100).toFixed(3));
F('BERÄKNING marginalvikt 8,55', Math.abs(ber.vikt - 8.547) < 0.01, ber.vikt.toFixed(3));
F('BERÄKNING multiplövning 26,7', Math.abs(ber.mult - 26.747) < 0.05, ber.mult.toFixed(3));
F('BERÄKNING trappor 65,45/5,80', Math.abs((s.lonksamhet.bruttoMarginal - m) * 100 - 65.45) < 0.01 && Math.abs((s.lonksamhet.nettoMarginal - m) * 100 - 5.80) < 0.01);

// 8. Serier + steg + marginaler
for (const t of ['20 794', '18 081', '20 232', '20 427', '6 821', '3 625', '3 639', '3 205']) F('serietal ' + t, j.body.includes(t));
for (const t of ['−13,05', '+11,90', '+0,96']) F('intäktssteg ' + t, j.body.includes(t));
for (const t of ['−46,85', '+0,39', '−11,93']) F('resultatsteg ' + t, j.body.includes(t));
F('marginalserie', j.body.includes('32,80 → 20,05 → 17,99 → 15,69'));
const stegO = oms.slice(1).map((v, i) => (v / oms[i] - 1) * 100);
const stegR = res.slice(1).map((v, i) => (v / res[i] - 1) * 100);
F('BERÄKNING intäktssteg', Math.abs(stegO[0] + 13.05) < 0.01 && Math.abs(stegO[1] - 11.90) < 0.01 && Math.abs(stegO[2] - 0.96) < 0.01, stegO.map(x => x.toFixed(2)).join('/'));
F('BERÄKNING resultatsteg', Math.abs(stegR[0] + 46.85) < 0.01 && Math.abs(stegR[1] - 0.39) < 0.01 && Math.abs(stegR[2] + 11.93) < 0.01, stegR.map(x => x.toFixed(2)).join('/'));
const ms = res.map((v, i) => v / oms[i] * 100);
F('BERÄKNING marginalserie', Math.abs(ms[0] - 32.80) < 0.01 && Math.abs(ms[3] - 15.69) < 0.01, ms.map(x => x.toFixed(2)).join('/'));
F('CAGR oms −0,59 %', Math.abs(((oms[3] / oms[0]) ** (1 / 3) - 1) * 100 + 0.59) < 0.01);
F('CAGR res −22,26 %', Math.abs(((res[3] / res[0]) ** (1 / 3) - 1) * 100 + 22.26) < 0.01);

// 9. Medianer ur filen (n och värden) + positioner
function med(a){ const v = a.filter(x => x != null).sort((x,y)=>x-y); if(!v.length) return null; const i = Math.floor(v.length/2); return v.length%2 ? v[i] : (v[i-1]+v[i])/2; }
function pos(get, asc = true){ const v = mat.map(b => ({t:b.ticker, x:get(b)})).filter(o => o.x != null).sort((a,b)=> asc ? a.x-b.x : b.x-a.x); return {n: v.length, p: v.findIndex(o => o.t === 'SCA-B.ST') + 1}; }
const medTest = [
  ['P/E material 18,7 (n=14)', mat.map(b=>b.vardering?.pe), 18.7, 14],
  ['P/B material 1,46 (n=15)', mat.map(b=>b.vardering?.pb), 1.46, 15],
  ['ROE material 8,1 (n=15)', mat.map(b=>b.lonksamhet?.roe).map(x=>x==null?null:x*100), 8.1, 15],
  ['EBIT material 9,8 (n=15)', mat.map(b=>b.lonksamhet?.ebitMarginal).map(x=>x==null?null:x*100), 9.8, 15],
  ['netto material 9,3 (n=15)', mat.map(b=>b.lonksamhet?.nettoMarginal).map(x=>x==null?null:x*100), 9.3, 15],
  ['brutto material 30,0', mat.map(b=>b.lonksamhet?.bruttoMarginal).map(x=>x==null?null:x*100), 30.0, 15],
  ['fcfMarg material 7,50', mat.map(b=>b.lonksamhet?.fcfMarginal).map(x=>x==null?null:x*100), 7.5, 15],
  ['skuld material 0,32', mat.map(b=>b.stabilitet?.skuldEgenkapital), 0.32, 15],
  ['P/E universum 20,8 (n=144)', list.map(b=>b.vardering?.pe), 20.8, 144],
  ['P/B universum 2,87 (n=150)', list.map(b=>b.vardering?.pb), 2.87, 150],
  ['ROE universum 15,6 (n=149)', list.map(b=>b.lonksamhet?.roe).map(x=>x==null?null:x*100), 15.6, 149],
  ['EBIT universum 20,6 (n=152)', list.map(b=>b.lonksamhet?.ebitMarginal).map(x=>x==null?null:x*100), 20.6, 152],
  ['netto universum 13,7 (n=153)', list.map(b=>b.lonksamhet?.nettoMarginal).map(x=>x==null?null:x*100), 13.7, 153],
  ['skuld universum 0,53 (n=139)', list.map(b=>b.stabilitet?.skuldEgenkapital), 0.53, 139],
  ['EV/EBIT universum 18,8 (n=146)', list.map(b=>b.vardering?.evEbit), 18.8, 146],
];
for (const [namn, arr, txt, nExp] of medTest) {
  const mv = med(arr);
  F('BERÄKNING ' + namn, Math.abs(mv - txt) < 0.051 && arr.filter(x=>x!=null).length === nExp, 'fil=' + mv.toFixed(3) + ' n=' + arr.filter(x=>x!=null).length);
}
const posTest = [
  ['P/E 2/14 högst-sorterat (näst högst)', b=>b.vardering?.pe, false, 2, 14],
  ['P/B 3/15', b=>b.vardering?.pb, true, 3, 15],
  ['EV/EBIT 1/14 (högst)', b=>b.vardering?.evEbit, false, 1, 14],
  ['ROE 2/15', b=>b.lonksamhet?.roe, true, 2, 15],
  ['ROIC 2/14', b=>b.lonksamhet?.roic, true, 2, 14],
  ['brutto 2/15 högst-sorterat (näst högst)', b=>b.lonksamhet?.bruttoMarginal, false, 2, 15],
  ['EBIT 2/15', b=>b.lonksamhet?.ebitMarginal, true, 2, 15],
  ['netto 10/15', b=>b.lonksamhet?.nettoMarginal, true, 10, 15],
  ['fcfMarg 7/15', b=>b.lonksamhet?.fcfMarginal, true, 7, 15],
  ['fcfYield 5/14', b=>b.vardering?.fcfYield, true, 5, 14],
  ['skuld 3/15', b=>b.stabilitet?.skuldEgenkapital, true, 3, 15],
];
for (const [namn, get, asc, pExp, nExp] of posTest) { const r = pos(get, asc); F('POSITION ' + namn, r.p === pExp && r.n === nExp, 'fil=' + r.p + '/' + r.n); }
F('BODY: positioner redovisade', ['Näst högst av grenens fjorton', 'Tredje lägst av grenens femton', 'Näst lägst av grenens femton', 'näst lägst av femton', 'tionde av femton', 'sjunde plats av femton', 'Femte lägsta av grenens fjorton'].every(t => j.body.includes(t)));

// 10. Scenarioruta: PARVIS placering + rubriker
const rutor = [...j.body.matchAll(/\| Intäkter (\d[\d ]*) \| ([\d ,]+) \| ([\d ,]+) \| ([\d ,]+) \|/g)];
F('tre intäktsrader i rutan', rutor.length === 3, 'antal=' + rutor.length);
const nivaer = [base * 0.97, base, base * 1.03].map(x => Math.round(x));
const marger = [m - 0.01, m, m + 0.01];
rutor.forEach((rm, i) => {
  F('rutrad ' + (i + 1) + ': intäktsnivå ' + nivaer[i], rm[1].replace(/ /g, '') === String(nivaer[i]), rm[1] + ' mot ' + nivaer[i]);
  marger.forEach((mg, k) => {
    const cell = Number(rm[k + 2].replace(/[ ,]/g, m2 => m2 === ',' ? '.' : ''));
    const ratt = Math.round(nivaer[i] * mg * 10) / 10;
    F('rutcell rad ' + (i + 1) + ' marginal ' + (k + 1) + ' = ' + ratt, Math.abs(cell - ratt) < 0.051, cell + ' mot ' + ratt);
  });
});
for (const t of ['2,90', '3,90', '4,90']) F('marginalrubrik ' + t, j.body.includes('Marginal ' + t));

// 11. Kalenderfakta + seriekonventioner
F('rappdag 23 oktober', j.body.includes('23 oktober'));
F('tyst period 23 september', j.body.includes('23 september'));
F('Q1 2026-04-24', j.body.includes('24 april'));
F('materialgrenens femte paket', j.body.includes('materialgrenens femte paket'));
F('tolfte läsart', j.body.includes('tolfte läsart'));
F('vågvaliderings-not (utanför universumet)', j.body.includes('står utanför vågvalideringens tolvbolagsuniversum'));
F('kalenderkälla internt', j.body.includes('kalender-material.json'));
F('datainsamlingsdatum 2026-09-03', j.body.includes('2026-09-03'));
F('Essity-samband 2017', j.body.includes('2017'));

console.log('\n=== KVD SCA: ' + pass + ' PASS, ' + fel + ' FEL, ' + varn + ' VARNING ===');
process.exit(fel ? 1 : 0);
