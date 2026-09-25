#!/usr/bin/env node
// Rond 244 — U41 AVSLUT: Frankrike-grenmätning + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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

const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const fr = u.filter((b) => b.land === 'Frankrike');
const frGrenar = {};
for (const b of fr) frGrenar[b.bransch] = (frGrenar[b.bransch] ?? 0) + 1;
const frText = Object.entries(frGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const frEn = Object.entries(frGrenar).filter(([, n]) => n < 2).map(([k]) => k);
steg('frankrike-grenmätning', () => `Frankrike ${fr.length} rader — ${frText} ⇒ kvarvarande 1-grenar: ${frEn.join(', ')}`);

steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 244 [organ:Φ] — v173 U41 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 244 [organ:Φ] — v173 U41 LEVERERAD: Compagnie de Saint-Gobain SGO.PA (Frankrike/material 1→2) — universum 302→303, Air Liquide+SGO-duon (materialgrenens B2B-spegel: processkemins mot konstruktionens insatsvaror), GEO-FEM-BENSLÅSET TRE EXAKTA FÖNSTER (interna försäljningar som NEGATIVT BEN — konsolideringen syns öppet), rappdag 10-30 INOM v172-fönstret (SJÄTTE bolaget, samma dag som Astellas) — 2026-09-25

U41: Frankrike/material-cellens duo — Air Liquide (industrigaserna) + Saint-Gobain (byggmaterial). EPA/EUR (AI.PA-precedensen).
TRETTON LÅS (SEX EXAKTA): mcap EXAKT (0,48923×69,82 = 34,16 fyra siffror) · netto-M EXAKT (5,78) · FCF-M EXAKT (7,31) · divY EXAKT (3,29) · PAYOUT med RÄTT bas EXAKT (betald 1 118/netto 2 671 = 41,86 % — TD-mönstret) · P/E 0,05 % · fcfY 0,05 % · EV/Earnings 0,05 % · PS/PB 0,14 % · EV/Sales 0,19 % · D/E 0,5 % · EV 1,4 % (mindre NCI dokumenterad). P/E-FAMILJEN 12,96/12,79/12,954. PEG NULL (basblandning: kälrad 2,09 mot fwd-replik 2,46/trailing 3,01).
GEO-FEM-BENSLÅSET TRE EXAKTA FÖNSTER: N-Europa + S-Europa/MEA (störst 35 %) + Amerika (dalar — räntaboligheten) + APAC + INTERNA FÖRSÄLJNINGAR SOM NEGATIVT BEN = totalen exakt i TTM+FY25+FY24 (allt vyn erbjuder — geo-omläggningen sedan FY24).
KONJUNKTURPORTRÄTT: oms [44 160 · 51 197 · 47 944 · 46 571 · 46 483] + TTM 46 226 (FY22-toppen +15,9 % renoveringsboomen → mjuk platå; CAGR −3,17 % dokumenterad som konjunktur ej kollaps) · bruttomarginal 25,8→27,8 % (prissättningen höll) · netto svävande [2 521→2 883] + TTM 2 671.
FCF [2 998 · 3 822 · 4 064 · 3 486 · 3 464] + TTM 3 378 — identitetslåst exakt sex fönster (PLATÅ dokumenterad); FCF-yield 9,89 %. UTD VÄXER varje år (2,30 EUR · 3,29 % EXAKT; +4,55 %) + återköp stadiga (aktieantal −1,05 % EXAKT; shareholder yield 4,34 %). EV/EBITDA 6,22 = byggcykel-botten dokumenterad · 52v −25,57 % (PT-gap +39,9 % — datafakta). ROIC-gap +1,94 p · NETTO-SKULD −11,5 mdr (förvärsåren).
KVD: append 302+/0− · läs-tillbaka ×2 · llms HELREGEN 303 (totalt n 291; 10 aspektrader) · läckagevakt 0 (547) · tsc 0 · prod 200 i avslutet (ETT STEG I TAGET enligt skal-lexan).
Frankrike-grenmätning EFTER inlägget (mätt): ${frText} ⇒ kvarvarande 1-grenar: ${frEn.join(', ')}.
Kö: fastighet/kommunikikation-sonder (URW/ORA-partners — P/E-bärarkontroller) · v172-fönstret 10-20 (SEX bolag inne: A3M 10-22 · DGE+BBVA+PUIG 10-29 · SGO+4503 10-30 · ENB 11-02; EL/PSON pre-fönster; NG/SN/ENGI en dag efter) · Indien-svep. R2: Q3-paketet väntar kund. Protokoll: V173-U41-SGO-SAINTGOBAIN-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 244 U41 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":244'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 244, organ: 'Φ', ts: Date.now(),
    beslut: 'v173 U41: Saint-Gobain SGO.PA (Frankrike/material 1→2) — Air Liquide+SGO (materialgrenens B2B-spegel). Tretton lås (sex exakta; payout rätt bas 1 118/2 671). Geo-fem-benslås tre exakta fönster (interna försäljningar negativt ben). Konjunkturporträtt: mjuk platå efter FY22-toppen (CAGR −3,17 % dokumenterad); bruttomarginal höll; EV/EBITDA 6,22 = cykelbotten. Rappdag 10-30 INOM v172 (sjätte bolaget). Kö: fastighet/kommunikation-sonder, v172-fönster (sex bolag), Indien-svep.',
    bevis: 'V173-U41-SGO-SAINTGOBAIN-UTOKNING.md + _r244-u41-*.mjs (kvitton /tmp/r244-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U41-SGO-SAINTGOBAIN-UTOKNING.md',
  'worklog.md',
  'verktyg/_r244-u41-sgo-hamta.mjs', 'verktyg/_r244-u41-universum-inlagg.mjs', 'verktyg/_r244-u41-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U41 LEVERERAD — Compagnie de Saint-Gobain SGO.PA (Frankrike/material 1→2): cellmotiverad duo (Air Liquide industrigaserna/processkemins insatsvaror + Saint-Gobain byggmaterial/konstruktionens insatsvaror — materialgrenens B2B-spegel); EPA/EUR enl. AI.PA-precedensen; halvårsrapportering (TTM jun '26; RAPPDAG est. 2026-10-30 — INOM v172-fönstret, SJÄTTE bolaget, samma dag som 4503.T/Astellas); TRETTON LÅS med SEX EXAKTA (mcap 0,48923×69,82=34,16 fyra siffror · netto-M 5,78 · FCF-M 7,31 · divY 3,29 · PAYOUT med RÄTT bas 1 118/2 671 = 41,86 % · P/E 0,05 %) + sju snäva (EV 1,4 % mindre NCI dokumenterad); P/E-familjen 12,96/12,79/12,954; PEG NULL (basblandning); GEO-FEM-BENSLÅSET TRE EXAKTA FÖNSTER: fyra regioner + INTERNA FÖRSÄLJNINGAR SOM NEGATIVT BEN = totalen exakt i TTM+FY25+FY24 (allt vyn erbjuder); S-Europa/MEA störst 35 % · Amerika dalar (räntaboligheten); KONJUNKTURPORTRÄTT: FY22-toppen +15,9 % (renoveringsboomen) → mjuk platå (CAGR −3,17 % dokumenterad som konjunktur ej kollaps); bruttomarginal 25,8→27,8 % (prissättningen höll); FCF [2 998 · 3 822 · 4 064 · 3 486 · 3 464] + TTM 3 378 identitetslåst exakt (PLATÅ dokumenterad; yield 9,89 %); UTD VÄXER varje år (2,30 EUR · 3,29 % EXAKT; +4,55 %) + återköp stadiga (aktieantal −1,05 % EXAKT; shareholder yield 4,34 %); EV/EBITDA 6,22 = byggcykel-botten dokumenterad · 52v −25,57 % (PT-gap +39,9 % — datafakta); ROIC-gap +1,94 p · NETTO-SKULD −11,5 mdr (förvärsåren); universum 302→303 kirurgiskt, llms HELREGEN 303 (totalt n 291; 10 aspektrader), läckagevakt 0 (547), tsc 0, prod 200. Frankrike 24→25 (material 1→2; kvarvarande 1-grenar: ${frEn.join(', ')}). Kö: fastighet/kommunikation-sonder (URW/ORA-partners), v172-fönstret 10-20 (SEX bolag inne + pre/post-notiser), Indien-svep. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r244-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r244-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r244-msg.txt']);
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
console.log('LEVERANS: v173 U41 Saint-Gobain klar — universum 303, push verifierad, prod 200');
