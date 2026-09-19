#!/usr/bin/env node
/**
 * s5-u2 (manifest auto-s5-1789812330026, omgång 19) — ATOMISK REGISTER-SYNK:
 * vr-07-terminalvardet (VÄRDERING-familjens 7:e steg) +
 * pe-05-andrahandsmarknaden (PRIVATE EQUITY & INVESTMENTBOLAG:s 5:e steg).
 * Register: aktuellt disk-läge läses DYNAMISKT — syskon (u1: +1, u3: +3) kan
 * landa parallellt; stegen är idempotenta (o15-o18-mönstret).
 *
 * Kedja (EN process, commit OMEDELBART efter grönt — o17-u2:s lärdom):
 *   0. syskonanspråks-koll (o17-lärdomen: läs syskonen FÖRE insert)
 *   1. lagg-till-kurs ×2     (registerinsert, serieordning)
 *   2. bygg-larvag-karta.ts  (karta + LARVAG_ANTAL_KURSER)
 *   3. kor-sokindex.mjs      (sökindex)
 *   4. kor-speglar-slugar.mjs (404-speglar /en /ar)
 *   5. rakna-siffror.mjs     (siffror.json — sajtens talkälla)
 *   6. llms ×2               (dynamisk mönstersträng, retry vid mellanläge)
 *   7. ai-mentor-register rebake (antal-vakt + retry ×3 — omgång 16:s fynd)
 *   8. larvag-synk.mjs       (GRÖN slutläge = karta = konstant)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const MANIFEST = "auto-s5-1789812330026";
const MINA = ["vr-07-terminalvardet", "pe-05-andrahandsmarknaden"];
const run = (cmd, args) => {
  const ut = execFileSync("node", [cmd, ...args], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  console.log("─ " + cmd.split("/").pop() + " " + args.join(" ").slice(0, 60) + (ut.includes("\n") ? "" : " → " + ut.trim().slice(0, 100)));
  return ut;
};
const antal = () => Object.keys(JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"))).length;

// ── 0. Syskonanspråks-koll (FÖRE insert — o17-lärdomen) ──────────────────────
// Tolkar VAL-blocket (mellan "## VAL" och nästa "##") — omnämnanden utanför
// blocket är race-redovisningar som RESPEKTERAR mina ytor ("u2:s vr-07"),
// inte anspråk på dem.
const ansprak = (readdirSync(ROT + "/data/vakten").filter((f) => f.startsWith(MANIFEST) && f.includes("ansprak") && !f.includes("s5-u2")));
for (const f of ansprak) {
  const txt = readFileSync(ROT + "/data/vakten/" + f, "utf8");
  const valBlock = (txt.split(/^## VAL/m)[1] || "").split(/^## /m)[0];
  const krock = MINA.filter((s) => valBlock.includes(s.slice(0, 5)));
  if (krock.length) { console.error("STOPP: syskonanspråket " + f + " rör " + krock.join(", ") + " i sitt VAL-block — läs och avgöra före insert."); process.exit(3); }
  console.log("─ syskonanspråk läst: " + f + " (VAL-block: 0 överlapp med " + MINA.join("/") + ")");
}

// ── 1. Registerinsert ×2 (idempotent) ────────────────────────────────────────
const n0 = antal();
for (const slug of MINA) run("verktyg/lagg-till-kurs.mjs", ["data/kurser-tillagg/" + slug + ".json"]);
const n1 = antal();
const regEfter = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const saknade = MINA.filter((s) => !regEfter[s]);
if (saknade.length) { console.error("SLUTFEL: mina inserts saknas i registret: " + saknade.join(", ")); process.exit(1); }
if (n1 - n0 !== 2) console.log("─ notis: registret växte " + n0 + " → " + n1 + " (+" + (n1 - n0) + ") — syskoninserts under fönstret; mina två verifierade på plats.");
console.log("─ register: " + n0 + " → " + n1 + " (vr-07 + pe-05 på plats)");

// Serieordning: vr-06 < vr-07 < ib-01 · pe-04 < pe-05 < roic-01
const slugar = Object.keys(regEfter);
const ordning = (fore, min, efter) => {
  const a = slugar.indexOf(fore), b = slugar.indexOf(min), c = slugar.indexOf(efter);
  if (!(a < b && b < c)) { console.error("SLUTFEL: serieordning bruten (" + fore + "@" + a + " < " + min + "@" + b + " < " + efter + "@" + c + ")"); process.exit(1); }
  console.log("─ serieordning: " + fore + "@" + a + " < " + min + "@" + b + " < " + efter + "@" + c + " ✓");
};
ordning("vr-06-jamforelsebolagen", "vr-07-terminalvardet", "ib-01-vad-ar-ett-investmentbolag");
ordning("pe-04-den-privata-agarsidan", "pe-05-andrahandsmarknaden", "roic-01-avkastning-pa-investerat-kapital");

// ── 2. Karta ─────────────────────────────────────────────────────────────────
run("scripts/bygg-larvag-karta.ts", []);

// ── 3-4. Sökindex + speglar ──────────────────────────────────────────────────
run("verktyg/kor-sokindex.mjs", []);
run("verktyg/kor-speglar-slugar.mjs", []);

// ── 5. Siffror ───────────────────────────────────────────────────────────────
run("verktyg/rakna-siffror.mjs", []);

// ── 6. llms-mönstersträng (dynamiskt; retry vid syskon-mellanläge) ───────────
const llmsFiler = [
  { fil: "public/llms.txt", vantatAntalTräffar: 6 },
  { fil: "public/llms-full.txt", vantatAntalTräffar: 4 },
];
for (const { fil, vantatAntalTräffar } of llmsFiler) {
  let skrivit = false;
  for (let forsok = 1; forsok <= 3 && !skrivit; forsok++) {
    let t = readFileSync(ROT + "/" + fil, "utf8");
    const traffar = [...t.matchAll(/(\d{3}) kurser/g)].map((m) => Number(m[1]));
    const maxTal = Math.max(...traffar);
    const antalHuvud = traffar.filter((x) => x === maxTal).length;
    if (antalHuvud !== vantatAntalTräffar) { console.log("─ llms " + fil.split("/").pop() + " försök " + forsok + ": mellanläge (huvudtalet " + maxTal + " på " + antalHuvud + " ställen) — väntar 5 s på syskonkedja"); await new Promise((r) => setTimeout(r, 5000)); continue; }
    const gammal = String(maxTal), ny = String(antal());
    if (gammal === ny) { console.log("─ llms " + fil.split("/").pop() + ": bär redan " + ny + " — ingen skrivning."); skrivit = true; break; }
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
    skrivit = true;
  }
  if (!skrivit) { console.error("LLMS-FEL " + fil + ": tre försök gav inget stabilt utgångsläge — ABORT."); process.exit(2); }
}

// ── 7. AI-mentor-register rebake ────────────────────────────────────────────
// VAKT (omgång 16:s fynd): testa-ai-mentor.mjs --baka trunkeras tyst vid >64 KB
// pipe-buffert — läs antal, jämför mot registret, retry ×3.
const regFil = ROT + "/src/lib/ai-mentor-register.ts";
let bakaRader = null;
for (let forsok = 1; forsok <= 3; forsok++) {
  const ut = execFileSync("node", ["verktyg/testa-ai-mentor.mjs", "--baka"], { cwd: ROT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const r = ut.replace(/\n$/, "").split("\n");
  console.log("─ baka försök " + forsok + ": " + r.length + " rader (register " + antal() + ")");
  if (r.length === antal() && r[r.length - 1].includes("niva:")) { bakaRader = ut.replace(/\n$/, ""); break; }
}
if (!bakaRader) { console.error("REBAKE-FEL: tre försök gav ej " + antal() + " fullständiga rader — ABORT (registerfilen orörd)."); process.exit(1); }
const lines = readFileSync(regFil, "utf8").split("\n");
const startIdx = lines.findIndex((l) => l.includes("export const KURSREGISTER: RegisterRad[] = ["));
if (startIdx < 0) { console.error("REBAKE-FEL: startmarkör saknas"); process.exit(1); }
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) if (lines[i].trim() === "];") { endIdx = i; break; }
const gamla = endIdx - startIdx - 1;
lines.splice(startIdx + 1, gamla, bakaRader);
writeFileSync(regFil, lines.join("\n"), "utf8");
console.log("─ ai-mentor-register.ts rebakad: " + gamla + " → " + bakaRader.split("\n").length + " rader (antal-vakt GRÖN)");

// ── 8. Larvag-synk (GRÖN krav) ──────────────────────────────────────────────
run("verktyg/larvag-synk.mjs", []);

// ── Slutkontroll: registerantal ──────────────────────────────────────────────
const slut = antal();
if (slut < n1) { console.error("SLUTFEL: registret bär " + slut + " (< " + n1 + ") — race; omkör idempotenta steg."); process.exit(1); }
console.log("SYNK GRÖN: register " + slut + " (mitt bidrag " + n0 + " → " + n1 + ") — kedjan komplett, commit OMEDELBART.");
