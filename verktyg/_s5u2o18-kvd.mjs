#!/usr/bin/env node
/**
 * KVD — s5-u2 (manifest auto-s5-1789789514860, omgång 18), SLUTLÄGE efter synk:
 * rp-04-volatilitetsbudgeten + kt-05-katalysatorernas-kalender.
 * Round-trip ×2 · register = karta = konstant = speglar = llms = mentorregister ·
 * sökindex · kategoriantal · serieordning · R2 · syskonkurser registeräkta.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rp-04-volatilitetsbudgeten", "kt-05-katalysatorernas-kalender"];
const pass = [], fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const antal = Object.keys(reg).length;

// ── 1. Round-trip ×2: kursfil ≡ registerpost (bitidentiskt) ──────────────────
for (const slug of MINA) {
  const fil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8"));
  const post = reg[slug];
  testa("1 " + slug + ": registerposten existerar", !!post);
  testa("1 " + slug + ": round-trip bitidentisk kursfil ↔ registerpost", JSON.stringify(fil) === JSON.stringify(post), JSON.stringify(fil) === JSON.stringify(post) ? "" : "diff!");
}

// ── 2. Register = karta = konstant = speglar = llms = mentorregister ──────────
const kartaTxt = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const konstant = Number((kartaTxt.match(/LARVAG_ANTAL_KURSER = (\d+)/) || [])[1] ?? 0);
const kartrader = [...kartaTxt.matchAll(/\{ slug: "([^"]+)"/g)].length;
testa("2 register = kartkonstant (dynamiskt, syskoninserts medtagna)", antal === konstant && antal >= 435, `register=${antal} konstant=${konstant}`);
testa("2 kartposter 435 = konstant", kartrader === konstant, `rader=${kartrader}`);
const speglar = JSON.parse(readFileSync(ROT + "/public/speglar-slugar.json", "utf8"));
const speglarLista = Array.isArray(speglar) ? speglar : (speglar.kurser ?? speglar.slugs ?? []);
testa("2 speglar = konstanten", speglarLista.length === konstant, `speglar=${speglarLista.length}`);
testa("2 speglar bär mina två", speglarLista.includes(MINA[0]) && speglarLista.includes(MINA[1]));
const sok = JSON.parse(readFileSync(ROT + "/public/sok-index.json", "utf8"));
const sokStr = JSON.stringify(sok);
testa("2 sökindex bär mina två", sokStr.includes(MINA[0]) && sokStr.includes(MINA[1]));
for (const fil of ["public/llms.txt", "public/llms-full.txt"]) {
  const t = readFileSync(ROT + "/" + fil, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  const maxTal = Math.max(...traffar);
  const vantat = fil.endsWith("llms.txt") ? 6 : 4;
  testa("2 " + fil.split("/").pop() + ": huvudtalet = registerantalet (" + vantat + " träffar, sub-rubriker tillåtna)", maxTal === antal && traffar.filter((x) => x === maxTal).length === vantat, traffar.join(","));
}
const mentor = readFileSync(ROT + "/src/lib/ai-mentor-register.ts", "utf8");
const mentorRader = mentor.split("\n").filter((l) => l.trim().startsWith("{ slug:")).length;
testa("2 mentorregister = konstanten", mentorRader === konstant, `rader=${mentorRader}`);
testa("2 mentorregister bär mina två", mentor.includes(MINA[0]) && mentor.includes(MINA[1]));
const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
testa("2 siffror: kurser = registret", (siffror.kurser ?? siffror.antalKurser) === antal, JSON.stringify({ kurser: siffror.kurser, antalKurser: siffror.antalKurser }));

// ── 3. Kategoriantal: RP 12→13, KATALYSATOR 7→8 ────────────────────────────────
const kat = {};
for (const k of Object.values(reg)) kat[k.category] = (kat[k.category] ?? 0) + 1;
testa("3 RISKHANTERING & PORTFÖLJTEORI 13 kurser (12 + rp-04)", kat["RISKHANTERING & PORTFÖLJTEORI"] === 13, String(kat["RISKHANTERING & PORTFÖLJTEORI"]));
testa("3 KATALYSATOR 8 kurser (7 + kt-05)", kat["KATALYSATOR"] === 8, String(kat["KATALYSATOR"]));

// ── 4. Serieordning ×2 ────────────────────────────────────────────────────────
const slugar = Object.keys(reg);
for (const [ny, fore] of [["rp-04-volatilitetsbudgeten", "rp-03-riskparitet"], ["kt-05-katalysatorernas-kalender", "kt-04-den-uteblivna-katalysatorn"]]) {
  testa("4 serieordning " + fore + " < " + ny, slugar.indexOf(fore) >= 0 && slugar.indexOf(ny) > slugar.indexOf(fore), `${fore}@${slugar.indexOf(fore)} < ${ny}@${slugar.indexOf(ny)}`);
}

// ── 5. R2: kraverFas 0 + 0 pris-/tier-tal i kursfilerna ───────────────────────
for (const slug of MINA) {
  const T = JSON.stringify(JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + slug + ".json", "utf8")));
  const kartRad = kartaTxt.split("\n").find((l) => l.includes('slug: "' + slug + '"'));
  testa("5 " + slug + ": kraverFas 0 i kartan", /kraverFas: 0,/.test(kartRad ?? ""), (kartRad ?? "").trim().slice(0, 80));
  testa("5 " + slug + ": 0 pris-/tier-tal", !/\b(9 ?999|13 ?999|249|449|799)\b/.test(T));
}

// ── 6. Syskonkurser registeräkta (u1:s se-17 + u3:s anspråk ännu ej landade) ──
testa("6 syskon: u1:s se-17-skogssektorn registeräkt", "se-17-skogssektorn" in reg);
console.log("─ notis: u3:s landningar i registret: " + ["bk-06-obeskattade-reserver-och-avsattningar", "sj-06-arv-gava-och-ingaende-varde", "pf-15-faktorpremierna"].filter((s) => s in reg).join(", ") + " (deras poster, deras commit — registret bär alla enligt o13)");

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FEL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — register ${antal}, round-trip ×2 bitidentiskt, alla gemensamma ytor bär ${antal} och mina två, RP 13 + KATALYSATOR 8, serieordning ×2, R2 ren, syskonkurser registeräkta.`);
