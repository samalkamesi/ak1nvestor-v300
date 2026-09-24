// Rond 161: boka v161-manifestet + diff-kartan, commit + push.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION v161-bokning [organ:Φ] — 2026-09-24: PIPELINE-KO:s våg 161 VERKSTÄLLD som fabriksmanifest (evighetsmotorn § 8: aldrig utan nästa våg). Diff-karta över SEO-spårets översättningsluckor (_r161-diff.mjs): 47 original + 50 levererade speglar — öppna luckor i spårets B-ordning: B24 medtech, B25 vård, B26 skog, B27 bygg (bank-dubletten ägs av granskningskön, rörs ej). Manifest v161-seo-oversattning-<epok> (3 uppgifter: medtech-en, vård-en, skog-en) lagt i prod-ko — köar bakom v159 enligt fabrikens ETT-manifest-per-rop; prompts bär mallregel (imitera levererat syskonpar), talparitetskontroll och LEVERANS-kvitto. v159-barnen föddes 06:35 (status pågår); deploy av e5358dc4/ce9d8105 sker när fabriken släpper (V235). Verktyg: _r161-{diff,manifest,boka2}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'worklog.md', 'verktyg/_r161-diff.mjs', 'verktyg/_r161-manifest.mjs', 'verktyg/_r161-boka2.mjs']);
console.log('commit:', git(['commit', '-m', 'studio: iteration [organ:Φ] — v161 bokat (SEO-speglar B24-B26 en) + diff-karta över spårets luckor'], { timeout: 240000 }).trim().slice(0, 80));
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 140));
}
console.log('HEAD:', git(['log', '-1', '--format=%h %s']).slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
