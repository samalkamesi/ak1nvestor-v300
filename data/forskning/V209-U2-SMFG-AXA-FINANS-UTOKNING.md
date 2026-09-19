# V209-U2 — DATASET-DJUP +2 BOLAG: SMFG 8316.T + AXA CS.PA (Japan/Frankrike finans) — universum 208→210, könotisens arv infriat

**Fabriksagent v209-u2 (manifest v209-datasetdjup-1789850833630, byggare 2/3, spår 2 dataset-djup). 2026-09-19 ~23:5x lokal.**

## VAL (differentiering + könotis-arvet)

Föregångarens könotis (omg19-u1:s bokföring): **"SMFG + AXA lediga (u2:notis)"** — exakt +2 bolag, u2-rollens
arv. Koordinatkoll före val: 8316.T/CS.PA fanns ej i bolagsunivers.json (dublettskydd i inläggsskriptet,
ABORT-grind). Syskonens differentiering bekräftad på disk: **u1 tog VWS.CO (Danmark/energi)** — min läsning
fann universumet 208 (207+VWS) vid start, noll överlapp med mina celler; u3:s +3 (annat cellval) påverkade
ej inlägget (append efter sista raden, deras rader orörda). BASF-precedensen: u1:s VWS-rad bars ride-along i
min commit av den delade universumfilen.

Cellvalens pedagogik: **Japan/finans 1→2** (megabank-trions andra ben bredvid 8306.T) + **Frankrike/finans
1→2** (BNP banken + AXA försäkringen — eurozons andra ekonomis andra finansben). Finans 23→25, Japan 8→9,
Frankrike 5→6. Ingen nytt land ⇒ **land.ts-modulen orörd** (KVD-villkoret "om nytt land föds" ej utlöst —
Japan/Frankrike finns sedan tidigare i src/lib/dataset-aspekter/land.ts).

## RÅDATA (källa: StockAnalysis/S&P Global Market Intelligence, hämtat 2026-09-19, close 2026-09-18)

### SMFG — Sumitomo Mitsui Financial Group, TYO 8316, JPY (översikt + statistics + financials)

| Tal | Värde | Replik |
|---|---|---|
| Pris | 6 830,00 JPY | close 2026-09-18 15:30 JST (−0,70 %) |
| Mcap | 25,69 T JPY | 3,76 Mdr × 6 830 = 25 681 mdr — 0,04 % |
| P/E | 20,72 | **6 830/329,62 = 20,721 EXAKT** |
| Forward P/E | 13,87 | prognosTillväxt +49,40 % = 20,72/13,87 − 1 (MUFG-modellen) |
| P/B | 1,58 | 6 830/(16 240/3,76) = 1,581; BVPS-raden 4 238,67 ⇒ 1,611 (+2,0 % — vägt aktietal 3,834 Mdr, HEN3/JNJ-klassen) |
| Utdelning | 180 JPY (2,64 %) | 180/6 830 = 2,635 % EXAKT · payout 180/329,62 = 54,61 % |
| TTM rev | 4 715,949 mdr (+40,9 %) | omsattningTillvaxtTTM 0,409 |
| TTM netto | 1 262,031 mdr (+154,6 %) | nettoMarginal 1 262 031/4 715 949 = **26,76 % EXAKT** (statistics-raden 27,82 % bär annat fönster) |
| FY-serie (apr–mar, mdr JPY) | rev 2 810,9→3 567,4→3 549,2→3 274,7→4 379,3 · netto 499,6→911,8→873,3→478,1→1 137,6 · EPS 121,44→222,63→218,98→122,36→295,99 | nettoCAGR (1 137 557/499 573)^(1/4)−1 = **+22,84 %/år** (positiv bas — mätbar, MUFG:s var NULL) · omsCAGR +11,72 % |
| Balans | kassa 114,33 T · skuld 59,16 T · **NETTOKASSA 55,17 T JPY** (14 667,40/aktie) | EV meningslöst (ITUB/RY-ordlistan) · fcfYield/fcfMarginal NULL (bankpaketet) |
| Övrigt | ROE 8,57 % (TTM-slut-EK-replik 7,77 % — källan bär snitt-EK) · WACC 1,93 % · beta 0,39 · 52v 3 868–7 260 (−5,9 % från toppen) · institutioner 41,16 % · ex-div 2026-09-29 · rapp 2026-11-13 · 123 000 anställda | FY2025-dippen netto 478,1 mdr (−45,3 % YoY) orsak ej redovisad i källpaketet — dokumenterad som den är, ingen spekulation |

### AXA — CS.PA Euronext Paris, EUR (översikt + statistics + financials)

| Tal | Värde | Replik |
|---|---|---|
| Pris | 44,73 EUR | close 2026-09-18 17:39 CET (−0,73 %) |
| Mcap | 90,50 mdr EUR | 2,02 × 44,73 = 90,35 — 0,17 % |
| P/E | 12,07 | **MULTI-EPS-PEDAGOGEN**: källans EPS-rad 4,79 ger replik 9,34; P/E-raden 12,07 implicerar EPS 3,705 (rapporterat); payout-raden 51,67 % implicerar 4,49 — TRE EPS-VARIANTER i källpaketet; huvudfältet bär källans P/E-rad, alla tre dokumenterade |
| Forward P/E | 10,32 | prognosTillväxt +16,96 % = 12,07/10,32 − 1 (källans 3-års EPS-prognos +7,54 % som kalibreringsnot) |
| P/B | 1,77 | BVPS-raden 22,09 ⇒ replik 2,024 (+14 % — totalt EK inkl minoritet/hybrids mot common-EK; HDFC:s BVPS-klass i större skala) |
| Utdelning | 2,32 EUR (5,19 %) | **2,32/44,73 = 5,187 % EXAKT** · payout 51,67 % (källa; på justerad EPS 48,4 % — multi-EPS igen) |
| TTM | rev 96,794 mdr (+3,8 %) · netto 9,883 mdr (+29,0 %) · FCF 14,501 mdr | nettoMarginal 9 883/96 794 = 10,21 % · fcfYield 14 501/90 500 = 16,02 % · fcfMarginal 14,98 % (TRYG/SAMPO-försäkringskonventionen med ALV/BRK-reservationen: premieflöden, ej utdelningsbar kassa) |
| FY-serie (kalenderår, mdr EUR) | rev 122,171→86,793→85,717→91,255→94,691 · netto 7,100→4,879→7,004→7,685→9,623 · EPS 2,97→2,12→3,12→3,50→4,53 · FCF 6,176→8,307→3,573→11,402→22,242 | **IFRS 17/9-BROTTET**: FY2021 pre-IFRS17 mot FY2022+ restaterat ⇒ 5-års omsCAGR −6,17 %/år = baseffekt (Holcim/GSK-scope-klassen); konsekvent IFRS17-bas FY2022→FY2025 = +2,95 %/år (dokumenterad not) · nettoCAGR +7,90 %/år (positiv bas) |
| Balans | kassa 99,86 · skuld 61,11 · nettokassa 42,59 mdr (−21,05/aktie) | evEbit NULL med dokumentation (kundmedelsnettokassa gör EV till glädjesiffra) |
| Övrigt | ROE 14,88 % (BVPS-EK-replik 22,1 % — källan bär totalt EK ≈ 66,4 mdr) · ROIC 7,47 % · WACC 4,83 % · beta 0,58 · 52v 36,55–45,66 (−2,0 % från toppen) · institutioner 33,60 % · analytiker Buy 18 st PT 52,01 (+16,28 %) · rapp 2026-10-29 · 107 756 anställda · segment FY2025: P&C 58,0 · Life 37,5 · Health 19,0 mdr | ebitMarginal 10 418/94 691 = 11,00 % |

## KVARTILER + UNIVERSUMJÄMFÖRELSE (uppgiftens kärna — beräknat ur diskens 210-läge)

Finansgrenen: 25 bolag · P/E median 14,7 [P25 12,6 – P75 20,5] n=25 · P/B median 2,2.
Resultat-CAGR-poolen: finans median 12,2 % [6,6–15,2] n=18 · universum median 4,6 % n=169.
Universum totalt: P/E median 20,6 (n=200 av 210).

| Bolag | Mått | Finans-placering | Universum-placering | Läsa |
|---|---|---|---|---|
| SMFG | P/E 20,72 | rad 21/25 — på P75-gränsen (20,5) | rad 102/200, median 20,6 — **precis på universummedianen** | den japanska megabanken prissatt som genomsnittet av hela universumet trots toppkvartilens tillväxt |
| SMFG | resultatCAGR 22,8 % | rad 16/18 — **toppkvartilen** (> P75 15,2) | rad 134/169 | växten prissatt: PEG 0,42 spår |
| AXA | P/E 12,07 | rad 5/25 — **nedre kvartilen** (< P25 12,6) | rad 33/200 | euroförsäkringens värdeklass mot BNP 8,72 i samma cell |
| AXA | resultatCAGR 7,9 % | rad 6/18 — under median 12,2, över P25 6,6 | rad 98/169 — strax ovan universummedianen 4,6 | mitten-låg tillväxt, låg multipel — datasetets jämförelserad, ingen signal |

Kontrastparet SMFG/AXA är cellens pedagogiska utdelning: **samma bransch, samma kvartalsdata-rytm, två
motsatta hörn av värdering-tillväxt-planet** — och multipel-intuitionen (lågt P/E = "billigt") kompliceras av
AXA:s tre EPS-varianter (12,07 på rapporterat mot 9,34 på justerat = 29 % skillnad i samma bolag samma dag).

## KVD — GRÖN

1. **Protokoll-FIL med rådata**: denna fil (mönster S2-U1-HDFC-OMG19).
2. **Tal-paritet**: EXAKTA repliker där källan bär grunderna (SMFG P/E/yield/nettoMarginal/payout; AXA
   yield/mcap/nettoMarginal) — icke-replikerbara källrader (AXA P/E/payout på andra EPS-baser, SMFG
   statistics-nettoMarginal 27,82 %) dokumenterade med implicita värden, ALDRIG tysta.
3. **Läckagevakt ×2**: inläggsskriptet läste universumet tillbaka TVÅ gånger — 210/210 stabilt, nya raders
   tal-paritet kontrollerad i readback. Dessutom: **v98-dataset-vakt GRÖN** (210 tickers + 210 namn, 0 träffar
   i 1 573 utdatafiler) och **_s2u2o19-lackagevakt GRÖN** ( färsk körning, 371 sökningar, 0 träffar på
   dataset-ytorna). Kontraktstestet testa-dataset-aspekter.mjs faller på EXISTERANDE tilläggslös
   TS-import i dataset-medianer.ts (src/ orörd av mig — ej min yta, v98 + s2u2o19-vakten bär
   kontraktsbevisen; noteras till huvudagenten).
4. **llms.txt-regen HELREGEN**: _v209u2-llms-regen.mjs (kanoniska kroppen) — körningen bevisade
   **K2-konvervens: fil == regen(disk) på 210-läget** ("redan konvergent — ingen skrivning": u1:s regen hade
   fångat mina rader ride-along; min körning = det oberoende beviset). **LIVE-verifierat**:
   https://lab.ak1nvestor.com/llms.txt servar 210-läget (public/ läses från disk i pm2-drift — ingen ombyggnad
   krävs).
5. **Sitemap**: dynamisk ur lasBranschMedianer (src/app/sitemap.ts) — dataset-URL:er + lastModified bärs av
   rådatum; inga nya URL:er (befintlig bransch), src orörd. Talen på branschsidorna uppdateras vid prod-synkens
   nästa bygge (pumporna äger deploy-fönstret).
6. **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel, exit 0** (beviskörning; src/ orörd =
   inget bygge).
7. **Prod 200**: `/` 200 · `/dataset` 200 · `/dataset/finans` 200 · `/llms.txt` LIVE 210.
8. **Juridikgrinden (2007:528)**: ALLT utbildningsformulerat — notering-fälten slutar "ALDRIG köp-/säljsignaler";
   dataset-ytorna bär endast aggregat (medianer/kvartiler/n) enligt A2-kontraktet §1, bevisat av v98 GRÖN.
9. **R2**: priser/tier/publicering orörda · data/blogg/ orörd (inga utkast behövdes) · .env/nycklar orörda ·
   ingen installering/inget bygge.

## LEVERANS

`data/portfolj-system/bolagsunivers.json` (+2 rader: 8316.T, CS.PA; u1:s VWS.CO ride-alang enligt
BASF-precedensen) · `public/llms.txt` (K2-konvergent på 210) · `verktyg/_v209u2-universum-inlagg.mjs` ·
`verktyg/_v209u2-llms-regen.mjs` · `data/forskning/V209-U2-SMFG-AXA-FINANS-UTOKNING.md` (denna fil) ·
`worklog.md`.

Kö-notiser till nästa omgång: **Mizuho 8411.T** fullbordar megabank-trion (SMFG-notisens spegel) ·
**Allianz SIE.DE** = euroförsäkringens andra ben (TRYG-konventionens ALV/BRK-not är skriven för den) ·
AXA-multi-EPS-läxan (läs vilken EPS multipeln står på) är en kandidat för nyckeltalsguiden-aspektsidan.
