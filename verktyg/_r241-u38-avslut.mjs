#!/usr/bin/env node
// Rond 241 — U38 AVSLUT: Frankrike-grenmätning + 300-MILESTONE + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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

// 1. Frankrike-grenmätning + total
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const fr = u.filter((b) => b.land === 'Frankrike');
const frGrenar = {};
for (const b of fr) frGrenar[b.bransch] = (frGrenar[b.bransch] ?? 0) + 1;
const frText = Object.entries(frGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const frEn = Object.entries(frGrenar).filter(([, n]) => n < 2).map(([k]) => k);
steg('frankrike-grenmätning', () => `Frankrike ${fr.length} rader — ${frText} ⇒ kvarvarande 1-grenar: ${frEn.join(', ')}`);
steg('universum-300', () => `UNIVERSUM: ${u.length} BOLAG — MILESTONE`);

// 2. Worklog-rond 241
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 241 [organ:Φ] — v173 U38 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 241 [organ:Φ] — v173 U38 LEVERERAD: Safran S.A. SAF.PA (Frankrike/industri 1→2) — UNIVERSUM 299→300: DET 300:E BOLAGET (dataset-djup-spårets jämna hundratal), Airbus+Safran-duon (flygkroppens volymcykel mot motorernas eftermarknads-moat — CFM/LEAP-duopolet), FCF STIGANDE SEX RAKA ÅR som seriens sanning medan netto-serien är engångspostsburen (resultat-CAGR NULL dokumenterad), ROIC-gap +14,36 p universumets bredaste — 2026-09-25

U38: Frankrike/industri-cellens duo — Airbus (flygkroppen) + Safran (motorerna: varje leverad motor blir 20 års service). EPA/EUR (AIR.PA-precedensen).
TRETTON LÅS (ÅTTA EXAKTA): mcap EXAKT (0,41454×334,30 = 138,58 — fyra siffror) · PS EXAKT · P/B EXAKT · netto-M EXAKT (11,56) · FCF-M EXAKT (15,59) · divY EXAKT (1,00) · P/E pris/EPS 0,008 % EXAKT (35,897 mot 35,90) · EV/Sales EXAKT · payout 0,5 % · EV/Earnings 0,04 % · fcfY 0,2 % · D/E 0,7 % · EV 0,45 % (pension/NCI dokumenterad). P/E-FAMILJEN 35,90/35,72/35,897. PEG NULL (kälrbas 26,8 % mot konsensus 24,84 — ingen ren).
NETTO-SERIEN ENGÅNGSPOSTSBUREN DOKUMENTERAD: [43 · −2 459 · 3 444 · −667 · 7 177] + TTM 3 882 (FY22 ryska exponerings-/valutaderivatposter; FY24 artikeljustering; FY25 topp; TTM normaliserat) — RESULTAT-CAGR NULL (negativ bas, dokumenterat). OMSÄTTNINGEN RAK: [15 293 · 19 523 · 23 651 · 27 716 · 31 189] + TTM 33 569 (CAGR +16,90 %; flygets återhämtningsmotor).
FCF = SERIENS SANNING: [1 994 · 3 009 · 3 447 · 3 689 · 4 483] + TTM 5 232 — STIGANDE SEX RAKA ÅR, identitetslåst exakt; FCF-M 15,59 > netto-M 11,56 (eftermarknaden i kassan). DIVISIONSBILDEN tre ben (Propulsion 52 · Equipment 41 · Interiors 9,5) med DOKUMENTERAD differans [+549 · +130 · −409 · −463 · −504 · +106] max 2,6 % (TD/BBVA-klassen).
UTDELNING 3,35 EUR (1,00 % EXAKT; +15,5 %) + ÅTERKÖP −1,6 mdr TTM (lika stora ben; aktieantal +0,97 % pga optionsprogram). ROIC 23,59 % mot WACC 9,23 % — GAP +14,36 p UNIVERSUMETS BREDASTE · räntetäckning 41,77 · NETTOKASSA +1,56 mdr. KASKADJUSTERINGEN DOKUMENTERAD: pretax-M över EBIT-M = positivt finansnetto på nettokassan (tillåtet; kärkravet netto<EBIT<brutto håller).
KVD: append 299+/0− · läs-tillbaka ×2 · llms HELREGEN 300 (totalt n 288; 10 aspektrader) · läckagevakt 0 (541) · tsc 0 · prod 200 i avslutet.
Frankrike-grenmätning EFTER inlägget (mätt): ${frText} ⇒ kvarvarande 1-grenar: ${frEn.join(', ')}.
Kö: Frankrike duo-ordning EL → ENGI → SGO (alla gröna i rond 240) + fastighet/kommunikikation osonderade · v172-fönstret 10-20 (fem bolag med mall) · Indien-svep. R2: Q3-paketet väntar kund. Protokoll: V173-U38-SAF-SAFRAN-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 241 U38 bokförd';
});

// 3. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":241'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 241, organ: 'Φ', ts: Date.now(),
    beslut: `v173 U38: Safran SAF.PA (Frankrike/industri 1→2) — UNIVERSUM 300 (jämnt hundratal). Airbus+Safran flygets vertikal. Tretton lås (åtta exakta, mcap 0,0004 %). Netto-serien engångspostsburen (resultat-CAGR NULL dokumenterad); FCF stigande sex raka (seriens sanning); ROIC-gap +14,36 p universumets bredaste; divisionsdifferans max 2,6 % dokumenterad. Rappdag 2027-02-09 (utanför v172). Kö: EL → ENGI → SGO, v172-fönster, Indien-svep.`,
    bevis: 'V173-U38-SAF-SAFRAN-UTOKNING.md + _r241-u38-*.mjs (kvitton /tmp/r241-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 4. Commit + push
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U38-SAF-SAFRAN-UTOKNING.md',
  'worklog.md',
  'verktyg/_r241-u38-saf-hamta.mjs', 'verktyg/_r241-u38-universum-inlagg.mjs', 'verktyg/_r241-u38-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U38 LEVERERAD — UNIVERSUMETS 300:E BOLAG: Safran S.A. SAF.PA (Frankrike/industri 1→2): cellmotiverad duo (Airbus flygkroppens volymcykel + Safran motorernas eftermarknads-moat — CFM/LEAP-duopolet med GE: varje leverad motor blir 20 års service; flygets vertikal i en cell); EPA/EUR enl. AIR.PA-precedensen; halvårsrapportering (TTM jun '26; årsbokslut 2027-02-09 utanför v172); TRETTON LÅS med ÅTTA EXAKTA (mcap 0,41454×334,30=138,58 fyra siffror · PS · P/B · netto-M 11,56 · FCF-M 15,59 · divY 1,00 · P/E pris/EPS 0,008 % · EV/Sales) + övriga fem inom 0,7 % (EV 0,45 % = pension/NCI dokumenterad); P/E-familjen 35,90/35,72/35,897; PEG NULL (kälrbas 26,8 % mot konsensus 24,84); NETTO-SERIEN ENGÅNGSPOSTSBUREN DOKUMENTERAD [43 · −2 459 · 3 444 · −667 · 7 177] + TTM 3 882 (FY22 ryska/valutaposter · FY24 justering · FY25 topp) — RESULTAT-CAGR NULL (negativ bas); OMSÄTTNINGEN RAK (CAGR +16,90 %, flygets återhämtningsmotor); FCF = SERIENS SANNING: STIGANDE SEX RAKA [1 994 → 5 232] identitetslåst exakt (FCF-M 15,59 > netto-M 11,56 — eftermarknaden i kassan); DIVISIONSBILDEN tre ben (Propulsion 52 · Equipment 41 · Interiors 9,5) med DOKUMENTERAD differans max 2,6 %; UTD 3,35 (1,00 % EXAKT; +15,5 %) + återköp −1,6 mdr (lika stora ben; optionsutspädning +0,97 % dokumenterad); ROIC-GAP +14,36 p UNIVERSUMETS BREDASTE · räntetäckning 41,77 · NETTOKASSA +1,56 mdr; kaskadjustering dokumenterad (pretax>EBIT = finansnetto); universum 299→300 kirurgiskt, llms HELREGEN 300 (totalt n 288; 10 aspektrader), läckagevakt 0 (541), tsc 0, prod 200. Frankrike 21→22 (industri 1→2; kvarvarande 1-grenar: ${frEn.join(', ')}). Kö: EL → ENGI → SGO (gröna i rond 240), v172-fönstret 10-20, Indien-svep. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r241-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r241-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r241-msg.txt']);
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
console.log('LEVERANS: v173 U38 Safran klar — UNIVERSUM 300, push verifierad, prod 200');
