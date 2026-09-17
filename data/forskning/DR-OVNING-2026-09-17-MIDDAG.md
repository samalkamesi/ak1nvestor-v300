# DR-ÖVNING 2026-09-17 MIDDAG — kedja 4 på jungfru-cron-setet + första middags-RPO:n + pumpstarten tidsatt (s10-u1)

Manifest auto-s10-1789647928135 u1 (VAKT). Kört 2026-09-17 14:26–14:35 lokal
(12:26–12:35Z). Anspråk FÖRE ingreppet: data/vakten/auto-s10-1789647928135-u1-ansprak.md.

Duplikatkontroll: kedja 1 på db-2026-09-17 LEVERAD i morse (s10-u3 O8 +
s10-u1 O8-replik), kedja 2 på nattens full-arkiv LEVERAD (s10-u2 O8) — denna
övning valde de två OLEVERERADE köposterna i stället: (1) kedja 4 har ALDRIG
körts på 2026-09-17-setet (jungfru-cron-exportens per-typ-filer, sista körning
= 09-16-data), (2) "mitt-på-dagens-mätning tidssätter startet" (DR-OVNING-
2026-09-17-JUNGRUDAG-7-BLAD.md) och (3) diagnosen "8 av 11 per-typ-tabeller
TOMMA i nattexporten" (DR-KEDJA2-2026-09-17-JUNGRUNATT.md).

## 1. Kedja 4 på 2026-09-17-setet — GRÖN (exit 0)

`node verktyg/dr-kedja4.mjs` — full maskinell körning, protokoll:
data/forskning/DR-PROV-2026-09-17-KEDJA4.md.

| Moment | Resultat |
|---|---|
| RAM-grind | 1 223 MB tillgängligt — GRÖN på första försöket (morgonens exit 75-kur behövdes ej) |
| Självtest (sabotage i /tmp) | 4/4 PASS |
| Per-typ-kontrakt | 10 av 10 filer GRÖNA (set-datum 2026-09-17, inga VARNINGAR = inga tysta exportfel) |
| Konsistens ⊆ full-arkiv | 10 matchade · 0 saknade (arkiv 163 039 rader, strömmande) |
| Restore i skrap-PG | COPY 10 rader från 10 filer · **RTO 0,10 s** · totalfönster 36,0 s |
| Oberoende verifiering | totalt 10 · perTyp blogg_utkast=7 + medlem=3 · jsonb läslig 10 |
| Städning | ak1a_dr_pertyp raderad · PG17 stoppad (verifierad nedan) |

Första kedja 4-körningen på en OBEVAKAD cron-exportörs utdata (09-16:s set var
manuellt exporterat 07:24) — kedjan är nu bevisad på båda exportvägarna.

## 2. Diagnos: de tomma per-typ-filerna är ÄKTA TOMMA — inget exportfel

Köposten från jungfrunatten ("8 av 11 per-typ-tabeller TOMMA") besvarad med
verktygets ägtenhet-svar (steg 3: arkivets faktiska radtal per typ):

- **Källan är tom, inte exporten**: full-arkivet (163 039 rader, ALLA typer)
  innehåller av de tio bevakade typerna ENDAST medlem=3 och blogg_utkast=7 —
  de åtta tomma filerna (variabler, variabel-andringar, kurs-metadata,
  kurs-metadata-andringar, termbank-tillagg, blogg-publicerade, media-filer,
  medlem-progress) motsvarar 0 rader OCKSÅ i arkivet. En tyst exportfel hade
  varit diskret (ingen fil skrivs) och flaggats VARNING — ingen flaggades.
- **Räkneklarering**: "8 av 11" = 8 tomma av 10 per-typ-filer + full-arkivet
  som elfte fil i setet (ej tomt). Kedja 4 räknar 10 per-typ-filer.
- **Ytan är stillastående**: de 10 bevisade raderna bär fönstret 2026-09-11
  10:44→23:25 lokal — INGA nya medlem-/blogg_utkast-event på 6 dygn. Per-typ-
  lagrets restore-värde är nattens kontrakt (⊆ arkivet, 10/10), inte volym.
- GDPR-notering: per-typ-filerna bär created_at+details där medlem-rader
  innehåller epostHash (hash, ej klartext) — befintligt backupinnehåll,
  uppmärksammat, inget nytt spritt; protokollet redovisar endast antal.

## 3. Middags-RPO:n — +19 392 oskyddade rader (3 av 60 tabeller)

`PGPASSFILE=~/.pgpass node verktyg/dr-rpo-diff.mjs --json` kl 12:31:37Z mot
senaste bladet db-2026-09-17.sql.gz (02:30). JSON-delprotokoll:
data/forskning/DR-RPO-DIFF-2026-09-17-MIDDAG.json.

| Sida | Värde |
|---|---|
| Bladets COPY-total | 1 286 328 rader (60 public-tabeller) |
| Levande prod | 1 305 720 rader (60 svarade) |
| **RPO-delta** | **+19 392 på 11,9 h** (02:30→14:31 lokal) |
| Rörliga tabeller | 3: section_data_snapshots +18 984 · board_decisions +384 · organ_health_logs +24 |

Inga negativa deltal; 57 av 60 tabeller i vila — samma tre rörliga som i
nattens och morgonens diffar.

## 4. Snapshots-pumpens start TIDSATT: exakt 08:00:00 lokal (köposten infriad)

Läsande sond (PSQL via PGPASSFILE, endast antal+tidsstämplar — doktrinerad
COUNT-klass, tabellägaren postgres):

```
idag_efter_blad    | 18984 | 2026-09-17 06:00:00.058474+00 | 2026-09-17 06:00:00.058474+00
gardagens_fonster  | 18984 | 2026-09-16 06:00:00.047496+00 | 2026-09-16 06:00:00.047496+00
```

- **Hela dagens batch (18 984 rader) bär EN tidsstämpel — 06:00:00.058474Z =
  08:00:00,058 lokal** — ett enda bulk-påstående, inte en ström. Gårddagen
  identisk (08:00:00,047 lokal): pumpen är en schemalagd daglig engångskörning.
- **Korsbevis**: sondens 18 984 == RPO-diffens +18 984 (två instrument, samma
  tal — diffen räknade COUNT(*), sonden fönstret captured_at ≥ bladets 00:30Z).
- **Fönstret sluten**: morgonmätningen 07:43 lokal såg pumpen på 0 (17 min
  före start); denna mätning 14:31 såg den klar (6,5 h efter). Start ∈
  (07:43, 14:31) givet av mätningarna; sonden sätter den exakt: 08:00:00.

## 5. Två-klockor-bilden komplett (RPO-profilen per dygn)

| Klocka | Beteende | Mätt |
|---|---|---|
| Beslutsklockan (board_decisions + organ_health_logs) | jämn dygnet runt | +163 kl 07:43 → +408 kl 14:31 = 245 rader/6,81 h ≈ **36,0 r/h** (natt 31,9 · morgon 31,3 — serien håller ~31–36) |
| Snapshots-pumpen | EN batch/dag kl 08:00 lokal | 18 984 rader i ett påstående, två dagar identiskt antal |

RPO-skulden byggs alltså till ~96 % i EN sekund kl 08:00. Dygnets profil:
02:30–08:00 bara beslutsklockan (≈ +200 rader), 08:00–02:30 full skuld
(≈ 19 700 värsta fallet strax före nästa blad).

## 6. Runbook-insikt (kö till huvudagenten — cron ägs där, inget ändrat av mig)

Ett extra blad kl ~08:05 (17 s RTO-arbete: dump ~10 s + restore-bevis) skulle
skära värsta-falls-RPO:n från ≈ 19 700 till ≈ 408 rader (−96 %) — allt utom
beslutsklockan skulle då vara högst 5,4 h oskyddad. Alternativ: flytta pumpens
läsning... nej: flytta BLADET närmare pumpen. Beslut = huvudagenten (crontab).

## 7. Städning och läge efter övningen

- PG17: nere (pg_lsclusters "down" — verktygets finally + egen verifiering).
- Skrap-DB ak1a_dr_pertyp: raderad. DR-lås /tmp/ak1a-dr-prov.lock: släppt.
- data/backups/: orörd (läsandes). data/blogg/: orörd. src/: orörd — ingen
  kodändring (tsc ej aktuellt; commit-grinden verifierar baslinjen ändå).
- R2: orörd (inga priser/tier/publicering; .pgpass/.env aldrig lästa in i
  process — PGPASSFILE-pekare till psql enligt kontraktet).

## 8. Filer och beviskedja

- Verktygsprotokoll: data/forskning/DR-PROV-2026-09-17-KEDJA4.md (maskinellt)
- JSON-delprotokoll: data/forskning/DR-RPO-DIFF-2026-09-17-MIDDAG.json (maskinellt)
- Detta samlingsprotokoll: data/forskning/DR-OVNING-2026-09-17-MIDDAG.md
- DRIFTSBOKEN DR-rad + worklog sektion (denna commit)

SLUT — s10-u1, 2026-09-17 14:3x lokal.
