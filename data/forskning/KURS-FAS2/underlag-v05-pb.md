# V05 — P/B, pris/eget kapital (Värdering, 6 % vikt)

Underlag till Fas 2-fördjupningen · våg 192 · 2026-09-18
Kursreferens: slug `v05-pb` · Modell: AKM1 V05

## 1. Vad indikatorn innebär i praktiken

P/B svarar på: **vad betalar marknaden per krona av bokfört eget kapital?**
Börsvärde ÷ eget kapital (balansräkningens nedre del). Det egna kapitalet är
det som aktieägarna har kvar av allt bolaget äger minus allt det är skyldigt
— bokföringens "återstående värde".

P/B är värderingens äldsta mått och fungerar bäst där balansräkningen
speglar affären: banker, försäkring, kapitaltunga industrier, fastigheter.
För kunskapsbolag är det svagare — det viktigaste (varumärke, kod, kunnande)
står inte i balansräkningen. Därför denna varning redan i rubriken av
utbildningen: **P/B kräver att du förstår VAD det egna kapitalet består av.**

## 2. Läsa det i en faktisk årsredovisning

1. **Balansräkningens eget kapital** — ta koncernens summa (med
   minoriteter om redovisat), inte moderbolagets.
2. **Noten om eget kapital** (förändringsanalys): visar årets rörelser —
   vinst, utdelning, återköp, omvärderingar. Här ser du OM kapitalet växer
   organiskt eller krymper genom återköp.
3. **Goodwill-andelen**: noten om immateriella tillgångar — hur stor del av
   eget kapital är goodwill? (Avgörande för tolkningen, se fällor.)
4. **Börsvärde** som i V04 (kurs × antal aktier).
5. Räkna och jämför inom bransch — teknikbolag mot teknikbolag, banker
   mot banker, aldrig blandat.

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

Ur bolagsunivers.json (hämtat 2026-09-03), fält `vardering.pb`:

| Bolag | P/B | ROE | Skuld/EK | Läs |
|---|---|---|---|---|
| Sinch | **1,38** | 1,9 % | 0,35 | eget kapital rensat av nedskrivningar (2024: −6,4 mdr resultat) |
| Ericsson B | **3,09** | 26,1 % | 0,38 | normal industriell teknikkonsultstruktur |
| Atlas Copco A | **9,26** | 25,7 % | 0,34 | högt ROE driver multipeln |
| Kambi | **29,18** | 7,0 % | 0,05 | litet bokfört kapital, 98,9 % bruttomarginal |
| Apple | **44,15** | 148,8 % | 0,78 | återköpen har krympt nämnaren (EK är en restpost) |

**Tabellen är genomgången i sin helhet:** fem "P/B-tal" som betyder fem
olika saker. Sinch låg efter nedskrivningar (kapitalet ärligt rensat);
Apple 44 ser extremt ut tills du ser ROE 149 % — återköpsmaskinen gör
nämnaren konstgjort liten; Kambi 29 speglar att mjukvaruvärde inte bor i
balansräkningen.

## 4. Kritiskt tänkande — fällor

- **Återköpsfällan (Apple-fallet).** Eget kapital krymper av återköp →
  P/B och ROE stiger mekaniskt utan att affären förändrats. Hög P/B på
  återköpsmaskin är INTE samma som dyr aktie; låg är inte billig.
- **Goodwillfällan (Sinch-fallet före 2024).** Eget kapital uppblåst av
  aldrig-testad köpeskilling → P/B ser rimlig ut medan reella värden var
  lägre. Kontrollera alltid goodwill/totala tillgångar och
  nedskrivningshistoriken. Efter nedskrivningen är P/B 1,38 "ärligare" —
  men speglar då det förflutna, inte framtiden.
- **Negativt eget kapital.** Bolag med tunga återköp och utdelningar kan
  driva EK under noll → P/B oläsligt (negativt). Det är inte en
  "gratis" aktie — måttet är bara ej applicerbart; byt till P/E, EV/EBIT.
- **Bank-specifikt:** för banker är P/B huvudmåttet (balansräkningen ÄR
  affären) men tolkas mot substansvärde och ROE-mål i redovisningen.
- **Omvärderingsreserver** (fastigheter) kan göra EK känsligt för
  värderingsantaganden — notens fotnoter bär sanningen.
- **Märk: modellen ger aldrig P/B ensam sista ordet** — 6 % vikt, läses
  med V04 och lönsamhet (V09 ROE kopplar direkt: P/B = P/E × ROE-algebra).

## 5. Koppling till AKM1 — modellens trösklar

Ur kalkylatorn (RAKNARE, V05): formel Börsvärde ÷ Eget kapital,

| P/B | Poäng |
|---|---|
| < 1 | 5 |
| < 2 | 4 |
| < 3 | 3 |
| < 5 | 2 |
| ≥ 5 | 1 |

Universumexempel: Sinch 1,38 → 4 p · Ericsson 3,09 → 2 p · Atlas Copco
9,26 → 1 p · Kambi 29,18 → 1 p · Apple 44,15 → 1 p. Och här visar
utbildningen sin poäng om mekanismens gräns: Apple får 1 p trots att
bolaget gör 148,8 % ROE — modellen straffar alltså återköpsdriven
kapitalkrympning om man läser V05 blint. AKM1:s lösning: tolka V05 alltid
tillsammans med V09 (ROE) och goodwill-noten — det är modellens sätt att
säga samma sak som fällorna ovan. Så fungerar metoden; plattformen lär
ut metoden, den ger aldrig råd om vad du ska göra (2007:528).

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
