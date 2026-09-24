#!/usr/bin/env node
/** Mikro-återframställning: varför ser rot-sonden inte mockens 200 på "/"?
 *  EXAKT samma mock + exakt samma fetch-sekvens som eldprovets fall 2. */
import http from "node:http";

const server = http.createServer((req, res) => {
  if (req.url === "/") { res.writeHead(200); res.end("ok"); return; }
  console.log(`  [mock] förstör socket för ${req.method} ${req.url}`);
  req.socket.destroy();
});
await new Promise((res) => server.listen(0, "127.0.0.1", res));
const BAS = `http://127.0.0.1:${server.address().port}`;
console.log(`mock på ${BAS}`);

// 1: ren rot-sond på jungfrulig server
try { const r = await fetch(`${BAS}/`, { signal: AbortSignal.timeout(5_000) }); console.log(`1. jungfru GET / ⇒ ${r.status} (body=${await r.text()})`); }
catch (e) { console.log(`1. jungfru GET / ⇒ FEL ${e.constructor.name}: ${String(e.message).slice(0, 80)}`); }

// 2: api-anrop (socket förstörs) — som eldprovets endpoint
try { await fetch(`${BAS}/api/studio/puls`, { headers: { "x-admin-password": "x" }, signal: AbortSignal.timeout(15_000) }); console.log("2. api ⇒ oväntat ok"); }
catch (e) { console.log(`2. api ⇒ FEL ${e.constructor.name}: ${String(e.message).slice(0, 80)}`); }

// 3: rot-sond OMEDELBART efter förstörd socket (racet)
try { const r = await fetch(`${BAS}/`, { signal: AbortSignal.timeout(5_000) }); console.log(`3. omedelbar GET / ⇒ ${r.status}`); }
catch (e) { console.log(`3. omedelbar GET / ⇒ FEL ${e.constructor.name}: ${String(e.message).slice(0, 80)}`); }

// 4: rot-sond efter 250 ms (härdningens omprövning)
await new Promise((s) => setTimeout(s, 250));
try { const r = await fetch(`${BAS}/`, { signal: AbortSignal.timeout(5_000) }); console.log(`4. efter 250 ms GET / ⇒ ${r.status}`); }
catch (e) { console.log(`4. efter 250 ms GET / ⇒ FEL ${e.constructor.name}: ${String(e.message).slice(0, 80)}`); }

// 5: sonden som feljägaren bygger den — med headers? (undici default)
try { const r = await fetch(`${BAS}`, { signal: AbortSignal.timeout(5_000) }); console.log(`5. BAS utan slash ⇒ ${r.status} url=${r.url}`); }
catch (e) { console.log(`5. BAS utan slash ⇒ FEL ${e.constructor.name}: ${String(e.message).slice(0, 80)}`); }

server.close();
process.exit(0);
