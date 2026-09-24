// Rond 173-sond 3: aktiva fabrikens fönster + f24-commit-spår + processer
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const p = (...a) => console.log(...a);
const prod = '/home/ak1a/AK1';
const git = (args, cwd) => execFileSync('git', args, { cwd }).toString().trim();

// 1. Status-katalogen i prod (aktiva manifest)
p('== status-katalogen (prod) ==');
const stDir = `${prod}/data/vakten/agentfabrik/status`;
for (const f of fs.readdirSync(stDir)) {
  try {
    const d = JSON.parse(fs.readFileSync(`${stDir}/${f}`, 'utf8'));
    p(`${f}: status=${d.status} klara=${(d.klara || []).length}/${(d.uppgifter || []).length}`);
  } catch { p(`${f}: oläslig`); }
}

// 2. ko-katalogen (köande manifest)
p('\n== ko-katalogen (prod) ==');
p(fs.readdirSync(`${prod}/data/vakten/agentfabrik/ko`).join('\n') || '(tom)');

// 3. f24-commit-spår
p('\n== f24 i git-historia ==');
try { p(git(['log', '--all', '--oneline', '--', 'data/forskning/KURS-FAS3/underlag-f24-money-and-brain.md'], prod) || '(ingen commit rör filen)'); } catch (e) { p('fel:', e.message); }
p('f24 spårad? ' + (() => { try { git(['ls-files', '--error-unmatch', 'data/forskning/KURS-FAS3/underlag-f24-money-and-brain.md'], prod); return 'JA'; } catch { return 'NEJ (untracked)'; } })());

// 4. Levande fabriks-/zcode-processer
p('\n== processtabåge (zcode/fabrik) ==');
const ps = execFileSync('ps', ['eo', 'pid,ppid,etimes,rss,cmd', '--sort=-etimes'], {}).toString();
for (const rad of ps.split('\n')) {
  if (/agentfabrik|zcode|node .*verktyg/.test(rad) && !/grep/.test(rad)) {
    const m = rad.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/);
    if (m) p(`pid=${m[1]} ppid=${m[2]} ålder=${Math.round(m[3]/60)}min rss=${Math.round(m[4]/1024)}MB cmd=${m[5].slice(0, 110)}`);
  }
}

// 5. RAM
p('\n== RAM ==');
const mem = fs.readFileSync('/proc/meminfo', 'utf8');
const f = n => parseInt(mem.match(new RegExp(`${n}:\\s+(\\d+)`))?.[1] || '0', 10) / 1024;
p(`total ${Math.round(f('MemTotal'))} MB · avail ${Math.round(f('MemAvailable'))} MB`);
