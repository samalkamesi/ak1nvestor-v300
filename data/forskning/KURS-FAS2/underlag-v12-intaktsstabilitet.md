# V12 — Intäktsstabilitet (Stabilitet, 6 % vikt)

Underlag till Fas 2-fördjupningen · våg 198 · 2026-09-19
Kursreferens: slug `v12-intaktsstabilitet` · Modell: AKM1 V12

## 1. Vad indikatorn innebär i praktiken

Intäktsstabiliteten mäter **hur jämnt intäkterna ruller år från år** —
räknat som variationskoefficienten (CV): standardavvikelsen ÷ medelvärdet
för nettoomsättningen över åren. Låg CV är en förutsägbar affär: budgeten
håller, banken sover gott, utdelningen planeras. Hög CV är cykel,
projektberoende eller affär i omvandling.

CV är **skalfri** — samma mått fungerar för Truecallers drygt 2 mdr som
för Volvos drygt 500 mdr. Källraden i modellen: "5 års nettoomsättning i
årsredovisningen — hur jämn kurvan?" (universumet bär fyra bokförda år,
2022–2025 — beräkningen använder de år som finns).

## 2. Läsa det i en faktisk årsredovisning

1. **Nettoomsättningen per år:** resultaträkningens topp per bokfört år +
   jämförelseåret — femårsöversikten står ofta sist i årsredovisningen.
2. Räkna medelvärdet, sedan standardavvikelsen, sedan kvoten
   (kalkylblad: `=STDAV.P(...)/MEDEL(...)` — populationens standardavvikelse,
   samma sätt som modellen räknar; STDAV.S delar med n−1 och ger för hög CV).
3. **Segmentnoten** avgör VILKEN del av bolaget som svänger — koncernens
   total-CV kan vara låg medan ett segment dansar.
4. Kontrollera **jämförbarheten**: förvärv, avyttringar och
   räkenskapsårslutbyten böjer serien (se fällorna).
5. Kontrollfrågan: är kurvan jämn *och* pekar någonstans? CV ser inte
   riktning — en jämn nedåtlutande kurva får också låg CV.

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

CV egna beräkningar på `bolagsunivers.json`-serierna (hämtat 2026-09-03;
intäkter i mdr kr avrundat; poäng enligt kärnans trösklar, sektion 5):

| Bolag | Intäkter 2022–2025 | CV | AKM1-poäng |
|---|---|---|---|
| H&M | 224 / 236 / 234 / 228 | 2,2 % | 5 |
| Sinch | 28 / 29 / 29 / 27 | 2,5 % | 5 |
| Truecaller | 2 / 2 / 2 / 2 | 4,0 % | 5 |
| Nordea | 10 / 12 / 12 / 12 | 5,9 % | 4 |
| Volvo B | 473 / 552 / 527 / 479 | 6,5 % | 4 |
| Axfood | 73 / 81 / 84 / 89 | 6,9 % | 4 |
| Atlas Copco | 141 / 173 / 177 / 168 | 8,4 % | 4 |
| Handelsbanken | 50 / 62 / 62 / 57 | 8,6 % | 4 |
| Alfa Laval | 52 / 64 / 67 / 70 | 10,6 % | 3 |
| SSAB B | 129 / 119 / 103 / 96 | 11,5 % | 3 |
| AstraZeneca | 44 / 46 / 54 / 59 | 11,7 % | 3 |
| Kinnevik B | 0 / 1 / 0 / 0 | 167,7 % | 1 |

**Träningssekvens:** H&M och Sinch är platta kurvor (mode i volym,
meddelanden i volym). Volvo visar lastbilscykeln — 2023-toppen syns i
talet. SSAB är läran: **monotont nedåt** fyra år och ändå poäng 3 — CV
ser inte riktning, bara svängning. AstraZeneca är motsatsen: stegig
*uppgång* straffas lika hårt som stegig nedgång. Kinnevik är
förvaltningsbolagsfallet — "intäkten" är dotterbolagsflöden, och på små
absoluta tal exploderar CV.

## 4. Kritiskt tänkande — fällor

- **CV är blind för riktning:** en jämnt sjunkande affär får fin poäng.
  Läs alltid CV tillsammans med V01 Försäljningstillväxt.
- **Små absoluta tal ger extrem CV:** 0/1/0/0 är ingen volatilitet på
   riktigt — det är ett holdingbolags bokföring.
- **Förvärv böjer serien:** organisk 60 + köpt 40 ser ut som tillväxt-
  svängning. Noten om förvärv avgör.
- **Valuta:** utlandsintäkter i annan valuta svänger kurvan utan att
  affären gjort det — not om valutaeffekter.
- **Osatt-grenar:** saknas serier, eller är medelvärdet noll eller
  negativt, lämnar kärnan V12 osatt (CV är då meningslöst).
- **Koncern-CV döljer segmentdans:** alltid segmentnoten före slutsats.

## 5. Koppling till AKM1 — modellens trösklar

Ur kärnan (karna.ts, `scorV12` — dokumenterad rak tröskel på CV för
`serier.omsattning`):

| CV (omsättningen) | Poäng |
|---|---|
| ≤ 5 % | 5 |
| ≤ 10 % | 4 |
| ≤ 20 % | 3 |
| ≤ 35 % | 2 |
| > 35 % | 1 |
| inga serier / icke-positiv medel | osatt |

Motiveringstexten anger CV i procent och antal år — "Omsättningens
variationskoefficient X % över N år". Syskopplingen: V12 är
Stabilitetsparets andra halva mot V10 — V10 frågar hur finansieringen
bär en svacka, V12 hur sannolikt svackan är.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
