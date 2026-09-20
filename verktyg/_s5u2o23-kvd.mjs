#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789910709805, omgång 23) — SLUT-KVD på leveransläget:
 * register 470 med rp-06 + pe-07 (u1:s am-09 och u3:s kt-08/vr-09/ek-07
 * landade under fönstret och respekteras); round-trip kursfil↔registerpost,
 * kartposter, speglar, siffror, llms, serieordning, R2-ytor, syskonskydd.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rp-06-volatilitetsdraget", "pe-07-co-investeringen"];
let PASS = 0, FEL = 0;
const ok = (v, n, d = "") => { if (v) { PASS++; console.log("  PASS " + n + (d ? " — " + d : "")); } else { FEL++; console.log("  FEL  " + n + (d ? " — " + d : "")); } };

const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slugar = Object.keys(reg);
const N = slugar.length;

// A. Registerläge + bidrag
console.log("═══ A REGISTER");
ok(N >= 467, "register ≥ 467 (464 + mina 2; syskon ev. ovanpå)", String(N));
for (const s of MINA) ok(!!reg[s], "registerpost: " + s);
ok(!!reg["am-09-marginalhandeln"], "syskonpost am-09-marginalhandeln (u1) oskadd");
for (const s of ["kt-08", "vr-09", "ek-07"]) ok(slugar.some((x) => x.startsWith(s + "-")), "syskonpost " + s + " (u3) oskadd");

// B. Round-trip kursfil ↔ registerpost (bitidentiskt innehåll)
console.log("═══ B ROUND-TRIP");
for (const s of MINA) {
  const fil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + s + ".json", "utf8"));
  ok(JSON.stringify(fil) === JSON.stringify(reg[s]), s + ": kursfil ≡ registerpost bitidentiskt");
}

// C. Karta
console.log("═══ C KARTA");
const karta = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const kartPoster = [...karta.matchAll(/slug: "([^"]+)", titel:/g)].map((m) => m[1]);
ok(kartPoster.length === N, "kartan bär samtliga " + N + " poster", String(kartPoster.length));
ok(karta.includes("(" + N + " kurser)"), "kartans rubriktal " + N);
for (const s of MINA) {
  ok(karta.includes('slug: "' + s + '"'), "kartpost: " + s);
  const rad = karta.split("\n").find((l) => l.includes('"' + s + '"'));
  const nivaVant = s === "rp-06-volatilitetsdraget" ? 2 : 3;
  ok(new RegExp("niva: " + nivaVant).test(rad), s + ": niva " + nivaVant + " korrekt i kartan", rad.trim().replace(/, vIndex.*/, ""));
}
ok(kartPoster.indexOf("rp-06-volatilitetsdraget") > kartPoster.indexOf("rp-05-sekvensrisken"), "kartordning rp-05 < rp-06");
ok(kartPoster.indexOf("pe-07-co-investeringen") > kartPoster.indexOf("pe-06-j-kurvan-och-capital-calls"), "kartordning pe-06 < pe-07");

// D. Spegelprodukter
console.log("═══ D SPEGLAR");
const sok = JSON.parse(readFileSync(ROT + "/public/sok-index.json", "utf8"));
const sokStr = JSON.stringify(sok);
for (const s of MINA) ok(sokStr.includes(s), "sökindex bär " + s);
const speglar = JSON.parse(readFileSync(ROT + "/public/speglar-slugar.json", "utf8"));
ok(Array.isArray(speglar.kurser) && speglar.kurser.length === N, "speglar.kurser bär " + N + " slugar", String(speglar.kurser?.length));
for (const s of MINA) ok(speglar.kurser.includes(s), "speglar bär " + s);

// E. Siffror + llms
console.log("═══ E SIFFROR/LLMS");
const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
ok(siffror.kurser === N, "siffror.kurser " + N, String(siffror.kurser));
for (const f of ["public/llms.txt", "public/llms-full.txt"]) {
  const t = readFileSync(ROT + "/" + f, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  ok(Math.max(...traffar) === N && traffar.filter((x) => x === N).length === (f.endsWith("llms.txt") ? 6 : 4), f + ": huvudtal " + N + " × " + (f.endsWith("llms.txt") ? 6 : 4));
}

// F. AI-mentor-register
console.log("═══ F MENTOR-REGISTER");
const mentor = readFileSync(ROT + "/src/lib/ai-mentor-register.ts", "utf8");
const mentorRader = mentor.split("\n").filter((l) => l.trim().startsWith("{ slug:"));
ok(mentorRader.length === N, "mentorregistret bär " + N + " rader", String(mentorRader.length));
for (const s of MINA) ok(mentor.includes('slug: "' + s + '"'), "mentorrad: " + s);

// G. R2 + skydd
console.log("═══ G R2/SKYDD");
for (const s of MINA) {
  const fil = readFileSync(ROT + "/data/kurser-tillagg/" + s + ".json", "utf8");
  ok(!/"kraverFas"/.test(fil) && !/"fas"\s*:/.test(fil) && !/"tier"/i.test(fil) && !/\bfas [23]\b/i.test(fil) && !/\d[\s\u00A0]?\d{3}\s?(kr|sek)\b/i.test(fil), s + ": R2 ren (inget fas-/tier-fält, inga prisbelopp i kursfilen)");
  const rad = karta.split("\n").find((l) => l.includes('"' + s + '"'));
  ok(/kraverFas: 0/.test(rad), s + ": kartposten kraverFas 0 (gratis)");
}
ok(slugar.filter((s) => s.startsWith("rp-")).length === 6, "rp-familjen 6 steg totalt", slugar.filter((s) => s.startsWith("rp-")).join(","));
ok(slugar.filter((s) => s.startsWith("pe-")).length === 7, "pe-familjen 7 steg totalt", slugar.filter((s) => s.startsWith("pe-")).join(","));

console.log("────");
console.log(`SLUT-KVD: ${PASS} PASS · ${FEL} FEL`);
process.exit(FEL ? 1 : 0);
