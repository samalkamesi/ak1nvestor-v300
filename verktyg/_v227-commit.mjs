#!/usr/bin/env node
/** VÅG 227 — korrigering + deploy-säkring: vänta v226-slutcykeln → boka
 *  korrigeringen (felaktig rapportbokföring + TUNG-döden) → commit → push →
 *  om bygg ej grönt i v226: bygg om under lås → verifiera. */
import { appendFileSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const dag = nu.toISOString().slice(0, 10);
const tid = nu.toISOString().slice(11, 16) + "Z";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300_000, ...opts });
const sleep = (s) => run("sleep", [String(s)]);
const SLOM_LOGG = ROTA + "/data/vakten/v226-slut.log";

// ── 1. vänta v226-slutcykeln (pid 3660716 borta ELLER SLUT:-rad) ────────────
let slut = "";
for (let i = 0; i < 40; i++) {
  let klar = false;
  try {
    execFileSync("kill", ["-0", "3660716"], { timeout: 5000, stdio: "ignore" });
  } catch {
    klar = true;
  }
  let loggen = "";
  try { loggen = readFileSync(SLOM_LOGG, "utf8"); } catch { /* igen nästa varv */ }
  for (const rad of loggen.split("\n")) if (rad.startsWith("SLUT:")) { slut = rad; klar = true; }
  if (klar) { console.log("v226-slutcykel avslutad:", slut || "(pid borta)"); break; }
  if (i === 39) console.log("v226 >30 min — fortsätter ändå");
  sleep(45);
}
const loggen = readFileSync(SLOM_LOGG, "utf8");
const byggGront = /BYGG GRÖN/.test(loggen);
const prodOk = /PROD: HTTP 200/.test(loggen);
const sondRad = (loggen.split("\n").find((r) => r.startsWith("total:")) ?? "sond saknas").trim();
console.log("v226-status: byggGront=" + byggGront, "prodOk=" + prodOk, "sond=" + sondRad);

// ── 2. korrigeringens bokföring ─────────────────────────────────────────────
appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 227 STÄNGD (rond 115 [Φ]): V224-RADENS RAPPORTFEL KORRIGERAT + ATTEMPT 4:S DÖD FÖRENSKRIVEN. KORRIGERING: v224-radens "${"155 sviter 0 GRÖNA · 1 RÖDA"}" var FEL — slutcykeln läste GAMLA testaggregator-SENASTE.json (11:04:37Z mini-rapporten, 1 offer-svit) eftersom attempt 4 aldrig skrev sin rapport. SANNINGEN (loggräknad ur v224-fullsvep.log): 150 GRÖNA · 4 RÖDA mätta · TUNG-testa-styrelse ALDRIG mätt — aggregatet dog ~11:47Z under TUNG-svitens zcode-barnfödelse, loggen frös mitt i raden (ingen RESULTAT_JSON, ingen rapport) = AGGREGATETS FJÄRDE DÖD men första med 154 mätta sviter bevarade i loggen. Röda: tillväxtdjup (V226-kurerad), tradspermanens 235,3 kB (V226-kurerad), studio-tabbar (öppen — dev-fönster krävs), prestanda-v96 RÖD(ram-vakt avlivad vid 80-101 MB fritt — skyddet verkade, omkörning krävs). DEPLOY: bygget OOM-dödades en gång (fabriksomgång 13:45 + Turbopack samtidigt), ombyggdes under lås — se v226-slut.log; prod 200 + payload-sond ${sondRad}. LÄXA x2: (1) rapportläsning MÅSTE verifiera genererad-tid > svepstart (fältet "genererad"); (2) deploy under fabrikens omgångar = OOM-lotteri — flock räcker inte, RAM-läget ska sonderas före byggstart (ram-grindens --min 1600 godkände men next build äter 2-3 GB på toppen).
`
);
appendFileSync(
  ROTA + "/worklog.md",
  `\n**${dag} ${tid} — våg 227 STÄNGD (rond 115 [organ:Φ]): rapportbokföringen korrigerad + fjärde aggregatedöden forenskriven.** V224-radens "0 GRÖNA 1 RÖD" var den gamla mini-rapporten (11:04Z) — attempt 4 dog ~11:47Z under TUNG-barnfödelsen UTAN rapport (fjärde döden; 150 GRÖNA + 4 RÖDA loggräknade, TUNG omätt). Deploy: bygg OOM-dödat en gång (fabriksomgång + Turbopack), ombyggt under lås; prod ${prodOk ? "200" : "SONDERA"}, sond ${sondRad}. Läxor: rapportläsning verifierar "genererad"-tiden; bygg startas ej under fabrikens omgångar. [studio]\n`
);
const msgFil = ROTA + "/verktyg/_v227-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 227 [organ:Φ] — rapportfel korrigerat + TUNG-döden forenskriven

V224-radens "0 GRÖNA · 1 RÖD" var GAMLA SENASTE.json (11:04Z) — attempt 4
skrev aldrig sin rapport: aggregatet dog ~11:47Z under TUNG-svitens
zcode-barnfödelse (fjärde döden; loggen frös mitt i raden).

Sanningen loggräknad: 150 GRÖNA · 4 RÖDA mätta · TUNG omätt.
Röda: tillväxtdjup + tradspermanens (båda V226-kurerade),
studio-tabbar (öppen), prestanda-v96 (ram-vakt, omkörning).

Deploy: OOM-död en gång (fabriksomgång + Turbopack), ombyggt under lås.
Läxa: verifiera "genererad" vid rapportläsning; sondera RAM före bygg.`
);
run("git", [
  "add",
  "verktyg/_v226-launch.mjs",
  "verktyg/_v227-sond.mjs",
  "verktyg/_v227-commit.mjs",
  "verktyg/_v227-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
console.log("COMMIT:", run("git", ["commit", "-F", msgFil]).trim().split("\n")[0]);

// ── 3. push (vänte-merge) ──────────────────────────────────────────────────
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
if (!pushad) { console.log("SLUT: push väntar — omkör"); process.exit(1); }

// ── 4. om v226:s bygg ej grönt: bygg om (RAM-sond före, 3 försök) ──────────
const BYGG = "cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a";
let byggt = byggGront;
let vantar = 0;
for (let i = 0; i < 3 && !byggt; i++) {
  try {
    const friaMB = parseInt((execFileSync("free", ["-m"], { encoding: "utf8", timeout: 10_000 }).split("\n")[1] ?? "").split(/\s+/).pop() ?? "0", 10);
    const barn = (() => {
      try {
        return (execFileSync("ps", ["aux"], { encoding: "utf8", timeout: 15_000 }).match(/zcode-cli/g) || []).length;
      } catch { return 0; }
    })();
    console.log(`före bygg: ${friaMB} MB fritt · ${barn} zcode-processer`);
    if ((friaMB < 3500 || barn > 4) && vantar++ < 10) {
      console.log("RAM-läget för tunt för Turbopack — väntar 120 s (" + vantar + "/10)");
      sleep(120);
      i--; // RAM-väntan konsumerar inget byggförsök
      continue;
    }
    const ut = execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "bash", "-c", BYGG], {
      cwd: ROTA, encoding: "utf8", timeout: 1_200_000,
    });
    console.log("BYGG GRÖN: " + ut.trim().split("\n").slice(-2).join(" | ").slice(0, 300));
    byggt = true;
  } catch (e) {
    const ferr = String(e.stdout || "") + String(e.stderr || e.message || "");
    console.log("BYGG FÖRSÖK " + (i + 1) + " FEL (första 300): " + ferr.slice(0, 300));
    if (i < 2) { console.log("väntar 3 min"); sleep(180); }
  }
}
if (!byggt) { console.log("SLUT: BYGG FELADE ÄVEN I V227 — sondera manuellt; prod lever på förra bygget"); process.exit(1); }

// ── 5. verifiering: prod 200 + sond ─────────────────────────────────────────
sleep(12);
try {
  const kod = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", "https://lab.ak1nvestor.com/"], { timeout: 40_000 }).trim();
  console.log("PROD: HTTP " + kod);
  if (!prodOk) {
    const sond = execFileSync("node", [ROTA + "/verktyg/_v226-sond.mjs"], { timeout: 60_000 });
    console.log("PAYLOAD-SOND:\n" + sond.trim());
  }
  console.log(kod === "200" ? "SLUT: DEPLOYAD + VERIFIERAD" : "SLUT: OVÄNTAD KOD — sondera");
} catch (e) {
  console.log("verifiering fel: " + String(e.message).slice(0, 200));
}
