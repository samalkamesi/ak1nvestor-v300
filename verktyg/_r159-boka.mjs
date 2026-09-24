// Rond 159: bokföring — worklog + beslutsminne + add + commit + push + verifiering.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}
function steg(namn, fn) {
  try { console.log(`OK ${namn}:`, String(fn()).trim().slice(0, 200)); return true; }
  catch (e) { console.log(`FEL ${namn}:`, String(e.stdout || e.message).slice(0, 400)); return false; }
}

const rad =
  '\n## STYRELSEROND 159 [organ:Φ] — 2026-09-24: GUL-kvalitetsrapporten rotorsakad och KURAD + evighetsmotorn återskapad. Granskning: hälsoprov 0 RAD (pulsvaktens 500-class 04:58-05:00 transient under deploy, självläkt 05:00:21), prod-yta ren (s10 KLAR 3/3 — därför släppte pushen), synken deployade 22 commits automatiskt 04:59 (prod 200), v159 (fas2-djup + branding-audit) ligger i fabrikens ko och plockas vid nästa rop (RAM 3,8 GB grönt). ROT: kvalitetsrapport-SENASTE.md 1 fel = sektion 7 sitemap-täckning: /fas2 (född av kf3) saknades i sitemap.ts — dessutom 9→1 felen efter rond 158:s mimosa-kur (vaktens egen mätning: mimosa PASS 2 511/0). KUR (2 rader): /fas2 okonditionell post (monthly/0.8 intill fas2-ansok-mönstret) + V03-text "kunder"→"kundgrupper" (tonal varning sektion 3, pedagogiken bevarad); tsc 0 fel före commit. EVIGHETSMOTORN § 8: PIPELINE-KO.md fanns INTE — skapad med v159-v162 bokade (rotation spår 3+4 ur evighetskatalogen, R2-vilor listade). tsc-timeout i vakten (sektion 11) = transient kall cache, icke kodfel. Verktyg: _r159-sond{,2,3,4}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);
appendFileSync(
  `${ws}/data/vakten/beslutsminne.jsonl`,
  JSON.stringify({ ts: new Date().toISOString(), rond: 159, beslut: 'GUL-kur: /fas2 i sitemap + kundgrupper-text; PIPELINE-KO.md återskapad med v159-v162', landat: 'pending' }) + '\n'
);
console.log('OK worklog + beslutsminne');

steg('add', () => git(['add', 'src/app/sitemap.ts', 'src/app/(huvud)/fas2/page.tsx', 'PIPELINE-KO.md', 'worklog.md', 'verktyg/_r159-sond.mjs', 'verktyg/_r159-sond2.mjs', 'verktyg/_r159-sond3.mjs', 'verktyg/_r159-sond4.mjs', 'verktyg/_r159-boka.mjs']));

steg('commit', () => git(['commit', '-m', 'studio: rond 159 [organ:Φ] — GUL-kurad: /fas2 i sitemap (vakt sektion 7 FAIL→0) + kundgrupper-text; PIPELINE-KO.md återskapad (v159-v162)'], { timeout: 240000 }));

steg('push', () => git(['push', 'prod', 'develop'], { timeout: 120000 }));

steg('verifiering', () => {
  const head = git(['log', '-1', '--format=%h %s']).trim();
  const remote = git(['ls-remote', 'prod', 'develop']).trim().split('\t')[0];
  const yta = git(['status', '--porcelain']).trim() || '(ren)';
  return `HEAD: ${head}\nremote: ${remote}\nyta: ${yta}`;
});
