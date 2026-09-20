#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789888503136, omgång 22) — ATOMISK REGISTER-SYNK:
 * rp-05-sekvensrisken + pe-06-j-kurvan-och-capital-calls.
 *
 * Steg 0 = klaim/kollisionsvakt: syskonanspråk läses, registerläge kontrolleras.
 * U1:s rs-09-personalrisken (deras omgångs leverans, 458→459 HELT synkad vid
 * detta fönstrets start — register = karta = 459) respekteras som LEVERERAD;
 * u3:s ev. landsättningar under fönstret tåls av kedjans idempotens (omkörning).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["rp-05-sekvensrisken", "pe-06-j-kurvan-och-capital-calls"];
const SERIE = [
  ["rp-05-sekvensrisken", "rp-04-volatilitetsbudgeten"],
  ["pe-06-j-kurvan-och-capital-calls", "pe-05-andrahandsmarknaden"],
];
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + " " + args.join(" ").slice(0, 60) + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};
const antal = () => Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

// ── 0. Klaim/kollisionsvakt ───────────────────────────────────────────────────
const regFore = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const n0 = Object.keys(regFore).length;
console.log("─ steg 0: register " + n0 + " kurser vid start");
for (const s of MINA) if (regFore[s]) console.log("─ " + s + " finns redan — idempotent fortsätt.");
for (const frammande of Object.keys(regFore).filter((s) => (s.startsWith("rp-05-") || s.startsWith("pe-06-")) && !MINA.includes(s))) {
  console.error("ABORT: främmande slug i mina seriesteg: " + frammande + " — register-först-presedensen gäller, PIVOTA (omnumrera) och kör om.");
  process.exit(3);
}
if (regFore["rs-09-personalrisken"]) console.log("─ syskonkurs i registret: rs-09-personalrisken (u1:s leverans, respekterad)");
for (const ansprak of ["auto-s5-1789888503136-s5-u1-ansprak.md", "auto-s5-1789888503136-s5-u3-ansprak.md"]) {
  const p = ROT + "/data/vakten/" + ansprak;
  console.log("─ syskonanspråk " + (existsSync(p) ? "läst: " + ansprak : "saknas: " + ansprak));
}

// ── 1. Registerinsert ×2 (idempotenta) ────────────────────────────────────────
for (const slug of MINA) run("verktyg/lagg-till-kurs.mjs", ["data/kurser-tillagg/" + slug + ".json"]);
const n1 = antal();
const regEfter = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const saknade = MINA.filter((s) => !regEfter[s]);
if (saknade.length) { console.error("SLUTFEL: mina inserts saknas i registret: " + saknade.join(", ")); process.exit(1); }
console.log("─ register: " + n0 + " → " + n1 + " (+" + (n1 - n0) + "; mina två på plats " + (n1 - n0 === 2 ? "— bidrag exakt +2" : "— syskoninserts under fönstret, mina två verifierade") + ")");

// Serieordning: varje ny kurs EFTER sin serieföregångare (och syskonens ev. kurser i sina serier)
const slugar = Object.keys(regEfter);
for (const [ny, fore] of SERIE) {
  const iNy = slugar.indexOf(ny), iFore = slugar.indexOf(fore);
  if (!(iFore >= 0 && iNy > iFore)) { console.error("SLUTFEL: serieordning bruten (" + fore + "@" + iFore + " < " + ny + "@" + iNy + ")"); process.exit(1); }
  console.log("─ serieordning: " + fore + "@" + iFore + " < " + ny + "@" + iNy + " ✓");
}
if (slugar.indexOf("rs-09-personalrisken") >= 0) console.log("─ syskonläge: rs-09-personalrisken@" + slugar.indexOf("rs-09-personalrisken") + " (u1:s bokföring)");

// ── 2. Karta ──────────────────────────────────────────────────────────────────
run("scripts/bygg-larvag-karta.ts", []);

// ── 3-4. Sökindex + speglar ───────────────────────────────────────────────────
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);

// ── 5. Siffror ────────────────────────────────────────────────────────────────
run("verktyg/rakna-siffror.mjs", []);

// ── 6. llms-mönstersträng (dynamiskt: filens tal → slutläget) ─────────────────
const llmsFiler = [
  { fil: "public/llms.txt", vantatAntalTräffar: 6 },
  { fil: "public/llms-full.txt", vantatAntalTräffar: 4 },
];
for (const { fil, vantatAntalTräffar } of llmsFiler) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  const maxTal = Math.max(...traffar);
  const antalHuvud = traffar.filter((x) => x === maxTal).length;
  if (antalHuvud !== vantatAntalTräffar) { console.error("LLMS-FEL " + fil + ": huvudtalet " + maxTal + " har " + antalHuvud + " träffar (väntat " + vantatAntalTräffar + ") — mellanläge från syskonfönster; omkalibrera genom omkörning."); process.exit(2); }
  const gammal = String(maxTal);
  const ny = String(n1);
  if (gammal === ny) { console.log("─ llms " + fil.split("/").pop() + ": bär redan " + ny + " — ingen skrivning."); continue; }
  t = t.split(gammal + " kurser").join(ny + " kurser");
  const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
  const xpNytt = siffror.xpTotalt ?? siffror.xp ?? siffror.totalXp;
  if (typeof xpNytt === "number") {
    const reGammal = /(\d{2,3})[\s\u00A0\u2007\u202F](\d{3})( XP)/;
    const m = t.match(reGammal);
    if (m) {
      const gammalXp = m[0];
      const sep = (gammalXp.match(/[\s\u00A0\u2007\u202F]/) || [" "])[0];
      const nyXpStr = String(xpNytt).replace(/\B(?=(\d{3})+(?!\d))/g, sep) + " XP";
      if (gammalXp !== nyXpStr) {
        t = t.split(gammalXp).join(nyXpStr);
        console.log("─ llms-XP " + fil.split("/").pop() + ": »" + gammalXp + "« → »" + nyXpStr + "« (siffror.json " + xpNytt + ")");
      }
    }
  }
  writeFileSync(ROT + "/" + fil, t, "utf8");
  console.log("─ llms " + fil.split("/").pop() + ": " + antalHuvud + " ställen »" + gammal + " kurser« → »" + ny + " kurser«");
}

// ── 7. AI-mentor-register rebake (med antal-vakt) ─────────────────────────────
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

// ── 8. Larvag-synk (GRÖN krav) ────────────────────────────────────────────────
run("verktyg/larvag-synk.mjs", []);

// ── Slutkontroll ──────────────────────────────────────────────────────────────
const slut = antal();
if (slut < n1) { console.error("SLUTFEL: registret bär " + slut + " (< " + n1 + ") — race; omkör idempotenta steg."); process.exit(1); }
console.log("SYNK GRÖN: register " + slut + " (bidrag denna kedja: " + n0 + " → " + n1 + ") — kedjan komplett, Front B + tsc + commit OMEDELBART.");
