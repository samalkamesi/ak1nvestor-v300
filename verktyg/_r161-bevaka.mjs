// Rond 161: bevaka deployen → verifiera /fas2 i live-sitemap + v159-status + RAM.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const prod = '/home/ak1a/AK1';

function v159Lage() {
  const stDir = `${prod}/data/vakten/agentfabrik/status`;
  for (const f of readdirSync(stDir).filter((f) => f.includes('v159'))) {
    const j = JSON.parse(readFileSync(join(stDir, f), 'utf8'));
    return `${j.status} (${(j.klara || []).length}/${j.totalt ?? '?'})`;
  }
  return '(ej hittad)';
}

const deadline = Date.now() + 9 * 60 * 1000;
while (Date.now() < deadline) {
  const svans = readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n').slice(-3);
  const deployad = svans.find((r) => r.includes('DEPLOYAD automatiskt'));
  if (deployad) {
    console.log('DEPLOY LANDAT:', deployad);
    await new Promise((r) => setTimeout(r, 30000));
    const bas = 'https://lab.ak1nvestor.com';
    const sm = await (await fetch(bas + '/sitemap.xml')).text();
    console.log('LIVE-SITEMAP /fas2:', sm.includes('<loc>' + bas + '/fas2</loc>'), '| storlek:', sm.length);
    const f2 = await (await fetch(bas + '/fas2')).text();
    console.log('/fas2 "kundgrupper":', f2.includes('kundgrupper'), '| status-sidtest görs i kvalitetsvakt');
    console.log('v159:', v159Lage());
    process.exit(0);
  }
  console.log(
    new Date().toISOString().slice(11, 19),
    '| v159:', v159Lage(),
    '| svans:', svans[svans.length - 1].slice(0, 100)
  );
  await new Promise((r) => setTimeout(r, 120000));
}
console.log('fönster utgick — deploy pågår; ny bevakare nästa iteration. v159:', v159Lage());
