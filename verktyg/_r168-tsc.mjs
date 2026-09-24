// tsc + commit av rond 168:s dataset-eyebrow (node-kanalen)
import { execSync } from 'node:child_process';
const WS = '/home/ak1a/agent/ak1';
try {
  const tsc = execSync('node node_modules/typescript/bin/tsc --noEmit', { cwd: WS, encoding: 'utf8', timeout: 300000, maxBuffer: 32 * 1024 * 1024 });
  console.log('tsc: 0 fel');
} catch (e) {
  console.log('TSC-FEL:\n' + (e.stdout || e.message).slice(0, 2000));
  process.exit(1);
}
execSync('git add src/components/ak1a/dataset-sidor.tsx data/forskning/BRANDING-AUDIT-2026-09.md verktyg/_r168-tsc.mjs', { cwd: WS, encoding: 'utf8', timeout: 60000 });
const medd = 'studio: rond 168 [organ:Φ] — dataset-eyebrow LEVERERAD (audit #7, spårets sista post): språkneutralt varumärke enligt analyser/medlemskap-konventionen — ordlistenyckel-kirurgigränsen upplöstes (eyebrow-konventionen är språkneutral), brandingspåret härmed 16/16 komplett dokumenterat';
const c = execSync(`git commit -m "${medd}"`, { cwd: WS, encoding: 'utf8', timeout: 420000, maxBuffer: 16 * 1024 * 1024 });
console.log((c.split('\n').find(l => l.includes('develop')) || 'commitad').slice(0, 120));
console.log('HEAD:', execSync('git rev-parse --short HEAD', { cwd: WS, encoding: 'utf8' }).trim());
console.log('yta:', execSync('git status --porcelain', { cwd: WS, encoding: 'utf8' }).trim() || 'REN');
