#!/usr/bin/env node
/**
 * s5-u3 (manifest auto-s5-1789701930027) — ATOMISK REGISTER-SYNK:
 * ma-05-kreditpremien + ek-05-monte-carlo-i-motorn + od-05-utdelningen-och-optionen
 * Register 411 → 413. Bygger på syskonens 411-läge (u1:s tx-04 + u2:s bk-04/rp-03).
 *
 * Kedja (idempotent per verktyg, EN process, commit OMEDELBART efter grönt):
 *   1. lagg-till-kurs ×3        (registerinsert, serieordning)
 *   2. bygg-larvag-karta.ts      (karta + LARVAG_ANTAL_KURSER)
 *   3. kor-sokindex.mjs          (sökindex)
 *   4. kor-speglar-slugar.mjs    (404-speglar /en /ar)
 *   5. rakna-siffror.mjs         (siffror.json — sajtens talkälla)
 *   6. llms.txt + llms-full.txt  (mönstersträng 411→413 + XP-tal)
 *   7. ai-mentor-register rebake (bastestets E01-kontrakt)
 *   8. larvag-synk.mjs           (GRÖN 413 = 413 = 413)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + " " + args.join(" ").slice(0, 60) + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};

// ── 1. Registerinsert ×3 (idempotenta) ───────────────────────────────────────
for (const slug of ["ma-05-kreditpremien", "ek-05-monte-carlo-i-motorn", "od-05-utdelningen-och-optionen"]) {
  run("verktyg/lagg-till-kurs.mjs", ["data/kurser-tillagg/" + slug + ".json"]);
}

// ── 2. Karta ─────────────────────────────────────────────────────────────────
run("scripts/bygg-larvag-karta.ts", []);

// ── 3-4. Sökindex + speglar ──────────────────────────────────────────────────
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);

// ── 5. Siffror ───────────────────────────────────────────────────────────────
run("verktyg/rakna-siffror.mjs", []);

// ── 6. llms-mönstersträng (exakt antal träffar: 6 i llms.txt + 4 i llms-full) ─
const llmsFiler = [
  { fil: "public/llms.txt", vantat: 6 },
  { fil: "public/llms-full.txt", vantat: 4 },
];
for (const { fil, vantat } of llmsFiler) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const gammal = "411 kurser";
  const ny = "413 kurser";
  const n = t.split(gammal).length - 1;
  if (n !== vantat) { console.error("LLMS-FEL " + fil + ": " + n + " träffar av »" + gammal + "« (väntat " + vantat + ") — ABORT, ingen skrivning."); process.exit(1); }
  t = t.split(gammal).join(ny);
  // XP-talet: spegla siffror.json (tunn/hårt mellanslag hanteras via regex)
  const siffror = JSON.parse(readFileSync(ROT + "/data/siffror.json", "utf8"));
  const xpNytt = siffror.xpTotalt ?? siffror.xp ?? siffror.totalXp;
  if (typeof xpNytt === "number") {
    const svXp = String(xpNytt); // utan separator — matcha med valfri separator via regex
    const reXp = new RegExp("82[\\s\\u00A0\\u2007\\u202F]380");
    // gamla XP: 408-lägets 82 230 + syskonens 3×50 = 82 380 (411-läget) — vårt nya ligger i siffror.json
    const reGammal = new RegExp("(82)[\\s\\u00A0\\u2007\\u202F](230|380)( XP)");
    const m = t.match(reGammal);
    if (m) {
      const gammalXp = m[0];
      const nyXpStr = "82" + (gammalXp.match(/[\s\u00A0\u2007\u202F]/) || [" "])[0] + String(xpNytt).slice(2) + " XP";
      t = t.split(gammalXp).join(nyXpStr);
      console.log("─ llms-XP " + fil.split("/").pop() + ": »" + gammalXp + "« → »" + nyXpStr + "« (siffror.json " + xpNytt + ")");
    }
  }
  writeFileSync(ROT + "/" + fil, t, "utf8");
  console.log("─ llms " + fil.split("/").pop() + ": " + n + " ställen »411 kurser« → »413 kurser«");
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
const antal = Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;
if (antal !== 413) { console.error("SLUTFEL: registret bär " + antal + " (väntat 413)"); process.exit(1); }
console.log("SYNK GRÖN: register 413 — kedjan komplett, commit OMEDELBART.");
