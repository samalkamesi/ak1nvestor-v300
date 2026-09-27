// Tar bort den dubblerade ROND 187-raden ur worklog.md
import { readFileSync, writeFileSync } from 'node:fs';
const p = '/home/ak1a/agent/ak1/worklog.md';
const lr = readFileSync(p, 'utf8').split('\n');
const i1 = lr.findIndex(l => l.startsWith('## ROND 187'));
const i2 = lr.findIndex((l, i) => i > i1 && l.startsWith('## ROND 187'));
if (i1 < 0 || i2 < 0) { console.log('INGEN DUBBELLT'); process.exit(0); }
if (lr[i1] !== lr[i2]) { console.log('RADERNA SKILJER'); process.exit(1); }
if (lr[i2 - 1].trim() === '') lr.splice(i2 - 1, 1);
const j = lr.findIndex((l, i) => i > i1 && l.startsWith('## ROND 187'));
lr.splice(j, 1);
writeFileSync(p, lr.join('\n'), 'utf8');
const kvar = readFileSync(p, 'utf8').split('\n').filter(l => l.startsWith('## ROND 187')).length;
console.log(`DUBBETT BORTTAGEN — ROND 187 finns nu ${kvar} gång(er)`);
