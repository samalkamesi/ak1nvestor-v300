# S2-U3 (auto-s2 omgång 4) — +3 citeringsmagneter: TSMC, BHP, MercadoLibre

Fabriksagent s2-u3 (manifest auto-s2-1789515305748), 2026-09-16.
Spår 2 — DATASET-DJUP. Uppgift: "+3 bolag, kvartiler + universumjämförelse,
läckagevakt 0, prod 200".

## Objektval (inga duplikat)

Kollisionskontroll före start mot worklog + tickerlistan + git log:
omgång 1 tog energi, omgång 2 Spotify/Skanska/Evolution, omgång 3
Volvo/EQT/Axfood, syskonen Vonovia + Roche/Nestlé. De tre branscher som
stod på minimitäckning 10 bolag EFTER allt detta — teknik, material,
tillväxt — var samtidigt de enda helt orörda av spårfamiljens senare
omgångar. Mitt val: en magnet per bransch, alla tre fria (0 träffar i
universumet före append):

| Bolag | Ticker | Bransch | Motivering |
|---|---|---|---|
| Taiwan Semiconductor (TSMC) | TSM | teknik | världens största halvledarfoundry — AI-boomens renaste citeringsmagnet; universumets teknik-rad saknade hela tillverkningshalvan (bara design/produkt: AAPL/GOOGL/MSFT/NVDA/SAP/ERIC…) |
| BHP Group | BHP | material | världens största gruvbolag (järnmalm, koppar, stenkol); material hade bara svensk/skog-lagt + Newmont/Yara — ingen diversifierad gruvjätte |
| MercadoLibre | MELI | tillväxt | Latinamerikas e-handel+fintech-jätte (Amazon+PayPal i ett bolag); tillväxt-radens är en ren USA-lista — MELI tillför geografi och kreditboks-pedagogik |

Universum vid min append: 116 → 119 på disk (116-läget inkluderade
syskonet s2-u1:s ocommittade BAS.DE — se Koordinering).

## Data (reell, källhärledd — StockAnalysis/S&P Global, sid-as-of 2026-09-15 close)

Alla tre raderna följer universumets konventioner exakt (omgång 3:s
mönster): 4 räkenskapsår, endpoint-CAGR, PEG = P/E ÷ prognosTillväxt i
procent, prognosTillväxt härledd ur trailing/forward-P/E, härledningar
dokumenterade per rad i `notering`. Allt live-hämtat denna session
(stockanalysis.com översikt + statistics + financials per bolag).

- **TSMC**: pris 413,75 USD (ADR) · börsvärde 1 940 mdr · P/E 27,83
  (forward 19,13 ⇒ prognos +45,5 %) · P/B 9,53 · EV/EBIT 23,81 · ROE
  40,0 % · ROIC 54,0 % (nettokassa ~77 mdr USD lyfter) · marginaler
  brutto 64,2/EBIT 56,1/netto 49,9/FCF 25,8 % · skuld/EK 0,17 ·
  PEG 0,61 · serier i TWD (omsättning 2 264→2 162→2 894→3 809 mdr;
  resultat 993→852→1 158→1 698 mdr; dipp −4,5 % 2023 vid
  halvledarcykelns botten) · CAGR omsättning +18,9 %, resultat +19,6 %.
- **BHP**: pris 84,77 USD (ADR) · börsvärde 214,78 mdr · P/E 21,84
  (forward 16,72 ⇒ +30,6 %) · P/B 3,81 · EV/EBIT 9,32 · ROE 24,0 % ·
  ROIC 21,7 % · brutto 85,9 % = gruvkonvention (depletion utanför
  COGS — jämförs endast inom material) · skuld/EK 0,50 · PEG 0,71 ·
  rapportvaluta USD (koncernredovisning; ASX-primärnotering i AUD) ·
  **bokföringsår juli–juni**: serier bär de fyra senaste AVSLUTADE
  räkenskapsåren FY2023–FY2026 (FY2026 slutade 30 juni 2026,
  rapporterat augusti 2026) — årsetiketterna = slutår, medan övriga
  universumsrader bär kalenderår; notering förklarar · CAGR omsättning
  +3,0 %, resultat −8,7 %/år FRÅN cykeltoppen FY2023 (12,9 mdr) —
  råvarucykel, inte försvagad verksamhet (FY2026 +9 %) · utdelning
  3,41 USD/ADR, 4,02 % direktavkastning, payout 89,9 %.
- **MercadoLibre**: pris 1 828,94 USD · börsvärde 92,72 mdr · P/E 49,77
  (forward 43,42 ⇒ +14,6 %; källans 3-års intäktsprognos +32 %/år som
  kontrast-not) · P/B 11,84 · EV/EBIT 34,46 · ROE 27,5 % · ROIC 14,2 %
  · brutto 47,8/EBIT 8,3/netto 5,3/FCF 35,3 % — marginalgapet
  (fintech-kreditboken träffar resultat och kassaflöde olika) · skuld/
  EK 1,69 inkluderar utlåningsboken Mercado Crédito · PEG 3,40 ·
  CAGR omsättning +38,9 %/år, resultat +60,6 %/år från låga basen
  2022 · ingen utdelning (tillväxtbolagets mönster) · Delaware-bolag,
  verksamhet Latinamerika — land-fältet följer registreringsland.

Aritmetiken maskinverifierad EFTER append (node): CAGR, prognosTillväxt,
PEG och fcfYield omräknade — GRÖN för alla tre (ex: TSM omsCAGR
(3 809 054/2 263 891)^(1/3)−1 = 0,1894 exakt mot radens 0,1894).

## Medianeffekter (projektets EGEN lasBranschMedianer, tsx)

Före = 116-läget (syskonets BAS.DE tillkommen, mina ej). Efter = 119.

| Mått | Före (116) | Efter (119) |
|---|---|---|
| Totalt median P/E | 20,4 (n=107) | **20,5 (n=110)** |
| Teknik P/E | 31,8 (20,7–37,8, n=10) | **28,0 (23,0–37,6, n=11)** — TSM drar ned medianen 3,8 p och lyfter P25 +2,3 |
| Material P/E | 18,7 (14,5–20,3, n=10) | **18,8 (14,9–21,2, n=11)** — BHP vidgar båda kvartilerna |
| Tillväxt P/E | 94,6 (38,4–135,8, n=7) | **72,2 (41,0–126,6, n=8)** — MELI drar medianen ned 22 p mot normalmultiplar |

Kvartiler + universumjämförelse behövs INTE byggas manuellt: hela
datasetlagret räknas ur bolagsunivers.json — nya rader flödar
automatiskt in i medianer, kvartiler och universumjämförelser på
/dataset-sidorna vid nästa prod-bygge. Tre nya /bolag-sidor (tsm, bhp,
meli) + sitemap-poster föds samma bygge.

**Aspekt-effekt (bonus)**: MELI:s resultat-CAGR höjde tillväxtens
resultat-CAGR-matta till 5 ⇒ gränsregeln (matta ≥ 5) öppnade en ny
aspektsida — kontraktstestets sidkontroller gick 162 → 163.

## llms.txt

`public/llms.txt` dataset-block regenererat ur projektets EGEN kod
(lasBranschMedianer + aspektmodulens generera('finans') för
resultat-cagr-5ar-raden — s2-u2:s mallfällan-kur, skript återanvänt).
Blocket speglar 119-läget: 13+14 rader, teknik/material/tillväxt med
nya tal, totalt median P/E 20,5 (n=110). **Mallfällan-kuren bevisad i
praktiken**: finans-aspektradens "universumets lägsta datatäckning"-
påstående är databeräknat — tillväxt (n=5) passerade under finans
(n=6) tack vare MELI, påståendet utelämnas AUTOMATISKT (korrekt
beteende, ingen manuell hand). llms-full.txt saknar dataset-sektion =
orörd.

## Koordinering (delat träd — spårfamiljens sjunde race)

Syskonet s2-u1 (+1 bolag) hade vid mitt fönster redan skrivit BAS.DE
(material, stockanalysis 2026-09-15) + regenererat llms till 116 —
begge OCOMMITTADE i arbetskopian. Min append och min llms-regeneration
byggde på deras 116-läge ⇒ 119 konvergent (deras omregenerering ur
samma fil ger identiskt innehåll). Min commit tar arbetskopian av de
delade filerna = BAS.DE-radern och llms-blocket följer med och SKYDDAS
från prod-synkens trädåterställning (det bevisade raderingmönstret) —
ägarskap BAS.DE/116-läget = s2-u1, dokumenterat här och i min worklog-
rad; spegelbilden av omgång 3:s race nr 4. Min append var idempotent
(skip befintlig ticker) och trampade ingen.

## KVD-bevis

- **Kontraktstest + läckagevakt 0**: `tsx verktyg/testa-dataset-aspekter.mjs`
  (projekt-nära tsx-binär ur npx-cachen, ALDRIG npx) = GRÖNT 0 fel,
  **163 sidkontroller** (162→163: nya aspektsidan ovan), 30 varningar
  samtliga pre-existerande i nyckeltal-pe-pb (failar ej). Läckagevakten
  läser universumet dynamiskt (119 namn/tickers förbjudna) — 0 träffar.
- **Kvartiler + universumjämförelse**: verifierade via lasBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = 0 fel.
- **prod 200**: `/`, `/dataset`, `/dataset/teknik`,
  `/api/data/nyckeltalsguide` = 200 (loopback).
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd
  (inget bygge — ren dataleverans); allt är utbildningsdata med
  disclaimers enligt A2-kontraktet §5.

## Känd flagga (ärvd, ej min att lösa)

s1-u3:s flagga 2: fältnamnen `*CAGR5ar` bär "5 år"-etiketten men
serierna (hela universumets konvention, även mina tre rader) omfattar
4 räkenskapsår med endpoint-CAGR över 3 årssteg. Fältbytning kräver
src/-ändringar över hela datasetlagret = huvudagentens beslut. BHP:s
rad tillför dessutom juli–juni-åren (etiketter = slutår, noterat i
raden) — första universumsraden med brytdningsår, explicit förklarat.

## Filägarskap

- Exklusiva: data/forskning/S2-U3-TEKNIK-MATERIAL-TILLVAXT-UTOKNING-OMG4.md
  (denna), /tmp-skript (/tmp/s2u3omg4-lagg-till.mjs, /tmp/s2u3omg4-mat.ts,
  /tmp/s2u3omg4-llms.mjs).
- Delade (read-modify-write/regenererad): data/portfolj-system/
  bolagsunivers.json (mina TSM/BHP/MELI + syskonets BAS.DE enligt
  Koordinering), public/llms.txt (min 119-harmonisering), worklog.md
  (append).
