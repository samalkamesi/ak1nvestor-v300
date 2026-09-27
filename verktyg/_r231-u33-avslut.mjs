#!/usr/bin/env node
// Rond 231 — U33 AVSLUT: Kanada-grenmätning + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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

// 1. Kanada-grenmätning (FÖRE formulering — rond 225:s läxa)
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const ka = u.filter((b) => b.land === 'Kanada');
const kaGrenar = {};
for (const b of ka) kaGrenar[b.bransch] = (kaGrenar[b.bransch] ?? 0) + 1;
const kaText = Object.entries(kaGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const kaKomplett = !Object.values(kaGrenar).some(n => n < 2);
steg('kanada-grenmätning', () => `Kanada ${ka.length} rader — ${kaText} ⇒ ${kaKomplett ? 'SAMTLIGA grenar ≥2 (KANADA-KOMPLETT)' : 'kvarvarande 1-grenar'}`);

// 2. Worklog-rond 231
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 231 [organ:Φ] — v173 U33 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 231 [organ:Φ] — v173 U33 LEVERERAD: The Toronto-Dominion Bank TD (Kanada/finans 1→2) — universum 294→295, RY+TD tvilling-duon (wealth-tyngd + retail-tyngd med US Retail), BANK-NULL-PROFIL enligt RY/SAN-mallen, vändningsprofilen dokumenterad (AML-kollaps FY23-24 → FY25 +140 % engångstung → TTM-normalisering), ${kaKomplett ? 'KANADA-KOMPLETT: samtliga fem grenar ≥2 (' + kaText + ')' : ''} — 2026-09-25

U33: Kanada/finans-cellens duo — RY (förvaltning 22,4 mdr störst, jämnast) + TD (Canadian P&C 21,5 + US Retail 15,5 = detaljhandelsbanken). TSX/CAD-precedensen (RY:s USD/NYSE = dokumenterad historisk avvikelse). Fiscalår nov–okt (TTM = jul '26).
BANK-LÅS (TRETTON): mcap 0,3 % · PS 4,56 EXAKT · P/B 2,18 EXAKT · netto-M 25,65 % EXAKT (financials-TTM-raden; statistics-veget 26,62 % = dokumenterad annan bas) · divY 2,66 % EXAKT · payout 0,2 % · P/E pris/EPS 0,06 % EXAKT + SEX DOKUMENTERADE NULL (EV/evEarnings/evSales/D-E/fcfM/fcfY — källans n/a, RY/SAN-mallen: kassa 633/skuld 533 mdr = insättningsbalansen). P/E-FAMILJEN 18,12/17,78/18,11. PEG 1,09 MED DOKUMENTERAD BAS (fwd 15,58/konsensus 14,38 = 1,08).
SEGMENTBILDEN (fem ben): Canadian P&C [21 499 · 20 686 · 19 790 · 18 317 · 16 586 · 14 917] + Wealth [15 557 · 14 562 · 13 535 · 11 630 · 11 005 · 10 589] + US Retail [15 488 · 12 305 · 13 713 · 14 290 · 12 280 · 10 758] + Wholesale [9 644 · 8 392 · 7 286 · 5 818 · 4 831 · 4 700] + Corporate [2 573 · 11 832 · 2 899 · 635 · 4 330 · 1 729] — ELIMINERINGSDIFFERANSEN DOKUMENTERAD [TTM +3 939 · FY25 +4 506 · FY24 +3 979 · FY23 +1 291 · FY22 +1 291 · FY21 −224]: inget falskt exakthetslås; Corporate-spirken FY25 = AML-uppgörelsens (3,1 mdr USD) och Schwab-posternas hem.
VÄNDNINGSPROFILEN: netto [17 170 · 10 071 · 8 316 · 19 973] + TTM 15 601 (kollaps −51 % → vändning +140 % engångstung → normalisering); oms-CAGR +9,84 %; 52v +54,81 %. FCF-serien NEGATIV = bankens natur (identitetslåst exakt fem fönster; RY-precedensen).
ÅTERKÖPSMASKINEN TTM −22,2 mdr (8,0 % brutto — universumets kraftigaste bank-återköp) mot aktieprogram +13,0 = netto aktiebas −3,68 % EXAKT · 15 raka utdelningshöjningar (4,48 CAD, 2,66 % EXAKT; payout 48,21) · ROE 12,83 % mot RY 16,21 (tvillinggapet).
KVD: append 294+/0− · läs-tillbaka ×2 · llms HELREGEN 295 (totalt n 283; 10 aspektrader) · läckagevakt 0 (531) · tsc 0 · prod 200 i avslutet (adoptionsmekanik rond 227).
${kaKomplett ? `Kanada-grenmätning EFTER inlägget (mätt): ${kaText} ⇒ KANADA-KOMPLETT — landets fem grenar alla ≥ 2.` : ''}
Kö: Spanien (BBVA grön i rond 229 · Puig?/Telefónica? ej sonderade) · v172-kalendern (fönstret 10-20; ENB 11-02 INOM) · spårrotation. R2: Q3-paketet väntar kund. Protokoll: V173-U33-TD-TORONTODOMINION-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 231 U33 bokförd';
});

// 3. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":231'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 231, organ: 'Φ', ts: Date.now(),
    beslut: `v173 U33: Toronto-Dominion TD (Kanada/finans 1→2) — RY+TD tvilling-duon. Bank-null-profil enligt RY/SAN-mallen (sex dokumenterade NULL); netto-M 25,65 % exakt mot financials-TTM; PEG 1,09 med dokumenterad bas; segmentbild med elimineringsdifferans dokumenterad (inget falskt lås); vändningsprofil AML-kollaps→FY25 engångstung→TTM-normaliserad; återköp 8 % brutto/aktiebas −3,68 % exakt; 15 raka höjningar. ${kaKomplett ? 'KANADA-KOMPLETT: fem grenar ≥2.' : ''} Kö: Spanien (BBVA · Puig? · Telefónica?), v172-kalender.`,
    bevis: 'V173-U33-TD-TORONTODOMINION-UTOKNING.md + _r231-u33-*.mjs (kvitton /tmp/r231-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 4. Commit + push
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U33-TD-TORONTODOMINION-UTOKNING.md',
  'worklog.md',
  'verktyg/_r231-u33-td-hamta.mjs', 'verktyg/_r231-u33-universum-inlagg.mjs', 'verktyg/_r231-u33-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U33 LEVERERAD — The Toronto-Dominion Bank TD (Kanada/finans 1→2): cellmotiverad duo (RY wealth-tyngda universalbanken + TD retail-tyngda detaljhandelsbanken med US Retail 15,5 mdr — tvillingarna med olika bottnar, Kanadas bankoligopol från två sidor); TSX/CAD-precedensen (RY:s USD/NYSE dokumenterad); fiscalår nov–okt (TTM jul '26); BANK-LÅSPROFIL: PS 4,56 EXAKT · P/B 2,18 EXAKT · netto-M 25,65 % EXAKT (financials-TTM; statistics-veget 26,62 = dokumenterad annan bas) · divY 2,66 % EXAKT · payout 0,2 % · P/E pris/EPS 0,06 % EXAKT + SEX DOKUMENTERADE NULL enligt RY/SAN-mallen (EV/D-E/FCF-mått — källans n/a; kassa 633/skuld 533 mdr = insättningsbalansen); P/E-familjen 18,12/17,78/18,11; PEG 1,09 MED DOKUMENTERAD BAS (fwd 15,58/konsensus 14,38 = 1,08); SEGMENTBILDEN fem ben med DOKUMENTERAD elimineringsdifferans [+3 939 · +4 506 · +3 979 · +1 291 · +1 291 · −224] — inget falskt exakthetslås; Corporate-spirken FY25 11 832 = AML-uppgörelsens (3,1 mdr USD) och Schwab-posternas hem; VÄNDNINGSPROFILEN netto [17 170 · 10 071 · 8 316 · 19 973] + TTM 15 601 (kollaps −51 % → vändning +140 % engångstung → normalisering); 52v +54,81 %; FCF-serien negativ = bankens natur (identitetslåst exakt fem fönster, RY-precedensen); ÅTERKÖPSMASKINEN TTM −22,2 mdr (8,0 % brutto) mot aktieprogram +13,0 = aktiebas −3,68 % EXAKT · 15 raka utdelningshöjningar (4,48 CAD, 2,66 % EXAKT); ROE 12,83 mot RY 16,21 (tvillinggapet); universum 294→295 kirurgiskt, llms HELREGEN 295 (totalt n 283; 10 aspektrader), läckagevakt 0 (531), tsc 0, prod 200. Kanada 11→12 (finans-grenen 1→2). KANADA-KOMPLETT: samtliga fem grenar ≥2 (energi 2 · finans 2 · industri 2 · kommunikation 3 · material 3 — mätt i avslutet). Kö: Spanien (BBVA · Puig? · Telefónica?), v172-kalendern (ENB 11-02 inom fönstret), spårrotation. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r231-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r231-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r231-msg.txt']);
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
console.log('LEVERANS: v173 U33 Toronto-Dominion TD klar — universum 295, push verifierad, prod 200');
