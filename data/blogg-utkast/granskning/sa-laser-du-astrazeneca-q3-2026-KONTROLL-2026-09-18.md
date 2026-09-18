# KONTROLL sa-laser-du-astrazeneca-q3-2026 — 2026-09-18

**Granskare:** agentfabrik s1-u3 (manifest auto-s1-1789694729881, 3/3). **Objekt:** mx2 #1 — AstraZeneca-kvartalsläspaketet `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-astrazeneca-q3-2026.json` (byggcommit `09ebc188`, 2026-09-15 23:5x, "mega mx2 — 3 nya kvartalsläspaket"). **Anspråk före arbetet:** `data/vakten/auto-s1-1789694729881-u3-ansprak.md`. Utkast-JSON:en orörd — granskaren skriver aldrig i andras filer.

**Val-logik:** uppdragsrubrikens "m9-utkast #3" är auto-platshållare — hela gamla m9-ko 6/6 bär KONTROLL-2026-09-16, våg 171-tillskotten #1–#3 granskade 09-17, mx1 #2 finans klart 09-17 21:47 med s1-u1:s utrop "hälsa #4 + konsument #5 fria åt syskonen" (u1/u2 = deras naturliga förstaval). Köregeln gav nästa icke levererade: mx2-seriens tre paket (AZN/EVO/PREC — samtliga utan oberoende granskningspaket, 0 träffar i granskning/). Jag tog #1 AZN i commit-ordning; EVO #2 och PREC #3 lämnas fria.

**Sond:** `verktyg/_s1u3-azn-kontroll.mjs` (läser endast, skriver inget) — **114 kontroller gröna, 0 röda**. Källorna LÅSTA till byggversionen `git show 09ebc188:data/portfolj-system/bolagsunivers.json` (115 bolag — inte dagens 165; B13-glidningen noteras som i finanspaketet).

## 1. Källor — fyra ben, alla slutna

1. **Bolagsuniversumet @09ebc188 (115 bolag):** AZN.ST-radens samtliga 19 nyckeltal exakta mot utkastets visningstal (pris 1584 · mcap 2 456,619 → "cirka 2 457" · P/E 24,638 · P/B 48,848 · EV/EBIT 170,035 · PEG 1,26 · fcfYield 0,2 % · ROE 21,97 · ROIC 17,42 · brutto 81,69 · EBIT 23,46 · netto 17,02 · FCF-marginal 7,99 · skuld/EK 0,6422 · omsCAGR 9,82 · resCAGR 45,96 · TTM 6,4 · prognos 8,99 · insiderköp 0). Yahoo-insamling 2026-09-03 ✓; MarketStack "ingen färsk data" ✓ — utkastets källnotis "saknade färsk data och kunde inte dubbelkolla" är sann och viktig (seriens enda källa det vill sävet redovisa).
2. **Medianerna EGNA omräknade** ur 115-filen med mittersta-värdet (n=11 udda): ROE 18,53→18,5 ✓ · ROIC 19,04→19,0 ✓ · brutto 68,71→68,7 ✓ · EBIT 23,46→23,5 ✓ · netto 17,46→17,5 ✓ · FCF 11,44→11,4 ✓ · TTM 5,20→5,2 ✓ · prognos 8,77→8,8 ✓ · P/E 24,728→24,7 ✓ · universum-P/E 20,249→20,2 på exakt n=106 ✓. Nio medianer + n-redovisning: ALLA EXAKTA.
3. **Motordata** `data/analyses/AZN.ST.json` (verifierad 2026-08-24): fem vågklasser ✓ (impulsvåg/korrigering/basbygge/impulsvåg/impulsvåg) · 25-cellmatrisen 9 bullish/4 bearish/12 neutrala ✓ (omräknad cell för cell) · volatilitet 26,7 %→"27 procent" ✓ · nivåerna 1 226,00/1 493,21/1 656,83/1 658,29/1 721,38/1 925,50 ✓ — sex tal, sex träffar.
4. **Domprotokollet** `vagvalidering-SENASTE` (2026-09-04): AZN-raden ordagrant — mikro basbygge miss −7,6 ✓ · kort basbygge träff +2,9 ✓ · medellång miss +35,8 ✓ · lång osatt ✓ · mega miss +35,8 ✓ — och universumtotalen 52 % på 48 dömda ✓. **Kalendern** `kalender-halso.json`: "2026-11 enligt bolagets eventssida; kalenderkällor … 2026-10-30, ej bolagsbekräftat" ✓ — utkastets dubbelkällade fönster med korrekt reservation.

**Storlekspåståendena** (inget syskonpaket kontrollerat dem förut): AZN = tyngst Stockholm-noterade i universumet ✓ (2 457 mot ABB 1 663 — SEK-valuta); "Nvidia och Microsoft större … handlas inte i kronor" ✓ (NVDA 5 419 mdr USD, MSFT 3 689; även AAPL/GOOGL — utkastets exempelform är sann, inte exhaustiv); "samtliga elva bolag i biblioteket" ✓ (data/analyses = 11 filer); "det enda av de tre i vågvalideringens tolvbolagsuniversum" ✓ (AZN.ST enda av AZN/EVO/PREC i domprotokollet).

## 2. Siffror — datavakt, scenarioruta, CAGR (24 aritmetikkontroller, alla gröna)

- **Datavakten:** P/B ÷ ROE = 48,848 ÷ 0,2197 = 222,3 ≈ "222, inte det rapporterade P/E 24,6" ✓ — underkännandet korrekt utfört; implicit EPS 1 584 ÷ 24,6 = 64,4 ≈ "cirka 64 kronor" ✓. Valutablandnings-pedagogiken (brittiskt bolag, dollar-redovisning, kron-kurs) följer ABB-paketets presedens och är paketets starkaste bidrag till seriens källkritikspår.
- **Scenariorutan:** alla nio celler ✓ (57,0/58,7/60,5 × 22,5/23,5/24,5 %); basrader −3 % = 56,94→57,0 ✓ och +3 % = 60,46→60,5 ✓; **1 pp marginal ≈ 0,59 mdr ✓ mot 3 % omsättning ≈ 0,41 mdr ✓ (EBIT-effekten 1,761 × 0,235 = 0,414) — marginalen ≈ 1,4× tyngre ✓, Essity-formeln 1 ÷ (3 × 0,235) = 1,42 ✓** (fickan: banker/Wallenstam 0,5–0,6 < nätingar ~1,35 < AZN 1,42 — korrekt redovisad som marginalruttens mitt-läge).
- **CAGR-kontrollerna:** omsättning (58,739/44,351)^(1/3) = +9,82 %/år ✓; resultat (10,225/3,288)^(1/3) = +45,96 → "46,0" ✓; "+32 procent" totalt = 32,4 ✓; 2024-steget +18,0 ✓; "mer än tredubblades" = 3,11× ✓; multiplövning 24,6 ÷ 1,09 = 22,57 → "22,6" ✓ — och noteringen att utfallet hamnar under medianen 24,7 är aritmetiskt korrekt (22,6 < 24,7).
- **Ärlighetsraden faktiskt sann:** serierna för eget kapital och fritt kassaflöde är tomma i källan ✓; fyra år 2022–2025 ✓ (femte saknas — utkastet deklarerar); räntetäckning null = "osatt" ✓.

## 3. Juridik (2007:528) — REN

Varumärkesgrinden (kontrolleraText-replik, `data/varumarke.json` 26 regexer på title + desc + varje kroppsrad): **0 FEL, 0 VARNING**. Rådordsträffar: 3 — "rekommendation", "köp", "sälj" — samtliga i ingressens negering "Det är inte en rekommendation att köpa, sälja eller behålla" = nekningskontext (B8-precedensen). **Lagrum: exakt ett — 2007:528 med 2 kap 5 § — i disclaimerns sista rad**, korrekt utbildningsundantag; inga andra lagrum i texten ⇒ blandningsrisk noll. Disclaimern sist i bodyn ✓ med negerat investeringsråd ✓. Scenarieövningsformuleringarna ("aldrig en handssignal", "räkneövning … inte en prognos") håller utbildningsramen hela vägen. Genomläsning: inga direkta adresser till läsarens portföljbeslut.

## 4. 911-referenser

**0 träffar på 6 mönster** (911 · 9/11 · 11 september · september 11 · nine-eleven · 9-1-1) i title + desc + hel body — seriestandarden håller.

## 5. Länkar

**14/14 unika interna länkar HTTP 200 mot localhost** (12 × /dataset/halso/* inkl. universumjamforelse, /bolag/azn-st, /kurser). 0 länkar till outgivna utkast (blogg-utkast-fria) ✓.

## 6. Struktur

9 fält ✓ · slug-format ✓ · pillar "Institutionell metodik" giltig ✓ · author ✓ · 8 H2 ✓ · 0 mjuka bindestreck ✓ · 1 753 ord (kvartalsfamiljens span ~1 200–3 300) · title 94 tkn och desc 369 tkn — **båda inom kvartalsfamiljens egen praxis** (titlar 77–314, desc 204–1 057; u2:s 55-posters publicerad-blogg-mätning gäller andra familjer och avdöms här enligt familjepraxis) — inga fynd.

## 7. Fynd — fyra, samtliga C-nivå (inga blockande)

| ID | Typ | Fynd | Åtgärd |
|---|---|---|---|
| C1 | förslag | PEG-raden (1,26) saknar konventionsnot — konventionen P/E ÷ prognostillväxt ger 24,6 ÷ 9,0 ≈ 2,7 (kvot 0,46). PEG är seriens dokumenterat instabila fält (kvotspridning 0,18–8,0; Volvo Group-paketets fullträff visade att fältet följer källvindan); samtliga senare syskonpaket redovisar testet | Tilläggsnot på PEG-raden (se diff-posten) |
| C2 | byt | "— exakt mitt i" efter 52-veckorspositionen: källans pos52 = 0,503 = 50,3 %, inte exakt 50 | "exakt" → "i princip" |
| C3 | byt | readingMinutes 7 vid 1 753 ord: närmaste syskon med i princip identisk längd har 4 (JNJ 1 859→4, Novo 1 867→4, SAP 1 881→4, AT&T 1 698→4); rm 7 delas bara av mx2-syskonet EVO = byggarens avvikelse | 7 → 4 |
| C4 | förslag | publishedAt 2026-10-27 är framtidsdatum i utkast-fältet | Faktisk publiceringsdag vid flytt (R2) |

## 8. Dom

**FLYTTKLAR EFTER TVÅ RÄTTNINGAR (C2+C3) + TVÅ FÖRSLAG (C1+C4)** — innehållet grönt hela vägen: 114/114 maskinella kontroller, 0 röda fynd, källkedjan sluten mot byggversionen på alla fyra ben, juridiken ren enligt 2007:528, 911 = 0/6, länkarna 14/14 levande. Publicering = kundens beslut (R2). Diff-paket: `sa-laser-du-astrazeneca-q3-2026-diff.json` (4 poster, strängarna maskinverifierade unika = 1 träff vardera i filen).

## 9. KVD

Endast data/ + verktyg/ + worklog berörs = **INGET bygge**; src/ orörd (tsc-basen orörd av konstruktion, pre-commit-grinden verifierar); R2 orörd (data/blogg/ orörd, inga priser); utkast-JSON:en orörd; syskonens ytor orörda (EVO/PREC lämnas fria).
