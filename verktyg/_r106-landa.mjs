#!/usr/bin/env node
// ROND 106 — worklog + beslutsminne + commit [organ:Φ] + push (pushern levererar)
import { appendFileSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const run = (c, a, o = {}) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8', ...o }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };

const wl = `${ARB}/worklog.md`;
if (!readFileSync(wl, 'utf-8').includes('ROND 106 — våg 211 DISPATCHAD')) {
  appendFileSync(wl, `

## ROND 106 [organ:Φ] — 2026-09-19 ~22:10 lokal: VÅG 211 DISPATCHAD (SEO-guidernas översättningsomgång) + v209-pågår + tre bevakare löper

R105-efterläge: vänta-pushern (pid 3195558) cyklar mot prod-ytans ren-grind (fabriksbarn v209-u3:s unstaged
changes — pushlogg försök 1-4 refuserade 21:23-21:26Z); deploy-bevakaren (3195698) väntar push-kvittot för
v210-chunk-sonden; ISR-bevakaren (3190243) bevakar nattens 03:10-körning. Fabriken: v209 u1 VESTAS + u2
SMFG/AXA klara exit 0, u3 löper — universumet 210 bolag EGEN sond. VÅG 211 = SEO-guidernas översättnings-
omgång: mallens egen deklarerade ordning styjde valet ("svenska objekten SLUT — nästa lediga = kvarvarande
-en-översättningarna i B-ordning, därefter arabiska") — skogs-idén (SCA/HOLM i universumet) avstods till
förmån för spårets egen kö: FEM guider saknar -en (B18 livsmedel, B20 lyx, B21 logistik, B22 krypto,
B23 utbildning). Manifest v211-oversattning-1789853364271 (3 byggare × 2 guider, sista tar även första -ar)
i ko/ BÅDA träd — köar bakom v209, plockas vid nästa lediga pump. KVD per uppgift: TAL-PARITET bit-identisk
mot original (mekanisk diff), engelska UTBILDNINGSformuleringar (2007:528), korslänkar = originalets
verifierade ytor (inga nya — partiell publicering skapar aldrig 404), varumärkesgrind 0, lagrum/myndighets-
namn INTAKTA i B22/B23:s regleringsblock. Evighetsmotorn §8: 209 (stängning väntar u3) + 211 DISPATCHAD +
212 BOKAD (E35:s aggregator-restgap — kvalitetsspårets nästa kodvåg).
LEVERANS: data/forskning/PIPELINE-KO.md, verktyg/_r106-universum.mjs, verktyg/_r106-v211-manifest.mjs,
verktyg/_r106-landa.mjs, worklog.md.
`);
  console.log('worklog: appenderad');
} else console.log('worklog: skip');

const msg = `${ARB}/verktyg/.r106-msg.txt`;
writeFileSync(msg, `studio: ROND 106 [organ:Φ] — VÅG 211 DISPATCHAD: manifest v211-oversattning-1789853364271 (3 byggare: -en för B18 livsmedel + B20 lyx + B21 logistik + B22 krypto + B23 utbildning + första -ar i B-ordning — spårets egen deklarerade kö i SEO-GUIDER-mallens översättningsomgång; KVD: tal-paritet bit-identisk, juridikgrind, korslänkar = originalets verifierade ytor, varumärkesgrind 0, lagrum INTAKTA) i fabrikskö bakom v209 · universum EGEN sond = 210 (v209:s tre bolag live) · VÅG 212 BOKAD (E35:s aggregator-restgap — kvalitetsspekt) · evighetsmotorn §8: tre vågor framåt (209-stängning, 211, 212) · KVD: PIPELINE data-only, src/ orörd = INGET bygge, R2 orörd (publicering väntar kund), data/blogg/ orörd — utkast lever i data/blogg-utkast/`);
run('git', ['add', 'data/forskning/PIPELINE-KO.md', 'worklog.md', 'verktyg/_r106-universum.mjs', 'verktyg/_r106-v211-manifest.mjs']);
let hash;
try { const out = run('git', ['commit', '-F', msg]); hash = (out.match(/\[develop ([0-9a-f]{7,})\]/) || [])[1]; console.log('commit:', hash); }
catch (e) { const lg = run('git', ['log', '-1', '--format=%h %s']); if (lg.includes('ROND 106')) { hash = lg.split(' ')[0]; console.log('commit: redan landad', hash); } else throw e; }
if (existsSync(msg)) unlinkSync(msg);
console.log('push-läge:', isPAD() ? 'redan i prod' : 'vänta-pushern (3195558) levererar HEAD vid nästa lyckade försök');

if (hash) {
  const rad = JSON.stringify({ ts: new Date().toISOString(), rond: 106, beslut: 'våg 211 dispatchad (manifest v211-oversattning: 5 st -en + första -ar enligt spårets egen B-ordning) + v212 bokad (aggregatorn) — v209 u3 löper, universum 210', landat: hash }) + '\n';
  for (const rot of [ARB, PROD]) appendFileSync(`${rot}/data/vakten/beslutsminne.jsonl`, rad);
  console.log('beslutsminne: båda träden ✓');
}
