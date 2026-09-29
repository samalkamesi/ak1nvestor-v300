#!/usr/bin/env node
/**
 * JÄRN-U3 PARAPLYVAKTEN — oberoende vakt ÖVER vaktarna (cron var 10:e minut)
 * =====================================================================
 * Kundorder: "oberoende system" — vem vakar vaktarna? Risken den bygger
 * mot är BEVISAD i drift 2026-09-29: verktyg/vakttornet.mjs + verktyg/
 * desk-halsa.mjs raderades kl 21:55:42 (kraschvaktens trädåterställning
 * tog untracked-filer som kollateral) medan deras CRON-RADER levde vidare
 * som zombies — crontab-fel smyger, ingen vaktar crontaben själv.
 *
 * Tre kontrollklasser:
 *   (a) crontab-raden finns: SITVAKTEN (var 2:a minut) + VAKTTORNET
 *       (var 5:e minut) + DESK-LÄKAREN (var 30:e minut) — mönstermatchning
 *       mot `crontab -l`
 *   (b) pulsen lever: data/vakten/vakttornet.json färskare än 12 min
 *       (skrivs var 5:e minut av vakttornet). ~/sitvakt.log är INFO:
 *       sitvakten loggar ENBART vid åtgärd (R331) — tystnad är normalt,
 *       pulsen där vaktas av (a) + (c); tröskel hade gett falsklarm.
 *   (c) filerna finns: kraschvakt.mjs + sitvakt + vakttornet.mjs +
 *       desk-halsa.mjs (filnivå; saknad fil rapporteras — paraplyet
 *       återskapar ALDRIG vaktkod, det är ägarens bord)
 *
 * Vid avvikelse: ALARM-rad till /desk/larm.json (BÅDA desk-ytorna, merglar
 * och dedup:ar befintliga rader — skrivMorkerVagLarm-mönstret, JÄRN-U1),
 * journal-rad till data/vakten/paraplyvakt-larm.log, samt LÄKNING där det
 * är mekaniskt möjligt: saknade cron-rader återinstalleras ur mallen
 * /home/ak1a/crontab-v332-mall (append av det saknade blocket — okända/
 * nya rader i crontaben röras ALDRIG; är hela crontaben borten tom
 * installeras mallen hel).
 *
 * Självbevis: varje körning (utom --torr) skriver data/vakten/paraplyvakt.json
 * i vakttornet.json:s format. Stdout-rad i vakttornets stil för cron-loggen.
 * Exit-kod är ALLTID 0 — läget bärs av stdout + rapportens "lag"-fält
 * (ett ropande cron-fel var 10:e minut skapar bara spårbrus; desk-läkare-
 * kontraktet $?-eq-0 är framtida kopplingsväg via json, inte exit-koden).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CRON_MALL = "/home/ak1a/crontab-v332-mall";
const LARM_SOKVAGAR = ["/var/www/desk/larm.json", "/home/ak1a/desk-web/larm.json"];
const RAPPORT = path.join(ROT, "data/vakten/paraplyvakt.json");
const LARM_LOGG = path.join(ROT, "data/vakten/paraplyvakt-larm.log");
const PULS_TROSKEL_MIN = 12;

/** Bevakade cron-rader: namn (rapporten), beskrivning (larm-texten) och
 *  mönster. Matchningen trimmar och ignorerar kommentarsrader — raden
 *  skall stå AKTIV i crontaben, dokumentation räcker inte. */
const CRON_KONTROLLER = [
  {
    namn: "crontab-sitvakt",
    beskrivning: "SITVAKTEN (*/2)",
    matcha: (rad) => { const r = rad.trim(); return !r.startsWith("#") && r.includes("*/2") && r.includes("/home/ak1a/sitvakt"); },
  },
  {
    namn: "crontab-vakttornet",
    beskrivning: "VAKTTORNET (*/5)",
    matcha: (rad) => { const r = rad.trim(); return !r.startsWith("#") && r.includes("*/5") && r.includes("vakttornet.mjs"); },
  },
  {
    namn: "crontab-desk-lakare",
    beskrivning: "DESK-LÄKAREN (*/30)",
    matcha: (rad) => { const r = rad.trim(); return !r.startsWith("#") && r.includes("*/30") && r.includes("/home/ak1a/desk-lakare"); },
  },
];

/** Bevakade vaktfiler (c) — existens på disk. */
const FIL_KONTROLLER = [
  { namn: "fil-kraschvakt.mjs", sokvag: "verktyg/kraschvakt.mjs" },
  { namn: "fil-sitvakt", sokvag: "/home/ak1a/sitvakt" },
  { namn: "fil-vakttornet.mjs", sokvag: "verktyg/vakttornet.mjs" },
  { namn: "fil-desk-halsa.mjs", sokvag: "verktyg/desk-halsa.mjs" },
];

const TORR = process.argv.includes("--torr");
const nu = Date.now();
const iso = new Date(nu).toISOString();
const kontroller = [];
const lakningar = [];
const felRader = [];

function pushKontroll(namn, ok, detalj) {
  kontroller.push({ namn, ok, detalj });
  if (!ok) felRader.push(`paraplyvakt: ${namn} — ${detalj}`);
}

function lasCrontab() {
  try {
    return execFileSync("crontab", ["-l"], { encoding: "utf8", timeout: 15000 });
  } catch (e) {
    return null; // ingen crontab alls — eller crontab(1) otillgänglig
  }
}

/** (a) crontab-raderna */
function kontrolleraCrontab() {
  const saknade = [];
  const cronText = lasCrontab();
  for (const c of CRON_KONTROLLER) {
    const hittad = cronText !== null && cronText.split("\n").some(c.matcha);
    if (hittad) {
      pushKontroll(c.namn, true, "rad installerad i crontab");
    } else {
      const detalj = cronText === null
        ? "crontab kunde inte läsas (saknas eller crontab(1) felar)"
        : `cron-rad saknas: ${c.beskrivning}`;
      pushKontroll(c.namn, false, detalj);
      saknade.push(c);
    }
  }
  return { cronText, saknade };
}

/** (b) pulsen — vakttornet.json skrivs var 5:e minut; sitvakt.log är
 *  åtgärdsjournal (R331) och rapporteras som info utan larmtröskel. */
function kontrolleraPuls() {
  try {
    const mtime = fs.statSync(path.join(ROT, "data/vakten/vakttornet.json")).mtimeMs;
    const alderMin = Math.round((nu - mtime) / 60000);
    const ok = alderMin <= PULS_TROSKEL_MIN;
    pushKontroll(
      "puls-vakttornet.json",
      ok,
      ok ? `${alderMin} min sedan` : `STALE ${alderMin} min (tröskel ${PULS_TROSKEL_MIN}) — vakttornet skall skriva var 5:e minut`
    );
  } catch {
    pushKontroll("puls-vakttornet.json", false, "data/vakten/vakttornet.json saknas/oläsbar — vakttornet har aldrig rapporterat");
  }
  try {
    const mtime = fs.statSync("/home/ak1a/sitvakt.log").mtimeMs;
    const alderMin = Math.round((nu - mtime) / 60000);
    kontroller.push({
      namn: "info-sitvakt.log",
      ok: true,
      detalj: `${alderMin} min sedan senaste åtgärden — sitvakten loggar endast vid omstart (R331); pulsen vaktas av cron-rad + fil-kontroll`,
    });
  } catch {
    kontroller.push({
      namn: "info-sitvakt.log",
      ok: true,
      detalj: "sitvakt.log saknas än (skapas vid sitvaktens första åtgärd)",
    });
  }
}

/** (c) filerna */
function kontrolleraFiler() {
  for (const f of FIL_KONTROLLER) {
    const sokvag = f.sokvag.startsWith("/") ? f.sokvag : path.join(ROT, f.sokvag);
    const finns = fs.existsSync(sokvag);
    pushKontroll(
      f.namn,
      finns,
      finns ? "finns på disk" : `FIL SAKNAS: ${f.sokvag} — rapporterad i larm; paraplyet återskapar ALDRIG vaktkod (ägarens bord)`
    );
  }
}

/** Läkning: saknade cron-rader återinstalleras ur mallen. Append av det
 *  saknade BLOCKET (raden + sina kommentarsrader) — övrig crontab röras
 *  ej. Är crontaben borten/tom installeras mallen HEL. */
function lakaCron({ cronText, saknade }) {
  if (saknade.length === 0) return;
  let mall = null;
  try {
    mall = fs.readFileSync(CRON_MALL, "utf8");
  } catch {
    /* mallen borta — rapporteras nedan */
  }
  if (mall === null) {
    lakningar.push({ ok: false, atgard: `läkning ej möjlig: mallen ${CRON_MALL} saknas` });
    felRader.push(`paraplyvakt: LÄKNING EJ MÖJLIG — mallen ${CRON_MALL} saknas (återskapas ur data/forskning/JARN-U3-PARAPLY.md bilagan)`);
    return;
  }
  const mallRader = mall.split("\n");
  try {
    if (cronText === null || cronText.trim() === "") {
      // Hela crontaben borten/tom: mallen är den fullständiga sanningen
      execFileSync("crontab", [CRON_MALL], { timeout: 15000 });
      lakningar.push({ ok: true, atgard: "hela crontaben återinstallerad ur mallen (crontaben var borten/tom)" });
      felRader.push("paraplyvakt: LÄKTE — hela crontaben återinstallerad ur crontab-v332-mall (crontaben var borten/tom)");
    } else {
      const tillagg = [];
      for (const c of saknade) {
        const idx = mallRader.findIndex(c.matcha);
        if (idx === -1) {
          lakningar.push({ ok: false, atgard: `mallen saknar rad för ${c.beskrivning}` });
          felRader.push(`paraplyvakt: LÄKNING EJ MÖJLIG — mallen ${CRON_MALL} saknar raden för ${c.beskrivning}`);
          continue;
        }
        let start = idx;
        while (start > 0 && mallRader[start - 1].trim().startsWith("#")) start -= 1;
        for (let i = start; i <= idx; i += 1) if (mallRader[i].trim() !== "") tillagg.push(mallRader[i]);
      }
      if (tillagg.length > 0) {
        const tmp = `/tmp/paraplyvakt-crontab-${nu}.tmp`;
        fs.writeFileSync(tmp, cronText.replace(/\s*$/, "\n") + `# paraplyvakt-läkning ${iso}\n` + tillagg.join("\n") + "\n");
        try {
          execFileSync("crontab", [tmp], { timeout: 15000 });
          lakningar.push({ ok: true, atgard: `återinstallerade cron-block ur mallen: ${tillagg.filter((r) => !r.trim().startsWith("#")).join(" | ")}` });
          felRader.push("paraplyvakt: LÄKTE — saknade cron-rader återinstallerade ur crontab-v332-mall");
        } finally {
          try { fs.unlinkSync(tmp); } catch { /* tmp-städning är bästa-försök */ }
        }
      }
    }
    // Verifiera läkningen: crontaben skall nu bära de saknade raderna
    const efter = lasCrontab();
    for (const c of saknade) {
      const ok = efter !== null && efter.split("\n").some(c.matcha);
      lakningar.push({ ok, atgard: `verifiering efter läkning: ${c.beskrivning} ${ok ? "AKTIV i crontab" : "SAKNAS fortfarande"}` });
      if (!ok) felRader.push(`paraplyvakt: läkning verifierad MISSLYCKAD — ${c.beskrivning} saknas fortfarande`);
    }
  } catch (e) {
    lakningar.push({ ok: false, atgard: `crontab-installation misslyckades: ${String(e.message).slice(0, 160)}` });
    felRader.push(`paraplyvakt: LÄKNING MISSLYCKADES — crontab-installation: ${String(e.message).slice(0, 160)}`);
  }
}

/** ALARM till båda desk-ytorna — merglar befintliga rader, dedupe:ar,
 *  skrivfel sväljs ALDRIG dödande (skrivMorkerVagLarm-mönstret, JÄRN-U1). */
function skrivLarm() {
  for (const sokvag of LARM_SOKVAGAR) {
    try {
      let fel = [];
      try {
        const befintlig = JSON.parse(fs.readFileSync(sokvag, "utf8"));
        if (befintlig && Array.isArray(befintlig.fel)) fel = befintlig.fel.filter((f) => typeof f === "string");
      } catch { /* oläsbar/saknad fil — färsk kropp nedan */ }
      for (const r of felRader) if (!fel.includes(r)) fel.push(r);
      fs.writeFileSync(sokvag, JSON.stringify({ lag: "ALARM", t: iso, fel }, null, 2));
    } catch { /* larm-skrivning får ALDRIG döda paraplyet */ }
  }
  try {
    const felNamn = kontroller.filter((k) => !k.ok).map((k) => k.namn).join(",");
    fs.appendFileSync(LARM_LOGG, `${iso} ALARM ${felNamn}\n`, "utf8");
  } catch { /* journalen är bästa-försök, rapporten är sanningen */ }
}

function huvud() {
  const { cronText, saknade } = kontrolleraCrontab();
  kontrolleraPuls();
  kontrolleraFiler();
  if (!TORR) lakaCron({ cronText, saknade });

  const okAntal = kontroller.filter((k) => k.ok).length;
  const lag = okAntal === kontroller.length ? "GRON" : "ALARM";
  if (!TORR) {
    if (lag === "ALARM") skrivLarm();
    try {
      fs.writeFileSync(RAPPORT, JSON.stringify({ t: iso, lag, kontroller, lakningar }, null, 2), "utf8");
    } catch { /* självbeviset får inte döda körningen; stdout bär läget */ }
  }
  const lakStr = lakningar.filter((l) => l.ok).length > 0 ? ` · LÄKTE ${lakningar.filter((l) => l.ok).length}` : "";
  console.log(`PARAPLYVAKT: ${lag} (${okAntal}/${kontroller.length} kontroller OK)${lakStr}${TORR ? " [TORR — inget skrivs]" : ""}`);
}

try {
  huvud();
} catch (e) {
  // Paraplyet skall ALDRIG dö tyst — okontrollerat fel hamnar i cron-loggen
  console.log(`PARAPLYVAKT: KRASCH ${String(e && e.message).slice(0, 200)}`);
}
process.exit(0);
