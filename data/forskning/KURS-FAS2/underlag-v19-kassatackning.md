# V19 — Kassatäckning — nyemissionsrisk (Risk, KRITISK vikt)

Underlag till Fas 2-fördjupningen · våg 199 · 2026-09-19
Kursreferens: slug `v19-kapitalforbranning` · Modell: AKM1 V19

## 1. Vad indikatorn innebär i praktiken

Kassatäckningen mäter **hur många månader bolaget överlever på kassan
den har, om inget förändras**: kassa ÷ månadsförbrukning. Det är hela
indikatorns brutalitet — den ignorerar tillgångar, orderböcker och
löften och svarar på en enda fråga: *hur länge räcker pengarna?*

V19 är den **enda KRITISKA riskindikatorn** i AKM1, och den är den
enda med en **hård port**: sjunker kassatäckningen under tolv månader
kapas hela modellens kompositpoäng — se sektion 5. Varför så hårt?
Därför att nyemissionsrisken inte är en poäng bland andra: ett bolag
som måste emittera har inte en "svag egenskap", det har en klocka som
slår nedåt, och ägarna betalar notan genom utspädning.

## 2. Läsa det i en faktisk årsredovisning

1. **Balansräkningen:** Kassa och bank + kortfristiga placeringar.
2. **Kassaflödesanalysen:** "Kassaflöde från den löpande verksamheten"
   — den löpande förbrukningen (negativt löpande kassaflöde ÷ 12 =
   månadsförbrukning).
3. Räkna: kassa ÷ månadsförbrukning = antal månader. (Modellens fält:
   `stabilitet.kassaManaderBurnRate`.)
4. **Not om kredittillgångar:** outnyttjade kassakrediter förlänger
   täckningen — men krediten är andras pengar, räkna den separat.
5. Kontrollfråga: är förbrukningen **struktur** (lön, lokal,
   utveckling) eller **engång** ( juridisk process, omstrukturering)?
   Porten lyssnar på strukturen.

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

Fältet är ifyllt hos fyra bolag — de fyra läroboksexemplen (källa:
`bolagsunivers.json`, hämtat 2026-09-03; poäng enligt klippkurvan i
sektion 5):

| Bolag | Kassatäckning (mån) | AKM1-poäng | Bild |
|---|---|---|---|
| VPLAY B | 6,8 | 0 + hård port | under ett år — kompositen kapas |
| PSNY | 15,2 | 1 | drygt ett år |
| PCELL | 16 | 1 | drygt ett år |
| Kinnevik B | 813,5 | 4 | holding-art: säljer innehav, inte produkter |

**Träningssekvens:** VPLAY är portens barn — 6,8 månader betyder att
finansieringsfrågan inte är "om" utan "när och till vilket pris", och
modellen svarar genom att takera hela kompositen till högst 45/100
(§5-beslutet). PSNY/PCELL i 12–18-månaders bandet: klart ovan
porten men fortfarande beroende av kapitalmarknadens välvilja.
Kinnevik är tolkningsvarningen: 813 "månader" är vad som händer när
ett holdingbolags "förbrukning" är administrationsnivå medan kassan
bär realiserade avkastningar — siffran är sann och ändå meningslös som
överlevnadsmått. Läs alltid *vad* som brinner innan du tror på talet.

Övriga 191 bolag: fältet tomt — för lönsamma bolag är burn-rate
meningslöst (de tillför kassa varje månad), och kärnan använder då
sin **proxy**: positivt kassaflöde 5 av 5 år ⇒ 5 ("själfinansierande",
dokumenterat i kärnans motiveringstext).

## 4. Kritiskt tänkande — fällor

- **Ögonblicksbild:** brinntakten i dag säger inget om nästa beslut —
  ett bolag kan halvera burn på ett styrelsemöte.
- **Kassakredit är inte kassa:** den förlänger överlevnaden men
  tillför skuld — räkna den som separat rad, aldrig in i kvoten.
- **"Positivt kassaflöde runt hörnet":** löftet är värt noll i
  kassaräkningen — porten lyssnar på bokförda månader, inte på
  prognoser.
- **Holdingbolagsartikeln:** Kinnevik-fallet — mekaniskt mått på en
  icke-mekanisk verksamhet.
- **Porten är port:** under 12 månader hjälper inga andra starka
  egenskaper — moat, marginaler och tillväxt kapas med samma slag.

## 5. Koppling till AKM1 — modellens klippkurva + hård port

Ur kärnan (`scorV19`, R2 §6 klippkurva, BESLUT §4–§5):

| Kassatäckning | Poäng |
|---|---|
| positivt kassaflöde 5/5 år (proxy) | 5 |
| > 48 mån | 4 |
| 30–48 mån | 3 |
| 18–30 mån | 2 |
| 12–18 mån | 1 |
| **< 12 mån** | **0 — OCH hård port: AKM2-kompositen takas till 45/100** |

Motiveringstexten anger månader + kurva + källa. Porten är modellens
 enda absoluta stopp: alla andra indikatorer är 0–5 i samspel, V19
under tolv månader sätter taket för allas summa. Det är logiken i
modellform: överlevnaden är inte en egenskap bland andra — den är
förutsättningen för att de andra skall få räknas.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
