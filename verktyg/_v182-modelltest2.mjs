// modelltest 2: huvudmodellen zai/glm-5.3 via zcode -p (samma mönster som fabriken)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const logg = [];
const skriv = () => writeFileSync('/tmp/r182-modelltest2.txt', logg.join('\n'));
logg.push('start ' + new Date().toISOString()); skriv();
const barn = spawn('/home/ak1a/.npm-global/bin/zcode', ['-p', 'Svara med exakt ett ord: OK'], {
  cwd: '/home/ak1a/AK1',
  env: { ...process.env, ZCODE_MODEL: 'zai/glm-5.3' },
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
});
let ut = '', fe = '';
barn.stdout.on('data', d => { ut += d; });
barn.stderr.on('data', d => { fe += d; });
barn.on('error', e => { logg.push('spawn-fel: ' + e.message); skriv(); });
const vakt = setTimeout(() => { logg.push('TIMEOUT 120s — dödar'); skriv(); try { process.kill(-barn.pid, 'SIGKILL'); } catch {} process.exit(2); }, 120000);
barn.on('close', (kod) => {
  clearTimeout(vakt);
  logg.push('exit ' + kod + ' ' + new Date().toISOString());
  logg.push('STDOUT: ' + ut.slice(-800));
  logg.push('STDERR: ' + fe.slice(-800));
  skriv();
  process.exit(0);
});
logg.push('barn fött pid ' + barn.pid); skriv();
