#!/usr/bin/env node
// ROND 105 landning — våg 210 kod + bokföring: commit [organ:Φ] + push prod
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '/home/ak1a/agent/ak1';
const run = (c, a, o = {}) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8', ...o }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };

const msg = `${ARB}/verktyg/.r105-msg.txt`;
writeFileSync(msg, `studio: ROND 105 [organ:Φ] — VÅG 210 VALUTAMEKANIK: AI-Mentorns frågelager #57 — tio källmärkta monsters (PPP/ränteparitet/realväxelkurs/kronstyrka/devalvering/hedging/exportörens vind/reservvaluta/valutamarknaden/valutalån) aktiverar ma-07+rk-07 · kollisionskontroll mekaniskt bevisad: portfoljgrund äger valuta-GRUNDERNA (kanonisk "vad är valutarisk?" orörd), realekonomi "reer", makro naket "köpkraft" — kärnorden disjunkta (svit K LIVE mot alla lager + basmotorn) · kedjan 58 motorer/165 monsters: valutamekanik EFTER praktik FÖRE portfoljgrund (189-doktrinen), 200 motorreferenser skiftade +1 (r98-mönstret), 10 nya kanoniska · SVITER: valutamekanik 57/57 + kedja 236/236 + tsc 0 · bonus: v209 plockat av fabriken 21:05Z (u1 VESTAS + u2 SMFG/AXA klara exit 0, u3 löper) + ISR-bevakare bevakar nattens 03:10-livekvitto`);
run('git', ['add', 'src/lib/ai-mentor-valutamekanik-fragor.ts', 'src/components/ak1a/chat-widget.tsx', 'verktyg/testa-ai-mentor-valutamekanik.mjs', 'verktyg/testa-ai-mentor-kedja.mjs', 'data/forskning/PIPELINE-KO.md', 'worklog.md', 'verktyg/_r105-isr-vaktpost.mjs', 'verktyg/_r105-kollisionskarta.mjs', 'verktyg/_r105-karnordskarta.mjs', 'verktyg/_r105-karnord2.mjs', 'verktyg/_r105-baskoll.mjs', 'verktyg/_r105-kedjevakt-uppdatera.mjs', 'verktyg/_r105-tsc.mjs', 'verktyg/_r105-worklog.mjs']);
let hash;
try { const out = run('git', ['commit', '-F', msg]); hash = (out.match(/\[develop ([0-9a-f]{7,})\]/) || [])[1]; console.log('commit:', hash); }
catch (e) { const lg = run('git', ['log', '-1', '--format=%h %s']); if (lg.includes('ROND 105')) { hash = lg.split(' ')[0]; console.log('commit: redan landad', hash); } else throw e; }
if (existsSync(msg)) unlinkSync(msg);

for (let i = 1; i <= 4 && !isPAD(); i++) {
  try { console.log('push', i, ':', run('git', ['push', 'prod', 'develop']).split('\n').pop()); }
  catch (e) {
    const fel = String(e);
    console.log('push', i, 'fel:', fel.includes('staged changes') ? 'REN-YTA-GRIND' : fel.split('\n').filter((r) => r.includes('rejected')).join(' | ').slice(0, 120));
    if (!fel.includes('staged changes')) { try { run('git', ['fetch', 'prod', 'develop']); run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) { console.log('merge:', String(m).slice(0, 100)); } }
  }
}
console.log(isPAD() ? `PUSHAD: ${hash} i prod ✓` : `INTE PUSHEAD — spawnar vänta-pusher`);

if (!isPAD() && hash) {
  // vänta-pusher (r103-mönstret) — fromkopplat
  const P = `${ARB}/verktyg/_r105-pusha.mjs`;
  writeFileSync(P, `#!/usr/bin/env node
import { appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ARB = '${ARB}';
const LOG = ARB + '/data/vakten/r105-pushlogg.txt';
const KVT = ARB + '/data/vakten/r105-push-kvitto.json';
const run = (c, a) => execFileSync(c, a, { cwd: ARB, encoding: 'utf-8' }).trim();
const isPAD = () => { try { run('git', ['merge-base', '--is-ancestor', 'HEAD', 'prod/develop']); return true; } catch { return false; } };
const log = (s) => appendFileSync(LOG, new Date().toISOString() + ' ' + s + '\\n');
for (let i = 1; i <= 30; i++) {
  if (isPAD()) { writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: run('git', ['rev-parse', '--short', 'HEAD']), ts: new Date().toISOString() }, null, 2)); log('KLAR'); process.exit(0); }
  try { run('git', ['push', 'prod', 'develop']); if (isPAD()) { writeFileSync(KVT, JSON.stringify({ status: 'PUSHAD', hash: run('git', ['rev-parse', '--short', 'HEAD']), ts: new Date().toISOString() }, null, 2)); log('PUSHAD försök ' + i); process.exit(0); } }
  catch (e) { log('försök ' + i + ' fel: ' + String(e).split('\\n').filter((r) => r.includes('rejected')).join(' | ').slice(0, 120)); try { run('git', ['fetch', 'prod', 'develop']); run('git', ['merge', '--no-edit', 'prod/develop']); } catch (m) { log('mergekonflikt: ' + String(m).slice(0, 100)); } }
  await new Promise((r) => setTimeout(r, 60_000));
}
writeFileSync(KVT, JSON.stringify({ status: 'UPPGIVEN', ts: new Date().toISOString() }, null, 2));
`);
  const { spawn } = await import('node:child_process');
  const p = spawn('node', [P], { detached: true, stdio: 'ignore' });
  p.unref();
  console.log('vänta-pusher pid', p.pid);
}
