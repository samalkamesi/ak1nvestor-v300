# S2-U2 (fabrik, spår 2, byggare 2/3, omgång 11) — +2 citeringsmagneter: ConocoPhillips + SLB; USA/energi-koordinaten infriad

Datum: 2026-09-17 · Anspråk: data/vakten/s2-u2-omg11-ansprak.md (skrivet FÖRE
arbete). Uppgift: "+2 bolag, kvartiler + universumjämförelse, läckagevakt 0,
prod 200". Föregångare: omg 1–10 (senast omg10 IVSO+CAT+LMT, universum 153).

## Objektval

Omg10-protokollets utpekade nästa koordinat: "USA/energi (COP/OXY/EOG/SLB —
/stocks/ garanterad)". Matta-kartan mätt FÖRE arbete (153-läget): USA/energi
P/E-matta = 3 (CVX 20,4 · SHEL 10,3 · XOM 21,2) — ingen annan bransch×nyckeltal-
cell låg på matta 4 (fullsvep). Val: **ConocoPhillips (COP)** + **SLB
(Schlumberger)** — bägge /stocks/-täckta, fria i universumets 153 rader,
0 träffar i worklog. Motiv: (a) energi = tunnaste branschgrenen (13 rader);
(b) pedagogiken — XOM/CVX integrerade majorer + COP renodlad E&P-producent +
SLB oljeservice = TRE värdekedjeläger i samma USA-fållan (bruttomarginal-
kontrasten 47,6 % mot 17,0 % är färdig undervisning); (c) bägge toppsökta
citeringsmagneter. COP:s beta 0,13 mot SLB:s 0,77 blir energifållans
riskprofil-par (CAT 1,59/LMT 0,10-mönstret).

## Data (live-hämtat 2026-09-17, stockanalysis.com/S&P Global Market Intelligence)

Konventioner exakt som omg3–10: 4 räkenskapsår i serier, endpoint-CAGR,
PEG = P/E ÷ prognosTillväxt i procent (spårkonventionen), prognosTillväxt
härledd ur trailing/forward-P/E, moat ur 5-årig bruttovinstserie. US-close-
läge: kursen är sidans as-of 2026-09-17 09:15–09:22 EDT (marknad öppen).

- **COP**: pris 130,75 $ · börsvärde 157,07 mdr $ · P/E **17,61** (fwd 13,22 ⇒
  prognosTillväxt **+33,2 %** — marknadens vinståtergångsförväntan; källans
  3-års EPS-prognos +17,20 %/år som not) · PEG **0,53** spårkonvention
  (källans egen 1,02) · P/B **2,50** härlett P/E×ROE (internt konsistent) ·
  EV/EBIT **11,61** härlett (EV 172,67 mdr = mcap 157,07 + nettoskuld 15,60,
  mot EBIT TTM 14 877 M$) · brutto 47,57 / EBIT 23,08 / netto 14,40 / FCF
  15,61 % · fcfYield 6,32 % · ROE 14,18 % / ROIC 11,63 % · skuld/EK 0,36 ·
  beta **0,13** · utdelning 3,36 $ (2,57 %, payout 44,6 %) · 52-vägers
  85,57–141,62 · serier FY2022–2025 M$: oms 80 575→60 279 (**−9,2 %/år
  endpoint** — 2022 = Europas LNG-kris-topp), netto 18 620→7 961 (−24,7 %/år;
  TTM-svansen 9 253 = +1,1 % vändning), FCF 18 155→7 243 fyra raka positiva
  (capex 10,2→12,6 mdr = kapitalcykelns köl) · **moat FYLLT: brutto 46,2–49,2 %
  fem år (medel 48,5 %, spread 3,0 pp)** · Marathon Oil-förvärvet (nov 2024)
  syns i 2025-serien · nästa rapport 2026-11-05.
- **SLB**: pris 52,37 $ · börsvärde 77,72 mdr $ · P/E **25,36** (fwd 18,52 ⇒
  prognosTillväxt **+36,9 %** — cykelvändningsförväntan) · PEG **0,69** ·
  P/B **3,27** härlett · EV/EBIT **16,78** härlett (EV 86,41 = 77,72+8,69,
  EBIT TTM 5 150) · brutto 16,99 / EBIT 14,16 / netto 8,53 / FCF 12,04 % ·
  fcfYield 5,64 % · ROE 12,91 % / ROIC 11,59 % · skuld/EK 0,47 · beta 0,77 ·
  utdelning 1,18 $ (2,26 %, payout 57,2 %) · 52-vägers 31,64–60,46 · serier
  FY2022–2025 M$: oms 28 091→35 708 (+8,3 %/år — upptagningscykeln), netto
  3 441→3 374 (**−0,6 %/år endpoint**; TTM-netto 3 101 = −24,2 % —
  tjänstemarginallens svängrum), FCF 1 515→4 367 fyra raka positiva ·
  **moat FYLLT: brutto 16,0–20,7 % fem år (medel 18,7 %, spread 4,7 pp —
  cykeln syns i spannet)** · nästa rapport 2026-10-16.

Aritmetiken maskinverifierad i append-skriptet (/tmp/s2u2o11-append.mjs):
**32/32 GRÖN** — CAGR, prognosTillväxt, PEG, P/B-härledning, EV/EBIT-härledning,
moat medel/spread, marginalidentiteter mot TTM-serier, fcf-konsistens,
P/E-identitet (COP 17,36 mot källans 17,61 = 1,4 % avvikelse, källans
P/E-TTM-konvention dokumenterad; SLB 0,2 %), direktavkastning, serielängder.
Ett kontrollfel (fältstavning direct-/direktAvkastning ⇒ NaN) fångades av
kontrollblocket FÖRE skrivning och rättades — kontrollen gjorde jobbet.

## Medianeffekter (raknaBranschMedianer via tsx — kvartiler + universumjämförelse)

FÖRE = 153 (HEAD), EFTER = 156 (inkl. u1:s RY, se race-sektionen). Mina bägge
rader är ENDA energi-tillskotten (RY är finans):

| Mått | Före (153) | Efter (156) |
|---|---|---|
| Totalt median P/E | 20,8 (n=144) | **20,5 (n=147)** — COP 17,6 under, SLB 25,4 över, RY mellan |
| Totalt övrigt | P/B 2,9 · EBIT 20,6 % · FCF 12,0 % · tillv 6,8 % | P/B 2,9 · EBIT 20,6 % · FCF 12,0 % · tillv 6,9 % |
| Energi | P/E 16,5, P25–P75 11,6–21,3 (n=12) | **P/E 17,3, P25–P75 12,0–21,7 (n=14)** — bägge i övre halvan |
| Energi övrigt | P/B 2,3 · FCF 7,1 % · tillv 15,4 % | P/B 2,4 · **FCF 7,1→8,1 %** · **tillv 15,4→12,0 %** (COP:s −9,2 %-serie) |

Kvartiler + universumjämförelser byggs INTE manuellt — datasetlagret räknas
ur bolagsunivers.json och flödar in i /dataset-sidorna vid nästa prod-bygge
(Vonovia-precedensen). Två nya /bolag-sidor (cop, slb) + sitemap-poster föds
samma bygge, data-drivet via aspektParametrar().

## Landaspekt — koordinaten infriad

**USA/energi: matta 3→5** (CVX · SHEL · XOM + COP · SLB) ⇒
**/dataset/energi/usa PUBLICERAS vid nästa prod-bygge** — omg10:s utpekade
koordinat infriad via /stocks/-kanalen (STO/OSL-feedarnas gap kringgås,
inte lösts). Kontraktstestets sidkontroller 174→175 (den nya landsidan föddes
data-drivet). Kvar på matta 3: Sverige/teknik, Norge/energi. Nästa
omgångs-koordinater: Norge/energi (AKSO/SUBC/DNO om /quote/osl/ täcker) —
alternativt u1:s utpekade CNQ (Kanada/energi, landöppnare nr 2).

## llms.txt — kodvägs-regenerering med round-trip-bevis

FÖRE-bevis på 153-läget: buildLlmsTxt()-blockets 16 branschrader
**byte-identiska** med disken (samlade av omg10); blocket bär dessutom omg9/10:s
aspektrad finans/resultat-cagr-5ar (ej en del av seo.tsx — bärs av
fabriksskriptens hjälpare). EFTER: splice 156-läget — branschraderna ur
buildLlmsTxt() + aspektraden omräknad med KONTRAKTETS egna hjälpare
(sammanfatta/sammanfattaUniversum): finans median **12,2→10,7 %**, n 12→13
(u1:s RY), universum **4→3,9 %**, n 116→119 (RY+COP+SLB alla mätta).
**Konvergens-beviset**: min beräknade splice var redan byte-identisk med
disken när den skrevs (nyFil === paDisk) — u1:s agent hade kört samma kodväg
mot samma disk-läge; två oberoende körningar, ett utfall (omg5-precedensen
"samma kodväg ⇒ samma block"). LIVE-verifierat: /llms.txt servar 156-läget på
port 3000 (public/ läses från disk — inget bygge).

## KVD-bevis

- **Kontraktstest** `tsx verktyg/testa-dataset-aspekter.mjs` (cachad tsx-CLI ur
  npx-cachen, ALDRIG npx): **GRÖNT — 175 sidkontroller, 0 fel**, 30 kända
  varningar (pre-existerande); 174→175 = energi/usa-landsidan.
- **Läckagevakt** `node verktyg/v98-dataset-vakt.mjs`: **GRÖN — 0 träffar,
  156 tickers + 156 namn i 1 510 utdatafiler** (vakten läser universumet
  dynamiskt — RY inkluderad).
- **Aritmetik**: 32/32 GRÖN (append-kontrollblocket; ett stavfel i egen
  kontroll fångat och kurerat FÖRE skrivning).
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**
  (src/ orörd; pre-commit-grinden verifierar samma).
- **prod 200**: /, /dataset, /dataset/energi, /api/data/nyckeltalsguide,
  /llms.txt, /dataset/finans/resultat-cagr-5ar — alla **200** mot localhost
  (middleware-whitelistad); /llms.txt LIVE på 156-läget.
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd =
  INGET bygge (ägare: prod-synken).

## Race-bokföring (u1:s RY — BASF-precedensen)

Under mitt datafönster landade s2-u1:s ocommittade **RY-rad (Royal Bank of
Canada, finans, Kanada — universumets första Kanada-rad)** i arbetskopian;
min append läste den FÖRE skrivning ⇒ RY bevarades intakt (syskonvakt:
diffen visar RY+COP+SLB som tre separerade rader). u1:s anspråk
(auto-s2-1789651528300, ts ~13:3x UTC, efter mitt) deklarerar RY + llms-154;
deras llms-körning fångade redan 156-diskläget (konvergens-beviset ovan).
Ägarskap: **RY-rad + dess llms-verkningar = s2-u1** (deras blivande commit
kan bli tunn om min commit når först — BASF-precedenten: innehåll intakt i
historien, ägarskap dokumenterat här); **COP+SLB + energi/usa-landsidan +
aspekt-omräkningen = s2-u2** (detta protokoll). u1:s anspråk lämnar dessutom
CNQ (Kanada/energi) till syskonen — fri koordinat nästa omgång.

## Notiser till dataägaren

1. **P/B- och EV/EBIT-härledningarna**: bägge bolags källsidor visade inte
   P/B/EV-EBIT direkt — fälten härledda ur källans egna tal (P/E×ROE; EV =
   mcap+nettoskuld mot EBIT TTM), maskinverifierade i append-skriptet. Not i
   vardera bolags notering bär metoden.
2. **COP:s P/E-identitet** 130,75/7,53 = 17,36 mot källans 17,61 (1,4 %):
   källan räknar P/E-TTM på eget underlag — källans tal används som primärt
   (spårkonvention), avvikelsen dokumenterad.
3. **Beta-paret COP 0,13 / SLB 0,77**: producentens resursägarskap mot
   service-bolagets cykelvaror — energifållans CAT/LMT-par.
4. Ärvda flaggor kvarstår: `*CAGR5ar`-fältnamn vs 4 år (nu 156 rader);
   prognosTillväxt-extremer (spårkonventionens trailing/forward-härledning
   vid djup värderingsgap — COP +33,2/SLB +36,9 % med källans 3-års-prognoser
   som noter).
5. **Intraday-kursen**: bägge kursvärden är as-of 09:15–09:22 EDT 2026-09-17
   (marknad öppen vid hämtning) — inte close. Dokumenterat i källors
   paranoid-fält.

## Filägarskap

- Exklusiva: data/forskning/S2-U2-COP-SLB-UTOKNING-OMG11.md (detta),
  data/vakten/s2-u2-omg11-ansprak.md (disk, gitignorerad katalog),
  /tmp/s2u2o11-{fore,block,efter,llms}.{mts,txt}, verktyg/_s2u2o11-commitmsg.txt.
- Delade (read-modify-write/regenererad): data/portfolj-system/
  bolagsunivers.json (mina COP+SLB-rader; u1:s RY bevarad intakt),
  public/llms.txt (156-blocket — konvergerat med u1:s körning), worklog.md
  (append).
