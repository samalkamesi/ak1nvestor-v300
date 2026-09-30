// _s4u2-ores-byggdata.mjs — beräkningsmotor för Öresund Q3-2026-läspaketet (ORES.ST, finans-grenen)
// Källor: universumrad ORES.ST (data/portfolj-system/bolagsunivers.json, hämtad 2026-09-03)
// + delårsrapport 1 jan–30 jun 2026 (Cision-PDF 4189161, 2026-07-10, curl-läst ordagrant)
// + delårsrapport 1 jan–30 sep 2025 (Cision-PDF 3712433, 2025-10-09, curl-läst ordagrant)
// + oresund.se senaste substansvärde/historiska substansvärden/kalender (curl 2026-09-30).
// Kör: node verktyg/_s4u2-ores-byggdata.mjs
import fs from 'fs';

const U = JSON.parse(fs.readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const r = U.find(x => x.ticker === 'ORES.ST');
const F = U.filter(x => x.bransch === 'finans');

// --- universumfält (hämtade 2026-09-03) ---
const pris = r.pris;                       // 145.4
const mcap = r.marknadsKapitalMdr;         // 6.481 (mdr SEK)
const pe = r.vardering.pe;                 // 9.429
const pb = r.vardering.pb;                 // 1.167
const evEbit = r.vardering.evEbit;         // 9.221
const peg = r.vardering.peg;               // 1.78
const fcfY = r.vardering.fcfYield;         // 0.0714
const roe = r.lonksamhet.roe;              // 0.1305
const ebitM = r.lonksamhet.ebitMarginal;   // 0.9246
const nettoM = r.lonksamhet.nettoMarginal; // 0.9666
const omsTillv = r.tillvaxt.omsattningTillvaxtTTM; // -0.808

const pes = F.filter(x => x.vardering.pe != null).map(x => x.vardering.pe).sort((a, b) => a - b);
const pbs = F.filter(x => x.vardering.pb != null).map(x => x.vardering.pb).sort((a, b) => a - b);
const roes = F.filter(x => x.lonksamhet.roe != null).map(x => x.lonksamhet.roe).sort((a, b) => a - b);
const median = a => a[Math.floor(a.length / 2)];
const rankLow = (a, v) => a.filter(x => x < v).length + 1; // position från lägst

console.log('=== GRENSJÄMFÖRELSER (finans, n=' + F.length + ') ===');
console.log('P/E', pe, '→ rank', rankLow(pes, pe), 'av', pes.length, '| median', median(pes), '| kvot mot median', (pe / median(pes)).toFixed(3));
console.log('P/B', pb, '→ rank', rankLow(pbs, pb), 'av', pbs.length, '| median', median(pbs), '| kvot', (pb / median(pbs)).toFixed(3));
console.log('ROE', (roe * 100).toFixed(2) + '%', '→ rank från lägst', rankLow(roes, roe), 'av', roes.length, '| median', (median(roes) * 100).toFixed(2) + '%');
console.log('P/E under median:', (100 * (1 - pe / median(pes))).toFixed(1) + '% | P/B under median:', (100 * (1 - pb / median(pbs))).toFixed(1) + '%');
console.log('De 5 lägsta P/E:', pes.slice(0, 5));

// --- identitetstest (KVD-precedens: P/B ÷ ROE ≈ P/E) ---
console.log('\n=== IDENTITETSTEST ===');
const peIdent = pb / roe;
console.log('P/B ÷ ROE =', peIdent.toFixed(3), 'mot P/E', pe, '| gap', (100 * (pe - peIdent) / pe).toFixed(2) + '% (källans ROE = medel-EK-väg)');

// --- kanon ur delårsrapport H1 2026 (Cision 4189161) ---
const AKTIER = 45457814;
const substansJun = 5720;        // Mkr
const ekJun = 5551.4;            // Mkr
const ekStart = 5284.1;          // Mkr (31 dec 2025)
const substansStart = 5284;      // Mkr (31 dec 2025)
const kursJun = 140.20, kursStart = 118.00;
const nettoH1 = 602.7, nettoH1P = 761.8, nettoQ2 = 106.9, nettoQ2P = 617.2;
const rpsH1 = 13.26, rpsH1P = 16.76, rpsQ2 = 2.35, rpsQ2P = 13.58;
const utdelTot = 7.40, utdelHalv = 3.70, utdelMkr = 168.2;
const noteradeJun = 5445, onoteradeJun = 94, ovrigtNettoJun = 13, likvidaJun = 204;

console.log('\n=== AKTIEANTAL & PER-AKTIE-KONTROLLER ===');
console.log('substansJun/AKTIER =', (substansJun / AKTIER * 1e6).toFixed(2), 'kr (rapporten: 126)');
console.log('substansStart/AKTIER =', (substansStart / AKTIER * 1e6).toFixed(2), 'kr (sajttabell dec-2025: 116)');
console.log('ekJun/AKTIER =', (ekJun / AKTIER * 1e6).toFixed(2), 'kr = BPS bokfört');
console.log('mcap-fält/pris =', (mcap * 1e3 / pris).toFixed(3), 'M aktier mot registrerade', (AKTIER / 1e6).toFixed(3), 'M');
console.log('Årets substansrörelse ojusterad: 5284 →', substansJun, '=', (100 * (substansJun / substansStart - 1)).toFixed(2) + '% (rapportens justerade tal: +11,0%)');
console.log('EK-brygga: 5284,1 − 336,4 + 0,9 + 602,7 =', (5284.1 - 336.4 + 0.9 + 602.7).toFixed(1), 'mot ekJun', ekJun);

// --- premiearitmetik (packetets signatur) ---
console.log('\n=== PREMIEARITMETIK ===');
const kursAug = 142.60, substansAug = 127, substansJul = 127, substansJunKr = 126;
const prem = (k, s) => 100 * (k / s - 1);
console.log('Premie 30 jun: kurs', kursJun, '/ substans', substansJunKr, '=', prem(kursJun, substansJunKr).toFixed(1) + '%');
console.log('Premie aug-redovisning: kurs', kursAug, '/ substans', substansAug, '=', prem(kursAug, substansAug).toFixed(1) + '%');
console.log('Premie universumkurs 2026-09-03:', pris, '/', substansAug, '=', prem(pris, substansAug).toFixed(1) + '%');
console.log('P/Substans-multiplar:', (kursJun / substansJunKr).toFixed(3), (kursAug / substansAug).toFixed(3), (pris / substansAug).toFixed(3));
console.log('P/B-fält (mot källans EK-mått):', pb, '| kurs/BPS:', (pris / (ekJun / AKTIER * 1e6)).toFixed(3));

// --- utdelningsmekaniken 27 oktober ---
console.log('\n=== UTDELNINGSMEKANIKEN ===');
const substansEfter = substansAug - utdelHalv;
console.log('Substans efter 3,70-utbetalning (övrigt oförändrat):', substansAug, '−', utdelHalv, '=', substansEfter.toFixed(2), 'kr');
console.log('Premie på kurs', pris, 'efter utbetalning:', prem(pris, substansEfter).toFixed(1) + '% (före:', prem(pris, substansAug).toFixed(1) + '%)');
console.log('Utdelning Mkr:', utdelHalv * AKTIER / 1e6, 'mot rapportens', utdelMkr, '× 2 =', (utdelTot * AKTIER / 1e6).toFixed(1), 'Mkr/år');

// --- koncentration ---
const portf = [
  ['Scandi Standard', 1467, 32, 25.6], ['Bilia', 1430, 31, 25.0], ['Ovzon', 596, 13, 10.4],
  ['Stenhus Fastigheter', 402, 9, 7.0], ['Bahnhof', 369, 8, 6.5], ['Securitas', 318, 7, 5.6],
  ['Scandic Hotels', 204, 4, 3.6], ['SCA', 149, 3, 2.6], ['Ericsson', 108, 2, 1.9],
  ['Handelsbanken', 107, 2, 1.9], ['Övriga noterade', 295, 6, 5.2],
];
console.log('\n=== KONCENTRATION (30 jun 2026) ===');
console.log('Topp 2:', portf[0][3] + portf[1][3], '% | Topp 5:', portf.slice(0, 5).reduce((s, x) => s + x[3], 0).toFixed(1) + '%');
console.log('Summa noterade Mkr:', portf.reduce((s, x) => s + x[1], 0), 'mot rapportens', noteradeJun, '| andel av substans', (100 * noteradeJun / substansJun).toFixed(1) + '%');
console.log('Onoterade', onoteradeJun, 'Mkr =', (100 * onoteradeJun / substansJun).toFixed(1) + '% av substansen | likvida', likvidaJun, 'Mkr');

// --- substansserien (oresund.se, curl 2026-09-30) ---
const ser2026 = [119, 130, 127, 124, 132, 126, 127, 127]; // jan..aug
console.log('\n=== SUBSTANSSERIEN 2026 (kr/aktie, månadsvis) ===');
console.log('dec-2025', (substansStart / AKTIER * 1e6).toFixed(1), '→', ser2026.join(' '));
console.log('Q1 rått:', (100 * (ser2026[2] / (substansStart / AKTIER * 1e6) - 1)).toFixed(1) + '% | Q2 rått:', (100 * (ser2026[5] / ser2026[2] - 1)).toFixed(1) + '% (rapporten justerad: +1,5%)');
console.log('Q3 hittills (jul+aug klara):', (100 * (127 / ser2026[5] - 1)).toFixed(1) + '% på två av tre månader | fjolårets Q3: −5,8%');
console.log('2025 årsband: 109→116 | 2024: 101→104 | 2023: 109→97(sep)');

// --- Q3-2025 jämförelse (Cision 3712433) ---
console.log('\n=== FJOLÅRETS Q3 (1 jan–30 sep 2025) ===');
console.log('Substans 30 sep 2025: 5 041 Mkr = 111 kr | +9,4% just. (SIX +5,8%) | Q3-2025: substans −5,8%, SIX +3,4%');
console.log('RPS jan–sep 2025: 9,97 (10,74) | Q3 2025: −6,79 (−0,16) | netto jan–sep: 453,1 (488,4) | Q3: −308,8 (−7,4)');
console.log('Bilia 30 sep 2025: 9 860 000 aktier, kurs 114,70, 1 131 Mkr — mot 30 jun 2026: kurs 145,00, 1 430 Mkr =', (100 * (145.0 / 114.7 - 1)).toFixed(1) + '% kursrörelse på nio månader');

// --- syntetiska återköp ---
console.log('\n=== SYNTETISKA ÅTERKÖP (swap) ===');
const antal = 886945, snitt = 156;
console.log(antal, 'aktier à snitt', snitt, 'kr =', (antal * snitt / 1e6).toFixed(1), 'Mkr | kurs 30 jun', kursJun, '→ under vatten', (100 * (kursJun / snitt - 1)).toFixed(1) + '%');
console.log('Andel av aktieantalet:', (100 * antal / AKTIER).toFixed(2) + '%');

// --- TTM-netto implicit (fältidentitet) ---
console.log('\n=== FÄLTIMPLIKATIONER ===');
const ttmNetto = mcap * 1e3 / pe;
console.log('TTM-netto implicit ur P/E-fältet:', ttmNetto.toFixed(1), 'Mkr | H1 2026:', nettoH1, '→ implicit H2 2025:', (ttmNetto - nettoH1).toFixed(1), 'Mkr');
console.log('EV/EBIT-fält', evEbit, 'med EBIT-marginal', ebitM, '× implicit "intäkt": investmentbolagets marginalvärld — fältens ABC redovisas med förbehåll (förvaltningsbolagets "intäkt" = utfall av värdeförändringar)');
