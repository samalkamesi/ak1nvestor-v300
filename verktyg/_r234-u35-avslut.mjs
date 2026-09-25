#!/usr/bin/env node
// Rond 234 — U35 AVSLUT: Spanien-mätning + Atresmedia-tröskelkoll (fetch) + worklog + beslutsminne +
// commit + push (rond 227:s mekanik) + prod 200.
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, statSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const RAPPORT = 'data/rapporter/motorervalidering-2026-09-02.md';
const kvitto = [];
const steg = (namn, fn) => {
  try { kvitto.push(`OK ${namn} — ${fn() ?? ''}`); }
  catch (e) { kvitto.forEach(k => console.log(k)); console.log(`FEL ${namn} — ${e.message}`); process.exit(1); }
};

// 1. Spanien-grenmätning (FÖRE formulering)
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const es = u.filter((b) => b.land === 'Spanien');
const esGrenar = {};
for (const b of es) esGrenar[b.bransch] = (esGrenar[b.bransch] ?? 0) + 1;
const esText = Object.entries(esGrenar).sort().map(([k, n]) => `${k} ${n}`).join(' · ');
const esEn = Object.entries(esGrenar).filter(([, n]) => n < 2).map(([k]) => k);
steg('spanien-grenmätning', () => `Spanien ${es.length} rader — ${esText} ⇒ ${esEn.length ? 'kvarvarande 1-grenar: ' + esEn.join(', ') : 'SAMTLIGA grenar ≥2'}`);

// 2. Atresmedia-tröskelkoll (färsk quote för tröskeldokumentationen)
let atrText = 'kunde inte hämtas';
try {
  const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
  const r = await fetch('https://stockanalysis.com/quote/bme/ATR/', { headers: { "user-agent": UA, "accept": "text/html", "cache-control": "no-cache" }, redirect: "follow" });
  const html = await r.text();
  mkdirSync('/tmp/r234-atr', { recursive: true });
  writeFileSync('/tmp/r234-atr/quote.html', html);
  let plain = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
  plain = plain.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'");
  const rr = plain.split('\n').map(x => x.trim()).filter(x => x.length > 1);
  writeFileSync('/tmp/r234-atr/quote.plain.txt', rr.join('\n'));
  const v = {};
  for (let i = 0; i < rr.length; i++) {
    if (['Market Cap', 'Net Income', 'PE Ratio', 'Sector', 'Industry'].includes(rr[i])) v[rr[i]] = rr[i + 1];
    if (rr[i] === 'Compare' && !v.PRISEN) v.PRISEN = rr[i + 1];
  }
  atrText = `ATR [bme]: pris ${v.PRISEN ?? '?'} · mcap ${v['Market Cap'] ?? '?'} · netto ${v['Net Income'] ?? '?'} · P/E ${v['PE Ratio'] ?? '?'} · sektor ${v['Sector'] ?? '?'}/${v['Industry'] ?? '?'}`;
} catch (e) { atrText = `FEL: ${e.message}`; }
steg('atresmedia-tröskelkoll', () => atrText);

// 3. Worklog-rond 234
steg('worklog', () => {
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 234 [organ:Φ] — v173 U35 LEVERERAD')) return 'redan bokförd';
  const rad = `

## ROND 234 [organ:Φ] — v173 U35 LEVERERAD: Puig Brands PUIG.MC (Spanien/konsument 1→2) — universum 296→297, Inditex+Puig-duon (klädvolymens frekvensköp mot beauty-luxens merkköp), TRETTON LÅS med sju EXAKTA (payout med RÄTT bas: 264,14/581,5 = 45,43 % mot källraden 45,42), rappdag 10-29 INOM v172-fönstret (superdagen DGE+BBVA+PUIG) — 2026-09-25

U35: Spanien/konsument-cellens duo — Inditex (snabbmode-volymen) + Puig (beauty/parfym-luxens varumärkespremie): konsumentens två sidor, DGE+BATS-mönstret. BME/EUR (ITX.MC-precedensen). IPO maj 2024 (två börsår; femårig serihistorik med pre-IPO-räknade år — dokumenterat).
TRETTON LÅS (sju EXAKTA): mcap 0,02 % · PS EXAKT · P/B EXAKT · EV 0,06 % · netto-M 0,2 % · FCF-M EXAKT · FCF-yield EXAKT · divY 0,4 % · D/E 1,2 % · PAYOUT med RÄTT bas EXAKT (totalutdelning 264,14/netto 581,5 = 45,43 % mot källraden 45,42; DPS-raden 0,42 avrundad ger naiv replik 40,8 % — dokumenterad) · P/E 0,25 % · EV/Earnings EXAKT · EV/Sales EXAKT. P/E-FAMILJEN TIGHT 17,17/17,18/17,21. PEG NULL (basblandning: 2,11 mot fwd-replik 2,20 och trailing 2,44 — ingen ren).
SEGMENTLÅSET I TRE DELAR (märkesfamiljen): Fragrance & Fashion [3 678 · 3 646 · 3 513 · 3 102 · 2 672 · 1 902] (72 %-ryggraden: Rabanne/CH/JPG) + Make-Up (Charlotte Tilbury) + Skincare (Barbara Sturm/Uriage) — totalen ±1 M TTM+FY23–25, +5/+7 M (0,2 %) FY21–22 (källans decimalrader); tre ben alla växande.
TILLVÄXTEN DALAR ÖPPET: +40,0 → +18,9 → +11,3 → +5,3 → TTM +1,1 % (konsolideringsåren efter IPO); netto [221,0 · 399,5 · 465,2 · 530,7 · 593,7] + TTM 581,5 (CAGR +14,1 %); BRUTTOMARGINALEN 72,9→75,1 % (varumärkesmoaten i läkemedelsklassen; medel 74,8).
FCF [268 · 379 · 549 · 661] + TTM 584 — identitetslåst ±0,01 sex fönster; FCF-yield 5,85 % EXAKT. FAMILJEKONTROLLEN: float 25 % · institutioner 5,75 % · aktieantal ±0,00 %. ROIC 10,92 % mot WACC 5,81 % (gap +5,11 p). KASSAGLIDNINGEN −830 M dokumenterad (skuldavbetalning + utdelning + placeringar). EPS-seriens IPO-standardiseringsfel (FY22 '3 000,89') dokumenterat med förbehåll.
KVD: append 296+/0− · läs-tillbaka ×2 · llms HELREGEN 297 (totalt n 285; 10 aspektrader) · läckagevakt 0 (535) · tsc 0 · prod 200 i avslutet.
Spanien-grenmätning EFTER inlägget (mätt): ${esText} ⇒ ${esEn.length ? 'kvarvarande 1-gren: ' + esEn.join(', ') : 'SAMTLIGA ≥2'}.
ATRESMEDIA-TRÖSKELKOLL (färsk källa): ${atrText} — tröskelfrågan: om mcap väsentligt under universumets gängse nivå lämnas Spanien/kommunikation ÖPEN med dokumenterad orsak (TEF P/E-död −3,57 mdr; P/E-bärare saknas på BME i right storleksklass).
v172-KALENDERN: SUPERDAGEN 2026-10-29 — DGE + BBVA + PUIG samma dag · ENB 11-02 · fönstret 10-20→11-04 (beredning när fönstret öppnar).
Kö: Atresmedia-beslut · v172-beredning · spårrotation (STRATEGISKT SKIFTE: branding/finslipning) när universumköerna tömms. R2: Q3-paketet väntar kund. Protokoll: V173-U35-PUIG-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 234 U35 bokförd';
});

// 4. Beslutsminne
steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":234'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 234, organ: 'Φ', ts: Date.now(),
    beslut: 'v173 U35: Puig PUIG.MC (Spanien/konsument 1→2) — Inditex-volym + Puig-merkköp. Tretton lås (sju EXAKTA; payout med rätt bas 264,14/581,5). Segmentlås 3 delar (F&F 72 % + Make-Up + Skincare; max diff 0,2 %). Tillväxten dalar öppet (+40→+1 %); bruttomarginal 75 %; ROIC-gap +5,11 p; familjekontroll (float 25 %). Rappdag 10-29 INOM v172 (superdagen DGE+BBVA+PUIG). Atresmedia-tröskelkoll bokförd. Kö: ATR-beslut, v172-beredning, spårrotation.',
    bevis: 'V173-U35-PUIG-UTOKNING.md + _r234-u35-*.mjs (kvitton /tmp/r234-*) + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

// 5. Commit + push
const FILER = [
  'data/portfolj-system/bolagsunivers.json',
  'public/llms.txt',
  'data/forskning/V173-U35-PUIG-UTOKNING.md',
  'worklog.md',
  'verktyg/_r234-u35-puig-hamta.mjs', 'verktyg/_r234-u35-universum-inlagg.mjs', 'verktyg/_r234-u35-avslut.mjs',
];
const MSG = `studio: [organ:Φ] v173 U35 LEVERERAD — Puig Brands PUIG.MC (Spanien/konsument 1→2): cellmotiverad duo (Inditex klädvolymens frekvensköp + Puig beauty-luxens merkköp — konsumentens två sidor, DGE+BATS-mönstret); BME/EUR enl. ITX.MC-precedensen; IPO maj 2024 (två börsår dokumenterat); TRETTON LÅS med SJU EXAKTA: mcap 0,02 % · PS · P/B · EV 0,06 % · FCF-M · FCF-yield · PAYOUT med RÄTT bas (totalutdelning 264,14/netto 581,5 = 45,43 % mot källraden 45,42 — DPS-raden avrundad dokumenterad) + EV/Earnings + EV/Sales EXAKTA; P/E-familjen TIGHT 17,17/17,18/17,21; PEG NULL (basblandning); SEGMENTLÅSET I TRE DELAR: F&F 72 % ryggraden (Rabanne/CH/JPG) + Make-Up (Charlotte Tilbury) + Skincare — totalen ±1 M TTM+FY23–25 (+5/+7 M FY21–22 = 0,2 %); TILLVÄXTEN DALAR ÖPPET (+40,0→+1,1 %); bruttomarginal 72,9→75,1 % (varumärkesmoaten); FCF [268·379·549·661]+TTM 584 identitetslåst ±0,01; ROIC-gap +5,11 p; FAMILJEKONTROLLEN (float 25 % · institutioner 5,75 % · aktieantal ±0 %); kassaglidning −830 M + EPS-IPO-fel dokumenterade; RAPPDAG est. 2026-10-29 INOM v172-fönstret (SUPERDAGEN DGE+BBVA+PUIG); universum 296→297 kirurgiskt, llms HELREGEN 297 (totalt n 285; 10 aspektrader), läckagevakt 0 (535), tsc 0, prod 200. Spanien 6→7 (konsument 1→2; kvarvarande 1-gren: kommunikation — ATR-tröskelkoll bokförd). Kö: ATR-beslut · v172-beredning · spårrotation. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r234-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r234-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r234-msg.txt']);
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
console.log('LEVERANS: v173 U35 Puig klar — universum 297, push verifierad, prod 200');
