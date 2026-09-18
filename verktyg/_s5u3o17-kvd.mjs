#!/usr/bin/env node
/**
 * KVD — s5-u3 manifest auto-s5-1789766125084 (omgång 17), SLUTLÄGE efter synk:
 * ma-06-aktiernas-riskpremie + ek-06-bayesianska-omviktningen + od-07-terminskontraktet.
 * Round-trip kursfil↔registerpost, struktur, aritmetik, korsreferenser, juridik,
 * språk, R2, llms-paritet, kategoriantal, speglar/sökindex/mentorregister-paritet.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const REG = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const MINA = ["ma-06-aktiernas-riskpremie", "ek-06-bayesianska-omviktningen", "od-07-terminskontraktet"];
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const antalReg = Object.keys(REG).length;

// ── 1. Round-trip: kursfil ≡ registerpost (kanonisk JSON-jämförelse) ──
for (const slug of MINA) {
  const fil = JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/${slug}.json`, "utf8"));
  const post = REG[slug];
  testa(`round-trip ${slug}`, !!post && JSON.stringify(fil) === JSON.stringify(post), post ? "differerar" : "saknas i registret");
}

// ── 2. Register = karta = mentorregister = llms (paritet) ──
const kartaText = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const kartaAntal = Number((kartaText.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1]);
const kartaRader = (kartaText.match(/\{ slug: "/g) || []).length;
testa(`register ${antalReg} = kartkonstant ${kartaAntal} = kartrader ${kartaRader}`, antalReg === kartaAntal && kartaAntal === kartaRader, `reg=${antalReg} konst=${kartaAntal} rader=${kartaRader}`);
const mentorText = readFileSync(ROT + "/src/lib/ai-mentor-register.ts", "utf8");
const mentorRader = (mentorText.match(/^\s*\{ slug: "/gm) || []).length;
testa(`mentorregister ${mentorRader} rader = register ${antalReg}`, mentorRader === antalReg, `mentor=${mentorRader}`);
for (const [fil, vantat] of [["public/llms.txt", 6], ["public/llms-full.txt", 4]]) {
  const t = readFileSync(ROT + "/" + fil, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  testa(`llms-paritet ${fil}: ${vantat} träffar »${antalReg} kurser«`, traffar.filter((x) => x === antalReg).length === vantat && Math.max(...traffar) === antalReg, traffar.join(","));
}

// ── 3. Sökindex + speglar bär mina tre ──
const sok = JSON.parse(readFileSync(ROT + "/public/sok-index.json", "utf8"));
const sokBlob = JSON.stringify(sok);
const speglar = readFileSync(ROT + "/public/speglar-slugar.json", "utf8");
for (const slug of MINA) {
  testa(`sökindex bär ${slug}`, sokBlob.includes(slug));
  testa(`speglar bär ${slug}`, speglar.includes(slug));
}

// ── 4. Kategoriantal + serieordning ──
const kat = {};
for (const k of Object.values(REG)) kat[k.category] = (kat[k.category] ?? 0) + 1;
testa("kategoriantal MAKROEKONOMI & RÄNTA = 11 (10 + ma-06)", kat["MAKROEKONOMI & RÄNTA"] === 11, String(kat["MAKROEKONOMI & RÄNTA"]));
testa("kategoriantal EKOSYSTEM = 10 (9 + ek-06)", kat["EKOSYSTEM"] === 10, String(kat["EKOSYSTEM"]));
testa("kategoriantal OPTIONS & DERIVAT = 11 (10 + od-07)", kat["OPTIONS & DERIVAT"] === 11, String(kat["OPTIONS & DERIVAT"]));
const slugar = Object.keys(REG);
for (const [ny, fore] of [["ma-06-aktiernas-riskpremie", "ma-05-kreditpremien"], ["ek-06-bayesianska-omviktningen", "ek-05-monte-carlo-i-motorn"], ["od-07-terminskontraktet", "od-06-positionen-efter-bygget"]]) {
  testa(`serieordning ${fore} < ${ny}`, slugar.indexOf(fore) >= 0 && slugar.indexOf(ny) > slugar.indexOf(fore), `${fore}@${slugar.indexOf(fore)} < ${ny}@${slugar.indexOf(ny)}`);
}

// ── 5. R2: kraverFas 0 i kartan, inga pris-/tier-tal i kurserna ──
for (const slug of MINA) {
  const m = kartaText.match(new RegExp(`\\{ slug: "${slug}",[^}]*kraverFas: (\\d+)`));
  testa(`R2 kraverFas 0 för ${slug} i kartan`, m && Number(m[1]) === 0, m?.[1]);
  const blob = JSON.stringify(REG[slug]);
  testa(`R2 inga pris-/tier-tal i ${slug}`, !/\b(9\s?999|13\s?999|249|449|799)\b/.test(blob));
}

// ── 6. Språkgrind + juridikgrind + aritmetik på REGISTER-posterna (samma vakter som prekoll) ──
for (const slug of MINA) {
  const blob = JSON.stringify(REG[slug]);
  const cjk = (blob.match(/[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff]/g) || []).length;
  const finska = (blob.match(/\b(myös|että|tämä|koska)\b/g) || []).length;
  const dbel = (blob.match(/ (?= )/g) || []).length;
  const citat = (blob.match(/[\u201C\u201D\u2018\u2019]/g) || []).length;
  testa(`registerpost ${slug}: språkgrind ren`, cjk === 0 && finska === 0 && dbel === 0 && citat === 0, `cjk=${cjk} fi=${finska} dbl=${dbel} cit=${citat}`);
  const rad = ["köp aktien", "du bör köpa", "vi rekommenderar att köpa", "placera dina pengar i", "satsa på"];
  testa(`registerpost ${slug}: 0 rådsfraser`, rad.every((r) => !blob.toLowerCase().includes(r)));
}

// ── 7. Aritmetik slutkontroll (utdrag — fulla 82 kontroller i prekoll) ──
const ma = JSON.stringify(REG["ma-06-aktiernas-riskpremie"]);
const ek = JSON.stringify(REG["ek-06-bayesianska-omviktningen"]);
const od = JSON.stringify(REG["od-07-terminskontraktet"]);
const arit = [
  ["ma-06: 8/0,08=100 närvaro med räkneled", ma.includes("8 delat med 0,080 lika med 100")],
  ["ma-06: 88,9/−11,1 närvaro", ma.includes("88,9") && ma.includes("−11,1 procent")],
  ["ma-06: P/E-spegel 12,5", ma.includes("1 delat med 0,080") && ma.includes("12,5")],
  ["ek-06: posterior 0,36/0,42=0,86", ek.includes("0,36 delat med 0,42 lika med 0,86")],
  ["ek-06: viktsumma 102 → 100,0", ek.includes("102") && ek.includes("35,3 plus 18,4 plus 23,5 plus 11,0 plus 11,8 lika med 100,0")],
  ["ek-06: brytpunkt 1,36/0,85", ek.includes("1,36") && ek.includes("0,85")],
  ["od-07: carry 101,5−1,0=100,5", od.includes("101,5 minus 1,0 lika med 100,5")],
  ["od-07: marginal 16 000/25 %", od.includes("16 000") && od.includes("25 procent")],
  ["od-07: säkring 10,0 M netto noll", od.includes("plus 10,0") && od.includes("minus 10,0")],
];
const felArit = arit.filter(([, ok]) => !ok);
testa(`aritmetik slutkontroll ${arit.length} räkneled närvaro`, felArit.length === 0, felArit.map(([n]) => n).join(" | "));

// ── 8. Syskonytor orörda: rs-07/rs-08/od-06-positionen registeräkta och orörda av mig ──
for (const s of ["rs-07-leverantorsrisken", "rs-08-modellrisken", "od-06-positionen-efter-bygget"]) {
  testa(`syskonkurs ${s} registeräkt`, !!REG[s]);
}

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL — register ${antalReg}, round-trip ×3 bitidentisk, alla ytor i paritet.`);
