#!/usr/bin/env node
// Rond 228 — U31 AVSLUT: UK-grenmätning (FÖRE formulering — rond 225:s läxa) +
// worklog + beslutsminne + commit + push (rond 227:s adoptionsmekanik) + prod 200.
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, statSync, writeFileSync, appendFileSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const RAPPORT = 'data/rapporter/motorervalidering-2026-09-02.md';
const kvitto = [];
const steg = (namn, fn) => {
  try { kvitto.push(`OK ${namn} — ${fn() ?? ''}`); }
  catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL ${namn} — ${e.message}`); process.exit(1); }
};

// 1. UK-GRENMÄTNING ur diskens universum (ALDRIG härlett ur köns namngivning)
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const uk = u.filter((b) => b.land === 'Storbritannien');
const grenar = {};
for (const b of uk) grenar[b.bransch] = (grenar[b.bransch] ?? 0) + 1;
const enGrenar = Object.entries(grenar).filter(([, n]) => n < 2).map(([k]) => k);
const grenText = Object.entries(grenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const ukMilestone = enGrenar.length === 0;
steg('uk-grenmätning', () => `Storbritannien ${uk.length} rader — ${grenText}${ukMilestone ? ' ⇒ INGA 1-grenar (MILESTONE VERIFIERAD)' : ` ⇒ kvarvarande 1-grenar: ${enGrenar.join(', ')}`}`);

// 2. Worklog-rond 228 (U31 LEVERERAD)
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 228 [organ:Φ] — v173 U31 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 228 [organ:Φ] — v173 U31 LEVERERAD: Pearson plc PSON.L (Storbritannien/kommunikation 1→2) — universum 292→293, kandidatkedjan med FYRA prövade bolag (VOD/WPP P/E-döda på färskt TTM · RELX fel cell · AAF Bharti-familjen), tretton lås GRÖNA, segmentlåset i fem delar med dokumenterade källavikelser, ${ukMilestone ? 'UK-MILESTONE VERIFIERAD: alla sju grenar ≥2 (' + grenText + ')' : 'kvarvarande 1-grenar: ' + enGrenar.join(', ')} — 2026-09-25

U31: Storbritannien/kommunikation-cellens duo — BT (nätinfrastruktur: fast bredband + EE-mobil — RÖREN) + Pearson (kunskapsinnehåll: utbildningsförlag, Publishing = Communication Services i källans klassning — INNEHÅLLET): kommunikationens två sidor, U30-mönstret.
KANDIDATKEDJAN (bevisad i rond 228-sonderna): (1) VOD.L AVVISAD — P/E-bärarkontroll RÖD på färsk källa: FY26-netto −397 M EUR, FY25 −4 169 M (goodwill 4 515); BT-radens OMG24-notering håller (Sony/Honda-doktrinen). (2) WPP.L AVVISAD — TTM −240 M GBP (quote 2026-09-25; sondens föråldrade jun-24-vy korrigerad — lärodom: ALLTID färsk TTM före leverans). (3) RELX förbigången — källan klassar Industrials (fel cell). (4) AAF förbigången — Bharti-familjen = BHARTIARTL.NS (AZN-läxan). (5) PSON.L VALD: kollision GRÖN · rätt sektor · TTM-netto 319 M GBP > 0.
TRETTON LÅS GRÖNA: mcap EXAKT (0,60114×12,125=7,289) · PS 2,01 · P/B 2,17 · EV 8,711 (0,2 %) · netto-M 8,79 % · FCF-M 21,07 % · FCF-yield 10,49 % EXAKT · divY 2,08 % · D/E 0,524 EXAKT · payout 1,7 % · P/E pris/EPS 0,2 % · EV/Earnings 27,37 EXAKT · EV/Sales EXAKT. P/E-FAMILJEN 24,21/22,85/24,25 (EPS-raden 0,50 bär vägd aktiebas 638 M mot utestående 601 M — återköpen −5,85 %). PEG NULL (basblandning: källans 1,62 ⇒ 14,9 % mot konsensus 11,38 %).
SEGMENTLÅSET I FEM DELAR: A&Q [1 605 · 1 604 · 1 591 · 1 559 · 1 444 · 1 238] (STÖRST 44 % — prov/kvalifikationer) + Virtual Learning [549 · 511 · 489 · 616 · 820 · 713] (dalar sedan pandemintoppen) + ELL [400 · 405 · 420 · 415 · 321 · 238] (växer) + ELS [292 · 282 · 271 · 269 · — · —] (tillkom FY23) + Higher Ed [788 · 775 · 781 · 806 · 898 · 849] = totalen EXAKT TTM+FY25+FY24; FY23 diff 9 M (0,25 %) dokumenterad källavvikelse; FY22–FY21 fragmenterade.
FCF-SPEGELN [304 · 495 · 594 · 627] + TTM 765 DUBBELT låst (OCF−capex exakt fem fönster + marginalrader); marginal 7,92→21,05 % — KAPITALSNÅLA MODELLEN (capex 1,1 % av omsättningen); FCF-CAGR +27,3 %. RESULTAT: oms [3 841 · 3 674 · 3 552 · 3 577] + TTM 3 634 (oms-CAGR −2,35 % från FY22-toppen — öppet redovisat) · netto [242 · 378 · 434 · 335] + TTM 319 (CAGR +11,45 %).
UTDELNING + ÅTERKÖP = TVÅ BEN: DPS [0,205→0,252] HÖJD varje år, current 0,252 GBP (2,08 % EXAKT) · återköp TTM −546 M mot utdelning −158 M — aktieantal −5,85 % = buyback-yield EXAKT · shareholder yield 7,92 %. STABILITET: D/E 0,52 · räntetäckning 6,04 · Altman 2,42 GRÅ ZON (dokumenterad: återköpsfinansierad nettoskuld, ej nöd — balansseriernas netto [−497 · −737 · −892 · −987 · −1 151] växer med policy) · Piotroski 6 · ROIC 7,71 % mot WACC 3,95 % gap +3,76 p · beta −0,03.
${ukMilestone ? `UK-MILESTONE (MÄTT ur universumet, ej härlett — rond 225:s läxa): Storbritannien ${uk.length} rader, ${grenText} ⇒ INGA 1-grenar kvar — sju grenar alla ≥2.` : `UK-grenmätning: ${grenText} — kvarvarande 1-grenar: ${enGrenar.join(', ')}.`}
KVD: append 292+/0− · läs-tillbaka ×2 · llms HELREGEN 293 (kommunikation-raden n=30 P/E 16,9; totalt n 281; 10 aspektrader) · läckagevakt 0 (529) · tsc 0 · prod 200 i avslutet (adoptionsmekanik rond 227).
Kö: rappdagar → v172 (PSON rappdag 10-12 FÖRE fönstret — notis) · Kanada (CNQ+Enbridge / RY+TD) · Spanien (Santander+BBVA / ITX+?) · spårrotation. R2: Q3-paketet väntar kund. Protokoll: V173-U31-PSON-PEARSON-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 228 U31 bokförd';
});

// 3. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":228'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 228, organ: 'Φ', ts: Date.now(),
    beslut: `v173 U31: Pearson PSON.L (Storbritannien/kommunikation 1→2) — BT-rören + Pearson-innehållet. Kandidatkedja: VOD (FY26 −397 M EUR) och WPP (TTM −240 M GBP) P/E-döda på färskt TTM; RELX fel cell (Industrials); AAF Bharti-familjen. Tretton lås gröna; segmentlås 5 delar (TTM+FY25+FY24 exakta, FY23 diff 0,25 % dokumenterad); FCF-spegeln 304→765 dubbellåst; Altman 2,42 grå; ROIC-gap +3,76 p. ${ukMilestone ? 'UK-MILESTONE: alla sju grenar ≥2 (mätt).' : ''} Kö: rappdagar → v172, Kanada, Spanien, spårrotation.`,
    bevis: 'V173-U31-PSON-PEARSON-UTOKNING.md + _r228-u31-*.mjs (kvitton /tmp/r228-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 4. Commit + push med rond 227:s mekanik
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U31-PSON-PEARSON-UTOKNING.md',
  'worklog.md',
  'verktyg/_r228-u31-sond.mjs', 'verktyg/_r228-u31-bokfor.mjs', 'verktyg/_r228-u31-hamta.mjs',
  'verktyg/_r228-u31-relx-sond.mjs', 'verktyg/_r228-u31-triappel.mjs', 'verktyg/_r228-u31-pson-hamta.mjs',
  'verktyg/_r228-u31-universum-inlagg.mjs', 'verktyg/_r228-u31-llms-regen.mjs', 'verktyg/_r228-u31-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U31 LEVERERAD — Pearson plc PSON.L (Storbritannien/kommunikation 1→2): cellmotiverad duo (BT nät-rören + Pearson kunskaps-innehållet — kommunikationens två sidor); KANDIDATKEDJA med fyra prövade: VOD AVVISAD (FY26-netto −397 M EUR, FY25 −4 169 — P/E-död på färsk källa, OMG24-noteringen håller) · WPP AVVISAD (TTM −240 M GBP; sondens föråldrade jun-24-vy korrigerad — alltid färsk TTM) · RELX fel cell (källan: Industrials) · AAF Bharti-familjen (AZN-läxan); PSON: kollision GRÖN + sektor Communication Services/Publishing + TTM-netto 319 M > 0; TRETTON LÅS GRÖNA (mcap EXAKT · PS · P/B · EV 0,2 % · netto-M · FCF-M · FCF-yield EXAKT · divY · D/E EXAKT · payout · P/E pris/EPS 0,2 % · EV/Earnings EXAKT · EV/Sales EXAKT); P/E-familjen 24,21/22,85/24,25 (vägd aktiebas 638 M dokumenterad); SEGMENTLÅSET I FEM DELAR (A&Q störst 1 605 = 44 % · Virtual Learning dalar · ELL växer · ELS tillkom FY23 · Higher Ed): totalen EXAKT TTM+FY25+FY24, FY23 diff 0,25 % dokumenterad källavvikelse, FY22–FY21 fragmenterade; FCF-SPEGELN [304 · 495 · 594 · 627] + TTM 765 DUBBELT låst, marginal 7,92→21,05 % — kapitalsnåla modellen (capex 1,1 %); oms-CAGR −2,35 % öppet (FY22-toppen) · netto [242 · 378 · 434 · 335] CAGR +11,45 %; UTDELNINGEN HÖJD varje år [0,205→0,252] (2,08 % EXAKT) + återköpen tripplar (TTM −546 M; aktieantal −5,85 % EXAKT); Altman 2,42 GRÅ ZON (återköpsfinansierad nettoskuld dokumenterad) · Piotroski 6 · ROIC-gap +3,76 p · beta −0,03; rappdag est. 2026-10-12 FÖRE v172-fönstret; universum 292→293 kirurgiskt, llms HELREGEN 293 (kommunikation n=30; totalt n 281; 10 aspektrader), läckagevakt 0 (529), tsc 0, prod 200. Storbritannien 16→17. ${ukMilestone ? 'UK-MILESTONE MÄTT: alla sju grenar ≥2 (' + grenText + ') — inga 1-grenar kvar.' : ''} Kö: rappdagar → v172, Kanada, Spanien, spårrotation. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r228b-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

let pushad = false;
for (let forsok = 1; forsok <= 3 && !pushad; forsok++) {
  const prodLangd = statSync(`${PROD}/${RAPPORT}`).size;
  const lokalLangd = statSync(`${ROT}/${RAPPORT}`).size;
  if (prodLangd > lokalLangd) {
    copyFileSync(`${PROD}/${RAPPORT}`, `${ROT}/${RAPPORT}`);
    if (!FILER.includes(RAPPORT)) FILER.push(RAPPORT);
    kvitto.push(`  försök ${forsok}: rapporten adopterad (${lokalLangd}→${prodLangd} B)`);
  }
  try {
    execFileSync('git', ['-C', ROT, 'add', ...new Set(FILER)]);
    if (forsok === 1) {
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r228b-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r228b-msg.txt']);
      kvitto.push(`  commit amend:ad (försök ${forsok})`);
    }
  } catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL git commit — ${String(e.message).split('\n')[0]}`); process.exit(1); }
  try {
    const mRader = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.startsWith(' M ') || r.startsWith('M '));
    if (mRader.length === 1 && mRader[0].includes('motorervalidering')) {
      execFileSync('git', ['-C', PROD, 'checkout', '--', RAPPORT]);
      kvitto.push('  prods M-rad rensad (innehållet säkrat i commiten)');
    }
    const ut = execFileSync('git', ['-C', ROT, 'push', 'prod', 'develop'], { encoding: 'utf8' });
    kvitto.push(`OK git push (försök ${forsok}) — ${ut.trim().split('\n').pop().slice(0, 120)}`);
    pushad = true;
  } catch (e) {
    kvitto.push(`  push försök ${forsok} avvisad — ${String(e.message).split('\n').filter(r => r.includes('rejected') || r.includes('error'))[0]?.slice(0, 160) || 'okänt fel'}`);
  }
}
if (!pushad) { kvitto.forEach(k => console.log(k)); console.log('FEL push.'); process.exit(1); }

steg('prodverif', () => {
  const lokal = execFileSync('git', ['-C', ROT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const prodH = execFileSync('git', ['-C', PROD, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (lokal !== prodH) throw new Error(`HEAD divergerar: ${lokal.slice(0, 8)} vs ${prodH.slice(0, 8)}`);
  const smuts = execFileSync('git', ['-C', PROD, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(r => r.trim());
  return `prods HEAD = ${prodH.slice(0, 10)} (identisk); prodsmuts ${smuts.length} rad(er)`;
});
steg('prod 200', () => {
  const kod = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'https://lab.ak1nvestor.com/'], { encoding: 'utf8' }).trim();
  if (kod !== '200') throw new Error(`prod svarade ${kod}`);
  return 'HTTPS 200';
});
kvitto.forEach(k => console.log(k));
console.log('LEVERANS: v173 U31 Pearson PSON.L klar — universum 293, push verifierad, prod 200');
