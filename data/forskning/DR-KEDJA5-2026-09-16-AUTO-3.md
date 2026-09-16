# DR-KEDJA 5 2026-09-16 — KIRURGISK TABELL-ÅTERSTÄLLNING (AUTO)

Körd av `verktyg/dr-kedja5.mjs` (spår 10, s10-u2 O5). Scenario: EN tabell skadas
i prod (felaktig migrering/DELETE) medan övriga tabeller är friska och nyare än
dumpen — full restore (kedja 1) skulle offra dygnets skrivningar; detta prov
bevisar den kirurgiska vägen. Allt sker i skrap-DB ak1a_dr_k5 på lokal PG17 —
**prod RÖRDES ALDRIG** (applicering mot Supabase vid verklig incident = samma fil
+ psql med nyckel, huvudagentens ägande enligt R2).

Dump: db-2026-09-16.sql.gz · Tabell: public.section_data_snapshots · Rader i källan: 1 176 468

## 1. Retentionssvep (kedja 3:s läxa på dumparna)

| Dump | Storlek | Ålder | gzip -t | Tid |
|---|---|---|---|---|
| db-2026-09-11.sql.gz | 28.0 MB | 5 d | GRÖN | 1.1 s |
| db-2026-09-12.sql.gz | 28.1 MB | 4 d | GRÖN | 1.1 s |
| db-2026-09-13.sql.gz | 28.5 MB | 3 d | GRÖN | 1.0 s |
| db-2026-09-14.sql.gz | 29.0 MB | 2 d | GRÖN | 1.1 s |
| db-2026-09-15.sql.gz | 29.4 MB | 1 d | GRÖN | 1.1 s |
| db-2026-09-16.sql.gz | 29.8 MB | 0 d | GRÖN | 1.3 s |

Samtliga dumpar i fönstret integritetsgröna.

## 2. Moment

| Moment | Resultat |
|---|---|
| Slutmarkörskontroll (kolla-dump-markorer) | GRÖN |
| Full restore i skrap-DB (källmåttstock) | 13.4 s · felrader 788 (okända 0) |
| Källchecksumma (md5, ordningsbestemd textaggr.) | 7af32541f90e670ef141e76cdd529a83 |
| Kirurgi-extraktion (zcat+awk ur dumpFILen) | 2.4 s · 1 176 468 datarader · 93369 KiB |
| Extraktion komplett (datarader == källrader) | GRÖN |
| Katastrof-simulering (DELETE i "prod") | tabellen tömd (0 rader) |
| SABOTAGE (kolumnfel i mitt-rad — strukturellt hel, oläslig data) | GRIPET — psql vägrade (6.9 s), transaktionen rullades tillbaka, tabellen orörd |
| **Kirurgi: applicering (DELETE+COPY i EN transaktion)** | **15.5 s** |
| **Kirurgi: verifiering rader** | 1 176 468 == 1 176 468 GRÖN |
| **Kirurgi: verifiering checksumma** | IDENTISK med källan — GRÖN |
| Städning | skrap-DB raderad · PG17 stoppad · tmp raderade |

## 3. Kollateral — kirurgins gränser (runbook-kunskap)

En tabellkirurgi läker SIN tabell men ALDRIG sidoeffekter som katastrofen
orsakade i grannar (här: ON DELETE SET NULL). Per inkommande FK:

| Inkommande FK | ON DELETE | Refererade före | Förlorade vid skada | Fortfarande förlorade efter kirurgi |
|---|---|---|---|---|
| (ingen) | — | — | ingen kollateral |

(ingen kollateral kvarstod)

## 4. Runbook — tabellkirurgi vid verklig incident

1. `node verktyg/dr-kedja5.mjs --tabell <schema.tabell>` — bevisar att Dagens dump bär tabellen hel (extraktion+checksumma mot skrap-DB).
2. Ta fram extraktionen i prod-format: verktygets /tmp-fil (ren public.section_data_snapshots-COPY) + prefix `DELETE FROM public.section_data_snapshots;` — EN transaktion, ON_ERROR_STOP.
3. Applicera mot Supabase först efter kollateral-analys (pg_constraint-frågan i verktyget) och i lågtrafik — nyckel tillförs av huvudagenten (R2).
4. Verifiera: rader + checksumma mot skrap-DB:n; grannar enligt §3.
5. Viktiga gränser: FK med NO ACTION/RESTRICT blockerar; CASCADE raderar grannrader; SET NULL lämnar ärr efter sig — alla tre syns i verktygets förkontroll. **Triggerfynd (bevisat 2026-09-16): public.board_decisions kan INTE kirurgeras på detta sätt — dess SET NULL-kaskad mot forecast_log träffar immutabilitetstriggern forecast_immutable() som VÄGRAR UPDATE ("registret är oföränderligt") — hela DELETE:n rullas tillbaka. Skyddet är korrekt drift (olycksradering stoppas) men kräver specialrecept (FK-paus eller tabellbyte-swap) som bara huvudagenten äger.**

## 5. Felkategorisering (full restore)

Kända ofarliga: roller 9 · scheman 2 · övrigt 13 · fortsättningsrader 12. Okända 0.

## 6. Dom

**GRÖN — kirurgisk tabellåterställning bevisad: extraktion ur dumpfil, sabotage gripen, innehåll identiskt**

SLUT — maskinellt genererat av dr-kedja5.mjs 2026-09-16T12:13:24.184Z
