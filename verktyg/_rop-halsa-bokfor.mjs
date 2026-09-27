// Bokför rop-hälsa-utredningen 2026-09-25 i worklog.md (node-kanalen, skalkvot kur 1).
import { appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WORKLOG = resolve(dirname(fileURLToPath(import.meta.url)), "..", "worklog.md");

const rapport = `
## ROP-HÄLSA FYND eftersläppt [organ:Ω] — 06:27-cronens FYND förklart till roten: 6 daemon-omstarter 09-24 = bygg-OOM-klassen (bygg×fabrik-RAM-svält) + 1 planerad v169-restart; 0 tystnadsgap · 0 organ-gap · rop-täckningen höll — 2026-09-25

UNDERLAG: rop-hälsacronen (27 6 * * *, rop-halsa-cron.sh ur prod-trädet) larmade FYND 06:27; manuell eftersläpning (node verktyg/rop-halsa.mjs --json data/vakten/rop-halsa.json) bekräftar samma bild: 5 omstarter i 24 h-fönstret · 805 rop · 0 tystnadsgap (tröskel 120 s) · 0 organ-gap · automation-motor aldrig svulten — FYND-klassen drevs ENBART av omstartsgrenen. pm2 vid kontroll: ak1a-pumpor online ↺ 26 (loggen bär 28 startrader sedan 09-15 — konsistent), uptime 9 h = epoken 21:02:56 lokal (19:02:56Z) stabil sedan dess; pulsvakt 8D/↺3 och ak1a-test 16D orörda.

ROTORSAKER (alla 6 starter 09-24; pm2-prefix lokal = UTC+2): (1) NATTKLUSTER 02:21/02:54/03:17/04:08 lokal (00:21→02:08Z, 4 starter på 107 min): pm2-loggen visar PÅGÅENDE bygg under hela klustret — byggstartvarning 03:28 lokal, "Killed" 03:38 lokal (OOM-dödat bygg, error-loggen), Turbopack-bygg live ("Finished TypeScript in 6.3min", "Generating static pages 405/1622") när daemonen dog 05:17:59-prefix + VÄNTAR-FABRIK: aktivt manifest "kritiska-fixar" (fabriksbarn ≈0,8 GB/st) = bygg×fabrik-RAM-svält där OOM-killern tog daemonen och pm2 väckte den — känd design-tålig klass (o136, bygg-OOM). (2) 17:23:19 lokal (15:23:19Z) mitt i 132-commits-bygget mot DEPLOYAD 15:34:51Z (f949dc0a) — samma klass. (3) 21:02:56 lokal (19:02:56Z) = PLANERAD pm2-restart efter v169-daemonkoduppdateringen (b78e5c7d deployad 18:06:04Z; committen "pm2 (ak1a + ak1a-pumpor för daemon-rad) följer") — bevis: nya schemat "ra-gallring 04:41" syns FÖRST i 21:02:56-startloggen; ingen feldöd.

TÄCKNING: NOLL FAKTISK FÖRLUST — vare sig cronens (798 rop) eller den manuella mätningen (805) fann ett enda gap ≥ 120 s; pm2:s snabba omstarter höll rop-flödet intakt genom alla dödar. R2 bevarad: INGEN pm2-omstart utförd — daemonen frisk, rotorsaker bevisade per omstart.

SIDO-FYND (nästa rotor-spår, EJ daemonen): prod-synken har stoppat ~26 polls i rad sedan 20:53:49Z (sista deploy 7899ebff) — kvalitetsrapporten RÖD (14 fel, "E35 gap 3 sista halvan") stoppar deploy FÖRE byggstart varje poll trots upprepade ommätningar; GitHub ligger före prod (arbetsytans HEAD 4069d66e outdeployad). CPU 96,6 % vid kontrollen = sannolikt pågående kvalitetsommätning. KLARLAGT: arbetsytans data/vakten/rop-halsa.json saknades för att cronen skriver sin rapport i PROD-trädet (/home/ak1a/AK1/data/vakten/rop-halsa.json) — GHC-fil, nu återskapad lokalt, lämnas otrackad. ÅTGÄRD: ingen kodändring; vakten lämnas verksam. Uppföljningsregel: upprepas omstartskluster UTAN bygg/fabrik-ankring → rotjakt i verktyg/pumpor-daemon.mjs (o140-tickmätningen finns redan på plats som instrument).
`;

appendFileSync(WORKLOG, rapport.trimEnd() + "\n\n", "utf8");
console.log("BOKFÖRD: rop-hälsa-utredning appenderad till worklog.md");
