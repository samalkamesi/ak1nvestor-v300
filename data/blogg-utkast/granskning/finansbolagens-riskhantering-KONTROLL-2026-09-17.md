# KONTROLL-GRANSKNING 2026-09-17 — Riskhantering inom finans (mx1 #2)

**Objekt:** `data/blogg-utkast/finansbolagens-riskhantering.json` (mx1-aspektserien #2, commit `806f9359` 2026-09-15 23:57 — "finans+riskhantering"; status utkast)
**Granskad av:** fabrik auto-s1-u1 (agentfabrik spår 1, 1/3), 2026-09-17 — klaim `a36ad0de` FÖRE arbetet (raceskydd mot syskon 2/3+3/3 med identisk malltext)
**Bedömning: FLYTTKLAR EFTER 3 RÄTTNINGAR** (C1+C2: superlativen "universumets bredaste spann" falsk på båda sina platser — konsument 19–70 är bredare; C3: readingMinutes 3→2) **+ 3 frivilliga förslag** (D1 title 79 tkn, D2 description 206 tkn, D3 publishedAt). Innehållet i övrigt grönt hela vägen: samtliga siffror oberoende omräknade och EXAKTA, juridiken ren på tre vägar, 911 ren, 8/8 länkar levande. Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #1" (boerspsykologi-fallstugor) är komplett sedan 2026-09-16 01:10 — hela m9-ko-serien 6/6 klart samma dag (KONTROLL-filer för alla sex slugar). Enligt spårets köregel valdes nästa icke levererade: mx1-seriens #2 finans+riskhantering i commit-ordning (`806f9359`: energi #1 granskad 09-16, **finans #2 = denna**, material #3 granskad 09-16, hälsa #4 + konsument #5 lämnas fria). Klaimraden committades före granskningsarbetets start.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Utkast-JSON:en lämnas orörd; rättningarna levereras som diff-poster (`finansbolagens-riskhantering-diff.json`, samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — rätt filversion låst och verifierad

Utkastet anger "Bolagsuniversumets publika nyckeltal (september 2026; källor Yahoo Finance och MarketStack)". Universumfilen växer kontinuerligt (dagens träd: **159** bolag) — granskningen låste därför **exakt den version som gällde vid bygget**: `git show 806f9359:data/portfolj-system/bolagsunivers.json` (utkastets egen commit, 09-15 23:57).

| Kontroll | Resultat | Dom |
|---|---|---|
| Antal bolag @ 806f9359 | 115 (dagens träd 159 — B13-glidningen, se flaggor) | ✓ utkastets underlag |
| Källor i filen | Yahoo Finance + MarketStack, `hamtat: 2026-09-03` på grundraderna | ✓ textens källhänvisning ordagrant |
| Finansbranschens bolag | 12: Berkshire Hathaway, Goldman Sachs, Investor, JPMorgan, Latour, Nordea, Öresund, SEB, Handelsbanken, Swedbank, HSBC, EQT | ✓ "finansbranschens 12 bolag" |

## 2. Siffror — oberoende omräkning (sond `.zcode/granskning-mx1-finans.mjs`, 24+ kontroller)

Medianmetod: peer-kontraktet (jämnt antal ⇒ medel av de två mittersta) — samma kontrakt som branschmedianer-serien redovisar öppet.

| Påstående i utkastet | Omräkning ur källfilen @ 806f9359 | Dom |
|---|---|---|
| 12 bolag i finansbranschen | 12 | ✓ |
| Median ROE 14,6 % (12 mätta) | (14,08 + 15,02)/2 = **14,550 %** → halv-upp 14,6 | ✓ — gränsvärde, se flagga F4 |
| Median P/B 2,0 (12 mätta) | (1,95 + 2,07)/2 = **2,006** → 2,0 | ✓ |
| Median P/E 14,1 (12 mätta) | (13,79 + 14,37)/2 = **14,081** → 14,1 | ✓ |
| Median nettomarginal 39,2 % | (37,80 + 40,58)/2 = **39,190** → 39,2 | ✓ |
| Skuld/EK "endast 1 av 12 mätta" | 1 mätt — EQT AB; 11 null | ✓ och textens förklaring ("strukturen, inte datafel") träffar |
| Investmentbolagen Investor, Latour, Öresund, Berkshire, EQT | 5/5 i finansbranschgruppen @ 806f9359 | ✓ |
| AKM2-poäng "mellan 30 och 80 … från Nordea Bank till Investor" | Publicerad `data/blogg/branschmedianer-akm2.json`: "finans — median 41 · spridning 30–80 (lägst Nordea Bank, högst Investor)" | ✓ ordagrant mot den post utkastet hänvisar till |
| "universumets bredaste spann" (2 platser) | Spannbredder ur samma publicerade post: **konsument 19–70 = 51 poäng > finans 30–80 = 50 poäng** | ✗ FALSKT med en poängs marginal → C1+C2 |
| "högst eller lägst"-påståenden i övrigt | saknas (texten gör ingen annan universums-superlativ) | ✓ |
| "Nettomarginalen 39 procent" (fällsektionen) | 39,190 → 39 | ✓ konsistent avrundning |

Rådata-notis (opåverkar domarna ovan): P/B-seriens ytterligheter i underlaget bär två anomalier — Berkshire 0,001 och Nordea 21,5 (Nordeas verkliga P/B ~2-klass) — men mittersta-par-kontraktet gör medianen immun och texten påstår inget om P/B-yterligheterna. Flagga F3 till dataägaren.

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN på tre vägar

- **Mekanisk juridikgrind:** `verktyg/juridikgrind-vakt.mjs --json` körd 2026-09-17: filen i dokumentregistret (typ seo-json), **`grund: true`, 0 fynd** — positiv dom ur registret, inte bara frånvaro av fynd.
- **Varumärkesgrind** (kontrolleraText-replik, `data/varumarke.json`s samtliga 26 regexer på title + description + body): **0 FEL, 0 VARNINGAR**.
- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/garanterad avkastning): 0 äkta träffar. De två "köp "-träffarna är "återköp " (substantiv om bolagens återköp i kapitaltäckningsmeningen) — bekräftad falsk positiv, B8-precedensen. Texten håller utbildningsformen hela vägen ("Så läser du", "vad bolagsuniversumets … nyckeltal säger", "fem steg").
- **Lagrum:** inga svenska lagrum åberopas — Basel, Finansinspektionen, IFRS 9, LCR och CET1 är regelverk/begrepp, inte lagrum ⇒ den förbjudna lagrumsblandningen kan inte förekomma. (2007:528 styr granskarens dom; texten behöver inte citera det.)
- **Disclaimer:** sista bodyraden är den negerade standardformeln "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓.

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "Terrordåd") i title + description + hel body.

## 5. Länkar — 8/8 levande, verifierade två vägar

| Länk | HTTP mot localhost:3000 | Fil/register |
|---|---|---|
| /kurser/km-040-banksektorn | 200 | kursregistret ✓ |
| /kurser/am-01-likviditet-och-spread | 200 | kursregistret ✓ |
| /kurser/ib-01-vad-ar-ett-investmentbolag | 200 | kursregistret ✓ |
| /kurser/rs-01-volatilitet-och-risk | 200 | kursregistret ✓ |
| /blogg/hur-raknar-man-roe | 200 | LIVE-fil i data/blogg/ ✓ |
| /blogg/pb-tal-nar-jamfor-man-bokvarde-ratt | 200 | LIVE-fil ✓ |
| /blogg/branschmedianer-akm2 | 200 | LIVE-fil ✓ (spannkällan i §2) |
| /dataset | 200 | rot-sida ✓ |

Externa källor live: fi.se 200 · bis.org 200.

## 6. Struktur och metadata

- Body 6 995 tecken (≥ 800) · 7 `##`-rubriker (≥ 2) · 985 ord · disclaimer sist ✓.
- **readingMinutes 3 → 2** (C3): 985 ord ÷ 600 = 1,64 ⇒ 2 enligt plattformskontraktet — SJÄTTE instansen av mx1/branschguide-systematiket (lakemedels, ravarubolag, teknik, material, nu finans; ravarubolag bär det fortfarande i trädet).
- Title 79 tkn (mx1-seriebeslutet 70–84, men Google trunkerar ~60) → D1. Description 206 tkn mot SEO-normen ~150–160 → D2. publishedAt 2026-09-15 = skapandedatum → D3 (exportvägen stämplar; R2).

## 7. Flaggor

1. **Till sammanställningsägaren:** GRANSKNINGSKO-SAMMANSTALLNING.md saknar mx1-serien (finans #2 nu granskad; hälsa #4 + konsument #5 väntar) — samma flagga-familj som s1-u1/s1-u3:s tidigare noteringar.
2. **Till fabriks-/dataägaren:** B13-glidningen — universumet 115 (utkastets underlag) → 159 (dagens träd); vid eventuell regenerering blir finanspopulationen 19 bolag med andra medianer. Utkastet är korrekt mot sitt egna underlag och behöver ingen åtgärd idag.
3. **Till dataägaren (spår 2):** P/B-rådataanomalier Berkshire 0,001 / Nordea 21,5 i 2026-09-03-insamlingen (median opåverkad; ingen text berörs).
4. **Gränsnotis:** ROE-medianen 14,550 % ligger exakt på avrundningsgränsen — "14,6" korrekt enligt halv-upp, men en framtida omräkning på annat underlag kan ge "14,5". Ingen åtgärd.

## 8. Könotis åt nästa omgång

Ogranskade i spåret just nu: mx1 #4 `halsobolagens-lonsamhet` + #5 `konsumentbolagens-skuldsattning` (09-15 23:54, syskonfria), `sa-tolkar-du-utdelningskalendern` (09-17 14:41, oclaimat enligt s1-u3:notis), därefter ~14 branschguider (flyg, försäkring, försvar, livsmedel, media, SaaS, spel, detaljhandel, e-handel, lyx, halvledare, konsument …) + 7 engelskspråkiga speglar. Kollisionskontroll mot worklog + granskningsmapp + klaimfiler före start.
