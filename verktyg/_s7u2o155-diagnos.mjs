#!/usr/bin/env node
// s7-u2 o155 — diagnos ur o151-natt-LH-filerna: main-thread, bootup, unused-JS, miljö
import { readFileSync } from 'node:fs';

const bas = '/home/ak1a/AK1/data/forskning/OPTIMERING/lighthouse';
const filer = process.argv.slice(2).length ? process.argv.slice(2) : ['kalkylator-o151-natt', 'superanalys-o151-natt'];
for (const f of filer) {
  const j = JSON.parse(readFileSync(`${bas}/${f}.json`, 'utf8'));
  const sida = f;
  const lh = j.lighthouseResult || j;
  console.log(`\n=== /${sida} (o151-natt, fetchTid=${lh.fetchTime}) ===`);
  const a = lh.audits || {};
  const mtb = a['mainthread-work-breakdown'];
  if (mtb && mtb.details) {
    console.log('MAIN-THREAD (ms):');
    for (const r of mtb.details.items || []) console.log(`  ${r.groupLabel}: ${Math.round(r.duration)}`);
  }
  const bt = a['bootup-time'];
  if (bt && bt.details) {
    console.log('BOOTUP per script (topp 12, ms):');
    const items = [...(bt.details.items || [])].sort((x, y) => y.total - x.total).slice(0, 12);
    for (const r of items) console.log(`  ${Math.round(r.total)} (cpu ${Math.round(r.scripting)}) ${r.url.slice(-90)}`);
  }
  const uj = a['unused-javascript'];
  if (uj && uj.details) {
    console.log('UNUSED-JS (topp 10):');
    const items = [...(uj.details.items || [])].sort((x, y) => y.wasteBytes - x.wasteBytes).slice(0, 10);
    for (const r of items) console.log(`  waste ${Math.round(r.wasteBytes / 1024)} KiB / total ${Math.round(r.totalBytes / 1024)} KiB  ${r.url.slice(-90)}`);
  }
  const lt = a['long-tasks'];
  if (lt && lt.details) {
    console.log(`LONG TASKS: ${lt.displayValue}`);
    const items = [...(lt.details.items || [])].sort((x, y) => y.duration - x.duration).slice(0, 8);
    for (const r of items) console.log(`  ${Math.round(r.duration)} ms @ ${Math.round(r.startTime)}`);
  }
  console.log('MILJÖ:', JSON.stringify(lh.configSettings || {}).slice(0, 200));
}
