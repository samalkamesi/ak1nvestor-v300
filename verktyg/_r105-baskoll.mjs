#!/usr/bin/env node
// ROND 105 — basmotorns (ai-mentor-svar.ts) kärnord vs valutamekanikens territorium
import { readFileSync } from 'node:fs';
const ARB = '/home/ak1a/agent/ak1';
const mina = ['ppp', 'köpkraftsparitet', 'ränteparitet', 'realväxelkurs', 'stark krona', 'svag krona', 'kronstyrka', 'kronförsvagning', 'kronuppskattning', 'devalvering', 'revalvering', 'hedga', 'hedging', 'valutahedging', 'valutasäkring', 'exportörens', 'exportörer', 'exportvinster', 'valutavinden', 'exportvinden', 'reservvaluta', 'flyktvaluta', 'safe haven', 'trygg hamn', 'valutamarknaden', 'valutamarknad', 'valuthandeln', 'valutahandel', 'valutalån', 'låna i utländsk valuta', 'lån i dollar', 'lån i euro', 'lån i schweiziska franc'];
// motor匹配-semantik: ord-matchning med 1-2 fel
const dist = (a, b) => { const n = a.length, m = b.length; if (!n) return m; if (!m) return n; let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1); for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; } return f[m]; };
const t = readFileSync(`${ARB}/src/lib/ai-mentor-svar.ts`, 'utf-8');
const tra = [];
for (const m of t.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
  for (const o of [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase())) {
    for (const mk of mina) {
      if (o.includes(' ')) continue; // basens flerordsfraser jämförs som fraser — hanteras separat
      const max = o.length <= 3 ? 0 : o.length <= 7 ? 1 : 2;
      // tvärs: matchar basens kärnord mot mina (ord- eller fras-nivå)?
      if (mk.includes(' ')) { if (mk.includes(o) && o.length >= 4) tra.push(`fras "${mk}" innehåller bas:"${o}"`); continue; }
      if (dist(o, mk) <= Math.max(max, 0) && (o.length <= 3 ? o === mk : true)) tra.push(`ORD "${mk}" ≈ bas:"${o}" (d=${dist(o, mk)})`);
    }
  }
}
console.log(tra.length ? tra.join('\n') : 'BASMOTORN ÄGER INGET AV TERRITORIET ✓');
