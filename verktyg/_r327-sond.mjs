// r327-lägessond: träd, deploy, läckage, vakt — kör via node (skal-säker kanal)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const run = (cmd, cwd = '/home/ak1a/agent/ak1') => {
  try { return execSync(cmd, { cwd, encoding: 'utf8', timeout: 20000 }).trim(); }
  catch (e) { return 'FEL: ' + (e.stdout || e.message).toString().slice(0, 300); }
};

console.log('=== MIN YTA (senaste 4) ===');
console.log(run('git log --oneline -4'));
console.log('\n=== YTANS STATUS ===');
console.log(run('git status --porcelain'));

console.log('\n=== PROD-TRÄD AK1 (senaste 5) ===');
console.log(run('git log --oneline -5', '/home/ak1a/AK1'));

console.log('\n=== PROD HTTP ===');
console.log('startsida: ' + run("curl -s -o /dev/null -w '%{http_code}' -m 10 http://localhost:3000/"));
// Framtidsslug: hitta en bloggpost med publishedAt i framtiden
const framtid = run("grep -rl '2026-10-2' /home/ak1a/agent/ak1/data/blogg/*.json 2>/dev/null | head -3");
console.log('framtidsträffar: ' + (framtid || 'inga'));

console.log('\n=== DEPLOYVAKT-KVITO ===');
for (const f of ['r326-deployvakt-kvito.json', 'r326-deployvakt.log']) {
  const p = '/home/ak1a/agent/ak1/data/vakten/' + f;
  if (fs.existsSync(p)) {
    const txt = fs.readFileSync(p, 'utf8');
    console.log(`--- ${f} (svans) ---`);
    console.log(txt.slice(-1200));
  }
}

console.log('\n=== SYNKLOGG (svans) ===');
const synk = '/home/ak1a/AK1/data/infra/contabo/prod-synk.log';
for (const cand of [synk, '/home/ak1a/AK1/prod-synk.log', '/home/ak1a/prod-synk.log']) {
  if (fs.existsSync(cand)) {
    console.log(`--- ${cand} ---`);
    console.log(run(`tail -15 ${cand}`));
    break;
  }
}

console.log('\n=== GRÄNSSNITTSVAKT SENASTE (AK1) ===');
const vaktDir = '/home/ak1a/AK1/data/vakten';
try {
  const files = fs.readdirSync(vaktDir).filter(f => f.includes('granssnitt')).sort();
  if (files.length) console.log(files.slice(-3).join('\n'));
} catch { console.log('ingen vaktkatalog'); }
