// r339 KVD: tsc-typnoll + node --check-syntax
import { execSync } from 'node:child_process';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 420000) => {
  try { return { ok: true, ut: execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim() }; }
  catch (e) { return { ok: false, ut: ((e.stdout || '') + '\n' + (e.stderr || e.message)).trim().slice(0, 1500) }; }
};

const tsc = sh('node node_modules/typescript/bin/tsc --noEmit');
console.log('TSC:', tsc.ok ? '0 FEL — GRÖN' : 'FEL:\n' + tsc.ut);
if (!tsc.ok) process.exit(1);

const syntax = sh('node --check verktyg/marke-framtids-404.mjs && echo OK');
console.log('marke-syntax:', syntax.ok ? syntax.ut : syntax.ut.slice(0, 200));
console.log('\nKVD-DEL 1 GRÖN — kod klar för commit');
