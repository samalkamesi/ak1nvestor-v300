# F18 — Way of the Turtle: kan handel läras ut?

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `way-of-the-turtle` · Fas 3 — systematisk handel som pedagogik

## 1. Kärnan — experimentet och frågan det ställer

Curtis Faith var en av turtlarna: 1983–1984 rekryterade handlaren Richard
Dennis ett tjugotal nybörjare via en annons, gav dem två veckors
undervisning och exakt samma skriftliga regler — för att bevisa sin tes
mot kollegan William Eckhardt: att framgångsrik handel **kan läras ut**,
som han sade på samma sätt som man föder upp sköldpaddor i Singapore.
Resultaten spreds vida, och det är experimentets egentliga fynd: samma
regler, olika utfall. Faiths slutsats i boken: reglerna var inte
hemligheten — **förmågan att följa dem var det**.

Turtlarnas regelverk var trendföljande och mekaniskt: köp vid utbrott
över 20 dagars högsta notering (System 1) eller 55 dagars (System 2),
avsluta vid 10 respektive 20 dagars bottennivå, och begränsa varje
positions risk med volatilitetsmåttet N (ATR) så att alla marknader
fick jämn vikt. Kursen använder regelverket som avläsbart exempel på
vad "ett system" betyder — inte som mall att kopiera.

## 2. Praktisk läsning — vad ett komplett system innehåller

Faiths checklista: ett system är inte en köpsignal, det är **fyra svar**:

1. **Marknad och tidsram** — vad handlas och på vilken series längd
   signalerna läses (turtlarna: terminer på dagliga kurser).
2. **Entry** — när en position öppnas; hos turtlarna Donchian-utbrottet:
   dagens slutkurs över föregående 20 dagars högsta höga.
3. **Exit** — både skyddsstopp (begränsar förlusten per position) och
   trendförlorare-exit (10 dagars bottennivå stänger när trenden dör).
4. **Position och risk** — hur stor positionen får vara; turtlarnas
   N-logik: storlek ska krympa när volatiliteten växer, så att risk per
   position hålls i princip konstant.

Faiths poäng för eleven: de flesta söker det perfekta ingångsköpet, men
entry är systemets minst viktiga del — exits och positionstorlek bär
utfallet. Kursen låter eleven sortera vilka beslut som hör till vilken
fråga, och se att alla fyra måste ha ett skrivet svar innan något
verkställs (F14:s checklista i generaliserad form).

## 3. Räkneexempel — Donchian 20/10 genomrättat på OMX Stockholm

Genomgående övning på historisk data: OMX Stockholm PI (^OMX), källa
Yahoo Finance, hämtat 2026-09-24. Enkla regler, långsida, en position
i taget: **köp när slutkursen bryter 20 dagars högsta; avsluta när den
bryter 10 dagars lägsta.** Perioden 2025-09-24 → 2026-09-24 (250
börsdagar). Fem signaler blev utlösta:

| # | Ingång | Kurs | Exit | Kurs | Utfall |
|---|-----|------|------|------|--------|
| 1 | 2025-10-02 | 2 709 | 2025-11-18 | 2 674 | −1,3 % |
| 2 | 2025-12-05 | 2 827 | 2026-03-03 | 3 083 | **+9,1 %** |
| 3 | 2026-04-10 | 3 110 | 2026-04-28 | 3 056 | −1,7 % |
| 4 | 2026-05-25 | 3 193 | 2026-06-10 | 3 054 | −4,3 % |
| 5 | 2026-06-30 | 3 203 | 2026-08-18 | 3 245 | +1,3 % |

Multiplicerat: 0,987 × 1,091 × 0,983 × 0,957 × 1,013 ≈ **+2,5 %**.
Träffare: 2 av 5 (40 %). Samma periods köp-och-håll: 2 645 → 3 287 =
**+24,2 %**. Genomgången, inte en rekommendation (2007:528).

Utläsen för kursen är två. Först mönstret: fyra små affärer och en
(+)9,1 %-vinnare som bär hela summan — trendföljarens klassiska form,
få träffare men asymmetriska utfall. Sedan det obekväma: **detta år
underpresterade systemet mot indexet kraftigt.** Det är inte ett fel i
räkningen utan själva lärdomen — ett enskilt år är inte ett bevis,
varken för eller emot. Ett system ska bedömas över långa serier och
många marknadslägen; därför slutar övningen med frågan "vad hade krävts
för att döma systemet rättvist?" snarare än ett betyg.

## 4. Fallgropar

- **Att tro systemet är hemligheten.** Dennis delade ut samma regler
  till alla; utfallen skilde sig ändå. De som plockade ur systemet bara
  bitar de gillade — eller hoppade över signaler i efterhand "uppenbart
  fel" — sämst. Fallgropen är att älska regeln mer än efterlevnaden.
- **Kurveanpassning.** Putsa parametrarna (21 dagar? 18? exit 9 eller
  12?) tills historiken ser bäst ut, och man har anpassat sig till
  bruset i just denna serie. I exemplet ovan går det att hitta
  parametrar som slår indexet 2025–26 — och det bevisar ingenting om
  framtiden. Faiths hälsning: byt inte regler för att det senaste
  året gjorde ont.
- **Att läsa 40 % träffare som "dåligt".** Förväntansvärdeslogiken
  (F20 fördjupar den) säger att träffrekvens och utfallsstorlek bara
  betyder något tillsammans — att vilja ha rätt ofta är det sämsta
  skälet att välja exit.
- **Kort minne kring jämförelsen.** Buy-and-hold vann i år; nästa
  trendlösa år kan förhållandet vända. Elevens skydd är att rapportera
  båda sidorna — som här.

## 5. Koppling till ekosystemet

F18 är Fas 3:s systemkurs: utbrottet är momentum i praktik (F11),
entry/exit-nivåerna swingkartans logik (F12), journalen och checklistan
rummets disciplin (F14) — här generaliserad till skrivna svar på fyra
frågor. F19 berättar turtlarnas historia vidare (mentorskapet, de som
höll systematiken), F20 fördjupar trendföljningens förväntansvärde —
båda bygger direkt på detta underlag. Fas 2:s procentkultur lever i
tabellen; AKM2-analyserna tränar att skilja systematik från åsikt, och
AI-Mentorn kan förhöra eleven på de fyra systemfrågarna. Räkneexemplet
med dess ärliga jämförelse är plattformens röda träd: metod, data,
källmärke — aldrig råd.

*Utbildningsmaterial — beskriver hur metoden fungerar med källmärkta,
historiska exempel; inga investeringsråd, inga avkastningslöften
(2007:528).*
