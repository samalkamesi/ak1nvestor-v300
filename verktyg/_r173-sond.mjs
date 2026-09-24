// Rond 173-sond: fabrikens v164-status + vaktrapport + git-läge
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const p = (...a) => console.log(...a);

// 1. Fabrikens v164-status (prod-trädet först, sedan arbetsytan)
for (const bas of ['/home/ak1a/AK1', '/home/ak1a/agent/ak1']) {
  const fil = `${bas}/data/vakten/agentfabrik/status/v164-fas3-djup.json`;
  try {
    const d = JSON.parse(fs.readFileSync(fil, 'utf8'));
    p(`FABRIK ${bas}: status=${d.status} klara=${(d.klara || []).length}/${(d.uppgifter || []).length}`);
    for (const u of (d.klara || []).slice(-5)) p(`  klar: ${u.id} ${u.titel || ''} exit=${u.exitKod ?? '?'}`);
    for (const u of (d.uppgifter || [])) {
      const k = (d.klara || []).some(x => x.id === u.id);
      if (!k) p(`  VÄNTAR: ${u.id} ${u.titel || ''}`);
    }
  } catch (e) { p(`FABRIK ${bas}: ingen statusfil (${e.code || e.message})`); }
}

// 2. Senaste kvalitetsrapport
const rappDir = '/home/ak1a/agent/ak1/data/rapporter';
const rapporter = fs.readdirSync(rappDir).filter(f => f.startsWith('kvalitetsrapport-')).sort();
const senast = rapporter[rapporter.length - 1];
p(`\nVAKT senaste: ${senast}`);
const txt = fs.readFileSync(`${rappDir}/${senast}`, 'utf8');
// skriv ut de första 50 raderna
p(txt.split('\n').slice(0, 50).join('\n'));

// 3. Git-läge: arbetsyta vs prod
for (const [namn, cwd] of [['WS', '/home/ak1a/agent/ak1'], ['PROD', '/home/ak1a/AK1']]) {
  const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd }).toString().trim();
  const dirty = execFileSync('git', ['status', '--porcelain'], { cwd }).toString().trim();
  p(`GIT ${namn}: HEAD=${head} smutsig=${dirty ? dirty.split('\n').length + ' rader' : 'NEJ'}`);
}
