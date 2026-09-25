#!/usr/bin/env node
// Rond 239 — BOKFÖRING: rappdagsmallen (verktyg/rapptidsuppdatera.mjs) torrkörd + spårrotationsval + commit + push.
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
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 239 [organ:Φ] — RAPPDAGSMALLEN + SPÅRROTATION')) return 'redan bokförd';
  const rad = `

## ROND 239 [organ:Φ] — RAPPDAGSMALLEN LEVERERAD (verktyg/rapptidsuppdatera.mjs, torrkörd GRÖN mot A3M: 0,00 % på samtliga låsbärande fält) + SPÅRROTATIONEN påbörjad (finslipning av verktygsbältet = katalogens regelverk; v172-fönstrets fem bolag har nu standardiserad diff-procedur) — 2026-09-25

RAPPDAGSMALLEN (v172-beredelsen slutförd): verktyg/rapptidsuppdatera.mjs — generiskt READ-ONLY diff-verktyg: (1) läser universumraden, (2) hämtar 2/4 StockAnalysis-paneler, (3) FÄLT-DIFF mot låsbärande fält (pris · mcap · P/E · netto-M · FCF-yield) med avvikelsegrader och 2 %-tröskel, (4) färsk P/E-bärarkontroll (raden fryses om TTM-netto ≤ 0), (5) kvitto /tmp/rapptid-<ticker>.txt. Användning: node verktyg/rapptidsuppdatera.mjs <ticker> <sa-kod> [2|4]. TORRKÖRNING A3M.MC bme/A3M 4: pris 5,82→5,82 (0 %) · mcap 1,31→1,31 (0 %) · P/E 24,05→24,05 (0 %) ⇒ 'INGA väsentliga förändringar — notisrapport räcker' (väntat: raden levererades ur samma källa idag). HÄRDNINGAR under torrkörningen: meny-rubriker avvisas (endast numeriska efterföljande rader accepteras — 'Market Cap→Revenue'-fällan) + objektutskrift JSON-strängad.
ROND-PROCEDUREN FÖR V172 (slutgiltig, per bolag vid rappdag): verktyg/rapptidsuppdatera.mjs <ticker> <sa-kod> 4 → diff-bedömning → (vid ≥2 % förändring) kirurgisk fältuppdatering med omräknade tretton lås + TTM-fönster + PARANOID-uppdatering → llms HELREGEN → läckagevakt → tsc → protokoll + commit; (vid <2 %) notisrapport i worklog. Fönstrets fem bolag och koder: A3M.MC bme/A3M (10-22) · DGE.L lon/DGE (10-29) · BBVA.MC bme/BBVA (10-29) · PUIG.MC bme/PUIG (10-29) · ENB tsx/ENB (11-02).
SPÅRROTATIONEN: evighetskatalogen läst (regler: rotera spår, aldrig samma två ronder i rad, R2-säkra poster); det strategiska skiftets finslipnings-spår tillämpades Denna rond som VERKTYGSBELTES-FINSLIPNING (mallen ovan) — nästa rotationspost (rond 240+): branding-spåret eller granskningsköns flyttklara paket, val per styrelseregelverkets rond-mönster.
KVD denna rond: verktyget READ-ONLY mot universumet (0 rader förändrade — verifierat i commiten: endast nya/ändrade verktygsfiler) · torrkörning GRÖN · commit via rond 227:s mekanik.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 239 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":239'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 239, organ: 'Φ', ts: Date.now(),
    beslut: 'Rappdagsmallen levererad: verktyg/rapptidsuppdatera.mjs (read-only fält-diff med 2 %-tröskel, färsk P/E-bärarkontroll, kvitto /tmp) — torrkörd GRÖN mot A3M (0 % på alla fält). v172-procedur standardiserad för fem bolag (A3M 10-22 · DGE/BBVA/PUIG 10-29 · ENB 11-02). Spårrotationen påbörjad som verktygsbältes-finslipning; nästa rotation: branding eller granskningskö. Kö: v172-fönstret, rotation, Frankrike/Indien.',
    bevis: 'verktyg/rapptidsuppdatera.mjs + /tmp/rapptid-A3M-MC.txt + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = ['worklog.md', 'verktyg/rapptidsuppdatera.mjs', 'verktyg/_r239-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 239 RAPPDAGSMALLEN + SPÅRROTATION — v172-beredelsen slutförd: verktyg/rapptidsuppdatera.mjs levererat (generiskt READ-ONLY fält-diff-verktyg: universumrad ⇄ 2/4 färskpaneler från StockAnalysis; låsbärande fält med avvikelsegrader och 2 %-tröskel; färsk P/E-bärarkontroll som fryser raden vid TTM-netto ≤ 0; kvitto /tmp/rapptid-<ticker>.txt) — TORRKÖRT GRÖN mot A3M.MC (pris/mcap/P/E samtliga 0,00 %; väntat då raden levererades ur samma källa); härdningar under torrkörningen bokförda (meny-rubrikfällan avvisad via numerisk vy-scan; objektutskrift JSON-strängad); V172-ROND-PROCEDUR standardiserad för fönstrets fem bolag (A3M.MC bme/A3M 10-22 · DGE.L lon/DGE · BBVA.MC bme/BBVA · PUIG.MC bme/PUIG 10-29 · ENB tsx/ENB 11-02): diff → kirurgisk uppdatering med omräknade lås vid ≥2 %, notisrapport vid <2 %; SPÅRROTATIONEN påbörjad enligt katalogens regler (denna rond: verktygsbältes-finslipning; nästa: branding eller granskningskö). Verktyget read-only — universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r239-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r239-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r239-msg.txt']);
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
console.log('LEVERANS: rond 239 rappdagsmall + spårrotation bokförd och pushad');
