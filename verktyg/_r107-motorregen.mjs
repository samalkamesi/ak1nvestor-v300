#!/usr/bin/env node
// ROND 107 / VÅG 212 — MOTORREGISTER-REGEN (E35 gap 2: "motorregistret 09-03,
// regenereras med testtäckningskolumner"). Metod:
//   · BEVARAR registrets 42 manuella poster orörda (beskrivning/monterad/gap
//     är mänsklig kunskap) — uppdaterar ENDAST mekaniska fält:
//     testad (svit-referens?) + testverktygAlla (alla sviter som nämner filen)
//   · KARTLÄGGER nya motorer mekaniskt: AI-Mentorns frågelager (v210:s eget
//     språkbruk KALLAR dem motorer — "kedjan 58 motorer") + moduler som
//     tillkommit efter 09-03; beskrivning ur filens egna rubrikkommentar,
//     monterad ur import-grep i src/app + src/components, testad ur svit-grep
//   · UTESLUTER rena typfiler (typer.ts — definitioner, ingen intelligens)
//   · normaliserar kompositsökvägar ("fil.ts (+ x.ts)" → exists-bar path)
// Förhandsgranskning till /tmp/r107-register-preview.json; riktiga filen
// skrivs först efter granskning (skriptet kräver --skriv för landning).
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKRIV = process.argv.includes("--skriv");
const regSokvag = path.join(REPO, "data", "motorregister.json");
const register = JSON.parse(fs.readFileSync(regSokvag, "utf8"));

// ── underlag: sviter + deras innehåll ──────────────────────────────────────
const verktygDir = path.join(REPO, "verktyg");
const svitInnehall = new Map();
for (const f of fs.readdirSync(verktygDir)) {
  if (/^testa-.*\.mjs$/.test(f) || f === "validera-motorer.mjs") {
    try {
      svitInnehall.set(f, fs.readFileSync(path.join(verktygDir, f), "utf8"));
    } catch { /* hoppas */ }
  }
}

// ── underlag: importerande filer i src (monteringsytor) ───────────────────
const kallFiler = [];
(function vandla(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) vandla(p);
    else if (/\.(ts|tsx)$/.test(f)) kallFiler.push({ vag: path.relative(REPO, p).replaceAll("\\", "/"), src: fs.readFileSync(p, "utf8") });
  }
})(path.join(REPO, "src"));

/** Alla sviter som refererar modulens basnamn (fil utan ändelse). */
function sviterFor(basnamn) {
  return [...svitInnehall.entries()].filter(([, src]) => src.includes(basnamn)).map(([f]) => f);
}

/** Monteringsytor: src-filer som importerar modulen. */
function monteradFor(basnamn) {
  return kallFiler.filter((k) => k.src.includes(basnamn)).map((k) => k.vag);
}

function lasHeader(relVag) {
  try {
    const src = fs.readFileSync(path.join(REPO, relVag), "utf8").slice(0, 4000);
    const m = src.match(/\/\*\*([\s\S]*?)\*\//) || src.match(/^\/\/([\s\S]*?)\n\n/m);
    if (!m) return null;
    const text = m[1]
      .split("\n")
      .map((r) => r.replace(/^\s*\*? ?/, "").trim())
      .filter(Boolean)
      .join(" ");
    return text.slice(0, 240);
  } catch {
    return null;
  }
}

const i = (arr) => [...new Set(arr)].sort();

// ── 1) befintliga poster: gallring av bortsopade filer + mekanisk testtäcknings-uppdatering ──
// (o108: poster vars fil saknas på disk lämnar registret — annars återförs spökposter
// vid varje regen; gallringen listas transparent i utdata, aldrig tyst)
const normalisera = (fil) => fil.split(" (+")[0].trim();
let uppdaterade = 0;
const gallradeUrRegistret = [];
register.motorer = register.motorer.filter((m) => {
  const fil = normalisera(m.fil);
  if (!fs.existsSync(path.join(REPO, fil))) { gallradeUrRegistret.push(`${m.namn} (${fil})`); return false; }
  return true;
});
for (const m of register.motorer) {
  const fil = normalisera(m.fil);
  const bas = path.basename(fil, path.extname(fil));
  const sviter = i(sviterFor(bas));
  const testad = sviter.length > 0;
  if (m.testad !== testad || !m.testverktygAlla || m.testverktygAlla.join("|") !== sviter.join("|")) uppdaterade++;
  m.fil = fil; // kompositsökvägar normaliseras (komponenterna ligger i postens beskrivning)
  m.testad = testad;
  m.testverktygAlla = sviter;
}

// ── 2) nya motorer: mekanisk kartläggning ─────────────────────────────────
const kanda = new Set(register.motorer.map((m) => m.fil));
const kandidater = [];
for (const f of fs.readdirSync(path.join(REPO, "src", "lib"))) {
  if (/ai-mentor-.*-fragor\.ts$/.test(f)) kandidater.push(`src/lib/${f}`);
}
for (const extra of [
  "src/lib/portfolj-forskning/peer.ts",
  "src/lib/portfolj-forskning/akm2-koppling.ts",
  "src/lib/portfolj-forskning/korstabell-data.ts",
]) {
  if (fs.existsSync(path.join(REPO, extra))) kandidater.push(extra);
}
kandidater.sort();

const nyaPoster = [];
for (const fil of kandidater) {
  if (kanda.has(fil)) continue;
  const bas = path.basename(fil, ".ts");
  const sviter = i(sviterFor(bas));
  const monterade = monteradFor(bas).filter((v) => v !== fil);
  const cron = monterade.filter((v) => v.includes("/api/cron/"));
  const api = monterade.filter((v) => v.includes("/api/") && !v.includes("/api/cron/"));
  const ui = monterade.filter((v) => v.includes("/components/") || v.includes("/app/"));
  nyaPoster.push({
    namn: bas,
    fil,
    typ: /-fragor\.ts$/.test(fil) ? "frågelager-motor (AI-Mentorn)" : "stödsystem/modul",
    beskrivning: lasHeader(fil) ?? "(rubrikkommentar saknas — mekaniskt tillagd 2026-09-19)",
    monterad: monterade.slice(0, 8),
    autonomi: cron.length > 0 ? "cron" : api.length > 0 ? "api" : ui.length > 0 ? "klient (UI-monterad)" : "exporterad (ingen direkt import hittad)",
    testad: sviter.length > 0,
    testverktyg: sviter.length > 0 ? sviter.slice(0, 4).join(" · ") : "(ingen svit refererar modulen — testgap)",
    testverktygAlla: sviter,
    gap: ["nykartlagd 2026-09-19 (våg 212 mekanisk regen) — djupgap ej manuellt inventerat"],
  });
}

// ── 3) summering + landning/förhandsgranskning ─────────────────────────────
register.motorer = [...register.motorer, ...nyaPoster];
register.uppdaterad = new Date().toISOString().slice(0, 10);
register.regen = {
  vaccination: "våg 212 (E35 gap 2) 2026-09-19",
  metod: "befintliga 42 poster bevarade (mänsklig kunskap orörd; mekaniska fält testad/testverktygAlla uppdaterade + kompositsökvägar normaliserade); nya poster mekaniskt kartlagda ur trädet (rubrikkommentar + import-grep + svit-grep); poster vars fil saknas på disk gallras ur registret (o108, transparent i utdata)",
  baseradPa: execSync("git rev-parse --short HEAD", { cwd: REPO, encoding: "utf8" }).trim(),
    befintliga: register.motorer.length - nyaPoster.length,
    nya: nyaPoster.length,
    totalt: register.motorer.length,
    testtade: register.motorer.filter((m) => m.testad).length,
    otestade: register.motorer.filter((m) => !m.testad).length,
    gallradeUrRegistret,
  };

const utSokvag = SKRIV ? regSokvag : "/tmp/r107-register-preview.json";
fs.writeFileSync(utSokvag, JSON.stringify(register, null, 2) + "\n");
console.log(`regen: ${register.regen.befintliga} bevarade + ${nyaPoster.length} nya = ${register.regen.totalt} · testtade ${register.regen.testtade} · otestade ${register.regen.otestade}`);
console.log(`uppdaterade mekaniska fält på ${uppdaterade} befintliga poster`);
console.log(SKRIV ? `SKRIVEN: ${path.relative(REPO, regSokvag)}` : "FÖRHANDSVISNING: /tmp/r107-register-preview.json (kör med --skriv för landning)");
if (gallradeUrRegistret.length) console.log(`gallrade ur registret (fil saknas på disk, ${gallradeUrRegistret.length}):\n${gallradeUrRegistret.map((g) => "  − " + g).join("\n")}`);
const otestade = register.motorer.filter((m) => !m.testad).map((m) => `  ? ${m.namn} (${m.fil})`);
console.log(`otestade (${otestade.length}):\n${otestade.join("\n")}`);
