# V04 — P/S, pris/omsättning (Värdering, 8 % vikt)

Underlag till Fas 2-fördjupningen · våg 192 · 2026-09-18
Kursreferens: slug `v04-ps` · Modell: AKM1 V04

## 1. Vad indikatorn innebär i praktiken

P/S svarar på: **hur många kronor betalar marknaden per krona intäkt?**
Börsvärde ÷ nettoomsättning (senaste 12 mån). P/S är värderingsfamiljens
robustaste medlem när vinsten sviker — bolag i vändning, kris eller
tung avskrivning kan ha negativ eller meningslös P/E men alltid en P/S.

Men P/S har en inbyggd fälla som gör utbildningen viktig: **en intäktskrona
är inte värd lika mycket i alla branscher.** Hos ett mjukvarubolag kan 80–90
öra av intäktskronan bli bruttovinst; hos en distributör blir det 5–15 öre.
Samma P/S är alltså radikalt olika "dyr" beroende på marginalstruktur —
modellen hanterar det genom att V04 alltid läses tillsammans med V07/V08.

## 2. Läsa det i en faktisk årsredovisning

1. **Börsvärde**: aktiekurs × antal aktier efter rapportdagen (aktieägares
   not i årsredovisningen visar antalet; kursen utanför rapporten).
2. **Nettoomsättning**: koncernresultaträkningens första rad — rullande
   tolv månader om kvartalsdata finns (senaste fyra kvartalens summa),
   annars senaste räkenskapsåret (dokumentera vilket).
3. Dividera. Kontrollera gärna mot universumets fält (`vardering` saknar
   P/S — men `marknadsKapitalMdr` och `serier.omsattning` räcker för egen
   uträkning — det är övningen nedan).
4. Jämför inom bransch: universumets branschmedianer (teknik, industri
   m.fl.) ger referensramen — P/S utan bransch jämförs mot ingenting.

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

Egen uträkning ur bolagsunivers.json (börsvärde ÷ senaste årets
nettoomsättning, hämtat 2026-09-03):

| Bolag | Börsvärde (Mkr) | Omsättning (Mkr) | P/S | EBIT-marginal |
|---|---|---|---|---|
| Sinch | 31 757 | 27 080 | **1,17** | 2,5 % |
| Alfa Laval | 231 545 | 69 674 | **3,32** | 16,2 % |
| Atlas Copco | 984 018 | 168 343 | **5,85** | 20,6 % |
| Microsoft | 3 689 160 (MUSD) | 331 839 | **11,12** | 45,1 % |

**Hela lektionen finns i tabellen:** Sinch är "billigast" på P/S — och har
sämst marginal (2,5 %); Microsoft är "dyrast" — och gör 45 öre EBIT per
intäktskrona. Multipeln speglar marginalstrukturen: marknaden betalar mer
per krona intäkt när fler öre blir vinst. Räkna själv med kolumnerna —
31 757 ÷ 27 080 = 1,17 och vidare nedåt i tabellen.

## 4. Kritiskt tänkande — fällor

- **Låg P/S på lågmarginalverksamhet är sällan en fyndkarta.**
  Distributörer/handelsbolag handlas strukturellt kring 0,1–0,5 — inte för
  att de är glömda utan för att intäktskronan bär så lite vinst.
- **Cykeltoppens spegel.** Vid konjunkturtopp är intäkterna rekordhöga och
  P/S ser låg ut precis när marginalerna står inför fall (lastbilar,
  byggmaterial, halvledarcyklar) — universumets Volvo-exempel (TTM-intäkter
  ned −5,7 % efter toppår) illustrerar fönstret.
- **Förvärvsuppblåsta nämnare.** Uppköpt omsättning gör nämnaren större utan
  att aktien blev billigare per organisk krona — kontrollera organisk
  tillväxt i förvaltningsberättelsen.
- **Engångsintäkter i nämnaren.** Sålda tillgångar/engångsprojekt sväller
  intäktsraden en gång — normalisera före jämförelse.
- **P/S ignorerar skulder.** Två bolag med P/S 2 där det ena är nettokassa
  och det andra högt belånat är inte samma affär — det är EV-måttens jobb
  (V06 EV/EBITDA tar det).

## 5. Koppling till AKM1 — modellens trösklar

Ur kalkylatorn (RAKNARE, V04): formel Börsvärde ÷ Nettoomsättning,

| P/S | Poäng |
|---|---|
| < 1 | 5 |
| < 2 | 4 |
| < 3 | 3 |
| < 5 | 2 |
| ≥ 5 | 1 |

Universumexempel med egna siffror: Sinch 1,17 → 4 p · Alfa Laval 3,32 →
2 p · Atlas Copco 5,85 → 1 p · Microsoft 11,12 → 1 p. OBS modellens
byggnad: låg multipel ger hög poäng MEN tolkas alltid mot marginalerna
(V07/V08) och tillväxten (V01) — ett 5 p i V04 med 1 p i V07 är ett mönster
att förstå (tradarens lågmarginalbolag), inte en gratis lunch. Så säger
metoden; vad du sedan gör är ditt beslut — vi ger utbildning, inte råd.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
