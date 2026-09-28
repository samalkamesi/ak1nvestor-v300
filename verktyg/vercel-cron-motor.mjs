#!/usr/bin/env node
/**
 * VERCEL-CRON-MOTORN (G9-steg 1, r299 2026-09-28)
 * =====================================================================
 * Bakgrund (glapp G9 i data/forskning/OPTIMERING/v166-konfig-glappkatalog.md):
 * vercel.json:s cron-lager är AKTIVT (bevis: system_events type=vagscan rad
 * 2026-09-28T05:05:22Z = Vercel-cronens 05:00-schema) — 12 dagliga jobb kör
 * på VERCEL-deploymentens compute mot delad Supabase trots "Vercel-backup
 * (passiv)" i AGENTS.md. Risk: osynlig åldring om GitHub-speglingen stannar
 * + felpunkt utanför kundens server. Kuren: servern äger schemaläggningen.
 *
 * STEG 1 (denna leverans): motor + rutter registrerade med aktiv=false i
 *   data/infra/vercel-cron-migrering.json — motorn rör INGET förrån en rutt
 *   sätts aktiv=true (datafil — läses om varje minut, ingen omstart krävs).
 * STEG 2 (KRÄVER KUND): kunden stänger cron-lagret i sitt Vercel-konto,
 *   därefter aktiveras rutterna EN I TAGET (email SENAST — dubbelkörning
 *   under övergången = dubbla mejl). RUTTEN kvalitet förblir permanent
 *   inaktiv: pumpor-daemonens kvalitetsvakt 07:02 äger den.
 *
 * Kontrakt:
 *   · ropas minutvis av pumpor-daemonen (korMinutvis("vercel-cron", …));
 *     inget förfaller ⇒ tyst exit 0 (vaxthus-chatt-vaktens vilomönster).
 *   · schemat = UTC (serverns tidszon): { tim, min, dagIManad?, fonster:
 *     "dag"|"manad" } i konfigfilen.
 *   · CATCH-UP: en rutt är berättigad när nu ≥ dagens/månadens schemalagda
 *     ögonblick OCH inte körd i samma fönster — daemon-omstart mitt i
 *     schemaminuten förlorar aldrig en körning (v2-filosofin).
 *   · CLAIM-FÖRST: sistKord skrivs FÖRE curl:n — två överlappande
 *     motorinstanser kan aldrig dubbelköra; dör motorn mid-curl står
 *     claimen (försök igen först nästa fönster — konservativt, ALDRIG
 *     dubbla mejl).
 *   · HEMMLIGHET: CRON_SECRET (om satt) läses internt (loadEnvFile —
 *     backup-fran-molnet-mönstret) och addingas som ?secret=; sekreten
 *     skrivs ALDRIG till logg/state/utdata.
 *   · State: data/vakten/vercel-cron-state.json (atomisk tmp+rename;
 *     korrupt fil ⇒ self-heal till tomt state). Logg:
 *     data/vakten/vercel-cron.log (retention 200 rader).
 *   · KÖRNING: curl mot 127.0.0.1 med Host-header (ra-gallring-mönstret —
 *     loopback är whitelistat i proxyn). http-kod fångas i state.
 *   · Exit ALLTID 0 — daemonen ska aldrig behöva hantera kraschen.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KONFIGFIL = path.join(ROT, "data", "infra", "vercel-cron-migrering.json");
const STATEFIL = path.join(ROT, "data", "vakten", "vercel-cron-state.json");
const LOGGFIL = path.join(ROT, "data", "vakten", "vercel-cron.log");
const HOST = "lab.ak1nvestor.com";

function logga(rad) {
  const stamp = new Date().toISOString();
  try {
    fs.appendFileSync(LOGGFIL, `${stamp} ${rad}\n`);
    const rader = fs.readFileSync(LOGGFIL, "utf8").split("\n");
    if (rader.length > 200) fs.writeFileSync(LOGGFIL, rader.slice(-200).join("\n"));
  } catch { /* logg får vänta */ }
}

/** dagligt fönster = UTC-datumsträng; månadsfönster = UTC-år-månad. */
function fonsterNyckel(nu, fonster) {
  const d = nu.getUTCFullYear() + "-" + String(nu.getUTCMonth() + 1).padStart(2, "0");
  return fonster === "manad" ? d : d + "-" + String(nu.getUTCDate()).padStart(2, "0");
}

/** schemats ögonblick INOM nuvarande fönster, som Date (UTC). */
function schemalagtOgonblick(nu, rutt) {
  const ar = nu.getUTCFullYear();
  const man = nu.getUTCMonth();
  if (rutt.fonster === "manad") {
    const dag = rutt.dagIManad ?? 1;
    return new Date(Date.UTC(ar, man, dag, rutt.tim, rutt.min));
  }
  return new Date(Date.UTC(ar, man, nu.getUTCDate(), rutt.tim, rutt.min));
}

/**
 * Kör motorn ett varv. Allt beroende injicerbart för testsviten.
 * Returnerar { körda: [{id, httpKod}], fel: string|null }.
 */
export async function korVercelCronMotor({
  nu = new Date(),
  lasKonfig = (p) => fs.readFileSync(p, "utf8"),
  lasState = (p) => fs.readFileSync(p, "utf8"),
  skrivState = (p, str) => fs.writeFileSync(p, str),
  flyttaState = (fran, till) => fs.renameSync(fran, till),
  curl = (url, timeoutS) => curlHttpKod(url, timeoutS),
  konfigSokvag = KONFIGFIL,
  stateSokvag = STATEFIL,
  loggFn = logga,
  secret = lasSecret(),
} = {}) {
  let konfig;
  try {
    konfig = JSON.parse(lasKonfig(konfigSokvag));
    if (!Array.isArray(konfig?.rutter)) throw new Error("rutter-array saknas");
  } catch (e) {
    loggFn(`KONFIGFEL vercel-cron-migrering.json: ${String(e?.message ?? e).slice(0, 120)} — inga körningar denna minut`);
    return { körda: [], fel: "konfig" };
  }
  let state = {};
  try {
    const last = JSON.parse(lasState(stateSokvag));
    if (last && typeof last === "object" && !Array.isArray(last)) state = last;
  } catch (e) {
    if (e?.code === "ENOENT") {
      // saknad state-fil = normalt försttillstånd (och viloläge skriver ingen)
      state = {};
    } else {
      loggFn(`STATE-FEL: korrupt/läsbar-fel på vercel-cron-state.json (${String(e?.message ?? e).slice(0, 60)}) — self-heal till tomt state (rutter kan köras om detta fönster)`);
      state = {};
    }
  }

  const körda = [];
  for (const rutt of konfig.rutter) {
    if (rutt.aktiv !== true) continue; // steg 1: rör ALDRIG inaktiva rutter
    const nyckel = fonsterNyckel(nu, rutt.fonster ?? "dag");
    const claim = state[rutt.id];
    if (claim?.fonster === nyckel) continue; // redan körd/claimad i fönstret
    const ochonblick = schemalagtOgonblick(nu, rutt);
    if (nu.getTime() < ochonblick.getTime()) continue; // schemat ej nått
    // CLAIM-FÖRST: markera FÖRE curl — överlappande instanser/död mid-curl
    // kan aldrig dubbelköra.
    state[rutt.id] = { ...claim, fonster: nyckel, sistKord: nu.toISOString(), httpKod: null, status: "kors" };
    skrivStateAtomic(stateSokvag, state, skrivState, flyttaState);
    const url = `http://127.0.0.1${rutt.sokvag}${secret ? `?secret=${encodeURIComponent(secret)}` : ""}`;
    loggFn(`▶ ${rutt.id} — curl ${rutt.sokvag} (timeout ${rutt.timeoutS ?? 300}s)`);
    let httpKod = null;
    try {
      httpKod = await curl(url, rutt.timeoutS ?? 300);
    } catch (e) {
      loggFn(`FEL ${rutt.id}: ${String(e?.message ?? e).slice(0, 100)}`);
    }
    const ok = typeof httpKod === "number" && httpKod >= 200 && httpKod < 300;
    state[rutt.id] = { fonster: nyckel, sistKord: nu.toISOString(), httpKod, status: ok ? "ok" : "fel" };
    skrivStateAtomic(stateSokvag, state, skrivState, flyttaState);
    loggFn(`${ok ? "OK" : "FYND"} ${rutt.id}: http=${httpKod ?? "?"}`);
    körda.push({ id: rutt.id, httpKod });
  }
  return { körda, fel: null };
}

function skrivStateAtomic(sokvag, state, skriv, flytta) {
  try {
    const tmp = sokvag + ".tmp";
    skriv(tmp, JSON.stringify(state, null, 2) + "\n");
    flytta(tmp, sokvag);
  } catch { /* state får vänta — claimen riskerar bara en omkörning */ }
}

function lasSecret() {
  try { process.loadEnvFile(path.join(ROT, ".env")); } catch {}
  try { process.loadEnvFile(path.join(ROT, ".env.local")); } catch {}
  return process.env.CRON_SECRET || null;
}

/** curl med http-kod som svar; kastar vid startfel. */
function curlHttpKod(url, timeoutS) {
  return new Promise((resolve, reject) => {
    const barn = spawn("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "-m", String(timeoutS), "-H", `Host: ${HOST}`, url], { stdio: ["ignore", "pipe", "ignore"] });
    let ut = "";
    barn.stdout.on("data", (b) => { ut += b; });
    barn.on("error", reject);
    barn.on("close", (kod) => {
      const n = Number(ut.trim());
      resolve(Number.isFinite(n) && n > 0 ? n : null);
    });
  });
}

// Direktkörning (daemonen ropar: node verktyg/vercel-cron-motor.mjs)
const arDirekt = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (arDirekt) {
  fs.mkdirSync(path.dirname(STATEFIL), { recursive: true });
  korVercelCronMotor().then(() => process.exit(0)).catch((e) => {
    logga(`MOTORFEL: ${String(e?.message ?? e).slice(0, 120)}`);
    process.exit(0); // ALDRIG annat än 0 — daemonen ska aldrig hantera krascher
  });
}
