# S2-U3 (auto-s2 omgång 9) — +3 citeringsmagneter: Attendo, Gränges, Tencent

Fabriksagent s2-u3 (manifest auto-s2-1789627527499, position 3/3), 2026-09-17.
Spår 2 — DATASET-DJUP. Uppgift: "+3 bolag, kvartiler + universumjämförelse,
läckagevakt 0, prod 200". Anspråk: data/vakten/auto-s2-1789627527499-u3-ansprak.md
(skrivet FÖRE arbete, ombokat två gånger ärligt — se Racet).

## Objektval + racet (spårfamiljens race nr 14)

Startläge 144 (HEAD 8f74f9ca). MÅTTA-4-STRATEGIN: omgångens analys av
(land × bransch)-cellerna på P/E-matta 4 (omg8:s RÄTTES-läxa: landsidor
publiceras vid P/E-matta ≥ MIN_MATTA = 5, aldrig bolagstal — land.ts:159
`if (pe.matta < MIN_MATTA) return null` läst och verifierad i koden) fann FYRA
celler på matta 4: Sverige/hälsa (EKTA-B null), Sverige/material (BILL null),
Sverige/kommunikation (VPLAY-B null) + Sverige/konsument (redan över via
syskonen) — tre av dem kan öppnas med +1 rad med MÄTT P/E vardera.

Originalval (anspråk v1): Karo Healthcare + Gränges + Bredband2. Källkontrollen
fällde två av tre: stockanalysis saknar KARO.ST (deras KARO = Karooooo,
Nasdaq-US) och BRD-B.ST (404 på slug-varianterna GRNG/GRNG-B/BRD/BRD-B/BRDB/
BREDBAND2/st-vs-sto); Yahoo quoteSummary = 429 hela fönstret (crumb-flödet
provat, fortfarande 429 — server-IP:n rate-limitad). STO-täckning hos källan
verifierad positivt på SOBI/AZN/ATT/AMBEA/HUM/SINCH/GRNG (suffixlös slug).
Anspråk v2: Attendo + Gränges + BABA (landöppnare, s2-u2 omg8:s koordinat).

**Racet under datafönstret:** u2 committade 707b4cdd (MBG.DE+BMW.DE,
Tyskland/konsument 0→2) och u1 committade 1a125ebf (**BABA** — de läste mitt
anspråk, såg "u3 tar landscaping-cellerna" och tog den utlämnade
Kina-koordinaten; deras bokföring: "BABA = u3:s utlämnade Kina-koordinat").
Min färdigbyggda BABA-rad blev duplikat — ALDRIG inlagd (idempotens +
läs-efter-commit). Tredje slaget ombokades till **TCEHY** (BABA/Tencent-
koordinatens andra halva, Kina/teknik 0→1). Sverige/kommunikation-mattan
kunde INTE öppnas (Bredband2 = enda svenska kommunikationsbolaget utanför
universumet men utan källtäckning) — koordinaten kvarstår till nästa omgång,
noterad åt dataägaren: alternativ källa krävs (Yahoo-täckning konstaterad i
100-basen men rate-limitad från servern just nu).

| Bolag | Ticker | Bransch | Land | Cell P/E-matta | Effekt |
|---|---|---|---|---|---|
| Attendo | ATT.ST | hälsa | Sverige | 4→5 | **NY LANDASPEKTSIDA /dataset/halso/sverige** |
| Gränges | GRNG-B.ST | material | Sverige | 4→5 | **NY LANDASPEKTSIDA /dataset/material/sverige** |
| Tencent | TCEHY | teknik | Kina | 0→1 | Kinas andra rad (BABA+TCEHY-paret); ingen sida (matta 1) |

## Data (reell, källhärledd — StockAnalysis/S&P Global, hämtat 2026-09-17)

Konventioner exakt som omgång 3–8: senaste 4 räkenskapsår i serier, endpoint-CAGR,
PEG = P/E ÷ prognosTillväxt i procent (spårkonventionen), prognosTillväxt härledd
ur trailing/forward-P/E, fcfYield = TTM-FCF/mcap, moat ifyllt när källan levererar
årlig bruttovinstserie (5 år när källan ger det). Alla tre raderna live-hämtade i
sessionen (översikt + statistics + financials + cash-flow-statement per bolag;
STO-bolagen close 2026-09-16 17:29 CET, TCEHY OTC-ADR close 2026-09-16).

- **ATT.ST**: pris 128,00 kr · börsvärde 18,06 mdr · P/E **19,25** (forward 16,05 ⇒
  prognosTillväxt **+19,9 %**; källans 3-års EPS-prognos +16,54 %/år som not,
  källans PEG n/a) · PEG 0,97 spårkonvention · P/B 3,41 · EV/EBIT 17,00 ·
  ROE 18,72 % / **ROIC 7,57 % mot WACC 6,88 % = +0,69 pp** · brutto 36,9 / EBIT
  10,3 / netto 5,1 / **FCF 14,3 % (fcfYield 15,0 %)** · skuld/EK **3,15**
  (skuld/EBITDA 5,28, räntetäckning 2,5×) · utdelning 1,80 kr (1,47 %, payout
  13,2 %) + **återköp 4,25 %/år** (aktieantalet −4,25 %/år, insider 16,3 %) ·
  beta 1,01 · **52-vägers +87,4 %** (RSI 69,8) · resultatCAGR **null — negativt
  startår** (netto −45 Mkr 2022; UBER/SPOT-precedensen) · oms 14 496→18 991 Mkr
  (+9,4 %/år), netto −45→813 Mkr (vändningsåren: norsk omstrukturering +
  bemanningsbrist → LO-us 2024–2025), FCF 1 165→2 657 Mkr fyra raka positiva ·
  **moat FYLLT: bruttomarginal 31,2–36,0 % fem år (medel 33,4 %, spread 4,8 pp)**
  · IFRS-16-pedagogiken i raden: EBITDA 7,5 % < EBIT 10,3 % (källans EBITDA
  efter leasingavskrivningar — vårdhemmens hyresavtal) medan FCF-marginalen 14,3 %
  visar hyresbetalningarna — ROE bär hävstången, ROIC-marginalen är trång:
  hävstångens och marginalens två sidor i EN rad · senaste rapport 2026-08-20
  (Q2), nästa förväntad november 2026 (obekräftad av källan).
- **GRNG-B.ST**: pris 166,00 kr · börsvärde 17,69 mdr · P/E **14,71** (forward
  11,99 ⇒ prognosTillväxt **+22,7 %**; källans 3-års EPS-prognos +18,36 %/år,
  källans PEG 1,21 som not) · PEG 0,65 spårkonvention · P/B 1,57 · EV/EBIT 13,27
  · ROE 11,56 % / **ROIC 9,02 % mot WACC 7,77 % = +1,25 pp** · brutto 25,9 /
  EBIT 5,6 / netto 3,7 / **FCF −1,1 % (TTM −366 Mkr — fcfYield −2,1 %)** ·
  skuld/EK 0,56 (skuld/EBITDA 2,39, räntetäckning 7,3×; Konin-låneboken:
  skuld 6,30 mdr mot kassa 0,89) · utdelning 3,40 kr (1,95 %, payout 29,0 %,
  4 år av höjningar +6,3 %/år) · beta 0,94 · 52-vägers +27,7 % · oms
  24 492→28 362 Mkr (+5,0 %/år endpoint MEN FY2025 +20,7 % — Konin-expansionen
  i full drift efter 2023 års −8,1 %: råvarucykeln dold i endpointen), netto
  700→1 015 Mkr (+13,2 %/år stabilt genom cykeln), **FCF 119→2 066→−836→581 Mkr**
  (kapitalcykeln: capex 613 Mkr mot OCF 247 Mkr TTM — ORCL/TM/BABA-familjens
  fjärde negativa FCF-rad, här expansions-capex) · **moat FYLLT: bruttomarginal
  27,6–32,6 % fem år (medel 29,9 %, spread 4,9 pp)** — råvaruvalsarens
  förädlingsmarginal: aluminiepriset passeras genom omsättningen (Holcim-
  radens 1,8 pp transportekonomi som spegelbild) · nästa rapport 2026-10-22 (Q3).
- **TCEHY**: pris 54,46 $ (OTC-ADR) · börsvärde 497,13 mdr $ · P/E **14,34**
  (forward 12,62 ⇒ prognosTillväxt **+13,6 % — Kina-radernas normala tal**
  mot BABAs +84,9 %-gap) · PEG 1,05 spårkonvention (källans n/a) · P/B 2,76 ·
  EV/EBIT 12,84 · ROE 19,91 % / **ROIC 18,27 % mot WACC 7,58 % = +10,69 pp**
  (BABA:s −3,33 pp:s spegelbild: plattformens moat utan capex-svällande molnbygge
  — capex 20,25 mdr $ mot BABA:s 23,12 med tre gånger EBIT-marginalen: 33,3 mot
  4,6 %) · brutto **56,7 %** / EBIT 33,3 / netto 29,9 / FCF 21,4 % (fcfYield
  5,0 %) · skuld/EK 0,39 (kassa 67,56 mot skuld 69,46 mdr $ — balanserad,
  räntetäckning 20,4×) · utdelning 0,60 $ (1,11 %, payout 17,7 %) + återköp
  1,10 %/år · beta 0,74 · 52-vägers −34,3 % (samma Kina-repricing som BABA
  −32,1 % — ADR-riskpremien som parnot) · **serier FY2022–2025 MCNY (ADR-
  konventionen: kurs/mcap USD, ekonomi CNY, kalenderår)**: oms 554 552→751 766
  (+10,7 %/år), netto 188 243→224 842 (+6,1 %/år med 2023-dippen 115 216 =
  investeringsvärderingar, inte drift), FCF 123→201→196→216 mdr CNY **fyra raka
  positiva** (BABA:s −49,9 samma ekosystem-täckning är kontrasten) ·
  **MOAT-RESAN: bruttomarginal 43,9 → 43,1 → 48,1 → 52,9 → 56,3 % fem raka år
  (medel 48,9 %, spread 13,2 pp — universumets STÖRSTA dokumenterade
  moat-spridning: WeChat-ekosystemets mixresa spel→annonser/moln med
  take-rate-höjning; Microsofts 67,9 % ligger över men på plantå — Tencent
  KLÄTTRAR)** · nästa rapport 2026-11-11 (Q3).

Aritmetiken maskinverifierad efter radbygget (node, /tmp/s2u3o9-radbygg.mjs):
CAGR, prognosTillväxt, PEG, fcfYield, fcfMarginal, moat medel/spread,
mcap/netto-identiteter — **28/28 GRÖN** (första körningen rötte på en felaktig
handkontroll: TCEHY P/E-identiteten är mcap/netto 497,13/34,67 = 14,34, inte
pris/avrundad-ADR-EPS 54,46/3,75 = 14,52 — maskinen rättade handen,
omg8-mönstret igen).

## Medianeffekter (projektets EGEN raknaBranschMedianer, tsx)

Mätt i PROCESSMINNET (före = committade 147-läget med syskonens MBG/BMW/BABA;
efter = +ATT/GRNG/TCEHY = 150).

| Mått | Före (147) | Efter (150) |
|---|---|---|
| Totalt median P/E | 21,2 (n=138) | **20,5 (n=141)** — tre rader på/under medianen (19,25/14,71/14,34) drar ned 0,7: omgångens största totalförskjutning på spåret sedan Vonovia |
| Totalt övrigt | P/B 2,8 · EBIT 21 % · FCF 12 % · tillv 6,8 % | P/B 2,8 · EBIT 20,8 % · FCF 12,1 % · tillv 6,8 % |
| Hälsa P/E | 27,4 (21,9–38, n=14/15) | **24,8 (20,4–37,4, n=15/16)** — ATT drar medianen −2,6 och P25 −1,5 (vårdens lågmultipel mot biotech-cellen); P/B 5,3→**4,4** (ATT:s 3,41); EBIT 29,2→27,7 |
| Material P/E | 18,8 (14,1–21,8, n=13/14) | 18,7 (14,3–21,5, n=14/15) — GRNG mitt i spannet; P/B 1,4→1,5 · EBIT 11,1→**9,8** (GRNG:s 5,6 drar ned) · **tillv 3,8→6,4 %** (GRNG:s TTM +22,7 lyfter) |
| Teknik P/E | 27,9 (20,8–37,8, n=14/14) | 27,8 (19,4–37,6, n=15/15) — TCEHY under P25 drar nedre kvartilen; **EBIT 29,9→32,2 %** (TCEHY:s 33,3) · FCF 6,5→7,0 · tillv 14,7→13,5 |

Kvartiler + universumjämförelse behöver INTE byggas manuellt: datasetlagret räknas
ur bolagsunivers.json — nya rader flödar automatiskt in i medianer, kvartiler och
universumjämförelser på /dataset-sidorna vid nästa prod-bygge (Vonovia-precedensen).
Tre nya /bolag-sidor + sitemap-poster föds samma bygge, data-drivet via
aspektParametrar().

## Landaspekter — matta-4-strategin infriad

Fullt landsvep med den RIKTIGA gränsregeln (omg8-läxan):
`u.filter(r => r.land===L && r.bransch===B && isFinite(r.vardering?.pe)).length >= 5`:

- **Sverige/hälsa: matta 4→5 (AZN 24,6 · CEVI 30,0 · GETI-B 24,8 · SOBI 111,1 +
  ATT 19,25) ⇒ /dataset/halso/sverige PUBLICERAS vid nästa bygge** — omg8:s
  koordinat infriad (EKTA-B:s null-P/E håller inte längre sidan stängd).
- **Sverige/material: matta 4→5 (BOL 12,4 · HOLM 18,8 · SCA 36,5 · SSAB 18,5 +
  GRNG 14,71) ⇒ /dataset/material/sverige PUBLICERAS** — skogs- och
  gruvmattan får sitt första landsdjup.
- Sverige/kommunikation: matta 4 (VPLAY-B null) — **kvarstår som koordinat**:
  Bredband2 utan källtäckning (se Racet); enda övriga svenska
  kommunikationsbolag utanför universumet.
- Kina/teknik 0→1 (TCEHY; BABA öppnade landet i konsument samma dygn — u1:s äga).
- Kvar på matta 3 efter omgången: Sverige/teknik, USA/industri, Norge/energi,
  USA/energi (alla behöver +2 för sida). Nästa omgångs koordinater:
  Sverige/kommunikation 4 (om källa för Bredband2 finns) annars 3:orna.

## llms.txt

`public/llms.txt` dataset-block regenererat ur projektets EGEN kodväg
(lasBranschMedianer + aspektmodulens generera, omg6-skriptet återanvänt
orättat): rader speglar 150-läget, totalt median P/E 20,5 (n=141), manuella
aspektraden /dataset/finans/resultat-cagr-5ar med tal ur generera("finans").
llms-full.txt bär ej dataset-blocket (oförändrat).

## Koordinering (delat träd)

Syskonen s2-u1 (BABA, 1a125ebf) och s2-u2 (MBG.DE+BMW.DE, 707b4cdd) committade
under mitt datafönster — universum 144→147, arbetskopia == HEAD == ren vid min
append. Race-disciplinen följd EXAKT: mätning i PROCESSMINNET, protokoll +
worklog + commitmsg skrivna FÖRST, append + llms + git add + commit -o -F i ETT
tight fönster. Append idempotent (skip befintlig ticker) + strukturanpassad
(9 nyckelplaner × 3 rader == SOBI-referensen) + syskonintegritetskontroll
(MBG.DE/BMW.DE/BABA/SOBI/GETI-B närvarande efter skrivning).

## KVD-bevis

- **Kontraktstest + läckagevakt 0**: `tsx verktyg/testa-dataset-aspekter.mjs`
  (cachad tsx-CLI ur npx-cachen, ALDRIG npx) = **GRÖNT 0 fel / 172
  sidkontroller / 30 kända varningar (pre-existerande)** — 170 + 2: matta-4-
  strategins två nya landsidor (halso/sverige + material/sverige) födds
  data-drivet; läckagevakten läser universumet dynamiskt — 150 namn/tickers
  förbjudna, 0 träffar i sidornas JSON-utdata (A2-kontraktet §1).
- **Kvartiler + universumjämförelse**: verifierade via raknaBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **Aritmetik**: 28/28 GRÖN (CAGR/prognos/PEG/fcfYield/fcfMarginal/moat).
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = 0 fel (src/ orörd;
  pre-commit-grinden verifierar).
- **prod 200**: /, /dataset, /dataset/halso, /dataset/material, /dataset/teknik,
  /api/data/nyckeltalsguide, /llms.txt mot localhost (middleware-whitelistad).
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd
  (inget bygge); allt är utbildningsdata med disclaimers enligt A2-kontraktet §5.

## Notiser till dataägaren

1. **Bredband2-gapet**: Sverige/kommunikation-mattan står på 4 — enda svenska
   kommunikationsbolaget utanför universumet saknar källtäckning hos
   stockanalysis (404 alla slugs) och Yahoo är rate-limitad från servern
   (429 trots crumb-flödet). Alternativ källa öppnar omgångens nästa sida.
2. **TCEHY moat-spridning 13,2 pp** = universumets största dokumenterade —
   bruttomarginalserien är en pedagogisk resurs i sig (mixresan).
3. **Negative-FCF-familjen** växer: ORCL · TM · BABA · nu GRNG (TTM −366 Mkr,
   expansions-capex Konin) — fyra rader, tre orsaker (molnet, batteri-capex,
   AI-capex, valsverksexpansion).
4. Ärvda flaggor kvarstår: `*CAGR5ar`-fältnamn vs 4 år (nu 150 rader);
   prognosTillväxt-extremerna (BABA +84,9 tog u1; min omgång lade inget nytt
   extrem — TCEHY +13,6 är normaliseringsgap-listans mest normala Kina-rad).

## Filägarskap

- Exklusiva: data/forskning/S2-U3-ATTENDO-GRANGES-TENCENT-UTOKNING-OMG9.md
  (detta), data/vakten/auto-s2-1789627527499-u3-ansprak.md, /tmp-skript
  (s2u3o9-*).
- Delade (read-modify-write/regenererad): data/portfolj-system/bolagsunivers.json
  (mina ATT.ST/GRNG-B.ST/TCEHY; syskonens MBG.DE/BMW.DE/BABA orörda),
  public/llms.txt (min 150-harmonisering), worklog.md (append).
