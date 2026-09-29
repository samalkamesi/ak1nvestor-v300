# Granskning: Tech stocks — how to analyze technology companies (branschguide, engelsk spegling)

**Granskad:** 2026-09-29 · **Granskare:** agentfabrik v207-u3 (manifest v207-saljberedskap-1789640600, spår granskningskön)
· **Objekt:** `data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag-en.json` (skapad 2026-09-17 07:44)
· **Diff-förslag:** `teknikaktier-sa-analyserar-du-teknikbolag-en-diff-2026-09-29-v207u3.json`
· **Flyttfärdigt paket:** `teknikaktier-sa-analyserar-du-teknikbolag-en-FLYTTKLART-PAKET-2026-09-29-v207u3.json` (samma mapp)

**BEDÖMNING: FLYTTKLART** — 0 blockerande fynd (0 A-poster). 15/15 mekaniska
kontroller gröna, 83/83 tal i exakt multiset-paritet med det granskade svenska
originalet, juridiken ren, 911 = 0, samtliga 18 interna länkar HTTP 200 LIVE
(driftläget grönt — till skillnad från fastighetsgranskningens OOM-fönster).
Diffen bär 2 förslag (D1p–D2p, engelska paralleller till originalets overksatta
D1–D2) + 1 R2-notis. Paketet kräver inga body-rättningar: originalets enda
dom-krävande rättning (C1 rm 3→2) är MATEKORREKT löst i -en, som bär rm 2.

## Objektval och disjunktion

Uppdragets "FEM nästa m9-utkast" — m9-ko-serien (6 utkast) är granskad, paketerad
OCH publicerad sedan 09-20/21 (fastighetsaktier-en-KONTROLLENS konstaterande,
verifierat mot m9-ko/index.json + granskningsmappen + live-mappen även denna
gång). FIFO bland icke levererade (mtime, samtliga med 0 tidigare
granskningsfiler och ej live): detta är den ÄLDSTA ogranskade -en-speglingen
(09-17 07:44; därefter telekom 14:04, konsument 14:07, industri 14:08, tillväxt
20:55 — samtliga bekräftade ogranskade vid start). Syskonen i v207 (u1 säljkarta,
u2 juridik-ytor, u4 konvertering) + worklogens aktiva spår (v206-u1 bokmaster,
nyttovalt-u1 dataset) rör INTE -en-familjen — disjunktion hel.

## Metod

1. Mekanisk genomgång med sond (node, /tmp/v207u3-kontroll.mjs): JSON-giltighet,
   schema mot `BloggExportPost` (src/lib/blogg-utkast.ts), ord/readingMinutes mot
   kontraktet (ORD_PER_MINUT = 600), rubriker, disclaimer-sista-rad,
   HTML-escapes, mjuka bindestreck, "911"-sökning (9 mönster, hela filen),
   rekommendationsverb (engelska + svenska mönster).
2. Plattformens egen textgrind replikerad: samtliga 26 förbjudna fraser ur
   `data/varumarke.json` mot titel + description + body + tags.
3. Sifferparitet: samtliga 83 tal i -en-bodyn maskinellt jämfora mot svenska
   originalets kropp (multiset, tusentals-/decimalnormalisering per språk).
4. Länkverifiering i TRE ben — samtliga gröna denna gång: slugar mot disk
   (kurser i public/deep-courses.json + bloggposter i data/blogg/), HTTP mot
   http://localhost:3000 (18/18 = 200, loopback-whitelistad bas), samt
   git-oförändradhet (blogg-målens senaste commit 09-09–09-14, ALLTSÅ FÖRE
   -en-filens skapande 09-17 och före originalets HTTP-verifikation 09-16).
5. Genomläsning mot originalets granskningsprotokoll 2026-09-16
   (teknikaktier-sa-analyserar-du-teknikbolag.md, s1-u2) — översättningens
   faktatrogna avbildning av det redan verifierade underlaget (14/14
   sifferkontroller, 6/6 externa källor inkl. Gartner 6,37 bn/+14,2 % och
   sanktionsnivåerna GDPR art 83(5) + DMA 10 %).
6. Juridikgrind-genomläsning (lagen 2007:528 — 2 kap 5 §: utbildning tillåtet,
   rådgivning kräver tillstånd).

## Mekaniska kontroller — 15/15 GRÖNA

| Kontroll | Resultat |
|---|---|
| Schema | Exakt `BloggExportPost`-formen (9 fält, inga extra) ✓ |
| Slug | teknikaktier-sa-analyserar-du-teknikbolag-en — URL-säker, -en-familjens suffix ✓ |
| readingMinutes | 2 = kontraktet: 1 423 ord (titel+desc+body) ÷ 600 avrundat ✓ |
| Rubriker | 7 st "##" (krav ≥ 2) ✓ |
| Disclaimer | "_This is educational financial analysis, not investment advice._" — sista raden, familjeform ✓ |
| 911 | 0 träffar på 9 mönster i hela filen ✓ |
| Rekommendationsverb | 0 träffar (EN: buy this stock/sell now/we recommend/you should buy/target price/must buy/best deal/strong buy/act now/don't miss + SV: köp denna/sälj nu/rekommenderar/bör du köpa/målkurs/målpris/undvik) ✓ |
| Varumärkesgrind | 0 träffar av 26 förbjudna fraser (data/varumarke.json) ✓ |
| Sifferparitet | 83/83 tal i -en finns i originalet (multiset) — 0 avvikare, 0 saknade ✓ |
| Bodylängd | 9 484 tecken (krav ≥ 800) ✓ |
| Tags | 5 st, engelska, ASCII ✓ |
| publishedAt | ISO-dag 2026-09-17 = skapandedatum → null i paketet (R2) ✓ |
| HTML-escapes / mjuka bindestreck | 0 / 0 ✓ |
| Titel | "Tech stocks: how to analyze technology companies" — -en-familjens mönster ("X stocks: how to analyze …") ✓ |
| Länkkonvention | Svenska kanoniska slugs (12 kurser + 6 /blogg) — identisk praxis i granskade -en-syskon ✓ |

## Fynd — 0 blockerande; 2 förslag + 1 R2-notis (se diff)

- **D1p. "In AK1A's hundred-company universe"** — originalets D1 (overksatt i
  originalet, läst 09-29) gäller oförändrat här: publicerade branschmedianer-
  guiden använder "korstabellens 100-bolagsuniversum" som normerad term och
  dateringen gör "högst AKM2-median" ärligt tidsbundet (marginal 0,5 poäng till
  konsument). Engelsk parallell i diffen; originalets granskare rekommenderar
  starkt — verkställ koordinerat sv+en.
- **D2p. Sinch i mjukvaruvärlden utan bandnotis** — originalets D2-parallell:
  Sinchs egen bruttomarginal i universumet är 18,4 % (CPaaS-trafikkostnader)
  mot bandet 70–85 i meningen före. Förslagsmening i diffen.
- **D3p. publishedAt** = skapandedatum — paketet bär null; dag sätts vid flytt
  (publicering = kundens beslut, R2).

**Matekorrekthet mot originalets dom:** originalets enda dom-krävande rättning
C1 (rm 3→2 enligt kontraktet) är redan löst i -en (bär 2 — översättaren följde
kontraktet). -en är därmed I FAKTISK PARITET med originalets skick förutom att
-en bär rätt rm medan originalet fortfarande bär 3 (originalets C1 overksatt —
dess ägares kö, se N-notis nedan).

## Juridik (lagen 2007:528): REN

- 0 träffar av plattformens 26 förbjudna fraser (varumärkesgrind, ovan).
- 0 rekommendationsverb på engelska eller svenska (tabell ovan).
- Bolagsnämningar endast deskriptiva: Sinch, Logitech, Truecaller, Ericsson,
  Nokia, ASM International — universumsurdrag/affärsmodellbeskrivningar utan
  värdeomdömen; räkneexemplen är påhittade och onämnda ("a company with ARR
  of SEK 1,000 million").
- Utbildningsramen explicit: "education in method, never advice about
  individual stocks" (ingress) + engelsk disclaimer på sista raden.
- Faktakärnan (Gartner 6,37 bn USD 2026 +14,2 %; GDPR art 83(5): 4 %/20 M€;
  DMA 10 %; AKM2 median 61, spann 37–78) oberoende verifierad av originalets
  granskning 2026-09-16 — oförändrad i -en, tal i exakt paritet (83/83).

## Länkar — 18/18 GRÖNA i TRE ben (även HTTP, denna gång LIVE)

| Ben | Resultat |
|---|---|
| Slugar mot disk | 6/6 blogg-mål finns som JSON i data/blogg/ + 12/12 kursmål i public/deep-courses.json ✓ |
| HTTP mot localhost:3000 | 18/18 = 200 ( verifierade 2026-09-29; driftläget grönt) ✓ |
| Git-oförändradhet | Blogg-målens senaste commits 09-13–09-14 — före -en:s skapande 09-17 och originalets 18/18-verifikation 09-16 ⇒ oförändrade sedan ✓ |

## Struktur och schema — grönt

Giltigt JSON; exakt BloggExportPost-form; body 9 484 tecken med 7 "##"-rubriker;
5 engelska tags; titel enligt -en-familjens mönster; svenska kanoniska interna
länkar enligt familjepraxis; inga HTML-escapes; 0 mjuka bindestreck.

## Nästa steg

1. Flytta paketet (eller verkställ D1p–D2p i utkastet först, koordinerat med
   originalets overksatta D1–D2, och regenerera paketet).
2. Publicering = kundens beslut (R2) — inget publiceras automatiskt.
3. N-notis till originalets ägare: originalets C1 (rm 3) + D1–D2 fortfarande
   overksatta i originalet (läst 2026-09-29).

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (15/15 grönt), 83/83 tal i
paritet mot granskat original, 18/18 länkar 200 LIVE + disk + git, juridik ren,
911 = 0, 0 blockerande fynd, FLYTTKLART-PAKET levererat som ny fil — inga
originalfiler ändrade av granskaren.*
