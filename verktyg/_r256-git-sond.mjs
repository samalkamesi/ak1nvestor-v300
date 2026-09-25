import { execSync } from 'node:child_process';
const kör = (c) => { try { return execSync(c, { timeout: 20000, cwd: '/home/ak1a/agent/ak1' }).toString().trim(); } catch (e) { return 'FEL: ' + String(e.message).slice(0, 80); } };
console.log('== status ==');
console.log(kör('git status --porcelain'));
console.log('== cd6d2e2c filer ==');
console.log(kör('git show --stat --oneline cd6d2e2c | head -20'));
