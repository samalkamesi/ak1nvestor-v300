#!/usr/bin/env node
// Rond 229 — U32-SONDENS BOKFÖRING: valuta-precedens + worklog + beslutsminne + commit + push (rond 227:s mekanik).
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

// Valuta-/pris-precedens för radbygget (ur befintliga Kanada-/Spanien-rader)
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const prec = [];
for (const t of ['RY', 'CNQ', 'BCE', 'NTR', 'ITX.MC', 'IBE.MC', 'SAN.MC', 'CLN.MC']) {
  const r = u.find(x => x.ticker === t);
  if (r) prec.push(`${t}: valuta ${r.valuta} · pris ${r.pris}`);
}
kvitto.push(`OK precedens — ${prec.join(' | ')}`);

// Worklog-rond 229
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 229 [organ:Φ] — U32-SOND')) return 'redan bokförd';
  const rad = `

## ROND 229 [organ:Φ] — U32-SOND LEVERERAD: Kanada (energi CNQ+Enbridge · finans RY+TD) och Spanien (finans SAN+BBVA · konsument ITX+? · kommunikation CLN+?) — tre duopartners kollisionsrena OCH P/E-bärare GRÖNA på färsk källa (ENB netto 5,67 mdr · TD 15,6 mdr · BBVA 10,72 mdr); ITX- och Cellnex-partner ouppklarade (Puig? · Telefónica?) — 2026-09-25

CELLSTATUS (mätt ur universumet 293): KANADA 10 rader — energi 1 · finans 1 · industri 2 · kommunikation 3 · material 3 ⇒ 1-grenar: ENERGI, FINANS. SPANIEN 5 rader — energi 2 · finans 1 · kommunikation 1 · konsument 1 ⇒ 1-grenar: FINANS, KONSUMENT, KOMMUNIKATION.
KOLLISIONSKONTROLL (primär+sekundär, AZN-läxan): CNQ/RY/SAN.MC/ITX.MC = redan i universumet (väntat — de bär cellerna); SAN-träffen SAN.PA = Sanofi [Frankrike/hälsa] = ANNAT bolag (dokumenterad icke-kollision); RENA: ENB · TD · BBVA.
P/E-BÄRARKONTROLL (färsk quote-panel 2026-09-25, S&P-data): ENB [tsx] 66,99 CAD · mcap 150,38 mdr · netto +5,67 mdr · P/E 26,05 · utdelning 5,79 % · sektor Energy/Oil & Gas Midstream ⇒ GRÖN. TD [tsx] 168,66 · mcap 277,40 mdr · netto +15,60 mdr · P/E 18,12 · 2,66 % · Financials/Banks ⇒ GRÖN. BBVA [bme] 24,88 · mcap 137,01 mdr · netto +10,72 mdr · P/E 13,15 · 3,70 % · Financials/Banks ⇒ GRÖN.
DUO-PEDAGOGIK (U32-kandidaterna): (1) Kanada/energi: CNQ (upstream-producent: olja/sand — BRUNNEN) + ENB (midstream: rörledningar — RÖRET) = producent/transportören, E.ON/RWE + INPEX/Tokyo Gas-mönstret; (2) Kanada/finans: RY+TD = de två megabankerna (universalbank-duo); (3) Spanien/finans: SAN (global utlåning) + BBVA (Emerging Europe/Latam-exponering) = spanska bankens två riskprofiler. ÖPPNA FRÅGOR (nästa sond): Spanien/konsument duopartner till ITX (Puig Brands PUIG.MC? — mode mot beautylux) + Spanien/kommunikation duopartner till Cellnex (Telefónica TEF.MC? — torn mot operatör) — P/E-bärarkontroller ej gjorda.
NÄSTA VÅG (rond 230): U32 = ENB-hämtning (kötextens första duo; CAD-noting TSX-precedens ${prec.join(' · ')}) med fyra paneler + tretton lås + segmentlås + kirurgisk append 293→294 + llms HELREGEN 294 + läckagevakt + protokoll V173-U32-ENB-ENBRIDGE-UTOKNING.md.
KVD denna rond: sond read-only (universumet orört) · kvitton /tmp/r229-u32/ · commit av sond+bokföring via rond 227:s mekanik.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 229-sond bokförd';
});

// Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":229'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 229, organ: 'Φ', ts: Date.now(),
    beslut: 'U32-sond: Kanada 1-grenar energi+finans; Spanien 1-grenar finans+konsument+kommunikation. Tre duopartners RENA+GRÖNA: ENB (energi-midstream, netto 5,67 mdr), TD (bank, 15,6 mdr), BBVA (bank, 10,72 mdr). Öppet: ITX-partner (Puig?), Cellnex-partner (Telefónica?). Kö: U32 = ENB först (CNQ+ENB producent/rör-duon), sedan TD, BBVA.',
    bevis: '_r229-u32-sond.mjs + /tmp/r229-u32/* + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// Commit + push
const FILER = ['worklog.md', 'verktyg/_r229-u32-sond.mjs', 'verktyg/_r229-u32-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 229 U32-SOND — Kanada+Spanien kartlagda: Kanada 1-grenar energi+finans (10 rader), Spanien 1-grenar finans+konsument+kommunikation (5 rader); tre duopartners kollisionsrena OCH P/E-bärare GRÖNA på färsk källa: ENB (energi/midstream — CNQ-brunnen+ENB-röret, E.ON/RWE-mönstret; netto 5,67 mdr CAD-börs) · TD (finans; netto 15,6 mdr) · BBVA (finans; netto 10,72 mdr); SAN.PA-träffen = Sanofi (annat bolag, dokumenterad); öppna frågor bokförda: ITX-partner (Puig?) + Cellnex-partner (Telefónica?) ej P/E-sonderade; valuta-precedens för radbygget dokumenterad. U32 = ENB-hämtning nästa våg. Sond read-only, universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r229-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r229-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r229-msg.txt']);
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
console.log('LEVERANS: rond 229 U32-sond bokförd och pushad');
