// Rond 175: commit granskningsverktyget + kolla prods smutsiga rad
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1', prod = '/home/ak1a/AK1';
const git = (args, cwd = ws, t = 300000) => execFileSync('git', args, { cwd, timeout: t }).toString().trim();

console.log('prod spårade smutsiga:');
console.log(git(['status', '--porcelain'], prod).split('\n').filter(r => r.trim() && !r.trim().startsWith('??')).join('\n') || '(inga)');

fs.writeFileSync('/tmp/r175.txt', 'studio: rond 175 [organ:\u03a6] \u2014 mekanisk v166-granskare byggd (kontraktet: position/num, chapterCount, \u03a3-konsistens, quiz=3+struktur, blocktyper, utmaning, varum\u00e4rkesgrind, lagrum, tal\u00f6verf\u00f6ring \u226570%, num-sekvens) \u2014 sj\u00e4lvtest gr\u00f6nt 0/0/24-v\u00e4ntar');
console.log(git(['add', 'verktyg/_r175-sond.mjs', 'verktyg/_r175-granska.mjs', 'verktyg/_r175-bokfor.mjs']));
console.log(git(['commit', '-F', '/tmp/r175.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
