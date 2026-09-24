// Rond 160: ärlighetsrättelse i worklog + commit verifieringsskript + push.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION rättelse [organ:Φ] — 2026-09-24: FÖREGÅENDE RADS "social proof saknar siffror" var FELAKTIG — granskningen sökte äldre tal (333/94) mot guldkällans verkliga (495/8 223/103/8/0 kr). Ärlig omgranskning bevisar: kf2 HELT levererad — sifferbandet lever LIVE med alla fem klickbara stat:er + etiketter (495 kurser · 8 223 quiz-frågor · 103 heltäckta böcker · 8 verktyg · 0 kr, kontext verifierad inkl. JSON-LD). v160-fokuset justeras: INGET nytt statistikband (dubbellösningsförbud), finslipen styrs ENBART av v159-u3:s branding-audit-karta. Läxa bokförd: granska alltid mot data/siffror.json:s faktiska värden, aldrig mot beskrivningstext. Verktyg: _r160-{v159,sifferband}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'worklog.md', 'verktyg/_r160-v159.mjs', 'verktyg/_r160-sifferband.mjs', 'verktyg/_r160-boka2.mjs']);
console.log('commit:', git(['commit', '-m', 'studio: iteration [organ:Φ] — rättelse: sifferbandet lever live (kf2 helt levererad); v160 styrs av audit-kartan'], { timeout: 240000 }).trim().slice(0, 80));
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 140));
}
console.log('HEAD:', git(['log', '-1', '--format=%h %s']).slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
