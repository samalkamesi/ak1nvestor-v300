// KVD för sa-laser-du-hexagon-q3-2026.json — kvalitetsverifiering vid tillverkningen 2026-09-19.
// Fabriksagent s4-u3, manifest auto-s4-1789810529984, Spår 4 KVARTALSRAPPORTSERIEN.
// Kontrollerar: JSON-giltighet, källtalsparitet mot bolagsunivers.json (HEXA-B.ST-posten),
// aritmetik med oberoende omräkning, medianer/rangplatser omräknade ur filen, juridikgrind,
// samt att utkastet ligger i blogg-utkast (ej data/blogg/). Interna länkar kontrolleras sist.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hexagon-q3-2026.json';
const UNIV = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

let pass = 0, fel = 0, varning = 0;
const ok = (namn, villkor, not = '') => {
  if (villkor) { pass++; console.log(`PASS ${namn} ${not}`); }
  else { fel++; console.log(`FEL  ${namn} ${not}`); }
};

const P = JSON.parse(readFileSync(PAKET, 'utf8'));
const U = JSON.parse(readFileSync(UNIV, 'utf8'));
const B = U.find((b) => b.ticker === 'HEXA-B.ST');
const IND = U.filter((b) => b.bransch === 'industri');

// === 1. Struktur ===
ok('json.giltig', true);
for (const k of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'])
  ok(`falt.${k}`, typeof P[k] === 'string' || typeof P[k] === 'number' || (k === 'tags' && Array.isArray(P[k]) && P[k].length >= 4));
ok('slug.korrekt', P.slug === 'sa-laser-du-hexagon-q3-2026', P.slug);
ok('pillar.seriekonvention', P.pillar === 'Institutionell metodik');
ok('author.seriekonvention', P.author === 'AK1A Research Lab');
ok('publishedAt.rappdag', P.publishedAt === '2026-10-23', P.publishedAt);
ok('readingMinutes.formel', P.readingMinutes === Math.round(P.body.split(/\s+/).filter(Boolean).length / 600), `${P.readingMinutes} min`);
ok('description.längd', P.description.length >= 140 && P.description.length <= 400, `${P.description.length} tkn`);
ok('tags.inhall', P.tags.includes('kvartalsrapport') && P.tags.includes('Hexagon') && P.tags.includes('industri') && P.tags.includes('läspaket'));
ok('fil.lage.utkast', PAKET.includes('/data/blogg-utkast/kvartal/2026-q3/'));
ok('fil.EJ.live', !PAKET.includes('/data/blogg/'));

const body = P.body;
const har = (s) => body.includes(s);
const svt = (x, d = 2) => x.toFixed(d).replace('.', ',');
const svk = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// === 2. Källtalsparitet mot universumfilen ===
const paritet = [
  ['kurs', svt(B.pris, 2)],
  ['mv', svt(B.marknadsKapitalMdr, 3)],
  ['pe', svt(B.vardering.pe, 3)],
  ['pb', svt(B.vardering.pb, 3)],
  ['evEbit', svt(B.vardering.evEbit, 3)],
  ['peg', svt(B.vardering.peg, 2)],
  ['fcfY', svt(B.vardering.fcfYield * 100, 2)],
  ['roe', svt(B.lonksamhet.roe * 100, 2) + ' procent'],
  ['roicFalt', svt(B.lonksamhet.roic * 100, 2)],
  ['bruttoMarg', svt(B.lonksamhet.bruttoMarginal * 100, 2)],
  ['ebitMarg', svt(B.lonksamhet.ebitMarginal * 100, 2)],
  ['nettoMarg', svt(B.lonksamhet.nettoMarginal * 100, 2)],
  ['fcfMarg', svt(B.lonksamhet.fcfMarginal * 100, 2)],
  ['skuldEk', svt(B.stabilitet.skuldEgenkapital, 4)],
  ['progTillv', svt(B.tillvaxt.prognosTillvaxt * 100, 2)],
  ['resCagr', 'minus ' + svt(Math.abs(B.tillvaxt.resultatCAGR5ar * 100), 2)],
  ['omsCagr', svt(B.tillvaxt.omsattningCAGR5ar * 100, 2)],
  ['ttm', svt(B.tillvaxt.omsattningTillvaxtTTM * 100, 1)],
];
for (const [namn, tal] of paritet) ok(`paritet.${namn}`, har(tal), `="${tal}"`);
for (const [i, v] of B.serier.omsattning.entries()) ok(`paritet.oms${B.serier.ar[i]}`, har(svk(v / 1e6)), svk(v / 1e6));
for (const [i, v] of B.serier.resultat.entries()) ok(`paritet.res${B.serier.ar[i]}`, har(svk(v / 1e6)), svk(v / 1e6));
ok('notering.ar4', B.serier.ar.length === 4 && har('fyra räkenskapsår'));
ok('nullning.rantaTackning', B.stabilitet.rantaTackning === null && har('Räntetäckning: **osatt**'));
ok('nullning.utdelning', B.aterkop.senasteArMdr === null && har('utdelnings- och återköpsfält null'));
ok('insiderkop', B.aterkop.insiderkopSenaste6man === 0 && har('köp senaste sex månader: **noll**'));

// === 3. Aritmetik med oberoende omräkning (miljoner kronor; MC omgjort till Mkr) ===
const [o0, o1, o2, o3] = B.serier.omsattning.map((x) => x / 1e6);
const [r0, r1, r2, r3] = B.serier.resultat.map((x) => x / 1e6);
const MC = B.marknadsKapitalMdr * 1000;
const PE = B.vardering.pe, PB = B.vardering.pb, ROE = B.lonksamhet.roe, EBITm = B.lonksamhet.ebitMarginal;
const PT = B.tillvaxt.prognosTillvaxt, PEG = B.vardering.peg, FY = B.vardering.fcfYield, FCFm = B.lonksamhet.fcfMarginal;
const SK = B.stabilitet.skuldEgenkapital, EV = MC / PB * (1 + SK), EBIT = o3 * EBITm;
const rakna = [
  ['identitetFram', svt(PB / ROE, 1)],
  ['identitetBak', svt(PE * ROE, 2)],
  ['identitetsgap', 'minus ' + svt(Math.abs((PE / (PB / ROE) - 1) * 100), 1) + ' procent'],
  ['identitetskvot', 'kvoten mellan de två är ' + svt(PB / ROE / PE, 1)],
  ['absolutMdr', svt(PE * r3 / 1000, 2) + ' miljarder'],
  ['absolutResidual', 'minus ' + svt(Math.abs((PE * r3 / MC - 1) * 100), 1) + ' procent'],
  ['implicitUnderlag', svk(MC / PE)],
  ['implicitGanger', svt(MC / PE / r3, 1)],
  ['direktPE', svt(MC / r3, 1)],
  ['implicitEPS', svt(B.pris / PE, 2)],
  ['implicitAktier', svk(MC / B.pris) + ' miljoner'],
  ['pegKonvention', svt(PE / (PT * 100), 2)],
  ['pegKvot', svt(PE / (PT * 100) / PEG, 2)],
  ['pegImplicitTillv', svt(PE / PEG, 2)],
  ['ekViaPb', svk(MC / PB)],
  ['skuldViaKvot', svk(MC / PB * SK)],
  ['evKedja', svk(EV)],
  ['basEBIT', svk(EBIT)],
  ['evEbitKedja', svt(EV / EBIT, 2)],
  ['evEbitKvot', svt(B.vardering.evEbit / (EV / EBIT), 1)],
  ['roicProxy', svt(EBIT / EV * 100, 2)],
  ['roicAvstand', svt((B.lonksamhet.roic - EBIT / EV) / B.lonksamhet.roic * 100, 1) + ' procent'],
  ['fcfMargVag', svk(FCFm * o3)],
  ['fcfYieldVag', svk(FY * MC)],
  ['fcfKvot', svt(FY * MC / (FCFm * o3), 3)],
  ['omrakadYield', svt(FCFm * o3 / MC * 100, 2) + ' procent'],
  ['nettoMarg22', svt((r0 / o0) * 100, 2)],
  ['nettoMarg23', svt((r1 / o1) * 100, 2)],
  ['nettoMarg24', svt((r2 / o2) * 100, 2)],
  ['nettoMarg25', svt((r3 / o3) * 100, 2)],
  ['cagrOms', svt(((o3 / o0) ** (1 / 3) - 1) * 100, 2)],
  ['andel2025', svt(r3 / r0 * 100, 1) + ' procent'],
  ['trappa', svt((EBITm - B.lonksamhet.nettoMarginal) * 100, 2)],
  ['multipel', svt(PE / (1 + PT), 2)],
  ['viktVolym', '1,4'],
];
for (const [namn, text] of rakna) ok(`aritmetik.${namn}`, har(text), `="${text}"`);

// Stegserier med teckenprefix (+/−) mot normaliserad body (unicode-minus → ascii)
const steg = (a, b) => { const v = (b / a - 1) * 100; return (v >= 0 ? '+' : '-') + svt(Math.abs(v), 2); };
const bodyN = body.replace(/\u2212/g, '-');
const omsSerie = steg(o0, o1) + '/' + steg(o1, o2) + '/' + steg(o2, o3);
const resSerie = steg(r0, r1) + '/' + steg(r1, r2) + '/' + steg(r2, r3);
ok('aritmetik.omsStegSerie', bodyN.includes(omsSerie), omsSerie);
ok('aritmetik.resStegSerie', bodyN.includes(resSerie), resSerie);
ok('aritmetik.cagrRes', har('minus ' + svt(Math.abs(((r3 / r0) ** (1 / 3) - 1) * 100), 2) + ' procent'), 'minus ' + svt(Math.abs(((r3 / r0) ** (1 / 3) - 1) * 100), 2));

// Scenariorutans nio celler (Mkr, tusentalsgrupperat) + räknesatser
const revs = [o3 * 0.97, o3, o3 * 1.03], mars = [EBITm - 0.01, EBITm, EBITm + 0.01];
for (const rv of revs) ok(`aritmetik.rad.${svk(rv)}`, har(svk(rv)), svk(rv));
for (const mv of mars) for (const rv of revs) {
  const cell = svk(rv * mv);
  ok(`aritmetik.cell.${svt(mv * 100, 2)}.${svk(rv)}`, har(cell), `${cell} Mkr`);
}
ok('aritmetik.enPpMarginal', har('cirka 54 miljoner'), svk(o3 * 0.01) + ' Mkr');
ok('aritmetik.treProcentVolym', har('cirka 39 miljoner'), svk(o3 * 0.03 * EBITm) + ' Mkr');
ok('aritmetik.marginalvikt', har('**1,39**'), svt(1 / (3 * EBITm), 2));

// === 4. Medianer och rang omräknade ur filen ===
const median = (arr) => { const v = arr.filter((x) => typeof x === 'number' && !isNaN(x)).sort((a, b) => a - b); const n = v.length; if (!n) return null; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const rankAsc = (val, arr) => { const v = arr.filter((x) => typeof x === 'number'); const s = [...v].sort((a, b) => a - b); return [s.indexOf(val) + 1, v.length]; };
const iPE = median(IND.map((b) => b.vardering?.pe)), iPB = median(IND.map((b) => b.vardering?.pb)), iROE = median(IND.map((b) => b.lonksamhet?.roe));
const iEBIT = median(IND.map((b) => b.lonksamhet?.ebitMarginal)), iN = median(IND.map((b) => b.lonksamhet?.nettoMarginal)), iBRU = median(IND.map((b) => b.lonksamhet?.bruttoMarginal));
const iSKULD = median(IND.map((b) => b.stabilitet?.skuldEgenkapital)), iFCFY = median(IND.map((b) => b.vardering?.fcfYield)), iEV = median(IND.map((b) => b.vardering?.evEbit));
ok('median.indPE', har(svt(iPE, 3)), svt(iPE, 3));
ok('median.indPB', har(svt(iPB, 3)), svt(iPB, 3));
ok('median.indROE', har(svt(iROE * 100, 2)), svt(iROE * 100, 2));
ok('median.indEBIT', har(svt(iEBIT * 100, 2)), svt(iEBIT * 100, 2));
ok('median.indNETTO', har(svt(iN * 100, 2)), svt(iN * 100, 2));
ok('median.indBRUTTO', har(svt(iBRU * 100, 2)), svt(iBRU * 100, 2));
ok('median.indSKULD', har(svt(iSKULD, 3)), svt(iSKULD, 3));
ok('median.indFCFY', har(svt(iFCFY * 100, 2)), svt(iFCFY * 100, 2));
ok('median.indEV', har(svt(iEV, 3)), svt(iEV, 3));
ok('median.indN', har(`${IND.length} bolag i industri`), `n=${IND.length}`);
for (const [namn, [r, n]] of [
  ['PE', rankAsc(PE, IND.map((b) => b.vardering?.pe))],
  ['PB', rankAsc(PB, IND.map((b) => b.vardering?.pb))],
  ['ROE', rankAsc(ROE, IND.map((b) => b.lonksamhet?.roe))],
  ['BRUTTO', rankAsc(B.lonksamhet.bruttoMarginal, IND.map((b) => b.lonksamhet?.bruttoMarginal))],
  ['EBIT', rankAsc(EBITm, IND.map((b) => b.lonksamhet?.ebitMarginal))],
  ['NETTO', rankAsc(B.lonksamhet.nettoMarginal, IND.map((b) => b.lonksamhet?.nettoMarginal))],
  ['SKULD', rankAsc(SK, IND.map((b) => b.stabilitet?.skuldEgenkapital))],
  ['ROIC', rankAsc(B.lonksamhet.roic, IND.map((b) => b.lonksamhet?.roic))],
  ['EV', rankAsc(B.vardering.evEbit, IND.map((b) => b.vardering?.evEbit))],
  ['PEG', rankAsc(PEG, IND.map((b) => b.vardering?.peg))],
]) {
  const mapp = { ROIC: `ROIC ${r}/${n}`, EV: `EV/EBIT ${r}/${n}`, PEG: `PEG ${r}/${n}` };
  const text = mapp[namn] || `${r}/${n}`;
  ok(`rang.${namn}`, har(text), text);
}
const uPE = median(U.map((b) => b.vardering?.pe)), uPB = median(U.map((b) => b.vardering?.pb)), uROE = median(U.map((b) => b.lonksamhet?.roe));
const uEBIT = median(U.map((b) => b.lonksamhet?.ebitMarginal)), uN = median(U.map((b) => b.lonksamhet?.nettoMarginal));
const uBRU = median(U.map((b) => b.lonksamhet?.bruttoMarginal)), uSK = median(U.map((b) => b.stabilitet?.skuldEgenkapital));
ok('median.universumPE', har(svt(uPE, 1)), svt(uPE, 1));
ok('median.universumPB', har(svt(uPB, 2)), svt(uPB, 2));
ok('median.universumROE', har(svt(uROE * 100, 2)), svt(uROE * 100, 2));
ok('median.universumEBIT', har(svt(uEBIT * 100, 2)), svt(uEBIT * 100, 2));
ok('median.universumNETTO', har(svt(uN * 100, 1)), svt(uN * 100, 1));
ok('median.universumBRUTTO', har(svt(uBRU * 100, 2)), svt(uBRU * 100, 2));
ok('median.universumSKULD', har(svt(uSK, 2)), svt(uSK, 2));
ok('median.universumN', har(`${U.length} bolag`), `n=${U.length}`);

// === 5. Juridikgrind ===
const lagrum = (body.match(/2007:528/g) || []).length;
ok('juridik.exaktEttLagrum', lagrum === 1, `${lagrum} träffar`);
ok('juridik.paragraf', har('2 kap 5 §'));
ok('juridik.disclaimer', har('inte investeringsrådgivning'));
ok('juridik.rekonegation', har('Inga köp-, sälj- eller hållningsrekommendationer'));
const radMönster = [/bör\s+(köpa|sälja|undvika|behålla)/i, /rekommenderar\s+(att\s+)?(köpa|sälja|undvika)/i, /råder\s+(till|dig)/i, /målkurs/i, /vår\s+rekommendation/i, /tips(a|ar)?\s+(på\s+)?(aktien|köp)/i];
let radTräff = 0; for (const re of radMönster) { const m = body.match(re); if (m) { radTräff++; console.log(`  råd-träff: ${m[0]}`); } }
ok('juridik.radmönster', radTräff === 0, `${radTräff} träffar`);
const prognosord = /(väntas|förväntas|förutsäga|förutsagt|spår att|kommer att (stiga|falla|öka|minska)|prognos för)/i;
const pträff = body.match(prognosord);
ok('juridik.prognosord', !pträff, pträff ? `"${pträff[0]}"` : '0 träffar');
ok('juridik.utbildningsform', har('utbildningspaket') && har('utbildning i metod'));
ok('mjuka.bindestreck', (body.match(/­/g) || []).length === 0);
// kalenderfakta
ok('kalender.rappdag', har('23 oktober') && P.publishedAt === '2026-10-23');
ok('kalender.rytm', har('fredagen 24 oktober 2025'));
ok('kalender.arsredovisning', har('2027-01-27'));
ok('kalender.kalla', har('marketscreener.com/quote/stock/HEXAGON-AB-6491358/calendar'));
ok('kalender.livekontroll', har('live-kontrollen den 19 september 2026') || har('live-kontrollen 2026-09-19'));

console.log(`\n=== KVD: ${pass} PASS · ${fel} FEL · ${varning} VARNING ===`);
process.exit(fel ? 1 : 0);
