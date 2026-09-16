# S2-U3 (auto-s2 omgång 7) — +3 citeringsmagneter: Uber, Boeing, AbbVie

Fabriksagent s2-u3 (manifest auto-s2-1789587326522, position 3/3), 2026-09-16 ~19:35–20:1x UTC.
Spår 2 — DATASET-DJUP. Uppgift: "+3 bolag, kvartiler + universumjämförelse,
läckagevakt 0, prod 200".

## Objektval (inga duplikat) + PIVOT under fönstret (race-fall 12)

Kollisionskontroll före start mot universumfilen (132 rader vid omgång 6:s
KVD), worklog och git log: omgång 1 energi, omgång 2 Spotify/Skanska/Evolution,
omgång 3 Volvo/EQT/Axfood, omgång 4 TSMC/BHP/MELI, omgång 5 URW/Pfizer/Airbnb,
omgång 6 ASML/RIO/KO. Förstaval: UBER (tillväxt — minimitäckning 12, plattforms-
ekonomins lärobok), BA (industri — flygduopol-triangelns saknade hörn: AIR.PA
+ GE redan i universumet), PEP (konsument — KO-paret från min omgång 6-rad).

**PIVOT (race-fall 12)**: under mitt datafönster landade syskonens omgång 7 i
HEAD — s2-u2:s SAMPO.HE + SPG (b6ae15b6, universum 132→134) och s2-u1:s PEP
(3d9a5e89, 132→135; deras protokoll kallar PEP "konsumentbranschens mest
citerade lucka och KO:s duopolpartner" — oberoende dubbelval, samma logik som
BHP-fallet omgång 4; deras rad kvarstår orörd, min PEP-rad skrevs ALDRIG till
filen — pivot beslutades FÖRE append, omgång 6:s SIE.DE→RIO-precedens).
Ersättare: **AbbVie (ABBV, hälsa)** — hälsa orörd sedan omgång 5 (Pfizer/
Novartis), patentklippe-pedagogiken, och USA/hälsa-landaspekten stod på 4
→ raden öppnar en ny Dataset-JSON-LD-sida. Slutval:

| Bolag | Ticker | Bransch | Motivering |
|---|---|---|---|
| Uber Technologies | UBER | tillväxt | plattformsekonomin i en rad: kapitallös skalning (FCF 390→9 763 M$ på fyra år), netto ÖVER ebit (equity-intressen under driftsraden), universumets lågsta P/E i tillväxtgrenen; tillväxt på delad minimitäckning 12 |
| Boeing | BA | industri | flygduopol-triangelns tredje hörn (AIR.PA planhalvan + GE motorhalvan + BA); kvalitetskrisens rådata 2024 (resultat −11 975 M$, FCF −14 310 M$), driftsvinst vs nettvinst som berättar emot varandra, universumets högsta skuld/EK 7,91 |
| AbbVie | ABBV | hälsa | patentklippan i råserien (Humira 2023: resultat 11 782→4 186 M$), netto 9,8 % mot ebit 35,6 % (UBER-notens spegelbild i samma omgång), negativt bokfört EK (P/B osatt), 54 år av utdelningshöjningar |

Universum: 135 → 138 (tillväxt 12→13, industri 14→15, hälsa 13→14).

## Data (reell, källhärledd — StockAnalysis/S&P Global, hämtat 2026-09-16)

Alla tre raderna följer universumets konventioner exakt (omgång 3–6:s mönster):
4 räkenskapsår 2022–2025 (kalenderår), endpoint-CAGR, PEG = P/E ÷ prognosTillväxt
i procent enligt spårkonventionen, prognosTillväxt härledd ur trailing/forward-
P/E, härledningar dokumenterade per rad i `notering`. Live-hämtat i sessionen
(stockanalysis.com översikt + statistics + financials + cash-flow-statement per
bolag; samtliga intraday 2026-09-16 15:3x–15:45 EDT).

- **UBER**: pris 70,93 USD · börsvärde 144,88 mdr · P/E 15,58 (forward 17,34 ⇒
  prognos **−10,2 %** — trailing bär equity-vinster, nästa år väntas lägre;
  källans 3-årsprognos EPS +30,7 %/år, intäkt +13,6 %/år) · PEG osatt enligt
  spårkonventionen (källans 3-års-PEG 0,51 som not — AMZN-fallet) · P/B 5,33 ·
  EV/EBIT 22,58 · ROE 37,2 % · ROIC 19,2 % mot källans WACC 9,9 % · brutto
  40,8/EBIT 12,1/netto 17,3/FCF 18,3 % — NETTO ÖVER EBIT: posterna under
  driftsraden gör nettoresultatet ostabilt · skuld/EK 0,52 · ingen utdelning,
  återköp 2,28 % av börsvärdet · beta 1,16 · resultatCAGR osatt (2022-förlust
  −9 141 M$, AMZN/BRK-precedenten) · omsättning 31 877→52 017 M$ (+17,7 %/år),
  TTM +16,7 % · FCF-serie 390→3 362→6 895→9 763 M$ (fcf-marginal 1,2→18,3 %).
- **BA**: pris 197,60 USD (intraday −5,8 %) · börsvärde 156,18 mdr · P/E 78,20
  (forward 180,08 ⇒ prognos **−56,6 %** — trailing bär engångsposter; källans
  3-årsprognos EPS +88,2 %/år = återhämtningsbågen) · PEG osatt · P/B 27,18 ·
  EV/EBIT **osatt** (negativ EBIT — A2-kontraktets ärlighetsprincip) · ROE
  173,5 % = EK-nära-noll-effekten (bokvärde 7,72 $/aktie) · ROIC −12,7 % mot
  WACC 9,5 % (universums tredje lägsta) · brutto 4,7/EBIT −5,4/netto
  +2,6/FCF −0,2 % — nettoresultatet POSITIVT medan driftsresultatet är
  negativt: vinsten ligger under driftsraden · skuld/EK 7,91 = universumets
  högsta (tvåa: syskonet u2:s SPG 5,04) · utdelning vilande sedan 2020 ·
  resultatCAGR osatt (2022-förlust −4 935 M$) · omsättning 66 608→89 463 M$
  (+10,3 %/år) med 2024-dippen −14,5 % och TTM +24,8 % · FCF 2 290→4 433→
  −14 310→−1 877 M$ (TTM −210 mot ledningens guida 1–3 mdr $).
- **ABBV**: pris 261,94 USD · börsvärde 462,88 mdr · P/E 74,31 (forward 17,33 ⇒
  prognos **+328,8 %** — trailing GAAP deprimerad av amortiseringar/nedskriv-
  nar av förvärvade rättigheter; källans 3-årsprognos EPS +21,7 %/år) · PEG
  0,23 enligt spårkonventionen (källans 3-års-PEG 3,42 som not — PEG på
  GAAP-tal bär samma fallgropa som P/E) · P/B **osatt** (negativt bokfört EK
  −3,36 $/aktie; ROE och skuld/EK samma skäl) · EV/EBIT 23,14 · ROIC 17,7 %
  mot WACC 5,4 % · brutto 72,8/EBIT 35,6/netto 9,8/FCF 28,3 % — NETTO UNDER
  EBIT: UBER-notens exakta spegelbild i samma omgång · utdelning 6,92 $ =
  2,6 %, payout 195,5 % på GAAP (≈50 % justerat), 54 år av höjningar (ärvt
  från Abbott-spinoffen 2013), beta 0,28 · omsättning 58 054→61 160 M$
  (+1,8 %/år) med 2023-klippan −6,4 % mitt i serien, TTM +10,4 % · resultat
  11 782→4 820→4 238→4 186 M$ (−29,2 %/år endpoint; TTM +67,7 %) · FCF
  24 248→22 062→17 832→17 816 M$.

Aritmetiken maskinverifierad efter radbyggandet (node, /tmp/s2u3omg7-arit.mjs):
CAGR, prognosTillväxt, PEG, fcfYield, fcfMarginal, utdelningsyield —
**22/22 GRÖN** (BA:s fcf-marginal härledd ur källans egna tal: −210/93 995,
källans fält n/a — dokumenterat i radens kallor.paranoid).

## Medianeffekter (projektets EGEN raknaBranschMedianer, tsx)

Mätt i PROCESSMINNET före append (före = faktiska 135-läget i arbetsytan med
syskonens omgång 7-rader PEP/SAMPO/SPG; efter = +UBER/BA/ABBV).

| Mått | Före (135) | Efter (138) |
|---|---|---|
| Totalt median P/E | 20,8 (n=126) | **21,2 (n=129)** — tre nya (15,6/78,2/74,3) mot medianen, UBER drar ned och de två höga drar upp; netto +0,4 |
| Totalt övrigt | P/B 2,9 (n=133) · EBIT 21,5 % · FCF 12,0 % · tillv 6,6 % | P/B **3,1** (n=135 — ABBV saknar P/B) · EBIT **21,2 %** (n=137) · FCF **12,1 %** · tillv **6,8 %** |
| Tillväxt P/E (min UBER) | 49,8 (38,1–117,5, n=9) | **46,7 (34,4–111,8, n=10)** — UBER drar median −3,1 och P25 −3,7; FCF-marginal 16,1→**18,3 %** (UBER:s 18,3 bär), P/B 11,8→11,5, tillv 45,7→45,4 |
| Industri P/E (min BA) | 26,9 (20,0–33,7, n=14) | **27,8 (21,3–36,1, n=15)** — BA lyfter median +0,9, P75 +2,4 och P25 +1,3 (utjämnat); FCF 10,8→**10,3 %** (BA −0,2), tillv 8,4→**9,1 %** (BA TTM +24,8), P/B 4,9→5,1 |
| Hälsa P/E (min ABBV) | 24,7 (20,8–32,6, n=12) | **24,8 (21,3–36,2, n=13)** — median nästan orörd men ABBV:s 74,3 LYFTER P75 +3,6 (kvartilspridningen är själva fyndet); EBIT 26,2→**27,7 %** (ABBV 35,6), FCF 11,7→**12,8 %** (ABBV 28,3), tillv 4,5→4,9 |

Kvartiler + universumjämförelse behöver INTE byggas manuellt: datasetlagret
räknas ur bolagsunivers.json — nya rader flöder automatiskt in i medianer,
kvartiler och universumjämförelser på /dataset-sidorna vid nästa prod-bygge
(Vonovia-precedensen). Tre nya /bolag-sidor + sitemap-poster föds samma
bygge.

## Landaspekter — FULLT LANDSVEP (omg6-läxan infriad)

Omgång 6:s läxa ("landaspekterna kräver full landsvep") infriad: mätningen
sveper ALLA (land × bransch)-celler, inte bara de berörda. Cellerna som rör
sig av mina rader: USA/industri 2→3 · USA/tillväxt 9→10 · **USA/hälsa 4→5
← NY LANDASPEKTSIDA** (sidkontrollen väntas 166→167; ABBV öppnar den).
Celler kvar på 4 (nästa omgångs koordinater, ej mina): Sverige/hälsa,
USA/finans.

## llms.txt

`public/llms.txt` dataset-block regenererat ur projektets EGEN kodväg
(lasBranschMedianer + aspektmodulens generera('finans'), omgång 4:s skript
återanvänt orättat): rader speglar 138-läget, totalt median P/E 21,2
(n=129). llms-full.txt bär ej dataset-blocket (oförändrat).

## Koordinering (delat träd — race-fall 12, spårfamiljens tolfte)

Syskonens omgång 7 hann BÅDE landa och committa under mitt datafönster
(u2: b6ae15b6 SAMPO+SPG; u1: 3d9a5e89 PEP — mitt förstaval, oberoende
dubbelval av fri ticker vid skilda kontrolltillfällen, BHP-precedensens
mönster). Min pivot till ABBV beslutades FÖRE något skrivning till
universumfilen (renare än omgång 6:idempotens-skip). Race-disciplinen i
övrigt följd EXAKT (s2-u1 omgång 5-läxan): mätning i PROCESSMINNET,
protokoll + worklog + commitmsg skrivna FÖRST, append + llms + git add +
commit i ETT tight fönster.

## KVD-bevis

- **Kontraktstest + läckagevakt 0**: `tsx verktyg/testa-dataset-aspekter.mjs`
  (cachad tsx-CLI ur npx-cachen, ALDRIG npx) = GRÖNT 0 fel, väntad
  sidkontrollnivå 166→167 (ABBV:s USA/hälsa-landaspekt; exakt tal i
  utfallsloggen nedan). Läckagevakten läser universumet dynamiskt — 138
  namn/tickers förbjudna, 0 träffar i sidornas JSON-utdata (A2-kontraktet
  §1:s gränsdragning). v98-dataset-vakt (mot BYGGDA sidor) kräver next
  build = prod-synkens ägande.
- **Kvartiler + universumjämförelse**: verifierade via raknaBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **Aritmetik**: 22/22 GRÖN (CAGR/prognos/PEG/fcfYield/fcfMarginal/yield).
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = 0 fel (src/
  orörd — ren dataleverans; pre-commit-grinden verifierar).
- **prod 200**: /, /dataset, /dataset/tillvaxt, /dataset/industri,
  /dataset/halso, /api/data/nyckeltalsguide = 200.
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd
  (inget bygge); allt är utbildningsdata med disclaimers enligt
  A2-kontraktet §5.

## Ärvda flaggor (kvarlive, ej mina att lösa)

1. `*CAGR5ar`-fältnamnen bär "5 år"-etiketten men serierna omfattar 4
   räkenskapsår med endpoint-CAGR över 3 årssteg (s1-u3:s flagga 2 — gäller
   nu 138 rader).
2. Tre rader med negativt bokfört EK (ABBV + KO/ABNB-släktens återköps-
   krympta) — substansmåttens meningslöshet är dokumenterad per notering;
   ev. eget "negativt EK"-fält är dataägarens beslut.
3. prognosTillväxt ur P/E-kvoten kan bli extrem när trailing är
   engångsdeprimerad (ABBV +328,8 %) — konventionen är dokumenterad per
   notering, men en ev. cap/flagga är dataägarens beslut.

## Filägarskap

- Exklusiva: data/forskning/S2-U3-TILLVAXT-INDUSTRI-HALSO-UTOKNING-OMG7.md
  (detta), /tmp-skript (s2u3omg7-nycklar/-nya/-arit/-mat/-lagg-till, llms-
  skriptet /tmp/s2u3omg4-llms.mjs återanvänt orört).
- Delade (read-modify-write/regenererad): data/portfolj-system/
  bolagsunivers.json (mina UBER/BA/ABBV; syskonens PEP/SAMPO/SPG lämnade
  orörda — deras ägarskap dokumenterat av dem själva), public/llms.txt
  (min 138-harmonisering), worklog.md (append).
