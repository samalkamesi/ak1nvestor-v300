#!/usr/bin/env node
/**
 * s5-u2 INSTANS 2 (manifest auto-s5-1789789514860, omgång 18b) — ATOMISK
 * REGISTER-SYNK: ib-04-avkastningsrakningen + roic-04-vardeekvationen.
 * Register (startläget läses dynamiskt — syskonrace) +2. Syskonen är klara
 * och committade (u1 se-17/bk-06/sj-06, u2:1 rp-04/kt-05, u3 pf-15 —
 * registret 438 vid skrivandet); kedjan förblir racedynamisk: totalsen
 * läses från registret, aldrig hardkodade.
 *
 * Kedja (idempotent per verktyg, EN process, commit OMEDELBART efter grönt):
 *   1. lagg-till-kurs ×2        (registerinsert, serieordning, fresh-read)
 *   2. bygg-larvag-karta.ts      (karta + antal-rad)
 *   3. kor-sokindex.mjs          (sökindex)
 *   4. kor-speglar-slugar.mjs    (404-speglar /en /ar)
 *   5. rakna-siffror.mjs         (siffror.json — sajtens talkälla)
 *   6. llms.txt + llms-full.txt  (mönstersträng <C> kurser → <C+2>, dynamisk)
 *   7. ai-mentor-register rebake (antalvakt + retry ×3 — 64 KB-pipe-trunkering)
 *   8. larvag-synk.mjs           (GRÖN <C+2> = <C+2> = <C+2>)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024 });
  console.log("─ " + cmd.split("/").pop() + " " + args.join(" ").slice(0, 60) + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};
const antalRegister = () => Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

// ── 0. Startläge (dynamiskt — syskon kan ha levererat under fönstret) ────────
const START = antalRegister();
const NYA = ["ib-04-avkastningsrakningen", "roic-04-vardeekvationen"];
const SLUT = START + NYA.length;
console.log("Startläge: register " + START + " → mål " + SLUT + " (+" + NYA.length + ")");

// ── 1. Registerinsert ×2 (idempotenta, varje anrop fresh-read) ───────────────
for (const slug of NYA) run("verktyg/lagg-till-kurs.mjs", ["data/kurser-tillagg/" + slug + ".json"]);
const efterInsert = antalRegister();
if (efterInsert !== SLUT) {
  console.error("REGISTERVAKT: " + efterInsert + " efter insert (väntat " + SLUT + ") — syskonrace under fönstret; nytt läge accepteras, llms kalibreras om.");
}

// ── 2. Karta ─────────────────────────────────────────────────────────────────
run("scripts/bygg-larvag-karta.ts", []);

// ── 3-4. Sökindex + speglar ──────────────────────────────────────────────────
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);

// ── 5. Siffror ───────────────────────────────────────────────────────────────
run("verktyg/rakna-siffror.mjs", []);

// ── 6. llms-mönstersträng (dynamisk: <START> kurser → <SLUT> kurser) ─────────
// Idempotent: är filen redan på slutläget (× förväntat) betraktas steget klart.
// Mellanläge (syskon levererat samtidigt) → ABORT högt, aldrig tyst.
const llmsFiler = [
  { fil: "public/llms.txt", vantat: 6 },
  { fil: "public/llms-full.txt", vantat: 4 },
];
const slutLage = antalRegister();
const gammalStr = START + " kurser";
const nyStr = slutLage + " kurser";
for (const { fil, vantat } of llmsFiler) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const nGamla = t.split(gammalStr).length - 1;
  const nNya = t.split(nyStr).length - 1;
  if (nGamla === 0 && nNya === vantat) { console.log("─ llms " + fil.split("/").pop() + ": redan i " + slutLage + "-läget (" + nNya + " ställen) — idempotent klart"); continue; }
  if (nGamla !== vantat) {
    console.error("LLMS-FEL " + fil + ": " + nGamla + " träffar av »" + gammalStr + "« (väntat " + vantat + ") och " + nNya + " av »" + nyStr + "« — mellanläge från syskonrace, ABORT (ingen skrivning; omkör efter omkalibrering).");
    process.exit(1);
  }
  t = t.split(gammalStr).join(nyStr);
  writeFileSync(ROT + "/" + fil, t, "utf8");
  console.log("─ llms " + fil.split("/").pop() + ": " + nGamla + " ställen »" + gammalStr + "« → »" + nyStr + "«");
}

// ── 7. AI-mentor-register rebake ─────────────────────────────────────────────
// ANTAL-VAKT (u1:s o16-fynd: --baka:s process.exit truncerar stdout över
// 64 KB pipe-buffert). Vakten: radantalet måste motsvara registret, annars
// retry ×3, sedan ABORT högt. Rot-lagning avselhas; vakten stannar tills
// roten lagas.
const vantaRader = antalRegister();
let rader = "";
for (let forsok = 1; forsok <= 3; forsok++) {
  rader = run("verktyg/testa-ai-mentor.mjs", ["--baka"]);
  const n = rader.replace(/\n$/, "").split("\n").length;
  if (n === vantaRader) { console.log("─ rebake försök " + forsok + ": " + n + " rader = registret (" + vantaRader + ") — vakten nöjd"); break; }
  console.error("─ rebake försök " + forsok + ": " + n + " rader mot väntat " + vantaRader + " — trunkerad pipe (64 KB), RETRY");
  if (forsok === 3) { console.error("REBAKE-ABORT: tre försök gav ej registrets radantal — kör sanering manuellt, aldrig tyst."); process.exit(1); }
}
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

// ── 8. Larvag-synk (GRÖN krav) ───────────────────────────────────────────────
run("verktyg/larvag-synk.mjs", []);

// ── Slutkontroll: registerantal + mina slugs närvarande ─────────────────────
const slutAntal = antalRegister();
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const saknade = NYA.filter((s) => !(s in reg));
if (saknade.length) { console.error("SLUTFEL: saknar i registret: " + saknade.join(", ")); process.exit(1); }
console.log("SYNK GRÖN: register " + slutAntal + " (start " + START + " + " + NYA.length + ") — " + NYA.join(" + ") + " på plats, kedjan komplett, commit OMEDELBART.");
