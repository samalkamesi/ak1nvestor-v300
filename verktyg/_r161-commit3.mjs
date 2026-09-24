#!/usr/bin/env node
// _r161-commit3.mjs — bokför v160 P3.2 (audit #12-15) — brandingspårets kodslut.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 180000, cwd: WS, ...opts }).trim();
}
try {
  appendFileSync(`${WS}/worklog.md`,
`## Iteration v160 P3.2 — 2026-09-24 ~11:0x lokal: BRANDINGSPÅRETS KODSLUT (audit #12-#15) [organ:Φ]

VERKSTÄLLT under fortsatt dirigentväntan (s2-barnen commitar stegvis i prod, RAM ~3,7 GB): #12 GHOST-KONVENTIONEN dokumenterad i globals.css @theme (fylld = sidsluts-CTA/SektionsCta · outline = in-kropp-länk/sekundär · DelRad-pill = m8:s ikonrad-kontrakt "diskret, ALDRIG banner") · #13 "Öppna labbet" (analyser/[ticker]) från bg-gold-avvikare till btn-guld-signatur + min-h-[52px] (P1-mönstret, blockets primära handling — auditens "ghost för synlighet" omtolkat mot P1:s enhetsregel: primär handling = signatur) · #14 DelRad:s båda delningsknappar 36px → 44px + max-md:52px (mobil-tumstandarden; pill-formen bevarad enligt m8 §3b) · #15 IMPLEMENTERINGSSTATUS + 8 DOKUMENTERADE UNDANTAG tillagda som sektion 5 i BRANDING-AUDIT-2026-09.md (marin-hero 3xl→5xl, dagens-pass 5xl, logga-in centrerad, pro-B2B-palett, fas-ansök-CTA:er, DelRad-pill, parkerad dataset-eyebrow, temastabila hero-tokens). KVD: tsc 0 fel; R2 orörd. BRANDINGSPÅRET (kundprioritet "finslipning av ALLA publika sidor") är härmed KODCOMPLETET i 15/15 åtgärdsposter (1-5 P1/P2/P2.5 · 6-10 P2 · 11-15 P3) — leveranskedjan stängs av dirigentens deploy + live-verifiering. [organ:Φ]

`);
  const filer = [
    'worklog.md',
    'src/app/globals.css',
    'src/app/(huvud)/analyser/[ticker]/page.tsx',
    'src/components/ak1a/del-rad.tsx',
    'data/forskning/BRANDING-AUDIT-2026-09.md',
    'verktyg/_r161-commit3.mjs',
  ];
  sh('git', ['add', ...filer]);
  sh('git', ['commit', '-m', 'studio: v160 P3.2 [organ:Φ] — brandingspårets kodslut: ghost-konvention dokumenterad + Öppna labbet signatur/52px + DelRad 44/52px + 8 undantag i audit-filen; tsc 0; 15/15 åtgärdsposter kodkompletta']);
  console.log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  appendFileSync(`${WS}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
    ts: new Date().toISOString(), rond: 160,
    beslut: 'v160 P3.2 [organ:Φ] — audit #12-15; brandingspåret 15/15 kodkompletta (tsc 0)',
    landat: 'pending-push',
  }) + '\n');
  console.log('Yta: ' + (sh('git', ['status', '--porcelain']) || 'ren'));
} catch (e) { console.log('FEL: ' + e.message); process.exit(1); }
