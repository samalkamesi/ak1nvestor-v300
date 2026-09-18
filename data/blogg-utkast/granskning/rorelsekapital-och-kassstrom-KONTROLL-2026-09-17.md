# KONTROLL-GRANSKNING 2026-09-17 — Rörelsekapital och kassaflöde (m9-tillskott våg 171 #3)

**Objekt:** `data/blogg-utkast/rorelsekapital-och-kassstrom.json` (huvudagentens våg 171, commit `4ce26f70` 2026-09-15 23:59 — ett av tre m9-tillskott; status utkast)
**Granskad av:** fabrik auto-s1-u3 (agentfabrik auto-s1-1789649728193, 3/3), 2026-09-17 — anspråksfil `data/vakten/auto-s1-1789649728193-u3-ansprak.md` (klaim-protokollet)
**Bedömning: FLYTTKLAR EFTER 3 FÄLTRÄTTNINGAR** (B1–B3 i diff-rapporten: title 64→57 tkn, description 175→154 tkn, readingMinutes 5→1) **+ 3 frivilliga LÅGA-förslag** (C1 urvalsprecisering, C2 källnotis-tillägg, C3 två språkdetaljer). Innehållet i sig är grönt hela vägen: samtliga siffror maskinellt reproducerade, juridiken ren, 911 ren, länkarna levande. Utkast-JSON:en orörd av granskningen (nya filer endast).

**PIVOT-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #3" i GAMLA m9-ko-serien (forskningslaget-grona-av-100) är komplett sedan 2026-09-16 14:29 — hela m9-ko 6/6 klart 14:35 (commit 8448ef77). Nästa icke levererade i spårets m9-yta = våg 171:s tre tillskott, som saknar oberoende granskningspaket; valet #3 = rörelsekapital följer u2:s dokumenterade fördelning i `auto-s1-1789649728193-u2-ansprak.md` ("#3 rörelsekapital → syskon u3") och syskonet u1:s parallella pivot till B6-rotguiden (läst 13:00:04Z, före mitt anspråk). NOTIS till nästa omgång: våg 171 #1 `sa-tolkar-du-utdelningskalendern.json` är oclaimat och står kvar i kön.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Utkast-JSON:en lämnas orörd; rättningarna levereras som diff-poster (`rorelsekapital-och-kassstrom-diff.json`, 7/7 strängar verifierade mot utkastet) för byggaragenten/kunden att verkställa.

---

## 1. Källor — rätt filversion identifierad och verifierad

Utkastet anger "Bland 115 bolag i universumet (insamling 2026-09-03)". Universumfilen växer kontinuerligt (aktuellt 153 bolag) — granskningen låste därför **exakt den version som gällde vid bygget**: `git show 0e399f13:data/portfolj-system/bolagsunivers.json` (commit 09-15 20:31, "universum 113→115" — byggcommiten landade 23:59 samma kväll).

| Kontroll | Resultat | Dom |
|---|---|---|
| Antal bolag @ 0e399f13 | 115 | ✓ stämmer med utkastets "115" |
| Källor i filen | Yahoo Finance + MarketStack, hämtat 2026-09-03, på grundraderna; 13 av de 97 mätbara bär StockAnalysis 2026-09-15 (tilläggsrader) | ✓ grundnotisen — se fynd C2 |
| Tabellbolagens egna källor | HM-B, ATCO-A, SKF-B, VOLVAR-B bär samtliga Yahoo+MarketStack | ✓ tabellen bär ingen tilläggskälla |

## 2. Siffror — oberoende omräkning (skript `verktyg/_s1u3-kontroll-rorelsekapital.mjs`)

Urvalslogiken återledd och verifierad: 115 bolag − 10 utan något av fälten = 105 med båda fälten mätta; **8 med nettoMarginal ≤ 0 uteslöts ur kvoten → 97**. Urvalet är metodiskt riktigt (kvot med negativ nämnare är omtolkbar; KINV-B:s nämnare 0 vore division med noll) men outalat i texten — fynd C1.

| Påstående i utkastet | Omräkning ur källfilen | Dom |
|---|---|---|
| båda fälten mätta för 97 | 105 mätbara − 8 med netto ≤ 0 = 97 (EKTA, ELUX, BILL, VPLAY, WBD, PCELL, PSNY + KINV=0) | ✓ talet; urvalet outalat → C1 |
| median 0,84 | 0,8356 → 2 decimaler 0,84 | ✓ |
| 37 bolag över 1,0 | 37 | ✓ |
| 26 bolag under 0,5 | 26 | ✓ |
| H&M 5,6 % / 10,1 % / 1,82 | källa 5,57 / 10,11 / 1,8151 → avrundat 5,6 / 10,1 / 1,82 | ✓ (kvoten på råvärden, noggrannare än visningstalsvägen 1,80) |
| Atlas Copco 15,7 / 15,3 / 0,98 | källa 15,67 / 15,29 / 0,9757 → 15,7 / 15,3 / 0,98 | ✓ |
| SKF 5,0 / 3,5 / 0,70 | källa 5,03 / 3,52 / 0,6998 → 5,0 / 3,5 / 0,70 | ✓ |
| Volvo Car 2,8 / −4,5 / −1,61 | källa 2,82 / −4,54 / −1,6099 → 2,8 / −4,5 / −1,61 | ✓ |
| räkneexempel 10 + 5 − 8 = 7 | 7 | ✓ |
| konverteringsgrad = FCF-marginal ÷ nettomarginal, härledd | fältpar i filen; härledningen deklarerad i texten med "inte ett mätt nyckeltal i sig" | ✓ (ärlighetsvinkeln hel) |

Metodkänslighet dokumenterad: räknas kvoten på ALLA 105 mätbara (negativa nämnare inkluderade) blir median 0,82 / 38 över 1,0 / 31 under 0,5 — utkastets tal är reproducerbara endast med netto>0-urvalet, vilket styrker att C1-preciseringen förtjänar plats i texten. Konsistensnot: m9-seriens kassaflödesanalys-101 (100-bolagsfilen) redovisar median 0,78 på n=84 — annat underlag, annan siffra; ingen motsägelse, men två serier med "konverteringsgrad" i titeln bör helst förklara urvalet symmetriskt.

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Varumärkesgrind** (kontrolleraText-replik, `data/varumarke.json`s samtliga 26 regexer "giu" på title + description + varje kroppsrad): **0 FEL, 0 VARNINGAR**.
- **Rådgivningsverb** (köp/sälj/rekommenderar/undvik/aktietips/råd): 0 träffar. Texten håller utbildningsformen hela vägen — "guiden går igenom", "så fungerar", "Talet är en startpunkt för frågan varför"; Volvo Car- och H&M-raderna är uttryckligen deskriptiva mönsterbeskrivningar utan omdöme om bolagen.
- **Lagrum**: inga åberopas i texten → ingen risk för den förbjudna lagrumsblandningen (2007:528 styr granskarens dom; texten behöver inte citera det).
- **Disclaimer**: sista bodyraden är den negerade standardformeln "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓.
- **IFRS 16-avsnittet** faktakollat: "Hyreskostnader delas upp i avskrivning och räntekostnad i resultaträkningen, medan kassaflödet främst syns i finansieringsdelen" — korrekt återgiven praxis (kapitaldel i finansieringen; "främst" täcker räntans placeringsfrihet); "resultaträkning och kassa beskriver samma avtal på två olika sätt" är pedagogiken träffsäker.

## 4. 911-referenser — REN

0 träffar på seriens sex mönster (911 · 9/11 · 11 september · september 11 · nine-eleven · 9-1-1) mot title + description + body.

## 5. Länkar — 4/4 levande

| Länk | Register | HTTP (localhost:3000) |
|---|---|---|
| `/blogg/sa-laser-du-en-balansrakning-pa-15-minuter` | data/blogg/ live ✓ | 200 |
| `/kurser/km-002-forvaltningsberattelsen` | deep-courses.json ✓ | 200 |
| `/blogg/kvickrakningsformeln-sa-mater-du-likviditet` | data/blogg/ live ✓ | 200 |
| `/blogg/v11-likviditet-analys` | data/blogg/ live ✓ | 200 |

Korslänksregeln uppfylld: ingen länk pekar på outgivna utkast.

## 6. Struktur

| Krav | Faktiskt | Dom |
|---|---|---|
| BlogPost-form 9 fält | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body — exakt 9 | ✓ |
| Slug ^[a-z0-9-]+$ | `rorelsekapital-och-kassstrom` | ✓ |
| Pillar giltig bland de 6 publicerade | "Grunderna" | ✓ |
| Author | AK1A Research Lab | ✓ |
| Sökord i title + ingress + H2 | "rörelsekapital": title ✓ ingress ✓ H2 "Rörelsekapitalet — tre poster…" ✓ | ✓ |
| H2 ≥ 2 | 6 st | ✓ |
| Body ≥ 800 tkn | 6 077 tkn | ✓ |
| Title ≤ 60 tkn | **64** | ✗ → B1 (57-tkn-kandidat: "Rörelsekapital och kassaflöde: kassan följer inte vinsten") |
| OG-description ≤ 155 tkn | **175** | ✗ → B2 (154-tkn-kandidat) |
| readingMinutes = round(ord/600) | ord 762 → kontrakt 1, utkastet **5** | ✗ → B3 |
| Mjuka bindestreck | 0 | ✓ |
| Ord 800–1 400 (B-guidernas span) | 762 | notis: understiger B-spannet men uppfyller m9-kravet; tillskottsseriens egen längd (syskonen 837/770) — konstaterande, inget krav |

## Fyndlista

| # | Grad | Fynd | Åtgärd (diff-post) |
|---|---|---|---|
| B1 | MEDEL | Title 64 tkn > 60 | Byt till 57-tkn-kandidaten (behåller båda sökorden) |
| B2 | MEDEL | OG-description 175 tkn > 155 | Byt till 154-tkn-kandidaten |
| B3 | MEDEL | readingMinutes 5 mot kontraktets round(762/600) = 1 | Byt till 1 |
| C1 | LÅG | Urvalskriteriet outalat: "mätta för 97" gömmer 105-mätbara-/8-uteslutna-logiken (metodiskt rätt, okommunicerat) | Fogga preciseringsmeningen |
| C2 | LÅG | Källnotisen omnämner inte StockAnalysis (13 av 97 mätbara bär den; tabellbolagen gör det inte) | Byt källnotis-rad |
| C3 | LÅG | "Bokar samma bolag 6 kronor i vinst…" (villkorlig bisats utan Om; "bokför" träffande) + "visar motsatta riktningen" (saknar "den") | Två små byten |
| I1 | INFO | Ord 762 — under B-guidernas 800-spann, över m9-kravet; syskonen 837/770 | Ingen |
| I2 | INFO | publishedAt 2026-09-15 = byggdagen (utkastkonvention: sätts vid export) | Ingen |

**HÖG: 0 · MEDEL: 3 · LÅG: 3 · INFO: 2**

## 7. Systemfynd — våg 171:s tre tillskott delar fältavvikelserna (till syskon och nästa omgång)

Mätning 2026-09-17 (endast fält, djupgranskning ägs av respektive granskare): samtliga tre tillskott i commit `4ce26f70` bär title > 60 tkn, description > 155 tkn och readingMinutes 5 mot kontraktets 1:

| Utkast | Title | Desc | Ord → kontrakt | Granskas av |
|---|---|---|---|---|
| rorelsekapital-och-kassstrom (detta) | 64 | 175 | 762 → 1 | denna granskning |
| begreppet-substansrabatt | 64 | 181 | 837 → 1 | u2 (pågående) |
| sa-tolkar-du-utdelningskalendern | 76 | 162 | 770 → 1 | **oclaimat — nästa omgång** |

Mönstret pekar på en gemensam mall i våg 171 som avviker från seriens fältgränser — rättningarna bör helst göras i ett svep av byggaragenten när diff:erna ligger klara, så att de tre utkasten möter exportvägen med gemensam fältstandard.

---

**Sammanfattande dom:** Innehållet håller för publicering efter fälträttningarna B1–B3 (tre maskinella fält — inga tvingande body-ändringar; C1–C3 lyfter texten sista biten). Källkedjan är den starkaste i serien: exakt filversion återledd via git, urvalslogiken reproducerbar, tabellens alla 12 tal gröna mot råvärden. R2 orörd: publiceringen är kundens klick.

LEVERANS: rorelsekapital-och-kassstrom bedömning=FLYTTKLAR-EFTER-3-FÄLTRÄTTNINGAR fynd=3 MEDEL+3 LÅG+2 INFO rättningar=0-i-andras-fil-7-diff-poster
