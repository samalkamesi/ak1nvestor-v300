// _v222-lastkoll.mjs — CPU-topp + kursrutt-prober.
import { execFileSync } from 'node:child_process';
try {
  console.log(execFileSync('ps', ['-eo', 'pid,pcpu,pmem,etimes,args', '--sort=-pcpu'], { encoding: 'utf8', timeout: 15000 }).split('\n').slice(0, 12).join('\n'));
} catch (e) { console.log('(fel ' + e.message.split('\n')[0] + ')'); }

const sond = async (url) => {
  const t0 = Date.now();
  try { const s = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000) }); console.log(`${s.status} · ${Date.now() - t0} ms · ${url.replace('https://lab.ak1nvestor.com', '')}`); }
  catch (e) { console.log(`FEL · ${url.replace('https://lab.ak1nvestor.com', '')}`); }
};
console.log('\n== kursrutter ==');
await sond('https://lab.ak1nvestor.com/kurser/am-10-insynslistan');
await sond('https://lab.ak1nvestor.com/kurs/am-10-insynslistan');
await sond('https://lab.ak1nvestor.com/kurser/ud-10-ex-dagens-mekanik');
await sond('https://lab.ak1nvestor.com/kurs/ud-10-ex-dagens-mekanik');
