#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789722300593, omgång 15) — ATOMISK REGISTER-SYNK:
 * vr-05-pris-och-varde + tx-05-tillvaxtens-forsta-lasning + roic-03-inkrementell-roic
 * Register: aktuellt disk-läge (u1:s bk-05-redovisningspolitiken = 415; u2:s ib-02/pe-04
 * kan landa parallellt — skriptet är därför DYNAMISKT: räknar registret, inte antar).
 *
 * Kedja (idempotent per verktyg, EN process, commit OMEDELBART efter grönt):
 *   1. lagg-till-kurs ×3        (registerinsert, serieordning)
 *   2. bygg-larvag-karta.ts      (karta + LARVAG_ANTAL_KURSER)
 *   3. kor-sokindex.mjs          (sökindex)
 *   4. kor-speglar-slugar.mjs    (404-speglar /en /ar)
 *   5. rakna-siffror.mjs         (siffror.json — sajtens talkälla)
 *   6. llms.txt + llms-full.txt  (dynamisk mönstersträng: aktuellt tal → slutläget)
 *   7. ai-mentor-register rebake (bastestets E01-kontrakt)
 *   8. larvag-synk.mjs           (GRÖN slutläge = slutläge = slutläge)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MINA = ["vr-05-pris-och-varde", "tx-05-tillvaxtens-forsta-lasning", "roic-03-inkrementell-roic"];
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + " " + args.join(" ").slice(0, 60) + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};
const antal = () => Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

// ── 1. Registerinsert ×3 (idempotenta) ───────────────────────────────────────
const n0 = antal();
for (const slug of MINA) run("verktyg/lagg-till-kurs.mjs", ["data/kurser-tillagg/" + slug + ".json"]);
const n1 = antal();
const regEfter = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const saknade = MINA.filter((s) => !regEfter[s]);
if (saknade.length) { console.error("SLUTFEL: mina inserts saknas i registret: " + saknade.join(", ")); process.exit(1); }
if (n1 - n0 !== 3) console.log("─ notis: registret växte " + n0 + " → " + n1 + " (+" + (n1 - n0) + ") — syskoninserts under fönstret; mina tre verifierade på plats.");
console.log("─ register: " + n0 + " → " + n1 + " (mina +3 på plats)");

// ── 2. Karta ─────────────────────────────────────────────────────────────────
run("scripts/bygg-larvag-karta.ts", []);

// ── 3-4. Sökindex + speglar ──────────────────────────────────────────────────
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);

// ── 5. Siffror ───────────────────────────────────────────────────────────────
run("verktyg/rakna-siffror.mjs", []);

// ── 6. llms-mönstersträng (dynamiskt: talet som står i filen → slutläget) ────
const llmsFiler = [
  { fil: "public/llms.txt", vantatAntalTräffar: 6 },
  { fil: "public/llms-full.txt", vantatAntalTräffar: 4 },
];
for (const { fil, vantatAntalTräffar } of llmsFiler) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
  // Huvudantalet (registrets kurser) är alltid filens STÖRSTA kurstal — BOKMASTER-raden
  // (103) och andra delmängder röras aldrig. Endast huvudtalets träffantal är kontraktet.
  const maxTal = Math.max(...traffar);
  const antalHuvud = traffar.filter((x) => x === maxTal).length;
  if (antalHuvud !== vantatAntalTräffar) { console.error("LLMS-FEL " + fil + ": huvudtalet " + maxTal + " har " + antalHuvud + " träffar (väntat " + vantatAntalTräffar + ") — ABORT."); process.exit(1); }
  const gammal = String(maxTal);
  const ny = String(n1);
  if (gammal === ny) { console.log("─ llms " + fil.split("/").pop() + ": bär redan " + ny + " — ingen skrivning."); continue; }
  t = t.split(gammal + " kurser").join(ny + " kurser");
  // XP-talet: spegla siffror.json (separator via regex)
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
  console.log("─ llms " + fil.split("/").pop() + ": " + traffar.length + " ställen »" + gammal + " kurser« → »" + ny + " kurser«");
}

// ── 7. AI-mentor-register rebake ────────────────────────────────────────────
const rader = run("verktyg/testa-ai-mentor.mjs", ["--baka"]);
const regFil = ROT + "/src/lib/ai-mentor-register.ts";
const lines = readFileSync(regFil, "utf8").split("\n");
const startIdx = lines.findIndex((l) => l.includes("export const KURSREGISTER: RegisterRad[] = ["));
if (startIdx < 0) { console.error("REBAKE-FEL: startmarkör saknas"); process.exit(1); }
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) if (lines[i].trim() === "];") { endIdx = i; break; }
const gamla = endIdx - startIdx - 1;
const nya = rader.replace(/\n$/, "").split("\n").length;
lines.splice(startIdx + 1, gamla, rader.replace(/\n$/, ""));
writeFileSync(regFil, lines.join("\n"), "utf8");
console.log("─ ai-mentor-register.ts rebakad: " + gamla + " → " + nya + " rader");

// ── 8. Larvag-synk (GRÖN krav) ──────────────────────────────────────────────
run("verktyg/larvag-synk.mjs", []);

// ── Slutkontroll: registerantal ──────────────────────────────────────────────
const slut = antal();
if (slut !== n1) { console.error("SLUTFEL: registret bär " + slut + " (väntat " + n1 + ") — syskon-race; omkör idempotenta steg."); process.exit(1); }
console.log("SYNK GRÖN: register " + slut + " — kedjan komplett, commit OMEDELBART.");
