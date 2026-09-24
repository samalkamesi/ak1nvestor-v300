#!/usr/bin/env node
/**
 * VÅG 216 — bevis för omstart-samordningen. Deterministiskt och riskfritt:
 * pm2 och flock stubbas via PATH (ingen riktig omstart, inget riktigt lås).
 */
import { mkdirSync, writeFileSync, rmSync, readFileSync, unlinkSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROTA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STUB = "/tmp/_v216-stub";
const PM2_LOG = STUB + "/pm2-anrop.log";
const JOURNAL = "/tmp/ak1a-omstart-journal.json";

// Stubbarnas uppförande styrs av flagg-filer
mkdirSync(STUB, { recursive: true });
writeFileSync(STUB + "/pm2", `#!/bin/sh\necho "$@" >> ${PM2_LOG}\nexit 0\n`);
const flockStub = (kod) =>
  writeFileSync(STUB + "/flock", `#!/bin/sh\ncase "$1" in -n) exit ${kod} ;; *) exit 0 ;; esac\n`);
flockStub(0); // startläge: låset fritt (fall 1—2, 4—5); fall 3 flipping till upptaget
for (const f of ["pm2", "flock"]) execFileSync("chmod", ["+x", STUB + "/" + f]);

process.env.PATH = STUB + ":" + process.env.PATH;
const modul = await import(ROTA + "/verktyg/omstart-samordning.mjs");
const pm2Anrop = () => (existsSync(PM2_LOG) ? readFileSync(PM2_LOG, "utf8").trim().split("\n").filter(Boolean) : []);

let pass = 0, fail = 0;
const kontroll = (namn, ok, detalj = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${namn}${detalj ? " — " + detalj : ""}`);
  ok ? pass++ : fail++;
};

try {
  // 1. annan kanal inom 3 min ⇒ vägrad, pm2 aldrig anropad
  if (existsSync(JOURNAL)) unlinkSync(JOURNAL);
  writeFileSync(JOURNAL, JSON.stringify({ kanal: "pulsvakt", orsak: "test", ts: Date.now() - 30_000 }) + "\n");
  let om = modul.samordnadOmstart("malhjarta", "test-frusen");
  kontroll("1. annan kanal (30 s) vägras", om.startad === false && om.skal === "annan-kanal", JSON.stringify(om).slice(0, 80));
  kontroll("1b. pm2 EJ anropad", pm2Anrop().length === 0, pm2Anrop().length + " anrop");

  // 2. ingen journal ⇒ startad + journal skriven med egen kanal
  unlinkSync(JOURNAL);
  om = modul.samordnadOmstart("malhjarta", "test-kilad");
  const j = JSON.parse(readFileSync(JOURNAL, "utf8"));
  kontroll("2. fri omstart startad + journalerad", om.startad === true && j.kanal === "malhjarta", `kanal=${j.kanal}`);
  kontroll("2b. pm2 anropad exakt en gång", pm2Anrop().length === 1, pm2Anrop().join(" | "));

  // 3. deploylås hålls (flock -n misslyckas) ⇒ vägrad före journal
  flockStub(1);
  om = modul.samordnadOmstart("pulsvakt", "test-deploy");
  kontroll("3. deploy vägrar omstart", om.startad === false && om.skal === "deploy", JSON.stringify(om).slice(0, 80));
  kontroll("3b. pm2 fortfarande exakt 1 anrop", pm2Anrop().length === 1, pm2Anrop().length + " anrop");

  // 4. samma kanal inom fönstret blockeras EJ (egna tak sköts av anroparen)
  flockStub(0);
  om = modul.samordnadOmstart("malhjarta", "test-egen-kanal");
  kontroll("4. egen kanal blockeras ej av egen journal", om.startad === true, JSON.stringify(om).slice(0, 80));

  // 5. gammal annan-kanal-post (4 min) blockeras ej
  writeFileSync(JOURNAL, JSON.stringify({ kanal: "pulsvakt", orsak: "gammal", ts: Date.now() - 4 * 60_000 }) + "\n");
  om = modul.samordnadOmstart("malhjarta", "test-gammal-post");
  kontroll("5. annan kanal >3 min blockerar ej", om.startad === true, JSON.stringify(om).slice(0, 80));
} finally {
  // Städa: journalen får ALDRIG lämnas med test-poster (hjärtat läser den)
  if (existsSync(JOURNAL)) unlinkSync(JOURNAL);
  rmSync(STUB, { recursive: true, force: true });
}
console.log(`[v216-test] ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
