#!/usr/bin/env node
// ROND 104 landning — ISR-rotkur + DRIFTSBOK + commit [organ:Φ] + push prod
import { appendFileSync, writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { spawn } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const run = (c, a, o = {}) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8', ...o }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };

// 1. worklog (idempotent)
const wl = `${ARB}/worklog.md`;
if (!readFileSync(wl, 'utf-8').includes('ROND 104 — ISR-värmarens rotkur')) {
  appendFileSync(wl, `
## ROND 104 [organ:Φ] — 2026-09-19 ~21:10 lokal: ISR-VÄRMARENS ROTKUR — bloggens 30 SEO-vägar värmdes ALDRIG sedan våg 98

R103-verifiering först: pushkvitto PUSHAD 6440f379 (försök 11, 20:59Z) — prod-HEAD = merge, cbe4b2d8 anfader ✓.
Gap-registret: 36/36 STÄNGDA (sista av våg 188) — nästa evolution föds ur ny forskning; rondens våg valdes ur öppna
tråd = s9-u2:s ISR-fynd. ROT (EGEN DIAGNOS, full vägprobe): pumpor-daemonens ak1a-varm.sh (03:10) byggde
sökvägslistan med DUBBELT prefix — sitemap-grepet levererar "/blogg/slug" men loopen prependade "/blogg/" igen ⇒
/blogg//blogg/slug 404 ⇒ ALLA 30 bloggvägar (10 sluggar × 3 språk — kundens citeringsmagneter) värmdes ALDRIG;
loggens "12/44" = exakt de statiska 200:orna. Därtill /en/ + /ar/ svarade 308 (trailing slash — värms nu som
/en + /ar = 200) och dipparna 12→11 (09-15/09-19) = transienta timeout i nattbackupens fönster (kur: ett nytt
försök per väg) + missade vägar loggas nu namngivet. BEVIS: bash -n OK + full torrkörning 2026-09-19 23:08 lokal
= "varmade 44/44 vagar" (förväntat värde uppnått, 0 missade rader). DRIFTSBOKEN F1-rad kurerad (påstod crontab —
det är pumpor-daemonen; rot-fyndet dokumenterat). KVD: data/infra + DRIFTSBOK = data-only, src/ orörd = INGET
bygge, R2 orörd, nästa 03:10-daemonkörning = live-beviset i loggen.
LEVERANS: data/infra/contabo/ak1a-varm.sh, data/DRIFTSBOKEN.md, verktyg/_r104-sond.mjs,
verktyg/_r104-isr-diagnos.mjs, verktyg/_r104-isr-verifiera.mjs, verktyg/_r104-landa.mjs, worklog.md.
`);
  console.log('worklog: appenderad');
} else console.log('worklog: skip (idempotent)');

// 2. commit
const msg = `${ARB}/verktyg/.r104-msg.txt`;
writeFileSync(msg, `studio: ROND 104 [organ:Φ] — ISR-värmarens ROTKUR: sitemap-grepet bär eget /blogg/-prefix men loopen prependade igen ⇒ /blogg//blogg/slug 404 — ALLA 30 bloggvägar (citeringsmagneterna, 10 sluggar × 3 språk) värmdes ALDRIG sedan våg 98; loggens 12/44 = enbart statiska 200:or (s9-u2:s "glider nedåt"-fynd = samma rot + transienta natt-timeout) · kurerat: slug utan dubbelprefix + /en,/ar utan trailing slash (var 308) + retry per väg + namngiven miss-loggning · BEVIS: bash -n OK + torrkörning 23:08 lokal = 44/44 varmade, 0 missade · DRIFTSBOKEN F1-rad rättad (pumpor-daemon kl 03:10, ej crontab) + rot-fyndet dokumenterat · KVD: data-only (infra + driftsbok), src/ orörd = INGET bygge, R2 orörd — nästa 03:10-körning = live-bevis`);
let hash;
run('git', ['add', 'data/infra/contabo/ak1a-varm.sh', 'data/DRIFTSBOKEN.md', 'worklog.md', 'verktyg/_r104-sond.mjs', 'verktyg/_r104-isr-diagnos.mjs', 'verktyg/_r104-isr-verifiera.mjs', 'verktyg/_r104-landa.mjs']);
try { const out = run('git', ['commit', '-F', msg]); hash = (out.match(/\[develop ([0-9a-f]{7,})\]/) || [])[1]; console.log('commit:', hash); }
catch (e) { const lg = run('git', ['log', '-1', '--format=%h %s']); if (lg.includes('ROND 104')) { hash = lg.split(' ')[0]; console.log('commit: redan landad', hash); } else throw e; }
if (existsSync(msg)) unlinkSync(msg);

// 3. push (3 försök inline, merge vid fetch-first)
for (let i = 1; i <= 3 && !isPAD(); i++) {
  try { console.log('push', i, ':', run('git', ['push', 'prod', 'develop']).split('\n').pop()); }
  catch (e) {
    const fel = String(e);
    console.log('push', i, 'fel:', fel.includes('staged changes') ? 'REN-YTA-GRIND (fabriksbarn)' : fel.split('\n').slice(0, 2).join(' | ').slice(0, 120));
    if (!fel.includes('staged changes')) { try { run('git', ['fetch', 'prod', 'develop']); run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) { console.log('merge:', String(m).slice(0, 100)); } }
  }
}
if (isPAD()) console.log(`PUSHAD: ${hash} i prod/develop ✓`);

// 4. beslutsminne båda träden
if (hash) {
  const rad = JSON.stringify({ ts: new Date().toISOString(), rond: 104, beslut: 'ISR-värmarens rotkur: 30 bloggvägar aldrig värmda (dubbel-prefix-bugg sedan v98) — kurerad + bevisad 44/44 torrkörning; DRIFTSBOK F1 rättad', landat: hash }) + '\n';
  for (const rot of [ARB, PROD]) appendFileSync(`${rot}/data/vakten/beslutsminne.jsonl`, rad);
  console.log('beslutsminne: båda träden ✓');
}
