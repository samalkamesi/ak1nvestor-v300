# MÖS — översättningsrond (SENASTE)

- **Körd:** 2026-09-04T12:09:40.388Z
- **Register:** 15983 källor → 31966 översättningsobjekt (× en/ar)
- **Nya/ändrade:** 31726 nya, 0 ändrade
- **Denna rond:** 80 objekt bearbetade (batchbudget: motor aktiv 4/rond, inaktiv 80/rond — Vercel Hobby max 1 cron/dag)
- **Lagring:** kö (fallback data/oversattning-kö.json, 320 poster — produktion kräver data/sql/oversattningar.sql)

## Kvalitetsstatusflöde

- `publicerad` — 100 poäng (alla 4 kontroller gröna), automatiskt
- `utkast` — 90–99 poäng, maskinutkast väntar mänsklig granskning → `granskad`
- `maskinutkast-behovar-granskning` — < 90 poäng, granskning OBLIGATORISK
- `vantar-motor` — ingen ZAI-nyckel / motorn svarade ej / för lång källa
- `inaktuell` — källan ändrats (kallhash stämmer ej), köas om

## Rondens objekt

| Scope | Språk | Status | Poäng | Notering |
|---|---|---|---:|---|
| `ui:kurs.minuter` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.minuter` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.nasta` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.nasta` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.nastaKapitel` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.nastaKapitel` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.niva` | en | `publicerad` | 100 | kort text (≤ 8 ord) helt täckt av termbanken — översatt direkt ur banken utan motoranrop — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.niva` | ar | `publicerad` | 100 | kort text (≤ 8 ord) helt täckt av termbanken — översatt direkt ur banken utan motoranrop — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.nivaUpp` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.nivaUpp` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.ratt` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.ratt` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.startaKurs` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.startaKurs` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.testaDigSjalv` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.testaDigSjalv` | ar | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:kurs.tid` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.tid` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.tipsFallback` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.tipsFallback` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.totalt` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.totalt` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.utmaning` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.utmaning` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.vikt` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.vikt` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.xpPerNiva` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:kurs.xpPerNiva` | ar | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descAdmin` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descAdmin` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descAllaKurser` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descAllaKurser` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descAnalyser` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descAnalyser` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descBadges` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descBadges` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descBiblioteket` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descBiblioteket` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descBloggen` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descBloggen` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descCertifikat` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descCertifikat` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descDagensPass` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descDagensPass` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descFas2Ansokan` | en | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descFas2Ansokan` | ar | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descFas3` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descFas3` | ar | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descKalkylatorn` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descKalkylatorn` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descKognitiv` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descKognitiv` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descKonfluens` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descKonfluens` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descLabbar` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descLabbar` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descLaroplan` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descLaroplan` | ar | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descLoggaIn` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descLoggaIn` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descManifest` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descManifest` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descMedlemskap` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descMedlemskap` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descMinPortfolj` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descMinPortfolj` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descMinSida` | en | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descMinSida` | ar | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descNetnet` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descNetnet` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descNyheter` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descNyheter` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descPortfoljbyggaren` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descPortfoljbyggaren` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descPortfoljforskning` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descPortfoljforskning` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descPrenumeration` | en | `publicerad` | 100 | extern motor mymemory svarade — termbanken rättade 1 term(er) efter motorn (synonym-byte) — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descPrenumeration` | ar | `maskinutkast-behovar-granskning` | 60 | extern motor mymemory svarade — poäng 60 < 90, kräver granskning oavsett motor |
| `ui:meny.descPro` | en | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |
| `ui:meny.descPro` | ar | `publicerad` | 100 | extern motor mymemory svarade — alla kontroller gröna, automatiskt publicerad |

_Genererad av /api/cron/oversatt (MÖS, våg 52) — deterministiskt underlag: termbank med 293 termer + 4 kontroller i src/lib/oversattning/kontroller.ts._
