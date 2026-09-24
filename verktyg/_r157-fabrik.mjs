// rond 157: fabrikstatus i prod — vilket manifest håller ytan?
import fs from 'node:fs';

const dir = '/home/ak1a/AK1/data/vakten/agentfabrik/status';
const ut = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  try {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
    const klara = (j.uppgifter || []).filter(u => u.status === 'klar').length;
    const aktiva = (j.uppgifter || []).filter(u => u.status === 'kör').map(u => u.id);
    ut.push(`${f}: status=${j.status} · ${klara}/${(j.uppgifter || []).length} klara${aktiva.length ? ' · AKTIVA: ' + aktiva.join(',') : ''}`);
  } catch { ut.push(`${f}: parse-fel`); }
}
console.log(ut.join('\n'));
