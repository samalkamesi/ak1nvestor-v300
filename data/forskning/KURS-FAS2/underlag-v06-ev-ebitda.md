# V06 — EV/EBITDA (Värdering, 8 % vikt)

Underlag till Fas 2-fördjupningen · våg 197 · 2026-09-19
Kursreferens: slug `v06-ev-ebitda` · Modell: AKM1 V06

## 1. Vad indikatorn innebär i praktiken

EV/EBITDA svarar på frågan: **vad kostar hela företaget — inte bara aktierna —
i förhållande till den kassa verksamheten genererar före avskrivningar,
ränta och skatt?** Tre byggstenar:

- **EV (Enterprise Value) = börsvärde + räntebärande skulder − kassa.**
  Tänk att du köper hela bolaget: du betalar för alla aktier OCH tar över
  alla lån — men kassan i kassaskåpet får du behålla. EV är priset för
  hela maskinen, aktiekursen är bara priset för ratten.
- **EBITDA = rörelseresultat + avskrivningar.** Kassan verksamheten spyr
  ur före bokföringsmässiga kostnader. Därför kan man jämföra bolag med
  olika skuldnivåer (räntan är borta), olika skattesituationer (skatten
  är borta) och olika åldrar på maskinparken (avskrivningarna är borta).
- **Multipeln = EV ÷ EBITDA.** "Maskinen kostar X års kassaflöde."

Varför inte bara P/E? P/E straffar hårt belånade bolag (räntan äter
resultatet) och belönar skuldfria — EV/EBITDA jämför själva affären på
lika villkor. Det är därför köpare av hela bolag (och deras bankers)
pratar i EV/EBITDA.

## 2. Läsa det i en faktisk årsredovisning

1. **Börsvärde:** antal aktier (noten om eget kapital, sista sidan) ×
   aktiekurs (börsen, samma datum som resten av hämtningen).
2. **Räntebärande skulder:** balansräkningen — leta efter "Lånekostnads-
   förande/långfristiga skulder" + kortfristiga till banker. OBS: inte
   leverantörsskulder (de är verksamhet, inte finansiering).
3. **Kassa:** "Kassa och bank + kortfristiga placeringar" i omsättnings-
   tillgångarna.
4. **Rörelseresultat:** resultaträkningens rad före finansiella poster.
5. **Avskivningar:** kassaflödesanalysens rad "Avskrivningar" (den posten
   adderas tillbaka — därav "DA" i namnet).
6. Räkna: (1 + 2 − 3) ÷ (4 + 5).

## 3. Räkneexempel — genomräknat (pedagogiskt exempel, tydligt konstruerat)

Ett bolag med börsvärde 100 mdr, räntebärande skulder 20 mdr, kassa 5 mdr:

- **EV = 100 + 20 − 5 = 115 mdr**
- Rörelseresultat 12 mdr + avskrivningar 8 mdr = **EBITDA 20 mdr**
- **EV/EBITDA = 115 ÷ 20 = 5,75×** — bolaget kostar knappt sex års
  driftkassa.

Samma räkning på två verkliga strukturer ur universumet (komponenterna
ur respektive årsredovisning, multipliceln illustrativ): ett kraftigt
belånat bolag kan ha lägre P/E-rekommendation men HÖGRE EV/EBITDA än ett
skuldfritt — för att skulderna syns i EV men inte i aktiekursen. Det är
hela poängen: multipeln som inte kan luras av balansräkningsstrukturen.

**Värdefallehålet — modellens viktigaste lekktion här:** EV/EBITDA under
4× ser ut som ett kap. Men kurvan ger 5 poäng ENDAST om V19 (kvalitet på
kassaflödet/fonden) också är minst 3 — annars max 3 poäng. Ett bolag som
är "billigt" kan vara billigt av ett skäl: skrumpande affär, föråldrad
maskinpark (lågt EV för att ingen vill ha den), eller bransch i struktur-
nedgång. Billighet utan kvalitet är en fälla — modellen bygger in den
kontrollen.

## 4. Kritiskt tänkande — fällor

- **EBITDA är inte kassaflöde.** Den ignorerar att maskiner slits och
  måste ersättas. Ett kapitalintensivt bolag (stål, sjöfart) ser billigt
  ut i EV/EBITDA just för att avskrivningarna — den verkliga kostnaden —
  är borträknade. Jämför alltid med kapitalbehovet.
- **Negativ EBITDA ⇒ multipeln meningslös** (modellen ger 0 p) — en
  förlustverksamhet kan inte prissättas i "års kassa".
- **Skuldfällan i EV:** kontrollera alltid vad som räknas som räntebärande
  — leasing (IFRS 16) flyttar in stora poster i skulderna och kan förstöra
  jämförbarheten mellan år och bolag.
- **Dataskrap:** multipeln är känslig för fel i kassa/skuld-hämtningen —
  ett tecken fel i kassan flyttar hela värdet. Verifiera alltid komponent-
  ernas summa mot bolagets egen presentation av "netto skuldsättning".

## 5. Koppling till AKM1 — modellens trösklar

Ur kärnan (`poangEvEbitda`, R2 §6 konvex kurva):

| EV/EBITDA | Poäng |
|---|---|
| negativ EBITDA | 0 |
| > 20× | 1 |
| 14–20× | 2 |
| 10–14× | 3 |
| 6–10× | 4 |
| 4–6× | 5 |
| < 4× | 5 ENDAST om V19 ≥ 3 — annars max 3 (värdefallehålet) |

**Ärlighetslektionen — V06 är OSATT i kärnan idag:** datakontraktet
(P1) saknar fältet `evEbitda` (endast `evEbit` finns, se V28 Earnings
yield). Kärnan vägrar gissa: att lägga EV på EBIT i stället för EBITDA
skulle systematiskt övervärdera kapitalintensiva bolag — så indikatorn
lämnas osatt tills kontraktet utökas additivt. Kurvan ovan är imple-
menterad och aktiveras direkt då. Så bygger man en modell som inte ljuger
om sin data — en design som är värd att lära sig lika mycket som själva
multipeln.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
