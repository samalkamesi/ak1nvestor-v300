#!/usr/bin/env node
// ROND 103 landning — våg 209/210/211-bokföring + commit [organ:Φ] + push prod
import { appendFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ARB = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: ARB, encoding: 'utf-8', ...opts }).trim();

const isPAD = () => {
  try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; }
};

// 1. worklog-append (idempotent — hoppa om rondraden redan finns)
const wl = `${ARB}/worklog.md`;
if (!readFileSync(wl, 'utf-8').includes('ROND 103 — våg 209 DISPATCHAD')) {
  appendFileSync(wl, `
## ROND 103 [organ:Φ] — 2026-09-19 ~20:50 lokal: våg 209 DISPATCHAD (fabriksmanifest) + 210 OMBOKAD (premissdöd) + 211 BOKAD

Styrelserond 20:43 (hälsofrisk 0 RAD/0 GUL/12 GRÖN; vakten 0/176; pulslarmen = transient deploy-transiens under
ak1a-deploy.lock — avvaktar, ingen åtgärd). BESLUT: (1) VÅG 209 = dataset-djup nästa omgång DISPATCHAD som
fabriksmanifest v209-datasetdjup-1789850833630 (mönster auto-s2 bevisat omg18: 3 byggare +1/+2/+3 bolag,
nordiska+internationella, universum 207→; KVD per uppgift: protokoll-FIL med rådata, tal-paritet, läckagevakt ×2,
llms-regen, juridikgrind ALDRIG råd 2007:528) — skriven till ko/ i BÅDA träden (prod = fabrikens läsväg),
plockas atomärt vid nästa pump :x5 efter att auto-s10 (status "pågår", u2 klar + u3:s kvällspunkt lever) slutförs.
(2) VÅG 210 OMBOKAD: premissen "elfte förhandsfrågelagret" FÖRÅLDRAD — sonden räknade 56 frågelager-filer i
src/lib (båda träd; fabrikens s6-vågor + våg 189; s6-u3:s "nya territorier"-lager redan mergat via syskoncommit) —
KOORDINERING STYRDE: dubbelleverans undveks, raden omskriven till nästa frågefamilj enligt våg 189-mönstret med
kollisionskontroll mot 56 lager. (3) VÅG 211 BOKAD (spår 3 SEO-guider tre språk) — evighetsmotorn §8: 3 kommande
vågor bokade (209 DISPATCHAD · 210 OMBOKAD · 211 BOKAD). DISPATCH: fabrik (manifest ovan), inga direkta barn.
LEVERANS: data/forskning/PIPELINE-KO.md, verktyg/_r103-sond.mjs, verktyg/_r103-sond2.mjs,
verktyg/_r103-v209-manifest.mjs, worklog.md.
`);
  console.log('worklog: appenderad');
} else { console.log('worklog: fanns redan (idempotent skip)'); }

// 2. commit [organ:Φ]
const msg = `${ARB}/verktyg/.r103-msg.txt`;
writeFileSync(msg, `studio: ROND 103 [organ:Φ] — våg 209 DISPATCHAD: fabriksmanifest v209-datasetdjup-1789850833630 (3 byggare +1/+2/+3 bolag, spår 2 dataset-djup, universum 207→; KVD: protokoll-FIL rådata, tal-paritet, läckagevakt ×2, llms-regen, ALDRIG råd 2007:528) i ko/ BÅDA träd · våg 210 OMBOKAD (premiss "lager 11" död — 56 frågelager lever i src/lib, s6-u3:s territorier mergat; koordinering undvek dubbelleverans; nästa = frågefamilj 189-mönstret mot 56 lager) · våg 211 BOKAD (spår 3 SEO-guider tre språk) — evighetsmotorn §8 uppfylld 3 vågor · auto-s10 "pågår" (u2 klar, u3 kvällspunkt i worklog) — manifestet köar atomärt bakom · KVD: PIPELINE data-only, src/ orörd = INGET bygge, R2 orörd, data/blogg/ orörd`);
let hash = null;
if (!isPAD() || true) {
  run('git', ['add', 'data/forskning/PIPELINE-KO.md', 'worklog.md', 'verktyg/_r103-sond.mjs', 'verktyg/_r103-sond2.mjs', 'verktyg/_r103-v209-manifest.mjs']);
  try {
    const out = run('git', ['commit', '-F', msg]);
    hash = (out.match(/\[develop ([0-9a-f]{7,})\]/) || [])[1];
    console.log('commit:', hash || out.split('\n')[0]);
  } catch (e) {
    // tom commit (redan landad) → återvinn hash ur loggen
    const lg = run('git', ['log', '-1', '--format=%h %s']);
    if (lg.includes('ROND 103')) { hash = lg.split(' ')[0]; console.log('commit: redan landad', hash); }
    else throw e;
  }
}

// 3. push prod med fetch/merge-retry (r101-lärdomen: prod avancerar under loppet)
if (!isPAD()) {
  for (let i = 1; i <= 3 && !isPAD(); i++) {
    try { console.log('push försök', i, ':', run('git', ['push', 'prod', 'develop']).split('\n').pop()); }
    catch (e) {
      console.log('push försök', i, 'fel — fetch+merge och om:', String(e).split('\n').slice(0, 2).join(' | '));
      run('git', ['fetch', 'prod', 'develop']);
      try { run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) { console.log('MERGEKONFLIKT:', String(m).slice(0, 200)); throw m; }
    }
  }
}
console.log(isPAD() ? `PUSHAD: prod/develop innehåller ${hash || 'HEAD'}` : 'PUSH MISSLYCKADES efter retry');

// 4. beslutsminne (serverlokalt, BÅDA träden — hash inlagd)
if (hash) {
  const rad = JSON.stringify({ ts: new Date().toISOString(), rond: 103, beslut: 'våg 209 dispatchad (manifest v209-datasetdjup-1789850833630: 3 byggare +6 bolag spår 2) + våg 210 ombokad (56 lager — premissdöd, koordinering) + våg 211 bokad (spår 3)', landat: hash }) + '\n';
  for (const rot of [ARB, PROD]) appendFileSync(`${rot}/data/vakten/beslutsminne.jsonl`, rad);
  console.log('beslutsminne: bokförd båda träden');
}
