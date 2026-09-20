#!/usr/bin/env node
/** ROND 124 bokning [organ:Φ]: F5-stängning av doktrinklasser — worklog +
 * beslutsminne + commit (ledger + verktyg + worklog) + push + kvitto.
 * Push-logik: execFileSync kastar vid fel ⇒ exit 0 = grön (git skriver till
 * stderr — rund 123-launcherns strängbugg kurerad). */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const SVAR = `${ROT}/data/vakten/r124-boka-svar.txt`;
const ts = new Date().toISOString();
const lines = [`BOKNING start ${ts}`];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cd = (arr) => execFileSync(arr[0], arr.slice(1), { encoding: "utf8", cwd: ROT, maxBuffer: 16 * 1024 * 1024 });

try {
  const wlPath = `${ROT}/worklog.md`;
  if (!fs.readFileSync(wlPath, "utf8").includes("ROND 124 [organ:Φ] — F5-STÄNGNING")) {
    fs.appendFileSync(wlPath, `

**ROND 124 [organ:Φ] — F5-STÄNGNING AV DOKTRINKLASSER (34 FYND STÄNGDA MED BEVIS):** F5-logg-spåret bar 42 öppna fynd varav två dokumenterade klasser dominerade. Verktyg/f5-stang-klasser.mjs stänger mekaniskt med exakta lage-nycklar (ts=fyndets ts, dom=giltig klass, idempotent): KLASS A (24 rader) "AGENTARBETSYTA-SYNK MISSLYCKADES" — prod-synkens agentyte-skydd vägrar skriva över ocommittade ändringar; doktrinen gör väntandet DESIGNAT (o11-rotanalys + rond 121-precedens; fyndradens bevisfält ÄR protokollet). KLASS B (10 rader) "hjartslag.log FEL: TypeError: fetch failed" — stängs ENDAST med maskinellt tidsbevis: prod-synk.log-deployhändelse (NY KOD/DEPLOYAD/bygg MISSLYCKADES/bygg OOM/MÅL återarmat/NEXT-LÄKEBACKUP) inom ±15 min för fel-tiden; 10/10 hade bevis, 0 lämnades öppna (okända fetch-fel döljs ALDRIG — verktyget lämnar matchlösa rader öppna av konstruktion). Torrkörning före skrivning (Vaccination): 24+10+0, körning identisk. Kvar öppna i F5 efter stängningen: ~8 rader av nyare/klassblandade signaturer — nästa ronder. Øvriga spår orörda (F6 RAM-historyn + /godkannande-500 kräver egna rotanalyser — ingen massstängning utan bevis). 84 redan bedömda F5-rader hoppades korrekt (idempotens bevisad).
`);
    lines.push("worklog: +ROND 124");
  } else lines.push("worklog: redan bokad");

  const minne = `${ROT}/data/vakten/beslutsminne.jsonl`;
  if (!fs.readFileSync(minne, "utf8").includes('"rond":124,"beslut":"F5-stängning')) {
    fs.appendFileSync(minne, JSON.stringify({ ts, rond: 124, beslut: "F5-stängning av doktrinklasser: 34 fynd (24 agentyte-synk-doktrin + 10 hjärtslag-med-deploybevis) stängda transient-design med exakta nycklar; verktyg f5-stang-klasser.mjs återanvändningsbart; matchlösa rader lämnas öppna av konstruktion", landat: "" }) + "\n");
    lines.push("beslutsminne: +rond 124");
  } else lines.push("beslutsminne: redan bokad");

  cd(["git", "add", "data/vakten/feljakt-bedomningar.jsonl", "verktyg/f5-stang-klasser.mjs", "verktyg/_r124-boka.mjs", "worklog.md"]);
  const msg = `studio: rond 124 [organ:Φ] — F5-stängning av doktrinklasser: 34 fynd stängda transient-design med exakta lage-nycklar (24 agentyte-synk-doktrin enligt o11+rond 121; 10 hjärtslag-fetch-fel med maskinellt deploy-tidsbevis ur prod-synk.log ±15 min; 0 matchlösa stängda — verktyget lämnar okända rader öppna); torrkörning = körning (Vaccination)`;
  fs.writeFileSync(`${ROT}/_r124-msg.txt`, msg);
  const c = cd(["git", "commit", "-F", "_r124-msg.txt"]);
  lines.push("commit: " + c.split("\n")[0]);
  try { fs.unlinkSync(`${ROT}/_r124-msg.txt`); } catch {}

  let pushOk = false;
  for (let i = 1; i <= 30 && !pushOk; i++) {
    try { cd(["git", "push", "prod", "develop"]); pushOk = true; }
    catch (e) {
      try { cd(["git", "fetch", "prod", "develop"]); cd(["git", "merge", "-m", "merge prod (fabriksleveranser) — rond 124", "prod/develop"]); } catch {}
      lines.push(`push försök ${i} upptagen — väntar 60 s`);
      fs.writeFileSync(SVAR, lines.join("\n") + "\n");
      await sleep(60_000);
    }
  }
  lines.push(pushOk ? "PUSH GRÖN" : "PUSH nekad efter 30 försök");
  if (pushOk) {
    const m = fs.readFileSync(minne, "utf8").trim().split("\n");
    const s = JSON.parse(m.pop());
    if (s.rond === 124 && !s.landat) { s.landat = "ja"; m.push(JSON.stringify(s)); fs.writeFileSync(minne, m.join("\n") + "\n"); }
    lines.push("beslutsminne: landat=ja");
  }
  lines.push(`BOKNING klar ${new Date().toISOString()}`);
} catch (e) {
  lines.push(`FEL: ${String(e.stderr || e.message).slice(0, 600)}`);
}
fs.writeFileSync(SVAR, lines.join("\n") + "\n");
console.log(lines.join("\n"));
