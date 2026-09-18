# V02 — ARR-tillväxt (Tillväxt, 8 % vikt)

Underlag till Fas 2-fördjupningen · våg 192 · 2026-09-18
Kursreferens: slug `v02-arr-tillvaxt` · Modell: AKM1 V02

## 1. Vad indikatorn innebär i praktiken

ARR (Annual Recurring Revenue) = den årliga intäkt som är **kontrakterad att
återkomma** — prenumerationer, licenser med löptid, plattformsavgifter. En
kunds månadsprenumeration på 1 000 kr är 12 000 kr ARR; ett engångsförsäljt
projekt på 50 000 kr är noll ARR.

Varför modellen bryr sig: **återkommande intäkter är mer förutsägbara än
engångsintäkter.** Ett bolag där 90 % av intäkterna har förnyats varje år i
fem år kan värderas (och planeras) på ett annat sätt än ett som måste vinna
varje krona på nytt varje kvartal. ARR-tillväxt mäter alltså inte bara
hur mycket som växer, utan **vilken sorts** tillväxt det är.

Viktigt ärlighetsmål: **vårt 189-bolagsuniversum redovisar inte ARR** —
det är ett nyckeltal bara prenumerationsliknande bolag rapporterar (SaaS,
plattformar, teleoperatörer). Universumets fält `omsattningTillvaxtTTM` är
vanlig intäktstillväxt. Det är itself en lärdom: **vilka bolag ens kan
poängsättas på V02, och vilka som faller tillbaka på V01.**

## 2. Läsa det i en faktisk årsredovisning

1. **Förvaltningsberättelsen** — sök "ARR", "återkommande intäkter",
   "recurring revenue", "prenumerationsintäkter". Svenska SaaS-bolag
   redovisar det ofta som nyckeltal med avstämning mot nettoomsättningen.
2. **Nyckeltalsavsnittet** sist i årsredovisningen (eller i presentations-
   materialet): bolagen avstämmar ARR → intäkter så du ser hur stor andel
   av omsättningen som är återkommande.
3. **Not om intäkters art** — vissa bolag delar "subskription" vs
   "professional services" redan i intäktsnoten; det är ARR:s syskonuppgift.
4. Finns inte ARR alls? Då poängsätts V02 försiktigt i modellen och V01 +
   intäktsstabilitet (V12) får bära tillväxtbilden — så hanterar AKM1
   ärligt saknad data i stället för att gissa.

## 3. Räkneexempel på riktiga bolag (ur universumets 189)

Universumet saknar ARR-fält (se ovan) — exemplen visar principen med
intäktsdata som FINNS, märkt vad som är ARR-kunskap och vad som är gissning:

- **Microsoft** (MSFT): omsättning 211 915 → 245 122 → 281 724 → 331 839
  MUSD (FY2023–2026), +17,7 % TTM. Större delen är prenumerations-
  strukturer (företagsavtal, moln) — men exakt ARR-del redovisar inte
  koncernen som ett tal. Övning: hittar du "commercial recurring revenue"
  i deras avstämningar? Det är startpunkten.
- **Kambi** (KAMBI.ST): plattformsintäkter per kundavtal — återkommande
  till sin natur, men kundkoncentrationen gör att "återkommande" inte
  betyder "säker" (se V03). Omsättningstillväxt TTM +13,5 %.
- **Sinch** (SINCH.ST): messaging-volymer är användningsbaserade —
  återkommande kundrelationer men INTE kontrakterad ARR i SaaS-meningen.
  TTM +3,8 %.

**Räkneövning när ARR väl finns i en rapport:** ARR-tillväxt = (ARR i år −
ARR förra året) ÷ ARR förra året. Net new ARR = förändringen i kronor —
possum-tillväxten (ARR är positiv räkning; engångsprojekt räknas aldrig in).

## 4. Kritiskt tänkande — fällor

- **Att annualisera fel.** ARR är redan årligt; multiplicera aldrig en
  månatlig siffra med 12 om den redan är annualiserad (och tvärtom).
- **Annual consulting = inte ARR.** Konsultintäkter som upprepas varje år är
  inte kontrakterade — förnyelseombud ≠ avtal.
- **Organisk vs förvärvad ARR.** En ARR som växer genom uppköp är inte
  samma kvalitet som en som växer i befintliga kunder (net expansion).
  Kvalitetsmåttet: net revenue retention — finns hos de bästa rapportörerna.
- **Valuta och prisindex.** Många bolag justerar ARR för valutor ("constant
  currency") — jämför alltid samma definition år mot år.
- **Baklog ≠ ARR.** Att ha tecknade avtal som inte gått live än (backlog/
  RPO) är framtida ARR, inte nuvarande — blanda inte terminologierna.
- **Sinch-fällan:** användarbaserade volymintäkter kan se återkommande ut
  men svänger med kundernas eget försäljningsläge — "recurring" i namnet,
  cyklisk i verkligheten.

## 5. Koppling till AKM1 — modellens trösklar

Källan är kvalitativ per konstruktion (Förvaltningsberättelsen/presentationen,
8 % vikt). Poängsättning sker på tillväxttakt och andel av intäkterna:

| ARR-bild | Poäng (riktlinje) |
|---|---|
| ARR växer ≥ 30 % och är huvuddelen av intäkterna | 5 |
| ARR växer 15–30 %, tydlig andel | 4 |
| ARR växer 5–15 % | 3 |
| ARR finns men står stilla / liten andel | 2 |
| ARR redovisas inte / obefintlig | 1 |

Universumexempel: Microsoft → 3–4 p-landskapet (tillväxt hög, ARR-del inte
offentlig som enskilt tal) · Kambi → 3 p (avtalsbaserat, koncentrerat) ·
Sinch → 2 p (användningsbaserat, ej kontrakterat). Dokumentera alltid vad
som står i källan — modellen belönar spårbarhet, inte gissningar.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
