# RAPPORTAKADEMIN — laggrundade beslutsunderlag (R2, kunddelegerat 2026-09-21)

> Kundens stående direktiv 2026-09-21 (ordagrant): "jag vill att alla rättsliga
> beslut ska du ta beslutat på lagar på ett lagligt sätt" — juridiska beslut ska
> grundas i gällande rätt med lagrumsangivelse, inte i preferenser. Detta
> dokument ersätter R2-beslutsunderlag-2026-09-21.md:s A/B/C-val med LAGRUND.
> Formellt beslut fattas av styrelsens JURIDIK-organ.

## BESLUT 1 — GDPR: elevens prestationsprofil (lagringsbegränsning)

**Lagrum:** Dataskyddsförordningen (EU) 2016/679 art 5.1 e (lagringsbegränsning):
personuppgifter "får inte förvaras i en form som möjliggör identifiering av den
registrerade under en längre tid än vad som är nödvändigt för de ändamål för
vilka de behandlas" (IMY:s fulltext; privacy-regulation.eu art 5); jämte art 5.1 c
(dataminimering), art 13 (informationsplikt vid insamling), art 15+17 (utlämnande
och radering på begäran), art 25 (dataskydd genom systemutformning).

**Tillämpning:** Ändamålet med profilen är anpassad repetition INOM tjänsten.
När prenumerationen/förhållandet upphör upphör ändamålet — då är vidare lagring
inte "nödvändig", oavsett hur inlärningsvärdet skulle vara. Tidigare förslag
(12 månaders efterlagring) saknar stöd i art 5.1 e och ÖVERGES.

**SLUTSATS (maskinell konfiguration):**
1. Endast nödvändig data lagras: övnings-id, elevens tal/svarsalternativ,
   rätt/fel, tidsstämpel. Inga fritextfält som personuppgifter utöver detta.
2. Radering sker AUTOMATISKT när prenumerationen/förhållandet upphör
   (praktiskt: vid periodens slut; dokumenterad gallringsrutin enligt IMY/Digg
   vägledning om tidsfrister + gallring).
3. Art 13-information vid första övningen (ändamål, lagringstid, rättigheter).
4. Export och radering på begäran när som helst (art 15/17) — finns som
   medlem-funktion.
5. Dataskydd genom design (art 25): bedömningar nycklas till konto, inga
   publika loggar, Fas 2-grind skyddar åtkomsten.

## BESLUT 2 — Citat ur bolagens rapporter (citaträtten)

**Lagrum:** Upphovsrättslagen (SFS 1960:729) 22 §: "Var och en får citera ur
offentliggjorte verk i överensstämmelse med god sed och i den omfattning som
motiveras av ändamålet." Tre kumulativa krav (lagen.nu; Lawline; Berglöf 2016;
Johansson 2022): (1) verket offentliggjort, (2) god sed — bl.a. att källa och
upphovsman anges och att citatet har godtagbart samband med det egna innehållet,
(3) ändamålets motiverade omfattning — proportionalitet, INTE ett fast ordtal.
Fakta och nyckeltal är därtill inte upphovsrättsskyddat innehåll (skyddsobjektet
är verket med verkshöjd, ÄL 1 §).

**Tillämpning:** Ändamålet är pedagogik — visa var i rapporten ett tal/tvärdrag
finns. Det motiverar KORTA stycken ur aktuell sektion, aldrig återgivning av
verkets helhet eller väsentliga delar (undantaget: tal/fakta som inte är
skyddade). Ett fast ordtak i maskinen är en SÄKERHETSLINJE som håller sig väl
inom lagens proportionalitetstest.

**SLUTSATS (maskinell konfiguration):**
1. Extraherade nyckeltal och fakta ur rapporter: fria (inte skyddade).
2. Textcitat: endast i ändamålets omfattning; maskinellt tak 200 ord sammanhängande
   per sektion SOM TAK (aldrig nödvändigt att nå taket), alltid med källa +
   länk till bolagets original (god sed).
3. Hela PDF:er eller väsentliga delar av verket återges/aldrig hostas publikt
   (karantän-intaget, styrelsens tidigare beslut).
4. Nya citattyper (t.ex. bilder/diagram — se riksdagsmotion 2025/26:3665 om
   bildcitat) väntar eget juridikbeslut innan användning.

## STÅENDE PRINCIP — LAGGRUNDEN (förslag till beslut)

Alla framtida rättsliga beslut i organismen (arbetsstation + server) ska:
(a) ange tillämpligt lagrum i beslutet, (b) motivera tillämpningen mot lagens
kriterier, (c) registrera källan (lagtext/myndighetsvägledning), (d) bara
omfatta kundens R2-ytor efter kundens delegation eller uttryckliga svar.
Kundens direktiv 2026-09-21 är delegationen som gör detta operativt.
