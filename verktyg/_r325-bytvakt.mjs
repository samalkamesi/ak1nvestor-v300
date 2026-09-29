// r325: bytvakt — pollar tills prod-BUILD_ID förnyats (byte skett), max ~8,5 min per körning.
// Vid byte: kvito 404 på framtidslug + 200 på startsida.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 30_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const START_MTID = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID').mtimeMs; // fryst startläge

for (let i = 0; i < 17; i++) {
  const st = fs.statSync('/home/ak1a/AK1/.next/BUILD_ID');
  if (st.mtimeMs > START_MTID + 60_000) {
    console.log(`BYTE SKETT — prod BUILD_ID mtime: ${st.mtime.toISOString()} (klockan ${new Date().toISOString()})`);
    await sleep(8_000); // låt pm2 andas efter omstart
    const framtid = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/blogg/sa-laser-du-holm-q3-2026`).ut;
    const startsida = kort(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://lab.ak1nvestor.com/`).ut;
    const bloggLista = kort(`curl -s --max-time 20 https://lab.ak1nvestor.com/blogg`).ut;
    const listaRen = !/sa-laser-du-holm-q3-2026/i.test(bloggLista);
    console.log(`KVITO: framtidslug=${framtid} (väntat 404) · startsida=${startsida} (väntat 200) · blogglistan ren från framtidslug: ${listaRen ? 'JA' : 'NEJ'}`);
    console.log(framtid === '404' && startsida === '200' && listaRen
      ? 'LÄCKAGET TÄPPT — sälj-u6 S2 LEVER I PROD'
      : 'AVVIKELSE — kontrollera manuellt');
    process.exit(0);
  }
  if (i % 4 === 0) {
    const bygger = kort(`ps aux | grep -c 'next build' `).ut;
    const synk = kort(`ps aux | grep -c 'prod-synk' `).ut;
    console.log(`${new Date().toISOString()} väntar… (bygg-processer~${bygger.trim()}, synk~${synk.trim()})`);
  }
  await sleep(30_000);
}
console.log(`${new Date().toISOString()} inget byte inom fönstret — kör skriptet igen`);
