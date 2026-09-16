# S2-U3 (auto-s2 omgång 6) — +3 citeringsmagneter: ASML, Rio Tinto, Coca-Cola

Fabriksagent s2-u3 (manifest auto-s2, position 3/3), 2026-09-16 ~14:5x–15:0x.
Spår 2 — DATASET-DJUP. Uppgift: "+3 bolag, kvartiler + universumjämförelse,
läckagevakt 0, prod 200".

## Objektval (inga duplikat) + PIVOT under fönstret (race-fall 10)

Kollisionskontroll före start mot universumfilen (126 rader), worklog och
git log: omgång 1 tog energi, omgång 2 Spotify/Skanska/Evolution, omgång 3
Volvo/EQT/Axfood, omgång 4 TSMC/BHP/MELI, omgång 5 URW/Pfizer/Airbnb;
syskonen omgång 5 Novartis/Visa (u2) och Allianz (u1). Förstaval: ASML
(teknik), Siemens (industri), Coca-Cola (konsument) — teknik/industri stod
på delad minimitäckning 12, samtliga fria i 126-listan.

**PIVOT**: mellan min kollisionskontroll och mitt append-fönster landade
syskonet s2-u1:s ocommittade SIE.DE-rad (deras protokoll S2-U1-SIEMENS-
INDUSTRI-UTOKNING-OMG6.md i trädet; universum 126→127). Min idempotensguard
skip:ade SIE.DE — min Siemens-rad skrevs ALDRIG (0 spår i filen; deras rad
kvarstår orörd, siffervirtuellt identisk med min förberedda: två oberoende
hämtningar från samma källa samma dag = determinismen dubbelbevisad i
praktiken; deras peg 0,8439 mot min 0,84, övriga tal lika). Ersatt med
**Rio Tinto** (material) — också delad minimitäckning 12, också toppmagnet
(världens största gruvkoncern vid sidan av BHP), fri i 129-listan. Slutval:

| Bolag | Ticker | Bransch | Motivering |
|---|---|---|---|
| ASML Holding | ASML.AS | teknik | teknikbranschens saknade toppmagnet: världens ENDA EUV-litografileverantör (monopol-pedagogik i ren form) — bolaget alla AI-chip-resonemang citerar; universumets 5:e högsta ROIC 66,0 % och största börsvärde i omgångens bud (529,5 mdr €) |
| Rio Tinto | RIO | material | gruvsektorns andra jätte vid sidan av BHP; järnmalnscykeln + koppar-tillväxtbenet i EN rad — universumets tydligaste CAGR-fönster-läxa (2021-topp utanför fönstret, TTM-vändning inom); material på delad minimitäckning 12 |
| Coca-Cola | KO | konsument | världens mest kända varumärke, dividendkung-pedagogiken (60+ år av höjningar); koncentrat-modellen (brutto 61,9 %) + FCF-seriens fallgropa (IRS-engångsposten 2024) + beta 0,34 universums lugnaste rad |

Universum: 126 → 132 på disk = hela spårfamiljens omgång 6 (127 efter
s2-u1:s Siemens, 129 med deras commit e16c17d5 som tog mina ocommittade
ASML/KO i git — BASF-precedensen, dokumenterad av dem själva; 131 med
syskonet s2-u2:s ORCL/AIR.PA som landade ocommittade under mitt fönster
=race-fall 11; 132 med min RIO).

## Data (reell, källhärledd — StockAnalysis/S&P Global, hämtat 2026-09-16)

Alla tre raderna följer universumets konventioner exakt (omgång 3/4/5:s
mönster): 4 räkenskapsår, endpoint-CAGR, PEG = P/E ÷ prognosTillväxt i
procent, prognosTillväxt härledd ur trailing/forward-P/E, härledningar
dokumenterade per rad i `notering`. Live-hämtat denna session
(stockanalysis.com översikt + statistics + financials per bolag; ASML via
/quote/ams/-konventionen intraday 2026-09-16, KO + RIO close 2026-09-15).

- **ASML**: pris 1 419,00 EUR · börsvärde 529,53 mdr · P/E 50,07 (forward
  28,32 ⇒ prognos **+76,7 %** — AI-cykelns normaliseringsprognos: trailing
  bär 2024–25-vändningen, forward normaliserar; källans 3-årsprognoser
  intäkt +25,7 %/EPS +40,1 % per år i samma riktning) · PEG 0,65 (källans
  3-års-PEG 0,98 som not) · P/B 24,26 · EV/EBIT 41,08 (teknikradens högsta
  — priset på monopolstatus, EV under mcap) · ROE 53,94 % · ROIC 65,98 %
  (universums 5:e högsta efter SPOT/AAPL/Vår Energi/NVDA) · brutto
  52,7/EBIT 35,4/netto 30,1/FCF 28,4 % · skuld/EK 0,09 med NETTOKASSA
  5,6 mdr € · utdelning 7,50 € ≈ 0,5 % (payout 28,3 %) · serier EUR
  (omsättning 21 173→27 559→28 263→32 667 M€ = +15,56 %/år; resultat
  5 624→7 839→7 572→9 609 M€ = +19,55 %/år) · FCF-serie ifylld med
  2023-dipp-not (7 205/3 288/9 099/11 085 M€ — arbetarkapital-cykeln, ej
  lönsamhet) · fcfYield 1,90 %.
- **Rio Tinto**: pris 97,26 USD · börsvärde 164,51 mdr · P/E 13,59 (forward
  11,89 ⇒ prognos **+14,3 %**; källans 3-årsprognos EPS +7,8 %/år) · PEG
  0,95 (källans PEG-fält n/a — noterat) · P/B 2,29 · EV/EBIT 11,18 · ROE
  19,31 % · ROIC 14,60 % mot källans WACC 7,31 % (värdeskapande marginal —
  Siemens-notens spegelbild i samma omgång) · brutto 29,8/EBIT 26,7/netto
  19,6/FCF 9,0 % (brutto = gruvbranschens strukturnivå, BHP-notens
  branschreservation) · skuld/EK 0,32, nettoskuld 13,3 mdr $ · utdelning
  4,61 $ ≈ 4,7 % (payout 62,5 % — gruvkonventionen 40–60 % av cykelresultatet,
  payouten strax över taket på TTM-vändningen) · dual-listed (LSE + ASX;
  NYSE-ADR i USD med koncernrapportvaluta USD — BHP-konventionen, land
  Australien enligt BHP-radens mönster) · serier USD (omsättning
  55 554→54 041→53 658→57 638 M$ = +1,24 %/år; resultat 12 392→10 058→
  11 552→9 966 M$ = −7,01 %/år — CAGR-FÖNSTER-LÄXAN: 2021-toppens 21,1 mdr $
  resultat faller utanför fönstret medan TTM vänder +15,0 % omsättning/
  +17,8 % resultat; endpoint-tal svaga, TTM viker uppåt) · FCF-serie med
  KAPEX-CYKEL-not (9 384→8 074→5 978→4 497 M$ fallande medan resultatet
  håller 10–12 mdr $ — investeringstakten äter kasstätheten; fcfYield
  3,36 %).
- **Coca-Cola**: pris 88,71 USD · börsvärde 381,68 mdr · P/E 26,66 (forward
  26,11 ⇒ prognos **+2,1 %** — mogen dividendlärobok; källans 3-årsprognos
  EPS +8,1 %/år till stor del återköpsdriven) · PEG 12,64 enligt
  spårkonventionen (källans 3-års-PEG 3,53 som not — PEG straffar mogna
  utdelningsbolag, själva pedagogiken) · P/B 10,56 (återköpskrympt eget
  kapital — substans meningslös, ABNB-notens släkt) · EV/EBIT 25,66 · ROE
  42,05 % · ROIC 20,10 % · brutto 61,9/EBIT 31,9/netto 28,6/FCF 28,5 % ·
  skuld/EK 1,16 (total skuld 44,3 mdr $ mot kassa 16,4 — nettoskuld 27,9
  mdr bärs av kassaflödets stabilitet; skuld/EBITDA 2,5) · beta 0,34
  (universums lugnaste rad) · utdelning 2,12 $ ≈ 2,4 % (payout 63,7 %;
  60+ år av höjningar, källan visar +4,2 % senaste året) · serier USD
  (omsättning 43 004→45 754→47 061→47 941 M$ = +3,69 %/år; resultat
  9 542→10 714→10 631→13 107 M$ = +11,17 %/år) · FCF-serie ifylld med
  FALLGROPPA-not (9 534/9 747/4 741/5 296 M$ mot TTM 14 297 M$ — IRS-
  skadeståndet 6,0 mdr $ betalades 2024 i kashtäthet; fcfYield 3,75 % och
  fcf-marginal 28,5 % är TTM-normaliserade, PFE-notens spegelbild).

Aritmetiken maskinverifierad EFTER append (node): CAGR, prognosTillväxt,
PEG omräknade ur radernas egna tal — GRÖN för alla tre (9/9 kontroller).

## Medianeffekter (projektets EGEN raknaBranschMedianer, tsx)

Två mätningar: (1) FÖRE skrivning i processminnet på 126-läget + exakt
append-objekt (teknik/industri/konsument/totalt — industritabellen bygger
på en Siemens-rad siffervirtuellt identisk med s2-u1:s inflyttade rad,
verifierad fält för fält); (2) efter pivoten mot verkliga filen (129→130
för material/totalt).

| Mått | Före (126) | Efter (132 — hela omgång 6, slutfönstret mätt mot verkliga filen) |
|---|---|---|
| Totalt median P/E | 20,5 (n=117) | **21,2 (n=123)** — universummedianen RÖR SIG för första gången sedan omgång 2: omgångens sex nya magneter (50,1/25,9/26,7/13,6/22,0/25,9) mot medianen drar upp 0,7 (måttbart: n 117→123) |
| Totalt EBIT-marginal | 21,2 % (n=125) | **21,9 %** (n=131) · totalt FCF 11,8 % (n=122 — ORCL/AIR:s lägre fcf-marginaler håller kvar) · P/B 2,8 oförändrad (n=124→130) · tillväxt 6,6 % (n=132) |
| Teknik P/E (min ASML + syskonets ORCL) | 27,9 (19,9–37,5, n=12) | **27,9 (20,8–37,8, n=14)** — ORCL drar tillbaka ASML:s medianlyft; teknik-EBIT 24,4→**29,9 %** (ASML 35,4 + ORCL bär), teknik-tillväxt 14,7 % oförändrad, P/B 6,4→6,7 |
| Industri P/E (syskonens SIE + AIR.PA) | 28,0 (18,2–35,8, n=12) | **26,9 (20,0–33,7, n=14)** — två nya rader smalnar kvartilerna; P/B 4,9 kvar, FCF 10,8 % kvar |
| Material P/E (min RIO) | 18,8 (14,9–21,2, n=11) | **18,7 (14,0–20,9, n=12)** — RIO drar median ett hack ned och P25 ned 0,9 |
| Material FCF-marginal (min RIO) | 6,5 % | **7,5 %** · material-tillväxt 3,8→**6,4 %** (RIO:s TTM +15,0 % lyfter branschbilden) · EBIT 9,7→9,8 % |
| Konsument P/E (min KO) | 20,4 (17,5–22,4, n=12) | **21,2 (18,1–22,5, n=13)** — KO lyfter median 0,8 och båda kvartilerna; EBIT 14,6→**15,0 %**, FCF 9,3→**10,1 %**, tillväxt 0,9→**1,2 %**, P/B 3,9→4,1 |

Kvartiler + universumjämförelse behövs INTE byggas manuellt: hela
datasetlagret räknas ur bolagsunivers.json — nya rader flödar automatiskt in
i medianer, kvartiler och universumjämförelser på /dataset-sidorna vid nästa
prod-bygge. Tre nya /bolag-sidor (asml-as, rio, ko) + sitemap-poster föds
samma bygge (Vonovia-precedensen). Aspekt-effekt av MINA rader: INGEN ny
aspektsida — före/efter-mätningen av ALLA 15 aspektmattor × berörda
branscher visar inga 4→5-trösklar. RÄTTES efter KVD-omkörning: totala
sidkontroller 164→165 — den nya sidan är syskonets ORCL som öppnade
teknik/USA-LANDASPEKTEN (USA/teknik-mattan 4→5; land-mattorna låg utanför
min 15-fältsmatris som bara mätte mina tre länders branscher — läxa:
landaspekterna kräver full landsvep i nästa omgångs mätning). Land-mattor:
Australien×material 1→2 (BHP får sällskap), Tyskland×industri 0→1 (s2-u1:s
Siemens = universumets första tyska industrirad), Nederländerna×teknik 1→2,
USA×konsument 3→4 — ingen ytterligare publiceringströskel.

## llms.txt

`public/llms.txt` dataset-block regenererat ur projektets EGEN kodväg
(lasBranschMedianer + aspektmodulens generera('finans'), omgång 4:s skript
återanvänt orättat): rader speglar 132-läget, totalt median P/E 21,2
(n=123) — detta är självläkningen s2-u1:s commit 095dcf8a bokförde som
väntad (deras llms-block speglade 127; /llms.txt servas dessutom dynamiskt
och visade redan 129/21,2 live). Finans-aspektradens "universumets lägsta
datatäckning"-klausul styrs av databeräkningen (tillväxt n=6 lägst).
llms-full.txt saknar dataset-sektion = orörd.

## Koordinering (delat träd — race-fall 10, spårfamiljens 10:e)

Race-fall 10 och 11 bokförs här. FALL 10: s2-u1:s Siemens-rad landade
ocommittad i luckan mellan min kollisionskontroll (universum 126, SIE.DE
fri) och mitt append-fönster. Min idempotensguard skip:ade SIE.DE (min rad
skrevs aldrig — deras kvarstår orörd); jag pivoterade till Rio Tinto enligt
s2-u2:s omgång 5-precedens (ABNB→Visa) FÖRE commit. FALL 11: under mitt
slutfönster landade ytterligare ett syskons (s2-u2:s) ORCL + AIR.PA
ocommittade (universum 129→131) — deras rader lämnade orörda; om min commit
är först tas de i git av min git add (BASF-precedenten, ägarskap ORCL/
AIR.PA = s2-u2, dokumenterat här och i worklog; är deras commit först blir
min diff bara RIO + llms + dokumentation — båda utfallen förlustfria,
körningarna idempotenta). s2-u1 hann committa under fönstret (e16c17d5 +
095dcf8a): deras commit tog mina då ocommittade ASML/KO i git — BASF-
precedenten, dokumenterad av dem själva i deras commit-meddelande. Race-
disciplinen i övrigt följd EXAKT (s2-u1 omgång 5-läxan): mätning i
PROCESSMINNET, protokoll + worklog + commitmsg skrivna FÖRST, append + llms
+ git add + commit i ETT tight fönster. llms harmoniseras av siste
commit-med-regeneration (kedjan själv-läkar — denna gång är min 132-block-
regeneration läkaren för u1:s 127-block).

## KVD-bevis

- **Kontraktstest + läckagevakt 0**: `tsx verktyg/testa-dataset-aspekter.mjs`
  (cachad tsx-CLI ur npx-cachen, ALDRIG npx) = GRÖNT 0 fel, **165
  sidkontroller** (KVD-omkörning efter commit; 0 nya från mina rader — den
  nya sidan är ORCL:s USA/teknik-landaspekt, se rättes ovan), varningar
  samtliga pre-existerande ('billig'-orden, failar ej). Läckagevakten läser
  universumet dynamiskt — **132 namn/tickers förbjudna, 0 träffar** i
  sidornas JSON-utdata (gränsdragningen A2-kontraktet §1) — körd på
  132-läget (universumet läses dynamiskt). v98-dataset-vakt
  (läckagevakt mot BYGGDA sidor) kräver `next build` = prod-synkens ägande,
  väntar nästa byggande slag (BASF-precedensen).
- **Kvartiler + universumjämförelse**: verifierade via raknaBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **Aritmetik**: CAGR/prognosTillväxt/PEG omräknade ur radernas egna tal
  efter append, 9/9 GRÖN.
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = 0 fel (src/
  orörd — ren dataleverans, ingen kod ändrad; grinden verifierar vid commit).
- **prod 200**: `/`, `/dataset`, `/dataset/teknik`, `/dataset/material`,
  `/dataset/konsument`, `/api/data/nyckeltalsguide` = 200. Servade dataset-
  sidor visar 126-tal tills nästa prod-bygge (Vonovia-precedensen — byggen
  ägs av prod-synken).
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd
  (inget bygge); allt är utbildningsdata med disclaimers enligt
  A2-kontraktet §5.

## Ärvda flaggor (kvarlive, ej mina att lösa)

1. `*CAGR5ar`-fältnamnen bär "5 år"-etiketten men serierna omfattar 4
   räkenskapsår med endpoint-CAGR över 3 årssteg (s1-u3:s flagga 2 — gäller
   nu 132 rader). Fältbytning = src/-ändring = huvudagentens beslut.
2. Siemens (s2-u1) + BHP + Visa = tre rader med avvikande bokföringsår — om
   dataägaren vill ha en explicit FY-etikett per rad i stället för
   noteringstext är de testfallen.
3. Universummedian-P/E:s rörelse (20,5→21,2) gör llms-radens
   universumjämförelsetext tidsläge-känslig — automatiskt korrekt via
   kodvägen, men vär att notera vid nästa harmonisering.

## Filägarskap

- Exklusiva: data/forskning/S2-U3-TEKNIK-MATERIAL-KONSUMENT-UTOKNING-OMG6.md
  (denna), /tmp-skript (/tmp/s2u3omg6-nya.mjs, -lagg-till.mjs, -mat.mjs,
  -mat2.mjs; llms-skriptet /tmp/s2u3omg4-llms.mjs återanvänt orört).
- Delade (read-modify-write/regenererad): data/portfolj-system/
  bolagsunivers.json (mina ASML.AS/RIO/KO; s2-u1:s SIE.DE lämnad orörd —
  ägarskap deras, tas i git av vems commit som först träffar trädet),
  public/llms.txt (min 130-harmonisering), worklog.md (append).
