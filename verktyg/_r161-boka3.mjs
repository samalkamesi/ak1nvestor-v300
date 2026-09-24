// Rond 161: boka v159-emottaget + granskning, commit + push.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';
function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION v159-emottag [organ:Φ] — 2026-09-24: v159 KLAR 3/3 (06:50, rekordtempo 10-14 min/uppgift) och EMOTTAGET med kvitton: u1 indikatorer-01-10.md (f300b144) + u2 indikatorer-11-20.md (8acb9782, sent landad — egen emottagningsmerge) + u3 BRANDING-AUDIT-2026-09.md (c6871aff). KVALITETSGRANSKAD (_r161-granska.mjs): 20/20 indikatorer 626-952 ord (krav ≥400) med facit + räkneexempel + fallgropar överallt — kundprioritet 3 (Fas 2-djupet) LEVERERAD som datafiler; audit = 17 kB karta (designgrund + per-sidkarta + 15 prioriterade åtgärder: P1 ena primärknapp guld-signatur, 52px tryckytor, kanoniska CTA-texter, konverterings-CTA på 3 saknande sidor, social proof på fas2/fas3/prenummer) — v160-underlaget KLART (finslip i src/ + djup-integrering nästa våg). Push-kedja grön genom barnväntan (d9461d17 → 8acb9782, alla emottagna). Verktyg: _r161-{emottag,emottag2,granska,pusha,boka3}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'worklog.md', 'verktyg/_r161-emottag.mjs', 'verktyg/_r161-emottag2.mjs', 'verktyg/_r161-granska.mjs', 'verktyg/_r161-pusha.mjs', 'verktyg/_r161-boka3.mjs']);
console.log('commit:', git(['commit', '-m', 'studio: iteration [organ:Φ] — v159 emottaget+granskat (20/20 indikatorer 626-952 ord + audit 15 åtgärder = v160-underlag)'], { timeout: 240000 }).trim().slice(0, 80));
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 140));
}
console.log('HEAD:', git(['log', '-1', '--format=%h %s']).slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
