# V01 — Försäljningstillväxt (Tillväxt, KRITISK vikt)

Underlag till Fas 2-fördjupningen · våg 192 · 2026-09-18
Kursreferens: slug `v01-forsaljningstillvaxt` · Modell: AKM1 V01

## 1. Vad indikatorn innebär i praktiken

Försäljningstillväxt mäter hur bolagets nettoomsättning rör sig mellan två
perioder — det mest grundläggande tecknet på om efterfrågan på det bolaget
säljer växer, står stilla eller krymper. Tre saker gör den kritisk i AKM1:

- **Intäkterna är föräldern till allt annat.** Vinst, utdelning och eget
  kapital är alla barn av intäktsraden — en tillväxt som stannar av trycker
  förr eller senare på alla andra nyckeltal.
- **Den avslöjar historien bokstavligt.** I resultaträkningen står årets och
  förra årets siffra bredvid varandra — ingen annan indikator är enklare att
  verifiera själv.
- **Men den säger inget om kvalitet.** Tillväxt kan köpas (förvärv), lånas
  (prissänkningar) eller bokföras (engångsintäkter). Därför kräver V01 alltid
  sällskap av marginaler (V07/V08) och diversifiering (V03) — det är så
  modellen tänker, inte så en enskild siffra avgör.

## 2. Läsa det i en faktisk årsredovisning

1. Öppna **koncernen**s resultaträkning (alltså inte moderbolagets — den
   publikation som heter "Årsredovisning" och börjar med Förvaltningsberättelsen).
2. första raden under rubriken: **"Nettoomsättning"**. Två kolumner — året och
   föregående år. Räkna: (året − förra) ÷ |förra| × 100 %.
3. Gå sedan till **noten till intäkterna** (ofta not 1–3, "Nettoomsättning"):
   där delas intäkterna upp på Sverige/outside Sweden och ibland produktgrupper.
4. Titta sist i **Förvaltningsberättelsen** på "väsentliga händelser" — såg du
   att tillväxten var ett förvärv? Där står det.
5. För 5-årskurvan: använd de fem senaste rapporternas intäktsrader (eller
   nyckeltalssidan sist i redovisningen).

## 3. Räkneexempel på riktiga bolag (ur universumets 189)

Nettoomsättning i Mkr, koncernen (källa: bolagsunivers.json, Yahoo/MarketStack,
hämtat 2026-09-03):

| Bolag | 2022 | 2023 | 2024 | 2025 | Årstillväxt 2025 |
|---|---|---|---|---|---|
| Alfa Laval | 52 135 | 63 598 | 66 954 | 69 674 | **+4,1 %** |
| Volvo B | 473 479 | 552 252 | 526 816 | 479 183 | **−9,0 %** |
| Sinch | 27 722 | 28 745 | 28 712 | 27 080 | **−5,7 %** |

**Träningssekvens:** kontrollera själv med kolumnerna — Alfa Laval 2023:
(63 598 − 52 135) ÷ 52 135 = +22,0 %; 2024: (66 954 − 63 598) ÷ 63 598 =
+5,3 %; 2025: +4,1 %. Kurvan planar ut — det är ett mönster, inte en siffra,
som är lärdomen. Volvo visar cykeln: +16,6 % (2023) → −4,6 % → −9,0 % —
lastbilsbranschens svängningar syns direkt i intäktsraden. Sinch visar
stagnationen: tre år kring 27–29 mdr.

**Skillnaden räkenskapsår vs senaste 12 mån (TTM):** modellen poängsätter
det rullande året. Apple hade räkenskapsåren −2,8/+2,0/+6,4 % men TTM
+16,4 % (återacceleration sent i perioden) — poängen blir olika beroende på
vilket fönster du mäter. AKM1 använder TTM när det finns, räkenskapsåret
annars — och dokumenterar vilket.

## 4. Kritiskt tänkande — fällor

- **Förvärvstillväxt ≠ organisk tillväxt.** Om ett bolag köper sig till 20 %
  tillväxt har ingen affär blivit bättre — noterna om "förvärv" i
  förvaltningsberättelsen avslöjar det. Fråga alltid: hur mycket växte de
  delar som fanns förra året också?
- **Pris eller volym?** +10 % kan vara 10 % fler sålda enheter (efterfrågan)
  eller 10 % högre priser (inflation/prismakt). Noterna om volymutveckling
  eller "pris/mix" skiljer dem åt — olika hållbarhet, samma siffra.
- **Valuta.** Svenska exportörers intäkter i USD/EUR svänger med kurserna;
  en "tillväxt" kan vara en sjunkande krona. Noten om valutafördelning visar
  exponeringen.
- **Cykeltoppar.** Volvos +16,6 % 2023 kom i toppen av en lastbilscykel —
  hög tillväxt är som sämst som köptillfälle-indikation när den är
  cykeldriven (utbildningsexempel på varför EN variabel aldrig räcker).
- **Engångsintäkter och IFRIC-tolkningar** kan blåsa upp en enstaka radsiffra;
  noten "övriga intäkter" är stället att kontrollera.

## 5. Koppling till AKM1 — modellens trösklar

Ur kalkylatorn (RAKNARE, V01): formel (året − förra) ÷ |förra| × 100 %,

| Tillväxt (TTM) | Poäng |
|---|---|
| ≥ 30 % | 5 |
| ≥ 20 % | 4 |
| ≥ 10 % | 3 |
| ≥ 0 % | 2 |
| < 0 % | 1 |

Exempel med universumets bolag: Volvo TTM −5,7 % → 1 p · Alfa Laval TTM
+7,7 % → 2 p · Atlas Copco TTM +9,1 % → 2 p · Sandvik TTM +23,7 % → 4 p ·
Kambi TTM +13,5 % → 3 p. Vikten är KRITISK — V01 bär tyngst i Tillväxt-kategorin
och modellen kräver därför källrad (resultaträkningen) för full poäng.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
