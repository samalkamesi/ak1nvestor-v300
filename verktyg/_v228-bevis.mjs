#!/usr/bin/env node
/** V228-BEVIS: TUNG-dödsagg-kurens mekanik — (A) kontrollpunkt överlever
 *  procesdöd (SIGKILL, kärnans OOM-simulation), (B) --fortsatt återupptar
 *  utan omkörning av mätta sviter. Filter: testa-feljakt (3 snabba sviter). */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROT = "/home/ak1a/agent/ak1";
const JSON_SOKVAG = path.join(ROT, "data/vakten/testaggregator-SENASTE.json");
const las = () => { try { return JSON.parse(fs.readFileSync(JSON_SOKVAG, "utf8")); } catch { return null; } };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// snapshot av eventuell befintlig rapport (reversibilitet)
if (fs.existsSync(JSON_SOKVAG)) {
  fs.copyFileSync(JSON_SOKVAG, path.join(ROT, "data/vakten/testaggregator-SENASTE.bak-v228.json"));
  console.log("SNAPSHOT: befintlig rapport backad till testaggregator-SENASTE.bak-v228.json");
}

// ── syntaxport ──
await new Promise((res, rej) => {
  const p = spawn("node", ["--check", "verktyg/kor-alla-tester.mjs"], { cwd: ROT });
  p.on("close", (k) => (k === 0 ? res() : rej(new Error(`node --check exit ${k}`))));
});
console.log("SYNTAX: node --check GRÖN");

// ── A: död mitt i körningen ──
console.log("FASE A: startar aggregat (monster=testa-feljakt) och mördar det efter första kontrollpunkten …");
const agg = spawn("node", ["verktyg/kor-alla-tester.mjs", "--monster=testa-feljakt"], {
  cwd: ROT, detached: true, stdio: ["ignore", "pipe", "pipe"],
});
let aggUt = "";
agg.stdout.on("data", (d) => { aggUt += d.toString(); });
agg.stderr.on("data", (d) => { aggUt += d.toString(); });

let punkt = null;
for (let i = 0; i < 180 && !punkt; i++) {
  await sov(500);
  const j = las();
  if (j && j.status === "PÅGÅENDE" && j.matta >= 1) punkt = j;
}
if (!punkt) {
  try { process.kill(-agg.pid, "SIGKILL"); } catch {}
  console.log(`FASE A: FEL — ingen kontrollpunkt inom 90 s. Utdata:\n${aggUt.slice(-800)}`);
  process.exit(1);
}
console.log(`FASE A: kontrollpunkt på disk mitt i körningen — status=${punkt.status} matta=${punkt.matta}/${punkt.upptackta}`);

try { process.kill(-agg.pid, "SIGKILL"); } catch {}
console.log("FASE A: aggregatet MÖRDAT (SIGKILL mot processgruppen — kärnans OOM-simulation)");

await sov(1500);
const efterDod = las();
if (!efterDod || !Array.isArray(efterDod.sviter) || efterDod.sviter.length < 1) {
  console.log("FASE A: FEL — mätdata förlorad vid död (kontrollpunkten verkade ej)");
  process.exit(1);
}
const mattaFore = efterDod.sviter.map((s) => `${s.fil}=${s.status}`).join(", ");
console.log(`FASE A: BEVIS — mätdata ÖVERLEVER procesdöd: ${efterDod.sviter.length} svit(er) kvar på disk (${mattaFore})`);

// ── B: återupptagning ──
console.log("FASE B: --fortsatt återupptar svepet …");
const fortsatt = await new Promise((res) => {
  const p = spawn("node", ["verktyg/kor-alla-tester.mjs", "--monster=testa-feljakt", "--fortsatt"], { cwd: ROT, stdio: ["ignore", "pipe", "pipe"] });
  let ut = "";
  p.stdout.on("data", (d) => { ut += d.toString(); });
  p.stderr.on("data", (d) => { ut += d.toString(); });
  const vakt = setTimeout(() => { try { p.kill("SIGKILL"); } catch {} }, 240_000);
  p.on("close", (k) => { clearTimeout(vakt); res({ kod: k, ut }); });
});
const slut = las();
if (!slut || slut.lage !== "fortsatt" || slut.matta !== slut.upptackta || slut.status === "PÅGÅENDE") {
  console.log(`FASE B: FEL — slutrapport felaktig (lage=${slut?.lage} matta=${slut?.matta}/${slut?.upptackta} status=${slut?.status})\n${fortsatt.ut.slice(-800)}`);
  process.exit(1);
}
// de ur kontrollpunkten ärvda sviterna ska ha IDENTISKA resultat (ej omkörda)
const arvdaOK = efterDod.sviter.every((gammal) => {
  const ny = slut.sviter.find((s) => s.fil === gammal.fil);
  return ny && ny.status === gammal.status && ny.sekunder === gammal.sekunder;
});
console.log(`FASE B: BEVIS — återupptagning komplett: matta=${slut.matta}/${slut.upptackta} grona=${slut.grona} roda=${slut.roda} status=${slut.status} · ärvda sviter identiska (ej omkörda): ${arvdaOK ? "JA" : "NEJ"}`);
if (!arvdaOK) process.exit(1);

console.log(`V228-BEVIS: PASS — död = ${efterDod.sviter.length} mätt svit bevarad på disk · återupptagning = ${slut.matta}/${slut.upptackta} · aldrig mer tyst dataförlust`);
