// KVD för sa-laser-du-seb-q3-2026.json — kvalitetsverifiering vid tillverkningen 2026-09-18.
// Kontrollerar: JSON-giltighet, källtalsparitet mot bolagsunivers.json (SEB-A.ST-posten),
// aritmetik med oberoende omräkning, medianer/rangplatser omräknade ur filen, juridikgrind,
// samt att utkastet ligger i blogg-utkast (ej data/blogg/). Interna länkar kontrolleras sist.
import { readFileSync } from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-seb-q3-2026.json';
const UNIV = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

let pass = 0, fel = 0, varning = 0;
const ok = (namn, villkor, not = '') => {
  if (villkor) { pass++; console.log(`PASS ${namn} ${not}`); }
  else { fel++; console.log(`FEL  ${namn} ${not}`); }
};

const P = JSON.parse(readFileSync(PAKET, 'utf8'));
const U = JSON.parse(readFileSync(UNIV, 'utf8'));
const B = U.find((b) => b.ticker === 'SEB-A.ST');
const FIN = U.filter((b) => b.bransch === 'finans');

// === 1. Struktur ===
ok('json.giltig', true);
for (const k of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body'])
  ok(`falt.${k}`, typeof P[k] === 'string' || typeof P[k] === 'number' || (k === 'tags' && Array.isArray(P[k]) && P[k].length >= 4));
ok('slug.korrekt', P.slug === 'sa-laser-du-seb-q3-2026', P.slug);
ok('pillar.seriekonvention', P.pillar === 'Institutionell metodik');
ok('author.seriekonvention', P.author === 'AK1A Research Lab');
ok('publishedAt.rappdag', P.publishedAt === '2026-10-22', P.publishedAt);
ok('readingMinutes.formel', P.readingMinutes === Math.round(P.body.split(/\s+/).filter(Boolean).length / 600), `${P.readingMinutes} min`);
ok('description.längd', P.description.length >= 140 && P.description.length <= 400, `${P.description.length} tkn (seriekonventionen långa beskrivningar)`);
ok('tags.inhall', P.tags.includes('kvartalsrapport') && P.tags.includes('SEB') && P.tags.includes('finans') && P.tags.includes('bankaktier'));
ok('fil.lage.utkast', PAKET.includes('/data/blogg-utkast/kvartal/2026-q3/'));
ok('fil.EJ.live', !PAKET.includes('/data/blogg/'));

const body = P.body;
const har = (s) => body.includes(s);
const svt = (x, d = 2) => x.toFixed(d).replace('.', ',');
const svk = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // tusentalsgrupperat heltal

// === 2. Källtalsparitet mot universumfilen ===
const paritet = [
  ['kurs', svt(B.pris, 2)],
  ['mv', svt(B.marknadsKapitalMdr, 3)],
  ['pe', svt(B.vardering.pe, 3)],
  ['pb', svt(B.vardering.pb, 3)],
  ['evEbit', svt(B.vardering.evEbit, 3)],
  ['peg', svt(B.vardering.peg, 2)],
  ['roe', svt(B.lonksamhet.roe * 100, 2) + ' procent'],
  ['ebitMarg', svt(B.lonksamhet.ebitMarginal * 100, 2)],
  ['nettoMarg', svt(B.lonksamhet.nettoMarginal * 100, 2)],
  ['progTillv', svt(B.tillvaxt.prognosTillvaxt * 100, 2)],
  ['resCagr', svt(B.tillvaxt.resultatCAGR5ar * 100, 2)],
  ['omsCagr', svt(B.tillvaxt.omsattningCAGR5ar * 100, 2)],
  ['ttm', svt(B.tillvaxt.omsattningTillvaxtTTM * 100, 1)],
];
for (const [namn, tal] of paritet) ok(`paritet.${namn}`, har(tal), `="${tal}"`);
for (const [i, v] of B.serier.omsattning.entries()) ok(`paritet.oms${B.serier.ar[i]}`, har(svk(v / 1e6)), svk(v / 1e6));
for (const [i, v] of B.serier.resultat.entries()) ok(`paritet.res${B.serier.ar[i]}`, har(svk(v / 1e6)), svk(v / 1e6));
ok('notering.ar4', B.serier.ar.length === 4 && har('fyra räkenskapsår'));
ok('nullning.roic', B.lonksamhet.roic === null && har('ROIC') && har('osatt'));
ok('nullning.skuldEk', B.stabilitet.skuldEgenkapital === null && har('osatt'));
ok('nullning.brutto', B.lonksamhet.bruttoMarginal === 0 && har('bruttomarginal anges därför som 0'));
ok('insiderkop', B.aterkop.insiderkopSenaste6man === 0 && har('insiderköp senaste sex månader: **noll**'));
ok('utdelning.null', B.aterkop.senasteArMdr === null && har('tdelningsfälten är null'));

// === 3. Aritmetik med oberoende omräkning ===
const [o0, o1, o2, o3] = B.serier.omsattning.map((x) => x / 1e9);
const [r0, r1, r2, r3] = B.serier.resultat.map((x) => x / 1e9);
const PE = B.vardering.pe, PB = B.vardering.pb, ROE = B.lonksamhet.roe, MC = B.marknadsKapitalMdr, EBITm = B.lonksamhet.ebitMarginal, PT = B.tillvaxt.prognosTillvaxt;
const rakna = [
  ['identitetFram', PE !== 0 ? PB / ROE : 0, svt(PB / ROE, 3)],
  ['identitetBak', PE * ROE, svt(PE * ROE, 3)],
  ['absolut', PE * r3, svt(PE * r3, 2)],
  ['implicitVinst', MC / PE, svt(MC / PE, 3)],
  ['ekViaPb', MC / PB, svt(MC / PB, 2)],
  ['roeFaltVinst', ROE * (MC / PB), svt(ROE * (MC / PB), 2)],
  ['pegKonvention', PE / (PT * 100), svt(PE / (PT * 100), 3)],
  ['pegImplicitTillv', PE / B.vardering.peg, svt(PE / B.vardering.peg, 2)],
  ['omsSteg23', (o1 / o0 - 1) * 100, 'plus ' + svt((o1 / o0 - 1) * 100, 2)],
  ['omsSteg24', (o2 / o1 - 1) * 100, 'plus ' + svt((o2 / o1 - 1) * 100, 2)],
  ['omsSteg25', (o3 / o2 - 1) * 100, 'minus ' + svt(Math.abs((o3 / o2 - 1) * 100), 2)],
  ['resSteg23', (r1 / r0 - 1) * 100, 'plus ' + svt((r1 / r0 - 1) * 100, 2)],
  ['resSteg24', (r2 / r1 - 1) * 100, 'minus ' + svt(Math.abs((r2 / r1 - 1) * 100), 2)],
  ['resSteg25', (r3 / r2 - 1) * 100, 'minus ' + svt(Math.abs((r3 / r2 - 1) * 100), 2)],
  ['nettoMarg22', (r0 / o0) * 100, svt((r0 / o0) * 100, 2)],
  ['nettoMarg23', (r1 / o1) * 100, svt((r1 / o1) * 100, 2)],
  ['nettoMarg24', (r2 / o2) * 100, svt((r2 / o2) * 100, 2)],
  ['nettoMarg25', (r3 / o3) * 100, svt((r3 / o3) * 100, 2)],
  ['cagrOms', ((o3 / o0) ** (1 / 3) - 1) * 100, svt(((o3 / o0) ** (1 / 3) - 1) * 100, 2)],
  ['cagrRes', ((r3 / r0) ** (1 / 3) - 1) * 100, svt(((r3 / r0) ** (1 / 3) - 1) * 100, 2)],
  ['basEBIT', o3 * EBITm, svt(o3 * EBITm, 0)],
  ['multipel', PE / (1 + PT), svt(PE / (1 + PT), 2)],
];
for (const [namn, beraknad, text] of rakna) ok(`aritmetik.${namn}`, Math.abs(beraknad) > 0 && har(text), `="${text}"`);

// Scenariorutans nio celler (mdr kr, avrundade till helt miljardtal) + räknesatser
ok('aritmetik.basEBIT.exakt', har(svk(Math.round(o3 * EBITm * 1000))), svk(Math.round(o3 * EBITm * 1000)) + ' Mkr');
const revs = [o3 * 0.97, o3, o3 * 1.03], mars = [EBITm - 0.01, EBITm, EBITm + 0.01];
for (const mv of mars) for (const rv of revs) {
  const cell = svk(rv * mv * 1000); // miljoner kronor, tusentalsgrupperat
  ok(`aritmetik.cell.${svt(mv * 100, 2)}.${svt(rv, 0)}`, har(cell), `${cell} Mkr`);
}
ok('aritmetik.enPpMarginal', har(svk(o3 * 0.01 * 1000)), svk(o3 * 0.01 * 1000) + ' Mkr');
ok('aritmetik.treProcentVolym', har(svk(o3 * 0.03 * EBITm * 1000)), svk(o3 * 0.03 * EBITm * 1000) + ' Mkr');
ok('aritmetik.marginalvikt', har(svt(1 / (3 * EBITm), 2)), svt(1 / (3 * EBITm), 2));
ok('aritmetik.residual', har(svt((PE * r3 / MC - 1) * 100, 1)), svt((PE * r3 / MC - 1) * 100, 1) + ' procent');
ok('aritmetik.identitetsgap', har(svt((PE / (PB / ROE) - 1) * 100, 1) + ' procent'), svt((PE / (PB / ROE) - 1) * 100, 1));

// === 4. Medianer och rang omräknade ur filen ===
const median = (arr) => { const v = arr.filter((x) => typeof x === 'number' && !isNaN(x)).sort((a, b) => a - b); const n = v.length; if (!n) return null; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const rank = (val, arr, desc = true) => { const v = arr.filter((x) => typeof x === 'number'); const s = [...v].sort((a, b) => (desc ? b - a : a - b)); return [s.indexOf(val) + 1, v.length]; };
const fPE = median(FIN.map((b) => b.vardering?.pe)), fPB = median(FIN.map((b) => b.vardering?.pb)), fROE = median(FIN.map((b) => b.lonksamhet?.roe));
const fEBIT = median(FIN.map((b) => b.lonksamhet?.ebitMarginal)), fN = median(FIN.map((b) => b.lonksamhet?.nettoMarginal)), fPROG = median(FIN.map((b) => b.tillvaxt?.prognosTillvaxt));
ok('median.finansPE', har(svt(fPE, 3)), svt(fPE, 3));
ok('median.finansPB', har(svt(fPB, 3)), svt(fPB, 3));
ok('median.finansROE', har(svt(fROE * 100, 2)), svt(fROE * 100, 2));
ok('median.finansEBIT', har(svt(fEBIT * 100, 2)), svt(fEBIT * 100, 2));
ok('median.finansNETTO', har(svt(fN * 100, 2)), svt(fN * 100, 2));
ok('median.finansPROG', har(svt(fPROG * 100, 2)), svt(fPROG * 100, 2));
ok('median.finansN', har(`${FIN.length} bolag`), `n=${FIN.length}`);
for (const [namn, [r, n]] of [['PE', rank(PE, FIN.map((b) => b.vardering?.pe))], ['PB', rank(PB, FIN.map((b) => b.vardering?.pb))], ['ROE', rank(ROE, FIN.map((b) => b.lonksamhet?.roe))], ['EBIT', rank(EBITm, FIN.map((b) => b.lonksamhet?.ebitMarginal))], ['NETTO', rank(B.lonksamhet.nettoMarginal, FIN.map((b) => b.lonksamhet?.nettoMarginal))], ['PROG', rank(PT, FIN.map((b) => b.tillvaxt?.prognosTillvaxt))]])
  ok(`rang.${namn}`, har(`${r}/${n}`), `${r}/${n}`);
const uPE = median(U.map((b) => b.vardering?.pe)), uPB = median(U.map((b) => b.vardering?.pb)), uROE = median(U.map((b) => b.lonksamhet?.roe)), uEBIT = median(U.map((b) => b.lonksamhet?.ebitMarginal)), uN = median(U.map((b) => b.lonksamhet?.nettoMarginal));
ok('median.universumPE', har(svt(uPE, 3)), svt(uPE, 3));
ok('median.universumPB', har(svt(uPB, 3)), svt(uPB, 3));
ok('median.universumROE', har(svt(uROE * 100, 2)), svt(uROE * 100, 2));
ok('median.universumEBIT', har(svt(uEBIT * 100, 2)), svt(uEBIT * 100, 2));
ok('median.universumNETTO', har(svt(uN * 100, 2)), svt(uN * 100, 2));
// Storbankquadern
for (const t of ['SHB-A.ST', 'SEB-A.ST', 'SWED-A.ST', 'NDA-SE.ST']) {
  const b = U.find((x) => x.ticker === t);
  if (t !== 'NDA-SE.ST') ok(`quad.${t}.PB`, har(svt(b.vardering.pb, 3)), svt(b.vardering.pb, 3));
  ok(`quad.${t}.ROE`, har(svt(b.lonksamhet.roe * 100, 2)), svt(b.lonksamhet.roe * 100, 2));
}
ok('quad.NDA.brutetfalt', har('21,537'), 'Nordeapaketets valutafel-fält redovisas som brutet');

// === 5. Juridikgrind ===
const lagrum = (body.match(/2007:528/g) || []).length;
ok('juridik.exaktEttLagrum', lagrum === 1, `${lagrum} träffar`);
ok('juridik.paragraf', har('2 kap 5 §'));
ok('juridik.disclaimer', har('inte investeringsrådgivning'));
ok('juridik.rekonegation', har('Inga köp-, sälj- eller hållningsrekommendationer'));
const radMönster = [/bör\s+(köpa|sälja|undvika|behålla)/i, /rekommenderar\s+(att\s+)?(köpa|sälja|undvika)/i, /råder\s+(till|dig)/i, /målkurs/i, /vår\s+rekommendation/i, /tips(a|ar)?\s+(på\s+)?(aktien|köp)/i];
let radTräff = 0; for (const re of radMönster) { const m = body.match(re); if (m) { radTräff++; console.log(`  råd-träff: ${m[0]}`); } }
ok('juridik.radmönster', radTräff === 0, `${radTräff} träffar`);
const prognosord = /(väntas|förväntas|förutsäga|förutsagt|spår att|kommer att (stiga|falla|stiga|öka|minska)|prognos för)/i;
const pträff = body.match(prognosord);
ok('juridik.prognosord', !pträff, pträff ? `"${pträff[0]}"` : '0 träffar');
ok('juridik.utbildningsform', har('utbildningspaket') && har('utbildning i metod'));
// kalenderfakta
ok('kalender.rappdag', har('22 oktober') && P.publishedAt === '2026-10-22');
ok('kalender.tystPeriod', har('1 till och med 21 oktober') || har('1–21 oktober'));
ok('kalender.kalla', har('sebgroup.com/investor-relations/reports-and-presentations/financial-calendar'));

console.log(`\n=== KVD: ${pass} PASS · ${fel} FEL · ${varning} VARNING ===`);
process.exit(fel ? 1 : 0);
