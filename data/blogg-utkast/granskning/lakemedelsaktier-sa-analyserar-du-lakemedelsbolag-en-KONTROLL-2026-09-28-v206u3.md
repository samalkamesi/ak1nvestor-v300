# Granskning: Pharmaceutical stocks — how to analyze pharma companies (m9-branschguide, engelsk spegling)

**Granskad:** 2026-09-28 · **Granskare:** agentfabrik v206-u3 (manifest v206-mega-kapacitet-1789637000, spår GRANSKNINGSKÖN)
· **Objekt:** `data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-en.json` (skapad 2026-09-17 07:44)
· **Diff-förslag:** `granskning/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-en-diff-2026-09-28-v206u3.json`
· **Flyttfärdigt paket:** `granskning/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-en-FLYTTKLART-PAKET-2026-09-28-v206u3.json` (samma mapp)

**BEDÖMNING: FLYTTKLART** — 0 blockerande fynd (0 A-poster). Samtliga mekaniska
kontroller gröna, 0 substantiella talavvikare mot det granskade svenska originalet,
juridiken ren på båda språkens mönster (varumärkesgrind 0 FEL/0 VARNING av 26),
911 = 0. Diffen bär 3 verkställningsbara precisionsrättningar (C1–C3 — exakta
engelska paralleller till originalets EGNA C1–C3 från 2026-09-15, som ännu är
overksatta i originalet) och 6 förslag (D1–D6). Paketet har C1–C3 verkställda.

## Objektval (FIFO, kollisionskontrollerat)

Uppdragstitelns "nästa m9-utkast" = spårets malltext: samtliga 6 m9 evergreen-utkast
är sedan 2026-09-19/21 granskade, paketerade och FLYTTKLARA (GRANSKNINGSKO-
SAMMANSTALLNING §m9; worklog våg 208 "FAMILJEN 6/6 FLYTTKLARA"). Könotisens metod
gäller: "Läs data/blogg-utkast/, välj äldsta ännu ej granskade." Diskgenomsökning
2026-09-28 (varje utkast mot granskningsmappen): äldsta rotutkast utan KONTROLL/diff =
**lakemedelsaktier-…-lakemedelsbolag-en.json (2026-09-17 07:44)** — delad tidstämpel
med teknikaktier-en; alfabetisk ledning. Kollisionskontroll: huvudagentens aktiva
pipeline 2026-09-28 (desk/telefon-först, super-forskning) rör inte utkastmappen;
spår 9 (C15 Bloggen) övervakar PUBLICERADE data/blogg (94 st, 0 uttag, R2) —
disjunkt; AR3 = -ar-speglingen av samma original (klar 2026-09-19), detta är
-en-speglingen. Anspråk disk-först: `data/vakten/v206-mega-kapacitet-1789637000-u3-ansprak.md`.

## Metod

1. Mekanisk genomgång med sond (node, /tmp/v206u3-lakemedelskontroll.mjs):
   JSON-giltighet, schema mot `BloggExportPost` (src/lib/blogg-utkast.ts) med
   kontraktets EXAKTA ord-räkning (titel+ingress+body, split /\s+/, round/600),
   rubriker, disclaimer-sista-rad, HTML-escapes, "911"-sökning i HELA filen,
   rekommendationsverb (engelska + svenska mönster).
2. Plattformens egen textgrind replikerad: samtliga 26 förbjudna fraser ur
   `data/varumarke.json` med kontrolleraTexts flaggor ("giu") på titel+ingress+body.
3. Talparitet: samtliga numeriska token i -en-bodyn maskinellt jämforda mot svenska
   originalets kropp (frekvensjämförelse på normaliserade token), varje avvikare
   kontextförklarad.
4. Länkverifiering i fyra ben: identiska länkuppsättningar mot originalet, slugar
   mot disk (data/blogg + data/seo/kurser), git-oförändradhet sedan originalets
   9/9-HTTP-verifikation 2026-09-15, samt HTTP mot localhost:3000 — sajten LEVER
   (till skillnad från fastighetsaktier-granskningens degraderade läge 2026-09-24).
5. Genomläsning mot originalets granskningsprotokoll 2026-09-15
   (lakemedelsaktier-…-lakemedelsbolag.md, s1-u3) — översättningens faktatrogna
   avbildning av det redan verifierade underlaget, inkl. arvsbevis för
   universumspåståendet (git).
6. Juridikgrind-genomläsning (lagen 2007:528 — 2 kap 5 §: utbildning tillåtet,
   rådgivning kräver tillstånd).

## Mekaniska kontroller — GRÖNA

| Kontroll | Resultat |
|---|---|
| Schema | Exakt `BloggExportPost`-formen (9 fält, inga extra) ✓ |
| Kontraktet | EN 1 395 ord (titel+ingress+body) ÷ 600 = 2, filen säger 3 → **C1** (SV: 1 220 ord → 2 — originalets C1, overksatt där) |
| Rubriker | 8 st "##" = originalets 8 (krav ≥ 2) ✓ |
| Disclaimer | "_This is educational financial analysis, not investment advice._" — sista raden, -en-familjens form (samma som fastighetsaktier-en). Kontraktets svenska regex /investeringsråd/i ger teknisk VARNING — exportvägen kompletterar; för engelskt mål är den engelska disclaimern den rätta |
| 911 | 0 träffar i hela filen (mönster: 911, 11 september, september 2001, 9/11, September 11, terrorism) ✓ |
| Rekommendationsverb | 0 träffar (EN: buy this stock/sell now/we recommend/you should/target price/must buy/best deal/strong buy/our top pick/we advise + SV: köp denna/sälj nu/rekommenderar/bör du/målkurs/målpris/undvik) ✓ |
| 'sell' manuellt | 1 förekomst: "companies that develop, manufacture and sell medicines" — verksamhetsbeskrivning (originalets "tillverkar och säljer läkemedel"), deskriptiv ✓ |
| Varumärkesgrind | **0 FEL, 0 VARNING** av plattformens 26 förbjudna fraser (data/varumarke.json, "giu"-replik) — originalet samma ✓ |
| Talparitet | 0 substantiella avvikare (se tabell nedan) ✓ |
| Bodylängd | 8 881 tecken (krav ≥ 800) ✓ |
| Tags | 5 st, engelska, ASCII ✓ |
| publishedAt | ISO-dag 2026-09-17 (D3: sätts vid flytt — R2) |
| HTML-escapes | 0 ✓ |
| Titel | "Pharmaceutical stocks: how to analyze pharma companies" — -en-familjens mönster ("X stocks: how to analyze …") ✓ |
| Länkkonvention | Svenska kanoniska slugs (6 kurser + 3 blogg, 11 förekomster/9 unika) — identisk uppsättning med originalet och med granskade -en-syskon ✓ |

## Talparitet mot originalet — 0 substantiella avvikare

Sondens frekvensjämförelse flaggade två råtoken; båda är normaliseringsartefakter,
fullständigt förklarade:

| Rådiff | Förklaring | Dom |
|---|---|---|
| EN "1200"×2 mot SV "1"+"200"×2 | SV skriver "1 200" (mellanslagstusental) ×2, EN "1,200" ×2 — samma två passager (Kassan är… / runway blir…) | Paritet ✓ |
| EN "1"×1 mot SV "1"×3 | "AK1A's"/"AK1A:s" ger 1×1 i båda; SV:s övriga två "1" är del av "1 200" ovan | Paritet ✓ |

Övriga 27 token (109, 100, 12, 8→twelve, 20, 2020, 2034, 70, 0,7, 14, 15, 25, 13×3
kurs-id, 039, 048, 018, 013, 002, 001 …) identiska frekvenser. Ordtaalen twelve/eight/
six/ten speglar originalets tolv/åtta/sex/tio. AR3:s 37/37-talparitet för -ar-speglingen
är oberoende bekräftelse av originalets talunderlag.

## Aritmetik — exemplena egnakontrollerade

| Exempel | Uträkning | Resultat i filen |
|---|---|---|
| Runway | 1 200 ÷ 100 | 12 quarters ✓ |
| Fönster vs katalysator | 12 > 8 quarters | "lasts with margin" ✓; "twelve or more ⇒ raise again" ✓ (logik håller) |
| rNPV | 20 × 0.7 | SEK 14 billion ✓ (etiketten "historical" = C2) |
| Patentexempel | 20 − (2034 − 2020) | 6 år ✓ |
| Kliniska oddsen | BIO/QLS: LOA fas I 9,6 % | "on the order of one in ten" ✓ (originalets granskning: korrekt) |
| R&D-spannet 15–25 % | AstraZeneca ~25 %, Novo ~16 %, J&J ~15–17 % | "normally spend 15–25 percent" ✓ (arv från originalets kunskapskontroll) |

## Fynd C — precisionsrättningar (verkställda i paketet)

**C1. readingMinutes 3 → 2.** 1 395 ord ÷ 600 = 2 enligt plattformskontraktet.
Engelsk parallell till originalets C1 (overksatt i originalet — se N1).

**C2. "a historical success rate of 70 percent" → "an assumed probability of
approval of 70 percent".** Originalets väsentliga fynd i engelsk tappning: BIO
Clinical Development Success Rates 2011–2020 (källraden i samma text) ger fas III →
godkännande till 57,8 % × 90,6 % ≈ 52 % — inte 70 %. Exemplet är deklarerat påhittat
och får anta 70 %, men "historical" förvandlar antagandet till ett faktapåstående
som källan motsäger. Räkneexemplet 20 × 0.7 = 14 orört.

**C3. "expected AT twelve or more quarters" → "expected IN twelve or more
quarters".** Texten skriver själv "expected in eight quarters" tre meningar
tidigare — engelsk parallell till originalets C3 ("på tolv"→"om tolv").

## Fynd D — förslag (kräver beslut, ej blockerande)

- **D1.** BIO-djuplänk (parallell till originalets D1) — spårbarhet för textens
  tyngsta tal.
- **D2.** Kostnadspåståendet "costs in the billions per approved medicine" saknar
  källa (BIO mäter framgångstal) — ny källrad Wouters m.fl. JAMA 2020 (median
  985–1 336 mdr USD per godkänd produkt; parallell till originalets D2).
- **D3.** publishedAt = skapandedatum → null i paketet; dag sätts vid flytt
  (publicering = kundens beslut, R2) — VERKSTÄLLT i paketet.
- **D4.** "in a few healthy volunteers" → "usually healthy" (onkologiska fas I på
  patienter; parallell till originalets D5).
- **D5.** Språklig polish: fyra svengelska-rester ("a loan on time", "lasts with
  margin", "cost the most in uncertainty", "is taken up in") — idiomatiska former
  föreslagna i diffen.
- **D6.** Originalets mening "Det är branschens särskilda riskprofil —" är ej
  översatt; förslag på återställd parallell.

## Juridik (lagen 2007:528): REN

- **0 FEL, 0 VARNING** av plattformens 26 förbjudna fraser (varumärkesgrind-replik).
- 0 rekommendationsverb på engelska eller svenska; "sell medicines" är
  verksamhetsbeskrivning, ej uppmaning.
- Bolagsnämningar endast deskriptiva: AstraZeneca och Novo Nordisk
  (universumsexempel), Getinge och Elekta (medicinteknikens kortare kedja) — ingen
  uppmaning, ingen kursprognos, inget enskilt bolag värderat.
- Utbildningsramen genomgående: "education in method, never advice about
  individual stocks" (ingress) + engelsk disclaimer på sista raden.
- Värderingsstycket är metodbeskrivning med uttrycklig osäkerhetsrad ("The
  probabilities are estimates and the answers sensitive to them; it is a method
  for structuring thought, not a machine that spits out an answer key").

## Länkar — verifierade i fyra ben (sajten lever)

| Ben | Resultat |
|---|---|
| Identiska med originalet | 11 förekomster (9 unika: 6 /kurser + 3 /blogg) — exakt samma uppsättning ✓ |
| Disk | 9/9 mål finns som filer (data/blogg/*.json + data/seo/kurser/*.json) ✓ |
| Git-oförändradhet | Bloggmålen senast ändrade 2026-09-09/09-14, kurserna 2026-08-23 — alla FÖRE originalets 9/9-HTTP-verifikation 2026-09-15 ⇒ slugs oförändrade ✓ |
| HTTP nu | **11/11 = 200** mot localhost:3000 (loopback, whitelistad) ✓ · 4 källdomäner (lakemedelsverket.se, ema.europa.eu, bio.org, prv.se) = 200 ✓ |

## Universum-arvet — "Ten of the 109" bevisat tidsbundet korrekt

Dagens bolagsunivers.json: 311 poster, 32 hälsovårdsbranscher — men textens påstående
är arvsbevisat mot universumskicket vid utkastets födelse: commit **ea7ad8bd
(2026-09-15 14:31 — 19 minuter före originalets bygge 14:50) = exakt 109 poster /
10 hälsovårdsbolag**, och AZN.ST, NOVO-B.CO, GETI-B.ST, EKTA-B.ST samtliga medlemmar
(också idag). Originalets granskare verifierade alltså mot dåtidens faktiska skick;
-en är i full paritet. Universumet har därefter vuxit i dataset-djup-spåret — inget
fel i utkastet, men se N3.

## Flaggor till övriga ägare (ej mina filer)

1. **N1:** Originalets C1–C3 (2026-09-15) är fortfarande overksatta i originalet
   (läst 2026-09-28). Om -en-paketet publiceras med rättningarna medan originalet
   behåller feltexterna divergerar sv/en — koordinerad verkställning rekommenderas.
2. **N2:** Nytt originaletsfynd: källradens "Europäiska läkemedelsmyndigheten" —
   stavfel för "Europeiska". -en har korrekt "The European Medicines Agency".
3. **N3:** "Ten of the 109" är tidsbundet (109 stämmer vid födelsen 2026-09-15,
   idag 311) — framtida evergreen-uppdatering kan bära datumet i påståendet.

## Nästa steg

1. Flytta PAKETET (inte utkastet) när kunden beslutar — C1–C3 verkställda,
   publishedAt=null awaiting R2-stämpel.
2. Besluta D1–D6 (kvalitet) hos guidens ägare — koordinera med originalets
   överhängande C1–C3/D1–D6 så sv/en inte divergerar.
3. Publicering = kundens beslut (R2) — inget publiceras automatiskt.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (schema, kontrakt, struktur,
911 = 0, varumärkesgrind 0 FEL/0 VARNING av 26, rekverb 0), 0 substantiella
talavvikare mot granskat original, 4/4 räkneexempel egnakontrollerade, 11/11
interna länkar + 4 källdomäner HTTP 200 mot levande sajt, universumsarv bevisat i
git, juridikgrind körd = REN, diff med 9 poster (3 C + 6 D) + 3 ägarflaggor
levererad som nya filer, FLYTTKLART-PAKET med C1–C3 verkställda — inga
originalfiler ändrade av granskaren.*

RESULTAT: flyttklart lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-en (3 rättningar)
