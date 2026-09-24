#!/usr/bin/env node
// ROND 102 [organ:Φ] — landning: våg 208 DEL 2 + STÄNGNING (m9-familjen 6/6 FLYTTKLARA).
import { readFileSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const ok = (m) => console.log(`[r102] ✓ ${m}`);
const fail = (m) => { console.error(`[r102] ✗ ${m}`); process.exit(1); };
const cd = (arr) => execFileSync(arr[0], arr.slice(1).flat(3), { encoding: 'utf-8', cwd: ROT }).trim();

// ── 1. PIPELINE-KO: våg 208 → LEVERERAD+STÄNGD
const pk = `${ROT}/data/forskning/PIPELINE-KO.md`;
let t = readFileSync(pk, 'utf-8');
if (t.includes('VÅG 208 LEVERERAD+STÄNGD')) {
  ok('PIPELINE: våg 208 redan stängd — hoppar');
} else {
  const prefix = '- · VÅG 208 PÅGÅR — DEL 1 LEVERERAD (rond 101 [Φ]):';
  const ix = t.split('\n').findIndex((l) => l.startsWith(prefix));
  if (ix < 0) fail('våg 208-raden hittades inte');
  const rader = t.split('\n');
  rader[ix] = '- ✓ VÅG 208 LEVERERAD+STÄNGD (rond 101–102 [Φ]): m9-utkastens granskning komplett — FAMILJEN 6/6 FLYTTKLARA (mönster: AR1–AR5 rond 99). Del 1 (r101): kö-vy-sektion i GRANSKNINGSKO-SAMMANSTALLNING + kassaflodesanalys-101 GRÖN 26/26 (original återvunnet ur git f3f56268 md5-exakt). Del 2 (r102): boerspsykologi-fallstugor 11 kontroller (totalt-block 52 %/48/20 exakt · vågklasser kort-impuls 100 %/n=2 och medellång+mega/basbygge 0/12 exakta · sannolikhetsaritmetik 25 % och 0,02 % verifierad · protokollcitat "osatt klass döms ALDRIG" ordagrant i källan) · branschmedianer-akm2 v2 25 kontroller (tio branscher median+spridning — 20 värden samtliga exakta; v1 supersederad) · forskningslaget-grona-av-100 13 kontroller (status 7/76/17/0 exakt · tre gröna toppbolag INDU-C/NEM/INVE-B verifierade · regimslutet magert internt konsistent, trösklarna är utkastets eget analysram) — totalt 56/56 0 fel · juridikgrind 0 träffar ×3 · samtliga källor md5-MATCH i dagens träd (ingen git-återvinning behövdes). Publicering förblir kundens beslut (R2): elva FLYTTKLARA guider i kön (AR1–AR5 + m9 ×6).';
  t = rader.join('\n');
  ok('PIPELINE: våg 208 LEVERERAD+STÄNGD');
}
writeFileSync(pk, t);

// ── 2. Städa sonden
rmSync(`${ROT}/verktyg/_r102-sond.mjs`, { force: true });
ok('sond städad (KVD-verktyget bevaras)');

// ── 3. Commit 1: innehållet
writeFileSync('/tmp/ak1a-r102-msg1.txt', `studio: ROND 102 [organ:Φ] — våg 208 STÄNGD: m9-familjen komplett 6/6 FLYTTKLARA (56/56 kontroller)

- Oberoende KVD av de tre sista m9-utkasten (56 kontroller 0 fel, källor md5-MATCH i dagens träd):
  · boerspsykologi-fallstugor (11): totalt-block 52 %/n=48/osatta 20 % exakt · kort/impulsvåg 100 % på n=2 · medellång+mega/basbygge 0 träffar på n=12 · sannolikhetspedagogiken P(2/2)=25 % och P(0/12)≈0,02 % aritmetiskt verifierad · protokollregeln citerad ordagrant ur källan
  · branschmedianer-akm2 v2 (25): 100 bolag 10×10 · tio branschers median AKM2 + spridning — 20 värden samtliga exakta
  · forskningslaget-grona-av-100 (13): statusfördelning 7/76/17/0 exakt · tre gröna toppbolag (INDU-C 58,1/67 · NEM 55,1/71,1 · INVE-B 54/62,9) verifierade · regimslutet magert internt konsistent (trösklarna = utkastets eget analysram, redovisat)
- Juridikgrind ×3: forbudnaFraser 0 · rådgivningsglossor 0 · disclaimer sist
- KONTROLL: granskning/boerspsykologi-branschmedianer-forskningslaget-KONTROLL-2026-09-19.md · kö-vyn uppdaterad (familjen komplett)
- PIPELINE-KO: våg 208 LEVERERAD+STÄNGD · publicering förblir kundens beslut (R2)
`);
cd(['git', ['add', 'data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md',
  'data/blogg-utkast/granskning/boerspsykologi-branschmedianer-forskningslaget-KONTROLL-2026-09-19.md',
  'verktyg/_r102-kvd-tre.mjs',
  'data/forskning/PIPELINE-KO.md']]);
let h1;
const s1 = cd(['git', ['status', '--porcelain']]);
if (s1.split('\n').some((l) => /^[AMD] /.test(l))) {
  cd(['git', ['commit', '-F', '/tmp/ak1a-r102-msg1.txt']]);
  h1 = cd(['git', ['rev-parse', '--short', 'HEAD']]);
  ok(`commit 1 landad: ${h1} (genom tsc-grinden)`);
} else { h1 = cd(['git', ['rev-parse', '--short', 'HEAD']]); ok(`commit 1 redan landad: ${h1}`); }

// ── 4. Bokföring (idempotent)
if (!readFileSync(`${ROT}/worklog.md`, 'utf-8').includes('ROND 102 [organ:Φ]')) {
  appendFileSync(`${ROT}/worklog.md`, `

## ROND 102 [organ:Φ] — våg 208 STÄNGD: m9-familjen komplett 6/6 FLYTTKLARA (2026-09-19)

- Våg 208 del 2 LEVERERAD + vågen STÄNGD: de tre sista m9-utkasten oberoende granskade — 56/56 kontroller 0 FEL, samtliga källor fortfarande md5-exakta i dagens träd (ingen git-återvinning behövdes denna gång): boerspsykologi-fallstugor (vågklassernas sannolikhetspedagogik aritmetiskt verifierad: 0,5²=25 %, 0,5¹²≈0,02 %) · branschmedianer-akm2 v2 (tio branscher × median+spridning, 20 värden exakta) · forskningslaget-grona-av-100 (statusfördelning och tre gröna toppbolag exakta; regimtrösklarna är utkastets eget analysram — internt konsistent, ärligt redovisat).
- Juridikgrind: forbudnaFraser-regex + rådgivningsglossor 0 träffar ×3, disclaimer sist ×3.
- m9-familjen därmed 6/6 FLYTTKLARA; granskningskön totalt: AR1–AR5 + m9 ×6 = elva FLYTTKLARA guider väntar kundens publiceringsbeslut (R2).
- KONTROLL: granskning/boerspsykologi-branschmedianer-forskningslaget-KONTROLL-2026-09-19.md · verktyg verktyg/_r102-kvd-tre.mjs (provenans).
- Commit ${h1} + bokföring; push prod develop.
`);
}
const minnesrad = JSON.stringify({ ts: new Date().toISOString(), rond: 102, beslut: 'våg 208 STÄNGD: m9-familjen 6/6 FLYTTKLARA (del 2: 56/56 kontroller — boerspsykologi, branschmedianer v2, forskningsläget; källor md5-MATCH); kön totalt 11 FLYTTKLARA väntar kund (R2)', landat: h1 }) + '\n';
if (!readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf-8').split('\n').some((l) => l.includes('"rond":102,'))) {
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, minnesrad);
  appendFileSync(`${PROD}/data/vakten/beslutsminne.jsonl`, minnesrad);
}
writeFileSync('/tmp/ak1a-r102-msg2.txt', `studio: ROND 102 bokföring — worklog + beslutsminne (landat ${h1})\n`);
cd(['git', ['add', 'worklog.md', 'verktyg/_r102-landa.mjs']]);
let h2;
const s2 = cd(['git', ['status', '--porcelain']]);
if (s2.split('\n').some((l) => /^[AMD] /.test(l))) {
  cd(['git', ['commit', '-F', '/tmp/ak1a-r102-msg2.txt']]);
  h2 = cd(['git', ['rev-parse', '--short', 'HEAD']]);
  ok(`commit 2 (bokföring) landad: ${h2}`);
} else { h2 = cd(['git', ['rev-parse', '--short', 'HEAD']]); ok(`commit 2 redan landad: ${h2}`); }

// ── 5. Push med fetch/merge-retry
let pushad = false;
for (let i = 1; i <= 6 && !pushad; i++) {
  try { cd(['git', ['push', 'prod', 'develop']]); pushad = true; ok(`push GRÖN (försök ${i})`); }
  catch {
    console.log(`[r102] push försök ${i} refuserad — fetch+merge och om igen`);
    try { cd(['git', ['fetch', 'prod', 'develop']]); cd(['git', ['merge', 'FETCH_HEAD', '-m', 'Merge prod/develop (ROND 102 push-loop)']]); }
    catch (m) { fail(`merge med prod misslyckades: ${String(m).slice(0, 300)}`); }
  }
}
if (!pushad) fail('push misslyckad efter 6 försök — RAPPORTERA BLOCKER i worklog');
const h2full = cd(['git', ['rev-parse', 'HEAD']]);
cd(['git', ['fetch', 'prod', 'develop']]);
let anfader = false;
try { cd(['git', ['merge-base', '--is-ancestor', h2full, 'prod/develop']]); anfader = true; } catch { anfader = false; }
if (!anfader) fail(`${h2} är INTE anfader i prod/develop`);
ok(`prod/develop innehåller ${h2}`);
console.log(`[r102] KLAR: ${JSON.stringify({ h1, h2, prodDevelop: cd(['git', ['rev-parse', '--short', 'prod/develop']]) })}`);
