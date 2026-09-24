// Rond 161: boka artefaktdiagnos + skript, commit + push.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION artefaktdiagnos [organ:Φ] — 2026-09-24: 06:14-byggets stop ROTFÖRSTÅTT (ingen kodkur krävs): "12:02-klassen" = känd prodincident-klass (2026-09-16) — Turbopack-emitteringsglapp under minnespress ger färskt HTML som refererar aldrig emitterade chunks; ARTEFAKTGRINDEN (verktyg/artefakt-verifiering.mjs, per-sida-bevis) fångade den, pm2 behöll senast gröna, läkebackup återställde — hela skydds kedjan FUNGERADE. Kuren = ombygge i renare minnesläge via V235-sekvensen som redan kör: RAM nu 5,9 GB fritt, v159 föder barn vid nästa fabriksrop, synken bygger e5358dc4 (bär 3fa731d8:s GUL-kur) när fabriken släpper. Deploy-bevakare startad (_r161-bevaka.mjs): fångar DEPLOYAD + verifierar /fas2 i live-sitemap; kvalitetsvaktkörning till bevisad GRÖN bokförs som nästa steg efter deploy. Verktyg: _r161-{sond,artefakt,bevaka,boka}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'worklog.md', 'verktyg/_r161-sond.mjs', 'verktyg/_r161-artefakt.mjs', 'verktyg/_r161-bevaka.mjs', 'verktyg/_r161-boka.mjs']);
console.log('commit:', git(['commit', '-m', 'studio: iteration [organ:Φ] — artefaktstop rotförstått (12:02-klassen, skyddskedjan fungerade); deploy-bevakare kör'], { timeout: 240000 }).trim().slice(0, 80));
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 140));
}
console.log('HEAD:', git(['log', '-1', '--format=%h %s']).slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
