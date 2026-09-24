#!/usr/bin/env node
// _s8u2o162-doma-hoga.mjs — engångsdriver: domar ledgerns 15 öppna HÖGA fynd
// via skrivgrinden feljakt-skriv-dom.mjs (o145-kontraktet, skalfri arrayform).
// Nycklar LÄSES ur lage-filen (aldrig handskrivna — o145:s nyckelglidningsrot).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LAGE = path.join(ROT, "data", "vakten", "feljakt-lage-SENASTE.json");
const GRIND = path.join(ROT, "verktyg", "feljakt-skriv-dom.mjs");

// Domtabell per ts (o135-metodiken: rot/transient per loggbevis per fönster).
const DOMAR = {
  "2026-09-21T17:48:00.957Z": { dom: "rotkurad",
    rotorsaka: "minnestryck under fabrikshelgens parallella omgångar (barnkostnad ~0,8 GB styck, våg 146-mätningen)",
    kur: "agentfabrikens RAM-vakt (våg 146: vägrar ny omgång under 1 500 MB tillgängligt) + kraschvaktens kooldown; dippen läkte utan krasch, systemet grönt",
    bevis: "kraschvakt.log 09-21→22-natten dokumenterar följande OOM-kedja med ÅTERSTÄLLD 01:14Z; pm2 online sedan, prod 200 vid dom" },
  "2026-09-21T20:29:47.046Z": { dom: "rotkurad",
    rotorsaka: "kvällens kraschloop under 09-21/22-OOM-kedjan; pm2 status=errored under räddningsbyggets flock-fönster (o153 §F2-klassen)",
    kur: "kraschvaktens räddningsbygg + deploy; kedjan ÅTERSTÄLLD-grön 01:14Z 09-22 (kraschvakt.log)",
    bevis: "kraschvakt.log 2026-09-22T00:44–01:14 (ÅTERSTÄLLD, omstarter +0); restart-räknaren är kumulativ sedan processfödsel" },
  "2026-09-22T02:44:06.832Z": { dom: "rotkurad",
    rotorsaka: "kraschloop under OOM-natten; kraschvakten startade räddningsbygg 02:44:05Z som misslyckades 02:47 (npm ci under flock)",
    kur: "nästa räddning/deploy fönstret 04:04–04:14 (svarar=true) + ÅTERSTÄLLD 04:34Z grön",
    bevis: "kraschvakt.log 2026-09-22T02:44:05 → 04:34:06 (KRASCHLOOP-MISSTANKE, RÄDDNING AVSTYRD deploy-lås, ÅTERSTÄLLD)" },
  "2026-09-22T02:58:41.219Z": { dom: "rotkurad",
    rotorsaka: "samma 09-22-fönster: kooldown 30 min efter misslyckat räddningsbygg (pm2 lämnades stoppad enligt design mot kraschloop-502)",
    kur: "deploy-fönstret 04:04–04:14 byggde klart; ÅTERSTÄLLD 04:34Z grön",
    bevis: "kraschvakt.log 02:54–04:34 kooldownraderna med omstarter +349→+0 och slutlig ÅTERSTÄLLD" },
  "2026-09-22T03:29:29.697Z": { dom: "rotkurad",
    rotorsaka: "samma 09-22-fönster: andra räddningsbygget 03:24 misslyckades 03:28 (artefakt okänd), appen nere i kooldown",
    kur: "pågående deploy tog över 04:04 (RÄDDNING AVSTYRD = lås upptaget), svarar=true 04:14, ÅTERSTÄLLD 04:34Z",
    bevis: "kraschvakt.log 2026-09-22T03:24:06 RÄDDNINGSBYGG → 04:34:06 ÅTERSTÄLLD" },
  "2026-09-22T03:43:38.030Z": { dom: "rotkurad",
    rotorsaka: "sista kvarten av samma 09-22-kooldown (omstarter +585 vid 03:44); appen väntade på deployens klart-bygg",
    kur: "deploy 04:04–04:14 + ÅTERSTÄLLD 04:34Z grön; kooldown 04:24 omstarter +0",
    bevis: "kraschvakt.log 03:44:06 (kooldown 16 min av 30, +585) → 04:34:06 ÅTERSTÄLLD" },
  "2026-09-24T00:01:37.299Z": { dom: "rotkurad",
    rotorsaka: "«server mättad»-kaskaden 23:52–00:22 (transport-RPC svält under fabrikssyskonlast) — app omstartad ~00:03",
    kur: "omstart + lastminskning; kaskadklassen utreds/ägs av drift-pulsvakt-spåret (bokförd o156 §omgivning); prod grön från 00:0x",
    bevis: "worklog o156 §omgivning (s8-u3 09-24): kaskadfenomenet 23:52–00:22 med omstart ~00:03 dokumenterat" },
  "2026-09-24T01:20:23.302Z": { dom: "rotkurad",
    rotorsaka: "kraschloop-episod 1: appen dog under nattens minnesbelastning; pm2 status cycling (stopping) vid kraschvaktens ingripande",
    kur: "kraschvakten RÄDDNINGSBYGG 01:24:16Z (pm2 stoppas medvetet vid misslyckat bygg); kedjan grön 04:54 ÅTERSTÄLLD",
    bevis: "kraschvakt.log 2026-09-24T01:24:16 KRASCHLOOP-MISSTANKE → 04:54:34 ÅTERSTÄLLD (omstarter +0)" },
  "2026-09-24T01:20:27.659Z": { dom: "rotkurad",
    rotorsaka: "samma sekund som F2-radens stopping: prod osvarar under kraschloop-episod 1 (01:24-räddningsbygget)",
    kur: "kooldown 120 min design; svarar=true 02:24, ny episod 02:54, slutlig ÅTERSTÄLLD 04:54Z grön",
    bevis: "kraschvakt.log 2026-09-24T01:24–04:54 (två KRASCHLOOP-MISSTANKAR, AVSTYRD 02:14 deploy-lås, ÅTERSTÄLLD 04:54)" },
  "2026-09-24T03:35:28.927Z": { dom: "rotkurad",
    rotorsaka: "kraschvaktens EGEN design: pm2 lämnas STOPPAD efter misslyckat räddningsbygg (01:38, artefakt okänd) — restart mot ofullständigt .next = kraschloop",
    kur: "kooldown tillåter nästa poll bygga klart; online igen 04:14, ÅTERSTÄLLD 04:54Z",
    bevis: "kraschvakt.log 01:38:33 (pm2 lämnas STOPPAD, designmotivering) + 04:04:04 status=stopped → 04:14 online" },
  "2026-09-24T03:35:33.497Z": { dom: "rotkurad",
    rotorsaka: "samma 5:e-sekund som stopped-raden: prod osvarar medan pm2 medvetet hålls stoppad under kooldown 120",
    kur: "deploy/bygg färdigt 04:04–04:14 (svarar=true), ÅTERSTÄLLD 04:54Z grön",
    bevis: "kraschvakt.log 03:34:03 (kooldown 40 min av 120) → 04:14:26 svarar=true → 04:54:34 ÅTERSTÄLLD" },
  "2026-09-24T03:52:16.237Z": { dom: "rotkurad",
    rotorsaka: "kooldown-fas av episod 2: appen nere i väntan på klart-bygg (status stopped 04:04-raden)",
    kur: "bygget klart 04:04–04:14, omstarter +0 vid 04:34, ÅTERSTÄLLD 04:54Z",
    bevis: "kraschvakt.log 03:54:06 (kooldown 60/120, svarar=false) → 04:54:34 ÅTERSTÄLLD" },
  "2026-09-24T04:05:25.595Z": { dom: "rotkurad",
    rotorsaka: "sista minuten innan byggfönstret släppte (deploy-lås upptaget hela natten, RÄDDNING AVSTYRD-klassen)",
    kur: "svarar=true 04:14:26; grön kedja därefter (09:34 omstarter +0)",
    bevis: "kraschvakt.log 04:04:04 (status=stopped, kooldown 70/120) → 04:14:26 svarar=true → 04:54:34 ÅTERSTÄLLD" },
  "2026-09-24T06:07:00.218Z": { dom: "rotkurad",
    rotorsaka: "minnestryck i efterdyningen efter nattens kraschnätter med fabrikshelgslast (load 5,5–6,9 dokumenterad 07:26 DR-rapporten)",
    kur: "agentfabrikens RAM-vakt (vägrar <1 500 MB) höll systemet levande; ingen krasch följde; appen grön genom 11:24+",
    bevis: "kraschvakt.log 05:54–09:04 endast pass/gröna kooldown-rader; s10-u3 DR-rapport 07:26–07:39 dokumenterar lasten" },
  "2026-09-24T09:32:49.292Z": { dom: "rotkurad",
    rotorsaka: "minnestryck under episod 3 (kraschloop-misstanke 09:04, räddningsbygg pågick)",
    kur: "RÄDDNING KLAR 09:24:50 (svarar=true), omstarter +0 från 09:34, gränsnittsvakten GRÖN 11:28Z (0 fynd)",
    bevis: "kraschvakt.log 09:04:11 KRASCHLOOP-MISSTANKE → 09:24:50 RÄDDNING KLAR → 11:24 kooldown 119/120 +0" },
};

const lage = JSON.parse(fs.readFileSync(LAGE, "utf8"));
const hoga = (lage.oppnaLista || []).filter((f) => f.allvar === "HÖG");
if (hoga.length === 0) { console.log(JSON.stringify({ ok: false, fel: "inga öppna HÖGA i lage-filen" })); process.exit(1); }

const kvitton = [];
let ok = 0, avslag = 0, saknad = 0;
for (const f of hoga) {
  const d = DOMAR[f.ts];
  if (!d) { saknad++; kvitton.push({ ts: f.ts, ok: false, fel: "ingen dom definierad i DOMAR-tabellen" }); continue; }
  const args = [GRIND,
    "--fynd", `${f.ts}|${f.spar}|${f.fynd}`,
    "--dom", d.dom, "--rotorsaka", d.rotorsaka, "--kur", d.kur,
    "--bevis", d.bevis, "--protokoll", "o162 §2 (s8-u2, manifest auto-s8-1790255714145)"];
  try {
    const out = execFileSync("node", args, { encoding: "utf8", timeout: 30000 });
    const r = JSON.parse(out.trim().split("\n").pop());
    if (r.ok) ok++; else { avslag++; }
    kvitton.push({ ts: f.ts, ok: !!r.ok, svar: r });
  } catch (e) {
    avslag++;
    kvitton.push({ ts: f.ts, ok: false, fel: String(e.message).slice(0, 200) });
  }
}
fs.writeFileSync(path.join(ROT, "data", "vakten", "_s8u2o162-doma-hoga-kvitto.json"),
  JSON.stringify({ kördes: new Date().toISOString(), hoga: hoga.length, ok, avslag, saknad, kvitton }, null, 1));
console.log(JSON.stringify({ hoga: hoga.length, ok, avslag, saknad }));
process.exit(avslag + saknad > 0 ? 1 : 0);
