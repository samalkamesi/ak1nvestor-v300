// Sond v227: starta om pulsvakten (Kur B aktivering) + verifiera att den lever
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

try {
  const ut = execFileSync('pm2', ['restart', 'pulsvakt', '--update-env'], {
    cwd: '/home/ak1a/AK1',
    encoding: 'utf8',
    timeout: 30_000,
  });
  console.log('pm2 restart pulsvakt OK');
} catch (e) {
  console.log('pm2 restart FEL:', String(e.stderr || e.message).slice(0, 200));
  process.exit(1);
}

//Verifiera: pm2 describe + statusfilens processPid/lever
try {
  const beskriv = execFileSync('pm2', ['describe', 'pulsvakt'], { encoding: 'utf8', timeout: 20_000 });
  const status = beskriv.split('\n').find((r) => r.includes('status'));
  console.log('pm2 status-rad:', status ? status.trim() : '(ej hittad)');
} catch (e) {
  console.log('describe FEL:', String(e).slice(0, 100));
}
try {
  const s = JSON.parse(readFileSync('/home/ak1a/AK1/data/vakten/pulsvakt-status.json', 'utf8'));
  console.log('statusfil: lever=' + s.lever + ' pid=' + s.processPid + ' varv=' + s.varv + ' externFelvarv=' + (s.externFelvarv ?? 'SAKNAS(gammal kod)'));
} catch (e) {
  console.log('statusfil ännu ej omskriven (väntar första varvet):', String(e).slice(0, 80));
}
