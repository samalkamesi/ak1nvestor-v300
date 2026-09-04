# R3 · Peer-gruppsnormalisering — bolagets AKM2 mot branschmedianen ("bättre än sina peer" vs absolut poäng)

**Forskningsområde:** AKM3-fråga 3 — hur ska en kund kunna skilja på "högt betyg i en svag bransch" och "medel betyg i en stark bransch"?
**Forskare:** R3 (peer-normalisering) · **Datum:** 2026-09-04 · **Status:** Designförslag — INGET BYGGT (implementeringsskiss i §4).
Pedagogisk forskning för AK1A Research Lab. Inget i detta dokument är investeringsråd.

**Underlag:** `data/portfolj-system/korstabell-grund.json` (100 bolag, 2026-09-03), `src/lib/akm2/moduler/index.ts`, `data/cache/akm1-{TICKER}.json` (per-variabelpoäng), `src/components/ak1a/portfolj-forskning/korstabell.tsx`, `src/app/analyser/[ticker]/page.tsx`.

---

## 0. Sammanfattning (TL;DR)

Korstabellens 100 bolag är **perfekt balanserade: 10 branscher × 10 bolag** — peer-grupperna är tillräckligt stora för rank/median-metodik men **för små för z-score** (MAD kan kollapsa, se §1.2). Branschmedianerna i AKM2 skiljer **20 poäng**: finans 41, material 42, tillväxt 43 mot teknik 61, konsument 60,5. Konsekvens: **AAPL (akm2 = 60) ligger UNDER sin branschmedian, medan Öresund (akm2 = 55) ligger ÖVER sin** — den absoluta poängen döljer vem som egentligen slår sitt sällskap. Branschskillnaden är delvis designad: BANK-modulen stänger av V21/V28 för finans, CYKLISK-modulen tonar ner V28 för materiellt — modulerna anpassar redan *viktprofilen* per bransch, men ingen visar *var bolaget står i sitt sällskap*.

Förslag: tre deterministiska, rent presenterande peer-mått — **peerPercentil** (rank inom bransch), **branschdrag** (akm2 − branschmedian) och **per-variabel branschmedian-jämförelse** ("V07 bruttomarginal: 4 mot branschmedian 3 — över halva sitt sällskap"). Poängnivån finns redan i cachen, så variabeljämförelsen kräver ingen ny datainsamling. Peer blir ett **läslager, aldrig en poängkomponent** (modulerna sköter branschanpassningen; dubbelräkningsrisken är huvudargumentet, se rekommendation 3).

---

## 1. Forskningsläge: relativ vs absolut bedömning

### 1.1 Sektorneutrala faktorportföljer — standardmetoden i praktiken

Branschneturalisering är etablerad teknik inom faktorinvestering: QuantRockets genomgång beskriver hur man hedge:r sektorsnackfall genom att **ranka bolagen inom sin sektor i stället för mot hela universet** ([QuantRocket: Sector Neutralization](https://www.quantrocket.com/blog/sector-neutralization/)). Saral sammanfattar kärnan identiskt med vår fråga: z-score beräknas **inom varje sektor** — "en bank jämförs mot banker, ett IT-bolag mot IT-bolag" ([Saral: Sector-Neutral Factor Investing](https://saral.money/blog/sector-neutral-factor-investing/)). BlackRocks faktorbox-metodologi använder z-scores för att uttrycka hur många standardavvikelser en exponering ligger från universet ([BlackRock: Factor Box Methodology](https://www.blackrock.com/us/financial-professionals/tools/factor-box-methodology)).

**Men evidensen är inte entydig.** Alpha Architect ifrågasätter om sektorneutralisering alltid hjälper ([Is Sector Neutrality in Factor Investing a Mistake?](https://alphaarchitect.com/is-sector-neutrality-in-factor-investing-a-mistake/)), Klement visar att sektorneutralitet gagnar *long-short*-strategier eftersom cross-sector bets bidrar mindre konsistent än intra-sector bets ([Klement: Sector Neutral or Not?](https://klementoninvesting.substack.com/p/sector-neutral-or-not)), och Quantpedia noterar att den sektorneutrala värdefaktorn är mindre volatil men inte självklart högre avkastande ([Quantpedia](https://quantpedia.com/should-factor-investors-neutralize-the-sector-exposure/)).

**Slutsats för AKM3:** AK1A är ett lång-only pedagogiskt univers på 100 bolag — inte en long-short-faktorportfölj. Det starka läget är därför inte att *ersätta* absolut poäng med relativ, utan att **visa båda läsningarna sida vid sida**. Syntax påpekar också att "sektorneutral" kan betyda viktmatchning mot benchmark, inte bara omräkning ([Syntax: Redefining Sector Neutral](https://www.syntaxdata.com/research/redefining-sector-neutral)) — vår variant är den tredje: presenteringsnivåns normalisering.

### 1.2 Z-score per sektor — och varför den INTE passar grupper på 10

Z-score-metodiken bygger på medelvärde/standardavvikelse, men små grupper gör båda olämliga: enstaka outliers förvränger själva referensmåttet. Litteraturen om robust standardisering (modifierad z-score = 0,6745·(x−median)/MAD, konstanten 1/1,4826) löser medelfällan men har sitt eget småsamplingsproblem: **MAD kan kollapsa till noll** när mer än hälften av värdena sammanfaller — då blir den robusta z-scoren odefinierad ([Cross Validated: robust z-scores with median and MAD](https://stats.stackexchange.com/questions/523865/calculating-robust-z-scores-with-median-and-mad), [Akinshin: Caveats of using MAD](https://aakinshin.net/posts/mad-caveats/), [Oracle: Modified Z-Score](https://docs.oracle.com/en/cloud/saas/freeform/ffuuu/insights_metrics_MODIFIED_Z_SCORE.html), [IBM Cognos](https://www.ibm.com/docs/en/cognos-analytics/12.0.0?topic=terms-modified-z-score)). Moeller (2025) jämför direkt z-standardisering mot **percentilrank-transformen** — rankbaserad, begränsad till 0–100, distributionsfri — och framhåller percentilens fördelar när gruppdistributioner inte är normala ([Moeller, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12239870/)). Inom kreditforskning är winsorisering vid 1:e/99:e percentilen standard för nyckeltal med feta svansar ([NYU Stern, Kim 2012](https://www.stern.nyu.edu/sites/default/files/assets/documents/con_036180.pdf)).

**Slutsats för AKM3:** med n = 10 per bransch väljer vi **rank/median framför z-score**. Percentilrank är deterministisk, distributionsfri, robust mot outliers (NEM 79 i material förvränger ingen referens) och har naturlig granularitet (10 %-steg). PM Research konstaterar visserligen att z-scores behåller *magnitudinformation* som percentiler förlorar ([PM Research](https://www.pm-research.com/content/iijpormgmt%253A%253A%253A43%253A%253A%253A5%253A%253A%253A72.full.pdf)) — den magnituden återköper vi med branschdraget (skillnad mot median i poäng, §3.2).

### 1.3 Relative strength som tankefigur

Relative strength i teknisk analys (prestanda mot benchmark/sekundär jämförelseobjekt) är kusinen till vår fundamentala fråga: StockCharts uttrycker metoden som "utvärdera aktiens prestanda **relativt sin sektor eller industrigrupp**" ([StockCharts ChartSchool](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/price-relative-relative-strength), jfr [Investopedia](https://www.investopedia.com/terms/r/relativestrength.asp), [Fidelity](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/relative-strength-comparison), [TrendSpider](https://trendspider.com/learning-center/relative-strength-analysis/)). Den fundamentala sidan är äldre än den tekniska: klassisk fundamental analys jämför alltid nyckeltal **mot bolagets egen industri** ([ResearchGate: A Review of Fundamental and Technical Stock Analysis Techniques](https://www.researchgate.net/publication/293808249_A_Review_of_Fundamental_and_Technical_Stock_Analysis_Techniques)). AKM3:s peer-mått formaliserar alltså något analytiker gör intuitivt — men gör det deterministiskt och spårbart.

---

## 2. Kundens branschfördelning — räknat ur korstabell-grund.json

### 2.1 Fördelningen: perfekt 10 × 10

Räknat ur `rader` (100 rader, 0 utan bransch, 0 utan akm2):

| bransch | n | AKM2-median | min–max | aktiva moduler (ur modulregistret) |
|---|---|---|---|---|
| teknik | 10 | 61,0 | 37–78 | SaaS + Tillväxt |
| konsument | 10 | 60,5 | 19–70 | Allmän (fallback) |
| industri | 10 | 60,0 | 51–85 | Cyklisk |
| kommunikation | 10 | 60,0 | 39–68 | Allmän (fallback) |
| halso | 10 | 56,5 | 46–66 | Allmän (fallback) |
| energi | 10 | 58,0 | 31–77 | Cyklisk + Tillgångstung |
| fastighet | 10 | 50,0 | 42–60 | Tillgångstung |
| tillvaxt | 10 | 43,0 | 25–58 | Tillväxt |
| material | 10 | 42,0 | 31–79 | Cyklisk + Tillgångstung |
| finans | 10 | 41,0 | 30–80 | Bank |

Global AKM2-median: **55,5** (min 19, max 85). Modulfrekvens i filen: Cyklisk 30×, Allmän 30×, Tillgångstung 30×, Tillväxt 20×, SaaS 10×, Bank 10× — helt konsistent med matchningsreglerna i `src/lib/akm2/moduler/index.ts`.

### 2.2 Tjugo poängs spridning — och vad den betyder

Medianerna klustrar i två läger: **modulrika/anpassade branscher** (teknik 61, konsument 60,5) mot **modul-nedtonade** (finans 41 där Bank stänger av V21/V28; material 42 där Cyklisk tonar ner V28 med 0,85; tillväxt 43). Spridningen är alltså *delvis designad* — modulerna har ändrat viktsammansättningen — men inga ställer frågan "var står bolaget i sitt sällskap?". Konkreta pedagogiska guldkorn ur filen:

- **AAPL akm2 = 60 > global median 55,5, men under teknikmedianen 61** — bra bolag, sisådärt sällskap.
- **ORES.ST akm2 = 55 ≈ global median, men rank 4/10 i finans och +14 mot branschmedianen 41** — bär sin bransch.
- **INVE-B.ST 80 och NEM 79** visar att modul-nedtonade branscher ändå kan producera toppoäng — branschmedian är inte ett tak.
- Sju bolag ligger över global median men under sin branschmedian (bland andra CARL-B.CO, ESSITY-B.ST, ITX.MC, TELIA.ST, ALFA.ST) — exakt den grupp den absoluta läsningen systematiskt missgynner.

### 2.3 Små grupper: är normalisering meningslös under n = 5?

Med **n = 10** är median väldefinierad, percentilrank har 10 %-steg och midrank-metoden hanterar delade värden. Det är precis ovanför tröskeln där metodiken blir meningsfull. **Under n = 5 blir det tunt**: medianen vilar på en enda observation, percentilerna grövre än 25 %-steg, och Moellers/MAD-varningarna träffar i full styrka. Rekommenderad gräns: **peer-fält sätts till `osatt` när gruppen < 5** — motorn gissar aldrig, och "osatt är ett hedervärt svar" (typkontraktets grundregel). OBS också: om universet någon gång delas i underindustrier (GICS-nivå) kollapsar grupperna — peer-skiktet ska hålla sig till de **10 kanoniska branschfamiljerna** i `typer.ts`/`BRANSCHER`.

---

## 3. Design: tre deterministiska peer-mått (läslager, ej poängkomponent)

Alla mått beräknas ur ett fast snitt av korstabellen vid read/build-tid — samma indata ger alltid samma resultat (§3.4).

### 3.1 peerPercentil (0–100) + rank

```
grupp      = { r ∈ rader : r.bransch = b }                    // n = 10 här
sämre      = |{ g ∈ grupp : g.akm2  < r.akm2 }|
lika       = |{ g ∈ grupp : g.akm2 == r.akm2 }| - 1           // exkl. sig själv
peerPercentil = 100 × (sämre + 0,5 × lika) / (n - 1)          // midrank, delad värden
rank       = 1 + |{ g ∈ grupp : g.akm2 > r.akm2 }|            // visas som "4/10"
```

Midrank gör utfallet oberoende av namnsortering (Iglewicz–Hoaglin-standard, jfr §1.2-källorna). Percentilen kompletteras med branschnamn i visningen: "peer 40 · rank 4/10 i Finans".

### 3.2 branschdrag (poäng, tecknad)

```
branschdrag = r.akm2 − median({ g.akm2 : g ∈ grupp })         // t.ex. ORES: 55 − 41 = +14
```

Tolkning: **positivt drag = bolaget bär sin bransch** (akm2 ovanför medianen), **negativt = branschens sällskap bär bolaget**. Detta är "magnitudkomplementet" till percentilen (z-score-förlusten vi valde bort, §1.2). Visas med tecken och färgton (grön/röd nyans), aldrig som eget betyg.

### 3.3 Per-variabel branschmedian-jämförelse — det pedagogiska kärnvapnet

För varje variabel-ID (V01–V20 ur `data/cache/akm1-{TICKER}.json.poang`, V21+ ur `effektivaPoang` på AKM2-sidan) räknas branschmedianen över gruppens poäng (0–5):

```
hallning(Vxx) = r.poang[Vxx] − median({ g.poang[Vxx] : g ∈ grupp })
  > +0,5  → ÖVER   "bättre än sina peer på V07"
  |·| ≤ 0,5 → I NIVÅ
  < −0,5  → UNDER
```

Exempel från datan: en bruttomarginal på 45 % är medioker i teknik men udden i detaljhandel — **V07:s poäng mot branschens medianpoäng visar det på en rad** ("V07 bruttomarginal: 4 mot branschmedian 3 — över halva sitt sällskap"). Detta är kraftfullt pedagogiskt eftersom trösklarna i `karna.ts` (t.ex. V07:s konkava kurva, BESLUT §4) är absoluta — peer-raderna förklarar *varför* samma absoluta nivå ger olika poäng i olika branscher. Fas 2 (ej nu): rå nyckeltals-jämförelse mot branschmedian genom join mot `data/cache/fundamental-*.json` — kräver konverteringsregler per variabel, poängvarianten kräver inget nytt. Mellansteget `akm1PerKategori` (redan i korstabell-raden) möjliggör omedelbart en **kategorinivå-peer** (7 kategorier) utan cache- läsning alls.

### 3.4 Determinismregler (typkontraktet)

1. **Midrank** för delade akm2-värden; rank-tie bryts ALDRIG med namn (lika värden = lika rank).
2. **Median enligt typiskt kontrakt**: jämnt n → medelvärde av de två mittersta (finans 41,0 med n = 10 är exakt sådan).
3. **Inga slumpmoment, inga glidande fönster** — peer-mått är en ren funktion av (fil, bransch, ticker).
4. **Snapshotsårbarhet**: peer-värdena gäller universet 2026-09-03; fältet `peer.referens` = korstabellens `skapad` + "100-bolagsunivers". Ändras universet ändras peer-värdena — det ska synas i visningen.
5. **`osatt`-regeln**: grupp < 5 bolag ELLER variabel osatt hos bolaget ⇒ fältet `osatt`, aldrig gissning.
6. **JSON-nycklar utan å/ö** (grundregeln): `peerPercentil`, `branschdrag` (→ nyckel `branschdrag` är ok, men använd `peerMarginal` om vi vill vara konsekvent engelskfria-tecken; förslag: `branschDrag` kamel-case utan specialtecken fungerar, men renaste är `peerDrag`).

### 3.5 Sammanfattande vy per bolag ("peer-profilen")

```
peer = {
  peerPercentil: 40, rank: "4/10", bransch: "finans",
  branschDrag: +14, referens: "2026-09-03 · 100-bolagsunivers",
  overMedian: 12, iNiva: 4, underMedian: 6,     // per-variabel räkning
  variabler: [ { id: "V07", poang: 4, branschmedian: 3, hallning: "over" }, ... ]
}
```

---

## 4. Koppling till ytlagret + implementeringsskiss — BYGGS EJ

### 4.1 Korstabellens peer-kolumn (`src/components/ak1a/portfolj-forskning/korstabell.tsx`)

Ny kolumn **"Peer"** omedelbart höger om AKM2-kolumnen (våg 57 D2-sorteringen utökas `"akm1" | "akm2"` → `| "peer"`). Cellen visar `peerPercentil` + rank-chip ("4/10"); tooltip (`title=`) visar branschdrag, per-variabel-sammanfattning (över/i nivå/under) och referensdatum. Grupprubrikraden (10 branschsektioner) kan visa branschmedianen — då ser kunden direkt var 60 i teknik ≠ 60 i finans. `maxPerBransch`-typen i `typer.ts` berörs inte.

### 4.2 Forskningsbibliotekets detaljsidor (`src/app/analyser/[ticker]/page.tsx`)

Nytt server-renderat block **"Peer-spegeln"** under AKM-sektionen: (a) peerPercentil med rank och branschmedian som stapel, (b) branschdrag med en-meningstolkning ("Öresund ligger 14 poäng över finansbranschens median — bolaget bär sitt sällskap"), (c) tabell med variabel, bolagets poäng, branschmedian, hållning — **V07-raden först** som pedagogiskt exempel, (d) de aktiva branschmodulerna (finns redan som `akm2Moduler` i korstabell-raden) som förklarar *varför* medianen ligger där den ligger. Analys-JSON:erna (`data/analyses/*.json`) får ett frivilligt `peer`-fält; saknas det visas blocket ej (bakåtkompatibelt).

### 4.3 Implementeringsskiss (filer — skapas/förändras vid beslut, EJ nu)

| fil | åtgärd |
|---|---|
| `src/lib/portfolj-forskning/peer.ts` | NY. Ren funktion `beraknaPeerStatistik(rader): Map<ticker, PeerInfo>` — läser bara korstabellrader + cache-poäng; inga sidoeffekter, fullt deterministisk. |
| `src/lib/portfolj-forskning/typer.ts` | `KorstabbellRad` utökas med `peer?: PeerInfo` (optional — gamla filer ok). |
| `src/lib/portfolj-forskning/korstabell-data.ts` | anropa `beraknaPeerStatistik` efter normaliseringen; lagra på raden. |
| `src/components/ak1a/portfolj-forskning/korstabell.tsx` | peer-kolumn + sortnyckel + tooltip. |
| `src/app/analyser/[ticker]/page.tsx` | "Peer-spegeln"-block (server-side, `force-static` bevaras). |
| `tests/` | determinismtest (två körningar ⇒ identisk JSON), `osatt`-test (grupp på 4), midrank-test (delade värden), fixture `verktyg/fixtures/korstabell-demo.json`. |

### 4.4 Avgränsningar och risker

- **Ej poängpåverkande**: peer ingår ALDRIG i `raknaAKM2`/kompositen — se rekommendation 3.
- **Urvalsberoende**: medianen speglar P1:s 100-bolagsurval, inte "branschen" i stort — därför `referens`-fältet.
- **Modul-konfund**: branschmedianer återspeglar modulernas viktval; peer-raderna ska därför alltid visas tillsammans med `akm2Moduler`.
- **Datatackning**: bolag med låg `datatackning` har fler osatta variabler — per-variabel-jämförelsen räknas bara över variabler med poäng hos båda (median per variabel över icke-osatta).

---

## 5. Rekommendationer

1. **Bygg peerPercentil + branschdrag på rank/median-basis — inte z-score.** Grupperna är n = 10: percentilrank är distributionsfri, robust och deterministisk; MAD/z-score kan kollapsa och förvrängas av outliers (§1.2, §3.1–3.2). Visa som peer-kolumn i korstabellen (sortbar) med branschmedian i sektionrubriken. Gräns: grupp < 5 ⇒ `osatt`.
2. **Per-variabel branschmedianjämförelse på POÄNG-nivå som detaljsidans "Peer-spegel".** Data finns redan (`data/cache/akm1-*.json.poang` + `effektivaPoang`) — ingen ny insamling. V07-raden ("bruttomarginal 4 mot branschmedian 3") är det mest pedagogiskt effektiva enskilda visasättet i hela förslaget. Rå nyckeltals-jämförelse och kategori-peer (`akm1PerKategori`) blir fas 2.
3. **Peer förblir ett läslager — aldrig indata i poängen.** Branschmodulerna sköter redan branschanpassning på viktsidan (R4-regeln); att låta peer-percentiler påverka kompositen vore dubbelräkning och dessutom evidensmässigt tveksamt för lång-only-pedagogik (Alpha Architect/Klement, §1.1). Den absoluta poängen och peer-läsningen visas sida vid sida — kunden får båda glasögonen.

---

## Källor

- [QuantRocket — Sector Neutralization: Why It Matters and How to Use It](https://www.quantrocket.com/blog/sector-neutralization/)
- [Saral — Sector-Neutral Factor Investing: Scoring Within Peers](https://saral.money/blog/sector-neutral-factor-investing/)
- [Alpha Architect — Is Sector Neutrality in Factor Investing a Mistake?](https://alphaarchitect.com/is-sector-neutrality-in-factor-investing-a-mistake/)
- [Quantpedia — Should Factor Investors Neutralize the Sector Exposure?](https://quantpedia.com/should-factor-investors-neutralize-the-sector-exposure/)
- [Klement on Investing — Sector Neutral or Not?](https://klementoninvesting.substack.com/p/sector-neutral-or-not)
- [BlackRock — Equity Factor Exposures Methodology](https://www.blackrock.com/us/financial-professionals/tools/factor-box-methodology)
- [Syntax — Redefining Sector Neutral](https://www.syntaxdata.com/research/redefining-sector-neutral)
- [Cross Validated — Calculating robust z-scores with median and MAD](https://stats.stackexchange.com/questions/523865/calculating-robust-z-scores-with-median-and-mad)
- [Akinshin — Caveats of using the median absolute deviation](https://aakinshin.net/posts/mad-caveats/)
- [Oracle — Modified Z-Score](https://docs.oracle.com/en/cloud/saas/freeform/ffuuu/insights_metrics_MODIFIED_Z_SCORE.html) · [IBM Cognos — Modified z score](https://www.ibm.com/docs/en/cognos-analytics/12.0.0?topic=terms-modified-z-score)
- [Moeller (2025) — Why and When You Should Avoid Using z-scores, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12239870/)
- [NYU Stern (Kim 2012) — Financial statement comparability and credit risk (winsorisering)](https://www.stern.nyu.edu/sites/default/files/assets/documents/con_036180.pdf)
- [PM Research — Contrarian Factor Timing is Deceptively Difficult (z-score vs percentil)](https://www.pm-research.com/content/iijpormgmt%253A%253A%253A43%253A%253A%253A5%253A%253A%253A72.full.pdf)
- [StockCharts ChartSchool — Price Relative/Relative Strength](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/price-relative-relative-strength) · [Investopedia — Relative Strength](https://www.investopedia.com/terms/r/relativestrength.asp) · [Fidelity — Relative Strength Comparison](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/relative-strength-comparison) · [TrendSpider — Relative Strength Analysis](https://trendspider.com/learning-center/relative-strength-analysis/)
- [ResearchGate — A Review of Fundamental and Technical Stock Analysis Techniques](https://www.researchgate.net/publication/293808249_A_Review_of_Fundamental_and_Technical_Stock_Analysis_Techniques)
