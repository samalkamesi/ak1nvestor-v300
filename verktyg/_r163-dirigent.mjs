#!/usr/bin/env node
// _r163-dirigent.mjs — F6-kurens dirigent: väntar byggfönster (fabriksbarn klara + RAM),
// städar ev. korrupta Turbopack-segment, bygger under deploylås, pm2-restart,
// verifierar prod + sitemap och kör kvalitetsvakten. Allt loggas till /tmp/r163-dirigent.txt.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, existsSync, rmSync } from 'node:fs';

const LOG = '/tmp/r163-dirigent.txt';
const P = '/home/ak1a/AK1';
const t0 = Date.now();
function log(s) { appendFileSync(LOG, `${new Date().toISOString()} ${s}\n`); }
function sh(c, m = 600000) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: m }).trim(); } catch (e) { throw new Error(`${c.slice(0, 80)} => ${String(e.message).slice(0, 400)}`); } }
function ramMB() { return Math.round(parseInt(readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024); }
function fabriksBarn() { try { return sh("ps -eo pid,args | grep 'Agentfabrik' | grep -v grep | wc -l", 15000); } catch { return '9'; } }

log(`START dirigent r163 — F6-kur: sekvenserat bygg efter fabrikens s6-omgång`);

// Fas 1: vänta byggfönster (max 70 min): fabriksbarn == 0 OCH ram >= 5000
let fonster = false;
while (Date.now() - t0 < 70 * 60 * 1000) {
  const b = parseInt(fabriksBarn(), 10);
  const r = ramMB();
  if (b === 0 && r >= 5000) { fonster = true; log(`FONSTER-OPPEN barn=0 ram=${r}`); break; }
  if ((Date.now() - t0) % 60000 < 31000) log(`vantar barn=${b} ram=${r}`);
  await new Promise((res) => setTimeout(res, 30000));
}
if (!fonster) { log(`AVBRYTER: fönster öppnades ej inom 70 min (sista ram=${ramMB()})`); log('SLUT AVBROTT'); process.exit(0); }

// Fas 2: städa ev. korrupta segment (OOM-mordens arv) — pm2 servar gamla .next, endast segmentkatalogen rörs
try { if (existsSync(`${P}/.next/server/app/index.segments`)) { rmSync(`${P}/.next/server/app/index.segments`, { recursive: true, force: true }); log('SEGMENT-STADAT: index.segments borttagen'); } else log('SEGMENT: ingen städning behövs'); } catch (e) { log(`SEGMENT-VARNING ${e.message.slice(0, 150)}`); }

// Fas 3: bygg under deploylås + pm2 restart (flock löser race mot prod-synken)
log('BYGG-START (flock, npm run build + pm2 restart)');
try {
  const bygg = sh(`exec flock -n /tmp/ak1a-deploy.lock bash -c 'cd ${P} && npm run build 2>&1 | tail -5 && pm2 restart ak1a 2>&1 | tail -2'`, 900000);
  log(`BYGG-KLAR:\n${bygg}`);
} catch (e) {
  // Låset upptaget = prod-synken bygger själv — vänta in den och låt den leverera
  log(`FLOCK-UpPTAGEN/VANTE: ${e.message.slice(0, 300)}`);
  await new Promise((res) => setTimeout(res, 300000));
  log(`efter synk-vantan: ram=${ramMB()} — fortsätter till verifiering (synken äger i så fall deployn)`);
}

// Fas 4: verifiera prod (30 sgrpc-uppvarmning)
await new Promise((res) => setTimeout(res, 30000));
const sidor = ['/', '/fas2', '/fas3', '/kurser', '/analyser', '/blogg', '/medlemskap', '/om-oss'];
for (const s of sidor) {
  try { const kod = sh(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 'https://lab.ak1nvestor.com${s}'`, 30000); log(`SIDA ${s} => ${kod}`); }
  catch (e) { log(`SIDA ${s} => FEL ${e.message.slice(0, 100)}`); }
}
try { const sm = sh(`curl -s --max-time 20 'https://lab.ak1nvestor.com/sitemap.xml' | grep -c '/fas2'`, 30000); log(`SITEMAP /fas2 träffar: ${sm}`); } catch { log('SITEMAP: kunde inte läsas'); }
try { const g = sh(`curl -s --max-time 20 'https://lab.ak1nvestor.com/' | grep -o 'Börja gratis' | head -1`, 30000); log(`STARTSIDA guld-CTA: ${g || 'SAKNAS (kontrollera)'}`); } catch { log('STARTSIDA-SOND: fel'); }

// Fas 5: färsk kvalitetsvakt
try {
  if (existsSync(`${P}/verktyg/kvalitetsvakt.mjs`)) {
    const kv = sh(`cd ${P} && node verktyg/kvalitetsvakt.mjs --bas=http://localhost:3000 2>&1 | tail -15`, 600000);
    log(`KVALITETSVAKT:\n${kv}`);
  } else log('KVALITETSVAKT: verktyget saknas i prod-trädet');
} catch (e) { log(`KVALITETSVAKT-FEL ${e.message.slice(0, 200)}`); }

log(`SLUT ram=${ramMB()}`);
