// Rond 150 DoD-bevakare 2 (säkring): längre tak — täcker synkens svältstopsbygg ~20:27Z + ombyggen
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const UTFALL = '/home/ak1a/agent/ak1/data/vakten/r150-dod-utfall.json';
const S = (cmd, args, t = 30000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 150); } };
const rader = [];
const log = (s) => { rader.push(s); process.stdout.write(s + '\n'); };

const kurLive = () => {
  const kod = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
  if (kod !== '200') return false;
  const kropp = S('curl', ['-s', '--max-time', '15', 'http://localhost:3000/api/rapportakademin/pass?slug=abb-ar-2025']);
  return /"ok":\s*false/.test(kropp) && /"kod":\s*"inloggning"/.test(kropp);
};

const tak = Date.now() + 100 * 60 * 1000;
while (!kurLive()) {
  if (Date.now() > tak) {
    log('TIMEOUT 100 min — kuren ej live (synkens kö fortsätter) — nästa rond tar upp');
    fs.writeFileSync(UTFALL, JSON.stringify({ status: 'timeout', log: rader, ts: Date.now() }, null, 1));
    process.exit(2);
  }
  await new Promise(r => setTimeout(r, 120000));
}
log('kuren LIVE ' + new Date().toISOString() + ' — kör riktad gränsnittsvakt');

const v = S('node', ['/home/ak1a/AK1/verktyg/granssnittsvakt.mjs', '--sidor=/rapportakademin', '--bas=http://localhost:3000'], 420000);
const fynd = (v.match(/⚑/g) || []).length;
const resultat = { status: fynd === 0 ? 'DOD-STANGT' : 'fynd-kvar', fynd, log: rader, vaktSvans: v.split('\n').slice(-14), ts: Date.now() };
fs.writeFileSync(UTFALL, JSON.stringify(resultat, null, 1));
// spegla till r148:s utfallsnamn om bevakare 1 ännu inte skrivit sin (enskild sanningskälla för rundorna)
const R148 = '/home/ak1a/agent/ak1/data/vakten/r148-dod-utfall.json';
if (!fs.existsSync(R148)) fs.writeFileSync(R148, JSON.stringify(resultat, null, 1));
log('UTFALL: ' + UTFALL + ' — ' + (fynd === 0 ? 'DoD STÄNGT (0 fynd)' : fynd + ' fynd kvar'));
