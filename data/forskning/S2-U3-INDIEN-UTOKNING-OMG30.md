# S2-U3 — BHARTI AIRTEL + SUN PHARMA + LARSEN & TOUBRO — INDIEN 4→7 GRENAR — OMG30

**Fabriksagent:** s2-u3, manifest auto-s2-1790237704889, byggare 3/3 (omgång 30;
verktygsprefix `o29` — numreringen konvergerade till 30 först via syskonen).
**Datum:** 2026-09-24. **Spår:** 2 DATASET-DJUP (citeringsmagneterna).
**Anspråk:** `data/vakten/auto-s2-1790237704889-s2-u3-ansprak.md` — disk-först,
FÖRE all datahämtning.

## VAL (före arbetet: 0 träffar för alla tre i universum, worklog och protokoll)

**Indien 4→7 grenar — tre NYA grenar i EN omgång** (kommunikation + hälsa +
industri), med kollisionsanalys som valmetod:

- u1-linjens dokumenterade spår = Japan (omg25 material, 27 halso, 28 industri)
  ⇒ Japan lämnades AT u1 — som VALDE Japan/energi (1605.T INPEX, omg30).
- u2-linjens spår = Europa-nischer ⇒ Italien/energi (ENI.MI + TRN.MI, omg30).
- Indien = RELIANCE-precedensens land; NSE-kanalen på StockAnalysis FYRFALT
  bevisad (TCS omg13 · HDFCBANK omg19 · HINDUNILVR omg18 · RELIANCE omg25).
- **BHARTIARTL.NS** — Indien/kommunikation 0→1: Indiens största
  mobiloperatör; telekom-grenens FÖRSTA tillväxtmarknadsoperatör (grenen
  bär Sverige/USA/Japan/Norge/Tyskland/Kanada/Spanien — alla mognamarknad).
- **SUNPHARMA.NS** — Indien/halso 0→1: Indiens största läkemedelsbolag;
  stormarknadspharma-trianguleringen bredvid Novartis/Novo/GSK/Takeda.
- **LT.NS** — Indien/industri 0→1: Indiens största ingenjörskoncern;
  Cat+Komatsu+Volvo-klubben får tillväxtmarknadskontrasten.

Cellerna 0→1 ×3 ⇒ ingen matta (5) nås ⇒ INGEN landsida ⇒ INGEN src-ändring
(land.ts läser land-fältet generiskt) ⇒ data-vägen hela leveransen
(Vonovia-precedensen).

## KÄLLOR (ALLT live-hämtat 2026-09-24)

StockAnalysis NSE-primär (`/quote/nse/<TICKER>/` + `/statistics/` +
`/financials/` + `/financials/balance-sheet/`; S&P Global Market
Intelligence-underlag; kanon intraday 13:50 IST) ×5 ytor ×3 bolag + Yahoo
chart-API paranoid ×3 (intraday ~13:47 IST). **FY = indiskt räkenskapsår
slutande mars** (FY2026 = april 2025–mars 2026).

**Paranoid-band (SA-snapshot mot Yahoo realtid, samma handelsdag):**
BHARTIARTL 1 803,00/1 800,80 = 0,12 % · SUNPHARMA 1 856,70/1 851,20 = 0,30 %
· LT 3 867,40/3 856,00 = 0,30 % — ALLA GRÖNA.

**Källfynd (metod):** (1) SA-cache-modellen — den FÖRSTA cachelästa
BHARTIARTL-sidan bar stale 2025-09-data; no_cache=true ger kanon (färsk
2026-09-24) — cache-läget dokumenterat och övergivet. (2) De komprimerade
sammanfattningsvyerna av financials-sidorna var SERIEFELAKTIGA (troliga
transformationsartefakter; tre konkreta talpar avvek mot ordagrann
tabellhämtning) — kanon = ordagranta webReader-svar; Sun Pharma omhämtades
ordagrant och korriggerade bl.a. FY2022-nettot (+32 727 M, positivt — den
komprimerade vyn bar −3 265) ⇒ resCAGR MÄTBAR. Readback-mönstret bevisade
sitt värde.

## ARITMETIKGRIND (verktyg/_s2u3o29-aritmetikgrind.mjs)

63 KRAV — körning 1: 49/63 (ABORT, filen orörd; 14 egna enhetsbuggar i
grindens konstanter: mcap i miljoner mot fulla tal) · körning 2: 62/63
(ABORT; S22 fel index) · körning 3: **63/63 GRÖNA**. Universum-inlägget
skrevs ENDAST efter GRÖN (ABORT-kulturen, omg16/23/25-mönstret).

EXAKTA repliker (urvalet): Bharti P/E mcap/netto 39,50 mot fält 39,49 · P/B
11 420/2 006,5 = 5,69 EXAKT (BAS-BEVISAT: statistics-Equity 2,01T =
Shareholders' Equity INKL minoriteter; BVPS 259,48 = EK-common/6 236 EXAKT —
två EK-baser, båda belagda) · netto-/FCF-marginaler 13,14/35,12 EXAKTA ·
Sun P/B 5,329 mot 5,33 · EV = mcap − nettokassa 4 181 mot 4 190 (0,2 %) ·
LT P/B 4,201 mot 4,20 · nettoskuld-identitet −488 819 EXAKT · LT
orderbacklog-CAGR 19,95 %.

**Aktiebas-tripplar** (Maersk-klassen, alla tre dokumenterade i paranoid):
Bharti filing 6 236 M / vägd EPS 6 041 M / mcap-bas 6 333 M · LT filing
1 376 M / vägd 1 536 M / mcap-bas 1 396 M. **EV-källspridningar** 3,0 % /
0,2 % / 3,3 % (Bharti: spectrum/lease · LT: låneboken 1 178 mdr i balansen).

## MEDIANER FÖRE→EFTER (projektets replik, raknaBranschMedianer-konventionen)

- **kommunikation** 23→24: P/E 16,2→16,9 (kv 11,9–21,9 → 12,2–24,5, n 21→22 —
  Bharti LYFTER övre kvartilen med 2,6) · resCAGR-median 3,8→6,3 % (n 16→17)
- **halso** 25→26: P/E 25,7→25,9 (kv 20,4–35,2 → 20,8–36,4, n 23→24 — Sun
  pressar övre kvartilen) · P/B 3,5→3,6
- **industri** 21→22: P/E 27,8→28,0 (kvP25 19,8→20,4 — LT över gamla P25) ·
  P/B 4,8→4,7
- **TOTALT** 259→262: P/E 20,1→20,4 (n 247→250) — inga strukturella brott.

## UNIVERSUMJÄMFÖRELSE (efterläget 262)

P/E-kvartilsvärlden — **tre övre-kvartilsbärare i EN omgång** (universum
median 20,4, kv 13,9–29,4): BHARTIARTL 39,49 = rad 223/250 (rad 20/22 i
kommunikation) · SUNPHARMA 37,00 = rad 214/250 (rad 19/24 i hälsa) · LT
32,57 = rad 203/250 (rad 16/22 i industri). resCAGR-kvartilsvärlden (median
4,8 %, kv −8,7–17,2): Bharti rad 10/217 · Sun rad 22/217 · LT rad 57/217.
**Pedagogiken: tillväxtmarknadens prissättningsmönster — alla tre handlas
över universumets P75 med resultattillväxt i toppdeck.**

## SIGNATURTAL

**BHARTI (39,49 · P/B 5,69 · EBIT 32,25 % · ROIC−WACC +10,54 pp):**
DPS-trattan 3→4→8→16→24 INR = ÅTTA FÖRDOBLINGAR på fyra år medan P/E-trappan
101,08→30,91→39,49 bär omprisningen nolltillväxt→compounder · FY2025
engångsåret (Indus Towers 335 561 M) mot TTM-vändningen 289 147 ·
RIGHTS-ISSUE-TRANCHEN LANDAR Q1FY27: aktiebas 6 089→6 236 M, Comprehensive
Income 1 586 949 M, nettoskuld SJUNKER 1 646 899→1 430 709 M ·
bruttomarginaltrappa 59,43→67,65 % (duopolens marginalmakt) · resCAGR
+58,27 %/år endpoint (tre CAGR-arketyper i omgången: 58,3/36,9/16,7 %).

**SUNPHARMA (37,00 · P/B 5,33 · ROIC−WACC +14,08 pp = omgångens bredaste
moat-gap):** generika→specialitet-resan i bruttomarginaltrappan 71,86→78,66 %
· TARO-UTKÖPET SYNLI GT I BALANSRÄKNINGEN: minoritetspost 34 592→2 679 M FY24→25
(organisk kontrast till Bhartis växande minoriteter) · NETTOKASSA alla fem
år +113 645→+288 893 M (Indiens försiktiga balansdoktrin mot Airtels
spektrumslast i samma omgång) · aktiebas 2 399 M KONSTANT (noll utspädning) ·
FEM RAKA VINSTÅR 32 727→114 794 M med FCF-förlikningsdippen FY2023 ärligt
bokförd.

**LT (32,57 · P/B 4,20 · ROIC−WACC +7,21 pp):** ORDERBACKLOG 3 575 950→7 403
270 M INR (+19,95 %/år, 2,5× årsomsättningen) — universumets första rad där
orderboken är huvudnyckeltalet · FEM RAKA VINSTÅR 86 693→160 840 (resCAGR
+16,71 % — omgångens mest jämna trappa) · bruttomarginal-spridning BLOTT
2,52 pp (EPC-kontraktens prissatta marginaler — omgångens stabilaste
moat-kurva) · FY2025 arbetskapitalåret FCF 47 325 (backlog-tillväxten binder
kassa) med FY2026-återhämtning 119 318 · hävstången WEKS: skuld PLATT 1 255
mdr genom +84 % omsättning, nettoskuld HALVERAD · låneboken 1 178 mdr =
bankverksamhet i industriell förpackning · grundat 1938 av danska ingenjörer.

## KVD

- Append 259→262 på diskens FAKTISKA läge (race 18: u1:s 1605.T + u2:s
  ENI.MI/TRN.MI landade under fönstret — noll koordinatkollision; deras rader
  RIDE-ALONG i min commit med öppen attribution, HDFC/omg19-mönstret).
- Prefix-bit-identisk + läs-tillbaka ×2 (262/262, mina tre sist) · indent 1 +
  trailing \n (od-bevisat).
- Serier i FULLA INR-tal (HDFCBANK/HINDUNILVR/Takeda-kanon; FYND: TCS.nära
  rader bär historiska enhetsavvikelser — TCS råtal, RELIANCE ×1000 — inte
  min yta, notis till dataägaren).
- llms.txt HELREGEN matt-driven på 262 (konvergent oavsett syskonens
  commit-ordning) · LIVE "på 262 bolag".
- Läckagevakt v3 ×2 GRÖN (0 träffar, 472 sökningar, 3 dataset-html + llms
  Dataset-sektionen) · universum ×2 262/262 (v98-stilen).
- Kontraktstest 189 sidkontroller / 0 FEL (ingen ny landsida — cellerna n=1).
- tsc: src orörd = INGET bygge (pre-commit-grinden grön).
- Prod 200 ×7: / · /dataset · /dataset/kommunikation · /dataset/halso ·
  /dataset/industri · /llms.txt · /api/data/nyckeltalsguide (inga
  deployfönster-artefakter).
- R2 orörd · data/blogg/ orörd · juridikgrinden: ALLT utbildningsform, ALDRIG
  råd (2007:528) — signaturtalen är mekanismbeskrivningar, inga
  handlingsrekommendationer.

## FIFO

BHARTIARTL Q2 FY2027 2026-10-30 · SUNPHARMA Q2 FY2027 2026-10-30 · LT Q2
FY2027 2026-10-28 (alla tre indiska marsslutare samma rappvecka).

## Kö-notiser

- TCS/RELIANCE-seriernas enhetsavvikelser (räta mot HDFC-kanonen) — dataägarens
  beslut.
- Bharti-statistics ROE-fält 20,15 % mot replik netto/EK-total 14,41 % —
  källans bas oklar (parent/kvantitetsblandning); fältet använt, källspridning
  dokumenterad.
- SA-cache-läget (stale 2025-data i cacheläst NSE-sida) — hämtningsverktyget
  bör alltid no_cache.
