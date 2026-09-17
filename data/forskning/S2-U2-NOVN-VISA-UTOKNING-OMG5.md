# S2-U2 omgång 5 — DATASET-DJUP: Novartis + Visa; universum 123→125 (hälsa +1, finans +1)

Datum: 2026-09-16 · Agent: s2-u2 (fabrik, spår 2) · Föregångare: omg 1 energi,
omg 2 (omkörning) Telenor+DT, omg 3 Roche+Nestlé, omg 4 Amazon+BHP.

## Objektval (+2 bolag — med omdöme och PIVOT under fönstret)

Utgångsläge vid kontroll: universum 120 rader (git HEAD), tunnaste branscher
hälsa/fastighet/tillväxt (11 var). Förstaval: Novartis (NOVN.SW, hälsa) +
Airbnb (ABNB, tillväxt) — båda 0 träffar i worklog, inte i universumet.

**PIVOT (race 9 i spårfamiljen):** under datafönstret landade ett syskons tre
ocommittade rader i arbetskopian — URW.PA (fastighet), PFE (hälsa) och just
ABNB (tillväxt); universumet rörde sig 120→123 (bevis: lasBranschMedianer
nBolag 123, `git status` = M bolagsunivers.json). Min ABNB kolliderade →
kasserad FÖRE skrivning (jag skrev aldrig någon ABNB-rad; 0 spår). Ersättare
enligt spårets logik (fri magnet i bransch som syskonet inte tog):
**Visa Inc. (V, finans)** — betalnätverksjätten, en av världens mest
citerade finansiella aktier, pedagogiskt unik i finansfållan (bankerna har
utlåningsrisk, Visa bär nätverksrisk utan kreditförluster). Novartis behölls:
Europas näst största pharma, patentklippe-pedagogik, .SW-konventionen etablerad
(ROG.SW/NESN.SW/LOGN.SW). Kollisionskontroll NOVN/V: 0 träffar i worklog,
fria i universumets 123 rader.

## Leverans 1 — två bolagsrader i bolagsunivers.json

All data live-hämtad 2026-09-16 (stockanalysis.com översikt + statistics +
financials, underlag S&P Global Market Intelligence, sid-as-of 2026-09-16 med
kurs close 2026-09-15). Append via node-script med idempotensguard
(/tmp/s2u2omg5-append.mjs): derivaten beräknas I skriptet ur råtal =
maskinverifierad aritmetik (s2-u3:s mönster).

**Novartis AG (NOVN.SW)** — hälsa 12→13 (tillsammans med syskonets PFE):
kurs 113,84 CHF / börsvärde 216,38 mdr CHF · P/E 21,30 (fwd 14,75 ⇒
prognosTillvaxt +44,4 % implicit EPS-förändring — marknadens
normaliseringsförväntan; källans 3-års EPS-prognos +6,50 %/år som not) ·
PEG 0,48 spårkonvention (källans egen 2,16) · P/B 6,38 · EV/EBIT 16,68 ·
ROE 30,35 % / ROIC 18,78 % · brutto 74,98 % / EBIT 32,75 % / netto 22,50 % /
FCF 29,18 % · skuld/EK 1,17 · fcfYield 6,26 % · serier 2022–2025 i USD
(källans konvention: rapportvaluta USD, kvoten i CHF — EQT/Vonovia-mönstret):
omsättning 43 461→56 674 MUSD (CAGR +9,3 %), resultat 6 955→13 984 (CAGR
+26,2 % — notering bär två skevheter: deprimerad 2022-bas före Sandoz-
avknoppningen OCH 2023-resultatet 14 850 > rörelseresultatet 10 234 =
avknoppningsvinsten i discontinued operations), FCF 13 320→17 596 (OCF−capex)
· moat-fält fyllda enligt BASF-precedenten: bruttomarginalserie medel 74,5 %,
spridning 2,7 pp (min år 2023, max 2025 — spridningen rättad i efterkontroll:
första utkastet sade 2,6 pp mot fel min-år, maskinverifieringen fångade det)
· utdelning 3,70 CHF (2,82 %, payout 71,1 %) — utdelningsfälten null enligt
universumets konvention (122→125 rader null).

**Visa Inc. (V)** — finans 12→13:
kurs 375,62 USD / börsvärde 689,49 mdr USD · P/E 31,98 (fwd 25,98 ⇒
prognosTillvaxt +23,1 %; källans 3-års EPS-prognos +14,10 %/år) · PEG 1,38
spårkonvention (källans egen 1,80) · P/B 19,91 (universumets högsta
ekm-värde) · EV/EBIT 23,51 · ROE 61,19 % / ROIC 54,82 % (notering: ROE bär
kapitalstrukturen — kärnan syns i ROIC) · brutto 97,73 % / EBIT 66,88 % /
netto 50,78 % / FCF 47,23 % · skuld/EK 0,68 · fcfYield 3,05 % · räkenskapsår
oktober–september — serien FY2022–FY2025 med årsetikett = slutår
(BHP-precedenten, andra instansen): omsättning 29 310→40 000 (CAGR +10,9 %),
resultat 14 630→19 853 (CAGR +10,7 %; FY2025 bara +2,0 % på
litigation-reserver medan rörelseresultatet +11,7 %), FCF 17 879→21 577 ·
moat: bruttomarginalserie medel 97,7 %, spridning 0,4 pp — nätverksrörelse
med nästan obefintlig varukostnad · utdelning 2,68 USD (0,71 %, payout
22,8 % — återköpsmodell) · räntetäckning 38,34 dokumenterad i notering
(fältet systematiskt osatt i universumet).

## Medianer — kvartiler + universumjämförelse (lasBranschMedianer, projektets egen kodväg)

Mina bägge rader mot FÖRE-läget (123, dvs. inkl. syskonens tre):

- **Finans** (min Visa, syskon orörda i branschen): P/E 14,1→14,4, kvartiler
  12,6–15,8→12,6–16,6 (n 12→13) · P/B 2→2,1 · EBIT-marginal 50,4→50,9 % ·
  FCF-marginal 40,9→44,1 % (Visas 47,2 %) · omsättningstillväxt 7,9→10 %
  (+14,4 % TTM) · resultat-CAGR-aspekten n 6→7 (median 12,1→10,7 %).
- **Hälsa** (min Novartis + syskonets PFE tillsammans): P/E 24,8→24,7,
  kvartiler 21,5–33,8→20,8–32,6 (n 11→12; Novartis 21,3 vidgar nedåt) ·
  P/B 5,3→6,2 (NOVN 6,38) · EBIT-marginal 24,8→26,2 % (NOVN 32,75 %) ·
  FCF 11,6→11,7 % · tillväxt 4,9→4,5 % (NOVN TTM +2,7 %).
- **Totalt**: median P/E 20,5→20,8 (n 114→116 av 125), universumjämförelserna
  på alla branschsidor följer med automatiskt i datasetlagret.

llms.txt Dataset-block regenererat ur samma kodväg (lasBranschMedianer +
aspektmodulens generera(), mallfällan-kuren aktiv): 125-läget, 13+1 rader,
samtliga 125-konsekventa. Syskonens övriga sektioner i filen orörda av
splicen (diff: endast blockets rader).

## ASPEKT-BONUS (bevisad)

Visas fcfYield 3,05 % förde finans/fcf-avkastning-mattan 4→5 ⇒ gränsregeln
 öppnade ny aspektsida — kontraktstestets sidkontroller 163→164
 (empiriskt bevisat: matta-räkning med/utan V, finans/fcfY 4→5; inga andra
 kombinationer korsade tröskeln med mina rader). MELI-precedenten (omg 4),
 tredje instansen.

## Koordinering (race 9-10, slutläge)

Sekvensen under fönstret: (1) syskonets tre rader (URW.PA/PFE/ABNB) landade
ocommittade under mitt datafönster — ABNB kolliderade med mitt förstaval,
pivot till Visa; (2) syskonet committade 37aecd55 (s2-u3 omg 5) under mitt
KVD-fönster och tog ARBETSKOPIAN = deras tre rader + MINA NOVN.SW/V-rader +
mitt regenererade llms-125-block togs alltsammans in i git av DERAS commit —
BASF-precedentens spegelbild (s2-u1 omg 4: data in via syskonets commit,
ägarskap dokumenterat hos upphovsagenten). Ägarskap: URW.PA/PFE/ABNB =
syskonet, NOVN.SW/V = s2-u2 (här). Min llms-125 inkluderar syskonens
mediantverkningar (fastighet 11→12, hälsa PFE, tillväxt 72,2→49,8 — ABNB:s
P/E 38,08 normaliserar tillväxtmedianen kraftigt); syskonets commit bevisar
konvergensen (HEAD:s llms = mitt block, diff tom). MIN commit = endast
protokoll + worklog. (3) TREDJE LÄGET pågår samtidigt: en komplett ALV.DE-rad
(Allianz SE, finans, disk-126-läget) ligger ocommittad från ännu ett syskon —
orörd av mig, lämnad åt sin ägare (deras race att commit:a i sitt fönster).
Mina rader idempotenta; ingen revert; inget arbete förlorat.

## KVD-bevis

- Kontraktstest `tsx verktyg/testa-dataset-aspekter.mjs` (npx-cachans binär):
  **GRÖNT — 164 sidkontroller, 0 fel**, 30 kända varningar (pre-existerande;
  163→164 = finans/fcf-avkastning, min aspekt-bonus ovan).
- Läckagevakt `node verktyg/v98-dataset-vakt.mjs`: **GRÖN — 0 träffar,
  125 tickers + 125 namn i 1 433 utdatafiler** (vakten läser universumet
  dynamiskt; llms Dataset-block + sitemap/robots rena).
- `node node_modules/typescript/bin/tsc --noEmit`: **0 fel** (src/ orörd —
  kördes som extra försäkran; grinden vid commit kör den mekaniskt).
- Prod: `https://lab.ak1nvestor.com/` = 200, `/dataset` = 200,
  `/api/data/nyckeltalsguide` = 200, `/dataset/finans` = 200.
- Endast data/ + public/llms.txt — inget bygge (ägare: prod-synken); nya
  /bolag-sidor (novn-sw, v) föds vid nästa prod-bygge (Vonovia-precedensen);
  R2 orörd (priser/tier/publicering; data/blogg/ orörd).

## Filägarskap

- Exklusiva: data/forskning/S2-U2-NOVN-VISA-UTOKNING-OMG5.md (detta),
  /tmp/s2u2omg5-append.mjs, /tmp/s2u2omg5-fore.mjs,
  verktyg/_s2u2omg5-commitmsg.txt.
- Delade: data/portfolj-system/bolagsunivers.json (mina NOVN.SW+V-rader —
  committade via syskonets 37aecd55, ägarskap här), public/llms.txt
  (dataset-blocket 125-läget — committat via samma commit), worklog.md
  (append, min commit). ALV.DE-raden på disk = tredje syskonets, orörd.
