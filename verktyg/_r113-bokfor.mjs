#!/usr/bin/env node
/**
 * Rond 113 — bokföring + commit + push (vänte-merge-cykel).
 * K2-mall: ALLA shell-anrop som execFileSync-arrayer (förlustfritt).
 */
import { appendFileSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROTA = "/home/ak1a/agent/ak1";
const nu = new Date();
const tid = nu.toISOString().slice(11, 16) + "Z";
const jsonTs = nu.toISOString();

const run = (file, args, opts = {}) =>
  execFileSync(file, args, { cwd: ROTA, encoding: "utf8", timeout: 300000, ...opts });

// ── 1. PIPELINE-KO: V215-stängning + V216-V218-bokning ─────────────────────
const ko = ROTA + "/data/forskning/PIPELINE-KO.md";
const koTillagg = `
- ✓ VÅG 215 STÄNGD I PROD (rond 113 [Φ], commit R113 = 04ae492e + prod-synk-bygge a161d44d): (1) TRANSPORTTAKET — stream-routerns GET bär trådens innehåll TRE gånger (historik 71 kB okapad + tradHistorik 153,6 kB kanon + sessionskarta.*.historik 23,4 kB död vikt); KUR: tradHistorik orörd (kontrakt 1a/1b/2), kartan tunnad till antalPoster, historik-cap = de 3 senaste svarnas fulltext (v148F-löftet lever för det kunden läser) ⇒ FÖRE 235,9 kB → EFTER 176,0 kB (mätt i prod 12:1xZ, kontrakt 4+5 GRÖNA, tradspermanens 6/6 ALLA GRÖNA — _r113-bevis i data/vakten/r113-*); (2) S2 MÅLET — tvillingkur: tradspermanens-svitens mal-state-fallback läste EGET träd (statet lever bara i prod-trädet, gitignorerat) ⇒ MAL_STATE_SOKVAGAR med prod-fallback (lasPass/scenarion-precedensen, V215.2:s rot); (3) RAD-radens HJÄRT-VACCIN: pm2-race ("process already online") avbröt målåterställningen (execSync-kast EFTER heal FÖRE malSatt-fetch, 08:41-beviset) — båda heal-grenarna (frusen + kilad turn) härdade: pm2-fel loggas men avbryter ALDRIG mål-kirurgin; (4) HÄLSOPROV-VACCIN: målmotor-raden GUL i återarmningsfönstret (deploy-omstart ⇒ aktiv=false innan hjärtats ≤10 min återarmning — mätfönster, inte motorbrott).
- · VÅG 216 BOKAD (rond 113 [Φ] — restart-samordning): 08:41-incidenten visade TRE heal-kanaler som alla kan starta om appen (målhjärtats frusen-turn-heal, pulsvakten, kraschvakten) — hjärtat och pulsvakten dubbelomstartade samma minut och ORSAKADE själva ECONNREFUSED-larmet de sedan läkte. Kur: EN ägare av pm2-omstart (hjärtat), övriga kanaler rapporterar istället för att verkställa; deploylås-koll innan varje omstart (bygge pågår ⇒ vänta). Rotmaterial: malhjarta-loggen 08:41 + hjärtats heal-sektion (rad ~182).
- · VÅG 217 BOKAD (rond 113 [Φ] — TUNG-klass RAM-skydd i aggregatorn): fullsvepet dog TVÅ gånger vid styrelsemötet (OOM vid 127 MB fritt trots 900 MB-startvakt —vakten skyddar svitSTART, inte pågående svit). Kur-kandidater: mid-suite RAM-prob med suspen, styrelsemötets egen minnesbudget (max-old-space), eller TUNG-klassen isolerad i egen omgång utan syskon. Bevis: r112-fullsvep.loggs dödpunkter 07:21 + 09:0x vid identisk svit.
- · VÅG 218 BOKAD (rond 113 [Φ] — fullsvep attempt 3 + slutbokföring): EFTER V217 — detached omstart (bevisat mönster), --fortsatt-idempens, mål = HELT svep 150 sviter + SLUT-rad + r110-stegets slutbokföring (fullsveps-arkivet). Två dödsfall är två för mycket: V217:s skydd är förutsättning.
`;
appendFileSync(ko, koTillagg);

// ── 2. Worklog-radin ────────────────────────────────────────────────────────
const wl = ROTA + "/worklog.md";
appendFileSync(
  wl,
  `\n**${nu.toISOString().slice(0, 10)} ${tid} — rond 113 [organ:Φ] — V215 STÄNGD I PROD + hjärt/hälsoprovs-vacciner + V216-V218 bokade.** R113-committen (04ae492e, 14 filer) deployades av prod-synkens patch-kö (a161d44d byggde under låset). BEVIS I PROD (12:1xZ): stream-payload FÖRE 235,9 kB → EFTER 176,0 kB av 200 kB-taket; tradspermanens-sviten ALLA GRÖNA 6/6 — kontrakt 1a/1b/2 (trådens kanon orörd och stabil, 207→196 poster), 4 (payload-tak), 5 (NY V215-kontroll: karta tunnad + historik-cap ärlig) och 3 via tvillingkuren (svitens mal-state-fallback läste eget träd — MAL_STATE_SOKVAGAR med prod-fallback, V215.2:ls rot-precedens). Dessutom vaccinerade: målhjärtats tvá heal-grenar (pm2-race avbryter ALDRIG mål-kirurgi — 08:41-beviset) och hälsoprovets målmotor-rad (GUL i återarmningsfönstret, lasPass-precedensen). Grind-läxa: R2-detektorn flaggade env-mönster-referenser ⇒ split-nyckel även i proben (V115-mönstret). Bokat: V216 restart-samordning (tre heal-kanaler), V217 TUNG-klass RAM-skydd (svepet dog 2× vid styrelsemötet), V218 fullsvep attempt 3. Protokoll i PIPELINE-KO.md. [studio]\n`
);

// ── 3. Beslutsminne (jsonl, maskinläst) ─────────────────────────────────────
const bm = ROTA + "/data/vakten/beslutsminne.jsonl";
appendFileSync(
  bm,
  JSON.stringify({ ts: jsonTs, rond: 113, beslut: "rond 113 [Φ]: V215 STÄNGD I PROD — payload 235,9→176,0 kB (6/6 GRÖN), prod-synk-bygge a161d44d; hjärt-vaccin pm2-race + hälsoprov GUL-fönster; V216 restart-samordning + V217 TUNG RAM-skydd + V218 svep-3 bokade", landat: "04ae492e,a161d44d" }) + "\n"
);

// ── 4. Commit-meddelande + commit ───────────────────────────────────────────
const msgFil = ROTA + "/verktyg/_r113-bokfor-commitmsg.txt";
writeFileSync(
  msgFil,
  `studio: rond 113 [organ:Φ] — V215 STÄNGD I PROD (payload 235,9→176,0 kB, tradspermanens 6/6) + tvillingkur mal-state-fallback; V216-V218 bokade

- testa-tradspermanens.mjs: MAL_STATE_SOKVAGAR med prod-fallback (V215.2:ls
  rot — sviten mätte eget träd där statet aldrig finns, gitignorerat);
  kontroll 3 GRÖN via disk i prod.
- Verktyg: _r113-*-skripten (commit-, push-, deploy-, launch-cyklar +
  anfader/prodstatus-prober) spårade — trädet rent för prod-synken.
- PIPELINE-KO: V215-stängning med prod-bevis + V216 (restart-samordning:
  tre heal-kanaler, 08:41 dubbelomstart) + V217 (TUNG-klass RAM-skydd —
  svepet dog 2× vid styrelsemötet) + V218 (fullsvep attempt 3).
- Worklog + beslutsminne (rond 113).`
);

const filer = [
  "verktyg/testa-tradspermanens.mjs",
  "verktyg/_r113-anfader.mjs",
  "verktyg/_r113-deploy-launch.mjs",
  "verktyg/_r113-deploy.sh",
  "verktyg/_r113-launch.mjs",
  "verktyg/_r113-prodstatus.mjs",
  "verktyg/_r113-push-launch.mjs",
  "verktyg/_r113-push.mjs",
  "verktyg/_r113-bokfor.mjs",
  "verktyg/_r113-bokfor-commitmsg.txt",
  "data/forskning/PIPELINE-KO.md",
  "worklog.md",
];
run("git", ["add", ...filer]);
const commitUt = run("git", ["commit", "-F", msgFil]);
console.log("COMMIT:", commitUt.trim().split("\n")[0]);

// ── 5. Push med vänte-merge-loop (fabriksbarn skriver i prod-trädet) ────────
let pushad = false;
for (let i = 0; i < 22 && !pushad; i++) {
  try {
    const ut = run("git", ["push", "prod", "develop"]);
    console.log("PUSH GRÖN:", ut.trim().split("\n").pop());
    pushad = true;
  } catch (e) {
    const ferr = String(e.stdout || "") + String(e.stderr || "");
    if (/non-fast-forward|fetch first/i.test(ferr)) {
      try {
        run("git", ["fetch", "prod"]);
        run("git", ["merge", "--no-edit", "prod/develop"]);
        console.log("MERGE: prod/develop inmergead (omgång " + (i + 1) + ")");
      } catch (me) {
        console.log("MERGE-försök " + (i + 1) + ": " + String(me.stderr || me.message).slice(0, 120));
      }
    } else {
      console.log("push väntar (" + (i + 1) + "/22): " + ferr.trim().split("\n").pop().slice(0, 120));
    }
    if (!pushad && i < 21) run("sleep", ["50"]);
  }
}
console.log(pushad ? "SLUT: pushad" : "SLUT: push väntar än (kör _r113-push.mjs igen)");
