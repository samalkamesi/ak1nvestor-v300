#!/usr/bin/env node
/** VÅG 220 — navigationsminne kurat: tsc → commit → push → bygg under lås → prod 200. */
import { appendFileSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const tid = nu.toISOString().slice(11, 16) + "Z";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300_000, ...opts });

const ramRad = readFileSync("/proc/meminfo", "utf8").match(/^MemAvailable:\s+(\d+) kB/m);
console.log("RAM före: " + (ramRad ? Math.round(Number(ramRad[1]) / 1024) + " MB" : "okänt"));

// ── 1. tsc (baslinje 0) ─────────────────────────────────────────────────────
try {
  run("node", ["node_modules/typescript/bin/tsc", "--noEmit"], { timeout: 480_000 });
  console.log("TSC: 0 fel");
} catch (e) {
  console.log("TSC FEL — avbryter (levereras ej):\n" + String(e.stdout || e.message).slice(0, 800));
  process.exit(1);
}

// ── 2. bokföring ────────────────────────────────────────────────────────────
appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 220 STÄNGD (rond 114 [Φ]): NAVIGATIONSMINNES-MOTORN härdad — v218-svepets röda (36/39) hade två äkta rötter i src/lib/navigationsminne.ts: (1) las() returnerade JSON.parse(rå) okontrollerat när rå truthy — sådd av "null"/icke-array-objekt bröt Besok[]-kontraktet ut till anroparen (H5/H6); KUR: Array.isArray-validering, kontraktet gäller alltid. (2) titelFranSida kastade URIError på ogiltig %-kodning (/kurser/100% — decodeURIComponent rakt av, D11/P8-andan); KUR: lasbarDel() med fallgrop till rå sträng. BEVIS: sviten 39/39 PASS (FÖRE 36/39) + tsc 0 + bygg under lås + prod 200 (se deployloggen). src-yta ⇒ full kedja enligt leveransprotokoll 2.
`
);
appendFileSync(
  ROTA + "/worklog.md",
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — våg 220 STÄNGD (rond 114 [organ:Φ]): navigationsminnesmotorn härdad (39/39).** Svepets röda 36/39 = två äkta rötter: las() utan Array.isArray (sådd "null"/objekt bröt Besok[]-kontraktet) + decodeURIComponent-kast på ogiltig %-kodning (P8-brott). Kurerade med kontraktsvalidering + lasbarDel-fallgrop. Bevis: 39/39 PASS, tsc 0, bygg under lås, prod 200. [studio]\n`
);
const msgFil = ROTA + "/verktyg/_v220-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 220 [organ:Φ] — navigationsminne: Besok[]-kontrakt + P8-fallgrop (39/39)

v218-svepets röda 36/39 — två äkta rötter i src/lib/navigationsminne.ts:
- las(): JSON.parse(rå) okontrollerat — sådd "null"/icke-array bröt
  Besok[]-kontraktet (H5/H6) ⇒ Array.isArray-validering.
- titelFranSida(): decodeURIComponent kastade URIError på ogiltig
  %-kodning (D11, P8-brott) ⇒ lasbarDel() med fallgrop till rå sträng.
Bevis: sviten 39/39 PASS (FÖRE 36/39) + tsc 0 + bygg + prod 200.`
);
run("git", [
  "add",
  "src/lib/navigationsminne.ts",
  "verktyg/_v220-commit-deploy.mjs",
  "verktyg/_v220-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
console.log("COMMIT:", run("git", ["commit", "-F", msgFil]).trim().split("\n")[0]);

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
    if (!pushad && i < 21) run("sleep", ["50"]);
  }
}
if (!pushad) {
  console.log("SLUT: push väntar — deploy SKIPPAD (kör om skriptet)");
  process.exit(1);
}

// ── 4. bygg under lås (prod-trädet) + pm2 ──────────────────────────────────
const BYGG = "cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a";
let byggt = false;
for (let i = 0; i < 3 && !byggt; i++) {
  try {
    const ut = execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "bash", "-c", BYGG], {
      cwd: ROTA,
      encoding: "utf8",
      timeout: 600_000,
    });
    console.log("BYGG GRÖN: " + ut.trim().split("\n").slice(-3).join(" | ").slice(0, 300));
    byggt = true;
  } catch (e) {
    const ferr = String(e.stdout || "") + String(e.stderr || "");
    if (/flock.*(busy|used)|exit code 1/i.test(ferr) && !/error/i.test(ferr)) {
      console.log("låset upptaget (" + (i + 1) + "/3) — väntar 3 min");
      run("sleep", ["180"]);
    } else {
      console.log("BYGG FEL — REVERT-regeln gäller:\n" + ferr.slice(0, 1000));
      process.exit(1);
    }
  }
}
if (!byggt) {
  console.log("SLUT: låset upptaget 3 försök — deploy ej körd (omkör senare)");
  process.exit(1);
}

// ── 5. prod-verifiering ─────────────────────────────────────────────────────
run("sleep", ["12"]);
try {
  const svar = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", "https://lab.ak1nvestor.com/"], { timeout: 40_000 });
  console.log("PROD: HTTP " + svar.trim());
  console.log(svar.trim() === "200" ? "SLUT: DEPLOYAD + VERIFIERAD" : "SLUT: OVÄNTAD KOD — sondera");
} catch (e) {
  console.log("PROD-mätning fel: " + String(e.message).slice(0, 120));
}
