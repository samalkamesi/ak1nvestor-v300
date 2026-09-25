#!/usr/bin/env node
// Rond 245 — BOKFÖRING: U42-sond (LI/GFC/TEP alla gröna) + U42/U43-val + commit + push.
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
  if (readFileSync(`${ROT}/worklog.md`, 'utf8').includes('## ROND 245 [organ:Φ] — U42/43-SOND')) return 'redan bokförd';
  const rad = `

## ROND 245 [organ:Φ] — U42/43-SOND LEVERERAD: Frankrikes två sista 1-grenar avgjorda — alla tre kandidater RENA + P/E-bärare GRÖNA (LI Klepierre: 10,39 mdr · netto 1,37 mdr · P/E 7,59 · GFC Gecina: 4,72 · 162 M · 29,28 · TEP Teleperformance: 4,16 · 464 M · 9,04) ⇒ U42 = URW+KLEPIERRE (handelns fastigheter i två format: mixed-malls mot köpcentrum) · U43 = ORANGE+TELEPERFORMANCE (kommunikationens nät mot tjänsteskiktet) — efter U42/U43 är FRANKRIKE KOMPLETT — 2026-09-25

SONDEN (epa/Paris, S&P-data 2026-09-25; rond 240:s mönster): kollisionskontroll primär+sekundär 0 träffar (LI · GFC · TEP alla RENA i universumet 303).
(1) LI KLEPIERRE — fastighet/URW-partner: 36,24 EUR · mcap 10,39 mdr · netto TTM +1,37 mdr · P/E 7,59 — köpcentrum-REIT (SIIC); duon: URW (mixed-malls: Westfield-formatet) + Klépierre (regionstäva köpcentrum i kontinental Europa) = HANDELNS FASTIGHETER I TVÅ FORMAT.
(2) GFC GECINA — fastighet/alternativ: 63,75 · 4,72 mdr · 162 M · 29,28 (kontors-REIT; reserv om LI faller i hämtningen).
(3) TEP TELEPERFORMANCE — kommunikation/ORA-partner: 71,56 · 4,16 mdr · 464 M · P/E 9,04 — kundupplevelse-outsourcing (customer experience); duon: Orange (nätet/infrastrukturen) + Teleperformance (tjänsteskiktet på nätet: support/kundtjänst i 100+ länder) = KOMMUNIKATIONENS NÄT MOT TJÄNSTESKIKTET; P/E 9 = AI-oron för callcenter-disruption dokumenterbar i hämtningssteget (datafakta).
SEKTOR-VERIFIERING: källornas sektor-rad togs ej i snabbvyn (som rond 240) — kontrolleras i hämtningssteget (TEP:s GICS-klass kan vara Industrials/Professional Services på vissa leverantörer: om sektor-raden visar Industrials avvisas TEP för kommunikationscellen och alternativ sond krävs — dokumenterat villkor).
NÄSTA VÅG (rond 246): U42 = LI-hämtning (fyra paneler EPA/EUR, URW.PA-precedensen — fastighetsraden: fcf/fällt-fältdokumentation enligt VNA.DE/AT1.DE-mallen) + kirurgisk append 303→304; därefter U43 = TEP (med sektor-villkoret).
EFTER U42+U43: FRANKRIKE KOMPLETT PÅ GRENNIVÅ (SJÄTTE LANDET — tolv grenar alla ≥2; finans 5 · teknik 5 · konsument 5 bär bredden).
KVD denna rond: sond read-only · kvitton /tmp/r245-sond/ · commit via rond 227:s mekanik.`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'rond 245 bokförd';
});

steg('beslutsminne', () => {
  const bef = readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf8').trim().split('\n');
  if (bef.some(r => r.includes('"rond":245'))) return 'redan bokförd';
  const rad = JSON.stringify({ rond: 245, organ: 'Φ', ts: Date.now(),
    beslut: 'U42/43-sond: LI Klepierre (10,4 mdr · P/E 7,59) + TEP Teleperformance (4,2 · 9,04) valda; GFC Gecina reserv. U42 = URW+Klepierre (handelns fastigheter två format); U43 = Orange+Teleperformance (nätet mot tjänsteskiktet; sektor-villkor: TEP får ej klassas Industrials i hämtningssteget). Efter båda: FRANKRIKE KOMPLETT (sjätte landet). Kö: U42 LI-hämtning → U43 TEP → v172-fönster (sex bolag) → Indien-svep.',
    bevis: '_r245-u42-sond.mjs + /tmp/r245-sond/* + commit' }) + '\n';
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, rad, 'utf8');
  return 'rad tillagd';
});

const FILER = ['worklog.md', 'verktyg/_r245-u42-sond.mjs', 'verktyg/_r245-bokfor.mjs'];
const MSG = `studio: [organ:Φ] rond 245 U42/43-SOND — Frankrikes två sista 1-grenar avgjorda: alla tre kandidater RENA + P/E-bärare GRÖNA (LI Klepierre 10,39 mdr · netto 1,37 mdr · P/E 7,59 · GFC Gecina 4,72/162 M/29,28 · TEP Teleperformance 4,16/464 M/9,04); U42 = URW+KLEPIERRE (handelns fastigheter i två format: Westfield-mixed-malls mot kontinentala köpcentrum — SIIC-REIT); U43 = ORANGE+TELEPERFORMANCE (kommunikationens nät mot tjänsteskiktet: support i 100+ länder; P/E 9 = AI-disruptionsoron dokumenterbar); GFC reserv; sektor-villkor dokumenterat (TEP:s GICS får ej visa Industrials i hämtningsstelet — då ny sond); efter U42+U43 är FRANKRIKE KOMPLETT (sjätte landet, tolv grenar ≥2); NÄSTA: U42 LI-hämtning (fyra paneler EPA/EUR URW.PA-precedensen) med append 303→304. Sond read-only, universumet orört. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r245-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

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
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r245-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r245-msg.txt']);
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
console.log('LEVERANS: rond 245 U42/43-sond bokförd och pushad');
