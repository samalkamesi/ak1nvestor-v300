// Rond 161/160: leverera v160 P1-svepet — worklog + commit + push + deploykoll.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION v160 P1-svep [organ:Φ] — 2026-09-24: BRANDFINSLEP verkställt i sessionen enligt BRANDING-AUDIT-2026-09.md (v159-u3:s karta) — P1#1 enad primärknapp: 5 bg-gold-knappar → btn-guld-signatur (fas2 ×2, fas3 ×2, manifest ×1); P1#2 52px tryckyta på samtliga (kf2-standarden); P1#3 kanoniska CTA-texter: manifest "Börja gratis — öppna läroplanen"→"Börja gratis", medlemskap "Börja lära dig nu — kostnadsfritt"→"Börja gratis", om-oss "Alla kurser"→"Se kurserna", SocialProof "Gå med gratis"→"Börja gratis"; P1#5 social proof monterad på fas2 + fas3 + prenumeration (huvudgrenen, efter prisavslutet — presentationellt, R2 orörd: inga prisvärden ändras). Fas-ansök-CTA:er + pro-B2B behållna (auditens undantagslista). P1#4 (SektionsCta-lyft till 8 verktygssidor) + P2/P3 kvarstår som nästa v160-del. tsc 0 fel. Verktyg: _r160-boka.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'src/app/(huvud)/fas2/page.tsx', 'src/app/(huvud)/fas3/page.tsx', 'src/app/(huvud)/prenumeration/page.tsx', 'src/app/(huvud)/manifest/page.tsx', 'src/app/(huvud)/medlemskap/page.tsx', 'src/app/(huvud)/om-oss/page.tsx', 'src/components/ak1a/social-proof.tsx', 'worklog.md', 'verktyg/_r160-boka.mjs']);
console.log('commit:', git(['commit', '-m', 'studio: v160 P1 [organ:Φ] — enad guld-knapp ×5 + 52px + kanoniska CTA-texter + social proof på fas2/fas3/prenumeration (audit-kartan)'], { timeout: 240000 }).trim().slice(0, 80));

try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 140));
}

console.log('HEAD:', git(['log', '-1', '--format=%h %s']).slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
console.log('\nsynk-svans (3):');
console.log(readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n').slice(-3).join('\n'));
