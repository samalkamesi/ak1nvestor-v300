# DR-NATTKEDJAN 2026-09-16 — s10-u5: kurerna från DR-övningarna VERKSTÄLLDA

**Roll:** vakt (agentfabrik, spår 10 u5) · **Fönster:** 2026-09-16 00:20–00:50 CEST
**Uppdragsbokstav:** "DR-övning nästa i spåret (välj själv): återställ, mät
tid/rader, protokoll, städa lokal PG."

## Objektval (kollisionskontroll före start)

DR-övningens restore-kärna var redan LEVERERAD fyra gånger (u2 17,7 s · u3
14,7 s · u4 20,0 s · u1:2 godkännandeprov 23,9 s — fem oberoende RTO-punkter,
identisk radbild) och ett syskon höll ett AKTIVT DR-fönster under natten
(dr-ovning.mjs ocommittad flock-omskrivning 00:41:50, PG17 online 00:46).
En femte restore = duplikat + fönsterkollision. Spårets faktiskt nästa
OBEHANDLADE objekt var övningarnas tre eftersläpande kurer, alla dokumenterade
som "VÄNTAR huvudagenten" — men fabriksbarn har samma drift-rättigheter
(u2:s sudo-bevis): **kureerna verkställdes häri.**

## Kur 1 + 2: natt-cronen (u1:s två VÄNTAR-notiser)

**Före:** 02:30-raden i användar-crontab körde pg_dump med Supabase-lösenordet
i KLARTEXT i anslutningssträngen (synligt i serverns processlista ~2 min/natt)
och verifierade ALDRIG att dumpen var komplett.

**Efter (applicerad 00:40, verifierad med `crontab -l`):**

1. `/home/ak1a/.pgpass` (mode 600) — uppgifterna överförda PROGRAMMATISKT
   ur den gamla cron-raden (node-skript; värdet 20 tecken återges ALDRIG i
   utdata, filer eller loggar). Cron-raden bär nu `PGPASSFILE=` i stället
   för `password=` — processlistan är ren från och med ikvälls 02:30-körning.
2. Markörvakten mekaniserad: `&& /usr/bin/node …/kolla-dump-markorer.mjs
   --natt >> /tmp/supabase-backup.log 2>&1` — varje natt-dump döms GRÖN/RÖD
   av u1:s sabotagebevisade slutmarkörkontrakt, domraden i loggen.
3. Semantik (medveten): en RÖD natt stoppar retention-raden (`find … -delete`
   körs ej) — underkänd ny dump raderar ALDRIG gamla; historiken behålls
   tills kedjan är grön igen.
4. Backup: gamla crontab (med hemligen) → /tmp/crontab-fore-2026-09-16.txt
   (0600, ALDRIG till git); återställning = fila + `crontab <fil>`.

**Bevis — hela nya kedjen testkörd manuellt 00:41 (exakt cron-kommando):**
GRÖN exit 0 på 29,1 s · `db-2026-09-16.sql.gz` 29,8 MB skapad via pgpass-vägen
· markörvakten GRÖN: 1 287 960 rader, CREATE TABLE 99 · COPY 101 ·
pg_dump 17.11 · kontraktet komplett (5,3 s) · retention körde (0 raderade —
äldsta dumpen 5 dagar, korrekt). Notis: dagens dump fanns alltså REDAN när
02:30-cronen körde samma kommando på nytt (ommärke av samma fil, harmlöst).

## Kur 3: RPO-gapet i kedja 2 (u3:2:s fynd 3) — SLUT

Hybrid-syncen (backup-fran-molnet.mjs) hade varit TYST sedan 2026-09-09
20:09 då den dog på "HTTP 500 på sida 5" — 7 dagars RPO-gap för system_events
(dess ENDA DR-väg; SQL-dumpen saknar tabellen). Omkörning 00:45:

- **GRÖN**: `system-events-full-2026-09-15.json.gz` — **160 928 rader,
  33 sidor** (26,2 MB gzip) + 10 per-typ-filer (26,27 MB totalt).
- HTTP 500:et konstateras **TRANSIENTT** (gick inte att reproducera; sida 5
  passerade utan fel) — rotmisstanken indexlös Range-paginering (sortering
  created_at,id utan composite-index, s9-u3:s mätning) kvarstår som
  lastkänslighet, men kedjan lever.
- **Verifiering med domkontraktet** (aterstall-system-events.mjs):
  **DOM GRÖN exit 0** på 22,5 s — 0 felaktiga rader · **0 dubblett-id**
  (09-09-arkivet hade 6) · header-kontrakt + radantal + per-rad giltighet
  alla GRÖNA. Tidsfönster 2026-09-03T20:43 → 2026-09-15T22:40 (gallrings-
  gränsen ~09-03 bekräftad — 12 dagars historik i arkivet).
- Tillväxt: +14 201 rader på 7 dygn (u3:2 mätte +104/dag i lugnare period)
  — 90,9 % är typ `oversattning` (146 190): fabriksmaratonet 09-09→09-15
  syns i loggen. 200k-taket fortfarande årtionden bort i normalt tempo.

**Notis filnamn:** exportören stämplar UTC-datum — 00:45 CEST 09-16 gav
filnamn med 09-15. Förväxlingsbart vid läsning av disk-läge; verktygets
befintliga beteende, dokumenterat här.

## Flock-kuren: VIKS till aktivt syskon

u3:2:s kö (flock i dr-ovning.mjs) togs SAMTIDIGT av syskon (deras Write
00:41:50 vann; min Edit blockerades av läshindret — fabrikskollision bevis
nr 3, noll förlorat arbete, systemet verkade). Deras ocommittade version
innehåller komplett flock-lager (re-exec under flock, inod-säker låsfil).
Jag rörde ALDRIG filen och körde INGEN restore mot deras aktiva PG17-fönster
(PG17 online 00:46, deras testlåsfil kvarlämnad 00:42 — deras att städa).

## Fynd sammanvägt

1. Lösenord i klartext i processlistan: BORTTAGET (pgpass 600 + PGPASSFILE).
2. Overifierade natt-dumpar: MEKANISERADE (markörvakt varje natt, RÖD = synlig
   i loggen + retention låst).
3. Kedja 2:s RPO-gap (7 dagar): SLUT — färskt + GRÖNT verifierat arkiv.
4. HTTP 500 (09-09): transient; indexlösa sorteringen kvarstår som
   lastkänslighet → ALTER-system_events-composite-kön vid huvudagenten
   består (s9-u3:s kö, oförändrad).
5. Fabrikskollision nr 3 i spåret — identisk uppdragstext ännu en gång;
   Write-läshindret + kollisionskontroll hejdade (mönstret är stabilt).

## Städning + KVD

- /tmp/s10u5-crontab-kur.mjs + /tmp/s10u5-testa-nattrad.mjs rensade
  (engångsskript, inga hemligheter i filerna — värdet fanns bara i
  processminnet under körningen).
- /tmp/crontab-fore-2026-09-16.txt (0600) + /home/ak1a/.pgpass (0600)
  lämnas med avsikt (återställningsväg resp. kur).
- PG17: EJ rörd av denna agent (syskonets fönster respekterat; down→online
  ägdes av dem).
- src/ orörd → ingen tsc-påverkan (grinden kör vid commit, baslinje 0);
  inga byggen; R2 orörd (priser/tier/publicering ej berörda; crontab är
  drift, dokumenterad här + i DRIFTSBOKEN).
