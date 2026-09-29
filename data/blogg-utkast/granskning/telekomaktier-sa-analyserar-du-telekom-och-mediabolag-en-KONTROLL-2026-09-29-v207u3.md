# Granskning: Telecom stocks — how to analyze telecom and media companies (branschguide, engelsk spegling)

**Granskad:** 2026-09-29 · **Granskare:** agentfabrik v207-u3 (manifest v207-saljberedskap-1789640600, spår granskningskön)
· **Objekt:** `data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag-en.json` (skapad 2026-09-17 14:04)
· **Diff-förslag:** `telekomaktier-sa-analyserar-du-telekom-och-mediabolag-en-diff-2026-09-29-v207u3.json`
· **Flyttfärdigt paket:** `telekomaktier-sa-analyserar-du-telekom-och-mediabolag-en-FLYTTKLART-PAKET-2026-09-29-v207u3.json` (samma mapp)

**BEDÖMNING: FLYTTKLART** — 0 blockerande fynd. 15/15 mekaniska kontroller
gröna, 73/74 tal i multiset-paritet med det granskade originalet (endast
avvikaren är en SONDARTEFAKT, se Sifferkontroll), juridiken ren, 911 = 0,
14/14 interna länkar HTTP 200 LIVE. Originalets enda dom-krävande rättning
(C1 riktningsordet "knappt"→"drygt") är MATEKORREKT löst i -en ("just over
five and a half years" — 1 ÷ 0,015 = 66,7 mån = 5,56 år). Diffen bär 1
förslag (D1p Netflix-termen), 1 kosmetisk parallell (D4p MHz-beteckning) och
en DÖDSBEVISAD notis om originalets D3-djuplänk. Paketet kräver inga
body-rättningar.

## Objektval och disjunktion

FIFO-nummer 2 av denna omgångs fem (se teknikaktier-rapporten för omgångens
objektvalsdoktrin): näst äldsta ogranskade -en-spegling (09-17 14:04), 0
tidigare granskningsfiler, ej live i data/blogg/, originalet granskat 2026-09-16
(s1-u2, KONTROLL + diff). Syskonen i v207 + worklogens aktiva spår rör inte
-en-familjen.

## Metod

Samma sond och samma sex steg som teknikaktier-rapporten (maskinell mekanik +
varumärkesgrind + sifferparitet + trebenslänkverifiering + genomläsning mot
originalets protokoll + juridikgrind). Originalets protokoll 2026-09-16
verifierade 6/6 externa källposter mot primärkällor (PTS ×2, GSMA, Ericsson,
Netflix, Spotify) och 8/8 räkneexempel — detta är -en:s verifierade underlag.

## Mekaniska kontroller — 15/15 GRÖNA

| Kontroll | Resultat |
|---|---|
| Schema | Exakt `BloggExportPost`-formen (9 fält, inga extra) ✓ |
| Slug | telekomaktier-sa-analyserar-du-telekom-och-mediabolag-en ✓ |
| readingMinutes | 2 = kontraktet: 1 427 ord ÷ 600 avrundat ✓ (originalets rm 2 — INTE 3-slippet — är speglat korrekt) |
| Rubriker | 9 st "##" (krav ≥ 2) ✓ |
| Disclaimer | "_This is educational financial analysis, not investment advice._" — sista raden ✓ |
| 911 | 0 träffar på 9 mönster ✓ |
| Rekommendationsverb | 0 träffar (EN+SV mönster) ✓ |
| Varumärkesgrind | 0/26 träffar ✓ |
| Sifferparitet | 73/74 (se not nedan — avvikaren är artefakt) ✓ |
| Bodylängd | 9 345 tecken ✓ |
| Tags | 5 st, engelska, ASCII ✓ |
| publishedAt | 2026-09-17 = skapandedatum → null i paketet (R2) ✓ |
| HTML-escapes / mjuka bindestreck | 0 / 0 ✓ |
| Titel | "Telecom stocks: how to analyze telecom and media companies" — familjemönster ✓ |
| Länkkonvention | Svenska kanoniska slugs (8 kurser + 6 /blogg) ✓ |

**Sifferkontrollens not:** enda multiset-avvikaren "900.21" är en
normaliseringsartefakt i sonden: -en skriver "the 900, 2100 and 2600 MHz
bands" där sondens engelska tusentalsregel slår ihop "900, 2100" — båda talen
(900, 2100, 2600) finns i originalets "900-, 2100- och 2600 MHz-banden".
Manuellt verifierat: alla 74 tal finns i originalet. Artefakten pekar dock på
en verklig FORM-skillnad → D4p (MHz-beteckning, nedan).

## Fynd — 0 blockerande; 1 förslag + 1 parallell + 2 notiser (se diff)

- **C1 MATEKORREKT.** Originalets enda dom-krävande rättning — "knappt fem
  och ett halvt år" → "drygt" (66,7 mån = 5,56 år = ÖVER 5,5) — är löst i
  -en från början: "just over five and a half years". Parallell med
  fastighetsaktier-fallet: översättningen rättare än originalet, som fortfarande
  bär "knappt" (overksatt, läst 09-29) — flaggas till originalets ägare.
- **D1p. "paying households"** — originalets D1-parallell: källans eget mått
  är "paid memberships". Talet (325 M+, Q4 2025) exakt; endast terminologin.
- **D4p. "900, 2100 and 2600 MHz"** — originalets D4-parallell: PTS:s egen
  beteckning är 900 MHz / 2,1 GHz / 2,6 GHz. Beloppet 4,2 mdr verifierat av
  originalets granskare mot PTS/TT.
- **N1 (R2).** publishedAt → null i paketet.
- **N2 — ORIGINALETS D3-DJUPLÄNK DÖD (dödsbevis 2026-09-29).** Originalets
  gransknings förslag D3 (djuplänk pts.se/radio/auktioner/genomfordna-auktioner/)
  verifierades levande 2026-09-16 men redirectar NU till PTS:s 404-sida
  (soft-404: kod 200, slutlig URL pts.se/404) — PTS har omstrukturerat.
  Originalets D3 ska INTE verkställas med gamla URL:en. -en bär rot-länken
  pts.se (200) och är oberoende av frågan. Notis i diffen.

## Juridik (lagen 2007:528): REN

- 0 förbjudna fraser, 0 rekommendationsverb (tabell ovan).
- Endast ETT lagrum i texten: "the Electronic Communications Act (2022:482)" —
  korrekt lagrum för elektronisk kommunikation inklusive kakreglerna (samma
  dom som originalets granskning: rätt lag, ingen lagrumsblandning — inga
  konsumentlagrum, inget 2007:528, inget 2005:59 i texten). PTS korrekt som
  tillsynsmyndighet.
- Bolagsnämningar (Telia, Tele2, Deutsche Telekom, Telenor, Netflix, Spotify,
  Meta, Viaplay) endast branschexempel utan omdömen; räkneexemplen påhittade
  ("an invented operator").
- Utbildningsformen genomgående deskriptiv metodik; disclaimer-sista-rad ✓.
  Not: -en saknar (liksom originalet) ingressens explicita
  "utbildning-aldrig-råd"-mening — originalets granskning dömde detta grönt
  (disclaimer + genomgående metodform räcker); -en i paritet.

## Länkar — 14/14 GRÖNA i TRE ben (även HTTP LIVE)

| Ben | Resultat |
|---|---|
| Slugar mot disk | 6/6 blogg-mål i data/blogg/ + 8/8 kursmål i deep-courses.json ✓ |
| HTTP mot localhost:3000 | 14/14 = 200 (2026-09-29) ✓ |
| Git-oförändradhet | Blogg-mål senast committade 09-13–09-14 — före -en:s skapande ⇒ oförändrade ✓ |

## Struktur och schema — grönt

Giltigt JSON; exakt BloggExportPost-form; 9 "##"-rubriker; 5 engelska tags;
titel enligt familjemönstret; inga HTML-escapes; 0 mjuka bindestreck.

## Nästa steg

1. Flytta paketet (inga body-rättningar krävs) — eller verkställ D1p/D4p
   koordinerat med originalets overksatta D1/D4 först.
2. Publicering = kundens beslut (R2).
3. N-notiser till originalets ägare: C1 ("knappt"→"drygt") + D1 + D4 overksatta
   i originalet; D3-djuplänken DÖD sedan PTS omstrukturerade — hitta ny
   mål-sida före ev. verkställande.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (15/15 grönt), 74/74 tal i
paritet mot granskat original (1 sondartefakt manuellt uppklarad), 14/14 länkar
200 LIVE + disk + git, juridik ren (1 lagrum, korrekt), 911 = 0, 0 blockerande
fynd, FLYTTKLART-PAKET levererat som ny fil — inga originalfiler ändrade av
granskaren.*
