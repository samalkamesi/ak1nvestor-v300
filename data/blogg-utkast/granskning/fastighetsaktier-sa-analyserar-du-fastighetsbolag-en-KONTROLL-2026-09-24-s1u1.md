# Granskning: Real estate stocks — how to analyze property companies (m9-branschguide, engelsk spegling)

**Granskad:** 2026-09-24 · **Granskare:** agentfabrik s1-u1 (manifest auto-s1-1790235302376, spår 1 — granskningskön)
· **Objekt:** `data/blogg-utkast/fastighetsaktier-sa-analyserar-du-fastighetsbolag-en.json` (skapad 2026-09-17 03:26)
· **Diff-förslag:** `fastighetsaktier-sa-analyserar-du-fastighetsbolag-en-diff-2026-09-24-s1u1.json`
· **Flyttfärdigt paket:** `fastighetsaktier-sa-analyserar-du-fastighetsbolag-en-FLYTTKLART-PAKET-2026-09-24-s1u1.json` (samma mapp)

**BEDÖMNING: FLYTTKLART** — 0 blockerande fynd (0 A-poster). 15/15 mekaniska
kontroller gröna, 52/52 tal i exakt paritet med det granskade svenska
originalet, juridiken ren på båda språkens mönster, 911 = 0. Diffen bär 1
verkställningsbar precisionsrättning (C1 — engelsk parallell till originalets
oreviderade C1) och 3 förslag (D1–D3). Paketet har C1 verkställd.

Objektval: uppdragstitelns "m9-utkast #1" = malltext — samtliga 6 m9-utkast är
sedan 09-20/21 granskade, paketerade OCH publicerade i data/blogg/ (verifierat
mot m9-ko/index.json + granskningsmappen + live-mappen före start; anspråk
disk-först i data/vakten/auto-s1-1790235302376-s1-u1-ansprak.md). FIFO bland
icke levererade: detta är ÄLDSTA ogranskade rotutkast (09-17, 0 KONTROLL, 0
diff, ej live). Disjunkt mot huvudagentens aktiva pipeline (worklog v161:
"B27 bygg + -ar-familjen nästa" — dessa lämnas åt huvudspåret).

## Metod

1. Mekanisk genomgång med sond (node, /tmp/s1u1-fastighetskontroll.mjs):
   JSON-giltighet, schema mot `BloggExportPost` (src/lib/blogg-utkast.ts),
   ord/readingMinutes mot kontraktet (ORD_PER_MINUT = 600), rubriker,
   disclaimer-sista-rad, HTML-escapes, "911"-sökning i HELA filen,
   rekommendationsverb (engelska + svenska mönster).
2. Plattformens egen textgrind replikerad: samtliga förbjudna fraser ur
   `data/varumarke.json` (samma regex-uppsamling som kontrolleraText).
3. Sifferparitet: samtliga 52 tal i -en-bodyn maskinellt jämforda mot svenska
   originalets kropp (0 avvikare, 0 saknade).
4. Länkverifiering i tre ben (HTTP sonden blockerad av driftsläget — se
   Driftnotis): slugar mot data/blogg/ på disk, git-oförändrad sedan
   originalets 14/14-HTTP-verifikation 09-15, samt -en-familjens
   länkkonvention (svenska kanoniska slugs i samtliga syskon).
5. Genomläsning mot originalets granskningsprotokoll 09-15
   (fastighetsaktier-...-fastighetsbolag.md, s1-u1) — översättningens
   faktatrogna avbildning av det redan verifierade underlaget.
6. Juridikgrind-genomläsning (lagen 2007:528 — 2 kap 5 §: utbildning
   tillåtet, rådgivning kräver tillstånd).

## Mekaniska kontroller — 15/15 GRÖNA

| Kontroll | Resultat |
|---|---|
| Schema | Exakt `BloggExportPost`-formen (9 fält, inga extra) ✓ |
| readingMinutes | 2 = kontraktet: 1 426 ord (titel+ingress+body) ÷ 600 avrundat ✓ |
| Rubriker | 7 st "##" (krav ≥ 2) ✓ |
| Disclaimer | "_This is educational financial analysis, not investment advice._" — sista raden, familjeform ✓ |
| 911 | 0 träffar i hela filen (body + metadata) ✓ |
| Rekommendationsverb | 0 träffar (EN: buy this stock/sell now/we recommend/you should/target price/must buy/best deal/strong buy + SV: köp denna/sälj nu/rekommenderar/bör du/målkurs) ✓ |
| 'buy/bargain' manuellt | 4 förekomster, alla deskriptiva eller negerade: "buy, own, develop and rent out" (verksamhetsbeskrivning), "not automatically a bargain" (negerat), "bought with a large share … in loans" (beskrivning av sektorns finansiering) — utbildningsform ✓ |
| Varumärkesgrind | 0 träffar av plattformens förbjudna fraser (data/varumarke.json) ✓ |
| Sifferparitet | 52/52 tal i -en finns i originalet — 0 avvikare, 0 saknade ✓ |
| Bodylängd | 9 327 tecken (krav ≥ 800) ✓ |
| Tags | 5 st, engelska, ASCII ✓ |
| publishedAt | ISO-dag 2026-09-17 = skapandedatum (D2-klass, se diff) |
| HTML-escapes | Inga ✓ |
| Titel | "Real estate stocks: how to analyze property companies" — -en-familjens mönster ("X stocks: how to analyze …"), bekräftad mot 3 syskon ✓ |
| Länkkonvention | Svenska kanoniska slugs (10 /kurser + 4 /blogg) — identisk praxis i samtliga granskade -en-syskon (vard/bil/medtech) ✓ |

## Fynd C — precisionsrättning (verkställningsbar, ej blockerande)

**C1. IAS 40 beskrivs som tvång — även på engelska.**
-en: "…at fair value under IAS 40 … The same standard prohibits
depreciation." Detta speglar originalets formulering FÖRE dess egna C1
(originalets granskning 09-15 konstaterade: IAS 40 medger två modeller; det
är det aktiva modellvalet som ger omprissättning och saknar avskrivningar).
Originalets C1 är ännu inte verkställd i originalet, så -en är i paritet med
originalets faktiska skick — men rättningen bör verkställas koordinerat.
Diff-post C1 ger den engelska parallellen ("…apply IAS 40's fair value
model — an active choice … Under the fair value model there is no
depreciation…"). Paketet (FLYTTKLART) bär C1 verkställd.

## Fynd D — förslag (kräver beslut, ej blockerande)

- **D1. "The industry association EPRA"** — originalet säger "Den europeiska
  branschorganisationen EPRA"; översättningen tappat "europeiska". EPRA =
  European Public Real Estate Association. Förslag: "The European industry
  association EPRA".
- **D2. publishedAt = skapandedatum (2026-09-17).** Samma klass som
  originalets D2: exportvägen stämplar publiceringsdagen; paketet bär
  `publishedAt: null` och dag sätts vid flytt (publicering = kundens
  beslut, R2).
- **D3. Källorna bär rotdomäner** — originalets D1 gäller oförändrat här:
  riksbank.se (kanonisk; riksbanken.se redirectar), IFRS sida för IAS 40,
  Nasdaqs indexsida SX35PI — alla 200-verifierade 2026-09-15 av originalets
  granskare. EPRA-roten behålls (djupsökväg ej verifierad). Engelsk
  indexetal-etikett "OMX Stockholm Real Estate" är korrekt namn (SX35PI).

## -en är MATEKORREKT DÄR ORIGINALET HAR ETT FEL — flagga till originalets ägare

**N1 (originalet, ej denna fil):** Originalets räntetäcknings-exempel slutar
"…innan täckningen når **noll**." Ekvationen: ränta fördubblad → 900/900 =
**1,0**; resultat halverat → 450/450 = **1,0**. Täckningen når 1,0 — där
resultatet inte längre täcker räntan — aldrig 0. -en har redan rätt
formulering ("before coverage reaches 1.0, where profit no longer covers the
interest"). Originalets 09-15-granskning bekräftade "fördubblas/halveras
stämmer" men läste inte "når noll" mot ekvationen. Föreslagen originaletsrättning:
"…innan täckningen når 1,0 — där resultatet inte längre täcker räntan."
**N2:** Originalets C1–C2 (och D1–D3) från 09-15 är fortfarande overksatta i
originalet (läst 2026-09-24) — verkställande väntar hos guidens ägare/nästa våg.

## Juridik (lagen 2007:528): REN

- 0 träffar av plattformens förbjudna fraser (varumarke-grind, ovan).
- 0 rekommendationsverb på engelska eller svenska (tabell ovan).
- Bolagsnämningar endast deskriptiva: Investor/Industrivärden ("valued
  against net assets" — marknadspraktik), NP3 (länk till egen pedagogisk
  analys). Ingen uppmaning, ingen kursprognos.
- Utbildningsramen genomgående på båda språken: "education in method, never
  advice about individual stocks" (ingress) + engelsk disclaimer på sista
  raden — uppfyller griskravet.
- Faktakärnan (Riksbanken 0 → 4 % slutet 2021 → hösten 2023, högsta sedan
  finanskrisen; sektorindex −45 % 2022 = "nästan hälften"; IAS 40; EPRA
  NTA/FFO; Investor+Industrivärden i 100-bolagsuniversumet) oberoende
  verifierad av originalets granskning 2026-09-15 — oförändrad i -en, tal i
  exakt paritet.

## Länkar — verifierade i tre ben (HTTP-blockerad av driftsläget)

| Ben | Resultat |
|---|---|
| Slugar mot disk | 4/4 blogg-mål finns som JSON i data/blogg/ (analys-np3-fastigheter-2026, pb-tal-…, sa-laser-du-en-balansrakning-…, skuldsattningsgrad-…) ✓ |
| Git-oförändradhet | Samma 4 filer: senaste ändring 2026-09-13/09-14 — FÖRE originalets HTTP-verifikation 09-15 (14/14 = 200) ⇒ slugs oförändrade sedan ✓ |
| Precedent | Originalets granskning 09-15: 14/14 interna länkar 200 mot localhost:3000 (10 kurser + 4 blogg) — samma 14 sökvägar ✓ |
| HTTP nu | **0/14 = 200** — men se Driftnotis: sonden träffade ett degraderat serverläge, inget utkastfynd |

## Driftnotis (till prod-synken/kraschvakten — ej min yta, byggen är förbjudna för fabriksbarn)

Vid länkkontrollen 2026-09-24 ~09:10: rot 200 och /kurser 200, men
/blogg timeoutar (000 på 10 s), enskilda artikelvägar ger 404, prod
(https://lab.ak1nvestor.com/) svarar 502, och **.next/BUILD_ID saknas** —
konsistent med worklogens notis att dagens 07:23-bygge OOM-dödades och att
kedjan (6e15cbac → 5dd5d127) väntar på nästa prod-synk-poll under
/tmp/ak1a-deploy.lock. Fabriken kör detta manifest = RAM trycket igen;
sekvenseringen (bygge när fabriken är tom) äger kuren. Efter nästa lyckade
bygge bör -en-familjens HTTP-kontroll köras som rutin — inget i detta
utkast är åtgärdat fel.

## Struktur och schema — grönt

Giltigt JSON; exakt BloggExportPost-form; body 9 327 tecken med 7 "##"-
rubriker; 5 engelska tags; titel enligt -en-familjens mönster; svenska
kanoniska interna länkar enligt familjepraxis (inga -en-filer live ännu —
mönstret bekräftat mot 3 syskonutkast); inga HTML-escapes.

## Nästa steg

1. Verkställ C1 i -en (eller flytta paketet, som redan bär den) — koordinera
   med originalets C1 så att sv/en inte divergerar.
2. Besluta D1–D3 (kvalitet).
3. Flagga N1 (täckning "når noll" → 1,0) till originalets ägare — originalet
   har ett faktiskt räknefel som -en redan rättat.
4. Publicering = kundens beslut (R2) — inget publiceras automatiskt.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (15/15 grönt: schema,
kontrakt, struktur, 911, varumarke 0, rekverb 0), 52/52 tal i paritet mot
granskat original, länkar verifierade i tre ben (HTTP-blockerad av
OOM-driftläge, dokumenterat), 1 C + 3 D i diff, FLYTTKLART-PAKET med C1
verkställd levererat som nya filer — inga originalfiler ändrade av
granskaren.*
