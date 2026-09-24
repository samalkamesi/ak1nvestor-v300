#!/usr/bin/env node
// _r161-commit2.mjs — bokför v160 P3 (hero-guld-tokens) + städar rondens skript.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 180000, cwd: WS, ...opts }).trim();
}
try {
  appendFileSync(`${WS}/worklog.md`,
`## Iteration v160 P3 (del 1 — audit #11) — 2026-09-24 ~10:55 lokal: HERO-GULD-TOKENS — raw-hex utbytta mot temastabila tokens [organ:Φ]

VERKSTÄLLT (ren refactor, noll visuell förändring — varje token bär EXAKT ursprungets rgb): nya :root-tokens i globals.css (--guld-hero #E8C766, --beige-hero #EDE6D6, --marin-morkast-hero #0A1422, --marin-chip-hero #16263D) + @theme-mappning (--color-*-hero ⇒ text-guld-hero/border-beige-hero/bg-marin-chip-hero etc. med fungerande /opacitet). Medvetet TEMASTABILA: INGEN .dark-override och EJ med i .marin-scope-flippen (se globals.css-kommentar — annars vore det en beteendeändring: --djup-marin flippar i dark, raw-hex gjorde aldrig det). Kurser-chipets bg-[#0E1B2E]+dark:bg-[#16263D]-par = exakt djup-marin-flippen ⇒ bg-djup-marin. Pro:s inline-style color:"#E8C766" ⇒ var(--guld-hero). BYTEN: home-section 18 · fas2 17 · fas3 26 · medlemskap 16 · konfluens 4 · kurser 3 · pro 6 = 90 förekomster; efterverifiering 0 kvarvarande raw-hex i samtliga sju (skriptets guard avbröt felande körning ärligt — pro:s style-objekt-regel tillagd och omkörd). KVD: tsc 0 fel; src-yta ⇒ deploy via byggloopen/dirigenten. KVAR i P3: #12 ghost-enhet · #13 "Öppna labbet" ghost-klass · #14 blogg/[slug] 52px · #15 undantagsdokumentation · parkerad dataset-eyebrow. [organ:Φ]

`);
  const filer = [
    'worklog.md',
    'src/app/globals.css',
    'src/components/ak1a/sections/home-section.tsx',
    'src/app/(huvud)/fas2/page.tsx',
    'src/app/(huvud)/fas3/page.tsx',
    'src/app/(huvud)/medlemskap/page.tsx',
    'src/app/(huvud)/konfluens/page.tsx',
    'src/app/(huvud)/kurser/page.tsx',
    'src/app/(huvud)/pro/page.tsx',
    'verktyg/_r161-p3-tokens.mjs',
    'verktyg/_r161-commit2.mjs',
  ];
  sh('git', ['add', ...filer]);
  sh('git', ['commit', '-m', 'studio: v160 P3.1 [organ:Φ] — hero-guld-tokens: 90 raw-hex i 7 filer utbytta mot temastabila tokens (globals.css @theme), kurser-chip = bg-djup-marin, pro style-objekt = var(); tsc 0; noll visuell förändring']);
  console.log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  appendFileSync(`${WS}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
    ts: new Date().toISOString(), rond: 160,
    beslut: 'v160 P3.1 [organ:Φ] — hero-tokens 90 byten/7 filer, temastabila (tsc 0)',
    landat: 'pending-push',
  }) + '\n');
  console.log('Yta: ' + (sh('git', ['status', '--porcelain']) || 'ren'));
} catch (e) { console.log('FEL: ' + e.message); process.exit(1); }
