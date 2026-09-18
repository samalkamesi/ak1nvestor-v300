#!/usr/bin/env node
// Svit för granssnittsvakt-cron.sh:s RAM-skip-återförsök (o72, s8-vakt).
// =====================================================================
// Kontrakt (mot 2026-09-18T1317-SKIP:ets rot): en stängd grind får INTE
// lämna sajten mätblind i 6 h — wrappern pollar fabrikens minnesfönster
// (POLL_SEK × VANTA_MIN) och ger först därefter upp med bevarad
// SKIP-logg + exit 75. Sviterna kör wrappern I TORRLÄGE mot tmp-katalog
// (GRANSSNITT_KATALOG + GRANSSNITT_TORRKORNING): skarp cron.log och
// skarp journal/rapporter rörs ALDRIG — vakten mäts av separata
// fullkörningar, inte här.
//
// Körs: node verktyg/testa-granssnitt-cron-retry.mjs  (exit 0 = alla PASS)

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROT = "/home/ak1a/AK1";
const SKRIPT = path.join(ROT, "data", "infra", "contabo", "granssnittsvakt-cron.sh");
const SKARP_LOGG = path.join(ROT, "data", "vakten", "cron.log");

let pass = 0;
let fail = 0;
const resultat = [];
function kontroll(namn, ok, detalj = "") {
  if (ok) { pass++; resultat.push(`PASS ${namn}`); }
  else { fail++; resultat.push(`FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
}

// bash -n: syntax före beteende.
const synt = spawnSync("bash", ["-n", SKRIPT]);
kontroll("N1 bash -n syntax ren", synt.status === 0, synt.stderr?.toString().trim());

function kor(envOver) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vakt-cron-test-"));
  const env = {
    ...process.env,
    GRANSSNITT_KATALOG: tmp,
    GRANSSNITT_TORRKORNING: "ja",
    ...envOver,
  };
  const r = spawnSync("bash", [SKRIPT], { env, encoding: "utf8", timeout: 30_000 });
  let logg = "";
  try {
    logg = fs.readFileSync(path.join(tmp, "cron.log"), "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") throw e; // saknad logg = öppen grind på rond 1: inget loggas — korrekt
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return { kod: r.status, ut: r.stdout, logg };
}

// R1: omöjlig grind i torrläge → rundans loggradsformat + TORR-SKIP + exit 75.
{
  const r = kor({ GRANSSNITT_RAM_MIN: "999999", GRANSSNITT_POLL_SEK: "1", GRANSSNITT_GRIND_TAK: "1", GRANSSNITT_VANTA_MIN: "2" });
  kontroll("R1 stängd grind → exit 75", r.kod === 75, `kod=${r.kod}`);
  kontroll("R1 TORR-SKIP-rad på stdout", r.ut.includes("TORR: SKIP efter"), r.ut.trim());
  kontroll("R1 ronder-format (rond 1/60 av 2 min)", /RAM-grind stängd \(rond 1\/60 av 2 min\)/.test(r.logg), r.logg.trim());
}

// R2: öppen grind i torrläge → rond 1 räcker, exit 0, ingen mätning.
{
  const r = kor({ GRANSSNITT_RAM_MIN: "1" });
  kontroll("R2 öppen grind → exit 0", r.kod === 0, `kod=${r.kod}`);
  kontroll("R2 TORR-öppen-rad på stdout", r.ut.includes("TORR: grind öppen på rond 1"), r.ut.trim());
  kontroll("R2 ingen stängd-rond i loggen", !r.logg.includes("stängd"), r.logg.trim());
}

// R3: minimum-1-clamp — VANTA_MIN=0 får ALDRIG ge noll ronder (seq 1 0 = tomt).
{
  const r = kor({ GRANSSNITT_RAM_MIN: "999999", GRANSSNITT_POLL_SEK: "1", GRANSSNITT_GRIND_TAK: "1", GRANSSNITT_VANTA_MIN: "0" });
  kontroll("R3 clamp: minst 1 rond loggas", /rond 1\/1 av 0 min/.test(r.logg), r.logg.trim());
  kontroll("R3 clamp: exit 75", r.kod === 75, `kod=${r.kod}`);
}

// R4: SKIP-kontraktet bevarat utan torrläge — ordagrant rad + exit 75,
// och aldrig fler än de beräknade ronderna (VANTA=0 ⇒ 1 rond ⇒ EN väntelos).
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vakt-cron-test-"));
  const env = {
    ...process.env,
    GRANSSNITT_KATALOG: tmp,
    GRANSSNITT_RAM_MIN: "999999",
    GRANSSNITT_POLL_SEK: "1",
    GRANSSNITT_GRIND_TAK: "1",
    GRANSSNITT_VANTA_MIN: "0",
  };
  const r = spawnSync("bash", [SKRIPT], { env, encoding: "utf8", timeout: 30_000 });
  const logg = fs.readFileSync(path.join(tmp, "cron.log"), "utf8");
  fs.rmSync(tmp, { recursive: true, force: true });
  kontroll("R4 SKIP-rad ordagrant bevarad", logg.includes("SKIPPAD — RAM-grind stängd (minnet för tomt för mätning)"), logg.trim());
  kontroll("R4 exit 75 utan torrläge", r.status === 75, `kod=${r.status}`);
  kontroll("R4 exakt 1 stängd-rond (ingen evig loop)", (logg.match(/RAM-grind stängd \(rond/g) || []).length === 1, logg.trim());
}

// R5: skarp cron.log orörd av sviten (ägarhetsbevis — bara cron skriver den).
{
  const före = fs.statSync(SKARP_LOGG);
  kor({ GRANSSNITT_RAM_MIN: "999999", GRANSSNITT_POLL_SEK: "1", GRANSSNITT_GRIND_TAK: "1", GRANSSNITT_VANTA_MIN: "1" });
  const efter = fs.statSync(SKARP_LOGG);
  kontroll("R5 skarp cron.log orörd", före.mtimeMs === efter.mtimeMs && före.size === efter.size);
}

// R6: defaultvärdena i skriptet matchar protokollet (1100/300/60/60).
{
  const text = fs.readFileSync(SKRIPT, "utf8");
  kontroll("R6 default RAM_MIN=1100", text.includes('GRANSSNITT_RAM_MIN:-1100'));
  kontroll("R6 default VANTA_MIN=60", text.includes('GRANSSNITT_VANTA_MIN:-60'));
  kontroll("R6 default POLL_SEK=300", text.includes('GRANSSNITT_POLL_SEK:-300'));
}

console.log(resultat.join("\n"));
console.log(`\nGRÄNSSNITTS-CRON-RETRY: ${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
