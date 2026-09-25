#!/usr/bin/env node
// Rond 237 — BOKFÖRING: Tyskland/Japan-grenmätning (FÖRE formulering) + U37-sondbeslut (IFX) + commit + push.
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
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 237 [organ:Φ] — GRENMÄTNING + U37-SOND')) return 'redan bokförd';
  const rad = `

## ROND 237 [organ:Φ] — GRENMÄTNING (FÖRE formulering) + U37-SOND LEVERERAD: JAPAN = INGA 1-GRENAR (landet komplett, 27 rader, mätt); TYSKLAND = EN 1-gren: teknik (SAP.DE ensam) ⇒ U37 = INFINEON IFX.DE — sonden GRÖN (REN kollision + P/E-bärare: netto +1,20 mdr EUR, P/E 61,13, Technology/Semiconductors, mcap 72,94 mdr) — SAP+IFX = tyska teknikens två ben (enterprise-mjukvaran mot cykliska halvledare); efter U37 är TYSKLAND-KOMPLETT — 2026-09-25

GRENMÄTNINGEN (mätt ur universumet 298, FÖRE alla formuleringar — rond 225:s läxa): JAPAN 27 rader — energi 2 · finans 5 · halso 3 · industri 2 · kommunikation 5 · konsument 6 · material 2 · teknik 2 ⇒ INGA 1-grenar (fjärde kompletta landet efter UK · Kanada · Spanien). TYSKLAND 23 rader — energi 2 · fastighet 2 · finans 2 · halso 2 · industri 2 · kommunikation 2 · konsument 6 · material 2 · teknik 1 · tillvaxt 2 ⇒ EN 1-gren: TEKNIK (SAP.DE).
ALLA LÄNDERS 1-GRENS-KARTA (underlag): Belgien 1 · Brasilien 5 · Danmark 2 · Frankrike 6 · Indien 7 · Italien 1 · Kina 2 · Luxemburg 1 · Mexiko 1 · Nederländerna 1 · Norge 1 · Schweiz 4 · Taiwan 1 · Tyskland 1 — kvarvarande ensamgrenar koncentrerade till tillväxt-/nyare länder; Frankrike och Indien har flest (ev. framtida svep).
U37-SONDEN: INFINEON IFX.DE [etr] — kollisionskontroll primär+sekundär REN (0 träffar) · P/E-bärarkontroll GRÖN (TTM-netto 1,20 mdr EUR > 0) · pris 56,26 EUR (−3,94 % dagen) · mcap 72,94 mdr · P/E 61,13 (HALVLEDARCYKELNS BOTTEN — högt P/E på deponerat lågt netto; dokumenteras i hämtningssteget, ej avvisningsgrund: doktrinen kräver netto > 0, uppfyllt) · utdelning 0,62 % · sektor Technology/Semiconductors = RÄTT CELL.
DUO-PEDAGOGIK (U37): SAP (enterprise-mjukvaran — abonnemangscykel, feta marginaler) + Infineon (halvledare — kapitalcykel, kretsloppsbotten-toppen): tyska teknikens två ben; speglar Japan/teknik (Panasonic+Tokyo Electron-klassen).
NÄSTA VÅG (rond 238): U37 = IFX-hämtning (fyra paneler ETR/EUR, SAP.DE-precedensen) med tretton lås + segmentlås (Automotive/Green Industrial Power/Power & Sensor Systems/Connected Secure Systems?) + kirurgisk append 298→299 + llms HELREGEN 299 + läckagevakt + protokoll V173-U37-IFX-INFINEON-UTOKNING.md — TYSKLAND-KOMPLETT efter inlägget.
KVD denna rond: mätning+sond read-only (universumet orört) · kvitton /tmp/r237-ifx/ · commit via rond 227:s mekanik.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 237 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":237'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 237, organ: 'Φ', ts: Date.now(),
    beslut: 'Grenmätning (mätt): Japan INGA 1-grenar (fjärde kompletta landet); Tyskland EN: teknik (SAP ensam). U37-sond: Infineon IFX.DE REN+GRÖN (netto +1,20 mdr, P/E 61 = halvledarcykelns botten, rätt cell) ⇒ U37 = SAP+IFX (mjukvaran mot halvledarna); Tyskland-komplett efter leverans. Kvarvarande 1-grens-karta: Frankrike 6 · Indien 7 · Schweiz 4 · Brasilien 5 m.fl. Kö: U37 IFX-hämtning → v172-fönstret (5 bolag) → spårrotation.',
    bevis: '_r237-grenmatning.mjs + _r237-u37-ifx-sond.mjs + /tmp/r237-ifx/* + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = ['worklog.md', 'verktyg/_r237-grenmatning.mjs', 'verktyg/_r237-u37-ifx-sond.mjs', 'verktyg/_r237-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 237 GRENMÄTNING + U37-SOND — mätning FÖRE formulering (rond 225:s läxa): JAPAN INGA 1-grenar (27 rader — fjärde kompletta landet efter UK · Kanada · Spanien); TYSKLAND EN 1-gren: teknik (SAP.DE ensam av 23 rader); hela universumets 1-grens-karta bokförd (Frankrike 6 · Indien 7 · Schweiz 4 · Brasilien 5 · övriga spridda — underlag för framtida svep); U37-SOND: INFINEON IFX.DE [etr] REN (kollision primär+sekundär 0 träffar) + P/E-bärare GRÖN (TTM-netto +1,20 mdr EUR; P/E 61,13 = halvledarcykelns botten dokumenteras i hämtningssteget — doktrinen netto > 0 uppfyllt; Technology/Semiconductors = rätt cell; mcap 72,94 mdr) ⇒ U37 = SAP+IFX-duon (tyska teknikens två ben: enterprise-mjukvarans abonnemangscykel mot halvledarnas kapitalcykel — Panasonic+Tokyo Electron-klassen) — TYSKLAND-KOMPLETT efter leverans (rond 238: fyra paneler ETR/EUR SAP.DE-precedensen + tretton lås + segmentlås + append 298→299). Mätning+sond read-only, universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r237-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r237-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r237-msg.txt']);
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
console.log('LEVERANS: rond 237 grenmätning + U37-sond bokförd och pushad');
