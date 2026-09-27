#!/usr/bin/env node
// Rond 233 — U35-SONDENS BOKFÖRING: worklog + beslutsminne + commit + push (rond 227:s mekanik).
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
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 233 [organ:Φ] — U35-SOND')) return 'redan bokförd';
  const rad = `

## ROND 233 [organ:Φ] — U35-SOND LEVERERAD: Spaniens sista 1-grenar avgjorda — PUIG REN + P/E-bärare GRÖN (netto 581,5 M EUR, P/E 17,17, Consumer Staples/konsument-cellen) ⇒ U35 = Puig; TELEFÓNICA AVVISAD P/E-bärarkontroll RÖD (TTM-netto −3,57 mdr EUR, P/E n/a — TREDJE europeiska telecom-fallet efter VOD −397 M EUR och WPP −240 M GBP; utdelningen 8,91 % = den klassiska fällan) — 2026-09-25

KOLLISIONSKONTROLL (primär+sekundär, AZN-läxan): PUIG och TEF bägge RENA (0 träffar i hela universumet — ticker+namn).
P/E-BÄRARKONTROLL (färsk quote-panel 2026-09-25, S&P-data): PUIG [bme] 17,73 EUR · mcap 9,99 mdr · netto +581,5 M · P/E 17,17 · utdelning 2,38 % · sektor Consumer Staples/Household & Personal Products ⇒ GRÖN + RÄTT CELL. TEF [bme] 3,367 EUR · mcap 18,95 mdr · netto −3,57 mdr · P/E n/a · utdelning 8,91 % · Communication Services/Telecom ⇒ RÖD (Sony/Honda-doktrinen).
DUO-PEDAGOGIK (U35): Inditex (snabbmode — klädvolymens frekvensköp) + Puig (beauty/parfym-lux — varumärkespremiens merkköp): konsumentens två sidor — volym mot värde; speglar DGE+BATS-mönstret (drickvaror mot tobak = njutningens två hastigheter).
MÖNSTER-NOT (bokförd): TRE europeiska telecom/bystorej-konglomerat har nu avvisats på färsk TTM (VOD FY26 −397 M EUR · WPP −240 M GBP · TEF −3,57 mdr EUR) — nedskrivningsburen sektor; BT (P/E 15,93) och Pearson bär UK-cellerna, men Spanien/kommunikationen FÖRBLIR 1-gren tills en P/E-bärare hittas (kandidat nästa sond: Atresmedia ATR.MC — broadcasting, men liten ~0,7 mdr mcap; tröskelfråga; alternativ: lämna cellen öppen med dokumenterad orsak — cell-doktrinen kräver P/E-bärare, ALDRIG ett dött P/E för grenens skull).
NÄSTA VÅG (rond 234): U35 = PUIG-hämtning (fyra paneler BME/EUR, ITX.MC-precedensen) med tretton lås + segmentlås (Rabanne/Carolina Herrera/Charlotte Tilbury/Jean Paul Gaultier-märkesfamiljen?) + kirurgisk append 296→297 + llms HELREGEN 297 + läckagevakt + protokoll V173-U35-PUIG-UTOKNING.md.
KVD denna rond: sond read-only (universumet orört) · kvitton /tmp/r233-u35/ · commit via rond 227:s mekanik.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 233-sond bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":233'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 233, organ: 'Φ', ts: Date.now(),
    beslut: 'U35-sond: PUIG ren+grön (netto 581,5 M, P/E 17,17, Consumer Staples) ⇒ U35 = Puig (Spanien/konsument 1→2, Inditex+Puig = volym mot merkköp). TEF avvisad (TTM −3,57 mdr — tredje telecom-fallet; 8,91 %-utdelningen = fällan). Spanien/kommunikation förblir 1-gren: Atresmedia-sond (tröskelfråga 0,7 mdr) eller dokumenterad öppen cell. Kö: U35 Puig-hämtning → v172-kalendern (DGE+BBVA 10-29, ENB 11-02).',
    bevis: '_r233-u35-sond.mjs + /tmp/r233-u35/* + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = ['worklog.md', 'verktyg/_r233-u35-sond.mjs', 'verktyg/_r233-u35-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 233 U35-SOND — Spaniens sista 1-grenar avgjorda: PUIG REN + P/E-bärare GRÖN (netto 581,5 M EUR, P/E 17,17, Consumer Staples — konsument-cellen) ⇒ U35 = Puig (Inditex+Puig-duon: klädvolymens frekvensköp mot beauty-luxens merkköp — konsumentens två sidor); TELEFÓNICA AVVISAD (TTM-netto −3,57 mdr EUR, P/E n/a — TREDJE europeiska telecom-nedskrivningsfallet efter VOD −397 M EUR och WPP −240 M GBP; utdelningen 8,91 % = den klassiska fällan, Sony/Honda-doktrinen); Spanien/kommunikation förblir 1-gren med dokumenterad orsak (P/E-bärare saknas — Atresmedia-sond ev. nästa, tröskelfråga; cell-doktrinen kräver bärare, aldrig dött P/E för grenens skull); U35 = Puig-hämtning nästa våg (BME/EUR, ITX.MC-precedensen). Sond read-only, universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r233-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r233-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r233-msg.txt']);
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
console.log('LEVERANS: rond 233 U35-sond bokförd och pushad');
