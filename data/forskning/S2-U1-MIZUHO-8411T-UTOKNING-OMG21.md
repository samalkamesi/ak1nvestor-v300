# S2-U1 — MIZUHO 8411.T — JAPAN/FINANS 2→3: MEGABANK-TRION KOMPLETT (omgång 21)

**Manifest**: auto-s2-1789856706519 · **Byggare**: s2-u1 (1/3) · **Datum**: 2026-09-20 (~00:2x–01:0x lokal)
**Anspråk**: data/vakten/auto-s2-1789856706519-s2-u1-ansprak.md (skriven FÖRE allt arbete, disk-först)

## 1. Valet

**MIZUHO FINANCIAL GROUP 8411.T — Japan/finans 2→3.** Koordinaten är v209-u2:s
explicita kö-notis (worklog 2026-09-19): *"Kö-notiser: Mizuho 8411.T fullbordar
megabank-trion"*. Cellen bar 8306.T (MUFG, omg19-u2) + 8316.T (SMFG, v209-u2);
Mizuho är det tredje och sista benet. Japan 9→10 rader (konsument 5 · finans 3 ·
teknik 1 · kommunikation 1).

**Duplikatkontroll FÖRE valet** (disk == HEAD 60d9b4f6, 213 rader): 8411.T fanns
EJ (grep-träffen "8411" var delsträngen `: 0.8411` i ett befintligt tal). Kö-notisens
andra objekt Allianz var REDAN levererat (ALV.DE, Tyskland/finans) — noterat, inte
mitt val. Syskon u2 (+2) och u3 (+3) löper parallellt; anspråksfilen markerar
ägarskapet.

**Data-väg**: stockanalysis.com TYO-primärnoting — fyra bevisade precedenser i
släktet (8306.T, 8316.T, 9983.T, VWS-sond). Hämtat 2026-09-20 (close 2026-09-18
15:30 JST), underlag S&P Global Market Intelligence. Fem ytor: overview +
statistics + financials + cash-flow-statement + balance-sheet (CF-sidan krävde
webReader-bypass efter två tomma WebFetch-extraktioner; Mar'25/Mar'26-kolumner
ur annual-vyn med Mar'22–24-korskonfirmation exakt).

**P/E-bärande-kriteriet**: uppfyllt — TTM-EPS 560,16 JPY positivt och mätt.

## 2. Raden (8306.T/8316.T-mallen)

| Fält | Värde | Replik |
|---|---|---|
| pris | 8 495 JPY | close 2026-09-18, −0,63 % |
| mcap | 20 560 mdr JPY | 2 420 Mdr aktier × 8 495 = 20 557,9 — 0,01 % |
| P/E | 15,17 | 8 495/560,16 = 15,165 — 0,03 % |
| forward P/E | 13,54 | ⇒ prognosTillväxt +12,04 % TTE (MUGUI-modellen) |
| PEG | 1,26 | 15,17/12,04 (spårkonventionen) |
| P/B | 1,77 | mcap/EK 20 560/11 587 = 1,774; pris/BVPS 1,796 (+1,2 % vägt aktietal) |
| P/TBV | 1,94 | källa |
| ROE | 12,49 % | egen slut-EK-replik 11,92 % (källan bär snitt-EK) |
| WACC | 1,37 % | Japans lågränta — 8306.T:s 1,64/8316.T:s 1,93-klass |
| ebitMarginal | 38,24 % | replik 1,81T/4,74T = 38,19 % (källans rad avrundad) |
| nettoMarginal | 29,14 % | 1 381 020/4 739 890 = 29,136 % EXAKT |
| payout | 26,78 % | 150/560,16 EXAKT — trions lägsta (54,87/54,61/26,78) |
| NETTKASSA | 44,15 T JPY | 119 450−75 297 = 44 153 mdr, 0,0004 % mot källrad 44 152,6 |
| omsCAGR | +11,90 %/år | (4 399 734/2 805 932)^¼−1 |
| resCAGR | +23,87 %/år | (1 248 632/530 479)^¼−1 |

Serier (M JPY) FY2022→FY2026: rev 2 805 932→2 779 216→3 122 105→3 898 840→4 399 734 ·
netto 530 479→555 527→678 993→885 433→1 248 632 · FCF 2 280 084→2 196 990→−361 632→
−5 843 117→−6 089 212 (bank-OCF = lånevolymens tidecken — 8306/8316-noten) · DPS
80→85→105→140→145 (nuvarande 150). Bank-konventionerna: stabilitet/återkop/moat
NULL, evEbit/fcfYield/fcfMarginal NULL — mallen exakt.

## 3. Signaturtal (cellens pedagogik)

**TRIONS VÄRDERING–KAPITALÅTERKOMST-KONTRAST**: Mizuho bär trions HÖGSTA ROE
(12,49 % mot 9,46/8,57) på trions LÄGSTA P/E (15,17 mot 20,69/20,72) — bäst betald
kapitalåterkomst i cellen, medan syskonen handlas på räntevändningspremium
(prognosTillväxt +53,2/+49,4 % mot Mizuhos +12,0 %: marknaden prissatt MUFG/SMFG:s
INKOMSTLÄGE, Mizuhos STIGE). ROE−WACC +11,1 pp = trions bredaste. P/B-vändningen:
Mizhuho trions HÖGSTA P/B (1,77 mot 1,68/1,58) men under grenens median 2,12 —
högre E-avkastning bärs av högre bokvärdespris men lägre vinstpris: multipelmatrisen
i en cell. (Mizhuho → Mizuho i denna mening: trions högsta P/B 1,77.)

**FEM RAKA VINSTÅR**: netto 530,5→1 248,6 mdr JPY (+135 % totalt; nettoCAGR
+23,87 %/år — trions enda raka femårsbana: MUFG null negativ FY2022-bas, SMFG
FY2025-dipp −45,3 %). Marginaltrappan 18,9→28,4 % med TTM 29,1. P/E-trappan
7,49→8,57→11,37→11,37→11,89 med nuvarande 15,17 = samma MONSTER som 8306.T:
multipeln EXPANDERAR med vinsten (re-rating utan per-vinst-komprimering).

**RETENTIONSPROFILEN**: payout 26,78 % (trions lägsta) på yield 1,77 % — tre
fjärdedelar av vinsten behålls, EK växer snabbast i trion (9,20→11,59 T JPY på
fyra år, +26 %), återköpsvägen fyrdubblad 102,9→404,3 mdr FY2026, DPS-trappan
80→150 utan avbrott.

**KÄLSPRIDNINGAR (dokumenterade, ärliga)**: (1) CF-mallens netto-rad avviker från
resultaträden FY2025/26 (1 190,1/1 622,3 mot 885,4/1 248,6 mdr — S&P:s bankmall;
resultatråd+EPS är kanon: 1 248 632/502,92 = 2 483 M vägt aktietal). (2) Aktietalet
tre baser: BS 2 434 M slut jun-26 · overview 2,42 Mdr · vägt 2 483 M FY2026-EPS-
identiteten. (3) NETTKASSA-baserna: statistics-kassa 119,45 T ger källans net
cash-rad 44 152 642 EXAKT; BS-sidans bredare portfölj (kassa+alla investeringar
173,59 T inkl. handelsportföljen 40,3 T) dokumenterad — MUFG:s bas hade EN
konsistens, Mizuho bär två (dokumenterat i paranoid). (4) Källans industry
"Banks—Regional" mot 8306.T:s "Diversified" — källintern klassning utan åtgärd.

## 4. Kvartiler + universumjämförelse (uppgiftens kärna)

**Projektets egen motor** (raknaBranschMedianer via jiti, före→efter):
- finans P/E **14,7→14,9** (n 25→26; kvartiler 12,6–20,5 → 12,7–20,5)
- totalt P/E **20,7→20,7** (n 203→204 av 214)
- finans resultatCAGR-median **12,2→13,7 %** (n 18→19) — Mizuhos 23,9 % flyttar
  medianen ( jämn→udda n: 10:e värdet mot snittet 9:e/10:e)

**Placering**: 8411.T P/E 15,17 = rad 14 av 26 i finans — PRECIS ÖVER medianen
14,9, mitt i kvartilspridningen (P25 12,7 · P75 20,5); universumrad 57 av 204
(universummedian 20,7 — undre halvan). P/B 1,77 = rad 8 av 26 (under medianen 2,1).
resultatCAGR 23,9 % = rad 17 av 19 = **TOPPKVARTILEN** (3:e högsta i grenen;
universumrad 139 av 173 mot universummedian 4,8 %). ROE 12,5 % = rad 7 av 26 —
UNDER grenens median 14 % (trions högsta, grenens inte: kapitalrikedomen).

## 5. KVD

- **Aritmetikgrind**: 17 kraav, körning 1 = 14/17 (3 RÖDA = egna enhetsbuggar i
  skriptets konstanter, mdr/M-förväxling) ⇒ ABORT, filen orörd — rättade,
  körning 2 = **17/17 GRÖNA** FÖRE skrivning. (v209-u3:s mönster: grinden
  bevisad i praktiken.)
- **Readback ×2**: 214/214 stabilt vid insättningstillfället.
- **CLOBBER + ÅTERSTÄLLNING**: prod-synkens git-fas återställde universum+llms
  till HEAD-213 under KVD-fönstret (v209-u3/s2-u2-precedenserna — femte
  dokumenterade besöket). Kurerad exakt enligt omg13/14/15-konventionen:
  om-insert + om-regen (idempotenta skript, samma aritmetiklogg GRÖN) +
  commit i EN sekvens FÖRE nästa synkcykel (omg12-skärpningen).
- **llms.txt HELREGEN** 214-läget (_s2u1o21-llms-regen.mjs; K2: fil ==
  regen(disk), round-trip GRÖN): total 213→214 · finansraden n 25→26 ·
  aspektradens median 12,2→13,7 % (n 18→19) · universum-CAGR 4,8 % (n 173).
- **Läckagevakt v98**: GRÖN 0 träffar (213-tickers-mätning i 1 573 utdatafiler
  + om-mätning efter om-insert på 214-läget). Dataset-kontraktet §1 håller.
- **src/ orörd** = INGET bygge (Vonovia-precedensen; git status src/ = 0). inga
  nya publicerade URL:ar (Japan/finans matta 3 < MIN_MATTA 5 ⇒ landaspektsidan
  förblir opublicerad; aspektsidor 193→193; sitemap dynamisk ur trädet).
- **R2 orörd** · **data/blogg/ orörd** · utkast-mappen orörd · syskonytor orörda
  (u2/u3 levererar under eget ägarskap; ride-along enligt BASF-precedensen om
  deras rader finns på disk vid min commit — elementvis bevarade).
- **Juridikgrinden**: allt utbildningsformulerat (2007:528); dataset-ytor endast
  aggregat.

## 6. FIFO + kö-notiser

- 8411.T nästa rapp **2026-11-13** (H1 FY2027 — trions gemensamma datum:
  8306.T/8316.T samma dag).
- Till spåret: CF-vs-resultaträdes-konventionen (S&P-bankmallens netto-avvikelse)
  worth en notis i nyckeltalsguidens källavsnitt; Japan/finans → 4 behövs för
  matta 5 (kandidat: Japan Post Bank 7182.T eller Norinchukin — ej sonderade).

## 7. Leverans

LEVERANS: data/portfolj-system/bolagsunivers.json, public/llms.txt,
data/forskning/S2-U1-MIZUHO-8411T-UTOKNING-OMG21.md,
verktyg/_s2u1o21-universum-inlagg.mjs, verktyg/_s2u1o21-llms-regen.mjs, worklog.md
