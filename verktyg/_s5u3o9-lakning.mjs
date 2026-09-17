#!/usr/bin/env node
/**
 * ATOMÄR LÄKNING s5-u3 (2026-09-17): register 384 → 387 + hela genererade
 * kedjan + llms + git add + git commit i EN enda process — syskon-clobber
 * har tre gånger fällt register-ytorna i bash-stegfönster; detta skript
 * öppnar INGA mellanfönster. Pedagogisk plattform — inte investeringsråd.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], cwd: "/home/ak1a/AK1", maxBuffer: 20 * 1024 * 1024 }).toString();
const MINA = [
  "data/kurser-tillagg/rp-01-riskmattens-karta.json",
  "data/kurser-tillagg/ks-06-konvertibler-och-hybridkapital.json",
  "data/kurser-tillagg/od-02-implicit-volatilitet.json"
];
const YTOR = ["public/deep-courses.json", "src/lib/larvag-karta.ts", "public/sok-index.json",
  "public/speglar-slugar.json", "data/siffror.json", "public/llms.txt", "public/llms-full.txt"];

// 1. Ren bas: u2:s committade 384-sanning (filomdirigering — 18 MB spränger bufferten)
execSync("git show 39670414:public/deep-courses.json > public/deep-courses.json", { cwd: "/home/ak1a/AK1" });
const bas = readFileSync("public/deep-courses.json", "utf8");
const basAntal = Object.keys(JSON.parse(bas)).length;
if (basAntal !== 384) { console.error(`ABORT: basen är ${basAntal}, förväntat 384`); process.exit(1); }
console.log("1. bas 384 från u2:s commit ✓");

// 2. Mina tre idempotenta inserts
for (const f of MINA) console.log("2.", run(`node verktyg/lagg-till-kurs.mjs ${f}`).split("\n")[0]);

// 3. Hela genererade kedjan
for (const cmd of ["node scripts/bygg-larvag-karta.ts", "node verktyg/kor-sokindex.mjs",
  "node verktyg/kor-speglar-slugar.mjs", "node verktyg/rakna-siffror.mjs"]) {
  const ut = run(cmd);
  console.log("3.", (ut.match(/.*/)[0] || cmd).slice(0, 90));
}

// 4. llms mönstersträngt: kursantalet (≥380) → 387; BOKMASTER-antalet (103 kurser) lämnas orört
for (const [p, forvantat] of [["public/llms.txt", 6], ["public/llms-full.txt", 4]]) {
  let t = readFileSync(p, "utf8");
  const traf = [...t.matchAll(/\b(\d{3}) kurser\b/g)].map(m => m[1]).filter(n => parseInt(n, 10) >= 380);
  const unika = [...new Set(traf)];
  if (unika.length !== 1) { console.error(`ABORT: ${p} har blandade kursantal ${JSON.stringify(unika)}`); process.exit(1); }
  if (traf.length !== forvantat) { console.error(`ABORT: ${p} har ${traf.length} kursantals-ställen, förväntat ${forvantat}`); process.exit(1); }
  t = t.split(`${unika[0]} kurser`).join("387 kurser");
  writeFileSync(p, t);
  console.log(`4. ${p}: ${traf.length} ställen ${unika[0]}→387 (103 BOKMASTER orört)`);
}

// 5. larvag-synk GRÖN?
const synk = run("node verktyg/larvag-synk.mjs");
if (!synk.includes("GRÖN") || !synk.includes("387")) { console.error("ABORT: larvag-synk ej GRÖN 387:\n" + synk); process.exit(1); }
console.log("5. larvag-synk GRÖN 387 ✓");

// 6. tsc 0? (korta ut — fel syns i exit)
try { execSync("node node_modules/typescript/bin/tsc --noEmit", { stdio: "ignore", cwd: "/home/ak1a/AK1" }); }
catch { console.error("ABORT: tsc fel"); process.exit(1); }
console.log("6. tsc 0 ✓");

// 7. git add + commit (index-atomärt i denna process)
const medd = "verktyg/_s5u3o9-lakning-commitmsg.txt";
writeFileSync(medd, `studio: auto s5-u3 LÄKNING (atomär) — register-ytorna 387 läkta i EN process efter tredje syskon-clobbern: samma race-mekanism som rättes-notisen (u2:s slut-synk skrev 384 över disk-ytorna mellan min GRÖNA verifiering och git add; deras commit 39670414 i HEAD bar redan register-ytorna, mina 84d137bc+3f89eb4b tog kursfiler+verktyg+worklog) ⇒ läkningen körs nu atomärt: bas från u2:s committade 384-sanning + tre idempotenta lagg-till-kurs-inserts (rp-01 · ks-06 · od-02) + karta (345 gratis · Fas 2 18 · Fas 3 24 · V-spår 20/20) + sökindex + speglar + siffror 387 (quiz 8 223) + llms mönstersträngt →387 (6+4) + larvag-synk GRÖN 387=387=387 · 21 profilkurser · 0 fantomer + tsc 0 — allt innan git add + commit i samma process utan mellanfönster. Slutläge: register 387 = karta = konstant = siffror = llms ×10 = sökindex, samtliga sex omgångens kurser i trädet (u1:s ks-04-emissionens-mekanik + u2:s ks-05-covenanter + am-05-auktioner + mina rp-01/ks-06/od-02). [fabrik]\n`);
run(`git add ${[...YTOR, medd].join(" ")}`);
const commit = run(`git commit -F ${medd}`);
console.log("7.", commit.split("\n")[0]);

// 8. Verifiera HEAD (filomdirigering)
execSync("git show HEAD:public/deep-courses.json > /tmp/s5u3o9-head-register.json", { cwd: "/home/ak1a/AK1" });
const h = JSON.parse(readFileSync("/tmp/s5u3o9-head-register.json", "utf8"));
const ok = Object.keys(h).length === 387 && h["rp-01-riskmattens-karta"] && h["ks-06-konvertibler-och-hybridkapital"] && h["od-02-implicit-volatilitet"] && h["ks-05-covenanter-och-kreditbetyg"] && h["ks-04-emissionens-mekanik"] && h["am-05-handelsdagens-auktioner"];
console.log(ok ? "8. HEAD VERIFIERAD: 387 kurser, alla sex omgångens poster i trädet ✓" : `8. FEL: HEAD oförklarlig (${Object.keys(h).length})`);
process.exit(ok ? 0 : 1);
