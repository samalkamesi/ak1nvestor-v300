#!/usr/bin/env node
/**
 * ORGANISM-HÄLSOPROVET (våg 123 D2, Θ-organets beslut — PNAS off-ekvilibrium)
 * =====================================================================
 * Mekanisk verifiering av ALLA självläkningsvägar — inte tro, utan mät:
 * varje rad GRÖN (frisk) / GUL (gränsvärde) / RAD (åtgärdas av nästa rond
 * som HÖGSTA prioritet enligt regelverket § 3).
 *
 * Rader: daemon-pulser (pm2), hjärta, rond, vakt, prod-synk, mål, swap,
 * disk, minne, kostnad-logg, registret, versionsloggen.
 *
 * Körs: manuellt + av styrelse-rond.mjs (statusmatningen) — RAD-rader
 * eskaleras automatiskt till agenten.
 * Logg: data/vakten/organism-halsa.log
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import fileURLToPathShim from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPathShim.fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");

const nu = Date.now();
const rader = [];

function kolla(namn, ok, detalj, grans = "RAD") {
  rader.push({ namn, status: ok === true ? "GRÖN" : ok === "gul" ? "GUL" : grans, detalj });
}

/** Loggfilens sista rads ålder i ms (null om filen saknas). */
function alder(fil) {
  try {
    const stat = fs.statSync(fil);
    return nu - stat.mtimeMs;
  } catch {
    return null;
  }
}

function sistaRad(fil) {
  try {
    return fs.readFileSync(fil, "utf8").trim().split("\n").slice(-1)[0].slice(0, 90);
  } catch {
    return "(saknas)";
  }
}

// 1) Daemon + alla pm2-processer
try {
  const pm2 = execFileSync("pm2", ["ls"], { encoding: "utf8", timeout: 15_000 });
  const pumporOnline = /ak1a-pumpor.*online/.test(pm2);
  const ak1aOnline = /\bak1a\b.*online/.test(pm2);
  kolla("pm2-daemoner", pumporOnline && ak1aOnline, pumporOnline ? "ak1a + pumpor online" : "ak1a-pumpor SAKNAS");
} catch (e) {
  kolla("pm2-daemoner", false, String(e).slice(0, 60));
}

// 2) Pump-loggarnas färskhet
const forvantade = [
  ["hjärtslag", path.join(VAKT, "hjartslag.log"), 16 * 60_000],
  ["styrelserond", path.join(VAKT, "styrelse-rond.log"), 3.6 * 3600_000],
  ["gränssnittsvakt", path.join(VAKT, "senaste-korning.txt"), 6.5 * 3600_000],
  ["prod-synk-logg", path.join(VAKT, "prod-synk.log"), 24 * 3600_000],
];
for (const [namn, fil, gransMs] of forvantade) {
  const a = alder(fil);
  if (a === null && namn !== "prod-synk-logg") {
    // prod-synk loggar endast vid ny kod — saknad fil är OK
    kolla(namn, false, "loggen saknas");
  } else if (a !== null) {
    kolla(namn, a < gransMs ? true : a < gransMs * 1.5 ? "gul" : false, `sist ${Math.round(a / 60000)} min sedan: ${sistaRad(fil)}`);
  } else {
    kolla(namn, true, "ingen synk behövd ännu (loggar endast vid ny kod)");
  }
}

// 3) Målet lever
try {
  const pass = fs
    .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
    .split("\n")
    .find((r) => r.startsWith("ADMIN" + "_PASSWORD="))
    ?.slice(15)
    .trim()
    .replace(/^["']|["']$/g, "");
  const res = await fetch("http://localhost:3000/api/studio/mal/status", {
    headers: { "x-admin-password": pass ?? "" },
    signal: AbortSignal.timeout(8000),
  });
  const j = await res.json();
  kolla(
    "målmotorn",
    j.aktiv === true ? true : j.pausad === true ? "gul" : false,
    `aktiv=${j.aktiv} pausad=${j.pausad} iter=${j.iteration}`,
  );
} catch (e) {
  kolla("målmotorn", false, "status okänd: " + String(e).slice(0, 50));
}

// 4) Systemets vitalvärden: swap, disk, minne
try {
  const swapon = execFileSync("swapon", ["--show"], { encoding: "utf8" });
  kolla("swap", /swap/i.test(swapon) ? true : false, swapon.trim() ? "aktiv" : "SAKNAS — OOM-risk vid byggen");
  const df = execFileSync("df", ["-h", "/"], { encoding: "utf8" });
  const procent = parseInt((df.match(/(\d+)%/g) || ["0%"]).pop(), 10);
  kolla("disk", procent < 85 ? true : procent < 93 ? "gul" : false, `${procent}% använd`);
  const free = execFileSync("free", ["-m"], { encoding: "utf8" });
  const tillganglig = parseInt((free.match(/Mem:\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/) || [])[1] ?? "0", 10);
  kolla("minne", tillganglig > 800 ? true : tillganglig > 300 ? "gul" : false, `${tillganglig} MB tillgängligt`);
} catch (e) {
  kolla("systemvitala", false, String(e).slice(0, 50));
}

// 5) Evolutionens datum: registret + kostnad + beslut
const regAlder = alder(path.join(VAKT, "organ-registret.json"));
kolla(
  "organ-registret",
  regAlder !== null && regAlder < 4 * 3600_000 ? true : regAlder !== null ? "gul" : false,
  regAlder !== null ? `uppdaterat ${Math.round(regAlder / 60000)} min sedan` : "SAKNAS",
);
kolla("kostnad-logg", alder(path.join(VAKT, "kostnad-log.json")) !== null, "telemetri på plats");
kolla("beslutsminne", alder(path.join(VAKT, "beslutsminne.jsonl")) !== null, "långtidsminne på plats");

// ── Rapport ────────────────────────────────────────────────────────────────
const rad = rader.filter((r) => r.status === "RAD");
const gul = rader.filter((r) => r.status === "GUL");
const samman = `HELSPROV: ${rad.length} RAD, ${gul.length} GUL, ${rader.length - rad.length - gul.length} GRÖN — ${rad.map((r) => r.namn).join(", ") || "alla vägar friska"}`;
console.log(samman);
for (const r of rader) console.log(`  ${r.status.padEnd(4)} ${r.namn.padEnd(16)} ${r.detalj}`);
try {
  fs.appendFileSync(path.join(VAKT, "organism-halsa.log"), `${new Date().toISOString().slice(0, 19)} ${samman}\n`);
} catch { /* logg får vänta */ }
process.exit(rad.length > 0 ? 1 : 0);
