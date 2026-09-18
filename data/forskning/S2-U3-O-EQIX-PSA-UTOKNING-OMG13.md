# Protokoll S2-U3 — O + EQIX + PSA-utökning (omgång 13, manifest auto-s2-1789696529917)

Fabriksagent s2-u3 (spår 2 byggare 3/3), 2026-09-18. Anspråk FÖRE arbetet:
`data/vakten/auto-s2-1789696529917-s2-u3-ansprak.md` (E29-lärdomen).

## Objekt och val

Manifestets "+3 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200".
Uppgiften är omgångens enda +3 = den enda som ENBART kan öppna en 2-mätbar-cell.
Mattan mätt på 165-läget (maskinellt, P/E-mätbara per land×bransch): nio celler
låg på exakt 2 — halso/Danmark · material/Norge · material/Finland · energi/
Finland · halso/Schweiz · material/Australien · konsument/Tyskland · teknik/
Nederländerna · **fastighet/USA**.

VAL: **USA/fastighet — Realty Income (O) + Equinix (EQIX) + Public Storage (PSA)**
⇒ mattan 2→5 P/E-mätbara = **NY LANDASPEKTSIDA /dataset/fastighet/usa föds vid
nästa prod-bygge** (fastighetens första USA-landsida; kontraktstestet bevisade
födelsen direkt: 176→177 sidkontroller, "Ej genererade" 4→3 — sidan genereras
data-drivet i land.ts, Vonovia-precedensen för själva publiceringen).

Med PLD (logistik) + SPG (köpcenter) bär landsfållan FEM REIT-världar:
logistik · köpcenter · net-lease · datacenter · self-storage.

## Källor

StockAnalysis (översikt + statistics + financials per bolag; S&P Global Market
Intelligence + Fiscal.ai-underlag; close 2026-09-17 16:00 EDT):
O 57,32 $/54,22 mdr · EQIX 1 025,94 $/101,23 mdr · PSA 300,76 $/58,40 mdr.
Alla tre källklassade Sector: Real Estate ⇒ branschfältet fastighet
källkonsekvent (Sectra-precedensen).

## Signaturtal (pedagogiken)

- **O**: MÅNATLIG utdelningsikonen (5,67 %, DPS-trappa 2,845→3,219 $ +3,1 %/år);
  payout 237 % av EPS = REIT-normal (AFFO-nämnaren, SPG-radens dom); FÖRVÄRVS-
  MASKINENS UTSPÄDNING: oms +29,0 %/år och resultat +31,0 %/år endpoint men EPS
  0,87→1,17 = +7,7 %/år (aktier ~410→945,9 M, Veritas-mergern 2024) — universumets
  renaste utspädningsexemplar; prognosTillväxt +20,37 % (P/E 41,89/fwd 34,80).
- **EQIX**: SKALEFFEKTEN I EN SERIE — EBIT-margin 11,89→21,66 % FY2021–2025
  (×1,82) vid oms +10,3 %/år; DPS 11,48→18,76 $ (+13,1 %/år) växer snabbare än
  omsättningen; P/E 65,98 = fastighetstoppen; AI-infrastrukturens hyresvärd.
- **PSA**: self-storage = lägst kapitalbindning per intäktsdollar (ROE 21,93 %,
  ROIC 11,71 % — trio:s topp); FY2022-ENGÅNGSVINSTFÄLLAN dokumenterad (netto
  4 142 M $, pretax ~102 %) ger resultatCAGR −2,2 % endpoint trots stabil drift;
  forward HÖGRE än trailing (28,69/30,83) ⇒ prognosTillväxt −6,94 %, peg OSATT
  (ORSTED/SAMPO-konventionen) — normaliseringsgap-listans nya post; trio:s enda
  positiva FCF (+1,71 mdr, fcfYield 2,93 %).

## REIT-konventioner bokförda i raderna

1. Payout >100 % av EPS är REIT-normal (utdelning ur kassaflöde/AFFO; 90 %-regeln).
2. Skuld/EK = fastighetsbelåning (LTV-logik), ej jämförbar med industrirader
   (SPG-radens konvention).
3. Källans DUBBELA FCF-konvention: statistics-FCF (efter capex; O −1,98 mdr,
   EQIX −2,58 mdr, PSA +1,71 mdr) driver fcfYield/fcfMarginal — negativa tal
   skrivs (BABA-precedensen); financials-fliken redovisar OCF=FCF årsvis
   (serier.fcf) — dubbelspelet dokumenterat i varje rads källa+notering.

## Maskinella kontroller (append-skript /tmp/s2u3o13-append.mjs)

**28 GRÖNA / 0 RÖDA**: prognosTillväxt-återvändväg ×3 · peg ×2 + peg-osatt-regel
(PSA) · omsättningCAGR ×3 · resultatCAGR ×3 (inkl PSA:s negativa endpoint) ·
serielängder ×3 · ekv=pb ×3 · fcfYield ×3 · fcfMarginal ×3 ·
direktavkastningskors ×3 (DPS/pris mot källans yield: 5,67/2,01/3,99 %) ·
syskonvakt (165 gamla rader innehållsidentiska bevisna). Idempotent append
(hoppar existerande tickers); backup /tmp/s2u3o13-universum-fore.json.

## Medianer (kvartiler + universumjämförelse, kodvägsreplik)

- Fastighet: P/E **11,4→12,9** (P25–P75 10,0–20,1 → **10,2–29,1**, n 13→16) ·
  P/B 0,8→0,9 · EBIT 63,1→58,4 % · FCF 31,9→31,4 % · tillväxt 4,8→5,8 %
  (EQIX:s 65,98 och O:s 41,89 drar P75 +9 punkter — REIT-världarnas spridning).
- TOTALT: median P/E **20,5 OFÖRÄNDRAD** (n 156→159 av 168 — O över, EQIX över,
  PSA under medianen: nettonoll på totalen).

## llms.txt

Dataset-sektionen HELREGEN ur kodvägen på 168-läget (_s2u2o12-mönstret: exakt
replik av raknaBranschMedianer + seo.tsx-radmallarna): diff 14+/14− KIRURGISK —
intro (165→168, rådata 2026-09-18) · huvudradens n · fastighetsradens sex tal ·
alla branschraders totalräknare. /llms.txt LIVE på 168 direkt (statisk public/-
fil, servas från disk).

## KVD

- Läckagevakt (verktyg/v98-dataset-vakt.mjs): **GRÖN 0 träffar** — 168 tickers
  + 168 namn i 1 524 utdatafiler.
- Kontraktstest (verktyg/testa-dataset-aspekter.mjs via tsx-cachen): **GRÖNT —
  177 sidkontroller / 0 fel / 30 kända varningar** (pre-existerande klass;
  +1 kontroll = /dataset/fastighet/usa född).
- tsc via projektbinär: **0 fel** (src/ orörd = INGET bygge).
- prod 200 ×5: / · /dataset · /dataset/fastighet · /api/data/nyckeltalsguide ·
  /llms.txt; /dataset/fastighet/usa = **404 = väntar prod-bygget**
  (Vonovia-precedensen: servade dataset-sidor visar gamla tal till synken bygger).
- R2 orörd · data/blogg/ orörd · src/ orörd · syskonens ytor orörda.

## Race

HEAD vid commit = 48624f5f (s1-u2:s doc-commit) — inga s2-syskon-Commits under
fönstret; u1 (+1) och u2 (+2) pågår möjligen fortfarande. Mina rader O/EQIX/PSA
rör inga av de koordinater anspråksfilen lämnade fria; deras appends landar på
168-läget och omfattas av deras egen idempotens.

## Notiser åt dataägaren

1. /dataset/fastighet/usa publiceras vid nästa prod-bygge (prod-synken/krasch-
   vakten äger bygget) — USA:s fastighetssektor får sin första landsida.
2. Källans dubbla FCF-konvention (statistics vs financials) är nu dokumenterad
   på tre REIT-rader — om dataset-ytan senare visar fcfYield för fastighet
   bör notisen "REIT-FCF efter capex" följa med.
3. Nästa +3-öppningsbara 2-mätbara-celler (mätning på 168-läget): halso/Danmark
   (Genmab/Ambu/Lundbeck/Zealand) · material/Norge (Elkem/Borregaard/SalMar) ·
   material/Finland (Kemira/Metsä Board/Huhtamäki) · halso/Schweiz (Lonza/
   Sonova/Straumann) · material/Australien (Fortescue/South32) · konsument/
   Tyskland (Adidas/Henkel/Beiersdorf) · teknik/Nederländerna (källklassnings-
   risk: Adyen = Financials) · energi/Finland (tredje mätbar saknas i källan —
   cellen svår); LVMH/Enel/EA-cellerna kvar från omg12-notisen.
4. PSA:s negativa prognosTillväxt (fwd > trailing) = normaliseringsgap-listans
   nya post; EQIX P/E 65,98 = fastighetens nya toppmultiplar.
