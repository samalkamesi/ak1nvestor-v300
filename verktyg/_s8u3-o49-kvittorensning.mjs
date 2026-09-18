#!/usr/bin/env node
/**
 * o49 (s8-u3) — engångsverktyg: rensa de TVÄ bevisat spurious kvittona
 * 2026-09-17T11:33:13Z ("lock-commit misslyckades") ur
 * data/vakten/patch-kvitton.jsonl (runtime-fil, bash/node-klass).
 *
 * SKÄL: kvittotdokumenterade ett commit-fel vars rotorsak var prod-synkens
 * EGNA bugg (o49 Kur A): commit-steget nåddes med patchInstallerad=true
 * trots att den patchade locken redan rivits av felgrenen ⇒ "git add" på
 * oförändrade filer ⇒ "nothing to commit" exit 1 ⇒ misslyckad-kvitto som
 * tröttade loop-skyddet utan att patchen fått skulden. Med 3 misslyckade
 * (varav 1 par spurious) stängde aktivPatchPlan next@16.3.5 — RCE-patchen
 * avstängd trots levande köfil.
 *
 * De TVÅ ÄKTA byggfelen (11:29:29, 11:39:20 "bygg misslyckades med patchad
 * lock") LÄMNAS orörda — historiken behålls, räkningen landar på 2/3 ⇒
 * posten återaktiveras vid nästa prod-synk-rop, NU skyddad av o49-kurerna
 * (flock-skiljning + bevarade bygg-loggar).
 *
 * Backup skrivs före rensningen. Körs EN gång; därefter borttaget.
 */
import fs from "node:fs";

const KVITTO = "/home/ak1a/AK1/data/vakten/patch-kvitton.jsonl";
const BACKUP = KVITTO + ".backup-o49";

const original = fs.readFileSync(KVITTO, "utf8");
fs.copyFileSync(KVITTO, BACKUP);

const rader = original.split("\n").filter((r) => r.trim());
const rensade = [];
const kvar = [];
for (const rad of rader) {
  let j = null;
  try { j = JSON.parse(rad); } catch { kvar.push(rad); continue; }
  const arSpurious =
    typeof j.ts === "string" &&
    j.ts.startsWith("2026-09-17T11:33:13") &&
    j.resultat === "misslyckad" &&
    typeof j.detalj === "string" &&
    j.detalj.startsWith("lock-commit misslyckades");
  if (arSpurious) rensade.push(rad);
  else kvar.push(rad);
}

fs.writeFileSync(KVITTO, kvar.length ? kvar.join("\n") + "\n" : "");

console.log(`före: ${rader.length} rader · rensade (spurious): ${rensade.length} · kvar (äkta): ${kvar.length}`);
for (const r of rensade) console.log("  BORT: " + r);
for (const r of kvar) console.log("  KVAR: " + r);
console.log("backup: " + BACKUP);
