// Rond 111-sond: deploy-läge efter 5902867f (U49+U50), prod-hälsa, pipeline-spår
import { execSync } from 'node:child_process';

const svar = {};
function sh(nyckel, cmd) {
  try { svar[nyckel] = execSync(cmd, { encoding: 'utf8', timeout: 20000 }).trim().slice(0, 400); }
  catch (e) { svar[nyckel] = 'FEL: ' + String(e.message).slice(0, 120); }
}

sh('prodHead', 'git -C /home/ak1a/AK1 log -1 --format="%h %ad %s" --date=format-local:"%H:%M:%S" | head -c 200');
sh('wsHead', 'git -C /home/ak1a/agent/ak1 log -1 --format="%h %ad %s" --date=format-local:"%H:%M:%S" | head -c 200');
sh('wsStatus', 'git -C /home/ak1a/agent/ak1 status --porcelain | head -10');
sh('buildId', 'stat -c "%y" /home/ak1a/AK1/.next/BUILD_ID 2>/dev/null || saknas');
sh('byggproc', 'pgrep -af "next build|npm ci" | head -3 || ingen');
sh('deployLock', 'flock -n /tmp/ak1a-deploy.lock echo LEDIG 2>/dev/null || echo UPPTAGET');
sh('ram', "awk '/MemAvailable/ {printf \"%.1f GB\", $2/1048576}' /proc/meminfo");
sh('r255filer', 'ls -la /home/ak1a/agent/ak1/verktyg/_r25[5-8]* 2>/dev/null | tail -6');
sh('r255status', 'for f in /tmp/r255*status* /tmp/r255*/*.status*; do [ -f "$f" ] && echo "== $f" && tail -5 "$f"; done 2>/dev/null | head -20');
sh('pipeline', 'find /home/ak1a/agent/ak1 -maxdepth 3 -name "PIPELINE-KO.md" -not -path "*/node_modules/*" 2>/dev/null | head -2');
sh('uppdragslogg', 'tail -2 /home/ak1a/agent/ak1/data/vakten/uppdragslogg.jsonl 2>/dev/null');
sh('kunduppdrag', 'head -c 300 /home/ak1a/agent/ak1/data/vakten/kunduppdrag.json 2>/dev/null || ingen');

async function http(nyckel, url) {
  try { const res = await fetch(url, { redirect: 'manual' }); svar[nyckel] = res.status; }
  catch (e) { svar[nyckel] = 'FEL ' + String(e.message).slice(0, 60); }
}
await http('http_rot', 'http://localhost:3000/');
await http('http_dataset', 'http://localhost:3000/dataset');
await http('http_apollo', 'http://localhost:3000/bolag/apollohosp-ns');
await http('http_hal', 'http://localhost:3000/bolag/hal-ns');
await http('https_rot', 'https://lab.ak1nvestor.com/');
await http('https_apollo', 'https://lab.ak1nvestor.com/bolag/apollohosp-ns');
await http('https_hal', 'https://lab.ak1nvestor.com/bolag/hal-ns');

console.log(JSON.stringify(svar, null, 1));
