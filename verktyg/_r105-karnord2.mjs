#!/usr/bin/env node
// ROND 105 — finslipad kollisionskontroll: mekanik-kandidater mot alla lagers kärnord
import { readdirSync, readFileSync } from 'node:fs';
const ARB = '/home/ak1a/agent/ak1';
const k = ['ppp', 'köpkraftsparitet', 'ränteparitet', 'realväxelkurs', 'reer', 'stark krona', 'svag krona', 'devalvering', 'hedga', 'hedging', 'valutahedging', 'reservvaluta', 'flyktvaluta', 'safe haven', 'valutapar', 'exportvinster', 'exportörens', 'exportörer', 'valutalån', 'kronförsvagning', 'uppskattad krona', 'kursrisk', 'valutareserven'];
const tra = [];
for (const f of readdirSync(`${ARB}/src/lib`).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f))) {
  const t = readFileSync(`${ARB}/src/lib/${f}`, 'utf-8');
  for (const m of t.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
    const ord = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase());
    for (const kk of k) {
      const hit = ord.find((o) => o === kk || o.includes(kk) || kk.includes(o));
      if (hit) tra.push(`${kk.padEnd(20)} ${f.replace('ai-mentor-', '').replace('-fragor.ts', '')}:"${hit}"`);
    }
  }
}
console.log(tra.length ? tra.join('\n') : 'ALLA LEDIGA');
