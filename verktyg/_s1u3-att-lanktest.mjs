#!/usr/bin/env node
// _s1u3-att-lanktest.mjs — HTTP-verifiering av AT&T-paketets 20 interna länkar
// mot localhost:3000 (loopback whitelistad i middleware). Körs vid fritt
// deploylås enligt fabege-precedensen.
import { readFileSync } from 'node:fs';
import http from 'node:http';

const u = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/granskning/sa-laser-du-att-q3-2026-FLYTTKLART-PAKET-2026-09-30-s1u3.json', 'utf8'));
const lankar = [...new Set([...u.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
console.log(`${lankar.length} unika interna länkar att testa`);

function get(path) {
  return new Promise(res => {
    const r = http.get({ host: '127.0.0.1', port: 3000, path, timeout: 8000 }, s => {
      s.resume();
      res(s.statusCode);
    });
    r.on('timeout', () => { r.destroy(); res('TIMEOUT'); });
    r.on('error', e => res('ERR:' + e.code));
  });
}

let ok = 0, fel = 0;
for (const l of lankar) {
  const s = await get(l);
  if (s === 200) { ok++; console.log(`200 ${l}`); }
  else { fel++; console.log(`${s} ${l}  <-- FYND`); }
}
console.log(`LÄNKTEST: ${ok}/${lankar.length} = 200 · ${fel} fynd`);
process.exit(fel ? 1 : 0);
