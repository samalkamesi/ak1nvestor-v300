# DR-KEDJA 5 2026-09-16 — KIRURGISK TABELL-ÅTERSTÄLLNING (AUTO)

Körd av `verktyg/dr-kedja5.mjs` (spår 10, s10-u2 O5). Scenario: EN tabell skadas
i prod (felaktig migrering/DELETE) medan övriga tabeller är friska och nyare än
dumpen — full restore (kedja 1) skulle offra dygnets skrivningar; detta prov
bevisar den kirurgiska vägen. Allt sker i skrap-DB ak1a_dr_k5 på lokal PG17 —
**prod RÖRDES ALDRIG** (applicering mot Supabase vid verklig incident = samma fil
+ psql med nyckel, huvudagentens ägande enligt R2).

Dump: db-2026-09-16.sql.gz · Tabell: public.board_decisions · Rader i källan: 47 042

## 1. Retentionssvep (kedja 3:s läxa på dumparna)

| Dump | Storlek | Ålder | gzip -t | Tid |
|---|---|---|---|---|
| db-2026-09-11.sql.gz | 28.0 MB | 5 d | GRÖN | 1.0 s |
| db-2026-09-12.sql.gz | 28.1 MB | 4 d | GRÖN | 1.1 s |
| db-2026-09-13.sql.gz | 28.5 MB | 3 d | GRÖN | 1.0 s |
| db-2026-09-14.sql.gz | 29.0 MB | 2 d | GRÖN | 1.1 s |
| db-2026-09-15.sql.gz | 29.4 MB | 1 d | GRÖN | 1.1 s |
| db-2026-09-16.sql.gz | 29.8 MB | 0 d | GRÖN | 1.1 s |

Samtliga dumpar i fönstret integritetsgröna.

## 2. Moment

| Moment | Resultat |
|---|---|
| Slutmarkörskontroll (kolla-dump-markorer) | GRÖN |
| Full restore i skrap-DB (källmåttstock) | 16.5 s · felrader 788 (okända 0) |
| Källchecksumma (md5, ordningsbestemd textaggr.) | 17c31ea01766f9d7be264abb7ade6381 |
| Kirurgi-extraktion (zcat+awk ur dumpFILen) | 0.9 s · 47 042 datarader · 79629 KiB |
| Extraktion komplett (datarader == källrader) | GRÖN |
| Katastrof-simulering (DELETE i "prod") | tabellen tömd (0 rader) |
| SABOTAGE (40 % av raderna + \.-terminatorn borta) | nåddes ej |
| **Kirurgi: applicering (DELETE+COPY i EN transaktion)** | nåddes ej |
| **Kirurgi: verifiering rader** | nåddes ej |
| **Kirurgi: verifiering checksumma** | nåddes ej |
| Städning | skrap-DB raderad · PG17 stoppad · tmp raderade |

## 3. Kollateral — kirurgins gränser (runbook-kunskap)

En tabellkirurgi läker SIN tabell men ALDRIG sidoeffekter som katastrofen
orsakade i grannar (här: ON DELETE SET NULL). Per inkommande FK:

| Inkommande FK | ON DELETE | Refererade före | Förlorade vid skada | Fortfarande förlorade efter kirurgi |
|---|---|---|---|---|
| forecast_log(board_decision_id) | SET NULL | 113 | nåddes ej | nåddes ej |

(ingen kollateral kvarstod)

## 4. Runbook — tabellkirurgi vid verklig incident

1. `node verktyg/dr-kedja5.mjs --tabell <schema.tabell>` — bevisar att Dagens dump bär tabellen hel (extraktion+checksumma mot skrap-DB).
2. Ta fram extraktionen i prod-format: verktygets /tmp-fil (ren public.board_decisions-COPY) + prefix `DELETE FROM public.board_decisions;` — EN transaktion, ON_ERROR_STOP.
3. Applicera mot Supabase först efter kollateral-analys (pg_constraint-frågan i verktyget) och i lågtrafik — nyckel tillförs av huvudagenten (R2).
4. Verifiera: rader + checksumma mot skrap-DB:n; grannar enligt §3.
5. Viktiga gränser: FK med NO ACTION/RESTRICT blockerar; CASCADE raderar grannrader; SET NULL lämnar ärr efter sig — alla tre syns i verktygets förkontroll.

## 5. Felkategorisering (full restore)

Kända ofarliga: roller 9 · scheman 2 · övrigt 13 · fortsättningsrader 12. Okända 0.

## 6. Dom

**RÖT — se tabell ovan**

SLUT — maskinellt genererat av dr-kedja5.mjs 2026-09-16T12:05:39.198Z
