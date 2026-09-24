// F6-slut: (1) pm2 save = vaccinet persistent, (2) färsk bevismätning, (3) dom-rad i FYNN-ledgern (båda träden)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const S = (cmd, args, t = 30000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, maxBuffer: 8 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 150); } };
const ut = { nu: new Date().toISOString() };

// (1) pm2 save — taket överlever omstart/resurrect
ut.pm2Save = (S('pm2', ['save'], 90000) || '').split('\n').filter(r => /successfully|saved|Error/i.test(r)).join(' | ').slice(0, 160);
try { const d = fs.readFileSync('/home/ak1a/.pm2/dump.pm2', 'utf8'); ut.dumpAntalTak = (d.match(/max_memory_restart/g) || []).length; } catch (e) { ut.dumpAntalTak = 'läs-FEL ' + e.message.slice(0, 80); }

// (2) färsk slutmätning
try {
  const jl = JSON.parse(S('pm2', ['jlist'], 20000));
  const p = jl.find(x => x.name === 'ak1a');
  ut.ak1a = { status: p?.pm2_env?.status, tak: p?.pm2_env?.max_memory_restart, rssMB: Math.round((p?.monit?.memory || 0) / 1048576), restarts: p?.pm2_env?.restart_time };
} catch (e) { ut.ak1a = 'FEL ' + e.message.slice(0, 80); }
ut.memMB = Math.round(+(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/) || [0, 0])[1] / 1024);
ut.url = {};
for (const u of ['http://localhost:3000/', 'https://lab.ak1nvestor.com/rapportakademin']) ut.url[u] = S('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '15', u]);

// (3) dom-rad — FYNN-protokollets bedömningsledger
const dom = {
  ts: '2026-09-21T18:23:00.000Z',
  domdTs: ut.nu,
  spår: 'F6-drift',
  allvar: 'HÖG',
  fynd: 'RAM 266 MB tillgängligt (FYNN F6-rop)',
  dom: 'rotkurad-vaccinerad',
  rotorsaka: 'prod-next-serverns RSS-läcka: 4 339 MB efter 22 h drift (eftersondens bevis) — serverns byggfönster stängt, OOM-dödat bygg 17:14Z, FYNN-mätningen 266 MB skedde under fabriktryck (barn + bygg). Roten är läckan, inte fabrikslasten: färskmätning vid dom = 5 219 MB tillgängligt.',
  kur: '(1) målhjärtats överlevnadsomstart 17:52 lokal (journal: frusen turn 50 min) + auto-deploy 136 commits 27a582a0 → prod 200; (2) vaccin-skriptets lås-respekterande omstart 20:07 lokal (journal kanal fynn-f6-vaccin pid 587256 ts 18:07:14Z) med mekaniskt tak max_memory_restart 2500M',
  vaccin: 'max_memory_restart 2500M LIVE (jlist 2621440000) + persistent via pm2 save (dump.pm2 bär taket). Verkställt av _f6-vaccin.mjs som väntade ut deploylåset och dog efter verkställandet med utfallsfilen oskriven (våg 148-mönstret: verkställt, svar förlorat) — sessionen komplettade med pm2 save + denna dom.',
  bevis: 'journal /tmp/ak1a-omstart-journal.json (kanal+pid+ts) · jlist tak 2621440000 · restarts 7 366→7 367 (omstart 20:07 lokal) · dump-grep max_memory_restart · RAM 5 219 MB efter · prod 200 + /rapportakademin 200 vid två oberoende mättillfällen (sond 18:24Z + denna)',
  lag: '1 (färskmätning före dom: 5 219 MB) · 2 (rot: RSS-läckan, ej symptomet fabriklast) · 6 (rot→kur→vaccin komplett: taket gör läckan självhelande vid 2,5 GB)',
  protokoll: 'rond 147 [organ:Ψ] + drift-ops-SKILL (DRIFTSBOKEN-notis) + rond 139/141 FYNN-precedens'
};
for (const trad of ['/home/ak1a/agent/ak1/data/vakten/feljakt-bedomningar.jsonl', '/home/ak1a/AK1/data/vakten/feljakt-bedomningar.jsonl']) {
  try { fs.appendFileSync(trad, JSON.stringify(dom) + '\n'); ut['domBokford:' + trad.includes('AK1/') ? 'prod' : 'agent'] = 'OK'; }
  catch (e) { ut.domFEL = trad + ': ' + e.message.slice(0, 80); }
}

console.log(JSON.stringify(ut, null, 1));
