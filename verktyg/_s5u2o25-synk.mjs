#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789962309223, omgång 25) — ATOMISK REGISTER-SYNK:
 * bk-08-intaktredovisningen + roic-05-den-ekonomiska-vinsten.
 *
 * Steg 0 = klaim/kollisionsvakt: syskonanspråk läses, registerläge kontrolleras,
 * register-först-presedensen (främmande slug i mina seriesteg → abort + pivot).
 * Syskonens ev. landningar under fönstret tåls av kedjans idempotens.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["bk-08-intaktredovisningen", "roic-05-den-ekonomiska-vinsten"];
const SERIE = [
  ["bk-08-intaktredovisningen", "bk-07-lagret-och-lagervarderingen"],
  ["roic-05-den-ekonomiska-vinsten", "roic-04-vardeekvationen"],
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
for (const frammande of Object.keys(regFore).filter((s) => (s.startsWith("bk-08-") || s.startsWith("roic-05-")) && !MINA.includes(s))) {
  console.error("ABORT: främmande slug i mina seriesteg: " + frammande + " — register-först-presedensen gäller, PIVOTA (omnumrera) och kör om.");
  process.exit(3);
}
for (const ansprak of ["auto-s5-1789962309223-s5-u1-ansprak.md", "auto-s5-1789962309223-s5-u3-ansprak.md"]) {
  const p = ROT + "/data/vakten/" + ansprak;
  if (existsSync(p)) {
    const innehall = readFileSync(p, "utf8");
    const kollision = MINA.some((s) => innehall.includes(s.split("-").slice(0, 2).join("-")));
    console.log("─ syskonanspråk läst: " + ansprak + (kollision ? " — VARNING: berör mina serier!" : " — inget anspråk på bk-08/roic-05."));
  } else {
    console.log("─ syskonanspråk saknas: " + ansprak + " (syskonet ej framme ännu — klaim-vakten står kvar i synken om den landar)");
  }
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

// ── 2. Karta ──────────────────────────────────────────────────────────────────
run("scripts/bygg-larvag-karta.ts", []);

// ── 3-4. Sökindex + speglar ───────────────────────────────────────────────────
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);

// ── 5. Siffror ────────────────────────────────────────────────────────────────
run("verktyg/rakna-siffror.mjs", []);

// ── 6. llms-mönstersträng (dynamiskt: filens tal → slutläget) ─────────────────
const llmsFiler = [
  { fil: "public/llms.txt", vantatAntalTraffar: 6 },
  { fil: "public/llms-full.txt", vantatAntalTraffar: 4 },
];
for (const { fil, vantatAntalTraffar } of llmsFiler) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  const maxTal = Math.max(...traffar);
  const antalHuvud = traffar.filter((x) => x === maxTal).length;
  if (antalHuvud !== vantatAntalTraffar) { console.error("LLMS-FEL " + fil + ": huvudtalet " + maxTal + " har " + antalHuvud + " träffar (väntat " + vantatAntalTraffar + ") — mellanläge från syskonfönster; omkalibrera genom omkörning."); process.exit(2); }
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
  const nNu = antal();
  console.log("─ baka försök " + forsok + ": " + r.length + " rader (register " + nNu + ")");
  if (r.length === nNu && r[r.length - 1].includes("niva:")) { bakaRader = ut.replace(/\n$/, ""); break; }
}
if (!bakaRader) { console.error("REBAKE-FEL: tre försök gav ej registrets antal fullständiga rader — ABORT (registerfilen orörd; omkör vid syskonlandning)."); process.exit(1); }
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
