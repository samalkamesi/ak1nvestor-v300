# KVALITETSVAKTEN — 2026-09-03

- **Genererad:** 2026-09-03T08:22:02.704Z (node v22.19.0 på win32)
- **Skript:** `verktyg/kvalitetsvakt.mjs` — körs dagligen 07:00 UTC via `/api/cron/kvalitet`
- **Körtid:** 0.9 s

**Statusregler:** RÖD = fler än 9 fel ELLER ogiltig JSON · GUL = 1–9 fel ELLER fler än 99 manuella · GRÖN = 0 fel och högst 99 manuella.

## 1. ÅÄÖ-bortfall i bokmaster-text — **PASS**

- 96 filer, 50782 textfält granskade mot 11 manglings-mönster (ordgränser, skiftlägesokänsligt)
- Skriptet kan inte läsa svenska — varje träff kräver MÄNNISKOGranskning av kontexten innan rättning

Inga avvikelser hittade.

## 2. UI-strängar (JSX-text + attribut) — **PASS**

- 134 filer (src/components/ak1a/*.tsx + src/app/**/page.tsx), 4374 strängar extraherade
- Endast JSX-text, attribut-strängar och UI-objekttext — kodidentifierare och kommentarer exkluderade

Inga avvikelser hittade.

## 3. JSON-giltighet (data/*.json + data/bokmaster/*.json) — **PASS**

- 101 filer parsade

Inga avvikelser hittade.

## 4. Länk-validitet (sokindex + huvudmeny + sidfooter) — **PASS**

- 74 interna länkar verifierade mot 38 rutter i src/app

Inga avvikelser hittade.

## 5. Kursdata-konsistens (bokmaster) — **PASS**

- 96 kurser kontrollerade (kapitelantal, quiz = kap×3, totalMinutes)

Inga avvikelser hittade.

## 6. Sitemap-täckning — **PASS**

- 30 sökvägar i sitemap.ts; 33 viktiga rutter jämförda
- Medvetet exkluderade: /admin, /pro, /rapporter, /logga-in

Inga avvikelser hittade.

## 7. Motorvalidering (validera-motorer.mjs) — **PASS**

- motorervalidering-2026-09-02.md: 20 PASS / 0 FAIL / 1 SKIP (rapporten är 0 dagar gammal)

Inga avvikelser hittade.

## Sammanfattning

| Sektion | Status | Fel | Manuella |
|---|---|---:|---:|
| 1. ÅÄÖ-bortfall i bokmaster-text | **PASS** | 0 | 0 |
| 2. UI-strängar (JSX-text + attribut) | **PASS** | 0 | 0 |
| 3. JSON-giltighet (data/*.json + data/bokmaster/*.json) | **PASS** | 0 | 0 |
| 4. Länk-validitet (sokindex + huvudmeny + sidfooter) | **PASS** | 0 | 0 |
| 5. Kursdata-konsistens (bokmaster) | **PASS** | 0 | 0 |
| 6. Sitemap-täckning | **PASS** | 0 | 0 |
| 7. Motorvalidering (validera-motorer.mjs) | **PASS** | 0 | 0 |

## ANTAL FEL: 0 | MANUELLA: 0 | STATUS: GRÖN

_Rapportgenererad av verktyg/kvalitetsvakt.mjs — kontinuerligt felsökningssystem (kontroller: åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering)._
