# DR-KEDJA 7 2026-09-17 — KIRURGIRECEPTET FÖR TRIGGERBLOCKERADE TABELLER (AUTO)

Körd av `verktyg/dr-kedja7.mjs` (spår 10, s10-u2). Löser kedja 5:s FYND 1
(spårets äldsta öppna köpost): **public.board_decisions kan EJ kirurgeras med
kedja 5:s recept** — FK:n `forecast_log.board_decision_id → board_decisions(id)
ON DELETE SET NULL` gör att DELETE:n UPDATE:a public.forecast_log, där
`trg_forecast_log_immutable` (BEFORE DELETE OR UPDATE) vägrar allt. Detta prov
bevisar specialreceptet **SET LOCAL session_replication_role = replica** i
kirurgins transaktion. Allt sker i skrap-DB ak1a_dr_k7 på lokal PG17 —
**prod RÖRDES ALDRIG** (receptet mot Supabase vid verklig incident = samma fil +
psql med motsvarande rättigheter, huvudagentens ägande enligt R2).

Dump: db-2026-09-17.sql.gz · Tabell: public.board_decisions · Rader i källan: 47 810

## 1. Retentionssvep (kedja 5:s stående kontrakt)

| Dump | Storlek | Ålder | gzip -t | Tid |
|---|---|---|---|---|
| db-2026-09-11.sql.gz | 28.0 MB | 6 d | GRÖN | 0.9 s |
| db-2026-09-12.sql.gz | 28.1 MB | 5 d | GRÖN | 1.0 s |
| db-2026-09-13.sql.gz | 28.5 MB | 4 d | GRÖN | 1.0 s |
| db-2026-09-14.sql.gz | 29.0 MB | 3 d | GRÖN | 1.0 s |
| db-2026-09-15.sql.gz | 29.4 MB | 2 d | GRÖN | 1.1 s |
| db-2026-09-16.sql.gz | 29.8 MB | 1 d | GRÖN | 1.4 s |
| db-2026-09-17.sql.gz | 30.3 MB | 0 d | GRÖN | 1.0 s |

Samtliga dumpar i fönstret integritetsgröna.

## 2. Moment

| Moment | Resultat |
|---|---|
| Slutmarkörskontroll (kolla-dump-markorer) | GRÖN |
| Full restore i skrap-DB (källmåttstock) | 15.2 s · felrader 788 (okända 0) |
| Källchecksumma (md5, ordningsbeständigt textaggregat) | 8e16c9e70d173a338352c2affac71abe |
| Skyddstriggrar aktiva före (tgenabled=O) | 2/2 |
| Kollateralbaslinje (public.forecast_log) | 429 rader, varav 113 refererar public.board_decisions |
| Kirurgi-extraktion (zcat+awk ur dumpFILen) | 1.1 s · 47 810 datarader · 80929 KiB |
| Extraktion komplett (datarader == källrader) | GRÖN |
| KATASTROF: mutation (buggig migrering, consensus_level=-1 på 500 senaste) | LANDADE — 500 muterade, checksumma förändrad |
| NAIV KIRURGI (kedja 5:s recept — SKALL vägras) | **VÄGRAD på 0.5 s — rullades tillbaka, katastrofen kvar** (psql:/tmp/dr-kedja7-1567398-naiv.sql:1: ERROR:  AK1A prognosmotor: UPDATE på forecast_log är förbjuden — registret är oföränderligt. Publicera en omprövning som NY rad med supersedes_forecast_id istället.) |
| SABOTAGE (mitt-rads-kolumnfel i receptfilen) | GRIPET — psql vägrade (2.4 s), rullades tillbaka |
| **RECEPET: replica-läge + DELETE + COPY i EN transaktion** | **4.2 s** |
| **Verifiering rader** | 47 810 == 47 810 GRÖN |
| **Verifiering checksumma** | IDENTISK med källan — GRÖN |
| **Kollateral oberörd (0 SET NULL-ärr)** | 113 referenser == baslinjen — kaskaden eldades ALDRIG |
| **Hängande referenser (FK verifierad manuellt)** | 0 — GRÖN |
| **Skyddstriggrar aktiva efter** | 2/2 GRÖN |
| **LIVE-triggerbevis (UPDATE vägras i skyddstabellen)** | VÄGRADE — skyddet LEVER (ERROR:  AK1A prognosmotor: UPDATE på forecast_log är förbjuden — registret är oföränderligt. Publicera en omprövning som NY rad med supersedes_forecast_id istället.) |
| Replicationsrollen efter (SET LOCAL dog med transaktionen) | `origin` GRÖN |
| Städning | skrap-DB raderad · PG17 stoppad · tmp raderade |

## 3. Varför receptet är säkert (kontraktets kärna)

Replica-läget stänger av användartriggrar OCH FK-enforsering — därför (a) eldas
SET NULL-kaskaden aldrig (grannen får inga ärr, till skillnad från naiva
FK-paus-varianter där DELETE ändå springer in i triggern), (b) FK:n validerar
inte under appliceringen — därför VERIFIERAR verktyet referensintegriteten
manuellt efteråt (hängande-sonden: 0 hängande) och
(b) SET LOCAL dör med transaktionen: rollen är `origin` efteråt,
triggrarna är 2/2 aktiva och
live-provet visar att skyddet fortfarande VÄGRAR skrivningar i public.forecast_log.
Katastrof-not: en olycks-DELETE av public.board_decisions stoppas dessutom REDAN av
skyddet via kaskaden (dubbelt skydd) — den realistiska katastrofen är MUTATION
(triggerfri tabell), och den läker bara med detta recept.

## 4. Runbook — kirurgi av triggerblockad tabell vid verklig incident

1. `node verktyg/dr-kedja7.mjs` — bevisar att dagens dump bär tabellen hel +
   att receptet håller kontraktet (mot skrap-DB).
2. Receptfilen: `SET LOCAL session_replication_role = replica;` + `DELETE FROM
   public.board_decisions;` + tabellens COPY-block — EN transaktion, ON_ERROR_STOP.
3. Applicera mot Supabase först efter kollateral-analys, i lågtrafik, med
   motsvarande superuser-rättigheter — huvudagentens ägande (R2).
4. Verifiera EFTERÅT (obligatoriskt eftersom FK:n var avstängd): rader +
   checksumma + hängande-referenssonden + att immutability-triggern lever
   (engångs-UPDATE som SKALL vägras).
5. Gräns: replica-läget pausar ALLA triggrar under transaktionen — kör ALDRIG
   mot en tabell vars triggrar utför affärslogik som COPY-datan förlitar sig på,
   och håll transaktionen minimal (endast DELETE + COPY).

## 5. Felkategorisering (full restore)

Kända ofarliga: roller 9 · scheman 2 · övrigt 13 · fortsättningsrader 12. Okända 0.

## 6. Dom

**GRÖN — kirurgireceptet för public.board_decisions BEVISAT: naiv kirurgi vägras av skyddet, replica-receptet läker tabellen identiskt med 0 ärr och skyddet lever**

SLUT — maskinellt genererat av dr-kedja7.mjs 2026-09-17T12:44:22.023Z
