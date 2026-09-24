// Fabriksstatus: plockade fabriken v164? barn? RAM?
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const t = (f) => { try { return f(); } catch (e) { return 'ERR ' + String(e.message).slice(0, 120); } };
const ut = {};
ut.v164Status = t(() => fs.existsSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/v164-fas3-djup.json')
  ? JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/vakten/agentfabrik/status/v164-fas3-djup.json', 'utf8')).status
  : 'ej plockad ännu');
ut.fabrikBarn = t(() => execSync("pgrep -af 'fabriksagent' | wc -l", { encoding: 'utf8' }).trim());
ut.ram = t(() => execSync("free -m | awk '/Mem:/{print $7\" MB\"}'", { encoding: 'utf8' }).trim());
ut.prodSmutsiga = t(() => execSync("git -C /home/ak1a/AK1 status --porcelain | grep -v '^??' | head -3", { encoding: 'utf8' }).trim() || 'spårad-ren');
ut.bygger = t(() => execSync("pgrep -af 'npm run build|next build' | grep -v grep | wc -l", { encoding: 'utf8' }).trim() + ' byggprocesser');
console.log(JSON.stringify(ut, null, 1));
