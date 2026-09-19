#!/usr/bin/env node
// o96: para o92:s blocksond-rådata per element (textspänn + siffreband) — gratis rotbevis
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse");
const FIL = process.argv[2] || "blocksond-s7u3o92-efter-desktop.json";
const MATCH = process.argv[3] ? new RegExp(process.argv[3]) : /span\.mt-2\.flex-1|li\.cv-utvalt|siffreband|socialproof/;

const d = JSON.parse(readFileSync(join(DIR, FIL), "utf8"));
console.log(`=== ${FIL}  docH ${d.fore.docH}→${d.efter.docH}`);

const gruppera = (snap) => {
  const m = new Map();
  for (const p of snap.poster)
    if (MATCH.test(p.sig)) {
      if (!m.has(p.sig)) m.set(p.sig, []);
      m.get(p.sig).push(p);
    }
  return m;
};
const f = gruppera(d.fore), e = gruppera(d.efter);
for (const [sig, fposts] of f) {
  const eposts = e.get(sig) || [];
  const n = Math.min(fposts.length, eposts.length);
  const fh = fposts.slice(0, n).map((p) => p.hojd);
  const eh = eposts.slice(0, n).map((p) => p.hojd);
  const sf = fh.reduce((a, b) => a + b, 0), se = eh.reduce((a, b) => a + b, 0);
  console.log(` ${sig}: n(${fposts.length}/${eposts.length})`);
  console.log(`   FÖRE : ${fh.join(",")}`);
  console.log(`   EFTER: ${eh.join(",")}`);
  console.log(`   Σ ${sf} → ${se} (Δ ${se - sf})`);
  const tops = fposts.slice(0, n).map((p) => p.top).join(",");
  console.log(`   FÖRE tops: ${tops}`);
}
