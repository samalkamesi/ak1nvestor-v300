# F07 — Nison: candlesticks, marknadens känslokarta

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `japanese-candlestick-charting` · Fas 3 — Pris-dimensionens mikroskop

## 1. Kärnan — fyra priser, en känslokarta

Varje candlestick sammanfattar en session i fyra tal: öppning, högsta,
lägsta och stängning. Av dem byggs två element. **Kroppen** sträcker sig
mellan öppning och stängning; **skuggorna** från kroppens kanter ut till
dagens extremvärden. Färgen kodar riktningen — men med en nyans som
många missar: ett vitt ljus betyder stängning *över samma dagens
öppning*, ett svart betyder stängning under den. Jämförelsen sker alltså
inom sessionen, inte mot gårdagens stängning — candlestickens styrka är
just att den fångar dramat under dagen.

Budbärarna har varsitt uppdrag. Kroppen visar **vem som vann slaget**:
lång vit kropp är ihärdigt köptryck, lång svart ihärdigt säljtryck, små
kroppar är dragkamp utan segrare. Skuggorna visar **var slaget stod**: en
lång nedre skugga är ett säljaranfall som slogs tillbaka, en lång övre
ett köparanfall som raderades. Nisons rötter går tillbaka till
Dojima-rismarknaden och Munehisa Hommas insikt — priset speglar inte
bara värde utan känslor. Fyra torra tal blir därmed en känslokarta över
hopp, rädsla och vilja, läsbar på vilken tidsram som helst.

## 2. Praktisk läsning — tre former, en lag

- **Doji** — öppning och stängning sammanfaller, kroppen försvinner.
  Perfekt obeslutsamhet. I en sidledes marknad är den brus; efter en
  utdragen trend eller vid en betydande nivå är den en fråga som kräver
  svar — och svaret kommer först med nästa ljus.
- **Hammare** — liten kropp högt upp i dagens range, nedre skugga minst
  dubbelt kroppen, försumbar övre skugga. Säljarna pressade priset djupt
  ned men köparna återtog allt före stängning. Gäller efter en nedtrend,
  gärna vid stöd — med samma form i en upptrend heter ljuset i stället
  *hanging man*, en svaghetsvarning som kräver bekräftelse.
- **Engulfer** — dag två:s kropp omsluter helt dag ett:s kropp (det är
  kropparna, inte skuggorna, som ska slukas). Ett maktskifte på en
  session: motpartens arbete raderas. Förstärkare är volym på dag två,
  en nivå i närheten och att flera kroppar slukas.

Alla tre lyder under samma lag: **formen berättar vad som hände, läget
avgör vad det betyder.** Läsningens ordning är alltid trenden bakåt
först, nivån sedan, formen sist.

## 3. Räkneexempel — Ericsson B, 23–28 oktober 2025

Verkliga dagar i svenska storbolagsaktien Ericsson B. Kontext: efter
toppen 93,84 den 15 oktober sjönk kursen i
en dryg veckas svacka ned till 87,98 den 24 oktober (−6,2 %). Fyra
handelsdagar ritas om till ljus:

| Dag | Öppna | Högst | Lägst | Stäng | Läsning |
|---|---|---|---|---|---|
| tor 23/10 | 90,60 | 90,84 | 89,00 | 89,76 | svart kropp 0,84, stängning i nedre delen |
| fre 24/10 | 89,56 | 89,74 | 87,98 | 89,22 | kropp 0,34, nedre skugga 1,24, övre 0,18 |
| mån 27/10 | 89,50 | 89,96 | 88,74 | 89,36 | kropp 0,14 på 1,22 i range |
| tis 28/10 | 89,00 | 92,40 | 88,64 | 91,56 | vit kropp 2,56, volym 12,7 M |

Genomläsning, akt för akt. **23/10:** svart ljus — och samtidigt högre
stängning än dagen före (89,76 mot 89,40). Färgen ljuger inte; den
jämför öppning och stängning *samma dag*. **24/10:** hammare. Kroppen
är liten och ligger i övre tredjedelen, den nedre skuggan är 1,24 kr —
3,6 × kroppen — och det nya svacklåget 87,98 avvisades innan stängning.
Kroppens färg (svart) försvagar inte formen; den visar bara att
återtaget inte räckte över öppningen. **27/10:** småkroppigt ljus, i
princip en doji (strikt doji kräver exakt lika öppning och stängning —
små kroppar läses samma väg). Volymen sjönk till 4,4 M mot omkring 7 M i
omgivningen: avtagande engagemang, marknaden ställer sin fråga. **28/10:
bullish engulfer.** Öppningen 89,00 låg under och stängningen 91,56
över — kroppen slukar därmed *båda* föregående dagars kroppar (89,22–89,56
och 89,36–89,50), en av Nisons förstärkare. Volymen 12,7 M ≈ 1,8 ×
snittet, och stängningen låg 78 % upp i dagens range. De följande
sessionerna steg kursen ytterligare (95,12 den 29/10) — historien visar
en klassisk treakt: avvisat anfall, obeslutsamhet, maktskifte. Exemplet
visar hur metoden läser bilden — inte vad någon bör göra (2007:528).

*Källa: Nasdaq Stockholm, dagliga OHLC och volymer för ERIC-B.ST,
oktober 2025, inhämtade via Yahoo Finance 2026-09-24.*

## 4. Fallgropar

- **Att handla varje ljus utan sammanhang.** En doji i sidledes marknad,
  en hammare utan föregående nedtrend eller stöd — formen finns men
  läget saknas, och då är det brus. Mönsterdefinitionen bor i positionen.
- **Ljus mot trenden.** Enstaka björniga ljus i en stark, färsk
  upptrend är oftast vilodagar; samma form vid ett gammalt motstånd
  efter månaders uppgång är en annan sak. Trenden bakåt läses först.
- **Fel jämförelse för färgen.** Den som läser vitt/svart mot gårdagens
  stängning blandar ihop candlestickens grammatik med stånggrafens —
  och talar därför om ljuset på fel språk.
- **Dimension och tidsram.** En engulfer där kropp två knappt syns, på
  en femminutersgraf, väger obetydligt; samma mönster på dagsgraf vid
  en nivå med volym är en annan historia. Och formen är ett läge, inte
  ett besked — bekräftelsen kommer med nästa ljus.

## 5. Koppling till ekosystemet

Candlesticken är Pris-dimensionens atom i AK1TS-ekosystemet, starkast
på Mikro- och Kort-horisonten där sessionens psykologi syns rent. 
Kursens ledstjärna — läge först, form sedan, bekräftelse sist — är samma
Brytpunkt-logik som bär F01:s våglära och F06 Murphys top-down-trappa:
här ger ljusen *timing* inom de ramarna. Räkneexemplens kultur — fyra
tal, mät skuggan mot kroppen, ett tydligt ja eller nej — är samma
genomräkningstradition som Fas 2:s trappsteg och F06:s volymkoll. I
AKM2-analyserna är den tekniska bilden ett vittne bland flera, och i
AI-Mentorn kan eleven rita om egna dagar och jämföra sin läsning med
modellens. Kursen övar det hela plattformen bygger på: att läsa en
graform som en berättelse om vem som kontrollerar marknaden.

*Utbildningsmaterial — beskriver hur metoden läser, mäter och
bekräftar; inga investeringsråd, inga avkastningslöften (2007:528).*
