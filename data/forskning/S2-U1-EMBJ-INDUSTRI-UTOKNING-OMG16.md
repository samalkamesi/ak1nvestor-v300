# S2-U1 EMBJ — INDUSTRI-UTÖKNING OMG16 (manifest auto-s2-1789760724916, byggare 1/3)

**Datum:** 2026-09-18 · **Agent:** fabriksagent s2-u1 omgång 16 ·
**Objekt:** manifestets "+1 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200".
Anspråk FÖRE arbetet: `data/vakten/auto-s2-1789760724916-u1-ansprak.md` (E29).

## VAL MED OMDÖME — och duplikatfällan som fälldes i sonderingen

Första sonderingsvalet var **ASML (teknik/Nederländerna 1→2)** — fem sidor
rådata hämtades och superlativtestet kördes INNAN kontrollen mot universumet
visade: **ASML.AS är redan levererat** (omg12, hämtat 2026-09-16, P/E 50,07 —
worklog rad 13090: "HALVLEDARTRION ASML→TSMC→Samsung komplett"). Läxan är
ordningen: worklog + universumkontroll FÖRE hämtning. ASML-datan stannar i
`data/cache/asml-omg16/` som verifieringsunderlag (läckagevakten bevisar att
den aldrig når utdata).

**Slutligt val: EMBRAER S.A. (EMBJ, industri/Brasilien)** — u2:s
rekommendationslista till u1, och det starkaste kortet på egna meriter:
- FLYGTILLVERKNINGSTRION blir komplett: AIR.PA (Airbus) · BA (Boeing) ·
  EMBJ (Embraer) — industrigrenens skarpaste kvalitetsgradient.
- Brasilien/industri 0→1: tredje sektorraden (PBR energi · VALE material ·
  EMBJ industri); med u2:s ITUB+ABEV blir Brasilien 5-bolagsland i trådet.
- NYSE-ADR-kanalen är PBR/VALE-precedensen (bevisad omg13).

## KÄLLA OCH KONVENTIONER

stockanalysis.com `/stocks/embj/` + `/statistics/` + `/financials/` +
`/financials/cash-flow-statement/` + `/financials/balance-sheet/`
(underlag S&P Global Market Intelligence + Fiscal.ai), stängningskurs
2026-09-17, sidor pålästa 2026-09-18. TTM per 30 jun 2026, FY2021–2025.

- **SYMBOLBYTE DOKUMENTERAD:** NYSE-ADR:n bytte ERJ → EMBJ (källan
  301-redirectar /stocks/erj/ → /stocks/embj/). Universumsticker = EMBJ.
- **Financials i miljoner BRL** (källans uttryckliga vy "Financials in
  millions BRL. Fiscal year is January - December") — PBR/VALE-precedensen:
  rapportvaluta-serier, ADR-pris/mcap i USD. Källans TTM-kurs ≈ 5,18
  (intäkt TTM R$44 128 M = 8,52 mdr USD enligt källans egen overview-vy).
- **ADR-kvot 4:1:** EPS 2,54 USD är PER ADR (177,96 M ADR:er på 711,83 M
  underliggande aktier); BVPS 4,86 USD är per AKTIE (ADR-BVPS 19,44).
- **Minoritetsspegeln (FCX omvänd):** källans P/B 3,45 på TOTAL equity
  3,83 mdr USD INKL minoriteter R$1 924 M; på common equity 3,456 mdr =
  3,82. EV-repliken BEVISAR minoritetsposten: 13,20 + 2,64 − 2,16 +
  0,372 = 14,05 mdr = källans EV EXAKT.
- **resultatCAGR5ar = null** (BA/NEM/AMZN-precedensen): FY2022-resultatet
  −R$953,66 M gör endpoint-CAGR matematiskt odefinierbart.

## EMBJ-RADEN (signaturfynd)

Pris 74,55 USD (ADR) · mcap 13,20 mdr USD · P/E 29,36 mot fwd 20,46 ⇒
prognosTillväxt +43,5 % (TTE) · PEG 0,68 spårkonvention · P/B 3,45 (total-
basis) · EV/EBIT 18,30 · fcfYield 7,65 % · ROIC 14,46 % mot WACC 7,86 % =
+6,60 pp · beta 0,69 (flygtrions lägsta) · bruttomarginal 17,85 % TTM
(femårsmedel 17,70 %, spread 4,47 pp — TILLVERKNINGS-moat mot ASML 52,7 /
ARM 97,5 IP-moat).

- **Vändningsbågen:** EBIT-marginal −1,03 % (FY2022) → 8,15 % (FY2025);
  R$-resultat −953,66 M → +1 953 M; utdelning återfödd R$130,81 M (2025)
  + första återköpet sedan 2021 (R$1 000 M).
- **Orderboken:** R$174 053 M backlog FY2025 = 4,2 årsintäkter —
  duopolklientens depositioner äger backlog-raderna (R$163 281 FY2024).
- **Segmentsplit FY2025 (R$ M):** Commercial 13 026 · Defense 5 444 ·
  Executive 12 172 · Services 10 729.
- **Altman Z 1,83 GRÅZONEN** mot Piotroski F 6; inventory R$19,2 mdr
  (44 % av omsättningen — halvbyggda flygplan är lager).

## MEDIANER FÖRE → EFTER (EXAKT replik av raknaBranschMedianer)

- **industri (17→18):** P/E 27,8 → 28,0 (kv 19,8–35,4 → 20,8–35,0, n=18) ·
  P/B 5,9 → 5,5 · EBIT% 16,6 → 16,4 · FCF% 11,2 → 11,3 ·
  oms-tillv% 9,1 → 9,6 · ROE% 23,2 → 22,0
- **TOTALT (183→184):** P/E 21,2 OFÖRÄNDRAD (n 173→174) · P/B 2,8
  (n 180→181) · resultatCAGR-median 4,0 (n=144)
- **Landmatta:** Brasilien/industri 0→1 (MIN_MATTA=5; inga celler på
  matta 3–4 ⇒ ingen aspektsida föds — korrekt)

## KVD GRÖN

- **Aritmetik 17/17 GRÖN** med abort-grind FÖRE skrivning — grinden
  FÅNGADE ett verkligt enhetsfel (minoritetskontrollen jämförde M mdr med
  mdr USD) och avbröt innan disk: omg13-läxan fungerar (andra gången).
- **Läckagevakt GRÖN:** 0 träffar — 184 tickers + 184 namn i 1 545
  utdatafiler (verktyg/v98-dataset-vakt.mjs).
- **Kontraktstest GRÖNT:** 179 sidkontroller, 0 fel, 30 varningar
  (baslinje), 11 ej genererade — gränsregel (verktyg/testa-dataset-aspekter.mjs
  via tsx ur npx-cachens absoluta sökväg — ingen npx-lösning, ingen
  installation).
- **tsc 0** (node node_modules/typescript/bin/tsc --noEmit — projektbinär).
- **prod 200 ×6:** / · /dataset · /dataset/industri · /dataset/industri/pe ·
  /api/data/nyckeltalsguide · /llms.txt.
- **llms.txt LIVE 184 round-trip-bevisat** (public/ servas från disk utan
  bygge); dataset-sidorna force-static + revalidate 86400 ⇒ medianerna
  landar inom 24 h eller vid nästa prod-bygge (känd Vonovia-klass).
- **llms-regen:** helsektion ur kodvägen (omg11–15-precedensen); under
  körningen fälldes och kurerades en sed-skadad NAMN-karta (konsument↔
  industri) — konvergent design + omkörning = 0 kvarvarande diff.
- **R2 orörd · data/blogg/ orörd · src/ orörd ⇒ INGET bygge.**

## RACE-PROTOKOLL

Syskon i manifestet: u2 ITUB+ABEV (Brasilien finans+konsument), u3
LONN+STMN+SOON (Schweiz/hälsa 2→5 ⇒ landaspektsida + land.ts — deras ägo).
Noll koordinatkollision; mitt anspråk FÖRE arbetet; idempotensguard i
append-skriptet hopar syskonrader utan att röra dem (diskglidning beaktad).

## LEVERANSRADER

- data/portfolj-system/bolagsunivers.json (EMBJ-raden, 183→184)
- public/llms.txt (Dataset-sektionen på 184-läget)
- data/forskning/S2-U1-EMBJ-INDUSTRI-UTOKNING-OMG16.md (detta protokoll)
- verktyg/_s2u1omg16-{hamta-asml,hamta-erj,append-embj,llms-regen}.mjs
- worklog.md (bokföringsraden)
