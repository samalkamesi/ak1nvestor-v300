// _s4u3-lvmh-kvd.mjs — KVD för LVMH Q3-läspaketet (s4-u3, manifest auto-s4-1789931110711)
// Kontrollerar: struktur, källtalsparitet (universumrad MC.PA + sökverifierade H1/utdelnings-tal),
// aritmetikmotor (avrundningstolerans ±0,5 på sista siffran; tecken bärs av orden minus/plus),
// medianer/rang LIVE ur data/portfolj-system/bolagsunivers.json (konsumentgrenen 35 bolag),
// juridikgrind (2007:528 exakt 1, rådmönster 0), internlänkar HTTP 200 mot localhost.
// GRÖN = 0 FEL 0 VARNING.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const paket = JSON.parse(readFileSync(
  new URL('../data/blogg-utkast/kvartal/2026-q3/sa-laser-du-lvmh-q3-2026.json', import.meta.url), 'utf8'));
const uniRaw = readFileSync(new URL('../data/portfolj-system/bolagsunivers.json', import.meta.url));
const uni = JSON.parse(uniRaw);
console.log('universumfilens md5 (snapshot för denna kontroll): ' + createHash('md5').update(uniRaw).digest('hex'));
const b = paket.body;
let PASS = 0, FEL = 0, VARN = 0;
const fel = (m) => { FEL++; console.log('  FEL: ' + m); };
const varn = (m) => { VARN++; console.log('  VARNING: ' + m); };
const pass = () => PASS++;
const ok = (cond, m) => (cond ? pass() : fel(m));

// ---------- 1. Struktur ----------
console.log('1. Struktur');
ok(paket.slug === 'sa-laser-du-lvmh-q3-2026', 'slug');
ok(paket.author === 'AK1A Research Lab' && paket.pillar === 'Institutionell metodik', 'author/pillar');
ok(paket.publishedAt === '2026-10-20', 'publishedAt = tredjepartsestimaterad rappdag (månaden är bolagsbekräftad, redovisas öppet i bodyn)');
const ord = b.split(/\s+/).length;
ok(ord >= 2300 && ord <= 3900, `ord ${ord} i spannet 2300–3900`);
ok(paket.readingMinutes === Math.round(ord / 600), `readingMinutes ${paket.readingMinutes} = round(${ord}/600)`);
ok(paket.description.length >= 400 && paket.description.length <= 727, `description ${paket.description.length} tecken`);
ok(Array.isArray(paket.tags) && paket.tags.length >= 5 && paket.tags.includes('LVMH'), 'tags');
const h2 = [...b.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
ok(h2.length === 7, `7 H2-rubriker (fann ${h2.length})`);
ok(h2[0].startsWith('Urvalet') && h2[1].startsWith('Nyckeltalen') && h2[2].startsWith('Datavakten')
  && h2[3].startsWith('Så står sig') && h2[4].startsWith('Tre sätt') && h2[5].startsWith('Praktiskt')
  && h2[6] === 'Källor', 'H2-ordning enligt seriens mall');
const sistaStycke = b.trim().split(/\n\n/).pop();
ok(sistaStycke.startsWith('*') && sistaStycke.endsWith('*')
  && sistaStycke.includes('inte investeringsrådgivning')
  && sistaStycke.includes('publiceringen av detta paket är kundens beslut'), 'kursiv disclaimer exakt sista stycket');
const provnamn = [...b.matchAll(/\*\*Prov (\d): ([^*]+)\*\*/g)].map((m) => m[1]);
ok(provnamn.length === 5, `fem namngivna datavaktsprov (fann ${provnamn.length})`);

// ---------- 2. Källtalsparitet ----------
console.log('2. Källtalsparitet (tal i bodyn mot källmängderna)');
const mc = (Array.isArray(uni) ? uni : uni.lista).find((x) => x.ticker === 'MC.PA');
ok(!!mc, 'MC.PA-rad i universumfilen');
ok(mc.hamtat === '2026-09-03', 'universumradens hämtdatum');
const kon = (Array.isArray(uni) ? uni : uni.lista).filter((x) => x.bransch === 'konsument');
const median = (f) => { const v = kon.map(f).filter((x) => x !== null && x !== undefined); v.sort((a, c) => a - c); const m = v.length >> 1; return [v.length ? (v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2) : null, v.length]; };
const rang = (f, desc) => { const v = kon.map(f).filter((x) => x !== null && x !== undefined).sort((a, c) => (desc ? c - a : a - c)); const mine = f(mc); return [v.indexOf(mine) + 1, v.length]; };
const num = (x, dec) => x.toFixed(dec).replace('.', ',').replace('-', '−');
const falt = [
  ['pris', mc.pris, 2], ['mcap', mc.marknadsKapitalMdr, 3],
  ['pe', mc.vardering.pe, 3], ['pb', mc.vardering.pb, 2], ['evEbit', mc.vardering.evEbit, 3],
  ['peg', mc.vardering.peg, 2], ['fcfY %', mc.vardering.fcfYield * 100, 2],
  ['roe %', mc.lonksamhet.roe * 100, 2], ['roic %', mc.lonksamhet.roic * 100, 2],
  ['brutto %', mc.lonksamhet.bruttoMarginal * 100, 2], ['ebit %', mc.lonksamhet.ebitMarginal * 100, 2],
  ['netto %', mc.lonksamhet.nettoMarginal * 100, 2], ['fcfm %', mc.lonksamhet.fcfMarginal * 100, 2],
  ['skuldEK', mc.stabilitet.skuldEgenkapital, 3],
  ['omsCAGR %', mc.tillvaxt.omsattningCAGR5ar * 100, 2], ['resCAGR %', mc.tillvaxt.resultatCAGR5ar * 100, 2],
  ['ttm %', mc.tillvaxt.omsattningTillvaxtTTM * 100, 1], ['prognos %', mc.tillvaxt.prognosTillvaxt * 100, 2],
  ['oms22', mc.serier.omsattning[0] / 1e9, 3], ['oms23', mc.serier.omsattning[1] / 1e9, 3],
  ['oms24', mc.serier.omsattning[2] / 1e9, 3], ['oms25', mc.serier.omsattning[3] / 1e9, 3],
  ['res22', mc.serier.resultat[0] / 1e9, 3], ['res23', mc.serier.resultat[1] / 1e9, 3],
  ['res24', mc.serier.resultat[2] / 1e9, 3], ['res25', mc.serier.resultat[3] / 1e9, 3],
];
for (const [namn, v, dec] of falt) {
  const s = num(v, dec);
  ok(b.includes(s), `universumfält ${namn} = ${s} finns i bodyn`);
}
// Sökverifierade tal (LVMH H1-2026-meddelande 2026-07-27 + utdelning 2026 + kalenderläget)
const sok = ['38,6', '8,7', '22,5', '831', '15,9', 'plus 2 procent', 'minus 3 procent',
  '13,00', '5,50', '7,50', '4 december 2025', '23 april 2026', '13 oktober 2025',
  '20 oktober 2026', '27 juli 2026', 'accelererande'];
for (const s of sok) ok(b.includes(s), `sökverifierat tal "${s}" finns i bodyn`);

// ---------- 3. Aritmetikmotor ----------
console.log('3. Aritmetikmotor (omräkning med avrundningstolerans)');
const U = mc.marknadsKapitalMdr, P = mc.pris, PE = mc.vardering.pe, PB = mc.vardering.pb,
  EV = mc.vardering.evEbit, PEG = mc.vardering.peg, ROE = mc.lonksamhet.roe;
const O25 = mc.serier.omsattning[3] / 1e9, R25 = mc.serier.resultat[3] / 1e9;
const H1 = 38.6, H1RAP = -0.03, DIV = 13.0;
const motor = [
  ['P/B÷ROE', PB / ROE, '18,62', 'identitetstestets P/E-bakväg'],
  ['gap identitet', (PE / (PB / ROE) - 1) * 100, '5,9', 'gap mot P/E-fältet (bodyn: "gap 5,9 procent")'],
  ['EK = mcap/PB', U / PB, '68,080', 'härlett bokfört kapital'],
  ['aktier = mcap/kurs', U / P, '0,49297', 'härlett aktieantal i miljarder'],
  ['aktier miljoner', (U / P) * 1000, '493,0', 'aktieantalet i miljoner'],
  ['BVPS = EK/aktier', (U / PB) / (U / P), '138,10', 'bokfört värde per aktie'],
  ['kurs/BVPS', P / ((U / PB) / (U / P)), '3,089', 'P/B tredje vägen'],
  ['netto via P/E', U / PE, '10,668', 'absolutkontrollens vinst'],
  ['gap absolut', ((U / PE) / R25 - 1) * 100, 'minus 1,9', 'mot seriens 2025-rad (bodyn skriver med ord)'],
  ['EBIT-avkastning', (1 / EV) * 100, '7,38', '1 ÷ EV/EBIT'],
  ['vinstavkastning', (1 / PE) * 100, '5,07', '1 ÷ P/E'],
  ['EBIT/netto-kvot', (1 / EV) / (1 / PE), '1,45', 'diskontkvot = skatt+finans+minoriteter'],
  ['H1-marginal', (8.7 / H1) * 100, '22,5', '8,7 ÷ 38,6 = källparitet mot EBIT-fältet'],
  ['direktavkastning', (DIV / P) * 100, '3,05', '13,00 ÷ kurs'],
  ['utdelningsbelopp', DIV * (U / P), '6,409', '13,00 × aktieantal'],
  ['payout resultat', (DIV * (U / P)) / R25 * 100, '58,9', 'utdelning av 2025 års resultat'],
  ['fcf 2025', mc.lonksamhet.fcfMarginal * O25, '11,709', '14,49 % × 80,807'],
  ['utdelning/fcf', (DIV * (U / P)) / (mc.lonksamhet.fcfMarginal * O25) * 100, '54,7', 'utdelningens andel av fritt kassaflöde'],
  ['H1-25 härled', H1 / (1 + H1RAP), '39,79', '38,6 ÷ 0,97'],
  ['H2-25', O25 - H1 / (1 + H1RAP), '41,013', '80,807 − 39,79'],
  ['H2-26 plant år', O25 - H1, '42,207', '80,807 − 38,6'],
  ['H2-tillväxt plant', ((O25 - H1) / (O25 - H1 / (1 + H1RAP)) - 1) * 100, 'plus 2,91', 'kravet för plant helår (med ord i bodyn)'],
  ['FY om H1-takt', H1 + (O25 - H1 / (1 + H1RAP)) * (1 + H1RAP), '78,383', 'H2 upprepar minus 3 procent'],
  ['FY-glidning', ((H1 + (O25 - H1 / (1 + H1RAP)) * (1 + H1RAP)) / O25 - 1) * 100, 'minus 3,0', 'helårets glidning (med ord)'],
  ['PEG-implierad', PE / PEG, '12,40', 'P/E ÷ PEG'],
  ['PEG-gap prognos', (PE / PEG / (mc.tillvaxt.prognosTillvaxt * 100) - 1) * 100, '0,6', 'mot prognosfältet 12,32'],
  ['PEG 1,0-krav', PE, '19,7', 'tillväxt som krävs för PEG 1,0'],
  ['PEG×3-multipel', PEG * 3, '4,77', 'P/E på tre procents tillväxt och PEG 1,59'],
  ['oms-glidning 22→25', (O25 / (mc.serier.omsattning[0] / 1e9) - 1) * 100, 'plus 2,0', '2025/2022−1 (med ord)'],
  ['oms-topp 23→25', (O25 / (mc.serier.omsattning[1] / 1e9) - 1) * 100, 'minus 6,2', '2025/2023−1 (med ord)'],
  ['res 22→25', (R25 / (mc.serier.resultat[0] / 1e9) - 1) * 100, 'minus 22,8', 'resultatglidningen sedan 2022 (med ord)'],
  ['res-topp 23→25', (R25 / (mc.serier.resultat[1] / 1e9) - 1) * 100, 'minus 28,3', 'från topp till botten (med ord)'],
];
for (const [namn, v, s, motiv] of motor) {
  const dec = (s.split(',')[1] || '').replace(/[^0-9]/g, '').length;
  const tol = 0.5 * Math.pow(10, -dec) + 1e-9;
  const pv = parseFloat(s.replace(/,/g, '.').replace(/−/g, '-').replace(/^minus /, '-').replace(/^plus /, '+'));
  if (Number.isNaN(pv)) { fel(`${namn}: kunde inte tolka text "${s}"`); continue; }
  // Textriktning: teckenlöst tal = belopp (bodyn bär riktningen i orden); "minus X"/"plus X" = signerat.
  const signed = /^(−|-|minus |plus )/.test(s.trim());
  const target = signed ? v : Math.abs(v);
  ok(Math.abs(target - pv) <= tol, `${namn}: motor ${v.toFixed(6)} mot text "${s}" (motiv: ${motiv})`);
  ok(b.includes(s), `${namn}: texten "${s}" finns i bodyn`);
}

// ---------- 4. Medianer och rang live ----------
console.log('4. Medianer och rang (live ur universumfilen, konsumentgrenen)');
const medTXT = [
  ['P/E-median 19,88', median((x) => x.vardering?.pe), 19.8765, 34, '19,88'],
  ['P/B-median 3,35', median((x) => x.vardering?.pb), 3.3545, 34, '3,35'],
  ['EV/EBIT-median 16,16', median((x) => x.vardering?.evEbit), 16.155, 34, '16,16'],
  ['PEG-median 1,70', median((x) => x.vardering?.peg), 1.7, 28, '1,70'],
  ['fcfY-median 4,68 %', median((x) => x.vardering?.fcfYield), 0.0468, 33, '4,68'],
  ['ROE-median 18,4 %', median((x) => x.lonksamhet?.roe), 0.184, 33, '18,4'],
  ['ROIC-median 13,62 %', median((x) => x.lonksamhet?.roic), 0.1362, 33, '13,62'],
  ['bruttomedian 50,37 %', median((x) => x.lonksamhet?.bruttoMarginal), 0.5037, 35, '50,37'],
  ['nettomedian 8,81 %', median((x) => x.lonksamhet?.nettoMarginal), 0.0881, 35, '8,81'],
  ['skuldmedian 0,73', median((x) => x.stabilitet?.skuldEgenkapital), 0.73145, 34, '0,73'],
  ['TTM-median 2,6 %', median((x) => x.tillvaxt?.omsattningTillvaxtTTM), 0.026, 35, '2,6'],
  ['EBIT-median 13,88 %', median((x) => x.lonksamhet?.ebitMarginal), 0.1388, 35, '13,88'],
  ['fcfm-median 9,07 %', median((x) => x.lonksamhet?.fcfMarginal), 0.0907, 34, '9,07'],
  ['prognos-median 11,7 %', median((x) => x.tillvaxt?.prognosTillvaxt), 0.11735, 32, '11,7'],
  ['omsCAGR-median 4,21 %', median((x) => x.tillvaxt?.omsattningCAGR5ar), 0.0421, 34, '4,21'],
  ['resCAGR-median 6,52 %', median((x) => x.tillvaxt?.resultatCAGR5ar), 0.0652, 32, '6,52'],
];
for (const [namn, [mv, n], ev, en_, txt] of medTXT) {
  ok(Math.abs(mv - ev) < 0.0005 && n === en_, `${namn} (live ${mv}/${n})`);
  ok(b.includes(txt), `${namn}: texten "${txt}" finns i bodyn`);
}
const rangTXT = [
  ['P/E 17 av 34', rang((x) => x.vardering?.pe, false), [17, 34], '17 av 34'],
  ['P/B 17 av 34', rang((x) => x.vardering?.pb, false), [17, 34], '17 av 34'],
  ['EV/EBIT 10 av 34', rang((x) => x.vardering?.evEbit, false), [10, 34], '10 av 34'],
  ['PEG 13 av 28', rang((x) => x.vardering?.peg, false), [13, 28], '13 av 28'],
  ['fcfY 14 av 33', rang((x) => x.vardering?.fcfYield, true), [14, 33], '14 av 33'],
  ['ROE 18 av 33', rang((x) => x.lonksamhet?.roe, true), [18, 33], '18 av 33'],
  ['ROIC 12 av 33', rang((x) => x.lonksamhet?.roic, true), [12, 33], '12 av 33'],
  ['brutto 3 av 35', rang((x) => x.lonksamhet?.bruttoMarginal, true), [3, 35], '3 av 35'],
  ['EBIT 8 av 35', rang((x) => x.lonksamhet?.ebitMarginal, true), [8, 35], '8 av 35'],
  ['netto 13 av 35', rang((x) => x.lonksamhet?.nettoMarginal, true), [13, 35], '13 av 35'],
  ['skuld 14 av 34', rang((x) => x.stabilitet?.skuldEgenkapital, false), [14, 34], '14 av 34'],
  ['TTM 28 av 35', rang((x) => x.tillvaxt?.omsattningTillvaxtTTM, true), [28, 35], '28 av 35'],
  ['fcfm 11 av 34', rang((x) => x.lonksamhet?.fcfMarginal, true), [11, 34], '11 av 34'],
];
for (const [namn, [r, n], [er, en_], txt] of rangTXT) {
  ok(r === er && n === en_ && b.includes(txt), `${namn} (live ${r}/${n}) + texten "${txt}"`);
}

// ---------- 5. Juridikgrind ----------
console.log('5. Juridikgrind');
const lagrum = (b.match(/2007:528/g) || []).length;
ok(lagrum === 1, `exakt ett lagrum 2007:528 (fann ${lagrum})`);
ok(b.includes('2 kap 5 §'), 'lagrummets paragraf');
// Rådverb: fristående köp/sälj/rekommendation. Disclaimerns standardnekande strippas före
// matchning: utsaga OM avsaknaden av råd, inte ett råd (seriens konvention sedan Shell-paketet).
const bUtanNekande = b.replace(/Inga köp-, sälj- eller hållningsrekommendationer/g, '');
const rad = bUtanNekande.match(/\b(köp|sälj|sälja|rekommenderar|rekommendera)\b/g) || [];
ok(rad.length === 0, `rådmönster 0 (fann ${JSON.stringify(rad)})`);
ok((b.match(/investeringsrådgivning/g) || []).length >= 2, 'utbildningsformulering närvarande');

// ---------- 6. Internlänkar ----------
console.log('6. Internlänkar mot localhost');
const links = [...new Set([...b.matchAll(/\]\((\/dataset\/konsument\/[a-z0-9-]+)\)/g)].map((m) => m[1]))];
ok(links.length >= 14, `minst 14 dataset-länkar (fann ${links.length})`);
for (const l of links) {
  try {
    const r = await fetch('http://localhost:3000' + l, { method: 'GET' });
    ok(r.status === 200, `${l} → ${r.status}`);
  } catch (e) {
    fel(`${l} kunde inte hämtas: ${e.message}`);
  }
}

// ---------- 7. Inga förbjudna ytor i paketet ----------
console.log('7. Spårregler');
ok(!JSON.stringify(paket).includes('data/blogg/'), 'ingen live-sökväg i paketet');
ok(paket.tags.every((t) => !/pris|tier|publicer/i.test(t)), 'inga R2-ord i tags');

console.log(`\nKVD SLUT: ${PASS} PASS, ${FEL} FEL, ${VARN} VARNING`);
process.exit(FEL + VARN > 0 ? 1 : 0);
