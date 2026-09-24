#!/usr/bin/env node
// _r165-bokfor.mjs — rond 162 forts: v164-manifest parkerat; validering + worklog + commit.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

const WS = '/home/ak1a/agent/ak1';
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: 300000, cwd: WS, ...opts }).trim();
}
const RAD = `
## ROND 162 forts [organ:Φ] — v164 Fas 3-djupet förberett: manifest 24 uppgifter PARKERAT — 2026-09-24 ~13:1x lokal
Källa: FAS3_KURSLISTA (3 flaggskepp + 17 kanonverk teknisk analys + 4 trading-psykologi = 24) ur medlemskapssidan; format enligt KURS-FAS2-kontraktet (5 sektioner, räkneexempel, fallgropar) med Fas 3-anpassning + juridikgrind (2007:528) i varje prompt. Manifest: data/forskning/KURS-FAS3/manifest-v164-fas3-djup.json med parked=true + släppregel — kopieras till agentfabrik/ko/ FÖRST när r163-dirigenten rapporterat bygg+verifiering KLART (sekvensregel: fabriksomgång får inte stänga byggfönstret och återskapa F6-OOM-klassen). JSON validerad + 7 språkstädningar (kinesiska skrivfel + stavfel) rättade innan commit. Ytkarta-post 2 (en/ar-speglingar verifieras live) hanteras i deploy-stängningen.
`;
try {
  // Validera JSON + noll kinesiska tecken
  const m = JSON.parse(readFileSync(`${WS}/data/forskning/KURS-FAS3/manifest-v164-fas3-djup.json`, 'utf8'));
  const kinesiska = (JSON.stringify(m).match(/[\u4E00-\u9FFF]/g) || []).length;
  if (kinesiska > 0) throw new Error(`${kinesiska} kinesiska tecken kvar`);
  if (m.uppgifter.length !== 24) throw new Error('inte 24 uppgifter: ' + m.uppgifter.length);
  console.log(`VALIDERAD: 24 uppgifter, 0 kinesiska tecken, id=${m.id}`);

  appendFileSync(`${WS}/worklog.md`, RAD);
  sh('git', ['add', 'worklog.md', 'data/forskning/KURS-FAS3/manifest-v164-fas3-djup.json', 'verktyg/_r164-pushpoll.mjs', 'verktyg/_r165-bokfor.mjs']);
  sh('git', ['commit', '-m', 'studio: rond 162 [organ:Φ] — v164 Fas 3-manifest 24 uppgifter parkerat (släpps efter deploy-kvitto) + språkstädning + validering']);
  console.log('Commit: ' + sh('git', ['rev-parse', '--short', 'HEAD']));
  console.log('Yta: ' + (sh('git', ['status', '--porcelain']) || 'ren'));
} catch (e) { console.log('FEL: ' + e.message); process.exit(1); }
