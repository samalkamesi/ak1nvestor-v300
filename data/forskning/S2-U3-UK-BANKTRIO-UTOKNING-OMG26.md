# S2-U3 UK-BANKTRIO-UTÖKNING OMG26 — Storbritannien/finans 2→5: BARC.L + NWG.L + LLOY.L

Fabriksagent s2-u3 (byggare 3/3, manifest auto-s2-1789982125241, omgång 26).
Klaim på disk FÖRE byggstart: data/vakten/auto-s2-1789982125241-s2-u3-ansprak.md
(gitignorerad väg — disk-beviset; inga syskonanspråk fanns på disk vid klaim).

## VAL

Cellen Storbritannien/finans 2 (HSBA.L omg19 + LSEG.L omg25) → 5 med tre
hushållsnamn i världsfinansens hemstad: BARC.L Barclays (1690), NWG.L
NatWest (f.d. RBS), LLOY.L Lloyds (Halifax-sfären). Signaturleverans samma
mönster som omg24 (Japan/kommunikation) och omg25 (Frankrike/konsument):
mattan 5 nås ⇒ LANDSIDAN /dataset/finans/storbritannien FÖDS DATA-DRIVET
via ny storbritannien-modul i src/lib/dataset-aspekter/land.ts (omg21:s
frankrike-mönster) — kontraktstestet 187→188, beviset lever i testet.
Cellens pedagogiska spännvidd efteråt: detaljbank-jätte (HSBC P/E 16,6) +
kapitalmarknads-infrastruktur (LSEG 29,8) + tre storbanker i P/E 9,4–13,7 =
bankvärderingskurvan i EN cell. Reservkoordinat (Sydkorea/teknik) lämnades
oanvänd — ÖPPET åt syskonen.

## DATA (källor, S&P GMI-underlag via StockAnalysis LON-paneler ×5/bolag + Yahoo chart paranoid)

- BARC.L: £4,622 (close 2026-09-18; Yahoo 462,20p vs SA-mcap-inferens 462,0p
  = band 0,04 %), mcap £61,91 mdr, P/E 9,61 (replik 9,63), fwd 7,91 ⇒ prognos
  +21,5 %, P/B 0,78 (replik mcap/EK-total 0,776), P/TBV 0,88, PEG spår 0,45
  mot källa 0,46, ROE 10,09 %, EBIT 37,55 %, netto 24,32 %, serier FY21→25:
  rev 22 593→26 818 (+4,4 %/år), netto 6 205→5 023→4 274→5 316→6 175 (endpoint
  −0,1 %/år ÄRLIGT, TTM 6 843 +11,8 %), utdelningar 1 360→2 210, ÅTERKÖP
  1 674→6 234 £M (ÖVER utdelningarna alla fem år; TTM 7 181) ⇒ buyback yield
  4,64 % + 1,92 % = shareholder yield 6,50 %; grundat 1690 = universums näst
  äldsta bolag (LSEG 1698 äldst — Londons två 1600-talsinstitutioner i EN cell).
- NWG.L: £6,994 (close 18/9; Yahoo 699,40p vs SA 700,1p = 0,10 %), mcap
  £55,63 mdr, P/E 9,37 (replik 9,33), fwd 8,72 ⇒ prognos +7,5 %, P/B 1,27
  (replik 1,269), PEG spår 1,26 mot källa 0,79 (källans 3-årsbas EPS +11,28 %
  — tvärvillkoret dokumenterat), ROE 14,78 % (cellens högsta), EBIT 50,75 %,
  netto 35,86 % (trions högsta), serier: rev 11 747→15 970 VART ENDA ÅR
  STIGANDE (+8,0 %/år), netto 2 950→3 340→4 394→4 519→5 479 = FEM RAKA
  VINSTÅR (+85,9 %, resCAGR 16,7 %; TTM 6 026 +20,8 %), utdelningar 1 011→2 370
  FEM RAKA STIGANDE, aktiebas 10 467→7 959 M = −23,96 % på 4,5 år,
  institutionsandel 92,09 % (f.d. RBS — statens utträdesår), shareholder
  yield 6,46 % (utdelning 4,58 % = cellens högsta direktavkastning).
- LLOY.L: £1,0895 (close 18/9; Yahoo 108,95p = SA previous close EXAKT —
  band 0,00 %), mcap £62,72 mdr, P/E 13,65 (replik 13,62) = cellens dyraste
  bank, fwd 9,76 ⇒ prognosgap +39,9 % (trions största), P/B 1,33 (replik
  1,311 FY25-bas/1,328 TTM-bas — tvåbasen dokumenterad), PEG spår 0,34 mot
  källa 0,52 (källans 3-års EPS +26,07 % = källans egen PEG-bas EXAKT),
  ROE 11,34 %, EBIT 38,19 %, netto 24,16 %, serier: rev 17 127→14 530→18 326→
  17 572→18 627, netto 5 355→3 389→4 933→3 923→4 196 (endpoint −5,9 %/år ÄRLIGT:
  FY2021:s efterpandemi-topp 31,3 % marginal, FY2024:s dipp, TTM +15,0 %
  återhämtning — trions enda fallande endpoint med stigande TTM), aktiebas
  70 562→58 081 M = −17,69 %, fyra raka div-tillväxtår, shareholder yield 6,39 %.
- Bankkonvention (HSBA.L/UBSG.SW-precedenserna): roic/evEbit/fcfYield/
  fcfMarginal/bruttoMarginal/skuldEgenkapital/rantaTackning/aterkop = null,
  serier.egetKapital/fcf = tomma arrayer, ebitMarginal SATT (UBSG-modellen),
  valuta GBP med pris i pund-decimal (LSEG.L o23+-modellen).

## MEDIANER (medianer-skript, replik av raknaBranschMedianer)

FÖRE (disk minus mina 3, n=246) → EFTER (diskens läge, n=249):
- TOTALT: P/E 20,5→20,4 (kv 14,2–29,1→13,9–28,9, n 236→239)
- finans: 34→37 bolag, P/E 14,5→14,3 (kv 12,4–19,8→12,1–17,9), P/B 1,8 (kv
  1,5–2,7→1,3–2,7 — mina P/B 0,78/1,27/1,33 sänkte P25), EBIT 37,6→38,2 %
  (kv 26,6–50,2→29,1–50,2 — P25 lyft), omsTill 9,6→7,8 %
- CELLEN Storbritannien/finans EFTER (landsidans fem mått): n=5, P/E 13,7
  (kv 9,6–16,6, matta 5), P/B 1,3, EBIT 37,9 %, FCF 39,1 % (LSEG ensam
  bärare), omsTill 5,2 %
- Universumjämförelse: BARC rank 22/239 · NWG 19/239 · LLOY 58/239 — alla
  tre under universummedianen 20,4 (kv 13,9–28,9): tre banker i nedre
  prishalvan av ett 249-bolagsuniversum.

## MEKANIK OCH KVD

- Append: _s2u3o26-universum-inlagg.mjs — innehållsidentitets-bevis (diskens
  246 prefix strukturellt identiskt), race-vakt (cell=2, inga duplikat),
  indent 2, 246→249, UK/finans 5.
- llms HELREGEN: _s2u3o26-llms-regen.mjs — sektionen ombyggd på 249-läget
  (huvudrad 249, finans-raden 37/14,3/12,1–17,9). RACE 16: u1:s AI.PA +
  u2:s DSY.PA/CAP.PA landade på disk under mitt fönster (243→246) — min
  append tog 246→249, min regen MATT-DRIVEN på 249. Syskonet u2:s commit
  00a8db01 hann FÖRE min commit och bar diskens slutläge 249 inklusive
  MINA tre rader ride-alang med öppen attribution (HDFC/omg19-mönstret) —
  konvergent: deras regen och min beräknar samma tal ur samma data; disk =
  HEAD = prod = 249. Universum-filen och llms.txt är därmed committade av
  syskonet; MINA ytor i denna commit: land.ts + verktyg + protokoll + worklog.
- LANDSIDAN: ny storbritannien-modul i src/lib/dataset-aspekter/land.ts
  (Edit enligt omg21-frankrike-mönstret; valuta-mening bär GBX/GBP + bank-
  konventionens tolkningsvarning). KONTRAKTSTEST 187→188 (sidkontroller
  188, FEL 0, GRÖNT) — landsidan /dataset/finans/storbritannien publiceras
  av slutledet vid nästa prod-synk-bygge (INGET bygge i denna leverans —
  Vonovia/omg22-precedensen: beviset lever i testet); sitemap-posten genereras
  ur samma aspektParametrar (src/app/sitemap.ts rad 137).
- tsc: node node_modules/typescript/bin/tsc --noEmit = exit 0 (projektbinären;
  land.ts var den enda src-ytan).
- Läckagevakt v3 ×2: 446 sökningar (249 namn+tickers) mot 3 dataset-html +
  llms Dataset-sektionen = 0 TRÄFFAR GRÖN.
- Prod: / = 200, /dataset = 200, /dataset/finans = 200, llms.txt LIVE
  "på 249 bolag" = disk (12 radträffar av 249-markeringen).
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd (utkast orörda) ·
  juridikgrinden: enbart publika nyckeltal, utbildningsframing, aldrig råd.

## FIFO

BARC Q3 2026-10-22 · LLOY Q3 2026-10-27 · NWG Q3 2026-10-30.
