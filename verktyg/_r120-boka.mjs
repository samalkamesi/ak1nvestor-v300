#!/usr/bin/env node
/** R120-bokning: worklog + beslutsminne + commit [organ:Φ] + push prod. */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const ROT = "/home/ak1a/agent/ak1";
const AR = (f) => execFileSync("git", ["-C", ROT, ...f], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// 1) worklog-rad
const nu = new Date().toISOString().slice(0, 16).replace("T", " ") + "Z";
const rad = `\n**${nu} — ROND 120 (V231 kontraktssvit + TUNG-jaktkur) [organ:Φ]: AGGREGATORNS EGEN KONTRAKTSSVIT LEVERERAD — 10/10 PASS — + TUNG-jaktens kontraktsbugg kurerad och jakten omstartad.** Restgapet som namngivits TVÅ gånger (SYSTEMKARTAN E35 kö/sidofynd + åttonde passningens slutrad) är stängt: verktyg/testa-aggregator-kontrakt.mjs mäter TIO kontrakt genom nästlade FILTRADE aggregatorkörningar mot två självstädande engångsfixtures (testa-zz-kontrakt-a/b.mjs, födda+städade av sviten själv). Bevis EGEN körning: C1 huvudcheckpoint sha-identisk · C2 suffixrapport matta=2/2 · C3 checkpoint PÅGÅENDE samplad MITT I levande körning · C4a kvitto=sista PASS-raden · C4b RÖD svit bär sistaFel ur stderr · C5 slutstatus ∈ {PÅGÅENDE, AVBRUTEN, GRÖN, RÖD} · C6 --fortsatt mäter om ENBART saknade svit (räknarbevis A 1→1, B 1→2) · C7a klassSumma alla fyra klasser · C7b --klass=tung exkluderar DETERMINISTIK svit utan att köra den · C0 RAM-avbrott synligt. Ingen tung svit avfyras (klassfilter-testet beväpnat med 4-s-viten testa-styrelse-v214); sviten klassas DETERMINISTISK ~15 s, beståndet 155→156. PÅ KÖPET: TUNG-jaktens egen kontraktsbugg (verktyg/_r119-tungjakt.mjs jämförde resultat mot strängen "KLAR" — aggregatet rapporterar GRÖN/RÖD, aldrig KLAR; jakten skulle aldrig känt igen en lyckad TUNG-körning) kurerad: rapportKlar() returnerar objektet och resultatlogiken läser status — omstartad pid 3764362 via _r120-launch.mjs, väntar fabriksljugt fönster (f.d. pid 3741377 dödad). Prod verifierad hel efter 14:37-deployen: / 200 på 12 ms, färsk HTML bär nya chunks (200) — pulsvaktens 3 statiska 500 var transient-bygg, dom korrekt. SYSTEMKARTAN: nionde passningen tillagd. INGET bygge: verktyg + data endast, src orörd.\n`;
fs.appendFileSync(`${ROT}/worklog.md`, rad);
console.log("worklog: 1 rad");

// 2) beslutsminne
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 68,
  beslut: "V231 [organ:Φ]: aggregatorns EGEN kontraktssvit levererad (testa-aggregator-kontrakt.mjs 10/10 PASS — klassregex+kvitto+återupptagning+V228+V229+statusvärden mäta mekaniskt) + TUNG-jaktens KLAR-kontraktsbugg kurerad (GRÖN/RÖD) och jakten omstartad",
  landat: "nej",
}) + "\n");
console.log("beslutsminne: 1 rad (landat fylls vid grön push)");

// 3) commit-meddelande + commit
const msg = `studio: rond 120 [organ:Φ] — V231 AGGREGATORNS EGEN KONTRAKTSSVIT (testa-aggregator-kontrakt.mjs 10/10 PASS: C1 sond-suffix sha · C2 suffixrapport · C3 checkpoint mitt-i · C4 kvitto+sistaFel · C5 statusvärden · C6 återupptagning räknarbevis · C7 klassregex/filter · C0 ram-synlighet) + TUNG-jaktens KLAR-bugge kurerad (GRÖN/RÖD-kontrakt, omstart pid 3764362) + SYSTEMKARTAN nionde passningen — bestånd 155→156 sviter`;
fs.writeFileSync("/tmp/r120-msg.txt", msg);
AR(["add", "verktyg/testa-aggregator-kontrakt.mjs", "verktyg/_r119-tungjakt.mjs", "verktyg/_r120-launch.mjs", "data/forskning/SYSTEMKARTAN.md", "worklog.md"]);
AR(["commit", "-F", "/tmp/r120-msg.txt"]);
console.log("commit:", AR(["log", "-1", "--format=%h"]).trim());

// 4) push med fabrik-tålamod (merge vid divergens)
for (let i = 0; i < 15; i++) {
  try { AR(["push", "prod", "develop"]); console.log("PUSH GRÖN"); break; }
  catch {
    try { AR(["pull", "--no-rebase", "prod", "develop"]); console.log(`merge #${i + 1} klar`); }
    catch (e) { console.log(`väntar prod-träd (försök ${i + 1}/15)`); await new Promise((r) => setTimeout(r, 60_000)); }
  }
}
fs.rmSync("/tmp/r120-msg.txt", { force: true });
console.log("KLAR");
