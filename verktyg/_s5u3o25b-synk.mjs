#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789962309223, omgång 25, byggare 3/3, försök 2 =
 * 06:05-dispatchen) — ATOMISK REGISTER-SYNK -b: se-23-stalsektorn
 * (SEKTORANALYS-familjens tjugotredje steg; stålsektorn).
 *
 * Startläge vid skrivande: 482 (u1 se-22 · u2 bk-08+roic-05 · syskon-försök 1
 * bf-17+od-09+kt-09 i commit 8abb594b). Mål: 483. Syskonet levererat och
 * committat — inget race kvar i fönstret. Kedjan idempotent och tål omkörning.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MANIFEST = "auto-s5-1789962309223";
const MINA = ["se-23-stalsektorn"];
const SERIE = [["se-23-stalsektorn", "se-22-byggentreprenaden"]];
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + " " + args.join(" ").slice(0, 60) + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};
const antal = () => Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

// ── 0. Klaim/syskonvakt ───────────────────────────────────────────────────────
const regFore = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const n0 = Object.keys(regFore).length;
console.log("─ steg 0: register " + n0 + " kurser vid start (väntat 482)");
for (const s of MINA) if (regFore[s]) console.log("─ " + s + " finns redan — idempotent fortsätt.");
for (const u of ["u1", "u2"]) {
  const p = ROT + "/data/vakten/" + MANIFEST + "-s5-" + u + "-ansprak.md";
  if (existsSync(p)) {
    const txt = readFileSync(p, "utf8");
    const valRader = txt.split("\n").filter((l) => /^#{1,3}\s.*VAL/i.test(l)).join("\n");
    const kolliderar = MINA.filter((s) => valRader.includes(s.split("-").slice(0, 2).join("-")));
    if (kolliderar.length) { console.error("ABORT: syskon " + u + ":s VAL kolliderar med: " + kolliderar.join(", ")); process.exit(3); }
    console.log("─ syskonanspråk " + u + " läst — ingen kollision med " + MINA.join(", "));
  } else console.log("─ syskonanspråk " + u + ": ej på disk");
}

// ── 1. Registerinsert (idempotent) ────────────────────────────────────────────
for (const slug of MINA) run("verktyg/lagg-till-kurs.mjs", ["data/kurser-tillagg/" + slug + ".json"]);
const n1 = antal();
const regEfter = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const saknade = MINA.filter((s) => !regEfter[s]);
if (saknade.length) { console.error("SLUTFEL: inserts saknas i registret: " + saknade.join(", ")); process.exit(1); }
if (n1 < n0 + 1) { console.error("SLUTFEL: registret växte " + n0 + " → " + n1 + " (väntat minst +1)"); process.exit(1); }
console.log("─ register: " + n0 + " → " + n1 + " (+" + (n1 - n0) + "; min kurs på plats" + (n1 > n0 + 1 ? " + ytterligare landningar under fönstret — respekterade" : "") + ")");

// Serieordning: ny kurs EFTER sin serieföregångare
const slugar = Object.keys(regEfter);
for (const [ny, fore] of SERIE) {
  const iNy = slugar.indexOf(ny), iFore = slugar.indexOf(fore);
  if (!(iFore >= 0 && iNy > iFore)) { console.error("SLUTFEL: serieordning bruten (" + fore + "@" + iFore + " < " + ny + "@" + iNy + ")"); process.exit(1); }
  console.log("─ serieordning: " + fore + "@" + iFore + " < " + ny + "@" + iNy + " ✓");
}

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
  if (antalHuvud !== vantatAntalTräffar) { console.error("LLMS-FEL " + fil + ": huvudtalet " + maxTal + " har " + antalHuvud + " träffar (väntat " + vantatAntalTräffar + ") — mellanläge; omkalibrera genom omkörning."); process.exit(2); }
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

// ── 9. Round-trip: kursfil ≡ registerpost (bitidentisk) ───────────────────────
const kursfil = JSON.parse(readFileSync(ROT + "/data/kurser-tillagg/se-23-stalsektorn.json", "utf8"));
const regPost = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))["se-23-stalsektorn"];
if (JSON.stringify(kursfil) !== JSON.stringify(regPost)) { console.error("SLUTFEL: kursfil och registerpost ej bitidentiska"); process.exit(1); }
console.log("─ round-trip: kursfil ≡ registerpost bitidentisk ✓");

// ── Slutkontroll ──────────────────────────────────────────────────────────────
const slut = antal();
const slutReg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const minaKvar = MINA.every((s) => slutReg[s]);
const syskonKvar = ["bf-17-nutidsbias-och-den-hyperboliska-kurvan", "od-09-forsakringsskrivandet", "kt-09-budpremien-och-budprocessen", "se-22-byggentreprenaden", "bk-08-intaktredovisningen", "roic-05-den-ekonomiska-vinsten"].every((s) => slutReg[s]);
if (slut < n1 || !minaKvar) { console.error("SLUTFEL: registret bär " + slut + " (< " + n1 + ") eller saknar min post — race; omkör idempotenta steg."); process.exit(1); }
if (!syskonKvar) { console.error("SLUTFEL: syskonposter saknas — återbär innan fortsätt (o23-doktrinen)."); process.exit(1); }
console.log("SYNK GRÖN: register " + slut + " (bidrag denna kedja: " + n0 + " → " + n1 + "; syskonens sex ytor verifierade kvar) — kedjan komplett, Front B + tsc + commit OMEDELBART.");
