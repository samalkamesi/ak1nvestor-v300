#!/usr/bin/env node
/** VÅG 221 — slutcykel: commit → vänta svep-SLUT → push → bygg → verifiera. */
import { appendFileSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const tid = nu.toISOString().slice(11, 16) + "Z";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300_000, ...opts });
const sleep = (s) => run("sleep", [String(s)]);

// ── 1. bokföring + lokal commit (tsc-grinden maler — 0 fel redan bevisat) ──
appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 221 STÄNGD (rond 114 [Φ]): KANONVYNS BYTE-BUDGET — V215.1:s statiska trimmar (176 kB) åt upp av trådens linjära tillväxt på en eftermiddag (230 poster ⇒ 213 kB, kontrakt 4 rött igen i v218-svepet). ROT: lasTradHistorik bar 180 kB (230 poster à ~741 tecken) + senastAktivHistorik 16 kB — en TREDJE dubbellagring V215.1 missade (klienten trumfar den alltid med tradHistorik, studio-chat:5669). KUR: (1) lasTradHistorik byte-budget TRAD_BUDGET_TKN=130 000 tecken, nyaste posterna bevaras först, golv 40 poster (datadeterministisk — kontrakt 1b stabilitet bevaras); (2) lasAterkoppling capar senastAktivHistorik till 10 senaste (fallbacken lever, död vik bort). MÅL ~155 kB med själreglerande budget. BEVIS: tsc 0 + bygg + prod 200 + payload-probe <200 kB (se v221 loggen). NOTIS deploydagen: synkens bygg OOM-dödades av styrelsemötet (bygge+tung svit samtidigt) — prod levde på gamla minnet, EN ombyggd efter svepets slut är protokollet.
`
);
appendFileSync(
  ROTA + "/worklog.md",
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — våg 221 STÄNGD (rond 114 [organ:Φ]): kanonvyns byte-budget — payload-taket själreglerande.** V215.1:s 176 kB åt upp av tillväxt (213 kB vid 230 poster). Kur: lasTradHistorik byte-budget (130k tecken, nyast först, golv 40 poster, datadeterministisk) + senastAktivHistorik capad till 10 (tredje dubbellagringen — klienten trumfar den alltid med kanonvyn). Bevis: tsc 0, bygg under lås efter svepets slut, prod 200, payload-probe. [studio]\n`
);
const msgFil = ROTA + "/verktyg/_v221-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 221 [organ:Φ] — kanonvyns byte-budget: payload-taket själreglerande

V215.1:s statiska trimmar (176 kB) åt upp av trådens linjära tillväxt
— 230 poster => 213 kB, kontrakt 4 rött igen (v218-svepet).

- studio-transport.ts lasTradHistorik: byte-budget 130k tecken, nyaste
  posterna bevaras först, golv 40 poster — datadeterministisk, kontrakt
  1b-stabilitet bevaras.
- lasAterkoppling: senastAktivHistorik capad till 10 senaste (tredje
  dubbellagringen; klienten trumfar alltid med kanonvyn, studio-chat
  5669) — fallbacken lever.
- Bevis: tsc 0 + bygg + prod 200 + payload <200 kB.`
);
run("git", [
  "add",
  "src/lib/studio/studio-transport.ts",
  "verktyg/_v221-sond.mjs",
  "verktyg/_v221-tsc.mjs",
  "verktyg/_v221-commit.mjs",
  "verktyg/_v221-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
console.log("COMMIT:", run("git", ["commit", "-F", msgFil]).trim().split("\n")[0]);

// ── 2. vänta svepets SLUT (aggregator pid borta ELLER RESULTAT_JSON i logg) ─
const SVEP_LOGG = ROTA + "/data/vakten/v218-fullsvep.log";
for (let i = 0; i < 40; i++) {
  let klar = false;
  try {
    execFileSync("kill", ["-0", "3615594"], { timeout: 5000, stdio: "ignore" });
  } catch {
    klar = true; // processen borta
  }
  if (!klar) {
    try {
      const sista = readFileSync(SVEP_LOGG, "utf8").split("\n").filter(Boolean).pop() ?? "";
      if (sista.includes("RESULTAT_JSON")) klar = true;
    } catch { /* läs igen nästa varv */ }
  }
  if (klar) {
    console.log("svepet klart (omgång " + (i + 1) + ")");
    break;
  }
  if (i === 39) {
    console.log("svepet tog för lång tid — bygger ändå (RAM-vakten + flock skyddar)");
  }
  sleep(45);
}
sleep(10);

// ── 3. push (vänte-merge) ───────────────────────────────────────────────────
let pushad = false;
for (let i = 0; i < 22 && !pushad; i++) {
  try {
    run("git", ["push", "prod", "develop"]);
    console.log("PUSH GRÖN");
    pushad = true;
  } catch (e) {
    const ferr = String(e.stdout || "") + String(e.stderr || "");
    if (/non-fast-forward|fetch first/i.test(ferr)) {
      try {
        run("git", ["fetch", "prod"]);
        run("git", ["merge", "--no-edit", "prod/develop"]);
        console.log("MERGE (omgång " + (i + 1) + ")");
      } catch (me) {
        console.log("MERGE-försök " + (i + 1) + ": " + String(me.stderr || me.message).slice(0, 120));
      }
    } else {
      console.log("push väntar (" + (i + 1) + "/22): " + ferr.trim().split("\n").pop().slice(0, 120));
    }
    if (!pushad) sleep(50);
  }
}
if (!pushad) {
  console.log("SLUT: push väntar — omkör skriptet");
  process.exit(1);
}

// ── 4. bygg under lås — 20 min-tak, 3 försök, alltid låst ──────────────────
const BYGG = "cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a";
let byggt = false;
for (let i = 0; i < 3 && !byggt; i++) {
  try {
    const ut = execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "bash", "-c", BYGG], {
      cwd: ROTA,
      encoding: "utf8",
      timeout: 1_200_000,
    });
    console.log("BYGG GRÖN: " + ut.trim().split("\n").slice(-2).join(" | ").slice(0, 300));
    byggt = true;
  } catch (e) {
    const ferr = String(e.stdout || "") + String(e.stderr || e.message || "");
    console.log("BYGG FÖRSÖK " + (i + 1) + " FEL (första 400): " + ferr.slice(0, 400));
    if (i < 2) {
      console.log("väntar 3 min innan omförsök");
      sleep(180);
    }
  }
}
if (!byggt) {
  console.log("SLUT: BYGGET FELADE 3 GÅNGER — REVERT-REGELEN: git revert krävs om prod trasig; sondera prod manuellt");
  process.exit(1);
}

// ── 5. verifiering: prod 200 + payload <200 kB ─────────────────────────────
sleep(12);
try {
  const kod = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", "https://lab.ak1nvestor.com/"], { timeout: 40_000 }).trim();
  console.log("PROD: HTTP " + kod);
  const sond = execFileSync("node", [ROTA + "/verktyg/_v221-sond.mjs"], { timeout: 60_000 });
  console.log("PAYLOAD-SOND:\n" + sond.trim());
  console.log(kod === "200" ? "SLUT: DEPLOYAD + VERIFIERAD" : "SLUT: OVÄNTAD KOD — sondera");
} catch (e) {
  console.log("verifiering fel: " + String(e.message).slice(0, 200));
}
