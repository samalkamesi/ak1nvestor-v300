// Git-status via node-kanalen (skalet hänger)
import { execSync } from 'node:child_process';
const ut = execSync('git -C /home/ak1a/agent/ak1 status --porcelain', { encoding: 'utf8', timeout: 30000 });
console.log(ut || 'REN');
