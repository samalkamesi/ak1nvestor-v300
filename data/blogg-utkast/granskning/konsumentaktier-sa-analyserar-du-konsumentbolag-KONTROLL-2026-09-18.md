# KONTROLL-GRANSKNING 2026-09-18 — Konsumentaktier: så analyserar du konsumentbolag (branschomgången B7)

**Objekt:** `data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag.json` (branschomgångens B7 = bransch 9/10 av 10, commit `319a8b20` 2026-09-16 02:13 — byggare s3-u2; status utkast enligt SEO-GUIDER-2026-09.md B7-rad)
**Granskad av:** fabrik auto-s1-u1 (agentfabrik spår 1, 1/3), 2026-09-18 — anspråk `data/vakten/auto-s1-1789713300301-s1-u1-ansprak.md` skrivet 08:41 lokal FÖRE arbetet (raceskydd)
**Bedömning: FLYTTKLAR EFTER RÄTTNINGAR** (B1: **falsk universums-superlativ** — "LVMH:s bruttomarginal på 66 procent är universumets högsta" är rang **35 av 119** mätta i utkastets eget underlag: 34 bolag ligger över, däribland **Evolution i samma bransch (100,0)** samt Industrivärden/Öresund (100,0), Novo (82,0), Meta (81,8) — samma fyndklass som finans #2:s C1+C2 och hälsa #4:s B1–B3, byggarens egen pre-commit-KVD rättade två superlativ men missade den tredje; B2: sammanfattningens "spannet 14–66 procent i universumet" håller inte — konsumentbranschens faktiska spann är 14,1–100,0 och universumets −1,1–100,0 i vintagen; B3: descriptionens "branschens högsta ROE" motägs av guidens egen kropp ("näst högst … efter teknik") och underlaget; B4: readingMinutes 2→7) **+ 1 C-post** (C1: "hämtad 2026-09-15" stämmer för 1 av 6 tal i sin egen mening) **+ 2 notiser** (D1 publishedAt, D2 ord-tak). I övrigt grönt hela vägen: **18 talpåståenden oberoende omräknade och EXAKTA** (medianer, universumstal, 15 per-bolagstal), byggarens egenrättade ROE-superlativ **SANN** (teknik 28,7 > konsument 24,2 > industri 20,3), samtliga 5 räkneexempel korrekta, juridiken ren (juridikgrind-vakt: fynd 0 + grund true), 911 ren, 15/15 interna länkar 200, externa källor levande. Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #1" är en auto-platshållare — m9-ytan är komplett sedan 09-16 (m9-ko 6/6 KONTROLL + tillskott granskade 09-17), sjunde omgången i raden med denna pivot. Förra omgångens könotis pekade på mx1 #5 konsumentbolagens-skuldsattning, men båda syskonen hann före (u2 08:39:06 — race-vinnare, har levererat KONTROLL + diff, mx1-serien därmed 5/5 slutgranskad; u3 08:39:47). Jag var tredje hand på ett tvåhästslopp ⇒ pivot enligt FIFO till **B7 konsumentaktier** (09-16 02:12, äldsta ogranskade rotguiden efter mx1 #5; 0 granskningsfiler och 0 syskonanspråk på objektet vid min anspråkstidpunkt).

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster (`konsumentaktier-sa-analyserar-du-konsumentbolag-diff.json`, samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — rätt filversion låst och verifierad

Utkastet anger "universumets rådata" och "AK1A:s analysuniversum … 13 bolag". Universumfilen (`data/portfolj-system/bolagsunivers.json`) växer kontinuerligt (dagens träd: 171 bolag) — granskningen låste **exakt det träd som gällde vid utkastets egen commit `319a8b20`** (09-16 02:13): 120 bolag (senaste universumsändringen dessförinnan: 09-16 01:44; nästa landade först senare samma dag).

| Kontroll | Resultat | Dom |
|---|---|---|
| Antal bolag @ utkastets commit | 120 (dagens träd 171 — glidningen, se flagga F3) | ✓ utkastets underlag |
| Rätt vintage? | Samtliga medianer och per-bolagstal reproducerade **till decimalen** mot 120-trädet (§2) — starkare än källhänvisningskontroll: siffrorna KAN inte komma från något annat träd | ✓ låst |
| Källor i filen | Yahoo Finance + MarketStack per rad | ✓ textens källhänvisning |
| `hamtat` per konsumentrad | 10 rader 2026-09-03 · 3 rader (Evolution, Axfood, Nestlé) 2026-09-15 | ⚠ → C1 (textens datumangivelse) |
| Konsumentbranschens bolag | 13: Carlsberg, Electrolux, Essity, H&M, Inditex, LVMH, McDonald's, Nike, P&G, Volvo Car, Evolution, Axfood, Nestlé | ✓ "hör 13 bolag till branschen" — guidens båda namnlistor täcker exakt samma tretton |
| "universumets tio branscher" | 10: teknik, industri, hälsa, konsument, fastighet, finans, material, energi, kommunikation, tillväxt | ✓ |

## 2. Siffror — oberoende omräkning (sond `.zcode/granskning-s1u1-konsumentaktier.mjs`)

Medianmetod: peer-kontraktet (jämnt antal ⇒ medel av de två mittersta) — samma kontrakt som branschmedianer-serien redovisar öppet.

| Påstående i utkastet | Omräkning ur källfilen @ 319a8b20 | Dom |
|---|---|---|
| Median-ROE 24 procent | **24,19 %** (n=12 mätta) | ✓ EXAKT |
| "näst högst av universumets tio branscher, efter teknik" | teknik 28,68 > **konsument 24,19** > industri 20,3 > hälsa 18,5 > … | ✓ SANN — byggarens egenrättade superlativ håller |
| EBIT-marginal 14,6 "under universumets median (21,1)" | **14,60 %** (n=13) mot universum **21,10 %** (n=119) | ✓✓ EXAKTA |
| Median-P/E 20,4 "mot universumets 20,5" | **20,447** (n=12; Electrolux saknar P/E) mot universum **20,52** | ✓✓ (gränsnotis: 20,447 < 20,45 ⇒ 20,4 korrekt) |
| "smalt kvartilspann (18,1–22,3)" | Sorterade P/E (n=12): exakt **3 värden under 18,1** (5,96 · 15,15 · 15,61) och **3 över 22,3** (22,47 · 27,39 · 27,93) | ✓ SANN som **diskret** kvartilgräns (25 %/75 %); standardmetod R7 ger 17,5–22,4 — metodnotis F4 |
| EV/EBIT 15,7 "mot universumets 19,0" | **15,72** (n=12) mot universum **18,98** | ✓✓ EXAKTA |
| P/B 3,9 "mot 2,8" | **3,94** mot universum **2,79** | ✓✓ EXAKTA |
| Median skuldsättningsgrad 0,69 | **0,694** (n=12) | ✓ EXAKT |
| "branschens FCF-marginal 9,3 procent" | **9,30 %** (n=12) | ✓ EXAKT |
| "ROE 24 procent mot universumets 15" | 24,19 mot universum **15,34** | ✓ |
| Bruttomarginal per bolag: LVMH 66 · Inditex 56 · H&M 54 · Axfood 15 · Electrolux 14 · Volvo Cars 16 | **66,4 · 56,5 · 54,1 · 14,8 · 14,1 · 15,6** | ✓ 6/6 (avrundningskonsekvent nedåt/half-up) |
| McDonald's EBIT-marginal 46 | **46,48 %** | ✓ |
| Volvo Cars P/E 6,0 mot Inditex 28 | **5,96** mot **27,93** | ✓✓ |
| Electrolux EBIT −3,2 + skuldsättningsgrad 2,6 | **−3,19 %** + **2,58** | ✓✓ |
| Skuld-spann: Nestlé 2,1 · H&M 2,3 · Carlsberg 1,3 mot Evolution 0,02 | **2,13 · 2,26 · 1,34 · 0,02** | ✓ 4/4 |

**Räkneexemplen — 5/5 korrekta:** 3 × 4 × 2 = 24 ✓ · 30 × 0,5 × 1,2 = 18 ✓ · 100 − 75 − 21 = 4 ✓ · 95 − 71,25 − 21 = 2,75 ✓ · vinstminskning 1,25/4 = 31,25 % → "31 procent" ✓.

**Superlativen och spannet — granskningens väsentliga fynd (B1–B3), alla mätta i utkastets eget underlag:**

| Påstående | Verkligheten (samma vintage) | Dom |
|---|---|---|
| "LVMH:s bruttomarginal på 66 procent är **universumets högsta**" (Lyx-bullet) | **Rang 35 av 119 mätta.** Över LVMH: Evolution (konsument! 100,0), Industrivärden 100,0, Öresund 100,0, Kambi 98,9, Aker BP 90,7, Investor 89,4, Var Energi 88,1, BHP 85,9, Palantir 84,8, Lilly 83,4, Cateena 82,8, Hufvudstaden 82,3, Goldman 82,1, Novo 82,0, Meta 81,8, AstraZeneca 81,7 … — inom den egna branschen ligger bara Evolution (100,0) över, närmaste varumärkesbolag är McDonald's 57,4 | ✗ → B1 |
| Sammanfattningen: "spannet 14–66 procent **i universumet**" | Konsumentbranschens spann: **14,1–100,0** (Evolution 100,0 är branschens max, inte 66). Universumets: −1,1–100,0 (Polestar −1,1; storbankerna 0). 14–66 är spannet bland branschens varumärkes- och handelsbolag med Evolution exkluderad | ✗ → B2 |
| Descriptionen: "DuPont-rakningen bakom **branschens högsta ROE**" | Teknik 28,68 > konsument 24,19 — och guidens egen kropp säger "näst högst … efter teknik" | ✗ → B3 (descriptionen missade byggarens egen superlativrättning) |

Rättningarna följer finans/hälsa-precedensens mönster: rangen/skopet rättas, påståendets kraft behålls. B1-kurrektionen är dessutom mer lärorik: Evolution som plattformsbolag (marginalkostnad nära noll, guidens egen spel-bullet) kontra varumärkesbrutton som byggs under årtionden — kontrasten förblir pedagogisk utan den falska toppen.

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Juridikgrind-vakten** (`node verktyg/juridikgrind-vakt.mjs --json`, 113 dokument): filen **fynd 0 + grund true** (utbildningsgrunden närvarande).
- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/garanterad avkastning + tre till, maskinellt på title+description+body): **0 träffar**. Texten håller utbildningsformen explicit ("Som alltid här: utbildning i metod, aldrig råd om enskilda aktier") och genomgående i utförandet ("Så läser du", datasetet som subjekt).
- **Varumärkesgrind** (vaktens P2-del ur `data/varumarke.json` forbjudnaFraser): **0 fynd**.
- **Lagrum:** inga svenska lagrum åberopas — Konjunkturinstitutet är en myndighet, inte lagrum ⇒ den förbjudna lagrumsblandningen kan inte förekomma.
- **Disclaimer:** sista bodyrad är standardformeln "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓ EXAKT.

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "9/11", "11 september", "september 11", "nine-eleven", "9-1-1") i title + description + body.

## 5. Länkar — 15/15 interna levande, externa levande

| Länk | HTTP mot localhost:3000 |
|---|---|
| /kurser/se-05-lyxsektorn · /kurser/v14-varumarke · /kurser/mt-01-vad-ar-en-moat · /kurser/mt-02-moat-erosion-och-vallgravstest · /kurser/ln-01-dupont-analysen · /kurser/km-006-kvartalsrapporten · /kurser/km-044-konsumentsektorn (7 kurser) | 200 ×7 |
| /blogg/v14-varumarke-analys · /blogg/hur-raknar-man-roe · /blogg/v09-roe-analys · /blogg/v12-intaktsstabilitet-analys · /blogg/vad-ar-skuldsattningsgrad · /blogg/sa-laser-du-en-svensk-arsredovisning · /blogg/hur-vi-analyserade-volvo-cars · /blogg/komplett-guide-svensk-aktieanalys-2026 (8 publicerade poster) | 200 ×8 |

Mallens regel "enbart publicerade poster och kurser" håller — ingen länk till utkast. Externa källor: axfood.se 200 · konj.se 200 · hmgroup.com 301 · lvmh.com 301 (redirects till startsidor — inte döda; kontrollera redirectmål vid publicering enligt NIKE/holmen-precedensen) · corporate.mcdonalds.com timeout = bot-skydd (URL:en är sökindexverifierad enligt Ö7-granskningen av speglingen). Kontrast: inget hem.sandvik.com-fall (industri-granskningens döda länk).

## 6. Struktur och metadata

- Body **1 401 ord textrensat / 1 410 rå** · 9 `##`-rubriker · disclaimer sist ✓. **Mallens B7-rad säger 1 255 ord — stämmer inte** (F1); Ö7-syskonet mätte originalet till 1 410 (raw) — konsistent med min mätning.
- **readingMinutes 2 → 7 (B4):** 1 401 ord på 2 minuter = **701 ord/min — nära tre gånger snabbare än den snabbaste av 55 publicerade poster** (v09-roe-analys 240, v05-pb-analys 227, v17-avtal 227; longsamma 54–67). Enligt substansrabatt-domen (s1-u2 09-17): bloggfamiljen följer ~ord/200 — 0/55 följer ord/600. round(1 401/200) = **7**. Seriens tidigare 600-baserade rättningar är omprövade (hälsa #4:s systemflagga); denna granskning tillämpar publicerad praxis.
- Sökordsdisciplinen (mallen): "konsumentaktier" i title ✓ + ingress ✓ + H2 ("Vad är konsumentaktier — sex sorters verksamheter") ✓.
- Title 48 tkn ≤ 60 ✓. Description 142 tkn ≤ 155 ✓ — B3-rättningen håller taket (150 tkn).
- **D1 (notis):** publishedAt 2026-09-16 = skapandedatum — exportvägen stämplar; publicering = kundens beslut (R2).
- **D2 (notis):** 1 410 råord ligger 10 över -en-familjens 1 400-tak (Ö7 trimmades tre rundor för att komma under); originalets trim är byggarens/kundens beslut — inget krav från denna granskning.

## 7. Flaggor

1. **Till mallägaren:** SEO-GUIDER-2026-09.md B7-radens ordtal **1 255 är fel** (verkligt 1 410 rå / 1 401 textrensat) — även commit-meddelandet bär 1 255. Tabellraden rättas vid nästa mallrörelse (granskaren skriver inte i andras filer).
2. **Till byggaren (KVD-anspråk):** "16/16 korslänkar (8 kurser + 8 publicerade poster)" = i verkligheten **15 unika** (7 kurser + 8 poster; ln-01-dupont-analysen länkas två gånger). Alla levande — ingen åtgärd i filen, bara bokföringen.
3. **Till dataägaren (spår 2):** universumglidningen — 120 (utkastets underlag) → 171 (dagens träd). Vid regenerering blir konsumentpopulationen större (Tysklands- och USA-tillskotten redan inne) med andra medianer. Utkastet är korrekt mot sitt eget underlag och behöver ingen åtgärd idag.
4. **Metodnotis (valfri):** kvartilspannet 18,1–22,3 är sant som diskret IQR-gräns (3/12 under, 3/12 över) men reproduceras inte av standardmetoderna (R7: 17,5–22,4; Tukey: 16,9–22,4) — om spannet återanvänds i dataset-sammanhang bör metoden redovisas.

## 8. Könotis åt nästa omgång

mx1-serien är 5/5 slutgranskad (u2 levererade #5 idag 08:5x — kolla deras rapport före ev. vidröring). Ogranskade i spåret därefter (FIFO): branschguider halvledaraktier (09-16 02:20) och tillvaxtaktier (09-16 02:21) äldst, sedan saas/spel/bil (09-16 08:5x), försvar/detaljhandel/flyg (09-16 15:3x), försäkring/media/livsmedel (09-16 22:1x), e-handel/lyx (09-17 03:2x), -en-speglarna (09-17–18) + kvartalspaket utan granskningsfil (Volvo Car, SKF, Atlas Copco, ABB, Handelsbanken, Swedbank, Essity, Alfa Laval, Volvo Group, Tele2, NP3, Castellum, Iberdrola, Saab, Telia, Boliden, Hydro, SCA, Yara, AT&T, BSX, SAP, Samsung, Novo — ur hälsa #4:s notis). Kollisionskontroll mot worklog + granskningsmapp + anspråksfiler före start.
