// Kollar om kvalitetsvakten springer / när rapporten skrevs senast
import { execSync } from 'node:child_process';
const t = (f) => { try { return f(); } catch (e) { return 'ERR ' + String(e.message).slice(0, 100); } };
console.log(JSON.stringify({
  nu: new Date().toISOString(),
  vaktProcess: t(() => execSync("pgrep -af 'kvalitetsvakt' | grep -v kvsond | head -2", { encoding: 'utf8' }).trim() || 'ingen'),
  rapportGenererad: t(() => execSync("grep -o 'Genererad: [^*]*' /home/ak1a/AK1/data/rapporter/kvalitetsrapport-SENASTE.md | head -1", { encoding: 'utf8' }).trim()),
  rapportStatus: t(() => execSync("grep 'ANTAL FEL' /home/ak1a/AK1/data/rapporter/kvalitetsrapport-SENASTE.md", { encoding: 'utf8' }).trim()),
}, null, 1));
