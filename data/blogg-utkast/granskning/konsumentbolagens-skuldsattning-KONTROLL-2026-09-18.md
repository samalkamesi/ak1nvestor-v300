# KONTROLL-GRANSKNING 2026-09-18 — Skuldsättning inom konsument (mx1 #5, seriens sista)

**Objekt:** `data/blogg-utkast/konsumentbolagens-skuldsattning.json` (mx1-aspektserien #5, commit `806f9359` 2026-09-15 23:57 — "konsument+skuldsättning"; status utkast)
**Granskad av:** fabrik auto-s1-u2 (agentfabrik spår 1, 2/3 av 3), 2026-09-18 — anspråk `data/vakten/auto-s1-1789713300301-u2-ansprak.md` 08:38 lokal FÖRE arbetet (raceskydd; 0 syskonutdata för omgången vid klagetidpunkten)
**Bedömning: FLYTTKLAR EFTER RÄTTNINGAR** (B1: superlativen "universumets högsta ROE" **falsk** — teknik 26,4 % > konsument 24,2 %, rank 2 av 10, två platser; B2: "skulden strukturell" mot bakgrund av Volvo Cars faktiska 0,31× — Electrolux 2,58× bär påståendet ensam; B3: räntetäckningsdefinitionen inverterad + "om året"-fel; B4: median kallas "genomsnitt" två gånger i samma mening; B5: readingMinutes 3→4) **+ 3 frivilliga förslag** (C1 Nestlé-spänningen, C2 ingress-ellipsen, C3 "moget växande"; D1 publishedAt-notis). I övrigt grönt hela vägen: **samtliga nio mediantal oberoende omräknade och EXAKTA** med korrekta n-redovisningar, AKM2-spannet ordagrant mot den egna källan — och spann-påståendet "en av universumets bredaste" är SANT (konsument 51 poäng = bredast av tio), juridiken ren, 911 ren, 10/10 interna länkar levande, externa källor levande. Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #2" är auto-platshållare — m9-ytan är komplett (m9-ko 6/6 sedan 09-16 14:35, commit 8448ef77; våg 171:s tre tillskott granskade 09-17). Hälsa-granskningens §8-könotis (inatt 03:40) erbjuder uttryckellt "mx1 #5 konsumentbolagens-skuldsattning … väntar" = detta objekt, även FIFO-äldst bland ogranseade rotguider (09-15 23:54). **Med denna leverans är mx1-serien 5/5 komplett granskad** (energi ✓ 09-16 · finans ✓ 09-17 · material ✓ 09-16 · hälsa ✓ 09-18 · konsument ✓ denna).

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster (`konsumentbolagens-skuldsattning-diff.json`; samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — rätt filversion låst och verifierad

Utkastet anger "Bolagsuniversumets publika nyckeltal (september 2026; källor Yahoo Finance och MarketStack)". Universumfilen växer kontinuerligt (dagens träd: **171** bolag) — granskningen låste **exakt den version som gällde vid bygget**: utkastets egen seriecommit `806f9359` (09-15 23:57) pekar mot `0e399f13` (09-15 20:31, **115** bolag) — samma vintagelås som syskongranskningarna av samtliga fyra tidigare mx1-posterna.

| Kontroll | Resultat | Dom |
|---|---|---|
| Antal bolag @ byggtid (0e399f13) | 115 (dagens träd 171 — glidningen, se flaggor) | ✓ utkastets underlag |
| Källor i filen | Yahoo Finance + MarketStack, `hamtat: 2026-09-03` | ✓ textens källhänvisning ordagrant |
| Konsumentbranschens bolag | 13: Carlsberg, Electrolux, Essity, H&M, Inditex, LVMH, McDonald's, Nike, P&G, Volvo Car, Evolution, Axfood, Nestlé | ✓ "konsumentbranschens 13 bolag" — spektrets namngivna tio är samtliga ur universumet (Carlsberg/Essity/McDonald's onämnda; utkastet namnger exempel, inte folkräkning) |
| Externa källor | riksbank.se 200 · fi.se 200 | ✓ levande |

## 2. Siffror — oberoende omräkning (sond `.zcode/granskning-mx1-konsument.mjs`)

Medianmetod: peer-kontraktet (jämnt antal ⇒ medel av de två mittersta) — samma kontrakt som branschmedianer-serien redovisar öppet.

| Påstående i utkastet | Omräkning ur källfilen @ 0e399f13 | Dom |
|---|---|---|
| Median skuld genom eget kapital 0,69× (12 mätta) | **0,6939×**, 12 mätta (McDonald's null) | ✓ EXAKT |
| Median ROE 24,2 % (12 mätta) | **24,19 %**, 12 mätta (McDonald's null) | ✓ EXAKT |
| Median bruttomarginal 45,7 % (13 mätta) | **45,70 %**, 13 mätta | ✓ EXAKT |
| Median nettomarginal 8,4 % (13 mätta) | **8,38 %**, 13 mätta | ✓ EXAKT |
| Median P/B 3,9 (12 mätta) | **3,94**, 12 mätta | ✓ EXAKT |
| Median P/E 20,4 (12 mätta) | **20,447**, 12 mätta | ✓ EXAKT |
| Kassaflödesavkastning 4,9 % (11 mätta) | **4,87 %**, 11 mätta (Carlsberg + Inditex null) | ✓ EXAKT |
| Femårsmedelväxt omsättning 1,4 % (12 mätta) | **1,35 %**, 12 mätta (Inditex: resultaträkningshistorik saknas hos källan) | ✓ EXAKT |
| Konsensusprognos 9,3 % (13 mätta) | **9,27 %**, 13 mätta | ✓ EXAKT |
| AKM2-poäng "mellan 19 och 70 — från Electrolux till H&M" | Publicerad `data/blogg/branschmedianer-akm2.json`: "konsument — median 60,5 · spridning 19–70 (lägst Electrolux, högst H & M Hennes & Mauritz)" | ✓ ordagrant mot den post utkastet hänvisar till |
| "en av universumets bredaste spann" | Spannbredder i samma artikel: konsument 51 · finans 50 · material 48 · energi 46 · teknik 41 · tillväxt 33 · industri 34 · kommunikation 29 · hälsa 20 · fastighet 18 — **konsument är bredast av tio** | ✓ SANN (försiktig formulering; med råge) |
| "universumets högsta ROE" (bullet + sammanfattning) | ROE-medianer per bransch @ 0e399f13: **teknik 26,4 > konsument 24,2** > industri 20,3 > hälsa 18,5 … — rank 2 av 10 | ✗ → **B1** (2 platser) |

**Superlativen — granskningens väsentligaste fynd (B1), mätt i utkastets eget underlag:**

| Påstående | Verkligheten (samma vintage) | Dom |
|---|---|---|
| "Median ROE: 24,2 procent (12 mätta) — universumets högsta." | Teknikens ROE-median 26,4 % (10 mätta) ligger över; konsument rank 2 | ✗ → B1a |
| "… och universumets högsta ROE på 24,2 procent — kombinationen förtjänar en DuPont-kontroll…" (sammanfattningen) | Samma | ✗ → B1b |

Rättningen följer finans-precedensens mönster: rangen rättas, kraften behålls ("näst högsta, efter teknikens 26,4" är dessutom mer lärorikt — teknikens kapitalsnåla plattformar kontra konsumentens varumärkesdrivna hävstång är precis den kontrast en DuPont-kontroll ska visa).

**Spektrumstyckets dataförankring — kontrollerad bolag för bolag:**

| Textpåstående | Data @ 0e399f13 | Dom |
|---|---|---|
| Varumärkesgrupperna (LVMH, Nike, P&G, Nestlé) "bruttomarginalen hög" | LVMH 66,4 · P&G 50,9 · Nestlé 45,7 · Nike 43,3 % (median 45,7) — 3 av 4 över medianen, Nike strax under | ✓ mjuk generalisering, försvarbar (C-notis för Nestlé-skulden, se C1) |
| "den som tjänar på varumärket behöver sällan låna för att växa" | LVMH 0,53 · P&G 0,64 · Nike 0,74× — men **Nestlé 2,13×** | ⚠ → C1 (frivillig nyans) |
| "Vitvaror och bilar — Electrolux och Volvo Car — … Här är skulden strukturell" | **Electrolux 2,58× = gruppens högsta ✓ — men Volvo Car 0,31× = näst lägst av 12 mätta ✗** (brutto 14,1 resp 15,6 % = kapitaltungt ✓) | ✗ → **B2** |
| Axfood "låga marginaler med extrem omsättningshastighet" | Källans egen radnotering: "dagligvaruhandel — tunna marginaler (brutto 14,8 %, EBIT 4,1 %, netto 2,7 %)" — ordagrant | ✓ UTSTÄNDT förankrad |
| "stabila kassaflöden bär mer skuld" (dagligvaruhandeln) | Axfood 2,24× — bland gruppens högsta | ✓ konsekvent |
| Evolution "marginalkostnaden nära noll och kapitalbehovet minimalt" | Skuld/EK 0,02× = gruppens lägst; bruttomarginalfältet 100 % är en källartefakt (radnoteringen varnar) som utkastet klokligen INTE citerar | ✓ |
| H&M/Inditex "lager … skillnaden mellan snabb och långsam omsättning" | H&M brutto 54,1 · Inditex 56,5 % — båda väl över medianen (varumärkespeng finansierar lagerkapital) | ✓ |
| "spridningen mellan bolagen är branschens hela poäng" | 0,02× (Evolution) till 2,58× (Electrolux) — hundrafaldig spannbredd | ✓ |

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/garanterad avkastning): 1 maskinell träff = "åter**köp**" ("urholkat av återköp och omvärderingar") — B8-precedensen, mekaniskt, inte rådgivning. **0 äkta träffar** i title + description + body. Texten håller utbildningsformen hela vägen ("Så prövar du", "sex steg", "Tre fällor", datasetet som subjekt).
- **Varumärkesmönster** (`data/varumarke.json`s strängar mot title + description + body): tre sonderträffar, samtliga falska positiva vid manuell granskning — "klass" i "modebolagets **klass**iska fallgrop", "gratis" i "En skuldfri balansräkning är inte **gratis**", "niva" i länk-URL:en `skuldsattningsgrad-vilken-niva-ar-farlig`. 0 äkta.
- **Lagrum:** inga svenska lagrum åberopas — IFRS 16 är regelverk, inte lagrum; Riksbanken och Finansinspektionen är myndigheter ⇒ den förbjudna lagrumsblandningen kan inte förekomma.
- **Disclaimer:** sista bodyraden är den negerade standardformeln "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i title + description + body.

## 5. Länkar — 10/10 interna levande, verifierade två vägar

| Länk | HTTP mot localhost:3000 | Fil/register |
|---|---|---|
| /kurser/ln-01-dupont-analysen | 200 | larvag-karta.ts ✓ |
| /kurser/st-01-soliditet-och-rantetackning | 200 | larvag-karta.ts ✓ |
| /kurser/ks-03-skuldens-anatomi | 200 | larvag-karta.ts ✓ |
| /kurser/km-023-leasing | 200 | larvag-karta.ts ✓ |
| /kurser/ks-02-kapitalallokering | 200 | larvag-karta.ts ✓ |
| /blogg/vad-ar-skuldsattningsgrad | 200 | LIVE-fil i data/blogg/ ✓ |
| /blogg/skuldsattningsgrad-vilken-niva-ar-farlig | 200 | LIVE-fil ✓ |
| /blogg/branschmedianer-akm2 | 200 | LIVE-fil ✓ (spannkällan i §2) |
| /blogg/skuldsattningsgraden-som-vag | 200 | LIVE-fil ✓ |
| /dataset | 200 | rot-sida ✓ |

0 utkastlänkar (guiden länkar endast publicerade ytor — korrekt inför flytt). Externa: riksbank.se 200 · fi.se 200.

## 6. Struktur och metadata

- Body **871 ord** (mx1-KVD-band 800–1200 ✓) · 6 `##`-rubriker · disclaimer sist ✓.
- **readingMinutes 3 → 4 (B5):** 871 ord på 3 minuter = 290 ord/min — snabbare än samtliga 55 publicerade poster (maximum 229 ord/min; grannposter kring 870 ord publicerade med 4–8 min). Bloggfamiljens praxis är ~ord/200 (substansrabatt-domen 09-17): round(871/200) = 4. **Andra fallet i serien av UNDERskattad lästid** (hälsa B4 var det första; den äldre systematiken var överskattning) — se systemflagga F2 hos hälsorapporten, som här upprepas.
- Title 84 tkn = exakt publicerad praxis-max (84; substansrabatt-precedensen) — inom span, ingen ändring krävs; frivillig förkortning möjlig vid nästa svep.
- Description 208 tkn — inom praxis (max 240) ✓.
- publishedAt 2026-09-15 = skapandedatum → D1 (exportvägen stämplar; publicering = kundens beslut, R2).
- Genomläsning: inga stavfel; däremot två begreppsliga/definitoriska fel som blivit B3–B4 och en elliptisk ingress → C2.

## 7. Flaggor

1. **SYSTEMFLAGGA åt mx1-fabriken (tredje dokumenterade fallet — nu statistik):** falska universums-superlativer i **3 av 5** mx1-utkast (finans C1+C2 "bredaste spann", hälsa B1–B3 "högsta brutto/P/B + trängaste spann", konsument B1 "högsta ROE"). Mallen skriver superlativer utan rankkontroll mot samma vintages övriga branschmedianer. Kur åt byggaragenten: mekanisk rankkontroll (medianen mot alla tio branschernas medianer i samma vintage) i genereringssteget, innan utkast släpps till kön — då faller hela fyndklassen bort.
2. **Till sammanställningsägaren:** GRANSKNINGSKO-SAMMANSTALLNING.md saknar fortfarande mx1-serien som rader — med denna granskning är serien 5/5 klar och kan bokföras som ett slutblock.
3. **Till fabriks-/dataägaren:** universumglidningen — 115 (utkastets underlag) → 171 (dagens träd); konsument 13 → 19. Vid regenerering blir populationen större med andra medianer. Utkastet är korrekt mot sitt eget underlag och behöver ingen åtgärd idag.
4. **Notis (dataägaren):** källfilens egna radnotering "serier/CAGR bygger på 4 räkenskapsår (källan ger 4, inte 5)" — utkastets "femårsmedelväxten" följer fältets kanonnamn (`omsattningCAGR5ar`) men underlaget är i praktiken fyra år. Serieprecedens (hälsa) = ingen utkastsrättning; notisen hör hemma hos dataägaren.
5. **Notis:** McDonald's saknar skuld/EK och ROE, Inditex saknar CAGR-serie, Carlsberg + Inditex saknar fcfYield — dessa nuller förklarar utkastets n-tal (12/12/13/13/12/12/11/12/13) och är korrekt redovisade.

## 8. Könotis åt nästa omgång

**mx1-serien är med denna leverans 5/5 komplett** — spårets m9/mx1-block är slutgranskat. Ogranskat i spåret just nu: (1) ~24 branschguider i rotkatalogen (konsumentaktier + halvledare + tillväxt 09-16 02:1x äldst, sedan saas/spel/bil 08:5x, försvar/detaljhandel/flyg 15:3x, försäkring/media/livsmedel 22:1x, e-handel/lyx/logistik 09-17); (2) -en-speglarna (saknar granskningspaket helt); (3) kvartalspaket utan granskningsfil: ABB, Alfa Laval, Atlas Copco, Boliden, Boston Scientific, Castellum, CellaVision, Essity, Evolution, Handelsbanken, Iberdrola, Nokia (byggd idag), Norsk Hydro, Novo Nordisk, NP3, Precise Biometrics, Saab, Samsung, Sandvik, SAP, Tele2, Telia, Volvo Group, AT&T m.fl. Kollisionskontroll mot worklog + granskningsmapp + anspråksfiler före start — denna omgångs syskon u1/u3 hade 0 utdata vid mitt anspråk 08:38.
