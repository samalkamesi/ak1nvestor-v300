# Granskning: Industrial stocks — how to analyze industrial companies (branschguide, engelsk spegling)

**Granskad:** 2026-09-29 · **Granskare:** agentfabrik v207-u3 (manifest v207-saljberedskap-1789640600, spår granskningskön)
· **Objekt:** `data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag-en.json` (skapad 2026-09-17 14:08)
· **Diff-förslag:** `industriaktier-sa-analyserar-du-industribolag-en-diff-2026-09-29-v207u3.json`
· **Flyttfärdigt paket:** `industriaktier-sa-analyserar-du-industribolag-en-FLYTTKLART-PAKET-2026-09-29-v207u3.json` (samma mapp)

**BEDÖMNING: FLYTTKLART** — 0 blockerande fynd. 15/15 mekaniska kontroller
gröna, 61/61 tal i exakt multiset-paritet med det granskade originalet,
juridiken ren, 911 = 0, 11/11 interna länkar HTTP 200 LIVE. Originalets BÅDA
dom-krävande rättningar (B1 rm 3→2; B2 döda Sandvik-länken) är MATEKORREKT
lösta i -en — översättningen bär rm 2 och den levande www.sandvik.com-formen,
medan originalet fortfarande bär rm 3 och den DNS-döda home.sandvik.com
(overksatt, läst 09-29 — originalets B2 blir dess publiceringsblockerare).
Paketet kräver inga body-rättningar. 1 förslag (mätperiod) + R2-notis.

## Objektval och disjunktion

FIFO-nummer 4 av fem (09-17 14:08), 0 tidigare granskningsfiler, ej live,
originalet granskat 2026-09-17 (s1-u1, "FLYTTKLAR EFTER TVÅ RÄTTNINGAR" —
B1+B2). Disjunktion enligt teknikaktier-rapporten.

## Metod

Samma sond och sex steg som teknikaktier-rapporten. Originalets protokoll
verifierade 7/7 medianpåståenden VINTEXAKTA mot byggtidens vintage (git
0e399f13, 115 bolag, industri n=12 — samtliga 12 bolagsnamn nämnda, 0 påhittade)
+ aritmetik 6/6 — detta är -en:s verifierade underlag.

## Mekaniska kontroller — 15/15 GRÖNA

| Kontroll | Resultat |
|---|---|
| Schema | Exakt `BloggExportPost`-formen (9 fält, inga extra) ✓ |
| Slug | industriaktier-sa-analyserar-du-industribolag-en ✓ |
| readingMinutes | 2 = kontraktet: 1 424 ord ÷ 600 avrundat ✓ (originalet bär fortfarande 3 — -en matekorrekt) |
| Rubriker | 9 st "##" (krav ≥ 2) ✓ |
| Disclaimer | "_This is educational financial analysis, not investment advice._" — sista raden ✓ |
| 911 | 0 träffar på 9 mönster ✓ |
| Rekommendationsverb | 0 träffar (EN+SV) ✓ |
| Varumärkesgrind | 0/26 träffar ✓ |
| Sifferparitet | 61/61 tal i -en finns i originalet (multiset) — 0 avvikare ✓ |
| Bodylängd | 9 217 tecken ✓ |
| Tags | 5 st, engelska, ASCII ✓ |
| publishedAt | 2026-09-17 = skapandedatum → null i paketet (R2) ✓ |
| HTML-escapes / mjuka bindestreck | 0 / 0 ✓ |
| Titel | "Industrial stocks: how to analyze industrial companies" — familjemönster ✓ |
| Länkkonvention | Svenska kanoniska slugs (5 kurser + 6 /blogg) ✓ |

## Fynd — 0 blockerande; 1 förslag + 2 notiser (se diff)

- **B1 MATEKORREKT.** Originalets rm-rättning (3→2 enligt
  SEO-GUIDER-familjens kontrakt) är löst i -en som bär 2 = round(1 424/600).
- **B2 MATEKORREKT — -en RÄTTARE ÄN ORIGINALET (N1).** Originalet bär
  fortfarande den DNS-döda källänken home.sandvik.com/en/investors; -en bär
  den levande www.sandvik.com/en/investors (bevisad 200 med äkta IR-innehåll
  av originalets granskare 2026-09-17). Originalets B2 är dess enda kvarvarande
  publiceringsblockerare — flaggas till ägaren.
- **C1p (förslag).** "revenue growth at 8.4 percent" utan mätperiod —
  originalets C1-parallell: rådata bär TTM 8,4 % (utkastets tal, korrekt)
  mot 5-års-CAGR 4,1 %. Datumet "raw data 2026-09-15" är RÄTT för industrin
  (originalets granskning konstaterade — till skillnad från
  konsumentguidens datumfel). Förslag: "(trailing twelve months)".
- **C2p (R2).** publishedAt → null i paketet.

## Juridik (lagen 2007:528): REN

- 0 förbjudna fraser, 0 rekommendationsverb.
- Utbildningsramen explicit ("As always: education in method, never advice
  about individual stocks") + engelsk disclaimer sista raden.
- Bolagsnämningar (AB Volvo, ABB, Atlas Copco, Sandvik, SKF, Alfa Laval,
  Hexagon, Skanska, GE Aerospace, Eaton, ASSA ABLOY, Industrivärden) endast
  sektorsryggrad/affärsmodellbeskrivningar; Industrivärden korrekt
  identifierat som investmentbolag (substanskalkyl — länk till km-067,
  analys-länk pedagogisk). Inga lagrum i texten — lagrumsblandning omöjlig.
- Räkneexemplen påhittade och onämnda ("a company invoicing SEK 10 billion").

## Länkar — 11/11 GRÖNA i TRE ben (även HTTP LIVE)

| Ben | Resultat |
|---|---|
| Slugar mot disk | 6/6 blogg-mål i data/blogg/ (inkl. analys-industrivarden-2026, branschmedianer-akm2) + 5/5 kursmål i deep-courses.json ✓ |
| HTTP mot localhost:3000 | 11/11 = 200 (2026-09-29) ✓ |
| Git-oförändradhet | Blogg-mål senast committade 09-09–09-14 — före -en:s skapande ⇒ oförändrade ✓ |

## Struktur och schema — grönt

Giltigt JSON; exakt BloggExportPost-form; 9 "##"-rubriker; 5 engelska tags;
titel enligt familjemönstret; inga HTML-escapes; 0 mjuka bindestreck.

## Nästa steg

1. Flytta paketet (inga body-rättningar krävs) — eller verkställ C1p
   koordinerat med originalets overksatta C1 först.
2. Publicering = kundens beslut (R2).
3. N1 till originalets ägare: B2 (Sandvik-länken) + B1 (rm) overksatta i
   originalet — B2 blockerar originalets publicering.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (15/15 grönt), 61/61 tal i
paritet mot granskat original, 11/11 länkar 200 LIVE + disk + git, juridik ren,
911 = 0, 0 blockerande fynd, FLYTTKLART-PAKET levererat som ny fil — inga
originalfiler ändrade av granskaren.*
