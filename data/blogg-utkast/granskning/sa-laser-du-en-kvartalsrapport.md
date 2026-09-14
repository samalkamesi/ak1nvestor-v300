# Granskning: sa-laser-du-en-kvartalsrapport

**Datum:** 2026-09-14 · **Granskare:** Agentfabrik-agent (omgranskning #2 — fullständig oberoende verifiering)
**Spec:** data/forskning/SEO-GUIDER-2026-09.md §7
**Utkast:** data/blogg-utkast/sa-laser-du-en-kvartalsrapport.json (v1, 2026-09-09 + rättning från granskning #1, commit 41e4ba3a)

## Bedömning: FLYTTKLAR (0 nya fynd, 0 rättningar denna omgång)

Publicering förblir kundens beslut (R2). Granskning #1 (2026-09-14, commit
41e4ba3a) gav FLYTTKLAR EFTER RÄTTNING med ett fynd — "träffkvot" i fel
betydelse — rättat till "konverteringsgrad". Denna omgranskning har verifierat
rättningen verkställd och kört samtliga fem kontroller om från noll: allt grönt,
inga nya fynd. Utkastet är redo att flyttas när kunden godkänner.

## Fyndlista

Inga nya fynd. Tidigare fynd, status:

- **FYND 1 (granskning #1) — MEDEL, RÄTTAT + VERIFIERAT:** "träffkvoten" →
  "konverteringsgraden" i sektionen "Ett exempel: från intäkt till marginal".
  Verifierat i JSON: "träffkvot" förekommer 0 gånger, "konverteringsgrad" 2
  gånger (båda i samma mening), ordantalet 815 bevarat, giltig JSON.

## Kontrollprotokoll (omgranskning #2 — alla mätvärden omräknade maskinellt)

### 1. SPEC — GRÖN

| Krav | Krav enligt plan | Faktiskt | OK |
|---|---|---|---|
| Slug | sa-laser-du-en-kvartalsrapport | samma | ✓ |
| Ord i body | 800–1400 | 815 (whitespace-split, maskinellt) | ✓ |
| Title | ≤ 60 tkn, sökord i H1 | 57 tkn, "kvartalsrapport" i title (=H1) | ✓ |
| OG-beskrivning | ≤ 155 tkn | 154 tkn | ✓ |
| Primärt sökord | H1 + ingress + 1 H2 | Title + rad 1 i body + H2 "Kvartalsrapporten steg för steg" | ✓ |
| Sekundära sökord | delårsrapport, rörelseresultat, jämförelsestörande poster | samtliga påträffade i body | ✓ |
| Pillar/Author | Institutionell metodik / AK1A Research Lab | samma | ✓ |
| Tags | kvartalsrapport, delårsrapport, rapportanalys, nyckeltal, fundamentalanalys | samma 5, i planens ordning | ✓ |
| readingMinutes | 1 | 1 | ✓ |
| BlogPost-form | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body | exakt de 9 fälten, inga extra | ✓ |
| Disclaimer sist | identisk med befintliga poster | sista raden "_Detta är pedagogisk finansanalys, inte investeringsråd._" — 40/55 publicerade poster bär identisk rad | ✓ |

### 2. FAKTA — GRÖN (alla räkneexempel omräknade till 4 decimaler)

- Tillväxt: 60 ÷ 940 = 6,3830 % → texten "6,4 procent" ✓
- Rörelsemarginal i år: 147 ÷ 1 000 = 14,700 % → "14,7" ✓
- Rörelsemarginal förra året: 131 ÷ 940 = 13,9362 % → "13,9" ✓
- Marginalutvidgning: 0,7638 procentenheter → "0,8 procentenheter" ✓
- Kassaflöde/rörelseresultat: 120 ÷ 147 = 0,8163 → "≈ 0,8" ✓ (term: konverteringsgraden — se fynd 1)
- Nettoskuld/EBITDA: 310 ÷ 210 = 1,4762 → "≈ 1,5" ✓
- **Ordlista (src/lib/ordlista.ts):** guidebegreppen (kvartalsrapport, delårsrapport,
  rörelsemarginal, nettoskuld, EBITDA, jämförelsestörande poster, konverteringsgrad)
  ligger utanför ordlistans deklarerade omfattning (UI-ord) — ingen motstridighet
  möjlig. Närmaste granne "EBIT-marginal = rörelseresultatet (EBIT) som andel av
  omsättningen" (ordlista.ts:1865) är exakt samma mått som guidens
  rörelsemarginal = rörelseresultat ÷ intäkter ✓
- Rapportläsningsmekaniken (intäkter → marginal → kassaflöde → balansräkning →
  segment → ledningskommentar → jämförelsestörande poster) stämmer med svensk
  praxis och länkade kursen km-006 Kvartalsrapporten.

### 3. LÄNKAR — GRÖN (5/5 = HTTP 200 mot localhost:3000, omcurlade denna omgång)

| Länk | Svar |
|---|---|
| /kurser/km-006-kvartalsrapporten | 200 |
| /kurser/km-003-kassaflodesanalysen | 200 |
| /kurser/km-004-noter | 200 |
| /blogg/sa-laser-du-en-svensk-arsredovisning | 200 |
| /blogg/sa-laser-du-en-balansrakning-pa-15-minuter | 200 |

Inga länkar mellan utkast — partiell publicering skapar inga 404:or ✓

### 4. JURISTEN — GRÖN

- Varumärkesgrinden kördes som exakt replik av kontrolleraText
  (src/lib/varumarke.ts:141 — samtliga 26 FORBJUDNA_FRASER ur
  data/varumarke.json, regex "giu", mot title+description+body):
  **0 FEL, 0 VARNINGAR**.
- Disclaimer sista raden i body, identisk med befintliga poster (se SPEC) ✓
- Inga lagrum nämns alls → inga blandade lagrum ✓
- Genomgående utbildningsformuleringar ("Så räknar du", "Kontrollen: läs …",
  namnlöst exempelbolag); inga uppmaningar om köp/sälj av enskilda aktier ✓
  Notera: "inte investeringsråd" i disclaimern är själva tillåtna formen —
  grindens regex träffar endast onegerat "investeringsråd".

### 5. SPRÅK — GRÖN

Svenska, rak pedagogisk ton, konsekvent du-tilltal, jargon förklarad vid
första förekomst ("träffkvot"-fallgropen borta; "konverteringsgrad" används
självförklarande i kontext). H2-strukturen logisk: innehåll → läsordning →
genomräknat exempel → två fallgropar → sammanfattning → nästa steg.

## Diff-rapport

Inga rättningar denna omgång — utkast-JSON:en orörd av granskning #2.
(Förra omgångens rättning, verkställd i commit 41e4ba3a:

```diff
-vilket ger träffkvoten 120 ÷ 147 ≈ 0,8. En träffkvot under ett är i sig inte fel
+vilket ger konverteringsgraden 120 ÷ 147 ≈ 0,8. En konverteringsgrad under ett är i sig inte fel
```
)
