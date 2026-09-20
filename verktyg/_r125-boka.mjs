#!/usr/bin/env node
// Rond 125-bokning: worklog-rad + beslutsminne (lokala kanaler).
import fs from "node:fs";

const YTA = "/home/ak1a/agent/ak1";
const rad = `

**ROND 125 [organ:Φ] — F3-STÄNGNINGEN: HELA F3-API-SPÅRET STÄNGT (54 FYND BEDÖMDA MED BEVIS, 0 ÖPPNA KVAR):** F3-api bar 53+ öppna fynd i fyra bevisade familjer + F2:s patch-kö-rad. Verktyg/f3-stang-klasser.mjs (rond 124-mönstret, idempotent, exakta lage-nycklar, fyndfilen orörd): KLASS D — deploy-MEDEL-rader ("/x ej mätbar (deploybygg pågår)") stängs på feljägarens EGEN flock-mätning som primärbevis (/tmp/ak1a-deploy.lock hålls i fyndradens bevisfält; o113 §driftfönster) + tilläggsbevis ur prod-synk.log när deployhändelse träffar ±15 min. KLASS S — självläkta rader på sitt eget omtestbevis (rond 50-omtestet). KLASS G — de tre HÖGA /godkannande → 500 (09-19 08:13/08:29/08:43Z): ÄKTA fel, rot KURAD av ROND 87 (c7e8be1d: ??-fallback + formfilter i godkannande.ts) och LIVE-BEVISAD av ROND 88 (sond: GET 200/36 poster, 401 o-auth); fynden föll i gapet PUSHAD-MEN-OBEYGGD KUR (push 10:28 → bygge 11:01 lokal) — dom rotkurad. INVARIANS-GRIND: verktyget vägrar stänga G om något fynd är nyare än kur-live-tiden 09:01:27Z — under skrivandet fångade grinden "det fjärde fyndet" (14:57-raden) som visade sig vara KLASS D-material (deploy-MEDEL-varianten med låsbevis; $-ankaret i gFynd-regexet skiljer äkta HÖG från fönsterrad) — grinden fungerade som designad. KLASS P — 09:57-stopp-salvan (18 rader: F3 "server död vid omtest"-kaskad + F2 "ak1a = stopped"): prod-synkens PATCH-KÖ stoppar MEDVETET pm2 under byggfönstret (o48/r58-kuren: tomt .next = inga ISR-skrivare) och main():s finally garanterar återstart (o48-garantin); fönstret läses GENERellt ur synkloggen — bevis 09:57:25Z stopp → 10:03:30Z återstart, jakten 09:57:53Z mitt i. 54 bedömningar: D+P+P(f2)=51 transient-design, G=3 rotkurad; 0 matchlösa stängda, 672 redan bedömda hoppade. BEVIS: commit 926016cb → prod e09fc566 (push grön försök 1 via _r125-launch.mjs: commit -F + merge-retry); prod-lage EFTER: ÖPPNA ÄKTA 80 → 29, F3-api 0 öppna, klassfördelning +51 transient-design +3 rotkurad exakt. Kvar öppna: F6-drift 15 (RAM-historyn + prod-osvarar-familjen), F5-logg 11 (nya synkrads-signaturer), s7/s9/F1 3 — nästa ronder. LÄXA: direkt-git i studio-shallet hängde vid commit (tsc >30 s) — node-launchern är standardvägen även för enkla committer.`;

fs.appendFileSync(`${YTA}/worklog.md`, rad + "\n");

const beslut = { ts: new Date().toISOString(), rond: 125,
  beslut: "rond 125 [organ:Φ]: F3-api helt stängt — 54 fynd bedömda med bevis (D deploy-lås primärbevis, S självläkta, G godkannande-500 rotkurad ROND 87/88 med invarians-grind, P patch-kö-stopp med synklogg-fönster); prod-lage 80→29 öppna, F3-api 0",
  landat: "926016cb" };
fs.appendFileSync(`${YTA}/data/vakten/beslutsminne.jsonl`, JSON.stringify(beslut) + "\n");
console.log("bokat: worklog + beslutsminne");
