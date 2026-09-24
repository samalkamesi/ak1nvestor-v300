# F06 — Murphy: teknisk analys som ett system

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `technical-analysis-financial-markets` · Fas 3 — helhetsläsningens grundkurs

## 1. Kärnan — trend, volym, open interest och tidsramar i ett system

John J. Murphys lärobok är Fas 3:s motsvarighet till Fas 2:s grundbok: inte
en lista på verktyg utan ett system där tre informationsflöden läses
tillsammans, i fast ordning.

- **Priset är det främsta vittnet.** Trenden — högre toppar och bottnar,
  eller lägre — är ryggraden. En trend antas bestå tills den är bevisligen
  bruten, och det är priset som avgör riktningen.
- **Volymen är engagemanget.** Den mäter hur många som faktiskt handlade
  och ska bekräfta prisbilden: en rörelse bärd av tung volym vilar på
  bredare deltagande än en på tunn.
- **Open interest är positionerna.** Antalet öppna kontrakt på termins- och
  optionsmarknaderna. Stigande open interest betyder nya pengar som kommer
  in; fallande att positioner stängs. Aktier har motsvarande mått inte —
  där sköter volymen bekräftelserolen ensam.

Murphy sammanfattar sambanden i fyra kombinationer (pris/volym/open
interest): pris upp med volym och open interest upp är en stark trend;
pris upp med båda ned är ett svagt rally (främst shorts som stänger); pris
ned med båda upp är starkt nedåttryck (nya blanka positioner); pris ned
med båda ned är ett avtagande fall (tvingad försäljning som ebbmar ut).

Ovanpå detta läggs **tidsramarna**. Samma marknad berättar olika saker i
månads-, vecko- och dagsgraf, och bilderna ska hålla ihop: huvudtrenden i
det långa fönstret sätter ramen för det korta.

Allt vilar på tre premisser: marknaden diskonterar allt som kan påverka
priset, priser rör sig i trender, historien upprepar sig. Därav kursens
mest återkommande sanning — teknisk analys är sannolikhetslära lärd av
historik, inte spådom.

## 2. Praktisk läsning — top-down: index → sektor → aktie

Arbetet börjar alltid i det största fönstret och smalnar av:

1. **Det breda indexet** (i svenska kursdelar: OMX Stockholm). En enda
   fråga: pekar huvudtrenden uppåt, nedåt eller sidledes?
2. **Sektorn.** Jämför branschindexet med huvudindexet. En sektor som
   starkare är en annan miljö att läsa grafer i än en som efterföljer.
3. **Aktien.** Först nu öppnas den enskilda grafen — och den läses mot sin
   sektor, aldrig i isolering.

Motivet är Murphys återkommande iakttagelse att en stor del av en enskild
akties rörelse förklaras av marknaden och sektorn den tillhör. Att börja
med aktien är att läsa sista kapitlet först. Tidsramarna läggs på samma
trappsteg: månadsgrafen ger huvudtrenden, veckografen mellantrenden,
dagsgrafen detaljerna — och varje steg upp är ungefär 4–5 gånger större
(fyra–fem veckor per månad, fem handelsdagar per vecka), så tre fönster
räcker långt.

## 3. Räkneexempel — volymbekräftelse av trendbrott (konstruerat exempel)

Ett svenskt mellanbolag — kalla det Bolaget — med stigande trend sedan ett
halvår och en stödnivå vid 84 kr som testats tre gånger. Snittvolymen
(senaste 20 dagarna) är 1,2 miljoner aktier. Alla siffror är konstruerade
för genomräkningen.

- **Brottsdagen.** Kursen stänger på 82,60 — det är (84 − 82,60) ÷ 84 =
  **1,7 % under stödet** — på volymen 3,0 miljoner aktier. Det ger
  3,0 ÷ 1,2 = **2,5× snittet**. Regeln kursen lär: ett nedbrott är
  bekräftat när stängningen sker *under* nivån *och* volymen är minst
  1,5–2× sitt snitt. Här: 2,5× ⇒ bekräftat brott.
- **Återtestet.** Tre dagar senare stiger kursen tillbaka mot 84, på i
  snitt 1,05 miljoner aktior per dag (0,9× snittet). Gamla stödet testas
  som nytt motstånd — på tunn volym. Bilden håller: motståndet bekräftas.
- **Kontrastfallet.** Samma graf, men brottsdagens volym är 1,3 miljoner
  (1,3 ÷ 1,2 ≈ 1,1×). Under tröskeln: obekräftat. I det konstruerade
  förloppet återtar kursen 84 inom en vecka — ett falskt brott som
  volymregeln höll borta.

Skillnaden mellan bekräftat brott och brus sitter alltså i en enda kolumn
i kurstabellen. Exemplet visar hur metoden skiljer dem åt — inte vad någon
bör göra med någon aktie (2007:528).

## 4. Fallgropar

- **Indikatorträngsel.** Murphy varnar för att fler verktyg inte ger mer
  kunskap: de flesta indikatorer är släkt (samma kursserie i olika
  kläder) och säger därför samma sak om och om igen. Hans eget råd är att
  hålla det enkelt — ett fåtal verktyg, förstådda på djupet.
- **Att glömma sannolikheten.** Ett "bekräftat" brott är ingen profetia
  utan ett läge där historiken gett odds. Historien upprepar sig — tills
  den inte gör det. Den som läser varje signal som ett svar i stället för
  en sannolikhet har missat kursens första premiss.
- **Volym utan referensram.** Tre miljoner aktier är högt för Bolaget och
  lågt för en storbank. Volym läses alltid mot aktiens eget snitt, aldrig
  som en absolut siffra.
- **Open interest på fel marknad.** Reglerna med open interest gäller
  derivat. Att föra över dem rakt på aktiemarknaden, där måttet saknas,
  ger skenbar precision.

## 5. Koppling till ekosystemet

Murphy-kursen är Fas 3:s systemkurs: den som knyter ihop de andra. Top-down-
trappan index → sektor → aktie är samma struktur som plattformens egna
analyser visar — bred marknad först, bransch sedan, bolag sist — och
tidsramshierarkin återkommer i F01:s våglära. Volymbekräftelsen är
räkneövningarnas mönster: en regel, ett tal, ett tydligt ja eller nej,
samma kultur som Fas 2:s trappsteg. I AKM2-analyserna loggas den tekniska
bedömningen som ett av flera vittnen, och i AI-Mentorn kan eleven jämföra
sin egen helhetsläsning med modellens. Kursen övar det plattformen gör:
att läsa många bilder som en.

*Utbildningsmaterial — beskriver hur metoden läser, väger och räknar; inga
investeringsråd, inga avkastningslöften (2007:528).*
