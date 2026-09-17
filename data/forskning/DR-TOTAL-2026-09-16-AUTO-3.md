# DR-TOTAL 2026-09-16 — KOMPLETT kvartalsövning, samtliga 5 kedjor (GODKÄNT)

Körd av `verktyg/dr-total.mjs` (spår 10) — kvartalsmallens steg som ETT
kommando, i DRIFTSBOKENs mallordning 1 → 5 → 2 → 4 → 3 (PG-kedjorna
först, serverfilsarkivet sist). Barnverktygen äger sina egna DR-lås
(/tmp/ak1a-dr-prov.lock) och sina egna delprotokoll — detta är överprotokollet.

| Kedja | Vad | Verktyg | Exit | Väggtid | Dom | Delprotokoll |
|---|---|---|---|---|---|---|
| 1 | SQL-dumpen (Supabase → PG17-skrap) | dr-ovning.mjs | 0 | 21.5 s | GRÖN | DR-PROV-2026-09-16-AUTO-6.md |
| 5 | Kirurgisk tabell-återställning (EN-tabells-scenariot) | dr-kedja5.mjs | 0 | 73.0 s | GRÖN | DR-KEDJA5-2026-09-16-AUTO-4.md |
| 2 | Moln-JSON: system_events (fullarkiv) | dr-kedja2.mjs | 0 | 37.3 s | GRÖN | DR-KEDJA2-2026-09-16-AUTO-5.md |
| 4 | Per-typ-snapshots (typvyerna) | dr-kedja4.mjs | 0 | 29.1 s | GRÖN | DR-PROV-2026-09-16-KEDJA4-5.md |
| 3 | Serverfils-arkivet (tar.gz + git bundle) | dr-kedja3.mjs | 0 | 26.4 s | GRÖN | DR-KEDJA3-2026-09-16-AUTO-6.md |

| TOTALT | **summa kedjor 187.2 s · väggklocka 187.2 s** | — | — | — | **GRÖN** | denna fil |

RPO-läge övningen testades mot (nyaste källa per kedja, mätt på disk):

- Kedja 1 (SQL-dumpen (Supabase → PG17-skrap)): db-2026-09-16.sql.gz
- Kedja 5 (Kirurgisk tabell-återställning (EN-tabells-scenariot)): db-2026-09-16.sql.gz
- Kedja 2 (Moln-JSON: system_events (fullarkiv)): system-events-full-2026-09-16.json.gz
- Kedja 4 (Per-typ-snapshots (typvyerna)): blogg-publicerade-2026-09-16.json
- Kedja 3 (Serverfils-arkivet (tar.gz + git bundle)): server-git-2026-09-16.bundle

Nyckelrader per kedja (ur barnens loggar — fullständig bevisning i delprotokollen):

**Kedja 1 — dr-ovning.mjs** (ur barnets stdout; tmp-loggarna städas):
- GRÖN  db-2026-09-16.sql.gz  29.8 MB  1 288 041 rader  CREATE TABLE 99  COPY 101  pg_dump 17.11 (Ubuntu 17.11-1.pgdg24.04+2)
- [4/7] ÅTERSTÄLLER (zcat \| psql) — RTO-mätning startar …
- KLART på 11.8 s · felrader 788 (kända 788, okända 0) → /tmp/dr-ovning-fel-2026-09-16.log
- [5/7] Mäter tabeller och rader …
- public 60 tabeller / 1 266 528 rader · public+storage 68 / 1 266 664 · alla scheman 99 / 1 266 924
- skrap-DB raderad · PG17 stoppad.
- SUMMERING: 1/1 GRÖNA — alla dumpar kompletta enligt markörkontraktet (5.4 s)

**Kedja 5 — dr-kedja5.mjs** (ur barnets stdout; tmp-loggarna städas):
- GRÖN  db-2026-09-16.sql.gz  29.8 MB  1 288 041 rader  CREATE TABLE 99  COPY 101  pg_dump 17.11 (Ubuntu 17.11-1.pgdg24.04+2)
- [5/8] FULL ÅTERSTÄLLNING i skrap-DB (källmåttstocken) — RTO-mätning …
- KLART på 11.4 s · felrader 788 (okända 0) → /tmp/dr-kedja5-fel-2026-09-16.log
- källa: 1 176 468 rader · checksumma 7af32541f90e…
- 1 176 468 datarader · 93369 KiB · 2.2 s
- psql VÄGRADE · tabellen orörd (0 rader — transaktionen rullades tillbaka) · psql:/tmp/dr-kedja5-1313524-sabotage.sql:1176471: ERROR:  missing data for …
- 1 176 468 rader tillbaka på 13.7 s · checksumma IDENTISK med källan
- skrap-DB raderad · PG17 stoppad.

**Kedja 2 — dr-kedja2.mjs** (ur barnets stdout; tmp-loggarna städas):
- Läst:   161678 rader · 0 felaktiga · details=null i 0 · dubblett-id 4 (tabellen saknar PK — se DR-protokollet)
- Tid:    totalt 31373 ms · COPY-fas 31343 ms (5158 rader/s)
- [GRÖN] samtliga rader giltiga (id/event_type\|type/message/created_at)
- [GRÖN] psql COPY lyckades (exit 0) och räknade 161678 rader
- rader: 161678
- [7] Städning: ak1a_dr_json raderad · PG17 stoppad/nere
- [GRÖN] gzip-ström läst utan fel
- [GRÖN] header-kontrakt (typ=system_events_full, truncerad=false, antal>0)

**Kedja 4 — dr-kedja4.mjs** (ur barnets stdout; tmp-loggarna städas):
- [GRÖN] antal ≠ rader.length RÖD
- arkiv 161 678 rader · matchade 10 av 10 · saknade 0
- [4] ak1a_dr_pertyp.per_typ_probe skapad — COPY inläsning (RTO-mätning):
- COPY exit=0 n=10 · 0.06 s · 10 rader från 10 filer
- [6] Städning: ak1a_dr_pertyp raderad · PG17 stoppad/nere
- [GRÖN] giltig fil GODKÄNS
- [GRÖN] trunkerad JSON RÖD
- [GRÖN] fel typnamn RÖD

**Kedja 3 — dr-kedja3.mjs** (ur barnets stdout; tmp-loggarna städas):
- [3] Restore GRÖN: 8322 filer + 570 kataloger == listat · src 675 filer / 203 930 rader kod.
- [7] Städning: /tmp/dr-kedja3-1314147 raderad (restore + sabotage + klon + bv)
- [1] Självsabotage — domkontraktet ska gripa innan något döms GRÖNT:
- sabotage s1 kapad gzip (60 %): GRIPET (RÖD väntat)
- sabotage s2 skräpfil med .tar.gz-ändelse: GRIPET (RÖD väntat)
- sabotage s3 kapad bundle (60 %): verify GODTAR den (fynd: header-rubrik ej integritet) · klon dödar (huvuddom): GRIPET (RÖD väntat)
- [2] Arkiv A: gzip GRÖN · 8892 poster · exkludering 0 brott.
- [5] Arkiv B: verify GRÖN · klon GRÖN 1195 commits · ancestor GRÖN.

Avbrottsorsak: ingen

- PG17 NERE vid övningens slut — korrekt viloläge (skrap-DB:er kan ej finnas i ett nere kluster).

Dom: **GRÖN (exit 0)** — samtliga 5 kedjor restore-bevisade i EN sekvens; TOTAL-RTO ovan är plattformens återställningstid för data+kod (nätverksflytt till ny VPS tillkommer i verklig katastrof).

SLUT — maskinellt genererat av dr-total.mjs 2026-09-16T23:55:16.475Z
