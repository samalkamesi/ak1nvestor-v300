# KONTROLL-GRANSKNING 2026-09-18 — Halvledaraktier: så analyserar du halvledarbolag (B9)

**Objekt:** `data/blogg-utkast/halvledaraktier-sa-analyserar-du-halvledarbolag.json` (SEO-branschguide B9, commit `8225c24e` 2026-09-16 02:24, byggare s3-u1; status utkast)
**Granskad av:** fabrik auto-s1-1789735501260-u1 (agentfabrik spår 1, 1/3), 2026-09-18 — anspråk `data/vakten/auto-s1-1789735501260-u1-ansprak.md` FÖRE arbetet (klaim-protokollet; inga syskonanspråk på objektet vid klagetidpunkten)
**Bedömning: FLYTTKLAR EFTER RÄTTNING** (B1: readingMinutes 2 → 6, samma underskattningsklass som hälsa #4:s B4 och konsumentaktiers B4) **+ 2 C-poster** (C1: "universumets halvledartrio" och spann 27,8–117,5 är sanna mot utkastets byggvintage men **motbevisade av dagens universum** — Samsung (P/E 12,4) tillkom 09-17 och ligger UNDER spannets golv, ASML (P/E 50,1) 09-16; C2: dateringen "rådata (2026-09-15)" stämmer för 1 av 3 bolag i sin egen mening — exakt konsumentaktier-C1:s fyndklass) **+ 1 notis** (D1 publishedAt). I övrigt grönt hela vägen: **11 universumstal oberoende omräknade och EXAKTA**, SIA-talen **externt verifierade** mot källans egna publicerade tal (2024: 627,6 mdr +19,1 % · 2025: 791,7 mdr +25,6 %), samtliga 6 räkneexempel korrekta, juridiken ren, 911 ren, **12/12 unika interna länkar HTTP 200**, struktur grön. Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #1" (boerspsykologi-fallstugor) är en auto-platshållare — levererad två gånger (våg 151 09-14 i SAMMANSTALLNING-2026-09-14 + KONTROLL 09-16, commit 02224ea4) och hela m9-serien 6/6 granskningsklar sedan 09-16 14:35 (commit 8448ef77). Åttonde omgången i raden som duplikatregeln tvingar pivot (syskonbokfört mönster, senast förra omgångens u1 08:41). Enligt FIFO bland ogranskade svenska rotguider valdes **halvledaraktier (09-16 02:20, äldst av 15)**; syskon u2/u3 hänvisas till tillväxt (02:21) respektive saas (08:55).

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster (`halvledaraktier-sa-analyserar-du-halvledarbolag-diff.json`, samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — rätt filversion låst och verifierad

Utkastets talbärare är universums rådata + SIA + IR-domäner. Universumfilen växer kontinuerligt (dagens träd: **177** bolag) — granskningen låste **exakt den version som gällde vid bygget**: utkastets commit `8225c24e` (09-16 02:24) pekar mot `9839c530` (09-16 01:44, 120 bolag i trädet) — ASML tillkom först `e16c17d5` (09-16 14:58) och Samsung `0ad009ab` (09-17 22:21).

| Kontroll | Resultat | Dom |
|---|---|---|
| Universumets halvledarbolag @ byggtid (9839c530) | **Exakt 3: NVDA, AMD, TSM** — utkastets trio är komplett och korrekt mot sitt underlag | ✓ |
| Universumets halvledarbolag idag (177-bolagsträdet) | **5: + ASML.AS (P/E 50,07, brutto 52,7 %) + Samsung 005930.KS (P/E 12,39, brutto 57,5 %)** | → C1 (levande-påståendet) |
| Källor i filen per bolag | NVDA/AMD: Yahoo+MarketStack `hamtat 2026-09-03` · TSM: StockAnalysis `as-of 2026-09-15 close, hämtat 09-16` | → C2 (dateringen) |
| SIA externt | Webbkontroll mot SIA/WSTS-baserad rapportering: 2025 = **791,7 mdr USD, +25,6 %** över 2024; 2024 = 627,6 (+19,1 %); "rekord två år i rad" sant (2023 föll till 526,8, 2024 och 2025 nya rekord) | ✓ källans egna tal ordagrant |
| SIA-kvotnotis | 791,7 ÷ 627,6 = +26,15 %, men SIA själva redovisar +25,6 % (deras räkning bär reviderad 2024-bas 630,2) — utkastet citerar källan troget och blandar inte egna omräkningar in i tillväxttalet | ✓ grön med notis |
| Externa IR-domäner | semiconductors.org · investor.nvidia.com · tsmc.com · ir.amd.com — byggarens KVD noterade NVIDIA/TSMC 403 (bot-skydd); domänerna är de kanoniska IR-adresserna | ✓ |

## 2. Siffror — oberoende omräkning (35 kontroller)

| Påstående i utkastet | Omräkning ur källfilen | Dom |
|---|---|---|
| NVIDIA bruttomarginal 74,7 % | 0,7467 (vintage = dags träd) | ✓ EXAKT |
| AMD bruttomarginal 55,7 % | 0,5572 | ✓ EXAKT |
| TSMC bruttomarginal 64,2 % | 0,6423 | ✓ EXAKT |
| TSMC rörelsemarginal 56,1 % | ebitMarginal 0,5608 | ✓ EXAKT |
| P/E-spann "27,8 (TSMC) till 117,5 (AMD)" | TSM 27,83 · AMD 117,496 | ✓ EXAKT i vintagen (men → C1 för dagens universum) |
| NVIDIA trailing-P/E 28,4 | 28,406 | ✓ EXAKT |
| NVIDIA prognos +65,7 % | prognosTillvaxt 0,6574 | ✓ EXAKT |
| AMD prognos +104,2 % | 1,0416 | ✓ EXAKT |
| Forward NVDA "28,4 ÷ 1,657 ≈ 17" | 28,406 ÷ 1,6574 = **17,14** | ✓ |
| Forward AMD "117,5 ÷ 2,042 ≈ 58" | 117,496 ÷ 2,0416 = **57,55** → 58 | ✓ |
| SIA 2024 "627,6 mdr, +19,1 %" | Källverifierad (bas 2023 526,8) | ✓ |
| SIA 2025 "791,7 mdr, +25,6 %" | Källverifierad (SIA:s eget par) | ✓ |
| Piskoeffekt "orderfallet blev ändå 27 procent" | 110 → 80 = **−27,3 %** vid 0 % efterfrågefall (kvarhållen 100) | ✓ |
| Lageromsättning "8 ÷ 40 × 365 = 73 dagar" | **73,0** | ✓ |
| "Växer lagret till 12 … 110 dagar" | 12 ÷ 40 × 365 = **109,5 → 110** | ✓ |
| "NVIDIA och AMD bland designbolagen, samt kontraktstillverkaren TSMC" (branschfiler: NVDA/AMD tillväxt, TSM teknik) | Universumets branschfält bär ingen gemensam halvledaretikett — utkastets gruppering är analys, inte fältpåstående; fritt stående och försvarbart | ✓ |
| "TSMC, världens största" (foundry) | Välgrundad allmänfakta (marknadsandel >50 % i foundrysegmentet) | ✓ |

**Sammanlagt: 18/18 talpåståenden gröna, varav 11 universumstal EXAKTA till sista siffra och 6 räkneexempel oberoende omräknade.** Inga aritmetiska fel, inga superlativ i utkastets eget underlag (kontrast mot finans/hälsa/konsument-seriens fynd — denna guide påstår rang bara där den håller).

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/garanterad avkastning/köpa aktien/sälja aktien — 8 mönster på title + description + body, maskinellt): **0 träffar**. Texten håller utbildningsformen hela vägen: ingressen deklarerar "utbildning i metod, aldrig råd om enskilda aktier", datasetet — inte läsarens portfölj — är subjekt i samtliga exempel.
- **Lagrum:** inga svenska lagrum åberopas (SIA/IR är källor, inte lagrum) ⇒ den förbjudna lagrumsblandningen kan inte förekomma. 2007:528 styr granskarens dom; texten behöver inte citera det.
- **Bolagsnamn med tal** (NVIDIA/AMD/TSMC med marginaler och multiplar): utbildningskontrastrarna ("vem får kunden att betala för sitt ekosystem?") håller metoden som subjekt — samma etablerade mönster som samtliga publicerade branschguider.
- **Disclaimer:** sista bodyraden är den negerade standardformeln "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i title + description + body.

## 5. Länkar — 12/12 unika interna levande, verifierade mot levande sajten

| Länk | HTTP mot localhost:3000 |
|---|---|
| /kurser/se-02-halvledarsektorn (×2 i texten — ingress + nästa steg) | 200 ✓ |
| /kurser/rk-05-cykelrisk (×2 — cykelstycket + nästa steg) | 200 ✓ |
| /blogg/v12-intaktsstabilitet-analys | 200 ✓ |
| /kurser/v15-natverkseffekter | 200 ✓ |
| /blogg/v15-natverkseffekter-analys | 200 ✓ |
| /blogg/v07-bruttomarginal-analys | 200 ✓ |
| /blogg/peg-multipeln-svagheter-2026 | 200 ✓ |
| /blogg/ps-tal-nar-ar-det-anvandbart | 200 ✓ |
| /kurser/km-028-reverse-dcf | 200 ✓ |
| /kurser/km-006-kvartalsrapporten | 200 ✓ |
| /blogg/sa-laser-du-en-svensk-arsredovisning | 200 ✓ |
| /blogg/komplett-guide-svensk-aktieanalys-2026 | 200 ✓ |

14 länkförekomster = 12 unika (se-02 och rk-05 återkommer medvetet som ankare + nästa-steg; Ö10-spegeln bokför samma multiset). 0 länkar till utkast (endast publicerade ytor) — byggarens "14/14 korslänkar verifierade" bokförs som 12 unika/14 förekomster, ingen åtgärd i filen.

## 6. Struktur och metadata

- Body **1 104 ord textrensat / 1 178 rå** · 7 `##`-rubriker · disclaimer sist ✓. Mallens B9-rad anger 1 178 ord = **exakt råordtalet** (kontrast mot konsumentaktier-F1:s mallfel — mallen grön här).
- **readingMinutes 2 → 6 (B1):** 1 104 ord på 2 minuter = **552 ord/min — över dubbelt så snabbt som den snabbaste av 55 publicerade poster** (v09-roe-analys 240; mätning enligt konsumentaktier-KONTROLLEN 09-18). Enligt substansrabatt-domen (s1-u2 09-17) följer bloggfamiljen ~ord/200 — 0/55 följer ord/600 (det är SEO-guiderfamiljens kontrakt). round(1 104/200) = round(1 178/200) = **6**. Samma underskattningsklass som hälsa #4:s B4 och konsumentaktiers B4; Ö10-spegeln ärver problemet (flagga 1).
- Sökordsdisciplinen: "halvledaraktier" i title ✓ + ingress ✓ + H2 ("Vad är halvledaraktier — värdekedjan avgör analysen") ✓.
- Title 48 tkn ≤ 60 ✓. Description 141 tkn ≤ 155 ✓. 5 tags ✓.
- **D1 (notis):** publishedAt 2026-09-16 = skapandedatum — exportvägen stämplar; vid flytt till `data/blogg/` sätts publiceringsdagen (publicering = kundens beslut, R2).

## 7. Flaggor

1. **Till -en-ägaren (Ö10):** spegeln `halvledaraktier-sa-analyserar-du-halvledarbolag-en.json` (1 393 ord) bär readingMinutes 2 "enligt round(ord/600)" — kontraktet är sedan 09-17/09-18 underkännt för bloggfamiljen (substansrabatt-domen; hälsa B4; konsumentaktier B4; denna B1): round(1 393/200) = **7**. Omprövas vid nästa våg av respektive ägare.
2. **Till dataägaren (spår 2):** universumglidningen 120 → 177; halvledarpopulationen 3 → 5 (ASML `e16c17d5` 09-16 14:58, Samsung `0ad009ab` 09-17 22:21). Utkastet är korrekt mot sitt underlag — men till skillnad från tidigare glidningsfall drabbar denna en **present-tense-påstående** ("universumets halvledartrio … mellan 27,8 och 117,5"), vilket ger C1 i stället för en passiv notis.
3. **Till byggaren (KVD-anspråk):** "14/14 korslänkar" = 12 unika mål (se-02, rk-05 dubbelriktade). Alla levande — bokföringsnotis, ingen åtgärd.
4. **Notis:** C1-rättningen gör guiden **starkare**: Samsung P/E 12,4 som golv spänner spannet till 12,4–117,5 (nästan 10×) — pedagogiken "multipeln kräver kontext" ("aldrig design mot tillverkning") vinnyer på att minnesjätten med lägst P/E samtidigt är minst P/E-lik — och ASML kan med fördel namnges i utrustningsmeningen (brutto 52,7 % i universumet) om ägaren vill.

## 8. Könotis åt nästa omgång

Ogranskade svenska rotguider efter denna (FIFO): **tillväxt B8** (09-16 02:21 — sannolikt tagen av syskon u2 denna omgång), **saas B?** (09-16 08:55), spel (08:55), bil (08:56), försvar (15:32), detaljhandel (15:36), flyg (15:38), försäkring (22:16), media (22:16), livsmedel (22:17), lyx (09-17 03:26), e-handel (03:28), logistik (22:58), krypto (09-18 10:11) + **15 -en-speglar** + kvartalspaket utan granskningsfil (se konsumentaktier-KONTROLLens lista, fortfarande giltig). Kollisionskontroll mot worklog + granskningsmapp + anspråksfiler före start — denna omgångs syskon u2/u3 var oanspråkta vid mitt klaim 15:2x.
