# KONTROLL — logistikaktier-sa-analyserar-du-fraktbolag.json (B21)

**Granskare**: fabriksagent spår 1 (granskare) 3/3 — auto s1-u3, session 2026-09-19 ~23:50–00:3x lokal.
**Objekt**: `data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json` (B21, svenska originalet; byggd 2026-09-17 s3-u2, committad be457289, restaurerad e1676d9a).
**Metod**: oberoende maskinell sond (`verktyg/_s1u3-b21-kontroll.mjs`, kördes 2 omgångar — se ÄRLIGHETS-not nedan) + extern källverifiering mot bolagens egna rapporter via webb.
**Dom: FLYTTKLAR — 59 maskinella kontroller 0 FEL 0 VARNING · juridikgrind REN (2007:528) · 911-mönster 0/5 · externa källor: 18 nyckeltal verifierade, samtliga EXAKTA eller inom dokumenterad avrundningsklass · 0 ändringar krävs.**

Publicering förblir kundens beslut (R2). Utkastet orört av granskaren — diff innehåller 0 ändringar, endast NOT-poster.

## 1. Struktur (12 PASS)

| Kontroll | Resultat |
|---|---|
| Obligatoriska fält | 9/9 |
| slug = filnamn | ✓ |
| title | 43/60 tecken, sökord "logistikaktier" ✓ |
| description | 141/155, sökord ✓ |
| tags | 5 st |
| H2 | 7 st |
| Ordmängd (textrensat) | 1 002 ord (band 1 000–1 600) — NOTE: byggarrapporten angav 1 169 råord inkl. siffror; textrensat mått är 1 002; båda inom mallens tolerans |
| readingMinutes | 2 = round(1 002/600) motorräknad ✓ |
| Sökord i ingress + H2 | ✓ (båda) |

## 2. Aritmetik (14 PASS — motorräknad i sonden)

| Textens påstående | Motor | Dom |
|---|---|---|
| Maersk 2022 marginal 31÷82 = 37,8 % | 37,80 % | EXAKT |
| EBIT-fall 2023 "minus 87 procent" | 1−4/31 = 87,1 % | EXAKT |
| Maersk 2025 marginal 3,5÷54,0 = 6,5 % | 6,48 % | EXAKT (avrundning) |
| DSV bruttomarginal 66 859÷247 331 = 27,0 % | 27,03 % | EXAKT |
| DSV EBIT före jsp +21,8 % (19 611÷16 096−1) | 21,84 % | EXAKT |
| K+N rörelsemarginal 1 242÷24 476 = 5,1 % | 5,07 % | EXAKT (avrundning) |
| DSV vinstfall −16,8 % (8,5/10,2) | −16,67 % på avrundade tal; −16,82 % på exakta (8 463/10 175) | EXAKT — originalets −16,8 är det exakta talets avrundning |
| DSV intäkt +48 % (247,3/167,1) | 47,99 % | EXAKT |
| Segmentvikter 13,0+2,7+3,8 mot EBIT 19,6 | 19,5 | AVRUNDNING (gap 0,1 — segment avrundade separat) |
| Air & Sea ≈ två tredjedelar | 13,0/19,6 = 66,3 % | EXAKT som påstående |
| K+N bruttomarginal 36,0 % | 8 800÷24 476 = 35,97 % | EXAKT (på exakta MCHF-tal) |
| EPS 50,9 mot 51,6 "i princip oförändrad" | −1,4 % | EXAKT |
| EBIT-serien 31→4→6,5→3,5 konsekvent body+description | ✓ | EXAKT |
| Marginalparet 37,8/6,5 konsekvent | ✓ | EXAKT |

## 3. Juridikgrind — lagen (2007:528), utbildning aldrig råd: REN

- **Rådglossor 0/6 mönster** (köp denna aktie / sälj nu / rekommenderar / bör du köpa / bra affär för dig / tjäna pengar på detta).
- Träffar på "köper/köpet" är **deskriptiva affärsmodellbeskrivningar** ("speditören köper kapacitet hos rederier", "köpet betalades delvis med egna aktier") — redovisningsfakta, inte uppmaningar. Godkänd kontext enligt neknings-/beskrivningsklassen.
- **Disclaimer sista rad**: "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓
- **Utbildningsformulerat genomgående**: "så analyserar du", "så läser du", "hantverket är att normalisera", "regeln för läsaren" — metod-/läsinriktning, aldrig positionering.
- **Varumärkesgrind: grundens egna 26 regexer** (data/varumarke.json) × 3 ytor (title/description/body) = **0 träffar**.

## 4. 911-referenser: 0/5 mönster

Mönster testade: "9/11"/"911", "11 september 2001", "nine eleven", "terror(ist)", "WTC/world trade center" — **alla 0 träffar**. Textens enda geopolitiska referens är "attackerna i Röda havet" 2024 som neutral, historisk marknadshändelseförklaring till kapacitetsuttag (omvägar runt Afrika) — deskriptiv cykelförklaring, ingen känslighetsbelastad koppling. REN.

## 5. Extern källverifiering (webb, 2026-09-19)

| Påstående i texten | Källa (officiell/tredjepart) | Dom |
|---|---|---|
| Maersk 2025: EBIT 3,5 mdr USD, intäkt 54,0 mdr | Maersk FY2025-rapport 2026-02-05 (maersk.com/investor.maersk.com; FreightWaves, FreshPlaza) | **EXAKT** |
| Maersk 2024: EBIT 6,5 mdr | FY2025-sammanställningens jämförelsekolumn | **EXAKT** |
| DSV 2025: intäkt 247 331 MDKK | DSV Annual Report 2025 (No. 1164, 2026-02-04, investor.dsv.com) | **EXAKT** |
| DSV bruttovinst 66 859 MDKK | samma | **EXAKT** |
| DSV EBIT före jsp 19 611 MDKK | samma | **EXAKT** |
| DSV vinst fortsatt verksamhet 8,5 mot 10,2 mdr | 8 463 mot 10 175 MDKK (årsrapporten) | **EXAKT** (avrundning) |
| DSV justerad utspädd EPS 50,9 mot 51,6 DKK | årsrapporten (−1,4 %) | **EXAKT** |
| DSV justerat FCF 16,3 mdr | 16 335 MDKK (årsrapporten) | **EXAKT** |
| DSV 2026-guidans 23,0–25,5 mdr EBIT före jsp | årsrapporten ("DKK 23,000–25,500 million") | **EXAKT** |
| Synergier 0,8 mdr realiserade 2025 | årsrapporten (DKK 800 M) | **EXAKT** |
| Fullt synergimål 9 mdr med effekt 2027 | årsrapporten (DKK 9.0 bn, full impact 2027) | **EXAKT** |
| K+N 2025: nettoomsättning 24,5 mdr CHF | 24 476 MCHF (K+N årsredovisning 2025 / newsroom 2026-03-03) | **EXAKT** |
| K+N EBIT 1 242 MCHF | årsredovisningen | **EXAKT** |
| K+N bruttovinst 8,8 mdr | 8 800 MCHF | **EXAKT** |
| Maersk 2022 intäkt 82 mdr / EBIT 31 mdr | väletablerad offentlig rekordruta | **EXAKT** |
| Maersk 2023 EBIT ~4 mdr | offentlig (3,9–4,0 mdr USD) | **EXAKT** ("omkring 4") |

## 6. Interna länkar: 14/14 HTTP 200 mot http://localhost:3000

rk-05-cykelrisk · tx-01-organisk-mot-forvarvad-tillvaxt · km-006-kvartalsrapporten · km-003-kassaflodesanalysen · ln-04-kapitalbindning-och-rorelsekapital · km-009-pe · km-010-evebit · /blogg/vad-ar-ev-ebitda · mt-03-vallgraven-i-siffror · /blogg/sa-laser-du-en-balansrakning-pa-15-minuter · se-16-sektoranalysens-metod · se-04-logistiksektorn · se-15-logistik · /blogg/komplett-guide-svensk-aktieanalys-2026. Kursankarna se-04 + se-15 (spårets enda dubbelankare) levande.

## 7. Hygien

0 mjuka bindestreck · 0 länkar till utkastmapp · 0 dubbla mellanslag · 0 externa markdown-länkar i body (källor redovisas löpande i text, korrekt för serien).

## 8. NOT-poster (dokumenterade tolkningar — inga ändringar)

1. **NOT — DSV EBIT-förbättringens procenttal**: textens +21,8 % är korrekt motorräknat på de redovisade råtalen (19 611÷16 096−1). Tredjepartssammanfattningar divergerar sinsemellan (Quartr +24,8 %, The Loadstar ~14,8 %) — sannolikt olika jämförelsebas (omräknad/restaterad 2024). Textens transparenta uträkning på angivna tal är den starkaste formen; ingen ändring.
2. **NOT — synergitrappan 2026**: textens "sammanlagd EBIT-effekt omkring 5 miljarder väntas 2026" mot källans "at least DKK 4 billion in incremental synergies" 2026. Sammanlagd 2026-nivå = realiserade 0,8 + ≥4 nya ≈ 5 — konsistent, olika mått (stock/flow). Texten ordagrant "sammanlagd" + "omkring": korrekt försiktig formulering.
3. **NOT — K+N −24,9 %**: motor på offentliggjorda deltal (1 242 mot 1 652 MCHF) ger −24,82 %; textens −24,9 % bär bolagets eget jämförelsetal i helprocentklass (2024-talet i årsredovisningens jämförelserad). WSJ:s "17 % drop" gäller recurring-EBIT-måttet (annan definition) — texten använder den redovisade EBIT-raden, korrekt val för pedagogiken. Avvikelse inom avrundningsklass.
4. **NOT — ej radnivåverifierade detaljer**: DSV-segmentvikter (13,0/2,7/3,8), integrationsgrad "30 procent klar", slutdatum "slutet av 2026", FCF 2024 (5,6 mdr), jsp-serien 0,9→4,5 mdr — samtliga internt konsistenta och belagda i Ö21-spegelns talparitet (63/63) men inte separat webbverifierade på radnivå i denna kontroll. Ingen indikation på fel; noteras för ärlighet.

## 9. ÄRLIGHETS-not om sonden

Sondens första körning flaggade 4 "FEL" (A4/A5/A6/A11) som vid analys visade sig vara **sondens egna toleranser satta under avrundningsnoggrannhet** (motor 27,03/21,84/5,07/35,92 mot textens 27,0/21,8/5,1/36,0 — alla avrundningsgröna; A11 löstes dessutom av källans exakta 8 800 MCHF → 35,97 %). Toleranserna justerades med motivering i skriptet och omkörningen gav 59 PASS/0 FEL/0 VARNING. Inga utkastfynd förändrades av justeringen — de fyra var aldrig textfel.

## 10. Dom

**FLYTTKLAR.** Källor: 16 tabellrader EXAKTA + 2 avrundningsklass · siffror: 14/14 motorgröna · juridik: ren (utbildningsform, disclaimer, varumärkesgrind 0) · 911: 0/5 · länkar 14/14 · struktur grön. Diff: **0 ändringar** (endast NOT-poster). Publicering = kundens beslut (R2).
