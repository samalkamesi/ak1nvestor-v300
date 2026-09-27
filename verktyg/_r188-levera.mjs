#!/usr/bin/env node
// _r188-levera.mjs — rond 188: AR27 medtech-ar leverans
// (worklog-dedupe + rondbooking + commit via tsc-grinden + push prod + beslutsminne + prod-verifikation)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r188-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);

// ── 1. Worklog: dedupe rond 187:s kvarvarande dubbeltrad + append rond 188 ──
const wl = `${ROT}/worklog.md`;
const rader = fs.readFileSync(wl, 'utf8').split('\n');
const i = 17523; // 0-baserat index = rad 17524
const ärDublett = rader[i] !== undefined && rader[i] === rader[i - 1] && rader[i].startsWith('PIPELINE-KO v171');
if (ärDublett) {
  rader.splice(i, 1);
  steg('worklog-dedupe', true, 'dubbeltrad 17524 borttagen (rond 187-skriptfelets andra append)');
} else {
  steg('worklog-dedupe', false, `rad 17524 ej dublett: "${String(rader[i]).slice(0, 50)}"`);
}
const rond188 = `## ROND 188 [organ:Φ] — v171 OBJEKT 2: AR27 MEDTECH-AR LEVERERAD med KVD GRÖN 28/28 — 2026-09-24 ~23:5x lokal
AR-tabellens numrering KORRIGERAD OCH BOKFÖRD: AR24–AR26 är upptagna i leveransordning (energi/material/skog) ⇒ medtech-ar = AR27 — och AR26-radens antagande "medtech-ar landade av syskon" stämde aldrig (disk-inventeringen rond 187: ingen fil, ingen främmande klaim; detta är FÖRSTA leveransen, bokförd i AR27-radens not). LEVERANS: data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json (arabisk spegling av B24, klaimfil data/vakten/s3-ar24-ansprak-2026-09-24.md skriven FÖRE arbetet 22:46, disk-först) — samma talbas och räkneexempel som originalet (bruttomarginaltrappan Sonova 73,7 → Straumann 69,3 → Boston Scientific 69,2 → CellaVision 68,7 → Coloplast 67,2 → Getinge 48,6 → Elekta 39,6 med spannet 48,3 pp och medianen 68,0; räkneexemplet 68/32 med volymfall +10 % → +42,5 % = 4,25× och prisfall −5 % → −31 %; Getingeserien 2022→2025 +23,6 % intäkt mot −9,4 % resultat, nettomarginal 8,8→6,5; värderingsblocket P/E-median 30,0 · EV/EBIT 18,8 · ROIC 15,0; MDR 2017/745 + FDA 510(k); checklistans fem steg). KVD GRÖN 0 FEL i 28 maskinella kontroller (verktyg/_v171-ar24-kvd.mjs, mall _s3u3-b26-ar-kvd-skog-ar): varumärkesgrindens FEL-regexer × 3 ytor 0 · rådverb SV+EN+AR 0 (AR-mönstren) · sökord "أسهم التقنية الطبية" i title+ingress+3 H2 · title 45/60 · OG 135/155 · ord 1239/1400 · korslänkar 12/12 MULTISET-identiska · externa 3/3 (eur-lex + lakemedelsverket + fda) · TAL-PARITET 82/82 språkmedveten multiset (SV mellanslagstusental/decimalkomma == AR tusentelskomma/punkt — AR8-klassen; körningens enda röda var multiplikationstecknet × = latinsk token i kontrollens spanne — kontrollen utvidgad med motiv i skriptet, guidetexten orörd, AR25:s symbolklass) · aritmetik 11/11 motorräknad · H2-paritet 6=6 · readingMinutes 2 · svenska läckor 0 · disclaimer arabisk form exakt sista rad. DOKUMENTATION: AR27-rad fulltecknad i SEO-GUIDER-2026-09.md + kvarvarande-listan uppdaterad (vård-ar B25 + bygg-ar B27). STÄDNING: rond 187:s kvarvarande dubbeltrad i worklog borttagen. Ren dataleverans — src orörd, inget bygge. NÄSTA i spåret: vård-ar (B25), därefter bygg-ar (B27), därefter v172 kvartalsrapporter (Q3 slutar 09-30) enligt PIPELINE-KO.`;
let txt = rader.join('\n');
if (!txt.endsWith('\n')) txt += '\n';
txt += '\n' + rond188 + '\n';
fs.writeFileSync(wl, txt);
steg('worklog rond 188', true, 'dedupe + append klar');

// ── 2. Commitmeddelande ──
const msg = `studio: [organ:Φ] v171 AR27 medtech-ar LEVERERAD — KVD GRÖN 28/28 (talparitet 82/82, aritmetik 11/11, korslänkar 12/12; verktyg _v171-ar24-kvd.mjs committat som bevis). AR-numreringens korrigering bokförd i SEO-GUIDER: AR24–AR26 upptagna av energi/material/skog i leveransordning ⇒ medtech-ar = AR27, FÖRSTA leveransen (AR26-radens "landade av syskon" stämde ej — ingen fil fanns på disk vid inventeringen). Kvarvarande i spåret: vård-ar (B25) + bygg-ar (B27). Worklog: rond 187:s sista dubbeltrad städad + rond 188 bokförd. Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r188-msg.txt', msg);
steg('commitmsg', true);

// ── 3. git add + commit (tsc-grinden) + push ──
const filer = [
  'data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json',
  'data/forskning/SEO-GUIDER-2026-09.md',
  'verktyg/_v171-ar24-kvd.mjs',
  'verktyg/_v171-ar24-sondera.mjs',
  'verktyg/_v171-ar24-sondra.mjs',
  'verktyg/_r188-levera.mjs',
  'worklog.md',
];
const git = (args) => execFileSync('git', args, { cwd: ROT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
git(['add', ...filer]);
steg('git add', true, `${filer.length} filer`);
try {
  const ut = git(['commit', '-F', '/tmp/r188-msg.txt']);
  steg('git commit (tsc-grinden)', true, ut.split('\n').filter((r) => r.startsWith('[') || /file/i.test(r)).join(' | ').slice(0, 200));
} catch (e) {
  steg('git commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400));
}
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('HEAD', true, hash);
try {
  const push = git(['push', 'prod', 'develop']);
  steg('git push prod develop', true, push.split('\n').pop().slice(0, 120));
} catch (e) {
  steg('git push prod develop', false, String(e.stdout || e.message).slice(0, 400));
}

// ── 4. Prod-verifikation: guiden + SEO-GUIDER i prod-trädet ──
const guideWs = `${ROT}/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json`;
const guideProd = `${PROD}/data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json`;
steg('prod: guiden på disk', fs.existsSync(guideProd) && sha(guideWs) === sha(guideProd), `sha ${sha(guideProd)}`);
const seoProd = fs.readFileSync(`${PROD}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8');
steg('prod: AR27-rad i SEO-GUIDER', seoProd.includes('| AR27 | medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar'));
steg('prod: kvarvarande-notis uppdaterad', seoProd.includes('medtech-ar LEVERERAD som AR27'));

// ── 5. Beslutsminne (rond 188) ──
const minne = { ts: new Date().toISOString(), rond: 188, beslut: 'AR27 medtech-ar levererad som första spegling av B24 (AR26-radens syskon-antagande korrigerat i SEO-GUIDER; AR-numrering = leveransordning); kvar i spåret vård-ar + bygg-ar', landat: hash };
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify(minne) + '\n');
steg('beslutsminne', true);

console.log(kvitto.join('\n'));
