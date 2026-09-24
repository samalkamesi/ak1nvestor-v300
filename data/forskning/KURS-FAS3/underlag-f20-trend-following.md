# F20 — The Trend Following Bible: filosofin bakom många små förluster

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `the-trend-following-bible` · Fas 3 — trendföljning som förväntansvärde

## 1. Kärnan — trendföljningens filosofi

Trendföljning vilar på en inställning som känns fel för de flesta: **du
kan inte veta var en trend slutar — och du behöver inte veta det.**
Metoden förutsäger inte vändningar; den reagerar på dem. Kursen ställer
filosofin på tre ben. För det första: många små förluster. Varje utbrott
som inte leder någonstans stängs av stoppet, och de smärtsamma
posterna blir många — de är hyran för att få vara med från start på
varje trend som faktiskt löper. För det andra: få stora vinster. När en
trend väl tar fart låter trendföljaren vinsten växa; exitregeln — inte
känslan — avgör när resan slutar. För det tredje: asymmetrin. Förlusten
är i förväg begränsad av stoppet, vinsten lämnas öppen. Summan av det
är trendföljningens karaktär: **en förväntansvärdesmaskin, inte en
träfffrekvensmaskin.** Att ha fel ofta är inbyggt i konstruktionen —
felet är en kostnad, inte en skam. Traditionen löper från Dows diagram
till turtlarnas regelverk (F18) och vidare till dagens systematiker;
kursen använder den som rättesnöre för hur eleven ska tänka om sina
egna utfall, inte som mall att kopiera.

## 2. Praktisk läsning — beslutträdet med regler för allt

Ett trendföljarsystem är ett beslutträd där **varje gren har ett
skrivet svar** innan marknaden öppnar — inget lämnas åt stunden:

```
(1) Ingen position
    ├─ Trendfilter: kurs över 200-dagars medelvärde?
    │     Nej  → gör ingenting (avsaknad av signal ÄR ett beslut)
    │     Ja ↓
    ├─ Entryregel: utbrott över definierad nivå?
    │     Nej  → vänta
    │     Ja ↓
    └─ Öppna: positionsstorlek = riskbudget ÷ stoppavstånd
(2) Öppen position
    ├─ Stopp träffat?    → avsluta (förlusten var budgeterad)
    ├─ Exitregel: trenden död (t.ex. 10 dagars bottennivå)?
    │                      → avsluta (vinsten realiseras)
    └─ Ingetdera?        → gör ingenting — inga känsla-exits
```

Lägg märke till vad trädet **aldrig** frågar: "var tror du kursen
går?" Ingen nod innehåller en prognos. Detta är definitionen av
trendföljning i praktiken: kontrollen ligger inte i att veta framtiden
utan i att styra kostnaden för att inte veta den. Kursen låter eleven
följa trädet steg för steg genom en verklig kurva och markera vilken
gren som gällde varje dag — syftet är att göra "gör ingenting" lika
medvetet som köp och sälj (systemets fyra frågor, generaliserade ur
F18:s checklista).

## 3. Räkneexempel — förväntansvärde genomrättat

Genomgående övning, ren aritmetik på antaganden (ingen hämtad serie):
en strategi med **40 % träffare**, vinnare **+8 %**, stopp **−2 %**.
Räknat per 100 affärer: 40 × 8 = +320 procentenheter mot 60 × 2 =
−120. Netto **+200 procentenheter = +2,0 % i förväntansvärde per
affär** — en positiv kant, trots att sex av tio affärer är förlorare.
Sedan ändras en enda sak: **samma träffare, samma vinnare, men stopp
vid −6 %** (regeln flyttades ut "för att få luft" efter flera små
stoppningar — eller genomglappet släppte igenom mer än tänkt).

| | Vinnare | Förlorare | Förväntansvärde/affär |
|---|---|---|---|
| Stopp −2 % | 40 × 8 = +320 | 60 × 2 = −120 | **+2,0 %** |
| Stopp −6 % | 40 × 8 = +320 | 60 × 6 = −360 | **−0,4 %** |

Samma signaler, samma träffrekvens — enda skillnaden är var stoppet
satt, och kanten är borta. Över 20 affärer: ×1,02²⁰ ≈ **+49 %** mot
×0,996²⁰ ≈ **−8 %**. Brytgränsen vid −6 %-stopp är 8p = 6(1−p), alltså
p ≈ **43 %** träffare — en "harmlös" ökning som ändå kräver bättre
signalträff än systemet visat. Utläset: **kanten tillhör inte signalen
utan hela systemet** — entry, exit, stopp och storlek vägs tillsammans.
Genomgång av exemplet, inte en rekommendation (2007:528).

## 4. Fallgropar

- **Att vilja ha rätt oftare istället för att tjäna mer.** Träffprocent
  ger kick; trendföljning betalar för utfall, inte för att ha rätt.
  Den som väljer exit för att höja träffaren — ta vinsten tidigt, slipp
  se den rinna tillbaka — kapar vinnarna och byter en känsla av kontroll
  mot en sämre summa.
- **Drawdown-trötthet.** Sträckan av många små förluster medan trenden
  uteblir urholkar tålamodet; tröttheten föder exakt de ändringar (bredare stopp,
  hoppat över signaler) som sektion 3 visar kan vända kanten negativ —
  och de kommer oftast precis när reglerna ska få visa sig.
- **Att läsa exemplet som "smalt stopp är alltid bättre".** För snäva
  stopp ökar stoppfrekvensen och kan mala ner kanten genom vischan
  (whipsaw). Poängen är sambandet träffare × utfallsstorlek, inte en
  magisk stoppvolym.
- **Prognos-lustan.** Vändningsgissningar flyttar eleven från trädet till
  magkänsla — filosofin i sektion 1 finns just för att den frestelsen
  aldrig försvinner.

## 5. Koppling till ekosystemet

F20 är Fas 3:s nerv i den systematiska linjen: F18 gav systemets fyra
frågor, F19 turtlarnas vidare historia, här finns filosofin och
räknenerven som förklarar **varför** reglerna ser ut som de gör. I
plattformens modell möts två skikt: det **fundamentala filtret**
(AKM2:s dimensioner — lönsamhet, värdering, kvalitet) avgör vad som är
värt att äga; den **tekniska entryn** (trendfilter, utbrott, stopp)
avgör när och hur exponeringen tas och lämnas. Kursen tränar eleven att skilja svaren åt — fundament för urval, trend för timing. AI-Mentorn
kan förhöra på beslutträdets grenar; journalen (F14) mäter verklig
träffare och verklig utfallsstorlek att ställa mot planerat
förväntansvärde, och Fas 2:s procentkultur gör tabellen läsbar. Räkne-
och trädmaterialet levererar plattformens röda tråd: metod, genomskinlig
aritmetik — aldrig råd.

*Utbildningsmaterial — beskriver hur metoden fungerar med genomskinliga
räkneexempel; inga investeringsråd, inga avkastningslöften (2007:528).*
