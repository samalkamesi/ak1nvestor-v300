// r312-sond3: v203-desk-paritet-status
import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync(
  '/home/ak1a/AK1/data/vakten/agentfabrik/status/v203-desk-paritet-1789628600.json', 'utf8'));
console.log(JSON.stringify({ id: j.id, status: j.status, progress: j.progress, uppdaterad: j.uppdaterad }, null, 1));
if (j.uppgifter) for (const u of j.uppgifter) {
  console.log(u.id, u.status, u.exitKod ?? '', (u.leverans || '').slice(0, 100));
}
