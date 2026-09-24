#!/usr/bin/env node
/**
 * s5-u1 (manifest auto-s5-1789910709805, omgång 23) — ATOMISK REGISTER-SYNK:
 * am-09-marginalhandeln (AKTIEMARKNADEN I PRAKTIKEN-familjens nionde steg).
 * Register: aktuellt disk-läge läses DYNAMISKT — syskon (u2: +2, u3: +3) kan
 * landa parallellt; stegen är idempotenta (o15-o22-mönstret).
 *
 * Kedja (EN process, commit OMEDELBART efter grönt — o17-u2:s lärdom):
 *   0. syskonanspråks-notis (läser data/vakten/*-s5-u2/u3-ansprak.md om de dykt upp)
 *   1. lagg-till-kurs          (registerinsert, serieordning)
 *   2. bygg-larvag-karta.ts    (karta + LARVAG_ANTAL_KURSER)
 *   3. kor-sokindex.mjs        (sökindex)
 *   4. kor-speglar-slugar.mjs  (404-speglar /en /ar)
 *   5. rakna-siffror.mjs       (siffror.json — sajtens talkälla)
 *   6. llms ×2                 (dynamisk mönstersträng, MONOTON vakt: bara lägre→n1)
 *   7. ai-mentor-register rebake (antal-vakt + retry ×3 — omgång 16:s fynd)
 *   8. larvag-synk.mjs         (GRÖN slutläge = karta = konstant)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MANIFEST = "auto-s5-1789910709805";
const MIN = "am-09-marginalhandeln";
const MINA = [MIN];
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + " " + args.join(" ").slice(0, 60) + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};
const antal = () => Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

// ── 0. Syskonanspråks-notis (race-säkerhet: deras ytor är deras) ──────────────
for (const syskon of ["s5-u2", "s5-u3"]) {
  const fil = ROT + `/data/vakten/${MANIFEST}-${syskon}-ansprak.md`;
  if (existsSync(fil)) {
    const val = (readFileSync(fil, "utf8").match(/^\*\*(.+?)\*\*/m) || [])[1] || "oklart val";
    console.log(`─ notis: syskon ${syskon} har klaimat: ${val} — deras yta, deras insert; mina steg idempotenta.`);
  } else {
    console.log(`─ notis: syskon ${syskon} har EJ klaimat ännu (ingen anspråksfil) — mina ytor fria.`);
  }
}

// ── 1. Registerinsert (idempotent) + round-trip-kontroll ─────────────────────
const n0 = antal();
for (const slug of MINA) run("verktyg/lagg-till-kurs.mjs", ["data/kurser-tillagg/" + slug + ".json"]);
const n1 = antal();
const regEfter = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const saknade = MINA.filter((s) => !regEfter[s]);
if (saknade.length) { console.error("SLUTFEL: mina inserts saknas i registret: " + saknade.join(", ")); process.exit(1); }
// Round-trip: registerposten ≡ kursfilen (djuplikhet, fält för fält)
const kursfil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/" + MIN + ".json", "utf8"));
if (JSON.stringify(regEfter[MIN]) !== JSON.stringify(kursfil)) { console.error("SLUTFEL: round-trip register ≢ kursfil — insert muterat data."); process.exit(1); }
console.log("─ round-trip: registerpost ≡ kursfil (bitidentisk) ✓");
if (n1 - n0 !== 1) console.log("─ notis: registret växte " + n0 + " → " + n1 + " (+" + (n1 - n0) + ") — syskoninserts under fönstret; min kurs verifierad på plats.");
console.log("─ register: " + n0 + " → " + n1 + " (" + MIN + " på plats; serieordning efter am-08)");

// Serieordning: am-09 ska stå EFTER am-08 och FÖRE vr-01 (nästa familj i kartan)
const slugar = Object.keys(regEfter);
const ixPrev = slugar.indexOf("am-08-etfens-inre-mekanik");
const ixMin = slugar.indexOf(MIN);
const ixNext = slugar.indexOf("vr-01-multipelgapet");
if (!(ixPrev < ixMin && ixMin < ixNext)) { console.error("SLUTFEL: serieordning bruten (am-08@" + ixPrev + " < am-09@" + ixMin + " < vr-01@" + ixNext + ")"); process.exit(1); }
console.log("─ serieordning: am-08@" + ixPrev + " < am-09@" + ixMin + " < vr-01@" + ixNext + " ✓");

// ── 2. Karta ─────────────────────────────────────────────────────────────────
run("scripts/bygg-larvag-karta.ts", []);

// ── 3-4. Sökindex + speglar ──────────────────────────────────────────────────
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);

// ── 5. Siffror ───────────────────────────────────────────────────────────────
run("verktyg/rakna-siffror.mjs", []);

// ── 6. llms-mönstersträng (MONOTON vakt: endast lägre tal → n1; aldrig ned) ───
for (const fil of ["public/llms.txt", "public/llms-full.txt"]) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  if (!traffar.length) { console.error("LLMS-FEL " + fil + ": mönstret »NNN kurser« saknas — strukturell förändring, ABORT."); process.exit(2); }
  const maxTal = Math.max(...traffar);
  if (maxTal > n1) { console.error("LLMS-FEL " + fil + ": bär " + maxTal + " > register " + n1 + " — syskonmellanläge, omkör idempotenta steg."); process.exit(2); }
  const gammal = String(maxTal);
  const ny = String(n1);
  if (gammal === ny) { console.log("─ llms " + fil.split("/").pop() + ": bär redan " + ny + " — ingen skrivning."); continue; }
  t = t.split(gammal + " kurser").join(ny + " kurser");
  writeFileSync(ROT + "/" + fil, t, "utf8");
  console.log("─ llms " + fil.split("/").pop() + ": »" + gammal + " kurser« → »" + ny + " kurser« (" + traffar.filter((x) => x === maxTal).length + " ställen)");
}

// ── 7. AI-mentor-register rebake ─────────────────────────────────────────────
// VAKT (omgång 16:s fynd, bärs vidare): testa-ai-mentor.mjs --baka kan trunkeras
// tyst över 64 KB pipe-buffert — läs antal, jämför mot registret, retry ×3.
const regFil = ROT + "/src/lib/ai-mentor-register.ts";
let bakaRader = null;
for (let forsok = 1; forsok <= 3; forsok++) {
  const ut = execFileSync("node", ["verktyg/testa-ai-mentor.mjs", "--baka"], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const r = ut.replace(/\n$/, "").split("\n");
  console.log("─ baka försök " + forsok + ": " + r.length + " rader (register " + n1 + ")");
  if (r.length === n1 && r[r.length - 1].includes("niva:")) { bakaRader = ut.replace(/\n$/, ""); break; }
}
if (!bakaRader) { console.error("REBAKE-FEL: tre försök gav ej " + n1 + " fullständiga rader — ABORT (registerfilen orörd)."); process.exit(1); }
const lines = readFileSync(regFil, "utf8").split("\n");
const startIdx = lines.findIndex((l) => l.includes("export const KURSREGISTER: RegisterRad[] = ["));
if (startIdx < 0) { console.error("REBAKE-FEL: startmarkör saknas"); process.exit(1); }
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) if (lines[i].trim() === "];") { endIdx = i; break; }
const gamla = endIdx - startIdx - 1;
lines.splice(startIdx + 1, gamla, bakaRader);
writeFileSync(regFil, lines.join("\n"), "utf8");
console.log("─ ai-mentor-register.ts rebakad: " + gamla + " → " + bakaRader.split("\n").length + " rader (antal-vakt GRÖN)");

// ── 8. Larvag-synk (GRÖN krav) ───────────────────────────────────────────────
run("verktyg/larvag-synk.mjs", []);

// ── Slutkontroll: registerantal ──────────────────────────────────────────────
const slut = antal();
if (slut < n1) { console.error("SLUTFEL: registret bär " + slut + " (< " + n1 + ") — race; omkör idempotenta steg."); process.exit(1); }
console.log("SYNK GRÖN: register " + slut + " (mitt bidrag " + n0 + " → " + n1 + ") — kedjan komplett, commit OMEDELBART.");
