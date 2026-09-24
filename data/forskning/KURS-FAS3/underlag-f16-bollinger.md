# F16 — Bollinger on Bollinger Bands: volatilitetens fickor

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `bollinger-on-bollinger-bands` · Fas 3 — bandens bredd visar vad marknaden gör, inte vad den tänker göra

## 1. Kärnan — banden = volatilitetens fickor runt ett glidande medelvärde

På 1980-talet löste John Bollinger ett praktiskt problem: band med fast
bredd — till exempel medelvärdet ± 5 % — blir översvallande när marknaden
är lugn och snäva när den stormar. Hans svar: låt bandens bredd styras av
volatiliteten själv. Resultatet är tre linjer. I mitten ett enkelt
glidande medelvärde över 20 dagar; runt det ett band på medelvärdet
± 2 standardavvikelser på var sida.

Standardavvikelsen är spridningsmåttet: hur långt, i kronor, kurserna i
snitt ligger från sitt eget medelvärde. Sprider sig slutkurserna vidgas
bandet; samlas de snörps det åt. Därav bildens fickor — två mjuka väggar
som andas med marknadens temperament, aldrig fasta nivåer. Vid
normalfördelning hamnar cirka 95 % av observationerna inom
± 2 standardavvikelser; en tumregel att minnas, inte en lag —
aktiekursers fördelningar har fetare svansar än normalfördelningen, och
det är just därför fallgroparna i sektion 4 finns. Bollinger sammanfann
metodiken i boken *Bollinger on Bollinger Bands* (2001) — kursens
kanonkälla, redan upptagen i plattformens bokkanon.

## 2. Praktisk läsning — squeeze, expansion, bandpromenader

1. **Squeeze.** Mät bandens bredd: (övre − nedre) ÷ medelvärdet. När
   bredden krymper mot periodens smalaste trycks volatiliteten ihop —
   marknader växlar mellan lugn och storm, och en komprimering säger att
   något väntar. Inte vad: riktning ger squeeze aldrig.
2. **Expansion.** När utbrottet kommer vidgas banden — ofta kraftigt,
   för att de nya kurserna river upp standardavvikelsen. Expansion är
   rörelsens storlek, inte dess riktning.
3. **Bandpromenader.** I en stark trend slutar kursen dag efter dag
   nära eller utanför det yttre bandet — Bollinger kallar det walking
   the bands. Då hjälper %b, hans lägesmått: (kurs − nedre) ÷
   (övre − nedre), där 0 är vid nedre väggen och 100 vid övre.

Praktiken: dokumentera bredden varje dag, jämför med breddens eget
förlopp — och kräv alltid sällskap av annan läsning innan en squeeze
får betyda något (F03 konfluens).

## 3. Räkneexempel — Ericsson B, 20 handeldagar hösten 2026

Pedagogisk genomräkning på verkliga dagsslutkurser, Ericsson B
(ERIC-B.ST), källa Yahoo Finance, hämtat 2026-09-24 — en övning i att
räkna, inte en rekommendation (2007:528).

| # | Datum | Kurs (kr) | # | Datum | Kurs (kr) |
|---|-------|-----------|---|-------|-----------|
| 1 | 28 aug | 96,76 | 11 | 11 sep | 98,66 |
| 2 | 31 aug | 96,72 | 12 | 14 sep | 98,04 |
| 3 | 1 sep | 96,48 | 13 | 15 sep | 98,10 |
| 4 | 2 sep | 96,64 | 14 | 16 sep | 98,96 |
| 5 | 3 sep | 96,80 | 15 | 17 sep | 101,25 |
| 6 | 4 sep | 97,06 | 16 | 18 sep | 99,98 |
| 7 | 7 sep | 97,24 | 17 | 21 sep | 100,30 |
| 8 | 8 sep | 97,26 | 18 | 22 sep | 96,52 |
| 9 | 9 sep | 96,78 | 19 | 23 sep | 97,38 |
| 10 | 10 sep | 97,24 | 20 | 24 sep | 94,04 |

**Steg 1 — medelvärde.** Summan av de 20 kurserna är 1 952,21 kr.
Delat med 20: **97,61 kr**.

**Steg 2 — avvikelser.** Varje kurs minus medelvärdet; exempel: 17 sep
101,25 − 97,61 = +3,64 och 24 sep 94,04 − 97,61 = −3,57.

**Steg 3 — kvadrater.** Varje avvikelse i kvadrat, sedan summering —
kvadratsumman blir **49,21**. Notera: de två extremdagarna ensamma
bidrar 13,25 + 12,75 = 26,0, drygt hälften av allt. Volatiliteten styrs
av extremdagarna.

**Steg 4 — varians.** 49,21 ÷ 20 = **2,46** (Bollinger dividerar med
hela populationen, inte n − 1).

**Steg 5 — standardavvikelse.** Roten ur 2,46 = **1,57 kr**.

**Steg 6 — banden.** 97,61 ± 2 × 1,57 ger övre bandet **100,75 kr** och
nedre **94,47 kr** — en bredd på 6,4 % av medelvärdet.

**Utfallet i diagrammet.** Den 10 sep var bandbredden 1,8 % — periodens
smalaste (jun–sep): en squeeze. Den 16 sep stängde kursen 98,96 över
dåvarande övre band (98,70) och den 17 sep nåddes 101,25, %b = 132 —
utbrott och expansion. Därefter vände allt: efter en bandpromenad uppåt
längs övre bandet stängde kursen 24 sep på 94,04, strax under det nedre
bandet (%b −7), och bredden vuxit till 6,4 %. På tio handeldagar hade
kursen vandrat från översta till nedersta väggen. Lektionen: squeezen
sade ATT rörelse kom, expansionen visade KRAFTEN — men riktningarna var
två, först uppåt sedan nedåt. Banden mätte båda, tipsade om ingen.

## 4. Fallgropar

- **Banden som köp-/säljsignaler.** "Köp vid det nedre bandet, sälj vid
  det övre" fungerar bara i sidgående marknad. I en trend blir det fel
  sida om och om igen — bandpromenaden slår snabbt sönder den läsningen,
  och Ericssonsejouren ovan är det inbyggda beviset. Att kursen stänger
  under nedre bandet är ett tillstånd, ingen händelse; först med
  bekräftelse — vändningsljus (F07), momentumvändning (F11) — är det en
  observation värd namnet.
- **Att glömma att banden följer volatiliteten, inte riktningen.**
  Vidgande band betyder rörelse, oavsett håll; en squeeze betyder
  väntan, utan riktningsinformation. Den som läser "expanderande band =
  uppgång" läser fel diagram — expansionen i exemplet gick åt båda håll.
- **Det glidande fönstret glömmer.** Varje handelsdag åker den äldsta
  kursen ur fönstret och en ny tillträder; banden räknas om i tysthet
  och medelvärdet glider. Igårs nivå är inte dagens — samma regel som
  F13: ingen nivå utan villkor som ogiltigförklarar läsningen.

## 5. Koppling till ekosystemet — volatilitetens plats i kartan

Banden kompletterar F11:s momentum: momentum mäter fart, banden mäter
spridning — två olika diagnosinstrument som tillsammans säger mer än
något av dem ensamt. Bandkanterna är röster i F03:s konfluens, där de
möter F13:s fibonacci-zoner och gammalt stöd/motstånd; bekräftelsen
kommer från F07:s ljus och F12:s svängpunkter. I handelsrummet (F14) är
banden ett rutinverktyg — dagens breddmätning är själva disciplinen.
I AKM2-analyserna hamnar bandläsningen i den korta tidshorisontens
tekniska del, portföljmotorns övningsytor upprepar räkningen tills
handen minns den, och AI-Mentorn kan ställa frågan eleven nu kan
besvara: *vad skulle ogiltigförklara din squeeze-läsning?* Kursens
plats i Fas 3: volatiliteten blir mätbar — utbildning i att mäta, aldrig
råd (2007:528).

*Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta,
historiska exempel; inga investeringsråd, inga avkastningslöften
(2007:528).*
