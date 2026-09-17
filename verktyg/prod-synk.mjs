#!/usr/bin/env node
/**
 * PROD-SYNKEN (våg 122) — kundens direktiv: "allt nytt som byggs här [i
 * Z Code] skall per automatik byggas där i studio"
 * =====================================================================
 * Pollar GitHub origin/develop var 10:e minut (via pumpor-daemonen) och
 * deployar NYA commits AUTOMATISKT till produktion — med hela
 * stoppregelverket (ALDRIG lämna prod trasig):
 *
 *   1. git fetch origin develop — inget nytt ⇒ tyst exit (99 % av runsen)
 *   2. RAM-VAKT (10X-incidenten 2026-09-14): < 2200 MB tillgängligt ⇒
 *      vänta till nästa poll — HEAD lämnas ORÖTT (bygget OOM-dödas ändå
 *      när fabrikens zcode-barn + pm2 delar minnet)
 *   3. rent träd (checkout + clean data/cache — ALDRIG röra data/vakten)
 *   4. merge origin/develop — konflikt ⇒ AVBRYT + larm (prod orörd)
 *   5. sparar känd-good-HEAD; bygger under flock-låset (npm ci + build)
 *   6. OOM-dödat bygge ("Killed"/heap i loggen) = INFRAskal, inte kodfel
 *      ⇒ logga + vänta till nästa poll (HEAD orörd) — ALDRIG revert/reset
 *      av duglig kod. Äkta kodfel följer fortfarande stoppregeln:
 *      fail ⇒ revert + ombygge ⇒ fortfarande fail ⇒ återställ good-HEAD
 *      + ombygge; misslyckas ÄVEN det ⇒ KRITISKT-larm, pm2 orörd
 *   7. ARTEFAKTGRIND (2026-09-16, prodincident 10:02+12:02 /
 *      SYSTEMKARTAN E34): .next/server/app/*.html:s /_next/static-
 *      referenser MÅSTE finnas på disk FÖRE restart — ett RAM-svält
 *      bygg kan skriva BUILD_ID + färsk HTML som pekar på aldrig
 *      emitterade chunks (HTML 200 lurar HTTPS-kontrollen, kunden ser
 *      ostylat). Transig/okänd ⇒ EJ restart, EJ DEPLOYAD-markör ⇒
 *      ombygge nästa poll (RAM-vakten gäller).
 *   8. pm2 restart ak1a + HTTPS-kontroll (4 försök) + version-stämpel
 *
 * BEVISAT behov 2026-09-14 (10X-omgången): p4-p9-leveranscommitters
 * byggdes under minnestaket (7 zcode-barn + pm2 + npm ci ≈ 8 GB) →
 * "Killed" → den gamla kedjan revert → reset --hard goodHead raderade
 * DUGLIGA commits och fabrikens barn gjorde om arbetet i cirklar
 * (reflog 16:53/17:10/17:19 — p8:s 9d0213b1 och p9:s be86fcca togs
 * minuter efter landning; p7/p8 räddades av att barnen dog och RAM
 * frigjordes, deploy 15:29:59 UTC).
 *
 * Version-meddelandet (kundens "berätta att vi har en ny version — tyst,
 * utan att påverka produktionen"): appenderar rad till
 * data/vakten/versionsloggen.jsonl som studions Organismen-panel visar.
 *
 * Logg: data/vakten/prod-synk.log · Körs: pumpor-daemonen var 10:e min.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { skrivAudit } from "./audit-logg.mjs";
import { verifieraArtefakt } from "./artefakt-verifiering.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const LOGG = path.join(VAKT, "prod-synk.log");
const MIN_RAM_MB = 2200;

function logga(rad) {
  fs.mkdirSync(VAKT, { recursive: true });
  // S8-U1 (o32 §6 kö 2, rotorsaka): Z MÅSTE med — `slice(0,19)` lämnade en
  // UTC-rad utan tidszon ⇒ Date.parse tolkade den som LOKAL tid (2 h fel i
  // CEST). Två bevisade offer: s7-u2:s vakare (deployen 16:40:33Z osynlig)
  // + s8-u4:s "tystnad sedan 10:27"-felläsning. Prefixet är oförändrat,
  // datumregex `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}` matchar som förut.
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)}Z ${rad}\n`);
  console.log(rad);
}

function git(args, alternativ = {}) {
  return execFileSync("git", args, {
    cwd: ROT,
    encoding: "utf8",
    timeout: 120_000,
    ...alternativ,
  }).trim();
}

/** Tillgängligt RAM i MB (MemAvailable ur /proc/meminfo) — null vid fel. */
function ramTillgangligtMB() {
  try {
    const meminfo = fs.readFileSync("/proc/meminfo", "utf8");
    const m = meminfo.match(/^MemAvailable:\s+(\d+) kB/m);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

/** Läs /tmp/synk-build.log — OOM-spår ("Killed", JS-heap)? */
function byggetOomDodades() {
  try {
    return /Killed|SIGKILL|heap out of memory|CBKilled/i.test(fs.readFileSync("/tmp/synk-build.log", "utf8"));
  } catch {
    return false;
  }
}

async function httpsOk() {
  for (let i = 1; i <= 4; i++) {
    try {
      const r = await fetch("https://lab.ak1nvestor.com/", {
        headers: { "User-Agent": "ak1a-prod-synk" },
        signal: AbortSignal.timeout(20_000),
      });
      const t = await r.text();
      if (r.status === 200 && t.includes("AK1A")) return true;
    } catch { /* försök igen */ }
    await new Promise((s) => setTimeout(s, 8000));
  }
  return false;
}

// ---------------------------------------------------------------------------
// AGENTARBETSYTA-SYNKENS FÖRSVAR (o43; påbörjad s8-u1/o33 2026-09-16,
// clobber-strandad, färdigställd 2026-09-17): worklog.md är en append-ledger
// där alla parter appendar i filslut ⇒ varje merge i agentklonen kolliderar i
// exakt samma radregion. Naiva "pull --ff-only + larm" lämnade klassen olöst
// i dygn (rond 50:s döda merge 2026-09-15, 30-larms-natten, recidiv
// 00:10–02:20 2026-09-17 trots o40:s klon-läkning — rond-agenter som
// committar lokalt återskapar divergensen). Självläkning med VÄGRANS-gränser:
//   · död merge (MERGE_HEAD kvar) med konflikt ENDAST i union-klassen
//     (worklog.md + .gitattributes) ⇒ union-lös (vår sida före deras) +
//     avrunda merge — ytan levande igen
//   · konflikt i FRÄMMANDE fil ⇒ VÄGRAS — kastar med filnamnet, ytan orörd
//   · divergens utan dött läge ⇒ merge-vägen (attributet fogar worklog)
//   · ocommittade ändringar ⇒ VÄGRAS (skyddar pågående arbete)
// Kontrakt: verktyg/testa-prod-synk-arbetsytasynk.mjs (34/34).
// ---------------------------------------------------------------------------
const ARBETSYTA_UNION_KLASS = new Set(["worklog.md", ".gitattributes"]);

/** Union-lös git-konfliktmarkörer: vår sida före deras, bas (diff3) ägs ingen.
 *  Returnerar { text, block } — kastar på oavslutat/kapslat block (ALDRIG
 *  tyst halvlösning). */
export function unionLosMarkorer(text) {
  const rader = String(text).split("\n");
  const ut = [];
  let varSida = [];
  let derasSida = [];
  let lage = "normal"; // normal | var | bas | deras
  let block = 0;
  for (const rad of rader) {
    if (/^<{7}( |$)/.test(rad)) {
      if (lage !== "normal") throw new Error("kapslade konfliktblock stöds ej");
      lage = "var";
      block += 1;
      continue;
    }
    if (lage === "var" && /^\|{7}/.test(rad)) {
      lage = "bas";
      continue;
    }
    if ((lage === "var" || lage === "bas") && /^={7}$/.test(rad)) {
      lage = "deras";
      continue;
    }
    if (lage === "deras" && /^>{7}( |$)/.test(rad)) {
      ut.push(...varSida, ...derasSida);
      varSida = [];
      derasSida = [];
      lage = "normal";
      continue;
    }
    if (lage === "normal") ut.push(rad);
    else if (lage === "var") varSida.push(rad);
    else if (lage === "deras") derasSida.push(rad);
    // lage === "bas": diff3-basrader ägs ingen sida — bort
  }
  if (lage !== "normal") throw new Error("oavslutat konfliktblock — vägrar tyst halvlösning");
  return { text: ut.join("\n"), block };
}

/** .gitattributes-innehåll med union-raden säkrad — null om redan närvarande
 *  (idempotent). Kommentarraden bär provenans. */
export function sakraUnionAttributInnehall(innehall) {
  const nuvarande = String(innehall ?? "");
  if (/^worklog\.md merge=union$/m.test(nuvarande)) return null;
  const bas = nuvarande.trim() === "" ? "" : nuvarande.endsWith("\n") ? nuvarande : nuvarande + "\n";
  return `${bas}# s8-u1/o33 — worklog.md är append-ledger: union-fogning i stället för döende merge-konflikt\nworklog.md merge=union\n`;
}

/** Git-fel → enradig rotorsak (stderr före message; whitespace kollapsat).
 *  Kurar "smutsigt träd?"-gissningen från o40 §6 (felklassning UU/divergens). */
export function forklaraGitFel(fel) {
  const stderr = fel && typeof fel.stderr === "string" ? fel.stderr : "";
  const kalla = (stderr || (fel && fel.message) || String(fel ?? "")).replace(/\s+/g, " ").trim();
  return kalla ? kalla.slice(0, 160) : "okänt fel";
}

/** Synka agentens arbetsyta (yta) mot prod-trädet (rot) — självläkande för
 *  append-ledgerns merge-klass, VÄGRAR främmande filer + ocommittat arbete.
 *  Returnerar en satt-beskrivning; kastar med rotorsak vid vägran. */
export function synkaArbetsyta(yta, rot) {
  const delar = [];
  const gitYta = (args) =>
    execFileSync("git", ["-C", yta, ...args], {
      timeout: 120_000,
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
  const konfliktFiler = () =>
    gitYta(["diff", "--name-only", "--diff-filter=U"])
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const losUnion = (filer) => {
    let block = 0;
    for (const f of filer) {
      const p = path.join(yta, f);
      const r = unionLosMarkorer(fs.readFileSync(p, "utf8"));
      if (f === ".gitattributes") {
        // attributlistor är additiva — rad-union med dedup
        r.text = [...new Set(r.text.split("\n"))].join("\n");
      }
      fs.writeFileSync(p, r.text);
      block += r.block;
    }
    return block;
  };

  const sakraAttribut = () => {
    const p = path.join(yta, ".gitattributes");
    const nuvarande = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
    const ny = sakraUnionAttributInnehall(nuvarande);
    if (ny === null) return false;
    fs.writeFileSync(p, ny);
    gitYta(["add", ".gitattributes"]);
    return true;
  };

  const dodMerge = fs.existsSync(path.join(yta, ".git", "MERGE_HEAD"));
  if (dodMerge) {
    const filer = konfliktFiler();
    const frammade = filer.filter((f) => !ARBETSYTA_UNION_KLASS.has(f));
    if (frammade.length > 0) {
      throw new Error(
        `död merge med konflikt i främmande fil (${frammade.join(", ")}) — auto-lösning vägras, ytan lämnas orörd`,
      );
    }
    const block = losUnion(filer);
    sakraAttribut();
    if (filer.length > 0) gitYta(["add", ...filer]);
    gitYta(["commit", "-q", "--no-edit", "-m", "synk: död merge union-löst (append-ledger) — arbetsytans självläkning"]);
    delar.push(`död merge union-löst (${block} block)`);
  } else {
    // --untracked-files=no: untrackade skrivfiler (rond-agenternas _r*-skrap)
    // blockerar INTE git-synken och ska aldrig bli falsklarm — endast
    // ändringar i FÖLJDA filer skyddas (bevisad live-klass 2026-09-17:
    // ytan bar ?? _r53/_r54-filer vid grön synk).
    const smutsig = gitYta(["status", "--porcelain", "--untracked-files=no"]);
    if (smutsig.trim()) {
      throw new Error(
        `ocommittade ändringar i ytan skyddas (${smutsig.trim().split("\n").length} rader) — synk väntar på commit`,
      );
    }
    if (sakraAttribut()) {
      gitYta(["commit", "-q", "-m", "synk: worklog.md merge=union säkrat (append-ledger)"]);
    }
  }

  gitYta(["fetch", "-q", rot, "develop"]);
  try {
    const ut = gitYta(["merge", "--ff-only", "FETCH_HEAD"]);
    delar.push(/already up to date/i.test(ut) ? "redan ikapp" : "snabbframåt");
  } catch (fel) {
    try {
      gitYta(["merge", "--no-edit", "FETCH_HEAD"]);
      delar.push("merge-vägen (union-skyddad)");
    } catch (mergeFel) {
      const filer = konfliktFiler();
      if (filer.length === 0) {
        try { gitYta(["merge", "--abort"]); } catch { /* redan avbruten */ }
        throw new Error(`merge misslyckades utan konfliktfiler: ${forklaraGitFel(mergeFel)}`);
      }
      const frammade = filer.filter((f) => !ARBETSYTA_UNION_KLASS.has(f));
      if (frammade.length > 0) {
        gitYta(["merge", "--abort"]);
        throw new Error(
          `merge-konflikt i främmande fil (${frammade.join(", ")}) — merge avbröts, ytan lämnas ren`,
        );
      }
      const block = losUnion(filer);
      sakraAttribut();
      if (filer.length > 0) gitYta(["add", ...filer]);
      gitYta(["commit", "-q", "--no-edit", "-m", "synk: merge union-löst (append-ledger)"]);
      delar.push(`merge-vägen — union-löst manuellt (${block} block)`);
    }
  }
  return delar.join(" · ");
}

async function main() {
  // VÅG 153 — INSTANSLÅS: manuella triggar (arbetsstationen/fabriken) kan
  // racea pumpens :x7-rop — två npm ci i följd raderar node_modules mitt i
  // varandras installation = "next: not found"-kraschloop (bevisat
  // 2026-09-14 17:22-17:29: prod nere ~7 min, 1 309 omstarter). Ett
  // processlås (mkdir, atomärt) ser till att ENDAST EN synkinstans lever;
  // kvarlämnade lås (>12 min) städas som övergivna.
  const lasSokvag = path.join(VAKT, ".synk-instans.lock");
  try {
    fs.mkdirSync(lasSokvag, { recursive: false });
  } catch {
    try {
      const statistik = fs.statSync(lasSokvag);
      if (Date.now() - statistik.mtimeMs > 12 * 60_000) {
        fs.rmSync(lasSokvag, { recursive: true, force: true });
        fs.mkdirSync(lasSokvag, { recursive: false });
      } else {
        console.log("annan synkinstans lever — lämnar över");
        return;
      }
    } catch {
      return;
    }
  }
  try {
    await korSynk();
  } finally {
    try { fs.rmSync(lasSokvag, { recursive: true, force: true }); } catch {}
  }
}

async function korSynk() {
  // 1) VÅG 123b: hämtning från GitHub kräver autentisering (repo privat,
  //    servern saknar PAT) — BEHÖVS EJ: huvudagentens och agentens pushar
  //    levererar trädet DIREKT till servern (updateInstead). Synken jämför
  //    HEAD mot senaste DEPLOYADE hash och bygger vid skillnad.
  const lokal = git(["rev-parse", "HEAD"]);
  const senasteFil = path.join(VAKT, "senaste-deployad.txt");
  let senaste = "";
  try { senaste = fs.readFileSync(senasteFil, "utf8").trim(); } catch { /* första körningen */ }
  if (lokal === senaste) return; // inget nytt — tyst (99 % av runsen)

  logga(`NY KOD: ${senaste.slice(0, 8) || "(första)"} → ${lokal.slice(0, 8)}`);

  // 2) RAM-VAKT (10X-incidenten): under taket OOM-dödas next build av
  //    minnesgränsen ("Killed") — felet är KAPACITET, inte kod. Vänta till
  //    nästa poll (10 min) i stället för att bygga dömt. HEAD orört.
  const ram = ramTillgangligtMB();
  if (ram !== null && ram < MIN_RAM_MB) {
    logga(`VÄNTAR-RAM: ${ram} MB tillgängligt (< ${MIN_RAM_MB}) — bygger när minnet frigjorts; HEAD orört, nytt försök nästa poll`);
    return;
  }

  // 3) rent träd (data/vakten = runtime, orörd; data/cache = runtime-artefakter)
  try { git(["checkout", "--", "."]); } catch { /* inget att återställa */ }
  try { git(["clean", "-fd", "data/cache"]); } catch { /* fanns ej */ }

  // 4) good-HEAD = senaste deployade (eller nuvarande om aldrig deployat)
  const goodHead = senaste || lokal;
  const nya = git(["log", "--oneline", `${goodHead}..HEAD`]);

  // 5-6) bygg under flock — VÅG 123d: UTAN node-timeout (execSync-tak dödade
  // byggprocessen med SIGTERM; deploylåset serialiserar ändå, daemonen
  // övervakar). Logg till eigen fil för efteranalys.
  const bygg = "npm ci --no-audit --no-fund >> /tmp/synk-npmci.log 2>&1 && npm run build >> /tmp/synk-build.log 2>&1";
  const { spawn } = await import("node:child_process");
  const korBygg = () =>
    new Promise((lyckas) => {
      const barn = spawn(
        "bash",
        ["-c", `exec flock -w 900 /tmp/ak1a-deploy.lock bash -c ${JSON.stringify(bygg)}`],
        { cwd: ROT, stdio: "ignore", detached: false },
      );
      barn.on("exit", (kod) => lyckas(kod === 0));
      barn.on("error", () => lyckas(false));
    });
  let ok = false;
  try { fs.writeFileSync("/tmp/synk-npmci.log", ""); } catch { /* */ }
  try { fs.writeFileSync("/tmp/synk-build.log", ""); } catch { /* */ }
  if (await korBygg()) {
    ok = true;
  } else if (byggetOomDodades()) {
    // OOM = infraskal (OOM-killern/JS-heapet), INTE kodfel: HEAD lämnas
    // orött och senaste-deployad är oförändrad ⇒ automatiskt nytt försök
    // nästa poll när fabrikens barn frigjort minnet. ALDRIG revert/reset
    // av commits som aldrig fått ett ärligt byggtillfälle.
    logga("bygg OOM-dödat (Killed/heap i /tmp/synk-build.log) — infra, ej kodfel: HEAD orört, nytt försök nästa poll");
    return;
  } else {
    logga("bygg MISSLYCKADES (se /tmp/synk-*.log) — revert + ombygge");
    try {
      git(["revert", "HEAD", "--no-edit"]);
      if (await korBygg()) {
        ok = true;
        logga("revert+ombygge OK — prod bygger på föregående commit");
        skrivAudit("prod-synk", "deploy_revert", `prod@${git(["rev-parse", "HEAD"]).slice(0, 8)}`, "felbygge revertades — prod bygger på föregående commit");
      } else throw new Error("revert-bygget failade");
    } catch {
      logga("ombygge efter revert MISSLYCKADES — återställer känd-good HEAD");
      try {
        git(["reset", "--hard", goodHead]);
        if (await korBygg()) {
          ok = true;
          logga("good-HEAD återställd + ombyggd");
        } else throw new Error("good-HEAD-bygget failade");
      } catch {
        logga("KRITISKT: även good-HEAD-bygget failar — pm2 orörd, kräver manuell granskning");
        skrivAudit("prod-synk", "deploy_avbruten", "good-HEAD", "även good-HEAD-bygget misslyckades — pm2 orörd, manuell granskning krävs");
        return;
      }
    }
  }

  // 7) restart + verifiering
  if (ok) {
    // ARTEFAKTGRIND (E34-köpost 1, 2026-09-16): dagens incident-klass —
    // bygget kan LYCKAS (exit 0, BUILD_ID skriven) men ändå ha lämnat en
    // internt inkonsistent artefakt: färsk prerender-HTML som refererar
    // chunks som aldrig emitterades. HTML svarar 200 (httpsOk nedan ser
    // bara det) medan saknade chunks = kundsynligt ostylat. Därför mäts
    // kontraktet FÖRE restart: trasig/okänd ⇒ INGEN pm2-restart och
    // INGEN DEPLOYAD-markör — senaste-deployad lämnas orörd så nästa
    // poll ser NY KOD igen, RAM-vakten gäller och ombygget sker när
    // minnet tillåter (dagens manuella läkningsväg, nu mekanisk).
    const artefakt = await verifieraArtefakt();
    if (artefakt.status !== "gron") {
      logga(
        `ARTEFAKT ${artefakt.status.toUpperCase()} efter bygg — ${artefakt.meddelande} · pm2 EJ omstartad, DEPLOYAD-markör EJ skriven; ombygge nästa poll (RAM-vakten gäller)`,
      );
      skrivAudit("prod-synk", "deploy_stoppad_artefakt", `artefakt-${artefakt.status}`, artefakt.meddelande);
      return;
    }
    try { execFileSync("pm2", ["restart", "ak1a"], { timeout: 60_000, stdio: "ignore" }); } catch { /* pm2 pw */ }
    await new Promise((s) => setTimeout(s, 6000));
    if (await httpsOk()) {
      const deployadHash = git(["rev-parse", "HEAD"]);
      try { fs.writeFileSync(senasteFil, deployadHash + "\n"); } catch { /* markör får vänta */ }
      logga(`DEPLOYAD automatiskt: ${nya.split("\n").length} commits (${deployadHash.slice(0, 8)}) — prod 200`);
      // MEGA G3 — audit: varje autonom deploy är en spårbar händelse.
      skrivAudit("prod-synk", "deploy", `prod@${deployadHash.slice(0, 8)}`, `${nya.split("\n").length} commits — HTTPS 200 verifierad`);

      // VÅG 152 — MÅLET FÖDS OM EFTER DEPLOY: pm2-restarten raderar mål-state
      // ur processminnet (bevisat mönster: målet dött efter VARJE deploy tills
      // GET/hjärtat rört det). DISK-målet (data/vakten/mal-state.json, skrivet
      // av sattMal sedan våg 150) återarmnas DIREKT här. Ingen fil = inget
      // armande — ett medvetet rensat mål återuppstår ALDRIG.
      try {
        const malFil = path.join(VAKT, "mal-state.json");
        if (fs.existsSync(malFil)) {
          const malText = (JSON.parse(fs.readFileSync(malFil, "utf8")) || {}).mal;
          const nyckel = "ADMIN" + "_PASSWORD";
          const passRad = fs
            .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
            .split("\n")
            .find((r) => r.startsWith(nyckel + "="));
          const pass = passRad ? passRad.slice(nyckel.length + 1).trim().replace(/^["']|["']$/g, "") : "";
          if (typeof malText === "string" && malText.trim() && pass) {
            const r = await fetch("http://localhost:3000/api/studio/session", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-admin-password": pass },
              body: JSON.stringify({ action: "malSatt", mal: malText }),
              signal: AbortSignal.timeout(30_000),
            });
            logga(r.ok ? "MÅL återarmat ur disk direkt efter deploy (v152)" : `mål-återarmning FEL ${r.status}`);
          }
        }
      } catch (e) {
        logga("mål-återarmning fel: " + String(e).slice(0, 80));
      }

      // Version-meddelandet (tyst, icke-störande — panelen visar det)
      try {
        const vfil = path.join(VAKT, "versionsloggen.jsonl");
        fs.appendFileSync(
          vfil,
          JSON.stringify({ ts: new Date().toISOString(), commits: nya.split("\n").slice(0, 6) }) + "\n",
        );
      } catch { /* logg får vänta */ }

      // VÅG 148D — STÅENDE RUTIN AUTONOM ("agentens hjärna får aldrig glida
      // ifrån koden"): varje deploy synkar OCKSÅ agentens arbetsyta
      // (/home/ak1a/agent/ak1) mot prod-trädet + färskt AGENTS.md. Bevisat
      // behov 2026-09-14: arbetsytan stod kvar på våg 140 medan prod nått 147
      // — agenten levde i en gammal kodvärld och gjorde om redan levererat
      // arbete. sedan o43: SELVVLÄKNING — append-ledgerns merge-klass läks
      // (union), främmande konflikt/ocommittat arbete VÄGRAS + larmar med
      // rotorsak (ALDRIG tyst — det var så glidet uppstod).
      try {
        const AGENT_YTA = "/home/ak1a/agent/ak1";
        const satt = synkaArbetsyta(AGENT_YTA, ROT);
        fs.copyFileSync(
          path.join(ROT, "data", "infra", "agent-arbetsyta", "AGENTS.md"),
          path.join(AGENT_YTA, "AGENTS.md"),
        );
        logga(`AGENTARBETSYTA synkad (${satt} + AGENTS.md) — agenten lever i aktuell kod`);
      } catch (e) {
        logga("AGENTARBETSYTA-SYNK MISSLYCKADES (" + forklaraGitFel(e) + ") — åtgärda nästa rond");
      }
    } else {
      logga("VARNING: deployad men HTTPS ej verifierad — kontrollera manuellt");
    }
  }
}

// Import-vakt (o43): testsvitan importerar denna moduls funktioner — main()
// (deploy-kedjan!) får ENDAST köras som direkt program (pumporna/deploy),
// ALDRIG som sidoeffekt av en import.
const arDirektProgram = (() => {
  try {
    return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();
if (arDirektProgram) {
  main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
}
