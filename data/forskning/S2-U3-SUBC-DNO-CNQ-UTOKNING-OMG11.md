# S2-U3 (auto-s2-1789651528300, byggare 3/3) — +3 citeringsmagneter: Subsea 7, DNO, Canadian Natural Resources

Fabriksagent s2-u3 omgång 11, 2026-09-17. Spår 2 — DATASET-DJUP. Uppgift:
"+3 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200". Anspråk:
data/vakten/auto-s2-1789651528300-u3-ansprak.md — skrivet FÖRE arbetet,
REVIDERAT v2 efter race (ärlighetsdoktrinen, omg10-mönstret).

## Objektval + racet

Startläge: universum 153 (HEAD f48759e8, omg10:s slutläge == llms == HEAD).
Originalval (anspråk v1): COP + SLB (USA/energi 3→5, omg10:s explicita
nästa-koordinat) + Norge-kandidat. Under källhämtningsfönstret landnade
syskonens appends i arbetskopian: s2-u2:s COP+SLB (deras anspråk
s2-u2-omg11-ansprak.md, identiska tickers ur omg10-notisen — deras rader
i filen = deras ägarskap enligt BASF-precedensen) och s2-u1:s RY (Kanada/
finans, universumets första Kanada-rad). Universum 153→156. Min append
var IDEMPOTENT: COP/SLB hoppades ("finns redan"), inget dubbellag —
vaktens design bevisad i skarpt läge.

**Reviderat val (anspråk v2) — alla tre i omg10:s energispår:**

| Bolag | Ticker | Bransch | Land | Cell P/E-matta | Effekt |
|---|---|---|---|---|---|
| Subsea 7 | SUBC.OL | energi | Norge | 3→5 (med DNO) | **NY LANDASPEKTSIDA /dataset/energi/norge** |
| DNO | DNO.OL | energi | Norge | 3→5 (med SUBC) | omg10:s namngivna kandidat, Kurdistan-cykeln |
| Canadian Natural Resources | CNQ | energi | Kanada | 0→1 | s2-u1:s EXPLICIT utlämnade koordinat ("LÄMNAS TILL SYSKONEN: CNQ") |

Norge/energi-koordinaten (AKRBP · EQNR · VAR + SUBC · DNO = 5 mätbara)
öppnar **/dataset/energi/norge** vid nästa prod-bygge — systersida till
s2-u2:s /dataset/energi/usa i samma publiceringsfönster: två nya
landsidor per bygge.

## Data (reell, källhärledd — StockAnalysis/S&P Global, hämtat 2026-09-17)

Konventioner exakt som omg3–10: 4 räkenskapsår i serier (endpoint-CAGR
över 3 år FY2022→FY2025), prognosTillväxt = trailing/forward-P/E − 1
(spårkonventionen), fcfYield = TTM-FCF/börsvärde, moat = 5 år bruttomarginal
(medel + spread). Rapportvaluta-precedensen (EQNR): SUBC och DNO är NOK-
noterade men rapporterar i USD — serier i USD, kurs/mcap/nettokassa i NOK;
CNQ är USD-noterad men rapporterar i CAD — serier i CAD, kurs/mcap i USD.
P/B härledd: SUBC/CNQ ur identiteten P/E × ROE, DNO ur pris ÷ källans
book value per share (9,86 NOK). EV/EBIT: EV = mcap ± nettokassa mot
TTM-EBIT (marginal × TTM-omsättning, valutaneutralt).

- **SUBC.OL**: pris 324,40 NOK (fördröjd OSL 15:08 CET) · börsvärde 95,42
  mdr NOK · P/E **15,79** (forward 12,59 ⇒ prognosTillväxt +25,4 %; PEG
  0,62 spårkonvention) · P/B 2,24 · EV/EBIT 9,15 · ROE 14,19 % / **ROIC
  16,66 % mot WACC 7,42 % = +9,24 pp** · brutto 18,4 / EBIT 13,7 / netto
  8,2 / FCF 23,1 % (fcfYield 17,1 % — universumets fjärde högsta) · skuld/
  EK 0,20, räntetäckning 13,8×, **NETTOKASSA 1,88 mdr NOK** · utdelning
  13,00 NOK (3,92 %, payout 98,9 % = cykeltoppens utdelning, +105 % höjd,
  3 år av tillväxt) · beta 0,60 · 52-vägers 180,10–358,20 · serier FY2022–
  2025 MUSD: oms 5 136→7 086 (+11,3 %/år endpoint), netto 57,1→411,4
  (+93,1 %/år ur cykelbotten 15,4 MUSD 2023), FCF 254,8→1 190 fyra raka
  positiva · **moat: brutto 6,1→15,6 % fem år (medel 9,3 %, spread 9,5 pp
  — universumets näst bredaste av 23 mätta)** · nästa rapport 2026-11-19.
- **DNO.OL**: pris 19,23 NOK (fördröjd OSL 15:14 CET) · börsvärde 19,26
  mdr NOK · P/E **25,34** (forward 5,44 ⇒ prognosTillväxt +365,8 % —
  **universumets yttersta extremvärde, slaget IVSO:s +54,0 %**; PEG 0,07
  spårkonvention, talet redovisas som GAPETS storlek, inte som prognos —
  källans konsensus ser EPS femdubblas) · P/B 1,95 (BVS 9,86 NOK) · EV/EBIT
  2,33 (börsvärde + nettoskuld 5,79 mdr NOK mot EBIT 10,752 mdr NOK —
  P/FCF ≈ 2,8, diskonteringen är politisk risk) · ROE 8,56 % / ROIC 6,25 %
  mot WACC 2,33 % = +3,92 pp · brutto 56,0 / EBIT 44,9 / netto 5,0 / FCF
  30,5 % (**fcfYield 36,1 % — universumets HÖGSTA**) · skuld/EK 0,83,
  räntetäckning 22,3× · utdelning 1,50 NOK (**8,26 %**, payout 161,1 % =
  utdelning över TTM-vinst, +14,3 % höjd, 4 år av tillväxt) · **beta −0,15
  — universumets FÖRSTA NEGATIVA beta** · 52-vägers 12,44–21,96 · serier
  FY2022–2025 MUSD: oms 1 377→1 474 (+2,3 %/år endpoint), netto 384,9→
  **−48,3 (FÖRLUST 2025 — resultatCAGR OSATT, SINCH-konventionen: endpoint
  på negativt slutår är meningslös)**, TTM juni 2026 vänder +76,7 MUSD med
  omsättning +63,9 % TTM efter Kurdistan-uppgörelserna · FCF 756,1→102,9
  fyra raka positiva · **moat: brutto 39,0–66,5 % fem år (medel 49,5 %,
  spread 27,6 pp — universumets bredaste med råge; näst bredaste 13,2)** ·
  insiders 13,3 % · nästa rapport 2026-10-29.
- **CNQ**: pris 50,22 $ (NYSE realtid 9:37 AM EDT) · börsvärde 103,66 mdr
  $ · P/E **12,66** (forward 13,00 ⇒ prognosTillväxt **−2,6 % — PEG OSATT,
  SAMPO-precedensen**: negativ prognostillväxt, källans konsensus ser
  svagt fallande EPS) · P/B 3,38 · EV/EBIT 14,32 · ROE 26,69 % / ROIC
  14,11 % mot WACC 8,49 % = +5,62 pp · brutto 51,6 / EBIT 25,8 / netto
  **26,3 % ÖVER EBIT-marginalen** (BABA/ABBV/TM-mönstret: finansiella
  poster och skatteeffekter) / FCF 21,6 % (fcfYield 6,7 %) · skuld/EK 0,43,
  räntetäckning 10,6×, nettoskuld 12,37 mdr $ · utdelning 1,78 $ (3,54 %,
  payout 44,9 %, **10 RAKA ÅR av utdelningstillväxt — universumets längsta
  aktiva svit**, +6,7 % senaste) + **aktieantal −1,10 %/år = äkta återköp**
  (buyback-yield 1,10 %) · beta 0,88 · 52-vägers 29,68–52,31 · serier
  FY2022–2025 MCAD: oms 42 298→38 762 (−2,8 %/år endpoint), netto
  10 937→10 820 (−0,4 %/år; FY2024-dippen 6 106), FCF 14 255→8 315 fyra
  raka positiva · moat: brutto 48,5–55,8 % fem år (medel 51,7 %, spread
  7,4 pp) · nästa rapport 2026-11-05.

Aritmetiken maskinverifierad efter radbygget (node, /tmp/s2u3o11-radbygg.mjs
+ /tmp/s2u3o11-append-v2.mjs): CAGR, prognosTillväxt, PEG, fcfYield, moat
medel/spread, P/B-identiteter, EV-kalkyler — kontrollblock GRÖNT; DNO:s
negativa slutår+dubbelkoll mot universumets konventioner (SINCH null /
SAMPO null / 24 negativa prognosTillväxter dokumenterade före besluten).

## Medianeffekter (projektets EGEN kodväg — kvartiler + universumjämförelse)

Byggda ur raknaBranschMedianer + buildLlmsTxt (src/lib/seo) — samma
räknesätt som /dataset-sidorna; diff mot syskonens 156-läge på disk:

| Mått | Före (156) | Efter (159) |
|---|---|---|
| Totalt median P/E | 20,5 (n=147 av 156) | **20,5 (n=150 av 159) — oförändrad trots +3** (CNQ 12,66 + SUBC 15,79 under, DNO 25,34 över medianen: nettonoll) |
| Energi P/E | 17,3, P25–P75 12–21,7 (n=14) | **17,0, P25–P75 12,7–21,9 (n=17)** |
| Energi övrigt | P/B 2,4 · EBIT 18 % · FCF 8,1 % · tillv 12 % | **P/B 2,3 · EBIT 18,1 % · FCF 10,5 % · tillv 13,6 %** (SUBC 23,1 + DNO 30,5 + CNQ 21,6 % FCF-marginal lyfter) |
| Universumjämförelserad | "median P/E 20,5 för samtliga 156" ×10 rader | **"…159" ×10 rader + aspektradens resultat-CAGR-n 119→121** (SUBC + CNQ; DNO null räknas ej) |

Kvartiler + universumjämförelse byggs INTE manuellt: datasetlagret räknas
ur bolagsunivers.json — nya rader flöder automatiskt in i medianer,
kvartiler och universumjämförelser på /dataset-sidorna vid nästa
prod-bygge (Vonovia-precedensen). Tre nya /bolag-sidor + sitemap-poster
föds samma bygge, data-drivet via aspektParametrar().

## Landaspekter — matta-kartan efter omgången

- **Norge/energi: matta 3→5 (AKRBP 17,0 · EQNR 11,6 · VAR 10,2 + SUBC
  15,8 · DNO 25,3) ⇒ /dataset/energi/norge PUBLICERAS vid nästa bygge** —
  tillsammans med s2-u2:s /dataset/energi/usa (deras COP+SLB) två nya
  energilandsidor i samma fönster. Kontraktstestets "Ej genererade"
  föll 6→5 (omg10-mått) — koordinaten nu över MIN_MATTA=5-gränsen;
  LIVE-sond: /dataset/energi/norge = 404 tills bygget (väntat).
- Kanada: 1→2 rader (u1:s RY + CNQ) — 17:e landet fördjupat direkt.
- Kvar på matta 3 efter omgången: Sverige/teknik (Fortnox/Sectra-
  källgapet står öppet), USA/energi stängd av u2. Nästa koordinater:
  Sverige/teknik kräver alternativ källa; Danmark/energi (Ørsted
  null-P/E) +1 mätbar öppnar Danmarks första energisida om kollega
  läggs till.

## llms.txt

Dataset-blocket regenererat ur projektets EGEN kodväg (buildLlmsTxt ur
src/lib/seo + kontraktets sammanfatta/sammanfattaUniversum för
aspektraden; tsx 4.23.13 ur npx-cachen, ALDRIG npx). Formatterings-
beviset: diffen mot syskonens 156-läge på disk är KIRURGISK — endast
energi-radens tal + antalsfält 156→159 + aspektradens n 119→121 ändrade;
övriga nio branschrader byte-identiska (kodvägens formattering, inte
handens). LIVE-verifierat: /llms.txt servar 159-blocket på port 3000
(public/ läses från disk — inget bygge krävs).

## KVD-bevis

- **Kontraktstest**: `tsx verktyg/testa-dataset-aspekter.mjs` = **GRÖNT
  0 fel / 175 sidkontroller / 30 kända varningar (pre-existerande,
  omg10-identiska)** · "Ej genererade" 6→5 = norge-koordinaten nu
  genererbar.
- **Läckagevakt 0**: `node verktyg/v98-dataset-vakt.mjs` = **GRÖN: 0
  träffar — 159 tickers + 159 namn sökta i 1 510 utdatafiler** (dataset-
  ytan ×3 språk + RSC + JSON-LD + llms Dataset-blocket + sitemap/robots).
- **Kvartiler + universumjämförelse**: verifierade via kodvägen (tabell
  ovan) — samma räknesätt som sidorna.
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**
  (src/ orörd — INGET bygge; pre-commit-grinden verifierar baslinjen).
- **prod 200**: /, /dataset, /dataset/energi, /api/data/nyckeltalsguide,
  /llms.txt — alla **200** mot localhost (middleware-whitelistad);
  /llms.txt bär 159-innehållet LIVE; /dataset/energi/norge 404 = väntar
  prod-bygget (data-driven födelse, Vonovia-precedensen).
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd;
  allt är utbildningsdata med disclaimers enligt A2-kontraktet §5.

## Notiser till dataägaren

1. **DNO:s gap-mått**: prognosTillväxt +365,8 % (PEG 0,07) är spår-
   konventionens artefakt vid djupt trailing/forward-gap (källans forward
   5,44 bygger på konsensus-EPS femdubbling); redovisas som gapstorlek.
   Ärvda flaggor kvarstår: `*CAGR5ar`-fältnamn vs 3 år endpoint (nu 159
   rader), prognosTillväxt-extremerna (IVSO +54,0 → DNO +365,8 ny topp).
2. **DNO beta −0,15** = universumets första negativa beta; paret
   CAT 1,59 / LMT 0,10 (omg10) får en tredje pedagogisk hörnsten.
3. **Utdelnings-pedagogiken i omgången**: payout-spektrat 44,9 % (CNQ,
   10 raka år) → 98,9 % (SUBC, cykeltopp) → 161,1 % (DNO, över TTM-vinst)
   — tre kapitalåterföringsregimer på tre energicykel-lägen.
4. **fcfYield-toppen**: DNO 36,1 % (P/FCF ≈ 2,8) — politisk risk
   prissatt; kursens budskap vs kassans budskap som Fallstudie.
5. SUBC/DNO/CNQ nästa rapporter: 2026-11-19 / 2026-10-29 / 2026-11-05 —
   kvartalspaketens FIFO-koordinater för spår 1.

## Filägarskap

- Exklusiva: data/forskning/S2-U3-SUBC-DNO-CNQ-UTOKNING-OMG11.md (detta),
  data/vakten/auto-s2-1789651528300-u3-ansprak.md (disk, ev. gitignorerad
  katalog), /tmp/s2u3o11-*.mjs|mts + verifierings-JSON.
- Delade (read-modify-write): data/portfolj-system/bolagsunivers.json
  (mina SUBC.OL/DNO.OL/CNQ; u1:s RY + u2:s COP/SLB orörda — elementvis
  prefix-bevis i appendskriptet), public/llms.txt (min 159-
  harmonisering), worklog.md (append).

## RACE-EPILOGEN (faktiskt utfall, bokförd enligt BASF-precedensen + omg10:s spegelbild)

Sekvensen: (1) mitt anspråk v1 (COP+SLB+Norge) skrevs utan synliga
syskonanspråk; (2) u1/u2:s anspråk + appends landade under mitt
källhämtningsfönster — universumfilen 153→156 med RY+COP+SLB, llms till
156 av u2; (3) min append (idempotent) hoppade COP/SLB, v2-pivot tog
SUBC+DNO+CNQ, llms omregenererad till 159; (4) medan protokollet skrevs
landnade u1:s 427b8d28 (universumfilen, 159 rader — bar MINA tre rader
innehållsintakta: SUBC.OL/DNO.OL/CNQ verifierade mot HEAD med exakt mina
värden) + u1:s 865aa764 (llms helregen på 159 — energi-P75 21,9 IDENTISK
med min oberoende körning: två körningar samma kodväg, samma utfall,
konvergens-beviset än en gång; deras notis-text "21,7" var en
avrundningsskriver i commitmeddelandet, filen rätt). ÄGOSKAP slutläge:
RY = s2-u1, COP+SLB = s2-u2 (deras rader, deras anspråk), SUBC+DNO+CNQ +
llms-159-innehållet = s2-u3 (författade här, burna av u1:s commits —
omg10:s exakta spegelbild: då bars mina stagade ytor av s3-u1; nu bars
mina av s2-u1). Denna doc-commit (protokoll + anspråk + worklog) gör
epilogen komplett; universum == llms == HEAD == 159.
