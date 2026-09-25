#!/usr/bin/env node
// Rond 230 — U32 AVSLUT: energi-rädstatistik + Kanada-grenmätning + worklog + beslutsminne +
// commit + push (rond 227:s mekanik) + prod 200.
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

// 1. Grenmätningar (FÖRE formulering — rond 225:s läxa)
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const ka = u.filter((b) => b.land === 'Kanada');
const kaGrenar = {};
for (const b of ka) kaGrenar[b.bransch] = (kaGrenar[b.bransch] ?? 0) + 1;
const kaText = Object.entries(kaGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const kaEn = Object.entries(kaGrenar).filter(([, n]) => n < 2).map(([k]) => k);
steg('kanada-grenmätning', () => `Kanada ${ka.length} rader — ${kaText} ⇒ ${kaEn.length ? 'kvarvarande 1-grenar: ' + kaEn.join(', ') : 'INGA 1-grenar'}`);

// 2. Worklog-rond 230 (U32 LEVERERAD)
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 230 [organ:Φ] — v173 U32 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 230 [organ:Φ] — v173 U32 LEVERERAD: Enbridge Inc. ENB (Kanada/energi 1→2) — universum 293→294, CNQ-brunnen+ENB-röret (producent/transportören — RWE+E.ON/INPEX+Tokyo Gas-mönstret), SEGMENTLÅSET I FEM DELAR med FEM EXAKTA FÖNSTER (TTM+FY2022–FY2025), FCF-KOLLAPSEN dokumenterad (NG.L-precedensen: capex fördobblat, utdelning 5× FCF), rappdag 2026-11-02 INOM v172-fönstret — 2026-09-25

U32: Kanada/energi-cellens duo — CNQ (upstream: oljesand — BRUNNEN) + ENB (midstream: 30 000 km rör — RÖRET). TSX/CAD-precedensen (BCE/NTR-klassen; RY/CNQ:s USD/NYSE dokumenterade som historisk avvikelse).
TRETTON LÅS GRÖNA (tre med dokumenterade toleranser): mcap 0,7 % · PS 1,80 EXAKT · P/B 2,18 EXAKT · EV 3,8 % (preferens+NCI, dokumenterad differens 260,48 vs 270,79) · netto-M 7,7 % (minoritetsbasen i källans 7,34-rad) · FCF-M 2,00 % EXAKT · FCF-yield 1,11 % EXAKT · divY 5,79 % EXAKT · D/E 1,63 EXAKT · payout 4,7 % (totalutdelningsbasen i källans 143,17-rad) · P/E pris/EPS 0,7 % · EV/Earnings 47,73 EXAKT · EV/Sales 3,24 EXAKT. P/E-FAMILJEN 26,05/26,51/25,87 (EPS-raden 2,59 mot beräknad 2,544 — aktieavrundning). PEG NULL (källans 7,68 — basblandning).
SEGMENTLÅSET I FEM DELAR: Liquids [63 606 · 45 944 · 38 183 · 29 882 · 37 174] (ryggraden 76 %) + Gas Transmission [6 834 · 6 652 · 6 199 · 5 854 · 5 426] + Gas Distribution & Storage [11 171 · 10 654 · 7 542 · 5 976 · 6 729] (fördubblad — Dominion 2024) + Renewable Power [634 · 561 · 514 · 477 · 582] + Eliminations [1 246 · 1 383 · 1 035 · 1 460 · 3 398] = totalen EXAKT SAMTLIGA TTM+FY2022–FY2025 (FY21 fragmenterat: Liquids/E&O startar FY22 — dokumenterat).
FCF-KOLLAPSEN (NG.L-precedensen rond 223): capex [4 647 · 4 654 · 6 711 · 8 973] · TTM 10 764 — MER ÄN FÖRDOBLAT = rörbyggnadsprogrammet; FCF [6 583 · 9 547 · 5 889 · 3 297] + TTM 1 668 — identitetslåst exakt fem fönster; OCF STABIL [9 256 · 11 230 · 14 201 · 12 600 · 12 270] TTM 12 432 (driftsidan bär, byggsidan äter); FCF-CAGR −20,6 %.
UTDELNINGEN 23 RAKA HÖJNINGSÅR: [6 766 · 6 968 · 7 276 · 7 875 · 8 220] TTM 8 347 · current 3,88 CAD (5,79 % EXAKT) · payout-källrad 143,17 % (totalutdelningsbas) · FCF-payout 518 % — SKULDFINANSIERAD REGGLERAD MODELL (dokumenterad, ej nöd).
STABILITET: NETTO-SKULD −110,1 mdr CAD (universumets största; serien [−76,2 · −80,3 · −76,5 · −101,1 · −105,2] med Dominion-hoppet 2024) · D/E 1,63 · Debt/EBITDA 6,42 · räntetäckning 2,27 · Altman 0,93 DJUP GRÅ (dokumenterad: reglerad infrastruktur under byggprogram) · Piotroski 5 · ROIC 5,19 % mot WACC 6,40 % gap −1,21 p (reglerade nätverkets avkastningsformel — E.ON/Redeia/NG.L-klassen) · nyemissioner FY23-24 (Dominion-aktier +4 450/+2 485) · netto [2 589 · 5 839 · 5 053 · 7 044] + TTM 5 673 (CAGR +39,6 % med låg-bas-not — FY22-nedskrivningar) · TTM-oms +29,5 % = Dominion-konsolidering (dokumenterad).
KVD: append 293+/0− · läs-tillbaka ×2 · llms HELREGEN 294 (totalt n 282; 10 aspektrader) · läckagevakt 0 (530) · tsc 0 · prod 200 i avslutet (adoptionsmekanik rond 227).
Kanada-grenmätning EFTER inlägget (mätt, ej härlett): ${kaText} ⇒ ${kaEn.length ? 'kvarvarande 1-grenar: ' + kaEn.join(', ') : 'INGA 1-grenar kvar'}.
KÖ: v172-KALENDER (ENB rappdag 11-02 INOM fönstret 10-20→11-04 — första inom-fönstret-bolaget; PSON 10-12 före) · Kanada/finans RY+TD (TD grön i rond 229) · Spanien (BBVA grön · Puig? · Telefónica?) · rappdagsbevakning. R2: Q3-paketet väntar kund. Protokoll: V173-U32-ENB-ENBRIDGE-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 230 U32 bokförd';
});

// 3. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":230'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 230, organ: 'Φ', ts: Date.now(),
    beslut: `v173 U32: Enbridge ENB (Kanada/energi 1→2) — CNQ-brunnen+ENB-röret. Segmentlås 5 delar × 5 exakta fönster (TTM+FY22–25); FCF-kollaps dokumenterad (capex fördubblat; utdelning 5× FCF = reglerad modell, 23 raka höjningar); netto-skuld −110 mdr (universumets största); Altman 0,93 grå dokumenterad; ROIC-gap −1,21 p (avkastningsformeln); tre dokumenterade toleranser (EV preferens+NCI, netto-M minoriteter, payout totalbas). Rappdag 11-02 INOM v172-fönstret. Kö: v172-kalender, Kanada/finans TD, Spanien BBVA/Puig/Telefónica.`,
    bevis: 'V173-U32-ENB-ENBRIDGE-UTOKNING.md + _r230-u32-*.mjs (kvitton /tmp/r230-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 4. Commit + push
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U32-ENB-ENBRIDGE-UTOKNING.md',
  'worklog.md',
  'verktyg/_r230-u32-enb-hamta.mjs', 'verktyg/_r230-u32-universum-inlagg.mjs', 'verktyg/_r230-u32-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U32 LEVERERAD — Enbridge Inc. ENB (Kanada/energi 1→2): cellmotiverad duo (CNQ upstream-brunnen + ENB midstream-röret — producent/transportören, RWE+E.ON/INPEX+Tokyo Gas-mönstret); TSX/CAD-precedensen (BCE/NTR-klassen; RY/CNQ:s USD/NYSE = dokumenterad historisk avvikelse); TRETTON LÅS GRÖNA med tre dokumenterade toleranser (EV 3,8 % = preferens+NCI · netto-M 7,7 % = minoritetsbasen i källans marginalrad · payout 4,7 % = totalutdelningsbasen i 143,17-raden) — övriga: PS/P/B/FCF-M/FCF-yield/divY/D/E/EV-Earnings/EV-Sales EXAKTA; P/E-familjen 26,05/26,51/25,87 (aktieavrundningsbas dokumenterad); SEGMENTLÅSET I FEM DELAR: fem segment = totalen EXAKT SAMTLIGA TTM+FY2022–FY2025 (FEM exakta fönster; FY21 fragmenterat — Liquids/E&O startar FY22); Liquids 76 % ryggraden; Gas Distribution fördubblad (Dominion 2024); FCF-KOLLAPSEN dokumenterad (NG.L-precedensen): capex mer än fördubblat 4,6→10,8 mdr = rörbyggnadsprogram, FCF [6 583 · 9 547 · 5 889 · 3 297] + TTM 1 668 identitetslåst, OCF stabil 12,4 mdr (driftsidan bär, byggsidan äter); UTDDELNINGEN 23 raka höjningar (3,88 CAD, 5,79 % EXAKT) med FCF-payout 518 % = skuldfinansierad reglerad modell (dokumenterad); NETTO-SKULD −110,1 mdr CAD universumets största (Dominion-hoppet 2024 i serien); Altman 0,93 DJUP GRÅ dokumenterad (reglerad infrastruktur, ej nöd) · ROIC 5,19 < WACC 6,40 gap −1,21 p (reglerade nätverkets avkastningsformel, E.ON/Redeia/NG.L-klassen) · nyemissioner FY23-24 (Dominion-aktier); netto-CAGR +39,6 % med låg-bas-not (FY22-nedskrivningar); TTM-oms +29,5 % = konsolideringseffekt dokumenterad; RAPPDAG est. 2026-11-02 INOM v172-fönstret (första inom-fönstret-bolaget); universum 293→294 kirurgiskt, llms HELREGEN 294 (totalt n 282; 10 aspektrader), läckagevakt 0 (530), tsc 0, prod 200. Kanada 10→11 (energi-grenen 1→2; kvarvarande 1-gren: finans). Kö: v172-kalender, Kanada/finans RY+TD, Spanien (BBVA/Puig?/Telefónica?), rappdagsbevakning. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r230-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r230-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r230-msg.txt']);
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
console.log('LEVERANS: v173 U32 Enbridge ENB klar — universum 294, push verifierad, prod 200');
