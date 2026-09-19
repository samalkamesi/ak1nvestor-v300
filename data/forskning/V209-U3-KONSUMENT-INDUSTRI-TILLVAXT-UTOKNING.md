# V209-U3 — DATASET-DJUP: +3 BOLAG — Walmart (konsument) + A.P. Møller-Mærsk (industri) + Adyen (tillväxt); universum 210→213

Fabriksagent v209-u3 (byggare 3/3, manifest v209-datasetdjup-1789850833630, spår 2
DATASET-DJUP). 2026-09-19 ~23:1x–00:0x lokal. Anspråk disk-först:
`data/vakten/v209-datasetdjup-1789850833630-v209-u3-ansprak.md` (gitignorerad väg).

## 0. VAL + DUPLIKATKONTROLL

Duplikatkontroll före start mot bolagsunivers.json (207 rader vid läsning) + worklog
+ syskonens anspråk: **WMT / MAERSK-B.CO / ADYEN.AS samtliga fria** (0 träffar).
Kollisionsfönster: u1 och u2 levererade UNDER mitt datahämtningsfönster —
u1 VESTAS VWS.CO (energi) commit ee48a207, u2 SMFG 8316.T + AXA CS.PA (finans)
commit fdd913aa — inga kollisioner med mina tre val; slutläge 210+3 = 213.

Motivering av valet (struktur-luckor, BASF-precedensen):
1. **WMT — Walmart (USA, konsument)**: diskonterhandels-ankaret. Konsument hade
   32 rader men dominerades av varumärkeskonsumtion (PG/NKE/MCD/ITX/HM) —
   världens största omsättning och arbetsgivare saknades; P/E- och
   lågmarginal-pedagogikens kontrastobjekt.
2. **MAERSK-B.CO — A.P. Møller-Mærsk (Danmark, industri)**: universumets FÖRSTA
   sjöfarts-/containerlogistik-bolag — hela transportsegmentet saknades; global
   handels proxy-citeringsmagnet; fraktcykelns pedagogik (cykeltoppens CAGR-fälla).
3. **ADYEN.AS — Adyen (Nederländerna, tillväxt)**: tillväxt (tunnaste branschen,
   15) var ren USA-lista — första europeiska bolaget; betalinfrastruktursegmentet
   saknades; kassaflödescykeln-vs-vinstmarginalens pedagogiska kontrast.

Inget nytt land (USA/Danmark/Nederländerna fanns) ⇒ **land.ts orörd**. Inga nya
aspektsidor föddes (aspektParametrar 193→193 — matta ≥ 5 redan uppfylld i alla
mina bransch×aspekt-kombinationer).

## 1. KÄLLOR OCH HÄMTNING

All data live-hämtad 2026-09-19 (kväll lokal):

| Kanal | Status | Användning |
|---|---|---|
| StockAnalysis `/stocks/wmt/` + `/statistics/` + `/financials/` (+ balance-sheet, cash-flow-statement) | 200 ×6 | WMT primär (S&P-underlag, sid-as-of 2026-09-18 close) |
| StockAnalysis `/quote/ams/ADYEN/` + statistics + financials ×2 | 200 ×5 | ADYEN primär |
| StockAnalysis `/quote/otc/AMKBY/` (översikt) | 200; djupsidor **404** (OTC-utspärrning) | MAERSK paranoid (endast översikt möjlig) |
| Yahoo `query1.finance.yahoo.com/v10/finance/quoteSummary` (crumb-flöde) WMT/MAERSK-B.CO/ADYEN.AS, moduler price+summaryDetail+defaultKeyStatistics+financialData+incomeStatementHistory+balanceSheetHistory+cashflowStatementHistory+earningsTrend+netSharePurchaseActivity | 200 ×3 (efter throttle-fönster) | MAERSK primär; WMT/ADYEN paranoid |
| Yahoo `v7/finance/quote` MAERSK-B.CO + AMKBY | 200 | Maersk MC/ADR-paritet |
| Google Finance `MAERSK-B:CPH` | dec-2025-snapshot | Maersk MC-dom (dokumenterad äldre avvikare) |

**Driftfynd (källvägarna):** Yahoo throttle:ade crumb-endpointen (429 "Too Many
Requests") i ~10 min — node-fetch-flödet REJ bar crumb-svaret som crumb
("crumb=Too Many Requests") medan curl-cookie-jar-flödet fungerade först och
släppte igen efter paus. Lärdom: crumb-par (cookie+crumb) är kortlivat vid
throttle; vänta och förnya paret, ALDRIG tolka felkroppen som crumb.

## 2. RÅDATA OCH TAL-PARITET (varje fält i raderna)

### 2.1 WMT — Walmart Inc. (konsument, USA, USD)

| Fält | Värde i raden | Källa (primär) | Paranoid |
|---|---|---|---|
| pris | 106,73 USD | Yahoo regularMarketPrice 106,73 | SA bygger PE 38,676 på samma kurs (846 768,7 M/7 933,746 M aktier = 106,73) |
| marknadsKapitalMdr | 846,769 | SA 846 768 736 302 | Yahoo 846 768 766 976 — PARITET (diff 3·10⁻⁵ %) |
| pe | 38,676 | SA raw 38.676 | Yahoo 38,670 |
| pb | 9,008 | Yahoo 106,73/11,848 (bookValue) | SA PB 8,629 mot BVps 12,37 (senaste kvartal TTM-bok) — 4,4 % gap, not i raden |
| evEbit | 31,41 | SA EV/EBIT 31,41 | — |
| Forward PE | 35,583 | SA | Yahoo 33,044 (Yahoo +1 kalenderår vs SA nästa FY) — SA-par konsekvent |
| prognosTillvaxt | 0,0869 | egenderivat (38,676/35,583)−1 | SA EPS Growth Forecast (3Y) 11,26 % — annan horisont, not |
| peg | 4,45 | egenderivat 38,676/8,69 % | SA PEG 3,462 (3-års) — källans variant som not |
| roe | 0,22314 | SA 22,314 % | Yahoo 22,31 % PARITET |
| roic | 0,13312 | SA ROIC 13,312 % | — |
| bruttoMarginal | 0,24837 | SA 24,837 % | Yahoo 24,84 % PARITET |
| ebitMarginal | 0,03938 | SA EBIT Margin TTM 3,938 % (OpInc 28 980/735 840) | Yahoo operatingMargins 3,45 % — avvikande definition, SA primär, not |
| nettoMarginal | 0,03 | SA 3,000 % | Yahoo 3,0 % PARITET |
| fcfMarginal | 0,01836 | SA FCF Margin 1,836 % = 13 509/735 840 (räknat 0,018359 ✓) | — |
| fcfYield | 0,016 | 13 509/846 768,7 = 0,015954 (SA FCF Yield 1,595 % PARITET) | — |
| skuldEgenkapital | 0,7165 | SA Total Debt TTM 75 092 / Shareholders' Equity TTM 104 799 = 0,71653 | Yahoo debtToEquity 71,653 % → 0,71653 EXAKT PARITET |
| rantaTackning | 12,306 | SA Interest Coverage 12,306 | — |
| utdelning | 0,99 USD/A, yield 0,93 %, payout 35,875 % (SA) | SA Dividend Per Share/Yield/Payout | Yahoo 0,99/0,93/34,96 |
| aterkop.senasteArMdr | 7,507 | SA Common Dividends Paid FY2026 = 7 507 M USD (kassaflödesrad — direkt källbelagt, ej derivat) | — |
| Years of Dividend Growth | 53 år (SA) — not i radnotering | — | — |
| Serier FY2022–FY2026 (feb–jan-bokslut, årsetikett = slutår, BHP-precedens) | omsättning 572 754/611 289/648 125/680 985/713 163 M USD; resultat 13 673/11 680/15 511/19 436/21 893; EK 83 253/76 693/83 861/91 013/99 617; FCF 11 075/11 984/15 120/12 660/14 923 | SA financials + balance-sheet + cash-flow (S&P) | Yahoo incomeStatementHistory FY2023–FY2026 = 605 881/642 637/674 538/706 413 — **Yahoo = net sales, SA = totala intäkter inkl. medlemskap** (skillnad ≈ 5 400 M USD/år), resultat identiskt, dokumenterat i radnot |
| CAGR | omsättning (713 163/572 754)^(1/4)−1 = +5,63 %/år; resultat (21 893/13 673)^(1/4)−1 = +12,49 %/år | maskinverifierat | — |
| omsattningTillvaxtTTM | 0,0616 | SA Revenue Growth TTM 6,16 % | Yahoo revenueGrowth 5,9 % |
| moat | bruttomarginalserie FY22–26: 25,10/24,14/24,38/24,85/24,93 % → medel 24,68 %, spread 0,96 pp (BASF-precedensens moat-fält) | SA fin Gross Margin-rad | — |
| fcfPositivaSenaste5 | 5 (FCF-seriens fem helår samtliga positiva) | SA FCF-rad | — |

### 2.2 MAERSK-B.CO — A.P. Møller - Mærsk A/S (industri, Danmark, DKK)

| Fält | Värde i raden | Källa (primär Yahoo MAERSK-B.CO) | Paranoid |
|---|---|---|---|
| pris | 22 590 DKK | Yahoo regularMarketPrice | AMKBY ADR 17,31–17,42 USD ( tunn OTC-handel) |
| marknadsKapitalMdr | 325,63 mdr DKK | Yahoo 325 630 296 064 | **TREFACK-PARITET:** Yahoo AMKBY v7 49,90 mdr USD ≈ 334 mdr DKK (6,7); SA AMKBY 48,82 mdr USD; Google Finance dec-2025-snapshot 185,4 mdr DKK = ÄLDRE (kurs 11 690, annat aktieantal) — alla tre leverantörer bär ~14,4–15,9 M "aktier" mot Köpenhamnsbörsens dual-class A+B (Yahoo B-sharesOut 4 872 448 MC-internt inkonsistent 14 415 375); leverantörskonsensusnivån levereras med ADR-paritets-not i rad + full utredning här |
| pe | 22,222 | Yahoo trailingPE (EPS 1 016,55 DKK; 22 590/1 016,55 = 22,22 ✓) | SA AMKBY PE 21,29 |
| pb | 0,9213 | Yahoo priceToBook (bok 24 519,49 DKK/aktie) | SA AMKBY 0,9073; per-aktie-konvention = universumets (AAPL 44,15 = kurs/EK-p/A-verifierad) |
| evEbit | 9,29 | EGENDERIVAT (enda källan 404:ar): EV = 325 630 M DKK − nettokassa (18 490−17 472 = 1 018 M USD × 6,7 = 6 820 M DKK) = 318 810 M DKK ÷ EBIT TTM (9,101 % × 56 264 M USD = 5 121 M USD) = 9,29 — härledningen maskinverifierad och dokumenterad i radnot | — |
| prognosTillvaxt | −0,2014 | (22,222/27,829)−1 — NEGATIV: fwd-EPS 811,73 < trailing (fraktnormalisering) | Yahoo earningsTrend +1y −74,09 % samma riktning |
| peg | null | negativ nämnare ⇒ osatt (universumets PEG = P/E/prognos% meningslös vid negativ prognos) | Yahoo pegRatio 0,38 bygger på +185 % TTM-tillväxt — not |
| roe | 0,04374 | Yahoo financialData (TTM) | — |
| roic | null | ingen källa (SA djupsidor 404, Yahoo saknar ROIC) | — |
| bruttoMarginal | 0,20996 | Yahoo grossProfits 11 813/56 264 (TTM) | — |
| ebitMarginal | 0,09101 | Yahoo operatingMargins TTM (5 121/56 264 ✓) | — |
| nettoMarginal | 0,04075 | Yahoo profitMargins TTM | — |
| fcfMarginal/fcfYield | null | OCF TTM 8 429 M USD finns men capex-serien saknas i BÅDA källorna (Yahoo cashflowStatements.capitalExpenditures = null; SA 404) — osatt, aldrig gissat | — |
| skuldEgenkapital | 0,31 | Yahoo debtToEquity 30,997 % (IFRS-16 fartygsleasing ingår — not) | — |
| utdelning | 480 DKK/aktie, yield 2,12 %, payout 47,18 % | Yahoo summaryDetail (internt konsistent: 480/22 590 = 2,12 %) | v7-quote visade 75,461 = bruten kopia av ADR-fältet — förkastad |
| insiderandel | 31,1 % (Yahoo heldPercentInsiders; A.P. Møller-familjen + stiftelser) — not i rad | — | — |
| Serier FY2022–FY2025 (USD, bolagets rapportvaluta) | omsättning 81 529/51 065/55 482/53 988 M USD; resultat 29 198/3 822/6 109/2 725 M USD | Yahoo incomeStatementHistory | SA AMKBY TTM: rev 56,26 mdr USD (−1,0 % y/y), ni 2,29 mdr — TTM-nivåer konsistenta |
| CAGR | omsättning −12,84 %/år; resultat −54,64 %/år (endpoint FY2022→FY2025, 3 steg — maskinverifierat) | FY2022 = containerfraktens HISTORISKA rekordår (Röda havet-boom): negativa CAGR:er är cykelns amplitud-mått, BHP-precedensens "från cykeltoppen"-not i rad | — |
| omsattningTillvaxtTTM | −0,010 | SA AMKBY "Revenue (ttm) 56.26B −1.0%" | **KÄLLKONFLIKT DÖMD:** Yahoo financialData.revenueGrowth +20,0 % = kvartals-y/y (Q2-2026 starkt kvartal), SA −1,0 % = TTM-mått — fältnamnet kräver TTM ⇒ SA, Yahoo-talet dokumenterat |

### 2.3 ADYEN.AS — Adyen N.V. (tillväxt, Nederländerna, EUR)

| Fält | Värde i raden | Källa (primär SA/AMS) | Paranoid |
|---|---|---|---|
| pris | 879,10 EUR | Yahoo regularMarketPrice | SA EPS 35,57 × PE 24,716 = 880,3 ≈ ✓ |
| marknadsKapitalMdr | 27,75 mdr EUR | SA 27 750 265 751 | Yahoo 27 750 264 832 PARITET (diff 4·10⁻⁶ %) |
| pe | 24,716 | SA raw 24.716 | Yahoo 24,694 (EPS 35,60) |
| pb | 4,696 | SA PB | Yahoo 4,6964 PARITET (BVps 187,18) |
| evEbit | 13,10 | SA EV/EBIT | — |
| Forward PE | 20,579 | SA | Yahoo fwd 18,812 |
| prognosTillvaxt | 0,2010 | (24,716/20,579)−1 | Yahoo earningsTrend +1y 21,18 % — samma nivå |
| peg | 1,23 | 24,716/20,10 % | SA PEG 1,130 (3-års 19,64 %) — not |
| roe | 0,21271 | SA 21,271 % | Yahoo 21,27 % PARITET |
| roic | 0,13375 | SA ROIC | — |
| bruttoMarginal | 0,68535 | SA 68,535 % (gross profit 1 771/2 584 TTM — intäkter minus transaktionskostnader, tjänstedefinition, not i rad) | Yahoo 68,535 % PARITET |
| ebitMarginal | 0,4654 | SA EBIT Margin 46,54 % (OpInc TTM 1 203/2 584 = 46,56 ✓ internt) | Yahoo operatingMargins 43,617 % — annan postuppdelning, SA primär, not |
| nettoMarginal | 0,43555 | SA 43,555 % | Yahoo 43,555 % PARITET |
| fcfMarginal | −0,0588 | SA FCF Margin TTM −5,88 % = −151,98/2 584 (räknat −0,058816 ✓) | FYND: capex-stöt 801,51 M€ TTM (mot 123,66 FY2025 — Amsterdam-HQ) + settlements-working-capital (Other Net Operating Assets −622 M€) ⇒ OCF TTM 649,54 M€; FY2025-FCF var +906,76 M€ (38,2 % marginal) — pedagogiken i radnot |
| fcfYield | −0,0055 | −151,98/27 750,27 = −0,005477 (SA FCF Yield −0,548 % PARITET) | — |
| skuldEgenkapital | 0,0693 | SA Total Debt TTM 409,36/EK TTM 5 909 = 0,06928 | Yahoo 6,928 % EXAKT PARITET |
| rantaTackning | 61,536 | SA Interest Coverage | — |
| nettokassa | 11 994 M€ (kassa 12 403 − skuld 409) — not i rad | SA bs Net Cash (Debt) | — |
| aterkop | null ×3 | ingen utdelning (SA/Yahoo dividend n/a, payout 0) — not | — |
| Serier FY2021–FY2025 (EUR) | omsättning 1 002/1 330/1 626/2 015/2 376 M€; resultat 469,72/564,14/698,32/925,16/1 063; EK 1 810/2 416/3 151/4 232/5 285; FCF 1 769/1 926/1 804/1 607/906,76 | SA financials/bs/cf | Yahoo incomeStmt FY2022–FY2025 = 1 330,166/1 626,1/1 996,074/2 364,191 — **Yahoo = net revenue (FY2024 1 996) mot SA totala intäkter (2 015)**, resultat identiskt — not i rad |
| CAGR | omsättning (2 376/1 002)^(1/4)−1 = +24,09 %/år; resultat (1 063/469,72)^(1/4)−1 = +22,65 %/år | maskinverifierat | — |
| omsattningTillvaxtTTM | 0,0875 | SA Revenue Growth TTM 8,75 % | — |
| moat | bruttomarginalserie FY21–25: 75,87/71,34/61,87/65,57/68,09 % → medel 68,55 %, spread 14,0 pp (2022-dip = priskonkurrenstillväxtåret, not i rad) | SA fin Gross Margin | — |
| fcfPositivaSenaste5 | 5 (fem helår positiva; TTM-fönstret negativt — skilt mått, not) | SA FCF-rad | — |

## 3. ARITMETIKGRIND (maskinverifierad, abort-före-skrivning bevisad)

`verktyg`-fri körning `/tmp/v209u3-bygg-rader.mjs`: 21 kraav-kontroller (prognos,
fcfYield, fcfMarginal, PEG, skuld/EK, moat-medel/spread, rev/ni-CAGR ×3 bolag,
EV/EBIT-derivat). **FÖRSTA KÖRNINGEN: 4 RÖDA (mina huvudräkningar: WMT
fcfMarginal-avrundning, WMT moat-spread 0,79→0,96, MAERSK CAGR −12,72→−12,84 och
−53,3→−54,64) ⇒ scriptet VÄGRADE skriva (exit 1)** — grindeffekten bevisad i
praktiken; fälten rättades till de maskinberäknade; andra körningen 21/21 GRÖN.

Append: **kirurgisk 303 insertions / 0 deletions** (git diff --stat; 0 gamla
rader förändrade, JSON-bevis stringifierad jämförelse mot backup). Indenterings-
läxan från u2 tillämpad: första skrivningen med indent 1 gav 19 090/18 787-radig
kosmetisk diff — återställd, omgjord med indent 2 (filformatets eget).

## 4. MEDIANER/KVARTILER FÖRE→EFTER (projektets EGEN lasBranschMedianer via jiti, separata processer)

| Bransch | nPe | median P/E | P25–P75 | median P/B | EBIT-marg | FCF-marg | oms-tillväxt |
|---|---|---|---|---|---|---|---|
| konsument (+WMT) | 31→32 | **18,3→19,0** | 15,7→15,7 / 22,4→22,7 | 2,8→2,9 | 13,7→13,6 % | 8,6→8,5 % | 2,1→2,6 % |
| industri (+MAERSK) | 18→19 | **28,0→27,8** | 20,8→21,0 / 35,0→34,6 | 5,5→5,1 | 16,4→16,2 % | 11,3→11,3 % | 9,6→9,1 % |
| tillväxt (+ADYEN) | 11→12 | **43,6→40,8** | 32,0→30,2 / 106→100,3 | 9,2→7,2 | 12,1→14,7 % | 16,1→13,8 % | 34,1→33,9 % |
| TOTALT | 200→203 | 20,6→20,7 | — | 2,8→2,8 | 20,7→20,6 % | 12,5→12,3 % | 6,9→6,9 % |

**Universumjämförelse per bolag (kvartilplacering i egen bransch):**
- WMT P/E 38,7 mot konsument-median 19,0 (P75 22,7) — ÖVRE KVARTILEN: marknaden
  prissätter stabiliteten (53 års utdelningsserie, +12,5 % resultat-CAGR), medan
  EBIT-marginalen 3,9 % är branschens lägsta klass — värdering-vs-marginal-pedagogiken.
- MAERSK P/E 22,2 mot industri-median 27,8 (P25 21,0) — precis ovanför NEDRE
  kvartilen med NEGATIV prognos (−20,1 %): cykelbolagets multiplar är fallande
  knivar i statistiken; P/B 0,92 = universumets få under 1.
- ADYEN P/E 24,7 mot tillväxt-median 40,8 (P25 30,2) — UNDER NEDRE KVARTILEN
  samtidigt som EBIT-marginalen 46,5 % (mot median 14,7 %) och ROE 21,3 % är
  toppklass: tillväxtbranschens värde-marginal-kontrast, med negativ TTM-FCF som
  cykelvarning.

## 5. KVD

- **Läckagevakt ×2 (universum läst ×2 — samma antal båda gångerna):**
  v98-dataset-vakt GRÖN 0 träffar — 213 tickers + 213 namn; Första mätningen
  (före prod-synkens trädbygge) 1 573 utdatafiler, om-mätningen efter träd-
  återställningen 2 filer (.next-läget ägs av deploycykeln, ej denna våg) —
  båda körningarna 0 träffar; s2u2o19-lackagevakt GRÖN 2× (213 bolag, 376
  sökningar, 0 träffar — renderade dataset-html ×3 + llms-sektionen). Dataset-
  ytan bär enbart aggregat.

  TRÄDÅTERSTÄLLNINGEN: prod-synkens trädsynk rev de ocommittade datafilerna
  under KVD-fönstret (disk 213→210, llms 213-läge borta) — s2-u2-precedensens
  exakt samma mönster; återställda ur backup + regen, om-mätta GRÖN, commit
  direkt efter skrivning (clobber-läxan tillämpad).
- **tsc:** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel, exit 0**
  (src/ orörd — INGET bygge; deploy ägs av prod-synken under lås).
- **prod 200 ×4:** / · /dataset · /dataset/konsument · /api/data/nyckeltalsguide
  alla 200; **LIVE /llms.txt bär redan 213-läget** (prod-synkens bygge läser
  arbetsytans data — commit låser provenansen).
- **llms.txt HELREGEN:** dataset-sektionen (506–523) ombyggd KONSISTENT på
  diskens faktiska 213-läge med EXAKT replik av raknaBranschMedianer
  (mall _s2u3o20 → min kopia `verktyg/_v209u3-llms-regen.mjs`); huvudrad
  "213 bolag i 10 branscher, rådata 2026-09-19"; konsument/industri/tillväxt-
  raderna bär de nya kvartilerna.
- **sitemap:** dynamisk (src/app/sitemap.ts läser lasBranschMedianer +
  aspektParametrar från disk vid build) — inga manuella poster; aspektsidor
  193→193 (inga nya föddes; gränsregeln matta ≥ 5 mätt via jiti).
- **land.ts orörd** — inget nytt land.
- **Kontraktstestet (testa-dataset-aspekter.mjs):** PRE-EXISTANDE importbrott
  (src/lib/dataset-medianer.ts importerar 'ordlista' utan suffix; rå node-ESM
  failar; jiti/register får testet att köras men 0 moduler med aspekter-export
  testas) — samma fynd som u2 bokförde till huvudagenten; src orörd = ej min yta.
  Kompenserande grind: aspektParametrar via jiti (193 sidor genererbara grönt) +
  dubbla läckagevakter + medianmätning via projektets EGEN lasBranschMedianer.
- **R2:** priser/tier/publicering orörda; data/blogg/ orörd (inga utkast); .env/
  nycklar orörda. **Syskonytor:** u1:s VWS.CO-rad och u2:s 8316.T/CS.PA-rader
  orörda (JSON-bevis: 0 gamla rader förändrade).
- **Juridikgrinden (2007:528):** alla radnoteringar och dataset-texter
  utbildningsformulerade ("så räknas talet", "jämförs bäst inom", "pedagogisk
  kontrast") — ALDRIG köp/sälj/rekommendation; llms-raderna bär "Pedagogisk
  referens — inte investeringsrådgivning"; negativa tal och cykelvarningar
  redovisas öppet (ärlighetsprincipen: osatt ≠ noll, mätt negativ = mätt).

## 6. LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — 3 nya rader (WMT, MAERSK-B.CO,
  ADYEN.AS), kirurgisk append 303+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 213-läget
- `verktyg/_v209u3-llms-regen.mjs` — regen-instrument (konventionsprefix)
- `data/forskning/V209-U3-KONSUMENT-INDUSTRI-TILLVAXT-UTOKNING.md` — detta protokoll
- `worklog.md` — rad för v209-u3

Kö åt huvudagenten: (1) kontraktstestets ordlista-import (u2:s notis +
denna); (2) Maersk-aktieantalsdjungeln hos leverantörerna (dual-class A+B
~5,66 M aktier i Köpenhamn mot leverantörernas 14,4–15,9 M-räkningar — leverantörs-
konsensusnivån levererad med noter; om Köpenhamnsbörsens egna tal önskas bör
Maersk IR-utläsning ligga hos dataägaren); (3) Yahoo-throttle-mönstret vid
crumb-hämtning (dokumenterat ovan).
