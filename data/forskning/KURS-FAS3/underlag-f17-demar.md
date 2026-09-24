# F17 — The New Science of Technical Analysis: räkneregler i stället för ögonmått

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `the-new-science-of-technical-analysis` · Fas 3 — DeMarks mekanisering av chartläsningen

## 1. Kärnan — att mekanisera vad ögat gör

Thomas DeMarks *The New Science of Technical Analysis* (1994) växer fram ur
en irritation kursen gör till program: traditionell teknisk analys är för
subjektiv. Samma graf, två ritare — två olika trendlinjer, två olika
slutsatser. DeMarks svar är att ersätta ögat med **objektiva räkneregler**:
varje signal ska vara definierad så att två oberoende läsare, med samma
data, får exakt samma resultat. Där Dow-traditionen säger "rusningen ser
trött ut" frågar DeMark: vilka tal gör "trött" mätbart?

Bokens signaturidé är **utmattning som något att räkna fram**. Prisrörelser
drivs av köpare och säljare som successivt förbrukas — till slut finns inga
nya att tillgå, och vändningen kommer. Ögat anar det i en utdragen svans på
diagrammet; DeMark översätter aningen till en mekanisk räkning (sitt mest
kända verktyg: nioräkningen TD Sequential). Poängen är inte räkningen i
sig utan kulturen bakom: regler som kan loggas, granskas och felas —
hantverket synliggjort i tal. (Bokens system byggdes med hjälp av stora
institutionella aktörer; till privatpersonen är den ett kunskapsverk om
hur regler konstrueras, inte en handelsmanual.)

## 2. Praktisk läsning — en nioräkning steg för steg

Säljvarianten (spegelvänd för köp):

1. **Vändvillkoret.** Räkningen inleds när en stängning är högre än
   stängningen fyra handelsdagar tidigare, efter att den föregående
   stängningen varit lägre än sitt jämförelsetal. Vändningen definierar
   startpunkten — ingen räkning utan föregående motrörelse.
2. **Räkna nio.** Varje dag som stänger högre än sitt fyra-dagars-jämförelsetal
   får ett nummer, till och med nio. En enda stängning under bryter
   räkningen — då börja om när vändvillkoret återkommer.
3. **Kontrollera giltigheten.** Nian kräver att dag 8 eller dag 9:s
   högsta kurs sticker över både dag 6:s och dag 7:s högsta. Utan det är
   serien innehållslös stigning — regeln skyddar mot att räkna ett
   långsamt seglat uppåt utan acceleration.
4. **Vad nian betyder.** En giltig nio markerar **utmattning i området** —
   en observation att rörelsens bränsle håller på att ta slut, inte en
   klocka. DeMark byggde därför vidarelager (bekräftelser, fortsättnings-
   räkning mot setupens extrema nivå) just för att utmattning kan dröja.

## 3. Räkneexempel — Volvo B, juli 2026, alla talen

Verkliga dagsslutkurser, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat
2026-09-24 (251 handelsdagar). En kursräkning — ingen bedömning av aktien.

**Vändvillkoret:** 13 juli stänger 335,30 — lägre än 340,20 (7 jul). Därpå
14 juli: 337,10 — högre än 333,70 (8 jul). Räkningen startar.

| Nr | Datum | Slutkurs | −4 jämförelse | Utfall |
|---|---|---|---|---|
| 1 | 14 jul | 337,10 | 333,70 | högre |
| 2 | 15 jul | 338,50 | 334,40 | högre |
| 3 | 16 jul | 341,30 | 336,90 | högre |
| 4 | 17 jul | 339,10 | 335,30 | högre |
| 5 | 20 jul | 338,70 | 337,10 | högre |
| 6 | 21 jul | 339,50 | 338,50 | högre |
| 7 | 22 jul | 348,00 | 341,30 | högre |
| 8 | 23 jul | 352,00 | 339,10 | högre |
| 9 | 24 jul | 354,80 | 338,70 | högre |

**Giltigheten:** dag 8:s högsta 354,20 ≥ dag 6:s 342,10 och dag 7:s
348,90 — uppfyllt (dag 9:s 355,90 likaså). Giltig nia avslutad 24 juli.

**Efterspelet:** kursen steg sju handelsdagar till — 371,50 (4 aug), +
4,7 % från dag 9 — vände och föll till 330,20 (15 sep), −11,1 % från
toppen. Året rymmer fyra sälj-nior (tre giltiga) och en ogiltig köp-nia;
exemplet visar kursens båda sanningar på en gång: utmattningen kom i
området — men nian var ingen tidtagare.

## 4. Fallgropar

- **Att mekanisera utan ursprunget.** Den som säljer på varje "9:a" utan
  att förstå att räkningen mäter utmattning gör om ögats misstag i ny
  förpackning. Regeln är en översättning av en iakttagelse — glöms
  iakttagelsen blir siffran tom. Volvo-efterspelet (+4,7 % efter nian)
  är det inbyggda motbeviset.
- **Komplexitet som trygghet.** DeMarks senare verk lager på lager av
  undantag och filter; känslan av stringens kan bli en drog. Fler regler
  betyder fler grader att överanpassa samma historik med — inte automatiskt
  bättre frågor. Kursens hållning: förstå en regel djupt före nästa.
- **Räkning i tomrum.** I trendlös marknad fullbordas nior utan att någon
  rörelse tröttnat — verktyget hör hemma i tydliga svängar (F12:s karta),
  inte i sidledsgyttja.
- **Bekräftelsens frånvaro.** En observation utan villkor som ogiltigför
  klarar den är ingen metod. Konfluens gäller här också (F03).

## 5. Koppling till ekosystemet — regler + vågfundament

F17 är Fas 3:s regelmaskin: där Torssell (F15) ger den svenska regelboken
och Elliott (F01, F04) mönstren, ger DeMark **mekaniseringen** — hur en
iakttagelse ("svansen ser trött ut") blir en räkning två läsare delar.
Exemplet landar medvetet i F13:s Volvo-sväng: Fibonacci mäter hur djupt
motrörelsen går, DeMark mäter hur trött rörelsen är — samma sväng, två
komplementära frågor, och septemberfallet förkastade bådas hypoteser lika
hedervärt. I AKM2-kulturen är DeMarks arv direkt: signaler som loggas och
kan felas gör lärandet testbart; portföljmotorn övar räkningen; AI-Mentorn
kan ställa frågan *vilka tal skulle ogiltigförklara din nia?* Kursen lär
ut att konstruera regler — utbildning i metod, aldrig råd (2007:528).

*Utbildningsmaterial — beskriver hur metoden räknar med källmärkta,
historiska exempel; inga investeringsråd, inga avkastningslöften
(2007:528).*
