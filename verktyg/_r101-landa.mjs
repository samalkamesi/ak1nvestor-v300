#!/usr/bin/env node
// ROND 101 [organ:Φ] — landning: våg 208 del 1 (kassaflodesanalys-101 GRÖN + m9-kö-vy) + vaktkvitto på våg 189-raden.
import { readFileSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const ok = (m) => console.log(`[r101] ✓ ${m}`);
const fail = (m) => { console.error(`[r101] ✗ ${m}`); process.exit(1); };
const cd = (arr) => execFileSync(arr[0], arr.slice(1).flat(3), { encoding: 'utf-8', cwd: ROT }).trim();

// ── 1. PIPELINE-KO: våg 208 → del 1 levererad; våg 189-raden får vaktkvittot
const pk = `${ROT}/data/forskning/PIPELINE-KO.md`;
let t = readFileSync(pk, 'utf-8');
const redigera = (villkorsText, namn, fran, till) => {
  if (villkorsText && t.includes(villkorsText)) { ok(`PIPELINE: ${namn} redan verkställt — hoppar`); return; }
  const n = t.split(fran).length - 1;
  if (n !== 1) return fail(`PIPELINE-ankar "${namn}": ${n} träffar (väntat 1)`);
  t = t.replace(fran, till); ok(`PIPELINE: ${namn}`);
};
redigera('DEL 1 LEVERERAD', 'våg 208 del 1',
  '- · VÅG 208 BOKAD (granskningskön — evighetsspår 1, förstahandsval): m9-utkastens granskning — kön 7 m9-utkast får oberoende KVD-kontroll + kö-vy-sektion i GRANSKNINGSKO-SAMMANSTALLNING.md (AR1–AR5-mönstret från rond 99); publicering förblir kundens (R2).',
  '- · VÅG 208 PÅGÅR — DEL 1 LEVERERAD (rond 101 [Φ]): m9-utkastens granskning + kö-vy. DEL 1: m9-familjen synlig i GRANSKNINGSKO-SAMMANSTALLNING (ny sektion, 6 rader — var tidigare osynlig i kundens vy) + kassaflodesanalys-101 GRÖN FLYTTKLAR — oberoende KVD 26/26 (original återvunnet ur git f3f56268 md5-exakt; samtliga tal omräknade: n/median fcfMarginal 92/10,8 % · fcfYield 87/3 % · konverteringsgrad 84/0,78/29>1 med divisionsvakten nettoMarginal>0 · fördelning 26/28/33+9 · globala topp/botten-5 + 10 tickervärden exakta; juridikgrind 0 träffar; KONTROLL + verktyg committat). DEL 2 VÄNTAR: boerspsykologi-fallstugor · branschmedianer-akm2 v2 · forskningslaget-grona-av-100 (samma mönster). Publicering förblir kundens (R2).');
redigera('Vaktkvitto 18:03', 'våg 189 vaktkvitto',
  'live-sonder mot byggda chunks använder ASCII-fragment (rå UTF-8-probe ser dem ej).',
  'live-sonder mot byggda chunks använder ASCII-fragment (rå UTF-8-probe ser dem ej). Vaktkvitto 18:03: 0 fynd/176 även för detta träd (granssnitt-2026-09-19T1803.json).');
writeFileSync(pk, t);

// ── 2. Städa sonden (scratch)
rmSync(`${ROT}/verktyg/_r101-sond.mjs`, { force: true });
ok('sond städad (KVD-verktyget bevaras som provenans)');

// ── 3. Commit 1: innehållet
writeFileSync('/tmp/ak1a-r101-msg1.txt', `studio: ROND 101 [organ:Φ] — våg 208 del 1: kassaflodesanalys-101 GRÖN FLYTTKLAR (26/26) + m9-kön synlig

- Oberoende KVD av m9 #3 kassaflodesanalys-101 (v1): original-underlaget återvunnet ur git (f3f56268, md5 f4cee658 EXAKT — dagens universum har vuxit 100→207, utkastet verifieras mot sitt eget dokumenterade underlag); 26 kontroller 0 fel: n/median FCF-marginal 92/10,8 % · FCF-avkastning 87/3 % · konverteringsgrad 84/0,78/29>1,0 (divisionsvakten nettoMarginal>0 — granskaren feläsning kurerad) · fördelning 26/28/33 varav 9 negativa med summakontroll · globala topp-5/botten-5 FCF-marginal (uppsättning+ordning+10 tickervärden exakta) · hamtat 100/100 · juridikgrind 0 (forbjudnaFraser-regex + rådgivningsglossor + disclaimer sist)
- KONTROLL: data/blogg-utkast/granskning/kassaflodesanalys-101-KONTROLL-2026-09-19.md (observationer: titel 86 tkn i serieformat, omslag null, determinism-sektion utanför scope — tal-täckningen ekvivalent)
- m9-kö-vy: familjen var OSYNIG i GRANSKNINGSKO-SAMMANSTALLNING — ny sektion med 6 rader (3 FLYTTKLARA: utdelningar 09-16 · vagkartan 09-16 · kassaflödesanalys 101 nu; 3 väntar = 208 del 2)
- PIPELINE-KO: 208 → DEL 1 LEVERERAD · våg 189-raden får vaktkvittot 18:03 (0 fynd/176 även för 189-trädet)
- Publicering förblir kundens beslut (R2)
`);
cd(['git', ['add', 'data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md',
  'data/blogg-utkast/granskning/kassaflodesanalys-101-KONTROLL-2026-09-19.md',
  'verktyg/_r101-kvd-kassaflode.mjs',
  'data/forskning/PIPELINE-KO.md']]);
let h1;
const s1 = cd(['git', ['status', '--porcelain']]);
if (s1.split('\n').some((l) => /^[AMD] /.test(l))) {
  cd(['git', ['commit', '-F', '/tmp/ak1a-r101-msg1.txt']]);
  h1 = cd(['git', ['rev-parse', '--short', 'HEAD']]);
  ok(`commit 1 landad: ${h1} (genom tsc-grinden)`);
} else { h1 = cd(['git', ['rev-parse', '--short', 'HEAD']]); ok(`commit 1 redan landad: ${h1}`); }

// ── 4. Bokföring (idempotent): worklog + beslutsminne i båda träden
if (!readFileSync(`${ROT}/worklog.md`, 'utf-8').includes('ROND 101 [organ:Φ]')) {
  appendFileSync(`${ROT}/worklog.md`, `

## ROND 101 [organ:Φ] — våg 208 del 1: m9-granskningen igång (2026-09-19)

- Vakten domade först: 0 fynd/176 även för 189-trädet (granssnitt-2026-09-19T1803.json) — ROND 100:s sista bevisloop sluten; kvittot tillagt på våg 189-raden i PIPELINE-KO.
- Våg 208 del 1 LEVERERAD: kassaflodesanalys-101 (m9 #3) GRÖN FLYTTKLAR — oberoende KVD 26/26 med original-underlaget återvunnet ur git (f3f56268, md5-exakt; dagens universum 207 bolag gör återvinningen obligatorisk). Granskarens två egna feläsningar kurerade under rundan: konverteringsgradens divisionsvakt (nettoMarginal>0) och topp/botten-listornas globala (ej per-bransch) lydelse. Juridikgrind: forbudnaFraser-regex + rådgivningsglossor 0 träffar, disclaimer sist.
- m9-familjen (6 utkast) var OSYNIG i kundens kö-vy — ny sektion i GRANSKNINGSKO-SAMMANSTALLNING: 3 FLYTTKLARA (utdelningar, vagkartan, kassaflödesanalys), 3 väntar (= 208 del 2: boerspsykologi-fallstugor, branschmedianer-akm2 v2, forskningslaget-grona-av-100).
- Sond-lärda kuror: git-show-md5 måste beräknas över buffert (trim förstör), sv-SE-lokalens U+2212-minus gör strängjämförelser av tal opålitliga (jämför numeriskt). Verktyg: verktyg/_r101-kvd-kassaflode.mjs (provenans, idempotenta grunder).
- Commit ${h1} + bokföring; push prod develop.
`);
}
const minnesrad = JSON.stringify({ ts: new Date().toISOString(), rond: 101, beslut: 'våg 208 del 1: kassaflodesanalys-101 GRÖN FLYTTKLAR (26/26 mot git-återvunnet md5-exakt original) + m9-kön (6 utkast) synlig i kö-vyn; vaktkvitto 0/176 för 189-trädet; 3 m9 kvar (208 del 2)', landat: h1 }) + '\n';
if (!readFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, 'utf-8').split('\n').some((l) => l.includes('"rond":101,'))) {
  appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, minnesrad);
  appendFileSync(`${PROD}/data/vakten/beslutsminne.jsonl`, minnesrad);
}
writeFileSync('/tmp/ak1a-r101-msg2.txt', `studio: ROND 101 bokföring — worklog + beslutsminne (landat ${h1})\n`);
cd(['git', ['add', 'worklog.md', 'verktyg/_r101-landa.mjs']]);
let h2;
const s2 = cd(['git', ['status', '--porcelain']]);
if (s2.split('\n').some((l) => /^[AMD] /.test(l))) {
  cd(['git', ['commit', '-F', '/tmp/ak1a-r101-msg2.txt']]);
  h2 = cd(['git', ['rev-parse', '--short', 'HEAD']]);
  ok(`commit 2 (bokföring) landad: ${h2}`);
} else { h2 = cd(['git', ['rev-parse', '--short', 'HEAD']]); ok(`commit 2 redan landad: ${h2}`); }

// ── 5. Push med fetch/merge-retry
let pushad = false;
for (let i = 1; i <= 6 && !pushad; i++) {
  try { cd(['git', ['push', 'prod', 'develop']]); pushad = true; ok(`push GRÖN (försök ${i})`); }
  catch {
    console.log(`[r101] push försök ${i} refuserad — fetch+merge och om igen`);
    try { cd(['git', ['fetch', 'prod', 'develop']]); cd(['git', ['merge', 'FETCH_HEAD', '-m', 'Merge prod/develop (ROND 101 push-loop)']]); }
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
console.log(`[r101] KLAR: ${JSON.stringify({ h1, h2, prodDevelop: cd(['git', ['rev-parse', '--short', 'prod/develop']]) })}`);
