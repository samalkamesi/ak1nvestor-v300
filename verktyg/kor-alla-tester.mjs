#!/usr/bin/env node
/**
 * KÖR-ALLA-TESTER — testaggregatorn (VÅG 212, E35:s gap 1: "aggregatorn
 * 123 sviter utan kör-alla = provtagningen fördjupas per dygn").
 * =====================================================================
 * Behov (SYSTEMKARTAN E35, dokvåg 2026-09-19): verktyg/ bär 124 testa-*.mjs
 * sviter men INGEN mekanism kör dem alla — varje svit är provtagning som
 * bara mäts när någon råkar köra den. Aggregatorn gör HELA bältet mekaniskt:
 *
 *   · upptäcker ALLA verktyg/testa-*.mjs (sorterat, deterministiskt)
 *   · kör SEKVENTIELLT (ingen parallellism — 8 GB-servern delar minne med
 *     pm2, fabrikens zcode-barn och chrome-cronen; sekvens = förutsägbar topp)
 *   · RAM-VAKT före varje svit (fabrikens mönster): < 900 MB tillgängligt ⇒
 *     vänta i 60 s-steg, tak 20 min/svit; frigörs det aldrig ⇒ ärlig stopp
 *     "avbruten-ram" — utförda sviter bevaras, --fortsatt återupptar
 *   · timeout per svit (default 900 s, --tak=S): SIGTERM ⇒ 5 s ⇒ SIGKILL —
 *     ett hängande barn kan aldrig frysa hela svepet
 *   · klassificering: exit 0 = GRÖN · exit ≠0 = RÖD · timeout = RÖD(timeout)
 *     · spawn-fel = RÖD — ofullständig mätning är ALDRIG grönt (vakt-doktrin)
 *   · kvitto-rad: sista stdout-rad som ser ut som ett resultat (PASS/FAIL/
 *     RESULTAT/GRÖN…) — sviternas egna utdata är sanningen, aggregatorn
 *     hittar bara på INGA tal
 *   · RESULTAT_JSON-summa på sista raden (kvalitetsvaktens konvention —
 *     cron/ronder parsar den)
 *
 * Utdata (runtime, gitignorerade vägar — SENASTE-konventionen):
 *   data/vakten/testaggregator-SENASTE.md   — läsbar rapport (tabell + summa)
 *   data/vakten/testaggregator-SENASTE.json — rådata + återupptagningsläge
 *
 * Användning:
 *   node verktyg/kor-alla-tester.mjs [--fortsatt] [--mönster=regex] [--tak=sek]
 * Avslutskod: 0 = komplett svep med 0 RÖDA · 1 = RÖDA/avbrutet · 2 = argumentfel
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAPPORT_MD = path.join(REPO, "data", "vakten", "testaggregator-SENASTE.md");
const RAPPORT_JSON = path.join(REPO, "data", "vakten", "testaggregator-SENASTE.json");
const VERKTYG = path.join(REPO, "verktyg");

const RAM_TRSKEL_MB = 900;     // fabrikens princip: aldrig starta tungt barn under detta
const RAM_VANTA_TAK_S = 20 * 60; // per svit: vänta högst 20 min på minne
const TERM_TOLERANS_S = 5;     // SIGTERM ⇒ 5 s ⇒ SIGKILL

// ── argument ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FORTSATT = args.includes("--fortsatt");
const TAK_STANDARD = 900;
let takSek = TAK_STANDARD;
let monster = null;
for (const a of args) {
  if (a.startsWith("--tak=")) {
    const n = Number(a.slice(6));
    if (!Number.isFinite(n) || n < 30 || n > 7200) {
      console.error(`ogiltigt --tak (30–7200 s): ${a}`);
      process.exit(2);
    }
    takSek = Math.round(n);
  } else if (a.startsWith("--mönster=") || a.startsWith("--monster=")) {
    try {
      monster = new RegExp(a.slice(a.indexOf("=") + 1), "u");
    } catch (e) {
      console.error(`ogiltigt mönster: ${e.message}`);
      process.exit(2);
    }
  } else if (a !== "--fortsatt") {
    console.error(`okänt argument: ${a}`);
    process.exit(2);
  }
}

/** Tillgängligt RAM i MB ur /proc/meminfo — null vid fel (fail-open). */
function ramTillgangligtMB() {
  try {
    const m = readFileSync("/proc/meminfo", "utf8").match(/^MemAvailable:\s+(\d+) kB/m);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

/** Vänta på minne — true när tillgängligt, false när taket nåddes. */
async function vantaRam() {
  const start = Date.now();
  for (;;) {
    const ram = ramTillgangligtMB();
    if (ram === null || ram >= RAM_TRSKEL_MB) return true;
    if (Date.now() - start >= RAM_VANTA_TAK_S * 1000) return false;
    console.log(`  väntar-ram: ${ram} MB < ${RAM_TRSKEL_MB} MB (fabriksbarn/chrome?) — 60 s …`);
    await new Promise((r) => setTimeout(r, 60_000));
  }
}

/** Kör EN svit med timeout + gradvis avlivning. */
function korSvit(fil, takS) {
  return new Promise((res) => {
    const barn = spawn(process.execPath, [fil], {
      cwd: REPO,
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let ut = "";
    let fel = "";
    if (barn.stdout) {
      barn.stdout.setEncoding("utf8");
      barn.stdout.on("data", (d) => { ut += d; });
    }
    if (barn.stderr) {
      barn.stderr.setEncoding("utf8");
      barn.stderr.on("data", (d) => { fel += d; });
    }
    const t0 = Date.now();
    const klar = (status) => {
      clearTimeout(tid);
      res({ ...status, sekunder: Math.round((Date.now() - t0) / 1000) });
    };
    const doda = (efter) => {
      try { barn.kill("SIGTERM"); } catch { /* redan borta */ }
      setTimeout(() => {
        try { barn.kill("SIGKILL"); } catch { /* redan borta */ }
      }, efter * 1000);
    };
    let dodadAvTimeout = false;
    const tid = setTimeout(() => {
      dodadAvTimeout = true;
      doda(TERM_TOLERANS_S);
    }, takS * 1000);
    barn.on("error", (e) => klar({ status: "RÖD", orsak: `spawn-fel: ${String(e.message).slice(0, 120)}`, ut, fel }));
    barn.on("close", (kod) =>
      klar(
        dodadAvTimeout
          ? { status: "RÖD", orsak: `timeout efter ${takS} s (SIGTERM⇒SIGKILL)`, ut, fel }
          : kod === 0
            ? { status: "GRÖN", orsak: null, ut, fel }
            : { status: "RÖD", orsak: `exit ${kod}`, ut, fel },
      ),
    );
  });
}

/** Sista resultatliknande raden ur stdout — svitens egna tal, aldrig påhittade. */
function kvittoRad(resultat) {
  const rader = String(resultat.ut || "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  for (let i = rader.length - 1; i >= 0; i--) {
    if (/(PASS|FAIL|GRÖN|RÖD|GUL|RESULTAT|KLAR|OK\b)/i.test(rader[i])) {
      return rader[i].slice(0, 160);
    }
  }
  return (rader[rader.length - 1] ?? "(tyst utdata)").slice(0, 160);
}

/** Sista stderr-raden — RÖDA sviters rotorsak ska synas i rapporten. */
function sistaFelRad(resultat) {
  const rader = String(resultat.fel || "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  return rader.length > 0 ? rader[rader.length - 1].slice(0, 160) : null;
}

// ── huvud ───────────────────────────────────────────────────────────────────
const t0 = Date.now();
let sviter = readdirSync(VERKTYG)
  .filter((f) => f.startsWith("testa-") && f.endsWith(".mjs"))
  .sort();
if (monster) sviter = sviter.filter((f) => monster.test(f));

// återupptagning: färdigmätta sviter hoppas över (idempotens som fabriken)
let tidigare = {};
if (FORTSATT && existsSync(RAPPORT_JSON)) {
  try {
    const gammal = JSON.parse(readFileSync(RAPPORT_JSON, "utf8"));
    if (gammal && Array.isArray(gammal.sviter)) {
      for (const s of gammal.sviter) tidigare[s.fil] = s;
    }
  } catch { /* trasig rådata ⇒ färskt svep */ }
}

const resultatLista = [];
let avbrutenRam = false;
console.log(`[kör-alla-tester] ${sviter.length} sviter (${FORTSATT ? "återupptagning" : "färskt svep"}, tak ${takSek} s/svit, RAM-tröskel ${RAM_TRSKEL_MB} MB)`);

for (const fil of sviter) {
  if (tidigare[fil]) {
    resultatLista.push(tidigare[fil]);
    continue;
  }
  if (!(await vantaRam())) {
    avbrutenRam = true;
    console.log(`AVBRYTER-RAM före ${fil} — ${resultatLista.length}/${sviter.length} mätta; kör om med --fortsatt`);
    break;
  }
  process.stdout.write(`  ${fil} … `);
  const r = await korSvit(path.join(VERKTYG, fil), takSek);
  const post = {
    fil,
    status: r.status,
    orsak: r.orsak,
    sekunder: r.sekunder,
    kvitto: kvittoRad(r),
    sistaFel: r.status === "RÖD" ? sistaFelRad(r) : null,
  };
  resultatLista.push(post);
  console.log(`${r.status} (${r.sekunder} s) — ${post.kvitto}`);
}

// ── summering + rapport ─────────────────────────────────────────────────────
const Grona = resultatLista.filter((s) => s.status === "GRÖN");
const Roda = resultatLista.filter((s) => s.status === "RÖD");
const omatta = sviter.length - resultatLista.length;
const status = omatta > 0 || avbrutenRam ? "AVBRUTEN" : Roda.length === 0 ? "GRÖN" : "RÖD";
const korTidSek = Math.round((Date.now() - t0) / 1000);
const startIso = new Date().toISOString();

const md = [];
md.push(`# KÖR-ALLA-TESTER — testaggregatorn (VÅG 212 / E35 gap 1)`);
md.push("");
md.push(`- **Genererad:** ${startIso} · körtid ${Math.floor(korTidSek / 60)} min ${korTidSek % 60} s`);
md.push(`- **Sviter:** ${sviter.length} upptäckta · ${resultatLista.length} mätta · ${Grona.length} GRÖNA · ${Roda.length} RÖDA · ${omatta} omätta`);
md.push(`- **Läge:** ${FORTSATT ? "återupptagning" : "färskt svep"} · tak ${takSek} s/svit · sekventiellt (RAM-delning med pm2/fabrik/chrome-cron)`);
md.push(`- **Klassregler:** exit 0 = GRÖN · exit ≠0 = RÖD · timeout = RÖD — ofullständig mätning är ALDRIG grönt`);
md.push("");
md.push(`## RÖDA sviter (${Roda.length})`);
md.push("");
if (Roda.length === 0) {
  md.push("Inga.");
} else {
  md.push(`| Svit | Orsak | Kvitto/sista utdata |`);
  md.push(`|---|---|---|`);
  for (const s of Roda) {
    md.push(`| ${s.fil} | ${s.orsak ?? "-"} | ${((s.sistaFel ?? s.kvitto) ?? "-").replaceAll("|", "\\|")} |`);
  }
}
md.push("");
md.push(`## Alla sviter (${resultatLista.length})`);
md.push("");
md.push(`| Svit | Status | Sek | Kvitto |`);
md.push(`|---|---|---:|---|`);
for (const s of resultatLista) {
  md.push(`| ${s.fil} | **${s.status}** | ${s.sekunder} | ${s.kvitto.replaceAll("|", "\\|")} |`);
}
md.push("");
md.push(`## SUMMA: ${Grona.length} GRÖNA | ${Roda.length} RÖDA | ${omatta} OMÄTTA | STATUS: ${status}`);
md.push("");

mkdirSync(path.dirname(RAPPORT_MD), { recursive: true });
writeFileSync(RAPPORT_MD, md.join("\n") + "\n", "utf8");
writeFileSync(
  RAPPORT_JSON,
  JSON.stringify(
    {
      genererad: startIso,
      korTidSek,
      takSek,
      lage: FORTSATT ? "fortsatt" : "farsk",
      avbrutenRam,
      upptackta: sviter.length,
      matta: resultatLista.length,
      grona: Grona.length,
      roda: Roda.length,
      omatta,
      status,
      sviter: resultatLista,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(`rapport: ${path.relative(REPO, RAPPORT_MD)}`);
const resultat = { grona: Grona.length, roda: Roda.length, omatta, matta: resultatLista.length, status };
console.log("RESULTAT_JSON=" + JSON.stringify(resultat));
process.exit(status === "GRÖN" ? 0 : 1);
