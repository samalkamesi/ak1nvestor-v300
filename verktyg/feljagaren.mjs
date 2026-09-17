#!/usr/bin/env node
/**
 * FELJÄGAREN (våg 167 — MEGA-systemet som söker fel i ALLT)
 * =====================================================================
 * Kunddirektiv: "Mega system som söker efter fel i olika system och
 * processer rättar utvecklar gör R&D — super seriöst med naturlagar."
 *
 * Sju jaktspår (varje spår: letar → hittar → bokför → flaggar för verkställning):
 *   F1 KOD:        tsc-fel, syntax-fel i verktyg (node --check)
 *   F2 PROCESSER:  pm2-status (online? restarts > tröskel?), zombie-barn
 *   F3 API:        alla /api/studio/* ändpunkter — HTTP-kod != 200
 *   F4 DATA:       register-konsistens (huvudtrad, mal-state, automations,
 *                  borta-banner: JSON giltigt? sessioner = sess_* prefix?)
 *   F5 LOGGAR:     senaste raderna i hjärtat/kraschvakten/evighetsmotorn —
 *                  FEL/krasch/tidsgräns-mönster
 *   F6 DRIFT:      prod 200? RAM? disk? (MemAvailable, df)
 *   F7 SECURITY:   .env-filer i git? nycklar i loggar? (grep-mönster)
 *
 * Körs: pumpor var 15:e minut (min % 15 === 12).
 * FYND ⇒ data/vakten/feljakt-fynd.jsonl + stdout [FELJÄGT ...].
 * Ren jakt ⇒ EN grön rad. Exit 0 alltid.
 * DEPLOYFÖNSTER (rond 44): medan flock /tmp/ak1a-deploy.lock hålls (prodbygg
 * pågår) klassas F3/F6-fel som MEDEL "väntat fönster" — appen är av deployen
 * väntat nere/omstartande (npm ci bygger om node_modules under levande pm2);
 * äkta fel utan aktivt bygg förblir HÖG. Fjärde falsklarmet i familjen
 * (rond 33/39/40/44) kurat i roten.
 * OMTESTFÖNSTER (rond 50, sjätte familjeobservationen): nätverksfel UTAN
 * aktivt bygg kan vara ett omstart-/lastspikfönster (09:13 UTC: /session
 * timeout 3 min efter pm2-omstart under RAM-svält 503 MB — självläkt på 41 ms
 * minuter senare). F3:nätverksfel omtestas ETT gången efter 20 s: svarar
 * endpointen då → MEDEL "övergående, självläkt vid omtest"; fortfarande död
 * → HÖG och resterande nätverksfel passeras utan omtest (snabbt genomlopp
 * vid äkta haveri).
 * LAGAR: Lag 1 (bevis i varje rad), Lag 3 (bokför), Lag 6 (fel = lärdom).
 */
import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const FYND = path.join(VAKT, "feljakt-fynd.jsonl");
const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";

function lasPass() {
  try {
    const rad = fs
      .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
      .split("\n")
      .find((r) => r.startsWith(NYCKELN + "="));
    return rad ? rad.slice(NYCKELN.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch { return ""; }
}

function bokfor(spår, allvar, fynd, bevis) {
  const rad = JSON.stringify({ ts: new Date().toISOString(), spår, allvar, fynd, bevis });
  try {
    fs.mkdirSync(VAKT, { recursive: true });
    fs.appendFileSync(FYND, rad + "\n");
  } catch { /* */ }
  console.log(`[FELJÄGT ${allvar}] ${spår}: ${fynd} — ${bevis}`);
}

function gron(spår, not) { console.log(`[FELJÄGT GRÖN] ${spår}: ${not}`); }

// Deploybyggen (prod-synk.mjs "flock -w 900", deploya-contabo.sh "flock -n")
// håller låset under hela npm ci + build + pm2 restart — i det fönstret är
// appen väntat osvarande. Feljägten ska larma HÖG endast utan aktivt bygg.
function deployPagar() {
  try {
    execSync("flock -n /tmp/ak1a-deploy.lock true", { timeout: 5000, encoding: "utf8" });
    return false;                          // låset togs → inget bygg pågår
  } catch (e) { return e.status === 1; }   // exit 1 = hålls av bygg; övrigt = ej deploy
}

// ── F1: KOD ─────────────────────────────────────────────────────────────────
function jagaKod() {
  // tsc är tungt (2+ min) — kör ENDAST om src/ ändrats sedan senaste jakt
  const tscMarkor = path.join(VAKT, ".feljakt-tsc-stamp");
  const senaste = fs.existsSync(tscMarkor) ? fs.readFileSync(tscMarkor, "utf8").trim() : "";
  let srcAndrad = false;
  let gitTopp = "";
  try {
    gitTopp = execSync("git log -1 --format=%H -- src/", { cwd: ROT, timeout: 15_000, encoding: "utf8" }).trim();
    srcAndrad = gitTopp !== senaste;
  } catch { srcAndrad = true; }
  // Verktyg: node --check på samtliga — skalfri arrayform (o21); körs ALLTID:
  // blocket låg tidigare EFTER src-hoppar-returnen = tyst död (krävde att
  // src/ samtidigt ändrats); head-40-taket borttaget samtidigt — verktyg/
  // har 117 filer, taket lämnade 77 okontrollerade medan gröna raden
  // lurade "40 syntax-OK".
  try {
    const filer = execFileSync("find", ["verktyg", "-name", "*.mjs"], { cwd: ROT, timeout: 15_000, encoding: "utf8" }).trim().split("\n").filter(Boolean);
    let trasiga = 0;
    for (const f of filer) {
      try { execFileSync(process.execPath, ["--check", f], { cwd: ROT, timeout: 10_000, stdio: "pipe" }); }
      catch (e) {
        // Diagnosåtskillnad (o21): timeout vid systemlast är INTE syntaxfel —
        // första alltid-på-körningen felmärkte en lasttimeout som syntaxfel
        // (filen ren vid omkolla, fyndet aldrig reproducerat).
        const timeout = Boolean(e && (e.killed || e.signal === "SIGTERM" || e.code === "ETIMEDOUT"));
        if (timeout) {
          bokfor("F1-kod", "MEDEL", `okontrollerad (timeout): ${f}`, "node --check hann inte inom 10 s — lastrelaterat, omkollas nästa jakt");
        } else {
          trasiga++;
          bokfor("F1-kod", "MEDEL", `syntaxfel: ${f}`, "node --check misslyckades");
        }
      }
    }
    if (trasiga === 0) gron("F1-kod", `${filer.length} verktyg syntax-OK`);
  } catch { /* finder misslyckades */}
  if (!srcAndrad) { gron("F1-kod", "src/ oändrad sedan senaste tsc — hoppar"); return; }
  // r39-vaccin (2026-09-15): mät ALDRIG tsc under deployfönstret — npm ci
  // river node_modules partiellt och transitiva @types (recharts d3-paket)
  // försvinner minutvis ⇒ falska TS2688 (bevis: F1 20:27:21Z, bygg slut
  // 20:39:22Z, grönt vid ommätning). Alla byggvägar håller deploylåset.
  try {
    execSync("flock -n /tmp/ak1a-deploy.lock -c true", { timeout: 5_000, stdio: "pipe" });
  } catch {
    gron("F1-kod", "hoppar — deployfönster aktivt (npm ci river node_modules)");
    return;
  }
  try {
    // s8-determinism (2026-09-15, syskonmönstret ur pre-commit): projektets
    // EGEN tsc-binär, ALDRIG npx — mitt i ett deployfönster (npm ci river
    // node_modules) kan npx lösa "tsc" till cachens dummy tsc@2.0.4 som
    // alltid svarar grönt (falsk F1-grön). Saknad binär ⇒ "Cannot find
    // module" blir F1-fynd i stället för tystnad.
    const korTsc = () => execSync("node node_modules/typescript/bin/tsc --noEmit 2>&1 | head -5", { cwd: ROT, timeout: 300_000, encoding: "utf8" }).trim();
    let fel = korTsc();
    if (fel && !fel.includes("0") && /^error TS(2688|2307)/m.test(fel)) {
      // TS2688/TS2307 = race-signatur för partiell node_modules (npm ci hann
      // mitt i trots låsproben): en andra chans efter väntan — kvarstår
      // felet är det äkta och bokförs HÖG nedan som vanligt.
      execSync("sleep 75", { timeout: 90_000 });
      fel = korTsc();
    }
    if (fel && !fel.includes("0")) {
      bokfor("F1-kod", "HÖG", `tsc: ${fel.split("\n").length} fel`, fel.slice(0, 200));
    } else {
      gron("F1-kod", `tsc 0 fel (commit ${senaste.slice(0, 8)}→${gitTopp?.slice(0, 8) || "?"})`);
      try { fs.writeFileSync(tscMarkor, gitTopp || ""); } catch {}
    }
  } catch (e) {
    bokfor("F1-kod", "HÖG", "tsc kraschade", String(e).slice(0, 120));
  }
}

// ── F2: PROCESSER ────────────────────────────────────────────────────────────
function jagaProcesser() {
  try {
    const lista = JSON.parse(execSync("pm2 jlist", { timeout: 15_000, encoding: "utf8" }));
    for (const p of lista) {
      if (p.pm2_env?.status !== "online") {
        bokfor("F2-process", "HÖG", `${p.name} = ${p.pm2_env?.status}`, `restarts: ${p.pm2_env?.restart_time}`);
      }
    }
    const onlines = lista.filter((p) => p.pm2_env?.status === "online").length;
    if (onlines === lista.length) gron("F2-process", `${onlines}/${lista.length} pm2-processer online`);
    // Zombie-zcode (mv. många barn = RAM-risk)
    const zcode = execSync("pgrep -c zcode || echo 0", { timeout: 10_000, encoding: "utf8" }).trim();
    if (parseInt(zcode) > 40) {
      bokfor("F2-process", "MEDEL", `${zcode} zcode-barn (RAM-risk)`, `pgrep -c zcode`);
    }
  } catch (e) { bokfor("F2-process", "MEDEL", "pm2 jlist misslyckades", String(e).slice(0, 80)); }
}

// ── F3: API ──────────────────────────────────────────────────────────────────
async function jagaApi(pass) {
  const andpunkter = [
    "puls", "halsa", "modeller", "fardigheter", "filer", "minne",
    "anvandning", "andringar", "interaktion", "subagenter", "audit",
    "godkannande", "maskin", "mal/status", "session", "uppladdning",
    "tjanster/automation", "tjanster/bakgrund",
  ];
  let fel = 0;
  const deploy = deployPagar();
  // Rond 50: server som nätverksfelar utan bygg omtestas en gång — svarar den
  // efter 20 s var fyndet övergående (MEDEL), annars HÖG utan fler omtest.
  let serverDodVidOmtest = false;
  const omtest = async (v) => {
    await new Promise((sov) => setTimeout(sov, 20_000));
    try {
      const r = await fetch(`${BAS}/api/studio/${v}`, {
        headers: { "x-admin-password": pass },
        signal: AbortSignal.timeout(15_000),
      });
      return r.status === 200;
    } catch { return false; }
  };
  for (const v of andpunkter) {
    try {
      const r = await fetch(`${BAS}/api/studio/${v}`, {
        headers: { "x-admin-password": pass },
        signal: AbortSignal.timeout(15_000),
      });
      if (r.status !== 200) {
        fel++;
        if (deploy) bokfor("F3-api", "MEDEL", `/${v} → ${r.status} (deploybygg pågår)`, "väntat fönster: /tmp/ak1a-deploy.lock hålls");
        else bokfor("F3-api", "HÖG", `/${v} → ${r.status}`, `HTTP-kod != 200`);
      }
    } catch (e) {
      fel++;
      if (deploy) {
        bokfor("F3-api", "MEDEL", `/${v} ej mätbar (deploybygg pågår)`, "väntat fönster: /tmp/ak1a-deploy.lock hålls");
      } else if (serverDodVidOmtest) {
        bokfor("F3-api", "HÖG", `/${v} nätverksfel`, `${String(e).slice(0, 60)} (server död vid omtest — inget nytt)`);
      } else {
        const levde = await omtest(v);
        if (levde) bokfor("F3-api", "MEDEL", `/${v} övergående nätverksfel — självläkt`, `omtest OK efter 20 s (första: ${String(e).slice(0, 40)})`);
        else {
          serverDodVidOmtest = true;
          bokfor("F3-api", "HÖG", `/${v} nätverksfel`, `${String(e).slice(0, 60)} + omtest misslyckades`);
        }
      }
    }
  }
  if (fel === 0) gron("F3-api", `${andpunkter.length}/${andpunkter.length} ändpunkter 200`);
}

// ── F4: DATA ─────────────────────────────────────────────────────────────────
function jagaData() {
  const filer = [
    ["huvudtrad.json", (j) => Array.isArray(j.sessioner)],
    ["mal-state.json", (j) => typeof j.mal === "string" || j === null],
    ["automations.json", (j) => Array.isArray(j.automationer)],
  ];
  let ok = 0;
  for (const [namn, validd] of filer) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(VAKT, namn), "utf8"));
      if (validd(j)) ok++;
      else bokfor("F4-data", "MEDEL", `${namn}: ogiltig struktur`, "valideringsfunktion false");
    } catch (e) {
      if (e.code === "ENOENT") ok++; // filen får saknas
      else bokfor("F4-data", "MEDEL", `${namn}: JSON-parse fel`, String(e).slice(0, 60));
    }
  }
  if (ok === filer.length) gron("F4-data", `${ok}/${filer.length} register giltiga`);
}

// ── F5: LOGGAR ───────────────────────────────────────────────────────────────
// ROTORSAKSFIX (spår 8 2026-09-15, bevis i data/forskning/OPTIMERING/
// o11-feljakt-f5-rotorsaksfix.md). Tre felklasser i gamla F5:
//   (1) ÅTERLEVERANS: sista 5 raderna om-skannades var 15:e minut utan
//       minne — samma gamla felrad bokfördes som nytt fynd tills 5 nya
//       rader trängde undan den (kraschvaktens KRASCHLOOP-rad 14:24
//       återlevererades 14:27+14:42+14:57; ROND 34:s manuell sondering).
//   (2) BLINT BEVIS: svans.slice(-80) visade svansens SLUT oavsett vilken
//       rad som matchat — beviset kunde visa frisk text ("svarar=true").
//   (3) SKIFTLÄGES-FP: /FEL[: ]/i matchade information ("tsc 0 fel (",
//       "ej kodfel:") — äkta felmarkörer i dessa loggar är VERSALA
//       (FEL:, FEL 502, STATUS-FEL, KRASCHLOOP).
// Dessutom dödades ett falskt negativ: tail-5 missade fel i loggar som
// växer >5 rader per intervall (agentfabrik/logg.jsonl växer på sekunder).
const LOGG_MONSTER = [
  /FEL[: ]/,        // versal felmarkör — skiftlägeskänslig mot "0 fel (", "kodfel:"
  /KRASCH/,         // kraschvaktens KRASCHLOOP-MISSTANKE-rader
  /tidsgräns.*nåddes/i,
  /Cannot access.*before initialization/i,
  /ENOENT.*route/i,
  /misslyckades/i,  // prod-synkens "…-SYNK MISSLYCKADES (smutsigt träd?…)" — live-bevisad 2026-09-15
];
// "evighetsmotor.log" — inte "evighetsmotor-logg": verktyget skriver till
// .log (evighetsmotor.mjs:27); gamla F5 bevakade ett namn som aldrig funnits
// ⇒ evighetsmotorns logg var tyst obevakad sedan våg 167.
const LOGG_FILER = ["hjartslag.log", "kraschvakt.log", "evighetsmotor.log", "prod-synk.log", "agentfabrik/logg.jsonl"];
const LOGG_STAMP = path.join(VAKT, ".feljakt-logg-positioner.json");

function jagaLoggar(vaktDir, rapportera, gronRapport) {
  const dir = vaktDir || VAKT;
  const stampSokvag = vaktDir ? path.join(dir, ".feljakt-logg-positioner.json") : LOGG_STAMP;
  const bokf = rapportera || bokfor;
  const gronF = gronRapport || gron;
  let pos = {};
  try { pos = JSON.parse(fs.readFileSync(stampSokvag, "utf8")); } catch { /* första körningen */ }
  let fynd = 0, skanadeRader = 0;
  for (const lf of LOGG_FILER) {
    try {
      const rader = fs.readFileSync(path.join(dir, lf), "utf8").split("\n");
      if (rader.length && rader[rader.length - 1].trim() === "") rader.pop();
      const senast = typeof pos[lf] === "number" ? pos[lf] : -1;
      // Ingen position (första körningen) eller truncering/rotation (färre
      // rader än minnet): sista 5 raderna EN gång — gamla F5:s enda pass,
      // därefter skannas enbart nya rader och varje rad exakt en gång.
      let start = senast;
      if (senast < 0 || senast > rader.length) start = Math.max(0, rader.length - 5);
      for (const rad of rader.slice(start)) {
        skanadeRader++;
        for (const m of LOGG_MONSTER) {
          if (m.test(rad)) {
            fynd++;
            bokf("F5-logg", "MEDEL", `${lf}: felmönster på ny rad`, `${m} → ${rad.slice(0, 120)}`);
            break;
          }
        }
      }
      pos[lf] = rader.length;
    } catch { /* loggen får saknas */ }
  }
  try {
    const tmp = stampSokvag + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(pos));
    fs.renameSync(tmp, stampSokvag);
  } catch { /* positionsminnet är en optimering, ej ett krav */ }
  if (fynd === 0) gronF("F5-logg", `${LOGG_FILER.length} loggar — ${skanadeRader} nya rader skannade, 0 fynd`);
}

// ── F6: DRIFT ────────────────────────────────────────────────────────────────
async function jagaDrift(pass) {
  try {
    const r = await fetch(`${BAS}/`, { signal: AbortSignal.timeout(15_000) });
    if (r.status !== 200) {
      if (deployPagar()) bokfor("F6-drift", "MEDEL", `prod → ${r.status} (deploybygg pågår)`, "väntat fönster: /tmp/ak1a-deploy.lock hålls");
      else bokfor("F6-drift", "HÖG", `prod → ${r.status}`, "HTTP-kod != 200");
    } else gron("F6-drift", `prod ${r.status}`);
  } catch (e) {
    if (deployPagar()) bokfor("F6-drift", "MEDEL", "prod osvarar — deploybygg pågår", "väntat fönster: /tmp/ak1a-deploy.lock hålls");
    else bokfor("F6-drift", "HÖG", "prod osvarar", String(e).slice(0, 60));
  }
  try {
    const mem = fs.readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+)/);
    const mb = mem ? Math.round(parseInt(mem[1]) / 1024) : 0;
    if (mb < 300) bokfor("F6-drift", "HÖG", `RAM ${mb} MB`, "MemAvailable < 300 MB");
    else if (mb < 800) bokfor("F6-drift", "MEDEL", `RAM ${mb} MB`, "MemAvailable < 800 MB");
    else gron("F6-drift", `RAM ${mb} MB`);
  } catch { /* */}
  try {
    const disk = execSync("df / | tail -1 | awk '{print $5}'", { timeout: 10_000, encoding: "utf8" }).trim();
    const procent = parseInt(disk);
    if (procent > 85) bokfor("F6-drift", "MEDEL", `disk ${procent}%`, "df / > 85%");
    else gron("F6-drift", `disk ${procent}%`);
  } catch { /* */}
}

// ── F7: SECURITY ─────────────────────────────────────────────────────────────
// s8-härdning (2026-09-15) — tre konstruktionsbrister kurade:
// (1) BEVIS får ALDRIG bära träffraden: gamla bokfor skrev grep-resultatet
//     (med nyckelns 12 första tecken) in i feljakt-fynd.jsonl — som F7:s
//     EGEN sökning skannar varje jakt ⇒ en äkta träff hade blivit en
//     självreplikerande nyckelläcka som aldrig kan gröna. Nu: endast fil:rad.
// (2) Täckning: gamla globben data/vakten/*.log *.jsonl såg ENBART
//     toppnivåfilerna — agentfabrikens underkataloger (ko/status/utdata med
//     barnens fulla svar!) och .json/.txt var blinda fläckar. Nu: rekursivt,
//     alla filtyper.
// (3) Skal-frihet: prefixet interpolerades i ett execSync-kommando — citation
//     i lösenordet hade brutit sökningen. Nu: in-process-sökning, värdet lämnar
//     aldrig processen förrän matchat som radnummer.
function sokNyckel(katalog, prefix) {
  const traff = [];
  let filer = 0;
  (function vand(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { vand(p); continue; }
      filer++;
      let txt = "";
      try { txt = fs.readFileSync(p, "utf8"); } catch { continue; }
      const rader = [];
      txt.split("\n").forEach((rad, i) => { if (rad.includes(prefix)) rader.push(i + 1); });
      if (rader.length) traff.push({ fil: path.relative(ROT, p), rader: rader.slice(0, 3), antal: rader.length });
    }
  })(katalog);
  return { traff, filer };
}

function jagaSecurity() {
  // .env i git?
  try {
    const tracked = execSync("git ls-files --error-unmatch .env.production.local 2>/dev/null || echo NEJ", {
      cwd: ROT, timeout: 10_000, encoding: "utf8",
    }).trim();
    if (tracked !== "NEJ") bokfor("F7-security", "KRITISK", ".env.production.local är git-spårad!", "git ls-files");
    else gron("F7-security", ".env ej i git");
  } catch { /* */}
  // Nycklar i vakt-ytan?
  try {
    const pass = lasPass();
    if (pass && pass.length > 5) {
      const { traff, filer } = sokNyckel(VAKT, pass.slice(0, 12));
      if (traff.length) {
        const bevis = traff.slice(0, 3).map((t) => `${t.fil}:${t.rader.join(",")}`).join(" | ");
        bokfor("F7-security", "KRITISK", `admin-nyckel i vakt-ytan — ${traff.length} fil(er) av ${filer}!`, bevis);
      } else gron("F7-security", `nyckel ej i vakt-ytan (${filer} filer, rekursivt)`);
    }
  } catch { /* */}
}

async function main() {
  // Isolerat testläge: `node verktyg/feljagaren.mjs --f5-test <katalog>` kör
  // ENDAST F5-spåret mot katalogen (fynd till stdout, positionsminne i
  // katalogen) — pumpornas anrop har inga argument och berörs ej.
  if (process.argv[2] === "--f5-test") {
    const dir = path.resolve(process.argv[3] || ".");
    let antal = 0;
    jagaLoggar(
      dir,
      (sp, allvar, f, b) => { antal++; console.log(`[TEST-FYND ${allvar}] ${f} — ${b}`); },
      (sp, not) => console.log(`[TEST-GRÖN] ${sp}: ${not}`),
    );
    console.log(`[TEST KLAR] fynd=${antal}`);
    return;
  }
  // Isolerat testläge: `node verktyg/feljagaren.mjs --f7-test <katalog>` kör
  // ENDAST F7:s nyckelsökning mot katalogen med ett fast TEST-prefix (aldrig
  // ett riktigt värde) — fynd till stdout, fyndloggen orörd.
  if (process.argv[2] === "--f7-test") {
    const dir = path.resolve(process.argv[3] || ".");
    const TESTPREFIX = "TESTNYCKEL999";
    const { traff, filer } = sokNyckel(dir, TESTPREFIX);
    for (const t of traff) console.log(`[TEST-FYND F7] ${t.fil} rader=${t.rader.join(",")} antal=${t.antal}`);
    console.log(`[TEST KLAR] filer=${filer} traff=${traff.length}`);
    return;
  }
  const pass = lasPass();
  if (!pass) { console.log("[FELJÄGAREN] PASS SAKNAS — sover"); return; }
  console.log(`[FELJÄGAREN] startar ${new Date().toISOString().slice(11, 19)} — 7 spår`);
  jagaKod();
  jagaProcesser();
  await jagaApi(pass);
  jagaData();
  jagaLoggar();
  await jagaDrift(pass);
  jagaSecurity();
  console.log("[FELJÄGAREN] klar — fynd i " + FYND);
}

main().catch((fel) => { bokfor("FELJÄGAREN", "HÖG", "krasch", String(fel).slice(0, 120)); });
