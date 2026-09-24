// Rond 160: bokför iterationen + bevaka deploy av 3fa731d8 → verifiera /fas2 i live-sitemap.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';
const prod = '/home/ak1a/AK1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION post-r159 [organ:Φ] — 2026-09-24: restverifiering påbörjad — prod-träd bär 3fa731d8 men deploy SVÄLTSTOPPAD på RAM under pågående bygg (df74a530-bygget lever: next-build + 3 jest-workers ~2,2 GB); /fas2 svarar 200 (kf3-bygget) men sitemap-posten kommer först med 3fa731d8-bygget; v159 PLOCKAT av fabriken, status vantar-ram (föds när byggprocesserna släpper minnet — naturlig sekvens, synken äger byggloopen enligt V235). Bevakare startad: _r160-bevaka.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'worklog.md', 'verktyg/_r159-minne.mjs', 'verktyg/_r160-verifiera.mjs', 'verktyg/_r160-ram.mjs', 'verktyg/_r160-bevaka.mjs']);
execFileSync('git', ['commit', '-m', 'studio: iteration [organ:Φ] — restverifiering påbörjad + deploy-bevakare (bygg pågår, v159 vantar-ram)'], { cwd: ws, encoding: 'utf8', timeout: 240000 });
console.log('commit:', git(['log', '-1', '--format=%h %s']).slice(0, 100));
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad (väntar ut):', String(e.stderr || e.message).slice(0, 150));
}

// Bevaka deploy av 3fa731d8 (max 8 min, avläsning var 2:a minut)
const deadline = Date.now() + 8 * 60 * 1000;
while (Date.now() < deadline) {
  const svans = readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n').slice(-6);
  const deployad = svans.find((r) => r.includes('DEPLOYAD automatiskt') && r.includes('3fa731d8'));
  if (deployad) {
    console.log('DEPLOY KÄNNETECKNAT:', deployad);
    await new Promise((r) => setTimeout(r, 30000)); // låt pm2/nginx landa
    const sm = await (await fetch('https://lab.ak1nvestor.com/sitemap.xml')).text();
    console.log('LIVE-SITEMAP /fas2:', sm.includes('<loc>https://lab.ak1nvestor.com/fas2</loc>'), '| storlek:', sm.length);
    process.exit(0);
  }
  console.log('väntar deploy …', new Date().toISOString().slice(11, 19), '| svans:', svans[svans.length - 1].slice(0, 90));
  await new Promise((r) => setTimeout(r, 120000));
}
console.log('bevakarens fönster utgick — deploy fortfarande på gång; ny bevakare vid nästa iteration');
