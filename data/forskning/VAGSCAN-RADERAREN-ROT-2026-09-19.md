# VAGSCAN-RADERAREN — rot-jaktens läge 2026-09-19 (ROND 85, huvudagenten [organ:Φ])

Uppdrag: s9-u2:s köpost (STORFYND a7174cb0: vagscan-historiken raderas samma dag,
kvartalsdeduben slagen). Denna rond körde fyra read-only sonder (REST + SQL + git +
live-HTTP). Mimosa-kontraktet hölls: nycklar endast via loadEnvFile/env-block, aldrig
loggade; inga skrivningar mot databasen; inget bygge.

## Beviskedjan — sex fynd

**FYND 1 — TVÅ SUPABASE-PROJEKT (avgörande ramfaktor).**
Appen och REST-exporterna läser projektet `aufrvmesyzsfsuhvlsbp` (NEXT_PUBLIC_SUPABASE_URL;
system_events = 166 673 rader, type-kolumn, UUID-id:n). Serverns `DATABASE_URL` pekar på
`db.rkaqmulgoubvewwnwxrw.supabase.co` — ett ANNAT projekt. All SQL-introspektion måste
alltså riktas mot aufr; rkaq är en parallell värld (sannolikt äldre drift med egen
ai-board-cycle edge function via pg_cron var 15:e minut).

**FYND 2 — rkaq-katalogen FRIAD.** rkaq:s pg_cron (5 jobb) + funktioner genomgångna med
fulla definitioner (`snapshot_section_data`, `compute_all_wave_signals`,
`measure_due_forecasts`): ingen innehåller DELETE FROM system_events. Triggers på
system_events: tomma. REST-objektet på aufr exponerar 373 tabeller (katalog mätbar vid behov).

**FYND 3 — raderingen var ETT ENGÅNGSINGREPP, ingen löpande städ.** Bevis: dagens
vagscan-rad (skriven 05:05Z) LEV vid sond 07:5xZ — trots att flera dagliga "städ-minuter"
(00:00Z autonom, 05:30Z vagvalidering) passerat; export-diffarna 17→18 och 18→19 = 0
försvunna (s9-u2). Fönstret: [09-16 05:24Z, 09-17 00:40Z]. Efter fönstret: noll upprepningar.

**FYND 4 — NUVARANDE KOD BEVISAT OSKYLDIG (mekaniskt).** organRetention (organ.ts:221+)
raderar enbart (a) per typfilter äldre än 30/35 DAGAR — aldrig dagsfärska rader — och
(b) tak-överkott ÄLDST FÖRST (`raknaTak`). De fyra försvunna var de NYASTE av sina typer
(samtliga skrivna 09-16, varav tre kl 05:05). Ingen gren i aktuell kod kan nå dem.
(Detta oberoende bekräftar s9-u2:s DELETE-audit av HEAD.)

**FYND 5 — Vercel-deploymenten DÖD.** `newak1a.vercel.app`, `ak1a-research-lab.vercel.app`,
`lab-ak1nvestor.vercel.app` → samtliga 404 utan AK1A-signatur. Two implications:
(a) s9-u2:s "Vercel-minuten"-koppling av 05:05Z-scannern är SVAG — skannern (som skriver
dagens rad varje dag kl 05:05:2xZ) körs av en oidentifierad aktör: kvarvarande kandidater
är aufr:s egna pg_cron/edge function (kräver aufr-SQL) eller externt skript med service-nyckel;
(b) vercel.json:s cronkatalog (autonom 00:00Z, vagscan 05:00Z, vagvalidering 05:30Z m.fl.)
träder sannolikt ALDRIG längre — Vercel-klassen som raderare nedgraderad.

**FYND 6 — raderarens profil.** Id-riktad DELETE mot aufr system_events med behörig nyckel
(service-role-nivå), engångs, i fönstret, riktad mot typ-gruppen vagscan/signal/organ —
alla fyra rader var dagens; historiken före dem var redan borta (exporten 09-16 bar enbart
dagens fyra). Aktör som INTE kör aktuell repokod. Kvarvarande kandidater: (1) manuell/
dashboard-åtgärd i Supabase aufr, (2) externt skript med service-nyckel, (3) en äldre
kodversion av retentionen (VÅG 50-kommentaren bevisar att det HISTORISKT funnits en
global 500-radstäpel som "kunde radera dagens trafik samma natt") körd enväg av en
kvarlevande aktör.

## Köposter (nästa steg, i ordning)

1. **aufr SQL-access** — .env saknar aufr-anslutning (endast DATABASE_URL=rkaq finns).
   Kundens Supabase-dashboard: projekt aufrvmesyzsfsuhvlsbp → Database → connection string.
   Med den: aufr:s `cron.job` (finns skannerns schema? finns en städare?), `pg_trigger`,
   `pg_stat_activity` samt Loggar/Logs runt 09-16→09-17 (PostGREST DELETE-radernas
   api_key-identitet = rot-ID). R2-notis: nyckeln hanteras enligt Mimosa (loadEnvFile,
   aldrig loggad).
2. **aufr Logs-granskning i dashboard** (kräver ingen SQL): DELETE-events i fönstret.
3. **Allowlist-kur avvakta** tills rot-ID är känt (s9-u2:s princip: kur FÖRST efter rot).

## KVD

Read-only samtliga sonder; inga nycklar värda loggades; inget bygge (deploy ägs av
prod-synken); src/ orört; R2 orörd; data/blogg/ orörd; syskonytor orörda. Skript:
verktyg/_r85-vagscan-rot{,2,3,4}.mjs + _r85-vercel.mjs (städas vid landningen).
