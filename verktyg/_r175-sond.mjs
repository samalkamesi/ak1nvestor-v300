// Rond 175-sond: v166-fabriksstatus + processtabåge + git-läge
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const prod = '/home/ak1a/AK1', ws = '/home/ak1a/agent/ak1';
const git = (args, cwd) => execFileSync('git', args, { cwd, timeout: 60000 }).toString().trim();
const p = (...a) => console.log(...a);

try {
  const st = JSON.parse(fs.readFileSync(`${prod}/data/vakten/agentfabrik/status/v166-fas3-djupintegrering.json`, 'utf8'));
  p(`V166: status=${st.status} klara=${(st.klara || []).length}/${(st.uppgifter || []).length}`);
  for (const u of (st.klara || [])) p(`  klar: ${u.id} kod=${u.kod} sek=${u.sekunder} leverans=${(u.leverans || '').slice(0, 80)}`);
} catch (e) { p('V166 status: ' + (e.code ? 'FINNS EJ ännu (' + e.code + ')' : e.message)); }

const ko = fs.readdirSync(`${prod}/data/vakten/agentfabrik/ko`).join(', ') || '(tom)';
p('ko:', ko);

const ps = execFileSync('ps', ['aux'], { timeout: 15000 }).toString();
const barn = ps.split('\n').filter(r => /fabriksagent/.test(r) && !/grep/.test(r)).length;
p('fabriksbarn:', barn);

const mem = fs.readFileSync('/proc/meminfo', 'utf8');
p('RAM avail:', Math.round(parseInt(mem.match(/MemAvailable:\s+(\d+)/)[1], 10) / 1024), 'MB');
p('tid:', new Date().toISOString());

p('ws HEAD:', git(['log', '--oneline', '-1'], ws));
p('prod HEAD:', git(['log', '--oneline', '-1'], prod).slice(0, 90));
p('prod smutsiga (spårade):', git(['status', '--porcelain'], prod).split('\n').filter(r => r.trim() && !r.trim().startsWith('??')).length);
