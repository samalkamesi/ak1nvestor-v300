// Rond 176: väntare — avslutar (notifierar huvudagenten) när v166 är 24/24 eller vid timeout
import fs from 'node:fs';
const fil = '/home/ak1a/AK1/data/vakten/agentfabrik/status/v166-fas3-djupintegrering.json';
const deadline = Date.now() + 70 * 60 * 1000;
while (Date.now() < deadline) {
  try {
    const st = JSON.parse(fs.readFileSync(fil, 'utf8'));
    const k = (st.klara || []).length;
    if (st.status === 'klar' && k === 24) { console.log(`V166 KLAR 24/24 — väntare avslutar ${new Date().toISOString()}`); process.exit(0); }
    console.log(`${new Date().toISOString()} v166 ${st.status} klara=${k}/24`);
  } catch (e) { console.log('läsfel', e.message.slice(0, 60)); }
  await new Promise(r => setTimeout(r, 60000));
}
console.log('timeout — v166 ej klart inom 70 min');
process.exit(3);
