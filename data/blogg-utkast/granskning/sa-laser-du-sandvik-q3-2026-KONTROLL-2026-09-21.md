# KONTROLL 2026-09-21 — sa-laser-du-sandvik-q3-2026 (oberoende granskningsrond, agentfabrik auto-s1-1789952123920 s1-u1)

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-sandvik-q3-2026.json` — Sandvik Q3 2026, kvartalsläspaket i 22/10-kullen (byggt 2026-09-15 15:21 av fabrik auto-s4).

**Granskningsproveniens:** agentfabrik-auto, spår 1 (granskare) 1/3. Uppdragsmallens "m9-utkast #1" är en auto-platshållare — m9-familjen är 6/6 granskad FLYTTKLAR sedan 2026-09-16/19 och samtliga JSON-utkast i blogg-utkast-roten har granskningsfiler (maskinellt verifierat: 0 SAKNAR). Köregeln (nästa icke levererade, FIFO bland ogranskade) ger **Sandvik = äldsta ogranskade objektet i kvartalsserien** (09-15 15:21; granskning/ saknar både `sa-laser-du-sandvik-*` och `kvartal-2026-q3-sandvik-*`; syskonen 15:15–15:17 SKF/Industrivärden och 15:21 Atlas Copco är kontrollerade sedan 09-19/20). Klaim `data/vakten/auto-s1-1789952123920-u1-ansprak.md` skriven FÖRE granskningen (epok-ms 1789952315902); inga färska s1-syskonanspråk på objektet.

**Bedömning: FLYTTKLAR EFTER RÄTTNING** — sond `verktyg/_s1u1-sandvik-kontroll.mjs`: **158 kontroller, 158 PASS / 0 STILLAS** (fyndens verkställbarhet är egenkontrollerad: samtliga 12 diff-strängar maskinellt verifierade UNIKA). Rättningsserien: [diff](./sa-laser-du-sandvik-q3-2026-diff.json) — 2 tvingande felrättningar (B1 statistikpåstående, B2 stavfel) + 10 driftposter (B4a–j, tele2/skf-precedensen). **Publicering förblir kundens beslut (R2).**

## Metod — vintage-disciplin och konventioner

Medianerna verifierades mot **byggtidens vintage** `0e399f13` (115 poster, varav 12 industri — committad 2026-09-15 20:31; diskens läge vid utkastets födelse 15:21, bevisat av att alla tolv medianvärden + båda n-utsagor reproduceras EXAKT av denna och endast denna postuppsättning) under **projektets kanoniska medianfunktion** (`src/lib/dataset-nyckeltal.ts:72`: jämnt antal → medel av de två mittersta) — samma discipl som SKF-ronden 09-20. Driftmätningen mot **dagens 237-postfil** (237 totalt, 20 industri) följer tele2/skf-precedensen ("dagens tal + as-of-datering" — sajten servar dagens fil). Övriga källor: `data/analyses/SAND.ST.json` (verifierad 2026-08-24), `data/rapporter/vagvalidering-SENASTE.{md,json}` (rond 2026-09-04), `kalender-{industri,konsument,finans,teknik,halso}.json` (2026-09-15), `data/analyses/` (medlemskapstest för urvalspåståendena), localhost:3000 (länkar + live-sitemap).

## 1. Källor och siffror — grönt hela vägen

- **Vågdata 16/16 EXAKTA** mot `SAND.ST.json`: fem horisontklasser (augustimätningen: mikro=impulsvåg, kort=basbygge, övriga tre impulsvåg), 25-cellersmatrisen **15▲/4▼/6—** (omräknad cell för cell), volatilitet **cirka 29 %** = `sigmaAr 0,2883`, 52v-position **87 %** (`pos52 0,868`), samtliga fyra datastyrda nivåer (168,10 / 353,06 / 374,23 / 413,10 — MA-värdena avrundade korrekt till två decimaler), spannet "mer än dubbelt" (413,10/168,10 = 2,46×), mättidpunkten 2026-08-24 korrekt åtskild från nyckeltalsinsamlingen 09-03.
- **Vågvalidering 9/9 ORDAGRANT** mot rond 2026-09-04: Sandvik-raden exakt — mikro basbygge träff (+1,3 %), kort impulsvåg träff (+38,4 %), medellång impulsvåg träff (+19,3 %), mega impulsvåg träff (+19,3 %), lång osatt ("osatta klasser döms aldrig"), tröskeln ±6 % = protokollets egen text, tolvbolagsuniversumet. **Felfritt-facit-påståendet är mängdlogiskt bevisat**: av rapportens 12 bolag har exakt två noll missar — SAND och ALFA — och texten säger just "ett av bara två … det andra är Alfa, som inte finns i biblioteket" (ALFA.ST saknas i `data/analyses/`; ABB.ST, EVO.ST och PREC-ST finns där men står utanför universumet — precis som texten hävdar).
- **Sandviks egna tal 27/27 EXAKTA** mot universumposten (`SAND.ST`, identisk vintage↔idag, `hamtat 2026-09-03`): kurs 383,70, mcap 481,308 ≈ "cirka 481 miljarder", ROE 17,9 / ROIC 17,7 / brutto 40,3 / EBIT 19,7 / netto 13,1 / FCF-marginal 11,2 / FCF-avkastning 3,0 / skuld-EK 0,43 / P/E 28,6 / P/B 4,8 (4,79 i kontrollräkningen = fältet 4,793) / EV/EBIT 19,8 / PEG 2,27 (källans eget fält), TTM +23,7 / prognos +12,3 / CAGR +2,4 och +4,6, helårsseriens tre tal 126,5/122,9/120,7, fyra (inte fem) redovisade år, räntetäckning null, noll insiderköp. **Ärlighetsraden är sann i varje led**: ROIC-proxyn formulerad exakt som källans egen notering, MarketStack-bristen ("saknade färsk kurs och kunde inte dubbelkolla") bekänd öppet, "universumet saknar kvartalsserier" stämmer mot filens struktur.
- **Aritmetik 17/17**: scenariorutans 9 celler omräknade (bas 120,7 × 0,197 = 23,78 ≈ 23,8; samtliga ±3 %/±1 pp-cellvärden med korrekt avrundning), 1 pp marginal ≈ 1,2 mdr, 3 % omsättning ≈ 0,7 mdr, kvoten ≈ 1,7× (1,207/0,713 = 1,69), hörncellspannet 21,9–25,7, kontrollräkningen P/E = P/B ÷ ROE → 4,79/0,179 = 26,76 ≈ 26,8 med den ärliga noten att det inte blir exakt 28,6, övning C: 28,6/1,123 = 25,47 ≈ 25,5, samt CAGR-omräkningarna (112,332→120,680 = +2,42 %/år; 12,854→14,690 = +4,55 %/år — källans fält 2,42/4,55 → textens 2,4/4,6 korrekt avrundat).
- **Kalender + urval 16/16**: rappdag 2026-10-22 = **torsdag** ✓ och exakt kalenderposten; 07:30/13:00, Q2 2026-07-17, bolagsstämma 2026-04-28 ordagrant ur notera-fältet; "kalenderposten nämner ingen utdelning" ✓ (notera saknar utdelning — kontrasten till Atlas Copco, där utdelning och rapport samma dag, är kalenderns egen uppgift); samtliga syskonrappdagar verifierade (H&M 24/9, Industrivärden 7/10 = INDU-C, Ericsson 15/10 = officiellt bekräftad 07:00, SKF 21/10, Atlas Copco 22/10 kl 12:00 = "lunchtid", ABB 20/10 = "två dagar tidigare", AstraZeneca "kalenderkällor anger 30 oktober utan att bolaget bekräftat" = kalender-halsos exiva formulering). **Urvalspåståendet är mängdlogiskt SANT**: biblioteket ∩ vågvalideringen = {ATCO, AZN, ERIC, SAND, SKF}; med syskonpaketen levererade är återstående universumbolag {AZN, SAND} och endast SAND har officiellt bekräftat datum ⇒ "det enda som både ingår … och har rappdagen officiellt bekräftad" håller strikt.

## 2. Medianer — vintage HELGRÖN (paketets främsta styrka), drift-serien B4

- **Tolv av tolv medianer EXAKTA mot byggtidens vintage 0e399f13 (115 bolag / 12 industri)**: P/E 28,0 / P/B 4,9 / EV/EBIT 20,7 / ROE 20,3 / EBIT 16,9 / netto 12,2 / skuld-EK 0,46 + universummedianerna 20,2 / 2,7 / 18,8 / 15,1 / 21,2 — dessutom med **korrekt n-utsaga i texten** ("115 bolag, varav 12 i industribranschen") och en inbyggd as-of-datering med förklaring av syskonens 109/11-läge. Detta är seriens renaste medianbottn: SKF-paketet hade tre övre-median-byggfel (B1a–c), Sandvik har **noll** — byggaren räknade rätt funktion på rätt fil.
- **B4 — drift 115→237 poster** (tele2/skf-precedensen: dagens tal + as-of-datering; industri n=12→20): åtta medianvärden, tre jämförelsetal i löptext, tabellrubrikens n och två dateringar uppdateras i diff-posterna B4a–j. **Alla fem huvudpåståenden överlever driften** (sond E15–E19, gröna): EBIT-marginalen över medianen (19,7 > 14,3), ROE under (17,9 < 20,3), lägre belåning (0,43 < 0,60), nettomarginal över (13,1 > 9,9), och "i princip medianbolaget" (28,6≈28,0 · 4,8≈4,9 · 19,8≈20,0 — alla inom 5 %).

## 3. Juridik (2007:528) — REN

Exakt **ett** lagrum i hela paketet: "lagen (2007:528) 2 kap 5 §" — rätt lagrum, rätt paragraf (utbildningsundantaget), i kursiv juridikfooter som är bodyns sista stycke. **0 främmande lagrum** (2022:260 / 2022:261 / 1985:716 / 2005:59 / 2022:482: noll träffar — ingen blandningsrisk). Rådordsgrinden: "rekommendation att köpa, sälja eller behålla" och "Inga köp-, sälj- eller hållningsrekommendationer förekommer" — endast negerade kontexter; "aldrig en handssignal", konsensus-tvåningen ("inte en sanning och inte vår prognos" / "inte en måttstock på rätt eller fel"), "observerade lägen i efterhand, inte nivåer kursen borde nå". Träffprocent-lektionen är paketets kärna och är skriven som metodedagogik: "ett felfritt facit är fortfarande bara ett kvitto på det förflutna". Utbildningsramen genomgående.

## 4. 911-referenser — REN (0/6)

"911", "11 september", "september 2001", "9/11", "terror", "terrordåd": **0 träffar** i title + description + body.

## 5. Länkar — 18/18 LEVANDE

Alla arton unika interna länkar HTTP 200 mot localhost:3000 (femton aspektsidor under /dataset/industri/, /kurser, /transparens, /kallor).

## 6. Struktur och format — kullnormen

Sju H2; title 80 tecken i kullens band (77–158); description 334 tecken i seriens band (291–1 057); rm 7 vid ~2 100 ord = exakt kullkonventionen (atlas-rondens referenstal "sandvik 2 120→7"); publishedAt 2026-10-19 = syskonkonventionen (SKF och Sandvik, samma rappdag 10-22, publicerade 10-19); 0 mjuka bindestreck, 0 dubbla mellanslag, 0 typografiska citattecken, 0 decimalpunkter i tal (decimalkomma konsekvent), tabellerna well-formed.

## Fynd som kräver rättning (diff-poster)

- **B1 VÄSENTLIGT — "föll tre år i rad" är falskt**: helårsserien är 126,5 (2023) → 122,9 (2024) → 120,7 (2025) = **två** fallande år; året innan (2022, 112,3) var stigande, så tre fall i rad är omöjligt i källmaterialen. Rättning: "föll **två** år i rad". (Sondens faktagrund L-B1 bevisar: 126,5 > 122,9 > 120,7 men 112,3 < 126,5.)
- **B2 STAVFEL**: "med senaste **mätte** värden" → "med senast **mätta** värden" (Nyckeltalen-intro).
- **B4a–j DRIFT** (10 poster, enligt precedensen): tabellens mediankolumn (universum-P/E 20,2→20,4; EV/EBIT 20,7→20,0 och 18,8→17,7; universum-ROE 15,1→14,8; EBIT-marginal 16,9→14,3 och 21,2→20,8), tabellrubrikens n (12→20 bolag), tre löptextsjäfror ("19,7 mot 16,9"→"19,7 mot 14,3"; "0,43 mot 0,46"→"0,43 mot 0,60"; "13,1 mot 12,2"→"13,1 mot 9,9"), notisradens och källradens datering+n (2026-09-15/115 → 2026-09-21/237). Sandviks EGNA tal (insamling 09-03) rörs INTE — endast medianjämförelser, n-utsagor och dateringar.

## Notiser (icke-tvingande, lämnas till paketets ägare)

- **N1**: "strax under dagens industrimedian (28,0)" i övning C — 25,5 ligger ~9 % under 28,0; "strax" är generöst men ej falskt (saknar definition; indikerar riktning).
- **N2**: syskonuppräkningen ("H&M, Industrivärden, Ericsson, SKF, Atlas Copco") utelämnar Volvo Car- och Nordea-paketen (båda byggda samma dag) — försvarbart: deras rappdagar (23/10 resp. 15/10 med paket byggt senare samma kväll) ligger utanför textens rappdagssekvens fram till 22/10, och meningen är sann som den står.
- **N3**: paketet använder raka citattecken (10 st) där vissa syskon (SKF) använde »« — serien hade blandade citatkonventioner vid byggtiden; ingen md-formatregel bryts.

## Dom

**FLYTTKLAR EFTER RÄTTNING.** Verkställ diff-posterna B1–B4j (12 byte, samtliga strängar maskinellt verifierade unika i bodyn 2026-09-21), kör `node verktyg/_s1u1-sandvik-kontroll.mjs` → 0 STILLAS förblir (sonden verifierar fyndens faktagrund och verkställbarhet; originalet ändras av paketets ägare, inte av granskaren). Källbottnen är den starkaste i kvartalsseriens tidiga kull hittills: 158 maskinella kontroller gröna, medianerna exakta redan på byggtidens vintage (noll byggfel — SKF:s kontroll hade tre), vågvalideringsdomarna ordagrant, felfritt-facit-påståendet mängdlogiskt bevisat, ärlighetsraden sann i varje null. Publicering = kundens beslut (R2); exportvägen stryker utkastmarkörer.

— agentfabrik s1-u1, 2026-09-21 · klaim FÖRE arbete · sonden läser ALDRIG (källorna), skriver ALDRIG · 0 R2-ytor rörda · utkast-JSON:en orörd
