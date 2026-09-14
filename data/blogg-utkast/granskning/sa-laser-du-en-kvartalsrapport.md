# Granskning: sa-laser-du-en-kvartalsrapport

**Datum:** 2026-09-14 · **Granskare:** Agentfabrik-agent · **Spec:** data/forskning/SEO-GUIDER-2026-09.md §7
**Utkast:** data/blogg-utkast/sa-laser-du-en-kvartalsrapport.json (v1, 2026-09-09)

## Bedömning: FLYTTKLAR EFTER RÄTTNING (1 fynd, 1 rättning — verkställd)

Publicering förblir kundens beslut (R2). Utkastet är i övrigt felfritt genom
samtliga fem kontroller; den enda bristen var en begreppsterm, rättad i
utkast-JSON:en.

## Fyndlista

### FYND 1 — MEDEL (RÄTTAT): "träffkvot" i fel betydelse

- **Läge:** Body, sektion "Ett exempel: från intäkt till marginal": "vilket ger
  träffkvoten 120 ÷ 147 ≈ 0,8. En träffkvot under ett är i sig inte fel …"
- **Problem:** Termen används om kvoten kassaflöde från löpande verksamhet ÷
  rörelseresultat. På sajten är "träffkvot" redan en etablerad term i **annan**
  betydelse — andelen vinnande affärer i trading-sammanhang (Tharp-expectancy-,
  Turtle- och Fibonacci-kurserna i public/deep-courses.json, t.ex. "ett system
  som träffar fyra gånger av tio", "35 procent träffkvot"). Samma ord för två
  olika begrepp missleder läsaren som gått trading-spåret.
- **Fakta i sak:** Räkningen är korrekt (120 ÷ 147 = 0,82 ≈ 0,8). Kursen
  km-003 Kassaflödesanalysen beskriver samma kvot utan termen träffkvot:
  "kassaflödet från den löpande verksamheten som en procentandel av operativ
  vinst".
- **Rättning (verkställd i utkast-JSON):** "träffkvoten" → "konverteringsgraden"
  och "En träffkvot under ett" → "En konverteringsgrad under ett" —
  etablerad svensk term för kassaflödeskvoten, konsekvent med km-003:s
  beskrivning. Ordantalet opåverkat (815).

## Kontrollprotokoll

### 1. SPEC — GRÖN

| Krav | Krav enligt plan | Faktiskt | OK |
|---|---|---|---|
| Slug | sa-laser-du-en-kvartalsrapport | samma | ✓ |
| Ord i body | 815 (mål 800–1400) | 815 | ✓ |
| Title | ≤ 60 tkn, "kvartalsrapport" | 57 tkn, innehåller | ✓ |
| OG-beskrivning | ≤ 155 tkn | 154 tkn | ✓ |
| Primärt sökord | H1 + ingress + 1 H2 | Title + ingress + H2 "Kvartalsrapporten steg för steg" | ✓ |
| Sekundära sökord | delårsrapport, rörelseresultat, jämförelsestörande poster | samtliga naturligt förekommande | ✓ |
| Pillar/Author | Institutionell metodik / AK1A Research Lab | samma | ✓ |
| Tags | kvartalsrapport, delårsrapport, rapportanalys, nyckeltal, fundamentalanalys | samma 5 | ✓ |
| readingMinutes | 1 | 1 | ✓ |
| SEO-kollision | inga kollisioner mot befintliga 55 poster | 0 titlar med "kvartals" | ✓ |
| Strukturgrind (blogg-utkast.ts) | ≥ 800 tkn, ≥ 2 H2, disclaimer sist | 6 H2, disclaimer sist | ✓ |

### 2. FAKTA — GRÖN (ruta för ruta verifierad)

- Tillväxt: 60 ÷ 940 = 6,38 % → "6,4 procent" ✓
- Rörelsemarginal: 147 ÷ 1 000 = 14,70 % → "14,7" ✓; förra året 131 ÷ 940 =
  13,94 % → "13,9" ✓; utvidgning 0,76 → "0,8 procentenheter" ✓
- Kassaflöde/rörelseresultat: 120 ÷ 147 = 0,82 → "≈ 0,8" ✓ (termen rättad, se fynd 1)
- Nettoskuld/EBITDA: 310 ÷ 210 = 1,48 → "≈ 1,5" ✓
- Ordlistan (src/lib/ordlista.ts): guidebegreppen ligger utanför ordlistans
  deklarerade omfattning (UI-ord). Närmaste definition — "EBIT-marginal =
  rörelseresultatet (EBIT) som andel av omsättningen" — är samma mått som
  guidens rörelsemarginal; ingen motstridighet.
- Rapportläsningsmekaniken (resultaträkning → kassaflöde → balansräkning →
  segment → noter) stämmer med svensk praxis och sajten km-006.

### 3. LÄNKAR — GRÖN (5/5 = HTTP 200 mot localhost:3000)

| Länk | Svar | Mål |
|---|---|---|
| /kurser/km-006-kvartalsrapporten | 200 | publicerad kurs |
| /kurser/km-003-kassaflodesanalysen | 200 | publicerad kurs (finns i public/deep-courses.json) |
| /kurser/km-004-noter | 200 | publicerad kurs |
| /blogg/sa-laser-du-en-svensk-arsredovisning | 200 | publicerad post (data/blogg/) |
| /blogg/sa-laser-du-en-balansrakning-pa-15-minuter | 200 | publicerad post (data/blogg/) |

Inga länkar mellan utkast; partiell publicering skapar inga 404:or ✓

### 4. JURISTEN — GRÖN

- Varumärkesgrindens samtliga FEL/VARNING-regexar (data/varumarke.json via
  kontrolleraText-logiken) körda mot titel+beskrivning+body: **0 FEL, 0 VARNING**.
- Disclaimer sista rad, identisk med befintliga poster:
  "_Detta är pedagogisk finansanalys, inte investeringsråd._" (40/55 publicerade
  poster bär samma rad) ✓
- Inga lagrum nämns alls → inga blandade lagrum ✓
- Genomgående utbildningsformuleringar ("Så räknar du", exempelbolag utan
  namn); inga uppmaningar om köp/sälj av enskilda aktier ✓

### 5. SPRÅK — GRÖN

Svenska, rak pedagogisk ton, konsekvent du-tilltal, ingen jargon utan
förklaring. H2-strukturen är logisk (innehåll → läsordning → exempel →
två fallgropar → sammanfattning).

## Diff-rapport (rättning i data/blogg-utkast/sa-laser-du-en-kvartalsrapport.json)

```diff
-vilket ger träffkvoten 120 ÷ 147 ≈ 0,8. En träffkvot under ett är i sig inte fel
+vilket ger konverteringsgraden 120 ÷ 147 ≈ 0,8. En konverteringsgrad under ett är i sig inte fel
```

Ett redigeringstillfälle, två termbyten i samma mening. Ingen annan ändring i
JSON:en — ordantal 815 bevarat, giltig JSON verifierad efter rättning.
