// Rond 158 slutbokföring: worklog + add + commit + push (med kort retry) + städning.
import { execFileSync } from 'node:child_process';
import { appendFileSync, rmSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ROND 158 slut [organ:Φ] — 2026-09-24: PUSH GRÖN 3386ec1b (tålig poll, 4 försök: emottog fabrikens bd464149+df74a530 under väntan) — rundens leverans komplett: (1) kundprioritet 1 BEVISAD: /blogg LIVE 200 med exakt 94/94 inlägg; (2) KUNDPRIORITET 2+3 BOKADE som fabriksmanifest v159-kundprioritet (3 uppgifter: fas2-djup indikator 1-10, 11-20 — årsredovisningsdjup + kritiskt tänkande + övningsfrågor — samt branding-audit av ALLA publika sidor som karta inför finslipningen); (3) kvalitetsdoktrinen (kvalitet > kvantitet) inbakad i alla fabriks-prompts; (4) mimosa-kur II:s leveranskedja sluten ända ut i prod (2 514 filer 0 fynd). Verktyg: _r158-{bloggverifiera,prodyta,pusha2,manifest,boka,boka2}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);
console.log('OK worklog-rad appendad');

// Commit sonderna + worklog
git([
  'add',
  'worklog.md',
  'verktyg/_r158-bloggverifiera.mjs',
  'verktyg/_r158-prodyta.mjs',
  'verktyg/_r158-pusha2.mjs',
  'verktyg/_r158-manifest.mjs',
  'verktyg/_r158-boka.mjs',
  'verktyg/_r158-boka2.mjs',
]);
console.log('OK add');

git(
  ['commit', '-m', 'studio: rond 158 slut [organ:Φ] — blogg 94/94 bevisad + manifest v159 bokat (fas2-djup + branding-audit) + push 3386ec1b'],
  { timeout: 240000 }
);
console.log('OK commit:', git(['log', '-1', '--format=%h %s']).trim());

// Push med 3 försök + emottagning
for (let i = 1; i <= 3; i++) {
  try {
    git(['push', 'prod', 'develop'], { timeout: 60000 });
    console.log(`PUSH GRÖN (försök ${i})`);
    break;
  } catch (e) {
    const msg = String(e.stdout || '') + String(e.stderr || '');
    if (msg.includes('fetch first') || msg.includes('non-fast-forward')) {
      git(['fetch', 'prod', 'develop']);
      git(['merge', 'prod/develop', '-m', 'merge: emottag prod (rond 158 slut)'], { timeout: 240000 });
      console.log('emottog + merge OK, försöker pusha igen');
    } else {
      console.log(`push försök ${i} avvisad (yta upptagen) — väntar 60 s`);
      await new Promise((r) => setTimeout(r, 60000));
    }
  }
}

console.log('remote:', git(['ls-remote', 'prod', 'develop']).trim().split('\t')[0]);
console.log('ws-HEAD:', git(['log', '-1', '--format=%h']).trim());
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');

// Städning: commitmsg-filen är förbrukad
try { rmSync(`${ws}/verktyg/_r158-commitmsg.txt`); console.log('OK commitmsg.txt rensad'); } catch {}
