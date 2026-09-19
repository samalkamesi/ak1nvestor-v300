# V08 — EBITDA-marginal (Lönsamhet, 8 % vikt)

Underlag till Fas 2-fördjupningen · våg 197 · 2026-09-19
Kursreferens: slug `v08-ebitda-marginal` · Modell: AKM1 V08

## 1. Vad indikatorn innebär i praktiken

EBITDA-marginalen mäter **hur stor del av varje hundralapp i försäljning
som blir rörelsekassa** — rörelseresultatet plus avskrivningar, delat med
nettoomsättningen. Den svarar på: hur bra är affären på att omvandla
intäkter till drift, när vi stängar ögonen för finansiering (ränta),
skatt och bokföringsmässigt slitage (avskrivningar)?

Tre användningar:

- **Jämföra driftens lönsamhet mellan bolag med olika kapitalstruktur** —
  samma neutralitet som EV/EBITDA men från resultat-sidan.
- **Se driftens andel av strukturen:** bruttomarginalen visar varans makt,
  EBITDA-marginalen visar hur mycket organisationen (personal, marknad,
  lokal) kostar av den makten. Gapet mellan V07 och V08 är
  organisationskostnaden i procent av omsättningen.
- **Bro mot kassaflödet:** EBITDA närmar sig verklig kassa före arbetande
  kapital och investeringar — men kommer aldrig fram helt (se fällorna).

## 2. Läsa det i en faktisk årsredovisning

1. **Rörelseresultat** (EBIT): resultaträkningen, raden "Rörelseresultat"
   — efter rörelsekostnader, före finansiella poster och skatt.
2. **Avskrivningar:** kassaflödesanalysen, posten "Avskrivningar/
   nedskrivningar" (ibland delad i flera rader — summera dem).
3. Räkna: (Rörelseresultat + Avskrivningar) ÷ Nettoomsättning.
4. Notera att **noten till rörelsekostnaderna** ofta redovisar
   avskrivningarna också (personalkostnad/avskrivning/övrigt) — bra
   korskälla.
5. **IFRS 16-läsning:** leasingavskrivningar och leasingräntor ligger i
   olika rader — bestäm en princip och håll den konsekvent mellan bolagen
   du jämför.

## 3. Räkneexempel — genomräkning på universumtal

Universumet redovisar EBIT-marginal (rörelseresultat/omsättning);
EBITDA-steget läggs till ovanpå med avskrivningarna. Genomräkning för
**Alfa Laval**: EBIT-marginal 16,2 % + avskrivningar (maskinpark och
 goodwill, typiskt 4–5 %-enheter av omsättningen för processindustri) ⇒
**EBITDA-marginal ≈ 20–21 %** (komponenten avskrivningar ur årsredovis-
ningens kassaflödesanalys — ta alltid bolagets egen post, inte ett antagande).

EBIT-marginaler ur universumet (hämtat 2026-09-03) — avståndet mellan
affärsmodeller i en kolumn (universummedian 20,8 %):

| Bolag | EBIT-marginal | Bild |
|---|---|---|
| Industrivärden | 99,9 % | förvaltning (fälla, se nedan) |
| Evolution | 57,8 % | mjukvara/kasino — extrem drift |
| Swedbank | 51,4 % | bank (fälla — EBIT säger lite) |
| Atlas Copco | 20,6 % | premium-industri på medianen |
| Sandvik | 19,7 % | samma klass |
| Alfa Laval | 16,2 % | + D&A ⇒ ~20–21 % EBITDA |
| Assa Abloy | 16,9 % | + D&A ⇒ ~18–19 % EBITDA |
| Volvo B | 10,4 % | volym-industri |
| Ericsson | 12,5 % | projekt/tjänster |
| Sinch | 2,5 % | prispressad plattform |

**Gapövningen:** Atlas Copco brutto 42,2 % → EBIT 20,6 %: organisationen
äter hälften av varans makt — normalt för industri. Evolution brutto
100 % → EBITDA-drift 57,8 %: varan kostar noll, hela slaget står om
kundanskaffning och drift. Läs alltid V07 och V08 TILLSAMMANS.

## 4. Kritiskt tänkande — fällor

- **EBITDA målar "före slitage" — men slitage är verkligt.** Kapital-
  intensiva bolag (gruvor, rederier, stål) ser Arsenal-lönsamma ut i
  EBITDA just för att ersättningsinvesteringarna är osynliga. En hög
  EBITDA-marginal med evigt stort CAPEX-behov är ingen kornett.
- **EBIT ≠ EBITDA — knappast värt att säga, men modellen tar det på allvar:**
  att lägga EBIT-marginaler på EBITDA-trösklar underskattar systematiskt
  (därför är V08 osatt i kärnan, se nedan).
- **IFRS 16 (leasing):** flyttar leasing från kostnad till avskrivning+
  ränta — EBITDA-marginalen steg "gratis" vid övergången 2019 utan att
  en enda affär förbättrats. Jämför aldrig tvärs över övergången utan att
  justera.
- **Banker/förvaltningsbolag:** Swedbanks "51,4 %" och Industrivärdens
  "99,9 %" är inte lönsamhet utan resultaträkningens struktur — samma
  branschfälla som V07.
- **Engångsposter:** restruktureringskostnader och företagsförvärvsvinster
  kan båda ligga kvar i EBIT — noten om jämförelsestörande poster är
  skyldigheten att läsa.

## 5. Koppling till AKM1 — modellens trösklar

**V08 är OSATT i kärnan idag — med dokumenterad orsak:** datakontraktet
har `lonksamhet.ebitMarginal` (EBIT), inte EBITDA. Kärnan vägrar lägga
EBIT på EBITDA-trösklar: systematisk underskattning av alla kapital-
intensiva bolag vore resultatet. Precis som V06 aktiveras indikatorn när
kontraktet utökas additivt (avskrivningar/omsättning i källa = fältet som
saknas). Tröskelfamiljen som väntar är lönsamhetsstegen i lönsamhets-
kategoriens konkava mönster (som V07/V09: låg nivå hårt straffad, topp
endast med uthållighetsbevis).

Detta är Fas 2:s kanske renaste exempel på **modellens datoheder**: hellre
en tom rad med förklaring än en snygg siffra som ljuger om vad den mäter.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
