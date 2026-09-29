# Granskning: Consumer stocks — how to analyze consumer companies (branschguide, engelsk spegling)

**Granskad:** 2026-09-29 · **Granskare:** agentfabrik v207-u3 (manifest v207-saljberedskap-1789640600, spår granskningskön)
· **Objekt:** `data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag-en.json` (skapad 2026-09-17 14:07)
· **Diff-förslag:** `konsumentaktier-sa-analyserar-du-konsumentbolag-en-diff-2026-09-29-v207u3.json`
· **Flyttfärdigt paket:** `konsumentaktier-sa-analyserar-du-konsumentbolag-en-FLYTTKLART-PAKET-2026-09-29-v207u3.json` (samma mapp — bär B1p+B2p+C1p VERKSTÄLLDA)

**BEDÖMNING: FLYTTKLART MED 3 VERKSTÄLLDA RÄTTNINGAR** — detta är omgångens
enda -en-speglar som ärverkade originalets DOM-KRAVANDE innehållsfel: -en
speglade originalets tre väsentliga fynd från 2026-09-18 (B1 falsk
universums-superlativ, B2 falsst scoping i sammanfattningen, C1 datumfel för
sin egen mening) i oförändrad engelsk form. Paketet bär alla tre engelska
parallellerna verkställda. Mekaniken i övrigt 15/15 gröna, 87/87 tal i
multiset-paritet, 15/15 interna länkar HTTP 200 LIVE, juridik ren, 911 = 0.

## Objektval och disjunktion

FIFO-nummer 3 av fem (09-17 14:07), 0 tidigare granskningsfiler, ej live,
originalet granskat 2026-09-18 (s1-u1, "FLYTTKLAR EFTER RÄTTNINGAR" — B1–B4 +
C1). Disjunktion enligt teknikaktier-rapporten.

## Metod

Samma sond och sex steg som teknikaktier-rapporten. Originalets protokoll
verifierade 18 talpåståenden EXAKTA mot vintage 319a8b20 (universumträdet 120
bolag vid utkastets egen commit) + superlativmätningarna (LVMH rang 35 av 119;
Evolution 100,0 i samma bransch; teknik 28,68 > konsument 24,19) — detta är
-en:s verifierade underlag.

## Mekaniska kontroller — 15/15 GRÖNA

| Kontroll | Resultat |
|---|---|
| Schema | Exakt `BloggExportPost`-formen (9 fält, inga extra) ✓ |
| Slug | konsumentaktier-sa-analyserar-du-konsumentbolag-en ✓ |
| readingMinutes | 2 = kontraktet: 1 424 ord ÷ 600 avrundat ✓ (se B4-koordinering nedan) |
| Rubriker | 9 st "##" (krav ≥ 2) ✓ |
| Disclaimer | "_This is educational financial analysis, not investment advice._" — sista raden ✓ |
| 911 | 0 träffar på 9 mönster ✓ |
| Rekommendationsverb | 0 träffar (EN+SV) ✓ |
| Varumärkesgrind | 0/26 träffar ✓ |
| Sifferparitet | 87/87 tal i -en finns i originalet (multiset) — 0 avvikare ✓ |
| Bodylängd | 9 327 tecken ✓ |
| Tags | 5 st, engelska, ASCII ✓ |
| publishedAt | 2026-09-17 = skapandedatum → null i paketet (R2) ✓ |
| HTML-escapes / mjuka bindestreck | 0 / 0 ✓ |
| Titel | "Consumer stocks: how to analyze consumer companies" — familjemönster ✓ |
| Länkkonvention | Svenska kanoniska slugs (7 kurser + 8 /blogg) ✓ |

## Fynd — 3 verkställda i paketet + 3 notiser (se diff)

- **B1p (VERKSTÄLLT).** "LVMH's 66 percent gross margin is the universe's
  highest" — FALSK i utkastets eget underlag: rang 35 av 119 mätta, med
  Evolution i SAMMA bransch på 100,0. Paketet: "the highest among the sector's
  brand companies — only the platform company Evolution sits higher". Samma
  fyndklass som originalets B1 (dom-krävande).
- **B2p (VERKSTÄLLT).** Sammanfattningens "universe span 14–66 percent" —
  konsumentbranschens faktiska spann är 14,1–100,0 och universumets
  −1,1–100,0 i vintagen. Paketet scoper till branschens varumärkes- och
  handelsdel med Evolution explicit utanför.
- **C1p (VERKSTÄLLT).** "(universe raw data, retrieved 2026-09-15)" — 5 av
  meningens 6 tal är 2026-09-03-rader i vintagen; bara Axfood är 09-15.
  Paketet: "retrieved September 2026".
- **B3 — BEHÖVS EJ.** -en:description bär "the sector's high ROE" (mjuk form,
  sann — 24 % är hög) till skillnad från originalets "branschens högsta ROE".
  Översättningen mjukade formuleringen korrekt; ingen parallell krävs.
- **B4-koordinering.** Originalets rm-dom (2→7 enligt publicerad ~ord/200-
  praxis) gäller originalet; -en döms mot exportkontraktet round(ord/600) = 2
  GRÖNT enligt -en-familjens normerade precedens (fastighetsaktier-en
  2026-09-24, samma granskare som fällde originalets B4). Seriekonflikten
  ord/200 vs ord/600 är mall-/kodägarens fråga — bokförd, inte detta pakets.
- **D1p (R2).** publishedAt → null i paketet.

## Juridik (lagen 2007:528): REN

- 0 förbjudna fraser (26 mönster), 0 rekommendationsverb.
- Utbildningsramen explicit: "education in method, never advice about
  individual stocks" (ingress) + engelsk disclaimer sista raden.
- Bolagsnämningar (H&M, Inditex, Nike, LVMH, Nestlé, P&G, Essity, Axfood,
  Electrolux, Volvo Cars, McDonald's, Carlsberg, Evolution) endast
  universumsurdrag/affärsmodellbeskrivningar; per-bolag-talen är
  nyckeltalsfakta ur det granskade underlaget, inte omdömen — 87/87 i paritet
  med originalets verifierade tal.
- Inga lagrum i texten (Konjunkturinstitutet = myndighet, inte lagrum) —
  lagrumsblandning omöjlig.

## Länkar — 15/15 GRÖNA i TRE ben (även HTTP LIVE)

| Ben | Resultat |
|---|---|
| Slugar mot disk | 8/8 blogg-mål i data/blogg/ + 7/7 kursmål i deep-courses.json ✓ |
| HTTP mot localhost:3000 | 15/15 = 200 (2026-09-29) ✓ |
| Git-oförändradhet | Blogg-mål senast committade 09-13–09-14 — före -en:s skapande ⇒ oförändrade ✓ |

Externa källor: axfood.se/konj.se/hmgroup.com/lvmh.com/corporate.mcdonalds.com
— övertagna från originalets granskning (levande 09-18; hmgroup/lvmh 301-
redirects till startsidor = känd acceptklass).

## Struktur och schema — grönt

Giltigt JSON; exakt BloggExportPost-form; 9 "##"-rubriker; 5 engelska tags;
titel enligt familjemönstret; inga HTML-escapes; 0 mjuka bindestreck.

## Nästa steg

1. Flytta PAKETET (bär de tre rättningarna) — ej det råa utkastet, som
  fortfarande bär de tre felen.
2. Verkställ originalets B1/B2/C1 (fortfarande overksatta, läst 09-29)
   koordinerat så att sv/en inte divergerar.
3. Publicering = kundens beslut (R2).

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (15/15 grönt), 87/87 tal i
paritet mot granskat original, 15/15 länkar 200 LIVE + disk + git, juridik ren,
911 = 0, 3 dom-krävande innehållsparalleller verkställda i FLYTTKLART-PAKETET,
inga originalfiler ändrade av granskaren.*
