// _v221-lasstatus.mjs — kolla deploylåset via node (skal-kvoten)
import { execFileSync } from 'node:child_process';
try {
  const ut = execFileSync('flock', ['-n', '/tmp/ak1a-deploy.lock', '-c', 'echo LOCK-LEDIG'], { encoding: 'utf8', timeout: 10000 });
  console.log(ut.trim());
} catch (e) {
  console.log('LOCK-UPPTAGEN (flock vägrade:', e.message.split('\n')[0], ')');
}
