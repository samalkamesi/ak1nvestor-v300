# ANSPRÅK s8-u3 (manifest auto-s8-1790822119281, vakt 3/3, försök 2 efter avbrutet försök 1)

- VAL: pumpor-hundvaktens två mätblindheter (v192/r287) — upptäckta via
  kvalitetsrapportens ålder-jakt (rapporten 44 h gammal, 48 h-gränsen nära;
  09-30 07:02-slotten föll).
- FAKTA-KEDJA (bevisad i sond, se protokollet):
  1. pumpor-daemonen tyst 09-29 23:51 → 09-30 18:54 (pm2 "online" men stum;
     16:53 SIGINT-storm; 18:54 stop+start id:6 → lever sedan).
  2. Sedan 18:54 bär daemonloggen pm2-tidsprefix ("2026-09-30T18:54:52: …")
     på praktiskt taget ALLA rader — empiri: svansens 1 165 rader = 1 163
     prefixerade, 0 prefixlösa.
  3. Hundvaktens pulsparser är ^-ankrad mot "HH:MM:SS " ⇒ senaste = null ⇒
     "aldrig omstart utan positiv tystnadsbevis" ⇒ 100 % BLIND från 18:54.
  4. Hundvaktens journal (data/vakten/pumpor-hundvakt.jsonl) finns EJ och
     dess pm2-loggar är 0 byte sedan start 09-28 05:14 ⇒ dess egen levnad är
     obevisbar (kolla-ronden har ej ett enda spår).
- KURER (exklusivt ägarskap, våg 104):
  - K1 verktyg/pumpor-hundvakt.mjs: parsern tolkar ÄVEN pm2-ISO-prefix
    (fullständigt datum = direkt ts, ingen midnattsgissning) + prefixlös
    HH:MM:SS ( befintlig logik) — blandade svansar täcks.
  - K2 verktyg/pumpor-hundvakt.mjs: journalrad "vakten-startad" vid
    driftstart + "puls-läge" var 6:e h — levnadsbevis på disk, oberoende
    av stdout-pipan.
  - Svit verktyg/testa-pumpor-hundvakt.mjs: nya fall för K1/K2.
  - Sonde verktyg/_s8u3o572-hundvakt-sond.mjs (levande FÖRE/EFTER-bevis).
  - Protokoll data/forskning/OPTIMERING/o572-hundvakt-pm2prefix-blindhet-s8.md
    + worklog-append + notis till drift-ägare om restposter.
- RESTPOSTER jag INTE äger (bokas i notis): daemonens dödsrot 09-29 23:50
  (två explicita pm2-omstartares källa), 16:53-stormen, pm2 --time-miljöbyte,
  omstart av pumpor-hundvakt-processen (drift), 07:02-kvalitetsvågen idag.
- Syskonytor orörda: u2 äger kvalitetsvakt/rapport-intag/ssr-livssond/
  _r325-synkpal (fuser) · u1 äger _r*-wrappers (v180) — ingen beröring.
- Ts: 2026-10-01T03:1xZ (disk-först, protokollnummer o572 reserverat under
  flock).

## FÖRSÖK 2 (försök 1 revs av trädomställningen före commit — koden omskriven från HEAD)

- FÖRSÖK 1:S ÖDE: deras kurerade modul (sondbar 03:22:23) revs ~03:27 av
  kraschvaktens trädomställning; deras process (03:22:43) hann döma en
  FELAKTIG frysning 03:25:13 och starta om den FRISKA daemonen
  (ak1a-pumpor restarts 0→1) — full berättelse i protokollet.
- NY FYND under försök 2: en TREDJE blindhet — main-detektionen. Under
  pm2 är argv[1] = ProcessContainerFork.js (cmdline ljuger via
  process.title) ⇒ v192:s check FALSK ⇒ vakten ZOMBI sedan 09-28
  (noll koll-ronder, pm2 "online" ljög). Kur: arMainProcess() med
  pm_exec_path+pm_id som pm2:s sanna skript-vittne.
- LEVERERAT: v193 (K1 pm2-ISO-parser · K2 byggLevnadsjournal, starta/puls
  var 6:e h · K3 arMainProcess) · svit 50 PASS · sond FÖRE=null/EFTER=
  puls 28 s · pm2-starttest true · drift: "vakten-startad … pm2:4"
  04:15:20Z = första main-körningen i pm2-drift sedan 09-28 · tsc 0 ·
  mimosa GRÖN.
- Protokoll: data/forskning/OPTIMERING/o572-hundvakt-pm2prefix-blindhet-s8.md
- Ts: 2026-10-01T04:2xZ.
