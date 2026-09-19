#!/usr/bin/env node
/**
 * Engångsskript (s8-u3, o79): appendar 26 falskt-pos-bedömningar i
 * data/vakten/feljakt-bedomningar.jsonl för F1-syntaxfynden i klassen
 * aktivt-skrivfönster. Läser fyndjournalen och matchar EXAKTA rader
 * (ts+spår+fynd) — inga handskrivna nycklar. Idempotent: redan bedömda
 * rader hoppas över.
 */
import fs from "node:fs";

const ROT = "/home/ak1a/AK1";
const FYND = `${ROT}/data/vakten/feljakt-fynd.jsonl`;
const LEDGER = `${ROT}/data/vakten/feljakt-bedomningar.jsonl`;

const fyndrader = fs.readFileSync(FYND, "utf8").split("\n").filter(Boolean).map((r) => JSON.parse(r));
const bedomda = new Set(
  fs.readFileSync(LEDGER, "utf8").split("\n").filter(Boolean)
    .map((r) => JSON.parse(r))
    .map((b) => `${b.ts}|${b.spår}|${b.fynd}`),
);

const MAL = /^syntaxfel: verktyg\/testa-ai-mentor-[a-z]+\.mjs$/;
const MAL2 = "syntaxfel: verktyg/_s2u2o16-append-itub-abev.mjs";

const rotSalva = "aktivt skrivfönster: spår 6:s svitharmonisering av AI-mentor-sviten (s6-u3:s fönster pågick, deras commit 5f9b4536 12:53 lokal = 41 min efter salvan; sviten omskrivs över alla 46 filer) — halvskriven fil ger korrekt node --check-fel just då men falskt fynd på träd-nivån; samtliga 25 i salvan tidsstämplade 10:12:01–10:12:36Z, aldrig återkomna";
const rotS2 = "aktivt skrivfönster: _s2u2o16-append var s2-u2:s EGNA leveransskript under deras fönster (commit 667d1fd8 samma kväll) — filen provades av feljägaren mitt i skrivningen";
const bevis = "node --check GRÖN vid ommätning 2026-09-18T23:58:20Z (25/25 i salvan + _s2u2o16 + git-spårade sedan före fönstret: skapelser 2026-09-16→09-18 06:28 lokal); journalen totalt 25 rader för sviten = exakt salvan, noll uppföljning; klassen kurerad i roten av o80 (jagaVerktygSyntax-återmätning i feljagaren.mjs, test 5/5)";

const nu = new Date().toISOString().replace("Z", ".000Z");
let tillagda = 0;
const ut = [];
for (const f of fyndrader) {
  const arMal = f.spår === "F1-kod" && (MAL.test(f.fynd) || f.fynd === MAL2);
  if (!arMal) continue;
  const nyckel = `${f.ts}|${f.spår}|${f.fynd}`;
  if (bedomda.has(nyckel)) continue;
  ut.push(JSON.stringify({
    ts: f.ts,
    spår: f.spår,
    allvar: f.allvar,
    fynd: f.fynd,
    dom: "falskt-pos",
    rotorsaka: f.fynd === MAL2 ? rotS2 : rotSalva,
    bevis,
    protokoll: "OPTIMERING/o79-f1-syntax-skrivfonster-s8.md",
    domdAv: "s8-u3 (fabrik, spår 8)",
    domdTs: nu,
  }));
  bedomda.add(nyckel);
  tillagda++;
}
if (tillagda) fs.appendFileSync(LEDGER, ut.join("\n") + "\n");
console.log(`ledger: ${tillagda} bedömningar tillagda (salvan 25 förväntas + _s2u2o16 1 = 26)`);
