#!/usr/bin/env node
/**
 * AGENT-STATUS — AK1A-agentens samlade lägeskoll (våg 100, kunddirektiv
 * "bygg dig själv vidare autonomt … absolut maximala kapacitet").
 *
 * Ett kommando → full situation awareness:
 *   git-läge · senaste våg · prod-hälsa · pm2 · kvalitetsvakt · verktygsbälte.
 *
 * Användning:  node verktyg/agent-status.mjs [--djup]
 *   --djup kör även npx tsc --noEmit (~40 s) och räknar mot baslinjen
 *   TSC_BASLINJE (34 — korrigerad 2026-09-12 av våg-agent V2 [organ:Θ];
 *   gamla talet 36 var totalrader: 34 fel + 2 fortsättningsrader).
 * Sista stdout-raden "RESULTAT_JSON={...}" är maskinläsbar (samma mönster
 * som kvalitetsvakten).
 * Avslutskod: 0 = läget rapporterat (rapport, ej grind).
 */
import { execFile } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { promisify } from "node:util";

const kör = promisify(execFile);
const ROT = new URL("..", import.meta.url).pathname;
const DJUP = process.argv.includes("--djup");

async function skal(kommando, args, timeout = 10_000) {
  try {
    const r = await kör(kommando, args, { cwd: ROT, timeout });
    return r.stdout.toString().trim();
  } catch {
    return null;
  }
}

function tidstämpel() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
}

// ── 1. GIT ─────────────────────────────────────────────────────────────────
const [gren, smutsigaRader, logg] = await Promise.all([
  skal("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
  skal("git", ["status", "--porcelain"]),
  skal("git", ["log", "--oneline", "-3"]),
]);
const smutsiga = smutsigaRader ? smutsigaRader.split("\n").filter(Boolean).length : null;

// ── 2. SENASTE VÅG (worklog + styrelsens mega-dokument, bakifrån) ─────────
// Worklog-tråden slutar vid våg 89; våg 90+ protokollförs i STYRELSE-
// ADMIN-MEGA.md — visa den senaste av båda källorna.
function lasSenasteVag(fil, rx) {
  try {
    const rad = readFileSync(fil, "utf8").split("\n").reverse().find((l) => rx.test(l));
    if (!rad) return null;
    const n = rad.match(/VÅG\s*(\d+)/i);
    return { text: rad.replace(/^#+\s*/, "").slice(0, 90), n: n ? parseInt(n[1], 10) : 0, styrelse: fil.includes("STYRELSE") };
  } catch {
    return null;
  }
}
const vagKandidater = [
  lasSenasteVag(`${ROT}worklog.md`, /^## (VÅG|MOLNLEVERANS)/i),
  lasSenasteVag(`${ROT}data/forskning/STYRELSE-ADMIN-MEGA.md`, /^## VÅG/i),
].filter(Boolean);
vagKandidater.sort((a, b) => b.n - a.n);
const senasteVag = vagKandidater.length
  ? `${vagKandidater[0].text} — (${vagKandidater[0].styrelse ? "styrelsens dokument" : "worklog"})`
  : "—";

// ── 3. PROD (HTTPS + prod-repo + pm2) ─────────────────────────────────────
let prod = { kod: null, innehall: false, ms: null };
const t0 = Date.now();
try {
  const r = await fetch("https://lab.ak1nvestor.com/", {
    headers: { "User-Agent": "ak1a-agent-status" },
    signal: AbortSignal.timeout(12_000),
  });
  const t = await r.text();
  prod = { kod: r.status, innehall: t.includes("AK1A"), ms: Date.now() - t0 };
} catch {
  /* prod onåbart */
}
const [prodCommit, pm2Json] = await Promise.all([
  skal("git", ["-C", "/home/ak1a/AK1", "log", "--oneline", "-1"], 8000),
  skal("pm2", ["jlist"], 8000),
]);
let pm2Status = "okänd";
if (pm2Json) {
  try {
    const ak1a = JSON.parse(pm2Json).find((p) => p.name === "ak1a");
    if (ak1a) pm2Status = String(ak1a.pm2_env?.status ?? "okänd");
  } catch {
    /* pm2-svar oparsbart */
  }
}

// ── 4. KVALITET (senaste rapport) ─────────────────────────────────────────
let vakten = "—", motorer = "—";
try {
  const rapp = readFileSync(`${ROT}data/rapporter/kvalitetsrapport-SENASTE.md`, "utf8");
  // PARSNING: enbart resultaträderna — dokumentationsraden "Statusregler:
  // RÖD = ..." får ALDRIG tolkas som status.
  const status =
    rapp.match(/## ANTAL FEL:[^\n]*STATUS:\s*(RÖD|GUL|GRÖN)/) ||
    rapp.match(/STATUS:\s*(RÖD|GUL|GRÖN)/);
  vakten = status ? status[1] : "—";
  const mot = rapp.match(/RESULTAT:\s*(\d+) PASS \/ (\d+) FAIL \/ (\d+) SKIP/);
  if (mot) motorer = `${mot[1]}/${mot[2]}/${mot[3]}`;
} catch {
  /* rapport saknas */
}

// ── 5. VERKTYGSBÄLTET ─────────────────────────────────────────────────────
const bälte = (() => {
  try {
    return readdirSync(`${ROT}.zcode/skills`).filter((d) =>
      existsSync(`${ROT}.zcode/skills/${d}/SKILL.md`),
    ).length;
  } catch {
    return 0;
  }
})();
const kommandon = (() => {
  try {
    return readdirSync(`${ROT}.zcode/commands`).filter((f) => f.endsWith(".md")).length;
  } catch {
    return 0;
  }
})();

// ── 6. DJUP: tsc mot baslinjen ────────────────────────────────────────────
// TSC_BASLINJE = exakt antal rader med "error TS" (2026-09-12 21:20 UTC,
// commit 436ad6f7; räkna ALDRIG totalrader — 2 av dem är fortsättningsrader).
const TSC_BASLINJE = 34;
let tsc = null;
if (DJUP) {
  const ut = await skal("npx", ["tsc", "--noEmit"], 150_000);
  if (ut !== null) {
    const n = (ut.match(/error TS/g) || []).length;
    tsc = { fel: n, baslinje: TSC_BASLINJE, nya: Math.max(0, n - TSC_BASLINJE) };
  } else {
    tsc = { fel: null, baslinje: TSC_BASLINJE, nya: null };
  }
}

// ── RAPPORT ────────────────────────────────────────────────────────────────
const L = [];
L.push("══ AGENT-STATUS — AK1A Research Lab ══");
L.push(`Tid: ${tidstämpel()}`);
L.push("");
L.push("── GIT ──");
L.push(`Gren: ${gren ?? "?"} · Smutsiga filer: ${smutsiga ?? "?"}`);
if (logg) L.push(logg.split("\n").map((l) => `  ${l}`).join("\n"));
L.push("");
L.push("── VÅG ──");
L.push(`Senaste i worklog: ${senasteVag}`);
L.push("");
L.push("── PROD (lab.ak1nvestor.com) ──");
L.push(
  `HTTPS: ${prod.kod ?? "ONÅBAR"} ${prod.innehall ? "· AK1A-innehåll JA" : prod.kod ? "· AK1A-innehåll NEJ" : ""} ${prod.ms !== null ? `· ${prod.ms} ms` : ""}`,
);
L.push(`Prod-commit: ${prodCommit ?? "?"}`);
L.push(`pm2 'ak1a': ${pm2Status}`);
L.push("");
L.push("── KVALITET (senaste rapport) ──");
L.push(`Vakten: ${vakten} · Motorer PASS/FAIL/SKIP: ${motorer}`);
if (tsc) L.push(`tsc --djup: ${tsc.fel ?? "?"} fel (baslinje ${tsc.baslinje}, nya ${tsc.nya ?? "?"})`);
L.push("");
L.push("── VERKTYGSBÄLTET ──");
L.push(`Färdigheter: ${bälte} · Kommandon: ${kommandon}`);
L.push("");
const uppmärksamhet = [];
if (prod.kod !== 200) uppmärksamhet.push(`prod ≠ 200 (${prod.kod ?? "onåbar"}) — se drift-ops`);
if (pm2Status !== "online") uppmärksamhet.push(`pm2 ak1a '${pm2Status}' — se drift-ops`);
if (vakten === "RÖD") uppmärksamhet.push("kvalitetsvakten RÖD — åtgärda före leverans");
if (motorer !== "—" && !/^107\/0\/0$/.test(motorer)) uppmärksamhet.push(`motorer avviker: ${motorer}`);
if (tsc && tsc.nya > 0) uppmärksamhet.push(`tsc: ${tsc.nya} NYA fel över baslinjen`);
L.push(uppmärksamhet.length ? "Uppmärksamhet:\n" + uppmärksamhet.map((u) => `  ⚠ ${u}`).join("\n") : "Uppmärksamhet: ingen — läget GRÖNT.");
console.log(L.join("\n"));
console.log(
  `RESULTAT_JSON=${JSON.stringify({ tid: tidstämpel(), gren, smutsiga, senasteVag, prod: prod.kod, pm2: pm2Status, vakten, motorer, bälte, kommandon, tsc, uppmärksamhet })}`,
);
