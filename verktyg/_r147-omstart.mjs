// rond 147: kontrollerad omstart av pm2 'ak1a' (4,3 GB-läckan) enligt våg 216-samordning
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const JURNAL = '/tmp/ak1a-omstart-journal.json';
const LAS = '/tmp/ak1a-deploy.lock';

// (1) deploylås-probe: hålls flocken? (öppna exklusivt utan block — lyckas = ledigt)
let deployLas = 'LEDIGT';
try {
  const fd = fs.openSync(LAS, 'a');
  try { fs.flockSync ? null : null; } catch {}
  // node saknar flock-syscall utan att öppna med 'wx'; använd flock(1) via exec i stället
  fs.closeSync(fd);
} catch {}
try {
  execSync('flock -n /tmp/.r147-probe -c true', { timeout: 5000 });
  fs.rmSync('/tmp/.r147-probe', { force: true });
} catch (e) { deployLas = 'FEL-probe: ' + e.message.slice(0, 80); }

// flock på själva deploylåsfilen: -n misslyckas om någon håller den
try {
  execSync(`flock -n ${LAS} -c true`, { timeout: 5000 });
} catch (e) {
  deployLas = 'UPPTAGET (bygg pågår?)';
}

// (2) journal
let jurnal = null;
try { jurnal = JSON.parse(fs.readFileSync(JURNAL, 'utf8')); } catch {}
console.log('deploylås:', deployLas);
console.log('journal:', jurnal ? JSON.stringify(jurnal).slice(0, 300) : '(saknas)');
console.log('MemAvailable före:', Math.round(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/)[1] / 1024), 'MB');

if (deployLas !== 'LEDIGT') {
  console.log('AVBRYTER: deploylås inte ledigt.');
  process.exit(1);
}

// (3) journalpost (kanal: huvudagent-r147, verkställer själv)
const post = { kanal: 'huvudagent-r147-ramlagning', pid: process.pid, ts: Date.now(), orsak: 'next-server 4339 MB efter 22 h — RAM-läcka blockerade byggfönster + fabrik' };
fs.writeFileSync(JURNAL, JSON.stringify(post, null, 1));

// (4) omstart + spara dump
console.log('\n── pm2 restart ak1a ──');
console.log(execSync('pm2 restart ak1a --update-env', { encoding: 'utf8', timeout: 60000 }).split('\n').filter(r => /ak1a|online/.test(r)).join('\n'));
execSync('pm2 save', { encoding: 'utf8', timeout: 30000 });

// (5) vänta på uppstart + verifiera
await new Promise(r => setTimeout(r, 9000));
for (const url of ['http://localhost:3000/', 'https://lab.ak1nvestor.com/', 'http://localhost:3000/rapportakademin']) {
  try {
    const kod = execSync(`curl -s -o /dev/null -w '%{http_code}' --max-time 20 '${url}'`, { encoding: 'utf8' });
    console.log(url, '→', kod);
  } catch (e) { console.log(url, 'FEL: ' + e.message.slice(0, 100)); }
}
console.log('MemAvailable efter:', Math.round(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/)[1] / 1024), 'MB');
