#!/usr/bin/env node
// s1-u3 (auto-s1-1789694729881): maskinell granskning av
// sa-laser-du-astrazeneca-q3-2026.json (mx2 #1, byggcommit 09ebc188).
// Läser endast: utkast-JSON, bolagsunivers @09ebc188 (115-versionen =
// byggversionen; AZN-rad + medianer) + aktuell fil som notis,
// data/analyses/AZN.ST.json, vagvalidering-SENASTE.{json,md},
// kalender-halso.json, varumarke.json, data/blogg/ + HTTP localhost.
// Skriver inget.
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const UT = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-astrazeneca-q3-2026.json';
const u = JSON.parse(readFileSync(UT, 'utf8'));
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const body = u.body;
const rader = body.split('\n');
const R = [], GRON = [], ROD = [];
const kontroll = (namn, ok, detalj) => { R.push(`${ok ? '✓' : '✗'} ${namn}${detalj ? ' — ' + detalj : ''}`); ok ? GRON.push(namn) : ROD.push(namn); };

// 0) KÄLLOR — universum @09ebc188 (byggversion) + aktuell som notis
const u115 = JSON.parse(readFileSync('/tmp/s1u3-azn-bolagsunivers-115.json', 'utf8'));
const uNu = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
kontroll('universum @09ebc188 = 115 (byggversionens storlek)', u115.length === 115, `faktiskt ${u115.length}`);
R.push(`NOTIS: aktuell fil = ${uNu.length} bolag (filen växer av dataset-spåret; utkastets tal granskas mot 115-versionen)`);
const azn = u115.find(b => b.ticker === 'AZN.ST');
kontroll('AZN.ST-rad finns i byggversionen', !!azn);
const yahoo = (azn.kallor || []).find(k => k.namn.includes('Yahoo'));
kontroll('Yahoo-insamling 2026-09-03', yahoo?.hamtat === '2026-09-03', yahoo?.hamtat);
const ms = (azn.kallor || []).find(k => k.namn.includes('MarketStack'));
kontroll('MarketStack utan färsk data (utkastet: "saknade färsk data")', !ms || /ingen färsk data/i.test(ms.paranoid || ''), ms?.paranoid?.slice(0, 60));

// 1) AZN-radens tal mot utkastets (visningstal, tolerans halv sista siffra)
const tal = [
  ['pris 1584', azn.pris, 1584],
  ['mcap ~2457 (heltalsavrundat, utkastet säger "cirka")', azn.marknadsKapitalMdr, 2457, 0.5],
  ['P/E 24,6', azn.vardering.pe, 24.6],
  ['P/B 48,8', azn.vardering.pb, 48.8],
  ['EV/EBIT 170,0', azn.vardering.evEbit, 170.0],
  ['PEG 1,26', azn.vardering.peg, 1.26],
  ['fcfYield 0,2 %', azn.vardering.fcfYield * 100, 0.2],
  ['ROE 22,0 %', azn.lonksamhet.roe * 100, 22.0],
  ['ROIC 17,4 %', azn.lonksamhet.roic * 100, 17.4],
  ['brutto 81,7 %', azn.lonksamhet.bruttoMarginal * 100, 81.7],
  ['EBIT 23,5 %', azn.lonksamhet.ebitMarginal * 100, 23.5],
  ['netto 17,0 %', azn.lonksamhet.nettoMarginal * 100, 17.0],
  ['FCF-marginal 8,0 %', azn.lonksamhet.fcfMarginal * 100, 8.0],
  ['skuld/EK 0,64', azn.stabilitet.skuldEgenkapital, 0.64],
  ['omsCAGR +9,8 %', azn.tillvaxt.omsattningCAGR5ar * 100, 9.8],
  ['resCAGR +46,0 %', azn.tillvaxt.resultatCAGR5ar * 100, 46.0],
  ['omsTTM +6,4 %', azn.tillvaxt.omsattningTillvaxtTTM * 100, 6.4],
  ['prognos +9,0 %', azn.tillvaxt.prognosTillvaxt * 100, 9.0],
  ['insiderköp 0', azn.aterkop.insiderkopSenaste6man, 0],
];
for (const [namn, faktiskt, utkast, tolAbs] of tal) {
  const tol = tolAbs != null ? tolAbs : 0.05;
  kontroll(namn, Math.abs(faktiskt - utkast) <= tol, `källa ${faktiskt}`);
}
// Storlekspåståenden
const sek = u115.filter(b => b.valuta === 'SEK' && b.marknadsKapitalMdr != null).sort((a, b) => b.marknadsKapitalMdr - a.marknadsKapitalMdr);
kontroll('AZN = tyngst Stockholm-noterade (SEK) i universumet', sek[0].ticker === 'AZN.ST', `topp-3: ${sek.slice(0, 3).map(b => b.ticker + ' ' + Math.round(b.marknadsKapitalMdr)).join(', ')}`);
const storre = u115.filter(b => (b.marknadsKapitalMdr || 0) > azn.marknadsKapitalMdr).map(b => b.ticker);
kontroll('"Nvidia och Microsoft större i universumet"', storre.includes('NVDA') && storre.includes('MSFT'), `alla större: ${storre.join(', ')} (alla USD-valuta)`);
kontroll('analysbiblioteket = 11 bolag ("samtliga elva")', readdirSync('/home/ak1a/AK1/data/analyses').filter(f => f.endsWith('.json')).length === 11);
kontroll('räntetäckning osatt (null)', azn.stabilitet.rantaTackning === null);
kontroll('serier egetKapital tomma', (azn.serier.egetKapital || []).length === 0);
kontroll('serier fcf tomma', (azn.serier.fcf || []).length === 0);
kontroll('serier 4 år 2022–2025', JSON.stringify(azn.serier.ar) === JSON.stringify(['2022','2023','2024','2025']));

// 2) Medianer ur 115-filen (mittersta-värdet n=11 udda; universum-P/E n=106 jämt)
const median = (arr) => { const s = [...arr].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const halso = u115.filter(b => b.bransch === 'halso');
kontroll('hälsa n=11', halso.length === 11, `faktiskt ${halso.length}`);
const med = (f) => median(halso.map(b => f(b)).filter(v => v != null));
const medTal = [
  ['hälsomedian ROE 18,5', med(b => b.lonksamhet?.roe) * 100, 18.5],
  ['hälsomedian ROIC 19,0', med(b => b.lonksamhet?.roic) * 100, 19.0],
  ['hälsomedian brutto 68,7', med(b => b.lonksamhet?.bruttoMarginal) * 100, 68.7],
  ['hälsomedian EBIT 23,5', med(b => b.lonksamhet?.ebitMarginal) * 100, 23.5],
  ['hälsomedian netto 17,5', med(b => b.lonksamhet?.nettoMarginal) * 100, 17.5],
  ['hälsomedian FCF 11,4', med(b => b.lonksamhet?.fcfMarginal) * 100, 11.4],
  ['hälsomedian omsTTM +5,2', med(b => b.tillvaxt?.omsattningTillvaxtTTM) * 100, 5.2],
  ['hälsomedian prognos +8,8', med(b => b.tillvaxt?.prognosTillvaxt) * 100, 8.8],
  ['hälsomedian P/E 24,7', med(b => b.vardering?.pe), 24.7],
];
for (const [namn, raknad, utkast] of medTal) kontroll(namn, Math.abs(raknad - utkast) <= 0.05, `egen omräkning ${raknad.toFixed(3)}`);
const peUni = u115.map(b => b.vardering?.pe).filter(v => v != null);
kontroll('universum-P/E n=106', peUni.length === 106, `faktiskt ${peUni.length}`);
kontroll('universum-P/E-median 20,2', Math.abs(median(peUni) - 20.2) <= 0.05, `egen omräkning ${median(peUni).toFixed(3)}`);

// 3) Motordata (AZN.ST.json, verifierad 2026-08-24)
const mo = JSON.parse(readFileSync('/home/ak1a/AK1/data/analyses/AZN.ST.json', 'utf8'));
kontroll('motorn verifierad 2026-08-24', mo.verified === '2026-08-24', mo.verified);
const ph = mo.waveSummary.perHorisont;
for (const [h, e] of Object.entries({ mikro: 'impulsvåg', kort: 'korrigering', medellang: 'basbygge', lang: 'impulsvåg', mega: 'impulsvåg' }))
  kontroll(`vågklass ${h} = ${e}`, ph[h] === e, `källa ${ph[h]}`);
const m25 = Object.values(mo.waveSummary.matris25);
kontroll('25-cellmatris 9 bullish', m25.filter(v => v === 1).length === 9, `faktiskt ${m25.filter(v => v === 1).length}`);
kontroll('25-cellmatris 4 bearish', m25.filter(v => v === -1).length === 4, `faktiskt ${m25.filter(v => v === -1).length}`);
kontroll('25-cellmatris 12 neutrala', m25.filter(v => v === 0).length === 12, `faktiskt ${m25.filter(v => v === 0).length}`);
kontroll('volatilitet 27 %/år', Math.round(mo.risk.sigmaAr * 100) === 27, `källa ${mo.risk.sigmaAr} (= ${(mo.risk.sigmaAr * 100).toFixed(1)} %)`);
R.push(`NOTIS: källans sigmaAr = ${(mo.risk.sigmaAr * 100).toFixed(1)} % — utkastets "27 procent" är korrekt avrundat; utkastet säger även "exakt mitt i" om 52v-positionen: källans pos52 = ${mo.risk.pos52} (= ${(mo.risk.pos52 * 100).toFixed(1)} %) — "exakt" är en aning starkt (50,3), C-notis`);
const niv = Object.fromEntries(mo.priceLevels.levels.map(l => [l.label, parseFloat(l.value)]));
kontroll('52v-låg 1 226,00', niv['52v-lägsta'] === 1226, String(niv['52v-lägsta']));
kontroll('Fib 61,8 % 1 493,21', Math.abs(niv['Fib 61,8 % (från topp)'] - 1493.21) < 0.01, String(niv['Fib 61,8 % (från topp)']));
kontroll('MA50 1 656,83', Math.abs(niv['MA 50 dagar'] - 1656.83) < 0.01, String(niv['MA 50 dagar']));
kontroll('Fib 38,2 % 1 658,29', Math.abs(niv['Fib 38,2 % (från topp)'] - 1658.29) < 0.01, String(niv['Fib 38,2 % (från topp)']));
kontroll('MA200 1 721,38', Math.abs(niv['MA 200 dagar'] - 1721.3825) < 0.005, String(niv['MA 200 dagar']));
kontroll('52v-högst 1 925,50', niv['52v-högsta'] === 1925.5, String(niv['52v-högsta']));

// 4) Vågvalideringsdomarna (SENASTE.md, domdatum 2026-09-04)
const vv = readFileSync('/home/ak1a/AK1/data/rapporter/vagvalidering-SENASTE.md', 'utf8');
const aznRad = vv.split('\n').find(l => l.includes('**AZN.ST**'));
kontroll('AZN-domrad hittad', !!aznRad, aznRad?.slice(0, 100));
const dom = (h) => { const m = aznRad.match(new RegExp(h + ': (\\S+) → (\\S+) ?[✓✗]? ?\\(?([-+0-9,\\. %]+)?')); return m; };
for (const [h, klass, utfall, pct] of [['mikro','basbygge','miss','-7,6'],['kort','basbygge','träff','2,9'],['medellång','basbygge','miss','35,8'],['mega','basbygge','miss','35,8']]) {
  const nyckel = h === 'medellång' ? 'medellång' : h;
  const m = aznRad.match(new RegExp(nyckel + ': ([a-zåäö]+) → ([a-zåäö]+) [✓✗] ?\\(?([-+,0-9.]+)'));
  kontroll(`dom ${h}: ${klass} ${utfall} ${pct} %`, m && m[1] === klass && m[2] === utfall && m[3].replace(/,/g, '.').includes(pct.replace(',', '.')), m ? m.slice(1, 4).join(' | ') : 'regex');
}
kontroll('dom lång = osatt (döms aldrig)', /lång: osatt → osatt/.test(aznRad));
const vvj = JSON.parse(readFileSync('/home/ak1a/AK1/data/rapporter/vagvalidering-SENASTE.json', 'utf8'));
kontroll('universumtotal 52 % på 48 dömda', vvj.totalt.traffProcent === 52 && vvj.totalt.nDomda === 48, `${vvj.totalt.traffProcent} % / ${vvj.totalt.nDomda}`);
kontroll('domdatum 2026-09-04', vvj.domdatum === '2026-09-04', vvj.domdatum);

// 5) Kalender (kalender-halso.json)
const kal = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-halso.json', 'utf8'));
const aznKal = kal.bolag.find(b => b.ticker === 'AZN.ST');
kontroll('kalender: november enligt eventssida', /2026-11 enligt bolagets eventssida/.test(aznKal.rapportfenster), aznKal.rapportfenster.slice(0, 70));
kontroll('kalender: 2026-10-30 ej bolagsbekräftat', /2026-10-30, ej bolagsbekräftat/.test(aznKal.rapportfenster));

// 6) Aritmetik — datavakt, scenarioruta, CAGR, multiplövning
const A = [
  ['datavakt P/B÷ROE ≈ 222 (underkänns)', 48.848 / 0.2197, 222.1, 1],
  ['implicit EPS 1584÷24,6 ≈ 64', 1584 / 24.6, 64.4, 0.6],
  ['scenariocell 57,0×22,5 % = 12,8', 57.0 * 0.225, 12.83, 0.03],
  ['scenariocell 57,0×23,5 % = 13,4', 57.0 * 0.235, 13.40, 0.03],
  ['scenariocell 57,0×24,5 % = 14,0', 57.0 * 0.245, 13.97, 0.03],
  ['scenariocell 58,7×22,5 % = 13,2', 58.7 * 0.225, 13.21, 0.03],
  ['scenariocell 58,7×23,5 % = 13,8', 58.7 * 0.235, 13.79, 0.03],
  ['scenariocell 58,7×24,5 % = 14,4', 58.7 * 0.245, 14.38, 0.03],
  ['scenariocell 60,5×22,5 % = 13,6', 60.5 * 0.225, 13.61, 0.03],
  ['scenariocell 60,5×23,5 % = 14,2', 60.5 * 0.235, 14.22, 0.03],
  ['scenariocell 60,5×24,5 % = 14,8', 60.5 * 0.245, 14.82, 0.03],
  ['bas −3 % = 57,0 (58,7×0,97)', 58.7 * 0.97, 56.94, 0.06],
  ['bas +3 % = 60,5 (58,7×1,03)', 58.7 * 1.03, 60.46, 0.06],
  ['1 pp marginal ≈ 0,59 mdr', 58.7 * 0.01, 0.587, 0.005],
  ['3 % omsättning ≈ 0,41 mdr (EBIT-effekt)', 58.7 * 0.03 * 0.235, 0.4138, 0.005],
  ['marginal ≈ 1,4× tyngre (0,59/0,41)', (58.7 * 0.01) / (58.7 * 0.03 * 0.235), 1.418, 0.03],
  ['Essity-formeln 1/(3×0,235) = 1,42', 1 / (3 * 0.235), 1.418, 0.01],
  ['oms-CAGR (58,739/44,351)^(1/3) = 9,8 %', ((58.739 / 44.351) ** (1 / 3) - 1) * 100, 9.76, 0.15],
  ['res-CAGR (10,225/3,288)^(1/3) = 46,0 %', ((10.225 / 3.288) ** (1 / 3) - 1) * 100, 45.98, 0.15],
  ['omsättning +32 % (2022→2025)', (58.739 / 44.351 - 1) * 100, 32.4, 0.5],
  ['2024-steget +18 % (54,073/45,811)', (54.073 / 45.811 - 1) * 100, 18.0, 0.15],
  ['mer än tredubblat (10,225/3,288)', 10.225 / 3.288, 3.11, 0.02],
  ['multiplövning 24,6÷1,09 = 22,6', 24.6 / 1.09, 22.57, 0.05],
];
for (const [namn, raknad, expect, tol] of A) kontroll(namn, Math.abs(raknad - expect) <= tol, `räknat ${raknad.toFixed(4)}`);
R.push(`NOTIS PEG: källans PEG-fält 1,26 — konventionen P/E÷prognostillväxt ger ${((24.638 / 8.99)).toFixed(2)} (kvot ${(1.26 / (24.638 / 8.99)).toFixed(2)}); PEG-fältet är seriens kända instabila fält (kvotspridning 0,18–8,0 dokumenterad i syskonpaketen) — utkastet redovisar källtalen utan konventionsnot: C-förslag`);

// 7) Varumärkesgrind (kontrolleraText-replik: egna regexer på title+desc+varje rad)
let fel = 0, varningar = 0; const traffor = [];
for (const f of vm.forbjudnaFraser) {
  let re; try { re = new RegExp(f.fran, 'giu'); } catch { continue; }
  const targets = [[u.title, 'title'], [u.description, 'desc'], ...rader.map((r, i) => [r, `rad${i}`])];
  for (const [t, namn] of targets) { re.lastIndex = 0; const m = re.exec(t); if (m) { (f.allvar === 'FEL' ? fel++ : varningar++); traffor.push(`${f.allvar}: "${m[0]}" (${namn}) — ${f.motiv}`); } }
}
R.push(`VARUMARKE-GRIND: ${fel} FEL, ${varningar} varningar av ${vm.forbjudnaFraser.length} mönster`);
traffor.forEach(t => R.push('  ' + t));
if (fel === 0) GRON.push('varumärkesgrind 0 FEL');

// 8) 911-referenser (sex mönster, seriestandard) — HELA filen
const p911 = [['911', /911/], ['9/11', /9\s*\/\s*11/], ['11 september', /11\s+september/i], ['september 11', /september\s*11/i], ['nine-eleven', /nine[\s\-]?eleven/i], ['9-1-1', /9[\s\-]1[\s\-]1/]];
let a911 = 0;
for (const [namn, re] of p911) { const m = (u.title + ' ' + u.description + ' ' + body).match(re); if (m) { a911++; R.push(`911-TRÄFF ${namn}: "${m[0]}"`); } }
R.push(`911-REFERENSER: ${a911} träffar på ${p911.length} mönster`);
if (a911 === 0) GRON.push('911 = 0/6');

// 9) Rådverb + lagrum + kontext
const hela = body + ' ' + u.title + ' ' + u.description;
const rad = hela.match(/\b(köp|sälj|rekommenderar|rekommendation|undvik|aktietips|målpris|väntas stiga)\b/gi) || [];
R.push(`RÄDVERB: ${rad.length} träffar: ${[...new Set(rad.map(s => s.toLowerCase()))].join(', ') || '—'}`);
for (const ord of [...new Set(rad.map(s => s.toLowerCase()))]) {
  const i = hela.toLowerCase().indexOf(ord);
  R.push(`  kontext "${ord}": …${hela.slice(Math.max(0, i - 70), i + 70).replace(/\n/g, ' ')}…`);
}
const lag = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59', '2022:482'].filter(l => hela.includes(l));
R.push(`LAGRUM i texten: ${lag.length ? lag.join(', ') : 'inga'}`);
kontroll('exakt lagrum(skombination) = 2007:528 (disclaimern)', lag.length === 1 && lag[0] === '2007:528', '2 kap 5 §-utbildningsundantaget; inga andra lagrum ⇒ ingen blandningsrisk');
kontroll('disclaimerns 2007:528 bär 2 kap 5 §', /2007:528\) 2 kap 5 §/.test(body));

// 10) Struktur
const falt = Object.keys(u);
R.push(`FÄLT: ${falt.length} st (${falt.join(', ')})`);
const ord = body.trim().split(/\s+/).filter(w => /\p{L}/u.test(w)).length;
R.push(`ORD: ${ord}`);
R.push(`TITLE: ${u.title.length} tkn — "${u.title}"`);
R.push(`DESC(OG): ${u.description.length} tkn`);
R.push(`READINGMINUTES: ${u.readingMinutes}`);
R.push(`PUBLISHEDAT: ${u.publishedAt} (utkast-fält; publicering = kundens beslut R2)`);
const h2 = rader.filter(r => r.startsWith('## '));
R.push(`H2: ${h2.length} st`);
R.push(`MJUKA BINDESTRECK: ${(body.match(/[\u2010\u2011]/g) || []).length}`);
const sista = [...rader].reverse().find(r => r.trim() !== '');
kontroll('disclaimer sista raden + negerat investeringsråd', /inte investeringsrådgivning/i.test(sista) && /2007:528/.test(sista), sista.trim().slice(0, 90));
const pillars = new Set();
for (const f of readdirSync('/home/ak1a/AK1/data/blogg/')) { if (f.endsWith('.json')) { try { pillars.add(JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg/' + f, 'utf8')).pillar); } catch {} } }
kontroll(`pillar "${u.pillar}" giltig`, pillars.has(u.pillar));
kontroll('slug-format', /^[a-z0-9-]+$/.test(u.slug), u.slug);
kontroll('author', u.author === 'AK1A Research Lab');

// 11) Interna länkar — HTTP mot localhost (loopback whitelistad i middleware)
const lankar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
R.push(`LÄNKAR: ${lankar.length} st (${[...new Set(lankar)].length} unika)`);
const status = [];
for (const l of [...new Set(lankar)]) {
  try {
    const res = await fetch('http://localhost:3000' + l, { signal: AbortSignal.timeout(8000) });
    status.push([l, res.status]);
    kontroll(`länk ${l} → 200`, res.status === 200, String(res.status));
  } catch (e) { status.push([l, 'ERR']); ROD.push(`länk ${l}: ${e.message}`); }
}
// 0 länkar till outgivna utkast
kontroll('0 länkar till data/blogg-utkast', !lankar.some(l => existsSync('/home/ak1a/AK1/data/blogg-utkast/' + l.replace('/blogg/', '') + '.json')));

// Sammanfattning
R.push('═══ SAMMANFATTNING ═══');
R.push(`gröna kontroller: ${GRON.length} · röda fynd: ${ROD.length}`);
ROD.forEach(x => R.push('ROD: ' + x));
console.log(R.join('\n'));
