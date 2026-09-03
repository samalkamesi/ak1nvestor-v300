# R3 — Dynamisering av AKM1 via Vågor och AK1TS: design "AKM1-Dynamik v1"

Forskningsdag 2026-09-03 · Forskare R3 (dynamiska system + fundamentalanalys).
Uppdrag: kundens kärbeslut — "AKM1 ska analyseras med hjälp av Vågor och AK1TS — forska
för att hitta den bästa matchningen, maximera nyttan."

Detta dokument är en komplett implementationsklar design. RÖR INGEN KOD — all
implementering sker i fas R2. Läs tillsammans med:

- `data/forskning/PROTOKOLL.md` (V01–V20, AK1TS 5×5×4, vågklasser, kärbeslut)
- `src/lib/vagfundament-motor.ts` (20×5 fundamentalvågsmatrisen som ska dynamiseras)
- `src/lib/konfluens-motor.ts` ("värde garanterat före vågorna")
- `src/lib/portfolj-vagor.ts` (ärlighetsprinciperna: osatt framför gissning)

---

## 0. Sammanfattning för byggagenten (TL;DR)

AKM1-Dynamik v1 gör fyra saker med den befintliga 20×5 fundamentalvågsmatrisen:

1. **Riktighetsinvertering** — varje variabel läsas mot sin "bra riktning" INNAN
   vågfasen tolkas (fallande P/S = gynnsam utveckling, inte "korrigering").
2. **Vågfaskoefficient** — grundpoängen G(v) (0–5) multipliceras med Φ per fas och
   horisont: bekräftad impulsvåg ×1,20; obekräftad ×1,10; basbygge ×1,00 + watch;
   korrigering ×0,80 (eller ×0,90 + "value appearing" när G ≤ 2); osatt ×1,00 på
   nivån, 0 i dynamikbidraget + intern varning.
3. **Två-nivå-konfluens-gate** — teknisk konfluens (3/5 teorier, befintlig princip)
   KOMBINERAS med fundamental konfluens (minst 4 av 7 kategorier samma riktning);
   båda pelare samma håll = "AKM1-konfluens", korsande pelare = konflikt/divergens,
   en eller båda svaga = neutral zon.
4. **Våg-till-våg-ledning** — Markov-inspirerade övergångsmatriser + sekvens-
   eskalering: impulsvåg får full förstärkning (×1,20) först efter 2 på varandra
   följande snapshots ( Chan–Karceski–Lakonishok-varningen: fundamental impulser
   är sällan uthålliga per automatik).

Viktigaste designvarningen: **en multipel- eller skuldkorrigering är ofta själva
möjligheten (Mr Market), inte risken** — utan riktighetsinvertering dubbelt-
bestraffar modellen det exakta läge som skapar marginal of safety (se §5.3).

---

## 1. Uppdrag och avgränsningar

AKM1 är idag en statisk 0–100-poängsmodell (20 variabler × 0–5). Kundens direktiv:
fundamentalt analyseras "med hjälp av Vågor och AK1TS" och modellen ska vara
DYNAMISK — "alla indikatorer rör sig". Vågfundament-motorn klassificerar redan varje
(variable, horisont)-cell i {impulsvåg, korrigering, basbygge, osatt} med
deterministiska ±6 %-trösklar. Det som saknas är kopplingen TILLBAKA till AKM1:s
poäng: hur ska en vågklass förändra en variabels bidrag till helhetsbilden?

Avgränsningar (ärlighet framför allt):

- R3 designar; R2 bygger. Inga kodändringar i detta steg.
- Dataunderlaget är Yahoo fundamentals-timeseries (~4 år årsdata, 5 kvartal
  kvartalsdata). Detta sätter hårda tak för vilka variabler som ÖVERHUVDAGET kan
  vågklassas (se §5.5 och §10).
- AK1TS-teorierna (Elliott, Fibonacci, GANN, Lucas, Volym) används här som
  STRUKTURSPRÅK för fundamental dynamik — inte som prisprediktorer. Motivering i §2.5.

---

## 2. Kunskapsläget: vad forskningen faktiskt stödjer

### 2.1 Stöd: momentum- och trendstrukturen är belagd

- **Jegadeesh & Titman (1993)**: aktier med hög avkastning de senaste 12 månaderna
  (exkl. senaste månaden — "12-1") fortsätter slå aktier med låg avkastning, ~1 %
  per månad. Effekten har replikerats globalt i 30+ år (Wiest 2023-review).
  https://link.springer.com/article/10.1007/s11408-022-00417-8
- **Moskowitz, Ooi & Pedersen (2012), "Time Series Momentum"**: varje instruments
  egna 12-månadersavkastning förutsäger dess nästa avkastning — tidsserie-momentum,
  inte bara tvärsnitt. 58 instrument, alla med positiva trendvinster.
  https://www.sciencedirect.com/science/article/pii/S0304405X11002613
- **Faber (2007)**: ett enkelt 10-månaders SMA-trendfilter per tillgångsslag
  halverar maxdjupa fall utan att offra avkastning — trendstatus som riskfilter är
  robust. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=962461
- **Barberis, Shleifer & Vishny (1998)**: konservatism → underreaktion (momentum,
  PEAD) och representativitet → överreaktion (långsiktiga reverals). Detta är den
  beteendemässiga motorn bakom "vågrörelser" i fundamenta: ny information bearbetas
  långsamt, sedan extrapoleras den för långt.
  https://www.sciencedirect.com/science/article/abs/pii/S0304405X98000270

**Implikation för AKM1-Dynamik**: en BEKRÄFTAD fundamental impulsvåg (förbättring
som pågått 2+ kvartal) har reellt informationsinnehåll — förstärkning ×1,20 är
motiverad. En OBEKRÄFTAD (första snapshot) har svagt stöd — därför ×1,10 tills
bekräftad (§8).

### 2.2 Stöd: fundamental momentum och asymmetrisk reversion

- **Fama & French (2000), "Forecasting Profitability and Earnings"**: lönsamhet
  medelreverterar, och reversionen är SNABBARE när lönsamheten är UNDER sitt
  medelvärde och längre från medelvärde i båda riktningarna. Asymmetrin är kärnan i
  Mr Market-gardet (§5.3): en korrigering som fört en variabel under sitt historiska
  medel är statistiskt sett närmare en vändning — "value appearing".
  https://www.jstor.org/stable/10.1086/209638
- **Chan, Karceski & Lakonishok (2003), "The Level and Persistence of Growth
  Rates"**: långsiktig tillväxt är i princip inte uthållig bortom slumpen;
  relativt få bolag lyckas växa ihållande. https://www.jstor.org/stable/3094553
- **Novy-Marx (2013)**: bruttolönsamhet (gross profits/assets) förutsäger avkastning
  i tvärsnitt — nivån på lönsamheten är en own-standing faktor ("the other side of
  value"). https://www.sciencedirect.com/science/article/abs/pii/S0304405X13000044
- **Piotroski (2000), F-score**: bland värdeaktier skiljer SAMTIDIGA små
  fundamentala förbättringar (9 binära signaler) vinnare från förlorare — stöd för
  att "många variabler som förbättras tillsammans" är starkare än en enskild.
  (Referens via Gimeno 2020: https://www.sciencedirect.com/science/article/pii/S1544612319304660)
- **Fink (2021), PEAD-review**: vinster drivs i riktning av earnings-överraskningar
  i veckor–månader — fundamental ny information prissätts trögt.
  https://www.sciencedirect.com/science/article/pii/S2214635020303750
- **Dittberner (2016), "Fundamental Momentum"**: akademisk avhandling som testar
  earnings-baserat momentum mot prisbaserat — konceptet "fundamental momentum" är
  etablerat som term. https://repository.up.ac.za/items/d854f9fb-51bc-48e6-98b3-611edadcbf47

**Implikation**: fundamental konfluens (flera kategorier samma riktning) är det
rätta fundamentala motstycket till den tekniska 3/5-regeln (§6).

### 2.3 Stöd: cykler och regimer — vågornas makroteoretiska ryggrad

- **Burns & Mitchell (1946), "Measuring Business Cycles" (NBER)**: cykler = återkommande
  sekvenser av expansion och kontraktion i en BREDD av ekonomiska serier —
  företagsfundamenta är del av samma familj av serier. Mitchell/Burns-dateringen
  lever än (NBER:s Business Cycle Dating Committee).
  https://www.nber.org/books-and-chapters/measuring-business-cycles
- **Zarnowitz (1985)**: översikten av cykelforskningen — cykler är varken
  periodiska (fix längd) eller slumpmässiga; de har uthållighet och asymmetri.
  https://www.jstor.org/stable/2725624
- **Hamilton (1989)**: konjunkturen som diskret Markov-process — expansions- och
  kontraktionstillstånd med olika uthållighetssannolikheter. Detta är modellen bakom
  övergångsmatriserna i §8. https://www.jstor.org/stable/1912559
- **Kopcke & Randall (Boston Fed-proceedings)**: räntepolitikens roll i "generation
  and propagation of business cycles" — kapitalbildningens cykler generationsskiftas,
  inte periodiseras. https://ideas.repec.org/s/fip/fedbcp2.html
- **CRS IF10411 (2024)**: efterkrigstidens USA: expansioner i snitt ~65 månader,
  recessioner ~11 månader — expansioner är ca 6× längre än kontraktioner (asymmetri
  som ÅTERANVÄNDS i övergångsmatrisen: korrigeringar kortare än impulser).
  https://www.congress.gov/crs-product/IF10411

### 2.4 Kritik: Elliott, Fibonacci, GANN som prediktorer saknar belägg

- **Batchelor & Ramyar (2006), "Magic Numbers in the Dow"**: inget statistiskt stöd
  för att Dow-vändpunkter klustrar vid Fibonaccirelationer (0,618/0,382 etc.) —
  retracement-nivåer är inte bättre än slumpen.
  https://www.researchgate.net/publication/228713810_Magic_numbers_in_the_Dow
  (Economist-bevakning: https://www.economist.com/finance-and-economics/2006/09/21/technical-failure)
- **Tsinaslanidis (2022)**: automatiskt identifierade Fibonacci-retracements ger
  svagt/kontextberoende stöd för handelsregler — ingen robust edge.
  https://www.sciencedirect.com/science/article/abs/pii/S0957417421012495
- **Daniel & Moskowitz (2016), "Momentum Crashes"**: momentum-strategier kraschar
  just efter lågkonjunkturer när marknaden vänder upp — den som mekaniskt litar på
  trend (eller mekaniskt bestraffar korrigeringar) köper dyrt/säljer billigt i
  vändningslägen. https://www.sciencedirect.com/science/article/pii/S0304405X16301490

### 2.5 Slutsats — teoriernas roll i AKM1-Dynamik

Belagt i forskning: (a) trendstatus hos en fundamental serie har informations-
innehåll (momentum-litteraturen), (b) förbättringar KLUSTERAR sig (Piotroski,
fundamental momentum), (c) reversionen är asymmetrisk (Fama–French), (d) regimer
har uthållighet men icke-periodisk längd (Hamilton, Burns–Mitchell, Zarnowitz),
(e) mekanisk trendtilltro kraschar (Daniel–Moskowitz).

Ej belagt: att exakta Fibonacci-nivåer, GANN-kvadrater eller Elliott-antal har
prediktiv kraft i priser — och det finns ingen anledning att tro att de har det i
fundamenta heller.

**Avgörande designbeslut**: de 5 AK1TS-teorierna används som STRUKTURSPRÅK för att
VIETA vilken fundamental variabel som passar vilken typ av dynamik (Matchnings-
matrisen §4) — aldrig som prediktorer. Fibonacci används endast deskriptivt
("hur djup är en normal marginalkorrigering"), GANN endast som tid/timing-objekt
(runway, katalysatorkalendrar), Lucas endast som cykellängdstest. Detta maximerar
nyttan av kundens teoriram utan att importera dess svagaste del (prediktiv
precision) in i poängsättningen.

---

## 3. Designprinciper (P1–P6)

- **P1 — Nivå och rörelse hålls isär i grunden.** Grundpoängen G(v) är fundamentets
  NIVÅ (värde/kvalitet — margin of safety). Vågfasen är fundamentets RÖRELSE.
  Koefficienten Φ verkar på en avgränsad del av bidraget så att nivån aldrig kan
  nollas av rörelsedata (undviker den värsta dubbelbestraffningen).
- **P2 — Mr Market hedras** ("hans humör är din möjlighet"): en korrigering i en
  variabel som redan är svagt bedömd (G ≤ 2) dämpas mindre (×0,90) och flaggas
  "value appearing" — det är statistiskt (Fama–French 2000) närmast en vändning.
- **P3 — Osatt skadar aldrig** (portfölj-vagor.ts:s princip): saknad vågdata ger
  aldrig poängavdrag, bara bredare osäkerhetsband + intern varning.
- **P4 — Bekräftelse före förstärkning**: full ×1,20 kräver 2+ på varandra följande
  snapshots i impulsvåg (Chan–Karceski–Lakonishok).
- **P5 — Konfluens före enskild signal**: ingen "hög konfluens" utan BÅDA pelarna
  (teknisk 3/5 + fundamental 4/7). Ingen del av modellen får generera köpsignal
  enbart från impulsvågor (Daniel–Moskowitz-varningen).
- **P6 — Determinism och spårbarhet** (P2/P8 i vågfundament-motorn): samma indata →
  samma utdata; alla koefficienter fasta konstanter; varje Φ-avvikelse från 1,00
  motiveras i rapporttexten, aldrig bara i talet.

---

## 4. Modul 1: Matchningsmatrisen V × teori × horisont

### 4.1 Teoriernas fundamentalöversättning (ett stycke var)

- **Elliott (5-vågsstruktur)** → *sekvensen* i en fundamental cykel: expansion →
  topp → kontraktion → botten → ny expansion. Företagets tillväxt- och lönsamhets-
  cykler ÄR Elliott-objekt: du behöver veta VAR i sekvensen variabeln befinner sig,
  inte det exakta vågantalet. Källstöd: Burns–Mitchell (sekvenser, inte längder),
  Barberis–Shleifer–Vishny (underreaktion → överreaktion = 5-vågsliknande dynamik).
- **Fibonacci (retracement)** → *djupet* i en normal korrigering: hur mycket av
  marginalökningen/försäljningsökningen ges tillbaka innan nästa impuls? 38,2/61,8 %
  används ENDAST som deskriptiva referensband ("marginalkorrigeringen har nu ätit
  61 % av uppgången — historiskt bottenband"), aldrig som prediktion (Batchelor–
  Ramyar 2006; Tsinaslanidis 2022).
- **GANN (tid)** → *timing*: när löper något ut? Katalysatorkalendrar (V16–V18),
  kassatäckning i kvartal (V19 — "hur många kvartal tar kapitalet slut" är den mest
  konkreta tidsfrågan i hela fundamentalanalysen), kontraktslöften i ARR (V02).
- **Lucas (talsekvens 2, 1, 3, 4, 7, 11…)** → *cykellängder*: testar om svängningar
  i en serie klustrar vid 3, 4, 7 eller 11 kvartal (= 0,75–1 / 1–1,75 / 2,75 /
  3,25–årscykler) — rimliga kapital- och lagercykellängder (Kopcke: kapitalbildning
  generationsskiftas; CRS: expansioner ~5,4 år ≈ 21–22 kvartal ≈ två 11-talssteg).
- **Volym (volym bekräftar trend)** → *den fundamental volymen*: i fundamental-
  analysen är omsättningen bokstavligen volymen. Volym-teorin parar sig med allt
  som ränts: försäljningstillväxt, intäktsstabilitet, order-/avtalsvolym,
  återköpsvolym (Gervais–Kaniel–Mingelgrin 2001: volymshockar → synlighet →
  avkastning).

### 4.2 Huvudtabell: V × teori, kopplingsstyrka 0–3

Skala: 3 = kärnpar (teorin ger direkt analysfråga till variabeln), 2 = tydlig
koppling, 1 = svag/indirekt, 0 = ingen meningsfull koppling (ska INTE tvingas in).

| V | Variabel (kategori) | Elliott | Fibonacci | GANN | Lucas | Volym | Motivering kärnpar (styrka ≥ 2) |
|---|---|---|---|---|---|---|---|
| V01 | Försäljningstillväxt (Tillväxt, KRITISK) | **3** | 1 | 1 | 2 | **3** | Elliott: tillväxtcykelns 5 faser (expansion–topp–kontraktion–botten–ny). Volym: omsättningen ÄR den fundamental volymen — volym bekräftar/ förnekar trenden. Lucas: omsättningssvängningars längd (3/4/7/11 kvartal). |
| V02 | ARR-tillväxt (Tillväxt) | 2 | 1 | 2 | 2 | 2 | GANN: kontraktslöpen/ramavtal = tidsbundna intäkter ("tid till förnyelse"). Elliott: mjukare cykel än V01 (rekurrenta intäkter). OBS: osatt i motorn (nuvärdesbaserad). |
| V03 | Intäktsdiversifiering (Tillväxt) | 1 | 0 | 1 | 1 | 2 | Volym: bredd av volymen (många kunder = jämnare volym). OBS: osatt i motorn. |
| V04 | P/S (Värdering) | 1 | **3** | 1 | 0 | 1 | Fibonacci: multipelns retracement mot eget historiskt spann — motorn mäter redan position i egen historik (`_nivaPositionHist`): Fibonacci är dess naturliga teorispråk. |
| V05 | P/B (Värdering) | 1 | **3** | 1 | 0 | 1 | Som V04: retracement-band i eget värderingspann. |
| V06 | EV/EBITDA (Värdering) | 1 | 2 | 1 | 0 | 1 | Fibonacci: samma logik, större brus (skuld i EV). OBS: osatt i motorn. |
| V07 | Bruttomarginal (Lönsamhet, KRITISK) | 2 | **3** | 1 | 1 | 1 | Fibonacci-KÄRNA: hur djup är en "normal" marginalkorrigering innan impulsen återupptas? 38/62 %-band som deskriptiv referens. Elliott: pris-makt-cykeln (prissättning → konkurrens → kompression). |
| V08 | EBITDA-marginal (Lönsamhet) | 2 | **3** | 1 | 1 | 1 | Som V07 + operativ hävstång retracement-band. |
| V09 | ROE (Lönsamhet) | **3** | 1 | 1 | 2 | 0 | Elliott-KÄRNA: DuPont = marginal × omsättningshastighet × hävstång — tre cykliska komponenter, en hel vågcykel. Lucas: ROE-cykellängder. |
| V10 | Skuldsättningsgrad (Stabilitet) | 1 | 1 | 1 | **3** | 0 | Lucas-KÄRNA: kapitalstrukturens cykler — investerings-/refinansieringscykler (Kopcke). Skuldsanering = lång retracement. |
| V11 | Likviditet (Stabilitet) | 1 | 1 | 2 | 1 | 0 | GANN: hur många kvartal täcker likviditeten utgifterna (kort tidsläcka). |
| V12 | Intäktsstabilitet (Stabilitet) | 2 | 1 | 1 | 2 | **3** | Volym-KÄRNA: stabilitet = volymens kontinuitet; motorn mäter redan upp/ned-antal. Lucas: är svängningarna 3- eller 5-kvartalsperiodiska? |
| V13 | Patent & IP (Moat) | 1 | 0 | 2 | 1 | 0 | GANN: patent löper 20 år — den mest explicita tidsdimensionen i hela AKM1. OBS: osatt i motorn. |
| V14 | Varumärke & kundlojalitet (Moat) | 1 | 0 | 1 | 2 | 1 | Lucas: ultra-lång kraft — sliter över generationer (Kopckes generationsspann). Volym: lojalitet = upprepad köpvolym. OBS: osatt i motorn. |
| V15 | Nätverkseffekter (Moat) | 1 | 0 | 0 | 2 | 2 | Volym: ett nätverk ÄR volym (värde ~ n²); Lucas: diffusionens längd. OBS: osatt i motorn. |
| V16 | Produktlanseringar (Katalysator) | 1 | 0 | **3** | 0 | 1 | GANN-KÄRNA: timing är allt — event på kalendern. OBS: osatt i motorn (events, inte serie). |
| V17 | Avtal & partnerskap (Katalysator) | 1 | 0 | **3** | 1 | 2 | GANN: avtal har datum och löptid; Volym: ordervolym. OBS: osatt i motorn. |
| V18 | Regulatoriska katalysatorer (Katalysator) | 1 | 0 | **3** | 1 | 0 | GANN: processkalendrar (myndighetsdatum) = exakt tid. OBS: osatt i motorn. |
| V19 | Kassatäckning — nyemissionsrisk (Risk, KRITISK) | 1 | 1 | **3** | 1 | 1 | GANN-KÄRNA: runway = kvartal kvar — "när tar kapitalet slut" är den mest konkreta GANN-tidsfrågan. Motorn beräknar redan kassa/|FCF|-runway. |
| V20 | Återköp av egna aktier (Kapitalstruktur/risk) | 1 | 1 | 1 | 2 | 2 | Lucas: kapitalåterföringens cykler; Volym: återköp = köpvolym i den egna aktien (GKM-volymshock). Motorn läser V20 redan INVERTERAT (minskat antal = impulsvåg). |

### 4.3 Teori × horisont: relevansmatris (0–3)

| Teori | Mikro | Kort | Medellång | Lång | Mega | Kommentar |
|---|---|---|---|---|---|---|
| Elliott | 1 | 2 | **3** | **3** | 2 | Vågsekvenser kräver flera perioder — lever på medellång/lång |
| Fibonacci | 1 | 2 | **3** | 2 | 1 | Retracement-bedömning behöver en färdig svängning att mäta |
| GANN | 2 | **3** | **3** | 2 | 1 | Kalendrar (mikro/kort) + kapitalcykler (medellång) |
| Lucas | 0 | 1 | 2 | **3** | **3** | Cykellängder kräver långa serier — Lucas hemmahörighet |
| Volym | **3** | **3** | 2 | 1 | 1 | Volym/försäljning mäts varje kvartal — snabbast belagd |

### 4.4 Full kub: V × teori × horisont

Kubstyrkan härleds (ingen ny bedömning per cell — deterministiskt):

```
S(v, teori, h) = round( styrka(v, teori) · relevans(teori, h) / 3 )   // 0–3
```

Exempel: V01 × Volym × kort = 3·3/3 = 3 (kärnpar på hemmahorisont);
V01 × Lucas × mikro = 2·0/3 = 0 (cykellängd kan inte bedömas på ett kvartal).

Kubens användning: när AK1TS-rapporten visar teknisk konfluens per teori, visar
kuben VILKA AKM1-variabler som är teorins "fundamentala mottagare" — länken mellan
AK1TS och AKM1 i UI.

### 4.5 Topp-5 kärnpar (korthetens skull)

1. **Volym ↔ V01 + V12** — omsättningen är den fundamental volymen; volym bekräftar
   trend, volymens kontinuitet är stabiliteten (Gervais–Kaniel–Mingelgrin 2001).
2. **Fibonacci ↔ V07 + V08** — marginalernas retracement-djup (38/62 % som
   deskriptivt normalband; Batchelor–Ramyar varnar för prediktion).
3. **Elliott ↔ V01 + V02 + V09** — tillväxt- och lönsamhetscykelns fem faser =
   företagets egen Burns–Mitchell-cykel.
4. **GANN ↔ V19 + V16–V18** — tid/timing: runway i kvartal + katalysatorkalendern.
5. **Lucas ↔ V10 + V20 (+ V12)** — kapitalcyklers längd: 3/4/7/11-kvartalstest.

---

## 5. Modul 2: Vågfas-modulerad poängsättning (kärninnovationen)

### 5.1 Steg ett: riktighetsinvertering (görs FÖR all vågtolkning)

Varje variabel har en definierad "bra riktning":

```
POSITIV_RIKTNING (stigande serie = gynnsam):
  V01, V02, V03, V07, V08, V09, V11, V12, V13, V14, V15, V16, V17, V18, V19, V20*
NEGATIV_RIKTNING (fallande serie = gynnsam — INVERTERA vågklassen):
  V04 (P/S), V05 (P/B), V06 (EV/EBITDA), V10 (skuldsättningsgrad)
(* V20 är redan inverterad i motorn: minskat aktieantal → positivt momentum.)
```

Inverteringsregel: för NEGATIV_RIKTNING-variabler vänds vågklassens tecken före
tolkning: impulsvåg ⇄ korrigering (basbygge och osatt oförändrade). EFTER
invertering gäller per definition: **impulsvåg = gynnsam riktning, korrigering =
ogynnsam riktning**. Detta är samma mekanism motorn redan använder för V20 —
designen utökar den till V04, V05, V06, V10.

### 5.2 Vågfaskoefficient-tabellen Φ

Per (variabel v, horisont h), efter riktighetsinvertering. G(v) = AKM1-grundpoäng
0–5. n = antal på varandra följande snapshots i aktuell klass (se §8.2).

| # | Fas (efter invertering) | Villkor | Φ | Flagga i rapport | Forskningsmotivering |
|---|---|---|---|---|---|
| F1 | impulsvåg, bekräftad | n ≥ 2 | **1,20** | "förstärkt — bekräftad sekvens" | JT/TSMOM: bekräftad trend bär premi; PEAD |
| F2 | impulsvåg, obekräftad | n = 1 | **1,10** | "obekräftad impuls" | Chan–Karceski–Lakonishok: fundamental impulser sällan uthålliga per automatik |
| F3 | impulsvåg, mogen | n ≥ 4 | **1,20** | "mogen impuls — sen fas (Daniel–Moskowitz)" | Momentum kraschar i mogna/motsatta lägen; ingen YTTERLIGARE förstärkning, bara varning |
| F4 | basbygge | alltid | **1,00** | "watch — katalysatorkänslig" | Neutral fas; se katalysator-länken i §5.4 |
| F5 | korrigering, G(v) ≥ 3 | n ≥ 1 | **0,80** | "dämpning" | Dålig trend i variabel som varit starkt bedömd |
| F6 | korrigering, G(v) ≤ 2 | n ≥ 1 | **0,90** | **"value appearing" (Mr Market)** | Fama–French 2000: reversion snabbare under medel — korrigeringen är möjligheten |
| F7 | gynnsam korrigering av VÄRDERING (endast innan invertering: multipel/skuld faller) | — | hanteras av F1–F3 | "värdeförbättring" | Fallande P/B = bättre värde; efter invertering är detta en impulsvåg |
| F8 | osatt | — | **1,00** | intern varning + osäkerhetsband ±0,5 | P3: saknad data skadar aldrig poängen; dynamikbidraget = 0 |

Om kunden ursprungligen avsåd "osatt = ×0": denna design avviker medvetet — ×0 på
HELA variabelpoängen skulle straffa bolag med tunn historik (IPO, omlistade) för
DATA-brist, inte för analys-brist. Osatt sätter dynamikbidraget till 0 (kategori-
bidraget till "vågstart" försvinner) men lämnar nivån orörd. Avvikelsen är
dokumenterad här (P6).

### 5.3 Mr Market-gardarna mot dubbelbestraffning (fem regler)

1. **Isärhållning (P1).** Φ kan aldrig pressa en variabel under 0,80 × G — nivån
   (margin of safety) är aldrig nollbar av rörelsedata. Max dämpning per variabel:
   −20 % av grundpoängen, på EN horisont i taget.
2. **G≤2-regeln (P2).** Svagt bedömd variabel i korrigering: Φ = 0,90 + flaggan
   "value appearing". Dubbelbestraffning (låg nivå OCH trendavdrag) förhindras:
   0-poängare med fallande trend är per Fama–French det statistiskt mest
   vändningsnära läget.
3. **Inverteringsregeln (§5.1).** Utan den faller t.ex. P/B-multipeln → motorn säger
   "korrigering" → Φ 0,80 → poängen SKÄRS samtidigt som `_nivaPositionHist` HÖJER
   nivåpoängen. Det är att bestraffa Grahams köpläge två gånger. Med invertering
   blir fallande multipel impulsvåg (gynnsam) → ×1,20. Detta är den viktigaste
   enskilda designvarningen i dokumentet.
4. **Pris- och fundamentvågor belönas OLIKA — medvetet.** Konfluensmotorn belönar
   redan PRISvåg i korrigering/basbygge (VAGLAGE_POANG: basbygge 100, korrigering
   90 — "vi är tidiga"). AKM1-Dynamik dämpar däremot fundamentala korrigeringar.
   Det är ingen motsägelse: pris-korrigering = timingmöjlighet, fundament-korrigering
   = försämrat underlag (men med value-appearing-gard). Bästa kombinationen förbli
   fundament impulsvåg + pris basbygge/korrigering = konfluensmotorns "positiva
   divergens" — AKM1-Dynamik förstärker denna bild istället för att kollidera.
5. **Konflikt-avstängning.** Om en variabels nivå och fas pekar rakt emot varandra
   (G ≥ 4 med F5, eller G ≤ 1 med F1) visas båda med jämställd tyngd + flaggan
   "nivå/rörelse-konflikt" — modellen väljer ALDRIG tyst en sida.

### 5.4 Formler: från G till Dynamiktotal per horisont

```
G(v)            AKM1-grundpoäng 0–5 (befintliga trösklar i vagfundament-motorn)
w_v             AKM1:s variabelvikt (kanoniska i akm1-calculator.tsx)
Φ(v,h)          enligt tabellen i §5.2, beräknad per (variabel, horisont)

Poäng_våg(v,h)  = G(v) · Φ(v,h)                       // tillåtet intervall 0–6,0
AKM1_bas        = 20 · Σ_v w_v · G(v)                  // 0–100, EXAKT dagens AKM1
D_h             = 20 · Σ_v w_v · Poäng_våg(v,h)        // 0–120 per horisont
Δ_h             = D_h − AKM1_bas                       // vågfasens utslag, −20…+20
Dynamiktotal    = Σ_h ζ_h · D_h                        // ζ enligt §7
```

ζ_h (horisontvikter, kunddirektiv — identiska med portföljforskningens):
mikro 0,05 · kort 0,20 · medellång 0,25 · lång 0,30 · mega 0,20.

Baslinjen 100 behålls som referensmarkering: rapporten visar D_h, Δ_h och
Dynamiktotal tillsammans med AKM1_bas — användaren ser att dynamiken är ett
TILLÄGG till (inte ersättning för) den statiska poängen.

**Basbyggets katalysator-länk (watch, F4):** när variabel v är i basbygge på kort
eller medellång horisont visas den kopplad till Katalysator-kategorins status:
om kategorin Katalysator (V16–V18) samtidigt har gynnsam bild → flaggan
"basbygge med katalysator-laddning". Ingen poängförändring — presentation +
watchlist. (Ett basbygge utan katalysator får ingen laddningsflagga.)

### 5.5 Täckningsgrad (P3 — normalisering får aldrig dölja tunghet)

```
κ_h = Σ_v w_v [G(v) belagd OCH fas(v,h) ≠ osatt] / Σ_v w_v
```

- D_h beräknas på belagda variabler med vikterna renormaliserade.
- κ_h visas ALLTID. Om κ_h < 0,50 → D_h märks "låg täckning — osäker".
- Osätthetsgrad (andel av totalvikten med osatt fas) visas i rapporthuvudet.

Realistisk förväntan mot Yahoo-underlaget: mikro/kort hög täckning (~11 av 20
variabler vågklassningsbara), medellång medel, lång/mega låg (4 års historik),
eftersom V02/V03/V06/V13–V18 är nuvärdesbaserade och därmed alltid osatta i
vågmatrisen. AKM1-Dynamik v1 kan alltså fullt ut dynamisera 11 variabler:
V01, V04, V05, V07, V08, V09, V10, V11, V12, V19, V20.

---

## 6. Modul 3: Konfluens-gate för fundamentalanalys (två nivåer)

### 6.1 Fundamental riktning per kategori (7 kategorier)

Använd vågfundament-motorns kategoribild (okvot per kategori och horisont,
redan implementerad), men med två ändringar:

```
1. Riktighetsinvertera VARIABEL-vågtalen FÖRST (§5.1) — kategoriokvoten byggs på
   inverterade tal så att "fallande skuld" räknas som förbättring.
2. Rösta med tecken, inte med medelvärde:
   kategoriRiktning(k, h) =
     +1 om okvot ≥ +0,5
     −1 om okvot ≤ −0,5      (0,5 = motorns befintliga klassgräns, _klassFranTal)
      0 annars (blandat/tunt)
```

### 6.2 Två-nivå-gaten

```
tekniskRiktning(h)     = +1/−1/0  enligt befintlig princip: minst 3 av 5 AK1TS-
                                  teorier samma håll på horisont h, annars 0.
B                     = antal kategorier med belagd riktning (≠ 0) på h
antalPlus / antalMinus = antal kategorier med riktning +1 respektive −1

fundamentalRiktning(h) =
  null  om B < 4                      ("underlag för tunt" — gate kan aldrig ge hög konfluens)
  +1    om antalPlus ≥ 4 och antalPlus > antalMinus
  −1    om antalMinus ≥ 4 och antalMinus > antalPlus
  0     annars                        ("blandat")
```

Slutstatus (3 × 3 — den nya "AKM1-konfluens"-matrisen):

| | fundamental +1 | fundamental 0 | fundamental −1 |
|---|---|---|---|
| **teknisk +1** | **HÖG KONFLUENS** — bekräftad uppgång; full signalstyrka | **NEUTRAL ZON** — tekniskt tryck utan fundament: avvakta | **KONFLIKT** — "vågor utan värdegrund": teknisk rally utan fundament; avvakta/varning |
| **teknisk 0** | **NEUTRAL ZON** — "fundament byggs, vågor sover" (spegel av konfluensmotorns "Värde men vågor sover"): watchlist | **NEUTRAL ZON** — avvakta | **NEUTRAL ZON** — fundament försvagas, tekniken domnar: watchlist nedåt |
| **teknisk −1** | **DIVERGENS** — fundament vänder före pris (motsvarar konfluensmotorns "positiv divergens": "värde möter vändande vågor"): watchlist med köpläge under bygge | **NEUTRAL ZON** — avvakta | **HÖG KONFLUENS NEGATIV** — bekräftad nedgång: varning/undvik |

Notera systemspeglingen: KONFLIKT ≈ "Vågor utan värdegolv" och "fundament byggs,
vågor sover" ≈ "Värde men vågor sover" i konfluens-motorn — samma begreppsvärld,
ingen ny taxonomi att lära ut.

### 6.3 Tröskelmotivering (4 av 7)

- Paritet med tekniska gaten: 3/5 = 60 % av teorierna; 4/7 = 57 % av kategorierna.
- Kategorierna är korrelerade par (Tillväxt↔Lönsamhet, Stabilitet↔Risk) — 3/7
  kan uppnås av ETT korrelerat kluster utan verklig bredd; 4/7 kräver minst ett
  kluster till (Piotroski-logik: BREDD av samtidiga förbättringar, inte djup i
  en enskild, skiljer vinnare).
- B ≥ 4-kravet hindrar tunna data (t.ex. unga bolag) från att fabricera "hög
  konfluens" ur 2 belagda kategorier.
- Rösten är oviktad (robusthet; en kategorivikt kan inte dominera), men den
  viktade kategoriokvoten (motorns befintliga `total`) visas som komplement.

---

## 7. Modul 4: Horisont-hierarkin — variabelns naturliga hemmahorisont

Kundens direktiv: mikro väger minst (ζ = 0,05). Men vad är MENINGSFULLT var?
Tabell: varje variabels hemmahorisont (där dess dynamik är informationsbärande),
sekundär horisont och vad som är meningslöst att läsa.

| V | Hem | Sekundär | Meningslöst på | Motivering |
|---|---|---|---|---|
| V01 | **kort** | medellång | mega (med 4 års data) | Kvartalsrapporter driver kort; cykelsekvensen medellång (Elliott) |
| V02 | kort–medellång | — | mikro (kontrakt = tröga) | Ramavtal löper 1–3 år (GANN-tid) |
| V03 | medellång–lång | — | mikro, kort | Portföljförändringar tar år |
| V04 | kort | medellång | mega | Prisrörelser snabba; position-i-historik medellång (Fibonacci) |
| V05 | kort | medellång | mega | Som V04 |
| V06 | medellång | kort | mikro | EV skiftar med balansräkningsdatum |
| V07 | **medellång** | kort | mikro (brus i COGS) | Marginalcykler = kvartal–år; retracement-band (Fibonacci) |
| V08 | **medellång** | kort | mikro | Som V07 |
| V09 | medellång–lång | kort | mikro | DuPont-cykeln hel (Elliott) |
| V10 | medellång | lång | mikro | Refinansierings-/investeringscykler (Lucas/Kopcke) |
| V11 | kort–medellång | mikro | mega | Tidsläckan är kvartalsnära (GANN) |
| V12 | **lång** | medellång | mikro | Stabilitet kräver helacykel för att bedöma |
| V13 | **mega** | lång | mikro, kort | IP sliter över decennier (GANN: 20-årslöptid) |
| V14 | **mega** | lång | mikro–medellång | Varumärke = ultra-lång kraft (kundens exempel) |
| V15 | **mega** | lång | mikro | Nätverk klyver — men långsamt (Lucas) |
| V16 | **mikro–kort** | — | lång, mega | Events är per definition korta (GANN) |
| V17 | mikro–kort | medellång | mega | Avtalsannonser förbrukas snabbt |
| V18 | mikro–kort | medellång | mega | Kalenderdatum |
| V19 | **kort–medellång** | mikro | mega | Runway i kvartal (GANN); bränder syns tidigt |
| V20 | medellång | kort | mikro | Utspädningstakt är årsvis (Lucas; kundens SBC-exempel) |

**Mönstret (designregler):**

- Mega är moat-variablernas (V13–V15) och kapitalcykelns (Lucas: V10, V20, V12)
  hem — men i praktiken OSPARADE i vågmatrisen (nuvärdesbaserade + för kort
  historik). AKM1-Dynamik v1 hanterar dem via AKM1-nivån + Φ = 1,00 (F8) tills
  externa proxyserier finns (rekommendation R3:2 i §12).
- Mikro är MENINGSFULLT endast för katalysatorer (V16–V18) och V19-tidiga varningar;
  ζ = 0,05 är därför inte en svaghet utan en konsekvens av variablernas hemmahorisont.
- Kundens exempel bekräftas: varumärke/nätverk = mega-krafter; SBC-utspädning (V20)
  och katalysatorer = kort–medellång.

---

## 8. Modul 5: Våg-till-våg-ledning (växlingslogik, Markov-inspirerad)

### 8.1 Övergångsmatriser — kalibrerade priors

Snapshot-cadens: 1 snapshot = 1 kvartalsrapport för mikro/kort-klasser; för
medellång/lång/mega (årsseriebaserade klasser) räknas steg per år men eskaleringen
(§8.2) följer kvartals-cadensen med oförändrad klass som "kvarstannad".

Två matriser (per steg; rad = nuvarande klass, kolumn = nästa; osatt-rad
exkluderad ur eskalering):

**T_snabb — mikro & kort (qoq/yoy-momentum, brusigt):**

| från \ till | impulsvåg | basbygge | korrigering |
|---|---|---|---|
| impulsvåg | **0,50** | 0,35 | 0,13 |
| basbygge | 0,33 | 0,34 | 0,31 |
| korrigering | 0,16 | 0,36 | **0,46** |

**T_trög — medellång, lång & mega (årstaktsklasser):**

| från \ till | impulsvåg | basbygge | korrigering |
|---|---|---|---|
| impulsvåg | **0,65** | 0,27 | 0,06 |
| basbygge | 0,28 | 0,44 | 0,26 |
| korrigering | 0,14 | 0,34 | **0,50** |

Kalibreringslogik (dokumenterad, ej uppskattad på egna data — se §10):

- Förväntad kvarstannad: T_snabb impulsvåg 1/(1−0,50) = 2,0 kvartal; T_trög
  1/(1−0,65) ≈ 2,9 kvartal ≈ PEAD-drift 2–4 kvartal och 12-1-momentum-horisonten
  (Jegadeesh–Titman; Moskowitz–Ooi–Pedersen; Fink).
- Basbygge är ett ÖVERGÅNGSLÄGE (nästan symmetrisk rad, medeltid ~1,5–2 steg) —
  det är vägskälet, inte ett hem. Därför "watch" (F4), aldrig vila.
- Asymmetrin P(korr→imp) > P(imp→korr) (0,16 > 0,13 snabb; 0,14 > 0,06 trög):
  Fama–French (2000) — reversion snabbare under medel; Barberis–Shleifer–Vishny —
  överreaktion nedåt återgår. I sannorhet: korrigeringen är statistiskt oftare
  på väg MOT vändning än impulsen är på väg mot kollaps. Mr Market i talform.
- Makro-asymmetrin (expansion ~65 mån, recession ~11 mån, CRS IF10411) kan INTE
  importeras rakt av: företagsfundamentala serier är betydligt mindre uthålliga
  än konjunkturaggregat (Chan–Karceski–Lakonishok 2003) — därför 0,50–0,65, inte
  Hamiltons ~0,9.

### 8.2 Sekvensstart och eskalering

```
n(v,h)            = antal på varandra följande snapshots med samma klass ≠ osatt
sekvensstart(v,h) = sant om klass(t−1) = basbygge OCH klass(t) = impulsvåg
                    → "sekvensstart" händelse (t.ex. basbygge→impulsvåg i ROE)
eskalering (impulsvåg):
  n = 1  → Φ 1,10  "obekräftad impuls"
  n ≥ 2  → Φ 1,20  "bekräftad sekvens"        (full förstärkning, P4)
  n ≥ 4  → Φ 1,20  "mogen impuls" (Daniel–Moskowitz-varning; ingen vidare
                    förstärkning — modellen eskalerar INTE bortom 1,20)
```

Eskaleringen är alltså TVÅSTEGS och CAPAD — detta är medvetet (P4 + C-K-L):
forskningen stödjer en beskedlig fortsättningspremie, inte en exponentiell.
Matrisens roll: (a) visa "förväntad kvarvarande längd" i rapporten (1/(1−p)
kvartal), (b) larma när n överstiger förväntad längd ("mogen impuls"), (c) som
sanity-prior när ekosystemets egna övergångstal senare uppskattas (§10).

### 8.3 Bred sekvensstart (växling över variabler)

```
bredSekvensstart(kategori, t) = ≥ 3 variabler i SAMMA kategori har
                                sekvensstart samma snapshot t
```

Effekt: kategorin flaggas "sekvensstart" i rapporten och lyfts till rapportens
huvudlistning ("vad som just nu vänder"). Konfluens-gaten (§6) påverkas EJ —
gate-integritet går före signalstyrka (P5). Bred sekvensstart är den fundamental-
analytiska motsvarigheten till Piotroskis multipla samtidiga förbättringar och
motiverar att variabeln V16–V18 (katalysatorer) tittas på extra noga när det
sker — ofta finns en gemensam drivare (lansering, avtal, regler) bakom.

### 8.4 Växlingslogik negativt (impulsvåg → korrigering)

Klassväxling impulsvåg → korrigering (efter invertering) = "sekvensbrott":
rapporteras explicit per variabel med vilken fas som bröts och Φ sätts per F5/F6
(0,80/0,90). Två på varandra följande sekvensbrott i samma kategori →
kategoririktningen (§6.1) sätts till 0 ("blandat") oavsett okvot — bredd i
brottet dömer ut trenden. (Detta är medvetet konservativt: Daniel–Moskowitz.)

---

## 9. Komplett formspecifikation för byggagenten (pseudokod)

```
INGÅNG: VagfundamentAnalys (20×5-matris + indikatorer) per ticker,
        AKM1-grundpoäng G(v) (0–5), snapshot-historik per (v,h) [nytt lagringsbehov],
        teknisk riktning per horisont (AK1TS, befintlig 3/5-princip).

KONSTANTER:
  INVERTERA = {V04, V05, V06, V10}          // negativ riktning
  ZETA = {mikro:0.05, kort:0.20, medellang:0.25, lang:0.30, mega:0.20}
  PHI = {IMP_BEKRAFTAD:1.20, IMP_OBEKRAFTAD:1.10, BASBYGGE:1.00,
         KORR_HOG_G:0.80, KORR_LAG_G:0.90, OSATT:1.00}
  KONFLUENS_TEKNISK = 3 av 5 · KONFLUENS_FUNDAMENTAL = 4 av 7 · MIN_KATEGORIER = 4
  MIN_TACKNING_H = 0.50

STEG 1 — riktighetsinvertering:
  för v i INVERTERA: vänd impulsvåg⇄korrigering i fas(v,h) för alla h.

STEG 2 — sekvenshistorik:
  n(v,h) = längden på avslutande klasskörning (≠ osatt) i snapshot-historiken.
  (Vid driftstart utan historik: n = 1 → konservativt.)

STEG 3 — Φ(v,h):
  impulsvåg:  n=1 → 1.10 · n∈[2,3] → 1.20 · n≥4 → 1.20 + flagga "mogen impuls"
  basbygge:   1.00 + flagga "watch" (+"katalysator-laddning" om Katalysator-kategorin
              har gynnsam bild)
  korrigering: G(v) ≥ 3 → 0.80 · G(v) ≤ 2 → 0.90 + flagga "value appearing"
  osatt:      1.00 + intern varning + osäkerhetsband ±0,5; dynamikbidrag 0

STEG 4 — poäng:
  Poäng_våg(v,h) = G(v) · Φ(v,h)                     // 0–6,0
  D_h = 20 · Σ_v w_v · Poäng_våg(v,h)  (vikter renormaliserade på belagda)  // 0–120
  Δ_h = D_h − AKM1_bas
  Dynamiktotal = Σ_h ζ_h · D_h
  κ_h enligt §5.5; κ_h < 0,50 → D_h märks "låg täckning".

STEG 5 — fundamental riktning per horisont:
  per kategori k: okvot på INVERTERADE variabelvågtal (endast belagda ≠ osatt);
  riktning = +1/0/−1 mot ±0,5 (motorns klassgräns).
  B, antalPlus, antalMinus → fundamentalRiktning enligt §6.2.

STEG 6 — två-nivå-gate:
  status = matrisen i §6.2 (tekniskRiktning × fundamentalRiktning).

STEG 7 — händelser:
  sekvensstart(v,h), bredSekvensstart(kategori), sekvensbrott, nivå/rörelse-konflikt
  (G≥4 med korrigering ELLER G≤1 med impulsvåg) — alla rapporteras explicit.

UTGÅNG: { D_h, Δ_h, Dynamiktotal, AKM1_bas, κ_h, Φ-tabell per variabel,
          fundamentalRiktning(h), gate-status per horisont, händelselista, flaggor }.

DETERMINISM: inga slumpmoment, ingen klocka i poängen; alla konstanter fasta.
Självkontroll: Poäng_våg ∈ [0,6]; D_h ∈ [0,120]; Δ_h ∈ [−20,+20]; flaggor ur
sluten mängd; samma indata → samma utdata.
```

Byggnotering om vikter: PROTOKOLL-tabellen (V02 8 %, V03 6 % … V20 6 %) summerar
till >100 % exklusive de tre KRITISKA — byggagenten verifierar de kanoniska
variabelvikterna i `src/components/ak1a/akm1-calculator.tsx` innan w_v låses.
R3 gissar inte (P3).

---

## 10. Ärlighetsregler: vad som inte går att veta

1. **Övergångssannolikheterna är PRIORS, inte uppskattningar.** Matriserna i §8.1
   är kalibrerade ur litteraturen (asymmetrier, uthållighetsordning) — inte
   estimerade på AK1A:s egna data. Ersätts när 12+ kvartalssnapshots finns i
   ekosystemet (minsta statistiska underlaget för en 3×3-matris med förtroende).
   Tills dess märks de "kalibrerad prior" i rapporten.
2. **Vi kan inte veta var i en Elliott-sekvens en variabel är** — endast dess
   momentumstatus just nu. Klasserna {impulsvåg, korrigering, basbygge} är vad datan
   bär; vågANTAL och -etiketter (våg 3 av 5) visas aldrig som fakta.
3. **Fibonacci-band är beskrivningar, inte stöd** (Batchelor–Ramyar 2006). De får
   aldrig generera poäng — endast kontext i marginal-analysens text (§4.1).
4. **Osatta variabler är osatta**: 9 av 20 (V02, V03, V06, V13–V18) kan inte
   vågklassas ur Yahoo-serier. Modellen visar dem med nivåpoäng + F8-varning och
   låtsas ALDRIG att dynamiken finns (P3).
5. **Långa horisonter är tunna**: ~4 års historik gör lång/mega till täcknings-
   svaga zoner — κ_h exponerar detta öppet; normaliseringen döljer det aldrig.
6. **Ensam variabel genom noll kan inte momentum-klassas** (motorns guard för
   teckenväxlande serier, t.ex. ROE genom noll) — korrekt beteende, ingen åtgärd.
7. **Koefficienternas exakta värden (1,10/1,20/0,80/0,90) är designval** med
   forskningsmotivering per rad — de är inte optimerade. Kalibrering mot
   efterhandsdata är ett R2/R4-beslut som kräver walk-forward, inte kurvpassning.
8. **Kundens "osatt = ×0" är medvetet frångånget** (F8: ×1,00 på nivån, 0 i
   dynamiken) — motiveringen i §5.2 måste följa med till kunddialogen.

---

## 11. Källor (19)

1. Burns, A. F. & Mitchell, W. C. (1946). *Measuring Business Cycles*. NBER.
   https://www.nber.org/books-and-chapters/measuring-business-cycles
2. Hamilton, J. D. (1989). "A New Approach to the Economic Analysis of Nonstationary
   Time Series and the Business Cycle." *Econometrica* 57(2).
   https://www.jstor.org/stable/1912559
3. Zarnowitz, V. (1985). "Recent Work on Business Cycles in Historical Perspective."
   *Journal of Economic Literature*. https://www.jstor.org/stable/2725624
4. Kopcke, R. W. & Randall, R. E. "Role of interest rate policy in the generation and
   propagation of business cycles." Federal Reserve Bank of Boston proceedings.
   https://ideas.repec.org/s/fip/fedbcp2.html
5. Congressional Research Service, IF10411. "Introduction to U.S. Economy: The
   Business Cycle and Expansion." https://www.congress.gov/crs-product/IF10411
6. Jegadeesh, N. & Titman, S. (1993); översikt i Wiest, T. (2023). "What do we know
   30 years after Jegadeesh and Titman's seminal paper?" *Review of Financial
   Studies*. https://link.springer.com/article/10.1007/s11408-022-00417-8
7. Moskowitz, T., Ooi, Y. H. & Pedersen, L. H. (2012). "Time Series Momentum."
   *Journal of Financial Economics* 104(2).
   https://www.sciencedirect.com/science/article/pii/S0304405X11002613
8. Faber, M. (2007). "A Quantitative Approach to Tactical Asset Allocation."
   *Journal of Wealth Management* / SSRN. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=962461
9. Barberis, N., Shleifer, A. & Vishny, R. (1998). "A Model of Investor Sentiment."
   *Journal of Financial Economics* 49(3).
   https://www.sciencedirect.com/science/article/abs/pii/S0304405X98000270
10. Fama, E. & French, K. (2000). "Forecasting Profitability and Earnings."
    *Journal of Business* 73(2). https://www.jstor.org/stable/10.1086/209638
11. Chan, L. K. C., Karceski, J. & Lakonishok, J. (2003). "The Level and Persistence
    of Growth Rates." *Journal of Finance* 58(2). https://www.jstor.org/stable/3094553
12. Novy-Marx, R. (2013). "The Other Side of Value: The Gross Profitability Premium."
    *Journal of Financial Economics* 108(1).
    https://www.sciencedirect.com/science/article/abs/pii/S0304405X13000044
13. Piotroski, J. (2000). "Value Investing: The Use of Historical Financial Statement
    Information to Separate Winners from Losers." (Referens via Gimeno 2020,
    https://www.sciencedirect.com/science/article/pii/S1544612319304660)
14. Gervais, S., Kaniel, R. & Mingelgrin, D. H. (2001). "The High-Volume Return
    Premium." *Journal of Finance* 56(3). https://www.jstor.org/stable/222536
15. Batchelor, R. & Ramyar, R. (2006). "Magic Numbers in the Dow."
    Cass Business School. https://www.researchgate.net/publication/228713810_Magic_numbers_in_the_Dow
    (Economist: https://www.economist.com/finance-and-economics/2006/09/21/technical-failure)
16. Tsinaslanidis, P. (2022). "Automatic identification and evaluation of Fibonacci
    retracements." *Expert Systems with Applications*.
    https://www.sciencedirect.com/science/article/abs/pii/S0957417421012495
17. Daniel, K. & Moskowitz, T. (2016). "Momentum Crashes." *Journal of Financial
    Economics* 122(2). https://www.sciencedirect.com/science/article/pii/S0304405X16301490
18. Fink, J. (2021). "A review of the Post-Earnings-Announcement Drift."
    *Journal of Behavioral and Experimental Finance*.
    https://www.sciencedirect.com/science/article/pii/S2214635020303750
19. Dittberner, R. (2016). "Fundamental Momentum: A New Approach to Investment."
    University of Pretoria. https://repository.up.ac.za/items/d854f9fb-51bc-48e6-98b3-611edadcbf47

---

## 12. Rekommendation till AKM2

Rankade förslag (högst först):

1. **Implementera AKM1-Dynamik v1 exakt enligt §9** med Φ-tabellen §5.2,
   riktighetsinvertering §5.1 och två-nivå-gaten §6. Detta är kärnsvaret på kundens
   kärfråga ("bästa matchningen mellan AKM1 och AK1TS") och bygger direkt på den
   bevisade vågfundament-motorn — ingen ny datakälla krävs.
2. **Bygg snapshot-historik-lagring** (klass per (ticker, variabel, horisont) per
   kvartal) — förutsättningen för sekvens-eskalering (§8.2) och för att inom ~3 år
   ersätta Markov-priors med ekosystemets egna uppskattade övergångstal.
3. **Utöka inverteringen i vågfundament-motorn** till V04, V05, V06, V10 (V20 har
   den redan) — oavsett övrigt är detta en motorkorrekthetsfråga: fallande
   multipel/skuld är en förbättring och ska läsas som gynnsam våg.
4. **Proxyserier för de osatta 9** (V02, V03, V06, V13–V18) i prioritetsordning:
   V06 (EBITDA finns i Yahoo-serien — borde vara härledbar), V02 (revenue i
   segment/ARR-liknande serier där tillgängligt), V13–V15 (patent-/varumärkes-
   databaser är externa inköp — viktigt till mega-horisonterna som annars står tomma).
5. **Två-nivå-gaten som portföljfilter**: "HÖG KONFLUENS"-cellen är den naturliga
   kandidatpoolen för nästa konfluensscanner-iteration; "DIVERGENS"-cellen är
   watchlisten (värde möter vändande vågor — konfluensmotorns kärnidé, nu med
   fundamental riktning formellt definierad).
6. **Kalibreringsstudie i R4**: när 8+ kvartalssnapshots finns, testa Φ-stegen
   (1,10/1,20/0,80/0,90) walk-forward innan värdena låses — tills dess är de
   dokumenterade designval (ärlighetsregel 7).

— Slut på dokumentet. Modellen beskriver fundamentalens rytm; den dömer aldrig
åt användaren. Pedagogiskt verktyg — inte investeringsråd.
