#!/usr/bin/env node
// Rond 227 — avslut: worklog-komplement (mekanik-lärdom + tres-commits-förklaring
// + rent prod-träd) + avslutningscommit. Återanvänder rond 227:s push-mekanik
// (adoption om rapporten växt; rensning av prod-M; push; verifiering).
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

// Worklog-komplement (idempotensvakt)
steg('worklog-komplement', () => {
  const nu = readFileSync(`${ROT}/worklog.md`, 'utf8');
  if (nu.includes('ROND 227 KOMPLEMENT')) return 'redan bokförd';
  const rad = `

### ROND 227 KOMPLEMENT [organ:Φ] — push-mekaniken fullständigt kartlagd; prod-trädet RENT (0 rader); historikförklaring — 2026-09-25

Avslutande bokföring efter att leveransen landat (commit ef5bbd44, push 9b32f5b8..ef5bbd44):
(1) FULLSTÄNDIG UPDATEINSTEAD-MEKANIK (tre lager, alla verifierade i skarp drift): push mot prod avvisas på (a) MODIFIERAD tracked fil ("Working directory has unstaged changes") — även när commiten bär exakt arbetskatalogens innehåll; (b) UNTRACKED fil som commiten lägger till ("would be overwritten by merge") — även byte-identisk. Kuren i båda fallen: säkra innehållet i arbetsytans commit → kirurgiskt rensa prods kopia (git checkout -- fil för M; rm för untracked-dubbletter EFTER cmp) → push → updateInstead-checkouten återskapar exakt samma innehåll. Adoptionsskydd: append-only-filen kopieras ENDAST om prods kopia är längre — en rensad prod kan aldrig dra bakåt en framåtbärande commit.
(2) PROD-TRÄDET RENT: 0 rader smuts efter push (första gången sedan artefaktplaylistan byggdes upp 09-24) — 26 eftersläppta artefakter + rapporten nu git-spårade.
(3) HISTORIK: rond 227 sträcker sig över tre commits i grenen (0499991e-släkten via amend, 9b3b2c2b-släkten via amend, slutgiltiga ef5bbd44) — skriptet itererades skarpt mot updateInstead-lagren (v1: prodkoll-bugg på porcelen-formatet '␣M'; v2: gitignored data/vakten i add-listan; v3: M-rensning; v4: untracked-rensning). Varje commit är komplett grön (tsc 0); inga dubbletter i data (cmp-kedja).
(4) LÄRODOM FÖR KOMMANDE ADOPTIONER: _r227-levera.mjs är nu den referensmekanik framtida ronder använder när prod-trädet bär vaktrapporter/artefakter — adoption aldrig via gissning longeran.
Kö: oförändrad (rappdagar → v172 · UK-kommunikation BT.L · Kanada/Spanien · spårrotation).
`;
  appendFileSync(`${ROT}/worklog.md`, rad, 'utf8');
  return 'komplement bokförd';
});

const FILER = ['worklog.md', 'verktyg/_r227-avslut.mjs'];
const MSG = `studio: [organ:Φ] rond 227 KOMPLEMENT — fullständig updateInstead-mekanik bokförd (tre avvisningslager: unstaged-M, untracked-overwrite, samt kur: säkra i commit → kirurgisk rensning av prods kopia → push → checkout återinträde); prod-trädet RENT 0 rader efter ef5bbd44; tres-commits-historiken förklarad (skarp skriptiteration, varje commit grön tsc 0); _r227-levera.mjs = referensmekanik för framtida adoptioner. Ren dataleverans — src orörd, inget bygge.`;
steg('commitmsg', () => { writeFileSync('/tmp/r227b-msg.txt', MSG + '\n', 'utf8'); return 'skriven'; });

let pushad = false;
for (let forsok = 1; forsok <= 3 && !pushad; forsok++) {
  const prodLangd = statSync(`${PROD}/${RAPPORT}`).size;
  const lokalLangd = statSync(`${ROT}/${RAPPORT}`).size;
  if (prodLangd > lokalLangd) {
    copyFileSync(`${PROD}/${RAPPORT}`, `${ROT}/${RAPPORT}`);
    FILER.push(RAPPORT);
    kvitto.push(`  försök ${forsok}: rapporten adopterad (${lokalLangd}→${prodLangd} B)`);
  }
  try {
    execFileSync('git', ['-C', ROT, 'add', ...new Set(FILER)]);
    if (forsok === 1) {
      const ut = execFileSync('git', ['-C', ROT, 'commit', '-F', '/tmp/r227b-msg.txt'], { encoding: 'utf8' });
      kvitto.push(`  commit ${(ut.match(/\[develop ([0-9a-f]+)\]/) || [])[1] || 'okänd'} genom tsc-grinden`);
    } else {
      execFileSync('git', ['-C', ROT, 'commit', '--amend', '-F', '/tmp/r227b-msg.txt']);
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
  return `prods HEAD = ${prodH.slice(0, 10)}; prodsmuts ${smuts.length} rad(er)`;
});
kvitto.forEach(k => console.log(k));
console.log('LEVERANS: rond 227 komplett bokförd');
