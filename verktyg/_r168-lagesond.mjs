// Rond 168 lägessond: push-poll hälsa, prod-yta, fabrik, RAM + dataset-eyebrow-kartläggning
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const t = (f) => { try { return f(); } catch (e) { return 'ERR ' + String(e.message).slice(0, 120); } };
const ut = {};

ut.pollProcess = t(() => execSync("pgrep -af 'pushpoll3' | grep -v lagesond | head -2", { encoding: 'utf8' }).trim() || 'DÖD');
ut.prodYta = t(() => execSync("git -C /home/ak1a/AK1 status --porcelain | wc -l", { encoding: 'utf8' }).trim() + ' rader');
ut.ram = t(() => execSync("free -m | awk '/Mem:/{print $7\" MB\"}'", { encoding: 'utf8' }).trim());
ut.fabrikBarn = t(() => execSync("pgrep -af 'fabriksagent' | wc -l", { encoding: 'utf8' }).trim() + ' barn');

// dataset-indexens eyebrow-läge: hur ser sidorna ut idag?
ut.datasetSidor = t(() => execSync("ls /home/ak1a/agent/ak1/src/app/dataset/ 2>/dev/null | head -12", { encoding: 'utf8' }).trim() || 'ingen katalog');
ut.datasetEyebrow = t(() => execSync("grep -rn 'eyebrow\\|overline\\|text-xs.*uppercase.*tracking' /home/ak1a/agent/ak1/src/app/dataset/*.tsx 2>/dev/null | head -5", { encoding: 'utf8' }).trim() || '0 träffar');
console.log(JSON.stringify(ut, null, 1));
