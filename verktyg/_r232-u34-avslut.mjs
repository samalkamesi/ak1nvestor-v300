#!/usr/bin/env node
// Rond 232 — U34 AVSLUT: Spanien-grenmätning + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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

// 1. Spanien-grenmätning (FÖRE formulering — rond 225:s läxa)
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const es = u.filter((b) => b.land === 'Spanien');
const esGrenar = {};
for (const b of es) esGrenar[b.bransch] = (esGrenar[b.bransch] ?? 0) + 1;
const esText = Object.entries(esGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const esEn = Object.entries(esGrenar).filter(([, n]) => n < 2).map(([k]) => k);
steg('spanien-grenmätning', () => `Spanien ${es.length} rader — ${esText} ⇒ ${esEn.length ? 'kvarvarande 1-grenar: ' + esEn.join(', ') : 'SAMTLIGA grenar ≥2'}`);

// 2. Worklog-rond 232
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 232 [organ:Φ] — v173 U34 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 232 [organ:Φ] — v173 U34 LEVERERAD: Banco Bilbao Vizcaya Argentaria BBVA.MC (Spanien/finans 1→2) — universum 295→296, SAN+BBVA-duon (den breda globala mot den djupa Mexico-fokuserade), SEX RAKA VINSTÅR (netto 4 294→10 718, CAGR +18,75 %), rappdag 2026-10-29 BEKRÄFTAD INOM v172-fönstret — 2026-09-25

U34: Spanien/finans-cellens duo — Santander (global utlåning, fem kontinenter) + BBVA (Mexico största marknad sedan FY22 — i praktiken en mexikansk bank med spansk bas + Turkiet/Sydamerika): spanska bankens två riskprofiler. BME/EUR-precedensen (SAN.MC-klassen).
BANK-LÅS (TRETTON): mcap 0,06 % · PS 4,01 EXAKT · P/B 0,1 % · netto-M 31,40 % EXAKT (financials-TTM; statistics-veget 32,56 % = dokumenterad annan bas) · FCF-M 97,16 % EXAKT · FCF-yield 24,21 % (0,06 %) · divY 3,70 % EXAKT · payout 4,1 % (dokum. tolerans: kälrbas okänd) · P/E pris/EPS 0,1 % + FYRA DOKUMENTERADE NULL (EV/evEarnings/evSales/D-E — källans n/a, RY/SAN/TD-mallen). P/E-FAMILJEN 13,15/12,78/13,16. PEG NULL (basblandning: källans 0,80 ⇒ 14,3 % mot konsensus 12,9; fwd-replik 0,88; trailing 1,02 — tre basar ingen ren).
GEOGRAFIBILDEN (gross income): Spain [10 136 · 10 027 · 9 443 · 7 888 · 6 112 · 5 890] + MEXICO [16 415 · 15 198 · 15 337 · 14 267 · 10 734 · 7 603] (störst sedan FY22) + Turkey [6 176 · 5 213 · 4 212 · 2 981 · 3 172 · 3 422] (fördubblad sedan FY23 — hyperinflationsredovisning) + South America [5 968 · 5 363 · 5 405 · 4 331 · 4 265 · 3 162] + Rest [2 169 · 1 807 · 1 472 · 1 103 · 790 · 776] + CorpCenter [−809 · −678 · −388 · −1 029 · −329 · +212] — BEGREPPSDIFFERANS mot revenue dokumenterad [+5 920 · +5 282 · +3 924 · +2 408 · +1 769 · +2 465] (SAGE-U29:s geolås gick på revenue-segment; BBVA:s källa erbjuder ej det — inget falskt exakthetslås).
SEX RAKA VINSTÅR: netto [4 294 · 6 045 · 7 675 · 9 666 · 10 114] + TTM 10 718 · EPS [0,67→1,76] + TTM 1,89 · oms [18 600→31 648] + TTM 34 135 (CAGR +11,26 %) · ROE 18,92 % (duons högsta; universumets bank-elit). FCF-serien VILD men IDENTITETSLÅST sex fönster: [−1 638 · +21 906 · −1 850 · −19 385 · +14 141] + TTM +33 164 (bank-FCF = lånebokens bokningar, dokumenterat).
UTDELNING + ÅTERKÖP: DPS mer än fördubblad [0,31 · 0,43 · 0,55 · 0,70 · 0,92] (+31,4 % senaste; current 0,92 EUR, 3,70 % EXAKT) · återköpsspike TTM −5 191 mot [−1 022 · −2 983 · −2 166 · −1 529 · −1 995] (aktiebas −1,55 % EXAKT; shareholder yield 5,25 %) · NETTOVÄNDNINGEN till skuld FY24 (netto +20,4 → −5,4 → nu −15,4 — emerging-tillväxten finansieras).
KVD: append 295+/0− · läs-tillbaka ×2 · llms HELREGEN 296 (totalt n 284; 10 aspektrader) · läckagevakt 0 (533) · tsc 0 · prod 200 i avslutet (adoptionsmekanik rond 227).
Spanien-grenmätning EFTER inlägget (mätt): ${esText} ⇒ ${esEn.length ? 'kvarvarande 1-grenar: ' + esEn.join(', ') : 'SAMTLIGA grenar ≥2'}.
Kö: Spanien kvarvarande 1-grenar (konsument ITX+Puig? · kommunikation CLN+Telefónica? — P/E-sonder krävs) · v172-KALENDERN: tre bolag INOM fönstret 10-20→11-04 (DGE 10-29 · BBVA 10-29 · ENB 11-02; PSON 10-12 före) · spårrotation. R2: Q3-paketet väntar kund. Protokoll: V173-U34-BBVA-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 232 U34 bokförd';
});

// 3. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":232'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 232, organ: 'Φ', ts: Date.now(),
    beslut: 'v173 U34: BBVA.MC (Spanien/finans 1→2) — SAN den breda + BBVA den djupa (Mexico störst sedan FY22). Sex raka vinstår netto 4 294→10 718 (CAGR +18,75 %); ROE 18,92 % duons högsta; bank-låsprofil med FCF-mått (källans praxis): FCF-M 97,16 % EXAKT; geografibild med dokumenterad begreppsdifferans mot revenue; DPS mer än fördobblad; återköpsspike TTM −5,2 mdr; nettovändning till skuld FY24. Rappdag 10-29 INOM v172-fönstret. Kö: Spanien Puig?/Telefónica? (P/E-sonder), v172-kalendern (DGE+BBVA 10-29 · ENB 11-02).',
    bevis: 'V173-U34-BBVA-UTOKNING.md + _r232-u34-*.mjs (kvitton /tmp/r232-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 4. Commit + push
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U34-BBVA-UTOKNING.md',
  'worklog.md',
  'verktyg/_r232-u34-bbva-hamta.mjs', 'verktyg/_r232-u34-universum-inlagg.mjs', 'verktyg/_r232-u34-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U34 LEVERERAD — Banco Bilbao Vizcaya Argentaria BBVA.MC (Spanien/finans 1→2): cellmotiverad duo (Santander global utlåning/fem kontinenter — den breda + BBVA Mexico-fokuserad emerging-bank/Turkiet — den djupa; spanska bankens två riskprofiler); BME/EUR-precedensen (SAN.MC-klassen); BANK-LÅSPROFIL: nio aktiva (fem EXAKTA: PS 4,01 · netto-M 31,40 financials-TTM · FCF-M 97,16 · FCF-yield 24,21 · divY 3,70) + FYRA DOKUMENTERADE NULL enligt RY/SAN/TD-mallen — källan redovisar FCF-mått (annan bokningspraxis än TD/RY, dokumenterat); P/E-familjen 13,15/12,78/13,16; PEG NULL (basblandning — tre basar ingen ren); GEOGRAFIBILDEN gross income med BEGREPPSDIFFERANS mot revenue dokumenterad [+5 920 · +5 282 · +3 924 · +2 408 · +1 769 · +2 465] (inget falskt lås): MEXICO största marknad sedan FY22 [16 415 · 15 198 · 15 337 · 14 267 · 10 734 · 7 603]; SEX RAKA VINSTÅR netto [4 294 · 6 045 · 7 675 · 9 666 · 10 114] + TTM 10 718 (CAGR +18,75 %); ROE 18,92 % duons högsta; FCF-serien vild men identitetslåst sex fönster; DPS mer än fördubblad [0,31→0,92] (+31,4 %); återköpsspike TTM −5 191 (aktiebas −1,55 % EXAKT); NETTOVÄNDNING till skuld FY24 (+20,4→−5,4→−15,4 dokumenterad); 52v +53,82 %; RAPPDAG 2026-10-29 BEKRÄFTAD INOM v172-fönstret (samma dag som DGE); universum 295→296 kirurgiskt, llms HELREGEN 296 (totalt n 284; 10 aspektrader), läckagevakt 0 (533), tsc 0, prod 200. Spanien 5→6 (finans-grenen 1→2; kvarvarande 1-grenar: konsument, kommunikation — mätt). Kö: Puig?/Telefónica?-sonder, v172-kalendern (DGE+BBVA 10-29 · ENB 11-02 inom fönstret). Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r232-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r232-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r232-msg.txt']);
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
console.log('LEVERANS: v173 U34 BBVA klar — universum 296, push verifierad, prod 200');
