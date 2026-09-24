#!/usr/bin/env node
// _r166-bokfor.mjs — evighetsmotor-iteration: pipeline-status korrigeras + worklog + beslutsminne + commit.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 300000, cwd: WS, ...opts }).trim();
}
const RAD = `
## ROND 162 evighetsverkställan [organ:Φ] — fabrikens omstart kartlagd, sekvensen självläker — 2026-09-24 ~13:1x lokal
Evighetsmotor-kick (iteration 2 stillastående 28 min). Läge: fabrikens auto-s6 (AI-Mentorn ×3) plockades 12:25 lokal men fabriksprocessen är omstartad (13:05-ropet skrev status vantar-ram, klara=[]) MEDAN 12:25-barnen lever och arbetar vidare som föräldralösa — deras prompts bär duplikatskydd (kontroll mot data/ + worklog före start) och commit-rätt, så leveranserna landar ändå. Kedja som självläker: barn klara → RAM frigörs → r163-dirigent bygger under flock (v160-kedjan P1+P2+P2.5+P3 live) → prod-ytan ren → push-poll landar 9991a855+ac4afcbf → v164-manifestet (24 Fas 3-underlag, parkerat) släpps till ko/. Risk noterad: fabriken kan föda duplikat-s6-barn när RAM>1500 igen — duplikatskyddet i prompten hejdar menat slöseri; dirigent-timeout 13:46 hanteras med omstart vid notis. Fynd för spåret: fabrikens omstart tappar pågående omgångs register — kandidat till registerhärdening (manifest-status "pågår" + barn-pid i statusfilen).
`;
const BESLUT = JSON.stringify({ ts: new Date().toISOString(), rond: 98, beslut: 'rond 162 evighetsiteration: fabrikens omstart+föräldralösa s6-barn kartlagda (självläkande kedja: barn→RAM→dirigentbygg→push→v164-släpp); deploy-kur-raden i PIPELINE-KO updaterad till r163-dirigent; 24-uppgifters v164-manifest parkerat med släppregel; ac4afcbf+rättade språkfel', landat: '9991a855,ac4afcbf' }) + '\n';
try {
  // 1) PIPELINE-KO: föråldrad deploy-kur-rad ersätts med aktuell
  const pk = `${WS}/data/forskning/PIPELINE-KO.md`;
  let text = readFileSync(pk, 'utf8');
  const gammal = text.match(/- · DEPLOY-KUR PÅGÅR \(2026-09-24, iteration rond 160 \[Φ\]\)[^\n]*/);
  if (gammal) {
    text = text.replace(gammal[0], '- · DEPLOY-KUR PÅGÅR (2026-09-24, ronder 160–162 [Φ]): OOM-roten belagd ("Killed" i bygglog — bygg/fabrik-kapplöpning om RAM); r163-dirigent (fristående, /tmp/r163-dirigent.txt) sekvenserar: fabriksbarn klara + RAM>=5000 → segmentstäd → flock-bygg + pm2-restart → verifiering 8 sidor + sitemap + färsk kvalitetsvakt. Push köad bakom s6-barnens yta (poll). v164 Fas 3-manifest (24 underlag) PARKERAT i KURS-FAS3 — släpps till ko/ först efter byggkvitto. Fabrikens omstart + föräldralösa 12:25-barn noterade (självläkande, duplikatskydd i prompts).');
    writeFileSync(pk, text);
    console.log('PIPELINE-KO: deploy-raden updaterad');
  } else console.log('PIPELINE-KO: gammal rad hittades ej (ev. redanUpdaterad) — lämnad');

  // 2) Worklog + beslutsminne + commit
  appendFileSync(`${WS}/worklog.md`, RAD);
  appendFileSync(`${WS}/data/forskning/beslutsminne.jsonl`, BESLUT);
  sh('git', ['add', 'worklog.md', 'data/forskning/PIPELINE-KO.md', 'data/forskning/beslutsminne.jsonl', 'verktyg/_r166-bokfor.mjs']);
  sh('git', ['commit', '-m', 'studio: rond 162 [organ:Φ] — evighetsverkställan: fabrikens omstart kartlagd, pipeline-status korrigera d, v164-släppregel bokad']);
  console.log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  console.log('Yta: ' + (sh('git', ['status', '--porcelain']) || 'ren'));
} catch (e) { console.log('FEL: ' + e.message); process.exit(1); }
