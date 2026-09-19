#!/usr/bin/env node
// ROND 100 upprättning — PIPELINE-dubletter (idempotensbugg) deduperade + push-bugg kurerad + landning.
import { readFileSync, writeFileSync, openSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const steg = (m) => console.log(`[r100r] ${m}`);
const ok = (m) => console.log(`[r100r] ✓ ${m}`);
const fail = (m) => { console.error(`[r100r] ✗ ${m}`); process.exit(1); };
const cd = (arr) => execFileSync(arr[0], arr.slice(1).flat(3), { encoding: 'utf-8', cwd: ROT }).trim();

// ── 0. Säkerhetskontroller: mina commits är ospushade, trädet i väntat läge
cd(['git', ['fetch', 'prod', 'develop']]);
const head = cd(['git', ['rev-parse', 'HEAD']]);
let ospushad = false;
try { cd(['git', ['merge-base', '--is-ancestor', head, 'prod/develop']]); } catch { ospushad = true; }
if (!ospushad) fail('HEAD är redan i prod/develop — upprättelseskriptet är fel verktyg');
const statusRader = cd(['git', ['status', '--porcelain']]).split('\n').filter(Boolean);
const vitlista = ['?? verktyg/_r100-repair.mjs', '?? data/infra/SAMSYNK-ARBETSSTATION-SERVER.md'];
const oväntade = statusRader.filter((l) => !vitlista.includes(l));
if (oväntade.length) fail(`trädet bär oväntade rader: ${oväntade.join(' | ')}`);
ok('väntat tröskeläge (endast repair-skriptet + arbetsstationens samsynk-leverans)');
if (statusRader.includes('?? data/infra/SAMSYNK-ARBETSSTATION-SERVER.md')) {
  writeFileSync('/tmp/ak1a-r100r-sam.txt', 'studio: SAMSYNK ARBETSSTATION-SERVER — arbetsstationens protokoll-dokument (leverans via filkanalen 19:49, bevisat våg 189/rond 98); intaget okodat av huvudagenten\n');
  cd(['git', ['add', 'data/infra/SAMSYNK-ARBETSSTATION-SERVER.md']]);
  cd(['git', ['commit', '-F', '/tmp/ak1a-r100r-sam.txt']]);
  ok('arbetsstationens samsynk-dokument landat som egen commit (attribution bevarad)');
}

// ── 1. Dedupera PIPELINE-KO: våg 189-suffix ×N → ×1, våg 208–210-block ×N → ×1
const pk = `${ROT}/data/forskning/PIPELINE-KO.md`;
let t = readFileSync(pk, 'utf-8');
const S = ' — LIVE-STÄNGD rond 100 [Φ]: prod-bygge 17:39:46Z (BUILD_ID jGE19bmKpKXuSn3inM5_q, prod-HEAD 50638947 ⊇ 612994a5) bär lagret i client-chunk 1-izz7ywbi6pz.js · chunk 200 + hem 200 · kvitto data/vakten/v189-live-kvitto.json. LÄXA: bundeln escapar å/ä/ö som \\xNN-hex — live-sonder mot byggda chunks använder ASCII-fragment (rå UTF-8-probe ser dem ej).';
let nS = 0;
while (t.includes(S + S)) { t = t.split(S + S).join(S); nS++; }
const L1 = '- · VÅG 208 BOKAD (granskningskön — evighetsspår 1, förstahandsval): m9-utkastens granskning — kön 7 m9-utkast får oberoende KVD-kontroll + kö-vy-sektion i GRANSKNINGSKO-SAMMANSTALLNING.md (AR1–AR5-mönstret från rond 99); publicering förblir kundens (R2).';
const L2 = '- · VÅG 209 BOKAD (dataset-djup — evighetsspår 2): nästa omgång riktiga bolag i datasetdjupet via agentfabriks-manifest (mönster auto-s2: nordiska + internationella; KVD: tal-paritet, ALDRIG råd 2007:528).';
const L3 = '- · VÅG 210 BOKAD (AI-Mentorn — evighetsspår 6): elfte förhandsfrågelagret — nästa frågefamilj, kollisionskontroll mot 53 lager, källmärkning + kurslänkar per svar, utan API-kostnad (mönster våg 189); regressionstest + kedjevakt utökas.';
let rader = t.split('\n');
const L1ix = rader.map((l, i) => (l === L1 ? i : -1)).filter((i) => i >= 0);
let nB = 0;
for (const ix of L1ix.slice(1).reverse()) {
  if (rader[ix + 1] !== L2 || rader[ix + 2] !== L3) fail(`oväntad blockform vid rad ${ix} — manuell granskning krävs`);
  rader.splice(ix, 3); nB++;
}
t = rader.join('\n');
if (t.includes(S + S) || t.split('\n').filter((l) => l === L1).length !== 1) fail('dedupen höll inte');
writeFileSync(pk, t);
ok(`PIPELINE deduperad: 189-suffix −${nS} vederbörligen, 208–210-block −${nB} vederbörligen (nu ×1 var)`);

// ── 2. Kura landningsskriptets tre buggar i källan (committas som korrekt provenans)
const ls = `${ROT}/verktyg/_r100-landa.mjs`;
let k = readFileSync(ls, 'utf-8');
const kura = (namn, fran, till) => {
  if (k.split(fran).length - 1 !== 1) return fail(`landa-kura "${namn}": ankaret matchar inte exakt en gång`);
  k = k.replace(fran, till); ok(`landa-kura: ${namn}`);
};
kura('189-idempotensgrund', "ersatt('våg 189 LIVE-STÄNGD',", "if (!t.includes('LIVE-STÄNGD rond 100')) ersatt('våg 189 LIVE-STÄNGD',");
kura('208–210-idempotensgrund', "const r2Ankar = t.split('\\n').findIndex((l) => l.includes('⚠ R2-PAKET (väntar kund'));\nif (r2Ankar < 0) fail('R2-PAKET-ankaret hittades inte');",
  "const r2Ankar = t.includes('VÅG 208 BOKAD') ? -2 : t.split('\\n').findIndex((l) => l.includes('⚠ R2-PAKET (väntar kund'));\nif (r2Ankar === -2) ok('PIPELINE: 208–210 redan bokade — hoppar');\nelse if (r2Ankar < 0) fail('R2-PAKET-ankaret hittades inte');");
kura('208–210-infogningsskydd', "t = t.split('\\n').slice(0, r2Ankar).concat(nyaVagor, t.split('\\n').slice(r2Ankar)).join('\\n');",
  "if (r2Ankar >= 0) t = t.split('\\n').slice(0, r2Ankar).concat(nyaVagor, t.split('\\n').slice(r2Ankar)).join('\\n');");
kura('push-options-bugg', "try { const ut = cd(['git', ['push', 'prod', 'develop'], { stdio: ['ignore', 'pipe', 'pipe'] }]); pushad = true; ok(`push GRÖN (försök ${i})`); }",
  "try { cd(['git', ['push', 'prod', 'develop']]); pushad = true; ok(`push GRÖN (försök ${i})`); }");
writeFileSync(ls, k);

// ── 3. Upprättelsecommiten (PIPELINE + kurerad skriptkälla)
writeFileSync('/tmp/ak1a-r100r-msg.txt', `studio: ROND 100 upprättning [organ:Φ] — PIPELINE-dubletter deduperade + landningsskriptets idempotens/push-buggar kurerade

- Rot: landningsskriptets våg 189-ankar överlever sin egen ersättning (suffixet återinfogades per omkörning: ×3) och 208–210-infogningen saknade unikhetsskydd (block ×3) — deduperat till ×1 var utan innehållsförlust
- Push-bugg: options-objekt läckte in som git-refspec ("invalid refspec [object Object]") — kurerad i källan; idempotensgrunder tillagda på alla tre ställena
- Ospushat under hela felkroken: prod/develop orört (50638947) — inga dubletter nådde prod
`);
cd(['git', ['add', 'data/forskning/PIPELINE-KO.md', 'verktyg/_r100-landa.mjs', 'verktyg/_r100-repair.mjs']]);
cd(['git', ['commit', '-F', '/tmp/ak1a-r100r-msg.txt']]);
const hr = cd(['git', ['rev-parse', '--short', 'HEAD']]);
ok(`upprättelsecommit landad: ${hr} (genom tsc-grinden)`);

// ── 4. Push (rak, utan options) med fetch/merge-retry
let pushad = false;
for (let i = 1; i <= 6 && !pushad; i++) {
  try { cd(['git', ['push', 'prod', 'develop']]); pushad = true; ok(`push GRÖN (försök ${i})`); }
  catch {
    steg(`push försök ${i} refuserad — fetch+merge och om igen`);
    try { cd(['git', ['fetch', 'prod', 'develop']]); cd(['git', ['merge', 'FETCH_HEAD', '-m', 'Merge prod/develop (ROND 100 push-loop)']]); }
    catch (m) { fail(`merge med prod misslyckades: ${String(m).slice(0, 300)}`); }
  }
}
if (!pushad) fail('push misslyckad efter 6 försök — BLOCKER: ren-yta-grind hos prod? RAPPORTERA i worklog');
const hrFull = cd(['git', ['rev-parse', 'HEAD']]);
cd(['git', ['fetch', 'prod', 'develop']]);
let anfader = false;
try { cd(['git', ['merge-base', '--is-ancestor', hrFull, 'prod/develop']]); anfader = true; } catch { anfader = false; }
if (!anfader) fail(`${hr} är INTE anfader i prod/develop — manuell verifiering krävs`);
ok(`prod/develop innehåller ${hr}`);

// ── 5. Dispatcha gränssnittsvakten mot 17:39Z-bygget (bakgrund, logg i prod-trädet)
const logF = openSync(`${PROD}/data/vakten/granssnitt-r100-1739bygget.log`, 'a');
const barn = spawn('node', ['verktyg/granssnittsvakt.mjs', '--bas=http://localhost:3000'], { cwd: PROD, detached: true, stdio: ['ignore', logF, logF] });
barn.unref();
ok(`gränssnittsvakt dispatchad mot localhost (pid ${barn.pid}, logg data/vakten/granssnitt-r100-1739bygget.log)`);

console.log(`[r100r] KLAR: ${JSON.stringify({ hr, prodDevelop: cd(['git', ['rev-parse', '--short', 'prod/develop']]), vaktpid: barn.pid })}`);
