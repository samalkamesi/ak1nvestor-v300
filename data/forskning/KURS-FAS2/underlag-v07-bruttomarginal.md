# V07 — Bruttomarginal (Lönsamhet, KRITISK vikt)

Underlag till Fas 2-fördjupningen · våg 197 · 2026-09-19
Kursreferens: slug `v07-bruttomarginal` · Modell: AKM1 V07

## 1. Vad indikatorn innebär i praktiken

Bruttomarginalen är **det som blir kvar av varje hundralapp i försäljning
när varan/tjänsten är levererad** — före personal, marknadsföring, kontor
och finansiellt. Formellt: (Nettoomsättning − rörelsens kostnader exkl.
personalkostnader) ÷ nettoomsättning.

Varför är den KRITISK i AKM1? För att den är **prisets och varans makt**
i en enda siffra:

- Hög bruttomarginal = kunden betalar mycket mer än varan kostar att
  producera — varumärke, teknik eller switch-kostnad ger prutmån.
- Låg bruttomarginal = produkten är en råvara i kundens ögon; konkurrensen
  sker på pris, och varje kostnadssvängning slår rakt igenom.
- Marginalen är starten på ALL lönsamhet: en hög bruttomarginal kan
  förvaltas bort av dålig organisation, men en låg kan ALDRIG förvaltas
  fram till hög netto. Taket sätts i första raden.

## 2. Läsa det i en faktisk årsredovisning

1. I **koncernens resultaträkning**: posterna "Nettoomsättning" och
   "Kostnad sålda varor och tjänster" (KSVT) — eller "Rörelsens kostnader"
   där personalkostnader redovisas separat i not.
2. Räkna: (Nettoomsättning − KSVT) ÷ Nettoomsättning.
3. **Noten till rörelsekostnaderna** delar upp: material, personalkostnad,
   övriga rörelsekostnader — använd den för att se vad som verkligen är
   varukostnad.
4. VARNING för **banker, förvaltnings- och fastighetsbolag**: deras
   resultaträkningar har ingen KSVT-struktur alls — bruttomarginal är ett
   okänt begrepp (se fällorna).
5. För trenden: nyckeltalssidan (5 år) eller fem årsredovisningar.

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

Bruttomarginal, koncernen (källa: bolagsunivers.json, Yahoo/MarketStack,
hämtat 2026-09-03; universummedianen 47,8 %):

| Bolag | Bruttomarginal | AKM1-poäng |
|---|---|---|
| Evolution | 100,0 % | 4* |
| Kambi | 98,9 % | 4* |
| Atlas Copco | 42,2 % | 3 |
| Assa Abloy | 43,1 % | 3 |
| Alfa Laval | 36,3 % | 3 |
| Volvo B | 24,4 % | 1 |
| Sinch | 18,4 % | 1 |
| Swedbank | 0,0 % | — (branschfälla, se nedan) |

\* Över 70 % ger 5 p ENDAST om 5-årigt snitt också överstiger 70 % —
se trösklarna.

**Träningssekvens:** Evolution och Kambi är mjukvara/plattform — varan
kostar nästan noll att leverera en gång byggd (100 % resp. 98,9 %).
Atlas Copco och Assa Abloy är premium-industri (42–43 %): ingen 100-%-vara,
men prutmån genom teknik och varumärke. Volvo (24,4 %) och Sinch (18,4 %)
visar volym och hård prispress. Samma siffra, tre olika affärsmodeller —
därför läser modellen nivån men kräver sammanhang.

## 4. Kritiskt tänkande — fällor

- **Jämför ALDRIG bruttomarginal mellan branscher som vore det en ranking.**
  En handelskedja på 25 % kan vara magnifik och en programvara på 85 %
  medioker — marginalens mening avgörs av branschens struktur. (Universumet
  saknar branschmedian i datakontraktet — modellen använder absolut nivå
  och dokumenterar det; ett medvetet och återanvänt designval.)
- **Banker och förvaltningsbolag: 0 % är SAKNAD-data, inte dålig affär.**
  Swedbank, Nordea och Handelsbanken visar 0,0 % i tabellen ovan — deras
  resultaträkningar har ingen KSVT. Industrivärden/Kinnevik-visar 100/0 %
  av samma skäl. Lär dig se strukturen FÖRE siffran.
- **Uthållighet bevisas inte av ett år.** Platt topp i kurvan: över 70 %
  ger 5 p bara om 5-årssnittet håller — en ensam lyckoåring räcker inte.
- **Redovisningsval:** klassificering av personalkostnader och "övriga
  rörelsekostnader" kan flytta marginalen flera enheter mellan bolag —
  noterna är din friend.
- **Mix-effekter:** säljer bolaget en lågmarginalvolym vid sidan av
  högmarginalkärnan kan totalsiffran dölja att kärnan krymper — leta
  segmentuppdelningar i noterna.

## 5. Koppling till AKM1 — modellens trösklar

Ur kärnan (`scorV07`, R2 §6 konkav kurva med platt topp):

| Bruttomarginal | Poäng |
|---|---|
| < 15 % | 0 |
| 15–25 % | 1 |
| 25–35 % | 2 |
| 35–50 % | 3 |
| 50–70 % | 4 |
| > 70 % | 5 ENDAST om 5-årigt snitt > 70 % — annars 4 |

Exempel ur tablån: Sinch 18,4 % → 1 p · Volvo 24,4 % → 1 p · Alfa Laval
36,3 % → 3 p · Atlas Copco 42,2 % → 3 p · Kambi 98,9 % → 4 p (5 kräver
bevisat 5-årssnitt). Vikten KRITISK — V07 är Lönsamhets-kategorins
tyngsta variabel och modellens tidigaste moat-indikator (V13-väggens
grundmaterial).

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
