# Granskning: Bankaktier — banker och finansbolag (dublett/komplementkandidat)

**Objekt:** `data/blogg-utkast/bankaktier-sa-analyserar-du-banker-och-finansbolag.json` (UTKAST v1, 2026-09-15, **ej registrerad** i GRANSKNINGSKO-SAMMANSTALLNING.md)
**Granskad av:** fabrik auto-s1-u2 (2026-09-15)
**Bedömning: EJ FLYTTKLAR I NULÄGET — 3 rättningar (C1a, C1b, C2, C3), därefter KOMPLEMENTKLAR.** Guiden har en unik vinkel som ingen annan text i utkastmappen täcker (investmentbolagsfällan + finansgruppens medianer) och förtjänar en plats i kön — men den bär ett bevisat medianfel och en universumsbeskrivning som motsäger sig själv.

## Bakgrund: en oregistrerad dublett

Filen skrevs samma dag (14:43) som den registrerade huvudguiden `sa-analyserar-du-bankaktier.json` (14:44) — troligen av två byggagenter med samma "välj själv"-uppdrag (känt fabriksfenomen). Huvudrapporten (se `sa-analyserar-du-bankaktier.md`) innehåller dublettdomen: **huvudguide + komplement är den rekommenderade lösningen** (H&M-KOMPLEMENT-mönstret), eftersom överlappningen är liten (P/E = P/B ÷ ROE bär båda) och fälgen skiljer: denna text äger investmentbolagsfällan (Investor, Latour, Öresund, Berkshire, substansvärde/rabatt), kostnads-intäktskvoten (CIR) och finansgruppens medianer — huvudguiden äger räntecykeln med äkta dataserie, 90-talskrisen och kapitaltäckningen. **Behålla eller träda = kundens beslut (R2).**

## Fynd C — rättningar (verkställningsbara)

**C1a/C1b — universumets resultat-CAGR är 2,2 procent, inte 1,4 (bevisat medianfel).**
Texten hävdar två gånger "universumets 1,4 procent (n=78)". Omräkning ur `bolagsunivers.json`: 78 bolag har `resultatCAGR5ar`; vid jämnt antal är medianen medel av de två mittersta — 1,40 % och 3,07 % ⇒ **2,2 %**. Byggagenten har tagit det nedre mittersta värdet (1,40) som median. Slutsatsen (finansgruppen 10,4 % > universumet) överlever rättningen, men talet är fel och förekommer på två ställen (mediansektionen + sammanfattningen).

**C2 — "100-bolagsuniversum (10 branscher × 10 bolag)" motsäger filens egen "elva bolag".**
Källfilen är **109 bolag** i tio branscher med 10–13 bolag per bransch (finans = 11 — samma stycke säger just "elva bolag"). Ingen syskonguide använder "10 × 10"-formuleringen, så den är inte serienormerad. Rättning: "AK1A:s universum (109 noterade bolag i tio branscher …)". Notera att "totaluniversumets 19,9 (n=100)" på P/E-raden förblir SANN — exakt 100 av 109 bolag har mätt P/E; med "109" i stycket bör det stå "(n=100 mätta)" för att inte hänga (förslag D1).

**C3 — `readingMinutes: 3` strider mot plattformskontraktet.**
1 276 ord (titel+ingress+body) ÷ 600 (ORD_PER_MINUT, `src/lib/blogg-utkast.ts`) = 2,1 → avrundat **2**. Exportvägen räknar om automatiskt — kosmetiskt men rättas enklast nu (samma fyndklass som fastighetsguidens C2).

## Fynd D — förslag (kräver beslut)

**D1 — "n=100" → "n=100 mätta"** på P/E-raden (se C2): förklarar varför medianen av 109 bolag räknas på 100.
**D2 — `publishedAt`** är skapandedatum; vid flytt stämplas publiceringsdagen (R2 — kundens klick).

## Not (ingen ändring)

**Nordeas landklassning.** Texten: finansgruppen har bolag "från Sverige, USA och Storbritannien" — sann mot källfilens `land`-fält (Nordea Bank Abp klassas "Sverige"). Juridiskt är bolaget dock finskregistrerat (Abp, Helsingfors). Ingen rättning — texten är trogen källan — men källans klassning är värd en not till dataägaren vid nästa universumsuppdatering.

## Juridik (lagen 2007:528): REN

- `verktyg/juridikgrind-vakt.mjs` körd 2026-09-15: **0 fynd på denna fil**.
- **Utbildningsramen genomgående**: "Som alltid här: utbildning i metod, aldrig råd om enskilda aktier" (ingress) + negerad disclaimer-sista-rad.
- **Exemplarisk märkning av påhittade tal**: "En förenklad, påhittad bank" och "Ett exempel med påhittade tal" — räkneexemplen kan inte förväxlas med marknadsdata.
- **Bolagsnämningar endast deskriptiva**: storbanker och investmentbolag förekommer som universumsurdrag med källdatum; substansrabatt­avsnittet slutar med "en annan analys än bankens" — metodelärande, inte uppmaning. JPMorgan/Goldman nämns enbart som ROE-intervall ur data.
- Medianblocket avslutas "metodinformation, inte rangordning" — precis rätt härdning.

## 911-referenser

Mekanisk sökning efter "911" i body + metadata: **0 träffar.** Inget att åtgärda.

## Sifferkontroll — tolv kontroller, elva GRÖNA + C1

| Påstående i texten | Kontroll | Dom |
|---|---|---|
| Räkneexempel: 1 000 mdr × 4,0 % = 40 mdr | 40,0 | ✓ |
| Räkneexempel: 700 mdr × 1,5 % = 10,5 mdr | 10,5 | ✓ |
| Räktenetto 40 − 10,5 = 29,5 mdr | 29,5 (även i sammanfattningen) | ✓ |
| CIR 18 ÷ 40 = 45 % | 45,0 % | ✓ |
| P/E-exempel 1,2 ÷ 0,15 = 8 | 8,0 | ✓ |
| P/E-exempel 0,8 ÷ 0,10 = 8 | 8,0 | ✓ |
| Finans P/E-median 13,8 (kvartiler 12,5–15,4, n=11) | 13,79 · 12,5–15,4 · n=11 | ✓ exakt |
| Finans P/E-spridning "4,8 till 20,5" | 4,8–20,5 | ✓ |
| Totaluniversumets P/E 19,9 (n=100) | 19,92 · n=100 mätta | ✓ |
| Finans resultat-CAGR 10,4 % (4,8–13,7, n=5) | 10,4 · 4,8–13,7 · n=5 | ✓ exakt |
| Universumets resultat-CAGR "1,4 procent" | median = 2,2 % (nedre mittersta 1,40 togs som median) | ✗ fynd C1a/C1b |
| JPMorgan + Goldman ROE 16,9–17,8 % | 0,169 · 0,1779 | ✓ |

## Länkar och struktur

- **12 unika interna länkar, samtliga HTTP 200** mot `http://localhost:3000` (2026-09-15): kurserna km-040, km-054, km-056, km-057, mk-04, pc-03, rk-08, se-06, st-01 och bloggposterna balansräkningen-15-min, P/B-talet, ROE, komplett-guide.
- Struktur i övrigt grönt: sex "##"-rubriker + negerad disclaimer sist; `readingMinutes` är enda kontraktsavvikelsen (C3).

## Nästa steg

1. Ägaren (eller nästa våg) verkställer C1a, C1b, C2, C3 exakt ur diff-filen och beslutar D1–D2.
2. **Kundbeslut (R2):** publicera som KOMPLEMENT till huvudguiden (rekommendation — unik vinkel), eller träda om en bankguide räcker. Vid behåll: sammanställningsägaren ger filen sin rad i GRANSKNINGSKO-SAMMANSTALLNING.md.
