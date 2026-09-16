#!/usr/bin/env node
// _s7u3n-bundjamf.mjs — buntjämförelse /blogg mot /en/blogg (o32 §6 kö 3).
// Fråga: varför är den engelska spegeln ~700 ms snabbare i TBT och ~67 KiB
// lättare? Jämför chunk-referenser i SSR-HTML + DOM-storlek + HTML-vikt.
// Kostnadsfri sond (fetch+HEAD, ingen chrome) — trygg vid låg RAM.
const BAS = process.env.BAS || "http://localhost:3000";
const SIDOR = ["/blogg", "/en/blogg"];

function chunkRefs(html) {
  const refs = new Set();
  const re = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html))) refs.add(m[1]);
  return refs;
}

async function sizeOf(ref) {
  try {
    const r = await fetch(BAS + ref, { method: "HEAD" });
    const cl = r.headers.get("content-length");
    return cl ? Number(cl) : 0;
  } catch {
    return 0;
  }
}

const data = {};
for (const s of SIDOR) {
  const r = await fetch(BAS + s);
  const html = await r.text();
  const refs = chunkRefs(html);
  let tot = 0;
  for (const ref of refs) tot += await sizeOf(ref);
  data[s] = {
    status: r.status,
    htmlByte: Buffer.byteLength(html),
    chunkar: refs.size,
    chunkByte: tot,
    domElement: (html.match(/<[a-z][^>]*>/gi) || []).length,
    cvBloggkort: (html.match(/cv-bloggkort/g) || []).length,
    artikellankar: (html.match(/href="\/blogg\//g) || []).length,
  };
}

const [a, b] = SIDOR;
const refs = {};
for (const s of SIDOR) {
  const r = await fetch(BAS + s);
  refs[s] = chunkRefs(await r.text());
}
const endastA = [...refs[a]].filter((x) => !refs[b].has(x));
const endastB = [...refs[b]].filter((x) => !refs[a].has(x));

console.log(JSON.stringify({ bas: BAS, datum: new Date().toISOString(), sidor: data, endast: { [a]: endastA, [b]: endastB } }, null, 2));
