# Fas 2-djup · Del 1 — Indikatorerna V01–V10 på djupet

Underlag till Fas 2-fördjupningen · fabrik v159-u1 · 2026-09-24
Kursreferens: de 20 fundamentala indikatorerna (AKM1 V01–V20) enligt
kanon i `src/lib/vagfundament-motor.ts` + underlagen i
`data/forskning/KURS-FAS2/`. Denna del täcker V01–V10; del 2 (V11–V20)
levereras som eget underlag.

> **Detta är utbildning, inte rådgivning.** Allt material beskriver hur
> metoden läser och räknar på offentliga årsredovisningar — ingenting här
> är ett råd att köpa, sälja eller hålla någon värdepapper (lag 2007:528
> om värdepappersrörelser; utbildning är tillåtet enligt 2 kap 5 §).
> Alla bolag och siffror i räkneexemplen är **påhittade** och konstruerade
> för övningens skull.

---

## Så använder du detta underlag

Varje indikator behandlas i sex steg: vad den mäter, var i
årsredovisningen den bor (med konkreta postnamn), hur den beräknas steg
för steg, ett genomskinligt räkneexempel, vanliga fallgropar samt tre
övningsfrågor med facit. Alla exempel räknas på ett och samma övningsbolag
— **NorrTeknik AB** — vars kompletta låtsas-årsredovisning står här nedan.
Du kan alltså följa med rad för rad i samma "redovisning" genom hela
dokumentet, precis som du senare kommer att följa ett riktigt bolag genom
en riktig årsredovisning.

## Låtsas-årsredovisningen: NorrTeknik AB (påhittat bolag)

NorrTeknik AB är ett påhittat svenskt bolag som tillverkar och servar
utrustning för skogsindustrin. Alla tal är konstruerade för övningen —
men de är internt konsistenta: resultaträkningen, balansräkningen och
noterna stämmer överens, så att du kan räkna efter och få exakt samma svar.
Belopp i miljoner kronor (Mkr) om inget annat sägs.

### Resultaträkning (koncernen)

| Post | 2025 | 2024 |
|---|---:|---:|
| Nettoomsättning | 1 200 | 1 050 |
| Kostnad sålda varor och tjänster (KSVT) | −720 | −648 |
| **Bruttoresultat** | **480** | **402** |
| Övriga rörelsekostnader | −330 | −296 |
| **Rörelseresultat (EBIT)** | **150** | **106** |
| Finansiella kostnader, netto | −12 | −10 |
| Resultat före skatt | 138 | 96 |
| Skatt | −28 | −19 |
| **Årets resultat** | **110** | **77** |

### Balansräkning (koncernen)

| Post | 2025 | 2024 |
|---|---:|---:|
| Kassa och bank | 60 | 45 |
| Kortfristiga placeringar | 20 | 15 |
| Kundfordringar | 145 | 120 |
| Lager | 130 | 115 |
| **Summa omsättningstillgångar** | **355** | **295** |
| Materiella anläggningstillgångar | 380 | 360 |
| Immateriella anläggningstillgångar (varav goodwill 90) | 120 | 110 |
| **Summa anläggningstillgångar** | **500** | **470** |
| **Summa tillgångar** | **855** | **765** |
| **Summa eget kapital** | **340** | **290** |
| Långfristiga skulder (varav räntebärande 180) | 200 | 180 |
| Kortfristiga skulder (varav räntebärande 20; leverantörsskulder 160) | 315 | 295 |
| **Summa skulder och övriga förpliktelser** | **515** | **475** |
| **Summa eget kapital och skulder** | **855** | **765** |

Kontroll: 340 + 515 = 855 — balansräkningen går ihop. Eget kapital rörde
sig 290 → 340 under 2025: +110 (årets resultat) − 60 (utdelning) = +50. ✔

### Kassaflödesanalys 2025 (utdrag)

| Post | 2025 |
|---|---:|
| Avskrivningar materiella tillgångar | 40 |
| Avskrivningar immateriella tillgångar | 15 |
| **Summa avskrivningar** | **55** |

### Noter och nyckeltal (utdrag ur låtsas-redovisningen)

- **Segmentnot:** Maskiner 610 · Service & uppgradering 340 · Reservdelar
  250 (summa 1 200).
- **Geografinot:** Sverige 480 · övriga Norden 240 · övriga Europa 300 ·
  Asien 120 · Amerika 60 (summa 1 200).
- **Storkundsnot:** "Ingen enskild kund andel av nettoomsättningen
  överstiger 10 %." (Största kunden uppges i hanteringen vara 8 %.)
- **Förvaltningsberättelsen:** "Tecknade serviceavtal med löptid minst
  12 månader uppgick per balansdagen till ARR 320 (föregående år: 265)."
- **Aktiedata:** 40,0 miljoner aktier; aktiekurs vid bokslut 45 kr →
  **börsvärde 1 800 Mkr**.

---

## V01 — Försäljningstillväxt (Tillväxt)

### a) Vad indikatorn mäter — och varför den spelar roll

Försäljningstillväxt mäter hur bolagets nettoomsättning rör sig mellan två
perioder — det mest grundläggande tecknet på om efterfrågan på det bolaget
säljer växer, står stilla eller krymper. Intäktsraden är föräldern till
allt annat i redovisningen: vinsten, utdelningen och det egna kapitalet är
barn av försäljningen, och en tillväxt som stannar av trycker förr eller
senare på varenda annat nyckeltal. Tillväxten är också den mest lätta
indikatorn att verifiera själv — i resultaträkningen står årets och förra
årets siffra bredvid varandra, svart på vitt. Men den säger inget om
kvaliteten: tillväxt kan köpas (förvärv), lånas (prissänkningar) eller
bokföras (engångsintäkter). Därför läser metoden V01 alltid tillsammans
med marginalerna (V07/V08) och diversifieringen (V03) — en enskild siffra
fäller aldrig domen.

### b) Var i årsredovisningen du hittar den

Öppna **koncernens** resultaträkning — alltså inte moderbolagets, utan den
i publikationen "Årsredovisning" som börjar med förvaltningsberättelsen.
Första raden under rubriken heter **"Nettoomsättning"** och visar två
kolumner: året och föregående år. Gå därefter till **noten till
intäkterna** (ofta not 1–3, "Nettoomsättning") där intäkterna delas upp på
land och ibland produktgrupp. Läs sist **förvaltningsberättelsens** avsnitt
om väsentliga händelser — där framgår om tillväxten var ett förvärv. För
5-årskurvan använder du de fem senaste rapporternas intäktsrader eller
nyckeltalssidan sist i redovisningen.

### c) Så beräknas den — steg för steg

1. Läs årets nettoomsättning (RÅ) och förra årets (RF) ur
   resultaträkningen.
2. Räkna ut förändringen: RÅ − RF.
3. Dividera med förra årets belopp — med absolutbeloppet |RF|, så att
   formeln fungerar även om förra året var negativt: (RÅ − RF) ÷ |RF|.
4. Multiplicera med 100 för procent. Dokumentera alltid vilket fönster du
   mätt: räkenskapsåret eller de senaste tolv månaderna (rullande år) —
   svaret kan skilja sig när tillväxten svänger under året.

### d) Räkneexempel: NorrTeknik AB

Ur resultaträkningen: nettoomsättning 2025 = 1 200, 2024 = 1 050.

- Förändring: 1 200 − 1 050 = +150 Mkr.
- Tillväxt: 150 ÷ 1 050 = 0,143 → **+14,3 %**.
- I modellens trappa (10–20 % ⇒ 3 poäng) ger det **3 poäng** — sund,
  medelgod tillväxt. Kurvan är medvetet en guldkant: under 0 % ger den
  knapert med poäng, över 45 % rabatteras poängen (hållbarhetsrabatt) och
  30–45 % ger toppoäng endast om bruttomarginalen samtidigt är minst
  30 % — tillväxten ska vara av det slag som en lönsam affär bär.

### e) Fallgropar — när talet snedvrids

- **Förvärvstillväxt är inte organisk tillväxt.** Ett bolag som köper sig
  till 20 % tillväxt har inte blivit bättre på sin affär — förvärvsavsnittet
  i förvaltningsberättelsen avslöjar det. Fråga alltid: hur mycket växte
  delarna som fanns förra året också?
- **Pris eller volym?** +10 % kan vara tio procent fler sålda enheter
  (efterfrågan) eller tio procent högre priser (inflation eller prismakt)
  — samma siffra, mycket olika hållbarhet. Noter om volymutveckling och
  "pris/mix" skiljer dem åt.
- **Valuta.** Exportintäkter i euro eller dollar svänger med kurserna; en
  svensk exportörs "tillväxt" kan delvis vara en svagare krona.
- **Cykeltoppar.** Högt växande försäljning i en konjunkturtopp är som
  sämst ett tecken på att nästa rörelse kan gå nedåt — återigen: en
  variabel räcker inte.
- **Engångsintäkter** (sålda tillgångar, engångsprojekt) kan svälla
  intäktsraden en enda gång — noten "övriga intäkter" är stället att
  kontrollera.

### f) Övningsfrågor med facit

1. **Räkna:** Vad blev NorrTekniks försäljningstillväxt 2025, och vilken
   poäng ger modellens trappa?
   *Facit:* (1 200 − 1 050) ÷ 1 050 = +14,3 % ⇒ 3 poäng (intervallet
   10–20 %).
2. **Räkna vidare:** Om 2026 års nettoomsättning landar på 1 350 Mkr, vad
   blir tillväxten — och poängen?
   *Facit:* (1 350 − 1 200) ÷ 1 200 = +12,5 % ⇒ fortfarande 3 poäng.
3. **Tänk:** NorrTeknik köper i januari 2026 konkurrenten SöderVerk med
   90 Mkr i årsomsättning. Totalkoncernen landar på 1 350. Vad är den
   organiska tillväxten och varför skiljer den sig?
   *Facit:* Organiskt ≈ 1 350 − 90 = 1 260 ⇒ (1 260 − 1 200) ÷ 1 200 =
   +5 % — hälften så hög som siffran. Den återstående tillväxten är köpt,
   inte skapad; förvärvet kan ändå vara bra, men det är en annan fråga än
   om affären växer.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V02 — ARR-tillväxt (Tillväxt)

### a) Vad indikatorn mäter — och varför den spelar roll

ARR (Annual Recurring Revenue) är den årliga intäkt som är **kontrakterad
att återkomma** — prenumerationer, licenser med löptid, plattformsavgifter,
tecknade serviceavtal. En kunds månadsprenumeration på 1 000 kr är 12 000
kr i ARR; ett engångsförsålt projekt på 50 000 kr är noll ARR. Varför bryr
sig metoden? Eftersom återkommande intäkter är mer förutsägbara än
engångsintäkter: ett bolag vars avtal förnyats år efter år kan planeras
och värderas på ett annat sätt än ett som måste vinna varje krona på nytt
varje kvartal. ARR-tillväxt mäter alltså inte bara hur mycket som växer,
utan **vilken sorts** tillväxt det är. Viktig ärlighetspunkt: bara
prenumerationsliknande bolag redovisar ARR — saknas det i redovisningen
poängsätts V02 försiktigt och V01 får bära tillväxtbilden. Att veta vilka
bolag som ens kan poängsättas på V02 är i sig en läsdom.

### b) Var i årsredovisningen du hittar den

1. **Förvaltningsberättelsen** — sök efter "ARR", "återkommande intäkter",
   "recurring revenue", "prenumerationsintäkter", "tecknade avtal".
2. **Nyckeltalsavsnittet** sist i årsredovisningen (eller i
   presentationsmaterialet): bolag som redovisar ARR avstämmer det mot
   nettoomsättningen — där ser du hur stor andel av omsättningen som är
   återkommande.
3. **Intäktsnoten** — vissa bolag delar "subscription" mot "professional
   services" redan där; det är ARR:s syskonuppgift.

### c) Så beräknas den — steg för steg

1. Hitta årets ARR och förra årets ARR i källan (samma definition båda
   åren — se fällorna).
2. ARR-tillväxt = (ARR i år − ARR förra året) ÷ ARR förra året × 100 %.
3. Räkna gärna också ARR-andelen: ARR ÷ nettoomsättning — hur stor del av
   affären som har prenumerationsstruktur.
4. Notera "net new ARR" (förändringen i kronor) om bolaget redovisar det:
   skillnaden mellan tillkommande och avgångna avtal.

### d) Räkneexempel: NorrTeknik AB

Förvaltningsberättelsen: "Tecknade serviceavtal med löptid minst 12
månader uppgick per balansdagen till ARR 320 (föregående år: 265)."

- ARR-tillväxt: (320 − 265) ÷ 265 = 55 ÷ 265 = 0,208 → **+20,8 %**.
- ARR-andel av omsättningen: 320 ÷ 1 200 = **26,7 %** — ungefär var fjärde
  intäktskrona är kontrakterad att återkomma.
- I utbildningens riktlinjetabell (15–30 % tillväxt med tydlig andel ⇒ 4
  poäng) landar NorrTeknik på **4 poäng** — serviceaffären växer snabbare
  än maskinförsäljningen (+20,8 % mot +14,3 %), vilket är ett mönster
  värdefritt att lägga på minnet: den återkommande andelen växer sig
  större i bolaget.

### e) Fallgropar — när talet snedvrids

- **Att annualisera fel.** ARR är redan årsvis — multiplicera aldrig en
  månatlig siffra med 12 om den redan är annualiserad, och tvärtom.
- **Upprepad är inte kontrakterad.** Konsultintäkter som upprepas varje
  år är inte ARR: förnyelsebenägenhet är inte avtal. Gränsen går vid
  bindningstid/uppehälle, inte vid vana.
- **Förvärvad ARR.** ARR som växer genom uppköp är inte samma kvalitet som
  ARR som växer i befintliga kunder. Kvalitetsmåttet hos de bästa
  rapportörerna heter net revenue retention — expansion i befintliga
  kunder.
- **Valutajusterade serier.** Många bolag redovisar ARR "constant
  currency" — jämför alltid samma definition år mot år.
- **Backlog är inte ARR.** Tecknade avtal som inte gått live än är
  framtida ARR, inte nuvarande — blanda inte terminologierna.
- **Användningsbaserade intäkter** kan se återkommande ut men svänger med
  kundernas egen volym — "recurring" i namnet, cykliskt i verkligheten.

### f) Övningsfrågor med facit

1. **Räkna:** Hur stor var NorrTekniks ARR-tillväxt 2025?
   *Facit:* (320 − 265) ÷ 265 = +20,8 %.
2. **Räkna vidare:** Hur stor andel av nettoomsättningen utgjorde ARR?
   *Facit:* 320 ÷ 1 200 = 26,7 %.
3. **Tänk:** Servicechefen säger: "Våra kunder kommer tillbaka varje år —
   i praktiken är hela serviceaffären recurring." Varför är det ändå inte
   ARR enligt definitionen?
   *Facit:* ARR kräver kontrakterad återkomst (löptid, uppsägningsskydd,
   bindning). "Kommer tillbaka" är beteende, inte avtal — om kunden kan
   försvinna utan att bryta något avtal är intäkten inte återkommande i
   ARR-mening, hur lojal den än är. Noten/definitionen avgör, inte
   berättelsen.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V03 — Intäktsdiversifiering (Tillväxt)

### a) Vad indikatorn mäter — och varför den spelar roll

Intäktsdiversifiering svarar på frågan: **om en kund, en produkt eller en
marknad försvinner — hur stor del av intäkterna står kvar?** Ett bolag med
tusen kunder i tio branscher på fyra kontinenter har en helt annan
motståndskraft än ett bolag vars tre största kunder bär halva omsättningen.
Diversifiering är tillväxtkategorins försäkring: breda intäkter gör
tillväxten (V01) hållbarare och de återkommande strukturerna (V02)
pålitligare. Koncentration är inte alltid fel — ett nischbolag kan vara
utmärkt — men risken är en annan, och metoden ska se skillnaden. Tänk på
tre axlar: **kunder, produkter, geografier**. En axel kan vara koncentrerad
utan att bolaget är det, om de andra bär.

### b) Var i årsredovisningen du hittar den

1. **Segmentnoten** (not med "Segment" i titeln): intäkter per
   verksamhetsgren — börja där.
2. **Geografinoten** (ofta intill): intäkter per land/region.
3. **Storkundsuppgiften**: vissa bolag redovisar "största kunds andel av
   intäkterna" eller de fem största — V03:s viktigaste rad där den finns.
4. **Produktgruppsuppdelningen** i intäktsnoten eller
   förvaltningsberättelsens avsnitt per affärsområde.

### c) Så bedöms den — steg för steg

Indikatorn är till sin natur kvalitativ — du väger tre axlar mot varandra:

1. Räkna varje segments andel av nettoomsättningen (segment ÷ summa).
2. Räkna hemmamarknadens andel ur geografinoten.
3. Leta storkundsuppgiften — största kunds andel, eller notisen om att
   ingen överstiger tröskeln.
4. Bedöm axlarna var för sig, sedan tillsammans: bred på minst två axlar
   utan dominans är den starka bilden; koncentration på en axel syns som
   en enda kund/produkt/marknad som bär en dominerande andel.

### d) Räkneexempel: NorrTeknik AB

- **Produktaxeln:** Maskiner 610 ÷ 1 200 = **50,8 %** · Service 340 ÷
  1 200 = 28,3 % · Reservdelar 250 ÷ 1 200 = 20,8 %. Största segment bär
  hälften — måttlig produktkoncentration.
- **Geografiaxeln:** Sverige 40 %, övriga Norden 20 %, övriga Europa 25 %,
  Asien 10 %, Amerika 5 % — ingen enskild marknad dominerar; två tredjedelar
  av intäkterna kommer från tre regioner.
- **Kundaxeln:** "Ingen kund överstiger 10 %"; största kunden 8 % — bred.
- **Sammanvägt:** bred på kund- och geografiaxlarna, måttligt koncentrerad
  på produktaxeln ⇒ enligt riktlinjetabellen ("bred på en axel, måttlig på
  en till" ⇒ 4) landar NorrTeknik på **4 poäng**. Men observera fallgropen
  nedan: alla tre affärsområden säljer till samma slutmarknad.

### e) Fallgropar — när talet snedvrids

- **Korrelerade segment.** Maskiner, reservdelar och service låter trevägt
  — men alla tre lever till skogsindustrin. Då sjunker efterfrågan i
  skogen synkar alla tre "diversifierade" intäktsströmmarna. Fråga alltid:
  vem betalar i slutändan, i varje segment? NorrTekniks bredd är delvis
  ske­nbar — det är ett kundmonokulturens bolag med tre produktrör in i
  samma kundbas.
- **Tröskeldämpad storkundsnot.** "Ingen kund överstiger 10 %" betyder
  inte "fin fördelning" — bara att koncentrationen ligger under
  redovisningströskeln. Åtta procent kan fortfarande vara en relation värd
  att känna till. Läs vad noten INTE säger.
- **Diversifiering genom uppköp.** Åtta produktlinjer från åtta förvärv kan
  vara åtta integrationsrisker snarare än balans — förvärvshistoriken i
  förvaltningsberättelsen avgör.
- **Geografi efter faktureringsland.** Intäkter bokförda i lågskatteländer
  kan visa en geografisk fördelning som speglar skattevägar, inte kunder —
  notens fotnot om hur geografi mäts är avgörande.
- **Koncentration kan vara strategi.** Få, djupa partnerskap med stark
  kontraktsbindning är en medveten affärsmodell — indikatorn mäter
  riskform, inte kvalitet, och ska tolkas tillsammans med avtalstyper och
  kassaflöde.

### f) Övningsfrågor med facit

1. **Räkna:** Hur stor andel av intäkterna bär största affärsområdet?
   *Facit:* 610 ÷ 1 200 = 50,8 %.
2. **Tänk:** Sverige står för 40 %. Är NorrTeknik geografiskt diversifierat?
   *Facit:* Delvis. Ingen enskild marknad dominerar majoriteten och 60 %
   kommer utomlands — men 65 % av intäkterna ligger i Norden, så en
   nordisk nedgång skulle träffa hårt. "Bredd" är gradskala, inte ja/nej.
3. **Tänk:** En konkurrent saknar helt storkundsuppgift i sin
   årsredovisning. Vad kan det betyda — och vad gör du?
   *Facit:* Antingen att koncentrationen ligger under tröskeln (bolag
   behöver ofta bara redovisa över 10 %) eller att redovisningen är
   tunn. Du letar i noterna/geografin/segmenten efter indirekt bevis och
   dokumenterar osäkerheten i stället för att gissa — spårbarhet slår
   antagande.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V04 — P/S, pris/omsättning (Värdering)

### a) Vad indikatorn mäter — och varför den spelar roll

P/S svarar på: **hur många kronor betalar marknaden per krona intäkt?**
Det är börsvärdet dividerat med nettoomsättningen (senaste tolv månadera,
eller senaste räkenskapsåret — dokumentera vilket). P/S är
värderingsfamiljens robustaste mått när vinsten sviker: bolag i vändning
eller kris kan ha negativ eller meningslös P/E, men alltid en P/S. Samtidigt
har måttet en inbyggd fälla som gör utbildningen nödvändig: **en
intäktskrona är inte värd lika mycket överallt.** Hos ett mjukvarubolag kan
80–90 öre av kronan bli bruttovinst; hos en distributör 5–15 öre. Samma
P/S är alltså radikalt olika "dyr" beroende på marginalstrukturen — därför
läses V04 alltid tillsammans med V07/V08.

### b) Var i årsredovisningen du hittar den

P/S är ett **blandtal**: en del kommer från börsen, en del från
redovisningen.

1. **Börsvärde** = aktiekurs × antal aktier. Antalet aktier står i noten
   om eget kapital (sista sidan av redovisningen); kursen utanför rapporten
   — använd samma datum för hela beräkningen.
2. **Nettoomsättning** = koncernresultaträkningens första rad, senaste
   tolv månader om kvartalsdata finns, annars senaste räkenskapsåret.
3. Dividera — och jämför sedan inom bransch: en P/S utan branschreferens
   jämförs mot ingenting.

### c) Så beräknas den — steg för steg

1. Läs antal aktier ur aktieägar-/ekvitetsnoten.
2. Multiplicera med dagens (eller balansdagens) aktiekurs → börsvärde.
3. Läs nettoomsättningen (TTM om möjligt, annars räkenskapsåret — skriv
   vilket).
4. P/S = börsvärde ÷ nettoomsättning.
5. Ställ talet mot bolagets marginaler (V07/V08) och tillväxt (V01) innan
   du tolkar det som högt eller lågt.

### d) Räkneexempel: NorrTeknik AB

- Aktier: 40,0 miljoner × kurs 45 kr = **börsvärde 1 800 Mkr**.
- Nettoomsättning 2025: 1 200 Mkr.
- P/S = 1 800 ÷ 1 200 = **1,50**.
- Modellens trappa (< 1 ⇒ 5 · < 2 ⇒ 4 · < 3 ⇒ 3 · < 5 ⇒ 2 · ≥ 5 ⇒ 1)
  ger **4 poäng**. Men läs det som metoden gör: NorrTekniks
  bruttomarginal är 40 % och EBIT-marginalen 12,5 % — en intäktskrona som
  faktiskt bär vinst. En distributör med P/S 1,5 och bruttomarginal 12 %
  är inte samma historia, trots identisk multipel. Multipeln speglar
  marginalstrukturen; poängen tolkas i samspelet.

### e) Fallgropar — när talet snedvrids

- **Låg P/S på lågmarginalverksamhet är sällan en fyndkarta.** Handels-
  och distributionsbolag handlas strukturellt kring 0,1–0,5 — inte för att
  de är glömda, utan för att intäktskronan bär så lite vinst.
- **Cykeltoppens spegel.** Vid en konjunkturtopp är intäkterna
  rekordhöga och P/S ser låg ut precis när marginalerna står inför fall —
  nämnaren är på sitt högsta just när den är som mest hotad.
- **Förvärvsuppblåst nämnare.** Uppköpt omsättning gör nämnaren större
  utan att aktien blev billigare per organisk krona — kontrollera organisk
  tillväxt i förvaltningsberättelsen.
- **Engångsintäkter i nämnaren.** Sålda tillgångar och engångsprojekt
  sväller intäktsraden en enda gång — normalisera före jämförelse.
- **P/S ser inte skulderna.** Två bolag med P/S 2 där det ena är
  nettokassa och det andra högt belånat är inte samma affär — det är
  EV-måttens uppgift (V06).

### f) Övningsfrågor med facit

1. **Räkna:** Vad är NorrTekniks P/S och vilken poäng ger trappan?
   *Facit:* (40,0 M × 45) ÷ 1 200 = 1 800 ÷ 1 200 = 1,50 ⇒ 4 poäng.
2. **Räkna vidare:** Aktiekursen stiger till 70 kr. Ny P/S och ny poäng?
   *Facit:* 40,0 M × 70 = 2 800 ÷ 1 200 = 2,33 ⇒ 3 poäng. Aktien blev
   50 % dyrare på papperet — multipeln flyttade ett trappsteg; inget i
   affären förändrades.
3. **Tänk:** Två bolag, båda P/S 1,5. Ett har bruttomarginal 40 %, det
   andra 12 %. Vad måste du fråga innan du ens tänker ordet "värdering"?
   *Facit:* Vilken bransch och vilken marginalstruktur — vad blir kvar av
   intäktskronan? Utan den frågan är samma tal två olika sakernas
   etiketter; med den börjar jämförelsen bli meningsfull. Metoden parar
   därför alltid V04 med V07/V08.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V05 — P/B, pris/eget kapital (Värdering)

### a) Vad indikatorn mäter — och varför den spelar roll

P/B svarar på: **vad betalar marknaden per krona av bokfört eget
kapital?** Börsvärde ÷ eget kapital. Det egna kapitalet är det som aktieägarna
har kvar av allt bolaget äger minus allt det är skyldigt — bokföringens
"återstående värde". P/B är värderingens äldsta mått och fungerar bäst där
balansräkningen speglar affären: banker, försäkringsbolag, kapitaltunga
industrier, fastigheter. För kunskapsbolag är det svagare — det viktigaste
(varumärke, kod, kunnande) står inte i balansräkningen. Därför varningen
redan på kursnivå: **P/B kräver att du förstår VAD det egna kapitalet
består av.** En hög P/B på ett bolag vars kapital krympts av återköp är
inte samma sak som en dyr aktie; en låg på ett kapital svällt av oprövad
goodwill är inte samma sak som en billig.

### b) Var i årsredovisningen du hittar den

1. **Balansräkningens** post "Summa eget kapital" — koncernens, med
   minoritetsintressen om de redovisas, inte moderbolagets.
2. **Noten/förändringsanalysen till eget kapital**: årets rörelser —
   vinst, utdelning, emission, återköp, omvärderingar. Här ser du om
   kapitalet växer organiskt eller styrs ned av återköp.
3. **Noten om immateriella tillgångar**: hur stor del av balansräkningen
   — och därmed indirekt av eget kapital — är goodwill.
4. **Börsvärde** som i V04: kurs × antal aktier, samma datum.

### c) Så beräknas den — steg för steg

1. Läs "Summa eget kapital" i koncernbalansräkningen.
2. Räkna ut börsvärdet (aktier × kurs).
3. P/B = börsvärde ÷ eget kapital.
4. Kontrollera goodwill-andelen (goodwill ÷ eget kapital) och
   förändringsanalysen — två poster som avgör hur talet ska tolkas.
5. Jämför inom bransch: teknik mot teknik, banker mot banker — aldrig
   blandat.

### d) Räkneexempel: NorrTeknik AB

- Börsvärde 1 800 Mkr; eget kapital 340 Mkr.
- P/B = 1 800 ÷ 340 = **5,29**.
- Trappan (< 1 ⇒ 5 · < 2 ⇒ 4 · < 3 ⇒ 3 · < 5 ⇒ 2 · ≥ 5 ⇒ 1) ger
  **1 poäng** — marknaden betalar över fem kronor per bokförd krona.
- Före tolkningen: goodwill 90 ÷ 340 = **26,5 %** av det egna kapitalet.
  Resten är "reella" postigngar — maskiner, lager, fordningar, kassa i
  bokförda värden. P/B 5,29 för ett industriföretag med ROE 34,9 %
  (se V09) säger att marknaden prisar avkastningen, inte substansen —
  metoden löser det genom att alltid para V05 med V09: P/B ska förstås
  mot vad kapitalet avkastar, aldrig ensam.

### e) Fallgropar — när talet snedvrids

- **Återköpsfällan.** Bolag som köper tillbaka egna aktier krymper det
  egna kapitalet — P/B (och ROE) stiger mekaniskt utan att affären
  förändrats en millimeter. Hög P/B på en återköpsmaskin är inte
  automatiskt dyr; låg är inte automatiskt billig.
- **Goodwillfällan.** Eget kapital svällt av köpeskillingar som aldrig
  testats mot verkligheten gör P/B "rimlig" medan reella värden kan vara
  lägre — kontrollera goodwill-andelen och nedskrivningshistoriken.
- **Negativt eget kapital.** Tunga återköp och utdelningar kan driva EK
  under noll — då är P/B oläsligt (negativt), inte "gratis": måttet är
  bara inte applicerbart, och man byter till P/E eller EV-mått.
- **Banker är specialfallet.** För banker är P/B huvudmåttet —
  balansräkningen Är affären — men det tolkas mot substansvärde och
  bankens egna ROE-mål.
- **Omvärderingsreserver** (fastigheter, finansiella tillgångar) gör EK
  känsligt för värderingsantaganden — notens fotnoter bär sanningen.

### f) Övningsfrågor med facit

1. **Räkna:** NorrTekniks P/B och poäng?
   *Facit:* 1 800 ÷ 340 = 5,29 ⇒ 1 poäng (≥ 5).
2. **Räkna vidare:** Hur stor andel av det egna kapitalet utgörs av
   goodwill — och varför spelar det roll?
   *Facit:* 90 ÷ 340 = 26,5 %. Goodwill är ett antagande om framtida
   vinster från förvärv, inte en tillgång att sälja; ju större andel,
   desto mer av "substansen" är ett tankeexperiment som kan komma att
   skrivas ned.
3. **Tänk:** Bolaget köper tillbaka aktier för 100 Mkr; börsvärdet är
   oförändrat 1 800 och nytt EK blir 240. Ny P/B? Vad har hänt med
   affären?
   *Facit:* 1 800 ÷ 240 = 7,5. Ingenting har hänt med affären — nämnaren
   krympte av återköpet. Multipeln steg mekaniskt; det är därför noten om
   förändringar i eget kapital är obligatorisk läsning före tolkning.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V06 — EV/EBITDA (Värdering)

### a) Vad indikatorn mäter — och varför den spelar roll

EV/EBITDA svarar på: **vad kostar hela företaget — inte bara aktierna —
i förhållande till den kassa verksamheten genererar före avskrivningar,
ränta och skatt?** Byggstenarna: **EV (Enterprise Value) = börsvärde +
räntebärande skulder − kassa** — tänk att du köper hela bolaget: du
betalar för alla aktier och tar över alla lån, men kassan i kassaskåpet
får du behålla. EV är priset för hela maskinen; aktiekursen är bara
priset för ratten. **EBITDA = rörelseresultat + avskrivningar** — kassan
verksamheten alstrar före bokföringsmässiga kostnader. Multipeln säger
"maskinen kostar X års driftkassa". Varför inte bara P/E? P/E straffar
belånade bolag (räntan äter resultatet) och belönar skuldfria — EV/EBITDA
jämför själva affären på lika villkor, oavsett finansiering, skatt och
maskinparkens ålder. Därför pratar köpare av hela bolag — och deras
banker — i EV/EBITDA.

### b) Var i årsredovisningen du hittar den

1. **Börsvärde**: antal aktier (noten om eget kapital) × aktiekurs.
2. **Räntebärande skulder**: balansräkningen — långfristiga
   lånekostnadsförande skulder plus kortfristiga till banker. Obs:
   leverantörsskulder räknas inte — de är verksamhet, inte finansiering.
3. **Kassa**: "Kassa och bank" plus kortfristiga placeringar bland
   omsättningstillgångarna.
4. **Rörelseresultat**: resultaträkningens rad före finansiella poster.
5. **Avskrivningar**: kassaflödesanalysens avskrivningsrader (summera
   flera om de är delade) — noten till rörelsekostnaderna är en bra
   korskälla.

### c) Så beräknas den — steg för steg

1. Börsvärde = aktier × kurs.
2. Räntebärande nettoskuld = räntebärande skulder − kassa och
   kortfristiga placeringar.
3. EV = börsvärde + räntebärande nettoskuld.
4. EBITDA = rörelseresultat + avskrivningar (ur kassaflödesanalysen).
5. EV/EBITDA = EV ÷ EBITDA. Kontrollera summan mot bolagets egen
   presentation av "netto skuldsättning" när den finns.

### d) Räkneexempel: NorrTeknik AB

- Börsvärde: 1 800.
- Räntebärande skulder: långfristiga 180 + kortfristiga 20 = 200.
- Kassa: kassa och bank 60 + kortfristiga placeringar 20 = 80.
- **EV = 1 800 + 200 − 80 = 1 920 Mkr.**
- EBITDA = rörelseresultat 150 + avskrivningar 55 = **205 Mkr**.
- **EV/EBITDA = 1 920 ÷ 205 = 9,4×** — hela maskinen kostar knappt tio
  års driftkassa.
- Modellens kurva (6–10× ⇒ 4 poäng) ger **4 poäng**. Notera kurvans
  viktigaste lekion: under 4× ges 5 poäng ENDAST om kassatäckningen (V19)
  är minst 3 — ett bolag som ser billigt ut kan vara billigt av ett skäl
  (skrumpande affär, föråldrad maskinpark). Billighet utan kvalitet är
  en fälla, och modellen bygger in den kontrollen.

### e) Fallgropar — när talet snedvrids

- **EBITDA är inte kassaflöde.** Den ignorerar att maskiner slits och
  måste ersättas. Kapitalintensiva bolag (stål, sjöfart, gruvor) ser
  billiga ut i EV/EBITDA just för att den verkliga kostnaden —
  ersättningsinvesteringarna — är borträknad. Jämför alltid med
  kapitalbehovet.
- **Negativ EBITDA gör multipeln meningslös** (modellen ger 0 poäng) —
  en förlustverksamhet kan inte prissättas i "års kassa".
- **Skulddefinitionen.** Kontrollera vad som räknas som räntebärande:
  IFRS 16 flyttade leasingåtaganden in i skulderna och kan förstöra
  jämförbarheten mellan år och bolag om du inte är konsekvent.
- **Kassans tecken.** Multipeln är känslig — ett tecken fel i kassa eller
  skuld flyttar hela värdet. Verifiera komponenterna mot bolagets egen
  netto skuldsättnings-redovisning.
- **Datäheder.** Modellens kärna lämnar V06 osatt när datakontraktet
  saknar EBITDA-fält — hellre en tom rad med förklaring än EBIT på
  EBITDA-trösklar, vilket skulle systematiskt missgynna kapitalintensiva
  bolag. En designläsdom värd lika mycket som själva multipeln.

### f) Övningsfrågor med facit

1. **Räkna:** Vad är NorrTekniks EV?
   *Facit:* 1 800 + (180 + 20) − (60 + 20) = 1 800 + 200 − 80 =
   1 920 Mkr.
2. **Räkna vidare:** EV/EBITDA och poäng?
   *Facit:* (150 + 55) = 205; 1 920 ÷ 205 = 9,4× ⇒ 4 poäng (6–10×).
3. **Tänk:** NorrTeknik omlägger finansieringen: de räntebärande skulderna
   blir 280 och kassan 0 (betalning av overdraft och utdelning), affären
   oförändrad. Ny multipel — och vad lär det?
   *Facit:* EV = 1 800 + 280 − 0 = 2 080; 2 080 ÷ 205 = 10,1× ⇒ 3
   poäng. Affären är identisk, men köpare av hela bolaget betalar mer
   because skulderna är större — aktiekursens P/E hade inte visat
   skillnaden fullt ut. Det är EV-måttets hela poäng: kapitalstrukturen
   syns i priset på maskinen.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V07 — Bruttomarginal (Lönsamhet)

### a) Vad indikatorn mäter — och varför den spelar roll

Bruttomarginalen är **det som blir kvar av varje hundralapp i försäljning
när varan eller tjänsten är levererad** — före personal, marknadsföring,
kontor och finansiella poster. Formellt: bruttoresultatet (nettoomsättning
minus kostnad sålda varor och tjänster) dividerat med nettoomsättningen.
Varför väger metoden extra tungt här? Därför att marginalen är **prisets
och varans makt i en enda siffra**: hög bruttomarginal betyder att kunden
betalar mycket mer än varan kostar att producera — varumärke, teknik eller
byteskostnad ger prutmån; låg betyder att produkten är en råvara i
kundens ögon och konkurrensen sker på pris. Marginalen är starten på all
lönsamhet: en hög bruttomarginal kan förvaltas bort av en dålig
organisation, men en låg kan aldrig förvaltas fram till en hög netto.
Taket sätts i resultaträkningens tredje rad.

### b) Var i årsredovisningen du hittar den

1. I **koncernens resultaträkning**: posterna "Nettoomsättning" och
   "Kostnad sålda varor och tjänster" (KSVT) — eller "Rörelsens kostnader"
   där personalkostnaderna redovisas separat i not.
2. **Noten till rörelsekostnaderna** delar upp kostnaderna på material,
   personal och övrigt — använd den för att se vad som verkligen är
   varukostnad när huvudtabellen är aggregerad.
3. Varning för **banker, förvaltnings- och fastighetsbolag**: deras
   resultaträkningar har ingen KSVT-struktur alls — bruttomarginal är ett
   okänt begrepp där, och siffran "0 %" i databaser betyder saknad data,
   inte dålig affär.
4. För trenden: nyckeltalssidan (fem år) eller fem årsredovisningar.

### c) Så beräknas den — steg för steg

1. Läs nettoomsättningen och KSVT ur resultaträkningen (samma period!).
2. Bruttoresultat = nettoomsättning − KSVT.
3. Bruttomarginal = bruttoresultat ÷ nettoomsättning × 100 %.
4. Kontrollera i noten hur personalkostnader klassificerats — en post som
   flyttat mellan KSVT och övriga rörelsekostnader flyttar marginalen.
5. Jämför mot bolagets egen historia och branschens struktur — aldrig
   mellan olikt strukturerade branscher som vore det en ranking.

### d) Räkneexempel: NorrTeknik AB

- 2025: nettoomsättning 1 200, KSVT −720 → bruttoresultat 480.
- Bruttomarginal = 480 ÷ 1 200 = **40,0 %** — av varje hundralapp i
  försäljning blir 40 kronor kvar när varan är levererad.
- 2024: 402 ÷ 1 050 = **38,3 %** → marginalen förbättrades med 1,7
  procentenheter.
- Modellens kurva (35–50 % ⇒ 3 poäng) ger **3 poäng**. Det är en solid
  premiumindustriell nivå: ingen mjukvarumarginal, men tydlig prutmån —
  och notera att förbättringen kom samtidigt som serviceandelen växte
  (V02): mjukare intäkter, hårdare marginal. Så kopplar metoden
  indikatorerna till en berättelse.

### e) Fallgropar — när talet snedvrids

- **Jämför aldrig bruttomarginal mellan branscher som vore det en
  ranking.** En handelskedja på 25 % kan vara magnifik och ett
  mjukvarubolag på 85 % medioker — marginalens mening avgörs av
  branschens struktur.
- **Banker och förvaltningsbolag:** deras "0 %" är saknad data, inte
  dålig affär. Lär dig se resultaträkningens struktur FÖRE siffran.
- **Ett år bevisar ingenting.** Kurvans topp (över 70 % ⇒ 5 poäng) kräver
  att även femårssnittet håller — en ensam lyckoåring räcker inte för
  toppoäng.
- **Klassificeringsval.** Var personalkostnader och "övriga rörelsekostnader"
  sitter kan flytta marginalen flera enheter mellan bolag — noterna är din
  vän.
- **Mix-effekter.** En lågmarginalvolym vid sidan av högmarginalkärnan kan
  dölja att kärnan krymper — leta segmentuppdelningen. (Vad är NorrTekniks
  maskin- mot servicemarginal? Segmentnoten med resultat per segment
  svarar — när den finns.)

### f) Övningsfrågor med facit

1. **Räkna:** NorrTekniks bruttomarginal 2025 och poäng?
   *Facit:* (1 200 − 720) ÷ 1 200 = 40,0 % ⇒ 3 poäng (35–50 %).
2. **Räkna vidare:** Hur mycket ändrades marginalen från 2024, i
   procentenheter?
   *Facit:* 40,0 % − 38,3 % = +1,7 enheter — driven av prissättning eller
   mix; nästa steg är noterna för att se vilken.
3. **Tänk:** 2026 stiger KSVT med 30 Mkr vid oförändrad omsättning. Ny
   marginal, ny poäng — och vad är lärdomen om trappor mot trender?
   *Facit:* (1 200 − 750) ÷ 1 200 = 37,5 % ⇒ fortfarande 3 poäng. Poängen
   rörde sig inte — men trenden vände. En trappa säger "vilket hyllplan",
   trenden säger "vilken riktning"; metoden läser båda, och det ska du
   också göra.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V08 — EBITDA-marginal (Lönsamhet)

### a) Vad indikatorn mäter — och varför den spelar roll

EBITDA-marginalen mäter **hur stor del av varje hundralapp i försäljning
som blir rörelsekassa** — rörelseresultatet plus avskrivningar, delat med
nettoomsättningen. Den svarar på: hur bra är affären på att omvandla
intäkter till driftöverskott, när vi stänger ögonen för finansiering
(ränta), skatt och bokföringsmässigt slitage (avskrivningar)? Tre
användningar: att jämföra driftens lönsamhet mellan bolag med olika
kapitalstruktur (samma neutralitet som EV/EBITDA, men från resultatsidan);
att se organisationskostnadens vikt — gapet mellan V07 och V08 är i
princip personal, marknad, lokal och övrig drift som andel av omsättningen;
och som bro mot kassaflödet — EBITDA närmar sig verklig kassa före
arbetande kapital och investeringar, men kommer aldrig hela vägen (se
fällorna).

### b) Var i årsredovisningen du hittar den

1. **Rörelseresultatet (EBIT)**: resultaträkningens rad efter
   rörelsekostnaderna, före finansiella poster.
2. **Avskrivningarna**: kassaflödesanalysens poster "Avskrivningar/
   nedskrivningar" — summera flera rader om de är delade.
3. Korskälla: **noten till rörelsekostnaderna** redovisar ofta
   avskivningarna också (personal/avskrivning/övrigt).
4. **IFRS 16-läsning**: leasingavskrivningar och leasingräntor ligger i
   olika rader efter 2019 — bestäm en princip och håll den konsekvent
   mellan de bolag du jämför.

### c) Så beräknas den — steg för steg

1. Läs rörelseresultatet ur resultaträkningen.
2. Läs årets avskrivningar ur kassaflödesanalysen.
3. EBITDA = rörelseresultat + avskrivningar.
4. EBITDA-marginal = EBITDA ÷ nettoomsättning × 100 %.
5. Räkna ut gapet mot bruttomarginalen (V07 − V08) — organisations-
   kostnadens andel — och mot EBIT-marginalen för att se avskrivningens
   vikt.

### d) Räkneexempel: NorrTeknik AB

- Rörelseresultat 150 + avskrivningar 55 = **EBITDA 205 Mkr**.
- EBITDA-marginal = 205 ÷ 1 200 = **17,1 %**.
- Modellens trappsteg (≥ 25 % ⇒ 5 · ≥ 15 % ⇒ 4 · ≥ 10 % ⇒ 3 · ≥ 5 % ⇒ 2)
   ger **4 poäng**.
- Gapet: bruttomarginal 40,0 % − EBITDA-marginal 17,1 % = **22,9
  procentenheter** — organisationen (personal, försäljning, lokal, övrig
  drift) äter knappt 23 kronor av hundralappen. För ett industriföretag
  med egen serviceorganisation är det en normal vikt; för ett bolag med
  80 % brutto och 20 % EBITDA skulle samma gap vara en fråga om vad
  organisationen egentligen gör. Gapet är berättelsen.

### e) Fallgropar — när talet snedvrids

- **"Före slitage" är inte samma som "utan slitage".** Kapitalintensiva
  bolag ser extra lönsamma ut i EBITDA just för att
  ersättningsinvesteringarna är osynliga. En hög EBITDA-marginal med ett
  evigt stort investeringsbehov är ingen sann lönsamhet — maskiner slits
  verkligt, även om avskrivningen är bokföring.
- **EBIT är inte EBITDA.** Att lägga EBIT-marginaler på EBITDA-trösklar
  underskattar systematiskt — därför lämnar modellens kärna indikatorn
  osatt tills datakontraktet har en riktig avskrivningspost, i stället
  för att låta en snedvriden siffra maschinera vidare. Dataheder igen.
- **IFRS 16 höjde marginalen gratis.** När leasing 2019 flyttades från
  kostnad till avskrivning+ränta steg EBITDA-marginaler mekaniskt utan
  att en enda affär förbättrats — jämför inte tvärs över övergången utan
  justering.
- **Banker och förvaltningsbolag** har ingen meningsfull EBITDA-marginal
  av samma strukturskäl som V07 — deras resultaträkningar är inte byggda
  så.
- **Jämförelsestörande poster.** Restruktureringskostnader och
  förvärvsvinster kan ligga kvar i EBIT — noten om jämförelsestörande
  poster är obligatorisk läsning.

### f) Övningsfrågor med facit

1. **Räkna:** NorrTekniks EBITDA-marginal och poäng?
   *Facit:* (150 + 55) ÷ 1 200 = 17,1 % ⇒ 4 poäng (≥ 15 %).
2. **Tänk:** Vad representerar skillnaden mellan bruttomarginalen och
   EBITDA-marginalen — och hur stor är den för NorrTeknik?
   *Facit:* Organisationens kostnad (personal, marknad, lokal, övrig
   drift exkl. varukostnad) som andel av omsättningen: 40,0 − 17,1 =
   22,9 procentenheter.
3. **Tänk:** NorrTeknik leasar sina servicebilar. Före IFRS 16 låg
   leasingavgiften i övriga rörelsekostnader; nu redovisas den som
   avskrivning och ränta. Vad händer med EBITDA-marginalen rent
   mekaniskt — och vad gör du åt det?
   *Facit:* Kostnaden adderas tillbaka via avskrivningsposten (räntedelen
   ligger under EBITDA) ⇒ marginalen stiger utan att affären förändrats.
   Du jämför antingen konsekvent på ena sidan av övergången eller justerar
   serien — aldrig blandat okommenterat.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V09 — ROE, avkastning på eget kapital (Lönsamhet)

### a) Vad indikatorn mäter — och varför den spelar roll

ROE (Return On Equity) mäter **hur mycket vinst bolaget skapar per krona
som ägarna har satt in**: årets resultat efter skatt dividerat med
snittet av det egna kapitalet (början och slut av året). Det är ägarens
egen ränta på pengarna — den avkastning som i slutänden betalar
utdelningar och kursutveckling. Men ROE har en inbyggd hävstångsmöjlighet
som gör den farlig att läsa ensam: samma affär kan visa 10 eller 25 procent
ROE beroende på hur mycket av den som finansierats med lån — vinsten
delas på ett mindre eget kapital. Därför kräver metoden en
hävstångskontroll (via V10, som beräknas före V09) och ett uthållighetsbevis
(femårssnitt) innan toppoäng: ROE ska komma från affären, inte från
banken. Och kurvans nollpunkt ligger vid kapitalkostnaden (omkring 9 % i
modellen): en ROE under vad kapitalet kostar är värdeförstöring — bolaget
hade lika gärna kunnat lämna pengarna på banken.

### b) Var i årsredovisningen du hittar den

1. **Årets resultat**: resultaträkningens näst sista rad, koncernen.
2. **Eget kapital**: balansräkningens "Summa eget kapital" — från BÅDA
   åren, eftersom modellen använder snittet (utdelningar, emissioner och
   vinster rör posten under året).
3. **Noten/förändringsanalysen till eget kapital**: hur posten rörde sig —
   vinst, utdelning, emission, återköp, omvärdering. En ROE på en
   emissionstämd eller återköpskrympt nämnare är inte samma prestation.
4. Femårssnittet: nyckeltalssidan eller fem redovisningar.

### c) Så beräknas den — steg för steg

1. Läs årets resultat (efter skatt, inklusive minoritets andel om
   koncernen redovisar det).
2. Läs eget kapital vid årets början (förra årets slut) och slut.
3. Snitt-EK = (EK början + EK slut) ÷ 2.
4. ROE = årets resultat ÷ snitt-EK × 100 %.
5. Kontrollera mot skuldsättningsgraden (V10) och
   förändringsanalysen innan du tolkar nivån.

### d) Räkneexempel: NorrTeknik AB

- Årets resultat 2025: 110. EK 2024: 290, EK 2025: 340.
- Snitt-EK = (290 + 340) ÷ 2 = 315.
- ROE = 110 ÷ 315 = **34,9 %** — ägarnas kapital avkastar knappt 35
  öre per krona och år.
- Modellens kurva (25–35 % ⇒ 4 poäng) ger **4 poäng**. Och här är
  nyanserna värda att se: för 5 poäng krävs ROE över 35 %, ETT bevisat
  femårssnitt över 35 % och skuld/EK högst 2. NorrTeknik klarar
  hävstångskontrollen (1,51 — se V10) men ligger strax under 35 %-strecket
  och saknar femårshistorik i vår låtsas-redovisning: **dokumenterat 4,
  inte gissat 5.** Tre bolag kan alltså få samma poäng av tre olika skäl —
  det är meningen.

### e) Fallgropar — när talet snedvrids

- **Hävstångens optik.** ROE stiger med skulden — tills cykeln vänder.
  Läs aldrig ROE utan skuld/EK vid sidan; metoden beräknar dem i par med
  V10 först, som just hävstångskontroll.
- **Nära nog räcker inte.** 8,5 % ROE är inte "nästan bra" — det är under
  kapitalkostnaden och därmed värdeförstöring (0 poäng). Tröskeln är en
  klippa, inte en backe.
- **Emissionstämda nämnare.** Nytt kapital sent på året sänker ROE
  mekaniskt utan att affären förändrats — därför snittet av början och
  slut.
- **Återköpsmaskinen.** Bolag som köper tillbaka aktier krymper EK och
  blåser upp ROE aritmetiskt — kolla förändringsanalysen. (Se också V05:
  samma mekanism som förvanskar P/B.)
- **Bankers ROE** fungerar som mått men med annan hävstångslogik —
  bankbalansräkningen är per definition skuldfylld. Jämför banker med
  banker, aldrig med industrier.

### f) Övningsfrågor med facit

1. **Räkna:** NorrTekniks ROE 2025 med snittmetoden?
   *Facit:* 110 ÷ ((290 + 340) ÷ 2) = 110 ÷ 315 = 34,9 % ⇒ 4 poäng.
2. **Räkna vidare:** Vad hade ROE blivit med endast slutårets EK i
   nämnaren — och varför använder metoden snittet?
   *Facit:* 110 ÷ 340 = 32,4 %. Skillnaden är 2,5 enheter. Snittet
   fångar att kapitalet rört sig under året (utdelning 60 gick ut,
   vinsten 110 kom in) — nämnaren ska spegla kapitalet som faktiskt
   arbetade under perioden, inte en slumpdag.
3. **Tänk:** Kontrollera NorrTeknik mot alla tre villkoren för 5 poäng.
   *Facit:* ROE 34,9 % ≤ 35 % (under strecket); femårssnitt kan inte
   bevisas ur tvåårs-redovisningen; skuld/EK 1,51 ≤ 2 (ok). Slutsats:
   4 poäng, och anledningarna är dokumenterade — metoden belönar
   spårbarhet, inte önsketänkande.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## V10 — Skuldsättningsgrad (Stabilitet)

### a) Vad indikatorn mäter — och varför den spelar roll

Skuldsättningsgraden mäter **balansen mellan lånade och ägarpengar**:
summa skulder och övriga förpliktelser dividerat med eget kapital. 1,0×
betyder att banken och ägarna finansierar hälften var; 0,5× att ägarna
står för två tredjedelar. Varför en hel indikator för det? För att skulden
är **cykelns förstärkare i båda riktningarna**: i uppgång lyfter den lånade
kronan (som tjänar mer än räntan) ROE och avkastningen; i nedgång är samma
lån en fast kostnad som måste betalas även när affären sviker — skulden
bestämmer hur djupt ett bolag kan falla. Gradens egentliga fråga är alltså
inte "är lån dumt?" utan **hur stor del av bolagets struktur som är
okänslig för hur affären går** — banken får sitt före ägaren, alltid.
Därför beräknas V10 före V09 i modellen: det är hävstångskontrollen som
avgör om ROE:n får ge toppoäng.

### b) Var i årsredovisningen du hittar den

1. **Eget kapital**: balansräkningens "Summa eget kapital" (koncernen,
   inklusive minoritetsintressen om de redovisas — annars blir graden
   missvisande).
2. **Summa skulder och övriga förpliktelser**: hela posten, inte bara de
   räntebärande. Gradens mäter balansstrukturen; för EV-räkningar (V06)
   används de räntebärande — olika frågor, olika delar av skulderna.
3. **Räntetäckningsgraden**: noten om finansiella poster —
   rörelseresultat ÷ finansiella kostnader. Graden säger hur mycket lån,
   räntetäckningen hur lätt de bärs.
4. **Förvaltningsberättelsen**: kända återbetalningsprofiler och
   refinansieringsdatum de närmaste åren.

### c) Så beräknas den — steg för steg

1. Läs "Summa skulder och övriga förpliktelser" (korta + långa) ur
   balansräkningen.
2. Läs "Summa eget kapital" — kontrollera TECKNET före division: är EK
   negativt är graden meningslös och lämnas osatt.
3. Skuldsättningsgrad = summa skulder ÷ summa eget kapital.
4. Komplettera med räntetäckningsgraden ur noten om finansiella poster.
5. Kontrollera vad som driver nivån: räntebärande lån, leasing (IFRS 16)
   eller stora icke-räntebärande poster som leverantörsskulder och
   obetalda skatter — de är verksamhetens naturliga finansiering, inte
   bankens.

### d) Räkneexempel: NorrTeknik AB

- Summa skulder 2025: 515 (varav räntebärande bara 200 — resten är
  leverantörsskulder 160 och övrigt 155).
- Eget kapital: 340.
- Skuldsättningsgrad = 515 ÷ 340 = **1,51×** — banken och ägarna
  finansierar ungefär 60/40.
- Modellens trappa (1–2× ⇒ 3 poäng) ger **3 poäng** — medelriskig
  struktur.
- Nyansen: räntetäckningen är 150 ÷ 12 = **12,5×** — rörelseresultatet
  täcker finanskostnaderna tolv gånger om. Grad 1,51 med storslagen
  täckning är ett annat riskläge än grad 1,51 med täckning 2×. Två mått,
  en bild — så ska de läsas.

### e) Fallgropar — när talet snedvrids

- **Negativt eget kapital ⇒ osatt.** Är EK under noll saknar graden mening
  — modellen sätter osatt, inte 0, eftersom en negativ nämnare inte ger
  någon ranking. Kontrollera tecknet FÖRE du delar.
- **Banker och finansbolag**: deras balansräkning är skulder per
  definition (inlåning) — grader på 8–15× är struktur, inte misskötsel.
  Jämför dem med kapitaltäckningsmått i stället.
- **IFRS 16.** Leasingåtaganden är numera skuld i balansräkningen —
  butiks- och flygplansleasingar "förvärrade" grader mekaniskt 2019.
  Jämför inte över övergången utan not.
- **Räntan och löptiden avgör bärigheten.** 3× skuldsättning till 2 %
  ränta kan vara lugnare än 1,5× till 8 % — komplettera alltid med
  räntetäckning och refinansieringskalender.
- **Skuldfrihet är ingen gratis dygd.** Ett starkt lönsamt bolag som vägrar
  låna när räntan ligger under dess avkastning lämnar avkastning på bordet
  — därför är V10 ett riskmått (med 0,5×-gränsens 5-poäng), inte en
  medalj för maximal försiktighet.
- **Icke-räntebärande skulder kan svälla graden "harmless"** — växande
  leverantörsskulder kan lika gärna vara tecken på betalningsproblem som
  på effektiv finansiering. Noterna avgör.

### f) Övningsfrågor med facit

1. **Räkna:** NorrTekniks skuldsättningsgrad och poäng?
   *Facit:* 515 ÷ 340 = 1,51× ⇒ 3 poäng (1–2×).
2. **Räkna vidare:** Vad är räntetäckningsgraden, och vad tillför den?
   *Facit:* 150 ÷ 12 = 12,5×. Gradens måttar strukturen (hur mycket lån),
   täckningen bärigheten (hur lätt de bärs) — tillsammans skiljer de ett
   lugnt 1,51× från ett stressat.
3. **Tänk:** Ett bolag har drivit EK under noll genom återköp. Vad gör
   modellen med V10 — och varför inte 0 poäng?
   *Facit:* Osatt. En negativ nämnare ger ingen meningsfull kvot (graden
   kan se "låg" ut med stora negativa tal) — att sätta 0 vore att låtsas
   att ett oläsligt mått säger något. Osatt + förklaring är den ärliga
   redovisningen av vad data bär; metoden dokumenterar i stället för att
   gissa. (Och notera sammanhanlet: samma återköp som kan blåsa upp V09
   och trycka ner V05 gör V10 oläsligt — kapitalstrukturens mått hänger
   ihop.)

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*

---

## Avslutande notis — och vidare

Del 1 har följt tio indikatorer genom samma låtsas-redovisning: tre
tillväxtmått (V01–V03), tre värderingsmått (V04–V06), tre lönsamhetsmått
(V07–V09) och stabilitetens grundpelare (V10). Notera mönstret som kommit
tillbaka i varje kapitel: **en siffra fäller aldrig domen.** V04 läses med
V07/V08; V05 med V09 och goodwill-noten; V06 med kassatäckningen (V19);
V09 med V10; V10 med räntetäckningen. Det är inte tillfällighet utan
modellens kärna — indikatorerna är konstruerade att läsas i par och
mönster, precis som du kommer att göra på riktiga årsredovisningar i
kursens fortsättningsdelar (V11–V20 behandlas i del 2).

Allt ovan beskriver hur utbildningsmetoden läser, räknar och tolkar
offentligt material — ingenting är investeringsråd, och inga bolag i
exemplen finns på riktigt. Så fungerar metoden; vad du sedan gör med din
egen analys är alltid ditt beslut.

*Utbildningsmaterial — AK1A Research Lab · Fas 2-fördjupningen del 1 ·
fabrik v159-u1 · 2026-09-24.*
