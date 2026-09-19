#!/usr/bin/env node
// ROND 105 — kärnords-kollisionskarta: vilka lager äger valuta-kandidatorden?
import { readdirSync, readFileSync } from 'node:fs';
const ARB = '/home/ak1a/agent/ak1';
const kandidater = ['valuta', 'valutarisk', 'valutakurs', 'växelkurs', 'vaxelkurs', 'dollar', 'dollarn', 'usd', 'euro', 'eur', 'sek', 'kronan', 'hedga', 'hedging', 'paritet', 'ppp', 'köpkraftsparitet', 'ränteparitet', 'stark krona', 'svag krona', 'devalvering', 'realväxelkurs'];
const filer = readdirSync(`${ARB}/src/lib`).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
const agare = new Map();
for (const f of filer) {
  const txt = readFileSync(`${ARB}/src/lib/${f}`, 'utf-8');
  // extrahera alla kärnords-arrayers innehåll grovt: strängar inom karnord: [ ... ]
  for (const m of txt.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
    const ord = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase());
    for (const k of kandidater) {
      for (const o of ord) {
        if (o === k || o.includes(k) || k.includes(o)) {
          if (!agare.has(k)) agare.set(k, []);
          agare.get(k).push(`${f.replace('ai-mentor-', '').replace('-fragor.ts', '')}:"${o}"`);
        }
      }
    }
  }
}
for (const k of kandidater) console.log(k.padEnd(18), agare.get(k)?.slice(0, 4).join(' · ') || 'LEDIG');
