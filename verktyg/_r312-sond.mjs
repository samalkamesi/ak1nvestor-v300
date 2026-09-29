// r312-sond: fabriksläge + AK1-träd + RAM (engångsverktyg, städas efteråt)
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const koDir = 'data/vakten/agentfabrik/ko';
const ko = fs.existsSync(koDir) ? fs.readdirSync(koDir) : [];
console.log('KO:', ko.length ? ko.join(', ') : 'TOM');

const stDir = 'data/vakten/agentfabrik/status';
if (fs.existsSync(stDir)) {
  const st = fs.readdirSync(stDir).sort().reverse().slice(0, 5);
  for (const f of st) {
    try {
      const j = JSON.parse(fs.readFileSync(`${stDir}/${f}`, 'utf8'));
      console.log(f, '=>', j.status, JSON.stringify(j.progress ?? ''));
    } catch { console.log(f, 'läsfel'); }
  }
}

const smuts = execSync('git -C /home/ak1a/AK1 status --porcelain', { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);
console.log('AK1 smutsiga:', smuts.length);
for (const r of smuts.slice(0, 8)) console.log('  ', r);
console.log('AK1 HEAD:', execSync('git -C /home/ak1a/AK1 log --oneline -1', { encoding: 'utf8' }).trim());
console.log('AK1 develop-head här:', execSync('git log --oneline -1 develop', { encoding: 'utf8' }).trim());

const mem = fs.readFileSync('/proc/meminfo', 'utf8').split('\n');
for (const r of mem) if (r.startsWith('MemAvailable')) console.log(r.trim());
try {
  const n = execSync('pgrep -fc "zcode -p" || true', { encoding: 'utf8' }).trim();
  console.log('zcode-barn:', n || '0');
} catch { console.log('zcode-barn: 0'); }
