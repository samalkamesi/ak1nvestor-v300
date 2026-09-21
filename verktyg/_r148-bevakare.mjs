// Rond 148 DoD-bevakare: polla tills vakt-kuren är live (API 200 + ok:false) → riktad vakt → utfallsfil
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const UTFALL = '/home/ak1a/agent/ak1/data/vakten/r148-dod-utfall.json';
const S = (cmd, args, t = 30000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 150); } };
const rader = [];
const log = (s) => { rader.push(s); process.stdout.write(s + '\n'); };

const kurLive = () => {
  const kod = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
  if (kod !== '200') return false;
  const kropp = S('curl', ['-s', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
  return /"ok":\s*false/.test(kropp) && /"kod":\s*"inloggning"/.test(kropp);
};

const tak = Date.now() + 90 * 60 * 1000;
while (!kurLive()) {
  if (Date.now() > tak) {
    log('TIMEOUT 90 min — kuren ej live ännu (synkens kö) — bevakaren avslutar, nästa rond tar upp');
    fs.writeFileSync(UTFALL, JSON.stringify({ status: 'timeout', log: rader, ts: Date.now() }, null, 1));
    process.exit(2);
  }
  await new Promise(r => setTimeout(r, 120000));
}
log('kuren LIVE ' + new Date().toISOString() + ' — kör riktad gränsnittsvakt');

const v = S('node', ['/home/ak1a/AK1/verktyg/granssnittsvakt.mjs', '--sidor=/rapportakademin', '--bas=http://localhost:3000'], 420000);
const fynd = (v.match(/⚑/g) || []).length;
log('vakt: ' + fynd + ' fynd-tecken');
fs.writeFileSync(UTFALL, JSON.stringify({ status: fynd === 0 ? 'DOD-STANGT' : 'fynd-kvar', fynd, log: rader, vaktSvans: v.split('\n').slice(-14), ts: Date.now() }, null, 1));
log('UTFALL: ' + UTFALL + ' — ' + (fynd === 0 ? 'DoD STÄNGT (0 fynd)' : fynd + ' fynd kvar'));
