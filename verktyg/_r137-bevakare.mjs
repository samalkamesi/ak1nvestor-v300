#!/usr/bin/env node
// Rond 137-bevakare (node-kanalen — shellet är mättat):
// 1) städa 9 avslutade tempverktyg, 2) vänta in RAM-fönster (tak 3 h),
// 3) riktad vaktsvepning av /rapportakademin med KURERADE vakten i prod-trädet,
// 4) vid entydigt grönt (exit 0 + "0 fynd"): skriv data/vakten/uppdrag-klart.json
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const ROOT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const SIDA = '/rapportakademin';
const GRANS_MB = 2200;
const TAK_MS = 3 * 60 * 60 * 1000;
const POLL_MS = 90 * 1000;

const STADA = [
  'verktyg/_r131-vaktbevakare.mjs', 'verktyg/_r133-vaktbevakare2.mjs',
  'verktyg/_r134-bokfor.mjs', 'verktyg/_r134-pusha.mjs', 'verktyg/_r134-vaktbevakare3.mjs',
  'verktyg/_r135-bokfor.mjs', 'verktyg/_r135-vaktbevakare4.mjs',
  'verktyg/_r136-bokfor.mjs', 'verktyg/_r136-pusha.mjs'
];
for (const f of STADA) {
  try { fs.rmSync(`${ROOT}/${f}`); console.log('städad:', f); }
  catch (e) { console.log('städ-fel:', f, e.message); }
}

const start = Date.now();
let avail = 0;
const lasTillgangligtMB = () => {
  try {
    const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
    return Math.round(parseInt((meminfo.match(/MemAvailable:\s+(\d+)/) || [])[1] || '0', 10) / 1024);
  } catch { return 0; }
};
while (Date.now() - start < TAK_MS) {
  avail = lasTillgangligtMB();
  console.log(new Date().toISOString(), 'available:', avail, 'MB');
  if (avail >= GRANS_MB) break;
  await new Promise(r => setTimeout(r, POLL_MS));
}
if (avail < GRANS_MB) {
  console.log('RAM-fönster öppnade sig aldrig inom 3 h — avslutar utan svep');
  process.exit(3);
}
console.log('FÖNSTER ÖPPET — kör riktad svepning', SIDA);

const r = spawnSync('node', ['verktyg/granssnittsvakt.mjs', '--bas=http://localhost:3000', `--sidor=${SIDA}`], {
  cwd: PROD, encoding: 'utf8', timeout: 300000, maxBuffer: 128 * 1024 * 1024
});
console.log('vakt-exit:', r.status);
if (r.stdout) console.log('SVAR:', r.stdout.slice(-15000));
if (r.stderr) console.log('STDERR-tail:', r.stderr.slice(-3000));
if (r.error) console.log('FEL:', r.error.message);

const gron = r.status === 0 && /0 fynd/.test(r.stdout || '');
if (gron) {
  const klart = {
    sammanfattning: 'RAPPORTAKADEMIN DoD sluten: vertikalt snitt live-bevisat (200+401, rond 131), laggrundad konfiguration committad (rond 128), karantän-intag levererat (rond 136, 14/14), riktad vaktsvep av /rapportakademin med kurerad vakt GRÖN (0 fynd)',
    bevis: 'prod develop 04346672 (push grön 07:35Z); vakt-exit 0 + 0 fynd; commits f6a3d570 (FYNN nr 4), 1aae98a1 (vaktens blinda hål), 8abf541e (karantänpipeline)',
    ts: Date.now()
  };
  fs.writeFileSync(`${ROOT}/data/vakten/uppdrag-klart.json`, JSON.stringify(klart, null, 1));
  console.log('UPPDRAG-KLART skrivet:', JSON.stringify(klart));
} else {
  console.log('Ej entydigt grönt — loggen ovan kräver manuell granskning innan uppdrag-klart');
}
