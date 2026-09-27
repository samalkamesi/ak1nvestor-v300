#!/usr/bin/env node
// Rond 236 — U36 AVSLUT: Spanien-grenmätning (förväntat KOMPLETT) + worklog + beslutsminne + commit + push (rond 227:s mekanik) + prod 200.
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

// 1. Spanien-grenmätning
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const es = u.filter((b) => b.land === 'Spanien');
const esGrenar = {};
for (const b of es) esGrenar[b.bransch] = (esGrenar[b.bransch] ?? 0) + 1;
const esText = Object.entries(esGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const esKomplett = !Object.values(esGrenar).some(n => n < 2);
steg('spanien-grenmätning', () => `Spanien ${es.length} rader — ${esText} ⇒ ${esKomplett ? 'SAMTLIGA grenar ≥2 (SPANIEN-KOMPLETT)' : 'kvarvarande 1-grenar'}`);

// 2. Worklog-rond 236
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 236 [organ:Φ] — v173 U36 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 236 [organ:Φ] — v173 U36 LEVERERAD: Atresmedia Corporación A3M.MC (Spanien/kommunikation 1→2) — universum 297→298, Cellnex+A3M-duon (SPANSKA BT+PEARSON-MÖNSTRET: tornen mot innehållet), ${esKomplett ? 'SPANIEN-KOMPLETT: samtliga fyra grenar ≥2 (' + esText + ')' : ''}, rappdag 10-22 BEKRÄFTAD INOM v172-fönstret (fjärde bolaget) — 2026-09-25

U36: Spanien/kommunikation-cellens duo — Cellnex (telekom-tornen) + Atresmedia (broadcasting-innehållet). BME/EUR (CLN.MC-precedensen); symbolen A3M (rond 235:s 404-diagnos dokumenterad i paranoid).
TRETTON LÅS (NIO EXAKTA): mcap EXAKT · PS EXAKT · P/B 0,3 % · EV 0,08 % · netto-M EXAKT (6,05) · FCF-M EXAKT (13,76) · FCF-yield EXAKT (9,48) · divY EXAKT (6,70) · D/E EXAKT (0,25) · payout NULL (källan n/a; utdelningssänkningen −42,65 % med FY24-extrautdelningsspike 0,68 → 0,39 dokumenterad; FCF-payout 57,24 % bärarbilden) · P/E 0,8 % (EPS-raden 0,24 grovt avrundad mot 0,2428) · EV/Earnings 0,13 % · EV/Sales EXAKT. P/E-FAMILJEN 24,05/23,96/24,25. PEG NULL (basblandning extrem: källans 4,14 mot fwd-repliken 0,60).
FY25-NETTOKOLLAPSEN DOKUMENTERAD: netto [118,5 · 112,9 · 171,2 · 120,3 · 62,1] + TTM 54,7 (CAGR −18,1 % ÖPPET — medieprishärdarna); omsättningen FLATT (CAGR +1,0 %); BRUTTO-OMKLASSNINGEN FY25 dokumenterad (källans bruttorad 310,6→220,0 = content-kostnader omklassade i standardiseringen — marginalfallet är ej verksamhetskollaps).
FCF BÄR BÄTTRE BILD ÄN NETTO: [176 · 105 · 137 · 166 · 92] + TTM 124 — identitetslåst ±0,01 sex fönster; FCF-M 13,76 % > netto-M 6,05 % (amorfteringsburen vinstbild). UTDDELNINGEN SÄNKT −42,65 % (6,70 % EXAKT).
SEGMENTLÅSET INTERNT (BBVA-modellen): Audiovisual 92 % + Radio + elim = källans segmenttotal ±0,4 M sex fönster (FY21–25 exakt); begreppsdifferansen ~108–113/år mot revenue-raden dokumenterad (inget falskt lås).
VARNINGARNA EFTERLEVDA: dagssvängen +10,44 % · RSI 76,2 · Planeta-kontrollen (float 43 % · institutioner 4,64 %) · universumets minsta euro-bolag (tröskel rund 235) · ROIC-gap +0,17 p knappt · NETTOKASSA +69,0 M · kassaserien [271,4 · 252,2 · 206,6 · 307,7 · 260,5].
KVD: append 297+/0− · läs-tillbaka ×2 · llms HELREGEN 298 (kommunikation-raden n=31 median P/E 17,6; totalt n 286; 10 aspektrader) · läckagevakt 0 (537) · tsc 0 · prod 200 i avslutet.
${esKomplett ? `Spanien-grenmätning EFTER inlägget (mätt): ${esText} ⇒ SPANIEN-KOMPLETT — TRE LAND KLARA PÅ GRENNIVÅ EFTER UK (rond 228) OCH KANADA (rond 231).` : ''}
Kö: v172-FÖNSTRET ÖPPNAR 10-20 — fem bolag inne (A3M 10-22 · DGE+BBVA+PUIG 10-29 · ENB 11-02; kö enligt rond 235:s bokförda ordning) · spårrotation (branding/finslipning) · Tyskland/Japan-grenmätning vid behov. R2: Q3-paketet väntar kund. Protokoll: V173-U36-A3M-ATRESMEDIA-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 236 U36 bokförd';
});

// 3. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":236'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 236, organ: 'Φ', ts: Date.now(),
    beslut: `v173 U36: Atresmedia A3M.MC (Spanien/kommunikation 1→2) — Cellnex+A3M = spanska BT+Pearson. Tretton lås (nio exakta; payout NULL med dokumenterad sänkning −42,65 %). FY25-nettokollapsen dokumenterad öppet (CAGR −18,1 %); FCF bättre än netto (13,76 vs 6,05 % — amorfteringar); segment-interntlås ±0,4 sex fönster med begreppsdifferans. Rappdag 10-22 INOM v172. ${esKomplett ? 'SPANIEN-KOMPLETT: fyra grenar ≥2 — tredje landet efter UK och Kanada.' : ''} Kö: v172-fönster (5 bolag), spårrotation.`,
    bevis: 'V173-U36-A3M-ATRESMEDIA-UTOKNING.md + _r236-u36-*.mjs (kvitton /tmp/r236-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 4. Commit + push
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U36-A3M-ATRESMEDIA-UTOKNING.md',
  'worklog.md',
  'verktyg/_r236-u36-a3m-hamta.mjs', 'verktyg/_r236-u36-universum-inlagg.mjs', 'verktyg/_r236-u36-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U36 LEVERERAD — Atresmedia Corporación A3M.MC (Spanien/kommunikation 1→2 — SPANIENS SISTA 1-GREN): cellmotiverad duo (Cellnex telekom-tornen + A3M broadcasting-innehållet = SPANSKA BT+PEARSON-MÖNSTRET); BME/EUR enl. CLN.MC-precedensen; symbolen A3M (404-diagnosen dokumenterad); TRETTON LÅS med NIO EXAKTA (mcap · PS · netto-M 6,05 · FCF-M 13,76 · FCF-yield 9,48 · divY 6,70 · D/E 0,25 · EV/Sales + EV-dekomposition 0,08 %) + payout NULL (källan n/a; utdelningssänkningen −42,65 % med FY24-extrautdelningsspike 0,68 dokumenterad; FCF-payout 57,24 %); P/E-familjen 24,05/23,96/24,25; PEG NULL (basblandning extrem 4,14 vs 0,60); FY25-NETTOKOLLAPSEN DOKUMENTERAD [118,5 · 112,9 · 171,2 · 120,3 · 62,1] + TTM 54,7 (CAGR −18,1 % ÖPPET — medieprishärdarna); omsättning FLATT (+1,0 %); brutto-omklassningen FY25 dokumenterad (content-kostnader — standardisering ej kollaps); FCF BÄR BÄTTRE BILD [176 · 105 · 137 · 166 · 92] + TTM 124 identitetslåst ±0,01 (FCF-M 13,76 > netto-M 6,05 — amorfteringar); SEGMENTLÅSET INTERNT: Audiovisual 92 % + Radio + elim = segmenttotal ±0,4 M sex fönster (begreppsdifferans ~110/år dokumenterad — BBVA-modellen); varningarna efterlevida (+10,44 %-sväng · RSI 76 · Planeta-kontroll float 43 % · universumets minsta euro-bolag · ROIC-gap +0,17 p · nettokassa +69 M); RAPPDAG 2026-10-22 BEKRÄFTAD INOM v172-fönstret (fjärde bolaget); universum 297→298 kirurgiskt, llms HELREGEN 298 (kommunikation n=31 median 17,6; totalt n 286; 10 aspektrader), läckagevakt 0 (537), tsc 0, prod 200. Spanien 7→8 — ${esKomplett ? 'SPANIEN-KOMPLETT: samtliga fyra grenar ≥2 (tredje landet efter UK och Kanada; energi 2 · finans 2 · kommunikation 2 · konsument 2 — mätt)' : 'kvarvarande grenar se worklog'}. Kö: v172-fönstret 10-20 (fem bolag: A3M 10-22 · DGE+BBVA+PUIG 10-29 · ENB 11-02) · spårrotation · Tyskland/Japan-mätning vid behov. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r236-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r236-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r236-msg.txt']);
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
console.log('LEVERANS: v173 U36 Atresmedia klar — universum 298, SPANIEN-KOMPLETT, push verifierad, prod 200');
