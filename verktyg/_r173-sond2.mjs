// Rond 173-sond 2: prod-läge detaljerat
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const p = (...a) => console.log(...a);
const prod = '/home/ak1a/AK1';
const ws = '/home/ak1a/agent/ak1';
const git = (args, cwd) => execFileSync('git', args, { cwd }).toString().trim();

// 1. Prods smutsiga yta
p('== PROD smutsiga filer ==');
p(git(['status', '--porcelain'], prod));

// 2. Är mimosa-härden a42933df i prod:s historia?
p('\n== mimosa-härd a42933df i prod? ==');
try { p(git(['merge-base', '--is-ancestor', 'a42933df', 'HEAD'], prod) === '' ? 'JA (förfader till HEAD)' : '?'); }
catch { p('NEJ (ej förfader)'); }

// 3. Prod:s senaste 12 commits
p('\n== PROD log ==');
p(git(['log', '--oneline', '-12'], prod));

// 4. v164 leveransrader (f22-f24)
p('\n== v164 klara-uppgifter (f22-f24 detalj) ==');
const st = JSON.parse(fs.readFileSync(`${prod}/data/vakten/agentfabrik/status/v164-fas3-djup.json`, 'utf8'));
p('status:', st.status, 'klara:', (st.klara || []).length);
for (const u of (st.klara || [])) {
  if (['f22', 'f23', 'f24'].includes(u.id)) p(JSON.stringify(u).slice(0, 500));
}

// 5. Finns f22-f24-underlagen i prod-trädet?
p('\n== Fas3-underlag i prod ==');
p(fs.readdirSync(`${prod}/data/forskning/KURS-FAS3`).join('\n'));
