# KOMPLEMENT-KONTROLL s1u1 — logistikaktier-sa-analyserar-du-fraktbolag (B21)

**Granskare:** fabriksagent s1-u1, manifest `auto-s1-1789854906402` (granskningskön 1/3), session 2026-09-19 ~23:5x–00:2x lokal.
**Förhållande till huvudgranskningen:** s1-u3 (samma manifest, 3/3) levererade KONTROLL + diff 00:03 (fabrikskod 0, 575 s) — **MITT UNDER** min granskningsfas. KOMPLEMENT-presedensen (bilaktier/detailhandel/ehandels/lyx) tillämpas: u3:s samtliga filer lämnas HELT ifred; detta paket innehåller ENDAST fynd och verifieringar som huvudgranskningen saknar. Anspråk skrivet FÖRSTA handlingen (`data/vakten/auto-s1-1789854906402-s1-u1-ansprak.md`, pivot från uppdragets redan levererade "m9-utkast #1" — femte dokumenterade fallet; FIFO-val logistik som äldsta ogranskade rotutkast).

**Min oberoende bakgrund:** full separat granskning FÖRE kollisionsupptäckten — egen sond `verktyg/_s1u1-logistik-verify.mjs` (64 kontroller, 0 FEL efter 3 dokumenterade sondbuggar), egna webbkällor (DSV IR/GlobeNewswire/ShippingWatch/Loadstar, Maersk feb-2026-sammanställningar, K+N newsroom 3 mar 2026), egen registerverifiering. Bekräftande överlapp med u3: aritmetik 14/14, juridikgrind REN, 911 0-mönster, 14/14 länkar HTTP 200, DSV/Maersk/K+N-kärntalen — **u3:s dom FLYTTKLAR konfirmeras i grunden, med en rättning tillagd (K1)**.

---

## K1 — RÄTTNING huvudgranskningen saknar (B-klass: faktrriktning)

**Texten:** *"— medan integrationen är 30 procent klar och **slutdatumet flyttats fram till slutet av 2026**."*

**u3:s NOT-4** lämnade just "slutdatum slutet av 2026" bland de *"ej radnivåverifierade detaljerna"* — interior konsistens, ingen felindikation. **Radnivåverifieringen (denna granskning) ger felindikation — i riktningen:**

- **Ursprungsplanen:** DSV H1-2025-rapport (31 jul 2025): *"Annual synergies are expected in the level of DKK 9 billion **by end of 2028**, when the majority of the integration is expected to be complete."*
- **Läget vid årsrapporten:** DSV Annual Report 1164 (4 feb 2026) enligt [GlobeNewswire](https://www.globenewswire.com)/[The Loadstar](https://theloadstar.com): ~30 % integrerat 2025, integration nu väntas **slutförd slutet av 2026 — "ahead of the original schedule"** (Loadstar: *"expects to complete the process by the end of 2026"*).
- **Bekräftad bana:** [Q1-2026](https://investor.dsv.com) (29 apr 2026): *"on track for completion by the end of 2026"*; H1-2026 (22 jul 2026): >60 % klart.

**Felet:** på svenska betyder "flyttats fram" **senareläggning**. Verkligheten (och textens egen källa) är **tidigareläggning** — från 2028 till slutet av 2026. Texten hävdar alltså motsatt riktning, och snedvrider samtidigt budskapet: rapportens stora integrationnyhet VAR just förtidigandet. Samma fyndvalör som substansrabatt-B1 ("kvartalsvis→månadsvis", publikt belagt frekvens-/riktningsfel).

**Kur (söksträngen UNIK ×1 i filen, ersättningen frånvarande — maskinellt verifierad):**

> "slutdatumet flyttats fram till slutet av 2026" → **"slutdatumet tidiglagts till slutet av 2026"**

(Eller, ännu tydligare: "tidiglagts — från planerat 2028 — till slutet av 2026".) Dom med K1 verkställt: **FLYTTKLAR EFTER RÄTTNING** — ett byte i en mening; källdata, aritmetik och juridik opåverkade.

## K2 — Universumstatus huvudgranskningen inte täcker (notis, grön)

Byggtidens vintage (`be457289`, 165 poster) verifierad maskinellt: **0 logistikbolag** — byggarens LVMH-precedens var sann DÅ. **Dagens träd: 213 poster inkl. A.P. Møller-Mærsk A/S** (tillagd 2026-09-19, Yahoo Finance-källa, DKK-noterad, USD-serier). Paritetskompatibilitet text↔rad GRÖN i sonden: textens EBIT-serie (31/4/6,5/3 mdr USD) ≥ radens nettoresultat (29,2/3,8/6,1/2,7) alla fyra år; omsättning 82/54,0 mot 81,5/54,0 (Δ≤0,5). **Ingen omskrivning krävs** — men -en-spegeln och framtida omgranskningar bör veta att objektet NU har en universumrad (texten bär externa EBIT-tal, raden nettoresultat: olika mått, ingen paritetskonflikt).

## K3 — Registerverifiering av länkarna (stödjer u3:s länkdom)

u3 kontrollerade HTTP 200 ×14; denna granskning verifierade dessutom **registerfilerna**: 3/3 bloggmål LIVE i `data/blogg/` · 7 kursmål i `data/seo/kurser/` · **4 i `data/kurser-tillagg/`** (tx-01-organisk-mot-forvarvad-tillvaxt, ln-04-kapitalbindning-och-rorelsekapital, mt-03-vallgraven-i-siffror, se-16-sektoranalysens-metod) = 0 döda, 0 utkastlänkar. Notis till fabriksägaren: byggpromptens registerkoll bör nämna **båda** registren (en sond som letar bara i seo/kurser får falska 4 "saknade" — min egen sonds första körning, bugg ärligt rättad före dom).

## K4 — readingMinutes: seriens underskattningsklass (förslag, seriebeslut)

Tre mätmetoder: u3 sond 1 002 ord (textrensat) · denna sond 1 093 · byggarrapport 1 169 (råord) — alla >1 000. Filens `readingMinutes: 2` = round(x/600)-konventionen; **/200-konventionen (bilaktier-B2-precedensen, klassen har 10+ dömda fall: ehandel-K3, medie-C3 m.fl.) ger 5.** Förslag: **2 → 5**. Seriebeslut tillhör fabriksägaren (u3:s GRÖNT på 2 motorn respekteras som giltig mot de egna 1 002 — men klasspåståendet finns inte i u3:s rapport).

## K5 — Superlativklassen (förslag)

u3 sveper inte seriens superlativfelklass (≥10 fynd). Texten bär en obelagd superlativ: *"DSV är **branschens mest konsekventa förvärvare**"* — inte motbevisad (förvärvsserien Schenker/Agility/Panalpina/UTi/ABX bär påståendet väl) men inte heller belagd i textens källor; seriens kur-linje är partitiv form. Förslag: **"DSV är ett av branschens mest konsekventa förvärvare"** (söksträngen UNIK ×1). Partitivet *"Maersk, ett av världens största containerrederier"* är korrekt form och sakligt bevittnat (topp-2 med MSC) — GRÖNT.

## K6 — Källtrianguleringens avvikelse (kosmetisk notis)

K+N:s jämförelseår: u3 motor 1 652 MCHF (−24,82 %), denna gransknings källa (K+N newsroom/årsredovisning via sök) 1 654 MCHF (−24,91 %) — divergens 2 MCHF mellan läsningar av samma jämförelserad, inom avrundningsklassen; textens −24,9 % bärs av den ena läsningen och ligger i bådas spann. Ingen åtgärd.

## Sondens ärlighetspost

3 sondbuggar rättade FÖRE dom (enligt doktrinen): (1) investeringsråd-regex krävde 40 tecken efter ordet — disclaimern står sist; (2) kursregistret enkel sökväg — kurser-tillagg saknades; (3) universumsmatchning räknade Maersk-posten dubbelt (namn+ticker). Slutlig omkörning: **64 PASS · 0 VARN · 0 FEL** (inkl. paritet K2). Alla tre buggarna var sondens, inget utkastfynd förändrades av rättningarna.

## Dom

**FLYTTKLAR EFTER RÄTTNING (K1)** — kompletterar u3:s "FLYTTKLAR 0 ändringar" med ett maskinellt byte (B-klass riktning) + två förslag (K4 readingMinutes, K5 superlativ) + tre notiser (K2 universum, K3 register, K6 källtriangulering). Verkställs av paketets ägare (s3-spåret) eller nästa våg; -en-spegeln (09-17 03:28) speglas vid verkställning. Publicering förblir kundens beslut (R2).

**KVD:** endast nya filer (`data/blogg-utkast/granskning/*KOMPLEMENT-s1u1*` + `verktyg/_s1u1-logistik-verify.mjs`) + anspråks-epilog (gitignorerad väg) + worklog-rad; `src/` orörd = INGET bygge; `data/blogg/` orörd; utkast-JSON:en orörd; **u3:s samtliga filer orörda**; u2:s Kinnevik-yta orörd; commit med explicit pathspec.

**Källor (webb 2026-09-19):** [DSV Investor Relations — H1-2025, Q3-2025, årsrapport 1164, Q1-2026](https://investor.dsv.com) · [GlobeNewswire](https://www.globenewswire.com) · [The Loadstar](https://theloadstar.com) · [ShippingWatch](https://shippingwatch.com) · [Kuehne+Nagel Newsroom](https://newsroom.kuehne-nagel.com) · [FreshPlaza](https://www.freshplaza.com) · [Maersk Investor Relations](https://investor.maersk.com)
