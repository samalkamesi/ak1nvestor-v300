// ROND 41 — landning: våg 174 (gap 13) + städningsskuld + bokföring.
// Kanal: node (bevisat pålitlig). Varje steg verifieras; misslyckande = larm + stopp.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ROTT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const steg = (namn) => console.log(`\n== ${namn} ==`);
const kör = (cmd, dir = ROTT) => execSync(cmd, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function byt(fil, fran, till, namn) {
  const text = fs.readFileSync(fil, 'utf8');
  if (!text.includes(fran)) throw new Error(`${namn}: ursprungssträngen saknas i ${fil}`);
  if (text.includes(till)) { console.log(`${namn}: redan applicerad`); return; }
  fs.writeFileSync(fil, text.replace(fran, till));
  console.log(`${namn}: OK`);
}

// ── 1. Gap-registret: stäng post 13 + footer ─────────────────────────────────
steg('register: post 13 stängd');
byt(
  ROTT + '/data/forskning/ZCODE-GAP-REGISTER.md',
  '| 13 | TUI-scenariotest (deras testinfrastruktur) | E2E-skript finns | 2 | 3 | ÖPPEN | Scenariotest-suite för studions flöden (playwright?) |',
  '| 13 | TUI-scenariotest (deras testinfrastruktur) | E2E-skript finns | 2 | 3 | STÄNGD (våg 174) | node/fetch-svit (ingen playwright): verktyg/scenariotest/scenariotest.mjs, 7 scenarier + journal jsonl |',
  'register-rad',
);
byt(
  ROTT + '/data/forskning/ZCODE-GAP-REGISTER.md',
  'Återstår ÖPPNA: 26 (sessions-index → våg 173) · 27 (v4/command, etapp 2) · 13 (scenariotest → våg 174).',
  'Återstår ÖPPNA: 26 (sessions-index → våg 173) · 27 (v4/command, etapp 2). Rond 41 stängde 13 (scenariotest, våg 174: 7/7 PASS mot körande prod — 10 skyddade rutter rena 401, SSE-läckage 0, publik hälsorutt 200 med 0 hemlighetsmarkörer, resync POST 405; sviten kalibrerad mot requireAdmin:s delade fel-bucket 10 fel/min med 7 s-pacing + 429-tolerans; journal data/vakten/scenariotest/journal.jsonl).',
  'register-footer',
);

// ── 2. Pipelinen: bocka 172 + 174 ────────────────────────────────────────────
steg('pipeline: våg 172 + 174 bockade');
byt(
  ROTT + '/data/forskning/PIPELINE-KO.md',
  '- ▶ VÅG 172 (bokad rond 38 [Φ], evolutionärt — registrets högsta öppna V9/A3):',
  '- ✓ VÅG 172 LEVERERAD rond 40 [Φ] (`2cf13fe5`, live-bevis i registrets footer):',
  'pipeline-172',
);
byt(
  ROTT + '/data/forskning/PIPELINE-KO.md',
  '- ▶ VÅG 174 (bokad rond 38 [Φ]): gap 13 scenariotest-suite — E2E-flöden i',
  '- ✓ VÅG 174 LEVERERAD rond 41 [Φ] (7/7 PASS, se registrets footer): E2E-flöden i',
  'pipeline-174',
);

// ── 3. Worklog: rond-protokoll ────────────────────────────────────────────────
steg('worklog: ROND 41-post');
const worklogRad = `
## ROND 41 [organ:Φ] — 2026-09-15T23:43-matningen: våg 174 (gap 13 scenariotest) STÄNGD på live-bevis — 7/7 PASS mot körande prod; städningsskuld landad
BESLUT: rundens våg = gap 13 (pipelinens bokade våg 174; RAM 1 074 MB med aktiva fabriksbarn uteslöt byggvågor — sviten är rent verktyg under verktyg/scenariotest/, inget src). VERKSTÄLLT: scenariotest.mjs med 7 scenarier (S0 bastjänster · S1 401-väggen 10 rutter · S6 publik hälsorutt med läckoskanning · S2 chatt-SSE-kontrakt · S3 komprimeringsknapp · S4 bilduppladdning · S5 metodkontrakt 405) + journal data/vakten/scenariotest/journal.jsonl. ROT-FYND under kalibreringen: (1) svitens egna 401-tester matar requireAdmin:s DELADE fel-bucket (10 fel/min, modul-singelton över ALLA admin-rutter — admin-auth.ts:51) — efter 10 avvisningar svarar hela admin-ytan 429 i 60 s (förklarade S1 grön/S2-S3 strypt); kur: 7 s-pacing mellan fel-producerande anrop (bucket ≤9 i rullande fönster) + 429-tolerans i kontraktet (429 sker FÖRE lösenordskontrollen inuti requireAdmin = väggen bevisad monterad); (2) sviten bar fel resync-sökväg (resync-v4 → korrekt tjanster/resync). RESULTAT: 7/7 PASS, samtliga rena 401 (noll 429 — pacingen höll), SSE-läckage 0. STÄDNING: 22 trackade tmp-deletioner (.tmp-deploy-*, _rond40-*) landade som commit (de kom med prods merge i rond 40 och rm:et fullföljdes aldrig som commit — känd skuld från rond 41-orienteringen). PIPELINE: 172+174 bockade LEVERERADE; ≥3 vågar köar (173 sessions-index, dataset-teman S7, evighetskatalogen).
`;
fs.appendFileSync(ROTT + '/worklog.md', worklogRad);
console.log('worklog: appenderad');

// ── 4. Commit: svit + register + pipeline + worklog + tmp-deletioner ─────────
steg('commit');
const msg = `studio: [organ:Φ] rond 41 — våg 174 gap 13 STÄNGD: scenariotest-sviten 7/7 PASS mot körande prod (10 skyddade rutter rena 401, SSE-läckage 0, hälsorutt 200/0 läckor, resync POST 405); kalibrerad mot admin-authens delade fel-bucket (10 fel/min singelton — roten till S2/S3-strypningen: varje 401-test matar bucketen; kur 7 s-pacing + 429-tolerans) + resync-sökväg rättad (tjanster/resync); journal data/vakten/scenariotest/journal.jsonl; städningsskuld landad (22 trackade tmp-deletioner .tmp-deploy-*/_rond40-*); pipeline: 172+174 bockade, 173 köar`;
fs.writeFileSync(ROTT + '/_rond41-msg.txt', msg);
kör('git add -A && git commit -F _rond41-msg.txt');
const hash = kör('git rev-parse --short HEAD').trim();
console.log('bokföringscommit: ' + hash);

// ── 5. Beslutsminne (äkta hash) + spegling till prods runtime-yta ────────────
steg('beslutsminne');
const minneRad = JSON.stringify({ ts: new Date().toISOString(), rond: 41, beslut: 'våg 174 gap 13 STÄNGD: scenariotest-svit 7/7 PASS; rot-fynd admin-fel-bucket 10/min → kur 7 s-pacing + 429-tolerans; 22 tmp-deletioner landade', landat: hash }) + '\n';
fs.appendFileSync(ROTT + '/data/vakten/beslutsminne.jsonl', minneRad);
try { fs.appendFileSync(PROD + '/data/vakten/beslutsminne.jsonl', minneRad); console.log('beslutsminne PROD: speglat'); } catch (e) { console.log('beslutsminne PROD-spegling: ' + e.message); }
console.log('beslutsminne ARB: appenderat');

// ── 6. Push prod med merge-retry ─────────────────────────────────────────────
steg('push prod');
let pushad = false;
for (let i = 1; i <= 6 && !pushad; i++) {
  try {
    const ut = kör('git push prod develop 2>&1');
    console.log('push-försök ' + i + ': OK');
    pushad = true;
  } catch (e) {
    const fel = String(e.stdout || '') + String(e.stderr || '');
    console.log('push-försök ' + i + ': avvisad — merge-retry');
    if (!fel.includes('fetch first') && !fel.includes('unborn') && !fel.includes('reject')) throw e;
    kör('git fetch prod develop && git merge prod/develop -m "merge: prod-framsteg rund 41" && git push prod develop 2>&1');
    console.log('merge-retry: PUSH OK');
    pushad = true;
  }
}
if (!pushad) throw new Error('push misslyckades efter 6 försök — RAPPORTERA BLOCKER');

// ── 7. Verifiering + städning ────────────────────────────────────────────────
steg('verifiering');
const prodHead = kör('git rev-parse --short HEAD', PROD).trim();
console.log('prod HEAD: ' + prodHead);
const arBarn = kör(`git merge-base --is-ancestor ${hash} HEAD && echo JA || echo NEJ`, PROD).trim();
console.log('commit i prod-historia: ' + arBarn);
if (arBarn !== 'JA') throw new Error('commit saknas i prod — verifiering misslyckades');
fs.rmSync(ROTT + '/_rond41-landa.mjs');
fs.rmSync(ROTT + '/_rond41-msg.txt');
for (const f of ['_rond41-git.mjs', '_rond41-sond.mjs']) { try { fs.rmSync(ROTT + '/' + f); } catch { /* borta */ } }
console.log('städat: _rond41-* borta');
console.log('ROND 41 LANDNING KLAR');
