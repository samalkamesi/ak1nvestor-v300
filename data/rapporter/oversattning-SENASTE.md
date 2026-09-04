# MÖS — översättningsrond (SENASTE)

- **Körd:** 2026-09-04T10:06:21.937Z
- **Register:** 15983 källor → 31966 översättningsobjekt (× en/ar)
- **Nya/ändrade:** 31806 nya, 0 ändrade
- **Denna rond:** 80 objekt bearbetade (batchbudget: motor aktiv 4/rond, inaktiv 80/rond — Vercel Hobby max 1 cron/dag)
- **Lagring:** kö (fallback data/oversattning-kö.json, 240 poster — produktion kräver data/sql/oversattningar.sql)

## Kvalitetsstatusflöde

- `publicerad` — 100 poäng (alla 4 kontroller gröna), automatiskt
- `utkast` — 90–99 poäng, maskinutkast väntar mänsklig granskning → `granskad`
- `maskinutkast-behovar-granskning` — < 90 poäng, granskning OBLIGATORISK
- `vantar-motor` — ingen ZAI-nyckel / motorn svarade ej / för lång källa
- `inaktuell` — källan ändrats (kallhash stämmer ej), köas om

## Rondens objekt

| Scope | Språk | Status | Poäng | Notering |
|---|---|---|---:|---|
| `ui:home.skal4Rubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.skal4Rubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutMikro1` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutMikro1` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutOsaker` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutOsaker` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutOvan` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutOvan` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutRubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutRubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutTitta` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutTitta` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutUnderrubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.slutUnderrubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig1Rubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig1Rubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig1Undertext` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig1Undertext` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig2Rubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig2Rubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig2Undertext` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig2Undertext` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig3Rubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig3Rubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig3Undertext` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig3Undertext` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig4Rubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig4Rubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig4Undertext` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stig4Undertext` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stigEyebrow` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stigEyebrow` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stigRubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stigRubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stigUnderrubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.stigUnderrubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.utforskaKurserna` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.utforskaKurserna` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.varforEyebrow` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.varforEyebrow` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.varforRubrik` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.varforRubrik` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.verktygIdag` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:home.verktygIdag` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.allaKlara` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.allaKlara` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.fas2Porten` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.fas2Porten` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.fokus` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.fokus` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.foregaende` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.foregaende` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.fortsattKursen` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.fortsattKursen` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.grattis` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.grattis` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.insikt` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.insikt` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitel` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitel` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelAv` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelAv` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelBeharskat` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelBeharskat` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelEnhet` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelEnhet` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelTitel` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kapitelTitel` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursenKlar` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursenKlar` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursenSlut` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursenSlut` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursinnehall` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursinnehall` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursoversikt` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.kursoversikt` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.masterquiz` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.masterquiz` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.minLasning` | en | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |
| `ui:kurs.minLasning` | ar | `vantar-motor` | 0 | ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning |

_Genererad av /api/cron/oversatt (MÖS, våg 52) — deterministiskt underlag: termbank med 293 termer + 4 kontroller i src/lib/oversattning/kontroller.ts._
