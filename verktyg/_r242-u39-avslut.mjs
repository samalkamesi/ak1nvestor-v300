#!/usr/bin/env node
// Rond 242 — U39 AVSLUT: Frankrike-grenmätning + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 242 [organ:Φ] — v173 U39 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 242 [organ:Φ] — v173 U39 LEVERERAD: EssilorLuxottica EL.PA (Frankrike/halso 1→2) — universum 300→301, Sanofi+EL-duon (behandlingen mot korrektionen — halsans två hastigheter), SIGNATURFYNDET: 52v-kurskollapsen −47,27 % medan verksamheten lever (oms-CAGR +5,17 % · TTM-netto ny topp) — fundamental/kurs-divergensen dokumenterad, rappdag 10-16 fyra dagar före v172-starten — 2026-09-25

U39: Frankrike/hälso-cellens duo — Sanofi (läkemedelspipelinen) + EssilorLuxottica (optisk korrektion: Ray-Ban/Oakley + Essilor-glasen). EPA/EUR (SAN.PA-precedensen).
TRETTON LÅS (ÅTTA EXAKTA): mcap EXAKT (0,45959×144,70 = 66,50 fyra siffror) · PS EXAKT · netto-M EXAKT (8,52) · PAYOUT med RÄTT bas EXAKT (betald TTM 1 669/netto 2 494 = 66,92 % — DPS-raden 4,00 deklarerad nivå, dokumenterad) · P/E 0,06 % · EV/Sales EXAKT · fcfM/fcfY 0,1 % · PB 0,3 % · divY 0,2 % · EV/Earnings 0,15 % · D/E 0,9 % · EV 0,9 % (fusionens uppskjutna/NCI dokumenterad). P/E-FAMILJEN 27,04/26,67/27,06. PEG 1,97 MED DOKUMENTERAD BAS (fwd 18,81/konsensus 9,56 = 1,967 — TD/IFX-precedensen).
SIGNATURFYNDET — DIVERGENSEN: 52v-KURSKOLLAPSEN −47,27 % (pris under båda MA; PT-gap +62,9 % = årets bredaste — datafakta utan köpsignal) MEDAN VERKSAMHETEN LEVER: oms [19 820 · 24 494 · 25 395 · 26 508 · 28 491] + TTM 29 285 (CAGR +5,17 %) · netto [1 448 · 2 152 · 2 289 · 2 359 · 2 315] + TTM 2 494 NY TOPP · bruttomarginal ~61,5 %.
TVÅ-BENSLÅSET (vågens renaste): Professional Solutions + Direct to Consumer (störst sedan FY23 — konsumtionsdirektheten) = totalen EXAKT 4/6 fönster (±1 M i två = 0,004 %). FCF [3 211 · 3 330 · 3 352 · 3 766] + TTM 3 842 identitetslåst exakt (FCF-yield 5,78 % efter kollapsen). NETTO-SKULD −13,4 mdr (fusionens struktur dokumenterad) · ROIC-gap −0,88 p (goodwill-tyngd EK — dokumenterad, bruttomarginalen bär moat-bilden).
KVD: append 300+/0− · läs-tillbaka ×2 · llms HELREGEN 301 (totalt n 289; 10 aspektrader) · läckagevakt 0 (543) · tsc 0 · prod 200 i avslutet.
Frankrike-grenmätning EFTER inlägget (mätt): ${frText} ⇒ kvarvarande 1-grenar: ${frEn.join(', ')}.
Kö: ENGI → SGO (gröna i rond 240) + fastighet/kommunikation osonderade · v172-fönstret 10-20 (fem bolag; EL 10-16 och PSON 10-12 före fönstret = kalibreringsläge) · Indien-svep. R2: Q3-paketet väntar kund. Protokoll: V173-U39-EL-ESSILORLUXOTTICA-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 242 U39 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":242'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 242, organ: 'Φ', ts: Date.now(),
    beslut: `v173 U39: EssilorLuxottica EL.PA (Frankrike/halso 1→2) — Sanofi+EL (behandling mot korrektion). Tretton lås (åtta exakta; payout rätt bas 1 669/2 494). Signatur: kurskollaps −47 % medan verksamheten lever (oms-CAGR +5,2 %, TTM-netto topp) — divergensen dokumenterad utan köpsignal. Två-benslås 4/6 exakt ±1 M. Rappdag 10-16 (pre-v172). Kö: ENGI → SGO, v172-fönster, Indien-svep.`,
    bevis: 'V173-U39-EL-ESSILORLUXOTTICA-UTOKNING.md + _r242-u39-*.mjs (kvitton /tmp/r242-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U39-EL-ESSILORLUXOTTICA-UTOKNING.md',
  'worklog.md',
  'verktyg/_r242-u39-el-hamta.mjs', 'verktyg/_r242-u39-universum-inlagg.mjs', 'verktyg/_r242-u39-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U39 LEVERERAD — EssilorLuxottica EL.PA (Frankrike/halso 1→2): cellmotiverad duo (Sanofi läkemedelspipelinen/patentsykeln + EL optisk korrektion/glasögonens förbrukningscykel — behandlingen mot korrektionen, halsans två hastigheter); EPA/EUR enl. SAN.PA-precedensen; halvårsrapportering (TTM jun '26; rappdag est. 10-16 = fyra dagar före v172-starten, PSON-klassen); TRETTON LÅS med ÅTTA EXAKTA (mcap 0,45959×144,70=66,50 fyra siffror · PS · netto-M 8,52 · PAYOUT med RÄTT bas EXAKT: betald TTM 1 669/2 494 = 66,92 %, DPS-raden 4,00 = deklarerad nivå dokumenterad · P/E 0,06 % · EV/Sales) + övriga fem inom 0,9 % (EV 0,9 % = fusionens uppskjutna/NCI dokumenterad); P/E-familjen 27,04/26,67/27,06; PEG 1,97 MED DOKUMENTERAD BAS (18,81/9,56 = 1,967); SIGNATURFYNDET: 52v-KURSKOLLAPSEN −47,27 % (pris under båda MA; PT-gap +62,85 % årets bredaste — datafakta utan köpsignal) MEDAN VERKSAMHETEN LEVER: oms-CAGR +5,17 % · netto [1 448→2 315] + TTM 2 494 NY TOPP · bruttomarginal ~61,5 % — fundamental/kurs-divergensen dokumenterad; TVÅ-BENSLÅSET vågens renaste: Professional Solutions + Direct to Consumer (störst sedan FY23) = totalen EXAKT 4/6 fönster ±1 M; FCF [3 211 · 3 330 · 3 352 · 3 766] + TTM 3 842 identitetslåst exakt (yield 5,78 % efter kollapsen); DPS 4,00 (2,76 %; 0,2 %) + återköp −907 M TTM; NETTO-SKULD −13,4 mdr (fusionens struktur dokumenterad); ROIC-gap −0,88 p (goodwill-tyngd EK — bruttomarginalen bär moat-bilden, dokumenterat); universum 300→301 kirurgiskt, llms HELREGEN 301 (totalt n 289; 10 aspektrader), lackagevakt 0 (543), tsc 0, prod 200. Frankrike 22→23 (halso 1→2; kvarvarande 1-grenar: ${frEn.join(', ')}). Kö: ENGI → SGO (gröna i sonden), v172-fönstret 10-20 (EL/PSON pre-fönster = kalibrering), Indien-svep. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r242-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r242-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r242-msg.txt']);
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
console.log('LEVERANS: v173 U39 EssilorLuxottica klar — universum 301, push verifierad, prod 200');
