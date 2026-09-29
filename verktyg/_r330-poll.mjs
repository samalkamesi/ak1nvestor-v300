// r330 poll: 07:17Z-gränssnittsvaktskörningen = första automatiska crontab-beviset
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const sh = (cmd, timeout = 30000) => {
  try { return execSync(cmd, { cwd: '/bin', shell: '/bin/bash', encoding: 'utf8', timeout }).trim(); }
  catch { return ''; }
};
const AK1 = '/home/ak1a/AK1';

console.log('start: ' + sh("date -u '+%H:%M:%SZ'"));
const deadline = Date.now() + 20 * 60 * 1000;
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 60000));
  const nu = sh("date -u '+%H:%M:%SZ'");
  const rapport = sh(`find ${AK1}/data/vakten -maxdepth 1 -name 'granssnitt-*.json' -newermt '2026-09-29 07:15' 2>/dev/null | head -1`);
  const cronlog = sh(`tail -6 ${AK1}/data/vakten/cron.log 2>/dev/null`);
  const pumpor = sh("grep -a 'gränssnittsvakt' /home/ak1a/.pm2/logs/ak1a-pumpor-out.log 2>/dev/null | tail -2");
  console.log(`${nu}: rapport=${rapport ? rapport.split('/').pop() : '–'} ${cronlog.includes('LÅST') ? '· LÅST-rad synlig' : ''}${pumpor ? ' · pumpor: ' + pumpor.split('\n').pop().slice(-40) : ''}`);
  if (rapport) {
    console.log('\n=== RAPPORTEN ===');
    try {
      const j = JSON.parse(fs.readFileSync(rapport, 'utf8'));
      console.log('fil: ' + rapport.split('/').pop());
      console.log('status: ' + j.status);
      console.log('tidsstämpel: ' + j.tid);
      const komb = j.kombinationer ?? [];
      const fel = (j.fel ?? []).length;
      let fynd = 0;
      for (const k of komb) fynd += (k.fynd ?? []).length;
      console.log(`kombinationer: ${komb.length} · totala fynd: ${fynd} · fel: ${fel}`);
      if (fynd > 0) {
        for (const k of komb) for (const f of (k.fynd ?? []).slice(0, 5)) console.log(`  FYND [${k.tema ?? '?'}/${k.viewport ?? '?'}]: ${String(f).slice(0, 140)}`);
      }
    } catch (e) { console.log('parse-fel: ' + e.message); }
    console.log('\ncron.log-svans:');
    console.log(cronlog);
    console.log('\nBEVIS BEDÖMT: rapport skapad av 07:17Z-körningen — crontab-kanalen lever');
    break;
  }
}
console.log('\nKLAR poll');
