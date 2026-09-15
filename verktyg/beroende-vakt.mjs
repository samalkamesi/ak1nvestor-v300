#!/usr/bin/env node
/**
 * BEROENDEVAKTEN — säkerhets- och färskhetssäkpå för npm-beroenden.
 *
 * Spår 8 (2026-09-15): fyndet som födde vakten — next 16.3.2 bar en
 * CRITICAL-advisory (RCE) där fixen 16.3.3 låg INOM package.json-intervallet,
 * dvs. en ren patch som ingen upptäckt för att ingen kör `npm audit` i rutin.
 * Denna vakt gör det mekaniskt:
 *
 *   1. `npm audit --json`  — sårbarheter grupperade per allvarlighetsgrad;
 *      fixAvailable=true markerar fix INOM intervallet (prod-synkens enklaste
 *      åtgärd), objekt med isSemVerMajor kräver major-beslut (styrelse/stable).
 *   2. `npm outdated --json` — aktuell vs wanted vs latest; "wanted != aktuell"
 *      = uppdatering inom redan deklarerat intervall (låg risk), "latest >
 *      wanted" = major-steg som köas separat.
 *
 * Installerar ALDRIG något (installationsrätten ägs av prod-synken under
 * /tmp/ak1a-deploy.lock) — vakten är ett måttsystem, inte en verkställare.
 *
 * Körning:  node verktyg/beroende-vakt.mjs [--tidsgrans=120]
 * Lämnar:   data/rapporter/beroende-halsa-SENASTE.md (committad yta)
 *           data/vakten/beroende-vakt-<ts>.json (fullregister, gitignorat)
 * Stdut:    sista raden RESULTAT_JSON={...} (maskinläsbar)
 * Avslut:   0 = inga critical/high · 1 = critical/high finns · 2 = verktygsfel
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const tidsArg = args.find((a) => a.startsWith("--tidsgrans="));
const TIDSGRANS = Math.max(30, parseInt(tidsArg ? tidsArg.split("=")[1] : "120", 10));

function kor(kommando) {
  // npm audit avslutar med 1 när sårbarheter FINNS — det är vaktens arbete,
  // inte ett verktygsfel: läs stdout oavsett exit-kod.
  const r = spawnSync("npm", [kommando, "--json"], {
    cwd: REPO,
    timeout: TIDSGRANS * 1000,
    maxBuffer: 32 * 1024 * 1024,
    encoding: "utf8",
  });
  if (r.error) throw r.error;
  if (!r.stdout || r.stdout.trim() === "") {
    throw new Error(`npm ${kommando} gav ingen utmatning (exit ${r.status ?? "?"}${r.stderr ? `: ${String(r.stderr).slice(0, 120)}` : ""})`);
  }
  return r.stdout;
}

function semverDelar(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v ?? "");
  return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null;
}

/** patch=true endast om samma major+minor; minor inom intervall räknas också lågt */
function steg(fran, till) {
  const a = semverDelar(fran);
  const b = semverDelar(till);
  if (!a || !b) return "okänd";
  if (a.major === b.major && a.minor === b.minor) return "patch";
  if (a.major === b.major) return "minor";
  return "major";
}

// ── mät ─────────────────────────────────────────────────────────────────────
let audit, outdated;
try {
  audit = JSON.parse(kor("audit"));
} catch (e) {
  console.error(`FEL: npm audit misslyckades: ${String(e.message).slice(0, 200)}`);
  process.exit(2);
}
try {
  outdated = JSON.parse(kor("outdated") || "{}");
} catch {
  outdated = {}; // outdated är tom utmatning när allt är aktuellt → inte ett fel
}

const GRADER = ["critical", "high", "moderate", "low", "info"];
const sårbarheter = Object.entries(audit.vulnerabilities ?? {})
  .map(([namn, v]) => ({
    namn,
    grad: v.severity,
    direkt: v.isDirect ?? false,
    via: (v.via ?? [])
      .filter((x) => typeof x === "object")
      .map((x) => ({ titel: x.title, url: x.url, intervall: x.range })),
    fixInomIntervall: v.fixAvailable === true,
    fix: typeof v.fixAvailable === "object" ? v.fixAvailable : null,
  }))
  .sort((a, b) => GRADER.indexOf(a.grad) - GRADER.indexOf(b.grad) || a.namn.localeCompare(b.namn));

const inomIntervall = [];
const majorSteg = [];
for (const [namn, o] of Object.entries(outdated)) {
  const post = {
    namn,
    aktuell: o.current,
    wanted: o.wanted,
    latest: o.latest,
  };
  if (o.wanted !== o.current) {
    post.stegTillWanted = steg(o.current, o.wanted);
    inomIntervall.push(post);
  } else if (o.latest !== o.current) {
    majorSteg.push({ ...post, stegTillLatest: steg(o.current, o.latest) });
  }
}
inomIntervall.sort((a, b) => a.namn.localeCompare(b.namn));
majorSteg.sort((a, b) => a.namn.localeCompare(b.namn));

const antal = (grad) => sårbarheter.filter((s) => s.grad === grad).length;
const kritiska = antal("critical") + antal("high");

// ── rapport ─────────────────────────────────────────────────────────────────
const nu = new Date();
const md = [];
md.push(`# Beroendehälsa — ${nu.toISOString()}`);
md.push("");
md.push(
  `**${sårbarheter.length} sårbarheter (critical ${antal("critical")} · high ${antal("high")} · moderate ${antal("moderate")} · low ${antal("low")}) · ${inomIntervall.length} uppdateringar inom deklarerat intervall · ${majorSteg.length} major-steg.**`,
);
md.push("");
md.push("Vakten mäter — installation ägs av prod-synken under deploy-låset.");
md.push("");
if (sårbarheter.length) {
  md.push("## Sårbarheter");
  md.push("");
  for (const s of sårbarheter) {
    const fix = s.fixInomIntervall
      ? "**fix inom intervall** (prod-synk: `npm install <paket>` räcker)"
      : s.fix
        ? `fix kräver major: ${s.fix.name}@${s.fix.version}`
        : "ingen automatisk fix";
    md.push(`- **[${s.grad}] ${s.namn}**${s.direkt ? " (direkt beroende)" : ""} — ${fix}`);
    for (const v of s.via) md.push(`  - ${v.titel} (${v.intervall}) — ${v.url}`);
  }
  md.push("");
}
if (inomIntervall.length) {
  md.push("## Uppdateringar inom deklarerat intervall (låg risk)");
  md.push("");
  for (const p of inomIntervall) {
    md.push(`- ${p.namn}: ${p.aktuell} → ${p.wanted} (${p.stegTillWanted}) — latest ${p.latest}`);
  }
  md.push("");
}
if (majorSteg.length) {
  md.push("## Major-steg (köas, kräver beslut/test)");
  md.push("");
  for (const p of majorSteg) {
    md.push(`- ${p.namn}: ${p.aktuell} → latest ${p.latest} (${p.stegTillLatest})`);
  }
  md.push("");
}
md.push(
  "_Genererad av `verktyg/beroende-vakt.mjs` (spår 8). Stdut-slutraden RESULTAT_JSON är maskinläsbar; avslutskod 1 vid critical/high = cron-larm._",
);

try {
  mkdirSync(path.join(REPO, "data", "rapporter"), { recursive: true });
  writeFileSync(path.join(REPO, "data", "rapporter", "beroende-halsa-SENASTE.md"), md.join("\n") + "\n");
} catch (e) {
  console.error(`VARNING: rapportfilen kunde inte skrivas: ${e.message}`);
}
try {
  mkdirSync(path.join(REPO, "data", "vakten"), { recursive: true });
  const ts = nu.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  writeFileSync(
    path.join(REPO, "data", "vakten", `beroende-vakt-${ts}.json`),
    JSON.stringify({ tid: nu.toISOString(), sammanfattning: audit.metadata, sårbarheter, inomIntervall, majorSteg }, null, 2),
  );
} catch {
  /* runtime-ytan är bäst-ansats */
}

console.log(md.slice(2, 12).join("\n"));
console.log(
  `RESULTAT_JSON={"sårbarheter":${sårbarheter.length},"critical":${antal("critical")},"high":${antal("high")},"moderate":${antal("moderate")},"inomIntervall":${inomIntervall.length},"majorSteg":${majorSteg.length}}`,
);
process.exit(kritiska > 0 ? 1 : 0);
