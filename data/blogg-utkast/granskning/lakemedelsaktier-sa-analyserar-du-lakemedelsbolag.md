# Granskning: Läkemedelsaktier — så analyserar du läkemedelsbolag (m9-branschguide, sjätte i serien)

**Granskad:** 2026-09-15 · **Granskare:** agentfabrik s1-u3 omgång 2 (spår 1 — granskningskön)
· **Objekt:** `data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag.json`
· **Diff-förslag:** `lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-diff.json` (samma mapp)

**BEDÖMNING: FLYTTKLART EFTER C-POSTERNA** — inga blockerande fynd (0 A-poster).
Alla fyra räkneexemplen är egnakontrollerade och korrekta, de 9 interna länkarna
lever, universumspåståendena stämmer mot bolagsunivers.json och juridiken är ren.
C2 är granskningens väsentliga fynd: ett faktapåstående ("historisk träffsäkerhet
70 %") som den citerade källan (BIO) motsäger — omformulerat i diffen, inte
omskrivet. C1+C3 är kosmetiska. Sex D-poster är förslag som kräver beslut.

Objektval: m9-ko-utkasten och SEO-guiderna granskades i v151 (2026-09-14);
kvartalsserien (kalendrar, H&M, KOMPLEMENT) och fastighetsaktier av tidigare
s1-omgångar (2026-09-15). Kvar i kön stod fem nya branschguider — energi,
ravarubolag, två bankaktiervarianter och läkemedelsaktier. Syskonen u1/u2 i
samma omgång läser samma sammanställning, som listar ravarubolag och
sa-analyserar-du-bankaktier (deras mest sannolika val), och föregångaren
s1-u1:s rapport reserverade energiaktier åt "s1-u2/s1-u3". Läkemedelsaktier
(senaste i serien, 14:50, olistad i sammanställningen) var det objekt där
kollisionsrisken var lägst — medvetet val.

## Metod

1. Mekanisk genomgång med script (node): JSON-giltighet, schema mot
   `BloggExportPost`-formen, ord/rubrik/disclaimer-krav, "911"-sökning,
   rekommendationsverb (juridikgrindens snabbkontroll), unikhet hos alla
   diff-strängar (grep före leverans).
2. Plattformens egen textgrind replikerad: samtliga 26 förbjudna fraser ur
   `data/varumarke.json` med samma flaggor som kontrolleraText ("giu").
3. Egnakontroll av samtliga fyra räkneexemplen i bodyn (runway, fönster,
   rNPV, patentaritmetik).
4. HTTP-kontroll av alla 9 interna länkar mot localhost:3000 (loopback,
   whitelistad) — 9/9 = 200; samt bekräftelse i live-mappen att
   bloggmålen verkligen existerar som filer (inte friendly-404).
5. Oberoende verifiering av faktapåståenden: bolagsunivers.json (10 av 109,
   fyra namngivna bolag), BIO:s rapport (fas I- och fas III-tal), Wouters
   JAMA 2020 (kostnadspåståendet) + HTTP-kontroll av alla källdomäner.
6. Juridikgrind-genomläsning (lagen 2007:528 — 2 kap 5 §: utbildning
   tillåtet, rådgivning kräver tillstånd).

## Fynd C — precisionsrättningar (verkställningsbara, ej blockerande)

**C1. readingMinutes 3 → 2 enligt plattformskontraktet.**
Kontraktet (src/lib/blogg-utkast.ts, `ORD_PER_MINUT = 600`): lästid =
ord(titel+ingress+body)/600 avrundat. Texten är 1 220 ord på den basen →
2. Exportvägen räknar om värdet automatiskt vid export, så felet är
kosmetiskt — men rättas enklast nu. Systemiskt: samma avvikelse bär
ravarubolag och bankaktier-varianten (se flaggor).

**C2. "Historisk träffsäkerhet 70 procent" för fas III — den egna källan
säger ~52 procent.** Bodyn: "projektet i fas III med historisk träffsäkerhet
på 70 procent ger ett riskjusterat värde på 20 × 0,7 = 14 miljarder".
BIO Clinical Development Success Rates 2011–2020 (källraden i samma text):
sannolikheten att komma från inskrivning i fas III till godkänt läkemedel är
57,8 % (övergången fas III → ansökan) × 90,6 % (ansökan → godkännande) ≈
**52 %**. Exemplet är deklarerat påhittat och får gärna anta 70 % — men
ordet "historisk" förvandlar antagandet till ett faktapåstående om branschens
historia, som den citerade källan motsäger. Diff-post C2 byter etiketten till
"antagen godkännandesannolikhet" och behåller hela räkneexemplet orört
(20 × 0,7 = 14). Alternativet D6 (byt till 50 procent, behåll "historisk")
finns som förslag men kräver synkning av fler rader — C2 rekommenderas.
Not: textens andra BIO-tal, "i storleksordningen en av tio" kliniska projekt
som når godkännande, är korrekt (BIO/QLS: 9,6 % LOA från fas I) — inget fynd.

**C3. "Väntade data PÅ tolv eller fler kvartal" — ska vara "om".** Texten
använder själv "fas III-data väntas OM åtta kvartal" två meningar tidigare;
"på" bröt mönstret. Språklig konsistens, unik sträng, ingen
innehållsförändring.

## Fynd D — förslag (kräver beslut, ej blockerande)

- **D1. Källraden BIO kan djuplänkas** till rapportens egen sida
  (200-verifierad 2026-09-15) — spårbarhet för textens tyngsta tal.
- **D2. Kostnadspåståendet saknar källa.** "Kostar i miljardklassen per
  godkänt läkemedel" — BIO mäter framgångstal, inte kostnader. Wouters m.fl.
  (JAMA 2020): median 985 miljoner–1 336 miljoner USD per godkänd produkt —
  belägger formuleringen exakt. Förslag på ny källrad; PubMed-länken svarade
  203 (lever, ej ren 200) vid kontrollen.
- **D3. "Granskningsansökan" är ingen etablerad term.** Myndighetsprocessen
  heter ansökan om godkännande (EU: MAA; USA: NDA/BLA). Minimalt byte utan
  fackförkortningar.
- **D4. publishedAt = skapandedatum (2026-09-15).** Ska vara faktisk
  publiceringsdag vid flytt (publicering = kundens beslut, R2).
- **D5. Fas I "på friska frivilliga"** — onkologiska fas I-studier sker på
  patienter; "oftast" täcker undantaget.
- **D6. Alternativ till C2** — behåll "historisk" men sätt 50 procent
  (20 × 0,5 = 10 miljarder), närmare BIO:s ~52 %. Kräver synkning av
  sammanfattningen; C2 är det mindre ingreppet.

## Juridik (lagen 2007:528): REN

- **0 FEL, 0 VARNINGAR** av plattformens 26 förbjudna fraser
  (data/varumarke.json, kontrolleraText-replik med "giu"-flaggor).
- **Inga rekommendationer**: 0 träffar på köp/sälj/rekommendera/bör du/
  målkurs/målpris/undvik (script + genomläsning). Värderingsstycket är
  metodbeskrivning ("det är resonemanget, i grov form … inte en
  kalkylmaskin som spottar facit") — utbildningsform.
- **Bolagsnämningar endast deskriptiva**: AstraZeneca och Novo Nordisk
  (universumsexempel), Getinge och Elekta (medicinteknikens kortare kedja) —
  ingen uppmaning, ingen kursprognos, inget enskilt bolag värderat.
- **Utbildningsramen genomgående**: "Som alltid här: utbildning i metod,
  aldrig råd om enskilda aktier" (ingressen) + disclaimer-sista-rad
  ("_Detta är pedagogisk finansanalys, inte investeringsråd._") — uppfyller
  griskravet; "investeringsråd" träffas endast negerat, vilket är
  disclaimer-formen själv.

## 911-referenser

Sökning efter "911", "11 september", "september 2001", "9/11" och "terror"
i body + metadata: **0 träffar.** Inget att åtgärda.

## Sifferkontroll — exemplena

| Exempel | Uträkning | Resultat i filen |
|---|---|---|
| Runway | 1 200 ÷ 100 | 12 kvartal ✓ |
| Fönster vs katalysator | 12 > 8 kvartal | "räcker med marginal" ✓; "tolv eller fler" ⇒ finansiering före nyheten ✓ (logik håller) |
| rNPV | 20 × 0,7 | 14 miljarder ✓ (aritmetiken; sannolikhetsETIKETTEN = fynd C2) |
| Patentexempel | 20 − (2034 − 2020) | 6 år kvar ✓ |
| Patentets maxtid | 20 år från ansökan (patentlagen/TRIPS art 33; PRV i källorna) | ✓ |
| Hälsovårdsandelen | bolagsunivers.json: 10 "halso" av 109 | "Tio av de 109" ✓ |
| Namngivna bolag | AZN.ST, NOVO-B.CO, GETI-B.ST, EKTA-B.ST — alla medlemmar | ✓ |
| Kliniska oddsen (fas I) | BIO/QLS: LOA 9,6 % | "i storleksordningen en av tio" ✓ |
| Fas III-sannolikhet | BIO: 57,8 % × 90,6 % ≈ 52 % | "historisk … 70 procent" ✗ → C2 |
| R&D-spannet 15–25 % av intäkterna | Kunskapskontroll: AstraZeneca ~25 %, Novo Nordisk ~16 %, J&J ~15–17 %, Lilly i toppen över spannet | "normalt i spannet" ✓ — försvarbart |
| Patentklippans erosion | "ofta mer än hälften på några år" | Kunskapskontroll ✓ (generisk erosion typiskt 50–90 %) |

## Verifieringar (oberoende, 2026-09-15)

| Påstående | Resultat |
|---|---|
| 9 interna länkar (6 kurser + 3 blogginlägg) | **9/9 HTTP 200** mot localhost:3000; bloggmålen (branschmedianer-akm2, intaktsdiversifiering, v13-patent-ip-analys) konfirmerade som filer i live-mappen data/blogg/ — inget publiceringsberoende |
| 4 källdomäner | Alla 200: lakemedelsverket.se, ema.europa.eu, bio.org, prv.se |
| BIO-djuplänk (D1) | 200: bio.org/clinical-development-success-rates-and-contributing-factors-2011-2020 |
| Wouters JAMA 2020 (D2) | PubMed 32267798 svarar 203 (lever); innehåll källbelagt via söksumma: median 985–1 336 mdr USD |
| BIO fas I-LOA | BioSpace-sammanfattning av BIO-rapporten: 9,6 % ≈ "en av tio" ✓ |
| BIO fas III→godkännande | Rapport-PDF: 57,8 % (n=1 928) × 90,6 % ≈ 52 % — grund för C2 |

## Struktur och schema — grönt

Giltigt JSON; exakt `BloggExportPost`-formen (slug/title/description/pillar/
author/publishedAt/readingMinutes/tags/body); body 8 875 tecken (krav ≥ 800)
med 8 "##"-rubriker (krav ≥ 2); disclaimer sista rad; slug evergreen utan
månadsuffix; 5 taggar; description ~157 tecken (SEO-längd); pillar
"Institutionell metodik" identisk med syskonguiderna; inga HTML-escapes
(fyra förekomster av "R&D" med rå "&" är giltig markdown — renderas korrekt);
1 220 ord på kontraktsbasen (titel+ingress+body).

## Flaggor till övriga ägare (ej mina filer)

1. **GRANSKNINGSKO-SAMMANSTALLNING.md är inaktuell.** Den listar två
   branschguider (ravarubolag, sa-analyserar-du-bankaktier) men på disk
   finns FEM (även energiaktier, bankaktier-sa-analyserar-du-banker-och-
   finansbolag, lakemedelsaktier). Kön som kunden ser den saknar tre rader.
   Ägare: sammanställningens upprätthållare.
2. **Bankaktier finns i DUBBELT** — sa-analyserar-du-bankaktier.json
   (1 335 ord, rMin 2) och bankaktier-sa-analyserar-du-banker-och-
   finansbolag.json (1 276 ord, rMin 3), båda 14:43, trolig byggkollision i
   s4-spåret. Två utkast om samma ämne = dubbelgranskningsarbete och en
   framtida publiceringskrock. Gallrings-/sammanslagningsbeslut tillhör
   huvudagenten (inte granskarspåret — därför endast flaggat).
3. **readingMinutes-avvikelsen (3 där kontraktet ger 2) är systemisk** —
   gäller även ravarubolag (1 234 ord) och bankaktier-varianten (1 276 ord).
   Information till deras granskare; kuren är en C-post i varje gransknings-
   diff (samma C1 som här och hos fastighetsaktier).

## Nästa steg

1. Verkställ C1–C3 ur diff-filen (ägare: guidens ägare eller nästa våg) —
   C2 först: den bär faktainnehållet.
2. Besluta D1–D6 (kvalitet — kan verkställas i samma steg; D2 tillför den
   saknade kostnadskällan).
3. Paketet är därefter **FLYTTKLART** och väntar på kundens
   publiceringsbeslut (R2) — inget publiceras automatiskt.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (schema, struktur, 911,
varumarke-grind 0 FEL/0 VARNINGAR av 26), 4/4 räkneexempel egnakontrollerade,
9/9 interna länkar 200-verifierade mot levande sajt + live-mappen, 4
faktapåståenden oberoende verifierade mot universumsfilen och BIO/PRV/JAMA,
juridikgrind körd = REN, diff med 9 poster (3 verkställningsbara, 6 förslag)
levererad som ny fil — inga originalfiler ändrade av granskaren.*
