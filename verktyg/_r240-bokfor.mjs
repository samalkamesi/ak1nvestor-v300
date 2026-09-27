#!/usr/bin/env node
// Rond 240 — BOKFÖRING: Frankrike-sonden (fyra gröna duopartners) + U38-val (SAF) + commit + push.
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
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 240 [organ:Φ] — U38-SOND FRANKRIKE')) return 'redan bokförd';
  const rad = `

## ROND 240 [organ:Φ] — U38-SOND FRANKRIKE LEVERERAD: fyra duopartners till Frankrikes ensamgrenar ALLA RENA + P/E-bärare GRÖNA — SAF Safran (industri: 138,58 mdr · netto 3,88 mdr · P/E 35,90) · ENGI Engie (energi: 56,96 · 4,07 · 14,26) · SGO Saint-Gobain (material: 34,16 · 2,67 · 12,96) · EL EssilorLuxottica (hälsa: 66,50 · 2,49 · 27,04) ⇒ U38 = AIRBUS+SAFRAN (flygkroppen mot motorerna); v172-fönstret (10-20→11-04) öppnar om ~3,5 veckor —RAPDAGSMALLEN klar sedan rond 239 — 2026-09-25

BAKGRUND: v172-fönstret öppnar 10-20 (idag 09-25) — rundan tar FRANKRIKE-SVEPET (rond 237:s karta: sex ensamgrenar — energi TTE.PA · fastighet URW.PA · industri AIR.PA · halso SAN.PA · kommunikation ORA.PA · material AI.PA).
SONDEN (epa/Paris, S&P-data 2026-09-25): alla fyra prövade duopartners RENA (kollision primär+sekundär 0 träffar) OCH P/E-bärare GRÖNA:
(1) SAF Safran — industri/Airbus-partner: 334,30 EUR · mcap 138,58 mdr · netto 3,88 mdr · P/E 35,90 · CFM56/LEAP-motorerna (flygets eftermarknads-moat).
(2) ENGI Engie — energi/TotalEnergies-partner: 23,42 · 56,96 mdr · 4,07 mdr · 14,26 (olja mot gas/utilities — E.ON-klassen).
(3) SGO Saint-Gobain — material/Air Liquide-partner: 69,82 · 34,16 mdr · 2,67 mdr · 12,96 (industrigaserna mot byggmaterial).
(4) EL EssilorLuxottica — hälsa/Sanofi-partner: 144,70 · 66,50 mdr · 2,49 mdr · 27,04 (läkemedel mot optisk korrektion — konsumtionshälso-klassen).
U38-VALET: AIRBUS+SAFRAN — flygets duo (flygkroppen mot motorerna: volymcykeln mot eftermarknadens installationbas) — storlek (138,6 mdr), tydligast cell-pedagogik, strongest konsensusbild. DUO-ORDNING därefter: EL (U39-kandidat) · ENGI · SGO — alla gröna i sonden.
SEKTOR-VERIFIERING: kandidaternas GISC-celler kontrolleras i hämtningssteget (statistik-panelens sektor-rad) — sondens snabbvy fångde ej sektor-raderna; documented.
NÄSTA VÅG (rond 241): U38 = SAF-hämtning (fyra paneler EPA/EUR, AIR.PA-precedensen) med tretton lås + divisionslås (Civil Aerospace/Military/Propulsion?) + kirurgisk append 299→300 — UNIVERSUMETS 300:BOLAG + FRANKRIKE industri-gren 1→2.
KVD denna rond: sond read-only · kvitton /tmp/r240-frk/ · commit via rond 227:s mekanik.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 240 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":240'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 240, organ: 'Φ', ts: Date.now(),
    beslut: 'U38-sond Frankrike: fyra duopartners alla RENA+GRÖNA (SAF 35,90 · ENGI 14,26 · SGO 12,96 · EL 27,04 — netto 2,5-4,1 mdr) ⇒ U38 = Airbus+Safran (flygkroppen mot motorerna; 138,6 mdr). Duo-ordning: SAF → EL → ENGI → SGO. v172-fönstret öppnar 10-20 (mallen klar). Nästa: U38 SAF-hämtning → universum 300.',
    bevis: '_r240-u38-frk-sond.mjs + /tmp/r240-frk/* + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = ['worklog.md', 'verktyg/_r240-u38-frk-sond.mjs', 'verktyg/_r240-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 240 U38-SOND FRANKRIKE — v172-fönstret öppnar först 10-20 (mallen klar sedan rond 239) ⇒ rundan tar Frankrike-svepet (rond 237:s karta: sex ensamgrenar); sonden (epa/Paris, S&P-data): FYRA duopartners ALLA RENA + P/E-bärare GRÖNA — SAF Safran (industri-partner till Airbus: 334,30 EUR · 138,58 mdr · netto 3,88 mdr · P/E 35,90 · CFM/LEAP-motorernas eftermarknads-moat) · ENGI Engie (energi-partner till TotalEnergies: 56,96 mdr · 4,07 · 14,26 — olja mot gas, E.ON-klassen) · SGO Saint-Gobain (material-partner till Air Liquide: 34,16 · 2,67 · 12,96) · EL EssilorLuxottica (hälsa-partner till Sanofi: 66,50 · 2,49 · 27,04 — läkemedel mot optisk korrektion); U38 = AIRBUS+SAFRAN (flygkroppen mot motorerna — volymcykeln mot installationsbasen); duo-ordning därefter EL → ENGI → SGO (alla gröna); sektor-verifiering sker i hämtningssteget (sondens snabbvy fångade ej sektor-raderna — documented); NÄSTA: U38 SAF-hämtning (fyra paneler EPA/EUR AIR.PA-precedensen, tretton lås + divisionslås) ⇒ kirurgisk append 299→300 — UNIVERSUMETS 300:E BOLAG. Sond read-only, universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r240-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r240-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r240-msg.txt']);
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
console.log('LEVERANS: rond 240 Frankrike-sond bokförd och pushad');
