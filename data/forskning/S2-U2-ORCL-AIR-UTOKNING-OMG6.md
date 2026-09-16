# S2-U2 — ORCL + AIR.PA: dataset-utökning omgång 6 (2026-09-16)

**Uppdrag:** manifestets "+2 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200" (spår 2 DATASET-DJUP; omgång 6 — tidigare omgångar: se worklogs s2-u1/u2/u3 omg 1–5). **Agent:** s2-u2 (byggare, omstart efter dött försök 1 — turn execution failed före allt arbete; detta = försök 2 från noll).

## Objektval med omdöme

Tunnaste branscherna vid start (12 var): fastighet/industri/material/teknik/tillväxt. Val:

1. **Oracle (ORCL, teknik, USA)** — teknikens mest citerade lucka: databas- och molninfrastruktur-jätten, utelämnad medan AAPL/MSFT/GOOGL/AMZN/TSM/SAP fanns. Kvantitativ bonus: teknik/USA-landaspekten stod på matta 4 → ORCL öppnar den (sidkontroller 164→165, empiriskt verifierad).
2. **Airbus (AIR.PA, industri, Frankrike)** — flygduopolets planhalva; universumets första europeiska flygplansradike (GE Aerospace bär motorerna — samma leveranskedjas två sidor, pedagogisk par). .PA-konventionen fjärde fallet (TTE.PA/MC.PA/URW.PA).

Båda fria vid kollisionskontrollen och utanför syskonens kända mönster (u1: tyska/finans-ankare, u3: ASML/KO/RIO enligt deras protokoll S2-U3-TEKNIK-MATERIAL-KONSUMENT-UTOKNING-OMG6.md).

## Leverans — 2 bolagsrader (allt live-hämtat 2026-09-16, stockanalysis översikt+statistics+financials, S&P-underlag)

### ORCL — teknik — kurs close 2026-09-15
140,35 USD / 424,38 mdr. P/E 22,01 (fwd 16,47 ⇒ prognosTillväxt +33,6 % spårkonvention; källans 3-års EPS +27,34 %), PEG 0,65 (källans egen 0,54), P/B 6,87, EV/EBIT 22,62. ROE 41,2 % mot ROIC 11,3 % (skuld/EK 2,52 — Cerner-lån + capex-upplåning; Visaradens spegelbild: där driver återköp ROE, här skulden). Marginaler: brutto 64,0 % TTM (serien FALLER 72,9→71,4→70,5→65,8 % — molninfra i mixen; moat 70,1 %, spridning 7,0 pp), EBIT 34,3 %, netto 26,4 %, **fcfMarginal −40,0 % — universumets lägsta**. Serier FY2023–FY2026 (juni–maj, BHP-precedenten): omsättning 49,95→67,36 mdr $ (+10,5 %/år endpoint), resultat 8,50→16,98 mdr $ (+25,9 %), FCF **+8,47 → +11,81 → −0,39 → −23,69 mdr $** — capex 6,9→21,2→55,7 mdr $ (AI-datacenter) mot OCF 32,0: TTM-FCF −28,7 mdr $ (yield −6,8 %). Radens pedagogiska kärna: tillväxt köpt med upplåning; 52-vägers spann 114,50–329,50 $ (1-årsförändring −51,96 %).

### AIR.PA — industri — kurs 196,36 € (fördröjd intraday 2026-09-16 14:39 CET; close 194,80)
154,18 mdr €. P/E 25,94 (fwd 24,35 ⇒ +6,5 %), PEG 3,97 spårkonvention (källans 1,50 — källan räknar på 3-årsprognosen +16,62 %/år), P/B 5,94, EV/EBIT 22,04. ROE 23,2 % / ROIC 20,5 %, skuld/EK 0,55 (kassa 13,1 mot skuld 14,3 mdr € — kundförskott i orderbacklog utanför måtten). Marginaler: brutto 16,3 % (moat 15,9 %, spridning 2,0 pp — serietillverkningens kontrast mot teknikens mjukvarurader), EBIT 8,7 %, netto 7,7 %, FCF 6,1 %. Serier 2022–2025: omsättning 58,76→73,42 mdr € (+7,7 %/år), resultat 4,25→5,22 mdr € (+7,1 %; 2023-dipp 3,79 dokumenterad — kostnadsinflation + rymdprogram), FCF 3,82→4,03 mdr € stadigt positiv — **didaktisk motsats till ORCL-raden i samma leverans** (capex-svängning mot backlog-stabilitet). Utdelning 3,20 € (1,65 %, payout 56,8 %) i not; fält null enligt konventionen.

## Aritmetik — maskinverifierad

Append-skriptet (/tmp/s2u2omg6-append.mjs, mönster 1:1 från omg5) beräknar ALLA derivat ur råtal: CAGR endpoint 4 år, prognosTillväxt = pe/fwdPe−1, PEG = pe/prognos(%) spårkonvention, moat ur gp/oms-serien, fcfMarginal ur TTM-FCF/oms, fcfYield ur TTM-FCF/mcap. Utdata GRÖN: ORCL prognos 0,3364 · peg 0,65 · omsCAGR 0,1048 · resCAGR 0,2594 · moat 0,7015/0,0702 · fcfMarg −0,4001 · fcfYield −0,0677; AIR prognos 0,0653 · peg 3,97 · omsCAGR 0,0771 · resCAGR 0,0712 · moat 0,1592/0,0196 · fcfMarg 0,0610 · fcfYield 0,0305.

## Medianer + kvartiler (projektets EGEN lasBranschMedianer; kvartiler + universumjämförelse = dataset-sidornas standing-funktion, omräknade automatiskt)

- **industri 13→14: P/E 27,8→26,9, kvartiler 18,7–35,4 → 20,0–33,7 (n 13→14), FCF 11,2→10,8 %** (AIR drar ned medianen och båda kvartilerna — URW-precedensens mönster)
- **teknik 13→14: P/E 28→27,9, kvartiler 20,4–38 → 20,8–37,8 (n 13→14), FCF 7,0→6,5 %** (ORCL:s −40 %-marginal drar FCF-medianen)
- (u3:s RIO åkende i samma commit: material 12→13, P/E 18,8→18,7, kvartiler 14,9–21,2→14,0–20,9, n 11→12)
- **totalt: 21,2 (n=123 av 132)** — oförändrat
- **ASPEKT-BONUS BEVISAD: teknik/usa 4→5 matta ⇒ NY aspektsida /dataset/teknik/usa — kontraktstestets sidkontroller 164→165** (förutsagt i simuleringen FÖRE append, verifierat EFTER — gränsregeln mekanisk)
- Finans-aspektraden (llms): median 12,2 %, kv 9–14 % (n=8), universum 3,7 % (n=98) — klausulen "universumets lägsta datatäckning" korrekt BORT (tillväxt n=6 < finans n=8; beräknas ur data, omg3-principen)

## KVD — komplett

| Kontroll | Resultat |
|---|---|
| Kontraktstest (testa-dataset-aspekter.mjs, cachad tsx-CLI) | **GRÖNT — 165 sidkontroller, 0 fel, 30 kända varningar** (baseline före: 164/0/30) |
| Läckagevakt (v98-dataset-vakt.mjs, dynamiskt universum) | **GRÖN — 0 träffar, 132 tickers + 132 namn i 1 440 utdatafiler** |
| tsc (node node_modules/typescript/bin/tsc --noEmit) | **0 fel** (även via pre-commit-grinden) |
| prod HTTPS (lab.ak1nvestor.com) | **200 ×6: / · /dataset · /dataset/teknik · /dataset/industri · /api/data/nyckeltalsguide · /llms.txt** |
| Bygge | INGET (endast data/ + public/ = dataleverans; servade sidor visar gamla tal tills prod-synkens bygge — Vonovia-precedensen; nya URL:er (teknik/usa) + sitemap-poster tillkommer vid bygget, data-drivet via aspektParametrar()) |
| R2 | Orörd — priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd |

## Race-bokföring (omgångens fallen 10–11 ur mitt perspektiv)

Omgången körde tre syskon samtidigt; SIX förändringar i fönstret: (1) mitt första commit-försök blockerades av .git/index.lock SAMTIDIGT som s2-u1 committade e16c17d5 (Siemens) — deras git add tog då syskonet u3:s ocommittade ASML.AS+KO (129 i HEAD, dokumenterat i deras 095dcf8a); mina rader skadades ej (staged, opåverkade). (2) Min omstart: llms omregenererad till faktiskt träd (132, inklusive u3:s då ocommittade RIO som därmed åkte med i MIN commit — deras ägarskap härmed dokumenterat; BASF-precedentens spegelbild, inget arbete förlorat, allt idempotent). Självläkning: s2-u1:s commits speglade llms 127 medan HEAD var 129 — min regenerering (132) läker det eftersläpningen i samma commit. Universumkonvention: appenden läser filen FÄRSKT vid körning och pushar endast saknade tickers — syskonrader kan aldrig raderas av min väg (omg5-skriptets kontrakt).

## Ärvda flaggor / notiser till dataägaren

- ORCL = universumets första rad med NEGATIV fcfMarginal (−40,0 %) och negativ fcfYield (−6,8 %) — dataset-aspekternas FCF-mattor hanterar negativa värden korrekt (kontraktstest grönt), men vid framtida "fcf-marginal"-aspektsidor för teknik bör spridningen P25–P75 bevakas (ORCL:s −40 kan bli en ensam P25-outlier som försvinner när capex-cykeln vänder — TTM-fönstret glider).
- CAGR5ar-fältnamnet vs 4 räkenskapsår (ärvd s1-u3-flagga, gäller nu 132 rader).
- AIR.PA-kursen är fördröjd intraday-notering (14:39 CET) — avvikelse mot spårets close-konvention, ärligt dokumenterad i källa+notering (börsen öppen vid hämtning; US-raderna close 2026-09-15).

**Commits:** 6b227943 (data+llms) + dokumentationscommit (protokoll + worklog, denna fil).
**Skript:** /tmp/s2u2omg6-append.mjs · /tmp/s2u2omg6-llms.mjs · /tmp/s2u2omg6-fore.mts (idempotenta, återanvändbara).
