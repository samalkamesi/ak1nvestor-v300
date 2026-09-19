# V09 — ROE, avkastning på eget kapital (Lönsamhet, 8 % vikt)

Underlag till Fas 2-fördjupningen · våg 197 · 2026-09-19
Kursreferens: slug `v09-roe` · Modell: AKM1 V09

## 1. Vad indikatorn innebär i praktiken

ROE (Return On Equity) mäter **hur mycket vinst bolaget skapar per krona
som ägarna har satt in**: resultat efter skatt ÷ snittet av eget kapital
(årets början + slut / 2). Det är ägarens egen ränta på pengarna — den
enda siffra som i slutänden betalar utdelningar och kursutveckling.

Men ROE har en inbyggd hävstångsmöjlighet som gör den farlig att läsa ensam:

- Samma affär kan visa 10 % eller 25 % ROE beroende på hur mycket av
  den finansierats med lån — vinsten delas på ett mindre eget kapital.
- Därför kräver AKM1:s V09 en **hävstångskontroll** (via V10) och
  **uthållighetsbevis** (5-årssnitt) innan toppoäng: ROE skall komma från
  affären, inte från banken.
- Kurvans nollpunkt ligger vid kapitalkostnaden (≈ 9 % i modellen): en
  ROE under vad kapitalet kostar är värdeförstöring — bolaget hade lika
  gärna kunnat lämna pengarna på banken.

## 2. Läsa det i en faktisk årsredovisning

1. **Resultat efter skatt:** resultaträkningens näst sista rad ("Årets
   resultat", koncernen).
2. **Eget kapital:** balansräkningen, "Summa eget kapital" — TA FRÅN BÅDA
   åren (modellen använder snittet; nyemissioner och utdelningar för-
   ändrar posten under året, snittet ger rätt nämnare).
3. Räkna: Resultat ÷ ((EK förra året + EK året) ÷ 2).
4. Kontrollera i **noten till eget kapital** hur posten rörde sig:
   vinst, utdelning, emission, omvärdering — en ROE på emissionstämd
   nämnare är inte samma prestation.
5. 5-årssnitt: nyckeltalssidan eller fem redovisningar.

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

ROE, koncernen (källa: bolagsunivers.json, hämtat 2026-09-03; universum-
medianen 15,3 %):

| Bolag | ROE | Skuld/EK | AKM1-poäng |
|---|---|---|---|
| Mastercard | 241,2 % | 4,40 | 4 — ej 5: hävstången |
| Boeing | 173,5 % | 7,91 | 4 — samma mönster |
| Apple | 148,8 % | 0,78 | 4 — 5-årsbevis saknas i källan |
| Ericsson | 26,1 % | 0,38 | 4 |
| Atlas Copco | 25,7 % | 0,34 | 4 |
| Volvo B | 20,9 % | 1,47 | 3 |
| Alfa Laval | 19,1 % | 0,46 | 3 |
| Handelsbanken | 12,8 % | — | 2 |
| Sinch | 1,9 % | 0,35 | 0 — värdeförstöring |
| Kinnevik | −21,6 % | 0,07 | 0 |

**Träningssekvens — hävstångens tre ansikten:** Mastercard 241 % ROE är
en magnifik affär OCH en kraftigt belånad sådan (skuld/EK 4,40): modellen
ger 4, inte 5 — toppoäng kräver skuld/EK ≤ 2. Apples 148,8 % med låg
skuld (0,78) ändå "bara" 4: källan saknar bevisat 5-årssnitt över 35 %
(uthållighetsvillkoret). Och Kinneviks −21,6 %: negativ avkastning på
ägarnas kapital = 0 poäng oavsett allt annat. Tre bolag, tre olika
skäl till samma poäng — så läser en modell som vägrar låta en siffra
fälla domslutet.

## 4. Kritiskt tänkande — fällor

- **Hävstångens optik:** ROE stiger med skulden tills den gör det —
  sedan kommer cykeln. Läs ALDRIG ROE utan skuld/EK (V10) vid sidan;
  modellen beräknar dem i par (V10 först, som hävstångskontroll).
- **Närmaren till 9 %:** en ROE på 8,5 % är inte "nästan bra" — den är
  under kapitalkostnaden och alltså värdeförstöring (0 p i modellen).
  Tröskeln är en klippa, inte en backe.
- **Emissionstämda nämnare:** nytt eget kapital sent på året sänker ROE
  mekaniskt utan att affären förändrats — därför SNITTET av årets början
  och slut.
- **Återköpsmaskin:** bolag som köper tillbaka aktier krymper eget kapital
  och blåser upp ROE aritmetiskt — kolla noten om förändringar i eget
  kapital.
- **Bankers ROE** är fungerande men med annan hävstångslogik (balans-
 räkningen är MEGET skuldfylld per definition) — bank-ROE jämförs med
  banker, inte med industrier.

## 5. Koppling till AKM1 — modellens trösklar

Ur kärnan (`scorV09`, R2 §6 konkav kurva med hävstångskontroll):

| ROE | Poäng |
|---|---|
| < 9 % | 0 (värdeförstöring oavsett nivå) |
| 9–12 % | 1 |
| 12–18 % | 2 |
| 18–25 % | 3 |
| 25–35 % | 4 |
| > 35 % | 5 ENDAST om 5-årssnitt > 35 % OCH skuld/EK ≤ 2 — annars 4 |

Exempel ur tablån: Sinch 1,9 % → 0 · Handelsbanken 12,8 % → 2 ·
Alfa Laval 19,1 % → 3 · Ericsson 26,1 % → 4 · Mastercard 241 % → 4
(hävstång 4,40 > 2). Källfält: `lonksamhet.roe` + `moat.roeMedel5ar` +
`stabilitet.skuldEgenkapital` — tre tabeller, en dom.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
