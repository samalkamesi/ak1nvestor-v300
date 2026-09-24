// Rond 161-iteration: deploy-läge + live-sitemap + v159 + RAM i ett svep.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const prod = '/home/ak1a/AK1';

console.log('== PROD-SYNK-LOGG (sista 10) ==');
console.log(readFileSync(`${prod}/data/vakten/prod-synk.log`, 'utf8').trim().split('\n').slice(-10).join('\n'));

console.log('\n== LIVE ==');
const bas = 'https://lab.ak1nvestor.com';
const r = await fetch(bas + '/');
console.log('/ =>', r.status);
const sm = await (await fetch(bas + '/sitemap.xml')).text();
console.log('sitemap.xml:', sm.length, 'tecken | /fas2 finns:', sm.includes('<loc>' + bas + '/fas2</loc>'));
const f2 = await (await fetch(bas + '/fas2')).text();
console.log('/fas2 => innehåller "kundgrupper":', f2.includes('kundgrupper'), '| 20 indikatorer:', new Set([...f2.matchAll(/\bV(\d{2})\b/g)]).size);

console.log('\n== V159 ==');
const stDir = `${prod}/data/vakten/agentfabrik/status`;
for (const f of readdirSync(stDir).filter((f) => f.includes('v159'))) {
  const j = JSON.parse(readFileSync(join(stDir, f), 'utf8'));
  console.log(f, '=> status:', j.status, '| klara:', (j.klara || []).length, '/', j.totalt ?? '?');
}

console.log('\n== RAM ==');
console.log(execFileSync('free', ['-m'], { encoding: 'utf8' }).split('\n')[1]);
console.log('\n== PROD-BYGG-PROCESSER ==');
const ps = execFileSync('ps', ['--sort=-rss', '-eo', 'rss,etime,comm'], { encoding: 'utf8' }).split('\n').slice(1, 6);
for (const p of ps) console.log(' ', p.trim().slice(0, 80));
