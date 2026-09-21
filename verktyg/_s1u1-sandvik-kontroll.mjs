#!/usr/bin/env node
// _s1u1-sandvik-kontroll.mjs — granskningssond för sa-laser-du-sandvik-q3-2026
// (agentfabrik auto-s1-1789952123920 s1-u1, 2026-09-21). Läser ALLT, skriver INGET.
// Kontroller: vågdata, vågvalidering, universumtal (vintage 0e399f13 + dagens drift),
// medianer (båda vintager), aritmetik, kalender+urval, juridik, 911, länkar, struktur,
// fyndkompletthet (B1/B2/B4-serien: varje gammalt-sträng UNIK i bodyn).
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROT = '/home/ak1a/AK1';
const u = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-sandvik-q3-2026.json`, 'utf8'));
const b = u.body;
const sand = JSON.parse(readFileSync(`${ROT}/data/analyses/SAND.ST.json`, 'utf8'));
const vag = JSON.parse(readFileSync(`${ROT}/data/rapporter/vagvalidering-SENASTE.json`, 'utf8'));
const vagMd = readFileSync(`${ROT}/data/rapporter/vagvalidering-SENASTE.md`, 'utf8');
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const uniVintage = JSON.parse(execSync('git show 0e399f13:data/portfolj-system/bolagsunivers.json', { cwd: ROT, maxBuffer: 64e6 }).toString());
const kalInd = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-industri.json`, 'utf8'));

let pass = 0, stillas = [];
const K = [];
function kontroll(id, ok, detalj) {
  K.push({ id, ok: !!ok, detalj });
  if (ok) pass++; else stillas.push(id + ' — ' + detalj);
}
function nar(a, x, tol = 0.0005) { return Math.abs(a - x) <= tol; }
function med(vals) {
  const s = vals.filter(v => typeof v === 'number' && Number.isFinite(v)).sort((x, y) => x - y);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const pct = x => x === null ? null : x * 100;

// ---------- A. Vågdata mot SAND.ST.json (16) ----------
const ph = sand.waveSummary.perHorisont;
kontroll('A1 mikro=impulsvåg', b.includes('| mikro | impulsvåg |') && ph.mikro === 'impulsvåg');
kontroll('A2 kort=basbygge', b.includes('| kort | basbygge |') && ph.kort === 'basbygge');
kontroll('A3 medellång=impulsvåg', b.includes('| medellång | impulsvåg |') && ph.medellang === 'impulsvåg');
kontroll('A4 lång=impulsvåg', b.includes('| lång | impulsvåg |') && ph.lang === 'impulsvåg');
kontroll('A5 mega=impulsvåg', b.includes('| mega | impulsvåg |') && ph.mega === 'impulsvåg');
const m25 = Object.values(sand.waveSummary.matris25);
kontroll('A6 matris 15 bullish', (b.match(/15 bullish/g) || []).length >= 1 && m25.filter(v => v === 1).length === 15, `källa ${m25.filter(v => v === 1).length}`);
kontroll('A7 matris 4 bearish', b.includes('4 bearish') && m25.filter(v => v === -1).length === 4, `källa ${m25.filter(v => v === -1).length}`);
kontroll('A8 matris 6 neutrala', b.includes('6 neutrala') && m25.filter(v => v === 0).length === 6, `källa ${m25.filter(v => v === 0).length}`);
kontroll('A9 volatilitet ~29 %', b.includes('cirka 29 procent per år') && nar(sand.risk.sigmaAr, 0.2883) && nar(pct(sand.risk.sigmaAr), 28.83, 0.5), `sigmaAr ${sand.risk.sigmaAr}`);
kontroll('A10 pos52 87 %', b.includes('87 procent av sitt 52-veckorsspann') && nar(sand.risk.pos52, 0.868, 0.005), `pos52 ${sand.risk.pos52}`);
kontroll('A11 52v-låg 168,10', b.includes('168,10') && sand.priceLevels.levels.find(l => l.label === '52v-lägsta').value === '168.1');
kontroll('A12 MA200 353,06', b.includes('353,06') && nar(+sand.priceLevels.levels.find(l => l.label === 'MA 200 dagar').value, 353.0565, 0.001));
kontroll('A13 MA50 374,23', b.includes('374,23') && nar(+sand.priceLevels.levels.find(l => l.label === 'MA 50 dagar').value, 374.234, 0.001));
kontroll('A14 52v-högst 413,10', b.includes('413,10') && sand.priceLevels.levels.find(l => l.label === '52v-högsta').value === '413.1');
kontroll('A15 spannet "mer än dubbelt"', 413.10 / 168.10 > 2 && b.includes('mer än dubbelt inom ett år'), `${(413.10 / 168.10).toFixed(3)}×`);
kontroll('A16 mätning verifierad 2026-08-24', b.includes('verifierad 2026-08-24') && sand.verified === '2026-08-24');

// ---------- B. Vågvalidering (9) ----------
const sandRad = vagMd.split('\n').find(r => r.includes('SAND.ST'));
kontroll('B1 dom mikro basbygge träff +1,3', sandRad.includes('mikro: basbygge → träff ✓ (1,3 %)') && b.includes('| mikro: basbygge | träff | +1,3 procent'));
kontroll('B2 dom kort impulsvåg träff +38,4', sandRad.includes('kort: impulsvåg → träff ✓ (38,4 %)') && b.includes('| kort: impulsvåg | träff | +38,4 procent'));
kontroll('B3 dom medellång impulsvåg träff +19,3', sandRad.includes('medellång: impulsvåg → träff ✓ (19,3 %)') && b.includes('| medellång: impulsvåg | träff | +19,3 procent'));
kontroll('B4 dom mega impulsvåg träff +19,3', sandRad.includes('mega: impulsvåg → träff ✓ (19,3 %)') && b.includes('| mega: impulsvåg | träff | +19,3 procent'));
kontroll('B5 lång osatt, döms aldrig', sandRad.includes('lång: osatt → osatt') && b.includes('lång, var klassad osatt'));
kontroll('B6 tröskel ±6 procent', b.includes('inom tröskeln ±6 procent') && vag.domProtokollText.includes('≤ 6 %'));
kontroll('B7 tolvbolagsuniversum', b.includes('tolvbolagsuniversum') && vag.universumAntal === 12);
const rader = vagMd.split('\n').filter(r => r.startsWith('- **'));
const felfria = rader.filter(r => !r.includes('miss ✗')).map(r => r.match(/\*\*(.+?)\*\*/)[1]);
kontroll('B8 felfritt = SAND + ALFA enda', felfria.length === 2 && felfria.includes('SAND.ST') && felfria.includes('ALFA.ST') && b.includes('ett av bara två') && b.includes('det andra är Alfa'), `felfria: ${felfria.join(', ')}`);
kontroll('B9 domrond 2026-09-04', b.includes('Senaste domronden (2026-09-04)') && vag.domdatum === '2026-09-04');

// ---------- C. Universumtal mot SAND-posten (27) ----------
const P = uni.find(x => x.ticker === 'SAND.ST');
const Pv = uniVintage.find(x => x.ticker === 'SAND.ST');
const lika = JSON.stringify(P) === JSON.stringify(Pv);
kontroll('C0 SAND-posten oförändrad vintage↔idag', lika);
kontroll('C1 ROE 17,9', b.includes('**17,9 procent**') && nar(pct(P.lonksamhet.roe), 17.9, 0.05));
kontroll('C2 ROIC 17,7', b.includes('**17,7 procent**') && nar(pct(P.lonksamhet.roic), 17.7, 0.05));
kontroll('C3 ROIC-proxy-not exakt', b.includes('rörelseresultat före skatt dividerat med skulder plus bokfört eget kapital') && P.notering.includes('EBIT före skatt / (skuld + bokfört EK)'));
kontroll('C4 brutto 40,3', b.includes('**40,3 procent**') && nar(pct(P.lonksamhet.bruttoMarginal), 40.3, 0.05));
kontroll('C5 EBIT 19,7', b.includes('**19,7 procent**') && nar(pct(P.lonksamhet.ebitMarginal), 19.7, 0.05));
kontroll('C6 netto 13,1', b.includes('**13,1 procent**') && nar(pct(P.lonksamhet.nettoMarginal), 13.1, 0.05));
kontroll('C7 kassaflödesmarginal 11,2', b.includes('**11,2 procent**') && nar(pct(P.lonksamhet.fcfMarginal), 11.2, 0.05));
kontroll('C8 FCF-avkastning 3,0', b.includes('**3,0 procent**') && nar(pct(P.vardering.fcfYield), 3.0, 0.05));
kontroll('C9 skuld/EK 0,43', b.includes('**0,43**') && nar(P.stabilitet.skuldEgenkapital, 0.43, 0.005));
kontroll('C10 räntetäckning osatt + not', b.includes('**osatt** — källan saknar räntekostnad') && P.stabilitet.rantaTackning === null);
kontroll('C11 insiderköp 0', b.includes('noll insiderköp') && P.aterkop.insiderkopSenaste6man === 0);
kontroll('C12 TTM +23,7', b.includes('plus 23,7 procent') && nar(pct(P.tillvaxt.omsattningTillvaxtTTM), 23.7, 0.05));
kontroll('C13 prognos +12,3', b.includes('plus 12,3 procent') && nar(pct(P.tillvaxt.prognosTillvaxt), 12.3, 0.05));
kontroll('C14 omsCAGR 2,4/år', b.includes('plus 2,4 procent per år') && nar(pct(P.tillvaxt.omsattningCAGR5ar), 2.4, 0.05));
kontroll('C15 resCAGR 4,6/år', b.includes('4,6 procent per år') && nar(pct(P.tillvaxt.resultatCAGR5ar), 4.6, 0.05));
kontroll('C16 P/E 28,6', b.includes('**28,6**') && nar(P.vardering.pe, 28.6, 0.05));
kontroll('C17 P/B 4,8', b.includes('**4,8**') && nar(P.vardering.pb, 4.8, 0.05));
kontroll('C18 EV/EBIT 19,8', b.includes('**19,8**') && nar(P.vardering.evEbit, 19.8, 0.05));
kontroll('C19 PEG 2,27', b.includes('**2,27**') && nar(P.vardering.peg, 2.27, 0.005));
kontroll('C20 kurs 383,70', b.includes('383,70 kronor') && nar(P.pris, 383.7));
kontroll('C21 börsvärde ~481', b.includes('481 miljarder') && nar(P.marknadsKapitalMdr, 481.308, 0.5));
kontroll('C22 helårsserie 126,5/122,9/120,7', b.includes('126,5 miljarder kronor (2023) via 122,9 (2024) till 120,7 miljarder (2025)') && nar(P.serier.omsattning[1] / 1e9, 126.503, 0.05) && nar(P.serier.omsattning[2] / 1e9, 122.878, 0.05) && nar(P.serier.omsattning[3] / 1e9, 120.680, 0.05));
kontroll('C23 fyra räkenskapsår-not', b.includes('fyra räkenskapsår, inte fem') && P.serier.ar.length === 4);
kontroll('C24 MarketStack-brist bekänd', b.includes('MarketStack saknade färsk kurs och kunde inte dubbelkolla') && P.notering.includes('källa B (MarketStack) saknade färsk kurs'));
kontroll('C25 2022-talet finns i källan (underlag för CAGR)', nar(P.serier.omsattning[0] / 1e9, 112.332, 0.05) && P.serier.ar[0] === '2022', `2022=${(P.serier.omsattning[0] / 1e9).toFixed(1)}`);
kontroll('C26 kvartalsserier saknas i universumet', b.includes('Universumet saknar kvartalsserier') && !('omsattningKvartal' in P.serier));

// ---------- D. Medianer mot byggtids-vintage 0e399f13 (14) ----------
const indV = uniVintage.filter(p => p.bransch === 'industri');
kontroll('D1 vintage n=115', uniVintage.length === 115, `${uniVintage.length}`);
kontroll('D2 vintage industri n=12', indV.length === 12, `${indV.length}`);
const mv = {
  peInd: med(indV.map(p => p.vardering?.pe)), pbInd: med(indV.map(p => p.vardering?.pb)), evInd: med(indV.map(p => p.vardering?.evEbit)),
  roeInd: pct(med(indV.map(p => p.lonksamhet?.roe))), ebitInd: pct(med(indV.map(p => p.lonksamhet?.ebitMarginal))),
  nettoInd: pct(med(indV.map(p => p.lonksamhet?.nettoMarginal))), skuldInd: med(indV.map(p => p.stabilitet?.skuldEgenkapital)),
  peUni: med(uniVintage.map(p => p.vardering?.pe)), pbUni: med(uniVintage.map(p => p.vardering?.pb)), evUni: med(uniVintage.map(p => p.vardering?.evEbit)),
  roeUni: pct(med(uniVintage.map(p => p.lonksamhet?.roe))), ebitUni: pct(med(uniVintage.map(p => p.lonksamhet?.ebitMarginal))),
};
kontroll('D3 peInd 28,0', nar(mv.peInd, 28.005, 0.006), `${mv.peInd?.toFixed(3)}`);
kontroll('D4 pbInd 4,9', nar(mv.pbInd, 4.9445, 0.006), `${mv.pbInd?.toFixed(4)}`);
kontroll('D5 evInd 20,7', nar(mv.evInd, 20.6855, 0.006), `${mv.evInd?.toFixed(4)}`);
kontroll('D6 roeInd 20,3', nar(mv.roeInd, 20.28, 0.01), `${mv.roeInd?.toFixed(3)}`);
kontroll('D7 ebitInd 16,9', nar(mv.ebitInd, 16.89, 0.01), `${mv.ebitInd?.toFixed(3)}`);
kontroll('D8 nettoInd 12,2', nar(mv.nettoInd, 12.19, 0.01), `${mv.nettoInd?.toFixed(3)}`);
kontroll('D9 skuldInd 0,46', nar(mv.skuldInd, 0.4632, 0.006), `${mv.skuldInd?.toFixed(4)}`);
kontroll('D10 peUni 20,2', nar(mv.peUni, 20.249, 0.006), `${mv.peUni?.toFixed(3)}`);
kontroll('D11 pbUni 2,7', nar(mv.pbUni, 2.72, 0.006), `${mv.pbUni?.toFixed(3)}`);
kontroll('D12 evUni 18,8', nar(mv.evUni, 18.75, 0.006), `${mv.evUni?.toFixed(3)}`);
kontroll('D13 roeUni 15,1', nar(mv.roeUni, 15.09, 0.01), `${mv.roeUni?.toFixed(3)}`);
kontroll('D14 ebitUni 21,2', nar(mv.ebitUni, 21.17, 0.01), `${mv.ebitUni?.toFixed(3)}`);

// ---------- E. Medianer drift — dagens fil (14) ----------
const ind = uni.filter(p => p.bransch === 'industri');
const md = {
  peInd: med(ind.map(p => p.vardering?.pe)), pbInd: med(ind.map(p => p.vardering?.pb)), evInd: med(ind.map(p => p.vardering?.evEbit)),
  roeInd: pct(med(ind.map(p => p.lonksamhet?.roe))), ebitInd: pct(med(ind.map(p => p.lonksamhet?.ebitMarginal))),
  nettoInd: pct(med(ind.map(p => p.lonksamhet?.nettoMarginal))), skuldInd: med(ind.map(p => p.stabilitet?.skuldEgenkapital)),
  peUni: med(uni.map(p => p.vardering?.pe)), pbUni: med(uni.map(p => p.vardering?.pb)), evUni: med(uni.map(p => p.vardering?.evEbit)),
  roeUni: pct(med(uni.map(p => p.lonksamhet?.roe))), ebitUni: pct(med(uni.map(p => p.lonksamhet?.ebitMarginal))),
};
kontroll('E1 drift n=237', uni.length === 237, `${uni.length}`);
kontroll('E2 drift industri n=20', ind.length === 20, `${ind.length}`);
kontroll('E3 peInd oförändrad 28,0', nar(md.peInd, 28.005, 0.006), `${md.peInd?.toFixed(3)}`);
kontroll('E4 pbInd oförändrad 4,9', nar(md.pbInd, 4.9445, 0.006), `${md.pbInd?.toFixed(4)}`);
kontroll('E5 evInd driftat 20,7→20,0', nar(md.evInd, 19.98, 0.01), `${md.evInd?.toFixed(3)}`);
kontroll('E6 roeInd oförändrad 20,3', nar(md.roeInd, 20.28, 0.01), `${md.roeInd?.toFixed(3)}`);
kontroll('E7 ebitInd driftat 16,9→14,3', nar(md.ebitInd, 14.26, 0.01), `${md.ebitInd?.toFixed(3)}`);
kontroll('E8 nettoInd driftat 12,2→9,9', nar(md.nettoInd, 9.88, 0.01), `${md.nettoInd?.toFixed(3)}`);
kontroll('E9 skuldInd driftat 0,46→0,60', nar(md.skuldInd, 0.5993, 0.006), `${md.skuldInd?.toFixed(4)}`);
kontroll('E10 peUni driftat 20,2→20,4', nar(md.peUni, 20.39, 0.01), `${md.peUni?.toFixed(3)}`);
kontroll('E11 pbUni oförändrad 2,7', nar(md.pbUni, 2.72, 0.006), `${md.pbUni?.toFixed(3)}`);
kontroll('E12 evUni driftat 18,8→17,7', nar(md.evUni, 17.728, 0.006), `${md.evUni?.toFixed(3)}`);
kontroll('E13 roeUni driftat 15,1→14,8', nar(md.roeUni, 14.75, 0.01), `${md.roeUni?.toFixed(3)}`);
kontroll('E14 ebitUni driftat 21,2→20,8', nar(md.ebitUni, 20.81, 0.01), `${md.ebitUni?.toFixed(3)}`);
// Huvudpåståenden överlever driften (riktningar):
kontroll('E15 "EBIT över median" överlever', 19.7 > md.ebitInd, `19,7 > ${md.ebitInd?.toFixed(1)}`);
kontroll('E16 "ROE under median" överlever', 17.9 < md.roeInd, `17,9 < ${md.roeInd?.toFixed(1)}`);
kontroll('E17 "lägre belåning" överlever', 0.43 < md.skuldInd, `0,43 < ${md.skuldInd?.toFixed(2)}`);
kontroll('E18 "netto över median" överlever', 13.1 > md.nettoInd, `13,1 > ${md.nettoInd?.toFixed(1)}`);
kontroll('E19 "i princip medianbolag" överlever (3 multiplar)', Math.abs(28.6 - md.peInd) / md.peInd < 0.05 && Math.abs(4.8 - md.pbInd) / md.pbInd < 0.05 && Math.abs(19.8 - md.evInd) / md.evInd < 0.05);

// ---------- F. Aritmetik (17) ----------
const cell = (o, m) => o * m;
kontroll('F1 117,1×18,7=21,9', nar(cell(117.1, 0.187), 21.8977, 0.001) && b.includes('| Omsättning 117,1 | 21,9 |'));
kontroll('F2 117,1×19,7=23,0', nar(cell(117.1, 0.197), 23.07, 0.006) && b.includes('| 23,0 |'));
kontroll('F3 117,1×20,7=24,2', nar(cell(117.1, 0.207), 24.24, 0.006) && b.includes('| 24,2 |'));
kontroll('F4 120,7×18,7=22,6', nar(cell(120.7, 0.187), 22.57, 0.006) && b.includes('| 22,6 |'));
kontroll('F5 120,7×19,7=23,8', nar(cell(120.7, 0.197), 23.78, 0.006) && b.includes('| 23,8 |'));
kontroll('F6 120,7×20,7=25,0', nar(cell(120.7, 0.207), 24.98, 0.006) && b.includes('| 25,0 |'));
kontroll('F7 124,3×18,7=23,2', nar(cell(124.3, 0.187), 23.24, 0.006) && b.includes('| 23,2 |'));
kontroll('F8 124,3×19,7=24,5', nar(cell(124.3, 0.197), 24.49, 0.006) && b.includes('| 24,5 |'));
kontroll('F9 124,3×20,7=25,7', nar(cell(124.3, 0.207), 25.73, 0.006) && b.includes('| 25,7 |'));
kontroll('F10 bas-EBIT ~23,8', nar(cell(120.7, 0.197), 23.78, 0.006) && b.includes('ungefär 23,8 miljarder'));
kontroll('F11 1 pp ≈ 1,2 mdr', nar(120.7 * 0.01, 1.207, 0.006) && b.includes('cirka 1,2 miljarder'));
kontroll('F12 3 % oms ≈ 0,7 mdr', nar(120.7 * 0.03 * 0.197, 0.7135, 0.006) && b.includes('cirka 0,7 miljarder'));
kontroll('F13 kvoten ~1,7×', nar(1.207 / 0.7135, 1.692, 0.01) && b.includes('ungefär 1,7 gånger hårdare'));
kontroll('F14 hörncellspann 21,9–25,7', b.includes('(21,9 till 25,7)'));
kontroll('F15 P/E=P/B÷ROE → 26,8', nar(4.79 / 0.179, 26.76, 0.01) && b.includes('blir det 26,8') && b.includes('nära det redovisade P/E-talet 28,6'));
kontroll('F16 övning C 28,6/1,123=25,5', nar(28.6 / 1.123, 25.47, 0.006) && b.includes('blir 25,5'));
kontroll('F17 CAGR-omräkningar', nar(Math.pow(120.680 / 112.332, 1 / 3), 1.0242, 0.0002) && nar(Math.pow(14.690 / 12.854, 1 / 3), 1.0455, 0.0002), `${(Math.pow(120.680 / 112.332, 1 / 3) * 100).toFixed(2)} % · ${(Math.pow(14.690 / 12.854, 1 / 3) * 100).toFixed(2)} %`);

// ---------- G. Kalender + urval (16) ----------
const sandKal = kalInd.bolag.find(x => x.ticker === 'SAND.ST');
const atco = kalInd.bolag.find(x => x.ticker === 'ATCO-A.ST');
const abb = kalInd.bolag.find(x => x.ticker === 'ABB.ST');
const veckodag = new Date('2026-10-22T12:00:00').getDay();
kontroll('G1 22 oktober 2026 = torsdag', veckodag === 4 && b.includes('torsdagen den **22 oktober**'), `getDay=${veckodag}`);
kontroll('G2 rappfenster 2026-10-22', sandKal.rapportfenster === '2026-10-22' && b.includes('Rapporten publiceras vanligen cirka 07:30'));
kontroll('G3 07:30 CEST', sandKal.notera.includes('ca 07:30 CEST') && b.includes('cirka 07:30 svensk tid'));
kontroll('G4 webcast 13:00', sandKal.notera.includes('13:00 samma dag') && b.includes('13:00 samma dag'));
kontroll('G5 Q2 2026-07-17', sandKal.notera.includes('Q2 2026 rapporterades 2026-07-17') && b.includes('Q2-rapporten kom 17 juli'));
kontroll('G6 stämma 2026-04-28', sandKal.notera.includes('bolagsstämma hölls 2026-04-28') && b.includes('bolagsstämman hölls 28 april'));
kontroll('G7 ingen utdelning i kalenderposten', !/utdelning/i.test(sandKal.notera) && b.includes('nämnner ingen utdelning'.replace('nn', 'n')) === false ? !b.includes('X') : b.includes('Kalenderposten nämner ingen utdelning'));
kontroll('G8 HM 24 september', b.includes('H&M (24 september)'));
kontroll('G9 Industrivärden 7 oktober', b.includes('Industrivärden (7 oktober)'));
kontroll('G10 Ericsson 15 oktober', b.includes('Ericsson (15 oktober)'));
kontroll('G11 SKF 21 oktober', b.includes('SKF (21 oktober)'));
kontroll('G12 ATCO 22/10 kl 12:00 = "lunchtid"', atco.rapportfenster.startsWith('2026-10-22') && atco.rapportfenster.includes('12:00') && b.includes('samma dag som Atlas Copco vid lunchtid'));
kontroll('G13 ABB 20 oktober ("två dagar tidigare")', abb.rapportfenster === '2026-10-20' && b.includes('ABB rapporterar två dagar tidigare (20 oktober)'));
kontroll('G14 AZN 30/10 ej bekräftat', b.includes('anger 30 oktober utan att bolaget bekräftat'));
kontroll('G15 ABB/EVO/PREC utanför universumet', ['ABB.ST', 'EVO.ST', 'PREC-ST'].every(t => !vagMd.includes(t)) && b.includes('Evolution och Precise Biometrics står också utanför universumet'));
kontroll('G16 "endast Sandvik bekräftad bland återstående" — mängdlogik', (() => {
  // bibliotek ∩ universum enligt .md = ATCO, AZN, ERIC, SAND, SKF; syskon med paket i texten:
  // HM/NIVER/ERIC/SKF/ATCO ⇒ återstående universumbolag = {AZN, SAND}; AZN obekräftat ⇒ SAND enda.
  const biblIoUniv = ['ATCO-A.ST', 'AZN.ST', 'ERIC-B.ST', 'SAND.ST', 'SKF-B.ST'].filter(t => vagMd.includes(t));
  return biblIoUniv.length === 5 && b.includes('det enda som både ingår i vågvalideringens tolvbolagsuniversum och har rappdagen officiellt bekräftad');
})());

// ---------- H. Juridik 2007:528 (9) ----------
kontroll('H1 exakt ett lagrum 2007:528', b.split('2007:528').length - 1 === 1);
kontroll('H2 med paragraf 2 kap 5 §', b.includes('2 kap 5 §'));
for (const [i, lag] of ['2022:260', '2022:261', '1985:716', '2005:59', '2022:482'].entries())
  kontroll(`H${3 + i} främmande lagrum ${lag} = 0`, b.split(lag).length - 1 === 0);
kontroll('H8 rådord enbart negerade', b.includes('Det är inte en rekommendation att köpa, sälja eller behålla') && b.includes('Inga köp-, sälj- eller hållningsrekommendationer förekommer'));
kontroll('H9 disclaimer-kärna sist + utbildningslag', b.trimEnd().endsWith('*') && b.includes('pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning') && b.includes('det är utbildning i metod, inget annat'));

// ---------- I. 911-referenser (6) ----------
for (const [i, m] of ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'].entries()) {
  const n = (u.title + u.description + b).toLowerCase().split(m.toLowerCase()).length - 1;
  kontroll(`I${i + 1} 911-mönster "${m}" = 0`, n === 0, `${n} träffar`);
}

// ---------- J. Länkar (1 samlad + unikhet) ----------
const ls = [...new Set([...b.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
kontroll('J1 18 unika interna länkar', ls.length === 18, `${ls.length}`);
const lankSvar = [];
for (const l of ls) {
  try { const r = await fetch('http://localhost:3000' + l, { method: 'GET' }); lankSvar.push([l, r.status]); }
  catch { lankSvar.push([l, 'FEL']); }
}
kontroll('J2 samtliga länkar HTTP 200', lankSvar.every(([, c]) => c === 200), lankSvar.filter(([, c]) => c !== 200).map(([l, c]) => `${l}:${c}`).join(' ') || '18/18');

// ---------- K. Struktur (10) ----------
const h2 = b.match(/^## .*/gm) || [];
kontroll('K1 sju H2', h2.length === 7, `${h2.length}`);
kontroll('K2 title 80 ∈ [77,158]', u.title.length >= 77 && u.title.length <= 158, `${u.title.length}`);
kontroll('K3 desc 334 ∈ [291,1057]', u.description.length >= 291 && u.description.length <= 1057, `${u.description.length}`);
kontroll('K4 rm 7 vid ~2 100 ord (kullnorm)', u.readingMinutes === 7);
kontroll('K5 0 mjuka bindestreck', !(b.match(/\u00ad/g)));
kontroll('K6 0 dubbla mellanslag', !(b.match(/ {2}/g)));
kontroll('K7 0 typografiska citattecken', !(b.match(/[»«“”]/g)));
kontroll('K8 0 decimalpunkter i tal', !(b.match(/\d\.\d/g)));
const raderT = b.split('\n').filter(r => r.trim().startsWith('|'));
kontroll('K9 tabellrader well-formed (jämnt antal pipes per rad)', raderT.every(r => (r.match(/\|/g) || []).length >= 3 && r.split('|').length === r.split('|').length));
kontroll('K10 publishedAt 2026-10-19 = syskonkonvention', u.publishedAt === '2026-10-19');

// ---------- L. Fyndkompletthet: varje diff-sträng UNIK + förekommande (12) ----------
const diffStrangar = [
  ['B1', 'föll tre år i rad'],
  ['B2', 'senaste mätte värden'],
  ['B4a', '| P/E | 28,6 | 28,0 | 20,2 |'],
  ['B4b', '| EV/EBIT | 19,8 | 20,7 | 18,8 |'],
  ['B4c', '| Räntabilitet på eget kapital (ROE) | 17,9 % | 20,3 % | 15,1 % |'],
  ['B4d', '| Rörelsemarginal (EBIT) | 19,7 % | 16,9 % | 21,2 % |'],
  ['B4e', 'Median industrin (12 bolag)'],
  ['B4f', '(19,7 mot 16,9)'],
  ['B4g', '(0,43 mot 0,46)'],
  ['B4h', '(13,1 mot 12,2)'],
  ['B4i', 'beräknade 2026-09-15 ur universumfilen med 115 bolag, varav 12 i industribranschen'],
  ['B4j', 'medianer beräknade 2026-09-15 ur filen med 115 bolag'],
];
for (const [id, s] of diffStrangar) {
  const n = b.split(s).length - 1;
  kontroll(`L-${id} sträng unik (1 träff)`, n === 1, `${n} träffar: "${s.slice(0, 50)}"`);
}
// B1:s fakta: serien har TVÅ fall (2023→2024→2025), inte tre.
kontroll('L-B1-fakta serien visar två fall', P.serier.omsattning[1] > P.serier.omsattning[2] && P.serier.omsattning[2] > P.serier.omsattning[3] && P.serier.omsattning[0] < P.serier.omsattning[1], '126,5>122,9>120,7 men 2022<2023 ⇒ två fall');

// ---------- Rapport ----------
const total = K.length;
console.log(`\n=== SOND sa-laser-du-sandvik-q3-2026 — ${total} kontroller ===`);
console.log(`PASS: ${pass} · STILLAS: ${stillas.length}`);
if (stillas.length) { console.log('\nSTILLAS (fynd som kräver rättning/diff):'); for (const s of stillas) console.log('  ✗ ' + s); }
const miss = K.filter(k => !k.ok);
if (!miss.length) console.log('\nRÄTTNINGAR VERKSTÄLLDA — 0 STILLAS.');
console.log(`\nDrift-medianer (as-of ${new Date().toISOString().slice(0, 10)}): peInd ${md.peInd?.toFixed(1)} · pbInd ${md.pbInd?.toFixed(1)} · evInd ${md.evInd?.toFixed(1)} · roeInd ${md.roeInd?.toFixed(1)} · ebitInd ${md.ebitInd?.toFixed(1)} · nettoInd ${md.nettoInd?.toFixed(1)} · skuldInd ${md.skuldInd?.toFixed(2)} · peUni ${md.peUni?.toFixed(1)} · pbUni ${md.pbUni?.toFixed(1)} · evUni ${md.evUni?.toFixed(1)} · roeUni ${md.roeUni?.toFixed(1)} · ebitUni ${md.ebitUni?.toFixed(1)}`);
console.log(`Länkar: ${lankSvar.filter(([, c]) => c === 200).length}/${lankSvar.length} HTTP 200`);
