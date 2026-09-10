# KVALITETSVAKTEN — 2026-09-10

- **Genererad:** 2026-09-10T05:34:53.812Z (node v22.19.0 på win32)
- **Skript:** `verktyg/kvalitetsvakt.mjs` — körs dagligen 07:00 UTC via `/api/cron/kvalitet`
- **Körtid:** 9.6 s

**Statusregler:** RÖD = fler än 9 fel ELLER ogiltig JSON · GUL = 1–9 fel ELLER fler än 99 manuella · GRÖN = 0 fel och högst 99 manuella.

## 1. ÅÄÖ-bortfall i bokmaster-text — **PASS**

- 105 filer, 55557 textfält granskade mot 11 manglings-mönster (ordgränser, skiftlägesokänsligt)
- Skriptet kan inte läsa svenska — varje träff kräver MÄNNISKOGranskning av kontexten innan rättning

Inga avvikelser hittade.

## 2. UI-strängar (JSX-text + attribut) — **PASS**

- 238 filer (src/components/ak1a/*.tsx + src/app/**/page.tsx), 8027 strängar extraherade
- Endast JSX-text, attribut-strängar och UI-objekttext — kodidentifierare och kommentarer exkluderade

Inga avvikelser hittade.

## 3. Förbjudna fraser — varumärket som kod (2b) — **MANUELL**

- 241 filer, 8297 strängar granskade mot 26 förbjudna fraser (15 FEL = juridiska, 11 VARNING = tonala) ur data/varumarke.json — samma guldkälla som src/lib/varumarke.ts (kontrolleraText)
- CITERINGS-UNDANTAG (A10): 0 fil(er) + 4 sträng(ar) hoppades över — de CITERAR förbudet: src/app/finansiell-policy/page.tsx · src/app/ansvar/page.tsx · src/app/villkor/page.tsx · src/lib/ordlista.ts · src/lib/varumarke.ts · data/varumarke.json · sträng-exakta negerande FAQ-frågor: "Ger AK1A investeri
- FEL = juridiskt/löftesbrott (P1/P2/P3/P6 — räknas i RÖD/GUL) · VARNING = tonalt (manuell granskning) · vakten sänker ALDRIG nivå för att bli grön
- YTA-REGLN (K8, B2B-BESLUT våg 61 bygg-2): A8-varningen "kunder" undantas på PRO-ytor (src/app/pro/**, src/components/ak1a/pro/**, src/lib/pro/**) — 2 träff(ar) undantagna som legitim B2B-terminologi; privata ytor varnar fortfarande och FEL-fraserna gäller överallt

### MANUELL GRANSKNING KRÄVS (4 träffar)

| Fil | Plats | Misstänkt | Kontext |
|---|---|---|---|
| src/app/(huvud)/pro/admin/page.tsx | rad 77 (JSX-text) | kunder → elever | AK1A PRO:s B2B-översikt — kunder, rapportmallar, white-label och… |
| src/app/(huvud)/pro/admin/page.tsx | rad 135 (JSX-text) | kunder → elever | Översikt över B2B-kunder, pro-analys-anrop, rapportmallar och… |
| src/components/ak1a/stock-analysis-view.tsx | rad 263 (objekt label) | Kunder → elever | Kunder |
| src/components/ak1a/superanalys.tsx | rad 469 (JSX-text) | Sista chansen → välkommen när du är redo | Sista chansen att justera innan resultatet. Deklar… |

## 4. JSON-giltighet (data/*.json + data/bokmaster/*.json) — **PASS**

- 117 filer parsade

Inga avvikelser hittade.

## 5. Länk-validitet (sokindex + huvudmeny + sidfooter) — **PASS**

- 4 interna länkar verifierade mot 80 rutter i src/app

Inga avvikelser hittade.

## 6. Kursdata-konsistens (bokmaster) — **PASS**

- 105 kurser kontrollerade (kapitelantal, quiz = kap×3, totalMinutes)

Inga avvikelser hittade.

## 7. Sitemap-täckning — **PASS**

- 48 sökvägar i sitemap.ts; 44 viktiga rutter jämförda
- Medvetet exkluderade: /admin, /pro, /rapporter, /logga-in, /studio

Inga avvikelser hittade.

## 8. Motorvalidering (validera-motorer.mjs — 100%-väktaren) — **PASS**

- kör verktyg/validera-motorer.mjs som subprocess (100%-väktaren, budget 120 s) …
- subprocess (exit 0): RESULTAT: 107 PASS / 0 FAIL / 0 SKIP

Inga avvikelser hittade.

## 9. ÅÄÖ-degenerering i löptext (aao-degen.mjs) — **PASS**

- NIVÅ A: 0 · NIVÅ B: 0 (detektor: säkra degenererade former + filsignatur)

Inga avvikelser hittade.

## 10. Sifferkonsistens (rakna-siffror + föråldrade tal i copy) — **PASS**

- guldkälla data/siffror.json (verktyg/rakna-siffror.mjs) + svep efter föråldrade tal i src

Inga avvikelser hittade.

## Sammanfattning

| Sektion | Status | Fel | Manuella |
|---|---|---:|---:|
| 1. ÅÄÖ-bortfall i bokmaster-text | **PASS** | 0 | 0 |
| 2. UI-strängar (JSX-text + attribut) | **PASS** | 0 | 0 |
| 3. Förbjudna fraser — varumärket som kod (2b) | **MANUELL** | 0 | 4 |
| 4. JSON-giltighet (data/*.json + data/bokmaster/*.json) | **PASS** | 0 | 0 |
| 5. Länk-validitet (sokindex + huvudmeny + sidfooter) | **PASS** | 0 | 0 |
| 6. Kursdata-konsistens (bokmaster) | **PASS** | 0 | 0 |
| 7. Sitemap-täckning | **PASS** | 0 | 0 |
| 8. Motorvalidering (validera-motorer.mjs — 100%-väktaren) | **PASS** | 0 | 0 |
| 9. ÅÄÖ-degenerering i löptext (aao-degen.mjs) | **PASS** | 0 | 0 |
| 10. Sifferkonsistens (rakna-siffror + föråldrade tal i copy) | **PASS** | 0 | 0 |

## ANTAL FEL: 0 | MANUELLA: 4 | STATUS: GRÖN

_Rapportgenererad av verktyg/kvalitetsvakt.mjs — kontinuerligt felsökningssystem (kontroller: åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering)._
