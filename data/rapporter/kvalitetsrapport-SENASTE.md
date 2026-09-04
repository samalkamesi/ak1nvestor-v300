# KVALITETSVAKTEN — 2026-09-04

- **Genererad:** 2026-09-04T10:05:33.199Z (node v22.19.0 på win32)
- **Skript:** `verktyg/kvalitetsvakt.mjs` — körs dagligen 07:00 UTC via `/api/cron/kvalitet`
- **Körtid:** 7.1 s

**Statusregler:** RÖD = fler än 9 fel ELLER ogiltig JSON · GUL = 1–9 fel ELLER fler än 99 manuella · GRÖN = 0 fel och högst 99 manuella.

## 1. ÅÄÖ-bortfall i bokmaster-text — **PASS**

- 105 filer, 55557 textfält granskade mot 11 manglings-mönster (ordgränser, skiftlägesokänsligt)
- Skriptet kan inte läsa svenska — varje träff kräver MÄNNISKOGranskning av kontexten innan rättning

Inga avvikelser hittade.

## 2. UI-strängar (JSX-text + attribut) — **PASS**

- 193 filer (src/components/ak1a/*.tsx + src/app/**/page.tsx), 6370 strängar extraherade
- Endast JSX-text, attribut-strängar och UI-objekttext — kodidentifierare och kommentarer exkluderade

Inga avvikelser hittade.

## 3. JSON-giltighet (data/*.json + data/bokmaster/*.json) — **PASS**

- 114 filer parsade

Inga avvikelser hittade.

## 4. Länk-validitet (sokindex + huvudmeny + sidfooter) — **PASS**

- 4 interna länkar verifierade mot 68 rutter i src/app

Inga avvikelser hittade.

## 5. Kursdata-konsistens (bokmaster) — **PASS**

- 105 kurser kontrollerade (kapitelantal, quiz = kap×3, totalMinutes)

Inga avvikelser hittade.

## 6. Sitemap-täckning — **PASS**

- 40 sökvägar i sitemap.ts; 42 viktiga rutter jämförda
- Medvetet exkluderade: /admin, /pro, /rapporter, /logga-in

Inga avvikelser hittade.

## 7. Motorvalidering (validera-motorer.mjs — 100%-väktaren) — **PASS**

- kör verktyg/validera-motorer.mjs som subprocess (100%-väktaren, budget 120 s) …
- subprocess (exit 0): RESULTAT: 68 PASS / 0 FAIL / 0 SKIP

Inga avvikelser hittade.

## 8. ÅÄÖ-degenerering i löptext (aao-degen.mjs) — **PASS**

- NIVÅ A: 0 · NIVÅ B: 0 (detektor: säkra degenererade former + filsignatur)

Inga avvikelser hittade.

## 9. Sifferkonsistens (rakna-siffror + föråldrade tal i copy) — **PASS**

- guldkälla data/siffror.json (verktyg/rakna-siffror.mjs) + svep efter föråldrade tal i src

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
| 7. Motorvalidering (validera-motorer.mjs — 100%-väktaren) | **PASS** | 0 | 0 |
| 8. ÅÄÖ-degenerering i löptext (aao-degen.mjs) | **PASS** | 0 | 0 |
| 9. Sifferkonsistens (rakna-siffror + föråldrade tal i copy) | **PASS** | 0 | 0 |

## ANTAL FEL: 0 | MANUELLA: 0 | STATUS: GRÖN

_Rapportgenererad av verktyg/kvalitetsvakt.mjs — kontinuerligt felsökningssystem (kontroller: åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering)._
