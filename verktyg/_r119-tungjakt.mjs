#!/usr/bin/env node
/** R119 / V230: TUNG-jakt — den SJETTE döden lärt oss timingen: TUNG + en
 *  fabriksomgång på samma 8 GB-box = kärnan dödar aggregatet. Strategin är
 *  koordination, inte tålmodigare getenväntande: VÄNTA in ett fabriksljugt
 *  fönster (ko tom + inga fabriksagenter + RAM ≥ 3 GB), STARTA då TUNG —
 *  och lita på fabrikens egen RAM-vakt (vägrar omgång under 1 500 MB) som
 *  då köar BAKOM TUNG i stället för att mörda det.
 *  Återupptagning: --fortsatt läser V229-suffixrapporten (v214 GRÖN bevaras,
 *  bara testa-styrelse mäts). F2-vaccinet städar eventuellt läckt dev-server.
 *  Bokföringen (worklog + commit) görs av sessionen — wrappern loggar bara. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/agent/ak1";
const PROD = "/home/ak1a/AK1";
const LOGG = `${ROT}/data/vakten/r119-tungjakt.log`;
const RAPPORT = `${ROT}/data/vakten/testaggregator-SENASTE-testa-styrelse.json`;
const DEADLINE_MS = 2 * 60 * 60 * 1000; // sammanlagt tak: 2 h
const START = Date.now();
const log = (s) => fs.appendFileSync(LOGG, `${new Date().toISOString()} ${s}\n`);

function ramMB() {
  try {
    const m = fs.readFileSync("/proc/meminfo", "utf8").match(/^MemAvailable:\s+(\d+) kB/m);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch { return null; }
}
function fabrikskoTom() {
  try { return fs.readdirSync(`${PROD}/data/vakten/agentfabrik/ko`).filter((f) => f.endsWith(".json")).length === 0; }
  catch { return false; }
}
function fabriksagenterAktiva() {
  try {
    const ps = execFileSync("ps", ["-eo", "args", "--no-headers"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    return ps.split("\n").some((r) => r.includes("fabriksagent"));
  } catch { return true; } // fail-stängd: ingen start vid okänd processbild
}
function rapportKlar() {
  try {
    const r = JSON.parse(fs.readFileSync(RAPPORT, "utf8"));
    return r;
  } catch { return null; }
}

log(`TUNGJAKT R119 start — strategi: fabriksljugt fönster → --fortsatt → fabrikens RAM-vakt köar bakom`);
let barnPid = null;
let startadVid = null;
let forsok = 0;
const MAX_FORSOK = 2;
for (;;) {
  if (Date.now() - START > DEADLINE_MS) {
    log(`TAK NÅTT (2 h) utan${barnPid ? " avslutad körning" : " fönster"} — ärlig avslut, nästa rond återupptar`);
    process.exit(barnPid ? 3 : 2);
  }
  if (barnPid === null) {
    const ram = ramMB();
    const fko = fabrikskoTom();
    const faktiva = fabriksagenterAktiva();
    if (ram !== null && ram >= 3000 && fko && !faktiva) {
      const barn = spawn("node", ["verktyg/kor-alla-tester.mjs", "--fortsatt", "--monster=testa-styrelse"], {
        cwd: ROT,
        env: { ...process.env, NO_COLOR: "1" },
        detached: true,
        stdio: ["ignore", fs.openSync(LOGG, "a"), fs.openSync(LOGG, "a")],
      });
      barn.unref();
      barnPid = barn.pid;
      startadVid = Date.now();
      log(`FÖNSTER ÖPPET (ram=${ram}MB, ko tom, fabriken idle) — TUNG återupptagen pid=${barnPid}`);
    } else {
      if (Math.floor((Date.now() - START) / 60000) % 5 === 0) {
        log(`väntar fönster: ram=${ram}MB ko=${fko ? "tom" : "full"} fabrik=${faktiva ? "aktiv" : "idle"}`);
      }
    }
  } else {
    // barn startat: lever det? (ps -p returnerar tom rad om dött)
    let lever = false;
    try { lever = execFileSync("ps", ["-p", String(barnPid), "-o", "pid=", "--no-headers"], { encoding: "utf8" }).trim() !== ""; } catch {}
    const r = rapportKlar();
    if (!lever) {
      const sammanfattning = r
        ? `status=${r.status} matta=${r.matta}/${r.upptackta} grona=${r.grona} roda=${r.roda}`
        : "ingen rapport läslig";
      log(`BARN DÖD (pid ${barnPid}) efter ${Math.round((Date.now() - startadVid) / 1000)} s — ${sammanfattning}`);
      if (r && r.status === "KLAR") {
        log(`RESULTAT: KLAR — matta=${r.matta}/${r.upptackta} grona=${r.grona} roda=${r.roda} — bokför i worklog`);
        process.exit(0);
      }
      forsok += 1;
      if (forsok >= MAX_FORSOK) {
        log(`RESULTAT: ${forsok} döda körningar utan KLAR-rapport (de sammanbundna dödsfallen bokförs i worklog) — ger upp ärligt, forensik nästa rond`);
        process.exit(4);
      }
      log(`försök ${forsok}/${MAX_FORSOK} dog — väntar nytt fönster och återupptar igen`);
      barnPid = null;
    } else if (r && r.status === "KLAR") {
      log(`RESULTAT: KLAR — matta=${r.matta}/${r.upptackta} grona=${r.grona} roda=${r.roda} — bokför i worklog`);
      process.exit(0);
    }
  }
  await new Promise((r2) => setTimeout(r2, 60_000));
}
