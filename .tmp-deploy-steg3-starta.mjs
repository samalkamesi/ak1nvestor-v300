// Steg 3: Starta bygg under flock-lås som fristående process
import { spawn } from 'node:child_process';
import { openSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';

const LOGG = '/home/ak1a/agent/ak1/.tmp-deploy-bygg.log';
const EXIT = '/home/ak1a/agent/ak1/.tmp-deploy-bygg-exit.txt';
const PIDF = '/home/ak1a/agent/ak1/.tmp-deploy-bygg-pid.txt';

for (const f of [LOGG, EXIT, PIDF]) if (existsSync(f)) unlinkSync(f);

// Exakt sekvens enligt uppdraget; flock -n = omedelbar avvisning om låst.
// Exit-koden (flock/inner) skrivs till EXIT-filen.
const KOMMANDO =
  "flock -n /tmp/ak1a-deploy.lock bash -c 'cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a'; " +
  "echo $? > " + EXIT;

const ut = openSync(LOGG, 'a');
const fel = openSync(LOGG, 'a');
const barn = spawn('bash', ['-c', KOMMANDO], { detached: true, stdio: ['ignore', ut, fel] });
barn.unref();
writeFileSync(PIDF, String(barn.pid));
console.log('Bygg startad som PID ' + barn.pid + ' (flock /tmp/ak1a-deploy.lock). Logg: ' + LOGG);
