# S2-U2 KINA-DUBLING BIDU+NTES — utökning omgång 32 (manifest auto-s2-1790657113931, byggare 2/3)

Datum: 2026-09-29 · Agent: fabriksbarn s2-u2 · Spår 2 DATASET-DJUP

## 1. VAL (anspråk disk-först FÖRE all datahämtning)

`data/vakten/auto-s2-1790657113931-s2-u2-ansprak.md` skrevs FÖRE första källhämtningen.

**KINA-DUBLING: Baidu, Inc. (BIDU) → Kina/teknik 1→2 (TCEHY+BIDU) och
NetEase, Inc. (NTES) → Kina/konsument 1→2 (BABA+NTES).**

Motivering:
- Kina = världens näst största ekonomi med blott 2 bolag i universumet (316 vid
  planeringen) — det största landsgapet (Indien 13, Brasilien 5, Sydkorea 2).
- Två n=1-celler dubblas i EN leverans; Kina 2→4 bolag i två grenar.
- Signaturpedagogik: Kinas internet-arketyper — Alibaba (e-handel), Tencent
  (social/plattform), Baidu (sök+AI-moln), NetEase (spel+musik) — fyra
  moat-modeller i en ekonomi, alla fyra USD-ADR med CNY-rapportering.
- Källkanal: båda NASDAQ-ADR:er → StockAnalysis-kanon exakt som BABA/TCEHY.

## 2. DUPLIKATKONTROLL

- bolagsunivers.json: `grep -oi "bidu\|netease\|baidu"` = 0 träffar. NTES-träffen
  på HDFCBANK.NS var "RÄNTESPRIDNING" (RÄN-TES) — falsk positiv, verifierad med
  kontextutskrift. Worklog-träffar = "VÄNTESTATUS" (VÄN-TES), falska positiva.
- Kina-cellerna före: endast BABA (konsument, hamtat 2026-09-17) + TCEHY (teknik).
- PDD/JD (OMG29-förlorade namn) medvetet UNDVIKTA — dataägarens
  återställningskoordinater respekteras (worklog 17324).

## 3. KÄLLOR (ALLT live-hämtat 2026-09-29)

StockAnalysis (underlag S&P Global Market Intelligence + Fiscal.ai) med
no_cache=true (omg30-läxan: SA-cache bär stale data):
- BIDU: overview + statistics + financials (fullständig resultaträkning).
- NTES: statistics + financials.
- Kurskanon: close 2026-09-28 16:00 PM EDT — BIDU 86,97 $ · NTES 121,04 $
  (+4,88 % på dagen).
- **Yahoo chart-API paranoid: BIDU 86,97 = 0,00 % band EXAKT · NTES 121,04 =
  0,00 % band EXAKT** (verktyg/_s2u2o32-paranoid.mjs; prev close 92,21/117,47).
- ADR-konventionen (BABA-precedensen): kurs/mcap/TTM-derivat i USD, serier i
  koncernrapportvaluta CNY, kalenderår (enklare än BABA:s april–mars).

## 4. ARITMETIKGRIND (verktyg/_s2u2o32-aritmetikgrind.mjs) — 56/56 GRÖN FÖRE skrivning

Tre egna fel ärligt kurerade FÖRE grönt (omg30-kulturen):
1. N03 enhetsbugg: `NI×1000/aktier×5` → `NI/aktier×5` (1000-faktorn fel i egen
   replikformel, inte i data).
2. R01 rangpåstående felvändt: NTES P/E 16,17 ligger UNDER medianen (112/306),
   inte över — påståendet rättat till det faktiska.
3. R03 rangpåstående: brutto 67,15 % är 0,15 pp UNDER P75 (67,3), inte över —
   "klart över medianen 47,76 % och blott 0,15 pp under P75".

Nyckelrepliker (alla GRÖNA):
- BIDU: EV-kedja 29,72+16,62−24,47 = 21,87 mot 21,86 · P/B BVPS-bas
  86,97/117,81 = 0,738 mot 0,74 · mcap/EK = 0,684 (DUAL-BAS dokumenterad:
  EK/aktie 127,13 mot källans BVPS 117,81 = dual-klass-aktiebas 7,3 %) ·
  EV/EBIT 21,86/1,30 = 16,82 mot 16,88 · fcfYield −6,36 % mot −6,37 ·
  PS 1,586 mot 1,59 · EV/EBITDA 6,355 mot 6,35 · D/E 0,3826 mot 0,38 ·
  brutto 40,88 % mot 40,87 · nettomarginal-replik −3,70 % mot källans
  FÄLT −2,90 % (dokumenterad källspridning; CNY-financials TTM −3,70 stödjer
  repliken) · LPS-replik −2,03 mot källans −2,32 (EPS-bas, dokumenterad).
- BIDU-CAGR: oms (129079/124493)^(1/4)−1 = +0,91 % · netto
  (4663/9876)^(1/4)−1 = −17,11 % · moat-medel 48,55 % spread 7,81 pp.
- NTES: P/E 121,04/7,48 = 16,182 mot 16,17 · P/B mcap/EK = 3,0645 mot 3,07 ·
  **ADR 5:1-BEVIS: NI/ordinary × 5 = 4,79/3,20×5 = 7,484 = källans EPS 7,48
  (per ADR)** · EV/EBIT 54,11/6,05 = 8,944 mot 8,95 · EV-kedja 53,45 mot
  källans 54,11 (1,2 % källbas) · prognosTillväxt 16,17/12,24−1 = +32,11 %
  (spårets konvention; källans EPSF3Y +10,83 % som not) · PEG 16,17/32,11 =
  0,50 · utdelning 2,92 $/ADR ÷ 5 × 3,20 mdr = 1,869 mdr $ = NI × payout
  1,866 ✓ dubbelstängd.
- NTES-CAGR: oms (112626/87606)^(1/4)−1 = +6,48 % · netto
  (33760/16857)^(1/4)−1 = +18,96 % · moat-medel 59,21 % spread 10,66 pp.
- NTES ROIC-FÄLTETS ARTEFAKT dokumenterad: källans 368,26 % beror på negativt
  investerat kapital (EK 25,26 − kassa 25,82 = −0,56 mdr $); fältet speglas med
  artefakt-not; ROE 20,37 mot WACC 8,44 = +11,93 pp bär.
- BIDU pe=null + prognosTillväxt=null: TTM-netto −693,23 M $ negativt;
  ELUX-precedensens null-konvention; fwd P/E 12,69 + EPSF3Y +3,04 % + PT +67,47 %
  (32 analytiker) som notiser.

## 5. APPEND (verktyg/_s2u2o32-append.mjs)

- Mutex (mkdir-lås, omg29-u3:s clobber-läxa) · append på diskens FAKTISKA läge.
- **317 → 319 rader** (prefix-sha256 1ec8bea4d2bf2fe0 → ab61dff3c6796d55) —
  diskens 317-läge innehöll syskonet u1:s Veolia Environnement VIE.PA
  (Frankrike/industri, ännu ej committad vid mitt fönster — RACE 20, se §9).
- Prefix-bit-identiskt bevis + läs-tillbaka ×2 GRÖNA; källvärdes-identiteter
  dubbelstängda i skriptet FÖRE writeFileSync.
- **Idempotens bevisad: andra körningen "IDEMPOTENT: BIDU finns — inget skrivs".**
- Kina efter: BABA·TCEHY·BIDU·NTES · teknik n=33 · konsument n=43.

## 6. KVARTILER (före → efter) + UNIVERSUMJÄMFÖRELSE

- teknik P/B 4,63 → 4,49 (P25 2,62→2,45; BIDU 0,74 drar) · teknik EBIT-marginal
  21,47 → 21,22 % (P25 11,86→11,20; BIDU 6,91 drar) · teknik P/E median
  OFÖRÄNDRAD 21,57 (BIDU pe=null, n 32→32).
- konsument P/E 20,04 → 19,88 (NTES 16,17) · P/B 3,62 → 3,35 (NTES 3,07) ·
  EBIT-marginal 15,76 → 16,04 % (NTES 35,23 lyfter; P25 8,64→8,94, P75
  25,42→25,93) · resCAGR 5,13 → 5,64 % (P75 12,24→12,97; NTES +18,96 lyfter).
- TOTALT P/E 19,83 → 19,81 (n 305→306) · resCAGR median 2,36 stabil men
  P75 14,72 → 15,00 (n 317→319).
- Rang: NTES P/E 16,17 = 112/306 UNDER medianen 19,8 · NTES EV/EBIT 8,95 =
  31/291 botten-kvartilen · NTES brutto 67,15 % = 218/292 (0,15 pp under P75) ·
  NTES resCAGR 205/269 · BIDU P/B 0,74 = 19/316 under-book-kvartilen · BIDU
  EV/EBIT 16,88 = 145/291 (medianklass) · BIDU resCAGR −17,11 % = 45/269 under
  P25. Två motpoler i en leverans: BIDU (0,74 × under-book på värdeförstörande
  marginaler) mot NTES (botten-EV/EBIT på 35 %-EBIT och 9,8 % FCF-yield).

## 7. SIGNATURTAL (protokoll-kärnan)

**BAIDU** — annons-maskinens omställningsår: (1) FY2024-segmenten M CNY:
Online Marketing 72 972 = 55 % av omsättningen, Cloud 21 860, iQIYI 29 225 —
tre affärsmodeller i en balansräkning; (2) nettokollapsen 9 876→6 968→19 598→
23 172→4 663 M CNY (FY2025 −79,9 % från topp; resCAGR −17,11 %) medan
bruttomarginalen glider 48,47→43,88 %; (3) FCF-vändsligan +9,2→+17,9→+25,4→
+13,1→−15,1 mdr med FY2025 som UNIVERSUMETS FÖRSTA negativa OCF-år (−3 013 M)
under capex-trappan — ett steg djupare än ORCL/BABA-klassens AI-capex-år;
(4) ändå nettokassa 7,85 mdr $ (22,99 $/aktie) och EV 21,86 < mcap 29,72;
(5) ROIC 3,44 mot WACC 5,37 = −1,93 pp (Kina-familjens andra värdeförstörande
marginal; BABA −3,33); (6) Altman 2,15 GRÅZON (INPEX-speglingen); (7)
risk-notis: securities class actions klassperiod 2025-11-18–2026-08-17,
deadline 2026-11-13 (källans nyhetsflöde, inga slutsatser).

**NETEASE** — marginal-elevatoren: (1) bruttotrappan 53,62→54,68→60,95→62,50→
64,28 % fem raka år (BABA 38,6 i samma ekonomi — konsument-grenens Kina-duo
som pedagogik); (2) fem raka vinstår 16 857→33 760 M CNY, resCAGR +18,96 %
på omsättning +6,48 % — vinsten växer tre gånger snabbare än intäkterna;
(3) kassafästningen: nettokassa 23,96 mdr $ = 31 % av mcap, D/E 0,07,
räntetäckning 122,84×, Altman 8,53; (4) ADR 5:1-pedagogiken — källans egna
fält bär beviset (EPS 7,48 $ per ADR = NI/ordinary 1,497 × 5; nettokassa
7,48 $/aktie och FCF 2,36 $/aktie per ORDINARY — samma siffra i två serier);
(5) FCF-payout 123,78 % — utdelningen överstiger årets FCF medan FCF-serien är
5/5 positiv (kassaberget finansierar mellanskillnaden); (6) insider 45,32 %
(Ding Leis grundarkontroll); (7) ROE 20,37 mot WACC 8,44 = +11,93 pp
(tillväxtmarknadens moat-gap-familj: Bharti +10,54 / Sun Pharma +14,08).

## 8. KVD — ALLA GRINDAR

| Grind | Resultat |
|---|---|
| Aritmetikgrind (egen) | 56/56 GRÖN FÖRE skrivning (3 egna fel kurerade) |
| Append | prefix-bit-identisk ×2 · idempotens bevisad · mutex |
| llms.txt HELREGEN | 319-läget, 11 branscher, rådata 2026-09-29; BYGGGRIND: samtliga släppta; LIVE (13 träffar "319 bolag" i prod-svaret) |
| Läckagevakt v98 | GRÖN 0 träffar — 319 tickers + 319 namn i 1 755 utdatafiler |
| Kontraktstest | 189 sidkontroller / 0 FEL (61 null = gränsregel, ej fel) |
| tsc --noEmit | 0 fel (projektbinär; INGEN src-ändring — data-vägen) |
| Prod | 200 ×3: / · /llms.txt · /dataset |
| R2 | orörd (inga priser/tier/publicering) |
| data/blogg/ | orörd (inga utkast publicerade) |
| Juridikgrind | allt utbildning, aldrig råd (2007:528) — noteringarna beskrivande |

Bolagssidorna /bolag/bidu + /bolag/ntes föds datadrivet vid nästa gröna bygg
(generateStaticParams + sitemap samma grind — artefaktklassen C17/o113, ägd av
prod-synken/kraschvakten). Landaspekten Kina når 4 < mattan 5 → ingen ny
landaspektsida (data-vägen hel).

## 9. RACE 20 mot syskonen

- u1:s Veolia VIE.PA (Frankrike/industri) landade PÅ DISK före mitt append-fönster
  (317-läget), EJ committad vid mitt fönster — deras rad RIDE-ALONG i min
  bolagsunivers-commit med öppen attribution (omg30-mönstret 738e1ad3; deras
  koordinater respekterade, mina fält RÖR EJ deras rad).
- u3 (+3) ej synlig vid skrivandet — anspråksläget i deras log.
- Könotiser: Kina når 4 — ETT tillskott till (→5) föder kina-landaspekten
  (mattan); PDD/JD = dataägarens OMG29-koordinater, fortfarande ej återställda.

## 10. FIFO (nästa rapp)

- BIDU Q3 2026: **2026-11-17 BMO** (källans Next Earnings Date, CONFIRMED).
- NTES Q3 2026: november (senaste rapport 2026-08-20 Q2; ex-div 2026-09-03;
  exakt datum ej källbelagt vid hämtningen).

## 11. LEVERANS

- data/portfolj-system/bolagsunivers.json (+2 rader: BIDU, NTES; ride-along u1:s
  VIE.PA-redan-på-disk)
- public/llms.txt (HELGAL Dataset-sektion på 319)
- verktyg/_s2u2o32-paranoid.mjs · _s2u2o32-aritmetikgrind.mjs · _s2u2o32-append.mjs
- data/vakten/auto-s2-1790657113931-s2-u2-ansprak.md
- detta protokoll + worklog-rad
