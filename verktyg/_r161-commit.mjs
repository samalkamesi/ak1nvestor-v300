#!/usr/bin/env node
// _r161-commit.mjs — bokför v160 P2.5 (SektionsCta-lyftet) + rondens sond.
import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync, unlinkSync, existsSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 180000, cwd: WS, ...opts }).trim();
}
try {
  appendFileSync(`${WS}/worklog.md`,
`## Iteration v160 P2.5 — 2026-09-24 ~10:35–10:5x lokal: SEKTIONSCTA-LYFTET (audit #4, kvarvarande P1-post) [organ:Φ]

VERKSTÄLLT under dirigentväntan (s2-barnen 3 aktiva, RAM 2,2 GB — fönstret stängt, dirigenten vilar i fas 1): SektionsCta lyft ur home-section.tsx till delad klientkomponent src/components/ak1a/sektions-cta.tsx (samma markup: guld-ghost-knapp "Börja gratis →" min-h-[52px] + mikrostrip heroMikro1·heroMikro3 ur ordlistan; strip- och sjalvstandig-varianter) + montering i sidbotten på de åtta CTA-lösa sidorna: konfluens, vagfundament, kalkylator, portfoljbyggare, netnet, profil, analyser, kurser (efter SocialProof). Startsidans egna monteringar opåverkade (importbytet beteendeidentiskt). KVD: tsc 0 fel (grinden), src-yta ⇒ deploy sker via byggloopen/dirigenten — inget eget bygge under fabrikens omgång. R2 orörd. Auditens åtgärdslista: #1–#5 härmed FULLSTÄNDIGT levererad (P1 fb3f125a + P2 0b458614 + P2.5 denna commit); kvar: P3 (#11–#15) + parkerad dataset-eyebrow. [organ:Φ]

`);
  const filer = [
    'worklog.md',
    'src/components/ak1a/sektions-cta.tsx',
    'src/components/ak1a/sections/home-section.tsx',
    'src/app/(huvud)/konfluens/page.tsx',
    'src/app/(huvud)/vagfundament/page.tsx',
    'src/app/(huvud)/kalkylator/page.tsx',
    'src/app/(huvud)/portfoljbyggare/page.tsx',
    'src/app/(huvud)/netnet/page.tsx',
    'src/app/(huvud)/profil/page.tsx',
    'src/app/(huvud)/kurser/page.tsx',
    'src/app/(huvud)/analyser/page.tsx',
    'verktyg/_r161-lage.mjs',
    'verktyg/_r161-commit.mjs',
  ];
  sh('git', ['add', ...filer]);
  sh('git', ['commit', '-m', 'studio: v160 P2.5 [organ:Φ] — SektionsCta lyft till delad komponent + monterad på 8 CTA-lösa sidor (konfluens/vagfundament/kalkylator/portfoljbyggare/netnet/profil/analyser/kurser); tsc 0; audit #1-5 komplett']);
  console.log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  appendFileSync(`${WS}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
    ts: new Date().toISOString(), rond: 160,
    beslut: 'v160 P2.5 [organ:Φ] — SektionsCta delad + 8 monteringar (tsc 0); audit #1-5 komplett',
    landat: 'pending-push',
  }) + '\n');
  console.log('Yta: ' + (sh('git', ['status', '--porcelain']) || 'ren'));
} catch (e) { console.log('FEL: ' + e.message); process.exit(1); }
