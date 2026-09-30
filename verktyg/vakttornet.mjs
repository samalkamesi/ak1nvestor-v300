#!/usr/bin/env node
/**
 * VAKTTORNET — A–O-ekosystemövervakning (cron var 5:e minut)
 * ==========================================================
 * ÅTERSKAPAT 2026-09-30 (r350, ägarronden JÄRN-U3 §8 beställde). Originalet
 * (r332) byggdes 2026-09-29 ~14:35 men blev UNTRACKED — aldrig committat —
 * och raderades 21:55:42 av kraschvaktens trädåterställning medan cron-raden
 * levde vidare som zombie (MODULE_NOT_FOUND var 5:e minut sedan dess).
 *
 * REKONSTRUKTIONSKÄLLOR (ingen gissning — varje val är bevisat):
 *   1. data/vakten/vakttornet.json (originalets SISTA rapport 21:55:18.407Z):
 *      exakt 15 kontroller = A–O, med namn, detaljformat och klassindikationer
 *      (login-backup "18 h — varning ej larm"; fabriks-puls ok vid 80 min).
 *   2. data/vakten/vakttornet-cron.log: stdout-format
 *      "VAKTTORNET: OK (15/15 kontroller OK)" / "VAKTTORNET: ALARM (n/15 …)".
 *   3. data/vakten/vakttornet-larm.log: journalfomat "<iso> ALARM <namn,namn>".
 *   4. /desk/larm.json (BÅDA ytorna): originalets rader är PREFIXLÖSA
 *      ("app-framsida: HTTP 502") — till skillnad från paraplyets prefix.
 *   5. data/forskning/JARN-U3-PARAPLY.md: skrivMorkerVagLarm-kontraktet
 *      (merge+dedupe, båda desk-ytorna) + att GRÖNSKRIVNINGEN av larm.json
 *      ägs av VAKTTORNET (paraplyet skriver endast vid egna fynd).
 *
 * TRÖSKLAR som originalets rapport inte bevisar är dokumenterat valda
 * försiktigt (JÄRN-U3 §3:s princip — en vakt som larmar falskt avinstalleras
 * av trötthet): fabriks-puls 24 h · disk 10 % · ram 1 500 MB (fabrikens egen
 * RAM-vakt-tröskel) · supabase-dump 48 h (två missade nätter) · login-backup
 * larm först efter 72 h (varningstext efter 12 h, originalets klass) ·
 * cert 14 dagar (certbot förnyar långt före).
 *
 * ALDRIG-döda-principen: varje kontroll svarar (ok=false vid eget fel),
 * exit-kod är ALLTID 0 — läget bärs av stdout + rapportens "lag"-fält.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAPPORT = path.join(ROT, "data/vakten/vakttornet.json");
const LARM_LOGG = path.join(ROT, "data/vakten/vakttornet-larm.log");
const LARM_SOKVAGAR = ["/var/www/desk/larm.json", "/home/ak1a/desk-web/larm.json"];
const APP_BAS = "http://localhost:3000"; // loopback är whitelistat i middleware

const TORR = process.argv.includes("--torr");
const nu = Date.now();
const iso = new Date(nu).toISOString();
const kontroller = [];
const felRader = [];

function pushKontroll(namn, ok, detalj) {
  kontroller.push({ namn, ok, detalj });
  if (!ok) felRader.push(`${namn}: ${detalj}`);
}

/** Hämta en app-sida med timeout; ok = HTTP-status under 400 (3xx-rutter lever).
 *  Returnerar ett Promise — se huvud(): async-kontrollerna måste vara KLARA
 *  före synkrona subprocess-anrop, annars blockerar execFileSync event-loopen
 *  så svaren aldrig hinner hanteras (bevisat i r350-verifieringen). */
function kontrolleraSida(namn, url) {
  return new Promise((lost) => {
    const klar = (ok, detalj) => { pushKontroll(namn, ok, detalj); lost(); };
    const req = http.get(url, { timeout: 10000 }, (res) => {
      const kod = typeof res.statusCode === "number" ? res.statusCode : 0;
      klar(kod > 0 && kod < 400, `HTTP ${kod}`);
      res.resume(); // töm strömmen — vi vill bara ha statusen
    });
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
    req.on("error", (e) => klar(false, String(e && e.message).slice(0, 120)));
  });
}

/** Originalets desk-hälsokontrakt: kör desk-halsa.mjs och vänta en
 *  RESULTAT-rad i stdout — kontraktet är RADENS NÄRVARO, inte exit-koden
 *  (bevisat r350: desk-halsa skriver "RESULTAT: 7/8 PASS" och avslutar
 *  ändå exit 1 när en delkontroll FAIL:ar — det är levererat svar). */
function kontrolleraDeskHalsa() {
  let ut = "";
  let felinfo = "";
  try {
    ut = execFileSync("node", ["verktyg/desk-halsa.mjs"], {
      cwd: ROT, timeout: 120000, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    }).toString();
  } catch (e) {
    ut = ((e && e.stdout) || "").toString();
    felinfo = `; stderr: ${((e && e.stderr) || "").toString().slice(0, 110).replace(/\n/g, " ")}`;
  }
  const ok = ut.includes("RESULTAT");
  pushKontroll("desk-halsa", ok, ok ? "RESULTAT-rad hittad" : `inget RESULTAT${felinfo}`);
}

/** pm2-processernas liv (originalets kontrollnamn pm2-ak1a ↔ processnamn ak1a). */
function pm2Status(kontrollNamn, pm2Namn) {
  try {
    const lista = JSON.parse(execFileSync("pm2", ["jlist"], { timeout: 20000, encoding: "utf8" }));
    const p = Array.isArray(lista) ? lista.find((x) => x && x.name === pm2Namn) : null;
    const status = p && p.pm2_env && p.pm2_env.status;
    pushKontroll(kontrollNamn, status === "online", String(status || "processen finns ej i pm2-listan"));
  } catch (e) {
    pushKontroll(kontrollNamn, false, `pm2 jlist felar: ${String(e && e.message).slice(0, 110)}`);
  }
}

/** Fabrikens puls: senaste filrörelsen under agentfabriks-katalogen
 *  (originalet visade "80 min sedan" som OK — tröskel 24 h är safe). */
function kontrolleraFabriksPuls() {
  try {
    const bas = path.join(ROT, "data/vakten/agentfabrik");
    let senast = 0;
    const las = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        try {
          const st = fs.statSync(p);
          if (st.mtimeMs > senast) senast = st.mtimeMs;
          if (st.isDirectory()) las(p);
        } catch { /* enskild fils stat får aldrig döda pulsen */ }
      }
    };
    las(bas);
    const min = Math.round((nu - senast) / 60000);
    pushKontroll("fabriks-puls", min <= 1440, `${min} min sedan`);
  } catch (e) {
    pushKontroll("fabriks-puls", false, `agentfabriks-katalogen oläsbar: ${String(e && e.message).slice(0, 110)}`);
  }
}

function kontrolleraDisk() {
  try {
    const ut = execFileSync("df", ["-P", "/"], { timeout: 15000, encoding: "utf8" }).toString();
    const rad = ut.split("\n")[1] || "";
    const procent = parseInt((rad.match(/(\d+)%/) || [])[1] || "0", 10);
    const ledigt = 100 - procent;
    pushKontroll("disk-ledigt", ledigt >= 10, `${ledigt}% ledigt`);
  } catch (e) {
    pushKontroll("disk-ledigt", false, `df felar: ${String(e && e.message).slice(0, 110)}`);
  }
}

function kontrolleraRam() {
  try {
    const info = fs.readFileSync("/proc/meminfo", "utf8");
    const kB = parseInt((info.match(/MemAvailable:\s+(\d+)/) || [])[1] || "0", 10);
    const mb = Math.round(kB / 1024);
    pushKontroll("ram", mb >= 1500, `${mb} MB`);
  } catch (e) {
    pushKontroll("ram", false, `/proc/meminfo oläsbar: ${String(e && e.message).slice(0, 110)}`);
  }
}

/** Nyaste nattliga supabase-dumpens ålder (cron skriver db-ÅÅÅÅ-MM-DD.sql.gz). */
function kontrolleraSupabaseDump() {
  try {
    const dir = path.join(ROT, "data/backups/supabase");
    const filer = fs.readdirSync(dir).filter((f) => /^db-.*\.sql\.gz$/.test(f));
    if (filer.length === 0) { pushKontroll("supabase-dump", false, "inga db-*.sql.gz i data/backups/supabase"); return; }
    const senast = filer.reduce((mx, f) => {
      const m = fs.statSync(path.join(dir, f)).mtimeMs;
      return m > mx ? m : mx;
    }, 0);
    const h = Math.round((nu - senast) / 3600000);
    pushKontroll("supabase-dump", h <= 48, `${h} h`);
  } catch (e) {
    pushKontroll("supabase-dump", false, `backupskatalogen oläsbar: ${String(e && e.message).slice(0, 110)}`);
  }
}

/** Login-backupen (cron 03:47 nattligen). Originalets klass: varning efter
 *  12 h UTAN larm ("18 h — varning ej larm") — larm först efter 72 h. */
function kontrolleraLoginBackup() {
  try {
    const st = fs.statSync("/home/ak1a/desk-login-backup");
    const h = Math.round((nu - st.mtimeMs) / 3600000);
    pushKontroll("login-backup", h <= 72, `${h} h${h > 12 ? " — varning ej larm" : ""}`);
  } catch (e) {
    pushKontroll("login-backup", false, "/home/ak1a/desk-login-backup saknas/oläsbar");
  }
}

/** TLS-certifikatets återstående dagar mot skarp domän. */
function kontrolleraCert() {
  return new Promise((lost) => {
    const klar = (ok, detalj) => { pushKontroll("cert", ok, detalj); lost(); };
    const soket = tls.connect({ host: "lab.ak1nvestor.com", port: 443, servername: "lab.ak1nvestor.com", timeout: 10000 }, () => {
      try {
        const cert = soket.getPeerCertificate();
        if (!cert || !cert.valid_to) { klar(false, "peer-certifikat saknar valid_to"); }
        else {
          const dagar = Math.round((new Date(cert.valid_to).getTime() - nu) / 86400000);
          klar(dagar >= 14, `${dagar} dagar kvar`);
        }
      } catch (e) {
        klar(false, `cert-läsning felade: ${String(e && e.message).slice(0, 110)}`);
      } finally {
        soket.destroy();
      }
    });
    soket.on("timeout", () => { soket.destroy(new Error("timeout")); });
    soket.on("error", (e) => klar(false, String(e && e.message).slice(0, 120)));
  });
}

/** ALARM: prefixlösa rader (originalets format) merglas+dedupe:as in på BÅDA
 *  desk-ytorna — skrivMorkerVagLarm-kontraktet (JÄRN-U1). GRÖNSKRIVNING:
 *  vakttornet ÄGER larm.json:s grönskrivning (JÄRN-U3 §2) — vid GRON
 *  rensas utdöda larm helt; paraplyet återinför sina PÅGÅENDE fynd vid
 *  nästa varv (10-min cykeln), så inget levande larm kan kvävas. */
function skrivLarm(lag) {
  for (const sokvag of LARM_SOKVAGAR) {
    try {
      if (lag === "GRON") {
        fs.writeFileSync(sokvag, JSON.stringify({ lag: "GRON", t: iso, fel: [] }, null, 2));
        continue;
      }
      let fel = [];
      try {
        const befintlig = JSON.parse(fs.readFileSync(sokvag, "utf8"));
        if (befintlig && Array.isArray(befintlig.fel)) fel = befintlig.fel.filter((f) => typeof f === "string");
      } catch { /* oläsbar/saknad — färsk kropp nedan */ }
      for (const r of felRader) if (!fel.includes(r)) fel.push(r);
      fs.writeFileSync(sokvag, JSON.stringify({ lag: "ALARM", t: iso, fel }, null, 2));
    } catch { /* larm-skrivning får ALDRIG döda tornet */ }
  }
  try {
    if (lag === "ALARM") {
      const felNamn = kontroller.filter((k) => !k.ok).map((k) => k.namn).join(",");
      fs.appendFileSync(LARM_LOGG, `${iso} ALARM ${felNamn}\n`, "utf8");
    }
  } catch { /* journalen är bästa-försök; rapporten är sanningen */ }
}

async function huvud() {
  // A–E + O först (async): appens fem publika sidor + certet, parallellt —
  // de måste vara KLARA före synkrona subprocess-anrop (execFileSync blockerar
  // event-loopen; pågående HTTP-väntan hade blivit timeout, bevisat r350)
  await Promise.all([
    kontrolleraSida("app-framsida", `${APP_BAS}/`),
    kontrolleraSida("app-kurser", `${APP_BAS}/kurser`),
    kontrolleraSida("app-blogg", `${APP_BAS}/blogg`),
    kontrolleraSida("app-logga-in", `${APP_BAS}/logga-in`),
    kontrolleraSida("app-integritetspolicy", `${APP_BAS}/integritetspolicy`),
    kontrolleraCert(),
  ]);
  // F–N: ekosystemet (synkront — filer, processer, subprocesser)
  kontrolleraDeskHalsa();
  pm2Status("pm2-ak1a", "ak1a");
  pm2Status("pm2-ak1a-pumpor", "ak1a-pumpor");
  pm2Status("pm2-pulsvakt", "pulsvakt");
  kontrolleraFabriksPuls();
  kontrolleraDisk();
  kontrolleraRam();
  kontrolleraSupabaseDump();
  kontrolleraLoginBackup();

  const okAntal = kontroller.filter((k) => k.ok).length;
  const lag = okAntal === kontroller.length ? "GRON" : "ALARM";
  if (!TORR) {
    skrivLarm(lag);
    try {
      fs.writeFileSync(RAPPORT, JSON.stringify({ t: iso, lag, kontroller }, null, 2), "utf8");
    } catch { /* självbeviset får inte döda körningen; stdout bär läget */ }
  }
  console.log(`VAKTTORNET: ${lag} (${okAntal}/${kontroller.length} kontroller OK)${TORR ? " [TORR — inget skrivs]" : ""}`);
}

try {
  await huvud(); // top-level await — exit FÖRST när kontroller + skrivningar är klara
} catch (e) {
  // Tornet skall ALDRIG dö tyst — okontrollerat fel hamnar i cron-loggen
  console.log(`VAKTTORNET: KRASCH ${String(e && e.message).slice(0, 200)}`);
}
process.exit(0);
