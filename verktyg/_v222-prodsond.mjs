// _v222-prodsond.mjs — ordentlig prod-sond med generösa timeouts + lastkoll.
import { execFileSync } from 'node:child_process';

function ko(cmd, tak = 15000) {
  try { return execFileSync('bash', ['-c', cmd], { encoding: 'utf8', timeout: tak }).trim(); } catch (e) { return '(fel)'; }
}
console.log('last:', ko("uptime"), '| minne:', ko("free -m | awk 'NR==2{print $7\" MB ledigt\"}'"));

const sond = async (namn, url, tak = 45000) => {
  const t0 = Date.now();
  try {
    const sv = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(tak) });
    const len = sv.status === 200 ? (await sv.text()).length : 0;
    console.log(`${namn}: ${sv.status} · ${len} byte · ${Date.now() - t0} ms`);
    return { status: sv.status, len };
  } catch (e) { console.log(`${namn}: FEL ${e.name} ${String(e.message).split('\n')[0]} · ${Date.now() - t0} ms`); return { status: 0 }; }
};

const r1 = await sond('deep-courses.json (försök 1)', 'https://lab.ak1nvestor.com/deep-courses.json');
if (r1.status !== 200) {
  console.log('— andra försöket —');
  await sond('deep-courses.json (försök 2)', 'https://lab.ak1nvestor.com/deep-courses.json');
}
await sond('sok-index.json           ', 'https://lab.ak1nvestor.com/sok-index.json');
await sond('roten /                  ', 'https://lab.ak1nvestor.com/');
await sond('en kurs-sida (ud-10)     ', 'https://lab.ak1nvestor.com/kurs/ud-10-ex-dagens-mekanik');
