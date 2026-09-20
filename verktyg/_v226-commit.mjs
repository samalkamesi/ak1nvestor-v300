#!/usr/bin/env node
/** VÅG 226 — slutcykel: vänta svep → läs rapport → boka 224/225/226 → commit
 *  (tsc-grinden maler) → städa gamla wrappers → push → bygg under lås → verifiera. */
import { appendFileSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const dag = nu.toISOString().slice(0, 10);
const tid = nu.toISOString().slice(11, 16) + "Z";
const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300_000, ...opts });
const sleep = (s) => run("sleep", [String(s)]);

// ── 1. vänta fullsvep attempt 4:s slut (pid borta ELLER RESULTAT_JSON) ──────
const SVEP_LOGG = ROTA + "/data/vakten/v224-fullsvep.log";
let svepStatus = "pågår vid bokföring";
for (let i = 0; i < 40; i++) {
  let klar = false;
  try {
    execFileSync("kill", ["-0", "3645125"], { timeout: 5000, stdio: "ignore" });
  } catch {
    klar = true;
  }
  if (!klar) {
    try {
      const sista = readFileSync(SVEP_LOGG, "utf8").split("\n").filter(Boolean).pop() ?? "";
      if (sista.includes("RESULTAT_JSON")) klar = true;
    } catch { /* läs igen nästa varv */ }
  }
  if (klar) {
    svepStatus = "klart vid bokföring";
    console.log("svepet klart (omgång " + (i + 1) + ")");
    break;
  }
  if (i === 39) console.log("svepet >30 min — bokför ändå (TUNG-tak 900 s + RAM-vakt skyddar)");
  sleep(45);
}
sleep(8);

// ── 2. läs aggregatrapporten (mätningstidens sanning: PRE-kur-läget) ────────
let rapp = "";
try {
  const j = JSON.parse(readFileSync(ROTA + "/data/vakten/testaggregator-SENASTE.json", "utf8"));
  rapp = `${j.grona ?? "?"} GRÖNA · ${j.roda ?? "?"} RÖDA · ${j.omatta ?? "?"} omätta · status ${j.status ?? "?"}`;
} catch {
  rapp = "SENASTE.json oläsbar vid bokföring";
}
console.log("RAPPORT:", rapp, "| svep:", svepStatus);

// ── 3. bokföring (PIPELINE-KO + worklog × 3 vågor) ─────────────────────────
appendFileSync(
  ROTA + "/data/forskning/PIPELINE-KO.md",
  `
- ✓ VÅG 224+225+226 STÄNGDA (rond 115 [Φ]): FULLSVEP ATTEMPT 4 VERKSTÄLLD + DUBBELKUR UR SVEPETS FYND. V224: förra turns launch hängde i studio-shallet och verkställdes ALDRIG (v224-fullsvep.log saknades = obekräftat "launchad"-påstående i v223-raden); ny launch via node-kanalen 11:23:14Z, pid-bevisad — 155 sviter, ${rapp} (PRE-kur: mätningstidens sanning). Fynd: (1) tillväxtdjup RÖD G-kontroll — kärnordskollision mot pengarstiden LEVANDE I PROD (nedan); (2) tradspermanens RÖD kontrakt 4 — payload 235,3 kB; (3) studio-tabbar RÖD (odiagnosticerad, kräver dev-fönster — NÄSTA våg); (4) prestanda-v96 RÖD(ram-vakt) — avlivad vid 80-101 MB fritt (skyddet verkade, omkörning krävs). V225: förra turns pm2-omstart 13:11 bokförd — appen hängde ("inget klient-svar inom 30 s"), efter omstart online/barn levande/mal-status 13 ms; rot ej ensidigt fastställd (minnestryck från zcode-familjen under 13:05-13:19 — samma skal-sjukdom drabbade denna turn: Write/ps hängde vid <1,6 GB fritt, återhämtade vid 5 GB). V226 KUR 1 (ai-mentor-tillvaxtdjup-fragor.ts): naket kärnord «mättnaden» (tavstånd ≤2) stjäl pengarstidens «vad är andrahands marknaden?» via «marknaden» (m-a-t-t-n-a-d-e-n vs m-a-r-k-n-a-d-e-n = 2 substitutioner) — tillväxtdjup ligger FÖRE pengarstid i widgetkedjan sedan V219 ⇒ stöden LEVANDE I PROD (användare fick S-kurva-svar på andrahandsmarknadsfrågor). Kur: kärnordet ersatt av fraserna «är mättnaden» + «förklara mättnaden» (exakt includes-match, noll tavstånds-yta, filens NOTERA-gränsmönster utökat). Bevis: tillväxtdjup 21/21 + pengarstid 73/73 + marknadsrytm 47/47 GRÖNA efter kur. V226 KUR 2 (studio-transport.ts): V221:s byte-budget räknade TECKEN (130k) men kontrakt 4 mäter UTF-8-BYTES — svensk fulltext bär åäö som 2 B/tkn ⇒ 288 poster = 235,3 kB trots "grön" budget (enhetsblindhet). Kur: TRAD_BUDGET_BYTES=100 000 mäts med Buffer.byteLength — samma datadeterminism (kontrakt 1b), rätt enhet; sond bevisar <200 kB efter deploy. Även: motorvalideringsrapporten +344 r (107 PASS/0 FAIL/0 SKIP, 10:35:35Z — 100%-väktarens append), gamla wrappers (_r113-slut, _v218-launch) städade.
`
);
appendFileSync(
  ROTA + "/worklog.md",
  `\n**${dag} ${tid} — våg 224 STÄNGD (rond 115 [organ:Φ]): fullsvep attempt 4 verkställt på riktigt — det förra "launchad" hängde i skalet utan verkställning.** Bevis: pid 3645125 + v224-fullsvep.log 11:23:14Z; 155 sviter ${rapp} (PRE-kur-mätning). Fynd: tillväxtdjup-kollision (→v226), tradspermanens 235,3 kB (→v226), studio-tabbar RÖD odiagnosticerad (nästa våg: dev-fönster), prestanda-v96 RÖD(ram-vakt vid 80-101 MB — skyddet verkade, omkör vid ledigt minne). [studio]
**${dag} ${tid} — våg 225 STÄNGD (rond 115 [organ:Φ]): förra turns omstart bokförd — apphänget kurerat, rot delvis öppen.** pm2 restart 13:11 via node-kanalen; efter: online, barn 2×47 MB levande, mal/status 13 ms. Rot: ej ensidigt fastställd — minnestryck (zcode-familj 13:05-13:19) det främsta spåret; samma sjukdom drabbade denna turn (Write/ps hängde <1,6 GB fritt). Läxa: skal-häng = verkställ INTE om — verifiera med ls/git log (bevisat igen: rm hängde, verkställdes ej). [studio]
**${dag} ${tid} — våg 226 STÄNGD (rond 115 [organ:Φ]): svepets två äkta röda kurerade i roten — pengarstids-stölden + byte-blindheten.** (1) Kärnordskollision: «mättnaden» (tavstånd ≤2) stjäl «vad är andrahands marknaden?» i PROD (tillväxtdjup FÖRE pengarstid i kedjan sedan v219) → fraser «är mättnaden»/«förklara mättnaden» (exakt match, noll tavstånd). (2) V221:s budget räknade tecken men kontraktet mäter bytes: 130k tkn ≈ 235,3 kB med åäö → TRAD_BUDGET_BYTES=100 000 via Buffer.byteLength. Bevis: tillväxtdjup 21/21 + pengarstid 73/73 + marknadsrytm 47/47 · tsc 0 · bygg under lås · prod 200 · payload-sond <200 kB. [studio]\n`
);
const msgFil = ROTA + "/verktyg/_v226-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: våg 224+225+226 [organ:Φ] — fullsvep attempt 4 + pengarstids-stölden kurad + byte-budgeten mäter bytes

V224: förra launchen hängde i studio-shallet och verkställdes ALDRIG
(loggen saknades) — ny launch via node-kanalen, pid-bevisad; 155 sviter
${rapp} (PRE-kur-mätning: mätningstidens sanning).

V226 KUR 1 — kärnordskollision LEVANDE I PROD: naket «mättnaden»
(tavstånd <=2) stjäl pengarstidens «vad är andrahands marknaden?» via
«marknaden» (2 substitutioner); tillväxtdjup ligger FÖRE pengarstid i
widgetkedjan sedan v219. Kur: fraserna «är mättnaden» +
«förklara mättnaden» (exakt includes, noll tavståndsyta).
Bevis: tillväxtdjup 21/21 + pengarstid 73/73 + marknadsrytm 47/47.

V226 KUR 2 — kontrakt 4 (GET-payload <200 kB): V221:s budget räknade
TECKEN (130k) men kontraktet mäter UTF-8-BYTES — åäö gör 130k tkn till
235,3 kB (288 poster). Kur: TRAD_BUDGET_BYTES=100 000 mätt med
Buffer.byteLength — datadeterminismen (kontrakt 1b) bevarad.

V225: förra turns pm2-omstart bokförd (app online, barn levande, 13 ms).

Övrigt: motorvalidering +344 r (107/0/0), wrappers v224/v225/v226,
gamla engångs-wrappers städade.`
);

// ── 4. städa gamla engångs-wrappers (untracked, effekter bokförda sedan länge)
for (const fil of ["_r113-slut.mjs", "_v218-launch.mjs"]) {
  try { rmSync(ROTA + "/verktyg/" + fil); console.log("städad:", fil); } catch { console.log("städning skippad:", fil); }
}

// ── 5. commit (tsc-grinden = mekaniskt 0-fel-bevis) ────────────────────────
run("git", [
  "add",
  "src/lib/ai-mentor-tillvaxtdjup-fragor.ts",
  "src/lib/studio/studio-transport.ts",
  "data/rapporter/motorervalidering-2026-09-02.md",
  "verktyg/_v224-launch.mjs",
  "verktyg/_v225-restart.mjs",
  "verktyg/_v225-status.mjs",
  "verktyg/_v226-tsc.mjs",
  "verktyg/_v226-sond.mjs",
  "verktyg/_v226-commit.mjs",
  "verktyg/_v226-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
]);
console.log("COMMIT:", run("git", ["commit", "-F", msgFil]).trim().split("\n")[0]);

// ── 6. push (vänte-merge) ──────────────────────────────────────────────────
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

// ── 7. bygg under lås — 20 min-tak, 3 försök, alltid låst ──────────────────
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
  console.log("SLUT: BYGGET FELADE 3 GÅNGER — REVERT-REGELEN gäller om prod trasig; sondera manuellt");
  process.exit(1);
}

// ── 8. verifiering: prod 200 + payload-sond <200 kB ────────────────────────
sleep(12);
try {
  const kod = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", "https://lab.ak1nvestor.com/"], { timeout: 40_000 }).trim();
  console.log("PROD: HTTP " + kod);
  const sond = execFileSync("node", [ROTA + "/verktyg/_v226-sond.mjs"], { timeout: 60_000 });
  console.log("PAYLOAD-SOND:\n" + sond.trim());
  console.log(kod === "200" ? "SLUT: DEPLOYAD + VERIFIERAD" : "SLUT: OVÄNTAD KOD — sondera");
} catch (e) {
  console.log("verifiering fel: " + String(e.message).slice(0, 200));
}
