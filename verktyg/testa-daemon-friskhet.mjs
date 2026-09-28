#!/usr/bin/env node
// testa-daemon-friskhet.mjs — v195 svit: deterministisk fixture-styrning av
// daemon-friskhet-vakt.mjs (r290-läxan). 9 kontroller, 0 nätverk, 0 pm2.
// Körning: node verktyg/testa-daemon-friskhet.mjs
import { mkdtempSync, writeFileSync, utimesSync, rmSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "verktyg", "daemon-friskhet-vakt.mjs");

const tmp = mkdtempSync(path.join(tmpdir(), "friskhet-"));
const vaktdir = path.join(tmp, "vakten");
mkdirSync(vaktdir, { recursive: true });

const NU = Date.now();
const iso = (ms) => new Date(ms).toISOString();

// fixture-källfiler med styrda mtimes
const kallor = {
  pumpor: path.join(tmp, "pumpor-daemon.mjs"),
  hundvakt: path.join(tmp, "pumpor-hundvakt.mjs"),
  pulsvakt: path.join(tmp, "pulsvakt.mjs"),
};
for (const k of Object.values(kallor)) writeFileSync(k, "// fixture\n");

function jlistFil(namn, poster) {
  const fil = path.join(tmp, `${namn}.json`);
  writeFileSync(fil, JSON.stringify(poster));
  return fil;
}

const proc = (name, kalla, startMs, extra = {}) => ({
  name,
  pm2_env: {
    status: "online",
    pm_uptime: startMs,
    pm_exec_path: extra.exec ?? kalla,
    args: extra.args ?? [],
    pm_cwd: tmp,
  },
});

function kor(jlist) {
  const env = {
    ...process.env,
    AK1A_FRISKHET_JLIST: jlist,
    AK1A_FRISKHET_VAKTDIR: vaktdir,
  };
  execFileSync("node", [VAKT], { env, encoding: "utf8", timeout: 20000 });
  return JSON.parse(readFileSync(path.join(vaktdir, "daemon-friskhet.json"), "utf8"));
}

function lasLarm() {
  const fil = path.join(vaktdir, "konfig-larm.jsonl");
  if (!existsSync(fil)) return [];
  return readFileSync(fil, "utf8").split("\n").filter(Boolean).map((r) => JSON.parse(r));
}

const resultat = [];
const kontroll = (id, namn, ok, bevis) => resultat.push({ id, namn, ok, bevis });

try {
  // K1 grönt: alla källor äldre än processstart
  utimesSync(kallor.pumpor, new Date(NU - 3600_000), new Date(NU - 3600_000));
  utimesSync(kallor.hundvakt, new Date(NU - 3600_000), new Date(NU - 3600_000));
  utimesSync(kallor.pulsvakt, new Date(NU - 3600_000), new Date(NU - 3600_000));
  let lage = kor(jlistFil("k1", [
    proc("ak1a-pumpor", kallor.pumpor, NU - 60_000),
    proc("pumpor-hundvakt", kallor.hundvakt, NU - 60_000),
    proc("pulsvakt", kallor.pulsvakt, NU - 60_000),
  ]));
  kontroll("K1", "grönt läge (disk < start) — status GRÖN, 0 larmrader", lage.status === "GRÖN" && lasLarm().length === 0, `status=${lage.status} larm=${lasLarm().length}`);

  // K2 glapp: pumpor-daemonens källa 10 min NYARE än starten ⇒ LARM
  utimesSync(kallor.pumpor, new Date(NU + 600_000), new Date(NU + 600_000));
  lage = kor(jlistFil("k2", [
    proc("ak1a-pumpor", kallor.pumpor, NU),
    proc("pumpor-hundvakt", kallor.hundvakt, NU - 60_000),
    proc("pulsvakt", kallor.pulsvakt, NU - 60_000),
  ]));
  const larm = lasLarm();
  kontroll("K2", "glapp > 5 min ⇒ LARM + jsonl-rad typ DAEMON-KODGLAPP med område", lage.status === "LARM" && larm.length === 1 && larm[0].typ === "DAEMON-KODGLAPP" && larm[0].omrade === "ak1a-pumpor" && typeof larm[0].meddelande === "string", `status=${lage.status} larm=${JSON.stringify(larm[0]?.typ)}/${larm[0]?.omrade}`);

  // K3 tröskel: glapp 4 min (240 s < 300 s) = pågående leverans ⇒ GRÖN
  utimesSync(kallor.pulsvakt, new Date(NU + 240_000), new Date(NU + 240_000));
  const larmFore = lasLarm().length;
  lage = kor(jlistFil("k3", [
    proc("ak1a-pumpor", kallor.pumpor, NU + 700_000), // start EFTER disk-mtime ⇒ grönt igen
    proc("pumpor-hundvakt", kallor.hundvakt, NU - 60_000),
    proc("pulsvakt", kallor.pulsvakt, NU),
  ]));
  kontroll("K3", "tröskeltolerans: glapp 240 s larmar ej (deployfönster) + omstartad process är grön", lage.processer["pulsvakt"].status === "OK" && lage.processer["pulsvakt"].glappSek === 240 && lasLarm().length === larmFore, `pulsvakt=${lage.processer["pulsvakt"].status}/${lage.processer["pulsvakt"].glappSek}s larm=${lasLarm().length}`);

  // K4 rate-limit: kvarstående glapp inom 10 min ⇒ ingen NY rad
  utimesSync(kallor.pumpor, new Date(NU + 600_000), new Date(NU + 600_000));
  kor(jlistFil("k4", [proc("ak1a-pumpor", kallor.pumpor, NU), proc("pumpor-hundvakt", kallor.hundvakt, NU - 60_000), proc("pulsvakt", kallor.pulsvakt, NU - 60_000)]));
  kontroll("K4", "rate-limit: andra körningen med kvarstående glapp lägger INTE ny jsonl-rad", lasLarm().length === 1, `larm=${lasLarm().length}`);

  // K5 rate-limit utgången: backdatera senasteLarm 11 min ⇒ ny rad
  const lageFil = path.join(vaktdir, "daemon-friskhet.json");
  const lag = JSON.parse(readFileSync(lageFil, "utf8"));
  lag.senasteLarm["ak1a-pumpor"] = Date.now() - 11 * 60_000;
  writeFileSync(lageFil, JSON.stringify(lag));
  kor(jlistFil("k5", [proc("ak1a-pumpor", kallor.pumpor, NU), proc("pumpor-hundvakt", kallor.hundvakt, NU - 60_000), proc("pulsvakt", kallor.pulsvakt, NU - 60_000)]));
  kontroll("K5", "rate-limit-utgång: 11 min gammalt larm ⇒ ny rad (episoden ackumulerar)", lasLarm().length === 2, `larm=${lasLarm().length}`);

  // K6 taskset-wrapp: exec=/usr/bin/taskset, .mjs i args (mtimes återställda till grönt)
  utimesSync(kallor.pumpor, new Date(NU - 7200_000), new Date(NU - 7200_000));
  utimesSync(kallor.pulsvakt, new Date(NU - 7200_000), new Date(NU - 7200_000));
  lage = kor(jlistFil("k6", [
    proc("ak1a-pumpor", null, NU - 3600_000, { exec: "/usr/bin/taskset", args: ["-c", "0-3", "node", kallor.pumpor] }),
    proc("pumpor-hundvakt", kallor.hundvakt, NU - 3600_000),
    proc("pulsvakt", kallor.pulsvakt, NU - 3600_000),
  ]));
  kontroll("K6", "taskset-uppackning: källfilen hittas i args", lage.status === "GRÖN" && lage.processer["ak1a-pumpor"].kalla === kallor.pumpor, `kalla=${lage.processer["ak1a-pumpor"].kalla}`);

  // K7 okänd/ned process: ej i BEVAKA + ej online ⇒ OBS/EJ ONLINE, aldrig krasch
  lage = kor(jlistFil("k7", [
    { name: "ak1a", pm2_env: { status: "online", pm_uptime: NU, pm_exec_path: "node", args: [] } },
    { name: "pulsvakt", pm2_env: { status: "stopped", pm_uptime: NU, pm_exec_path: kallor.pulsvakt, args: [] } },
  ]));
  kontroll("K7", "obevakad process hoppas + stopped ⇒ EJ ONLINE (ej larm, ej krasch)", lage.status === "GRÖN" && lage.processer["pulsvakt"].status === "EJ ONLINE", `pulsvakt=${lage.processer["pulsvakt"].status}`);

  // K8 saknad källfil: OBS-rad, grönläge
  rmSync(kallor.hundvakt);
  lage = kor(jlistFil("k8", [
    proc("ak1a-pumpor", kallor.pumpor, NU - 3600_000),
    proc("pumpor-hundvakt", kallor.hundvakt, NU - 3600_000),
    proc("pulsvakt", kallor.pulsvakt, NU - 3600_000),
  ]));
  kontroll("K8", "saknad källfil ⇒ OBS-rad, aldrig krasch/larm utan glappbevis", lage.processer["pumpor-hundvakt"].status === "OK" && String(lage.processer["pumpor-hundvakt"].OBS).includes("ej funnen"), `OBS=${lage.processer["pumpor-hundvakt"].OBS}`);

  // K9 jsonl-giltighet: varje rad parserar (trivialt sant om lasLarm ej kastat)
  kontroll("K9", "jsonl-journalen radvis giltig JSON", lasLarm().every((r) => r.ts && r.typ), `${lasLarm().length} rader`);

  // K10 git-artefakt: prod-synkens pull skriver om mtider UTAN innehållsändring
  // (r290-v195: hundvaktens mtime 07:17 vs senaste innehålls-commit 05:13).
  // Mini-git-träd: commit backdaterad 2 h, fil touch:ad NU, start NU-1h ⇒ GRÖN.
  const gittr = path.join(tmp, "repo");
  mkdirSync(path.join(gittr, "verktyg"), { recursive: true });
  const gitKalla = path.join(gittr, "verktyg", "pumpor-hundvakt.mjs");
  writeFileSync(gitKalla, "// fixture i git\n");
  const backdaterad = new Date(NU - 7200_000).toISOString();
  const genv = { ...process.env, GIT_AUTHOR_DATE: backdaterad, GIT_COMMITTER_DATE: backdaterad, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
  execFileSync("git", ["-C", gittr, "init", "-q"], { env: genv, timeout: 15000 });
  execFileSync("git", ["-C", gittr, "add", "."], { env: genv, timeout: 15000 });
  execFileSync("git", ["-C", gittr, "commit", "-q", "-m", "fixture"], { env: genv, timeout: 15000 });
  utimesSync(gitKalla, new Date(), new Date()); // pull-artefakt: mtime NU
  lage = kor(jlistFil("k10", [proc("pumpor-hundvakt", gitKalla, NU - 3600_000)]));
  kontroll("K10", "git-artefakt: mtime-glapp 1 h men innehålls-commit 2 h ⇒ GRÖN (tsKalla=git)", lage.processer["pumpor-hundvakt"].status === "OK" && lage.processer["pumpor-hundvakt"].tsKalla === "git", `status=${lage.processer["pumpor-hundvakt"].status} tsKalla=${lage.processer["pumpor-hundvakt"].tsKalla}`);

  // K11 git-fel ⇒ mtime-fallback larmar ÄKTA glapp ändå (fil utanför git)
  const ogit = path.join(tmp, "ogit", "daemon.mjs");
  mkdirSync(path.join(tmp, "ogit"), { recursive: true });
  writeFileSync(ogit, "// utanför git\n");
  utimesSync(ogit, new Date(NU + 600_000), new Date(NU + 600_000)); // 10 min-glapp
  lage = kor(jlistFil("k11", [proc("ak1a-pumpor", ogit, NU)]));
  kontroll("K11", "fallback: utan git-träd mäter mtime ⇒ äkta glapp larmar (tsKalla=mtime)", lage.processer["ak1a-pumpor"].status === "LARM" && lage.processer["ak1a-pumpor"].tsKalla === "mtime", `status=${lage.processer["ak1a-pumpor"].status} tsKalla=${lage.processer["ak1a-pumpor"].tsKalla}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const pass = resultat.filter((r) => r.ok).length;
console.log(resultat.map((r) => `${r.ok ? "PASS" : "FAIL"}  ${r.id} ${r.namn} — ${r.bevis}`).join("\n"));
console.log(`SVIT: ${pass}/${resultat.length} ${pass === resultat.length ? "PASS" : "FAIL"}`);
process.exit(pass === resultat.length ? 0 : 1);
