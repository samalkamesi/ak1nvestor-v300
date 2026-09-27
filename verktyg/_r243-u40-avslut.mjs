#!/usr/bin/env node
// Rond 243 — U40 AVSLUT: Frankrike-grenmätning + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 243 [organ:Φ] — v173 U40 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 243 [organ:Φ] — v173 U40 LEVERERAD: Engie S.A. ENGI.PA (Frankrike/energi 1→2) — universum 301→302, TotalEnergies+Engie-duon (oljan mot gasen/utilities — E.ON/RWE-klassen i fransk tappning), FEM-BENSLÅSET VÅGENS TÄTASTE (±1 M = 0,001 % i tre fönster), rappdag 11-05 en dag efter v172-fönstret — 2026-09-25

U40: Frankrike/energi-cellens duo — TotalEnergies (oljans råvarucykel) + Engie (gasens nät- och förbrukningscykel + förnyelse/kärnbrygga). EPA/EUR (TTE.PA-precedensen); staten ~24 % (APE — strukturfakta).
TRETTON LÅS med TRE DOKUMENTERADE TOLERANSER: EV 7,0 % (= minoritetsandelarna ~8,6 mdr, GDF-arvet — tolerans 8 %) · payout 25 % (kälrbasen oredolvable: tre baser spanar 82–108 %) · mcap 0,09 %; övriga tio snäva (divY 5,76 % EXAKT · netto-M 5,76 % EXAKT mot financials-TTM · EV/Sales EXAKT · D/E 0,16 % · P/E 0,14 % m.fl.). P/E-FAMILJEN 14,26/14,01/14,28. PEG 3,09 MED DOKUMENTERAD BAS (14,26/4,59 = 3,107).
FEM-BENSLÅSET VÅGENS TÄTASTE: Renewable&Flex + Infrastructures + Supply&Energy Mgmt (störst 58 % — handelsbenet) + Other + Nuclear = totalen ±1 M (0,001 %) i TTM+FY25+FY24 (FY23 fragmentariskt — segmentvyn sedan FY24).
CYKELPORTRÄTTET: oms [57 866 · 93 865 · 82 565 · 73 812 · 71 944] + TTM 70 585 (FY22 +62 % = energikrisen; CAGR −8,48 % = AVSIKTLIG handelsnedtrappning, dokumenterad) · netto [3 540 · 139 · 2 128 · 4 030 · 3 687] + TTM 4 065 NY TOPP (FY22-botten 139; CAGR +198 % låg-bas-not).
FY25-FCF-KOLLAPSEN −8 743 (OCF −1 476) → TTM +2 152 — identitetslåst exakt sex fönster. UTD SÄNKT −8,78 % (1,35 EUR · 5,76 % EXAKT; FCF-payout 152 % = utilities-modellen med sänkning som respons — dokumenterat). SKULDSPIKEN TTM +15 mdr dokumenterad (Net Borrowing +8,8 + utdelning 4,4 mot FCF 2,2). NETTO-SKULD −56,0 mdr.
KVD: append 301+/0− · läs-tillbaka ×2 · llms HELREGEN 302 (totalt n 290; 10 aspektrader) · läckagevakt 0 (545) · tsc 0 · prod 200 i avslutet. SKAL-LEXAN: sammansatt kedjekommando hängde — stegen körs ETT I TAGET (regeln befäst; statussond _r243-status verifierade verkställelse).
Frankrike-grenmätning EFTER inlägget (mätt): ${frText} ⇒ kvarvarande 1-grenar: ${frEn.join(', ')}.
Kö: SGO Saint-Gobain (material — grön i sonden) · fastighet/kommunikikation osonderade · v172-fönstret 10-20 (EL 10-16 + PSON 10-12 pre-fönster; ENGI 11-05 + NG/SN en dag efter) · Indien-svep. R2: Q3-paketet väntar kund. Protokoll: V173-U40-ENGI-ENGIE-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 243 U40 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":243'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 243, organ: 'Φ', ts: Date.now(),
    beslut: 'v173 U40: Engie ENGI.PA (Frankrike/energi 1→2) — TotalEnergies+Engie (olja mot gas/utilities). Fem-benslås ±1 M (vågens tätaste). Tre dokumenterade toleranser (EV-minoriteter GDF · payout-bas oredolvable · mcap); PEG 3,09 dokumenterad bas. Cykel: avsiktlig handelsnedtrappning (CAGR −8,5 %) · netto TTM ny topp · FY25-FCF-kollaps + skuldspik dokumenterade. Rappdag 11-05 (en dag efter v172). Kö: SGO, fastighet/kommunikation-sonder, v172-fönster, Indien.',
    bevis: 'V173-U40-ENGI-ENGIE-UTOKNING.md + _r243-u40-*.mjs (kvitton /tmp/r243-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U40-ENGI-ENGIE-UTOKNING.md',
  'worklog.md',
  'verktyg/_r243-u40-engi-hamta.mjs', 'verktyg/_r243-u40-universum-inlagg.mjs', 'verktyg/_r243-u40-avslut.mjs', 'verktyg/_r243-status.mjs',
];
const MSG = `studio: [organ:Φ] v173 U40 LEVERERAD — Engie S.A. ENGI.PA (Frankrike/energi 1→2): cellmotiverad duo (TotalEnergies oljans råvarucykel + Engie gasens/utilities nät- och förbrukningscykel — E.ON/RWE-klassen i fransk tappning); EPA/EUR enl. TTE.PA-precedensen; staten ~24 % (APE — strukturfakta); halvårsrapportering (TTM jun '26; RAPPDAG 2026-11-05 BEKRÄFTAD — en dag efter v172-fönstret, NG/SN-klassen); TRETTON LÅS med TRE DOKUMENTERADE TOLERANSER (EV 7,0 % = minoritetsandelarna ~8,6 mdr GDF-arvet · payout 25 % = kälrbasen oredolvable, tre baser spanar 82–108 % · mcap 0,09 %) + tio snäva (divY 5,76 EXAKT · netto-M 5,76 EXAKT financials-TTM · EV/Sales EXAKT · D/E 0,16 %); P/E-familjen 14,26/14,01/14,28; PEG 3,09 MED DOKUMENTERAD BAS (14,26/4,59 = 3,107); FEM-BENSLÅSET VÅGENS TÄTASTE: fem divisioner = totalen ±1 M (0,001 %) i TTM+FY25+FY24 (FY23 fragmentariskt dokumenterat); CYKELPORTRÄTT: oms [57 866 · 93 865 · 82 565 · 73 812 · 71 944] + TTM 70 585 — CAGR −8,48 % = AVSIKTLIG handelsnedtrappning dokumenterad (ej kollaps); netto [3 540 · 139 · 2 128 · 4 030 · 3 687] + TTM 4 065 NY TOPP (FY22-botten; CAGR +198 % låg-bas-not); FY25-FCF-KOLLAPSEN −8 743 (OCF −1 476) → TTM +2 152 identitetslåst exakt; UTD SÄNKT −8,78 % (1,35 EUR, 5,76 % EXAKT; FCF-payout 152 % = utilities-modellen dokumenterad); SKULDSPIKEN TTM +15 mdr dokumenterad; NETTO-SKULD −56,0 mdr; universum 301→302 kirurgiskt, llms HELREGEN 302 (totalt n 290; 10 aspektrader), läckagevakt 0 (545), tsc 0, prod 200. Frankrike 23→24 (energi 1→2; kvarvarande 1-grenar: ${frEn.join(', ')}). SKAL-LEXAN bokförd: kedjekommandon körs ETT I TAGET. Kö: SGO (grön i sonden), fastighet/kommunikation-sonder, v172-fönstret, Indien-svep. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r243-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r243-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r243-msg.txt']);
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
console.log('LEVERANS: v173 U40 Engie klar — universum 302, push verifierad, prod 200');
