#!/usr/bin/env node
/**
 * SPÅR 8 s8-u2 (o98) — F1-KOD-LEDGERNS STÄNGNING (185 domar).
 * Appendar en "rotkurad"-bedömning per öppen F1-kod-fyndrad av klassen
 * "syntaxfel: verktyg/testa-ai-mentor-*.mjs" (salvorna 2026-09-19
 * 18:12–19:22Z) till data/vakten/feljakt-bedomningar.jsonl enligt
 * nyckelkontraktet (ts|spår|fynd; inga kollisioner — varje ts unik).
 * Idempotent: redan domsad rad (samma ts+fynd+dom) skrivs inte igen.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FYND = path.join(ROT, "data/vakten/feljakt-fynd.jsonl");
const BEDOMNINGAR = path.join(ROT, "data/vakten/feljakt-bedomningar.jsonl");
const DOMD_TS = new Date().toISOString();

const ROTORSAK =
  "s6-u3:s omgång 24-harmonisering av våg 189:s marknadsmekanik-lager avbröts mitt i verkställandet: KOMPONENTER-blocket (2 kommentarsrader + elementraden) klistrades in MITT I IMPORTSEKTIONEN i 38 av 42 modultestersviter — naken sträng med kommatecken före nästa const ⇒ SyntaxError: Unexpected token 'const'. Samma commits halvfärdiga K03-rad (namn 452, konstant 446) och faktordjups förlegade KANSKE-tolerans (fönstrets fyra omgång-23-komponenter felankrade mot omgång 24:s slut) är samma avbrotts klass.";
const KUR =
  "verktyg/_s8u2-harmonisera-marknadsmekanik.mjs flyttade blocket till KOMPONENTER efter \"svaraLokaltCase\" (bokmastar-mallens exakta placering, ident bevisad i 4 korrekt harmoniserade syskon); K03 446→452 i avkastningskurva+warrant (E01 grönt på 452); faktordjups KANSKE viket in i KOMPONENTER i wireningsordning. Bevis: node --check 291 verktyg-filer 0 fel · MENTORSVITEN 62/62 GRÖNA (38 reparerade + 24 friska) · tsc --noEmit 0 · fixaren idempotent (omkörning = 0 ändringar).";

const fynd = fs.readFileSync(FYND, "utf8").trim().split("\n").map((r) => JSON.parse(r));
const mal = fynd.filter(
  (f) => f["spår"] === "F1-kod" && /^syntaxfel: verktyg\/testa-ai-mentor-[\w.-]+\.mjs$/.test(f.fynd ?? ""),
);
const befintliga = fs.existsSync(BEDOMNINGAR)
  ? fs.readFileSync(BEDOMNINGAR, "utf8").trim().split("\n").filter(Boolean).map((r) => JSON.parse(r))
  : [];
const har = new Set(befintliga.filter((b) => b.dom === "rotkurad").map((b) => b.ts + "|" + b.fynd));

const nya = [];
for (const f of mal) {
  if (har.has(f.ts + "|" + f.fynd)) continue;
  nya.push({
    ts: f.ts,
    spår: "F1-kod",
    allvar: f.allvar ?? "MEDEL",
    fynd: f.fynd,
    dom: "rotkurad",
    domdTs: DOMD_TS,
    rotorsaka: ROTORSAK,
    kur: KUR,
    lag: "1 (återmätning maskinell: check+svit per fil) · 2 (blocket flyttat till rot-rätt plats, ingen ytlagning) · 6 (dom + bevis bokförd)",
    protokoll: "s8-u2 o98 (manifest auto-s8, vakt 2/3) — F1-kod-ledgerns samtliga öppna rader är denna klass; stängningen är total",
  });
}

if (nya.length) {
  const blob = nya.map((b) => JSON.stringify(b)).join("\n") + "\n";
  fs.appendFileSync(BEDOMNINGAR, blob);
}
console.log("F1-DOMAR: " + mal.length + " fyndrader av klassen · " + nya.length + " nya rotkurad-domar · " + (mal.length - nya.length) + " redan domdade");
