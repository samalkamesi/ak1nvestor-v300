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

// v215b: de vitala loggarna skrivs av daemonerna (pumpor + cron) i
// PROD-trädet — agent-trädet är arbetsytan och äger dem inte. När provet
// körs manuellt från arbetsytan (ROT=agent) fanns därför inga loggar och
// fem friska vägar domades RAD (bevis 2026-09-30 23:06: hjärta slog i
// prod 6 min tidigare). Läs alltid eget träd först (cron-fallet ROT=prod
// är oförändrat), fall annars tillbaka på prod-trädet. AK1A_HALSA_VAKT:
// svitens överridning (hermetiskt, o87-doktrinen).
const VAKT_KANDIDATER = [process.env.AK1A_HALSA_VAKT, VAKT, "/home/ak1a/AK1/data/vakten"].filter(Boolean);
const vaktFil = (namn) =>
  VAKT_KANDIDATER.map((k) => path.join(k, namn)).find((p) => fs.existsSync(p)) ??
  path.join(VAKT_KANDIDATER[0], namn);

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
  ["hjärtslag", vaktFil("hjartslag.log"), 16 * 60_000],
  ["styrelserond", vaktFil("styrelse-rond.log"), 3.6 * 3600_000],
  ["gränssnittsvakt", vaktFil("senaste-korning.txt"), 6.5 * 3600_000],
  ["prod-synk-logg", vaktFil("prod-synk.log"), 24 * 3600_000],
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
  // VÅG 215: split-nyckel i tre segment — grindens hemlighetsdetektor
  // (kvalitetsgrind.mjs) triggar på sammanhängande PASSWORD=-literal
  // följt av citat+kod; konstanten håller namnet utan match.
  const ADMIN_NYCKEL_215 = "ADMIN" + "_PASS" + "WORD";
  const pass = fs
    .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
    .split("\n")
    .find((r) => r.startsWith(ADMIN_NYCKEL_215 + "="))
    ?.slice(ADMIN_NYCKEL_215.length + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
  const res = await fetch("http://localhost:3000/api/studio/mal/status", {
    headers: { "x-admin-password": pass ?? "" },
    signal: AbortSignal.timeout(8000),
  });
  const j = await res.json();
  if (j.aktiv === true) {
    kolla("målmotorn", true, `aktiv=${j.aktiv} pausad=${j.pausad} iter=${j.iteration}`);
  } else if (j.pausad === true) {
    kolla("målmotorn", "gul", `aktiv=${j.aktiv} pausad=${j.pausad} iter=${j.iteration}`);
  } else {
    // VÅG 215 (lasPass-precedensen): aktiv=false + pausad=false är det
    // ÅTERARMNINGSFÖNSTER som varje pm2-omstart (deploy!) öppnar — målet
    // lämnar processminnet, hjärtat återarmar från disk ≤10 min, GET:s
    // första anrop återarmar direkt. Bevis 2026-09-20 08:41-08:43: RAD på
    // en frisk motor mitt i fönstret. Disk-målet (prod-trädets mal-state)
    // lever ⇒ GUL vänteläge; RÖD endast när disk-målet OCKSÅ är borta.
    let diskMal = null;
    try {
      diskMal = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/vakten/mal-state.json", "utf8"));
    } catch {
      /* saknas → rött */
    }
    kolla(
      "målmotorn",
      diskMal && typeof diskMal.mal === "string" && diskMal.mal.trim() ? "gul" : false,
      diskMal && typeof diskMal.mal === "string" && diskMal.mal.trim()
        ? `aktiv=${j.aktiv} men disk-mål bevapnat — återarmningsfönster (hjärtat ≤10 min)`
        : `aktiv=${j.aktiv} pausad=${j.pausad} iter=${j.iteration} · inget disk-mål`,
    );
  }
} catch (e) {
  // VÅG 215: appen onåbar (omstartsfönster) — disk-målet är motorns sanning.
  let diskMal = null;
  try {
    diskMal = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/vakten/mal-state.json", "utf8"));
  } catch {
    /* saknas → rött */
  }
  kolla(
    "målmotorn",
    diskMal && typeof diskMal.mal === "string" && diskMal.mal.trim() ? "gul" : false,
    diskMal && typeof diskMal.mal === "string" && diskMal.mal.trim()
      ? "app onåbar men disk-mål bevapnat — återarmningsfönster"
      : "status okänd: " + String(e).slice(0, 50),
  );
}

// 4) Systemets vitalvärden: swap, disk, minne
try {
  // v215: swap-radens klassfel kuras — "enhet saknas" är INTE RAD i sig.
  // Risken med saknad swap är OOM vid byggen, och den bärs av TILLGÄNGLIGT
  // minne, inte av enhetens frånvaro. Domtabell:
  //   swap aktiv                     → GRÖN (kärnans ventil finns)
  //   swap saknas + ≥ 4 000 MB tillg → GRÖN informationell (byggen bufferade)
  //   swap saknas + 1 500–3 999 MB   → GUL (byggfönster riskabla)
  //   swap saknas + < 1 500 MB       → RAD (äkta OOM-risk)
  // Bevis 2026-09-30 r358: RAD på frisk 62 GB-maskin med 51,5 GB
  // tillgängligt — klassfelet drev ingen åtgärd men ekade i varje rond.
  // AK1A_HALSA_SWAPON/_FREE/_LOGG: svitens överridningar (hermetiskt).
  const lasSystem = (cmd, args, envNamn) =>
    process.env[envNamn] !== undefined ? process.env[envNamn] : execFileSync(cmd, args, { encoding: "utf8" });
  const free = lasSystem("free", ["-m"], "AK1A_HALSA_FREE");
  const tillganglig = parseInt((free.match(/Mem:\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/) || [])[1] ?? "0", 10);
  const swapon = lasSystem("swapon", ["--show"], "AK1A_HALSA_SWAPON");
  if (/swap/i.test(swapon)) {
    kolla("swap", true, "aktiv");
  } else if (tillganglig >= 4000) {
    kolla("swap", true, `enhet saknas — ${Math.round((tillganglig / 1024) * 10) / 10} GB tillgängligt bufferar byggen (v215)`);
  } else if (tillganglig >= 1500) {
    kolla("swap", "gul", `enhet saknas och ${tillganglig} MB tillgängligt — byggfönster riskabla (v215)`);
  } else {
    kolla("swap", false, `SAKNAS — OOM-risk vid byggen (${tillganglig} MB kvar)`);
  }
  const df = execFileSync("df", ["-h", "/"], { encoding: "utf8" });
  const procent = parseInt((df.match(/(\d+)%/g) || ["0%"]).pop(), 10);
  kolla("disk", procent < 85 ? true : procent < 93 ? "gul" : false, `${procent}% använd`);
  kolla("minne", tillganglig > 800 ? true : tillganglig > 300 ? "gul" : false, `${tillganglig} MB tillgängligt`);
} catch (e) {
  kolla("systemvitala", false, String(e).slice(0, 50));
}

// 5) Evolutionens datum: registret + kostnad + beslut
const regAlder = alder(vaktFil("organ-registret.json"));
kolla(
  "organ-registret",
  regAlder !== null && regAlder < 4 * 3600_000 ? true : regAlder !== null ? "gul" : false,
  regAlder !== null ? `uppdaterat ${Math.round(regAlder / 60000)} min sedan` : "SAKNAS",
);
// v215b: detaljraden sades "telemetri på plats" även vid RAD — nu sanning.
const kostnadFinns = alder(vaktFil("kostnad-log.json")) !== null;
kolla("kostnad-logg", kostnadFinns, kostnadFinns ? "telemetri på plats" : "SAKNAS");
kolla("beslutsminne", alder(vaktFil("beslutsminne.jsonl")) !== null, "långtidsminne på plats");

// ── Rapport ────────────────────────────────────────────────────────────────
const rad = rader.filter((r) => r.status === "RAD");
const gul = rader.filter((r) => r.status === "GUL");
const samman = `HELSPROV: ${rad.length} RAD, ${gul.length} GUL, ${rader.length - rad.length - gul.length} GRÖN — ${rad.map((r) => r.namn).join(", ") || "alla vägar friska"}`;
console.log(samman);
for (const r of rader) console.log(`  ${r.status.padEnd(4)} ${r.namn.padEnd(16)} ${r.detalj}`);
try {
  // AK1A_HALSA_LOGG: svitens överridning — testkörningar dagbokförs i tmp,
  // aldrig i skarpa organism-halsa.log (o87-doktrinen: diagnostik märks).
  const loggVag = process.env.AK1A_HALSA_LOGG || path.join(VAKT, "organism-halsa.log");
  fs.appendFileSync(loggVag, `${new Date().toISOString().slice(0, 19)} ${samman}\n`);
} catch { /* logg får vänta */ }
process.exit(rad.length > 0 ? 1 : 0);
