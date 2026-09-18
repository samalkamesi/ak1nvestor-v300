// KVD för s4-u1 CellaVision Q3-läspaket (auto-s4-1789700129983)
// Grunder: struktur, källtalsparitet mot CEVI-posten, aritmetik med oberoende
// omräkning, medianer+rang ur färsk universumsfil, juridikgrind, interna länkar HTTP 200.
import fs from 'node:fs';
const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-cellavision-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const KAL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-halso.json';
let pass = 0, fel = 0, varn = 0;
const ok = (villkor, namn, detalj = '') => { if (villkor) { pass++; console.log(`PASS ${namn}${detalj ? ' — ' + detalj : ''}`); } else { fel++; console.log(`FEL ${namn}${detalj ? ' — ' + detalj : ''}`); } };
const warn = (villkor, namn, detalj = '') => { if (villkor) { pass++; } else { varn++; console.log(`VARNING ${namn}${detalj ? ' — ' + detalj : ''}`); } };

const p = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const U = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const arr = Array.isArray(U) ? U : Object.values(U);
const c = arr.find(b => b.ticker === 'CEVI.ST');
const kal = JSON.parse(fs.readFileSync(KAL, 'utf8'));
const kalArr = Array.isArray(kal) ? kal : (kal.bolag || Object.values(kal)[0]);
const ceviKal = kalArr.find(b => b.ticker === 'CEVI.ST');
const body = p.body;
const ord = body.trim().split(/\s+/).length;
const num = x => Number(String(x).replace(/(\d) (\d{3})/g, '$1$2').replace(',', '.'));
const har = (str) => body.includes(str);

// === STRUKTUR ===
ok(p.slug === 'sa-laser-du-cellavision-q3-2026' && PAKET.endsWith(p.slug + '.json'), 'slug/filnamn-paritet');
for (const f of ['slug', 'title', 'description', 'pillar', 'author', 'publishedAt', 'readingMinutes', 'tags', 'body']) ok(p[f] !== undefined, `fält ${f}`);
ok(p.readingMinutes === Math.round(ord / 600), 'readingMinutes = round(ord/600)', `${ord} ord → ${p.readingMinutes}`);
ok(PAKET.includes('/data/blogg-utkast/') && !PAKET.includes('/data/blogg/'), 'utkast-läge (inte live-mappen)');
ok(p.publishedAt === '2026-10-29' && ceviKal?.rapportfenster === '2026-10-29', 'publishedAt = kalenderns rappdag', `${p.publishedAt} vs ${ceviKal?.rapportfenster}`);
ok(p.tags.length === 8 && p.tags.every(t => t && t.trim()), '8 icke-tomma tags');
ok(p.pillar === 'Institutionell metodik' && p.author === 'AK1A Research Lab', 'pillar+author');
ok(p.title.includes('CellaVision') && p.title.includes('så läser du'), 'title-form');

// === KÄLLTALSPARITET mot CEVI-posten ===
const paritet = [
  ['kurs 161,80', `${c.pris.toFixed(2)}`, '161,80'],
  ['börsvärde 3,859', `${c.marknadsKapitalMdr}`, '3,859'],
  ['P/E 29,963', `${c.vardering.pe}`, '29,963'],
  ['P/B 4,356', `${c.vardering.pb}`, '4,356'],
  ['EV/EBIT 24,704', `${c.vardering.evEbit}`, '24,704'],
  ['FCF-avk 1,66', `${(c.vardering.fcfYield * 100).toFixed(2)}`, '1,66'],
  ['ROE 15,11', `${(c.lonksamhet.roe * 100).toFixed(2)}`, '15,11'],
  ['ROIC 16,24', `${(c.lonksamhet.roic * 100).toFixed(2)}`, '16,24'],
  ['brutto 68,71', `${(c.lonksamhet.bruttoMarginal * 100).toFixed(2)}`, '68,71'],
  ['EBIT-marg 20,61', `${(c.lonksamhet.ebitMarginal * 100).toFixed(2)}`, '20,61'],
  ['netto 17,46', `${(c.lonksamhet.nettoMarginal * 100).toFixed(2)}`, '17,46'],
  ['FCF-marg 8,65', `${(c.lonksamhet.fcfMarginal * 100).toFixed(2)}`, '8,65'],
  ['skuld/EK 0,059', `${c.stabilitet.skuldEgenkapital}`, '0,059'],
  ['prognos 23,29', `${(c.tillvaxt.prognosTillvaxt * 100).toFixed(2)}`, '23,29'],
  ['resCAGR 8,96', `${(c.tillvaxt.resultatCAGR5ar * 100).toFixed(2)}`, '8,96'],
  ['omsCAGR 5,88', `${(c.tillvaxt.omsattningCAGR5ar * 100).toFixed(2)}`, '5,88'],
  ['TTM 4,50', `${(c.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(2)}`, '4,50'],
];
for (const [namn, räknat, text] of paritet) ok(räknat.replace('.', ',') === text && har(text), `källparitet ${namn}`, `källa ${räknat} == body "${text}"`);
ok(c.vardering.peg === null && har('fält tomt'), 'PEG-null-konvention', 'fältet null redovisas som tomt i tabellen');
ok(c.serier.ar.join(',') === '2022,2023,2024,2025' && c.serier.omsattning.length === 4, 'fyra räkenskapsår i källan');
for (let i = 0; i < 4; i++) {
  const o = (c.serier.omsattning[i] / 1e6).toFixed(3).replace('.', ',');
  const r = (c.serier.resultat[i] / 1e6).toFixed(3).replace('.', ',');
  ok(har(o) && har(r), `serieparitet ${c.serier.ar[i]}`, `${o} / ${r} Mkr`);
}

// === ARITMETIK (oberoende omräkning) ===
const oms = c.serier.omsattning.map(x => x / 1e6), res = c.serier.resultat.map(x => x / 1e6), MC = c.marknadsKapitalMdr * 1000;
const steg = (a, b) => (b / a - 1) * 100;
const arit = [
  ['oms-steg 2023 +5,94', steg(oms[0], oms[1]), 5.94], ['oms-steg 2024 +6,78', steg(oms[1], oms[2]), 6.78], ['oms-steg 2025 +4,94', steg(oms[2], oms[3]), 4.94],
  ['res-steg 2023 +10,12', steg(res[0], res[1]), 10.12], ['res-steg 2024 +7,99', steg(res[1], res[2]), 7.99], ['res-steg 2025 +8,78', steg(res[2], res[3]), 8.78],
  ['marg 2022 18,51', res[0] / oms[0] * 100, 18.51], ['marg 2023 19,24', res[1] / oms[1] * 100, 19.24], ['marg 2024 19,46', res[2] / oms[2] * 100, 19.46], ['marg 2025 20,17', res[3] / oms[3] * 100, 20.17],
  ['CAGR oms 5,88', ((oms[3] / oms[0]) ** (1 / 3) - 1) * 100, 5.88], ['CAGR res 8,96', ((res[3] / res[0]) ** (1 / 3) - 1) * 100, 8.96],
  ['totalt oms +18,7', steg(oms[0], oms[3]), 18.7], ['totalt res +29,4', steg(res[0], res[3]), 29.4],
  ['identitet 28,83', c.vardering.pb / c.lonksamhet.roe, 28.83], ['identitet-diff 3,8 %', Math.abs((c.vardering.pb / c.lonksamhet.roe - c.vardering.pe) / c.vardering.pe) * 100, 3.8],
  ['absolut 4 586,7', c.vardering.pe * res[3], 4586.7], ['residual +18,9', (c.vardering.pe * res[3] / MC - 1) * 100, 18.9], ['implicit 128,8', MC / c.vardering.pe, 128.8],
  ['EK 885,9', MC / c.vardering.pb, 885.9], ['skuld 52,3', MC / c.vardering.pb * c.stabilitet.skuldEgenkapital, 52.3],
  ['EBIT 156,4', c.lonksamhet.ebitMarginal * oms[3], 156.4], ['EV 3 911,3', MC + MC / c.vardering.pb * c.stabilitet.skuldEgenkapital, 3911.3],
  ['EV/EBIT-kedja 25,00', (MC + MC / c.vardering.pb * c.stabilitet.skuldEgenkapital) / (c.lonksamhet.ebitMarginal * oms[3]), 25.00],
  ['EV-kedjediff 1,2 %', Math.abs(((MC + MC / c.vardering.pb * c.stabilitet.skuldEgenkapital) / (c.lonksamhet.ebitMarginal * oms[3])) / c.vardering.evEbit - 1) * 100, 1.2],
  ['fält-EV 3 864,3', c.vardering.evEbit * c.lonksamhet.ebitMarginal * oms[3], 3864.3], ['fält-EV−MC +5,3', c.vardering.evEbit * c.lonksamhet.ebitMarginal * oms[3] - MC, 5.3],
  ['implicit kassa ~47', MC / c.vardering.pb * c.stabilitet.skuldEgenkapital - (c.vardering.evEbit * c.lonksamhet.ebitMarginal * oms[3] - MC), 47.0],
  ['ROE bokfört 17,28', res[3] / (MC / c.vardering.pb) * 100, 17.28], ['ROE implicit 14,54', (MC / c.vardering.pe) / (MC / c.vardering.pb) * 100, 14.54],
  ['avstånd implicit 0,57', c.lonksamhet.roe * 100 - (MC / c.vardering.pe) / (MC / c.vardering.pb) * 100, 0.57],
  ['avstånd bokfört 2,17', res[3] / (MC / c.vardering.pb) * 100 - c.lonksamhet.roe * 100, 2.17],
  ['FCF 65,7', c.lonksamhet.fcfMarginal * oms[3], 65.7], ['FCF-avk kedja 1,70', c.lonksamhet.fcfMarginal * oms[3] / MC * 100, 1.70],
  ['FCF-pardiff 2,5 %', Math.abs((c.lonksamhet.fcfMarginal * oms[3] / MC) / c.vardering.fcfYield - 1) * 100, 2.5],
  ['P/FCF 60,2', 1 / c.vardering.fcfYield, 60.2], ['netto→FCF 8,8 pp', (c.lonksamhet.nettoMarginal - c.lonksamhet.fcfMarginal) * 100, 8.8],
  ['netto/EBIT ~85 %', c.lonksamhet.nettoMarginal / c.lonksamhet.ebitMarginal * 100, 85],
  ['PEG fram 1,29', c.vardering.pe / (c.tillvaxt.prognosTillvaxt * 100), 1.29], ['PEG bak 3,34', c.vardering.pe / (c.tillvaxt.resultatCAGR5ar * 100), 3.34],
  ['PEG-klyfta 2,6', (c.vardering.pe / (c.tillvaxt.resultatCAGR5ar * 100)) / (c.vardering.pe / (c.tillvaxt.prognosTillvaxt * 100)), 2.60],
  ['medianmultipl 155,5', MC / 24.818, 155.5], ['medianmultipl +1,6 %', (MC / 24.818 / res[3] - 1) * 100, 1.6],
  ['1 pp marginal 7,59', oms[3] / 100, 7.59], ['3 % volym 4,59', 0.03 * oms[3] * (res[3] / oms[3]), 4.59], ['marginalvikt 1,65', (oms[3] / 100) / (0.03 * res[3]), 1.65],
];
const fmt = x => { const s = String(x); const [h, d] = s.split('.'); const hg = h.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return d ? `${hg},${d}` : hg; };
for (const [namn, räknat, påstått] of arit) {
  const dec = (String(påstått).split('.')[1] || '').length;
  const avrundat = Number(räknat.toFixed(dec));
  ok(avrundat === påstått && har(fmt(påstått)), `aritmetik ${namn}`, `räknat ${räknat.toFixed(4)} → ${avrundat} mot body ${fmt(påstått)}`);
}
// scenariorutan 9 celler
const m0 = res[3] / oms[3]; let celler = 0;
for (const dm of [-2, 0, 2]) for (const dv of [-3, 0, 3]) { const v = oms[3] * (1 + dv / 100) * (m0 + dm / 100); if (har(v.toFixed(1).replace('.', ','))) celler++; }
ok(celler === 9, 'scenarioruta 9/9 celler', `${celler} celler funna i body`);

// === MEDIANER + RANG ===
const gren = arr.filter(b => b.bransch === 'halso');
const median = v => { const s = v.filter(x => x !== null && x !== undefined).sort((a, b) => a - b); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const M = {
  'P/E': [c.vardering.pe, b => b.vardering?.pe, 24.818, 20.522, 9, 15, false],
  'P/B': [c.vardering.pb, b => b.vardering?.pb, 4.356, 2.807, 8, 15, false],
  'EV/EBIT': [c.vardering.evEbit, b => b.vardering?.evEbit, 17.073, 18.170, 14, 16, false],
  'FCF-avk': [c.vardering.fcfYield * 100, b => b.vardering?.fcfYield != null ? b.vardering.fcfYield * 100 : null, 4.25, 3.75, 13, 15, true],
  'ROE': [c.lonksamhet.roe * 100, b => b.lonksamhet?.roe != null ? b.lonksamhet.roe * 100 : null, 18.53, 15.54, 10, 15, true],
  'ROIC': [c.lonksamhet.roic * 100, b => b.lonksamhet?.roic != null ? b.lonksamhet.roic * 100 : null, 17.42, 13.56, 9, 15, true],
  'brutto': [c.lonksamhet.bruttoMarginal * 100, b => b.lonksamhet?.bruttoMarginal != null ? b.lonksamhet.bruttoMarginal * 100 : null, 70.99, 47.75, 10, 16, true],
  'EBIT': [c.lonksamhet.ebitMarginal * 100, b => b.lonksamhet?.ebitMarginal != null ? b.lonksamhet.ebitMarginal * 100 : null, 27.71, 21.17, 12, 16, true],
  'netto': [c.lonksamhet.nettoMarginal * 100, b => b.lonksamhet?.nettoMarginal != null ? b.lonksamhet.nettoMarginal * 100 : null, 13.41, 14.40, 7, 16, true],
  'FCF-marg': [c.lonksamhet.fcfMarginal * 100, b => b.lonksamhet?.fcfMarginal != null ? b.lonksamhet.fcfMarginal * 100 : null, 14.08, 12.51, 13, 16, true],
  'skuld/EK': [c.stabilitet.skuldEgenkapital, b => b.stabilitet?.skuldEgenkapital, 0.642, 0.527, 1, 15, false],
  'prognos': [c.tillvaxt.prognosTillvaxt * 100, b => b.tillvaxt?.prognosTillvaxt != null ? b.tillvaxt.prognosTillvaxt * 100 : null, 15.62, 12.20, 7, 16, true],
  'resCAGR': [c.tillvaxt.resultatCAGR5ar * 100, b => b.tillvaxt?.resultatCAGR5ar != null ? b.tillvaxt.resultatCAGR5ar * 100 : null, 5.09, 3.48, 7, 14, true],
  'omsCAGR': [c.tillvaxt.omsattningCAGR5ar * 100, b => b.tillvaxt?.omsattningCAGR5ar != null ? b.tillvaxt.omsattningCAGR5ar * 100 : null, 7.30, 4.38, 10, 16, true],
  'TTM': [c.tillvaxt.omsattningTillvaxtTTM * 100, b => b.tillvaxt?.omsattningTillvaxtTTM != null ? b.tillvaxt.omsattningTillvaxtTTM * 100 : null, 4.85, 7.20, 9, 16, true],
};
for (const [namn, [gv, f, hm, um, rangPåstått, nPåstått, högstBäst]] of Object.entries(M)) {
  const g = gren.map(f).filter(x => x !== null && x !== undefined);
  const a = arr.map(f).filter(x => x !== null && x !== undefined);
  const hmR = median(g), umR = median(a);
  const sorted = [...g].sort((x, y) => högstBäst ? y - x : x - y);
  const rang = sorted.indexOf(gv) + 1;
  ok(Math.abs(hmR - hm) / hm < 0.002 && Math.abs(umR - um) / um < 0.002 && rang === rangPåstått && g.length === nPåstått,
    `median+rang ${namn}`, `gren ${hmR.toFixed(3)} (n=${g.length}) universum ${umR.toFixed(3)} (n=${a.length}) rang ${rang}/${g.length}`);
}
ok(median(gren.map(b => b.vardering?.pe).filter(x => x != null)) === 24.818 && c.vardering.pb === 4.356 && median(gren.map(b => b.vardering?.pb).filter(x => x != null)) === 4.356, 'P/B = grenens median exakt (signaturpåstående)');
// skala: grenens minsta bland SEK-bolag; inget icke-SEK-bolag i grenen under 10 mdr egen valuta
const grenSek = gren.filter(b => b.valuta === 'SEK' && b.ticker !== 'CEVI.ST');
ok(grenSek.every(b => b.marknadsKapitalMdr > c.marknadsKapitalMdr), 'grenens minsta SEK-notering', `nästa: ${Math.min(...grenSek.map(b => b.marknadsKapitalMdr))} mdr`);
const ickeSek = gren.filter(b => b.valuta !== 'SEK');
const kanda = ickeSek.filter(b => b.marknadsKapitalMdr != null);
ok(kanda.every(b => b.marknadsKapitalMdr > 10), 'inget icke-SEK-bolag med känt värde i CellaVisions storleksklass', `minsta kända: ${Math.min(...kanda.map(b => b.marknadsKapitalMdr))} mdr egen valuta; FRE.DE saknar värde i filen`);
warn(ickeSek.filter(b => b.marknadsKapitalMdr == null).length === 1, 'FRE.DE utan börsvärde i filen — kan inte motbevisa "grenens minsta" (världens Fresenius är dock ett storbolag; bodyn kvalificerar påståendet med svenska valutan)');

// === JURIDIKGRIND ===
const discIdx = body.lastIndexOf('*Detta paket är finansutbildning');
const utanfor = body.slice(0, discIdx);
const lagrum = (body.match(/2007:528/g) || []).length;
ok(lagrum === 1 && (body.match(/2 kap 5 §/g) || []).length === 1, 'exakt ett lagrum (2007:528, 2 kap 5 §) — i disclaimern');
const råd = (utanfor.match(/\b(köp|sälj|rekommenderar|rekommendation|målkurs|undvik)\b/gi) || []);
ok(råd.length === 0, 'rådmönster utanför disclaimer = 0', råd.join(',') || '0 träffar');
const prog = (utanfor.match(/\b(väntas|förväntas|kommer att|borde|spekulation)\b/gi) || []);
ok(prog.length === 0, 'prognosord utanför disclaimer = 0', prog.join(',') || '0 träffar');
ok(har('inte investeringsrådgivning') && har('publiceringen av detta paket är kundens beslut'), 'disclaimer komplett');

// === LÄNKAR HTTP 200 ===
const länkar = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
let lFel = 0;
for (const url of länkar) {
  try {
    const r = await fetch('http://localhost:3000' + url, { redirect: 'manual' });
    if (r.status !== 200) { lFel++; console.log(`FEL länk ${url} → ${r.status}`); } else pass++;
  } catch (e) { lFel++; console.log(`FEL länk ${url} → ${e.message}`); }
}
ok(lFel === 0, `interna länkar HTTP 200 (${länkar.length} unika)`);

console.log(`\nSAMMANFATTNING: ${pass} PASS, ${fel} FEL, ${varn} VARNINGAR (totalt ${pass + fel + varn} kontroller; ${länkar.length} länkar)`);
process.exit(fel > 0 ? 1 : 0);
