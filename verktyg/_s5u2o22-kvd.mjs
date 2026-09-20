#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789888503136, omgång 22) — SLUT-KVD på leveransläget:
 * register 461 med rp-05 + pe-06; round-trip kursfil↔registerpost, kartposter,
 * speglar, siffror, llms, serieordning, R2-ytor, syskonskydd.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rp-05-sekvensrisken", "pe-06-jurvan"];
const MINA_RIKTIGA = ["rp-05-sekvensrisken", "pe-06-j-kurvan-och-capital-calls"];
let PASS = 0, FEL = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };

const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slugar = Object.keys(reg);

// A. Registerläge + bidrag
console.log("═══ A REGISTER");
ok(slugar.length === 461, "register 461 kurser", String(slugar.length));
for (const s of MINA_RIKTIGA) ok(!!reg[s], "registerpost: " + s);

// B. Round-trip kursfil ↔ registerpost (bitidentiskt innehåll)
console.log("═══ B ROUND-TRIP");
for (const s of MINA_RIKTIGA) {
  const fil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + s + ".json", "utf8"));
  ok(JSON.stringify(fil) === JSON.stringify(reg[s]), s + ": kursfil ≡ registerpost bitidentiskt");
}

// C. Karta
console.log("═══ C KARTA");
const karta = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const kartPoster = [...karta.matchAll(/slug: "([^"]+)", titel:/g)].map((m) => m[1]);
ok(kartPoster.length === 461, "kartan bär 461 poster", String(kartPoster.length));
ok(karta.includes("(461 kurser)"), "kartans rubriktal 461");
for (const s of MINA_RIKTIGA) {
  ok(karta.includes('slug: "' + s + '"'), "kartpost: " + s);
  const rad = karta.split("\n").find((l) => l.includes('"' + s + '"'));
  ok(/niva: 2/.test(rad) && s === "rp-05-sekvensrisken" || /niva: 3/.test(rad) && s === "pe-06-j-kurvan-och-capital-calls", s + ": niva korrekt i kartan", rad.trim().replace(/, vIndex.*/, ""));
}
ok(kartPoster.indexOf("rp-05-sekvensrisken") > kartPoster.indexOf("rp-04-volatilitetsbudgeten"), "kartordning rp-04 < rp-05");
ok(kartPoster.indexOf("pe-06-j-kurvan-och-capital-calls") > kartPoster.indexOf("pe-05-andrahandsmarknaden"), "kartordning pe-05 < pe-06");
ok(kartPoster.indexOf("rs-09-personalrisken") > kartPoster.indexOf("rs-08-modellrisken"), "syskonordning rs-08 < rs-09 (u1:s leverans oskadd)");

// D. Spegelprodukter
console.log("═══ D SPEGLAR");
const sok = JSON.parse(readFileSync(ROT + "/public/sok-index.json", "utf8"));
const sokStr = JSON.stringify(sok);
for (const s of MINA_RIKTIGA) ok(sokStr.includes(s), "sökindex bär " + s);
const speglar = JSON.parse(readFileSync(ROT + "/public/speglar-slugar.json", "utf8"));
ok(Array.isArray(speglar.kurser) && speglar.kurser.length === 461, "speglar.kurser bär 461 slugar", String(speglar.kurser?.length));
for (const s of MINA_RIKTIGA) ok(speglar.kurser.includes(s), "speglar bär " + s);

// E. Siffror + llms
console.log("═══ E SIFFROR/LLMS");
const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
ok(siffror.kurser === 461, "siffror.kurser 461", String(siffror.kurser));
for (const f of ["public/llms.txt", "public/llms-full.txt"]) {
  const t = readFileSync(ROT + "/" + f, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  ok(Math.max(...traffar) === 461 && traffar.filter((x) => x === 461).length === (f.endsWith("llms.txt") ? 6 : 4), f + ": huvudtal 461 × " + (f.endsWith("llms.txt") ? 6 : 4));
}

// F. AI-mentor-register
console.log("═══ F MENTOR-REGISTER");
const mentor = readFileSync(ROT + "/src/lib/ai-mentor-register.ts", "utf8");
const mentorRader = mentor.split("\n").filter((l) => l.trim().startsWith("{ slug:"));
ok(mentorRader.length === 461, "mentorregistret bär 461 rader", String(mentorRader.length));
for (const s of MINA_RIKTIGA) ok(mentor.includes('slug: "' + s + '"'), "mentorrad: " + s);

// G. R2 + skydd
console.log("═══ G R2/SKYDD");
for (const s of MINA_RIKTIGA) {
  const fil = readFileSync(ROT + "/data/kurser-tillagg/" + s + ".json", "utf8");
  ok(!/"kraverFas"/.test(fil) && !/"fas"\s*:/.test(fil) && !/"tier"/i.test(fil) && !/\bfas [23]\b/i.test(fil) && !/\d[\s\u00A0]?\d{3}\s?(kr|sek)\b/i.test(fil), s + ": R2 ren (inget fas-/tier-fält, inga prisbelopp i kursfilen)");
  const rad = karta.split("\n").find((l) => l.includes('"' + s + '"'));
  ok(/kraverFas: 0/.test(rad), s + ": kartposten kraverFas 0 (gratis)");
}
ok(slugar.filter((s) => s.startsWith("rp-")).length === 5, "rp-familjen 5 steg totalt", slugar.filter((s) => s.startsWith("rp-")).join(","));
ok(slugar.filter((s) => s.startsWith("pe-")).length === 6, "pe-familjen 6 steg totalt", slugar.filter((s) => s.startsWith("pe-")).join(","));

console.log("────");
console.log(`SLUT-KVD: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
