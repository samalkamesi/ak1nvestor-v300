# NYTTOVALT — universumets 11:E BRANSCH: NEE + DUK + SO + AEP + EXC (fabriksagent, spår 2 DATASET-DJUP)

**Uppgift:** "Utöka /dataset med nästa bransch enligt spårmallen" · **Leverans:**
2026-09-28 · **Protokollförfattare:** nyttovalt-byggaren (denna agent).

## SAMMANFATTNING

Universumet 311→316: **nyttovalt föddes som 11:e bransch** (GICS Utilities — den
klassiska sektor som saknades i 10-bransch-namnrymden från våg 87/97) med FEM
amerikanska reglerade elbolag: NextEra Energy (NEE), Duke Energy (DUK), The
Southern Company (SO), American Electric Power (AEP), Exelon (EXC) — samtliga
med full panel (quote + statistics + financials + balance-sheet + cash-flow,
StockAnalysis/S&P Global Market Intelligence, hämtat 2026-09-28).

**NYTTOVALT efter omgången: median P/E 17,1 (P25–P75 17,0–19,8, n=5) · P/B 2,0 ·
EBIT-marginal 27,0 % · FCF-marginal −13,0 % · omsättningstillväxt 6,6 %.**
Universumet: 316 bolag, median P/E 19,9 (n=304; FÖRE 311/20,1/299).

Sidorna föds DATA-DRIVET vid nästa gröna bygge: /dataset/nyttovalt (med
Dataset-JSON-LD ur datasetBranschJsonLd), speglar en/ar, aspektsidor där
matta ≥ 5 (P/E-kärnmåttet når exakt 5 ⇒ första aspektsidorna möjliga), samt
USA/nyttovalt-landaspekten (landmodulen usa finns; cellen når matta 5).
llms.txt och sitemap grinds av bygg-sanningsvakten (o559/o147) — nyttovalt-
raderna hålls tillbaka tills bygget levererar sidorna; inga döda löften.

## DUPLIKATFYND (omgångens viktigaste läxa — bokförd för eftervärlden)

Universumets ENERGI-bransch bar sedan tidigare SJU GICS-mässiga utilities:
FORTUM.HE, RWE.DE, EOAN.DE, NG.L, IBE.MC, ENEL.MI, ENGI.PA (alla
bransch="energi", tillsatta 2026-09-03→09-25 av tidigare vågor). Min första
duplikatkontroll matchade tickers EXAKT ("RWE", "EOAN", "FORTUM") och missade
suffix-formerna — tre rader (RWE, EOAN, FORTUM) skrevs innan upptäckten i
kontraktsvalideringen (min egen serie-längdsond flaggade FORTUM.HE → grävning
→ FYND). **Kur:** kirurgisk dedup (316→313, _nyttovalt-dedup.mjs, strukturvakt
att ENBAST de tre eigen-rader togs) + ny hämtning av tre äkta nya bolag
(SO/AEP/EXC). Dubbelräkning i universum-medianer eliminerad FÖRE commit —
inget förorenat läge lämnadeträdet.

**Strukturfråga lämnad åt styrelsen (R1, ej min ägo):** de sju utilities i
energi-branschen + de fem nya i nyttovalt = branschindelningen slår inte mot
GICS. Att FLYTTA äldre vågars energirader till nyttovalt vore korrekt
GICS-mässigt men ändrar energi-branschens levererade medianer (deras ägo) —
dokumenterad som könotis, ALDRIG executerad av denna agent.

**Suffix-läxa för nästa våg:** duplikatkontroll MÅSTE söka på namn +
ticker-prefix (både "RWE" och "RWE.DE"), inte exakt ticker.

## VAL-ANALYS

- **Varför nyttovalt?** 10-bransch-namnrymden (våg 87) saknade GICS Utilities;
  stark svensk sökmagnet (elräkningar, elbolag nyckeltal); klassisk
  försvarssektor med utdelning — pedagogisk kontrast mot tillväxt-gruppen.
- **Varför USA-femman?** (1) Kanalbevisad källa (NYSE/NASDAQ-vägen bar full
  panel; LSE-vägen /quote/lse/NG + /quote/lse/SSE svarade 404 — UK-bolag
  bokförda som restpost), (2) USA/nyttovalt-cellen når matta 5 = landaspektsida
  möjlig vid bygge (landmodul usa finns), (3) fem INOM samma reglerade
  elkonvention = ren branschjämförelse (mot t.ex. Fortum som heterogen
  kärnkraft/värme). Europautilities SOM SAKNAS i universum: Endesa, EDF (statlig,
  börsnoterad dock), Veolia, SSE, Iberdrola-redan-finns(IBE.MC) — nästa omgångs
  koordinater, se KÖNOTIS.
- **Svenska elbolag?** Vattenfall och Ellevio är ONOTERADE — Sverige/nyttovalt-
  cellen är strukturellt tom; pedagogisk not för framtida branschsida.

## KÄLLOR

StockAnalysis NYSE/NASDAQ-primärkällvägen (/stocks/{nee,duk,so,aep,exc}/ +
/statistics/ + /financials/ + /financials/balance-sheet/ +
/financials/cash-flow-statement/), hämtat 2026-09-28 (S&P Global Market
Intelligence-underlag; close 2026-09-28 EDT). AMBU/VWS-precedensen: WebFetch
bar FULL PANEL på alla fem sidor × fem bolag (25 lyckade hämtningar; LSE-sonder
NG/SSE = 404, bokförda). Amerikanskt kalenderår (januari–december), USD genomgående.

## RÅDATA (källans fält, ordagrant ur hämtningarna)

### NEE — NextEra Energy, Inc. (NYSE, USD)
- **Översikt:** pris 75,49 · mcap 157,47 mdr (+3,6 %) · aktier 2,09 Mdr · P/E
  17,10 · forward 18,56 · EPS 4,45 (+55,0 %) · TTM oms 28,70 mdr (+10,8 %) ·
  netto 9,30 mdr (+57,1 %) · DPS 2,49 (3,30 %) · beta 0,64 · 52-v 75,12–98,75 ·
  17 300 anst. · Buy 98,22 (20 st) · rapp 2026-10-27.
- **Statistik:** P/E 16,97 · forward 18,42 · PEG 2,25 · PS 5,49 · PB 2,76 ·
  PTBV 3,03 · EV/sales 9,23 · EV/EBIT 31,39 · EV/EBITDA 18,15 · EV 264,80 ·
  ROE 11,68 % · ROA 2,44 % · ROIC 3,17 % · ROCE 4,14 % · WACC 5,62 % · brutto
  61,02 % · EBIT 29,40 % · pretax 24,18 % · netto 32,40 % · EBITDA 50,85 % ·
  rev-prognos 3Y +11,35 % · EPS-prognos 3Y +8,62 % · kassa 2,87 mdr · skuld
  110,20 mdr · nettolån −107,33 · EK 68,16 mdr · BV/aktie 27,39 · skuld/EK
  1,62 · räntetäckning 2,40 · payout 56,02 % · FCF-yield −10,52 % · earnings
  yield 5,91 % · Piotroski 4.
- **RI (MUSD):** oms [2021–2025]: 17 069 · 20 956 · 28 114 · 24 753 · 27 412
  (TTM 28 700, +10,81 %) · netto: 3 573 · 4 147 · 7 310 · 6 946 · 6 835 (TTM
  9 299) · EPS: 1,81 · 2,10 · 3,60 · 3,37 · 3,30 (TTM 4,45) · pretax-marginal:
  18,60 · 18,29 · 25,92 · 24,39 · 16,53 (TTM 24,18) · profit: 20,93 · 19,79 ·
  26,00 · 28,06 · 24,93 (TTM 32,40) · FCF-marginal: −49,94 · −52,59 · −49,13 ·
  −46,33 · −44,22 (TTM −57,72).
- **BR (MUSD):** kassa 639 · 1 601 · 2 690 · 1 487 · 2 812 (TTM 2 866) · skuld
  55 027 · 65 741 · 74 067 · 83 560 · 97 220 (TTM 110 197) · EK 45 669 · 49 436
  · 59 024 · 60 861 · 66 479 (TTM 68 159) · tillgångar 140 912 → 232 807.
- **KF (MUSD):** OCF 7 553 · 8 262 · 11 301 · 13 260 · 12 485 (TTM 13 803) ·
  capex −15 802 · −19 060 · −24 928 · −24 330 · −24 053 (TTM −29 832) · FCF
  −8 524 · −11 021 · −13 812 · −11 469 · −12 121 (TTM −16 566) · utdelning
  −3 024 → −4 680 (TTM −4 947) · aktieemission (INTE återköp) TTM +2 047.

### DUK — Duke Energy Corporation (NYSE, USD)
- **Översikt:** pris 113,41 · mcap 88,43 mdr (−8,0 %) · aktier 779,70 M · P/E
  17,06 · forward 16,80 · EPS 6,66 (+8,5 %) · TTM oms 32,80 mdr (+6,3 %) · netto
  5,18 mdr (+8,2 %) · DPS 4,34 (3,83 %) · beta 0,36 · 52-v 112,52–134,49 ·
  26 441 anst. · Buy 136,94 (22 st) · rapp 2026-11-06.
- **Statistik:** EV 179,96 · PEG 2,51 · PS 2,70 · PB 1,64 · PTBV 2,54 ·
  EV/EBIT 20,29 · EV/EBITDA 10,83 · ROE 9,86 % · ROA 2,84 % · ROIC 3,83 % ·
  WACC 4,87 % · brutto 51,97 % · EBIT 27,04 % · pretax 18,87 % · netto 16,00 %
  · EBITDA 50,66 % · rev-prognos 3Y +5,30 % · EPS-prognos 3Y +6,72 % · kassa
  673 M · skuld 92,21 mdr · nettolån −91,53 · EK 56,86 mdr · BV/aktie 68,95 ·
  skuld/EK 1,62 · räntetäckning 2,35 · payout 65,15 % · FCF-yield −4,83 % ·
  Piotroski 6.
- **RI (MUSD):** oms 24 201 · 28 319 · 28 602 · 29 934 · 31 790 (TTM 32 803,
  +6,34 %) · netto 3 799 · 2 444 · 2 729 · 4 410 · 4 906 (TTM 5 183) · EPS 4,94
  · 3,17 · 3,54 · 5,71 · 6,31 (TTM 6,66) · pretax 16,49 · 14,40 · 16,67 · 17,35
  · 17,97 · profit 15,70 · 8,63 · 9,54 · 14,73 · 15,43 (TTM 15,80) · FCF-marginal
  −5,89 · −19,21 · −9,53 · 0,16 · −5,33 (TTM −13,03).
- **BR (MUSD):** kassa 341 · 409 · 253 · 314 · 245 (TTM 673) · skuld 68 263 ·
  74 758 · 80 645 · 85 438 · 91 107 (TTM 92 206) · EK 51 136 · 51 853 · 50 187
  · 51 256 · 53 019 (TTM 56 863, minoritet 2 112) · tillgångar 169 587 → 201 091.
- **KF (MUSD):** OCF 8 290 · 5 927 · 9 878 · 12 328 · 12 330 (TTM 11 562) ·
  capex −9 715 · −11 367 · −12 604 · −12 280 · −14 024 (TTM −15 836) · FCF
  −1 425 · −5 440 · −2 726 · +48 · −1 694 (TTM −4 274) · utdelning −3 114 →
  −3 300 (TTM −3 383).

### SO — The Southern Company (NYSE, USD)
- **Översikt:** pris 82,35 · mcap 94,73 mdr (−8,8 %) · aktier 1,15 Mdr · P/E
  19,83 · forward 17,63 · EPS 4,15 (+7,3 %) · TTM oms 30,18 mdr (+6,4 %) · netto
  4,66 mdr (+8,8 %) · DPS 3,04 (3,69 %) · beta 0,32 · 52-v 81,91–100,84 ·
  29 800 anst. · Hold 99,76 (23 st) · rapp 2026-11-05.
- **Statistik:** EV 168,84 · PEG 2,15 · PS 3,14 · PB 2,39 · EV/EBIT 20,75 ·
  EV/EBITDA 11,84 · ROE 11,48 % · ROA 3,27 % · ROIC 4,47 % · WACC 4,94 % ·
  brutto 48,29 % · EBIT 26,96 % · pretax 17,39 % · netto 15,43 % · EBITDA
  47,24 % · rev-prognos 3Y +5,77 % · EPS-prognos 3Y +7,65 % · kassa 2,98 mdr ·
  skuld 77,09 mdr · nettolån −74,10 · EK 42,34 mdr · BV/aktie 34,40 · skuld/EK
  1,82 · räntetäckning 2,52 · payout 73,19 % · FCF-yield −3,45 %.
- **RI (MUSD):** oms 23 113 · 29 279 · 25 253 · 26 724 · 29 553 (TTM 30 179,
  +6,40 %) · netto 2 393 · 3 524 · 3 976 · 4 401 · 4 341 (TTM 4 658) · EPS 2,24
  · 3,26 · 3,62 · 3,99 · 3,92 (TTM 4,15) · profit 10,35 · 12,04 · 15,75 · 16,47
  · 14,69 (TTM 15,43) · FCF-marginal −6,13 · −5,54 · −6,11 · 3,12 · −9,93
  (TTM −10,83).
- **BR (MUSD):** kassa 1 798 · 1 917 · 748 · 1 070 · 1 639 (TTM 2 984) · skuld
  55 470 · 59 135 · 63 490 · 66 277 · 74 075 (TTM 77 087) · EK 32 567 · 34 532
  · 35 225 · 36 674 · 38 867 (TTM 42 342, minoritet 2 772) · tillgångar
  127 534 → 162 027.
- **KF (MUSD):** OCF 6 169 · 6 302 · 7 553 · 9 788 · 9 802 (TTM 10 651) · capex
  −7 586 · −7 923 · −9 095 · −8 955 · −12 737 (TTM −13 920) · FCF −1 417 ·
  −1 621 · −1 542 · +833 · −2 935 (TTM −3 269) · utdelning −2 777 → −3 015
  (TTM −3 100) · aktieemissioner TTM +4 157.

### AEP — American Electric Power Company, Inc. (NASDAQ, USD)
- **Översikt:** pris 118,20 · mcap 64,35 mdr (+10,5 %) · aktier 544,40 M · P/E
  20,50 · forward 17,86 · EPS 5,77 (−15,3 %) · TTM oms 22,79 mdr (+10,3 %) ·
  netto 3,14 mdr (−13,9 %) · DPS 3,80 (3,22 %) · beta 0,50 · 52-v 108,49–140,58
  · 17 581 anst. · Buy 143,23 (23 st) · rapp 2026-10-28.
- **Statistik:** EV 117,27 · PEG 2,05 · PS 2,83 · PB 2,01 · EV/EBIT 21,47 ·
  EV/EBITDA 12,99 · ROE 10,13 % · ROA 2,98 % · ROIC 4,16 % · WACC 5,49 % ·
  brutto 46,35 % · EBIT 23,98 % · pretax 15,82 % · netto 13,78 % · EBITDA
  39,62 % · rev-prognos 3Y +7,59 % · EPS-prognos 3Y +8,28 % · kassa 603 M ·
  skuld 53,53 mdr · nettolån −52,92 · EK 33,29 mdr · BV/aktie 58,93 · skuld/EK
  1,61 · räntetäckning 2,51 · payout 65,82 % · FCF-yield −9,15 %.
- **RI (MUSD):** oms 16 792 · 19 640 · 18 982 · 19 721 · 21 876 (TTM 22 791,
  +10,28 %) · netto 2 488 · 2 307 · 2 208 · 2 967 · 3 580 (TTM 3 141) · EPS
  4,96 · 4,49 · 4,24 · 5,58 · 6,66 (TTM 5,77) · profit 14,82 · 11,75 · 11,63 ·
  15,04 · 16,36 (TTM 13,78) · FCF-marginal −16,03 · −13,71 · −13,96 · −6,93 ·
  −23,28 (TTM −25,84).
- **BR (MUSD):** kassa 403,4 · 509,4 · 330,1 · 2 033 · 197 (TTM 375) · skuld
  37 160 · 41 938 · 43 922 · 45 998 · 49 692 (TTM 53 525) · EK 22 680 · 24 122
  · 25 286 · 26 986 · 32 218 (TTM 33 289) · tillgångar 87 669 → 121 570.
- **KF (MUSD):** OCF 3 840 · 5 288 · 5 012 · 6 804 · 6 944 (TTM 7 694) · capex
  −6 427 · −7 879 · −7 533 · −8 030 · −11 906 (TTM −13 448) · FCF −2 691 ·
  −2 692 · −2 649 · −1 366 · −5 092 (TTM −5 890) · utdelning −1 508 → −2 008
  (TTM −2 048) · aktieemissioner 600,5 → 1 048 M.

### EXC — Exelon Corporation (NASDAQ, USD)
- **Översikt:** pris 40,32 · mcap 41,62 mdr (−6,8 %) · aktier 1,03 Mdr · P/E
  14,83 · forward 13,70 · EPS 2,72 (+3,2 %) · TTM oms 25,33 mdr (+6,6 %) · netto
  2,78 mdr (+4,9 %) · DPS 1,68 (4,17 %) · beta 0,39 · 52-v 39,73–50,65 ·
  20 571 anst. · Hold 48,71 (21 st) · rapp 2026-11-03.
- **Statistik:** EV 92,48 · PEG 2,13 · PS 1,64 · PB 1,40 · PTBV 1,80 · EV/EBIT
  17,75 · EV/EBITDA 11,07 · P/OCF 5,77 · ROE 9,71 % · ROA 2,81 % · ROIC 4,10 %
  · ROCE 4,67 % · WACC 4,76 % · brutto 42,36 % · EBIT 20,57 % · pretax 13,29 %
  · netto 10,99 % · EBITDA 32,99 % · rev-prognos 3Y +4,10 % · EPS-prognos 3Y
  +5,53 % · kassa 1,81 mdr · skuld 52,67 mdr · nettolån −50,86 · EK 29,70 mdr
  · BV/aktie 28,77 · skuld/EK 1,77 · räntetäckning 2,35 · payout 61,79 % ·
  FCF-yield −4,60 %.
- **RI (MUSD):** oms 17 938 · 19 078 · 21 727 · 23 028 · 24 258 (TTM 25 326,
  +6,56 %) · netto 1 706 · 2 170 · 2 328 · 2 460 · 2 768 (TTM 2 783) · EPS 1,74
  · 2,20 · 2,34 · 2,45 · 2,73 (TTM 2,72) · profit 9,51 · 11,37 · 10,71 · 10,68
  · 11,41 (TTM 10,99) · FCF-marginal −27,70 · −11,94 · −12,45 · −6,64 · −9,38
  (TTM −7,56).
- **BR (MUSD):** kassa 672 · 407 · 445 · 357 · 626 (TTM 1 813) · skuld 34 855 ·
  40 363 · 44 340 · 46 905 · 50 249 (TTM 52 673) · EK 34 795 · 24 744 · 25 755
  · 26 921 · 28 798 (TTM 29 698) · tillgångar 133 013 → 120 505 (FY2021-fallet
  = Constellation-avknoppningen 2022).
- **KF (MUSD):** OCF 3 012 · 4 870 · 4 703 · 5 569 · 6 254 (TTM 7 212) · capex
  −7 981 · −7 147 · −7 408 · −7 097 · −8 529 (TTM −9 128) · FCF −4 969 · −2 277
  · −2 705 · −1 528 · −2 275 (TTM −1 916) · utdelning −1 497 → −1 617 (TTM
  −1 669) · aktieemissioner 80 → 949 M.

## TAL-PARITET (aritmetikgrind, ABORT FÖRE skrivning — 42+27 = 69 identiteter GRÖN)

Första omgången (NEE/DUK + de tre senare dedup:ade): 42/42 GRÖN (mcap
aktier×pris EXAKT på NEE/DUK/RWE/FORTUM; EV/EBIT-repliker inom 0,02 % på
NEE/DUK/SO/AEP/EXC; alla netto-/FCF-/skuld-EK-identiteter ≤ 0,73 %). Andra
omgången (SO/AEP/EXC): 27/27 GRÖN. Dokumentationsnotiser: NEE P/E-fönstret
statistics 16,97 bärs (quote 17,10 = annan EPS-snapshot, aktiebasreplik 16,96);
SO P/B aktiebas 2,394 bärs (total-EK-läge 2,24 dokumenterat); EXC mcap
aktieantalsrundning 0,2 % (källans mcap-fält bärs). Avverkade raders identiteter
finns i verktyg/_nyttovalt-append.mjs (git-historiken om skripten städas).

## KONVENTIONER

BUD-konventionen (negativt prognosgap ⇒ prognosTillvaxt null) tillämpades på
NEE (forward 18,42 > trailing 16,97, −8,5 %; 3Y EPS +8,62 % dokumenterad i
paranoid-rad); DUK/SO/AEP/EXC bär positiva gap (+1,5/+11,1/+12,9/+7,6 %) ⇒
prognosTillvaxt = källans 3-års EPS-prognos. Moat-fält null alla fem (källan
ger bruttomarginal enbart TTM — ingen 5-årig bruttovinstserie; ärligt null,
inte påhittat). aterkop null (v209-mönstret). egenKapitalMultipl = P/B.

## MEDIANER (EXAKT raknaBranschMedianer-replik)

| Mått | FÖRE (311) | NYTTOVALT (5 nya) | UNIVERSUM EFTER (316) |
|---|---|---|---|
| Totalt P/E | 20,1 (n 299) | 17,1 (kv 17,0–19,8, n 5) | **19,9 (n 304)** |
| Totalt resultat-CAGR | 6,1 % (n 261) | median 12,9 % (n 5) | **6,4 % (n 266)** |

llms-formatrad (efter framtida bygge + regen): "Medianerna för Nyttovalt i
AK1A:s universum (5 bolag i branschen, rådata 2026-09-28): P/E 17,1 med
kvartilspridning P25–P75 17–19,8 (n=5) · P/B 2 · EBIT-marginal 27 % ·
FCF-marginal −13 % · omsättningstillväxt 6,6 %."

## KVD

- **Paritetsgrind:** 69/69 GRÖN FÖRE skrivning ( två omgångar; dedup-vågen
  strukturvaktad: exakt 3 egna rader bort, alla andra byte-identiska).
- **Kontrakt:** 18 nyckelfält × 316 rader; serier 5×4 arrays; JSON-parse GRÖN.
- **Läckagevakt v98:** GRÖN — 316 tickers + 316 namn, 0 träffar i 1 615
  utdatafiler (dataset-ytan ×3 språk + llms Dataset-block + sitemap/robots).
- **llms.txt:** HELREGEN på 316-läget (313-läget efter dedup, 316 efter
  omgång 2); nyttovalt-raderna hålls TILLBAKA av o559-bygggrinden (sidan ej i
  körande bygge) — släpps av nästa gröna bygge + regen (skriptmönster i
  verktyg/_nyttovalt-llms-regen.mjs).
- **Sitemap:** data-driven ur samma universum + samma byggsanningsgrind —
  /dataset/nyttovalt postas automatiskt när bygget levererar sidan; INGEN manuell
  sitemap-ändring behövs (grindens poäng).
- **Ordlista:** dataset.bransch.nyttovalt {sv Nyttovalt / en Utilities / ar
  المرافق} tillagd (branschNamn-fallback hade visat rå slug).
- **tsc:** node node_modules/typescript/bin/tsc --noEmit = 0 fel (src berörd:
  endast ordlista.ts; INGET bygge — data + en ordlisterad).
- **R2 orörd · data/blogg orörd · inga priser/tier/publicering · juridikgrind:**
  allt är aggregat med n-redovisning, pedagogiska formuleringar, ALDRIG råd.

## FYND (cellens pedagogik)

1. **Negativ FCF är sektorns signatur, inte tecken på kris:** alla fem bär
   negativ FCF-marginal (−7,6 till −25,8 % TTM) medan netto-marginalerna är
   stabilt positiva — reglerad tariff-intäkt möter transmissions-capex
   (AEP:s största utbyggnad i historien; NEE:s capex 29,8 mdr TTM mot OCF 13,8).
   SO:s FY2024 +833 M är cellens enda positiva FCF-år — utdelningarna (payout
   56–73 %) bärs av balansräkning och nyemissioner, dokumenterat i serierna.
2. **P/E-bandet 14,8–20,5:** EXC (rent nät efter Constellation-split 2022) i
   bottennivåerna, AEP (tillväxt-park) i toppen — split-till-fallen dokumenterad
   i EXC:s EK-kurva 34 795→24 744 M.
3. **Skuld/EK 1,6–1,8 konstant** (undantag: de europeiska energiraderna 0,5–1,5)
   + räntetäckning 2,35–2,52×: reglerad kapitalstruktur är del av
   affärsmodellen, inte en riskflagga samma sätt som i andra branscher.

## KÖNOTIS (nästa omgångs koordinater)

1. **+3 europautilities SAKNAS i universum:** Endesa (ELE.MC), EDF (EDF.PA),
   Veolia (VIE.PA) — stärker cellen mot europeisk balans; franska/spanska
   primärnoteringar (epa/bme-vägen).
2. **LSE-vägen olöst:** /quote/lse/NG + /quote/lse/SSE = 404 (2026-09-28);
   UK-utilities (National Grid redan i energi som NG.L) kräver annan källväg —
   sondvärd: /quote/lse/NG-L eller Yahoo-fallback.
3. **Strukturfrågan (styrelsen R1):** flytta GICS-utilities från energi
   (FORTUM.HE, RWE.DE, EOAN.DE, NG.L, IBE.MC, ENEL.MI, ENGI.PA) till nyttovalt?
   Ändrar energi-medianer — deras ägo, min fråga.
4. **USA/nyttovalt-landaspekten** når matta 5 redan nu — föds datadrivet vid
   bygget (landmodulen usa finns; ingen åtgärd krävs).
