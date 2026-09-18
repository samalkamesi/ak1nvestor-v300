# KONTROLL-GRANSKNING 2026-09-18 — Lönsamhet inom hälsa (mx1 #4)

**Objekt:** `data/blogg-utkast/halsobolagens-lonsamhet.json` (mx1-aspektserien #4, commit `806f9359` 2026-09-15 23:57 — "hälsa+lönsamhet"; status utkast)
**Granskad av:** fabrik auto-s1-u2 (agentfabrik spår 1, 2/3), 2026-09-18 — anspråk `data/vakten/auto-s1-1789695030458-u2-ansprak.md` FÖRE arbetet (raceskydd; inga syskonanspråk för omgången vid klagetidpunkten)
**Bedömning: FLYTTKLAR EFTER RÄTTNINGAR** (B1–B3: **tre falska universums-superlativer** — bruttomarginal "universumets högsta" (faktiskt rank 2 efter fastighet 69,8 %), P/B "universumets högsta" (faktiskt rank 3 efter tillväxt 11,1 och teknik 6,4), AKM2-spann "universumets trängsta" (faktiskt rank 2 efter fastighetens 18 poäng) — samma fyndklass som finans #2:s C1+C2; B4: readingMinutes 3→4, seriens första fall med **omvänd** felriktning; B5–B6: två stavfel) **+ 1 frivilligt förslag** (D1 publishedAt). Innehållet i övrigt grönt hela vägen: samtliga nio mediantal oberoende omräknade och EXAKTA med korrekta n-redovisningar, AKM2-spannet ordagrant mot den egna källan, juridiken ren, 911 ren, 8/8 interna länkar levande, externa källor levande (redirects). Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #2" (branschmedianer-akm2) är levererad sedan länge (s1-u1 våg 1789537520972, commit 390fb61e; KONTROLL 09-16 07:53) och hela m9-ko-serien 6/6 sedan 09-16 — sjätte omgången i raden som duplikatregeln tvingar pivot (syskonbokfört mönster). Enligt spårets köregel valdes nästa icke levererade i mx1-seriens commit-ordning (`806f9359`): energi #1 ✓ 09-16, finans #2 ✓ 09-17, material #3 ✓ 09-16, **hälsa #4 = denna**, konsument #5 återstår (lämnas fri åt syskonen). Anspråksfilen skrevs 03:30:30 lokal, före arbetets start.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster (`halsobolagens-lonsamhet-diff.json`, samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — rätt filversion låst och verifierad

Utkastet anger "Bolagsuniversumets publika nyckeltal (september 2026; källor Yahoo Finance och MarketStack)". Universumfilen växer kontinuerligt (dagens träd: **165** bolag) — granskningen låste **exakt den version som gällde vid bygget**: utkastets egen commit `806f9359` (09-15 23:57) pekar mot `0e399f13` (09-15 20:31, 115 bolag) — nästa universumsändring landade först 09-16 01:44 (`9839c530`).

| Kontroll | Resultat | Dom |
|---|---|---|
| Antal bolag @ byggtid (0e399f13) | 115 (dagens träd 165 — glidningen, se flaggor) | ✓ utkastets underlag |
| Källor i filen | Yahoo Finance + MarketStack, `hamtat: 2026-09-03` | ✓ textens källhänvisning ordagrant |
| Hälsobranschens bolag | 11: AstraZeneca, Boston Scientific, CellaVision, Coloplast, Elekta, Fresenius, Getinge, Johnson & Johnson, Eli Lilly, Novo Nordisk, Roche | ✓ "hälsobranschens 11 bolag" — utkastets bådlistor (5 läkemedel + 6 medteknik/vård) täcker exakt samma elva |

## 2. Siffror — oberoende omräkning (sond `.zcode/granskning-mx1-halso.mjs`, 32 kontroller)

Medianmetod: peer-kontraktet (jämnt antal ⇒ medel av de två mittersta) — samma kontrakt som branschmedianer-serien redovisar öppet.

| Påstående i utkastet | Omräkning ur källfilen @ 0e399f13 | Dom |
|---|---|---|
| Median bruttomarginal 68,7 % (11 mätta) | **68,71 %**, 11 mätta | ✓ EXAKT |
| Median ROIC 19,0 % (10 mätta) | **19,04 %**, 10 mätta (Fresenius saknar ROIC) | ✓ EXAKT |
| Median ROE 18,5 % (11 mätta) | **18,53 %**, 11 mätta | ✓ EXAKT |
| Median nettomarginal 17,5 % (11 mätta) | **17,46 %**, 11 mätta | ✓ EXAKT |
| Median skuld/EK 0,63× (11 mätta) | **0,633×**, 11 mätta | ✓ EXAKT |
| Median P/B 6,2 (11 mätta) | **6,193**, 11 mätta | ✓ EXAKT |
| Median P/E 24,7 (10 mätta) | **24,728**, 10 mätta (Elekta saknar P/E) | ✓ EXAKT |
| Femårsmedel omsättning 7,3 % (11 mätta) | **7,30 %**, 11 mätta | ✓ EXAKT |
| Femårsmedel resultat 11,6 % (10 mätta) | **11,60 %**, 10 mätta (Elekta saknar serien) | ✓ EXAKT |
| Avstånd brutto→netto "över 51 procentenheter" | 68,71 − 17,46 = **51,25 pp** | ✓ |
| AKM2-poäng "mellan 46 och 66 … från Fresenius till Novo Nordisk" | Publicerad `data/blogg/branschmedianer-akm2.json`: "hälsa — median 56,5 · 10 mätta av 10 · spridning 46–66 (lägst Fresenius, högst Novo Nordisk)" | ✓ ordagrant mot den post utkastet hänvisar till |
| "Branschgruppen är inbördes jämnare än de flesta" | Hälsas spann 20 poäng = 2:a trängaste av tio | ✓ SANN — behålls |

**Superlativerna — granskningens väsentliga fynd (B1–B3), alla mätta i utkastets eget underlag:**

| Påstående | Verkligheten (samma vintage / samma artikel) | Dom |
|---|---|---|
| "Universumets högsta" bruttomarginal (bullet + ingress + sammanfattning + description) | **Fastighet 69,8 % > hälsa 68,7 %** (fastighet n=11: BALD 66,3 · CAST 69,8 · CATE 82,8 · DIOS 68,8 · FABG 66,0 · HUFV-A 82,3 · NP3 75,9 · PLD 75,5 · WALL-B 65,4 · WIHL 71,7 · VNA 60,9) — hälsa rank 2 av 10, marginal 1,1 pp | ✗ → B1 (4 platser) |
| "Universumets högsta" P/B (bullet + sammanfattning) | **Tillväxt 11,10 > teknik 6,36 > hälsa 6,19** — rank 3 av 10 | ✗ → B2 (3 platser, däribland "Notera kombinationen"-meningen som bär båda superlativerna) |
| "Universumets trängsta spann" | **Fastighet 42–60 = 18 poäng < hälsa 46–66 = 20 poäng** (lägst Prologis, högst Diös) — rank 2 av tio | ✗ → B3 |
| ROE/ROIC "bland de högsta i universumet" | ROE rank 4, ROIC rank 3 — mjuk formulering, försvarbar | ✓ |
| Titeln "från bruttomarginal 69 procent till nettomarginal 18" | 68,71→"nära 69" ✓, 17,46→18 vid heltalsavrundning ✓ | ✓ |

Rättningarna följer finans-precedensens mönster (C1): rangen rättas, påståendets kraft behålls ("näst högsta, efter fastighetens 69,8" är dessutom mer lärorikt — hyresrörelsens tomma topp kontra hälsans forskningsbetalda).

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/garanterad avkastning): **0 träffar** i title + description + body (maskinellt). Texten håller utbildningsformen hela vägen ("Så läser du", "fem steg", "Tre fällor", datasetet som subjekt i stället för läsarens portfölj).
- **Varumärkesgrind** (`data/varumarke.json`s mönster på title + description + body): **0 träffar**.
- **Lagrum:** inga svenska lagrum åberopas — FDA och EMA är myndigheter, inte lagrum ⇒ den förbjudna lagrumsblandningen kan inte förekomma. (2007:528 styr granskarens dom; texten behöver inte citera det.)
- **Disclaimer:** sista bodyraden är den negerade standardformeln "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓.

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i title + description + body.

## 5. Länkar — 8/8 interna levande, verifierade två vägar

| Länk | HTTP mot localhost:3000 | Fil/register |
|---|---|---|
| /kurser/ln-01-dupont-analysen | 200 | larvag-karta.ts ✓ |
| /kurser/v07-bruttomarginal | 200 | larvag-karta.ts ✓ |
| /kurser/km-039-pharmasektorn | 200 | larvag-karta.ts ✓ |
| /blogg/roic-den-glomda-nyckeltalen-v11 | 200 | LIVE-fil i data/blogg/ ✓ |
| /blogg/branschmedianer-akm2 | 200 | LIVE-fil ✓ (spannkällan i §2) |
| /blogg/hur-raknar-man-roe | 200 | LIVE-fil ✓ |
| /dataset | 200 | rot-sida ✓ |

Externa källor levande: fda.gov HTTP 302 · ema.europa.eu HTTP 301 (redirects till startsidor — inte döda; kontrollera redirectmål vid publicering enligt NIKE/holmen-precedensen). Kontrast: inget hem.sandvik.com-fall (industri-granskningens döda länk).

## 6. Struktur och metadata

- Body 853 ord (mx1-KVD-band 800–1200 ✓) · 7 `##`-rubriker · disclaimer sist ✓.
- **readingMinutes 3 → 4 (B4):** 853 ord på 3 minuter = 284 ord/min — **snabbare än samtliga 55 publicerade poster** (snabbaste: v09-roe 229 ord/min; grannar kring 853 ord: 4–8 min, tyngdpunkt 4–5). Enligt substansrabatt-domen (s1-u2 09-17, prissatt mot publicerad praxis): bloggfamiljen följer ~ord/200 — 0/55 följer ord/600, som är SEO-guiderfamiljens kontrakt. round(853/200) = 4. **Omvänd felriktning mot seriens tidigare systematik** (överskattning) — första dokumenterade fallet av underskattning, se systemflagga F2.
- Title 75 tkn — inom publicerad praxis (max 84, 13/55 över 60; substansrabatt-precedensen) ✓. Description 193 tkn — inom praxis (max 240, 17/55 längre) ✓.
- publishedAt 2026-09-15 = skapandedatum → D1 (exportvägen stämplar; publicering = kundens beslut, R2).
- Två stavfel i genomläsningen → B5 ("klipphan" → "klippan", patentklippan) + B6 ("När fallen de största patenten?" → "När faller …", verbform).

## 7. Flaggor

1. **Till sammanställningsägaren:** GRANSKNINGSKO-SAMMANSTALLNING.md saknar fortfarande mx1-serien som rader (energi #1, finans #2, material #3, hälsa #4 = denna granskade; konsument #5 väntar) — samma flagga-familj som s1-u1:notisen 09-17. Branschguide-sektionen bär endast 2 av ~27 rader.
2. **SYSTEMFLAGGA åt serien (läs före nästa mx1/gransk-våg):** tidigare mx1-rättningar av readingMinutes (energi/material/finans: 3→2 vid 935–1 250 ord mha "600-kontraktet") bygger på **fel släkts kontrakt** enligt substansrabatt-domen — 985 ord på 2 min = 493 ord/min slår samtliga publicerades maximum 229. Finans #2:s verkställda C3 (2) och övriga ~600-baserade värden är troligen **underskattade** och bör omprövas mot ~ord/200-praxis av respektive ägare vid nästa våg. Denna granskning tillämpar redan rätt släkts praxis (B4).
3. **Till fabriks-/dataägaren:** universumglidningen — 115 (utkastets underlag) → 165 (dagens träd); vid eventuell regenerering blir hälsopopulationen större med andra medianer. Utkastet är korrekt mot sitt egna underlag och behöver ingen åtgärd idag.
4. **Notis:** bruttomarginal-jämförelsen fastighet/hälsa är utkastets egen jämförelsegrund (universumets nyckeltalsmedianer) — fastighetsbruttot ur Yahoo-definitionsfamiljen (hyresintäkter med kärnhyresnetto-aktie i "brutto") gör kontrasten pedagogiskt användbar i B1-rättningen, inte bara en teknisk rankfix.

## 8. Könotis åt nästa omgång

Ogranskade i spåret just nu: mx1 #5 `konsumentbolagens-skuldsattning` (09-15 23:54, sist i serien), därefter ~24 branschguider (konsumentaktier/halvledare/tillväxt 09-16 02:1x äldst, sedan saas/spel/bil 09-16 08:5x, försvar/detaljhandel/flyg 09-16 15:3x, försäkring/media/livsmedel 09-16 22:1x, e-handel/lyx/fastighet-en 09-17 03:2x, -en-speglarna 09-17) + kvartalspaket utan granskningsfil (Volvo Car, SKF, Atlas Copco, ABB, Handelsbanken, Swedbank, Essity, Alfa Laval, Wallenstam, Volvo Group, Tele2, NP3, Castellum, Iberdrola, Saab, Telia, Boliden, Hydro, SCA, Yara, AT&T, BSX, SAP, Samsung, Novo). Kollisionskontroll mot worklog + granskningsmapp + anspråksfiler före start.
