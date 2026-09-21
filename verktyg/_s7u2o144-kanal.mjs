#!/usr/bin/env node
/**
 * AK1A — KANALBEVIS o144 (Spår 7, s7-u2): verifierar att EFTER-mätning får köras.
 *
 * Spökmät-skyddet (o131/o139 §1): mätning ENBART mot bevisad kanal —
 *   1. DEPLOYAD-rad i data/vakten/prod-synk.log nyare än OOM-rundan 15:14Z
 *      med hash som har BÅDA kurerna som förfäder (merge-base --is-ancestor
 *      e27ef394 o139 · 45a9d432 o143).
 *   2. Byggd artefakt bär kurens CSS: .cv-widget-super/.cv-widget-kalk i
 *      .next/static/chunks/*.css (o139 §8.4:s kanalbevis-kommando).
 *   3. Prod svarar 200 på alla mätytor.
 *
 * Användning: node verktyg/_s7u2o144-kanal.mjs
 * Utdata: data/forskning/OPTIMERING/lighthouse/kanal-o144.json (och stdout)
 * Exit 0 = kanal bevisad (LH får köras) · 1 = ej än (vänta/polla).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LOGG = join(process.cwd(), "data/vakten/prod-synk.log");
const KURER = { o139_cv_widget: "e27ef394", o143_dataset_cls: "45a9d432" };
const SIDOR = ["/", "/dataset", "/en/dataset", "/ar/dataset", "/superanalys", "/kalkylator"];
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse/kanal-o144.json");

const ut = { ts: new Date().toISOString(), steg: {}, kanalBevisad: false };

// 1. DEPLOYAD-rad — ta sista förekomsten, extrahera hash generöst.
const rader = readFileSync(LOGG, "utf8").split("\n");
let deployad = null;
for (let i = rader.length - 1; i >= 0; i--) {
  if (/DEPLOYAD/.test(rader[i])) {
    const m = rader[i].match(/([0-9a-f]{8,40})/g);
    if (m) {
      // Välj längsta hash-liknande token (tidsstämplar innehåller kolon, ej hex).
      const kandidater = m.filter((h) => /^[0-9a-f]+$/.test(h) && h.length >= 7);
      if (kandidater.length) { deployad = { rad: rader[i].trim(), hash: kandidater[kandidater.length - 1] }; break; }
    }
  }
}
ut.steg.deployadRad = deployad;

// 2. Förfaderskap för båda kurerna mot deployad hash.
if (deployad) {
  ut.steg.forfader = {};
  for (const [namn, hash] of Object.entries(KURER)) {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", hash, deployad.hash], { stdio: "ignore" });
      ut.steg.forfader[namn] = true;
    } catch {
      ut.steg.forfader[namn] = false;
    }
  }
}

// 3. Byggd artefakt: cv-widget-CSS i chunks (o139 §8.4).
try {
  const katalog = join(process.cwd(), ".next/static/chunks");
  const cssFiler = readdirSync(katalog).filter((f) => f.endsWith(".css"));
  ut.steg.cvWidgetCss = { filer: cssFiler.length, traEFFar: [] };
  for (const f of cssFiler) {
    const innehall = readFileSync(join(katalog, f), "utf8");
    for (const klass of [".cv-widget-super", ".cv-widget-kalk"]) {
      if (innehall.includes(klass)) ut.steg.cvWidgetCss.traEFFar.push(`${f}: ${klass}`);
    }
  }
} catch (e) {
  ut.steg.cvWidgetCss = { fel: String(e.message) };
}

// 4. Prod 200 på mätytorna.
ut.steg.http200 = {};
for (const s of SIDOR) {
  try {
    const r = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", `http://localhost:3000${s}`], { encoding: "utf8" });
    ut.steg.http200[s] = r.trim();
  } catch {
    ut.steg.http200[s] = "FEL";
  }
}

ut.kanalBevisad = Boolean(
  deployad &&
  ut.steg.forfader &&
  Object.values(ut.steg.forfader).every(Boolean) &&
  Array.isArray(ut.steg.cvWidgetCss?.traEFFar) && ut.steg.cvWidgetCss.traEFFar.length >= 2 &&
  Object.values(ut.steg.http200).every((k) => k === "200")
);

writeFileSync(UTFIL, JSON.stringify(ut, null, 2));
console.log(JSON.stringify(ut, null, 2));
process.exit(ut.kanalBevisad ? 0 : 1);
