#!/usr/bin/env node
// o125 (s8-u2): protokollbaserade feljakt-bedömningar för 09-18-incidentens
// spökfynd + deployfönster-transienter — fyndloggen orörd (append-only),
// bedömningar till SEPARAT ledger enligt feljakt-läge-kontraktet.
// Matchnyckel: (ts, spår, fynd) exakt ur SENASTE lägesfilens öppna lista.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LAGE = path.join(ROT, "data", "vakten", "feljakt-lage-SENASTE.json");
const BEDOMNINGAR = path.join(ROT, "data", "vakten", "feljakt-bedomningar.jsonl");

const lage = JSON.parse(fs.readFileSync(LAGE, "utf8"));
const oppna = lage.oppnaLista ?? [];

const ATERSTALLD = "2026-09-20T16:17:28.230Z"; // kraschvakt.log: vakts egna appkoll (o125)
const PROTOKOLL = "OPTIMERING/o125-kraschvakt-aterstallningsbevis-s8.md";

const ut = [];
for (const f of oppna) {
  const ts = f.ts;
  const spar = f["spår"] ?? f.spar ?? "";
  const fynd = f.fynd ?? "";
  const rad = { ts, spår: spar, allvar: f.allvar, fynd };
  if (/deploybygg pågår/.test(fynd)) {
    ut.push({
      ...rad,
      dom: "transient-design",
      rotorsaka:
        "Deployfönster: fyndets eget bevisfält bär '/tmp/ak1a-deploy.lock hålls' — vaktlösning kan inte mäta mitt i ett pågående bygg (doktrin o47 §2, systematiserad i o113, kvitterad igen i o125 när nattens 02:28Z-insamling kasserade 202 falska 5xx korrekt).",
      bevis: "fyndbevisets låsrad + prod-synk.logg byggfönster; klassen återkommer aldrig som öppen i nästa driftfönster-granskning",
      lag: "4 (klassificerad transient med protokollbevis)",
      protokoll: "o113 §driftfönster + " + PROTOKOLL,
    });
  } else if (/nätverksfel/.test(fynd)) {
    if (ts.startsWith("2026-09-18")) {
      ut.push({
        ...rad,
        dom: "rotkurad",
        rotorsaka:
          "09-18 22:0x-produktionsincidenten (kraschloop-misstanke 22:04 + misslyckat räddningsbygg 22:07, artefakt okänd): feljägarens omtest nådde appen medan pm2 lämnats stoppad — 'server död vid omtest' i fyndens egna bevis. Incidenten läktes av prod-synkens deploy, men kraschvakten saknade (t.o.m. o125) återställningsbevis-grön, varför fynden låg öppna. o125 kurar roten: ÅTERSTÄLLD-grönklass + pm2_env.restart_time-läsning.",
        bevis: `kraschvakt.log ${ATERSTALLD} (vakts egna appkoll: svarar=true online omstarter +0) + larm-eskalering.json 16:17Z: kraschvaktEpisoderAktiva 2→0, episoden grönTs=${ATERSTALLD}`,
        lag: "1 (verklig incident) · 2 (rot kurad: o125s grönklass + snurr-räknarläsning) · 6 (dom dokumenterad)",
        protokoll: PROTOKOLL,
      });
    } else if (ts.startsWith("2026-09-19T08:2") || ts.startsWith("2026-09-19T08:3")) {
      ut.push({
        ...rad,
        dom: "transient-design",
        rotorsaka:
          "Deployfönster: prod-synk.logg 2026-09-19T08:27:29Z 'NY KOD: a7174cb0 → 32fb6c3f' + 'VÄNTAR-RAM' — byggpågående då feljägarens omtest föll (08:29:09–08:30:05).",
        bevis: "prod-synk.logg 08:27:29Z/08:37:29Z-raderna; doktrin o47 §2",
        lag: "4",
        protokoll: "o113 + " + PROTOKOLL,
      });
    } else if (ts.startsWith("2026-09-20T03:4")) {
      ut.push({
        ...rad,
        dom: "transient-design",
        rotorsaka:
          "Patchkö-deploy: prod-synk.logg 2026-09-20T03:42:43Z 'PATCH-KÖ BOKFÖRD: react-familjen … DEPLOYAD automatiskt: 20 commits — prod 200' — pm2-omstartens fönster fångade feljägarens omtest 03:43:32.",
        bevis: "prod-synk.logg 03:42:43Z (bokförd+deployad) + 03:43:04Z mål-återarmning; patch-kvitton.jsonl react@19.3.0 ok",
        lag: "4",
        protokoll: "o113 + " + PROTOKOLL,
      });
    }
  } else if (/ak1a = stopped/.test(fynd)) {
    ut.push({
      ...rad,
      dom: "rotkurad",
      rotorsaka:
        "09-18 22:0x-insidenten: misslyckat räddningsbygg lämnar pm2 STOPPAD (VACCIN 2-doktrinen — restart mot ofullständig artefakt = kraschloop). Nästa kanal (prod-synk) byggde klart och startade appen; restarts 4324 var incidentens summa. o125: appkoll-grön + korrekt pm2_env.restart_time-läsning.",
      bevis: `kraschvakt.log ${ATERSTALLD} + larm-eskalering.json (2→0 aktiva) + pm2 ak1a online (uptime sedan 2026-09-20T16:01:59Z)`,
      lag: "1 · 2 · 6",
      protokoll: PROTOKOLL,
    });
  }
}

if (ut.length === 0) {
  console.log("INGA bedömningar att skriva (lägesfilen bär inga matchande öppna fynd)");
  process.exit(0);
}
const rader = ut.map((b) => JSON.stringify(b)).join("\n") + "\n";
fs.appendFileSync(BEDOMNINGAR, rader);
const perDom = ut.reduce((a, b) => ((a[b.dom] = (a[b.dom] ?? 0) + 1), a), {});
console.log(`SKREV ${ut.length} bedömningar:`, JSON.stringify(perDom));
