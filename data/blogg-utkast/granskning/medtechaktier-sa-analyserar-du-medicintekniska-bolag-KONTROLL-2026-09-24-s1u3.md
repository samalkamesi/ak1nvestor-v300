# KONTROLL — B24 medtechaktier (sv + en) — 2026-09-24, s1-u3

**Objekt**
- Svenskt original: `data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json` (1 193 ord, byggd av s3-u3 2026-09-21, commit-historia intakt i HEAD)
- EN-spegel: `medtechaktier-…-en.json` — **saknas i arbetsträdet efter reset till 6e15cbac (rond 158-mottagningen); granskad ur git-objektet fcff5f84** (commit 1a8d4301 "fabrik v161-u1 — medtech-guiden en-speglad"). Återskapning: `git checkout fcff5f84 -- data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-en.json` (samma klass gäller skog-en 188c8b47 och vård-en 4f4a4749 — se fynd F1).

**Pivot (öppen, duplikatregeln)**: ursprungstexten "m9-utkast #3" var redan levererad 2026-09-21 (m9-familjen 6/6 FLYTTKLAR; m9-3 kassaflodesanalys med fjärde pass + FLYTTKLART-PAKET på disk). Nästa icke-levererade objekt i spåret = B24, FIFO-etta bland ogranskade branschguider (skriven 09-21 22:23; B25–B27 09-22 lämnades åt syskonens presumtiva pivoter). Klaim disk-först: `data/vakten/auto-s1-1790235302376-s1-u3-ansprak-b24-medtech.md`.

**Dom: FLYTTKLAR EFTER RÄTTNING** — 7 poster sv + 2 poster en (5 språkfel + 2 källdatum/källkedja + 2 EN-följder). **Inga talfel.** Diff: `medtechaktier-…-diff-2026-09-24-s1u3.json`. Paket med rättningar applicerade: `medtechaktier-…-FLYTTKLART-PAKET-2026-09-24-s1u3.json` (sv) + `…-en-FLYTTKLART-PAKET-2026-09-24-s1u3.json` (en).

## 1. Tal mot rådata — 10/10 GRÖNA (källa: data/portfolj-system/bolagsunivers.json, fält lonksamhet/vardering/serier)

| Påstående i guiden | Källvärde | Dom |
|---|---|---|
| Hälso-grenen 25 bolag, 8 renodlad medicinteknik | bransch=halso → 25 rader; produktbolag BSX/CEVI/COLO/EKTA/GETI/AMBU/STMN/SOON = 8 | ✓ |
| Trappan Sonova 73,7 / Straumann 69,3 / BSX 69,2 / CellaVision 68,7 / Coloplast 67,2 / Ambu 60,1 / Getinge 48,6 / Elekta 39,6 | bruttoMarginal 0,7372/0,6926/0,6919/0,6871/0,6723/0,6011/0,4860/0,3960 | ✓ (Ambu 60,11 — noteringens djuptext "60,2" är endpoint-året; lonksamhet-fältet är det kanoniska och byggaragenten följde det) |
| Fresenius 25,4 / Attendo 36,9 | 0,2535 / 0,3690 (ATT-noteringens "31,2–36,0" är femårsspannet; senaste årets fält = 36,9) | ✓ |
| Spann 73,7 − 25,4 = 48,3 pp | 48,3 | ✓ |
| Median 8 produktbolag 68,0 | (67,23+68,71)/2 = 67,97 → 68,0 | ✓ |
| Getinge 2022→2025: 28 292→34 969 Mkr (+23,6 %), resultat 2 491→2 258 (−9,4 %), nettomarginal 8,8→6,5 | serier exakt; 0,23597/−0,09354; 8,806/6,456 % | ✓ |
| Median-P/E 30,0 (7 bolag, Elekta utan) | pe-värden 19,43/24,82/26,08/29,96/34,12/38,65/40,98 → median 29,96; EKTA pe=null (nettoMarginal −0,0218) | ✓ |
| Spann P/E BSX 19,4 → Straumann 41,0 (mer än dubbelt) | 19,426→40,98; kvot 2,11 | ✓ |
| EV/EBIT-median 18,8; BSX 17,1 / CEVI 24,7 / AMBU 24,1 | 18,80 exakt; 17,146/24,704/24,070 | ✓ |
| ROIC-median 15,0 | 15,02 | ✓ |
| Straumann EBIT-marginal 24,7, Elekta 10,5, mer än dubbelt | 0,2470/0,1049; kvot 2,35 | ✓ |
| Ambu omsättning +10,8 %/år under fem år | serier 2021–2025: 4 013→6 037 M DKK = endpoint-CAGR 10,75 % | ✓ (husets femårskonvention) |
| Sonova ROE 20,5 | 0,2052 | ✓ |

## 2. Aritmetik — 8/8 GRÖNA (egen omräkning)

68/32-exemplet: täckning 68 på pris 100; volym 100 → intäkt 10 000, täckning 6 800, fasta 5 200, resultat 1 600 = 16 %. +10 % volym → 68×110 = 7 480, resultat 2 280 = +42,5 % (4,25× volymökningen — "mer än fyra gånger" ✓). −5 % pris → intäkt 9 500, täckning 6 300 (9 500 − 3 200), resultat 1 100 = −31,25 % ("31 procent" ✓, "en tjugondel" = 5 % ✓).

## 3. Talparitet sv↔en — 102 = 102 multiset-identiska

Normaliserat (sv decimalkomma→punkt, tusentalsavgränsare bort): exakt samma talmultimängd. H2 6 = 6; interna länkar 12 = 12 identiska.

## 4. Länkar — 12 interna + 3 externa GRÖNA

- Interna (båda språk, MULTISET-likvärdiga): kurser km-009-pe, km-048-halsovardsektorn, km-069-orderbok-och-prissattning, ln-03-marginaltrappan-och-operativ-havstavng, mt-01-vad-ar-en-moat, roic-01-avkastning-pa-investerat-kapital, se-16-sektoranalysens-metod, v07-bruttomarginal, v18-regulatoriska (filer verifierade i data/seo/kurser + data/kurser-tillagg; ln-3:s "havstavng" är filens faktiska slug — länken korrekt) + blogg komplett-guide-svensk-aktieanalys-2026, peg-multipeln-svagheter-2026, v09-roe-analys (data/blogg/).
- Externa: eur-lex.europa.eu/eli/reg/2017/745/oj → 202; lakemedelsverket.se → 200; fda.gov/medical-devices → LEVANDE (curl får FDA:s bot-detektion 302→"abuse-apology" 404 — WebFetch bekräftar aktiv sidan "Medical Devices | FDA"; byggarens 200-rapport korrekt).

## 5. Juridik (2007:528) — GRÖN

- Rådverb SV+EN: 0 ("råd"-träffarna är disclaimerns "inte investeringsråd" och "aldrig råd om enskilda aktier" — korrekta negationer).
- Disclaimer exakt sista raden båda språken: "_Detta är pedagogisk finansanalys, inte investeringsråd._" / "_This is educational financial analysis, not investment advice._"
- Utbildningsform genomgående ("så analyserar du", "Så fungerar sambandet", "metoden är densamma som i"). "Handlas med premie / på vändningsförutsättningar" = marknadsbeskrivning, ej rekommendation (B25/B26-precedensen).
- MDR-blocket korrekt juridiskt: förordning 2017/745, riskklasser I–III, CE-märkning EES, Läkemedelsverket tillsyn i Sverige, FDA 510(k) "väsentligt likvärdig" (substantially equivalent). Inget lagrumsblandningsrisk (inga konsumenträttsliga lagrum i texten).
- 911-referenser: 0 träffar på 6 mönster (911/11 september/september 2001/9/11/terror/terrordåd) — båda språken.
- Varumärkesgrind: 0 träffar på förbjudna fraser — båda språken.

## 6. Metadata — GRÖN

| | SV | EN |
|---|---|---|
| title | 54/60 | 59/60 |
| description (OG) | 152/155 | 152/155 |
| ord i body | 1 193 | 1 448 |
| readingMinutes | 2 = round(1193/600) ✓ | 2 = round(1448/600) ✓ |
| sökord | "medtech-aktier" i title+ingress+3 H2 | "medtech stocks" i title+ingress+3 H2 |

## 7. Rättningar (diff, båda språken)

**Språkfel SV (5):** "sångomsättning"→"såromsättning" (EN:s "bed turnover" bygger på felstavningen och rättas till "wound care turnover"); "För det tredig"→"För det tredje"; "som sortera produkter"→"som sorterar produkter"; "byggda över årter"→"byggt över år" (EN "built over years" bekräftar avsikten); "audnologen"→"audiologen" (EN "audiologist" korrekt).

**Källdatum/källkedja (2, B25-precedensen):** ingressens och källradens "rådata 2026-09-03" gäller bara 6 av 10 bolag — Ambu/Straumann/Sonova är hamtat 2026-09-18 och Attendo 2026-09-17 (bolagsunivers.json); källkedjan saknar StockAnalysis (just de fyra bolagens källa). Rättas till "rådata 2026-09-03/17/18" + "Yahoo Finance/MarketStack/StockAnalysis med S&P-underlag" i båda språken.

**Stilnot (ingen post):** "Elekta saknar jämförbar vinstmultipel just där" / EN "just there" är avig lydelse i båda språken; föreslås "för närvarande"/"currently" vid nästa beröring — inte blockande.

## 8. Fynd utanför objektet

- **F1 (viktigt — till huvudagenten):** v161:s tre en-speglar (medtech-en, skog-en, vård-en; commits 1a8d4301/188c8b47/4f4a4749, topp fcff5f84) togs ur arbetsträdet när rond 158-mottagningen resettade HEAD till 6e15cbac. Filerna är committade i git-objekten men saknas på disk och i HEAD:s historia. Återskapning per fil: `git checkout fcff5f84 -- <sökväg>`. Denna granskning läser en-versionen ur git-objektet och levererar ett korrigerat en-paket — Originalfilen på disk återställs av huvudagenten (samordningsyta under aktiv rond; granskaren skriver inte i andras leveransytor).
- **F2:** syskonet s1-u1 granskar parallellt fastighetsaktier-en (staged filer i trädet) — noll kollisionsyta mot B24.

## KVD

- Rollen granskare: originalet/spegeln orörda; samtliga leveranser är NYA filer i granskning/.
- data-only (inget i src/) — INGET bygge; tsc-baslinjen bärs av pre-commit-grinden.
- R2 orörd: ingen publicering (data/blogg/ orörd), inga priser/tier; paketen anger "publicering = kundens beslut".
- 911-kontroll + varumärkesgrind + rådverb: 0/0/0.
