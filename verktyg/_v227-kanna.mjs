// Sond v227: pm2-tillstånd + cert-läsbarhet + nginx-binär (drift-rond)
import { readFileSync } from 'node:fs';

try {
  const dump = JSON.parse(readFileSync('/home/ak1a/.pm2/dump.pm2', 'utf8'));
  for (const p of dump) {
    console.log('pm2:', p.name, '|', p.pm2_env?.status, '|', p.pm2_env?.pm_cwd || '');
  }
} catch (e) {
  console.log('pm2-dump FEL:', e.message);
}

for (const f of [
  '/etc/letsencrypt/live/lab.ak1nvestor.com/fullchain.pem',
  '/etc/letsencrypt/live/lab.ak1nvestor.com/privkey.pem',
  '/etc/nginx/nginx.conf',
  '/etc/nginx/sites-available/zcode-dedikerad',
]) {
  try {
    readFileSync(f);
    console.log('LÄSBAR:', f);
  } catch (e) {
    console.log('EJ LÄSBAR:', f, '|', e.code || e.message);
  }
}
