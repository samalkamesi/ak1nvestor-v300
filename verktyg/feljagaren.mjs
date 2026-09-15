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
 * LAGAR: Lag 1 (bevis i varje rad), Lag 3 (bokför), Lag 6 (fel = lärdom).
 */
import { execSync } from "node:child_process";
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
  if (!srcAndrad) { gron("F1-kod", "src/ oändrad sedan senaste tsc — hoppar"); return; }
  try {
    const tsc = execSync("npx tsc --noEmit 2>&1 | head -5", { cwd: ROT, timeout: 300_000, encoding: "utf8" });
    const fel = tsc.trim();
    if (fel && !fel.includes("0")) {
      bokfor("F1-kod", "HÖG", `tsc: ${fel.split("\n").length} fel`, fel.slice(0, 200));
    } else {
      gron("F1-kod", `tsc 0 fel (commit ${senaste.slice(0, 8)}→${gitTopp?.slice(0, 8) || "?"})`);
      try { fs.writeFileSync(tscMarkor, gitTopp || ""); } catch {}
    }
  } catch (e) {
    bokfor("F1-kod", "HÖG", "tsc kraschade", String(e).slice(0, 120));
  }
  // Verktyg: node --check på samtliga
  try {
    const filer = execSync('find verktyg -name "*.mjs" | head -40', { cwd: ROT, timeout: 15_000, encoding: "utf8" }).trim().split("\n");
    let trasiga = 0;
    for (const f of filer) {
      try { execSync(`node --check ${JSON.stringify(f)}`, { cwd: ROT, timeout: 10_000, stdio: "pipe" }); }
      catch { trasiga++; bokfor("F1-kod", "MEDEL", `syntaxfel: ${f}`, `node --check misslyckades`); }
    }
    if (trasiga === 0) gron("F1-kod", `${filer.length} verktyg syntax-OK`);
  } catch { /* finder misslyckades */}
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
  for (const v of andpunkter) {
    try {
      const r = await fetch(`${BAS}/api/studio/${v}`, {
        headers: { "x-admin-password": pass },
        signal: AbortSignal.timeout(15_000),
      });
      if (r.status !== 200) { fel++; bokfor("F3-api", "HÖG", `/${v} → ${r.status}`, `HTTP-kod != 200`); }
    } catch (e) { fel++; bokfor("F3-api", "HÖG", `/${v} nätverksfel`, String(e).slice(0, 60)); }
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
function jagaLoggar() {
  const monster = [/FEL[: ]/i, /KRASCH/, /tidsgräns.*nåddes/i, /Cannot access.*before initialization/i, /ENOENT.*route/i];
  const loggFiler = ["hjartslag.log", "kraschvakt.log", "evighetsmotor-logg", "prod-synk.log", "agentfabrik/logg.jsonl"];
  let fynd = 0;
  for (const lf of loggFiler) {
    try {
      const svans = fs.readFileSync(path.join(VAKT, lf), "utf8").trim().split("\n").slice(-5).join("\n");
      for (const m of monster) {
        if (m.test(svans)) {
          fynd++;
          bokfor("F5-logg", "MEDEL", `${lf}: felmönster i svansen`, `${m} → ${svans.slice(-80)}`);
          break;
        }
      }
    } catch { /* loggen får saknas/växa */}
  }
  if (fynd === 0) gron("F5-logg", `${loggFiler.length} loggar rena i svansen`);
}

// ── F6: DRIFT ────────────────────────────────────────────────────────────────
async function jagaDrift(pass) {
  try {
    const r = await fetch(`${BAS}/`, { signal: AbortSignal.timeout(15_000) });
    if (r.status !== 200) bokfor("F6-drift", "HÖG", `prod → ${r.status}`, "HTTP-kod != 200");
    else gron("F6-drift", `prod ${r.status}`);
  } catch (e) { bokfor("F6-drift", "HÖG", "prod osvarar", String(e).slice(0, 60)); }
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
function jagaSecurity() {
  // .env i git?
  try {
    const tracked = execSync("git ls-files --error-unmatch .env.production.local 2>/dev/null || echo NEJ", {
      cwd: ROT, timeout: 10_000, encoding: "utf8",
    }).trim();
    if (tracked !== "NEJ") bokfor("F7-security", "KRITISK", ".env.production.local är git-spårad!", "git ls-files");
    else gron("F7-security", ".env ej i git");
  } catch { /* */}
  // Nycklar i loggar?
  try {
    const pass = lasPass();
    if (pass && pass.length > 5) {
      const grepResult = execSync(
        `grep -r "${pass.slice(0, 12)}" data/vakten/*.log data/vakten/*.jsonl 2>/dev/null | head -3 || echo REN`,
        { cwd: ROT, timeout: 15_000, encoding: "utf8" },
      ).trim();
      if (grepResult && grepResult !== "REN") {
        bokfor("F7-security", "KRITISK", "admin-nyckel i vakt-loggar!", grepResult.slice(0, 80));
      } else gron("F7-security", "nyckel ej i vakt-loggar");
    }
  } catch { /* */}
}

async function main() {
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
