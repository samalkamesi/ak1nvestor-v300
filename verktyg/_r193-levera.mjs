#!/usr/bin/env node
// _r193-levera.mjs — rond 193: granskningsomgång 1 levereras (worklog + commit + push + status-rop SIST + minne)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r193-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 0. Lägesverifiering: mätresultatet i granskningsfilen
const g = fs.readFileSync(`${ROT}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('mätresultat bokfört', g.includes('DOM: **6 GRÖN · 69 GUL · 1 RÖD**'), 'granskningsomgång 1 (kurerat verktyg)');

// 1. Worklog rond 193
const nyRond = `## ROND 193 [organ:Φ] — v172 GRANSKNINGSOMGÅNG 1 LEVERERAD: 6 GRÖN · 69 GUL · 1 RÖD av 76 väntande Q3-utkast — mätverktyget validerat och kurerat i tre steg — 2026-09-25 ~02:5x lokal
Granskningsfilens första omgång verkställd autonomt mot mallstommen. VALIDERINGEN FÖRST (mätare som överflaggar är värre än ingen): första mätningen gav 2/23/51 — inspektion av tre exempel per RÖD-klass friade UTkasten och fällde MÄTAREN i tre punkter (AR3/AR8-klassen, alla kurer dokumenterade i verktyget): (1) källkravet "externa URL:er" → "namngivna källor per siffra" (ABB-mönstret: intern datapipeline citeras per siffra — V152 uppfyllt; volvo-cars "Källor per avsnitt" i prosa med hämtdatum = exemplariskt); (2) rädverbcounten smalades till rådgivningskonstruktioner ("rekommenderar köp"/"köp aktien") — beskrivande verb ("säljer lås"), substantiv ("noll köp") och pedagogiska instruktioner är legala; (3) längdbandet 700–4200 med trimnotis >3800 (grundliga paket 3522–4145 ord). FJÄRDE kuren efter RÖD-kontroll: varumärkesgrinden gjordes disclaimer-medveten (hm-b:s "Inga köp- eller säljrekommendationer lämnas" = negation men grinden mekanisk ⇒ GUL-kur "omformulera", inte RÖD). FINALMÄTNING: 6 GRÖN (klara för publiceringspaket) · 69 GUL (mindre kur: dominant kalenderdatum-notiser, disclaimersats-formuleringar, trimnotiser) · 1 RÖD (meta-utkastet saknar källsektion — äkta gap mot mallens sektion 6, rättas före paket). Resultatsektion i V172-GRANSKNING.md med alla domar per utkast + fullrapport i maskinläsbar JSON. STATUS-ROP enligt regeln § 1 körs som SISTA steg i leveransen (RAPPORTBLOCK ombyggt — 8 publicerade · 76 väntar oförändrat). R2-PÅMINNELSE framförd i sessionen: publiceringspaketet (vilka granskade utkast får gå live före sina rappdatum) är kundens beslut. NÄSTA: kur-ronden för GULA-paketen (prioriterat v41–v42-bolagen — Öresund 10-09 och USA-bankerna 10-13 rapporterar först) + metas källsektion; därefter v173 dataset-djup enligt rotationen. Ren dataleverans — src orörd, inget bygge.`;
fs.appendFileSync(`${ROT}/worklog.md`, '\n' + nyRond + '\n');
steg('worklog', true);

// 2. Commit + push
const msg = `studio: [organ:Φ] v172 granskningsomgång 1: 6 GRÖN · 69 GUL · 1 RÖD av 76 väntande Q3-utkast. Mätverktyget _r172-granska-utkast.mjs validerat i tre steg och kurerat med dokumenterade motiv (källkrav namngivna-per-siffra, smala rådgivningsmönster, längdband 700–4200, disclaimer-medveten varumärkesgrind) — första mätningens 51 RÖDA var mätarens, inte utkastens. Enda äkta RÖD: meta saknar källsektion. Resultat per utkast i V172-GRANSKNING.md; publiceringspaketet väntar kund (R2). Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r193-msg.txt', msg);
git(['add', 'data/forskning/V172-GRANSKNING.md', 'verktyg/_r172-granska-utkast.mjs', 'verktyg/_r172-validera.mjs', 'verktyg/_r172-roda.mjs', 'verktyg/_r193-levera.mjs', 'worklog.md']);
steg('git add', true);
try {
  const ut = git(['commit', '-F', '/tmp/r193-msg.txt']);
  steg('commit (tsc-grinden)', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('HEAD', true, hash);
const status = git(['status', '--porcelain'], PROD);
if (status.split('\n').some((l) => /^ ?M/.test(l))) steg('prod-renhet', false, 'tracked-mod — adoptera först');
steg('prod-renhet', true, '0 tracked-mod');
try { git(['push', 'prod', 'develop']); steg('push', true); } catch (e) { steg('push', false, String(e.stdout || e.message).slice(0, 500)); }
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('prod HEAD ≡ push', prodHead === hash, prodHead);
const granskProd = fs.readFileSync(`${PROD}/data/forskning/V172-GRANSKNING.md`, 'utf8');
steg('granskningsomgången i prod', granskProd.includes('6 GRÖN · 69 GUL · 1 RÖD'));

// 3. STATUS-ROP SOM SISTA STEG (regeln § 1 — därefter får trädet inte bära ny diff)
const ropUt = execFileSync('node', ['verktyg/_r172-rapportvag-status.mjs'], { cwd: ROT, encoding: 'utf8', timeout: 120000 });
steg('status-rop (regeln § 1, sista steget)', ropUt.includes('publicerade'), ropUt.trim().split('\n')[0]);
const diffEfter = git(['status', '--porcelain']);
steg('trädet rent efter rop (bitidentisk ombyggnad)', diffEfter.trim() === '', diffEfter.trim() ? diffEfter : 'RAPPORTBLOCK identisk — ingen ny diff');

// 4. Beslutsminne
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 193, beslut: 'v172 granskningsomgång 1: 6/69/1 av 76 — mätverktyg validerat+kurerat (tre mätfelklasser, utkasten friade); meta äkta RÖD (källsektion saknas); publiceringspaket väntar kund R2', landat: hash }) + '\n');
steg('beslutsminne', true);

console.log(kvitto.join('\n'));
