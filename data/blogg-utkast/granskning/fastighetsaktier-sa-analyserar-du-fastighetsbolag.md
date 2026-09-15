# Granskning: Fastighetsaktier — så analyserar du fastighetsbolag (m9-branschguide 1/3)

**Granskad:** 2026-09-15 · **Granskare:** agentfabrik s1-u1 (spår 1 — granskningskön)
· **Objekt:** `data/blogg-utkast/fastighetsaktier-sa-analyserar-du-fastighetsbolag.json`
· **Diff-förslag:** `fastighetsaktier-sa-analyserar-du-fastighetsbolag-diff.json` (samma mapp)

**BEDÖMNING: FLYTTKLART** — inga blockerande fynd (0 A-poster). Siffrorna
är egnakontrollerade och korrekta, de 14 interna länkarna lever, de två
tyngsta faktapåståendena är oberoende verifierade och juridiken är ren.
Diff-filen bär 2 verkställningsbara precisionsrättningar (C1–C2) och
3 förslag (D1–D3) — inget behöver skrivas om.

Objektval: m9-ko-utkasten och SEO-guiderna granskades i v151 (2026-09-14),
kvartalskalendrarna av s1-u3 (2026-09-15). Kvar i kön stod tre nya
branschguider (skapade 15 sep 07:02–07:03); detta är den första av dem
(alfabetiskt) — ravarubolag och energiaktier tillfaller s1-u2/s1-u3.

## Metod

1. Mekanisk genomgång med script (node): JSON-giltighet, schema mot
   `BloggExportPost` (src/lib/blogg-utkast.ts/content.ts), HTML-escapes,
   ord/rubrik/disclaimer-krav, "911"-sökning, rekommendationsverb.
2. Plattformens egen textgrind replikerad: samtliga 26 förbjudna fraser
   ur `data/varumarke.json` (samma regex-flaggor som kontrolleraText).
3. Egnakontroll av alla sex räkneexemplen i bodyn.
4. HTTP-kontroll av alla 14 interna länkar mot localhost:3000 (loopback,
   whitelistad) — 14/14 = 200.
5. Oberoende verifiering av faktapåståenden (Riksbanken, index 2022,
   universummedlemmar) + domänkontroll av källorna.
6. Juridikgrind-genomläsning (lagen 2007:528 — 2 kap 5 §: utbildning
   tillåtet, rådgivning kräver tillstånd).

## Fynd C — precisionsrättningar (verkställningsbara, ej blockerande)

**C1. IAS 40 beskrivs som tvång — det är ett modellval.**
Bodyn: "redovisar … till verkligt värde enligt IAS 40 … Samma regel
förbjuder avskrivningar". IAS 40 medger **två** modeller (verkligt värde
eller anskaffningsvärde); det är den *valda* värderingsmodellen som ger
omprissättning genom resultaträkningen och saknar avskrivningar — och
samtliga noterade svenska fastighetsbolag väljer den. Påståendet är sant
om svensk praktik men formulerat som om standarden själv tvingade fram
den. Diff-post C1 omformulerar med modellvaget synligt — fakta precision,
ingen juridik.

**C2. readingMinutes 3 → 2 enligt plattformskontraktet.**
Kontraktet (src/lib/blogg-utkast.ts, `ORD_PER_MINUT = 600`): lästid =
ord(titel+ingress+body)/600 avrundat. Texten är 1 179 ord på den basen →
2. Exportvägen räknar om värdet automatiskt vid export, så felet är
kosmetiskt — men rättas enklast nu (syskonutkastet ravarubolag bär samma
avvikelse; noteras åt dess granskare).

## Fynd D — förslag (kräver beslut, ej blockerande)

- **D1. Källorna bär bara rotdomäner.** Tre av fyra kan djuplänkas till
  verifierade sidor (200-kontrollerade 2026-09-15): Riksbankens
  styrräntesida (även kanonisk domän — riksbank.se; riksbanken.se
  redirectar men är ej kanonisk), IFRS sida för IAS 40, Nasdaqs indexsida
  för SX35PI. EPRA-roten behålls (BPR-djupsökväg ej verifierad — gissning
  gav 404; roten är 200).
- **D2. publishedAt = skapandedatum (2026-09-15).** Exportvägen stämplar
  publiceringsdagen automatiskt; sker flytten som manuell filkopiering ska
  datumet sättas till faktisk publiceringsdag (publicering = kundens
  beslut, R2).
- **D3. "Kassaflödet från förvaltningen är oförändrat 400 miljoner"** —
  "oförändrat" saknar jämförelsebas i exemplet. Förslag: "står stilla på
  400 miljoner" (behåller kontrasten mot vinstens svängningar).

## Juridik (lagen 2007:528): REN

- **0 träffar** av plattformens 26 förbjudna fraser (data/varumarke.json,
  kontrolleraText-replik) — 0 FEL, 0 VARNINGAR.
- **Inga rekommendationer**: 0 träffar på köp/sälj/rekommendera/bör du/
  målkurs/målpris/undvik. "Fynd" förekommer endast negerat ("inte
  automatiskt ett fynd") — utbildningsform.
- **Bolagsnämningar endast deskriptiva** (m9 §5): Investor/Industrivärden
  ("värderas mot substans" — marknadspraktik), NP3 (länk till egen
  pedagogisk analys). Ingen uppmaning, ingen kursprognos.
- **Utbildningsramen genomgående**: "Som alltid här: utbildning i metod,
  aldrig råd om enskilda aktier" + disclaimer-sista-rad
  ("_Detta är pedagogisk finansanalys, inte investeringsråd._") — uppfyller
  griskravet i kontrolleratextRad.

## 911-referenser

Sökning efter "911" i body + metadata: **0 träffar.** Inget att åtgärda.

## Sifferkontroll — alla sex exempel GRÖNA

| Exempel | Uträkning | Resultat i filen |
|---|---|---|
| Direktavkastning | 4,80 ÷ 96 | 5,0 % ✓ |
| Substans | 12 000 − 7 000 = 5 000; ÷ 100 mn aktier | 50 kr/aktie ✓ |
| P/NAV + rabatt | 42 ÷ 50 = 0,84 → 1 − 0,84 | 0,84 / 16 % ✓ |
| Belåningsgrad | 7 000 ÷ 12 000 | ≈ 58 % ✓ |
| Räntetäckning | 900 ÷ 450 | 2,0× ✓ ("fördubblas/halveras" stämmer) |
| Vinstens delar | 1 200 = 800 (värdestegring) + 400 (förvaltning) | internt konsistent ✓ |

## Verifieringar (oberoende, 2026-09-15)

| Påstående | Resultat |
|---|---|
| Riksbanken 0 → 4 %, slutet 2021 → hösten 2023, "högsta sedan finanskrisen" | **Bekräftad** — beslut 2023-09-21: +25 bp till 4,00 %, högsta nivån sedan 2008 (SVT: "högsta nivån sedan 2008"; Riksbankens årsredovisning 2023) |
| "Sektorns index backade under 2022 med nästan hälften" | **Bekräftad** — Bloomberg 2022-12-20: sektorn ca −45 % helåret; SBB −73 %, Balder/Castellum ≥ −50 % — "nästan hälften" är en korrekt avrundning |
| Investor + Industrivärden i 100-bolagsuniversumet | **Bekräftad** — bolagsunivers.json: INVE-B.ST + INDU-C.ST |
| 14 interna länkar (10 kurser + 4 blogginlägg) | **14/14 HTTP 200** mot localhost:3000 |
| 4 källdomäner | Alla resolve:ar (riksbanken.se via redirect till riksbank.se — se D1); 3 föreslagna djuplänkar 200-kontrollerade |
| EPRA NTA / FFO som begrepp | Kunskapskontroll ✓ (EPRA Best Practices Recommendations standardiserar substansmått; FFO rensar orealiserade värdeförändringar) |

## Struktur och schema — grönt

Giltigt JSON; exakt `BloggExportPost`-formen (slug/title/description/
pillar/author/publishedAt/readingMinutes/tags/body); body 9 700+ tecken
(krav ≥ 800) med 7 "##"-rubriker (krav ≥ 2); disclaimer sista rad;
slug evergreen utan månadsuffix (m9 §2.4); 5 taggar; description ~150
tecken (SEO-längd); inga HTML-escapes; 1 153 ord i bodyn.

## Flaggor till övriga ägare (ej mina filer)

1. **GRANSKNINGSKO-SAMMANSTALLNING.md saknar två rader** — fastighetsaktier
   och energiaktier (båda 15 sep) finns på disk men ej i kön som kunden
   ser den; bara ravarubolag är listat. Ägare: sammanställningens
   upprätthållare.
2. **Syskonutkastet ravarubolag bär samma readingMinutes-avvikelse** (3
   vid 1 211 ord → kontraktet ger 2) — information till dess granskare.

## Nästa steg

1. Verkställ C1–C2 ur diff-filen (ägare: guidens ägare eller nästa våg).
2. Besluta D1–D3 (kvalitet — kan verkställas i samma steg).
3. Paketet är därefter **FLYTTKLART** och väntar på kundens
   publiceringsbeslut (R2) — inget publiceras automatiskt.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (schema, struktur,
911, varumarke-grind 0/26), 6/6 räkneexempel egnakontrollerade, 14/14
interna länkar 200-verifierade, 3 faktapåståenden oberoende verifierade,
juridikgrind körd = REN, diff med 5 poster (2 verkställningsbara, 3
förslag) levererad som ny fil — inga originalfiler ändrade av granskaren.*
