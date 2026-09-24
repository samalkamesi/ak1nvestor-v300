# F11 — Martin Pring on Market Momentum: fart före nivå

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `martin-pring-on-market-momentum` · Fas 3 — momentumets roll i helhetsläsningen

## 1. Kärnan — momentum är fart och riktning, inte nivå

Prings centrala bild: **priset talar om var marknaden befinner sig,
momentum talar om med vilken fart och i vilken riktning den rör sig.**
Pris är position, momentum är hastighet — en bil kan stå på samma
backe med motorn avslagen eller i full fart uppåt; positionen säger
inget om vilket. Två aktiegrafer kan visa samma kursnivå och ändå
beskriva två helt olika marknader: en där köpkraften håller på att
sinna och en där den byggts upp.

Därför kompletterar måtten varandra i stället för att konkurrera:
prisgrafen ger nivån (trend, stöd, motstånd — F09:s hierarki),
momentumgrafen ger det inre trycket. Prings iakttagelse är att det
inre trycket ofta vänder **före** priset: farten avtar medan kursen
fortfarande stiger, och prisvändningen kommer senare. Momentum är
alltså inte en bättre prisindikator — det är ett mått på ett annat.
Kursens grundsatser: läs nivå ur pris, fart ur momentum, och läs dem
i samma tidsfönster.

## 2. Praktisk läsning — divergens steg för steg

Momentumdivergens är kursernas klassiska övning: pris och momentum
pekar inte åt samma håll. Så går metoden till:

1. **Markera prisets svängar.** De tydliga topparna och bottnarna i
   valt fönster — inte varje småstickling.
2. **Fäst momentumpanelen under prisgrafen.** RSI, MACD-histogram
   eller rate-of-change — samma period, samma datumaxel.
3. **Jämför sväng för sväng.** Ny pristopp: högre eller lägre topp i
   momentum? Ny prisbotten: högre eller lägre botten?
4. **Klassificera.** Pris gör lägre bottnar medan momentum gör högre
   = **positiv divergens** (nedgången tappar fart). Pris gör högre
   toppar medan momentum gör lägre = **negativ divergens** (uppgången
   tappar fart).
5. **Kräv bekräftelse.** Divergensen är ett tillstånd, inte en
   signal. Pring håller fast vid att momentumkurvan dessutom ska
   själv vända och slå sin referenslinje (t.ex. mittdelen av RSI:s
   spann) innan läsningen får status av observation.
6. **Dokumentera.** Datum vid båda kurvornas svängar, måttvärden och
   ett villkor som skulle ogiltigförklara läsningen.

Övningen tränar avläsning — vad kurvorna lär om metoden, inte vad någon
bör handla (2007:528).

## 3. Räkneexempel — RSI för hand på Atlas Copco B

Verkliga slutkurser, Atlas Copco B (ATCO-B.ST), källa Yahoo Finance,
hämtat 2026-09-24. Femton dagar ger fjorton förändringar — RSI-14:

| Dag | Datum | Kurs | Förändring |
|---|---|---|---|
| 0 | 2026-09-04 | 175,95 | — |
| 1 | 2026-09-07 | 178,85 | +2,90 |
| 2 | 2026-09-08 | 180,70 | +1,85 |
| 3 | 2026-09-09 | 176,70 | −4,00 |
| 4 | 2026-09-10 | 174,55 | −2,15 |
| 5 | 2026-09-11 | 175,15 | +0,60 |
| 6 | 2026-09-14 | 168,35 | −6,80 |
| 7 | 2026-09-15 | 168,85 | +0,50 |
| 8 | 2026-09-16 | 170,15 | +1,30 |
| 9 | 2026-09-17 | 172,45 | +2,30 |
| 10 | 2026-09-18 | 171,05 | −1,40 |
| 11 | 2026-09-21 | 175,50 | +4,45 |
| 12 | 2026-09-22 | 182,00 | +6,50 |
| 13 | 2026-09-23 | 180,00 | −2,00 |
| 14 | 2026-09-24 | 177,85 | −2,15 |

Uppgångarna: 2,90 + 1,85 + 0,60 + 0,50 + 1,30 + 2,30 + 4,45 +
6,50 = **20,40**. Nedgångarna: 4,00 + 2,15 + 6,80 + 1,40 + 2,00 +
2,15 = **18,50**. Medelvinst U = 20,40 ÷ 14 = **1,457**; medelförlust
D = 18,50 ÷ 14 = **1,321**. RS = U ÷ D = 1,457 ÷ 1,321 = **1,10**.
RSI = 100 − 100 ÷ (1 + 1,10) = 100 − 47,6 = **52,4**.

Lärdomen är Prings poäng i miniatyr: kursen står bara +1,1 % högre
än för tre veckor sedan — men vägen dit innehöll både en nedgång på
6,80 kr (14 sep) och en uppgång på 6,50 kr (22 sep). Nivån är oförändrad, men
momentumvärdet mitt emellan 0 och 100 avslöjar att köp- och säljkraft
varit nästan jämnstarka: en marknad i jämvikt, inte i vila. (För hand
räknas enkelmedelvärdet så här; diagramprogram använder Wilders
utjämning där gamla värden vägs ned rekursivt — logiken är densamma.)

## 4. Fallgropar

- **Divergensen som varar.** En divergens kan bestå i veckor eller
  månader medan priset fortsätter i gamla riktning. Tillståndet säger
  "trycket avtar", inte "vändning imorgon" — därför kräver metoden
  bekräftelse (steg 5 ovan) innan något får kallas observation.
- **Överköpt/översålt som automatik i trend.** I en stark trend kan
  RSI stanna över 70 i lång tid — det är tecken på trendens styrka,
  inte en säljsignal. 70/30 är en fråga om marknadsregim: i en trendig
  marknad säger trösklarna långt mindre, i en sidledes marknad betyder
  de mer. Kursen lär eleven skilja på regimerna före trösklarna.
- **Multipla mått, en signal.** RSI, rate-of-change och stochastic
  mäter nästan samma fart — fem bekräftande indikatorer är ett
  mått räknat fem gånger. Pring håller indikatorerna få.
- **Fönsterförväxlingen.** RSI-14 på dagsdata och på veckodata beskriver
  olika världar — momentum läses alltid med angivet fönster, i samma
  zoomnivå som prisgrafen (F09:s regel).

## 5. Koppling till ekosystemet

Momentumkursen är Fas 3:s fart-block: den bygger på F09:s visuella
trappa (se först — mät sedan) och matar F03 Konfluens, där teknisk
struktur och fundamental bana (F02) möts — momentum är en av de
källorna konfluensen väger. I AKM2-analyserna blir momentumtidshorisonten
den korta, reaktiva delen av femhorisontsläsningen, och räkne-
kulturen från sektion 3 (procent, datum, källmärke) är rak arvslinje
från Fas 2. AI-Mentorn kan ställa frågan eleven nu kan besvara:
"vad säger farten som nivån tiger om?" — i portföljmotorns
övningsytor upprepas RSI-räkningen tills handen minns den. Kursen
gör Prings verktyg till övning: att mäta trycket, inte gissa på det.

*Utbildningsmaterial — beskriver hur metoden läses och räknas; inga
investeringsråd, inga avkastningslöften (2007:528). Kurser är
historiska, källmärkta exempel.*
