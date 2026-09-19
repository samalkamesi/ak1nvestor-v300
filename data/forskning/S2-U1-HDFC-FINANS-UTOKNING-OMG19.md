# S2-U1 DATASET-DJUP: HDFC BANK — INDIEN/FINANS (omg19)

**Manifest:** auto-s2-1789831500945 (byggare 1/3) · **Anspråk:** 2026-09-19 17:30
(data/vakten/auto-s2-1789831500945-s2-u1-ansprak.md) · **Pivot:** ~18:0x ·
**Leverans:** 2026-09-19 (universumraden + llms-207 bars av syskon-u3:s commit
bd344f82 ride-along, oantecknad där — BASF-precedensen "skrivet=ägt, burit=
bokförd"; denna commit = skript + protokoll + worklog, omg18-u1:s
doc-leverans-mönster).

## SAMMANFATTNING

Universum 206→207 med +1 rad (Indien/finans 0→1) — men leveransens väg blev
spårets mest händelserika koordinatdrama hittills: MUFG-kollision (två agenter
läste samma FIFO-notis), pivot på syskonets explicita Indien-reservation,
två diskglidningar (203→206) mitt i fönstret, och en PARALLELL omstart av
s2-u1 (om-dispatch) som landade samma cell med annan tickereftiker —
intercepterad av idempotensgrunden.

## KOORDINATDRAMAT (dokumenterat för fabriksärandet)

1. **MUFG-utgångsläget:** omg18-u1:s FIFO-notis ("MUFG 8306.T — TYO-vägen
   sonderad") lästes av BÅDE mig (17:30:08) och syskon-u2 (17:29:01 — 67
   sekunder före) ⇒ koordinatkollision intra-slot. u2:s rad LEVER (bättre
   FCF-serier enligt KLARNA-precedensen); mina abort-grindar stoppade ALLT
   skrivande under MUFG-fasen (0 skrivna rader, 0 duplikat).
2. **Pivot:** u2:s anspråk förkastade explicit HDFC.NS/RELIANCE.NS med orden
   "Indien-cellen lämnas åt syskonen i denna omgång" ⇒ reservationen var
   deras dokumenterade val. Kanalkontroll FÖRE val (Sony/DOW-fällan):
   /quote/nse/HDFCBANK/ HTTP 200, P/E 14,28 mätbar ⇒ P/E-bärande ✓.
3. **Diskglidning ×2:** mitt fönster såg 201→203 (u2:s MUFG+BNP)→206 (u3:s
   3382.T+2914.T+4452.T); konvergensbeviset kördes OM på varje nytt läge —
   grönt varje gång (kodvägs-repliken är lägesoberoende; konvergent design).
4. **Parallell u1-instans:** verktyg/_s2u1o19-append-hdb.mjs dokumenterar
   samma pivothistoria (MUFG→HDB ADR-tickern). Min rad (NSE-primär
   HDFCBANK.NS enligt TCS.NS-precedensen) nådde disken först och HEAD —
   HDB-alternativet är interceptorat (samma bolag; NSE-primär är
   universumkonventionen). Instansens skript lämnas orört (deras ägo).

## KÄLLOR

StockAnalysis NSE-primär /quote/nse/HDFCBANK/ (översikt + statistics +
financials; underlag S&P Global Market Intelligence + Fiscal.ai), slutkurs
2026-09-18 15:15 IST, sidor pålästa 2026-09-19. Financials i M INR, FY
april–mars med slutårsetikett (FY2026 = apr 2025–mar 2026 — TCS.NS-
konventionen exakt).

## SIGNATURTAL

- **P/E 14,28 EXAKT replikerbar** (731/51,19) mot forward 13,04 ⇒ prognosTillväxt
  +9,5 % (PEG 1,50 spårkonvention; källans 1,04 på 3-års EPS-prognos +13,32 %/år
  kalibrerar) — mot intäktsprognosen +11,51 %/år: mergerårets synergiring.
- **HDFC LTD-MERGERN (juli 2023) = seriens strukturbrott:** FY2024:s intäktshopp
  +102,45 % är konsolideringen av bolånekoncernen (Holcim/GSK-scope-klassen);
  EPS-trappan 34,15→41,13→45,01→46,20→49,28 = FEM raka tillväxtår, nettoCAGR
  +18,9 %/år (positiv bas — mätbar; motsatsparen 8306.T/VW:s negativa baser).
- **Värderingens banktumregel i ett talpar:** ROE 13,84 % mot P/B 1,79 — och
  bank-paketets femte par kompletterar rankningen (RY 2,72/16,2 · ITUB 2,17/21,5
  emerging-rabatt · HDFC 1,79/13,8 · HSBA 1,77/13,1 · 8306.T 1,68/9,5).
- **Payout 25,40 % EXAKT** (13/51,19) — RBI:s utdelningspolice bygger kapitalbas;
  buyback-yield NEGATIV −0,52 % (banker emitterar kapital) med shareholder
  yield 1,26 % = 1,78−0,52 EXAKT — paketets enda minus-tecken.
- **52v-fallsäsongen −24,37 %** (−28,4 % från toppen 1 020,50): rubrikburen men
  beloppslit klassaction (~45 crore INR deposit-inducements mot HDB-ADR:n) mot
  Strong Buy-panel 41 st PT 994,49 (+36,05 %).
- WACC 4,31 % (Indien mellan Japans 1,64 och Vestens ~7); nättskuld −3 281 mdr
  = kreditportföljen är tillgången (8306.T:s spegelbildsnot); Piotroski 2 =
  balansräkningsklassens artefakt (8306.T-dokumentationens spegel).

## MEDIANER (kodvägen raknaBranschMedianer, konvergensbevisad)

- **Finans:** P/E 15→14,7 (kv 12,7–20,5 → 12,8–20,4, n 22→23) · P/B 2,5→2,4 ·
  EBIT 45,7→45,4 % · FCF 23,3 oförändrad · tillväxt 10,5→10 %
- **Totalt:** n=207, median P/E 20,6→20,5 (n 196→197)
- **Kvartilplacering:** HDFC P/E 14,28 = rad 9 av 23 i finansgrenen (under
  medianen 14,7, över P25 12,8); universum-rank 46/197.

## KVD (på committat läge — omg12-skärpningen)

- **Aritmetikgrind 23/23 GRÖN** med abort FÖRE skrivning; MUFG-fasen fångade
  dessförinnan TVÅ egna fel (PEG-avrundningskonvention 2 decimaler = radpraxis;
  spread-kollision `...pe, pb, ...pb` i median-repliken som skrev P/B över
  P/E — konvergensbeviset gjorde sitt jobb) + formatfällan (universumfilens
  indent 1, inte 2 — I2-beviset skyddar formateringen).
- **Konvergens:** kodvägs-replik == filens Dataset-sektion byte-identiskt på
  206-läget FÖRE append; omgenererad på 207; aspektraden (finans/
  resultat-cagr-5ar) bevarad orörd — KÖNOTIS: raden bär n=14 medan disken
  efter BNP.PA (CAGR mätt) + HDFC (+18,9 %) beräknas till 16 — u2:s regen-yta
  bär glömskan (AI-mentorregister-klassen), nästa finans-cagr-rättning tar den.
- **Superlativtest:** ett obevisat rank-påstående ("universumets största
  paneler") mjukat FÖRE commit med innehållsintegritetsbevis (endast
  HDFC-raden förändrad, 207→207, övriga byte-identiska).
- **Läckagevakt GRÖN:** v98 0 träffar — 207+207 namn/tickers i 1 566 utdatafiler.
- **Kontraktstest GRÖNT:** 183 sidkontroller / 0 fel / 30 kända varningar
  (baslinje oförändrad).
- **tsc 0** projektbinär (src orörd av mig = INGET bygge, Vonovia-precedensen).
- **Prod 200 ×5 + extern domän** (/, /dataset, /dataset/finans,
  /api/data/nyckeltalsguide, /llms.txt, lab.ak1nvestor.com) med **/llms.txt
  LIVE round-trip: prod == disk == HEAD == 207** ("på 207 bolag i 10
  branscher").
- R2 orörd · data/blogg/ orörd · anspråket EJ stagat (gitignorad, omg14-läxan).

## FIFO

- HDFC Bank Q2 FY2027: **2026-10-16** (oktober-FIFO:tätt med GS 10-13).
- Könotiser åt dataägaren: aspektraden n=14→16 (ovan); SMFG (Japan/finans
  1→2) och AXA (Frankrike/finans 1→2) lediga koordinater (u2:s notis);
  Indien/finans 1→2-nästa: ICICIIBN eller SBI.

## ÄGARSKAP

HDFCBANK.NS-raden + llms-207-regen = s2-u1 (skrivet=ägt; burit av u3:s
bd344f82, oantecknad ride-along — denna commit bär dokumentationen). MUFG =
s2-u2 (deras anspråk 67 s före mitt). 3382.T/2914.T/4452.T + land.ts-japan =
s2-u3.
