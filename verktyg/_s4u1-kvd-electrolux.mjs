// _s4u1-kvd-electrolux.mjs — KVD för Electrolux Q3-2026-paketet (s4-u1 v2)
// Kontrollerar: struktur, källtalsparitet mot bolagsuniversum, oberoende
// aritmetikomräkning (identitet/underlag/PEG-kedja/FCF/scenariorutor),
// medianer+rang, interna länkar HTTP 200, juridikgrind, ordräkning.
// Kör: node verktyg/_s4u1-kvd-electrolux.mjs
import { readFileSync } from 'node:fs';
import http from 'node:http';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-electrolux-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

let pass = 0, fel = 0, varning = 0;
const ok = (villkor, namn, detalj = '') => {
  if (villkor) { pass++; }
  else { fel++; console.log('FEL: ' + namn + (detaj ? ' — ' + detalj : '')); }
};
const detaj = ''; // (oanvänd placeholder, se ok())
const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const u = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.universum);
const v = list.find(b => b.ticker === 'ELUX-B.ST');
const P = v.vardering, L = v.lonksamhet, T = v.tillvaxt, S = v.stabilitet, SER = v.serier;
const body = j.body;

// ===== 1. STRUKTUR =====
ok(j.slug === 'sa-laser-du-electrolux-q3-2026', 'slug');
ok(typeof j.title === 'string' && j.title.length > 100 && j.title.length < 320, 'title-längd', String(j.title.length));
ok(typeof j.description === 'string' && j.description.length > 350 && j.description.length < 650, 'description-längd', String(j.description.length));
ok(j.pillar === 'Institutionell metodik', 'pillar');
ok(j.author === 'AK1A Research Lab', 'author');
ok(j.publishedAt === '2026-10-23', 'publishedAt = rappdag', j.publishedAt);
ok(Array.isArray(j.tags) && j.tags.length === 6 && j.tags.includes('kvartalsrapport') && j.tags.includes('Electrolux'), 'tags');
ok(j.tags.every(t => typeof t === 'string' && t.length < 30), 'tags-format');

// ===== 2. KÄLLTALSPARITET (paketsiffer mot universumfilen) =====
const kallor = [
  ['27,59 kronor', v.pris === 27.59],
  ['22,4 miljarder (22.389)', v.marknadsKapitalMdr === 22.389],
  ['P/E null', P.pe === null],
  ['P/B 1,286', P.pb === 1.286],
  ['EV/EBIT null', P.evEbit === null],
  ['PEG 1,02', P.peg === 1.02],
  ['FCF-yield −4,50 %', P.fcfYield === -0.045],
  ['ROE −11,39 %', L.roe === -0.1139],
  ['ROIC −6,63 %', L.roic === -0.0663],
  ['brutto 14,10 %', L.bruttoMarginal === 0.141],
  ['EBIT −3,19 %', L.ebitMarginal === -0.0319],
  ['netto −1,13 %', L.nettoMarginal === -0.0113],
  ['fcfMarginal −0,78 %', L.fcfMarginal === -0.0078],
  ['skuld/EK 2,5757', S.skuldEgenkapital === 2.5757],
  ['TTM +0,9 %', T.omsattningTillvaxtTTM === 0.009],
  ['omsCAGR −0,90 %', T.omsattningCAGR5ar === -0.009],
  ['prognos +84,11 %', T.prognosTillvaxt === 0.8411],
  ['resultatCAGR null', T.resultatCAGR5ar === null],
  ['insider 0', v.aterkop.insiderkopSenaste6man === 0],
  ['serier 4 år', SER.ar.length === 4 && SER.ar[0] === '2022' && SER.ar[3] === '2025'],
];
for (const [namn, villkor] of kallor) ok(villkor, 'källa: ' + namn);

// Seriernas tal i paketet
const oms = SER.omsattning, res = SER.resultat;
const serietal = [
  ['oms 134 880', oms[0] === 134880000000], ['oms 134 451', oms[1] === 134451000000],
  ['oms 136 150', oms[2] === 136150000000], ['oms 131 282', oms[3] === 131282000000],
  ['res −1 320', res[0] === -1320000000], ['res −5 227', res[1] === -5227000000],
  ['res −1 396', res[2] === -1396000000], ['res +878', res[3] === 878000000],
];
for (const [namn, villkor] of serietal) ok(villkor, 'serie: ' + namn);
ok(body.includes('134 880') && body.includes('131 282') && body.includes('5 227') && body.includes('878 miljoner'), 'serietalen citeras i bodyn');

// ===== 3. ARITMETIK (oberoende omräkning av paketets påståenden) =====
const av = (x, y, tol, namn) => ok(Math.abs(x - y) <= tol, 'aritmetik: ' + namn, x + ' mot ' + y);
// Identitet
av(P.pb / L.roe, -11.29, 0.01, 'P/B ÷ ROE = −11,29');
// EK + skuld + EV
const ek = v.marknadsKapitalMdr / P.pb;
av(ek, 17.410, 0.001, 'EK ur P/B 17,410 mdr');
av(ek * 1e3, 17410, 1, 'EK 17 410 Mkr');
av(S.skuldEgenkapital * ek, 44.84, 0.01, 'skuld 44,84 mdr');
av(v.marknadsKapitalMdr + S.skuldEgenkapital * ek, 67.23, 0.01, 'EV grovt 67,23 mdr');
// TTM-vägar
const ttmInt = oms[3] * 1.009;
av(ttmInt / 1e6, 132464, 1, 'TTM-intäkter 132 464 Mkr');
av(L.roe * ek * 1e3, -1983, 1, 'ROE-vägen −1 983 Mkr');
av(L.nettoMarginal * ttmInt / 1e6, -1497, 1, 'marginalvägen −1 497 Mkr');
av((L.roe * ek * 1e3) / (L.nettoMarginal * ttmInt / 1e6), 1.32, 0.01, 'kvot 1,32');
// PEG-kedjan
const fwd = res[3] / 1e9 * (1 + T.prognosTillvaxt);
av(fwd, 1.616, 0.001, 'forward-vinst 1,616 mdr');
av(v.marknadsKapitalMdr / fwd, 13.85, 0.01, 'forward-P/E 13,85');
av((v.marknadsKapitalMdr / fwd) / (T.prognosTillvaxt * 100), 0.165, 0.001, 'PEG-konvention 0,165');
av(P.peg / ((v.marknadsKapitalMdr / fwd) / (T.prognosTillvaxt * 100)), 6.2, 0.05, 'kvot 6,2');
av(P.peg * T.prognosTillvaxt * 100, 85.8, 0.1, 'källans implicita P/E 85,8');
// P/E grovt på bokförd 2025
av(v.marknadsKapitalMdr / (res[3] / 1e9), 25.5, 0.1, 'P/E på 2025-vinst grovt 25');
// FCF-paret
av(P.fcfYield * v.marknadsKapitalMdr * 1e3, -1008, 1, 'FCF yield-vägen −1 008 Mkr');
av(L.fcfMarginal * oms[3] / 1e6, -1024, 1, 'FCF marginalvägen −1 024 Mkr');
av((P.fcfYield * v.marknadsKapitalMdr * 1e3) / (L.fcfMarginal * oms[3] / 1e6), 0.98, 0.005, 'FCF-kvot 0,98');
// Steg och CAGR och nettomarginaler
av((oms[1] / oms[0] - 1) * 100, -0.32, 0.01, 'omssteg 2023 −0,32');
av((oms[2] / oms[1] - 1) * 100, 1.26, 0.01, 'omssteg 2024 +1,26');
av((oms[3] / oms[2] - 1) * 100, -3.58, 0.01, 'omssteg 2025 −3,58');
av((Math.pow(oms[3] / oms[0], 1 / 3) - 1) * 100, -0.90, 0.01, 'omsCAGR −0,90 replikeras');
const nm = res.map((r, i) => r / oms[i] * 100);
av(nm[0], -0.98, 0.01, 'nettomarginal 2022'); av(nm[1], -3.89, 0.01, 'nettomarginal 2023');
av(nm[2], -1.03, 0.01, 'nettomarginal 2024'); av(nm[3], 0.67, 0.01, 'nettomarginal 2025');
// Scenariorutor EBIT (9 celler)
const rutor = [[127344, -5336, -4062, -2789], [131282, -5501, -4188, -2875], [135220, -5666, -4314, -2961]];
for (const [o, a, b, c] of rutor) {
  av(o * -0.0419, a, 1, 'cell EBIT ' + o + ' a'); av(o * -0.0319, b, 1, 'cell EBIT ' + o + ' b'); av(o * -0.0219, c, 1, 'cell EBIT ' + o + ' c');
}
av(oms[3] / 1e6 * 0.01, 1313, 1, '1 pp = 1 313 Mkr');
av(oms[3] / 1e6 * 0.03 * -0.0319, -126, 1, '3 % intäkter = −126 Mkr');
av(1 / (3 * Math.abs(L.ebitMarginal)), 10.45, 0.01, 'marginalvikt EBIT 10,45');
// Bruttovariant (9 celler)
const bRutor = [[127344, 16682, 17955, 19229], [131282, 17198, 18511, 19824], [135220, 17714, 19066, 20418]];
for (const [o, a, b, c] of bRutor) {
  av(o * 0.1310, a, 1, 'cell brutto ' + o + ' a'); av(o * 0.1410, b, 1, 'cell brutto ' + o + ' b'); av(o * 0.1510, c, 1, 'cell brutto ' + o + ' c');
}
av(1 / (3 * L.bruttoMarginal), 2.36, 0.01, 'marginalvikt brutto 2,36');
// Multiplövning
av((v.marknadsKapitalMdr / fwd) / (1 + T.prognosTillvaxt), 7.52, 0.01, 'multiplövning 7,52');

// ===== 4. MEDIANER + RANG (paketets tabellvärden) =====
const num = x => typeof x === 'number' && Number.isFinite(x);
const med = arr => { const s = arr.slice().sort((a, b2) => a - b2); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const rang = (arr, x) => arr.slice().sort((a, b2) => b2 - a).indexOf(x) + 1;
const gren = list.filter(b => b.bransch === 'konsument');
ok(gren.length === 19, 'konsumentgrenen 19 bolag', String(gren.length));
const mTab = [
  ['pe', b => b.vardering?.pe, 18.9320, 18, null],
  ['pb', b => b.vardering?.pb, 3.7175, 18, 14],
  ['evEbit', b => b.vardering?.evEbit, 17.8400, 18, null],
  ['fcfYield', b => b.vardering?.fcfYield, 0.0387, 17, 15],
  ['peg', b => b.vardering?.peg, 1.9200, 16, 13],
  ['roe', b => b.lonksamhet?.roe, 0.2129, 18, 18],
  ['roic', b => b.lonksamhet?.roic, 0.1362, 17, 17],
  ['brutto', b => b.lonksamhet?.bruttoMarginal, 0.4499, 19, 18],
  ['ebit', b => b.lonksamhet?.ebitMarginal, 0.1269, 19, 19],
  ['netto', b => b.lonksamhet?.nettoMarginal, 0.0838, 19, 19],
  ['skuldEK', b => b.stabilitet?.skuldEgenkapital, 1.1250, 18, 1],
  ['prognos', b => b.tillvaxt?.prognosTillvaxt, 0.0927, 19, 2],
];
for (const [namn, fn, mVal, nVal, rVal] of mTab) {
  const g = gren.map(fn).filter(num);
  ok(g.length === nVal, 'median-n ' + namn, g.length + ' mot ' + nVal);
  av(med(g), mVal, 0.0005, 'median ' + namn);
  if (rVal !== null) ok(rang(g, fn(v)) === rVal, 'rang ' + namn, rang(g, fn(v)) + ' mot ' + rVal);
}
// Universummedianer i tabellen
const uTab = [['pe', 21.1530, 167], ['pb', 2.8065, 174], ['evEbit', 18.2200, 168], ['fcfYield', 0.0383, 160], ['peg', 1.4350, 148], ['roe', 0.1534, 173], ['roic', 0.1308, 158], ['brutto', 0.4775, 175], ['ebit', 0.2117, 176], ['netto', 0.1409, 177], ['skuldEK', 0.5150, 162], ['prognos', 0.1231, 166]];
for (const [namn, mVal, nVal] of uTab) {
  const key = { pe: 'pe', pb: 'pb', evEbit: 'evEbit', fcfYield: 'fcfYield', peg: 'peg', roe: 'roe', roic: 'roic', brutto: 'bruttoMarginal', ebit: 'ebitMarginal', netto: 'nettoMarginal', skuldEK: 'skuldEgenkapital', prognos: 'prognosTillvaxt' }[namn];
  const get = b => ({ pe: b.vardering?.pe, pb: b.vardering?.pb, evEbit: b.vardering?.evEbit, fcfYield: b.vardering?.fcfYield, peg: b.vardering?.peg, roe: b.lonksamhet?.roe, roic: b.lonksamhet?.roic, bruttoMarginal: b.lonksamhet?.bruttoMarginal, ebitMarginal: b.lonksamhet?.ebitMarginal, nettoMarginal: b.lonksamhet?.nettoMarginal, skuldEgenkapital: b.stabilitet?.skuldEgenkapital, prognosTillvaxt: b.tillvaxt?.prognosTillvaxt }[key]);
  const a = list.map(get).filter(num);
  ok(a.length === nVal, 'univ-n ' + namn, a.length + ' mot ' + nVal);
  av(med(a), mVal, 0.0005, 'univ-median ' + namn);
}
// P/B-avståndet 65 % under medianen
av((1 - P.pb / 3.7175) * 100, 65.4, 0.2, 'P/B 65 % under konsumentmedianen');

// ===== 5. LÄNKAR =====
const links = [...new Set([...body.matchAll(/\]\((\/[a-z0-9\-\/]+)\)/g)].map(m => m[1]))];
ok(links.length === 20, '20 unika interna länkar', String(links.length));
const lankResultat = await Promise.all(links.map(p => new Promise(resolve => {
  const req = http.get({ host: 'localhost', port: 3000, path: p, timeout: 10000 }, r => { r.resume(); resolve([p, r.statusCode]); });
  req.on('error', e => resolve([p, String(e.code || e.message)]));
  req.on('timeout', () => { req.destroy(); resolve([p, 'timeout']); });
})));
for (const [p, code] of lankResultat) ok(code === 200, 'länk 200 ' + p, String(code));
const ext = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
ok(ext.length === 0, 'inga externa länkar i bodyn', String(ext.length));
ok(body.includes('](/bolag/elux-b-st)'), '/bolag/elux-b-st länkad');

// ===== 6. JURIDIKGRIND =====
const lagrum = [...body.matchAll(/2007:528/g)].length;
ok(lagrum === 1, 'exakt ett lagrum 2007:528', String(lagrum));
ok(/2 kap 5 §/.test(body), 'paragraf 2 kap 5 §');
const rader = body.split(/\n+/);
let radFynd = [];
for (const rad of rader) {
  if (/\b(köpa|sälja|köp|sälj)\b/i.test(rad) && !/inte en rekommendation att köpa|Inga köp-|aldrig en handelssignal|köpa, sälja eller behålla|noll köp/i.test(rad)) radFynd.push(rad.slice(0, 80));
}
ok(radFynd.length === 0, 'rådverb endast i nekningskontext', radFynd.join(' | '));
ok(/\*Detta är pedagogisk finansutbildning/.test(body) && body.trimEnd().endsWith('kundens beslut.*'), 'disclaimer sista rad');
ok(!/väntas (stiga|falla)|målpris|rekommendera (köp|sälj)/i.test(body), 'inga förbjudna fraser');
// Konsensus endast pedagogiskt
ok(/inte en sanning och inte vår skattning/.test(body), 'konsensus-disclaimer');

// ===== 7. ORD + READINGMINUTES =====
const text = body.replace(/[#*|\-`\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
const ord = text.split(' ').filter(w => w.length > 0).length;
const rm = Math.round(ord / 600);
ok(rm === j.readingMinutes, 'readingMinutes = round(ord/600)', ord + ' ord → ' + rm + ' mot ' + j.readingMinutes);
ok(ord > 2600 && ord < 3800, 'ordmängd 2 600–3 800', String(ord));

console.log('\n=== KVD RESULTAT ===');
console.log('PASS:', pass, '| FEL:', fel, '| VARNING:', varning);
console.log('Ord (body):', ord, '| readingMinutes:', j.readingMinutes, '| title tkn:', j.title.length, '| desc tkn:', j.description.length);
console.log('FEL =', fel, fel === 0 ? '→ GRÖN' : '→ RÖD');
process.exit(fel === 0 ? 0 : 1);
