// Rond 160: sista bokföring — v161 komplett emottagen + v160 pushad.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';
function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION v161-emottag [organ:Φ] — 2026-09-24: v161 KLAR 3/3 (medtech-en + vård-en + skog-en, alla kvitto-commitade; skog-en 9 769 tkn emottagen via merge 5dd5d127) — spårets översättningsluckor B24-B26 -en STÄNGDA, B27 bygg + -ar-familjen nästa. v160 P1-svep PUSHAT (fb3f125a + merge-kedja): enad guld-knapp ×5, 52px, kanoniska CTA-texter, social proof ×3 sidor. Drift: bygg 07:23 OOM-dödat medan v161-barn lev (andra OOM:n under fabrikstryck — känd klass, sekvenseringen äger kuren; fabriken nu TOM → RAM fritt → nästa poll bygger hela kedjan 6e15cbac→5dd5d127). Restposter oförändrade: /fas2 i live-sitemap + kvalitetsvakt GRÖN efter deploy. Verktyg: _r160-{boka,boka2,pusha}.mjs + _r161-{v161,bevaka2}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'worklog.md', 'verktyg/_r160-pusha.mjs', 'verktyg/_r160-boka2.mjs', 'verktyg/_r161-v161.mjs', 'verktyg/_r161-bevaka2.mjs']);
console.log('commit:', git(['commit', '-m', 'studio: iteration [organ:Φ] — v161 komplett (3/3 speglar emottagna) + v160 P1 pushad; OOM-drift bokförd'], { timeout: 240000 }).trim().slice(0, 80));
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 130));
}
console.log('HEAD:', git(['log', '-1', '--format=%h %s']).slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
