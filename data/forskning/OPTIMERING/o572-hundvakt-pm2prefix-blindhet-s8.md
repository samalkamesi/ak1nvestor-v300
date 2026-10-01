# o572 — PUMPOR-HUNDVAKTENS TRE MÄTBLINDHETER (v192→v193): pm2-prefix, zombi-main, dött levnadsbevis

**Spår:** 8 KVALITET & SÄKERET · **Manifest:** auto-s8-1790822119281 s8-u3 (vakt 3/3, försök 2)
**Datum:** 2026-10-01 03:5x–04:2x UTC · **Ägare:** s8-u3 (poolreservation 03:07:22Z)
**Status:** LEVERERAD — kurer i drift, bevis på disk

## SAMMANFATTNING

Pumpor-hundvakten — kundens sista skyddsnät när daemonen fryser — var
SJÄLV blind på tre sätt, varav ett gjort den till en ZOMBI sedan
pm2-starten 2026-09-28: pm2 rapporterade "online" men main-blocket hade
ALDRIG körts (noll koll-ronder på 3,5 dygn). Under natten verkställde
dessutom försök-1-processen en FELAKTIG omstart av den FRISKA daemonen
(03:25:13Z, ak1a-pumpor restarts 0→1). Alla tre blindheterna är nu
kurerade, hårda tester (50 PASS) och levande sondbevis bär kuren, och
vakten skrev 04:15:20Z sitt FÖRSTA levnadsbevis i pm2-drift någonsin:
`{"händelse":"vakten-startad","version":"o572","drift":"pm2:4"}`.

## FAKTA-KEDJAN (FÖRE-BEVIS)

1. **Daemonens logg bytte format 09-30 18:54** (stop+start av annan
   session): sedan dess bär praktiskt taget EVERY rad pm2-tidsprefix
   `"2026-10-01T04:02:22: …"` (empiri: 1 154 av 1 155 rader i svans-
   fönstret; 0 prefixlösa).
2. **Blindhet 1 — parsern:** v192:s pulsregex var `^`-ankrad mot
   prefixlös `"HH:MM:SS "` ⇒ `beraknaSenasteRadTs` = null ⇒ "aldrig
   omstart utan positivt tystnadsbevis" ⇒ vakten kunde ALDRIG larma.
   Sond (skarp logg): FÖRE=null med pulsen 28 s gammal (04:06:53Z).
3. **Blindhet 2 — levnadsbeviset:** vakten journalerade INGET vid
   start/under drift och dess pm2-utlogg var 0 byte sedan 09-28 ⇒ dess
   egen levnad var obevisbar (journalen `pumpor-hundvakt.jsonl` saknades
   helt före 03:23Z).
4. **Blindhet 3 — main-detektionen (roten till zombin):** under pm2 är
   `process.argv[1]` = `/usr/lib/node_modules/pm2/lib/ProcessContainerFork.js`
   — INTE skriptet; cmdline LURAR via process.title. pm2-starttest
   04:12:02Z bevisade `arHuvudprogram: false` med v192:s check ⇒
   driftstart-blocket hoppades över; IPC-kanalen (NODE_CHANNEL_FD) höll
   processen vid liv som tyst zombi. pm2 "online" = livstecknet ljög.
5. **Incidenten natten till 10-01:** försök-1-processen (startad
   03:22:43Z med försök-1:s experimentkod) dömde 03:25:13Z FRYSNING med
   daemonen frisk (loggen pulserade varje minut; senasteLoggrad
   03:20:00 var en tillfällig prefixlös rad i fönstret) och startade om
   ak1a-pumpor (restarts 0→1 ~03:26). Därefter tystnad — och koden på
   disk återställdes ~03:27 till HEAD av kraschvaktens trädomställning
   (osparad kur revs), medan processen levde kvar med beväpnat state
   (frusenSedan + omstarterIFöljd=1): en MINA — första prefixlösa raden
   i loggfönstret hade utlöst omstart nr 2.

## KURER (verktyg/pumpor-hundvakt.mjs, v192→v193)

- **K1 parsern:** `beraknaSenasteRadTs` tolkar ÄVEN pm2-ISO-prefix
  (`^YYYY-MM-DDTHH:MM:SS[.f]+:` — fullständigt datum ger direkt
  `Date.UTC`, ingen midnattsgissning; komponentvalidering; fraktional
  tolereras). Prefixlös `HH:MM:SS ` behåller sin logik. Blandade
  svansar täcks — formatbyten kan aldrig mer blinda pulsvaket.
- **K2 levnadsjournalen:** ny `byggLevnadsjournal({nu, lasRader,
  journal})` med `starta()` (rad "vakten-startad" vid driftstart, bär
  version + drift) och `puls()` ("puls-läge" var 6:e h med senaste
  tolkade logg-ts + tystnad — ALDRIG omstartsbefogenhet). Gemensam
  `skrivJournal()` (JSONL på disk) — levnadsbeviset lever oberoende av
  stdout-pipan (som visade sig faktiskt vara död: se restpost 1).
- **K3 main-detektionen:** ny ren funktion `arMainProcess({argv1, env,
  modulUrl})`: sann om argv[1] ÄR modulen (manuell körning) ELLER
  pm2:s `pm_exec_path` matchar modulens URL i närvaro av `pm_id`
  (pm2 fork-drift). Främmande/ärvd pm-miljö (t.ex. zcode-barnets
  pm_exec_path=/usr/bin/taskset) ger FALSKT — testfall L3.

## EFTER-BEVIS

- **Svit:** 50 PASS · 0 FAIL (nya block J: pm2-tolkning + regressionen
  "v192 blind på ren pm2-svans"; K: levnadsjournalen; L: main-
  detektionens fem fall). `node --check` × 3 gröna.
- **Sond mot skarp logg** (`_s8u3o572-hundvakt-sond.mjs`): FÖRE (v192
  replikerad) = null · EFTER (modulens parser) = puls 28 s gammal.
- **pm2-starttest** (`data/vakten/_s8u3o572-pm2-starttest.log`): med
  o572-detektionen `arHuvudprogram: true` under wrapper-argv.
- **Drift:** `pm2 restart pumpor-hundvakt` 04:15:19Z ⇒ journalrad
  `"vakten-startad","version":"o572","tystnadTröskelS":180,"drift":"pm2:4"`
  04:15:20.094Z — FÖRSTA main-körningen i pm2-drift sedan 09-28.
  40+ s drift: noll frysning-domar (daemonen frisk), ak1a-pumpor
  restarts oförändrat 1, daemonen pulserar.
- **KVD:** `node node_modules/typescript/bin/tsc --noEmit` = 0 fel ·
  mimosa-paritet `--doman .` GRÖN 0 fynd · src orörd (inget bygge) ·
  R2 orörd · data/blogg orörd · syskonytor (u1/u2) orörda.

## INDEXERING (vaccination)

pm2-listans övriga node-skript genomgångna: `pulsvakt.mjs` och
`pumpor-daemon.mjs` saknar argv[1]-main-detektion (kör på toppnivå —
ingen zombi-risk). Hundvakten var den ENDA bäraren av fällan — och bar
den just för att den byggdes testbar (import-bar modul). Lärdomen:
**main-detektion i pm2-driftade skript MÅSTE klara ProcessContainerFork;
argv[1]-jämförelse är ZOMBI-FÄLLAN; pm_exec_path+pm_id är pm2:s sanna
skript-vittne.**

## RESTPOSTER (bokas till drift-ägare/nästa våg — jag äger dem INTE)

1. **pm2-loggningens döda pipe:** pumpor-hundvakts out/error-loggar är
   0 byte sedan 09-28 trots online-processer (stdout = socket till God
   Daemon, aldrig spolas till fil). K2-kuren kringgår (journal på disk
   är sanningskällan) men pm2:s loggläge förtjänar en driftsgranskning.
2. **Daemonens dödsrot 09-29 23:50 + 16:53 SIGINT-stormen** — redan
   bokförd som restpost av försök 1; ägs av drift.
3. **Varför loggen fick pm2-prefix 18:54** (--time-miljöbyte vid den
   omstarten) — kunskap, ingen åtgärd; K1 gör vakten immun ändå.
4. **Första "puls-läge"-raden** landar ~10:15Z (6 h efter start) —
   nästa rond kan verifiera den som livstecken.

## PROTOKOLLFILMER

- Sond `_s8u3o572-hundvakt-sond.mjs` behålls som levande regressions-
  instrument; pm2-starttestet var engångs (filen raderad, loggen kvar
  som bevis i data/vakten/).
- Försök 1:s arbete (kurerad modul + omstart 03:22) revs av trädomställ-
  ningen FÖRE commit — parallell till minnesnoten "kraschvakten åter-
  ställer trädet — committa tidigt". Försök 2 (detta protokoll) skrev
  koden om från HEAD och committar direkt.
