# F19 — The Complete TurtleTrader: historien, legenden och mentorskapet

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `the-complete-turtletrader` · Fas 3 — systematisk handel som pedagogik

## 1. Kärnan — rekrytering, träning, utfall

Michael Covel rekonstruerar i The Complete TurtleTrader (2007) hela
turtleexperimentet utifrån — motstycke till Curtis Faiths inifrånperspektiv
(F18). Byggstenarna: 1983 lät Richard Dennis placera en annons där han
sökte handelsassistenter till att lära sig hans system, med frågeformulär
där färdigheter i poker och bridge vägde tyngre än ekonomiska examina.
Enligt boken kom uppemot tusen ansökningar; ett tjugotal togs ut i två
klasser (1983 och 1984), fick cirka två veckors undervisning, skriftliga
regler och Dennis kapital att handla med. Programmet redovisade samlat
vinster i storleksordningen 100 miljoner dollar — men siffran är
historiens minst intressanta del.

Det intressanta är spridningen: exakt samma regler, samma lärare, samma
marknader — och utfall som spände över hela spektrat. Det är kursens
pedagogiska kärna: Dennis och Eckhardt slog vad om huruvida handel kan
läras ut, och svaret blev "reglerna kan läras ut — men utfallet följde
inte reglerna, det följde människorna som använde dem". Historien är
med andra ord inte en framgångssaga om ett system, utan ett stycke
utbildningsforskning i naturligt format: vad är det träning faktiskt
kan förmedla, och var går gränsen?

## 2. Praktisk läsning — de som höll och de som bröt

Covels mest användbara material är vad deltagarna gjorde efter
utbildningen, dokumenterat i intervjuer. Tre spår syns:

- **De som höll systematiken.** Jerry Parker (Chesapeake Capital) behöll
  trendföljningen men förlängde tidsramarna till sin egen tålamodsnivå —
  en medveten, en gång fattad anpassning — och byggde ett förvaltningsbolag
  i miljardklassen. Liz Cheval (EMC Capital), Paul Rabar och Tom Shanks
  stannade i trendföljning i decennier.
- **De som bröt.** Covel låter flera deltagare själva berätta om brottet:
  signaler som hoppades över i efterhand för att de "uppenbart" var fel,
  affärer utanför systemet efter vinstsviter (övermod) eller under
  förlustsviter (tristess och olydnad). Brottet var sällan dramatiskt —
  det var små undantag som växte.
- **Mönstret.** De som höll gjorde en av två saker: följde reglerna
  mekaniskt, eller ändrade en gång, medvetet, till en variant de kunde
  leva med — och stannade sedan. De som bröt höll inte fast vid något
  alls: de improviserade mitt i. Kursen låter eleven sortera citten i
  spåren — det är F14:s journallärdom i historisk förpackning.

Covel noterar också det obekväma: Dennis själv, regelverkets upphovsman,
förlorade stort 1987–88 och avvecklade sin verksamhet, medan Eckhardt
fortsatte. Reglernas ägare hade inget eget skydd — det är ytterligare
ett bevis på att systemet aldrig var hemligheten.

## 3. Räkneexempel — 1 % risk, två förluster, en vinnare

Genomgångshypotetiskt exempel med konstruerade tal — inte historisk
data. Startkapital 100 000 kr, risktaket 1 % av saldot per position.
Turtlarnas logik i miniatyr: stoppavståndet bestämmer positionens
storlek — aldrig tvärtom (F18:s fjärde systemfråga).

| Affär | Saldo | Risk (1 %) | Ingång/stopp | Antal | Utfall | Nytt saldo |
|---|---|---|---|---|---|---|
| 1 | 100 000 | 1 000 kr | 100 / 95 kr | 200 | stopp: −1 000 kr | 99 000 |
| 2 | 99 000 | 990 kr | 50,00 / 47,50 kr | 396 | stopp: −990 kr | 98 010 |
| 3 | 98 010 | 980 kr | 80 / 76 kr | 245 | trend-exit 110: +7 350 kr | 105 360 |

Räkneverket: affär 1 köper 1 000 / 5 = 200 aktier, affär 2 köper
990 / 2,50 = 396 aktier, affär 3 köper 980 / 4 = 245 aktier som stängs
vid trendföljarexiten: (110 − 80) × 245 = +7 350 kr. Kedjan: 0,99 ×
0,99 × 1,075 ≈ 1,0536 — kontot slutar på 105 360 kr, **+5,4 % trots två
förluster av tre affärer**.

Tre utläsen. Först: förlusterna är mekaniskt avgränsade till 1 % var,
oavsett hur den känns. Sedan: eftersom risken räknas på aktuellt saldo
krymper positionerna automatiskt efter förluster — inbyggda bromsar,
precis som turtlarnas enhetsstorlek efter volatiliteten. Slutligen:
vinnaren får löpa medan förlustarna klipps — asymmetrin bär hela
resultatet (F20 fördjupar förväntansvärdeslogiken).

## 4. Fallgropar

- **Historieberättande som bevis.** Experimentet saknar kontrollgrupp;
  siffrorna bygger på intervjuer och har omdebatterats — även Covel har
  i efterhand ifrågasatt enstaka deltagares redovisade resultat. Att
  "följsamheten avgjorde" är i sig en tilltalande berättelse; kursen
  tränar eleven att se skillnaden mellan ett dokumenterat mönster och
  en bra historia om samma mönster.
- **Survivorship-bias i legenden.** Turtlemyten räknar Parkers och
  Chevals fondframgångar och glömmer de som lämnade branschen. De
  synliga turtlarna är redan sorterade av tiden — urvalet bär inte
  något vittnesbörd om metoden, bara om minnet.
- **Decennieanpassning.** 1980-talets råvarumarknader var ett gott
  decennium för trendregler; samma regler under andra marknadslägen
  ger andra kurvor (F18:s lärdom: en kort period är inget bevis).
- **Att leta efter reglernas hemlighet.** Reglerna har varit publika
  i decennier. Faiths svar gäller fortfarande: de är värdefulla för
  få — de som faktiskt följer dem. Fallgropen är att samla regler
  i stället för att träna efterlevnad.

## 5. Koppling till ekosystemet — mentorskapets roll

Dennis gav turtlarna tre saker: skrivna regler, kapital utan egen
riskförlust, och en feedbackkultur i gruppen. Det är mallsatsen för
AK1A:s ekosystem: kursinnehållet är reglerna, övningsytorna och
pappersexemplen är riskfria kapital, och AI-Mentorn med F14:s journal
är feedbackslingan. Kurser kan ge två av tre — den tredje, kulturen,
är det lärvägarna bygger över tid, och det är därför mentorskapet är
en produkt och inte ett tillbehör. F18 (inifrån, Faith) och F19
(utifrån, Covel) berättar samma förlopp i två källor — eleven tränar
källtriangulering, plattformens röda tråd: metod, dokumentation,
källmärke — aldrig råd. Fas 2:s procentkultur lever i tabellen, F20
avrundar med förväntansvärdet, och AKM2-analyserna visar samma gräns
i bolagsanalys: systematik skiljd från åsikt.

*Kursunderlag — utbildning om hur metoden och historien fungerar;
hypotetiska övningstal, inga investeringsråd, inga avkastningslöften
(2007:528).*
