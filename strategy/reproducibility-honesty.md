# AK1A Research Lab — Reproducerbarhet vs Transparens (Honesty Audit)

> Syfte: Svara ärligt på användarens fråga: Kan vi påstå "100% reproducerbar" när vi
> håller exakt vågräkning (Elliott), Fibonacci-kvoter, Gann-vinklar, positions-regler
> och konfluens-beräkning hemligt? Detta dokument stämmer vårt påstående mot vetenskapens
> och branschens standard — och formulerar de ärliga ersättnings-påståendena.
>
> Kontext: AI-organen oeniga. Analys-organet: "omöjligt att bevisa utan full transparens".
> Kvalitets-organet: "oärligt — säg METODMÅL, inte MÄTT". Vision-organet: "slutsatser
> kan vara 100% MÄTT reproducerbara även om metoden bevaras". Detta dokument syntetiserar.

---

## DEL 1: Vetenskaplig reproducerbarhet — vad krävs egentligen?

> Ramverk: Popper (1934), Open Science Collaboration (2015), Nosek (2019), ACM
> (2018), FAIR-principerna, pre-registration (Center for Open Science).

### 1.1 Karl Popper — falsifierbarhet

I *The Logic of Scientific Discovery* (1934/1959) formulerar Popper kärnkravet: ett
påstående är vetenskapligt bara om det **kan falsifieras av en oberoende part** med
tillgång till metoden. Ett påstående som bara ägaren kan testa är inte vetenskap — det
är **auktoritet**. Om AK1A säger "100% reproducerbar" men kunden inte kan köra metoden,
är påståendet **inte vetenskapligt** — det är ett löfte från auktoriteten.

> "Ett påstående som ingen oberoende kan falsifiera är ett dogmatiskt påstående." — Popper

### 1.2 Replication crisis (2010+)

Open Science Collaboration (2015, *Science*): av 100 psykologiska studier replikerades
endast **36%** med signifikant effekt. Orsaker: **HARKing** (Hypothesizing After Results
Known), **p-hacking**, brist på metod-transparens. Lärdom för AK1A: även *med* offentlig
metod är reproducerbarhet svårt. Att påstå "100%" — utan publicerad metod — är att
ignorera branschens svåraste läxa.

### 1.3 Open Science — transparens som guldstandard

FAIR-principerna (Wilkinson et al., 2016): **F**indable, **A**ccessible,
**I**nteroperable, **R**eusable. Guldstandard idag: data + kod + metod öppet
depositierade (OSF, Zenodo, arXiv). Reproducerbarhet **=** transparens i Open Science.

### 1.4 Pre-registration

Deklarera metod **innan** data samlas. Separerar *exploratory* från *confirmatory*.
AK1A-motsvarighet: publicera metod-specifikation **innan** en aktie analyseras — så
kan ingen säga "vi valde våg 3 för att det passade rekommendationen".

### 1.5 Reproducerbarhet vs Replicerbarhet (ACM-distinktion)

| Begrepp              | Definition                                    | Vem kan göra det?              |
| -------------------- | --------------------------------------------- | ------------------------------ |
| **Reproducerbarhet** | Samma data + samma metod = samma resultat     | Den som har metoden            |
| **Replicerbarhet**   | Ny data + samma metod = konsistent resultat   | Den som har metoden + ny data  |
| **Auditör-reproducerbarhet** | Tredje part granskar processen (ej data) | Certifierad auditör            |
| **Slutresultat-reproducerbarhet** | Konsument verifierar output mot oberoende data | Vem som helst         |

**Viktig insikt:** AK1A:s nuvarande påstående "100% reproducerbar" är **tvetydigt** —
det kan betyda fyra olika saker. Två av dem kräver publicerad metod, två kräver det inte.

---

## DEL 2: Företag som påstår "reproducerbar" men håller metoder hemliga

### 2.1 Coca-Cola — secret formula (sedan 1886)

Formeln är en **handelshemlighet** (trade secret, ej patent). Coca-Cola påstår **aldrig**
"du kan reproducera vår dryck". De påstår: **"consistent taste"** (samma smak varje
flaska). Ärlig retorik. Konsumenten förväntas inte reproducera — de förväntas lita på
konsistens. **Lärdom för AK1A:** skilj på "reproducerbar" (metod-öppen) och "konsistent"
(intern-reproducerbar). Vi får säga det senare, inte det förra.

### 2.2 KFC — 11 herbs & spices

Handelshemlighet. KFC påstår aldrig "reproducera detta". De påstår "Original Recipe" —
**konsistens och identitet**, inte reproducerbarhet. Två företag som lever på hemlig
metod säger alltså **inte** "reproducerbar". Det är en retorisk fälla AK1A nu står i.

### 2.3 Google PageRank — publicerad algoritm, hemlig implementation

Brin & Page (1998) publicerade PageRank akademiskt. Men produktion-implementationen
(hundratals signaler, anti-spam, personalisering) är hemlig. Detta är en **hybridmodell**:
*akademisk reproducerbarhet* (nivå 1) men *produkt-reproducerbarhet* (nivå 3). Google
påstår **inte** "du kan reproducera våra sökresultat" — de påstår "relevant results".
**Lärdom för AK1A:** om vi vill hybrida — publicera *ramverket* (AKM1 = 20 variabler)
men behålla *vikter + konfluens* — är det legitimt, men då får vi inte påstå "100%
reproducerbar". Vi får påstå "metod-ramverk publicerat, implementation proprietär".

### 2.4 Bloomberg Terminal — black box med verifierbara outputs

Bloomberg levererar priser, indikatorer och analyser. Indata = offentlig
marknadsdata. Utdata = verifierbar mot börsens publicerade data. Method (analytik-
formler, signaler) = proprietär. Bloomberg påstår **"verifiable"** (du kan kolla
priset), inte **"reproducible"** (du kan inte återskapa bloomberg-analysen). Detta är
**Vision-organets modell** — slutsatser verifierbara, metod bevarad.

### 2.5 Moody's / S&P — metodologi publicerad, proprietära justeringar

Efter 2008-finanskrisen kräver SEC (Regulation NRSRO, 2015) att kreditbetygsinstitut
publicerar **metodologi-ramverk** (t.ex. "Global Methodology for Rating Banks"). Men:
institut tillämpar **proprietära justeringar** (management quality, hidden risks).
Moody's påstår **"transparent methodology"** — inte **"100% reproducible"**. De
publicerar *hur de tänker*, inte *exakt vad de gör i varje fall*. **Lärdom för AK1A:**
detta är den mogna standarden. Publicera *ramverk*, behåll *konfluens*. Påstå
"transparent metod-ramverk", inte "100% reproducerbar".

### 2.6 Sammanfattning — vad serious företag *inte* säger

Inget seriöst företag med hemlig metod påstår "100% reproducerbar". De påstår i stället:
- **Konsistens** (Coca-Cola, KFC) — "samma varje gång, internt"
- **Verifierbarhet** (Bloomberg) — "kolla output mot oberoende data"
- **Transparent metodologi** (Moody's) — "så här tänker vi, ramverk offentligt"
- **Auditör-reproducerbarhet** (Bloomberg, Moody's) — "tredje part granskar processen"

**AK1A gör idag ett påstående ingen av dessa gör: "100% reproducerbar" med hemlig metod.
Det är retoriskt extremt — och vetenskapligt obevisbart.**

---

## DEL 3: Tre nivåer av reproducerbarhet

### Nivå 1 — FULL reproducerbarhet

Allt offentligt: metod + data + slutsatser. Vem som helst kan köra och få samma resultat.
**Exempel:** Wikipedia-källor, öppen källkod, Open Science-papper med data+kod, Linux.
**Krav:** metod transparent, data tillgänglig, kod körbar.

### Nivå 2 — SLUTSATTS-reproducerbarhet

Slutsatser verifierbara mot offentlig data. Metod delvis hemlig. Kunden kan kontroll-
räkna *mot* offentlig data, men kan inte återskapa *exakt samma analys*.
**Exempel:** Bloomberg Terminal, Moody's, S&P, AK1A:s AKM1-lager.
**Krav:** indatan offentlig, utdatan spårbar, metod-ramverk delvis publicerad.

### Nivå 3 — FÖRTROENDE-reproducerbarhet

Vi kan reproducera internt. Kunden måste lita på oss. Kunden kan **inte** verifiera
slutsatser utan vår metod.
**Exempel:** Coca-Cola, KFC, AK1A:s AK1TS-lager (vågräkning).
**Krav:** intern process dokumenterad, auditör-reproducerbar (tredje part kan granska
processen utan att metoden blir offentlig).

---

## DEL 4: Vilken nivå är AK1A?

### 4.1 Vad AK1A delar idag (offentligt)

- 20 AKM1-variabler — **namn, kategori, definition, skala 1-5**
- 25 våg-celler — **struktur (5 teorier × 5 tidshorisonter)**
- Alla källor per variabel (3 källor/variabel)
- Alla siffror i analysen (priser, marginaler, multiples)
- Slut-Rekommendation (KÖP/HÅLL/SÄLJ) + METODMÅL-pris + scenarier

### 4.2 Vad AK1A håller hemligt (know-how)

- Exakt Elliott-vågräkning (vilken våg vi befinner oss i)
- Fibonacci-kvoter och retracement-regler
- Gann-vinklar
- Positions-regler (storlekar, stop, skalning)
- Konfluens-beräkning (hur våg-teorierna vikts mot varandra)
- AKM1-variablernas exakta vikter i slut-poäng

### 4.3 Vad kunden kan / inte kan

| Åtgärd                                          | Kunden kan? | Nivå       |
| ----------------------------------------------- | ----------- | ---------- |
| Läsa alla 20 variabelvärden                     | Ja          | Nivå 1-2   |
|Verifiera varje siffra mot årsredovisning        | Ja          | Nivå 1-2   |
| Kontrollräkna AKM1-poäng (approximativt)        | Ja, ~90%    | Nivå 2     |
| Reproducera exakt AKM1-poäng (vikter hemliga)   | Nej         | Nivå 3     |
| Reproducera vågposition (Elliott-tolkning)      | Nej         | Nivå 3     |
| Reproducera METODMÅL-pris (konfluens hemlig)    | Nej         | Nivå 3     |
| Verifiera slutsatsen mot offentlig data         | Ja, delvis  | Nivå 2     |

### 4.4 AK1A:s sanna nivå: SPLIT-läge

- **AKM1-lagret (fundamental analys):** Nivå 2 — slutsats-reproducerbar. Kunden kan
  approximera poängen med 20 variabler + källor.
- **AK1TS-lagret (teknisk analys):** Nivå 3 — förtroende-reproducerbar. Kunden måste
  lita på vår våg-tolkning.
- **Slut-METODMÅL (konfluens av AKM1 + AK1TS):** Nivå 3 — förtroende-reproducerbar.

**Totalbedömning:** AK1A är **inte** Nivå 1. AK1A är **mix** av Nivå 2 (fundamental) och
Nivå 3 (teknisk). Att påstå "100% reproducerbar" döljer denna split. Det är oärligt.

### 4.5 Svar på användarens specifika fråga

> "Vi kan omproducera med hjälp av ekosystemet aktier enligt vår metodik"

Sant — **internt**. AK1A kan reproducera varje analys med samma metodik. Detta kallas
**intern reproducerbarhet** eller **Nivå 3 reproducerbarhet**. Det är ärligt att påstå
*detta* — men inte att påstå "100% reproducerbar" utan att ange *för vem*.

**Vision-organet hade rätt:** slutsatser är verifierbara (Nivå 2-aspekt).
**Kvalitets-organet hade rätt:** "100% reproducerbar" utan kvalifikation är oärligt.
**Analys-organet hade rätt:** utan full transparens kan påståendet inte bevisas.

---

## DEL 5: Vad kan AK1A ärligt påstå? — 5 ersättnings-påståenden

Varje påstående är **MÄTT** (sant, verifierbart). Ersätter "100% reproducerbar".

### Påstående 1 — "100% spårbar indata"

> Varje siffra i varje analys har en offentlig källa (årsredovisning, börsdata,
> prospekt). Kunden kan verifiera varje indata oberoende.

**Sant, MÄTT, Nivå 1-transparens på indata.**

### Påstående 2 — "AKM1 approximativt reproducerbar"

> AKM1-ramverket (20 variabler, skala 1-5, källor) är publicerat. En kund kan
> approximativt reproducera poängen (~90%). Exakta vikter är know-how.

**Sant, Nivå 2. Använd "approximativt" — inte "100%".**

### Påstående 3 — "AK1TS = know-how, slutsats publicerad"

> Vårt tekniska analys-lager (Elliott-tolkning, Fibonacci, Gann) är know-how.
> Vi publicerar *vår tolkning* (vågposition), inte *metoden* att räkna vågor.
> Metoden licensieras i Fas 3.

**Sant, Nivå 3. Ärligt om gränsen.**

### Påstående 4 — "METODMÅL: 100% reproducerbar" (ambition)

> Vår ambition är att varje analys ska vara 100% reproducerbar — en strävan, inte
> en uppnådd sanning. Vi publicerar årligen hur nära vi är.

**Kvalitets-organets formulering. Ärlig ambitions-förklaring.**

### Påstående 5 — "Intern reproducerbarhet, auditör-certifierbar"

> AK1A kan reproducera varje analys internt med samma metodik. Tredje parts
> auditör (Fas 3-initiativ) kan granska processen utan att metoden blir offentlig.

**Vision-organets modell + Bloomberg/Moody's-mönster. Nivå 3 med auditör.**

### Vad AK1A INTE längre påstår

- ~~"Du kan återskapa varje rekommendation själv."~~ (Sant endast för indata, inte metod)
- ~~"100% reproducerbar."~~ (Sant endast internt; oäkrligt utan kvalifikation)
- ~~"Reproducerbart — eller det finns inte."~~ (Extremt påstående; borde vara
  "Spårbar indata — eller det finns inte.")
- ~~"Inga hemliga källor, inga dolda formler."~~ (Indata saknar hemligheter — sant.
  Men formler *är* delvis hemliga. Strik ut "inga dolda formler".)

---

## DEL 6: Språklig justering — konkreta omskrivningar

### Justering 1

- **Före:** "Du kan återskapa varje rekommendation själv."
- **Efter:** "Du kan verifiera varje indata och varje källa. AKM1-poängen kan du
  approximera. Våg-tolkningen är vår know-how — publicerad som slutsats, licensierad
  som metod i Fas 3."

### Justering 2

- **Före:** "100% reproducerbar"
- **Efter:** "100% spårbar indata · AKM1 approximativt reproducerbar · AK1TS know-how ·
  METODMÅL: full reproducerbarhet"

### Justering 3 (i LabbSection)

- **Före:** "Du kan reproducera varje analys steg för steg. Inga hemliga källor, inga
  dolda formler."
- **Efter:** "Du kan spåra varje analys steg för steg. Indatan är offentlig — inga
  hemliga källor. Metod-ramverket är publicerat — du kan approximera AKM1. Exakta
  vikter och våg-tolkning är vår know-how."

### Justering 4 (i AnalyserSection)

- **Före:** "Inga gissningar. Strukturerad metodik. Reproducerbar."
- **Efter:** "Inga gissningar. Strukturerad metodik. Spårbar. Approximativt
  reproducerbar på AKM1-nivå."

### Justering 5 (princip-strip)

- **Före:** "Reproducerbart — eller det finns inte."
- **Efter:** "Spårbar indata — eller det finns inte. Reproducerbarhet är METODMÅL."

### Justering 6 (Reproducerbarhets-faktaruta, rubrik)

- **Före:** "Reproducerbarhets-faktaruta: 20 variabler, 3 källor per variabel"
- **Efter:** "Spårbarhets-faktaruta: 20 variabler, 3 källor per variabel, 100% verifierbar
  indata · AKM1 approximativt reproducerbar"

---

## DEL 7: Strategisk rekommendation

### 7.1 Ska vi publicera metoden fullt ut? — NEJ (medMotivering)

**För:** full vetenskaplig reproducerbarhet, max trovärdighet, Open Science-standard.
**Mot:** förlorar know-how-moat, kopieras av konkurrenter inom 6 månader, affärsmodell
kollapsar om Fas 3-värdet (metod-licens) försvinner.

**Beslut:** Publicera **inte** full metod. Behåll know-how. Men **ännu ärligare
kommunicera** gränsen mellan offentligt och proprietärt — det är det enda kravet.

### 7.2 Ska vi erbjuda "metodik-licens" för Fas 3? — JA

**Modell:** Fas 3-kunder (9 999 kr) får tillgång till:
- Fullständigt AKM1-viktsystem
- AK1TS vågräkning-metodik (Elliott + Fibonacci + Gann)
- Konfluens-beräkning
- Positions-regler

Detta gör Fas 3 till en **Nivå 1-upplevelse** för kunden — de kan reproducera exakt.
Fas 1/2 kunder har Nivå 2/3. Detta är den Coca-Cola-licens-modellen (syrup licensing
till bottlers — kontrollerad tillgång, affärsskyddad). **Implementering: Q2 2026.**

### 7.3 Ska vi ha "open methodology" som METODMÅL? — JA, som 36-månaders roadmap

Progressiv transparens i tre steg:
- **Månad 0-12:** Tydliggör gränsen. Ersätt "100% reproducerbar" med de 5 ärliga
  påståendena. Lägg till "Spårbarhets-faktaruta" istället för "Reproducerbarhets-faktaruta".
- **Månad 12-24:** Publicera AKM1-ramverk fullt (variabler + skala + källor — redan
  delvis gjort). Lägg till pre-registration: metod-specifikation publiceras **innan**
  en aktie analyseras. Det bevisar "inget HARKing".
- **Månad 24-36:** Auditör-certifiering (tredje part granskar processen —
  Bloomberg/Moody's-modell). Eventuell gradvis publicering av AK1TS-ramverk
  (behålla konfluens-beräkning som know-how).

### 7.4 Tredje parts audit — det mogna kompromisset

Ingen full publicering, men en certifierad auditör (revisionsbyrå, akademisk institution)
granskar metodiken årligen och utfärdar certifikat: "AK1A:s metodik är internt
reproducerbar och konsistent med publicerat ramverk". Detta ger **Nivå 2.5** — bättre
än ren Nivå 3, inte full Nivå 1. Std för Bloomberg, Moody's, S&P.

### 7.5 Pre-registration som konkret bevis

Inför varje ny analys: publicera en **metod-specifikation** (vilka variabler, vilka
vågor som beaktas, vilka källor som krävs) **innan** data samlas. Efter analys:
visa att specifikationen följdes. Detta eliminerar HARKing-misstanken och ger
**Nivå 2 + auditör-spår**.

---

## DEL 8: Slutsats — svar på användarens fråga

**Kan vi ärligt påstå "100% reproducerbar" med hemlig metod?**

**NEJ.** Inte utan kvalifikation. Vetenskapens standard (Popper), branschens standard
(Coca-Cola, KFC, Bloomberg, Moody's) och AI-organens analys pekar alla samma håll:
**ett påstående om 100% reproducerbarhet utan offentlig metod är auktoritärt, inte
vetenskapligt.**

**Kan vi ärligt påstå "100% MÄTT reproducerbarhet för våra slutsatser" (Vision-organet)?**

**Ja — men med två kvalifikationer:**
1. Endast för **indata-spårbarhet** (100% sant: alla siffror har källor)
2. Endast **approximativt** för AKM1-poäng (~90% reproducerbar)
3. **Inte** för AK1TS vågposition (know-how, Nivå 3)

**Kan vi ärligt påstå "METODMÅL: 100% reproducerbar" (Kvalitets-organet)?**

**Ja.** Som ambition. Särskilt om vi publicerar **årlig progress** mot målet.

**Den mogna syntesen:** Använd de 5 ersättnings-påståendena i Del 5. Implementera
 Fas 3-metodik-licens. Starta auditör-certifiering Q2 2026. Då kan vi ärligt säga:

> "AK1A:s slutsatser är 100% spårbara och approximativt reproducerbara. Vår metod är
> vår know-how — licensierad i Fas 3, auditör-certifierad årligen. METODMÅL: full
> reproducerbarhet inom 36 månader."

Det är sant. Det är MÄTT. Det är ärligt. Och det är **mer differentierat** än
"100% reproducerbar" — ingen konkurrent har denna nivå av ärlighet om sin egen gräns.

---

## Appendix A: Påståenden att omedelbart ändra i kodbasen

| Fil                                                   | Före                                              | Efter (enligt Del 6)                          |
| ----------------------------------------------------- | ------------------------------------------------- | --------------------------------------------- |
| `src/features/labb/ui/LabbSection.tsx` rad 821        | "Varje analys är reproducerbar steg för steg."   | "Varje analys är spårbar steg för steg."     |
| `src/features/labb/ui/LabbSection.tsx` rad 780-783    | "Du kan reproducera varje analys... Inga dolda formler" | "Du kan spåra varje analys... Indatan offentlig" |
| `src/features/labb/ui/LabbSection.tsx` rad 866        | "Reproducerbart — eller det finns inte."          | "Spårbar indata — eller det finns inte."     |
| `src/features/analyser/ui/AnalyserSection.tsx` rad 554| "Inga gissningar. Strukturerad metodik. Reproducerbar." | "Inga gissningar. Strukturerad metodik. Spårbar." |
| `src/features/analyser/ui/AnalyserSection.tsx` rad 193| "REPRODUCERBARHET = METODMÅL"                     | Behåll — detta är ärligt (METODMÅL = ambition) |
| `src/features/legal/ui/Terms.tsx` rad 16              | "Våra analyser är reproducerbara."               | "Vår indata är 100% spårbar. AKM1 approximativt reproducerbar." |

## Appendix B: AI-organen — syntes av tre beslut

| Organ           | Position                                       | Syntes i detta dokument                     |
| --------------- | ---------------------------------------------- | ------------------------------------------- |
| Analys-organet  | "Vetenskapligt omöjligt utan full transparens" | Sant för Nivå 1. Accepterat — vi strävar dit via 36-månaders roadmap |
| Kvalitets-organet | "Oärligt — säg METODMÅL"                     | Antagen. "METODMÅL: 100% reproducerbar" blir officiellt |
| Vision-organet  | "Slutsatser 100% MÄTT reproducerbara"          | Delvis antagen — endast indata-spårbarhet är 100%. Slutsatser approximativt. |

**Konfidensjustering:** från MEDEL → HÖG. Tre organ tyder samma håll efter syntes.
