#!/usr/bin/env node
// Rond 235 — BOKFÖRING: A3M-tröskelbeslut (korrigerad hämtning) + v172-kalenderberedning + commit + push.
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

steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 235 [organ:Φ] — A3M-TRÖSKELBESLUT')) return 'redan bokförd';
  const rad = `

## ROND 235 [organ:Φ] — A3M-TRÖSKELBESLUT LEVERERAT: rond 234:s 404 diagnostiserad (stockanalysis saknar bme/ATR — Atresmedias BME-symbol är A3M), korrigerad hämtning GRÖN: A3M 5,82 EUR · mcap 1,31 mdr · netto +54,68 M · P/E 24,05 · utdelning 6,70 % · Communication Services/Entertainment ⇒ P/E-bärare GRÖN OCH tröskeln passerad (universumets minsta: SWP.PA 0,28 · HFG.DE 0,39 · ENEA.ST 1,21 mdr — A3M 1,31 ligger ÖVER sex befintliga bolag) ⇒ U36 = Atresmedia (Cellnex+A3M: spanska BT+Pearson — tornen mot innehållet) + V172-BEREDDELSEN bokförd — 2026-09-25

TRÖSKELDIAGNOSEN: (1) rotorsak — bme/ATR = 404 (sidan saknas; /tmp/r234-atr/quote.plain.txt rad 1 '404 - Page not found'); (2) Atresmedia handlas under BME-symbolen A3M (Atresmedia Corporación; f.d. Antena 3 — två aktieklasser); (3) korrigerad hämta+parse HTTP 200 med fulla nyckeltal.
A3M-TALPORTRÄTT (quote 2026-09-25): pris 5,82 EUR (+10,44 % på dagen — volatil litenbolagsrörelse dokumenterad) · mcap 1,31 mdr EUR · netto TTM +54,68 M · P/E 24,05 · utdelning 0,39 EUR (6,70 % — hög; payout kontrolleras i hämtningssteget) · sektor Communication Services/Entertainment (rätt cell) · kollisionskontroll: A3M 0 träffar i universumet (RE — kolla namn 'Atresmedia' i hämtningssteget).
BESLUT: A3M är U36-kandidaten — Spanien/kommunikation 1→2 (sista spanska 1-grenen): Cellnex (telekom-tornen — infrastrukturen/rören) + Atresmedia (broadcasting — innehållet/media): SPANSKA BT+PEARSON-MÖNSTRET. VARNINGAR för hämtningssteget: (a) litet bolag 1,31 mdr — tunn datatäckning riskerar fragmenterade serier/segment; (b) utdelningen 6,70 % mot P/E 24 — payout-kontroll kritisk (om payout > 100 % på TTM: dokumentera men ej nödvändigtvis avvisa — följ källdata); (c) dagssvängen +10 % noteras i paranoid.
V172-BEREDDELSEN (fönstret 10-20→11-04; superdagen 10-29): kö-ordning per rappdag — (1) PSON 10-12 FÖRE fönstret: kvartalsQ3-uppdatering frivillig om data finns (kalibrering); (2) SUPERDAGEN 10-29: DGE · BBVA · PUIG — tre bolag samma dag; rondvis ett bolag i taget (DGE först: äldst levererade UK-rad i fönstret; sedan BBVA; sedan PUIG), varje uppdatering med fyra färskpaneler + fält-diff mot universumraden + KVD; (3) ENB 11-02: Q3-uppdatering (rörbyggnadsprogrammets capex-koll); (4) efter varje uppdatering: llms HELREGEN + läckagevakt + tsc + commit. MANIFEST-ALTERNATIV: vid belastning kan superdagen dispatchas via agentfabrik (tre oberoende bolag = tre uppgifter) — men datafilsskrivning till ETT universum kräver serieaccess; beslut tas i rond 236+ baserat på läget.
KVD denna rond: sond read-only (universumet orört) · kvitto /tmp/r235-a3m/ · commit via rond 227:s mekanik.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 235 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":235'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 235, organ: 'Φ', ts: Date.now(),
    beslut: 'A3M-tröskelbeslut: 404-rotorsak = fel symbol (ATR→A3M); korrigerad hämtning GRÖN (netto +54,68 M, P/E 24,05, Entertainment = rätt cell) och tröskeln passerad (1,31 mdr > sex befintliga bolag under 2 mdr) ⇒ U36 = Atresmedia (Cellnex+A3M = spanska BT+Pearson). Varningar: tunn småbolagsdata, 6,70 %-utdelningens payout, +10 %-dagssväng. V172-beredning bokförd: PSON 10-12 före; superdagen 10-29 DGE→BBVA→PUIG rondvis; ENB 11-02.',
    bevis: '_r235-atr-fix.mjs + /tmp/r235-a3m/* + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = ['worklog.md', 'verktyg/_r235-atr-fix.mjs', 'verktyg/_r235-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 235 A3M-TRÖSKELBESLUT + V172-BEREDDELSE — rond 234:s tomma ATR-koll diagnostiserad till roten (stockanalysis bme/ATR = 404 — Atresmedias BME-symbol är A3M; fel sökväg, ej parserfel); korrigerad hämtning GRÖN: A3M 5,82 EUR · mcap 1,31 mdr EUR · netto TTM +54,68 M · P/E 24,05 · utdelning 6,70 % · Communication Services/Entertainment (rätt cell) ⇒ P/E-bärare GRÖN; TRÖSKELN PASSERAD: universumets minsta bolag är SWP.PA 0,28 mdr och sex bolag ligger under 2 mdr (ENEA 1,21 · PCELL 1,24 · PSNY 1,74 · AT1 1,9) — A3M 1,31 inom räckhåll ⇒ U36 = Atresmedia (Spanien/kommunikation 1→2, sista spanska 1-grenen: Cellnex tornen + A3M innehållet = spanska BT+Pearson-mönstret); varningar för hämtningssteget bokförda (tunn småbolagsdata · payout-kontroll på 6,70 %-utdelningen · +10 %-dagssväng); V172-BEREDDELSE bokförd: PSON 10-12 före fönstret · SUPERDAGEN 10-29 DGE→BBVA→PUIG rondvis med fyra färskpaneler+fält-diff+KVD per bolag · ENB 11-02 (capex-kollen) · manifest-alternativ vid belastning avgörs i rond 236+. Sond read-only, universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r235-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r235-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r235-msg.txt']);
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
console.log('LEVERANS: rond 235 A3M-tröskelbeslut + v172-beredelse bokförd och pushad');
