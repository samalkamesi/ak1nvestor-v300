# DR-TOTAL 2026-09-16 — KOMPLETT kvartalsövning, alla fyra kedjorna (GODKÄNT)

Körd av `verktyg/dr-total.mjs` (spår 10) — kvartalsmallens FYRA steg som ETT
kommando, i DRIFTSBOKENs mallordning 1 → 2 → 4 → 3 (PG-kedjorna först,
serverfilsarkivet sist). Barnverktygen äger sina egna DR-lås
(/tmp/ak1a-dr-prov.lock) och sina egna delprotokoll — detta är överprotokollet.

| Kedja | Vad | Verktyg | Exit | Väggtid | Dom | Delprotokoll |
|---|---|---|---|---|---|---|
| 1 | SQL-dumpen (Supabase → PG17-skrap) | dr-ovning.mjs | 0 | 23.3 s | GRÖN | DR-PROV-2026-09-16-AUTO-3.md |
| 2 | Moln-JSON: system_events (fullarkiv) | dr-kedja2.mjs | 0 | 43.8 s | GRÖN | DR-KEDJA2-2026-09-16-AUTO-3.md |
| 4 | Per-typ-snapshots (typvyerna) | dr-kedja4.mjs | 0 | 33.4 s | GRÖN | DR-PROV-2026-09-16-KEDJA4-3.md |
| 3 | Serverfils-arkivet (tar.gz + git bundle) | dr-kedja3.mjs | 0 | 29.6 s | GRÖN | DR-KEDJA3-2026-09-16-AUTO-4.md |

| TOTALT | **summa kedjor 130.0 s · väggklocka 130.0 s** | — | — | — | **GRÖN** | denna fil |

RPO-läge övningen testades mot (nyaste källa per kedja, mätt på disk):

- Kedja 1 (SQL-dumpen (Supabase → PG17-skrap)): db-2026-09-16.sql.gz
- Kedja 2 (Moln-JSON: system_events (fullarkiv)): system-events-full-2026-09-16.json.gz
- Kedja 4 (Per-typ-snapshots (typvyerna)): blogg-publicerade-2026-09-16.json
- Kedja 3 (Serverfils-arkivet (tar.gz + git bundle)): server-git-2026-09-16.bundle

Nyckelrader per kedja (ur barnens loggar — fullständig bevisning i delprotokollen):

**Kedja 1 — dr-ovning.mjs** (ur barnets stdout; tmp-loggarna städas):
- GRÖN  db-2026-09-16.sql.gz  29.8 MB  1 288 041 rader  CREATE TABLE 99  COPY 101  pg_dump 17.11 (Ubuntu 17.11-1.pgdg24.04+2)
- SUMMERING: 1/1 GRÖNA — alla dumpar kompletta enligt markörkontraktet (6.5 s)
- [4/7] ÅTERSTÄLLER (zcat \| psql) — RTO-mätning startar …
- KLART på 12.2 s · felrader 788 (kända 788, okända 0) → /tmp/dr-ovning-fel-2026-09-16.log
- [5/7] Mäter tabeller och rader …
- public 60 tabeller / 1 266 528 rader · public+storage 68 / 1 266 664 · alla scheman 99 / 1 266 924

**Kedja 2 — dr-kedja2.mjs** (ur barnets stdout; tmp-loggarna städas):
- Läst:   161678 rader · 0 felaktiga · details=null i 0 · dubblett-id 4 (tabellen saknar PK — se DR-protokollet)
- Tid:    totalt 38257 ms · COPY-fas 38222 ms (4230 rader/s)
- [GRÖN] gzip-ström läst utan fel
- [GRÖN] header-kontrakt (typ=system_events_full, truncerad=false, antal>0)
- [GRÖN] radantal === väntat antal (header.antal)
- [GRÖN] samtliga rader giltiga (id/event_type\|type/message/created_at)

**Kedja 4 — dr-kedja4.mjs** (ur barnets stdout; tmp-loggarna städas):
- [GRÖN] giltig fil GODKÄNS
- [GRÖN] trunkerad JSON RÖD
- [GRÖN] antal ≠ rader.length RÖD
- [GRÖN] fel typnamn RÖD
- variabler: antal 0 · GRÖN
- variabel-andringar: antal 0 · GRÖN

**Kedja 3 — dr-kedja3.mjs** (ur barnets stdout; tmp-loggarna städas):
- [1] Självsabotage — domkontraktet ska gripa innan något döms GRÖNT:
- sabotage s1 kapad gzip (60 %): GRIPET (RÖD väntat)
- sabotage s2 skräpfil med .tar.gz-ändelse: GRIPET (RÖD väntat)
- sabotage s3 kapad bundle (60 %): verify GODTAR den (fynd: header-rubrik ej integritet) · klon dödar (huvuddom): GRIPET (RÖD väntat)
- [2] Arkiv A: gzip GRÖN · 8892 poster · exkludering 0 brott.
- [3] Restore GRÖN: 8322 filer + 570 kataloger == listat · src 675 filer / 203 930 rader kod.

Avbrottsorsak: ingen

- PG17 NERE vid övningens slut — korrekt viloläge (skrap-DB:er kan ej finnas i ett nere kluster).

Dom: **GRÖN (exit 0)** — alla fyra kedjorna restore-bevisade i EN sekvens; TOTAL-RTO ovan är plattformens återställningstid för data+kod (nätverksflytt till ny VPS tillkommer i verklig katastrof).

SLUT — maskinellt genererat av dr-total.mjs 2026-09-16T11:53:29.830Z
