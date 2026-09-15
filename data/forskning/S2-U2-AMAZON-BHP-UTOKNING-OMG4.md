# S2-U2 omgång 4 — teknik + material +2 bolag: Amazon + BHP

Fabriksagent spår 2 (dataset-djup), uppgift u2 av 3, 2026-09-16.
Följer spårets etablerade mönster (s2-u2 omg3/ROG.SW-radens konventioner).

## Val-motivering

Uppdraget: "+2 bolag, kvartiler + universumjämförelse". Duplikatkontroll
FÖRE val (hela universumet utskrivet per bransch + worklog + fabriksstatus):
båda tickers saknades vid kontrollen (disk-läge 116). Val efter spårets
kriterier — de två tunnaste branscherna + de största saknade
citeringsmagneterna:

- **Amazon.com, Inc. (AMZN, teknik)** — e-handel + AWS + annons i en;
  bland de mest sökta/citerade bolagen i världen; universumets teknikbransch
  bar 10 bolag utan den. Glupande citathål.
- **BHP Group Limited (BHP, material)** — världens största gruvbolag
  (järnmalm + koppar, NYSE-ADR, rapportvaluta USD); material-bar 10 bolag.

## Leverans 1 — två bolagsrader i bolagsunivers.json

Node read-modify-write med idempotensguard (skip befintlig ticker);
derivat (CAGR/prognos/PEG) beräknas MASKINELLT i append-skriptet ur
råtalen. Allt live-hämtat från stockanalysis.com (översikt + statistics +
financials, underlag S&P Global Market Intelligence; sid-as-of 2026-09-16,
kurs close 2026-09-15):

| Fält | Amazon | BHP |
|---|---|---|
| Pris / börsvärde | 248,42 USD / 2 680 mdr | 84,77 USD / 214,78 mdr |
| P/E · P/B · EV/EBIT | 20,39 · 4,96 · 29,97 | 21,84 · 3,81 · 9,32 |
| PEG | null (negativ-tillväxt-regeln) | 0,71 (spårkonvention) |
| FCF-yield | −0,43 % (AI-capex) | 5,36 % |
| ROE · ROIC | 30,56 % · 11,94 % | 24,00 % · 21,72 % |
| Brutto- · EBIT- · netto- · FCF-marginal | 50,77 · 12,08 · 17,44 · −1,50 % | 85,92 · 42,10 · 16,73 · 19,61 % |
| Skuld/EK | 0,46 | 0,50 |
| Omsättningstillväxt TTM | +15,8 % | +14,6 % |
| prognosTillväxt (TTE) | **−25,5 %** (20,39/27,37) | **+30,6 %** (21,84/16,72) |
| Serier | 2022–2025 (USD): 513 983 → 574 785 → 637 959 → 716 924 M; resultat −2 722 → 30 425 → 59 248 → 77 670 M | FY2023–FY2026 juli–juni (USD): 53 817 → 55 658 → 51 262 → 58 760 M; resultat 12 921 → 7 897 → 9 019 → 9 833 M |
| omsättningCAGR (endpoint) | +11,73 % | +2,97 % |
| resultatCAGR | null — negativt startvärde 2022 (−2 722 MUSD, Rivian-nedskrivningar; BAS.DE-precedensen "endpoint-metoden meningslös") | −8,70 % (FY2023-toppen prisblåst — notering) |

Metodnoteringar (även i JSON-noteringsfältet per rad):
- AMZN: TTM-vinsten 135,3 mdr USD (+91,6 %) bär tillfälliga poster —
  forward-P/E 27,37 ÖVER trailing 20,39 ⇒ negativ implicit EPS-förändring
  (−25,5 %) = normalisering nedåt, ej underliggande volymtillväxt (källans
  3-årsprognos +8,7 %); PEG null enligt negativ-regeln (källans egen PEG
  1,32 dokumenterad); FCF negativt TTM (−11,6 mdr: OCF 161,4 − capex
  173,0 — AI-infrastrukturprogrammet) ⇒ fcfMarginal/fcfYield negativa;
  räntetäckning 28,13 dokumenterad i notering (fältet systematiskt osatt);
  ingen utdelning (aterkop null, plattformskonvention).
- BHP: NYSE-ADR i USD (primärnotering ASX: BHP), rapportvaluta USD;
  räkenskapsår juli–juni — serien FY2023–FY2026 märkt slutåren, FY2026
  rapporterad 2026-08-18; utdelning 3,41 USD/ADR (4,02 %, payout 89,9 % —
  cykliskt högt; policyn 50 %+ av vinsten); räntetäckning 28,27 i notering;
  bruttomarginal 85,92 % = gruvkonventionen (framförda varor).

## Medianeffekt (isolerat, 115 → 117, mätt med projektets EGEN raknaBranschMedianer)

| Mått | Före (115) | Isolerat (117 = mina två) | Disk (120, med syskonens BAS.DE/TSM/MELI) |
|---|---|---|---|
| Totalt median P/E | 20,2 (n=106) | **20,4 (n=108)** | 20,5 (n=111) |
| Teknik P/E | 31,8 (20,7–37,8, n=10) | **28,0 (19,4–37,6, n=11)** — Amazon 20,4 drar ned medianen 3,8 p, P25 vidgas ned | 27,9 (19,9–37,5, n=12) |
| Material P/E | 18,5 (14,1–19,4, n=9) | **18,7 (14,5–20,3, n=10)** — BHP 21,8 lyfter lätt, P75 vidgas upp | 18,8 (14,9–21,2, n=11) |

Kvartiler + universumjämförelse flödar automatiskt i hela datasetlagret
(18 aspektmoduler, /dataset-sidorna, JSON-LD, /api/data/nyckeltalsguide,
/api/llms-txt) — räknat ur bolagsunivers.json vid bygget; två nya
/bolag-sidor (amzn, bhp) föds vid nästa prod-bygge; sitemap följer
registret automatiskt.

## Leverans 2 — llms.txt Dataset-sektion

Blocket regenererat ur projektets EGEN kodväg (lasBranschMedianer, samma
som /api/llms-txt; /tmp/s2u2-regenerera-dataset-block.mjs med
mallfällan-kuren): **120-läget**, totalt median P/E 20,5 (n=111 av 120),
teknik-raden 27,9 (n=12), material-raden 18,8 (n=11). Aspektraden
/dataset/finans/resultat-cagr-5ar bevarad med tal ur aspektmodulens egen
generera() — och "lägsta datatäckning"-påståendet korrekt UTELÄMNAT
(tillväxt n=5 < finans n=6 — räknat ur datan, mallfällans femte fall
förebyggt av kuren). Syskonet s5-u3:s kurs-rader (347) i samma fil
orörda av splicen (diff: endast blockets 12+12 rader).

## Koordinering (parallell omgång — race fullständigt dokumenterat)

- **Disk-läget rörde sig under mitt datafönster**: 116 vid kontroll →
  119 vid append (syskonens BAS.DE ocommittad från start; s2-u3:s TSM +
  MELI landade i arbetsytan under min hämtning). Min commit 9839c530 tog
  ARBETSKOPIAN = 5 nya rader (mina AMZN+BHP + syskonens BAS.DE/TSM/MELI;
  s2-u3-omg3-precedensen "commit tar arbetskopian" — ägarskap BAS.DE =
  s2-u1, TSM/MELI = s2-u3, dokumenterat i deras commit 43d6a4f3 + här).
- **BHP dubbelt-valt**: s2-u3 omg 4 tog OCKSÅ BHP — identisk källa
  (stockanalysis, close 2026-09-15), identiska tal (P/E 21,84/fwd 16,72/
  PEG 0,71/FY2023–2026). Idempotensguarderna gjorde att EXAKT EN rad
  landade (BHP-raden på disk bär mitt kallor-block; deras committext
  dokumenterar samma data). BHP = de-facto-samarbete mellan s2-u2 och
  s2-u3; oberoende dubbelhämtning av samma källa = extra verifiering.
- **Sekvens**: min commit 9839c530 (BHP+AMZN i git) → deras 43d6a4f3
  (TSM+MELI + llms på 119-läget) → min llms-regen tog blocket till 120
  (AMZN:s enda utestående effekt). Kedjan själv-läker som förra omgången.
- Mina rader idempotenta; ingen revert; inget arbete förlorat.

## KVD-bevis

- Kontraktstest `tsx verktyg/testa-dataset-aspekter.mjs` (npx-cachens
  binär): **GRÖNT — 163 sidkontroller, 0 fel**, 30 kända varningar
  (pre-existerande; 162→163 = MELI:s nya aspektsida, s2-u3:s notis).
- Läckagevakt `node verktyg/v98-dataset-vakt.mjs`: **GRÖN — 0 träffar,
  120 tickers + 120 namn i 1 426 utdatafiler**.
- `node node_modules/typescript/bin/tsc --noEmit`: **0 fel**.
- Prod: `https://lab.ak1nvestor.com/` = 200, `/dataset` = 200,
  `/api/data/nyckeltalsguide` = 200.
- Endast data/ + public/llms.txt — inget bygge; src/ orörd; R2 orörd
  (priser/tier/publicering; data/blogg/ orörd).

## Filägarskap

- Exklusiva: data/forskning/S2-U2-AMAZON-BHP-UTOKNING-OMG4.md (detta),
  /tmp/s2u2-append.mjs, /tmp/s2u2omg4-mat.ts, verktyg/_s2u2-commitmsg.txt.
- Delade: data/portfolj-system/bolagsunivers.json (mina AMZN+BHP-rader i
  commit 9839c530; BHP gemensamt med s2-u3 enligt ovan), public/llms.txt
  (dataset-blocket, 120-läget), worklog.md (append).
