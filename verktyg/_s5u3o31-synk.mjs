#!/usr/bin/env node
// _s5u3o31-synk.mjs — atomisk registersynk för s5-u3 o31: +3 kurser (mt-09, kt-11, bk-09)
// på seriepositioner (efter senaste seriegrillen), llms 498→501, sedan publika generatorer.
// src/lib/* rörs EJ här (Edit-kanalen äger dem). Round-trip: kursfil ≡ registerpost.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROTT = '/home/ak1a/AK1';
const REG = `${ROTT}/public/deep-courses.json`;
const NYA = [
  { slug: 'mt-09-regleringsmoat', efter: 'mt-08-kvalitetspremien' },
  { slug: 'kt-11-indexinklusionen', efter: 'kt-10-avknoppningen' },
  { slug: 'bk-09-valutadifferenserna', efter: 'bk-08-intaktredovisningen' },
];

const reg = JSON.parse(readFileSync(REG, 'utf8'));
const gamlaNycklar = Object.keys(reg);
console.log('före:', gamlaNycklar.length, 'kurser');

// idempotens: redan inlagda?
const finns = NYA.filter(n => gamlaNycklar.includes(n.slug));
if (finns.length) { console.log('redan inlagda:', finns.map(f => f.slug).join(', ')); }

// bygg ny nyckelföljd med inserts
const nyaObj = {};
let inlaggda = 0;
for (const key of gamlaNycklar) {
  nyaObj[key] = reg[key];
  for (const n of NYA) {
    if (n.efter === key && !gamlaNycklar.includes(n.slug)) {
      nyaObj[n.slug] = JSON.parse(readFileSync(`${ROTT}/data/kurser-tillagg/${n.slug}.json`, 'utf8'));
      inlaggda++;
      console.log(`insert ${n.slug} efter ${n.efter}`);
    }
  }
}
// round-trip: registerpost ≡ kursfil (bitidentiskt objekt)
let rt = 0;
for (const n of NYA) {
  const fil = JSON.parse(readFileSync(`${ROTT}/data/kurser-tillagg/${n.slug}.json`, 'utf8'));
  if (JSON.stringify(fil) === JSON.stringify(nyaObj[n.slug])) rt++;
  else { console.log(`FEL round-trip ${n.slug}`); process.exit(1); }
}
console.log(`round-trip ${rt}/3 bitidentiska`);

// serieordning: förekommer före nästa serie-medlem? (grannen skall ligga strax före)
for (const n of NYA) {
  const idx = Object.keys(nyaObj).indexOf(n.slug);
  if (Object.keys(nyaObj)[idx - 1] !== n.efter) { console.log(`FEL serieordning ${n.slug}: föregångare ${Object.keys(nyaObj)[idx - 1]}`); process.exit(1); }
}
console.log('serieordning ×3 OK');

if (inlaggda > 0) {
  writeFileSync(REG, JSON.stringify(nyaObj, null, 2) + '\n');
  console.log('register skrivet:', Object.keys(nyaObj).length, 'kurser');
}

// llms ×2: 498→501 (endast antalsförekomster — visa varje rad)
for (const f of ['public/llms.txt', 'public/llms-full.txt']) {
  let txt = readFileSync(`${ROTT}/${f}`, 'utf8');
  const n0 = (txt.match(/498/g) || []).length;
  txt = txt.replace(/498/g, '501');
  writeFileSync(`${ROTT}/${f}`, txt);
  console.log(`${f}: ${n0} ställen 498→501`);
}

// publika generatorer
for (const v of ['verktyg/kor-sokindex.mjs', 'verktyg/kor-speglar-slugar.mjs', 'verktyg/rakna-siffror.mjs']) {
  const out = execSync(`node ${ROTT}/${v}`, { cwd: ROTT }).toString().trim();
  console.log(`${v}: ${out.split('\n').pop()}`);
}

// mentor-bake → stdout till gitignorerad väntfil (Edit-materialet)
const bake = execSync(`node ${ROTT}/verktyg/testa-ai-mentor.mjs --baka`, { cwd: ROTT, maxBuffer: 32 * 1024 * 1024 }).toString();
writeFileSync(`${ROTT}/data/vakten/_s5u3o31-mentor-bake.txt`, bake);
const bakeRader = (bake.match(/^\s*\{ slug:/gm) || []).length;
console.log(`mentor-bake: ${bakeRader} rader (väntar Edit i ai-mentor-register.ts)`);
