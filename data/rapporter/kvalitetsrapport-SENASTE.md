# KVALITETSVAKTEN — 2026-09-02

- **Genererad:** 2026-09-02T18:06:33.811Z (node v22.19.0 på win32)
- **Skript:** `verktyg/kvalitetsvakt.mjs` — körs dagligen 07:00 UTC via `/api/cron/kvalitet`
- **Körtid:** 0.6 s

**Statusregler:** RÖD = fler än 9 fel ELLER ogiltig JSON · GUL = 1–9 fel ELLER fler än 99 manuella · GRÖN = 0 fel och högst 99 manuella.

## 1. ÅÄÖ-bortfall i bokmaster-text — **PASS**

- 87 filer, 46139 textfält granskade mot 11 manglings-mönster (ordgränser, skiftlägesokänsligt)
- Skriptet kan inte läsa svenska — varje träff kräver MÄNNISKOGranskning av kontexten innan rättning

Inga avvikelser hittade.

## 2. UI-strängar (JSX-text + attribut) — **PASS**

- 125 filer (src/components/ak1a/*.tsx + src/app/**/page.tsx), 4023 strängar extraherade
- Endast JSX-text, attribut-strängar och UI-objekttext — kodidentifierare och kommentarer exkluderade

Inga avvikelser hittade.

## 3. JSON-giltighet (data/*.json + data/bokmaster/*.json) — **PASS**

- 92 filer parsade

Inga avvikelser hittade.

## 4. Länk-validitet (sokindex + huvudmeny + sidfooter) — **PASS**

- 74 interna länkar verifierade mot 38 rutter i src/app

Inga avvikelser hittade.

## 5. Kursdata-konsistens (bokmaster) — **FAIL**

- 87 kurser kontrollerade (kapitelantal, quiz = kap×3, totalMinutes)

### FEL (52)

| Fil | Plats | Detalj |
|---|---|---|
| data/bokmaster/100-baggers.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| data/bokmaster/a-random-walk-down-wall-street.json | totalMinutes | totalMinutes=200 men sum(chapters[].minutes)=198 |
| data/bokmaster/against-the-gods.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/ak1ts-vaglarans-hierarki.json | totalMinutes | totalMinutes=230 men sum(chapters[].minutes)=220 |
| data/bokmaster/charlie-munger-complete-investor.json | totalMinutes | totalMinutes=170 men sum(chapters[].minutes)=165 |
| data/bokmaster/common-sense-on-mutual-funds.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| data/bokmaster/common-stocks-uncommon-profits.json | totalMinutes | totalMinutes=170 men sum(chapters[].minutes)=165 |
| data/bokmaster/contrarian-investment-strategies.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/creative-cash-flow-reporting.json | totalMinutes | totalMinutes=170 men sum(chapters[].minutes)=165 |
| data/bokmaster/devil-take-the-hindmost.json | totalMinutes | totalMinutes=160 men sum(chapters[].minutes)=150 |
| data/bokmaster/encyclopedia-of-chart-patterns.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/expectations-investing.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| data/bokmaster/extraordinary-popular-delusions.json | totalMinutes | totalMinutes=130 men sum(chapters[].minutes)=120 |
| data/bokmaster/financial-shenanigans.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/financial-statement-analysis-and-security-valuation.json | totalMinutes | totalMinutes=200 men sum(chapters[].minutes)=204 |
| data/bokmaster/flash-boys.json | totalMinutes | totalMinutes=130 men sum(chapters[].minutes)=120 |
| data/bokmaster/fooled-by-randomness.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/how-to-make-money-in-stocks.json | totalMinutes | totalMinutes=175 men sum(chapters[].minutes)=176 |
| data/bokmaster/investment-valuation.json | totalMinutes | totalMinutes=200 men sum(chapters[].minutes)=198 |
| data/bokmaster/irrational-exuberance.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/konfluens-varde-moter-vagor.json | totalMinutes | totalMinutes=170 men sum(chapters[].minutes)=169 |
| data/bokmaster/liars-poker.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| data/bokmaster/manias-panics-and-crashes.json | totalMinutes | totalMinutes=160 men sum(chapters[].minutes)=150 |
| data/bokmaster/margin-of-safety.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/market-wizards.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| data/bokmaster/misbehaving.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/poor-charlies-almanack.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/quality-of-earnings.json | totalMinutes | totalMinutes=130 men sum(chapters[].minutes)=120 |
| data/bokmaster/quantitative-value.json | totalMinutes | totalMinutes=170 men sum(chapters[].minutes)=165 |
| data/bokmaster/reminiscences-of-a-stock-operator.json | totalMinutes | totalMinutes=145 men sum(chapters[].minutes)=135 |
| data/bokmaster/stocks-for-the-long-run.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| data/bokmaster/tanka-snabbt-och-langsamt.json | totalMinutes | totalMinutes=160 men sum(chapters[].minutes)=150 |
| data/bokmaster/technical-analysis-of-stock-trends.json | totalMinutes | totalMinutes=160 men sum(chapters[].minutes)=150 |
| data/bokmaster/teknisk-analys-med-johnny-torssell.json | totalMinutes | totalMinutes=190 men sum(chapters[].minutes)=195 |
| data/bokmaster/the-alchemy-of-finance.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/the-art-of-short-selling.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| data/bokmaster/the-big-short.json | totalMinutes | totalMinutes=150 men sum(chapters[].minutes)=140 |
| data/bokmaster/the-black-swan.json | totalMinutes | totalMinutes=160 men sum(chapters[].minutes)=150 |
| data/bokmaster/the-essays-of-warren-buffett.json | totalMinutes | totalMinutes=160 men sum(chapters[].minutes)=150 |
| data/bokmaster/the-great-crash-1929.json | totalMinutes | totalMinutes=140 men sum(chapters[].minutes)=130 |
| … | … | och 12 till |

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
| 5. Kursdata-konsistens (bokmaster) | **FAIL** | 52 | 0 |
| 6. Sitemap-täckning | **PASS** | 0 | 0 |
| 7. Motorvalidering (validera-motorer.mjs) | **PASS** | 0 | 0 |

## ANTAL FEL: 52 | MANUELLA: 0 | STATUS: RÖD

_Rapportgenererad av verktyg/kvalitetsvakt.mjs — kontinuerligt felsökningssystem (kontroller: åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering)._
