# Fas 2-djupet — indikatorerna 11–20 (V11–V20)

Fördjupningsmaterial, del 2 av 2. Indikator 1–10 (V01–V10) finns i
syskonfilen `indikatorer-1-10.md`. Detta bygger vidare på underlagsbiblioteket
i `data/forskning/KURS-FAS2/` och följer kanon-namnen i modellens kärna
(AKM1:s variabler V01–V20, speglade i `src/lib/vagfundament-motor.ts`).

**Så är varje kapitel byggt** — sex frågor, samma ordning varje gång:

1. Vad indikatorn mäter — och varför den spelar roll
2. Var i årsredovisningen du hittar den (konkreta rader och noter)
3. Så räknar du den — steg för steg
4. Genomskinligt räkneexempel på ett påhittat bolag
5. Vanliga fallgropar — hur talet kan snedvridas
6. Tre övningar med facit

**Alla bolag och alla siffror i exemplen är påhittade.** Låtsasbolagen är
byggda för att lära ut mekanismen — de ska inte förväxlas med verkliga
bolag, och inget i materialet är en kommentar om en faktisk aktie.

**Juridikgrinden:** detta är utbildning i hur metoden läser, räknar och
poängsätter — "så fungerar det". Materialet innehåller aldrig
investeringsråd och aldrig uppmaningar att köpa eller sälja (lagen
2007:528 om värdepappersrörelser: utbildning är tillåtet, rådgivning
kräver tillstånd).

---

## V11 — Likviditet · Stabilitet

*Kursreferens: slug `v11-likviditet` · AKM1 V11*

### Vad indikatorn mäter — och varför den spelar roll

Likviditet mäter **luftgapet mellan vad bolaget har inom räckhåll och vad
det måste betala inom tolv månader**. Ett bolag kan vara lönsamt över året
och ändå betala sig självt i botten en dålig månad — leverantörsfakturor,
löner och skatt förfaller på bestämda datum, medan kundernas inbetalningar
kommer när de kommer. Indikatorn svarar på en enda fråga: klarar bolaget
sina kortfristiga åtaganden utan att i panik sälja tillgångar eller låna
dyrt?

Två kvoter används. **Kassakvoten** (balanskvoten) ställer samtliga
omsättningstillgångar — varulager, kundfordringar, kassa och kortfristiga
placeringar — mot de kortfristiga skulderna. **Kvickkvoten** räknar
varulagret bort: i en kris säljs lager långsamt och med rabatt, medan
kassa och fordringar är det som är *kvickt* nära pengar. Kvoten 1,0
betyder jämna svar; 1,5 betyder buffert; 0,7 betyder att
betalningskalendern måste skötas aktivt varje vecka.

Grannindikatorerna avgränsar: V10 Skuldsättningsgrad frågar hur
finansieringen ser ut på lång sikt, V19 Kassatäckning frågar hur länge
kassan räcker för ett förlorande bolag. V11 är mitten — det kommande årets
betalningsförmåga, oavsett om bolaget går med vinst eller ej.

### Var i årsredovisningen du hittar den

I **balansräkningen**, på båda sidor:

- Under **Omsättningstillgångar**: raderna *Varulager* (ibland *Lager och
  pågående arbeten*), *Kundfordringar*, *Kassa och bank* samt *Kortfristiga
  placeringar*.
- Under **Kortfristiga skulder** (i många svenska bokslut: *Kortfristiga
  skulder och övriga förpliktelser*): *Leverantörsskulder*, *Kortfristig
  del av låneskulden*, *Skatteskulder* och *Övriga kortfristiga
  förpliktelser* (obetalda kostnader, upparbetade intäkter).

Tre ställen till: **noten om kundfordringar** (äldresaldon — hur stor del
som är äldre än 90/120 dagar och hur mycket som värderats ned), **noten om
lån** (hur mycket som förfaller inom tolv månader) och
**förvaltningsberättelsens** uppgift om bekräftade kassakreditlinjer — en
outnyttjad kredit är likviditetens andra hälft och syns inte i
balansräkningen.

### Så räknar du — steg för steg

1. Summera omsättningstillgångarna (kassa + kortfristiga placeringar +
   kundfordringar + varulager).
2. Summera de kortfristiga skulderna (leverantörer + kortfristig lånedel +
   skatt + övrigt).
3. **Kassakvot** = steg 1 ÷ steg 2.
4. **Kvickkvot** = (steg 1 − varulager) ÷ steg 2.
5. Upprepa för föregående år — riktningen är ofta viktigare än nivån.
6. Slå upp äldresaldona i fordringsnoten och stryk mentalt osäkra
   fordringar: den *justerade* kvickkvoten är sanningen.

Modellen lämnar V11 formellt osatt (datakontraktet saknar
balansräkningsdetaljer), så poängen sätts manuellt efter läsningen.
Pedagogisk trappa: kvick ≥ 2,0 ⇒ 5 poäng · 1,5–2,0 ⇒ 4 · 1,0–1,5 ⇒ 3 ·
0,5–1,0 ⇒ 2 · under 0,5 ⇒ 1 — alltid justerad för branschens
arbetskapitalstruktur.

### Räkneexempel: Byggvaruhuset Norr AB (påhittat)

Utdrag ur låtsas-balansräkningen (miljoner kronor):

| Post | I år | Förra året |
|---|---|---|
| Kassa och bank | 15 | 22 |
| Kortfristiga placeringar | 10 | 8 |
| Kundfordringar | 45 | 52 |
| Varulager | 60 | 58 |
| **Omsättningstillgångar** | **130** | **140** |
| Leverantörsskulder | 55 | 44 |
| Kortfristig del av lån | 20 | 20 |
| Skatt + övriga förpliktelser | 15 | 16 |
| **Kortfristiga skulder** | **90** | **80** |

Beräkning i år: kassakvot = 130 ÷ 90 = **1,44**. Kvickkvot =
(130 − 60) ÷ 90 = 70 ÷ 90 = **0,78**. Förra året: kassakvot =
140 ÷ 80 = 1,75; kvickkvot = (140 − 58) ÷ 80 = **1,03**.

Tolkning: bufferten har smalnat på ett år — kvickkvoten föll från 1,03
till 0,78 och ligger nu under 1,0. Skillnaden mellan kvoterna är lagret:
60 av 130 (46 %) av omsättningstillgångarna kan inte tas till vara
snabbt. En kontroll i noten visar att 6 av de 90 i skulden är kortfristig
leasing (IFRS 16) — utan den hade kvickkvoten varit 70 ÷ 84 = 0,83,
fortfarande under 1,0. Är det nöd? Kanske inte — ett byggvaruhus med
snabb lageromsättning och goda leverantörskrediter kan driva tungt
medvetet — men trenden (fallande kassa, svällande leverantörsskuld) är
precis den tidiga signal kvoten finns för.

### Fallgropar — hur talet kan snedvridas

- **Kvick under 1,0 är inte automatisk nöd.** Dagligvaruhandel och
  förskottsaffärer (abonnemang betalade i förväg) driver medvetet lågt —
  kunderna betalar innan leverantörerna får sitt. Fråga alltid *varför*
  gapet ser ut som det gör.
- **Kvick över 1,0 är inte automatisk hälsa.** Svällande, gamla
  kundfordringar räknas med i täljaren — notens äldstanalys avgör om
  fordringarna är pengar eller önsketänkande.
- **Balansdagen är ett ögonblick.** Detaljhandeln efter julhelgen har
  kassatopp; ett projektbolag före en milstolpe har botten. En dag gör
  inte ett år.
- **Banker och finansbolag:** deras balansräkning är in- och utlåning —
  kvickkvoten är meningslös där (samma undantag som för V10).
- **IFRS 16:** leasingåtaganden ligger bland de kortfristiga skulderna —
  butiks- och flygbolag ser trängre ut än de gjorde före 2019.
- **Bunden kassa:** bankmedel i utlandsdotterbolag med
  valutarestriktioner, eller pantsatt kassa, är inte fria att betala
  räkningar med — det står i noterna, inte på balansraden.

### Övningar med facit

1. Ett bolag har omsättningstillgångar 210 mkr, varav varulager 90, och
   kortfristiga skulder 140 mkr. Räkna kassakvot och kvickkvot.
   *Facit: kassakvot 210 ÷ 140 = 1,50; kvickkvot (210 − 90) ÷ 140 =
   120 ÷ 140 = 0,86. Kvotgapet är lagret — 43 % av
   omsättningstillgångarna.*
2. Ett stabilt dagligvarubolag redovisar kvickkvot 0,6 — varför kan det
   ändå vara en styrka?
   *Facit: kunderna betalar i kassan direkt medan leverantörskrediten
   löper 30–60 dagar. Negativt rörelsekapital betyder att tillväxten
   frigör kassa i stället för att binda den.*
3. Kvickkvoten är 1,2 men fordringsnoten visar att 40 % av kundfordringarna
   är äldre än 120 dagar. Vad gör du med poängen?
   *Facit: justera ned — gamla fordringar är inte kvicka pengar. Stryker
   du dem mentalt blir den "sanna" kvickkvoten betydligt lägre;
   äldresaldon, inte balansraden, är sanningen.*

---

## V12 — Intäktsstabilitet · Stabilitet

*Kursreferens: slug `v12-intaktsstabilitet` · AKM1 V12*

### Vad indikatorn mäter — och varför den spelar roll

Intäktsstabilitet mäter **hur jämnt intäkterna rullar år från år**.
Måttet är variationskoefficienten (CV): standardavvikelsen ÷ medelvärdet
för nettoomsättningen över åren. Låg CV är en förutsägbar affär —
budgeten håller, utdelningen kan planeras, en svag konjunktur sänker men
vräker inte omkull. Hög CV är cykel, projektberoende eller en affär i
omvandling. CV är skalfri: samma mått fungerar för ett bolag med 2 mdr i
omsättning som för ett med 500 mdr, och det är därför stabiliteten går att
jämföra mellan bolag och branscher.

Begränsningen som måste ägas från första raden: **CV ser inte riktning.**
En jämnt nedåtlutande kurva får fin poäng. Läs därför alltid V12
tillsammans med V01 Försäljningstillväxt — V12 mäter svängningen, V01
männer riktingen.

### Var i årsredovisningen du hittar den

1. **Resultaträkningens topprad** *Nettoomsättning* — för innevarande år
   och jämförelseåret.
2. **Femårsöversikten** — ofta sist i årsredovisningen, med nyckeltal per
   år. Universumet bär fyra bokförda år (2022–2025); modellen använder de
   år som finns.
3. **Segmentnoten** — koncernens total-CV kan vara låg medan ett segment
   dansar; alltid segmentet före slutsatsen.
4. Noter om **förvärv och avyttringar** samt **valutaeffekter** — båda
   böjer serien utan att den organiska affären gjort det.

### Så räknar du — steg för steg

1. Skriv ner nettoomsättningen per år.
2. Medelvärdet = summan ÷ antalet år.
3. Avvikelsen per år = årets tal − medelvärdet.
4. Kvadrera avvikelserna, summera, dela med antalet år. (Populationens
   standardavvikelse — i kalkylblad `STDAV.P`; `STDAV.S` delar med n−1 och
   ger för hög CV på korta serier.)
5. Standardavvikelsen = kvadratroten ur steget 4.
6. CV = standardavvikelsen ÷ medelvärdet, uttryckt i procent.

Poängtrappan (dokumenterad i modellens kärna): CV ≤ 5 % ⇒ 5 · ≤ 10 % ⇒ 4 ·
≤ 20 % ⇒ 3 · ≤ 35 % ⇒ 2 · > 35 % ⇒ 1. Saknas serier, eller är medelvärdet
noll/negativt, lämnas indikatorn osatt — CV är då meningslöst.

### Räkneexempel: Nordkust Fritid AB (påhittat)

Nettoomsättning 2021–2025 (miljoner kronor):

| År | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Nettoomsättning | 100 | 110 | 105 | 115 | 120 |

Steg för steg: medelvärdet = 550 ÷ 5 = **110**. Avvikelser: −10, 0, −5,
+5, +10. Kvadrater: 100 + 0 + 25 + 25 + 100 = 250. Variens = 250 ÷ 5 =
50. Standardavvikelse = √50 ≈ **7,07**. CV = 7,07 ÷ 110 = **6,4 %** ⇒
4 poäng (trappan: ≤ 10 %).

Kontrasten — låtsasbolaget *Stadigt Sjunkande AB* med serien 100 · 96 ·
92 · 88 · 84: medelvärde 92, avvikelser ±8 och ±4, standardavvikelse
5,66, CV = 5,66 ÷ 92 = **6,2 %** ⇒ också 4 poäng — trots att
omsättningen fallit fyra år i rad. Det är läran: V12 ser svängning, aldrig
riktning. Nordkusts kurva pekar dessutom uppåt med en tillväxttakt på
(120 ÷ 100)^(1/4) − 1 ≈ 4,7 % per år — läsningen blir hel först tillsammans
med V01.

### Fallgropar — hur talet kan snedvridas

- **CV är blind för riktning:** en jämnt sjunkande affär får fin poäng —
  läs alltid med V01.
- **Små absoluta tal ger extrem CV:** serien 0/1/0/0 mkr är inte
  volatilitet utan ett holdingbolags bokföring av dotterbolagsflöden.
- **Förvärv böjer serien:** organisk 60 + köpt 40 ser ut som
  tillväxtsvängning — noten om förvärv avgör.
- **Valuta:** utlandsintäkter i annan valuta rör kurvan utan att affären
  gjort det — noten om valutaeffekter.
- **Koncern-CV döljer segmentdans:** totalen kan vara lugn medan ett
  segment pendlar vilt.
- **Räkenskapsårslutbyten** bryter jämförbarheten i femårsöversikten —
  kolla noter och bokslutsdatum.

### Övningar med facit

1. Räkna CV för serien 100 · 104 · 102 · 106 · 108.
   *Facit: medel 104; avvikelser −4, 0, −2, +2, +4; kvadrater
   16+0+4+4+16 = 40; variens 8; standardavvikelse 2,83; CV = 2,7 % ⇒
   5 poäng.*
2. Serien 100 · 96 · 92 · 88 · 84 ger CV 6,2 % och poäng 4 — vad saknar
   talet?
   *Facit: riktningen. CV är blind för att kurvan sjunker monotont; läs
   V01 innan någon slutsats dras.*
3. Varför `STDAV.P` och inte `STDAV.S` i kalkylbladet?
   *Facit: modellen räknar populationens standardavvikelse (delar med n).
   `STDAV.S` delar med n−1 och blåser upp CV på korta serier — risken är
   en orättvist låg poäng.*

---

## V13 — Patent & IP · Moat

*Kursreferens: slug `v13-patent-ip` · AKM1 V13*

### Vad indikatorn mäter — och varför den spelar roll

Patent och immateriella rättigheter (IP) är **en vallgrav byggd av tid**:
en period av exklusivitet där konkurrenterna hålls borta från tekniken,
kunskapen eller uttrycket — och där FoU-kostnaden får tid att tjänas in.
Moat-kategorins fråga är aldrig "finns innovation här?" — det gör den
nästan överallt. Frågan är: **hur länge hålls konkurrenterna borta, och
vad kostar det dem att ta sig över?** Ett starkt patent är ett svar. En
fabrik är inte det (den kan byggas). Goodwill är det definitivt inte —
det är ett bokfört köpepris, inte ett skydd.

### Var i årsredovisningen du hittar den

1. **Noten Immateriella anläggningstillgångar** — läs POSTERNA, inte
   summan: *Patent*, *Licenser*, *Utvecklingskostnader i programvara*,
   *Varumärken* — och *Goodwill* som egen, åtskild rad.
2. **Förvaltningsberättelsens FoU-avsnitt** — inriktning, antal patent
   (bolagets egna uppgift — källkritik!) och pipeline för
   läkemedels-/biotechbolag.
3. **Resultaträkningens rad** *Forskning och utveckling* — inputen per
   år.
4. **Intäktsrader för royalties och licensiering** — det renaste beviset
   som finns: IP som själv säljs.
5. **IFRS-regeln som gör noten sned:** internt skapade patent och
   varumärken får INTE bokföras som tillgång — noten visar bara förvärvad
   (och i vissa fall aktivt utvecklad) IP. Den organiska IP-ytan är
   osynlig i balansräkningen och måste läsas i berättelsen.

### Så räknar du — steg för steg

V13 är kvalitativ i modellen (osatt i datakontraktet, poängsatt manuellt)
— men läsningen har aritmetik:

1. Plocka ur noten skydds-IP (patent + licenser +
   programvaruutveckling) och håll goodwill åtskilt.
2. **Andel skyddad IP** = skydds-IP ÷ summa immateriella tillgångar.
3. **FoU-intensitet** = FoU-kostnad ÷ nettoomsättning.
4. **IP-självbärande** = royalty-/licensintäkter ÷ nettoomsättning.
5. **Kvarvarande löptid:** patent löper grovt 20 år från ansökan — väga
   portföljens återstående tid per patents andel av värdet.
6. Poäng efter mekanismens hållbarhet: licensierat (IP som intäktsrad) >
   evig rättighet/teknikportfölj > utlöpningstyrt — aldrig efter
   IP-summans storlek.

### Räkneexempel: MedSens AB (påhittat, miljoner kronor)

Noten immateriella anläggningstillgångar: Patent 45 · Utvecklingskostnader
i programvara 25 · Varumärken (förvärvade) 12 · Goodwill 300 · **Summa
382**. Resultaträkningen: nettoomsättning 700, FoU-kostnad 85, varav
licens-/royaltyintäkter 40 (intäktsnoten). Bruttomarginalen (V07) är 54 %
och stabil fem år.

Beräkning:

- **Skyddad-IP-andel** = (45 + 25) ÷ 382 = 70 ÷ 382 = **18,3 %** —
  goodwill svarar för 300 ÷ 382 = 78,5 %: vallgraven är till övervägande
  del *köpt*, inte byggd.
- **FoU-intensitet** = 85 ÷ 700 = **12,1 %** — kraftig input.
- **IP som intäkt** = 40 ÷ 700 = **5,7 %** — portföljen börjar bära sig
  själv.
- **Löptid:** huvudpatent A (60 % av portföljvärdet) löper 10 år till,
  patent B (40 %) 3 år till ⇒ vägd kvarvarande löptid = 0,6 × 10 + 0,4 × 3
  = **7,2 år**.

Tolkning: marginalbeviset avgör om 12 % FoU producerar vallgrav eller bara
kostnad — MedSens 54-procents bruttomarginal, stabil i fem år, håller
måttet. Poängresonemanget: med B-patentet löper ut om tre år och en
goodwill-tyngd balansräkning hålls poängen medel-hög trots fin input —
kvaliteten ligger i A-patentets årtionde och royaltyraden, inte i
summorna.

### Fallgropar — hur talet kan snedvridas

- **Patentantal är inte skydd:** kvalitet, patentfamiljens storlek och
  vilka jurisdiktioner som täcks avgör — ett amerikanskt patent skyddar
  inte Europa.
- **Patent utlöper:** grovt 20 år från ansökan (läkemedel har
  förlängningsvägar) — räkna kvarvarande tid, inte bestånd.
- **Goodwill liknar IP i noten men är inget skydd:** det är köpepriset på
  förvärvade bolag — en goodwill-tyngd balansräkning säger att moaten
  *köpts*, inte att den finns.
- **FoU-kostnad är input; marginalen är output:** enorma FoU-belopp utan
  marginalförbättring bygger ingen vallgrav (koppla V07).
- **"Patent pending" är noll skydd** — ansökan ger ingen exklusivitet
  förrän den beviljats.
- **Kapitaliserad FoU kan glatta resultatet:** att bokföra utveckling som
  tillgång i stället för kostnad är en redovisningsfråga — läs notens
  policy.

### Övningar med facit

1. Noten visar: patent 30, programvara 20, varumärken 10, goodwill 240.
   Andel skyddad IP — och vad säger den?
   *Facit: (30+20) ÷ 300 = 16,7 %; goodwill 80 %. Vallgraven är till
   största delen köpt — kvitto på förvärv, inte bevis på skydd.*
2. FoU-kostnaden är 60 på en omsättning 500. Är det en moat?
   *Facit: FoU-intensiteten 12 % är input, inte bevis. Kräv marginalen
   (V07), löptid och patentfamilj innan poäng sätts.*
3. Portföljen: 70 % av värdet med 8 år kvar, 30 % med 2 år kvar. Vägd
   löptid?
   *Facit: 0,7 × 8 + 0,3 × 2 = 6,2 år — om sex år är huvudskyddet borta
   om pipelinen inte förnyar det.*

---

## V14 — Varumärke & Kundlojalitet · Moat

*Kursreferens: slug `v14-varumarke` · AKM1 V14*

### Vad indikatorn mäter — och varför den spelar roll

Ett varumärke är en moat bara om det **får betalt**: kunderna betalar mer,
kommer tillbaka oftare eller förlåter fel snabbare hos detta bolag än hos
en namnlös konkurrent med samma produkt. Det som kan mätas är inte namnet
utan **prissättningskraften** — skillnaden mellan vad kunden betalar här
och vad hen hade betalt hos konkurrenten. Därför är V14 den enda
moat-indikatorn där svaret delvis står i *resultaträkningen*: en
bruttomarginal som ligger varaktigt över branschens är varumärkets kvitto.

### Var i årsredovisningen du hittar den

1. **Förvaltningsberättelsen:** positioneringsorden ("premium",
   "ledande", "första valet") — påståenden att pröva, inte tro.
2. **Resultaträkningen:** bruttomarginalen (nettoomsättning − kostnad
   sålda varor) och raden sälj- och marknadsföringskostnader.
3. **Kundnoten och segmentnoten:** koncentration (koppla V03) och hur stor
   del av intäkterna som är återkommande.
4. **Marknadsandelar:** bolagets egna uppgifter + branschorganisationer —
   andelen säger hur starkt namnet står i köpögonblicket.
5. **Noten immateriella igen:** internt byggt varumärke bokförs ALDRIG —
   varumärkesposter i noten är köpta. Det organiska varumärket läses i
   marginalen och kundnoten, inte i balansräkningen.

### Så räknar du — steg för steg

1. **Bruttomarginal** = (nettoomsättning − kostnad sålda varor) ÷
   nettoomsättning.
2. Jämför med **branschmedianen** → premien i procentenheter.
3. **Pristest:** eget pris ÷ jämförbar produkts pris − 1 = prispremien i
   procent.
4. **Reklamtryck** = sälj- och marknadsföringskostnad ÷ nettoomsättning —
   stigande reklam med sjunkande marginal är ett varumärke som hyr sin
   plats.
5. **Loyalitet:** andel återkommande intäkter och retention, om det
   redovisas.
6. **Stabilitet:** marginalens spridning över fem år — en moat håller
   genom konjunkturer.

Poängen sätts kvalitativt och manuellt: högt när premien är bevisad och
stadig, lågt när namnet är känt men marginalen inte skiljer sig från
branschens.

### Räkneexempel: Mörk Brygd AB (påhittat, miljoner kronor)

Resultaträkningen: nettoomsättning 700, kostnad sålda varor 280, sälj- och
marknadskostnad 95. Femårs marginaler: 58 · 59 · 60 · 60 · 61 %. Prenumer-
ationsklubben står för 62 % av intäkterna; retention 78 %. Hyllpriset:
500 g för 79 kr mot privatlabel 49 kr.

Beräkning:

- **Bruttomarginal** = (700 − 280) ÷ 700 = 420 ÷ 700 = **60 %**. Bransch-
  medianen är 42 % ⇒ premie **18 procentenheter**.
- **Prispremie** = (79 − 49) ÷ 49 = **61 %**.
- **Reklamtryck** = 95 ÷ 700 = **13,6 %** — och marginalen *stiger* medan
  reklamandelen står stilla: namnet tar betalt, det hyr inte.
- **Stabilitet:** marginalens spridning 3 procentenheter över fem år —
  kraften har hållit.

Tolkning: kvitto-kedjan är komplett — premie i marginalen, premie i
hyllpriset, återkommande intäkter som bevisar lojaliteten. Poängresonemanget
blir högt, med reservationen att konsumentvaror lever på trender: läs
riskavsnittet för varumärkeskänslighet (gränssnittet mot V18).

### Fallgropar — hur talet kan snedvridas

- **Känt ≠ starkt:** medvetenhet utan prissättningskraft är reklam, inte
  moat — det kändaste namnet i en bransch kan ha marginal under medianen.
- **Andel köpt med rabatt:** marknadsandel växt genom kampanjer och promor
  kan sjunka lika snabbt — kolla pris- och promo-noter.
- **Mode- och cykelvarumärken förslits:** positionering som måste förnyas
  varje säsong är en hyrd moat.
- **Köpt varumärke i noten är historik:** det säger att moaten betalats
  för en gång, inte att den förvaltas.
- **Varumärkesrisker syns inte i noterna:** en kontrovers eller
  kvalitetskris kan tömma en moat i veckor — läs riskavsnittet.
- **Inflationstestet:** håller prispremien när kunderna får mindre för
  pengarna? En premie som pressas i nedgång är tunnare än den ser ut.

### Övningar med facit

1. Nettoomsättning 500, kostnad sålda varor 250, branschmedian 44 %.
   Marginal och premie?
   *Facit: (500 − 250) ÷ 500 = 50 %; premie 6 procentenheter.*
2. Bolaget har branschens starkaste varumärkeskännedom men bruttomarginal
   under medianen — slutsats?
   *Facit: känt ≠ starkt. Utan prissättningskraft är namnet reklam, inte
   moat — låg V14 trots kännedom.*
3. Reklamkostnaden växer 20 % och bruttomarginalen faller 3
   procentenheter — vad berättar det?
   *Facit: varumärket hyr sin plats — det betalar för volym i stället för
   att ta betalt för namnet.*

---

## V15 — Nätverkseffekter · Moat

*Kursreferens: slug `v15-natverkseffekter` · AKM1 V15*

### Vad indikatorn mäter — och varför den spelar roll

En nätverkseffekt finns när **varje ny användare gör tjänsten mer
värdefull för alla som redan är där** — värdet växer snabbare än
användarantalet (Metcalfes tumregel: värde proportionellt mot n²; i
praktiken oftast långsammare men ändå överlinjärt). Det är den enda moat
som förstärker sig själv: konkurrenten måste inte bara bygga en bättre
produkt, den måste flytta hela skaran samtidigt.

Tre sorter att skilja på: **direkta** (användare skapar värde åt
varandra — sociala nätverk, meddelandetjänster), **tvåsidiga**
(marknadsplatser — fler köpare lockar fler säljare som lockar fler köpare)
och **data-nätverk** (varje användning genererar data som gör produkten
bättre för nästa användning). Skilj också från *ekosystem*
(switchkostnader, inte deltagarantal) och *skala* (driftsäkerhet,
leverantörsdjup) — utmärkta vallgravar, men andra indikatorer. Testfrågan:
**gör användare nummer N+1 tjänsten bättre för användare 1 till N?**

### Var i årsredovisningen du hittar den

1. **KPI-sektionen i förvaltningsberättelsen:** användare, MAU,
   abonnemang, handelsvolym — *flera år bakåt*, inte bara senaste året.
2. **Noten om intäkter:** intäkt per kund/brukare och, för marknadsplatser,
   take rate — andelen av handelsvolymen som blir intäkt.
3. **Båda sidorna** på tvåsidiga plattformar: tillväxttakten per sida —
   en tom sida är ingen marknadsplats.
4. **Retention/churn** om det redovisas: nätverkets hållfasthet visar sig
   i hur många som stannar.
5. **Noten om immateriella tillgångar** (V13-gränssnittet): datan som
   ägodel.

### Så räknar du — steg för steg

1. Användarserien per år → tillväxttakt per år; **CAGR** = (sista ÷
   första)^(1/antal år) − 1.
2. **Monetisering:** intäkt ÷ användare (ARPU) — växer den med nätverket?
3. **Take rate** = plattformsintäkt ÷ handelsvolym (GMV) på marknadsplatser.
4. **Metcalfe-illustration:** (nytt ÷ gammalt antal)² = förbindelseökningen
   — som illustration av mekanismen, aldrig som värderingsunderlag.
5. **Organiskt eller subsidierat?** Rabatter och bonusar bygger ingen
   självgående cirkel — churnen kommer när subventionen slutar.
6. Poängen sätts kvalitativt: högst när cirkeln är sluten
   (data-nätverk), växten organisk och monetiseringen synlig (ARPU/take
   rate).

### Räkneexempel: RingSkydd AB (påhittat)

App som blockerar spamnummer: användarna rapporterar in nummer →
databasen växer → alla får bättre skydd → fler använder appen → ännu mer
data rapporteras in.

| År | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Användare (miljoner) | 12 | 18 | 27 | 41 | 58 |
| Intäkt per användare (kr) | 8,1 | 8,6 | 9,0 | 9,4 | 9,9 |
| Rapporterade nummer (miljoner) | 1,2 | 1,9 | 2,7 | 3,8 | 4,9 |

Beräkning:

- **CAGR användare** = (58 ÷ 12)^(1/4) − 1 ≈ **48 % per år**.
- **ARPU-takt** = (9,9 ÷ 8,1)^(1/4) − 1 ≈ **5,2 % per år** — nätverket
  växer OCH monetiseras.
- **Data-loopen:** databasen växde 4,9 ÷ 1,2 ≈ 4,1× på fyra år.
  Metcalfe-illustration: användarna 4,8× ⇒ möjliga förbindelser (4,8)² ≈
  23×.
- **Sluten cirkel:** nykomlingen börjar med en tom databas — cirkeln är
  självförstärkande och svår att kopiera.

Miniexempel, tvåsidigt — låtsasbolaget *LoppTorget AB*: handelsvolym
(GMV) 2 400 mkr, plattformsintäkt 96 ⇒ **take rate = 96 ÷ 2 400 =
4,0 %**. Säljarna +12 % och köparna +24 % under året — båda sidorna
växer, ingen tom sida.

### Fallgropar — hur talet kan snedvridas

- **Buzzword-fällan:** alla plattformar kallar sig nätverk — bevisa
  kausaliteten (användare → bättre produkt) innan du godtar ordet.
- **Tom sida:** en marknadsplats utan säljare är ingen marknadsplats —
  kolla båda sidorna var för sig.
- **Subventionerade användare:** rabatter och bonusar bygger ingen
  självgående cirkel — churnen kommer när subventionen slutar.
- **Nätverk kan vända:** samma mekanism som bygger snabbt kan tömma
  snabbt när värdet faller — retention är säkerhetsräcket.
- **Metcalfe gäller sällan fullt ut:** värde per användare tilltar oftast
  log-linjärt — dra inte värderingsslutsatser av användartal.
- **Nätverks-moat ≠ intäkts-moat:** utan monetisering (ARPU, take rate)
  är nätverket en kostnad med publik.

### Övningar med facit

1. Användare växer från 20 till 35 miljoner på två år. CAGR?
   *Facit: (35 ÷ 20)^(1/2) − 1 = 1,75^0,5 − 1 ≈ 32,3 % per år.*
2. GMV 1 500 mkr, plattformsintäkt 52,5 mkr. Take rate?
   *Facit: 52,5 ÷ 1 500 = 3,5 %.*
3. Testa med N+1-frågan: (a) en lånejämförelsetjänst där fler banker lockar
   fler sökande; (b) en backuptjänst där bara kundens egna filer lagras.
   *Facit: (a) tvåsidig nätverkseffekt — varje sida gör den andra mer
   värdefull. (b) nej — det är switchkostnad och skala, ingen
   användarinteraktion; V15-poängen ska vara låg.*

---

## V16 — Produktlanseringar · Katalysator

*Kursreferens: slug `v16-produktlanseringar` · AKM1 V16*

### Vad indikatorn mäter — och varför den spelar roll

Produktlanseringar mäter **vad bolaget har på väg in som kan förändra
intäktskurvan**: nya produkter, nästa generation, pipeline. Det är
katalysatorkategorins kärna — skillnaden mellan ett bolag som lever på det
som redan lanserats och ett som har nästa intäktsvåg dokumenterad och
daterad. Avgränsningarna är viktiga: V16 är **inte** en moat (V13–V15
frågar vad som håller konkurrenter borta) och **inte** tillväxten själv
(V01 mäter det som redan hänt). Frågan är: finns namngivna, daterbara
händelser framåt som marknaden kan prissätta?

### Var i årsredovisningen du hittar den

1. **Förvaltningsberättelsens avsnitt om kommande event:** många bolag
   listar lanseringar, milstolpeplaner eller pipelines med kvartals- eller
   årsdatum — indikatorns råmaterial.
2. **Pipelinetabeller** hos läkemedels-/teknikbolag: fas, indikation,
   förväntat beslutsdatum — den mest strukturerade formen.
3. **Segmentnoten** (V03): vilken del av bolaget lanseringen berör — en
   stor lansering i ett litet segment väger mindre.
4. **Noten immateriella tillgångar:** kapitaliserade utvecklingskostnader
   = balanserad FoU, arbete på väg som ännu inte lanserats.
5. Kontrollfrågan: är händelsen **daterad och specifik** ("Q2 2027",
   namngiven produkt) eller **vag** ("fortsatt innovation")? Bara det
   första är katalysator; det andra är stämningsläge.

### Så räknar du — steg för steg

1. Lista de namngivna och daterade lanseringarna — stryk de vaga.
2. För varje: vilken segmentomsättning berörs (segmentnoten)?
3. **Väntad intäktspåverkan** = segmentomsättning × väntad andel.
4. Relatera till helheten: påverkan ÷ koncernomsättningen.
5. **Kapitaliserad utveckling:** förändringen mellan åren = arbete på
   väg.
6. Poängen sätts manuellt (kvalitativ): 0 = inget namngivet framåt · 5 =
   daterad pipeline i kärnsegmentet med volym synlig.

### Räkneexempel: Smart Hem AB (påhittat, miljoner kronor)

Koncernomsättning 600. Segmentnoten: Belysning 240 · Lås 180 · Högtalare
120 · Övrigt 60. Pipelinenämnden i förvaltningsberättelsen namnger tre
daterade händelser — "Trådlös strömbrytare, Q2 2027" (Belysning), "Låsapp
öppen standard, Q1 2028" (Lås), "Hemlarm v2, Q3 2027" (Övrigt) — plus fem
vagare formuleringar som "fortsatt innovation inom ljud".

Beräkning:

- **Daterade och namngivna: 3 av 8** nämnda händelser — bara de tre
  räknas som katalysatorer.
- **Strömbrytaren:** Belysning 240 × väntad andel 12 % = **+29 mkr per
  år** ≈ 4,8 % av koncernomsättningen.
- **Hemlarm v2:** Övrigt 60 × 30 % = +18 mkr — stort i segmentet
  (30 %), litet i koncernen (3 %). Segmentnoten sätter perspektivet.
- **Kapitaliserade utvecklingskostnader:** 24 → 38 (+14) — pågående
  arbete som ännu inte blivit omsättning.

Tolkning: kalendern utanför bokslutsdagen är V16:s råvara. De tre daterade
händelserna är poängbara; "fortsatt innovation" är värd noll i indikatorn
— det är stämningsläge, inte katalysator.

### Fallgropar — hur talet kan snedvridas

- **Lansering ≠ framgång:** historiens träffsäkerhet för produkt-
  lanseringar är låg — katalysatorn säger att något KOMMER, inte att det
  SÄLJER.
- **Bolagets egna pipelineord är säljande till sin natur:** skilj det som
  är regulatoriskt förankrat (V18) från marknadsföring.
- **Prissatt redan?** En välkommunicerad lansering kan ligga i kursen —
  katalysatorn är värd mest när den är oväntad.
- **Cykelförväxling:** lastbils- och halvledarcyklernas svängningar är
  efterfrågekatalsatorer (V12), inte produktkatalysatorer.
- **Kapitaliserad FoU kan försköna:** att bokföra utveckling som tillgång
  i stället för kostnad glattar resultatet — läs notens policy.

### Övningar med facit

1. Ett segment omsätter 150 mkr; en lansering väntas ta 20 % av
   segmentet. Koncernomsättningen är 750 mkr. Intäktspåverkan?
   *Facit: 150 × 0,20 = 30 mkr = 4,0 % av koncernen.*
2. Förvaltningsberättelsen nämner fem händelser; två är namngivna med
   kvartal. Hur många räknas?
   *Facit: två — daterat och specifikt är katalysator; resten är
   stämningsläge.*
3. Kapitaliserade utvecklingskostnader växer från 20 till 34 mkr. Ge två
   läsningar.
   *Facit: (i) arbete på väg in — kommande lanseringar byggts under
   året; (ii) varning: FoU som bokförs som tillgång i stället för
   kostnad kan glatta resultatet — kontrollera notens policy.*

---

## V17 — Avtal & Partnerskap · Katalysator

*Kursreferens: slug `v17-avtal-partnerskap` · AKM1 V17*

### Vad indikatorn mäter — och varför den spelar roll

Avtal och partnerskap mäter **bindande intäktsvägar som redan skrivits
under men ännu inte fullt betalat ut**: kundavtal, ramavtal, samarbeten,
licensieringsavtal. Skillnaden mot V16 är avgörande — en lansering är en
chans, ett undertecknat avtal är en förpliktelse från motparten.
Katalysatorn ligger i att intäkten finns i kontraktet innan den finns i
resultaträkningen.

Tre avtalsarter att skilja på: **ramavtal** (ett tak, inte ett golv —
volymer styrs av motpartens investeringstakt), **volymsavtal** (intäkt
per enhet, svänger med trafiken) och **intäktsdelningsavtal** (delad
risk). Poängen ska spegla avtalets bindning och storlek — inte rubrikens
volym.

### Var i årsredovisningen du hittar den

1. **Förvaltningsberättelsens avtals- och orderrubriker:** "viktiga avtal
   under året", orderintagning, orderstock/backlog — med namngivna
   motparter när avtalen får nämnas.
2. **Noten om intäkter/segment:** upparbetade intäkter (förskott som växer
   = kunder betalat i förskott), avtalsstock, ordervärde.
3. **Kundnoten** (V03): storkundsandel — ett jätteavtal är katalysator
   OCH riskkoncentration i samma rad.
4. **Avtalsbeskrivningar:** bindningstid, termineringsrätter,
   prisrevisioner — ett avtal som kan sägas upp med tre månaders varsel är
   ett rabattkvitto, inte en intäktsväg.
5. **Pressmeddelanden utanför rapporten** — källa med lägre trovärdighet:
   avsiktsförklaring eller kontrakt? Redovisningen är sanningsägaren.

### Så räknar du — steg för steg

1. **Book-to-bill** = orderintagning ÷ fakturerad omsättning (1,0 =
   jämvikt; över 1 växer orderstocken).
2. **Backlog-täckning** = orderstock ÷ årsomsättning (antal månaders
   säkrad fakturering).
3. **Avtalsvärde per år:** ramavtalets tak ÷ löptiden — jämför med
   omsättningen.
4. **Upparbetade intäkter:** förändringen = nytt förskott från kunder.
5. **Justera för uppsägningstid:** det garanterade beloppet ≈ en period av
   termineringsrätten.
6. Poängen (kvalitativ): 0 = inga namngivna avtal · 3 = avtal av betydelse
   med oklar bindning · 5 = undertecknade fleråriga avtal i kärnsegmentet
   med belopp eller volym synlig i redovisningen.

### Räkneexempel: InfraMät AB (påhittat, miljoner kronor)

Fakturerad omsättning 640; orderintagning 690; orderstock 480. Ett
ramavtal med max 300 över tre år och tre månaders uppsägningstid.
Upparbetade intäkter växte från 22 till 41. Största kunden svarar för
28 % av intäkterna.

Beräkning:

- **Book-to-bill** = 690 ÷ 640 = **1,08** — orderstocken växer.
- **Backlog-täckning** = 480 ÷ 640 = **0,75 år ≈ 9 månader** säkrad
  fakturering.
- **Ramavtalet:** tak 100 per år = 15,6 % av omsättningen — men med tre
  månaders uppsägning är det *garanterade* ≈ 25 (ett kvartal).
- **Upparbetade intäkter** +19 — kunderna betalar i förskott: intäkten
  ligger i framkant, kassan redan här (V11-länken).
- **Koncentrationsläsning:** största kund 28 % — katalysator och V03-risk
  är samma händelse.

Tolkning: orderboken är stark (book-to-bill över 1, nio månader täckning),
men ramavtalets "300 över tre år" är ett tak som motparten kan lämna med
90 dagars varsel — den hårt bundna intäkten är ett kvartal, inte tre år.

### Fallgropar — hur talet kan snedvridas

- **Pressmeddelandets vs redovisningens språk:** "strategiskt partnerskap"
  kan vara en avsiktsförklaring utan ekonomiskt innehåll — redovisningen
  är sanningsägaren.
- **Orderstock ≠ intäkt:** order kan ställas in eller omförhandlas — de är
  mjukare än de ser ut.
- **Termineringsrätter och prisrevisioner** gör långa avtal korta i
  praktiken — läs villkoren i noterna, inte löptiden i rubriken.
- **Relaterade parter och interna avtal** i koncerner blåser upp "viktiga
  avtal" utan marknadsvärde.
- **Kundkoncentration:** poängsätt aldrig V17 högt utan att läsa V03.
- **Index- och prisklausyler** kan tömma avtalets värde vid inflation —
  notera revisionsvillkoren.

### Övningar med facit

1. Orderintagning 540, fakturerad omsättning 600. Book-to-bill — och vad
   betyder det?
   *Facit: 540 ÷ 600 = 0,90 — under 1: orderstocken krymper.*
2. Orderstock 300, årsomsättning 400. Täckning?
   *Facit: 300 ÷ 400 = 0,75 år ≈ 9 månader.*
3. Ramavtal: tre år à 100 mkr per år, uppsägningstid 3 månader. Hur mycket
   är hårt bundet?
   *Facit: cirka ett kvartal ≈ 25 mkr — resten är ett tak, inte ett
   golv.*

---

## V18 — Regulatoriska katalysatorer · Katalysator

*Kursreferens: slug `v18-regulatoriska` · AKM1 V18*

### Vad indikatorn mäter — och varför den spelar roll

Regulatoriska katalysatorer är **beslut hos myndigheter som kan flytta
bolagets värde utan att bolaget kan påverka takten**: godkännanden,
licenser, kapitalkrav, skatteregler, sanktioner. De är de mest binära
katalysatorer som finns — ett godkännande öppnar en marknad, ett avslag
stänger den, och klockan ägs av myndigheten, inte av bolaget. Källan i
modellen är *riskavsnittet* i förvaltningsberättelsen — regulatorisk
katalysator och regulatorisk risk är samma händelse sedd från två sidor,
och den som läser bara ena sidan missprissätter.

Tre regulatoriska arter: **godkännande** (binärt — läkemedel, licenser),
**kapitalregel** (gradvis men kapitalbindande — banker) och
**sanktion/export** (existentiell risk på affärsnivå).

### Var i årsredovisningen du hittar den

1. **Riskavsnittet i förvaltningsberättelsen:** rubriker om regelverk,
   licenser, myndighetsprocesser — väntande beslut står ofta här före de
   når pressmeddelandena.
2. **Noter om väsentliga osäkerheter och eventualförpliktelser:** pågående
   processer, böter, återbetalningskrav.
3. **Läkemedels-/medtechbolag:** godkännandeprocesser (fas III → ansökan
   → beslut) med myndighetsnamn och förväntade datum — den mest
   strukturerade regulatoriska kalendern (koppla V16).
4. **Finansbolag:** kapitaltäckningskrav och tillsynsbeslut — binder
   kapital och sätter utrymmet för utdelning/återköp (koppla V20).
5. **Licenstagbolag:** licensportföljen per jurisdiktion — hos spelbolag
   är portföljen själva affären.

### Så räknar du — steg för steg

1. **Exponeringsgrad** = intäkter i licens-/godkännandebberoende marknader
   ÷ totala intäkter.
2. **Licensportfölj:** andel licenser under förnyelse; intäktsandelen per
   jurisdiktion.
3. **Kalendern:** beslutsdatum och ikraftträdandedatum — övergångsperioden
   är den verkliga tidslinjen; räkna månaderna mellan.
4. **Utfallsrummet:** godkänt / villkor / avslag — binärt, inga halvlägen.
5. **Det väntande beslutets värde** = adresserbar ny marknadsintäkt ÷
   nuvarande intäkter.
6. Poängen (kvalitativ): 0 = inga väntande beslut av betydelse · 3 =
   väntande beslut med dubbelriktat utfall i kärnaffären · 5 = namngivna
   myndighetsbeslut med datum som kan öppna intäktsvägar eller avvärja
   väsentlig risk.

### Räkneexempel: NordVacc AB (påhittat, miljoner kronor)

Omsättning 300, varav licensierade jurisdiktioner 195. Licensportföljen:
9 licenser, 2 under förnyelse. En vaccinkandidat i fas III med
myndighetsbeslut väntat Q2 2027 — beslutet kan öppna en ny region värdd
cirka 45 per år. Ett nytt kapitalkrav beslutades i maj 2026 med
ikraftträdande i januari 2028 (övergångsperiod 20 månader) och en
engångskostnad på 12.

Beräkning:

- **Exponering** = 195 ÷ 300 = **65 %** — regulatoriken är själva
  affären.
- **Portfölj under förnyelse** = 2 ÷ 9 = **22 %** — förnyelsetätheten är
  riskbilden.
- **Beslutets värde** = 45 ÷ 300 = **15 %** av dagens intäkter — en
  verklig katalysator, men klockan ägs av myndigheten: Q2 2027 är
  bolagets hopp, inte en rättighet.
- **Övergången:** maj 2026 → januari 2028 = **20 månader** — läs
  ikraftträdandet, inte beslutsdatum.

Tolkning: utfallsrummet är tredelat — godkänt (öppnar 15 % ny intäkt),
villkor (försenad eller begränsad lansering), avslag (pipeline-värdet
skrivs av). Poängsättningen väger båda sidor: den väntande öppningen och
förlust risksidan i de två licenser som ska förnyas.

### Fallgropar — hur talet kan snedvridas

- **Binära beslut har inget halvläge:** poängsätt inte "ganska troligt
  godkänt" — beskriv utfallsrummet (godkänt/villkor/avslag) i stället.
- **Myndighetstakt är opåverkbar:** förseningar är normalfallet —
  katalysatordatum från bolaget är önsketänkande, inte kalender.
- **Regulatorisk eftersläpning:** regler som annonserats men ej trätt i
  kraft — läs ikraftträdandedatum, inte beslutsdatum.
- **Flagga-allt-fällan:** riskavsnitten listar allt som är lagligt —
  skilj de väsentliga (licensförlust, godkännanden) från rutinmässiga
  (allmän lagändring).
- **Dubbelräkning:** ett godkännande som redan gett intäkt är inte en
  katalysator längre — katalysatorn lever bara i väntan.
- **Spegelbilden:** avslag i kärnprodukten är den negativa katalysatorn —
  poängsätt utfallsrummet åt båda håll.

### Övningar med facit

1. 240 av 320 mkr kommer från licensberoende marknader. Exponering?
   *Facit: 240 ÷ 320 = 75 %.*
2. Ett krav beslutades i maj 2026 och träder i kraft i januari 2028 —
   varför läsa ikraftträdandet?
   *Facit: övergångsperioden är 20 månader; den ekonomiska effekten kommer
   när regeln träder i kraft, inte när den beslutades.*
3. En analys säger "ganska troligt godkännande". Vad är felet?
   *Facit: binära beslut har inget halvläge — beskriv godkänt/villkor/
   avslag och exponeringen per utfall i stället.*

---

## V19 — Kassatäckning — nyemissionsrisk · Risk & kapitalstruktur (KRITISK)

*Kursreferens: slug `v19-kapitalforbranning` · AKM1 V19*

### Vad indikatorn mäter — och varför den spelar roll

Kassatäckningen mäter **hur många månader bolaget överlever på kassan det
har, om inget förändras**: kassa ÷ månadsförbrukning. Indikatorns
brutalitet är poängen — den ignorerar tillgångar, orderböcker och löften
och svarar på en enda fråga: *hur länge räcker pengarna?*

V19 är den **enda kritiska riskindikatorn** i AKM1, och den enda med en
**hård port**: sjunker kassatäckningen under tolv månader kapas hela
modellens kompositpoäng (tak 45/100). Varför så hårt? Därför att
nyemissionsrisken inte är en egenskap bland andra — ett bolag som måste
emittera har en klocka som slår nedåt, och ägarna betalar notan genom
utspädning. Överlevnaden är inte en egenskap vid sidan av de andra; den är
förutsättningen för att de andra ska få räknas.

### Var i årsredovisningen du hittar den

1. **Balansräkningen:** *Kassa och bank* + *Kortfristiga placeringar*.
2. **Kassaflödesanalysen:** *Kassaflöde från den löpande verksamheten* —
   den löpande förbrukningen (negativt löpande kassaflöde ÷ 12 =
   månadsförbrukning).
3. **Not om kredittillgångar:** outnyttjade kassakrediter förlänger
   täckningen — men krediten är andras pengar: räkna den separat, aldrig
   in i kvoten.
4. **Förvaltningsberättelsens finansieringsavsnitt:** planerade åtgärder
   (emission, låneökningsutrymme).
5. Kontrollfrågan: är förbrukningen **struktur** (löner, lokaler,
   utveckling) eller **engång** (juridisk process, omstrukturering)?

### Så räknar du — steg för steg

1. **Kassa** = kassa och bank + kortfristiga placeringar (balansräkningen).
2. **Månadsförbrukning** = (−) kassaflöde från löpande verksamheten ÷ 12.
3. **Kassatäckning** = kassa ÷ månadsförbrukning, i månader.
4. **Strukturjustering:** stryk engångsposter ur förbrukningen — modellen
   bokför månader, analysen förklarar dem.
5. **Kredit separat:** kassa + outnyttjad kredit = breddad täckning — men
   krediten tillför skuld, inte överlevnad.

Poängtrappan (dokumenterad klippkurva i kärnan): positivt kassaflöde 5 av
5 år ⇒ 5 (själfinanzierande) · > 48 månader ⇒ 4 · 30–48 ⇒ 3 · 18–30 ⇒ 2 ·
12–18 ⇒ 1 · **under 12 månader ⇒ 0 — OCH hård port: kompositen takas till
45/100**.

### Räkneexempel: FusionCell AB (påhittat, miljoner kronor)

Balansräkningen: kassa och bank 84 + kortfristiga placeringar 26 = **110**.
Kassaflödesanalysen: löpande verksamheten **−78** för året, varav −18 är
en engångspost (juridisk process). Outnyttjad kassakredit: 40.

Beräkning:

- **Rå täckning** = 110 ÷ (78 ÷ 12) = 110 ÷ 6,5 = **16,9 månader** ⇒
  1 poäng — över porten, men nära.
- **Strukturjusterad:** (78 − 18) ÷ 12 = 5,0 per månad ⇒ 110 ÷ 5,0 =
  **22 månader** ⇒ 2 poäng. Båda läsningarna rapporteras — skillnaden är
  engångsposten.
- **Porträkning:** vore kassan 60 i stället ⇒ 60 ÷ 6,5 = **9,2 månader**
  ⇒ 0 poäng och kompositen kapas till 45/100 — inga moats, marginaler
  eller tillväxt räddar den då.
- **Krediten separat:** (110 + 40) ÷ 6,5 = 23 månader breddad täckning —
  men de 40 är skuld som måste betalas tillbaka, inte överlevnad.

Notera också vad indikatorn gör hos lönsamma bolag: fältet lämnas tomt i
universumet och kärnan använder proxyn *positivt kassaflöde 5 av 5 år ⇒ 5
poäng* — "själfinansierande". För dem är frågan inte överlevnad utan vad
överskottet förvaltas till (V20).

### Fallgropar — hur talet kan snedvridas

- **Ögonblicksbild:** brinntakten i dag säger inget om nästa beslut — ett
  bolag kan halvera burn på ett styrelsemöte och fördubbla den med ett
  anställningsbeslut.
- **Kassakredit är inte kassa:** den förlänger överlevnaden men tillför
  skuld — räkna den som separat rad.
- **"Positivt kassaflöde runt hörnet" är värt noll** i kassaräkningen —
  porten lyssnar på bokförda månader, inte prognoser.
- **Holdingbolagsartikeln:** "förbrukning" på administrationsnivå med
  kassa från realiseringar ger absurda tal (hundratals "månader") — sanna
  men meningslösa som överlevnadsmått. Läs alltid *vad* som brinner.
- **Porten är port:** under tolv månader hjälper inga andra starka
  egenskaper — allt kapas med samma slag.
- **Ränta och valuta på placeringarna** kan äta kassan — notera
  placeringarnas risk.

### Övningar med facit

1. Kassa 90 + placeringar 30; löpande kassaflöde −72 för året. Täckning
   och poäng?
   *Facit: 72 ÷ 12 = 6,0 per månad; 120 ÷ 6,0 = 20 månader ⇒ 2 poäng
   (18–30).*
2. Kassa 45, förbrukning −6 per månad. Poäng?
   *Facit: 45 ÷ 6 = 7,5 månader ⇒ 0 — och hård port: kompositen takas
   till 45/100.*
3. Kassa 80; årets förbrukning −60, varav −12 engång. Två läsningar?
   *Facit: rå: 80 ÷ 5,0 = 16 månader; strukturjusterad: (60−12) ÷ 12 = 4,0
   ⇒ 80 ÷ 4,0 = 20 månader — skillnaden är engångsposten.*

---

## V20 — Återköp av egna aktier · Risk & kapitalstruktur

*Kursreferens: slug `v20-aterekop-egna-aktier` · AKM1 V20*

### Vad indikatorn mäter — och varför den spelar roll

Återköpen mäter **om bolaget köper tillbaka sina egna aktier — och med
vilken kraft**: aktieantalets förändring. Återköp och nyemissioner är
samma mynts två sidor: köper bolaget tillbaka ägs mer av kvarvarande
ägare per aktie (alla nyckeltal per aktie stiger mekaniskt); emitterar det
späds ägarna ut. Indikatorn hör hemma i kapitalstrukturen — hur vinsten
förs tillbaka till ägarna, tillsammans med utdelning.

Det mekaniska är poängen och fällan på en gång: återköp höjer vinst per
aktie utan att en enda krona mer tjänas. Indikatorn frågar därför efter
*verkningen* (andelen minskade aktier), inte *volymen* (beloppet) — och
den kritiska läsningen frågar till vilket pris återköpet skedde.

### Var i årsredovisningen du hittar den

1. **Noten om eget kapital:** antal aktier vid årets början och slut —
   differensen ÄR indikatorn (modellens fält: minskning som decimal, 0,02
   = 2 %).
2. **Not eller kommentar om återköp:** belopp, programmandat, genomfört
   under året.
3. **Egenkapitalnotens options- och personalprogram:** emissioner som kan
   äta upp återköpen — nettoändringen är det enda ärliga talet.
4. **Kassaflödesanalysen:** utbetalning för återköp av egna aktier i
   finansieringsverksamheten.
5. **Insiderköp:** VD/styrelseköp redovisas hos Finansinspektionen/
   aktieägartjänster — kompletterande observation, inte huvudspår.

### Så räknar du — steg för steg

1. **Nettoändring** = (slutantal − startantal) ÷ startantal. Minskning är
   positivt; ökning är utspädning.
2. Separera **bruttoåterköp** och **bruttoemission** (optioner,
   program) — netto är domstolen.
3. **EPS-mekaniken:** vinst ÷ slutantal jämfört med vinst ÷ startantal —
   den mekaniska höjningen i procent.
4. **Priset:** återköpskursens P/E (eller earnings yield = 1 ÷ P/E) —
   återköp är värdeskapande när den förvärvade avkastningen slår
   alternativen; koppla V04/V05 för värderingsläget.
5. **Balansräkningskontroll:** skuldfinansierade återköp höjer V10 och
   pressar V19 — läs de tre tillsammans.

Poängtrappan (dokumenterad i kärnan, på aktieantalets årliga ändring):
minskning ≥ 5 % ⇒ 5 · ≥ 3 % ⇒ 4 · ≥ 1,5 % ⇒ 3 · > 0 men < 1,5 % ⇒ 2 ·
0 % ⇒ 1 · ökning (utspädning) ⇒ 0. Reservgrenar när andelen saknas:
återköpsbelopp > 0 ⇒ 3 · insiderköp ≥ 3 ⇒ 2 · nyemission utan återköp ⇒
0 · annars osatt. (I modellens seriebevakning läses V20 inverterat:
minskat aktieantal = positivt momentum.)

### Räkneexempel: Verktygsstål AB (påhittat)

Aktieantal 1 januari: 100,0 miljoner; 31 december: 96,5 miljoner. Under
året återköptes 6,0 miljoner aktier för 180 mkr (snittkurs 30 kr);
samtidigt löstes personaloptioner med emission av 2,5 miljoner nya
aktier. Vinst för året: 192 mkr.

Beräkning:

- **Nettoändring** = (96,5 − 100,0) ÷ 100,0 = **−3,5 %** ⇒ 4 poäng.
- **Brutto mot netto:** bruttoåterköpet −6,0 % ser ut som toppoäng
  (≥ 5 % ⇒ 5) — men optionsemissionen +2,5 % äter upp det: netto −3,5 %
  ⇒ 4. Beloppet (180 mkr) är volym; andelen är verkan.
- **EPS-mekaniken:** 192 ÷ 100,0 = 1,92 → 192 ÷ 96,5 = 1,99 — **+3,6 %
  mekanisk** höjning. Ingen ny vinst har skapats; per-aktie-talet stiger
  för att kakan delas av färre.
- **Priset:** återköp till P/E = 30 ÷ 1,92 ≈ 15,6 ⇒ earnings yield ≈
  6,4 %. Återköp till den nivån "köper" en avkastning på 6,4 % — om
  bolagets organiska alternativ ger lägre avkastning är köpet
  värdeskapande; är kursen högt prissatt överförs värde från kvarvarande
  ägare till såljarna.

Tolkning: Verktygsståls återköp är verkliga (netto −3,5 %, poäng 4) men
inte maximala — optionsprogrammet äter nästan hälften. Den kloka läsningen
kombinerar andelen (V20), värderingen (V04/V05) och finansieringen (V10:
återköpet skedde ur fri kassa, inte ur ny skuld — annars hade poängen
skuggats av skuldbilden).

### Fallgropar — hur talet kan snedvridas

- **Återköp till vilken kurs?** Att köpa tillbaka över inre värde
  överför värde från kvarvarande ägare till såljare — poängen säger hur
  mycket, inte hur klokt.
- **Optionsutspädning äter återköp:** bruttoåterköp kan vara netto noll —
  nettoändringen i aktieantalet är domstolen.
- **Cykelåterköp:** toppens överskott köper dyrt; de bästa återköpen sker
  när kursen är pressad och kassan finns.
- **Skuldfinansierade återköp** höjer V10:s skuldsättningsgrad och
  pressar V19 — läs de tre tillsammans.
- **Insiderköp är en svagare signal:** små absoluta belopp och
  schablonmässiga planpjässer — kolla belopp per köp.
- **EPS-tricket:** återköp kan maskera stillastående vinst — EPS växer
  mekaniskt medan totalvinsten står stilla. Kolla också vinstnivån (V09).

### Övningar med facit

1. Aktieantalet går från 200 till 194 miljoner under året. Poäng?
   *Facit: (194 − 200) ÷ 200 = −3,0 % ⇒ 4 poäng.*
2. Start 100 miljoner; 4 miljoner köps tillbaka, 3,5 miljoner emitteras
   via optioner. Nettoändring och poäng?
   *Facit: slut 99,5 miljoner ⇒ −0,5 % ⇒ 2 poäng (> 0 men < 1,5 %).
   Bruttoåterköpet 4 % hade gett 4 — nettot är domstolen.*
3. Vinst 300 mkr; antal före 150 miljoner, efter 145 miljoner.
   EPS-förändring?
   *Facit: 300 ÷ 150 = 2,00 → 300 ÷ 145 = 2,07 ⇒ +3,4 % — mekanisk
   effekt av färre aktier, inte ökad lönsamhet.*

---

*Utbildningsmaterial — denna fil beskriver hur metoden läser, räknar och
poängsätter enligt AKM1:s dokumenterade trösklar. Alla bolag och siffror i
exemplen är påhittade. Inget här är investeringsråd och materialet
innehåller aldrig uppmaningar att köpa eller sälja (lag 2007:528).*
