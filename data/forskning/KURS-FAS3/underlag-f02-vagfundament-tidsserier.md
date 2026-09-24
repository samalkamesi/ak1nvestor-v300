# F02 — Vågfundament: variablerna som tidsserier

Underlag till Fas 3-djupet · våg 164 · 2026-09-24
Kursreferens: slug `vagfundament-variablerna-som-tidsserier`

## 1. Kärnan — samma siffra, ny betydelse

I Fas 2 läste du varje fundamental variabel som en **nivå**: omsättningen
479 miljarder, brutomarginalen 24 procent. En nivå är ett foto. Läs samma
variabel som **tidsserie** — en punkt per räkenskapsår — och den blir en
film med två huvudroller: **trenden** (vart banan pekar i genomsnitt) och
**svängningen** (hur mycket enskilda år avviker från banan). Fotografiet
kan inte skilja dem åt; filmen måste.

Konkret: AB Volvos nettoomsättning var 552 mdr kr 2023 och 479 mdr kr
2025 — samma bolag, 13 procents skillnad, två helt olika berättelser om
"hur stort Volvo är". Först som serie syns att 2023 var en **cykeltopp**
och att talet 2025 är samma svängning på väg nedåt, inte ett nytt
bolag. Det är kursens fundament: en fundamental variabel **blir något
annat** som tidsserie. "Vad är marginalen?" byts mot "vilken bana har
marginalen, och var i svängningen togs mätningen?" Priset på börsen är
redan en tidsserie — först när fundamentet också blir en kan de två
jämföras punkt för punkt. Det är grunden Fas 3 står på.

## 2. Så gör du — från fem årsredovisningar till plottad serie

1. **Plocka serien.** Femårsöversikten står oftast sist i
   årsredovisningen; annars fem rapporter, samma post varje år
   (nettoomsättning, rörelseresultat — aldrig blandat).
2. **Homogenitet först.** Bryts serien av förvärv, avyttring eller
   räkenskapsårslutbyte? Läs noterna — en böjd serie ser ut som
   tillväxt eller svängning utan att affären ändrats.
3. **Normalisera.** Råa kronor bärs av inflation och volym — gör
   om till **skalfria mått** (marginal i procent, tillväxt i procent)
   när du jämför år. Strök valutaeffekter och engångsposter efter
   noter, inte efter minne.
4. **Plotta.** Punkter, år på x-axeln, y-axeln **från noll** (en
   trunkerad axel dramatiserar svängningen). Lägg en enkel medellinje
   — ögat hittar trend och amplitud på sekunder.

Kontrollfrågan efteråt: kan jag med en mening säga *vart banan pekar*
och *hur mycket åren svänger*? Då är serien läst, inte bara räknad.

## 3. Räkneexempel — Volvo B och Alfa Laval (rk 2022–2025)

Två svenska industrikoncerner, samma datakontrakt — och varsin
seriekaraktär. Marginal = nettoresultat ÷ nettoomsättning (egna
beräkningar; källor i noten nedan):

| | 2022 | 2023 | 2024 | 2025 | Bana |
|---|---|---|---|---|---|
| **Volvo B** omsättning, mdr kr | 473 | 552 | 527 | 479 | topp, sedan −13 % |
| **Volvo B** marginal | 6,9 % | 9,0 % | 9,6 % | 7,2 % | svänger 7–10 % |
| **Alfa Laval** omsättning, mdr kr | 52,1 | 63,6 | 67,0 | 69,7 | stigande vartenda år |
| **Alfa Laval** marginal | 8,6 % | 10,0 % | 11,0 % | 11,9 % | klättrar jämnt |

Läs som tidsserier: Volvos endpoint-tillväxt 2022→2025 är **+0,4 %/år**
men årsväxlingarna är +17, −5, −9 procent — svängningen drunknar
trenden, och marginalens fyraårsgenomsnitt **8,2 %** beskriver bolaget
bättre än något enskilt år (toppåret 9,6 % är just ett toppår). Alfa
Laval: **+10,2 %/år** i omsättning med avtagande men positiva årsväxlingar
(+22, +5, +4) och en marginal som stigit varje år — trend med lit
svängning. Siffrorna är utbildningsexempel på metoden, inte omdömen
om bolagen.

*Källor: bolagsunivers.json — Volvo B: StockAnalysis (underlag S&P
Global Market Intelligence), hämtat 2026-09-15; Alfa Laval: Yahoo
Finance, hämtat 2026-09-03. Källorna ger fyra bokförda år (2022–2025).*

## 4. Fallgropar

- **Att extrapolera.** Trenden är ett påstående om dåtid. Dra Volvos
  2023-linje vidare och du prognostiserar en topp i evighet. Serien
  beskriver banan hittills — vändpunkter syns först bakåt.
- **En tillrättalagd bas.** Endpoint-räknningen styrs av basåret:
  Volvos serie ger +0,4 %/år från 2022 — men 2022 var ett svagår, så
  "tillväxten" är en effekt av basen. Byt endpoint och samma bolag
  berättar det som en nedgång. Visa alltid hela serien, aldrig bara
  två valda punkter.
- **Valutaeffekter.** Båda koncernerna rapporterar i SEK med stora
  intäkter i EUR/USD — kurssvängningar böjer serien utan att en enda
  enhet sålts mer eller mindre. Årsredovisningens not om
  valutaeffekter (och ledningens valutajusterade tal) är rättesnöret.
- **Glömd normalisering**: råa kronor från fem olika år jämforda som
  vore inflationen noll — en dold trendkälla som inte är bolagets.

## 5. Bryggan Fas 2 → Fas 3

Fas 2:s fundamentala variabler (AKM1:V01–V20) är redan halva vägen hit:
V12 intäktsstabilitet ÄR ett tidseriemått (variationskoefficienten —
ren svängningsmätning), V07 bruttomarginal kräver 5-årssnitt för
topppoäng. Fas 3 generaliserar: varje V-variabels serie blir
underlaget till att förstå **prisets** banor — en marginal som svänger
med lastbilscykeln (Volvo) förklarar varför en aktie svänger, en
stadig klättring (Alfa Laval) varför den inte gör det. Härifrån tar
F03 Konfluens över: fundamental bana + teknisk struktur i samma bild.
Metod, inte råd — så bygger du analysförmåga steg för steg.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
