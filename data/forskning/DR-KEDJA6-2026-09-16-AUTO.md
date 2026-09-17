# DR-KEDJA 6 2026-09-16 — STORAGE-RESTORE (AUTO)

Körd av `verktyg/dr-kedja6.mjs` (spår 10, s10-u3). Scenario: Supabase STORAGE är
det enda lagret utan bevisad innehålls-återställning — SQL-dumpen bär METADATA
(storage.buckets/objects) men aldrig blobbar; moln-JSON-exporten läser
system_events. Övningen bevisar bägge halvorna: metadata-lagret återställt ur
dumpen i skrap-DB ak1a_dr_k6 på lokal PG17, innehålls-lagret hämtat med LÄSANDE
anrop mot Storage REST. **Prod RÖRDES ALDRIG med skrivning** (R2).

Dump: db-2026-09-16.sql.gz

## 1. Retentionssvep (familjekontraktet)

| Dump | Storlek | Ålder | gzip -t | Tid |
|---|---|---|---|---|
| db-2026-09-11.sql.gz | 28.0 MB | 5 d | GRÖN | 1.1 s |
| db-2026-09-12.sql.gz | 28.1 MB | 4 d | GRÖN | 1.0 s |
| db-2026-09-13.sql.gz | 28.5 MB | 3 d | GRÖN | 1.1 s |
| db-2026-09-14.sql.gz | 29.0 MB | 2 d | GRÖN | 1.0 s |
| db-2026-09-15.sql.gz | 29.4 MB | 1 d | GRÖN | 1.1 s |
| db-2026-09-16.sql.gz | 29.8 MB | 0 d | GRÖN | 1.1 s |

Samtliga dumpar i fönstret integritetsgröna.

## 2. Moment

| Moment | Resultat |
|---|---|
| Slutmarkörskontroll (kolla-dump-markorer) | GRÖN |
| Full restore i skrap-DB (källmåttstock) | 13.8 s · felrader 788 (okända 0) |
| **Metadata-lagret: storage.buckets i dumpen** | 5 buckets |
| **Metadata-lagret: storage.objects i dumpen** | 63 rader · 0.57 MB · checksumma 8390c65d1a8b65eb995014662218197a |
| **Levande källan (läsanrop)** | 3 buckets · 11 objekt · 1.22 MB · 0.7 s · bucket-lista HTTP 200 |
| **Innehålls-prov (nerladdning)** | HTTP 200 · 1 272 122 B på 0.72 s |
| **Byte-kontrakt (nedladdat == live-lista == dump-metadata)** | GRÖNT (1 272 122 B == live 1 272 122 B (objektet ej i dumpen — endast live korsat)) |
| Städning | skrap-DB raderad · PG17 stoppad · tmp raderade |

## 3. Metadata-lagret (dumpen db-2026-09-16.sql.gz)

| Bucket (dumpen) | Publik | Objekt |
|---|---|---|
| analysis-reports | JA | 63 |
| avatars | JA | 0 |
| course-materials | nej | 0 |
| thumbnails | JA | 0 |
| webinar-recordings | nej | 0 |

## 4. Levande källan (läsanrop, 2026-09-16T18:42:45.962Z)

| Bucket (levande) | Publik | Objekt | Storlek |
|---|---|---|---|
| user-files | JA | 0 | 0.0 KiB |
| ak1nvestor-code | JA | 11 | 1253.0 KiB |
| media | JA | 0 | 0.0 KiB |

## 5. Korsning dump ↔ live — Storage-lagrets RPO-bild

- Gemensamma objekt: 0
- Bara i dumpen (försvunnit/raderats sedan dumpen): 63
- Bara levande (nytt sedan dumpen): 11

- analysis-reports/aac/2026-07-24/avancerad.html
- analysis-reports/aac/2026-07-24/intermediar.html
- analysis-reports/aac/2026-07-24/nyborjare.html
- analysis-reports/alca/2026-07-24/avancerad.html
- analysis-reports/alca/2026-07-24/intermediar.html
- analysis-reports/alca/2026-07-24/nyborjare.html
- analysis-reports/alzcur/2026-07-24/avancerad.html
- analysis-reports/alzcur/2026-07-24/intermediar.html
- analysis-reports/alzcur/2026-07-24/nyborjare.html
- analysis-reports/angl/2026-07-24/avancerad.html
- analysis-reports/angl/2026-07-24/intermediar.html
- analysis-reports/angl/2026-07-24/nyborjare.html
- analysis-reports/batl/2026-07-22/avancerad.html
- analysis-reports/batl/2026-07-22/intermediar.html
- analysis-reports/batl/2026-07-22/nyborjare.html
- analysis-reports/buser/2026-07-24/avancerad.html
- analysis-reports/buser/2026-07-24/intermediar.html
- analysis-reports/buser/2026-07-24/nyborjare.html
- analysis-reports/cdon/2026-07-24/avancerad.html
- analysis-reports/cdon/2026-07-24/intermediar.html
- … (43 fler)

Nya sedan dumpen:
- ak1nvestor-code/.env.local
- ak1nvestor-code/.gitignore
- ak1nvestor-code/ak1nvestor-code.zip
- ak1nvestor-code/components.json
- ak1nvestor-code/eslint.config.mjs
- ak1nvestor-code/next.config.ts
- ak1nvestor-code/package.json
- ak1nvestor-code/postcss.config.mjs
- ak1nvestor-code/RETRIEVE.md
- ak1nvestor-code/tailwind.config.ts
- ak1nvestor-code/tsconfig.json


## 6. Runbook — Storage-återställning vid verklig incident

1. Metadata: nattdumpens storage-schemat restore:as med databasen (kedja 1) —
   buckets/objekt/namn/storlekar finns där (bevisat denna övning).
2. Innehåll: blobbar hämtas med läsanrop `GET /storage/v1/object/<bucket>/<sökväg>`
   per objekt ur metadata-listan (service-nyckel tillförs av huvudagenten, R2) —
   byte-tal ska matcha metadata.size (kontrakt bevisat denna övning).
3. VIKTIG GRÄNS: blobbarna har INGEN historik — dumparna bevarar metadata per
   natt, men raderade blobbar är BORTA (se §5: objekt som försvunnit sedan
   dumpen). Verklig blob-backup kräver en egen exportör (kö till huvudagenten).

## 7. Felkategorisering (full restore)

Kända ofarliga: roller 9 · scheman 2 · övrigt 13 · fortsättningsrader 12. Okända 0.

## 8. Dom

**GRÖN — storage-restore bevisad: metadata ur dumpen + innehåll via läsanrop, byte-kontrakt grönt**

SLUT — maskinellt genererat av dr-kedja6.mjs 2026-09-16T18:42:45.962Z
