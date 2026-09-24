# F05 — Technical Analysis of Stock Trends (Edwards & Magee)

Underlag till Fas 3-djupet · våg 164 · 2026-09-24
Kursreferens: slug `technical-analysis-of-stock-trends` · Position: klassikern som ger Fas 3:s tekniska grundvokabulär — trend, stöd/motstånd och formationernas namn

## 1. Kärnan — trenden, nivåerna och formationernas namn

Edwards & Magees lärobok (första upplagan 1948) är den klassiska sammanställningen
av den tekniska analys som växte fram ur Dow-teorin. Kursen bygger på tre
byggstenar från den traditionen:

- **Trendbegreppet.** En upptrend är en sekvens av *högre toppar och högre
  bottnar*; en nedtrend är lägre toppar och lägre bottnar; allt annat är
  sidledes. Definitionen är mekanisk — två läsare ska kunna slås av samma
  sekvens — och trenden finns samtidigt i flera skalor (primär, sekundär,
  minor), vilket är samma skaltänk som F01:s grader.
- **Stöd och motstånd.** Zoner där köpare respektive säljare tidigare visat sig
  i styrke. En nivå som bryts byter ofta roll: gammalt motstånd blir nytt stöd.
  Nyckelordet är *zon* — priserna samlas i ett band, aldrig på en pixellinje.
- **Formationsnamnen.** Vändningsformationer (huvud-skuldra, dubbeltopp,
  dubbelt botten) och fortsättningsformationer (trianglar, flaggor, vimplar,
  rektangel). Namnen är komprimerade beskrivningar av hur utbud och efterfrågan
  förskjuts — inte magiska symboler.

## 2. Att dra trendlinjer och zoner — hantverket

1. **Bestäm vy och skala innan du ritar.** Ett tidspann (i exempel nedan:
   dagavslut) och logaritmisk skala på fleråriga serier — en linje som byter
   vy är inte längre samma linje.
2. **Trendlinjen samman binder två betydande bottnar** (upptrend) eller
   toppar (nedtrend). Två punkter är en hypotes; först när en tredje sväng
   stannar vid linjen är den bekräftad. Fler beröringar gör linjen
   viktigare — och varje beröring förbrukar trovärdighet.
3. **Dra zoner, inte pixellinjer.** Målet är det område (några procent brett)
   där svängpunkterna samlas, inte en decimal.
4. **Horisontella nivåer före snedda.** Fråga först "var har kursen vänt flera
   gånger?" — därefter "vilken sned linje beskriver svängarna?".
5. **Kanalen** är trendlinjens parallell på motsatt sida; avståndet mellan
   dem blir formationsmått i sektion 3.
6. **Läs volymen samtidigt.** I en frisk trend följer volymen med trendens
   svängar; volymbekräftelse hör till ritandet, inte till eftertanket.

## 3. Räkneexempel — att mäta ett utbrott (pedagogiskt exempel, tydligt konstruerat)

Edwards & Magees mätteknik: **formationens höjd projiceras från brytpunkten.**
Alla siffror nedan är konstruerade för genomräkningen.

**Huvud-skuldra, nedåt.** Vänster skuldera toppar 158 kr, huvudet 172 kr,
höger skuldra 160 kr. Bottnarna däremellan: 146 och 147 kr — nacklinjen dras
genom dem som en **zon 146–147**. Formationens höjd = huvudets topp minus
nacklinje: 172 − 146,5 = **25,5 kr**. Utbrottet: stängning under nacklinjen
vid 145,50. Projektionen: 145,5 − 25,5 = **120 kr** som första målområde,
(147 − 120) ÷ 147 ≈ **−18 %** under brytzonen. Volymkontroll: utbrottsdagen
visar 2,4× genomsnittlig volym — bekräftat. Hade volymen i stället halverats
vore utbrottet misstänkt (se fallgrop 3).

**Dubbelt botten, uppåt — metoden är riktningsneutral.** Bottnar 40 och 41 kr,
toppen emellan 46 kr. Höjd = 46 − 40,5 = 5,5 kr. Stängning över 46 ⇒ första
mål 46 + 5,5 = **51,5 kr**, (+12 % från brytnivån). Samma aritmetik, andra
riktning: det är höjden som projiceras, alltid från den nivå där utbrottet
sker.

Exemplen visar hur metoden mäts; de säger inget om vad någon bör göra med
någon aktie (2007:528).

## 4. Fallgropar

- **Se mönster i brus.** Given tillräckligt många svängar hittar ögat alltid
  en "formation". Skyddet är regelverket: distinkta svängar, nacklinje i
  minst två punkter, rimliga proportioner — och testet *skulle en annan
  läsare med samma regler se samma formation?*
- **Glidande trendlinjer.** Att rita om linjen efter varje ny lågpunkt tills
  den passar igen är inte analys — efter tredje omritningen är det en åsikt
  som jagas. Rätt läsning är den omvända: varje tvingad omritning är i sig
  information om att trenden försvagas.
- **Glömma volymen.** Pris utan volym är en rörelse utan vittne. Utbrott utan
  volymökning är ofta falskt (ett språng utan publik), och avtagande volym i
  en gammal trend varnar tidigare än priset — Edwards & Magee är tydliga med
  att volymen bekräftar trenden.
- **Projektionen som prognos.** Målet är ett första målområde att öva mätning
  på, inte ett löfte om var kursen stannar.

## 5. Koppling till AK1A-ekosystemet

F05 förser hela Fas 3:s tekniska familj med ordförrådet: F01:s hierarki avgör
*i vilken skala* en läsning görs, F05 avgör *vad som räknas* som trend, nivå
och formation i den skalan. Grannkurserna bygger vidare på samma
språk: F04 (Elliott) läser samma kurva som svängar i stället för formationer —
två beskrivningar av samma utbud och efterfrågan; F06 (Murphy) systematiserar
med volym och tidsramar; F08 (Bulkowski) sätter statistik på de namn Edwards
& Magee namngav (träffprocent per formation); F13 (Fibonacci) gör
stöd/motstånd-zonerna mätbara — retracementzoner är just stöd och motstånd.
I plattformen lever tanken i AKM2-analyserna, där det tekniska benet (struktur,
nivåer, volym) förs och loggas som ett separat vittne bredvid det fundamentala
— F03:s konfluens — och i AI-Mentorn, där eleven får rita sina egna zoner och
jämföra med en modelläsning. Fasprogressionen är densamma som övriga banan:
Fas 1 beskriver, Fas 2 analyserar, Fas 3 integrerar.

*Utbildningsmaterial — beskriver hur metoden läser, ritar och räknar; inga
investeringsråd, inga avkastningslöften (2007:528). Kurskurser i exemplen är
konstruerade och märkta som sådana.*
