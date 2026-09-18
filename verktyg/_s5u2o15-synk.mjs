#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789722300593, omgång 15) — ATOMISK REGISTER-SYNK:
 * ib-02-substansens-kvalitet + pe-04-den-privata-agarsidan.
 * Register (startläget läses dynamiskt — syskonrace) +2. Bygger på syskonens
 * underliggande läge (u3:s bk-05 415-läge vid fönsterstart; kedjan är
 * racedynamisk: totalsen läses från registret, aldrig hardkodade).
 *
 * Kedja (idempotent per verktyg, EN process, commit OMEDELBART efter grönt):
 *   1. lagg-till-kurs ×2        (registerinsert, serieordning, fresh-read)
 *   2. bygg-larvag-karta.ts      (karta + LARVAG_ANTAL_KURSER)
 *   3. kor-sokindex.mjs          (sökindex)
 *   4. kor-speglar-slugar.mjs    (404-speglar /en /ar)
 *   5. rakna-siffror.mjs         (siffror.json — sajtens talkälla)
 *   6. llms.txt + llms-full.txt  (mönstersträng <C> kurser → <C+2>, dynamisk)
 *   7. ai-mentor-register rebake (bastestets E01-kontrakt)
 *   8. larvag-synk.mjs           (GRÖN <C+2> = <C+2> = <C+2>)
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
const antalRegister = () => Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

// ── 0. Startläge (dynamiskt — syskon kan ha levererat under fönstret) ────────
const START = antalRegister();
const NYA = ["ib-02-substansens-kvalitet", "pe-04-den-privata-agarsidan"];
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
// Idempotent: är filen redan på SLUT-läget (× förväntat) betraktas steget klart.
// Uppstår ett mellanläge (syskon levererat samtidigt) → ABORT högt, aldrig tyst.
const llmsFiler = [
  { fil: "public/llms.txt", vantat: 6 },
  { fil: "public/llms-full.txt", vantat: 4 },
];
const gammalStr = START + " kurser";
const nyStr = SLUT + " kurser";
for (const { fil, vantat } of llmsFiler) {
  let t = readFileSync(ROT + "/" + fil, "utf8");
  const nGamla = t.split(gammalStr).length - 1;
  const nNya = t.split(nyStr).length - 1;
  if (nGamla === 0 && nNya === vantat) { console.log("─ llms " + fil.split("/").pop() + ": redan i " + SLUT + "-läget (" + nNya + " ställen) — idempotent klart"); continue; }
  if (nGamla !== vantat) {
    console.error("LLMS-FEL " + fil + ": " + nGamla + " träffar av »" + gammalStr + "« (väntat " + vantat + ") och " + nNya + " av »" + nyStr + "« — mellanläge från syskonrace, ABORT (ingen skrivning; omkör efter omkalibrering).");
    process.exit(1);
  }
  t = t.split(gammalStr).join(nyStr);
  writeFileSync(ROT + "/" + fil, t, "utf8");
  console.log("─ llms " + fil.split("/").pop() + ": " + nGamla + " ställen »" + gammalStr + "« → »" + nyStr + "«");
}

// ── 7. AI-mentor-register rebake ─────────────────────────────────────────────
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

// ── 8. Larvag-synk (GRÖN krav) ───────────────────────────────────────────────
run("verktyg/larvag-synk.mjs", []);

// ── Slutkontroll: registerantal + mina slugs närvarande ──────────────────────
const slutAntal = antalRegister();
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const saknade = NYA.filter((s) => !(s in reg));
if (saknade.length) { console.error("SLUTFEL: saknar i registret: " + saknade.join(", ")); process.exit(1); }
console.log("SYNK GRÖN: register " + slutAntal + " (start " + START + " + " + NYA.length + ") — " + NYA.join(" + ") + " på plats, kedjan komplett, commit OMEDELBART.");
