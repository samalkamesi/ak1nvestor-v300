# S2-U3 UTÖKNING OMG12 — VITEC + ARM + NINTENDO (dataset-djup, citeringsmagneter)

Fabriksagent s2-u3 (manifest auto-s2-1789675529483, byggare 3/3), 2026-09-17.
Anspråk: data/vakten/auto-s2-1789675529483-u3-ansprak.md (skrivet FÖRE arbetet,
reviderat v2+v3 under loppet — se race-epilogen). Föregångare i serien: omg10
IVSO+CAT+LMT, omg11 SUBC+DNO+CNQ.

## LEVERANS

| Bolag | Ticker | Bransch | Land | Källa | P/E |
|---|---|---|---|---|---|
| Vitec Software Group | VIT-B.ST | teknik (källkonsekvent) | Sverige | Yahoo live + officiell bokslutskommuniké 2025 | 19,68 |
| Arm Holdings plc | ARM | teknik (källkonsekvent) | Storbritannien | StockAnalysis/S&P | 249,04 |
| Nintendo Co., Ltd. | NTDOY | kommunikation (källkonsekvent) | Japan | StockAnalysis/S&P + Fiscal.ai | 21,54 |

Universum 162→165 i trådet (raid-race se nedan); P/E-mätbara 153→156;
teknik 18→20, kommunikation 14→15; Sverige/teknik-mattan 5→6 (s2-u2:s
ENEA+NOTE öppnade, min VIT fördjupar); Japan/kommunikation 0→1 (Japans
andra rad); Storbritannien/teknik 0→1 (UK:s tredje gren: finans+teknik+?).

## VALET (tre revisioner — race-doktrinen i praktiken)

1. **v1**: SECT-B + VIT-B + ARM, huvudeffekt "Sverige/teknik 3→5 ⇒ ny
   landsida". Föll: Yahoo klassar Sectra **Healthcare/Medical Devices**
   (källkonsekvensregeln; s2-u2:s omg12-anspråk fällda den på StockAnalysis
   med samma dom — två oberoende källor, samma slutled).
2. **v2**: TRUE-B + VIT-B + ARM. Sverige/teknik-koordinaten rasade mot
   s2-u2:s ENEA+NOTE (deras anspråk 22:16, deras rader på disk); TRUE/VIT/ARM
   förblev fria — tills live-sonden visade **TRUE-B.ST redan i HEAD**
   (s2-u1:s 0ad009ab bar Samsung + TRUE-B klassad *tillvaxt*; commit-
   meddelandet nämnde bara Samsung — deras bokföring).
3. **v3 (levererad)**: VIT-B + ARM + **NTDOY** (omg8:s dokumenterade reserv,
   "Nintendo hölls som reserv, behövdes ej"). Branschfältet kommunikation =
   källans klassning Communication Services/Electronic Gaming & Multimedia
   (Sectra-precedensen: källan vinner över magen).

## RADERNA (live 2026-09-17)

### VIT-B.ST — Vitec Software (Yahoo live + bokslutskommuniké 2025)

Pris 223,60 SEK (intradag 15:05 CET) · mcap 8,87 mdr (223,60 × 39,68 M
aktier) · P/E **19,68** (pris ÷ EPS TTM 11,36) · P/B **1,75** (mcap ÷ EK
5 074 M ur bokslutet) · EV/EBIT **17,3** ((mcap + nettoskuld 3 791 M) ÷
EBIT TTM 731,89 M) · räntetäckning **6,6×** (EBIT ÷ ränta 110,13 M) · ROE
**8,9 %** (netto TTM 450,95 M ÷ EK) · brutto 47,7 / EBIT 19,8 / netto
12,2 % TTM · moat: brutto 50,3 → 47,7 % fem punkter, medel **48,9 %,
spridning 2,7 pp** — SaaS-vallgraven i siffror · utdelning **3,68 kr
(1,65 %, payout 32 %) — 24:e året i rad med höjd utdelning** (CNQ:s
10-årssvit får svensk tvilling) · repetitiva intäkter 88 % av omsättningen
· oms +22,4 %/år, resultat +21,1 %/år endpoint FY2022→2025 · obligations-
steget 2025: nettoskuld 3 791 M, skuld/EK 0,75 (nettoskuld-vägen, metod
noterad i källfältet) · prognosTillväxt/fcfYield OSATTA (källans
forward-fält bars av dec-2025-cache — fick ej blandas; FCF-capex saknas,
OCF TTM 1,06 mdr som taknotis).

**Cache-fyndet (metod-notis åt alla spåret):** Yahoos VIT-B-quote-panel
visade först 302,20 kr / P/E 30,28 — en **dec-2025-cachad version** (banner
"Trailing total returns as of 12/10/2025", earnings-datum 2025). no_cache-
hämtningen av financials-sidan gav det LIVE-läget (223,60). Alla Yahoo-STO-
smallcap-hämtningar MÅSTE cross-checka "as of"-stämplar — cookie-cachen
levererar månader gamla kurser med levande layout. Dokumenterat i källfältet.

### ARM — Arm Holdings (StockAnalysis/S&P, NASDAQ close 16:00 EDT)

Pris 264,94 USD (+8,59 % dagen) · mcap 282,98 mdr · P/E **249,04** mot
forward 102,18 ⇒ prognosTillväxt **+143,7 %** (DNO-precedensen: gapets
storlek, inte prognos; källans PEG 2,58 som not, spårets 1,73 bär fältet) ·
P/B **30,19** · EV/EBIT **310,87** — universumets högsta multiplar ·
bruttomarginal **97,54 % = universumets högsta mätta** (fem år 95,2–97,5 %,
medel 96,2 %, spridning 2,4 pp — IP-licensieringens digitala vallgrav; ASML
~65 och NVDA ~75 för bikupan) · ROIC 14,16 % MOT WACC 25,59 % = **−11,4
pp** — negativ spread där tillväxtförväntningen bär hela värderingen ·
netto 20,3 % ÖVER EBIT 17,3 % (mönstrets femte instans: ränteintäkter på
3,89 mdr-kassan) · skuld/EK 0,06, nettokassa 3,40 mdr · FCF TTM 1 510 M
(fcfYield 0,53 %) · **beta 3,89 — universumets högsta** (föregående topp
CAT 1,59; ARM mer än dubblar) med 52-växlaren +70,8 % · ingen utdelning ·
serier FY2023–FY2026 slutår mars (TM/BABA-precedensen), endpoint oms
+22,5 %/år, resultat +19,9 %/år · FY2024-EBIT-kollapsen 76,5 M (IPO-årets
aktiebaserade komp) mot netto 306 M = historiens netto>EBIT-instans.
UK:s första teknikrad (Cambridge-bolaget, NASDAQ-ADS, SoftBank-ägt sedan
2016 — short 11,5 % av aktierna).

### NTDOY — Nintendo (StockAnalysis/S&P + Fiscal.ai, OTC-ADR)

Pris 13,37 USD · mcap 63,00 mdr · EV 50,31 mdr UNDER mcap (kassa 12,11 mdr,
noll räntebärande skuld, current ratio 3,73) · P/E **21,54** (forward saknas
⇒ prognosTillväxt osatt) · P/B 3,51 · EV/EBIT 14,5 · **ROIC 52,78 % MOT
WACC 5,03 % = +47,8 pp — universumets bredaste positiva spridning** · ROE
16,3 % (identiteten P/B ÷ P/E — ADR/EPS-förvirring omöjliggjord) ·
**KONSOLCYKELN KOMPLETT I EN RAD**: FY2025 botten (oms −30 %, brutto 61,0 %
= mjukvarans bottenandel) → FY2026 Switch 2 (oms **+98,6 %**, brutto 39,3 %
= hårdvarulanseringens marginalbrott) ⇒ moat-spridning **21,7 pp**
(universumets näst bredaste efter DNO) på medel 53,7 % · endpoint FY2023→
FY2026: oms +13,0 %/år men resultat **−0,7 %/år** — cykelns hemlighet:
intäkterna dubblas, nettot står still (hårdvarans inlåsningseffekt) ·
netto 21,1 % ÖVER EBIT 19,7 % (sjätte instansen) · utdelning 0,35 USD
(2,59 %, payout 56 % = yield × P/E) · beta 0,14 (LMT 0,10:s närmaste
granne) · 52-växlaren −45,2 % (2025-toppen 23,66) · TTM +51,5 % oms ·
serier FY2023–2026 slutår mars, JPY (rapportvaluta-precedensen: kurs/mcap
USD, serier JPY). Japan/kommunikation 0→1; omg8:s reserv infriad.

## MEDIANER + KVARTILER + UNIVERSUMJÄMFÖRELSE (kontraktets formler)

Egen replik av raknaBranschMedianer (mittersta-par-medel, linjär percentil,
runda1) — /tmp/s2u3o12-medianer.mjs (kopia: verktyg/_s2u3o12-medianer.mjs):

- **Universum 165**: P/E median **20,5** (P25 **14,4** / P75 **28,9**,
  n=156/165) · P/B 2,8 (1,6–7,1, n=162) · EBIT 20,6 % (12,3–36,3) ·
  FCF 12,5 % (6,1–23,8) · tillväxt 7,1 % (1,7–16,1) · resultat-CAGR 3,5 %
  (−9,6 till 20,5, n=127).
- **Teknik 20 bolag**: P/E **24,9** (18–37,5, n=20) · P/B 5,5 (2,7–8,8) ·
  EBIT 24,7 % (13,3–34,1) · FCF 13,5 % · tillväxt 13,5 %.
- **Kommunikation 15 bolag**: P/E **21,8** (13,1–30,6, n=13) · P/B 2,7 ·
  EBIT 19,7 % · FCF 12,6 % · tillväxt 4,6 %.
- Universumjämförelserna (samma fältextractor, hela universumet) bärs av
  llms-raden + datasetsidorna vid bygget.

## LANDMATTOR efter omgången (P/E-mätt cell ≥ 5)

Sverige/industri 10 · Sverige/fastighet 9 · USA/tillväxt 9 · Sverige/finans
8 · **Sverige/teknik 6** (ENEA+NOTE+VIT ovanpå ERIC/KAMBI/SINCH ⇒
**/dataset/teknik/sverige PUBLICERAS vid nästa prod-bygge** — gränsen 5
passerad) · USA/finans 6 · USA/teknik 5 · USA/industri 5 · Sverige/hälsa 5 ·
USA/hälsa 5 · Sverige/konsument 5 · USA/konsument 5 · Sverige/material 5 ·
Norge/energi 5 · USA/energi 5 · USA/kommunikation 5 · Sverige/kommunikation
5. nya celler under gräns: Japan/kommunikation 1, UK/teknik 1,
Danmark/energi 0 mätbara (Ørsted null-P/E; +2 mätbara ⇒ dansk sida).

## RACE-EPILOGEN (tre akter, bokförd enligt BASF-precedensen)

- **Akt 1**: mitt anspråk v1/v2 (SECT/TRUE/VIT/ARM) skrivet före arbete.
  Under källhämtningsfönstret: s2-u1:s commit 0ad009ab (Samsung+TRUE-B,
  159→160/161) och s2-u2:s ENEA+NOTE-append (anspråk 22:16; syntes på disk
  som 162-läge med deras llms-162, föll sedan ur filen i race-vågen, re-
  landade 22:30:13 som 162).
- **Akt 2**: mina append-försök VÄGRADE skriva (prefix-beviset) — först
  av genuina race-lägen (TRUE-B i läsfönstret), sedan av **min egen
  separatorbugg**: beviset testade `}\n,` men JSON skriver `},\n`. Vakten
  var över-strikt — fail-safe riktning (vägrade alltid, skrev aldrig fel;
  inget syskoninnehåll skadades någonsin). Fick bestämt läge 22:30+:
  SKREV VIT+ARM+NTDOY på 162-läget → 165. Diff: 255 insertions,
  **0 deletions** — ren append, s2-u2:s ENEA/NOTE orörda.
- **Akt 3 ägarskap**: Samsung+TRUE-B = s2-u1 (deras rader i HEAD); ENEA+
  NOTE = s2-u2 (deras anspråk/protokoll, buren av min universum-commit
  enligt BASF-fallet — deras doc-commit blir förlustlös); VIT+ARM+NTDOY +
  llms-165-sektionen = s2-u3 (författat här). Universum == llms == 165.
- Notis: TRUE-B-kontrollblocket (41/41 GRÖN) kör vid varje re-run av
  mitt append-skript — blocket är kvar som v2-historik men exkluderat ur
  append-listan; s2-u1:s TRUE-B-rad rapporterar bransch *tillvaxt* (deras
  källklassning) mot min Yahoo-klassning *teknik* — källskiljaktighet
  bokförd åt dataägaren, ingen rad rördes.

## KVD (allt GRÖNT)

- **Kontraktstest**: `verktyg/testa-dataset-aspekter.mjs` via tsx-cachen
  (node …/npx/fd45a72a545557e9/…/tsx/dist/cli.mjs — ALDRIG npx): **176
  sidkontroller, 0 fel, 30 kända varningar** (175→176 = /dataset/teknik/
  sverige född data-drivet i land.ts när mattan passerade MIN_MATTA=5).
- **Läckagevakt**: `verktyg/v98-dataset-vakt.mjs` = **GRÖN: 0 träffar —
  165 tickers + 165 namn i 1 517 utdatafiler**. Kontraktet §1 håller.
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel,
  exit 0** (src/ orörd = INGET bygge; Vonovia-precedensen — datan flödar
  in i sidorna vid nästa prod-bygge).
- **prod 200**: / · /dataset · /dataset/teknik · /api/data/nyckeltalsguide ·
  /llms.txt = **200 ×5** (localhost, middleware-whitelistad); /llms.txt
  bär **165-läget LIVE** (public/ läses från disk — 12 "165 bolag"-träffar).
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd;
  allt är utbildningsdata med disclaimers enligt A2-kontraktet §5.

## Notiser till dataägaren

1. **Yahoo STO-cache-fällan** (VIT-fallet): cookie-cachen levererar
   dec-2025-kurser med levande layout — no_cache + "as of"-stämpelkontroll
   är OBLIGATORISKT för svenska small caps. Om VIT-P/E 30,28/302,20 dyker
   upp i framtida utkast = cachen, inte marknaden.
2. **Fortnox är dött för alltid**: s2-u2:s omg12-utredning — AVMOTERAD
   (Omega II-bud 2025-03-28, sista handelsdag 2025-07-24). OmG10:s
   "feed-gap"-hypotes avförd; koordinaten stängs.
3. **Källskiljaktighet TRUE-B** (teknik enligt Yahoo / tillväxt enligt
   s2-u1:s källa): påverkar branschmedianernas gruppindelning vid 1 bolag
   — beslut åt dataägaren omraden; inget akut.
4. **ARM:s prognos-gap +143,7 %** (DNO-precedensen) och NTDOY:s
   resultat-CAGR −0,7 %/år på +13,0 %/år omsättning = två nya
   normaliseringsgap-pedagogiker till listan (DNO +365,8 står kvar som topp).
5. Nästa rapporter: ARM 2026-11-04 · NTDOY 2026-11-05 · Vitec Q3 ~okt —
   spår 1:s kvartalspaket-FIFO.

## Nästa koordinater (spårets kö)

1. **Danmark/energi**: 0 mätbara (Ørsted null-P/E) — +2 mätbara (Vestas?
   klassas industri — Mærsk? transport...) ⇒ dansk energisida; omg11-notis.
2. **Nya landceller med magnetvärde**: LVMH (Frankrike/konsument 0→1,
   LVMUY-ADR), Enel (Italien/energi 0→1), EA/TTWO (USA/kommunikation —
   Nintendos programvaru-syskon i källans egen branschklassning).
3. **Teknik 20 rader**: halvledarkedjan komplett (ASML/TSM/Samsung/ASM/
   ARM/NVDA/AMD); luckor = företagsmjukvara Europa (SAP ensam), Swedish
  _wrapper_ — Novo? nej. Kandidat: Logica? — dataägarens valsituation.

## Filägarskap

- Exklusiva: detta protokoll, anspråket, verktyg/_s2u3o12-{append,medianer,
  llms}.mjs, verktyg/_s2u3o12-commitmsg.txt.
- Delade (read-modify-write): bolagsunivers.json (mina 3 rader; syskonens 5
  bevarade+burna enligt BASF), public/llms.txt (min 165-sektion), worklog.md
  (append).
