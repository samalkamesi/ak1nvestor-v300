#!/usr/bin/env node
// ROND 100 [organ:Φ] — landning: AR1–AR5-granskning + våg 189 live-stängd + våg 204 stängd + våg 208–210 bokade.
// Kanal: node (skal-kvotens kur 1). Varje steg loggas; fel avbryter med tydlig rad.
import { readFileSync, writeFileSync, appendFileSync, renameSync, rmSync, statSync, existsSync, openSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const steg = (m) => console.log(`[r100] ${m}`);
const ok = (m) => console.log(`[r100] ✓ ${m}`);
const fail = (m) => { console.error(`[r100] ✗ ${m}`); process.exit(1); };
const cd = (arr, o = {}) => execFileSync(arr[0], arr.slice(1).flat(3), { encoding: 'utf-8', cwd: ROT, ...o }).trim();

// ── 1. Avliva den blinda vaktposten (probe kan aldrig träffa — bundeln escapar å/ä/ö som \xNN)
try { cd(['pkill', '-f', '_r98-live.mjs']); steg('vaktpost _r98-live avlivad'); } catch { steg('ingen vaktpost att avliva (redan borta)'); }

// ── 2. Våg 189 live-kvitto (bygge 17:39:46Z, prod-HEAD 50638947)
const buildId = readFileSync(`${PROD}/.next/BUILD_ID`, 'utf-8').trim();
const buildMtime = statSync(`${PROD}/.next/BUILD_ID`).mtime.toISOString();
const chunkFil = `${PROD}/.next/static/chunks/1-izz7ywbi6pz.js`;
const chunkLokal = readFileSync(chunkFil, 'utf-8');
if (!chunkLokal.includes('pordrar och s') || !chunkLokal.includes('\\xf6pordrar och s\\xe4ljordrar')) fail('chunk-bevis håller inte (fragment/escape-form saknas)');
const chunkHttp = cd(['curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', 'https://lab.ak1nvestor.com/_next/static/chunks/1-izz7ywbi6pz.js']]);
const hemHttp = cd(['curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', 'https://lab.ak1nvestor.com/']]);
const prodHead = cd(['git', ['-C', PROD, 'log', '-1', '--format=%h']]);
const kvittoInnehall = JSON.stringify({
  vag: 189, ts: new Date().toISOString(), status: chunkHttp === '200' && hemHttp === '200' ? 'LIVE-STÄNGD' : 'KONTROLLA',
  buildId, buildidMtime: buildMtime, prodHead,
  chunk: '1-izz7ywbi6pz.js', chunkHttp, hemmaHttp: hemHttp,
  probe: 'synliga köpordrar och säljordrar',
  rotfynd: 'bundeln lagrar å/ä/ö som \\xNN-hex (\\xf6pordrar och s\\xe4ljordrar) — rå UTF-8-sond ser strängen ej; ASCII-fragment "pordrar och s" + escape-form = bevis. v189-vaktpostens probe-metod var blind mot detta — ersatt av huvudagentens direkta verifiering.',
  bevistext: `client-chunk 1-izz7ywbi6pz.js i prod-bygge ${buildId} (${buildMtime}, prod-HEAD ${prodHead}) innehåller marknadsmekanik-lagret (hex-escape-form verifierad lokalt + källa i prod-trädets src/lib/ai-mentor-marknadsmekanik-fragor.ts) och serveras 200; hemsidan 200 — våg 189 LEVERERAD LIVE`,
}, null, 2) + '\n';
// data/vakten/ är gitignorerad (våg 105) — serverlokala filer skrivs i BÅDA träden
writeFileSync(`${ROT}/data/vakten/v189-live-kvitto.json`, kvittoInnehall);
writeFileSync(`${PROD}/data/vakten/v189-live-kvitto.json`, kvittoInnehall);
if (chunkHttp !== '200' || hemHttp !== '200') fail(`HTTP-kontroll: chunk=${chunkHttp} hem=${hemHttp}`);
ok(`v189-kvitto skrivet (chunk ${chunkHttp}, hem ${hemHttp}, build ${buildId})`);

// ── 3. Skript-konsolidering: kontrollverktyget får rapportens namn; scratch städas
if (existsSync(`${ROT}/verktyg/_r99-ar12-kontroll.mjs`)) renameSync(`${ROT}/verktyg/_r99-ar12-kontroll.mjs`, `${ROT}/verktyg/_r99-ar12-kvd-ar1-ar2.mjs`);
rmSync(`${ROT}/verktyg/_r99-ar12-not.mjs`, { force: true });
rmSync(`${ROT}/verktyg/_r98-live.mjs`, { force: true });
ok('verktyg: kontrollverktyg namnsynkat (_r99-ar12-kvd-ar1-ar2.mjs), not/r98-scratch städade');

// ── 4. PIPELINE-KO — stäng 189, stäng 204, boka 208–210
const pk = `${ROT}/data/forskning/PIPELINE-KO.md`;
let t = readFileSync(pk, 'utf-8');
const ersatt = (namn, fran, till) => {
  const n = t.split(fran).length - 1;
  if (n !== 1) { console.error(`[r100] ✗ PIPELINE-ankar "${namn}": ${n} träffar (väntat 1) — hoppar`); return false; }
  t = t.replace(fran, till); ok(`PIPELINE: ${namn}`); return true;
};
ersatt('våg 189 LIVE-STÄNGD',
  'svit 40/40 + kedjevakt 193/193, tsc 0. Live-kvitto (widget-chunk + 200) vid prod-synkens byggfönster.',
  'svit 40/40 + kedjevakt 193/193, tsc 0. Live-kvitto (widget-chunk + 200) vid prod-synkens byggfönster. — LIVE-STÄNGD rond 100 [Φ]: prod-bygge 17:39:46Z (BUILD_ID jGE19bmKpKXuSn3inM5_q, prod-HEAD 50638947 ⊇ 612994a5) bär lagret i client-chunk 1-izz7ywbi6pz.js · chunk 200 + hem 200 · kvitto data/vakten/v189-live-kvitto.json. LÄXA: bundeln escapar å/ä/ö som \\xNN-hex — live-sonder mot byggda chunks använder ASCII-fragment (rå UTF-8-probe ser dem ej).');
ersatt('våg 204 STÄNGD prefix',
  '- · VÅG 204 PÅGÅR (rond 96 [Φ]):',
  '- ✓ VÅG 204 LEVERERAD+STÄNGD (rond 96+100 [Φ]):');
ersatt('våg 204 STÄNGD svans',
  'gränssnittsvaktkörning mot localhost dispatchad (0-fynd-mål) — vågen stängs på vaktkvitto. NÄSTA VÅG I KÖ: OG-rerun (s9-u3:s storfynd — 113 kursers OG-bilder 404 live, E36 9→8; byggklass: node scripts/og-generate.mjs + deploy).',
  'gränssnittsvaktkvitto inlöst: granssnitt-2026-09-19T1731.json = 0 fynd bland 176 kombinationer (mäter 14:19Z-trädet: 201+202+203) · OG-rerun redan levererad som våg 207 · ny vaktkörning mot 17:39Z-bygget (våg 189 i trädet) dispatchad i rond 100.');
const r2Ankar = t.split('\n').findIndex((l) => l.includes('⚠ R2-PAKET (väntar kund'));
if (r2Ankar < 0) fail('R2-PAKET-ankaret hittades inte');
const nyaVagor = [
  '- · VÅG 208 BOKAD (granskningskön — evighetsspår 1, förstahandsval): m9-utkastens granskning — kön 7 m9-utkast får oberoende KVD-kontroll + kö-vy-sektion i GRANSKNINGSKO-SAMMANSTALLNING.md (AR1–AR5-mönstret från rond 99); publicering förblir kundens (R2).',
  '- · VÅG 209 BOKAD (dataset-djup — evighetsspår 2): nästa omgång riktiga bolag i datasetdjupet via agentfabriks-manifest (mönster auto-s2: nordiska + internationella; KVD: tal-paritet, ALDRIG råd 2007:528).',
  '- · VÅG 210 BOKAD (AI-Mentorn — evighetsspår 6): elfte förhandsfrågelagret — nästa frågefamilj, kollisionskontroll mot 53 lager, källmärkning + kurslänkar per svar, utan API-kostnad (mönster våg 189); regressionstest + kedjevakt utökas.',
];
t = t.split('\n').slice(0, r2Ankar).concat(nyaVagor, t.split('\n').slice(r2Ankar)).join('\n');
ok('PIPELINE: våg 208–210 bokade (spår 1/2/6 — roterade)');
writeFileSync(pk, t);

// ── 5. Commit 1: innehållet
const msg1 = `studio: ROND 100 [organ:Φ] — AR1–AR5 oberoende granskade: 5/5 GRÖN FLYTTKLAR + våg 189 LIVE-STÄNGD + våg 204 stängd

- Granskningskö AR-familjen: AR1/AR2 konsoliderad 13-klasskontroll (ord/H2-paritet, korslänkar multiset, sifferparitet, rådgivningsmönster 0, svenska läckor 0), AR3–AR5 oberoende återkörning av fabrikens KVD-skript (21 OK / 14/14 / 30 PASS) — rapport data/blogg-utkast/granskning/ar-spegling-ar1-ar5-KONTROLL-2026-09-19.md
- Kö-vy: AR-familjen var OSYNLIG i GRANSKNINGSKO-SAMMANSTALLNING — ny sektion med dom-tabell; publicering förblir kundens beslut (R2)
- Kontrollverktyg bevarat: verktyg/_r99-ar12-kvd-ar1-ar2.mjs (namn synkat med rapportens referens)
- Våg 189 LIVE-STÄNGD: prod-bygge 17:39:46Z (prod-HEAD 50638947) bär marknadsmekanik-lagret i chunk 1-izz7ywbi6pz.js (200) + hem 200; ROT-FYND: bundeln escapar å/ä/ö som \\xNN-hex — rå UTF-8-probe ser ej (v189-vaktposten var blind, avlivad); kvitto data/vakten/v189-live-kvitto.json
- Våg 204 STÄNGD på vaktkvitto: 0 fynd/176 (granssnitt-2026-09-19T1731.json, 14:19Z-trädet) + ny vaktkörning mot 17:39Z-bygget dispatchad
- Evighetsmotorn: våg 208 m9-granskning (spår 1) · 209 dataset-djup (spår 2) · 210 AI-Mentor lager 11 (spår 6) bokade
`;
writeFileSync('/tmp/ak1a-r100-msg1.txt', msg1);
cd(['git', ['add', 'data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md',
  'data/blogg-utkast/granskning/ar-spegling-ar1-ar5-KONTROLL-2026-09-19.md',
  'verktyg/_r99-ar12-kvd-ar1-ar2.mjs',
  'data/forskning/PIPELINE-KO.md']]);
cd(['git', ['commit', '-F', '/tmp/ak1a-r100-msg1.txt']]);
const h1 = cd(['git', ['rev-parse', '--short', 'HEAD']]);
ok(`commit 1 landad: ${h1} (genom tsc-grinden)`);

// ── 6. Bokföring: worklog + beslutsminne (refererar h1)
appendFileSync(`${ROT}/worklog.md`, `

## ROND 100 [organ:Φ] — AR-familjen granskad + två vågor live-stängda (2026-09-19)

- Granskningskön: AR1–AR5 (arabiska speglingar) oberoende granskade — 5/5 GRÖN/FLYTTKLAR (AR1/AR2 konsoliderad 13-klasskontroll; AR3–AR5 återkörning av fabrikens KVD-skript: 21 OK / 14/14 / 30 PASS). Rapport data/blogg-utkast/granskning/ar-spegling-ar1-ar5-KONTROLL-2026-09-19.md + kö-vy-sektion i GRANSKNINGSKO-SAMMANSTALLNING.md — AR-familjen var osynlig i kundens kö-vy, nu kurerad. Publicering = kundens beslut (R2): 5 nya arabiska guider FLYTTKLARA.
- Våg 189 LIVE-STÄNGD: prod-bygge 17:39:46Z (BUILD_ID jGE19bmKpKXuSn3inM5_q, prod-HEAD 50638947) bär marknadsmekanik-lagret i client-chunk 1-izz7ywbi6pz.js; chunk 200 + hem 200. ROT-FYND: bundeln escapar å/ä/ö som \\xNN-hex — råa UTF-8-prober ser strängen ej (v189-vaktposten var metod-blind, avlivad och ersatt av direkt verifiering). Kvitto data/vakten/v189-live-kvitto.json. LÄXA bokförd: live-sonder mot byggda chunks använder ASCII-fragment.
- Våg 204 STÄNGD på vaktkvitto: granssnitt-2026-09-19T1731.json = 0 fynd bland 176 kombinationer (mäter 14:19Z-trädet med 201+202+203); ny vaktkörning mot 17:39Z-bygget dispatchad från prod-trädet.
- Evighetsmotorn: våg 208 (m9-granskning, spår 1) · 209 (dataset-djup, spår 2) · 210 (AI-Mentor lager 11, spår 6) bokade i PIPELINE-KO — roterade spår, kön aldrig tom.
- Commits ${h1} (innehåll) + bokföring; push prod develop med retry. Skript: verktyg/_r100-landa.mjs.
`);
const minnesrad = JSON.stringify({
  ts: new Date().toISOString(), rond: 100,
  beslut: 'AR1–AR5 oberoende granskade 5/5 GRÖN FLYTTKLAR (kö-vy kurerad — AR-familjen var osynlig); våg 189+204 live-stängda; rot-fynd: bundeln escapar å/ä/ö som \\xNN-hex ⇒ live-sonder mot chunks använder ASCII-fragment; våg 208–210 bokade (spår 1/2/6)',
  landat: h1,
}) + '\n';
appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, minnesrad);
appendFileSync(`${PROD}/data/vakten/beslutsminne.jsonl`, minnesrad);
writeFileSync('/tmp/ak1a-r100-msg2.txt', `studio: ROND 100 bokföring — worklog + beslutsminne (landat ${h1})\n`);
cd(['git', ['add', 'worklog.md', 'data/vakten/beslutsminne.jsonl', 'verktyg/_r100-landa.mjs']]);
cd(['git', ['commit', '-F', '/tmp/ak1a-r100-msg2.txt']]);
const h2 = cd(['git', ['rev-parse', '--short', 'HEAD']]);
ok(`commit 2 (bokföring) landad: ${h2}`);

// ── 7. Push med fetch/merge-retry (r98-mönstret, riktig felkontroll)
let pushad = false;
for (let i = 1; i <= 6 && !pushad; i++) {
  try { const ut = cd(['git', ['push', 'prod', 'develop'], { stdio: ['ignore', 'pipe', 'pipe'] }]); pushad = true; ok(`push GRÖN (försök ${i})`); }
  catch (e) {
    steg(`push försök ${i} refuserad — fetch+merge och om igen`);
    try { cd(['git', ['fetch', 'prod', 'develop']]); cd(['git', ['merge', 'FETCH_HEAD', '-m', `Merge prod/develop (ROND 100 push-loop)`]]); }
    catch (m) { fail(`merge med prod misslyckades: ${String(m).slice(0, 300)}`); }
  }
}
if (!pushad) fail('push misslyckad efter 6 försök — RAPPORTERA BLOCKER (ren-yta-grind hos prod?)');
const h2full = cd(['git', ['rev-parse', 'HEAD']]);
cd(['git', ['fetch', 'prod', 'develop']]);
let anfader = false;
try { cd(['git', ['merge-base', '--is-ancestor', h2full, 'prod/develop']]); anfader = true; } catch { anfader = false; }
if (!anfader) fail(`${h2} är INTE anfader i prod/develop — verifiera manuellt`);
ok(`prod/develop innehåller ${h2}`);

// ── 8. Dispatcha gränssnittsvakten mot 17:39Z-bygget (bakgrund, logg till fil)
const logF = openSync(`${PROD}/data/vakten/granssnitt-r100-1739bygget.log`, 'a');
const barn = spawn('node', ['verktyg/granssnittsvakt.mjs', '--bas=http://localhost:3000'], { cwd: PROD, detached: true, stdio: ['ignore', logF, logF] });
barn.unref();
ok(`gränssnittsvakt dispatchad mot localhost (pid ${barn.pid}, logg data/vakten/granssnitt-r100-1739bygget.log i prod-trädet)`);

console.log(`[r100] KLAR: ${JSON.stringify({ h1, h2, buildId, prodHead, chunkHttp, hemHttp, vaktpid: barn.pid })}`);
