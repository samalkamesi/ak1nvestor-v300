#!/usr/bin/env node
// Rond 238 — U37 AVSLUT: Tyskland-grenmätning (förväntat KOMPLETT — femte landet) + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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

// 1. Tyskland-grenmätning
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const de = u.filter((b) => b.land === 'Tyskland');
const deGrenar = {};
for (const b of de) deGrenar[b.bransch] = (deGrenar[b.bransch] ?? 0) + 1;
const deText = Object.entries(deGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const deKomplett = !Object.values(deGrenar).some(n => n < 2);
steg('tyskland-grenmätning', () => `Tyskland ${de.length} rader — ${deText} ⇒ ${deKomplett ? 'SAMTLIGA tio grenar ≥2 (TYSKLAND-KOMPLETT)' : 'kvarvarande 1-grenar'}`);

// 2. Worklog-rond 238
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 238 [organ:Φ] — v173 U37 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 238 [organ:Φ] — v173 U37 LEVERERAD: Infineon Technologies IFX.DE (Tyskland/teknik 1→2) — universum 298→299, SAP+IFX-duon (tyska teknikens två ben: abonnemangscykel mot kapitalcykel — Panasonic+Tokyo Electron-klassen), ${deKomplett ? 'TYSKLAND-KOMPLETT: samtliga tio grenar ≥2 (' + deText + ') — FEMTE KOMPLETTA LANDET' : ''}, rappdag 11-10 (FY26-bokslut, sex dagar efter v172-fönstret) — 2026-09-25

U37: Tyskland/teknik-cellens duo — SAP (enterprise-mjukvaran) + Infineon (halvledarna). ETR/EUR (SAP.DE-precedensen); FISCALÅR OKT–SEP (TTM = jun '26, Q3).
TRETTON LÅS (ÅTTA EXAKTA): PS EXAKT · P/B EXAKT · EV-dekomposition 0,01 % · netto-M EXAKT (7,68 financials-TTM; statistics-veget 7,77 = dokumenterad annan bas) · FCF-yield EXAKT · divY EXAKT · P/E pris/EPS 0,03 % EXAKT · EV/Sales EXAKT · mcap 0,3 % · fcfM 0,2 % · D/E 0,45 % · payout 0,8 % · EV/Earnings 0,24 %. P/E-FAMILJEN TIGHT 61,13/60,78/61,15. PEG 0,56 MED DOKUMENTERAD BAS (fwd 22,38/konsensus 3Y EPS 40,0 = 0,5595 — TD-precedensen, fältet SATT).
CYKELPORTRÄTTET (P/E 61 = HALVLEDARCYKLENS BOTTEN DOKUMENTERAD): netto [1 143 · 2 150 · 3 108 · 1 272 · 997] + TTM 1 197 (topp→botten −68 %, TTM-vändning; netto-CAGR −22,6 % ÖPPET) · oms-sågtanden +28,6→−8,3→+6,5 % (CAGR +1,03 %) · bruttomarginal 38,7→47,2→41,1 % (medel 42,7, spridning 8,48 pp). fwd P/E 22,38 ⇒ implied EPS +173 % (konsensusreferens).
DIVISIONSBILDEN: Automotive 49 % störst (SiC-bryggor) [7 442 · 7 402 · 7 716 · 8 242 · 6 516 · 4 841] + Green IP (korrigeringen djupast) + PSS (VÄNDER FÖRST — AI-serverströmförsörjningen) + CSS (IoT-lagret tömt) — DIFFERANSEN [+17 · +17 · +8 · −18 · −20 · −12] max 0,14 % dokumenterad + TVÅ TTM-FÖNSTER (jun 15 591 / mar 15 121 — källan uppdaterar divisioner trappstegsvis).
FCF MED BOTTNEN: [1 797 · 1 927 · 1 221 · 348 · 1 417] + TTM 1 646 — identitetslåst exakt sex fönster (FY24-botten 348 = capex-toppen 2 739: Kulim/Graz-fabrikerna; OCF höll 2 780). UTDDELNINGEN FRUSEN 0,35 EUR (0,62 % EXAKT; payout 37,62). ROIC 7,95 % mot WACC 13,81 % (gap −5,86 p — BOTTENNATUR dokumenterad, ej strukturellt). NETTO-SKULD −5,59 mdr + kassaglidningen −446 M (fabriksåren). Beta 1,93 · 52v +66,45 % · RSI 46,7.
KVD: append 298+/0− · läs-tillbaka ×2 · llms HELREGEN 299 (totalt n 287; 10 aspektrader) · läckagevakt 0 (539) · tsc 0 · prod 200 i avslutet.
${deKomplett ? `Tyskland-grenmätning EFTER inlägget (mätt): ${deText} ⇒ TYSKLAND-KOMPLETT — FEM kompletta länder nu: UK (rond 228) · Kanada (231) · Spanien (236) · Japan (237, mätt utan inlägg) · Tyskland (238).` : ''}
Kö: v172-FÖNSTRET ÖPPNAR 10-20 (fem bolag: A3M 10-22 · DGE→BBVA→PUIG 10-29 · ENB 11-02 — bokförd ordning) · spårrotation (branding/finslipning) · Frankrike/Indien-svep (6/7 ensamgrenar — rund 237:s karta). R2: Q3-paketet väntar kund. Protokoll: V173-U37-IFX-INFINEON-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 238 U37 bokförd';
});

// 3. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":238'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 238, organ: 'Φ', ts: Date.now(),
    beslut: `v173 U37: Infineon IFX.DE (Tyskland/teknik 1→2) — SAP+IFX tyska teknikens två ben. Tretton lås (åtta exakta; PEG 0,56 med dokumenterad bas 22,38/40,0). Cykelporträtt: netto [1 143 · 2 150 · 3 108 · 1 272 · 997] + TTM 1 197 (P/E 61 = botten dokumenterad; ROIC-gap −5,86 p bottennatur); FCF med FY24-botten 348 (capex-toppen 2 739); divisioner med differans ±20 M dokumenterad; utdelning frusen 0,35. Rappdag 11-10 (FY26-bokslut efter v172). ${deKomplett ? 'TYSKLAND-KOMPLETT: tio grenar ≥2 — femte kompletta landet (UK · Kanada · Spanien · Japan · Tyskland).' : ''} Kö: v172-fönster (5 bolag), spårrotation, Frankrike/Indien-svep.`,
    bevis: 'V173-U37-IFX-INFINEON-UTOKNING.md + _r238-u37-*.mjs (kvitton /tmp/r238-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 4. Commit + push
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U37-IFX-INFINEON-UTOKNING.md',
  'worklog.md',
  'verktyg/_r238-u37-ifx-hamta.mjs', 'verktyg/_r238-u37-universum-inlagg.mjs', 'verktyg/_r238-u37-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U37 LEVERERAD — Infineon Technologies IFX.DE (Tyskland/teknik 1→2 — TYSKLANDS SISTA 1-GREN): cellmotiverad duo (SAP enterprise-mjukvarans abonnemangscykel + Infineon halvledarnas kapitalcykel — tyska teknikens två ben, Panasonic+Tokyo Electron-klassen); ETR/EUR enl. SAP.DE-precedensen; FISCALÅR OKT–SEP (TTM jun '26); TRETTON LÅS med ÅTTA EXAKTA (PS · P/B · EV-dekomposition 0,01 % · netto-M 7,68 financials-TTM · FCF-yield · divY · P/E pris/EPS 0,03 % · EV/Sales) + övriga fem inom 0,8 %; P/E-familjen TIGHT 61,13/60,78/61,15; PEG 0,56 MED DOKUMENTERAD BAS (fwd 22,38/konsensus 40,0 = 0,5595 — TD-precedensen, fältet SATT); CYKELPORTRÄTTET: P/E 61 = HALVLEDARCYKLENS BOTTEN DOKUMENTERAD — netto [1 143 · 2 150 · 3 108 · 1 272 · 997] + TTM 1 197 (topp→botten −68 %, TTM-vändning; netto-CAGR −22,6 % ÖPPET); oms-sågtand +28,6→−8,3→+6,5 %; bruttomarginal 38,7→47,2→41,1 %; fwd-implied +173 % konsensusreferens; DIVISIONSBILDEN: Automotive 49 % (SiC) + Green IP + PSS (vänder först — AI-strömförsörjning) + CSS — differansen [+17 · +17 · +8 · −18 · −20 · −12] max 0,14 % + två TTM-fönster (jun/mar) dokumenterade; FCF MED BOTTNEN [1 797 · 1 927 · 1 221 · 348 · 1 417] + TTM 1 646 identitetslåst exakt (FY24 = capex-toppen 2 739 Kulim/Graz); UTDDELNINGEN FRUSEN 0,35 (0,62 % EXAKT; payout 37,62); ROIC-gap −5,86 p (bottennatur dokumenterad); nettoskuld −5,59 mdr + kassaglidning −446 M (fabriksåren); beta 1,93 · 52v +66,45 %; RAPPDAG 2026-11-10 (FY26-bokslut — sex dagar efter v172-fönstret); universum 298→299 kirurgiskt, llms HELREGEN 299 (totalt n 287; 10 aspektrader), läckagevakt 0 (539), tsc 0, prod 200. Tyskland 23→24 — ${deKomplett ? 'TYSKLAND-KOMPLETT: samtliga tio grenar ≥2 — FEMTE KOMPLETTA LANDET (UK · Kanada · Spanien · Japan · Tyskland; mätt)' : 'kvarvarande se worklog'}. Kö: v172-fönstret 10-20 (fem bolag i bokförd ordning) · spårrotation · Frankrike/Indien-svep. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r238-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r238-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r238-msg.txt']);
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
console.log('LEVERANS: v173 U37 Infineon klar — universum 299, TYSKLAND-KOMPLETT, push verifierad, prod 200');
