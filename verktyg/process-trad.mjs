#!/usr/bin/env node
// PROCESS-TRÄDET (F2-rotkuren 2026-09-20) — gemensamma verktyg för att se
// och döda processträd säkert. Född ur driftsincidenten F2:
//   * prod-synkens deploy-omstart 06:10:41 lokal lämnade pm2:s gamla
//     app-träd ("sh -c next start -p 3000" → next-server) föräldralöst
//     (PPid 1) med port 3000 — pm2 errored i EADDRINUSE-slinga 27 min
//     medan ORTEN svarade 200 (HTTPS-kontrollen + kraschvaktens okNu
//     mätte grönt mot fel process);
//   * testernas dev-fönster läckte "next dev -p 3000 -p 3117" (PPid 1,
//     5 h) när en SIGKILL-död förälder aldrig hann städa.
// Kontrakt: ALL dödning verifierar cmdline först (pid-återanvändning får
// ALDRIG döda fel process) och ALDRIG korsas in i anroparens eget träd.
// Linux-only (/proc + ss) — Windows-anropare har egna grenar sedan tidigare.
import { execSync } from "node:child_process";
import fs from "node:fs";

/** PPid ur /proc/<pid>/status — null = borta/okänd. */
export function lasPpid(pid) {
  try {
    const status = fs.readFileSync(`/proc/${pid}/status`, "utf8");
    const m = status.match(/^PPid:\s+(\d+)$/m);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

/** Cmdline (nollbyte-joinad) — "" om borta. */
export function lasCmdline(pid) {
  try {
    return fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").split("\0").join(" ").trim();
  } catch {
    return "";
  }
}

/** Stiger kedjan pid → … → anor? lasPpidFn injicerbar för kontraktstest.
 * Loop-säker (maxDjup) — en cirkulär /proc-korrupt får aldrig hänga oss. */
export function arAttling(pid, anor, lasPpidFn = lasPpid, maxDjup = 8) {
  let nu = pid;
  for (let i = 0; i < maxDjup && nu != null; i++) {
    if (nu === anor) return true;
    if (nu === 1) return false;
    nu = lasPpidFn(nu);
  }
  return false;
}

/** Gå UPP från pid till trädroten; stanna före init (1) och FÖRE anroparens
 * egna process — ort-roten är definitionen "föräldralös sedan föräldern dog". */
export function hittaOrtRot(pid, lasPpidFn = lasPpid, maxDjup = 16) {
  let rot = pid;
  let nu = pid;
  for (let i = 0; i < maxDjup; i++) {
    const ppid = lasPpidFn(nu);
    if (ppid == null || ppid <= 1 || ppid === process.pid) break;
    rot = ppid;
    nu = ppid;
  }
  return rot;
}

/** Lyssnar-ägare för port ur ss -ltnp: { finnas, pid } · { finnas:true,
 * pid:null } när ss hemlighåller pid · { okand:true } när ss inte svarar. */
export function hamtaPortagare(port) {
  try {
    const ss = execSync("ss -ltnp", { encoding: "utf8", timeout: 10_000 });
    const rad = ss
      .split("\n")
      .find((r) => /LISTEN/.test(r) && new RegExp(`(?::|\\])${port}\\s`).test(r));
    if (!rad) return { finnas: false };
    const m = rad.match(/pid=(\d+)/);
    return { finnas: true, pid: m ? Number(m[1]) : null };
  } catch {
    return { okand: true };
  }
}

/** Alla pids i delträdet rot → ättlingar (via /proc-skalning). */
export function samlaTrad(rotPid) {
  const ppidAv = new Map();
  try {
    for (const entry of fs.readdirSync("/proc")) {
      if (!/^\d+$/.test(entry)) continue;
      const pp = lasPpid(Number(entry));
      if (pp != null) ppidAv.set(Number(entry), pp);
    }
  } catch {
    /* /proc oläsbar → bara roten */
  }
  const trad = [];
  const stack = [rotPid];
  while (stack.length) {
    const pid = stack.pop();
    trad.push(pid);
    for (const [barn, pp] of ppidAv) if (pp === pid) stack.push(barn);
  }
  return trad;
}

/** Döda delträdet rot → ättlingar: cmdline-verifiering (monster) FÖRE
 * signal — bara processer som ser ut som förväntat dödas — sedan
 * SIGTERM → vila → SIGKILL-trappa. Returnerar de verifierade målen. */
export async function dodaDeltrad(rotPid, monster = /next|node|npm/, vilaMs = 4_000) {
  const mal = samlaTrad(rotPid).filter((p) => {
    const cmd = lasCmdline(p);
    return cmd !== "" && monster.test(cmd);
  });
  for (const p of mal) {
    try {
      process.kill(p, "SIGTERM");
    } catch {
      /* redan borta */
    }
  }
  await new Promise((r) => setTimeout(r, vilaMs));
  for (const p of mal) {
    try {
      process.kill(p, 0);
      process.kill(p, "SIGKILL");
    } catch {
      /* redan borta */
    }
  }
  return mal;
}
