#!/usr/bin/env node
/**
 * AK1A — VERKSTÄLLARVÄNTARE o144 (Spår 7, s7-u2 DEL 3): §9-körordningen
 * som överlever sessionen (o121-precedensen: nohup-mätkedja).
 *
 * LÄGET: prod-synken är RAM-spärrad av fabrikens EGNA barn — DEPLOYAD
 * lossnar först när omgången (inkl. den agent som startar denna process)
 * avslutar och frigör ~0,8-3 GB. En session som "väntar kvar" spärrar
 * alltså det den väntar på (o144 §1c:s ekvation). KUREN: agenten avslutar
 * rent, DENNA lätta väntare (~40 MB, ingen Chrome under väntan) passar
 * fönstret och verkställer maskinellt vid DEPLOYAD.
 *
 * Sekvens (anspråkets UPPDATERING 1 — kor.mjs täcker internt o139:s
 * LH_JAMFOR=o139-efter + geometri, därför ingen separat §9-steg-4-körning):
 *   0. polla prod-synk.log tills ny DEPLOYAD-hash (≠ baseline) — max 3 h
 *   1. node verktyg/_s7u2o144-kanal.mjs          (exit 0 = spökmät-skydd öppnat)
 *   2. node verktyg/_s7u2o139efter-kor.mjs        (o139 §8: prod200+CSS+LH+geometri)
 *   3. node verktyg/prestanda-lighthouse.mjs o144-efterN /dataset  (N = 1..5)
 *   4. node verktyg/_s7u2o144-funktion.mjs        (o143 §7.4 pillklick ×3 språk)
 * RAM-vakt före varje tungt steg (≥ 1 500 MB, som mest 15 min väntan) —
 * aldrig kollidera med prod-synkens byggfönster eller syskon-sonder.
 *
 * Bokföring (protokoll/worklog/commit) sker AV LEVANDE AGENT — denna
 * process skriver endast fakta: logg + status-JSON. Steg 6 (vakten)
 * lämnas åt cron (RAM-disciplin); dubbelverkställning spärras av låsfil.
 *
 * Start: node verktyg/_s7u2o144-starta.mjs (detached).
 * Logg:   /tmp/s7u2o144-verkstall.log
 * Status: data/forskning/OPTIMERING/lighthouse/verkstall-o144-status.json
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = process.cwd();
const LOGG = "/tmp/s7u2o144-verkstall.log";
const SYNK = join(ROT, "data/vakten/prod-synk.log");
const STATUSFIL = join(ROT, "data/forskning/OPTIMERING/lighthouse/verkstall-o144-status.json");
const LOCK = "/tmp/s7u2o144-verkstall.lock";
const POLL_MS = 45_000;
const MAX_MS = 3 * 60 * 60_000;
const RAM_MIN_MB = 1_500;
const RAM_MAX_VILA_MS = 15 * 60_000;

const logga = (rad) => appendFileSync(LOGG, `${new Date().toISOString()} ${rad}\n`);
const lasStatus = () => { try { return JSON.parse(readFileSync(STATUSFIL, "utf8")); } catch { return null; } };
const skrivStatus = (s) => writeFileSync(STATUSFIL, JSON.stringify(s, null, 2) + "\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Sista DEPLOYAD-hash i prod-synk.log (generös hash-extraktion), eller null. */
function senastDeployad() {
  try {
    const rader = readFileSync(SYNK, "utf8").split("\n").filter((r) => r.includes("DEPLOYAD"));
    if (!rader.length) return null;
    const m = rader.at(-1).match(/([0-9a-f]{7,40})/);
    return m ? m[1] : null;
  } catch { return null; }
}

function memAvailableMb() {
  const m = readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+) kB/);
  return m ? Math.round(Number(m[1]) / 1024) : 0;
}

/** Vila tills ≥ RAM_MIN MB tillgängligt (som mest RAM_MAX_VILA_MS). */
async function vantaRam(namn) {
  const start = Date.now();
  while (memAvailableMb() < RAM_MIN_MB) {
    if (Date.now() - start > RAM_MAX_VILA_MS) {
      logga(`RAM-VAKT ${namn}: ger efter ${Math.round(RAM_MAX_VILA_MS / 60000)} min — kör ändå (${memAvailableMb()} MB).`);
      return;
    }
    logga(`RAM-VAKT ${namn}: ${memAvailableMb()} MB < ${RAM_MIN_MB} — vilar 60 s.`);
    await sleep(60_000);
  }
}

// ── Idempotens: redan klar eller låst av levande väntare? ──────────────
const status0 = lasStatus();
if (status0 && status0.status === "klar") {
  console.log("verkstall-o144 redan klar — avslutar (idempotent).");
  process.exit(0);
}
if (existsSync(LOCK)) {
  let gamal = null;
  try { gamal = Number(readFileSync(LOCK, "utf8").trim()); } catch { /* tom låsfil */ }
  if (gamal) {
    const lever = spawnSync("kill", ["-0", String(gamal)], { stdio: "ignore" }).status === 0;
    if (lever && gamal !== process.pid) {
      console.error(`verkstall-o144 låst av levande pid ${gamal} — avslutar.`);
      process.exit(0);
    }
    logga(`låsfil med död pid ${gamal} — övertar.`);
  }
}
writeFileSync(LOCK, String(process.pid));

const baseline = senastDeployad() || "ingen";
logga(`─ väntare startad pid ${process.pid} · baseline-DEPLOYAD ${baseline} · poll ${POLL_MS / 1000} s · tak ${MAX_MS / 60000} min`);

// ── Steg 0: passa deployfönstret (ingen Chrome här — RAM-disciplin) ───
let deployHash = null;
const startTs = Date.now();
while (Date.now() - startTs < MAX_MS) {
  const h = senastDeployad();
  if (h && h !== baseline) { deployHash = h; break; }
  await sleep(POLL_MS);
}
if (!deployHash) {
  logga(`TAK UPPNÅTT: ingen ny DEPLOYAD inom ${MAX_MS / 60000} min — avslutar (deploy-skulden kvarstår för nästa våg).`);
  skrivStatus({ status: "timeout", ts: new Date().toISOString(), baseline, kvar: "o144 §9 steg 1-5 overkställda" });
  process.exit(0);
}
logga(`DEPLOYAD ${deployHash} — kanalgrind öppnas.`);

// ── Steg 1-4: §9-verkställande, EN i taget (RAM-disciplin) ────────────
const STEG = [
  { namn: "1-kanal", args: ["verktyg/_s7u2o144-kanal.mjs"], tung: false, timeout: 120_000 },
  { namn: "2-kor-o139", args: ["verktyg/_s7u2o139efter-kor.mjs"], tung: true, timeout: 900_000 },
  { namn: "3-lh-dataset-1", args: ["verktyg/prestanda-lighthouse.mjs", "o144-efter1", "/dataset"], tung: true, timeout: 420_000 },
  { namn: "3-lh-dataset-2", args: ["verktyg/prestanda-lighthouse.mjs", "o144-efter2", "/dataset"], tung: true, timeout: 420_000 },
  { namn: "3-lh-dataset-3", args: ["verktyg/prestanda-lighthouse.mjs", "o144-efter3", "/dataset"], tung: true, timeout: 420_000 },
  { namn: "3-lh-dataset-4", args: ["verktyg/prestanda-lighthouse.mjs", "o144-efter4", "/dataset"], tung: true, timeout: 420_000 },
  { namn: "3-lh-dataset-5", args: ["verktyg/prestanda-lighthouse.mjs", "o144-efter5", "/dataset"], tung: true, timeout: 420_000 },
  { namn: "4-funktion-o143", args: ["verktyg/_s7u2o144-funktion.mjs"], tung: true, timeout: 300_000 },
];

const status = {
  status: "pågår",
  startad: new Date(startTs).toISOString(),
  deployad: deployHash,
  baseline,
  steg: [],
  fortsattning: "NÄSTA LEVANDE AGENT: fyll o144 §3-§6 + facit i o139 §8 / o143 §7 + worklog + commit (§9 steg 7) ur denna status + verktygens egna JSON-utfiler.",
};
skrivStatus(status);

for (const steg of STEG) {
  if (steg.tung) await vantaRam(steg.namn);
  logga(`STEG ${steg.namn}: kör → ${steg.args.join(" ")}`);
  const r = spawnSync(process.execPath, steg.args, {
    cwd: ROT, timeout: steg.timeout, encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
  });
  const svans = (t) => String(t || "").split("\n").filter(Boolean).slice(-12).join("\n");
  const post = {
    namn: steg.namn, exit: r.status, timeout: r.status === null, tidSek: Math.round((r.duration || 0) / 1000),
  };
  if (r.status !== 0) {
    logga(`STEG ${steg.namn} FEL (exit ${r.status}${post.timeout ? " TIMEOUT" : ""}):\n${svans(r.stderr || r.stdout)}`);
    post.felSvans = svans(r.stderr || r.stdout).slice(-800);
    status.steg.push(post);
    status.status = "avbruten";
    status.avbrutenVid = steg.namn;
    skrivStatus(status);
    logga(`─ avbryter kedjan (kanal-/kontraktsbrott skall aldrig mätas vidare; spökmät-disciplinen).`);
    process.exit(1);
  }
  logga(`STEG ${steg.namn} OK (${post.tidSek} s):\n${svans(r.stdout)}`);
  status.steg.push(post);
  skrivStatus(status);
}

status.status = "klar";
status.klarTs = new Date().toISOString();
skrivStatus(status);
logga(`─ HELA §9-kedjan (steg 1-5) KÖRD GRÖNT mot deploy ${deployHash} — fakta på disk; bokföring väntar levande agent.`);
