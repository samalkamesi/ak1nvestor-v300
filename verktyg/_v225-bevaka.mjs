// _v225-bevaka.mjs — bevaka prod-synkens deployfönster: loggsvans + låsprobe + fabrikstystnad.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 20) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000 }).trim(); } catch { return '(fel)'; } }
function las() { try { return fs.readFileSync('/home/ak1a/AK1/data/vakten/prod-synk.log', 'utf8').trim().split('\n'); } catch { return ['(ingen logg)']; } }

console.log('start', new Date().toISOString());
let senast = '';
for (let i = 0; i < 28; i++) {
  const rader = las();
  const svans = rader.slice(-3).join('\n');
  if (svans !== senast) { console.log('\n[logg ' + new Date().toISOString().slice(11, 19) + ']\n' + svans); senast = svans; }
  const lasStatus = ko("exec 9<>/tmp/ak1a-deploy.lock && flock -n 9 && echo FREET || echo UPPTAGET");
  // aktiva fabriksmanifest
  let aktiva = 0;
  try { for (const f of fs.readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik/status')) {
    if (!f.endsWith('.json')) continue;
    try { const j = JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/' + f, 'utf8'));
      if (j.status === 'pågår' || j.status === 'vantar-ram') aktiva++;
    } catch {}
  } } catch {}
  if (i % 4 === 0) console.log(`[${new Date().toISOString().slice(11, 19)}] lås=${lasStatus} aktiva-fabrik=${aktiva}`);
  if (lasStatus === 'UPPTAGET') console.log(`[${new Date().toISOString().slice(11, 19)}] BYGGBÖRJAN: låset hålls (deploy fönster öppnat)`);
  await new Promise(r => setTimeout(r, 20000));
}
console.log('\nbevakning slut', new Date().toISOString());
