# KVALITETSVAKTEN — 2026-09-03

- **Genererad:** 2026-09-03T11:40:47.445Z (node v22.19.0 på win32)
- **Skript:** `verktyg/kvalitetsvakt.mjs` — körs dagligen 07:00 UTC via `/api/cron/kvalitet`
- **Körtid:** 1.8 s

**Statusregler:** RÖD = fler än 9 fel ELLER ogiltig JSON · GUL = 1–9 fel ELLER fler än 99 manuella · GRÖN = 0 fel och högst 99 manuella.

## 1. ÅÄÖ-bortfall i bokmaster-text — **PASS**

- 105 filer, 55557 textfält granskade mot 11 manglings-mönster (ordgränser, skiftlägesokänsligt)
- Skriptet kan inte läsa svenska — varje träff kräver MÄNNISKOGranskning av kontexten innan rättning

Inga avvikelser hittade.

## 2. UI-strängar (JSX-text + attribut) — **PASS**

- 142 filer (src/components/ak1a/*.tsx + src/app/**/page.tsx), 4838 strängar extraherade
- Endast JSX-text, attribut-strängar och UI-objekttext — kodidentifierare och kommentarer exkluderade

Inga avvikelser hittade.

## 3. JSON-giltighet (data/*.json + data/bokmaster/*.json) — **PASS**

- 110 filer parsade

Inga avvikelser hittade.

## 4. Länk-validitet (sokindex + huvudmeny + sidfooter) — **PASS**

- 77 interna länkar verifierade mot 43 rutter i src/app

Inga avvikelser hittade.

## 5. Kursdata-konsistens (bokmaster) — **PASS**

- 105 kurser kontrollerade (kapitelantal, quiz = kap×3, totalMinutes)

Inga avvikelser hittade.

## 6. Sitemap-täckning — **PASS**

- 35 sökvägar i sitemap.ts; 38 viktiga rutter jämförda
- Medvetet exkluderade: /admin, /pro, /rapporter, /logga-in

Inga avvikelser hittade.

## 7. Motorvalidering (validera-motorer.mjs) — **PASS**

- motorervalidering-2026-09-02.md: 20 PASS / 0 FAIL / 1 SKIP (rapporten är 0 dagar gammal)

Inga avvikelser hittade.

## 8. ÅÄÖ-degenerering i löptext (aao-degen.mjs) — **FAIL**

- NIVÅ A: 80 · NIVÅ B: 0 (detektor: säkra degenererade former + filsignatur)

### FEL (1)

| Fil | Plats | Detalj |
|---|---|---|
| public/deep-courses.json + data/bokmaster/ | NIVÅ A | 80 degenererade åäö-ord ("gor/nar/kopte"-mönster) — kör: node verktyg/aao-degen.mjs |

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
| 8. ÅÄÖ-degenerering i löptext (aao-degen.mjs) | **FAIL** | 1 | 0 |

## ANTAL FEL: 1 | MANUELLA: 0 | STATUS: GUL

_Rapportgenererad av verktyg/kvalitetsvakt.mjs — kontinuerligt felsökningssystem (kontroller: åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering)._
