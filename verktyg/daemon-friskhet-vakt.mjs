#!/usr/bin/env node
// daemon-friskhet-vakt.mjs — v195 (r290-läxan mekaniserad): kod på disk ≠ kod i minne
// =====================================================================================
// BAKGRUND (r290, 2026-09-28): r289 levererade korMinutvis("vaxthus-chatt")
// i eb688e38 07:15 — men pm2 ak1a-pumpor var startad 05:14 och processens
// MINNE saknade raden: hyresgästens chatt-jobb hade ALDRIG plockats (bunt-
// lever, drift-död). Läxan: varje daemon-kodändring kräver pm2 restart i
// samma leverans — denna vakt gör glappet SYNGLIGT mekaniskt.
//
// Kontrakt: för varje process i BEVAKA jämförs källfilens SENASTE INNEHÅLLS-
// ÄNDRING mot processens starttid. Innehåll = git-log (senaste commit som
// rörde filen — prod-synkens git pull skriver om mtider UTAN innehålls-
// ändring, bevisat r290-v195: hundvaktens mtime 07:17 var checkout-brus
// trots senaste innehålls-commit 05:13); mtime enbart som fallback utanför
// git-träd. Glapp > 5 min ⇒ LARM (deploy-rutiner hinner starta om under
// 5 min — kortare glapp är pågående leverans, inte glömd kur).
// LARM skrivs append-only till data/vakten/konfig-larm.jsonl (larm-
// eskaleringens källa 1: fingeravtryck typ|område|meddelande ⇒ episod
// växer vid kvarstående glapp) med rate-limit 10 min/process; lägesfil
// data/vakten/daemon-friskhet.json skrivs hel varje körning. Grönt läge:
// tyst exit 0. Saknad källfil = OBS-rad i lägesfilen (processen kan köras
// ur ett annat träd) — ALDRIG krasch, ALDRIG larm utan positivt glapp-
// bevis (pumpor-hundvaktens heliga regel,ärvd).
//
// ropas minutvis av pumpor-daemonen: korMinutvis("daemon-friskhet").
// Taskset-wrapp (r286: CPU-capp): pm_exec_path=/usr/bin/taskset ⇒ källfilen
// söks i args (första .mjs-argumentet) — pm2 restart bevarar exec+args.
// Env: AK1A_FRISKHET_GIT=0 tvingar mtime-läge (svitens fixture-styrning).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKTDIR = process.env.AK1A_FRISKHET_VAKTDIR ?? path.join(ROT, "data", "vakten");
const LARMFIL = path.join(VAKTDIR, "konfig-larm.jsonl");
const LAGESFIL = path.join(VAKTDIR, "daemon-friskhet.json");
const BEVAKA = (process.env.AK1A_FRISKHET_BEVAKA ?? "ak1a-pumpor,pumpor-hundvakt,pulsvakt").split(",").map((s) => s.trim()).filter(Boolean);
const GLAPP_LARM_SEK = Number(process.env.AK1A_FRISKHET_LARM_SEK ?? 300); // 5 min
const RATELIMIT_MS = 10 * 60_000;

/** pm2-processlistan — i tester styrd av AK1A_FRISKHET_JLIST (json-fil). */
function lasProcesser() {
  if (process.env.AK1A_FRISKHET_JLIST) {
    return JSON.parse(fs.readFileSync(process.env.AK1A_FRISKHET_JLIST, "utf8"));
  }
  try {
    return JSON.parse(execFileSync("pm2", ["jlist"], { encoding: "utf8", timeout: 15000, stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return null; // pm2 sjuk = ingen positiv glappmätning ⇒ tyst grönläge
  }
}

/** Källfil ur pm2-post: pm_exec_path om .mjs, annars första .mjs i args
 *  (taskset-wrapp: exec=/usr/bin/taskset args=[-c,0-3,node,verktyg/x.mjs]). */
function kallfilUr(p) {
  const kandidater = [p?.pm2_env?.pm_exec_path, ...(p?.pm2_env?.args ?? [])];
  for (const k of kandidater) {
    if (typeof k === "string" && k.endsWith(".mjs")) return k;
  }
  return null;
}

/** Källfilens senaste INNEHALLSändring: git-log företräde (pull-artefakter
 *  skriver om mtider utan innehållsändring), mtime som fallback.
 *  Returnerar { ts, kalla: "git" | "mtime" }. */
function senasteInnehall(fil) {
  if (process.env.AK1A_FRISKHET_GIT !== "0") {
    try {
      const rot = execFileSync("git", ["-C", path.dirname(fil), "rev-parse", "--show-toplevel"], { encoding: "utf8", timeout: 10000, stdio: ["ignore", "pipe", "ignore"] }).trim();
      const rel = path.relative(rot, fil);
      const iso = execFileSync("git", ["-C", rot, "log", "-1", "--format=%cI", "--", rel], { encoding: "utf8", timeout: 10000, stdio: ["ignore", "pipe", "ignore"] }).trim();
      if (iso) return { ts: new Date(iso).getTime(), kalla: "git" };
    } catch { /* utanför git / git sjukt ⇒ mtime-fallback */ }
  }
  return { ts: fs.statSync(fil).mtimeMs, kalla: "mtime" };
}

function huvud() {
  const processer = lasProcesser();
  if (!Array.isArray(processer)) {
    fs.mkdirSync(VAKTDIR, { recursive: true });
    fs.writeFileSync(LAGESFIL, JSON.stringify({ ts: new Date().toISOString(), status: "OK", OBS: ["pm2-processlistan kunde ej läsas — ingen mätning"] }, null, 2));
    return 0;
  }
  const forrige = fs.existsSync(LAGESFIL) ? (() => { try { return JSON.parse(fs.readFileSync(LAGESFIL, "utf8")); } catch { return {}; } })() : {};
  const senasteLarm = forrige.senasteLarm ?? {};

  const perProcess = {};
  let larm = false;
  for (const namn of BEVAKA) {
    const p = processer.find((x) => x?.name === namn && x?.pm2_env?.status === "online");
    if (!p) { perProcess[namn] = { status: "EJ ONLINE" }; continue; }
    const kalla = kallfilUr(p);
    if (!kalla || !fs.existsSync(kalla)) {
      perProcess[namn] = { status: "OK", OBS: `källfil ej funnen (${kalla ?? "ingen .mjs i exec/args"}) — körs ev. ur annat träd` };
      continue;
    }
    const start = new Date(p.pm2_env.pm_uptime).getTime();
    const { ts: innehall, kalla: tsKalla } = senasteInnehall(kalla);
    const glappSek = Math.round((innehall - start) / 1000);
    const post = { status: "OK", kalla, startIso: new Date(start).toISOString(), innehallIso: new Date(innehall).toISOString(), tsKalla, glappSek };
    if (innehall - start > GLAPP_LARM_SEK * 1000) {
      larm = true;
      post.status = "LARM";
      const sist = senasteLarm[namn] ?? 0;
      if (Date.now() - sist >= RATELIMIT_MS) {
        senasteLarm[namn] = Date.now();
        fs.appendFileSync(LARMFIL, JSON.stringify({
          ts: new Date().toISOString(),
          typ: "DAEMON-KODGLAPP",
          omrade: namn,
          meddelande: `källan ${path.basename(kalla)} innehållsändrad ${post.innehallIso} (${post.tsKalla}) EFTER processstart ${post.startIso} (glapp ${Math.round(glappSek / 60)} min) — processen kör föråldrad kod; pm2 restart ${namn} krävs (r290-läxan, v195)`,
        }) + "\n");
      }
    }
    perProcess[namn] = post;
  }

  fs.mkdirSync(VAKTDIR, { recursive: true });
  fs.writeFileSync(LAGESFIL, JSON.stringify({ ts: new Date().toISOString(), status: larm ? "LARM" : "GRÖN", processer: perProcess, senasteLarm }, null, 2));
  return 0;
}

process.exit(huvud());
